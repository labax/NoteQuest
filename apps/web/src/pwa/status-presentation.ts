import type { OfflineUpdateCoordinatorStatus } from './update-coordinator';

export interface PwaShellStatusPresentation {
  readonly connectivity: 'Online' | 'Offline';
  readonly offlineLabel:
    | 'Offline ready'
    | 'Offline active'
    | 'Preparing offline use'
    | 'Offline readiness not verified'
    | 'Offline capability restricted'
    | 'Offline relaunch unavailable';
  readonly offlineMessage: string;
  readonly updateLabel: string;
  readonly updateMessage: string | null;
}

export function presentPwaShellStatus(
  status: Readonly<OfflineUpdateCoordinatorStatus>,
): PwaShellStatusPresentation {
  const connectivity = status.onlineState === 'online' ? 'Online' : 'Offline';
  const offline = (() => {
    if (status.offlineReadiness === 'ready') {
      return status.onlineState === 'offline'
        ? {
            label: 'Offline active' as const,
            message: 'Verified local capabilities are available; local play can continue.',
          }
        : {
            label: 'Offline ready' as const,
            message: 'Required app files and local storage have been verified.',
          };
    }
    if (status.cacheReadiness === 'preparing') {
      return {
        label: 'Preparing offline use' as const,
        message: 'Offline relaunch is not ready yet. Keep this page open while checks finish.',
      };
    }
    if (status.storageCapability === 'limited' || status.offlineReadiness === 'failed') {
      return {
        label: 'Offline capability restricted' as const,
        message: 'Offline checks did not complete. Current local slot data is unchanged.',
      };
    }
    if (status.offlineReadiness === 'unavailable') {
      return {
        label: 'Offline relaunch unavailable' as const,
        message: 'Browser play can continue, but offline relaunch is not available.',
      };
    }
    return {
      label: 'Offline readiness not verified' as const,
      message:
        'Offline relaunch will not be claimed until app files and local storage are verified.',
    };
  })();

  const update = {
    'not-checked': ['Updates not checked', null],
    pending: ['Update downloading', 'The current version remains active.'],
    'activation-deferred': [
      'Update waiting',
      'Finish or save current work before activating the update.',
    ],
    ready: [
      'Update ready',
      'A safe save point is approved. Activation still requires your choice.',
    ],
    'activation-requested': [
      'Update activation requested',
      'Current local data remains unchanged. Reload will still require your choice.',
    ],
    'reload-needed': ['Reload needed', 'Reload explicitly when you are ready to use the update.'],
    failed: ['Update failed', 'Continue with the current version and retry later.'],
  } as const;
  const [updateLabel, updateMessage] = update[status.updateState];
  return {
    connectivity,
    offlineLabel: offline.label,
    offlineMessage: offline.message,
    updateLabel,
    updateMessage,
  };
}
