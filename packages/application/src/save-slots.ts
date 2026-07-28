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

/** Every shell state is modelled here, even when its signal is transient and not yet emitted. */
export type SaveSlotCapabilityState =
  | 'empty'
  | 'valid'
  | 'recoverable'
  | 'invalid'
  | 'incompatible'
  | 'migrating'
  | 'saving'
  | 'saved'
  | 'failed'
  | 'storage-limited';

export type SaveSlotOperationalState = Extract<
  SaveSlotCapabilityState,
  'saving' | 'saved' | 'failed' | 'storage-limited'
>;

export interface SaveSlotCapability {
  readonly state: SaveSlotCapabilityState;
  readonly usable: boolean;
  readonly recoveryAvailable: boolean;
  readonly destination: 'adventurer-creation' | 'town' | 'data';
  readonly actionLabel: string;
  readonly summary: string;
}

/**
 * Application-owned projection for shell decisions. UI callers never infer safety from raw rows.
 * Operational state is optional until the persistence operation-status port is implemented.
 */
export function describeSaveSlotCapability(
  slot: SlotRecord,
  operationalState?: SaveSlotOperationalState,
  supportedSchemaVersion = 1,
): SaveSlotCapability {
  const state: SaveSlotCapabilityState =
    operationalState ??
    (slot.status === 'migrating'
      ? 'migrating'
      : slot.schemaVersion !== null && slot.schemaVersion > supportedSchemaVersion
        ? 'incompatible'
        : slot.recoveryAvailable && slot.integrityStatus === 'invalid'
          ? 'recoverable'
          : slot.integrityStatus === 'invalid' || slot.status === 'isolated'
            ? 'invalid'
            : slot.status === 'empty'
              ? 'empty'
              : 'valid');

  const presentations: Record<SaveSlotCapabilityState, Omit<SaveSlotCapability, 'state'>> = {
    empty: {
      usable: true,
      recoveryAvailable: false,
      destination: 'adventurer-creation',
      actionLabel: 'Start new game',
      summary: 'Empty — no local adventure yet.',
    },
    valid: {
      usable: true,
      recoveryAvailable: slot.recoveryAvailable,
      destination: 'town',
      actionLabel: 'Continue',
      summary: 'Ready — local data is valid.',
    },
    saved: {
      usable: true,
      recoveryAvailable: slot.recoveryAvailable,
      destination: 'town',
      actionLabel: 'Continue',
      summary: 'Saved — the latest write is durable.',
    },
    saving: {
      usable: false,
      recoveryAvailable: slot.recoveryAvailable,
      destination: 'data',
      actionLabel: 'Saving…',
      summary: 'Saving — wait for the durable result.',
    },
    recoverable: {
      usable: false,
      recoveryAvailable: true,
      destination: 'data',
      actionLabel: 'Review recovery',
      summary: 'Recovery available — current data will not be reset.',
    },
    invalid: {
      usable: false,
      recoveryAvailable: false,
      destination: 'data',
      actionLabel: 'Review blocked slot',
      summary: 'Invalid — this slot is isolated to protect its data.',
    },
    incompatible: {
      usable: false,
      recoveryAvailable: slot.recoveryAvailable,
      destination: 'data',
      actionLabel: 'Review compatibility',
      summary: 'Incompatible — this app cannot safely open the slot.',
    },
    migrating: {
      usable: false,
      recoveryAvailable: slot.recoveryAvailable,
      destination: 'data',
      actionLabel: 'Review migration',
      summary: 'Migrating — gameplay remains blocked until validation completes.',
    },
    failed: {
      usable: false,
      recoveryAvailable: slot.recoveryAvailable,
      destination: 'data',
      actionLabel: slot.recoveryAvailable ? 'Review recovery' : 'Review save failure',
      summary: 'Save failed — no successful write is being claimed.',
    },
    'storage-limited': {
      usable: false,
      recoveryAvailable: slot.recoveryAvailable,
      destination: 'data',
      actionLabel: 'Review storage options',
      summary: 'Storage limited — further writes may be unsafe.',
    },
  };
  return { state, ...presentations[state] };
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
