import type { PwaLifecycleAdapter, PwaLifecycleStatus } from './service-worker';

export type UpdateSafetyBlocker =
  | 'safe-point-unverified'
  | 'command-pending'
  | 'save-pending'
  | 'save-failed'
  | 'migration-active'
  | 'import-active'
  | 'recovery-active'
  | 'blocking-workflow-active'
  | 'unsaved-work';

export interface UpdateSafetySnapshot {
  readonly safePoint: 'unverified' | 'durable' | 'saving' | 'failed';
  readonly commandPending: boolean;
  readonly migrationActive: boolean;
  readonly importActive: boolean;
  readonly recoveryActive: boolean;
  readonly blockingWorkflowActive: boolean;
  readonly unsavedWork: boolean;
}

export interface UpdateCoordinatorStatus {
  readonly state:
    'current' | 'waiting' | 'blocked' | 'ready' | 'activation-requested' | 'reload-required';
  readonly blockers: readonly UpdateSafetyBlocker[];
}

export type UpdateActivationResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly reason: 'no-waiting-update' | 'unsafe-state' | 'activation-unavailable';
      readonly blockers: readonly UpdateSafetyBlocker[];
    };

export interface PwaUpdateCoordinator {
  getStatus(): Readonly<UpdateCoordinatorStatus>;
  updateSafety(snapshot: Readonly<UpdateSafetySnapshot>): void;
  requestActivation(): UpdateActivationResult;
  subscribe(listener: (status: Readonly<UpdateCoordinatorStatus>) => void): () => void;
  close(): void;
}

const unverifiedSafety: UpdateSafetySnapshot = {
  safePoint: 'unverified',
  commandPending: false,
  migrationActive: false,
  importActive: false,
  recoveryActive: false,
  blockingWorkflowActive: false,
  unsavedWork: false,
};

export function evaluateUpdateSafety(
  snapshot: Readonly<UpdateSafetySnapshot>,
): readonly UpdateSafetyBlocker[] {
  const blockers: UpdateSafetyBlocker[] = [];
  if (snapshot.safePoint === 'unverified') blockers.push('safe-point-unverified');
  if (snapshot.commandPending) blockers.push('command-pending');
  if (snapshot.safePoint === 'saving') blockers.push('save-pending');
  if (snapshot.safePoint === 'failed') blockers.push('save-failed');
  if (snapshot.migrationActive) blockers.push('migration-active');
  if (snapshot.importActive) blockers.push('import-active');
  if (snapshot.recoveryActive) blockers.push('recovery-active');
  if (snapshot.blockingWorkflowActive) blockers.push('blocking-workflow-active');
  if (snapshot.unsavedWork) blockers.push('unsaved-work');
  return blockers;
}

export function createPwaUpdateCoordinator(lifecycle: PwaLifecycleAdapter): PwaUpdateCoordinator {
  let safety = unverifiedSafety;
  let lifecycleStatus = lifecycle.getStatus();
  let closed = false;
  const listeners = new Set<(status: Readonly<UpdateCoordinatorStatus>) => void>();

  const project = (): UpdateCoordinatorStatus => {
    if (lifecycleStatus.updateStatus === 'activation-requested') {
      return { state: 'activation-requested', blockers: [] };
    }
    if (lifecycleStatus.updateStatus === 'reload-required') {
      return { state: 'reload-required', blockers: [] };
    }
    if (lifecycleStatus.updateStatus !== 'waiting') return { state: 'current', blockers: [] };
    const blockers = evaluateUpdateSafety(safety);
    return { state: blockers.length === 0 ? 'ready' : 'blocked', blockers };
  };
  let status = project();

  const publish = () => {
    if (closed) return;
    status = project();
    listeners.forEach((listener) => listener(status));
  };
  const unsubscribeLifecycle = lifecycle.subscribe((next: Readonly<PwaLifecycleStatus>) => {
    lifecycleStatus = next;
    publish();
  });

  return {
    getStatus: () => status,
    updateSafety(snapshot) {
      if (closed) return;
      safety = { ...snapshot };
      publish();
    },
    requestActivation() {
      if (status.state === 'blocked') {
        return { ok: false, reason: 'unsafe-state', blockers: status.blockers };
      }
      if (status.state !== 'ready') {
        return { ok: false, reason: 'no-waiting-update', blockers: [] };
      }
      if (!lifecycle.requestActivation(true)) {
        return { ok: false, reason: 'activation-unavailable', blockers: [] };
      }
      return { ok: true };
    },
    subscribe(listener) {
      if (closed) return () => undefined;
      listeners.add(listener);
      listener(status);
      return () => listeners.delete(listener);
    },
    close() {
      if (closed) return;
      closed = true;
      unsubscribeLifecycle();
      listeners.clear();
    },
  };
}
