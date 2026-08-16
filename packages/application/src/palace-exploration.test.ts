import { describe, expect, it, vi } from 'vitest';
import type { PalaceExplorationState, SaveSlotId } from '@notequest/domain';
import { commitPalaceExplorationAction } from './palace-exploration.ts';

const slotId = '00000000-0000-4000-8000-000000000001' as SaveSlotId;
const state: PalaceExplorationState = {
  dungeonId: 'dungeon',
  expeditionId: 'expedition',
  adventurerId: 'adventurer',
  rulesVersion: 'digital-rules-specification-v0.1',
  contentVersion: '1.0.0',
  generationVersion: 'palace-generation.v0.1',
  revision: 1,
  status: 'active',
  currentSegmentId: 'entrance',
  physicalLight: 2,
  virtualLight: 0,
  lightCharges: 0,
  activeLamp: false,
  isMiner: false,
  segments: [
    {
      segmentId: 'entrance',
      kind: 'entrance',
      searched: false,
      searchEligible: true,
      encounter: { kind: 'empty', livingMonsters: 0, alert: 'quiet', stealth: 'unavailable' },
    },
  ],
  connections: [
    {
      connectionId: 'door',
      sourceSegmentId: 'entrance',
      destinationSegmentId: null,
      state: 'unresolved',
      doorState: 'unknown',
      trapResolved: false,
      alertState: 'quiet',
    },
  ],
};
const command = {
  actionId: 'action',
  eventId: 'event',
  resultIds: ['result'],
  idempotencyKey: 'retry-key' as never,
  slotId,
  dungeonId: 'dungeon',
  expeditionId: 'expedition',
  adventurerId: 'adventurer',
  expectedRevision: 1,
  rulesVersion: state.rulesVersion,
  contentVersion: state.contentVersion,
  generationVersion: state.generationVersion,
  action: { kind: 'open-door' as const, connectionId: 'door', doorRoll: 2 },
};
function loaded(value = state) {
  return {
    slot: {
      slotId,
      slotIndex: 1 as const,
      displayName: 'Slot',
      revision: 1,
      createdAt: 'now',
      updatedAt: 'now',
      status: 'active' as const,
      schemaVersion: 1,
      rulesVersion: state.rulesVersion,
      contentVersion: state.contentVersion,
      currentSnapshotId: null,
      lastValidSnapshotId: 'snapshot',
      recoveryAvailable: true,
      integrityStatus: 'valid' as const,
    },
    state: value,
    nextEventSequence: 3,
    cumulativeSnapshot: {
      slotId,
      snapshotClass: 'last-valid' as const,
      createdAt: 'before',
      schemaVersion: 1,
      sourceRevision: 1,
      body: {
        records: [{ recordType: 'creation' }],
        events: [{ eventType: 'palace.generated-and-entered' }],
      },
    },
  };
}

describe('commitPalaceExplorationAction', () => {
  it('commits state, evidence, event, metadata, and cumulative snapshot in one envelope', async () => {
    const commit = vi.fn().mockResolvedValue({
      ok: true,
      actionId: 'action',
      committed: true,
      duplicate: false,
      stateRevision: 2,
      written: {},
    });
    const result = await commitPalaceExplorationAction(command, {
      coordinator: { commit },
      now: () => 'after',
      load: async () => loaded(),
    });
    expect(result.ok).toBe(true);
    expect(commit).toHaveBeenCalledOnce();
    const envelope = commit.mock.calls[0]![0];
    expect(envelope).toMatchObject({
      expectedRevision: 1,
      stateRecords: [{ recordType: 'palace-exploration-state' }],
      events: [{ sequence: 3 }],
      randomResultRecords: [{ recordId: 'result' }],
    });
    expect(envelope.recoveryPointers.snapshots[0].body.records).toEqual(
      expect.arrayContaining([{ recordType: 'creation' }]),
    );
  });

  it('performs zero writes for stale, foreign, and terminal commands', async () => {
    const commit = vi.fn();
    const stale = await commitPalaceExplorationAction(
      { ...command, expectedRevision: 0 },
      { coordinator: { commit }, now: () => 'after', load: async () => loaded() },
    );
    const foreign = await commitPalaceExplorationAction(
      { ...command, dungeonId: 'other' },
      { coordinator: { commit }, now: () => 'after', load: async () => loaded() },
    );
    const terminal = await commitPalaceExplorationAction(command, {
      coordinator: { commit },
      now: () => 'after',
      load: async () => loaded({ ...state, status: 'dead' }),
    });
    expect([stale, foreign, terminal].every((result) => !result.ok)).toBe(true);
    expect(commit).not.toHaveBeenCalled();
  });

  it('does not expose a generated result when the atomic commit fails', async () => {
    const result = await commitPalaceExplorationAction(command, {
      coordinator: {
        commit: vi.fn().mockResolvedValue({
          ok: false,
          committed: false,
          error: { code: 'write_failed', message: 'fail' },
        }),
      },
      now: () => 'after',
      load: async () => loaded(),
    });
    expect(result).toEqual({
      ok: false,
      code: 'commit-failed',
      explanation: 'The exploration action was not durably committed.',
    });
  });
});
