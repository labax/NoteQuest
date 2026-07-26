/** Stable scenarios exposed only from the private test-support workspace. */
export const PERSISTENCE_FAULT_POINTS = [
  'transaction.before-transaction',
  'transaction.after-required-writes',
  'transaction.before-completion',
  'transaction.after-completion-before-receipt',
  'snapshot.retain.before-transaction',
  'snapshot.retain.after-write',
  'snapshot.retain.before-completion',
  'snapshot.retain.after-completion-before-receipt',
  'snapshot.read.before-transaction',
  'snapshot.read.after-read',
  'snapshot.select.before-transaction',
  'snapshot.select.after-read',
  'snapshot.restore.before-transaction',
  'snapshot.restore.after-required-writes',
  'snapshot.restore.before-completion',
  'snapshot.restore.after-completion-before-receipt',
] as const;

export type PersistenceFaultPoint = (typeof PERSISTENCE_FAULT_POINTS)[number];

export type PersistenceInjectedFailure =
  'storage_failure' | 'quota_exceeded' | 'recovery_read_failure';

export const PERSISTENCE_FAULT_SCENARIOS = {
  transactionAbort: {
    point: 'transaction.after-required-writes',
    failure: 'storage_failure',
  },
  snapshotWriteFailure: {
    point: 'snapshot.retain.after-write',
    failure: 'storage_failure',
  },
  quotaLikeTransactionFailure: {
    point: 'transaction.after-required-writes',
    failure: 'quota_exceeded',
  },
  recoveryReadFailure: {
    point: 'snapshot.select.after-read',
    failure: 'recovery_read_failure',
  },
} as const satisfies Record<
  string,
  { readonly point: PersistenceFaultPoint; readonly failure: PersistenceInjectedFailure }
>;

export class InjectedPersistenceFault extends Error {
  readonly name = 'InjectedPersistenceFault';

  constructor(
    readonly point: PersistenceFaultPoint,
    readonly failure: PersistenceInjectedFailure = 'storage_failure',
  ) {
    super(
      failure === 'storage_failure'
        ? `Injected persistence fault at ${point}.`
        : `Injected persistence fault at ${point} (${failure}).`,
    );
  }
}

/** Deterministic one-shot test adapter. An armed point is consumed when hit. */
export function createPersistenceFaultController() {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Persistence fault injection is available only in test processes.');
  }

  let armed: {
    readonly point: PersistenceFaultPoint;
    readonly failure: PersistenceInjectedFailure;
  } | null = null;
  return {
    arm(
      point: PersistenceFaultPoint,
      failure: PersistenceInjectedFailure = 'storage_failure',
    ): void {
      armed = { point, failure };
    },
    armScenario(scenario: {
      readonly point: PersistenceFaultPoint;
      readonly failure: PersistenceInjectedFailure;
    }): void {
      armed = scenario;
    },
    clear(): void {
      armed = null;
    },
    get pending(): PersistenceFaultPoint | null {
      return armed?.point ?? null;
    },
    get pendingFailure(): PersistenceInjectedFailure | null {
      return armed?.failure ?? null;
    },
    hit(point: PersistenceFaultPoint): void {
      if (armed?.point !== point) return;
      const { failure } = armed;
      armed = null;
      throw new InjectedPersistenceFault(point, failure);
    },
  };
}
