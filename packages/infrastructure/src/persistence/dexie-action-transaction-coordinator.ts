import {
  actionCommitDuplicate,
  actionCommitIdempotencyConflict,
  actionCommitInvalidSlot,
  actionCommitRevisionConflict,
  actionCommitSequenceConflict,
  actionCommitSuccess,
  actionCommitValidationFailure,
  countActionCommitWrites,
  createPerSlotActionCommitQueue,
  validateActionCommitEnvelope,
  type ActionCommitEnvelope,
  type ActionCommitValidationError,
  type ActionCommitError,
  type ActionCommitResult,
  type ActionTransactionCoordinator,
  type ActionTransactionDiagnostics,
} from '@notequest/application';
import type { IdempotencyKey, SaveSlotId } from '@notequest/domain';

import { serializeCanonicalJson } from '../canonical-json';
import type { NoteQuestDexieDatabase, WorkspaceRow } from './dexie-database';
import {
  toEventRow,
  mapSlotRow,
  toRecordRow,
  toSlotRow,
  toSnapshotRow,
  toWorkspaceRow,
  validateEventRecord,
  validatePersistedRecord,
  validateSlotRecord,
  validateSnapshotRecord,
  validateWorkspaceEntry,
} from './dexie-repositories';
import {
  isSaveSlotCatalogue,
  NOTEQUEST_WORKSPACE_SLOT_CATALOGUE_KEY,
} from './save-slot-foundation';

interface IdempotencyMarkerValue {
  readonly actionId: string;
  readonly stateRevision: number;
}

export function actionCommitDexieStores(database: NoteQuestDexieDatabase): readonly unknown[] {
  return [
    database.slots,
    database.records,
    database.events,
    database.snapshots,
    database.workspace,
  ] as const;
}

export function actionCommitIdempotencyWorkspaceKey(
  slotId: SaveSlotId,
  idempotencyKey: IdempotencyKey,
): string {
  return `slot.${slotId}.actionCommit.${idempotencyKey}`;
}

function toTransactionError(cause: unknown): ActionCommitError {
  return {
    code: 'transaction_failed',
    message: 'Atomic action commit failed; no success result was returned.',
    cause,
  };
}

function toTransactionFailure(
  envelope: ActionCommitEnvelope,
  error: ActionCommitError,
): ActionCommitResult {
  return {
    ok: false,
    actionId: envelope.actionId,
    ...(envelope.idempotencyKey === undefined ? {} : { idempotencyKey: envelope.idempotencyKey }),
    committed: false,
    duplicate: false,
    error,
  };
}

function isIdempotentEnvelope(
  envelope: ActionCommitEnvelope,
): envelope is ActionCommitEnvelope & { readonly idempotencyKey: IdempotencyKey } {
  return envelope.idempotencyKey !== undefined;
}

function isIdempotencyMarkerValue(value: unknown): value is IdempotencyMarkerValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    'actionId' in value &&
    'stateRevision' in value &&
    typeof value.actionId === 'string' &&
    typeof value.stateRevision === 'number'
  );
}

function idempotencyWorkspaceEntry(
  envelope: ActionCommitEnvelope & { readonly idempotencyKey: IdempotencyKey },
  stateRevision: number,
): WorkspaceRow {
  return {
    key: actionCommitIdempotencyWorkspaceKey(envelope.slotId, envelope.idempotencyKey),
    value: { actionId: envelope.actionId, stateRevision },
  };
}

function toActionCommitValidationError(
  path: string,
  error: { readonly message: string },
): ActionCommitValidationError {
  return {
    code: 'invalid_required_write',
    path,
    message: error.message,
  };
}

