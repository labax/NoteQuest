import type { RepositoryResult, SlotRecord, WorkspaceEntry } from '@notequest/application';
import { repositoryFailure, repositorySuccess } from '@notequest/application';
import type { SaveSlotId } from '@notequest/domain';

import type { NoteQuestDexieDatabase } from './dexie-database';
import { mapSlotRow, toSlotRow } from './dexie-repositories';

export const NOTEQUEST_SLOT_IDS = [
  '00000000-0000-4000-8000-000000000001' as SaveSlotId,
  '00000000-0000-4000-8000-000000000002' as SaveSlotId,
  '00000000-0000-4000-8000-000000000003' as SaveSlotId,
] as const;

export const NOTEQUEST_WORKSPACE_SLOT_CATALOGUE_KEY = 'workspace.local.saveSlots';

export interface SaveSlotCatalogue {
  readonly workspaceId: 'workspace.local';
  readonly workspaceSchemaVersion: 1;
  readonly slotIds: readonly [SaveSlotId, SaveSlotId, SaveSlotId];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SaveSlotFoundation {
  readonly catalogue: SaveSlotCatalogue;
  readonly slots: readonly [SlotRecord, SlotRecord, SlotRecord];
}

function emptySlot(slotIndex: 1 | 2 | 3, timestamp: string): SlotRecord {
  return {
    slotId: NOTEQUEST_SLOT_IDS[slotIndex - 1]!,
    slotIndex,
    displayName: `Save ${slotIndex}`,
    revision: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
    status: 'empty',
    schemaVersion: null,
    rulesVersion: null,
    contentVersion: null,
    currentSnapshotId: null,
    lastValidSnapshotId: null,
    recoveryAvailable: false,
    integrityStatus: 'not_checked',
  };
}

function isCatalogue(value: unknown): value is SaveSlotCatalogue {
  if (typeof value !== 'object' || value === null || !('slotIds' in value)) return false;
  const slotIds = value.slotIds;
  return (
    Array.isArray(slotIds) &&
    slotIds.length === 3 &&
    slotIds.every((slotId, index) => slotId === NOTEQUEST_SLOT_IDS[index])
  );
}

/** Creates the fixed catalogue once and repairs only missing empty slot records. */
export async function initializeSaveSlotFoundation(
  database: NoteQuestDexieDatabase,
  now: () => string = () => new Date().toISOString(),
): Promise<RepositoryResult<SaveSlotFoundation>> {
  try {
    return await database.transaction('rw', database.workspace, database.slots, async () => {
      const existingRows = await database.slots.toArray();
      if (existingRows.some((row) => !NOTEQUEST_SLOT_IDS.some((slotId) => slotId === row.slotId))) {
        return repositoryFailure({
          code: 'invalid_record',
          entity: 'slot catalogue',
          message: 'The local workspace contains a slot outside the fixed three-slot catalogue.',
        });
      }

      const timestamp = now();
      const workspaceRow = await database.workspace.get(NOTEQUEST_WORKSPACE_SLOT_CATALOGUE_KEY);
      if (workspaceRow !== undefined && !isCatalogue(workspaceRow.value)) {
        return repositoryFailure({
          code: 'invalid_record',
          entity: 'slot catalogue',
          message: 'The persisted save-slot catalogue is invalid.',
        });
      }

      const createdAt =
        workspaceRow?.value && isCatalogue(workspaceRow.value)
          ? workspaceRow.value.createdAt
          : timestamp;
      const slots = ([1, 2, 3] as const).map(
        (index) =>
          existingRows.find((row) => row.slotId === NOTEQUEST_SLOT_IDS[index - 1]) ??
          toSlotRow(emptySlot(index, timestamp)),
      );
      await database.slots.bulkPut(slots);

      const catalogue: SaveSlotCatalogue = {
        workspaceId: 'workspace.local',
        workspaceSchemaVersion: 1,
        slotIds: NOTEQUEST_SLOT_IDS,
        createdAt,
        updatedAt: workspaceRow?.updatedAt ?? timestamp,
      };
      const entry: WorkspaceEntry = {
        key: NOTEQUEST_WORKSPACE_SLOT_CATALOGUE_KEY,
        value: catalogue,
        updatedAt: catalogue.updatedAt,
      };
      if (workspaceRow === undefined) await database.workspace.put(entry);

      return repositorySuccess({
        catalogue,
        slots: slots.map(mapSlotRow) as unknown as SaveSlotFoundation['slots'],
      });
    });
  } catch (cause) {
    return repositoryFailure({
      code: 'storage_failure',
      entity: 'slot catalogue',
      message: 'The three-slot foundation could not be initialized.',
      cause,
    });
  }
}
