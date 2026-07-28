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

function lifecycleFixture() {
  let status: PwaLifecycleStatus = {
    serviceWorkerSupport: 'supported',
    offlineReadiness: 'ready',
    updateStatus: 'current',
  };
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
      offlineReadiness: 'ready',
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
      offlineReadiness: 'ready',
      updateStatus: 'waiting',
    });

    expect(coordinator.requestActivation()).toEqual({ ok: true });
    expect(fixture.requestActivation).toHaveBeenCalledOnce();
    expect(fixture.requestActivation).toHaveBeenCalledWith(true);
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
      offlineReadiness: 'ready',
      updateStatus: 'waiting',
    });

    expect(coordinator.requestActivation()).toMatchObject({ ok: false, reason: 'unsafe-state' });
    expect(fixture.requestActivation).not.toHaveBeenCalled();
  });
});
