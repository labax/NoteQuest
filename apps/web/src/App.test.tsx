// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NOTEQUEST_SLOT_IDS } from '@notequest/infrastructure';
import { createPwaStatusAdapter, type AppComposition } from './composition';
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
  pwa = createPwaStatusAdapter({ serviceWorker: {} }),
  route: RouteAdapter = fixtureRoute(),
): AppComposition {
  return {
    services: {
      saveSlots: {
        list,
        lookup: vi.fn(),
        select: vi.fn(),
        updateMetadata: vi.fn(),
      },
    },
    route,
    pwa,
    version: 'test-version',
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
      'Offline readiness: not checked',
    );
    expect(screen.getByLabelText('Application status')).toHaveTextContent('Updates: not checked');
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
      createPwaStatusAdapter({ serviceWorker: {} }),
      'supported',
    ],
    ['unsupported service-worker API', createPwaStatusAdapter({}), 'unsupported'],
  ])('keeps PWA claims neutral for a %s', async (_name, pwa, support) => {
    render(<App compose={() => Promise.resolve(fixtureComposition(undefined, pwa))} />);
    const status = await screen.findByLabelText('Application status');
    expect(status).toHaveTextContent(`Service workers: ${support}`);
    expect(status).toHaveTextContent('Offline readiness: not checked');
    expect(status).toHaveTextContent('Updates: not checked');
    expect(status).not.toHaveTextContent(/offline support available|app up to date/i);
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
    expect(screen.getByRole('status')).toHaveTextContent('Loading local slots');
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
  });
});
