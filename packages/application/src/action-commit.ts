import type { IdempotencyKey } from '@notequest/domain';
import type {
  EventRecord,
  PersistedRecord,
  RepositoryError,
  SlotRecord,
  SnapshotRecord,
  WorkspaceEntry,
} from './repositories.ts';

export interface ActionCommitRecoveryPointers {
  readonly snapshots?: readonly SnapshotRecord[];
  readonly workspaceEntries?: readonly WorkspaceEntry[];
}

export interface ActionCommitEnvelope {
  readonly actionId: string;
  readonly slotId: SlotRecord['slotId'];
  readonly idempotencyKey?: IdempotencyKey;
  readonly expectedRevision?: number;
  readonly stateRecords: readonly PersistedRecord[];
  readonly events: readonly EventRecord[];
  readonly randomStreamRecords?: readonly PersistedRecord[];
  readonly randomResultRecords?: readonly PersistedRecord[];
  readonly slotMetadata?: SlotRecord;
  readonly recoveryPointers?: ActionCommitRecoveryPointers;
}

export type ActionCommitValidationErrorCode =
  | 'empty_action_id'
  | 'slot_mismatch'
  | 'missing_required_write'
  | 'invalid_sequence'
  | 'invalid_expected_revision'
  | 'invalid_required_write';

export interface ActionCommitValidationError {
  readonly code: ActionCommitValidationErrorCode;
  readonly message: string;
  readonly path: string;
}

export type ActionCommitErrorCode =
  | ActionCommitValidationErrorCode
  | 'revision_conflict'
  | 'sequence_conflict'
  | 'write_failed'
  | 'transaction_failed';

export interface ActionCommitError {
  readonly code: ActionCommitErrorCode;
  readonly message: string;
  readonly validationErrors?: readonly ActionCommitValidationError[];
  readonly repositoryError?: RepositoryError;
  readonly cause?: unknown;
  readonly currentRevision?: number;
  readonly expectedRevision?: number;
  readonly expectedSequences?: readonly number[];
  readonly submittedSequences?: readonly number[];
}

export interface ActionCommitWriteCounts {
  readonly stateRecords: number;
  readonly events: number;
  readonly randomStreamRecords: number;
  readonly randomResultRecords: number;
  readonly slotMetadata: number;
  readonly recoverySnapshots: number;
  readonly recoveryWorkspaceEntries: number;
  readonly idempotencyMarkers: number;
}

export type ActionCommitResult =
  | {
      readonly ok: true;
      readonly actionId: string;
      readonly idempotencyKey?: IdempotencyKey;
      readonly committed: true;
      readonly duplicate: false;
      readonly stateRevision: number;
      readonly written: ActionCommitWriteCounts;
    }
  | {
      readonly ok: true;
      readonly actionId: string;
      readonly idempotencyKey: IdempotencyKey;
      readonly committed: false;
      readonly duplicate: true;
      readonly stateRevision: number;
      readonly written: ActionCommitWriteCounts;
    }
  | {
      readonly ok: false;
      readonly actionId?: string;
      readonly idempotencyKey?: IdempotencyKey;
      readonly committed: false;
      readonly duplicate?: false;
      readonly error: ActionCommitError;
    };

export interface ActionTransactionDiagnostics {
  transactionStarted?(envelope: ActionCommitEnvelope, plannedWrites: ActionCommitWriteCounts): void;
  transactionCommitted?(envelope: ActionCommitEnvelope, written: ActionCommitWriteCounts): void;
  transactionDuplicate?(envelope: ActionCommitEnvelope, stateRevision: number): void;
  transactionAborted?(envelope: ActionCommitEnvelope, error: ActionCommitError): void;
}

export interface ActionTransactionCoordinator {
  commit(envelope: ActionCommitEnvelope): Promise<ActionCommitResult>;
}

export function validateActionCommitEnvelope(
  envelope: ActionCommitEnvelope,
): readonly ActionCommitValidationError[] {
  const errors: ActionCommitValidationError[] = [];

  if (envelope.actionId.trim() === '') {
    errors.push({
      code: 'empty_action_id',
      message: 'actionId is required for atomic action commits.',
      path: 'actionId',
    });
  }

  if (envelope.expectedRevision !== undefined && envelope.expectedRevision < 0) {
    errors.push({
      code: 'invalid_expected_revision',
      message: 'expectedRevision cannot be negative.',
      path: 'expectedRevision',
    });
  }

  if (envelope.events.length === 0) {
    errors.push({
      code: 'missing_required_write',
      message: 'At least one immutable event is required for an action commit.',
      path: 'events',
    });
  }

  for (const [index, event] of envelope.events.entries()) {
    if (event.sequence < 1) {
      errors.push({
        code: 'invalid_sequence',
        message: 'Event sequences must be positive.',
        path: `events.${index}.sequence`,
      });
    }
  }

  const slotScopedWrites: Array<readonly [string, SlotRecord['slotId']]> = [
    ...envelope.stateRecords.map(
      (record, index) => [`stateRecords.${index}`, record.slotId] as const,
    ),
    ...envelope.events.map((event, index) => [`events.${index}`, event.slotId] as const),
    ...(envelope.randomStreamRecords ?? []).map(
      (record, index) => [`randomStreamRecords.${index}`, record.slotId] as const,
    ),
    ...(envelope.randomResultRecords ?? []).map(
      (record, index) => [`randomResultRecords.${index}`, record.slotId] as const,
    ),
    ...(envelope.recoveryPointers?.snapshots ?? []).map(
      (snapshot, index) => [`recoveryPointers.snapshots.${index}`, snapshot.slotId] as const,
    ),
  ];

  if (envelope.slotMetadata !== undefined) {
    slotScopedWrites.push(['slotMetadata', envelope.slotMetadata.slotId]);
  }

  for (const [path, slotId] of slotScopedWrites) {
    if (slotId !== envelope.slotId) {
      errors.push({
        code: 'slot_mismatch',
        message: 'All action commit writes must target the envelope slot.',
        path,
      });
    }
  }

  return errors;
}

