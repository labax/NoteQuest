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
  it('accepts opaque lowercase UUID-compatible runtime IDs', () => {
    const result = createRuntimeId<SaveSlotId>('123e4567-e89b-12d3-a456-426614174000', 'slotId');

    expect(result).toEqual({ ok: true, value: '123e4567-e89b-12d3-a456-426614174000' });
  });

  it('rejects runtime IDs derived from display names, coordinates, owners, indexes, or prefixes', () => {
    expect(createRuntimeId<SaveSlotId>('Save 1', 'slotId')).toMatchObject({ ok: false });
    expect(createRuntimeId<SaveSlotId>('room-1-2', 'segmentId')).toMatchObject({ ok: false });
    expect(createRuntimeId<SaveSlotId>('slot_01HXNOTEQ', 'slotId')).toMatchObject({ ok: false });
    expect(
      createRuntimeId<SaveSlotId>('slot/123e4567-e89b-12d3-a456-426614174000', 'slotId'),
    ).toMatchObject({
      ok: false,
    });
    expect(
      createRuntimeId<SaveSlotId>('123e4567-e89b-12d3-a456-426614174000-1', 'slotId'),
    ).toMatchObject({
      ok: false,
    });
  });

  it('rejects uppercase and malformed runtime IDs', () => {
    expect(
      createRuntimeId<SaveSlotId>('123E4567-E89B-12D3-A456-426614174000', 'slotId'),
    ).toMatchObject({
      ok: false,
    });
    expect(createRuntimeId<SaveSlotId>('123e4567e89b12d3a456426614174000', 'slotId')).toMatchObject(
      {
        ok: false,
      },
    );
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
