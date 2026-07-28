import type { SaveSlotService, UpdateSafetyStatePort } from '@notequest/application';

/** Production save-slot decorator that publishes authoritative operation outcomes. */
export function createUpdateSafeSaveSlotService(
  base: SaveSlotService,
  safety: UpdateSafetyStatePort,
): SaveSlotService {
  return {
    list: () => base.list(),
    lookup: (slotId) => base.lookup(slotId),
    async select(slotId) {
      safety.beginCommand(slotId);
      const result = await base.select(slotId);
      if (result.ok) safety.acceptDurableSlot(result.value.slot);
      else safety.failSave(slotId);
      return result;
    },
    async updateMetadata(slotId, update) {
      safety.beginSave(slotId);
      const result = await base.updateMetadata(slotId, update);
      if (result.ok) safety.acceptDurableSlot(result.value);
      else safety.failSave(slotId);
      return result;
    },
  };
}
