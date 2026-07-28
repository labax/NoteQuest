// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NOTEQUEST_SLOT_IDS } from '@notequest/infrastructure';
import { createUpdateSafetyState } from '@notequest/application';
import { createPwaStatusAdapter, type AppComposition } from './composition';
import { createPwaUpdateCoordinator } from './pwa/update-coordinator';
import { App, RootErrorBoundary } from './App.tsx';
import {
  routeMetadata,
  type RouteAdapter,
  type RouteSelection,
  type RouteState,
} from '@notequest/ui';

const emptySlots = [1, 2, 3].map((slotIndex) => ({
  slotId: NOTEQUEST_SLOT_IDS[slotIndex - 1]!,
  slotIndex: slotIndex as 1 | 2 | 3,
  displayName: `Slot ${slotIndex}`,
  revision: 0,
  createdAt: '2026-07-27T00:00:00.000Z',
  updatedAt: '2026-07-27T00:00:00.000Z',
  status: 'empty' as const,
  schemaVersion: null,
  rulesVersion: null,
  contentVersion: null,
  currentSnapshotId: null,
  lastValidSnapshotId: null,
  recoveryAvailable: false,
  integrityStatus: 'not_checked' as const,
}));

function fixtureComposition(
  list = vi.fn().mockResolvedValue({ ok: true, value: emptySlots }),
  pwa = createPwaStatusAdapter({
    serviceWorker: {
      register: vi.fn(),
    },
  }),
  route: RouteAdapter = fixtureRoute(),
): AppComposition {
  const updates = createPwaUpdateCoordinator(pwa);
  const updateSafety = createUpdateSafetyState();
  updates.updateSafety({
    safePoint: 'durable',
    commandPending: false,
    migrationActive: false,
    importActive: false,
    recoveryActive: false,
    blockingWorkflowActive: false,
    unsavedWork: false,
  });
  return {
    services: {
      saveSlots: {
        list,
        lookup: vi.fn(),
        select: vi.fn(),
        updateMetadata: vi.fn(),
      },
      saveSlotOperations: { get: vi.fn(() => undefined) },
      updateSafety,
    },
    route,
    pwa,
    updates,
    version: 'test-version',
    reload: vi.fn(),
    close: vi.fn(),
  };
}

