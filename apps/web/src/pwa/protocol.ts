export const ACTIVATE_UPDATE_MESSAGE = 'NOTEQUEST_ACTIVATE_UPDATE' as const;

export interface ActivateUpdateMessage {
  readonly type: typeof ACTIVATE_UPDATE_MESSAGE;
}

export function isActivateUpdateMessage(value: unknown): value is ActivateUpdateMessage {
  if (typeof value !== 'object' || value === null) return false;
  return Reflect.get(value, 'type') === ACTIVATE_UPDATE_MESSAGE;
}
