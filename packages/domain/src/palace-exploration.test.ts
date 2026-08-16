import { describe, expect, it } from 'vitest';
import {
  projectPalaceAvailableActions,
  resolvePalaceExplorationAction,
  type PalaceExplorationState,
} from './palace-exploration.ts';

const segment = (
  segmentId: string,
  overrides: Partial<PalaceExplorationState['segments'][number]> = {},
) => ({
  segmentId,
  kind: 'entrance' as const,
  searched: false,
  searchEligible: true,
  encounter: {
    kind: 'empty' as const,
    livingMonsters: 0,
    alert: 'quiet' as const,
    stealth: 'unavailable' as const,
  },
  ...overrides,
});

function state(overrides: Partial<PalaceExplorationState> = {}): PalaceExplorationState {
  return {
    dungeonId: 'dungeon',
    expeditionId: 'expedition',
    adventurerId: 'adventurer',
    rulesVersion: 'digital-rules-specification-v0.1',
    contentVersion: '1.0.0',
    generationVersion: 'palace-generation.v0.1',
    revision: 2,
    status: 'active',
    currentSegmentId: 'entrance',
    physicalLight: 2,
    virtualLight: 0,
    lightCharges: 0,
    activeLamp: false,
    isMiner: false,
    segments: [segment('entrance')],
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
    ...overrides,
  };
}

describe('Palace exploration transitions', () => {
  it.each([
    [1, 'open'],
    [2, 'locked'],
    [3, 'locked'],
    [4, 'open'],
    [6, 'open'],
  ] as const)('resolves door boundary %i once', (roll, expected) => {
    const result = resolvePalaceExplorationAction(
      state(),
      {
        kind: 'open-door',
        connectionId: 'door',
        doorRoll: roll,
        trapSurvived: true,
        destinationSegment: segment('room'),
      },
      2,
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.state.connections[0]?.doorState).toBe(expected);
  });

  it('rejects stale and foreign commands without changing the input', () => {
    const before = state();
    const bytes = JSON.stringify(before);
    expect(
      resolvePalaceExplorationAction(
        before,
        { kind: 'open-door', connectionId: 'door', doorRoll: 6 },
        1,
      ),
    ).toMatchObject({ ok: false, code: 'stale' });
    expect(
      resolvePalaceExplorationAction(
        before,
        { kind: 'open-door', connectionId: 'foreign', doorRoll: 6 },
        2,
      ),
    ).toMatchObject({ ok: false, code: 'foreign-target' });
    expect(JSON.stringify(before)).toBe(bytes);
  });

  it('moves only over the selected discovered connection', () => {
    const before = state({
      segments: [segment('entrance'), segment('room')],
      connections: [
        {
          connectionId: 'door',
          sourceSegmentId: 'entrance',
          destinationSegmentId: 'room',
          state: 'discovered',
          doorState: 'open',
          trapResolved: false,
          alertState: 'quiet',
        },
      ],
    });
    const result = resolvePalaceExplorationAction(
      before,
      { kind: 'move', connectionId: 'door' },
      2,
    );
    expect(result.ok && result.state.currentSegmentId).toBe('room');
  });

  it('searches once, consumes exact light, and applies darkness after resolution', () => {
    const before = state({ physicalLight: 0, virtualLight: 1 });
    const result = resolvePalaceExplorationAction(before, { kind: 'search', searchRoll: 2 }, 2);
    expect(result.ok && result.state).toMatchObject({
      virtualLight: 0,
      status: 'dead',
      revision: 3,
    });
    if (result.ok) expect(result.state.segments[0]?.searched).toBe(true);
  });

  it('preserves Lamp protection but never treats it as a payable unit', () => {
    const protectedState = state({ physicalLight: 0, virtualLight: 1, activeLamp: true });
    const result = resolvePalaceExplorationAction(
      protectedState,
      { kind: 'search', searchRoll: 3 },
      2,
    );
    expect(result.ok && result.state.status).toBe('active');
    expect(
      projectPalaceAvailableActions(state({ physicalLight: 0, activeLamp: true })).find(
        ({ action }) => action === 'search',
      ),
    ).toMatchObject({ enabled: false });
  });

  it('uses one stealth check per committed monster and alerts on failure', () => {
    const occupied = segment('entrance', {
      encounter: { kind: 'ordinary', livingMonsters: 2, alert: 'quiet', stealth: 'available' },
    });
    const result = resolvePalaceExplorationAction(
      state({ segments: [occupied] }),
      { kind: 'stealth', rolls: [4, 1] },
      2,
    );
    expect(result.ok && result.state.segments[0]?.encounter).toMatchObject({
      stealth: 'failed',
      alert: 'alerted',
    });
    expect(result.ok && result.randomEvidence[0]?.rolls).toEqual([4, 1]);
  });

  it('casts a canonical charge once and terminal states expose no enabled action', () => {
    const cast = resolvePalaceExplorationAction(
      state({ lightCharges: 1 }),
      { kind: 'cast-light' },
      2,
    );
    expect(cast.ok && cast.state).toMatchObject({ lightCharges: 0, virtualLight: 1 });
    expect(
      projectPalaceAvailableActions(state({ status: 'miner-exit' })).every(
        ({ enabled }) => !enabled,
      ),
    ).toBe(true);
  });
});