function fixtureRoute(
  initial: RouteState = {
    destination: 'save-slots',
    metadata: routeMetadata['save-slots'],
    fallback: null,
  },
): RouteAdapter {
  let current = initial;
  const listeners = new Set<(route: RouteState) => void>();
  return {
    current: () => current,
    navigate: vi.fn((selection: RouteSelection) => {
      current = { ...selection, metadata: routeMetadata[selection.destination], fallback: null };
      listeners.forEach((listener) => listener(current));
    }),
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
}

describe('App shell', () => {
  it('renders stable workspace, context, status, and utility regions', async () => {
    render(<App compose={() => Promise.resolve(fixtureComposition())} />);
    expect(
      await screen.findByRole('heading', { name: 'Choose a local save slot' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Local data status' })).toBeInTheDocument();
    expect(screen.getByLabelText('Application status')).toHaveTextContent(
      'Save status: not checked',
    );
    expect(screen.getByLabelText('Application status')).toHaveTextContent(
      'Offline readiness not verified',
    );
    expect(screen.getByLabelText('Application status')).toHaveTextContent('Updates not checked');
    expect(screen.queryByText(/offline support available|app up to date/i)).not.toBeInTheDocument();
    expect(screen.getByText('Version test-version')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Slot 3' })).toBeInTheDocument();
  });

  it('navigates through the project adapter and focuses the destination heading', async () => {
    const route = fixtureRoute();
    render(
      <App compose={() => Promise.resolve(fixtureComposition(undefined, undefined, route))} />,
    );
    await screen.findByRole('heading', { name: 'Choose a local save slot' });
    await userEvent.click(screen.getByRole('button', { name: 'About and credits' }));
    const heading = await screen.findByRole('heading', { name: 'About and credits' });
    expect(route.navigate).toHaveBeenCalledWith({ destination: 'about' });
    expect(heading).toHaveFocus();
    expect(document.title).toBe('About and Credits · NoteQuest');
  });

  it('explains a guarded direct load and returns to the safe save-slot state', async () => {
    const route = fixtureRoute({
      destination: 'save-slots',
      metadata: routeMetadata['save-slots'],
      fallback: 'missing-context',
    });
    render(
      <App compose={() => Promise.resolve(fixtureComposition(undefined, undefined, route))} />,
    );
    expect(
      await screen.findByText('Select a save slot before opening that destination.'),
    ).toHaveAttribute('role', 'status');
    expect(screen.getByRole('button', { name: 'Town' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Town' })).toHaveAttribute(
      'aria-describedby',
      'guarded-navigation-help',
    );
    expect(screen.getByText(/Select an available save slot to open Town/)).toBeVisible();
  });

  it('truthfully explains a non-catalogued routed slot without enabling guarded destinations', async () => {
    const route = fixtureRoute({
      destination: 'save-slots',
      metadata: routeMetadata['save-slots'],
      fallback: 'invalid-context',
    });
    render(
      <App compose={() => Promise.resolve(fixtureComposition(undefined, undefined, route))} />,
    );
    expect(
      await screen.findByText(
        'That save slot is not available. Choose an available save slot to continue.',
      ),
    ).toHaveAttribute('role', 'status');
    expect(screen.getByRole('button', { name: 'Inventory' })).toBeDisabled();
    expect(
      screen.getByRole('navigation', { name: 'Primary destinations' }),
    ).toHaveAccessibleDescription(/Select an available save slot/);
  });

  it('shows a truthful loading state while composition is pending', () => {
    render(<App compose={() => new Promise(() => undefined)} />);
    expect(screen.getByRole('status')).toHaveTextContent('No game action is being performed');
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
  });

  it('recovers from initialization failure without claiming a save', async () => {
    const compose = vi
      .fn()
      .mockRejectedValueOnce(new Error('storage unavailable'))
      .mockResolvedValueOnce(fixtureComposition());
    render(<App compose={compose} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('No game action was requested');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(
      await screen.findByRole('heading', { name: 'Choose a local save slot' }),
    ).toBeInTheDocument();
    expect(compose).toHaveBeenCalledTimes(2);
  });

  it('uses neutral wording for render failures', () => {
    const Throw = () => {
      throw new Error('render failed');
    };
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <RootErrorBoundary onRetry={vi.fn()}>
        <Throw />
      </RootErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('unexpected display error');
    expect(screen.getByRole('alert')).not.toHaveTextContent(
      /progress was changed|saved|rollback|committed/i,
    );
  });

  it.each([
    [
      'supported browser without evidence',
      createPwaStatusAdapter({ serviceWorker: { register: vi.fn() } }),
      'supported',
    ],
    ['unsupported service-worker API', createPwaStatusAdapter({}), 'unsupported'],
  ])('keeps PWA claims neutral for a %s', async (_name, pwa, support) => {
    const composition = fixtureComposition(undefined, pwa);
    render(<App compose={() => Promise.resolve(composition)} />);
    const status = await screen.findByLabelText('Application status');
    expect(status).toHaveTextContent(`Service worker${support}`);
    expect(status).toHaveTextContent(
      support === 'unsupported' ? 'Offline relaunch unavailable' : 'Offline readiness not verified',
    );
    expect(status).toHaveTextContent('Updates not checked');
    expect(status).not.toHaveTextContent(/offline support available|app up to date/i);
    if (support === 'unsupported') {
      expect(status).toHaveTextContent(
        'Browser play can continue, but offline relaunch is not available.',
      );
    } else {
      expect(status).not.toHaveTextContent('Offline relaunch is unavailable');
    }
  });

  it('reports disabled service-worker registration without blocking ordinary play', async () => {
    const pwa = createPwaStatusAdapter({
      serviceWorker: {
        register: vi.fn().mockRejectedValue(new Error('registration disabled')),
      },
    });
    const composition = fixtureComposition(undefined, pwa);
    render(<App compose={() => Promise.resolve(composition)} />);
    expect(
      await screen.findByRole('heading', { name: 'Choose a local save slot' }),
    ).toBeInTheDocument();

    await act(async () => {
      await pwa.register();
    });

    expect(screen.getByLabelText('Application status')).toHaveTextContent(
      'Offline capability restricted',
    );
    expect(
      screen.getByText(
        'Retry the offline readiness check while online. Current local data is unchanged.',
      ),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Retry check' }));
    expect(screen.getByText('Offline capability restricted')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reload updated app' })).not.toBeInTheDocument();
    expect(composition.services.saveSlots.select).not.toHaveBeenCalled();
    expect(composition.services.saveSlots.updateMetadata).not.toHaveBeenCalled();
    expect(screen.getAllByRole('button', { name: 'Start new game' })[0]).toBeEnabled();
  });

  it('reports verified offline play without treating network availability as a prerequisite', async () => {
    let messageReceived:
      ((event: { readonly data: unknown; readonly source?: unknown }) => void) | undefined;
    const controller = { postMessage: vi.fn() };
    const pwa = createPwaStatusAdapter({
      serviceWorker: {
        controller,
        register: vi.fn().mockResolvedValue({
          waiting: null,
          installing: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }),
        addEventListener: vi.fn((type, listener) => {
          if (type === 'message') messageReceived = listener;
        }),
        removeEventListener: vi.fn(),
      },
    });
    await pwa.register();
    const composition = fixtureComposition(undefined, pwa);
    composition.updates.updateStorageCapability('available');
    render(<App compose={() => Promise.resolve(composition)} />);

    const request = controller.postMessage.mock.calls[0]?.[0] as { requestId: string };
    act(() =>
      messageReceived?.({
        source: controller,
        data: {
          type: 'NOTEQUEST_OFFLINE_READINESS_RESULT',
          requestId: request.requestId,
          ready: true,
        },
      }),
    );
    expect(await screen.findByText('Offline ready')).toBeInTheDocument();

    act(() => window.dispatchEvent(new Event('offline')));
    expect(screen.getByText('Offline active')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('local play can continue');
    expect(screen.getAllByRole('button', { name: 'Start new game' })[0]).toBeEnabled();
  });

  it('labels a controller change as reload required without claiming offline readiness', async () => {
    let controllerChanged: (() => void) | undefined;
    const pwa = createPwaStatusAdapter({
      serviceWorker: {
        controller: { postMessage: vi.fn() },
        register: vi.fn().mockResolvedValue({
          waiting: null,
          installing: null,
          addEventListener: vi.fn(),
        }),
        addEventListener: vi.fn((type, listener) => {
          if (type === 'controllerchange') controllerChanged = listener as () => void;
        }),
      },
    });
    render(<App compose={() => Promise.resolve(fixtureComposition(undefined, pwa))} />);
    await act(async () => pwa.register());

    act(() => controllerChanged?.());

    const status = screen.getByLabelText('Application status');
    expect(status).toHaveTextContent('Reload needed');
    expect(status).toHaveTextContent('Offline readiness not verified');
    expect(status).toHaveTextContent('Cache checknot checked');
    expect(status).not.toHaveTextContent('Offline ready');
  });

  it('requires an explicit activation and a separate explicit reload at a durable safe point', async () => {
    let controllerChanged: (() => void) | undefined;
    const postMessage = vi.fn();
    const pwa = createPwaStatusAdapter({
      serviceWorker: {
        controller: { postMessage: vi.fn() },
        register: vi.fn().mockResolvedValue({
          waiting: { postMessage },
          installing: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }),
        addEventListener: vi.fn((type, listener) => {
          if (type === 'controllerchange') controllerChanged = listener as () => void;
        }),
        removeEventListener: vi.fn(),
      },
    });
    await pwa.register();
    const composition = fixtureComposition(undefined, pwa);
    render(<App compose={() => Promise.resolve(composition)} />);

    const activate = await screen.findByRole('button', { name: 'Activate update' });
    expect(postMessage).not.toHaveBeenCalled();
    await userEvent.click(activate);
    expect(postMessage).toHaveBeenCalledWith({ type: 'NOTEQUEST_ACTIVATE_UPDATE' });
    expect(screen.getByText('Update activation requested')).toBeInTheDocument();
    expect(composition.reload).not.toHaveBeenCalled();

    act(() => controllerChanged?.());
    await userEvent.click(screen.getByRole('button', { name: 'Reload updated app' }));
    expect(composition.reload).toHaveBeenCalledOnce();
  });

  it('defers activation when the selected slot has no approved durable save point', async () => {
    const postMessage = vi.fn();
    const pwa = createPwaStatusAdapter({
      serviceWorker: {
        controller: { postMessage: vi.fn() },
        register: vi.fn().mockResolvedValue({
          waiting: { postMessage },
          installing: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });
    await pwa.register();
    const route = fixtureRoute({
      destination: 'town',
      slotId: emptySlots[0]!.slotId,
      metadata: routeMetadata.town,
      fallback: null,
    });
    const composition = fixtureComposition(undefined, pwa, route);
    composition.updates.updateSafety({
      safePoint: 'unverified',
      commandPending: false,
      migrationActive: false,
      importActive: false,
      recoveryActive: false,
      blockingWorkflowActive: false,
      unsavedWork: false,
    });
    render(<App compose={() => Promise.resolve(composition)} />);

    expect(
      await screen.findByText('Finish or save current work before activating the update.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Activate update' })).not.toBeInTheDocument();
    expect(postMessage).not.toHaveBeenCalledWith({ type: 'NOTEQUEST_ACTIVATE_UPDATE' });
  });

  it('presents a failed update without changing, selecting, or disabling local slots', async () => {
    let stateChanged: (() => void) | undefined;
    const installing = {
      state: 'installing',
      addEventListener: vi.fn((_type: string, listener: () => void) => {
        stateChanged = listener;
      }),
    };
    const update = vi.fn().mockResolvedValue(undefined);
    const pwa = createPwaStatusAdapter({
      serviceWorker: {
        controller: { postMessage: vi.fn() },
        register: vi.fn().mockResolvedValue({
          waiting: null,
          installing,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          update,
        }),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });
    await pwa.register();
    const composition = fixtureComposition(undefined, pwa);
    render(<App compose={() => Promise.resolve(composition)} />);
    await screen.findByRole('heading', { name: 'Slot 3' });

    installing.state = 'redundant';
    act(() => stateChanged?.());

    expect(screen.getByText('Update failed')).toBeInTheDocument();
    expect(screen.getByText('Continue with the current version and retry later.')).toBeVisible();
    expect(composition.services.saveSlots.select).not.toHaveBeenCalled();
    expect(composition.services.saveSlots.updateMetadata).not.toHaveBeenCalled();
    expect(screen.getAllByRole('button', { name: 'Start new game' })[0]).toBeEnabled();
    await userEvent.click(screen.getByRole('button', { name: 'Retry check' }));
    expect(update).toHaveBeenCalledOnce();
    expect(composition.reload).not.toHaveBeenCalled();
    expect(composition.services.saveSlots.select).not.toHaveBeenCalled();
    expect(composition.services.saveSlots.updateMetadata).not.toHaveBeenCalled();
  });

  it('retries a failed slot result, returns to loading, and renders recovered slots', async () => {
    const retry = deferred<{ ok: true; value: typeof emptySlots }>();
    const list = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, error: { code: 'read_failed', message: 'failed' } })
      .mockReturnValueOnce(retry.promise);
    render(<App compose={() => Promise.resolve(fixtureComposition(list))} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Local slots could not be read');
    await userEvent.click(screen.getByRole('button', { name: 'Retry local slots' }));
    expect(screen.getByLabelText('Loading local slots')).toBeInTheDocument();
    expect(screen.queryByText(/progress changed/i)).not.toBeInTheDocument();
    await act(async () => {
      retry.resolve({ ok: true, value: emptySlots });
    });
    expect(await screen.findByRole('heading', { name: 'Slot 3' })).toBeInTheDocument();
    expect(list).toHaveBeenCalledTimes(2);
  });

  it('recovers when the slot query rejects', async () => {
    const list = vi
      .fn()
      .mockRejectedValueOnce(new Error('unexpected rejection'))
      .mockResolvedValueOnce({ ok: true, value: emptySlots });
    render(<App compose={() => Promise.resolve(fixtureComposition(list))} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Local slots could not be read');
    await userEvent.click(screen.getByRole('button', { name: 'Retry local slots' }));
    expect(await screen.findByRole('heading', { name: 'Slot 1' })).toBeInTheDocument();
    expect(list).toHaveBeenCalledTimes(2);
  });

  it('selects only the chosen usable slot and starts its creation destination', async () => {
    const route = fixtureRoute();
    const composition = fixtureComposition(undefined, undefined, route);
    vi.mocked(composition.services.saveSlots.select).mockResolvedValue({
      ok: true,
      value: {
        selectedSlotId: emptySlots[0]!.slotId,
        selectedAt: '2026-07-28T00:00:00.000Z',
        slot: emptySlots[0]!,
      },
    });
    render(<App compose={() => Promise.resolve(composition)} />);

    const startButtons = await screen.findAllByRole('button', { name: 'Start new game' });
    await userEvent.click(startButtons[0]!);

    expect(composition.services.saveSlots.select).toHaveBeenCalledTimes(1);
    expect(composition.services.saveSlots.select).toHaveBeenCalledWith(emptySlots[0]!.slotId);
    expect(composition.services.saveSlots.updateMetadata).not.toHaveBeenCalled();
    expect(route.navigate).toHaveBeenCalledWith({
      destination: 'adventurer-creation',
      slotId: emptySlots[0]!.slotId,
    });
  });

  it('routes a recoverable slot to safe data explanation without selecting or resetting it', async () => {
    const route = fixtureRoute();
    const recoverable = {
      ...emptySlots[1]!,
      status: 'isolated' as const,
      schemaVersion: 1,
      integrityStatus: 'invalid' as const,
      recoveryAvailable: true,
      lastValidSnapshotId: 'last-valid',
    };
    const slots = [emptySlots[0]!, recoverable, emptySlots[2]!];
    const composition = fixtureComposition(
      vi.fn().mockResolvedValue({ ok: true, value: slots }),
      undefined,
      route,
    );
    render(<App compose={() => Promise.resolve(composition)} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Review recovery' }));

    expect(composition.services.saveSlots.select).not.toHaveBeenCalled();
    expect(composition.services.saveSlots.updateMetadata).not.toHaveBeenCalled();
    expect(route.navigate).toHaveBeenCalledWith({
      destination: 'data',
      slotId: recoverable.slotId,
    });
    expect(await screen.findByRole('heading', { name: 'Slot 2: Slot 2' })).toBeInTheDocument();
    expect(screen.getByText(/Recovery available — current data will not be reset/)).toBeVisible();
    expect(screen.getByText(/No reset or data mutation occurred/)).toBeVisible();
  });

  it('revalidates the selected row and safely refuses a newly blocked slot', async () => {
    const route = fixtureRoute();
    const listed = {
      ...emptySlots[0]!,
      revision: 1,
      status: 'ready' as const,
      schemaVersion: 1,
      rulesVersion: 'rules.1',
      contentVersion: 'content.1',
      currentSnapshotId: 'current',
      integrityStatus: 'valid' as const,
    };
    const newlyBlocked = { ...listed, integrityStatus: 'invalid' as const };
    const slots = [listed, emptySlots[1]!, emptySlots[2]!];
    const composition = fixtureComposition(
      vi.fn().mockResolvedValue({ ok: true, value: slots }),
      undefined,
      route,
    );
    vi.mocked(composition.services.saveSlots.select).mockResolvedValue({
      ok: true,
      value: { selectedSlotId: listed.slotId, selectedAt: listed.updatedAt, slot: newlyBlocked },
    });
    render(<App compose={() => Promise.resolve(composition)} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Continue' }));

    expect(route.navigate).toHaveBeenCalledWith({ destination: 'data', slotId: listed.slotId });
    expect(route.navigate).not.toHaveBeenCalledWith(
      expect.objectContaining({ destination: 'town' }),
    );
    expect(route.navigate).not.toHaveBeenCalledWith(
      expect.objectContaining({ destination: 'adventurer-creation' }),
    );
  });

  it('exits loading and offers retry when selection rejects', async () => {
    const composition = fixtureComposition();
    vi.mocked(composition.services.saveSlots.select).mockRejectedValue(new Error('storage lost'));
    render(<App compose={() => Promise.resolve(composition)} />);

    const startButtons = await screen.findAllByRole('button', { name: 'Start new game' });
    await userEvent.click(startButtons[0]!);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The chosen slot could not be selected',
    );
    expect(screen.getByRole('button', { name: 'Retry slot selection' })).toBeEnabled();
    expect(screen.queryByLabelText('Loading local slots')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Slot 3' })).toBeVisible();
  });

  it('retains and selectively updates the three slots across successful navigation and return', async () => {
    const route = fixtureRoute();
    const listed = {
      ...emptySlots[0]!,
      revision: 1,
      displayName: 'Before selection',
      status: 'ready' as const,
      schemaVersion: 1,
      rulesVersion: 'rules.before',
      contentVersion: 'content.before',
      currentSnapshotId: 'current',
      integrityStatus: 'valid' as const,
    };
    const returned = {
      ...listed,
      revision: 2,
      displayName: 'After selection',
      updatedAt: '2026-07-28T13:00:00.000Z',
    };
    const list = vi.fn().mockResolvedValue({
      ok: true,
      value: [listed, emptySlots[1]!, emptySlots[2]!],
    });
    const selection = deferred<{
      ok: true;
      value: { selectedSlotId: typeof listed.slotId; selectedAt: string; slot: typeof returned };
    }>();
    const composition = fixtureComposition(list, undefined, route);
    vi.mocked(composition.services.saveSlots.select).mockReturnValue(selection.promise);
    render(<App compose={() => Promise.resolve(composition)} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    expect(screen.getByRole('button', { name: 'Selecting…' })).toBeDisabled();
    expect(screen.getByRole('heading', { name: 'Slot 2' })).toBeVisible();
    await act(async () => {
      selection.resolve({
        ok: true,
        value: { selectedSlotId: listed.slotId, selectedAt: returned.updatedAt, slot: returned },
      });
    });
    expect(await screen.findByRole('heading', { name: 'Town' })).toBeInTheDocument();

    act(() => route.navigate({ destination: 'save-slots', slotId: listed.slotId }));

    expect(await screen.findByRole('heading', { name: 'Slot 3' })).toBeVisible();
    expect(screen.queryByLabelText('Loading local slots')).not.toBeInTheDocument();
    expect(screen.getByText('After selection')).toBeVisible();
    expect(screen.queryByText('Before selection')).not.toBeInTheDocument();
    const secondCard = screen.getByRole('heading', { name: 'Slot 2' }).closest('article')!;
    expect(within(secondCard).getByRole('button', { name: 'Start new game' })).toBeEnabled();
    expect(list).toHaveBeenCalledTimes(1);
    expect(composition.services.saveSlots.select).toHaveBeenCalledTimes(1);
    expect(composition.services.saveSlots.updateMetadata).not.toHaveBeenCalled();
  });

  it.each([
    [true, null],
    [true, 'wrong-pointer'],
    [false, 'last-valid'],
  ] as const)(
    'does not advertise inconsistent recovery evidence %s / %s',
    async (recoveryAvailable, lastValidSnapshotId) => {
      const inconsistent = {
        ...emptySlots[1]!,
        revision: 1,
        status: 'isolated' as const,
        schemaVersion: 1,
        integrityStatus: 'invalid' as const,
        recoveryAvailable,
        lastValidSnapshotId,
      };
      render(
        <App
          compose={() =>
            Promise.resolve(
              fixtureComposition(
                vi.fn().mockResolvedValue({
                  ok: true,
                  value: [emptySlots[0]!, inconsistent, emptySlots[2]!],
                }),
              ),
            )
          }
        />,
      );

      await screen.findByRole('heading', { name: 'Slot 2' });
      expect(screen.queryByRole('button', { name: 'Review recovery' })).not.toBeInTheDocument();
      expect(screen.queryByText('Last-known-valid data is available.')).not.toBeInTheDocument();
      expect(screen.queryByText(/Recovery available/)).not.toBeInTheDocument();
    },
  );

  it.each([
    ['Review compatibility', { schemaVersion: 2 }, undefined, 'incompatible'],
    ['Review migration', { status: 'migrating' }, undefined, 'migrating'],
    [
      'Review blocked slot',
      { status: 'isolated', integrityStatus: 'invalid', recoveryAvailable: false },
      undefined,
      'invalid',
    ],
    ['Review save failure', {}, 'failed', 'failed'],
    ['Review storage options', {}, 'storage-limited', 'storage-limited'],
  ] as const)(
    'retains slot scope and no-mutation guidance for %s',
    async (action, changes, operation, state) => {
      const route = fixtureRoute();
      const slot = {
        ...emptySlots[1]!,
        revision: 1,
        status: 'ready' as const,
        schemaVersion: 1,
        rulesVersion: 'rules.review',
        contentVersion: 'content.review',
        currentSnapshotId: 'current',
        integrityStatus: 'valid' as const,
        ...changes,
      };
      const composition = fixtureComposition(
        vi.fn().mockResolvedValue({
          ok: true,
          value: [emptySlots[0]!, slot, emptySlots[2]!],
        }),
        undefined,
        route,
      );
      vi.mocked(composition.services.saveSlotOperations.get).mockImplementation((slotId) =>
        slotId === slot.slotId ? operation : undefined,
      );
      render(<App compose={() => Promise.resolve(composition)} />);

      await userEvent.click(await screen.findByRole('button', { name: action }));

      const review = await screen.findByRole('heading', { name: 'Slot 2: Slot 2' });
      expect(review).toBeInTheDocument();
      expect(screen.getByLabelText('Capability state')).toHaveTextContent(state);
      expect(screen.getByText(/No reset or data mutation occurred/)).toBeVisible();
      expect(composition.services.saveSlots.select).not.toHaveBeenCalled();
      expect(composition.services.saveSlots.updateMetadata).not.toHaveBeenCalled();
    },
  );

  it('renders APP-003 metadata and neutral missing-value fallbacks on every slot card', async () => {
    const known = {
      ...emptySlots[0]!,
      updatedAt: '2026-07-28T12:34:56.000Z',
      rulesVersion: 'rules.known',
      contentVersion: 'content.known',
    };
    render(
      <App
        compose={() =>
          Promise.resolve(
            fixtureComposition(
              vi.fn().mockResolvedValue({
                ok: true,
                value: [known, emptySlots[1]!, emptySlots[2]!],
              }),
            ),
          )
        }
      />,
    );

    const first = (await screen.findByRole('heading', { name: 'Slot 1' })).closest('article')!;
    expect(within(first).getByText(known.updatedAt)).toHaveAttribute('datetime', known.updatedAt);
    expect(within(first).getByText('rules.known')).toBeVisible();
    expect(within(first).getByText('content.known')).toBeVisible();
    const second = screen.getByRole('heading', { name: 'Slot 2' }).closest('article')!;
    expect(within(second).getAllByText('Not recorded')).toHaveLength(2);
  });
});
