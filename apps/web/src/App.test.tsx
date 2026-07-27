// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { AppComposition } from './composition';
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

function fixtureComposition(): AppComposition {
  return {
    services: {
      saveSlots: {
        list: vi.fn().mockResolvedValue({ ok: true, value: emptySlots }),
        lookup: vi.fn(),
        select: vi.fn(),
        updateMetadata: vi.fn(),
      },
    },
    route: { current: () => 'home', navigate: vi.fn() },
    pwa: { getStatus: () => ({ offlineReady: true, updateAvailable: false }) },
    version: 'test-version',
    close: vi.fn(),
  };
}

describe('App shell', () => {
  it('renders stable workspace, context, status, and utility regions', async () => {
    render(<App compose={() => Promise.resolve(fixtureComposition())} />);
    expect(
      await screen.findByRole('heading', { name: 'Choose a local save slot' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Local data status' })).toBeInTheDocument();
    expect(screen.getByLabelText('Application status')).toHaveTextContent('Save state: unchanged');
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
    expect(await screen.findByRole('alert')).toHaveTextContent('No progress was changed');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(
      await screen.findByRole('heading', { name: 'Choose a local save slot' }),
    ).toBeInTheDocument();
    expect(compose).toHaveBeenCalledTimes(2);
  });

  it('provides the same truthful fallback for render failures', () => {
    const Throw = () => {
      throw new Error('render failed');
    };
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <RootErrorBoundary onRetry={vi.fn()}>
        <Throw />
      </RootErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('No progress was changed');
  });
});
