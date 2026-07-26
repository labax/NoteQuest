/** Internal seam implemented by test-support adapters; production construction omits it. */
export type PersistenceFaultPoint =
  | 'transaction.before-transaction'
  | 'transaction.after-required-writes'
  | 'transaction.before-completion'
  | 'transaction.after-completion-before-receipt'
  | 'snapshot.retain.before-transaction'
  | 'snapshot.retain.after-write'
  | 'snapshot.retain.before-completion'
  | 'snapshot.retain.after-completion-before-receipt'
  | 'snapshot.read.before-transaction'
  | 'snapshot.read.after-read'
  | 'snapshot.select.before-transaction'
  | 'snapshot.select.after-read'
  | 'snapshot.restore.before-transaction'
  | 'snapshot.restore.after-required-writes'
  | 'snapshot.restore.before-completion'
  | 'snapshot.restore.after-completion-before-receipt';

export interface PersistenceFaultHooks {
  hit(point: PersistenceFaultPoint): void;
}

export function assertTestOnlyFaultHooks(faultHooks: PersistenceFaultHooks | undefined): void {
  if (faultHooks !== undefined && process.env.NODE_ENV !== 'test') {
    throw new Error('Persistence fault hooks cannot be enabled outside a test process.');
  }
}

export function injectedFaultMessage(cause: unknown): string | null {
  return cause instanceof Error && cause.name === 'InjectedPersistenceFault' ? cause.message : null;
}

export function injectedFaultPoint(cause: unknown): PersistenceFaultPoint | null {
  if (
    !(cause instanceof Error) ||
    cause.name !== 'InjectedPersistenceFault' ||
    !('point' in cause)
  ) {
    return null;
  }
  return typeof cause.point === 'string' ? (cause.point as PersistenceFaultPoint) : null;
}