function validateRequiredWrites(
  envelope: ActionCommitEnvelope,
): readonly ActionCommitValidationError[] {
  const errors: ActionCommitValidationError[] = [];

  for (const [index, record] of envelope.stateRecords.entries()) {
    const error = validatePersistedRecord(record);
    if (error !== null) {
      errors.push(toActionCommitValidationError(`stateRecords.${index}`, error));
    }
  }

  for (const [index, record] of (envelope.randomStreamRecords ?? []).entries()) {
    const error = validatePersistedRecord(record);
    if (error !== null) {
      errors.push(toActionCommitValidationError(`randomStreamRecords.${index}`, error));
    }
  }

  for (const [index, record] of (envelope.randomResultRecords ?? []).entries()) {
    const error = validatePersistedRecord(record);
    if (error !== null) {
      errors.push(toActionCommitValidationError(`randomResultRecords.${index}`, error));
    }
  }

  for (const [index, event] of envelope.events.entries()) {
    const error = validateEventRecord(event);
    if (error !== null) {
      errors.push(toActionCommitValidationError(`events.${index}`, error));
    }
  }

  if (envelope.slotMetadata !== undefined) {
    const error = validateSlotRecord(envelope.slotMetadata);
    if (error !== null) {
      errors.push(toActionCommitValidationError('slotMetadata', error));
    }
  }

  for (const [index, snapshot] of (envelope.recoveryPointers?.snapshots ?? []).entries()) {
    const error = validateSnapshotRecord(snapshot);
    if (error !== null) {
      errors.push(toActionCommitValidationError(`recoveryPointers.snapshots.${index}`, error));
    }
  }

  for (const [index, entry] of (envelope.recoveryPointers?.workspaceEntries ?? []).entries()) {
    const error = validateWorkspaceEntry(entry);
    if (error !== null) {
      errors.push(
        toActionCommitValidationError(`recoveryPointers.workspaceEntries.${index}`, error),
      );
    }
  }

  if (isIdempotentEnvelope(envelope)) {
    const error = validateWorkspaceEntry(idempotencyWorkspaceEntry(envelope, 0));
    if (error !== null) {
      errors.push(toActionCommitValidationError('idempotencyMarker', error));
    }
  }

  return errors;
}

function expectedContiguousSequences(
  currentRevision: number,
  eventCount: number,
): readonly number[] {
  return Array.from({ length: eventCount }, (_value, index) => currentRevision + index + 1);
}

function validateContiguousEventSequences(
  currentRevision: number,
  envelope: ActionCommitEnvelope,
): ActionCommitResult | null {
  const submittedSequences = envelope.events.map((event) => event.sequence);
  const expectedSequences = expectedContiguousSequences(currentRevision, envelope.events.length);
  const contiguous = expectedSequences.every(
    (expectedSequence, index) => submittedSequences[index] === expectedSequence,
  );

  return contiguous
    ? null
    : actionCommitSequenceConflict(
        envelope,
        currentRevision,
        expectedSequences,
        submittedSequences,
      );
}

export class DexieActionTransactionCoordinator implements ActionTransactionCoordinator {
  constructor(
    private readonly database: NoteQuestDexieDatabase,
    private readonly diagnostics: ActionTransactionDiagnostics = {},
    private readonly now: () => string = () => new Date().toISOString(),
  ) {}

