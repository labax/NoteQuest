import type { SaveSlotId } from '@notequest/domain';

import type { RepositoryError, RepositoryResult, SlotRecord } from './repositories.ts';

export type SaveSlotOperationErrorCode =
  RepositoryError['code'] | 'invalid_slot' | 'revision_conflict';

export interface SaveSlotOperationError extends Omit<RepositoryError, 'code'> {
  readonly code: SaveSlotOperationErrorCode;
  readonly currentRevision?: number;
  readonly expectedRevision?: number;
}

export type SaveSlotOperationResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: SaveSlotOperationError };

export interface SaveSlotSelection {
  readonly selectedSlotId: SaveSlotId;
  readonly selectedAt: string;
  readonly slot: SlotRecord;
}

export interface SaveSlotMetadataUpdate {
  readonly displayName: string;
  readonly expectedRevision: number;
}

/** Application-facing boundary for the future save-selection shell. */
export interface SaveSlotService {
  list(): Promise<RepositoryResult<readonly SlotRecord[]>>;
  lookup(slotId: SaveSlotId): Promise<SaveSlotOperationResult<SlotRecord>>;
  select(slotId: SaveSlotId): Promise<SaveSlotOperationResult<SaveSlotSelection>>;
  updateMetadata(
    slotId: SaveSlotId,
    update: SaveSlotMetadataUpdate,
  ): Promise<SaveSlotOperationResult<SlotRecord>>;
}
