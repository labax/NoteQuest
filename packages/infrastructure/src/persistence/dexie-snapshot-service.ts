import type { SaveSlotId } from '@notequest/domain';
import Dexie from 'dexie';

import type { NoteQuestDexieDatabase, RecordRow, SnapshotRow } from './dexie-database';

export const NOTEQUEST_PROTECTED_SNAPSHOT_CLASSES = [
  'last-valid',
  'pre-migration',
  'pre-import',
  'pre-reset',
] as const;

export type ProtectedSnapshotClass = (typeof NOTEQUEST_PROTECTED_SNAPSHOT_CLASSES)[number];

/** Pure, synchronous validation; transaction scopes must not await external work. */
export type SnapshotValidation = (snapshot: Readonly<SnapshotRow>) => boolean;

export interface SnapshotSelectionRequest {
  readonly snapshotClass: ProtectedSnapshotClass;
  readonly supportedSchemaVersions: readonly number[];
  readonly validate: SnapshotValidation;
}

export interface SelectedRecoverySnapshot {
  readonly snapshot: SnapshotRow;
  readonly slotRevision: number;
}

export interface SnapshotRecoveryPackage {
  readonly records: readonly RecordRow[];
}

export interface SnapshotRestoreRequest extends SnapshotSelectionRequest {
  readonly restoredCurrentSnapshotId: string;
  readonly preserveInvalidCurrent: boolean;
}

export interface SnapshotRestoreResult {
  readonly snapshotClass: ProtectedSnapshotClass;
  readonly sourceRevision: number;
  readonly committedRevision: number;
  readonly preservedStageId: string | null;
}

export type SnapshotWriteRequest = Readonly<SnapshotRow> & {
  /** Required when replacing a pre-migration snapshot after its protected operation. */
  readonly priorOperationVerified?: boolean;
};

export type SnapshotServiceErrorCode =
  | 'invalid_snapshot'
  | 'slot_not_found'
  | 'snapshot_not_found'
  | 'incompatible_snapshot'
  | 'stale_snapshot'
  | 'replacement_not_verified'
  | 'storage_failure';

export type SnapshotServiceResult<T> =
  | { readonly ok: true; readonly value: T }
  | {
      readonly ok: false;
      readonly error: { readonly code: SnapshotServiceErrorCode; readonly message: string };
    };

class SnapshotValidationAbort extends Error {
  constructor(
    readonly code: Exclude<SnapshotServiceErrorCode, 'storage_failure'>,
    message: string,
  ) {
    super(message);
  }
}

function validateMetadata(snapshot: SnapshotRow): string | null {
  if (snapshot.slotId.trim() === '') return 'slotId is required.';
  if (!NOTEQUEST_PROTECTED_SNAPSHOT_CLASSES.includes(snapshot.snapshotClass)) {
    return 'snapshotClass is not a protected recovery class.';
  }
  if (!Number.isSafeInteger(snapshot.schemaVersion) || snapshot.schemaVersion < 1) {
    return 'schemaVersion must be a positive safe integer.';
  }
  if (!Number.isSafeInteger(snapshot.sourceRevision) || snapshot.sourceRevision < 0) {
    return 'sourceRevision must be a non-negative safe integer.';
  }
  if (Number.isNaN(Date.parse(snapshot.createdAt)))
    return 'createdAt must be an ISO-compatible date.';
  if (snapshot.body === undefined) return 'body is required.';
  return null;
}

/**
 * Maintains the bounded, per-slot protected snapshot set. Replacement and the
 * last-valid pointer swap share one transaction, so validation failure rolls
 * the attempted write back without exposing or deleting the prior snapshot.
 */
export class DexieSnapshotService {
  constructor(
    private readonly database: NoteQuestDexieDatabase,
    private readonly now: () => string = () => new Date().toISOString(),
  ) {}

  private failedSourceStageId(slotId: SaveSlotId): string {
    return `slot.${slotId}.recovery-failed-source`;
  }

