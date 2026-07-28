import { describe, expect, it } from 'vitest';
import { presentPwaShellStatus } from './status-presentation';
import type { OfflineUpdateCoordinatorStatus } from './update-coordinator';

const base: OfflineUpdateCoordinatorStatus = {
  onlineState: 'online',
  serviceWorkerSupport: 'supported',
  cacheReadiness: 'not-checked',
  storageCapability: 'not-checked',
  offlineReadiness: 'not-ready',
  updateState: 'not-checked',
  blockers: [],
  failures: [],
};

describe('PWA shell status presentation', () => {
  it.each([
    [{}, 'Offline readiness not verified'],
    [{ cacheReadiness: 'ready' as const }, 'Offline readiness not verified'],
    [{ storageCapability: 'available' as const }, 'Offline readiness not verified'],
    [{ cacheReadiness: 'preparing' as const }, 'Preparing offline use'],
    [
      {
        cacheReadiness: 'ready' as const,
        storageCapability: 'available' as const,
        offlineReadiness: 'ready' as const,
      },
      'Offline ready',
    ],
  ])('does not claim readiness before every prerequisite is verified', (change, expected) => {
    expect(presentPwaShellStatus({ ...base, ...change }).offlineLabel).toBe(expected);
  });

  it('describes established offline play without treating network access as a prerequisite', () => {
    expect(
      presentPwaShellStatus({
        ...base,
        onlineState: 'offline',
        cacheReadiness: 'ready',
        storageCapability: 'available',
        offlineReadiness: 'ready',
      }),
    ).toMatchObject({
      connectivity: 'Offline',
      offlineLabel: 'Offline active',
      offlineMessage: expect.stringContaining('local play can continue'),
    });
  });

  it.each([
    ['pending', 'Update downloading'],
    ['activation-deferred', 'Update waiting'],
    ['ready', 'Update ready'],
    ['failed', 'Update failed'],
    ['reload-needed', 'Reload needed'],
  ] as const)('makes the %s update state discoverable', (updateState, expected) => {
    expect(presentPwaShellStatus({ ...base, updateState }).updateLabel).toBe(expected);
  });

  it('presents failed update recovery without implying rollback or data replacement', () => {
    const presentation = presentPwaShellStatus({ ...base, updateState: 'failed' });

    expect(presentation).toMatchObject({
      updateLabel: 'Update failed',
      updateMessage: 'Continue with the current version and retry later.',
    });
    expect(JSON.stringify(presentation)).not.toMatch(/rollback|reset|replace|slot|save contents/i);
  });
});
