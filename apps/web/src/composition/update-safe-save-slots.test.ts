import { createUpdateSafetyState, type SaveSlotService } from '@notequest/application';
import { NOTEQUEST_SLOT_IDS } from '@notequest/infrastructure';
import { describe, expect, it, vi } from 'vitest';
import type { PwaLifecycleAdapter, PwaLifecycleStatus } from '../pwa/service-worker';
import { createPwaUpdateCoordinator } from '../pwa/update-coordinator';
import { createUpdateSafeSaveSlotService } from './update-safe-save-slots';

const slot = {
  slotId: NOTEQUEST_SLOT_IDS[0],
  slotIndex: 1 as const,
  displayName: 'Synthetic slot',
  revision: 1,
  createdAt: '2026-07-28T00:00:00.000Z',
  updatedAt: '2026-07-28T00:00:01.000Z',
  status: 'ready' as const,
  schemaVersion: 1,
  rulesVersion: 'rules.test',
  contentVersion: 'content.test',
  currentSnapshotId: 'current',
  lastValidSnapshotId: 'last-valid',
  recoveryAvailable: true,
  integrityStatus: 'valid' as const,
};

function waitingLifecycle(): PwaLifecycleAdapter {
  const status: PwaLifecycleStatus = {
    serviceWorkerSupport: 'supported',
    offlineReadiness: 'ready',
    updateStatus: 'waiting',
  };
  return {
    getStatus: () => status,
    register: vi.fn(),
    requestActivation: vi.fn(() => true),
    retryReadiness: vi.fn(() => true),
    retryUpdate: vi.fn(async () => true),
    subscribe(listener) {
      listener(status);
      return () => undefined;
    },
    close: vi.fn(),
  };
}

describe('production update-safe save-slot composition', () => {
  it('moves from unknown through command/save evidence and blocks again for new work', async () => {
    let finishSelection!: (value: Awaited<ReturnType<SaveSlotService['select']>>) => void;
    const selection = new Promise<Awaited<ReturnType<SaveSlotService['select']>>>((resolve) => {
      finishSelection = resolve;
    });
    const base: SaveSlotService = {
      list: vi.fn(),
      lookup: vi.fn(),
      select: vi.fn(() => selection),
      updateMetadata: vi.fn().mockResolvedValue({ ok: true, value: slot }),
    };
    const safety = createUpdateSafetyState();
    const coordinator = createPwaUpdateCoordinator(waitingLifecycle());
    const unsubscribe = safety.subscribe((snapshot) => coordinator.updateSafety(snapshot));
    const service = createUpdateSafeSaveSlotService(base, safety);

    expect(coordinator.getStatus()).toMatchObject({
      updateState: 'activation-deferred',
      blockers: ['safe-point-unverified'],
    });
    const pending = service.select(slot.slotId);
    expect(coordinator.getStatus()).toMatchObject({
      updateState: 'activation-deferred',
      blockers: ['command-pending', 'save-pending'],
    });
    finishSelection({
      ok: true,
      value: { selectedSlotId: slot.slotId, selectedAt: slot.updatedAt, slot },
    });
    await pending;
    expect(coordinator.getStatus()).toMatchObject({ updateState: 'ready', blockers: [] });

    safety.beginSave(slot.slotId);
    expect(coordinator.getStatus()).toMatchObject({
      updateState: 'activation-deferred',
      blockers: ['save-pending'],
    });
    safety.failSave(slot.slotId);
    expect(coordinator.getStatus()).toMatchObject({
      updateState: 'activation-deferred',
      blockers: ['save-failed'],
    });
    safety.acceptDurableSlot(slot);
    expect(coordinator.getStatus().updateState).toBe('ready');
    safety.updateWorkflowState({ migrationActive: true, unsavedWork: true });
    expect(coordinator.getStatus()).toMatchObject({
      updateState: 'activation-deferred',
      blockers: ['migration-active', 'unsaved-work'],
    });
    safety.updateWorkflowState({ migrationActive: false, unsavedWork: false });
    expect(coordinator.getStatus().updateState).toBe('ready');
    safety.beginCommand(slot.slotId);
    expect(coordinator.getStatus().updateState).toBe('activation-deferred');
    unsubscribe();
  });
});