  async retainValidated(
    request: SnapshotWriteRequest,
    validate: SnapshotValidation,
  ): Promise<SnapshotServiceResult<SnapshotRow>> {
    const snapshot: SnapshotRow = {
      slotId: request.slotId,
      snapshotClass: request.snapshotClass,
      createdAt: request.createdAt,
      schemaVersion: request.schemaVersion,
      sourceRevision: request.sourceRevision,
      body: structuredClone(request.body),
    };
    const metadataError = validateMetadata(snapshot);
    if (metadataError !== null) {
      return { ok: false, error: { code: 'invalid_snapshot', message: metadataError } };
    }

    try {
      const value = await this.database.transaction(
        'rw',
        this.database.slots,
        this.database.snapshots,
        async () => {
          const slot = await this.database.slots.get(snapshot.slotId);
          if (slot === undefined) {
            throw new SnapshotValidationAbort(
              'slot_not_found',
              'The snapshot slot does not exist.',
            );
          }
          if (snapshot.sourceRevision > slot.revision) {
            throw new SnapshotValidationAbort(
              'invalid_snapshot',
              'A protected snapshot cannot reference an uncommitted slot revision.',
            );
          }
          const key: [string, ProtectedSnapshotClass] = [snapshot.slotId, snapshot.snapshotClass];
          const previous = await this.database.snapshots.get(key);
          if (previous !== undefined && snapshot.sourceRevision <= previous.sourceRevision) {
            throw new SnapshotValidationAbort(
              'stale_snapshot',
              'A replacement snapshot must have a newer source revision.',
            );
          }
          if (
            previous !== undefined &&
            snapshot.snapshotClass === 'pre-migration' &&
            request.priorOperationVerified !== true
          ) {
            throw new SnapshotValidationAbort(
              'replacement_not_verified',
              'The prior migration must be verified before replacing its snapshot.',
            );
          }

          await this.database.snapshots.put(snapshot);
          const durable = await this.database.snapshots.get(key);
          if (durable === undefined || !validate(structuredClone(durable))) {
            throw new SnapshotValidationAbort(
              'invalid_snapshot',
              'The stored snapshot did not pass durable validation.',
            );
          }

          if (snapshot.snapshotClass === 'last-valid') {
            await this.database.slots.put({
              ...slot,
              lastValidSnapshotId: snapshot.snapshotClass,
              recoveryAvailable: true,
            });
          }
          return structuredClone(durable);
        },
      );
      return { ok: true, value };
    } catch (cause) {
      if (cause instanceof SnapshotValidationAbort) {
        return { ok: false, error: { code: cause.code, message: cause.message } };
      }
      return {
        ok: false,
        error: {
          code: 'storage_failure',
          message: 'The protected snapshot could not be retained.',
        },
      };
    }
  }

  async read(
    slotId: SaveSlotId,
    snapshotClass: ProtectedSnapshotClass,
  ): Promise<SnapshotServiceResult<SnapshotRow>> {
    try {
      const snapshot = await this.database.snapshots.get([slotId, snapshotClass]);
      return snapshot === undefined
        ? { ok: false, error: { code: 'snapshot_not_found', message: 'Snapshot was not found.' } }
        : { ok: true, value: structuredClone(snapshot) };
    } catch {
      return {
        ok: false,
        error: { code: 'storage_failure', message: 'The protected snapshot could not be read.' },
      };
    }
  }

  /**
   * Selects one recovery source without mutating the slot. The compound lookup
   * establishes slot ownership; compatibility and complete-state validation
   * are repeated at selection time rather than trusting an old recovery flag.
   */
  async selectForRestore(
    slotId: SaveSlotId,
    request: SnapshotSelectionRequest,
  ): Promise<SnapshotServiceResult<SelectedRecoverySnapshot>> {
    try {
      return await this.database.transaction(
        'r',
        this.database.slots,
        this.database.snapshots,
        async () => {
          const slot = await this.database.slots.get(slotId);
          if (slot === undefined) {
            return {
              ok: false,
              error: { code: 'slot_not_found', message: 'The snapshot slot does not exist.' },
            };
          }
          const snapshot = await this.database.snapshots.get([slotId, request.snapshotClass]);
          if (snapshot === undefined) {
            return {
              ok: false,
              error: { code: 'snapshot_not_found', message: 'Snapshot was not found.' },
            };
          }
          if (!request.supportedSchemaVersions.includes(snapshot.schemaVersion)) {
            return {
              ok: false,
              error: {
                code: 'incompatible_snapshot',
                message: 'The snapshot schema is not supported by this application.',
              },
            };
          }
          if (
            snapshot.sourceRevision > slot.revision ||
            !request.validate(structuredClone(snapshot))
          ) {
            return {
              ok: false,
              error: {
                code: 'invalid_snapshot',
                message: 'The selected snapshot did not pass recovery validation.',
              },
            };
          }
          return {
            ok: true,
            value: { snapshot: structuredClone(snapshot), slotRevision: slot.revision },
          };
        },
      );
    } catch {
      return {
        ok: false,
        error: { code: 'storage_failure', message: 'The recovery snapshot could not be selected.' },
      };
    }
  }

