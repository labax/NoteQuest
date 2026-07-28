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
  | 'creating'
  | 'importing'
  | 'resetting'
  | 'unchecked'
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

/** Read-only operation signal boundary; absence means no transient claim can be made. */
export interface SaveSlotOperationStatusPort {
  get(slotId: SaveSlotId): SaveSlotOperationalState | undefined;
}

export const PROTECTED_LAST_VALID_SNAPSHOT_ID = 'last-valid';

/** Recovery is advertised only when both M4 slot signals identify the protected snapshot. */
export function hasProtectedLastValidRecovery(slot: SlotRecord): boolean {
  return (
    slot.recoveryAvailable === true && slot.lastValidSnapshotId === PROTECTED_LAST_VALID_SNAPSHOT_ID
  );
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
  const recoveryAvailable = hasProtectedLastValidRecovery(slot);
  const durableState = durableCapabilityState(slot, supportedSchemaVersion);
  // Operational signals may make a safe slot temporarily less capable, never make unsafe data safe.
  const state: SaveSlotCapabilityState =
    operationalState !== undefined && (durableState === 'valid' || durableState === 'empty')
      ? operationalState === 'saved' && durableState === 'empty'
        ? durableState
        : operationalState
      : durableState;

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
      recoveryAvailable,
      destination: 'town',
      actionLabel: 'Continue',
      summary: 'Ready — local data is valid.',
    },
    saved: {
      usable: true,
      recoveryAvailable,
      destination: 'town',
      actionLabel: 'Continue',
      summary: 'Saved — the latest write is durable.',
    },
    saving: {
      usable: false,
      recoveryAvailable,
      destination: 'data',
      actionLabel: 'Saving…',
      summary: 'Saving — wait for the durable result.',
    },
    recoverable: {
      usable: false,
      recoveryAvailable,
      destination: 'data',
      actionLabel: 'Review recovery',
      summary: 'Recovery available — current data will not be reset.',
    },
    invalid: {
      usable: false,
      recoveryAvailable,
      destination: 'data',
      actionLabel: 'Review blocked slot',
      summary: 'Invalid — this slot is isolated to protect its data.',
    },
    incompatible: {
      usable: false,
      recoveryAvailable,
      destination: 'data',
      actionLabel: 'Review compatibility',
      summary: 'Incompatible — this app cannot safely open the slot.',
    },
    creating: {
      usable: false,
      recoveryAvailable,
      destination: 'data',
      actionLabel: 'Review blocked slot',
      summary: 'Creating — setup is incomplete and play remains blocked.',
    },
    importing: {
      usable: false,
      recoveryAvailable,
      destination: 'data',
      actionLabel: 'Review blocked slot',
      summary: 'Importing — validation is incomplete and play remains blocked.',
    },
    resetting: {
      usable: false,
      recoveryAvailable,
      destination: 'data',
      actionLabel: 'Review blocked slot',
      summary: 'Resetting — the administrative operation is incomplete.',
    },
    unchecked: {
      usable: false,
      recoveryAvailable,
      destination: 'data',
      actionLabel: 'Review blocked slot',
      summary: 'Not checked — this non-empty slot is not verified safe to open.',
    },
    migrating: {
      usable: false,
      recoveryAvailable,
      destination: 'data',
      actionLabel: 'Review migration',
      summary: 'Migrating — gameplay remains blocked until validation completes.',
    },
    failed: {
      usable: false,
      recoveryAvailable,
      destination: 'data',
      actionLabel: recoveryAvailable ? 'Review recovery' : 'Review save failure',
      summary: 'Save failed — no successful write is being claimed.',
    },
    'storage-limited': {
      usable: false,
      recoveryAvailable,
      destination: 'data',
      actionLabel: 'Review storage options',
      summary: 'Storage limited — further writes may be unsafe.',
    },
  };
  return { state, ...presentations[state] };
}

function durableCapabilityState(
  slot: SlotRecord,
  supportedSchemaVersion: number,
): Exclude<SaveSlotCapabilityState, SaveSlotOperationalState> {
  if (slot.status === 'empty') {
    const genuinelyEmpty =
      slot.revision === 0 &&
      slot.schemaVersion === null &&
      slot.rulesVersion === null &&
      slot.contentVersion === null &&
      slot.currentSnapshotId === null &&
      slot.lastValidSnapshotId === null &&
      !slot.recoveryAvailable &&
      slot.integrityStatus === 'not_checked';
    return genuinelyEmpty ? 'empty' : 'invalid';
  }
  if (slot.status === 'creating') return 'creating';
  if (slot.status === 'importing') return 'importing';
  if (slot.status === 'resetting') return 'resetting';
  if (slot.status === 'migrating') return 'migrating';
  if (slot.schemaVersion !== supportedSchemaVersion) return 'incompatible';
  if (hasProtectedLastValidRecovery(slot) && slot.integrityStatus === 'invalid') {
    return 'recoverable';
  }
  if (slot.status === 'isolated' || slot.integrityStatus === 'invalid') return 'invalid';
  if (slot.integrityStatus !== 'valid') return 'unchecked';
  if ((slot.status === 'ready' || slot.status === 'active') && slot.currentSnapshotId !== null) {
    return 'valid';
  }
  return 'invalid';
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
