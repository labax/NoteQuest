import { describe, expect, it } from 'vitest';
import {
  createDefinitionId,
  createIntegerInRange,
  createNonEmptyText,
  createPositiveInteger,
  createRuntimeId,
  type SaveSlotId,
} from './index.ts';

describe('domain primitives', () => {
  it('accepts stable opaque runtime IDs without depending on display names or indexes', () => {
    const result = createRuntimeId<SaveSlotId>('slot_01HXNOTEQ', 'slotId');

    expect(result).toEqual({ ok: true, value: 'slot_01HXNOTEQ' });
  });

  it('rejects runtime IDs that look like display names or coordinates', () => {
    expect(createRuntimeId<SaveSlotId>('Save 1', 'slotId')).toMatchObject({ ok: false });
    expect(createRuntimeId<SaveSlotId>('room-1-2', 'segmentId')).toMatchObject({ ok: false });
  });

  it('accepts approved namespaced definition IDs used by content references', () => {
    expect(createDefinitionId('race.human', 'raceRef.id')).toEqual({
      ok: true,
      value: 'race.human',
    });
    expect(createDefinitionId('spell.light', 'spellRef.id')).toEqual({
      ok: true,
      value: 'spell.light',
    });
  });

  it('rejects unsafe or unnamespaced definition IDs', () => {
    expect(createDefinitionId('Human', 'raceRef.id')).toMatchObject({ ok: false });
    expect(createDefinitionId('race/human', 'raceRef.id')).toMatchObject({ ok: false });
  });

  it('normalizes required private text and rejects blank values', () => {
    expect(createNonEmptyText('  Save 1  ', 'displayName')).toEqual({ ok: true, value: 'Save 1' });
    expect(createNonEmptyText('   ', 'displayName')).toMatchObject({ ok: false });
  });

  it('rejects out-of-range and non-integer numeric primitives safely', () => {
    expect(createIntegerInRange(2, 'slotIndex', 1, 3)).toEqual({ ok: true, value: 2 });
    expect(createIntegerInRange(4, 'slotIndex', 1, 3)).toMatchObject({ ok: false });
    expect(createPositiveInteger(0, 'nextEventSequence')).toMatchObject({ ok: false });
  });
});
