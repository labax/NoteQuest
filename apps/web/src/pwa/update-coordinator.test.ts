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

    expect(coordinator.getStatus()).toEqual({ state: 'not-checked', blockers: [] });
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

    expect(coordinator.getStatus()).toEqual({
      state: 'blocked',
      blockers: ['safe-point-unverified'],
    });
    expect(coordinator.requestActivation()).toEqual({
      ok: false,
      reason: 'unsafe-state',
      blockers: ['safe-point-unverified'],
    });
    expect(fixture.requestActivation).not.toHaveBeenCalled();

    coordinator.updateSafety(durableSafety);
    expect(coordinator.getStatus()).toEqual({ state: 'ready', blockers: [] });
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

    expect(coordinator.getStatus()).toEqual({ state: 'reload-required', blockers: [] });
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

    expect(coordinator.getStatus()).toEqual({ state: 'activation-requested', blockers: [] });
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
});
