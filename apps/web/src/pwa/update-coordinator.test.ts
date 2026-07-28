import { describe, expect, it, vi } from 'vitest';
import type { PwaLifecycleAdapter, PwaLifecycleStatus } from './service-worker';
import {
  createPwaUpdateCoordinator,
  evaluateUpdateSafety,
  type UpdateSafetySnapshot,
} from './update-coordinator';

const durableSafety: UpdateSafetySnapshot = {
  safePoint: 'durable',
  commandPending: false,
  migrationActive: false,
  importActive: false,
  recoveryActive: false,
  blockingWorkflowActive: false,
  unsavedWork: false,
};

function lifecycleFixture(
  initialStatus: PwaLifecycleStatus = {
    serviceWorkerSupport: 'supported',
    offlineReadiness: 'not-checked',
    updateStatus: 'not-checked',
  },
) {
  let status = initialStatus;
  const listeners = new Set<(status: Readonly<PwaLifecycleStatus>) => void>();
  const requestActivation = vi.fn(() => true);
  const lifecycle: PwaLifecycleAdapter = {
    getStatus: () => status,
    register: vi.fn(),
    requestActivation,
    retryReadiness: vi.fn(async () => true),
    retryUpdate: vi.fn(async () => true),
    subscribe(listener) {
      listeners.add(listener);
      listener(status);
      return () => listeners.delete(listener);
    },
    close: vi.fn(),
  };
  return {
    lifecycle,
    requestActivation,
    publish(next: PwaLifecycleStatus) {
      status = next;
      listeners.forEach((listener) => listener(status));
    },
  };
}