  async listRecoverable(
    slotId: SaveSlotId,
    eligibility: Omit<SnapshotSelectionRequest, 'snapshotClass'>,
  ): Promise<SnapshotServiceResult<readonly SnapshotRow[]>> {
    try {
      const selections = await Promise.all(
        NOTEQUEST_PROTECTED_SNAPSHOT_CLASSES.map((snapshotClass) =>
          this.selectForRestore(slotId, { ...eligibility, snapshotClass }),
        ),
      );
      const slotFailure = selections.find(
        (selection) => !selection.ok && selection.error.code === 'slot_not_found',
      );
      if (slotFailure !== undefined && !slotFailure.ok) return slotFailure;
      return {
        ok: true,
        value: selections.flatMap((selection) => (selection.ok ? [selection.value.snapshot] : [])),
      };
    } catch {
      return {
        ok: false,
        error: { code: 'storage_failure', message: 'Recoverable snapshots could not be listed.' },
      };
    }
  }

  /**
   * Atomically activates a complete record package. When requested, the
   * invalid current records and metadata are first retained in one bounded,
   * inactive staging row for diagnosis or a later recovery workflow.
   */
  async restore(
    slotId: SaveSlotId,
    request: SnapshotRestoreRequest,
  ): Promise<SnapshotServiceResult<SnapshotRestoreResult>> {
    if (request.restoredCurrentSnapshotId.trim() === '') {
      return {
        ok: false,
        error: { code: 'invalid_snapshot', message: 'restoredCurrentSnapshotId is required.' },
      };
    }
    try {
      return await this.database.transaction(
        'rw',
        this.database.slots,
        this.database.records,
        this.database.snapshots,
        this.database.staging,
        async () => {
          const slot = await this.database.slots.get(slotId);
          if (slot === undefined) {
            return {
              ok: false,
              error: { code: 'slot_not_found', message: 'The snapshot slot does not exist.' },
            };
          }
          const snapshot = await this.database.snapshots.get([slotId, request.snapshotClass]);
          if (snapshot === undefined) {
            return {
              ok: false,
              error: { code: 'snapshot_not_found', message: 'Snapshot was not found.' },
            };
          }
          if (!request.supportedSchemaVersions.includes(snapshot.schemaVersion)) {
            return {
              ok: false,
              error: {
                code: 'incompatible_snapshot',
                message: 'The snapshot schema is not supported by this application.',
              },
            };
          }
          if (
            snapshot.sourceRevision > slot.revision ||
            !request.validate(structuredClone(snapshot))
          ) {
            return {
              ok: false,
              error: {
                code: 'invalid_snapshot',
                message: 'The selected snapshot did not pass recovery validation.',
              },
            };
          }
          const recoveryPackage = snapshot.body as Partial<SnapshotRecoveryPackage>;
          if (!Array.isArray(recoveryPackage.records)) {
            return {
              ok: false,
              error: {
                code: 'invalid_snapshot',
                message: 'The selected snapshot does not contain a complete record package.',
              },
            };
          }
          const restoredRecords = structuredClone(recoveryPackage.records);
          const recordKeys = new Set<string>();
          for (const record of restoredRecords) {
            const key = `${record.recordType}\u0000${record.recordId}`;
            if (
              record.slotId !== slotId ||
              record.recordType.trim() === '' ||
              record.recordId.trim() === '' ||
              recordKeys.has(key)
            ) {
              return {
                ok: false,
                error: {
                  code: 'invalid_snapshot',
                  message: 'The recovery package contains invalid or cross-slot records.',
                },
              };
            }
            recordKeys.add(key);
          }

          const currentRecords = await this.database.records
            .where('[slotId+updatedAt]')
            .between([slotId, Dexie.minKey], [slotId, Dexie.maxKey])
            .toArray();
          const restoredAt = this.now();
          const preservedStageId = request.preserveInvalidCurrent
            ? this.failedSourceStageId(slotId)
            : null;
          if (preservedStageId !== null) {
            await this.database.staging.put({
              stageId: preservedStageId,
              targetSlotId: slotId,
              createdAt: restoredAt,
              stageType: 'recovery-failed-source',
              status: 'preserved',
              body: { slot: structuredClone(slot), records: structuredClone(currentRecords) },
            });
          }

          await this.database.records.bulkDelete(
            currentRecords.map((record): [string, string, string] => [
              record.slotId,
              record.recordType,
              record.recordId,
            ]),
          );
          if (restoredRecords.length > 0) await this.database.records.bulkPut(restoredRecords);
          const committedRevision = slot.revision + 1;
          await this.database.slots.put({
            ...slot,
            revision: committedRevision,
            updatedAt: restoredAt,
            status: 'ready',
            schemaVersion: snapshot.schemaVersion,
            currentSnapshotId: request.restoredCurrentSnapshotId,
            recoveryAvailable: true,
            integrityStatus: 'valid',
          });
          return {
            ok: true,
            value: {
              snapshotClass: snapshot.snapshotClass,
              sourceRevision: snapshot.sourceRevision,
              committedRevision,
              preservedStageId,
            },
          };
        },
      );
    } catch {
      return {
        ok: false,
        error: { code: 'storage_failure', message: 'The recovery snapshot could not be restored.' },
      };
    }
  }
}
