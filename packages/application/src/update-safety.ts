import type { SaveSlotId } from '@notequest/domain';
import type { SlotRecord } from './repositories';
import { describeSaveSlotCapability, type SaveSlotOperationStatusPort } from './save-slots';

export interface DurableUpdateSafetySnapshot {
  readonly safePoint: 'unverified' | 'durable' | 'saving' | 'failed';
  readonly commandPending: boolean;
  readonly migrationActive: boolean;
  readonly importActive: boolean;
  readonly recoveryActive: boolean;
  readonly blockingWorkflowActive: boolean;
  readonly unsavedWork: boolean;
}

export interface UpdateSafetyStatePort extends SaveSlotOperationStatusPort {
  getSnapshot(): Readonly<DurableUpdateSafetySnapshot>;
  subscribe(listener: (snapshot: Readonly<DurableUpdateSafetySnapshot>) => void): () => void;
  beginCommand(slotId: SaveSlotId): void;
  beginSave(slotId: SaveSlotId): void;
  acceptDurableSlot(slot: SlotRecord): void;
  failSave(slotId: SaveSlotId): void;
  clearActiveSlot(): void;
  updateWorkflowState(
    changes: Partial<
      Pick<
        DurableUpdateSafetySnapshot,
        | 'migrationActive'
        | 'importActive'
        | 'recoveryActive'
        | 'blockingWorkflowActive'
        | 'unsavedWork'
      >
    >,
  ): void;
}

const neutral: DurableUpdateSafetySnapshot = {
  safePoint: 'unverified',
  commandPending: false,
  migrationActive: false,
  importActive: false,
  recoveryActive: false,
  blockingWorkflowActive: false,
  unsavedWork: false,
};

export function createUpdateSafetyState(): UpdateSafetyStatePort {
  let snapshot = neutral;
  let activeSlot: SaveSlotId | undefined;
  let operation: 'saving' | 'saved' | 'failed' | undefined;
  const listeners = new Set<(snapshot: Readonly<DurableUpdateSafetySnapshot>) => void>();
  const publish = (next: DurableUpdateSafetySnapshot) => {
    snapshot = next;
    listeners.forEach((listener) => listener(snapshot));
  };
  return {
    get: (slotId) => (slotId === activeSlot ? operation : undefined),
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      listener(snapshot);
      return () => listeners.delete(listener);
    },
    beginCommand(slotId) {
      activeSlot = slotId;
      operation = 'saving';
      publish({ ...snapshot, safePoint: 'saving', commandPending: true });
    },
    beginSave(slotId) {
      activeSlot = slotId;
      operation = 'saving';
      publish({ ...snapshot, safePoint: 'saving', commandPending: false });
    },
    acceptDurableSlot(slot) {
      activeSlot = slot.slotId;
      const capability = describeSaveSlotCapability(slot);
      const durable = capability.state === 'valid' || capability.state === 'empty';
      operation = durable ? 'saved' : undefined;
      publish({
        ...snapshot,
        safePoint: durable ? 'durable' : 'unverified',
        commandPending: false,
      });
    },
    failSave(slotId) {
      activeSlot = slotId;
      operation = 'failed';
      publish({ ...snapshot, safePoint: 'failed', commandPending: false });
    },
    clearActiveSlot() {
      activeSlot = undefined;
      operation = undefined;
      publish({ ...neutral, safePoint: 'durable' });
    },
    updateWorkflowState(changes) {
      publish({ ...snapshot, ...changes });
    },
  };
}