describe('PWA update coordinator', () => {
  it.each([
    [
      'initial state',
      {
        serviceWorkerSupport: 'supported' as const,
        offlineReadiness: 'not-checked' as const,
        updateStatus: 'not-checked' as const,
      },
    ],
    [
      'unsupported service workers',
      {
        serviceWorkerSupport: 'unsupported' as const,
        offlineReadiness: 'unavailable' as const,
        updateStatus: 'not-checked' as const,
      },
    ],
    [
      'registration failure',
      {
        serviceWorkerSupport: 'supported' as const,
        offlineReadiness: 'unavailable' as const,
        updateStatus: 'not-checked' as const,
      },
    ],
    [
      'existing controller without verified evidence',
      {
        serviceWorkerSupport: 'supported' as const,
        offlineReadiness: 'not-checked' as const,
        updateStatus: 'not-checked' as const,
      },
    ],
  ])('keeps %s neutral', (_name, lifecycleStatus) => {
    const coordinator = createPwaUpdateCoordinator(lifecycleFixture(lifecycleStatus).lifecycle);

    expect(coordinator.getStatus()).toMatchObject({ updateState: 'not-checked', blockers: [] });
    expect(coordinator.requestActivation()).toMatchObject({
      ok: false,
      reason: 'no-waiting-update',
    });
  });

  it('enumerates every unresolved-work blocker', () => {
    expect(
      evaluateUpdateSafety({
        safePoint: 'failed',
        commandPending: true,
        migrationActive: true,
        importActive: true,
        recoveryActive: true,
        blockingWorkflowActive: true,
        unsavedWork: true,
      }),
    ).toEqual([
      'command-pending',
      'save-failed',
      'migration-active',
      'import-active',
      'recovery-active',
      'blocking-workflow-active',
      'unsaved-work',
    ]);
  });

  it('keeps a waiting worker blocked until a durable safe point is supplied', () => {
    const fixture = lifecycleFixture();
    const coordinator = createPwaUpdateCoordinator(fixture.lifecycle);
    fixture.publish({
      serviceWorkerSupport: 'supported',
      offlineReadiness: 'not-checked',
      updateStatus: 'waiting',
    });

    expect(coordinator.getStatus()).toMatchObject({
      updateState: 'activation-deferred',
      blockers: ['safe-point-unverified'],
    });
    expect(coordinator.requestActivation()).toEqual({
      ok: false,
      reason: 'unsafe-state',
      blockers: ['safe-point-unverified'],
    });
    expect(fixture.requestActivation).not.toHaveBeenCalled();

    coordinator.updateSafety(durableSafety);
    expect(coordinator.getStatus()).toMatchObject({ updateState: 'ready', blockers: [] });
    expect(fixture.requestActivation).not.toHaveBeenCalled();
  });

  it('requires an explicit request after safety becomes ready', () => {
    const fixture = lifecycleFixture();
    const coordinator = createPwaUpdateCoordinator(fixture.lifecycle);
    coordinator.updateSafety(durableSafety);
    fixture.publish({
      serviceWorkerSupport: 'supported',
      offlineReadiness: 'not-checked',
      updateStatus: 'waiting',
    });

    expect(coordinator.requestActivation()).toEqual({ ok: true });
    expect(fixture.requestActivation).toHaveBeenCalledOnce();
    expect(fixture.requestActivation).toHaveBeenCalledWith(true);
  });

  it('reports reload required without claiming the activated release is current', () => {
    const fixture = lifecycleFixture();
    const coordinator = createPwaUpdateCoordinator(fixture.lifecycle);
    fixture.publish({
      serviceWorkerSupport: 'supported',
      offlineReadiness: 'not-checked',
      updateStatus: 'reload-required',
    });

    expect(coordinator.getStatus()).toMatchObject({ updateState: 'reload-needed', blockers: [] });
    expect(coordinator.requestActivation()).toMatchObject({
      ok: false,
      reason: 'no-waiting-update',
    });
  });

  it('preserves activation-requested lifecycle status', () => {
    const fixture = lifecycleFixture();
    const coordinator = createPwaUpdateCoordinator(fixture.lifecycle);
    fixture.publish({
      serviceWorkerSupport: 'supported',
      offlineReadiness: 'not-checked',
      updateStatus: 'activation-requested',
    });

    expect(coordinator.getStatus()).toMatchObject({
      updateState: 'activation-requested',
      blockers: [],
    });
  });

  it.each([
    ['command', { commandPending: true }],
    ['saving', { safePoint: 'saving' as const }],
    ['migration', { migrationActive: true }],
    ['import', { importActive: true }],
    ['recovery', { recoveryActive: true }],
    ['blocking workflow', { blockingWorkflowActive: true }],
    ['unsaved work', { unsavedWork: true }],
  ])('does not message the worker while %s is unresolved', (_name, unsafeChange) => {
    const fixture = lifecycleFixture();
    const coordinator = createPwaUpdateCoordinator(fixture.lifecycle);
    coordinator.updateSafety({ ...durableSafety, ...unsafeChange });
    fixture.publish({
      serviceWorkerSupport: 'supported',
      offlineReadiness: 'not-checked',
      updateStatus: 'waiting',
    });

    expect(coordinator.requestActivation()).toMatchObject({ ok: false, reason: 'unsafe-state' });
    expect(fixture.requestActivation).not.toHaveBeenCalled();
  });

  it('reports offline readiness only after cache and storage prerequisites are satisfied', () => {
    const fixture = lifecycleFixture({
      serviceWorkerSupport: 'supported',
      offlineReadiness: 'ready',
      updateStatus: 'not-checked',
    });
    const coordinator = createPwaUpdateCoordinator(fixture.lifecycle, {
      onlineState: 'offline',
      storageCapability: 'not-checked',
    });

    expect(coordinator.getStatus()).toMatchObject({
      onlineState: 'offline',
      cacheReadiness: 'ready',
      storageCapability: 'not-checked',
      offlineReadiness: 'not-ready',
    });
    coordinator.updateStorageCapability('available');
    expect(coordinator.getStatus().offlineReadiness).toBe('ready');
    coordinator.updateOnlineState('online');
    expect(coordinator.getStatus()).toMatchObject({
      onlineState: 'online',
      offlineReadiness: 'ready',
    });
  });

  it('tracks repeated online transitions without promoting unverified offline readiness', () => {
    const coordinator = createPwaUpdateCoordinator(lifecycleFixture().lifecycle, {
      onlineState: 'online',
      storageCapability: 'available',
    });

    coordinator.updateOnlineState('offline');
    expect(coordinator.getStatus()).toMatchObject({
      onlineState: 'offline',
      cacheReadiness: 'not-checked',
      offlineReadiness: 'not-ready',
    });
    coordinator.updateOnlineState('online');
    coordinator.updateOnlineState('offline');
    expect(coordinator.getStatus()).toMatchObject({
      onlineState: 'offline',
      offlineReadiness: 'not-ready',
    });
  });

  it.each([
    {
      name: 'unsupported service worker',
      lifecycle: {
        serviceWorkerSupport: 'unsupported' as const,
        offlineReadiness: 'unavailable' as const,
        updateStatus: 'not-checked' as const,
      },
      storageCapability: 'available' as const,
      offlineReadiness: 'unavailable',
      failureCodes: [],
    },
    {
      name: 'unavailable storage',
      lifecycle: {
        serviceWorkerSupport: 'supported' as const,
        offlineReadiness: 'ready' as const,
        updateStatus: 'not-checked' as const,
      },
      storageCapability: 'unavailable' as const,
      offlineReadiness: 'unavailable',
      failureCodes: ['storage-unavailable'],
    },
    {
      name: 'limited storage',
      lifecycle: {
        serviceWorkerSupport: 'supported' as const,
        offlineReadiness: 'ready' as const,
        updateStatus: 'not-checked' as const,
      },
      storageCapability: 'limited' as const,
      offlineReadiness: 'failed',
      failureCodes: ['storage-limited'],
    },
  ])(
    'reports $name truthfully without an activation path',
    ({ lifecycle, storageCapability, offlineReadiness, failureCodes }) => {
      const fixture = lifecycleFixture(lifecycle);
      const coordinator = createPwaUpdateCoordinator(fixture.lifecycle, { storageCapability });

      expect(coordinator.getStatus().offlineReadiness).toBe(offlineReadiness);
      expect(coordinator.getStatus().failures.map(({ code }) => code)).toEqual(failureCodes);
      expect(coordinator.requestActivation()).toMatchObject({
        ok: false,
        reason: 'no-waiting-update',
      });
      expect(fixture.requestActivation).not.toHaveBeenCalled();
    },
  );

  it('keeps a failed save deferred and preserves its exact safety reason', () => {
    const fixture = lifecycleFixture({
      serviceWorkerSupport: 'supported',
      offlineReadiness: 'ready',
      updateStatus: 'waiting',
    });
    const coordinator = createPwaUpdateCoordinator(fixture.lifecycle);
    coordinator.updateSafety({ ...durableSafety, safePoint: 'failed' });

    expect(coordinator.getStatus()).toMatchObject({
      updateState: 'activation-deferred',
      blockers: ['save-failed'],
    });
    expect(coordinator.requestActivation()).toEqual({
      ok: false,
      reason: 'unsafe-state',
      blockers: ['save-failed'],
    });
    expect(fixture.requestActivation).not.toHaveBeenCalled();
  });

  it('presents privacy-safe, recoverable cache, storage, and update failures', () => {
    const fixture = lifecycleFixture({
      serviceWorkerSupport: 'supported',
      offlineReadiness: 'unavailable',
      updateStatus: 'failed',
    });
    const coordinator = createPwaUpdateCoordinator(fixture.lifecycle, {
      storageCapability: 'limited',
    });

    expect(coordinator.getStatus()).toMatchObject({
      offlineReadiness: 'failed',
      updateState: 'failed',
      failures: [
        { code: 'cache-check-failed', retryable: true },
        { code: 'storage-limited', retryable: false },
        { code: 'update-failed', retryable: true },
      ],
    });
    expect(JSON.stringify(coordinator.getStatus().failures)).not.toMatch(
      /slotId|name|history|seed/i,
    );
  });

  it.each([
    ['cache-check-failed', 'retryReadiness'],
    ['update-failed', 'retryUpdate'],
  ] as const)('routes %s retry through the lifecycle without activation', async (code, method) => {
    const fixture = lifecycleFixture({
      serviceWorkerSupport: 'supported',
      offlineReadiness: code === 'cache-check-failed' ? 'unavailable' : 'ready',
      updateStatus: code === 'update-failed' ? 'failed' : 'not-checked',
    });
    const coordinator = createPwaUpdateCoordinator(fixture.lifecycle);

    await expect(coordinator.retryFailure(code)).resolves.toBe(true);
    expect(fixture.lifecycle[method]).toHaveBeenCalledOnce();
    expect(fixture.requestActivation).not.toHaveBeenCalled();
  });

  it.each([
    ['storage-unavailable', 'unavailable'],
    ['storage-limited', 'limited'],
  ] as const)('rechecks %s through the composition-owned storage probe', async (code, initial) => {
    const retryStorage = vi.fn().mockResolvedValueOnce('available');
    const fixture = lifecycleFixture();
    const coordinator = createPwaUpdateCoordinator(fixture.lifecycle, {
      storageCapability: initial,
      retryStorage,
    });

    await expect(coordinator.retryFailure(code)).resolves.toBe(true);
    expect(retryStorage).toHaveBeenCalledOnce();
    expect(coordinator.getStatus().storageCapability).toBe('available');
    expect(
      coordinator.getStatus().failures.map(({ code: failureCode }) => failureCode),
    ).not.toContain(code);
    expect(fixture.requestActivation).not.toHaveBeenCalled();
  });

  it('contains a rejected storage recheck and retains truthful retryable failure', async () => {
    const fixture = lifecycleFixture();
    const coordinator = createPwaUpdateCoordinator(fixture.lifecycle, {
      storageCapability: 'limited',
      retryStorage: vi.fn().mockRejectedValue(new Error('storage rejected')),
    });

    await expect(coordinator.retryFailure('storage-limited')).resolves.toBe(false);
    expect(coordinator.getStatus()).toMatchObject({
      storageCapability: 'unavailable',
      failures: [expect.objectContaining({ code: 'storage-unavailable', retryable: true })],
    });
    expect(fixture.requestActivation).not.toHaveBeenCalled();
  });
});
