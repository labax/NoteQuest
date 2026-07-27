// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createPwaStatusAdapter, type AppComposition } from './composition';
import { App, RootErrorBoundary } from './App.tsx';

const emptySlots = [1, 2, 3].map((slotIndex) => ({
  slotId: `slot-${slotIndex}`,
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
    route: { current: () => 'home', navigate: vi.fn() },
    pwa,
    version: 'test-version',
    close: vi.fn(),
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
});
