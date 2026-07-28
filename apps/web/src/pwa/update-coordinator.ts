import type {
  PwaLifecycleAdapter,
  PwaLifecycleStatus,
  ServiceWorkerSupport,
} from './service-worker';

export type OnlineState = 'online' | 'offline';
export type CacheReadiness = 'not-checked' | 'preparing' | 'ready' | 'failed' | 'unavailable';
export type StorageCapability = 'not-checked' | 'available' | 'limited' | 'unavailable';
export type OfflineReadiness = 'not-ready' | 'ready' | 'failed' | 'unavailable';
export type UpdateState =
  | 'not-checked'
  | 'pending'
  | 'activation-deferred'
  | 'ready'
  | 'activation-requested'
  | 'reload-needed'
  | 'failed';

export type OfflineUpdateFailureCode =
  'cache-check-failed' | 'storage-unavailable' | 'storage-limited' | 'update-failed';

export interface OfflineUpdateFailure {
  /** Stable, privacy-safe support detail; never contains slot or player data. */
  readonly code: OfflineUpdateFailureCode;
  readonly retryable: boolean;
  readonly guidance: string;
}

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

export interface OfflineUpdateCoordinatorStatus {
  readonly onlineState: OnlineState;
  readonly serviceWorkerSupport: ServiceWorkerSupport;
  readonly cacheReadiness: CacheReadiness;
  readonly storageCapability: StorageCapability;
  readonly offlineReadiness: OfflineReadiness;
  readonly updateState: UpdateState;
  readonly blockers: readonly UpdateSafetyBlocker[];
  readonly failures: readonly OfflineUpdateFailure[];
}

export type UpdateCoordinatorStatus = OfflineUpdateCoordinatorStatus;
export type UpdateActivationResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly reason: 'no-waiting-update' | 'unsafe-state' | 'activation-unavailable';
      readonly blockers: readonly UpdateSafetyBlocker[];
    };

export interface PwaUpdateCoordinator {
  getStatus(): Readonly<OfflineUpdateCoordinatorStatus>;
  updateOnlineState(state: OnlineState): void;
  updateStorageCapability(capability: StorageCapability): void;
  updateSafety(snapshot: Readonly<UpdateSafetySnapshot>): void;
  requestActivation(): UpdateActivationResult;
  retryFailure(code: OfflineUpdateFailureCode): Promise<boolean>;
  subscribe(listener: (status: Readonly<OfflineUpdateCoordinatorStatus>) => void): () => void;
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

function cacheState(status: PwaLifecycleStatus): CacheReadiness {
  if (status.serviceWorkerSupport === 'unsupported') return 'unavailable';
  if (status.offlineReadiness === 'installing') return 'preparing';
  if (status.offlineReadiness === 'ready') return 'ready';
  if (status.offlineReadiness === 'unavailable') return 'failed';
  return 'not-checked';
}

export function createPwaUpdateCoordinator(
  lifecycle: PwaLifecycleAdapter,
  initial: {
    readonly onlineState?: OnlineState;
    readonly storageCapability?: StorageCapability;
  } = {},
): PwaUpdateCoordinator {
  let safety = unverifiedSafety;
  let lifecycleStatus = lifecycle.getStatus();
  let onlineState = initial.onlineState ?? 'online';
  let storageCapability = initial.storageCapability ?? 'not-checked';
  let closed = false;
  const listeners = new Set<(status: Readonly<OfflineUpdateCoordinatorStatus>) => void>();

  const project = (): OfflineUpdateCoordinatorStatus => {
    const cacheReadiness = cacheState(lifecycleStatus);
    const blockers = lifecycleStatus.updateStatus === 'waiting' ? evaluateUpdateSafety(safety) : [];
    const failures: OfflineUpdateFailure[] = [];
    if (cacheReadiness === 'failed')
      failures.push({
        code: 'cache-check-failed',
        retryable: true,
        guidance:
          'Retry the offline readiness check while online. Current local data is unchanged.',
      });
    if (storageCapability === 'unavailable')
      failures.push({
        code: 'storage-unavailable',
        retryable: true,
        guidance:
          'Check browser storage settings, then retry. Current slot data has not been replaced.',
      });
    if (storageCapability === 'limited')
      failures.push({
        code: 'storage-limited',
        retryable: true,
        guidance: 'Free browser storage or export data before retrying offline setup.',
      });
    if (lifecycleStatus.updateStatus === 'failed')
      failures.push({
        code: 'update-failed',
        retryable: true,
        guidance: 'Continue with the current version and retry the update later.',
      });
    const offlineReadiness: OfflineReadiness =
      cacheReadiness === 'ready' && storageCapability === 'available'
        ? 'ready'
        : cacheReadiness === 'unavailable' || storageCapability === 'unavailable'
          ? 'unavailable'
          : cacheReadiness === 'failed' || storageCapability === 'limited'
            ? 'failed'
            : 'not-ready';
    const updateState: UpdateState =
      lifecycleStatus.updateStatus === 'pending'
        ? 'pending'
        : lifecycleStatus.updateStatus === 'waiting'
          ? blockers.length
            ? 'activation-deferred'
            : 'ready'
          : lifecycleStatus.updateStatus === 'activation-requested'
            ? 'activation-requested'
            : lifecycleStatus.updateStatus === 'reload-required'
              ? 'reload-needed'
              : lifecycleStatus.updateStatus === 'failed'
                ? 'failed'
                : 'not-checked';
    return {
      onlineState,
      serviceWorkerSupport: lifecycleStatus.serviceWorkerSupport,
      cacheReadiness,
      storageCapability,
      offlineReadiness,
      updateState,
      blockers,
      failures,
    };
  };
  let status = project();
  const publish = () => {
    if (!closed) {
      status = project();
      listeners.forEach((listener) => listener(status));
    }
  };
  const unsubscribeLifecycle = lifecycle.subscribe((next) => {
    lifecycleStatus = next;
    publish();
  });

  return {
    getStatus: () => status,
    updateOnlineState(state) {
      if (!closed) {
        onlineState = state;
        publish();
      }
    },
    updateStorageCapability(capability) {
      if (!closed) {
        storageCapability = capability;
        publish();
      }
    },
    updateSafety(snapshot) {
      if (!closed) {
        safety = { ...snapshot };
        publish();
      }
    },
    requestActivation() {
      if (status.updateState === 'activation-deferred')
        return { ok: false, reason: 'unsafe-state', blockers: status.blockers };
      if (status.updateState !== 'ready')
        return { ok: false, reason: 'no-waiting-update', blockers: [] };
      if (!lifecycle.requestActivation(true))
        return { ok: false, reason: 'activation-unavailable', blockers: [] };
      return { ok: true };
    },
    async retryFailure(code) {
      if (closed) return false;
      if (code === 'cache-check-failed') return lifecycle.retryReadiness();
      if (code === 'update-failed') return lifecycle.retryUpdate();
      return false;
    },
    subscribe(listener) {
      if (closed) return () => undefined;
      listeners.add(listener);
      listener(status);
      return () => listeners.delete(listener);
    },
    close() {
      if (!closed) {
        closed = true;
        unsubscribeLifecycle();
        listeners.clear();
      }
    },
  };
}
