export const ACTIVATE_UPDATE_MESSAGE = 'NOTEQUEST_ACTIVATE_UPDATE' as const;
export const CHECK_OFFLINE_READINESS_MESSAGE = 'NOTEQUEST_CHECK_OFFLINE_READINESS' as const;
export const OFFLINE_READINESS_RESULT_MESSAGE = 'NOTEQUEST_OFFLINE_READINESS_RESULT' as const;

export interface ActivateUpdateMessage {
  readonly type: typeof ACTIVATE_UPDATE_MESSAGE;
}

export interface CheckOfflineReadinessMessage {
  readonly type: typeof CHECK_OFFLINE_READINESS_MESSAGE;
}

export interface OfflineReadinessResultMessage {
  readonly type: typeof OFFLINE_READINESS_RESULT_MESSAGE;
  readonly ready: boolean;
}

export function isCheckOfflineReadinessMessage(
  value: unknown,
): value is CheckOfflineReadinessMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    Reflect.get(value, 'type') === CHECK_OFFLINE_READINESS_MESSAGE
  );
}

export function isOfflineReadinessResultMessage(
  value: unknown,
): value is OfflineReadinessResultMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    Reflect.get(value, 'type') === OFFLINE_READINESS_RESULT_MESSAGE &&
    typeof Reflect.get(value, 'ready') === 'boolean'
  );
}

export function isActivateUpdateMessage(value: unknown): value is ActivateUpdateMessage {
  if (typeof value !== 'object' || value === null) return false;
  return Reflect.get(value, 'type') === ACTIVATE_UPDATE_MESSAGE;
}