  async commit(envelope: ActionCommitEnvelope): Promise<ActionCommitResult> {
    const validationErrors = [
      ...validateActionCommitEnvelope(envelope),
      ...validateRequiredWrites(envelope),
    ];

    if (validationErrors.length > 0) {
      return actionCommitValidationFailure(envelope, validationErrors);
    }

    const plannedWrites = countActionCommitWrites(envelope);
    this.diagnostics.transactionStarted?.(envelope, plannedWrites);

    try {
      const result = await this.database.transaction(
        'rw',
        ...actionCommitDexieStores(this.database),
        async (): Promise<ActionCommitResult> => {
          const catalogueRow = await this.database.workspace.get(
            NOTEQUEST_WORKSPACE_SLOT_CATALOGUE_KEY,
          );
          const currentSlot = await this.database.slots.get(envelope.slotId);
          if (
            catalogueRow === undefined ||
            !isSaveSlotCatalogue(catalogueRow.value) ||
            !catalogueRow.value.slotIds.includes(envelope.slotId) ||
            currentSlot === undefined
          ) {
            return actionCommitInvalidSlot(envelope);
          }

          if (isIdempotentEnvelope(envelope)) {
            const marker = await this.database.workspace.get(
              actionCommitIdempotencyWorkspaceKey(envelope.slotId, envelope.idempotencyKey),
            );

            if (marker !== undefined && isIdempotencyMarkerValue(marker.value)) {
              return marker.value.actionId === envelope.actionId
                ? actionCommitDuplicate(envelope, marker.value.stateRevision)
                : actionCommitIdempotencyConflict(
                    envelope,
                    marker.value.actionId,
                    marker.value.stateRevision,
                  );
            }
          }

          const currentRevision = currentSlot.revision;
          const latestEvent = await this.database.events
            .where('slotId')
            .equals(envelope.slotId)
            .last();
          const currentEventSequence = latestEvent?.sequence ?? 0;

          if (
            envelope.expectedRevision !== undefined &&
            envelope.expectedRevision !== currentRevision
          ) {
            return actionCommitRevisionConflict(envelope, currentRevision);
          }

          const sequenceConflict = validateContiguousEventSequences(currentEventSequence, envelope);
          if (sequenceConflict !== null) {
            return sequenceConflict;
          }

          const stateRows = [
            ...envelope.stateRecords,
            ...(envelope.randomStreamRecords ?? []),
            ...(envelope.randomResultRecords ?? []),
          ].map(toRecordRow);
          const stateRevision = currentRevision + 1;
          const snapshots = envelope.recoveryPointers?.snapshots ?? [];

          for (const [index, snapshot] of snapshots.entries()) {
            if (
              snapshot.snapshotClass === 'last-valid' &&
              snapshot.sourceRevision !== stateRevision
            ) {
              return actionCommitValidationFailure(envelope, [
                {
                  code: 'invalid_required_write',
                  path: `recoveryPointers.snapshots.${index}.sourceRevision`,
                  message: 'A last-valid snapshot must describe the revision being committed.',
                },
              ]);
            }
            const previous = await this.database.snapshots.get([
              envelope.slotId,
              snapshot.snapshotClass,
            ]);
            if (previous !== undefined && snapshot.sourceRevision <= previous.sourceRevision) {
              return actionCommitValidationFailure(envelope, [
                {
                  code: 'invalid_required_write',
                  path: `recoveryPointers.snapshots.${index}.sourceRevision`,
                  message: 'A retained snapshot must have a newer source revision.',
                },
              ]);
            }
          }

          if (stateRows.length > 0) {
            await this.database.records.bulkPut(stateRows);
          }

          if (envelope.events.length > 0) {
            await this.database.events.bulkAdd(envelope.events.map(toEventRow));
          }

          if (snapshots.length > 0) {
            await this.database.snapshots.bulkPut(snapshots.map(toSnapshotRow));
            for (const snapshot of snapshots) {
              const durable = await this.database.snapshots.get([
                envelope.slotId,
                snapshot.snapshotClass,
              ]);
              if (
                durable === undefined ||
                serializeCanonicalJson(durable) !== serializeCanonicalJson(toSnapshotRow(snapshot))
              ) {
                throw new Error('Snapshot durable read-back validation failed.');
              }
            }
          }

          const workspaceEntries = envelope.recoveryPointers?.workspaceEntries ?? [];
          if (workspaceEntries.length > 0) {
            await this.database.workspace.bulkPut(workspaceEntries.map(toWorkspaceRow));
          }

          const currentSlotMetadata = mapSlotRow(currentSlot);
          const retainedLastValid = snapshots.some(
            (snapshot) => snapshot.snapshotClass === 'last-valid',
          );
          await this.database.slots.put(
            toSlotRow({
              ...(envelope.slotMetadata ?? currentSlotMetadata),
              slotId: currentSlotMetadata.slotId,
              slotIndex: currentSlotMetadata.slotIndex,
              createdAt: currentSlotMetadata.createdAt,
              revision: stateRevision,
              updatedAt: this.now(),
              ...(retainedLastValid
                ? {
                    lastValidSnapshotId: envelope.slotMetadata?.lastValidSnapshotId ?? 'last-valid',
                    recoveryAvailable: true,
                  }
                : {}),
            }),
          );

          if (isIdempotentEnvelope(envelope)) {
            await this.database.workspace.put(idempotencyWorkspaceEntry(envelope, stateRevision));
          }

          return actionCommitSuccess(envelope, stateRevision);
        },
      );

      if (result.ok && result.duplicate) {
        this.diagnostics.transactionDuplicate?.(envelope, result.stateRevision);
      } else if (result.ok) {
        this.diagnostics.transactionCommitted?.(envelope, plannedWrites);
      } else {
        this.diagnostics.transactionAborted?.(envelope, result.error);
      }

      return result;
    } catch (cause) {
      const error = toTransactionError(cause);
      this.diagnostics.transactionAborted?.(envelope, error);
      return toTransactionFailure(envelope, error);
    }
  }
}

export function createDexieActionTransactionCoordinator(
  database: NoteQuestDexieDatabase,
  diagnostics: ActionTransactionDiagnostics = {},
  now?: () => string,
): ActionTransactionCoordinator {
  return createPerSlotActionCommitQueue(
    new DexieActionTransactionCoordinator(database, diagnostics, now),
  );
}
