import {
  repositoryFailure,
  repositorySuccess,
  type RepositoryResult,
  type SaveSlotOperationResult,
  type SaveSlotSelection,
  type SaveSlotService,
  type SlotRecord,
} from '@notequest/application';
import type { SaveSlotId } from '@notequest/domain';

import type { NoteQuestDexieDatabase, SlotRow, WorkspaceRow } from './dexie-database';
import { mapSlotRow, toSlotRow, validateSlotRecord } from './dexie-repositories';
import {
  NOTEQUEST_SLOT_IDS,
  NOTEQUEST_WORKSPACE_SLOT_CATALOGUE_KEY,
  type SaveSlotCatalogue,
} from './save-slot-foundation';

export const NOTEQUEST_SELECTED_SLOT_KEY = 'workspace.local.selectedSlot';

function invalidSlot(slotId: SaveSlotId): SaveSlotOperationResult<never> {
  return {
    ok: false,
    error: {
      code: 'invalid_slot',
      entity: 'slot',
      message: `Slot ${slotId} is not part of this local workspace.`,
    },
  };
}

function isCatalogue(value: unknown): value is SaveSlotCatalogue {
  return (
    typeof value === 'object' &&
    value !== null &&
    'slotIds' in value &&
    Array.isArray(value.slotIds) &&
    value.slotIds.length === 3 &&
    value.slotIds.every((slotId, index) => slotId === NOTEQUEST_SLOT_IDS[index])
  );
}

function storageFailure(message: string, cause: unknown): SaveSlotOperationResult<never> {
  return {
    ok: false,
    error: { code: 'storage_failure', entity: 'slot', message, cause },
  };
}

export class DexieSaveSlotService implements SaveSlotService {
  constructor(
    private readonly database: NoteQuestDexieDatabase,
    private readonly now: () => string = () => new Date().toISOString(),
  ) {}

  private async catalogue(): Promise<SaveSlotCatalogue | null> {
    const row = await this.database.workspace.get(NOTEQUEST_WORKSPACE_SLOT_CATALOGUE_KEY);
    return row !== undefined && isCatalogue(row.value) ? row.value : null;
  }

  private async scopedRow(slotId: SaveSlotId): Promise<SlotRow | null> {
    const catalogue = await this.catalogue();
    if (catalogue === null || !catalogue.slotIds.includes(slotId)) return null;
    return (await this.database.slots.get(slotId)) ?? null;
  }

  async list(): Promise<RepositoryResult<readonly SlotRecord[]>> {
    try {
      const catalogue = await this.catalogue();
      if (catalogue === null) {
        return repositoryFailure({
          code: 'invalid_record',
          entity: 'slot catalogue',
          message: 'The fixed three-slot catalogue is missing or invalid.',
        });
      }
      const rows = await Promise.all(
        catalogue.slotIds.map((slotId) => this.database.slots.get(slotId)),
      );
      if (rows.some((row) => row === undefined)) {
        return repositoryFailure({
          code: 'invalid_record',
          entity: 'slot catalogue',
          message: 'The fixed three-slot catalogue references a missing slot.',
        });
      }
      return repositorySuccess(
        (rows as SlotRow[]).map(mapSlotRow).sort((left, right) => left.slotIndex - right.slotIndex),
      );
    } catch (cause) {
      return repositoryFailure({
        code: 'read_failure',
        entity: 'slot catalogue',
        message: 'The save-slot catalogue could not be read.',
        cause,
      });
    }
  }

  async lookup(slotId: SaveSlotId): Promise<SaveSlotOperationResult<SlotRecord>> {
    try {
      const row = await this.scopedRow(slotId);
      return row === null ? invalidSlot(slotId) : { ok: true, value: mapSlotRow(row) };
    } catch (cause) {
      return storageFailure('The selected slot could not be read.', cause);
    }
  }

  async select(slotId: SaveSlotId): Promise<SaveSlotOperationResult<SaveSlotSelection>> {
    try {
      return await this.database.transaction(
        'rw',
        this.database.workspace,
        this.database.slots,
        async () => {
          const row = await this.scopedRow(slotId);
          if (row === null) return invalidSlot(slotId);

          const selectedAt = this.now();
          const selection: SaveSlotSelection = {
            selectedSlotId: slotId,
            selectedAt,
            slot: mapSlotRow(row),
          };
          const workspaceRow: WorkspaceRow = {
            key: NOTEQUEST_SELECTED_SLOT_KEY,
            value: { selectedSlotId: slotId, selectedAt },
            updatedAt: selectedAt,
          };
          await this.database.workspace.put(workspaceRow);
          return { ok: true, value: selection };
        },
      );
    } catch (cause) {
      return storageFailure('The selected slot could not be persisted.', cause);
    }
  }

  async updateMetadata(
    slotId: SaveSlotId,
    update: { readonly displayName: string; readonly expectedRevision: number },
  ): Promise<SaveSlotOperationResult<SlotRecord>> {
    try {
      return await this.database.transaction(
        'rw',
        this.database.workspace,
        this.database.slots,
        async () => {
          const row = await this.scopedRow(slotId);
          if (row === null) return invalidSlot(slotId);
          if (row.revision !== update.expectedRevision) {
            return {
              ok: false,
              error: {
                code: 'revision_conflict',
                entity: 'slot',
                message: 'Slot metadata was not updated because the committed revision changed.',
                currentRevision: row.revision,
                expectedRevision: update.expectedRevision,
              },
            };
          }

          const updated: SlotRecord = {
            ...mapSlotRow(row),
            displayName: update.displayName.trim(),
            updatedAt: this.now(),
          };
          const validationError = validateSlotRecord(updated);
          if (validationError !== null) return { ok: false, error: validationError };

          await this.database.slots.put(toSlotRow(updated));
          return { ok: true, value: updated };
        },
      );
    } catch (cause) {
      return storageFailure('Slot metadata was not updated.', cause);
    }
  }
}

export function createDexieSaveSlotService(
  database: NoteQuestDexieDatabase,
  now?: () => string,
): SaveSlotService {
  return new DexieSaveSlotService(database, now);
}