export function actionCommitValidationFailure(
  envelope: ActionCommitEnvelope,
  validationErrors: readonly ActionCommitValidationError[],
): ActionCommitResult {
  return {
    ok: false,
    actionId: envelope.actionId,
    ...(envelope.idempotencyKey === undefined ? {} : { idempotencyKey: envelope.idempotencyKey }),
    committed: false,
    duplicate: false,
    error: {
      code: validationErrors[0]?.code ?? 'missing_required_write',
      message: 'Action commit envelope validation failed before durable writes.',
      validationErrors,
    },
  };
}

export function countActionCommitWrites(envelope: ActionCommitEnvelope): ActionCommitWriteCounts {
  return {
    stateRecords: envelope.stateRecords.length,
    events: envelope.events.length,
    randomStreamRecords: envelope.randomStreamRecords?.length ?? 0,
    randomResultRecords: envelope.randomResultRecords?.length ?? 0,
    slotMetadata: envelope.slotMetadata === undefined ? 0 : 1,
    recoverySnapshots: envelope.recoveryPointers?.snapshots?.length ?? 0,
    recoveryWorkspaceEntries: envelope.recoveryPointers?.workspaceEntries?.length ?? 0,
    idempotencyMarkers: envelope.idempotencyKey === undefined ? 0 : 1,
  };
}

export function emptyActionCommitWriteCounts(): ActionCommitWriteCounts {
  return {
    stateRecords: 0,
    events: 0,
    randomStreamRecords: 0,
    randomResultRecords: 0,
    slotMetadata: 0,
    recoverySnapshots: 0,
    recoveryWorkspaceEntries: 0,
    idempotencyMarkers: 0,
  };
}

export function actionCommitSuccess(
  envelope: ActionCommitEnvelope,
  stateRevision: number,
): ActionCommitResult {
  return {
    ok: true,
    actionId: envelope.actionId,
    ...(envelope.idempotencyKey === undefined ? {} : { idempotencyKey: envelope.idempotencyKey }),
    committed: true,
    duplicate: false,
    stateRevision,
    written: countActionCommitWrites(envelope),
  };
}

export function actionCommitDuplicate(
  envelope: ActionCommitEnvelope & { readonly idempotencyKey: IdempotencyKey },
  stateRevision: number,
): ActionCommitResult {
  return {
    ok: true,
    actionId: envelope.actionId,
    idempotencyKey: envelope.idempotencyKey,
    committed: false,
    duplicate: true,
    stateRevision,
    written: emptyActionCommitWriteCounts(),
  };
}

export function actionCommitRevisionConflict(
  envelope: ActionCommitEnvelope,
  currentRevision: number,
): ActionCommitResult {
  return {
    ok: false,
    actionId: envelope.actionId,
    ...(envelope.idempotencyKey === undefined ? {} : { idempotencyKey: envelope.idempotencyKey }),
    committed: false,
    duplicate: false,
    error: {
      code: 'revision_conflict',
      message: 'Action commit expected revision does not match the current durable slot revision.',
      currentRevision,
      ...(envelope.expectedRevision === undefined
        ? {}
        : { expectedRevision: envelope.expectedRevision }),
    },
  };
}

export function actionCommitSequenceConflict(
  envelope: ActionCommitEnvelope,
  currentRevision: number,
  expectedSequences: readonly number[],
  submittedSequences: readonly number[],
): ActionCommitResult {
  return {
    ok: false,
    actionId: envelope.actionId,
    ...(envelope.idempotencyKey === undefined ? {} : { idempotencyKey: envelope.idempotencyKey }),
    committed: false,
    duplicate: false,
    error: {
      code: 'sequence_conflict',
      message:
        'Action commit event sequences must be contiguous from the current durable revision.',
      currentRevision,
      expectedSequences,
      submittedSequences,
    },
  };
}
