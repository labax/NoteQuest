import { describe, expect, it } from 'vitest';
import {
  createDefinitionId,
  createIntegerInRange,
  createNonEmptyText,
  createNonNegativeInteger,
  createPositiveInteger,
  createRuntimeId,
  type EventEntryCore,
  type EventId,
  type IntegrityStatus,
  type RollResultCore,
  type RollResultId,
  type SaveSlotId,
  type SaveSlotStatus,
  type SnapshotKind,
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

  it('exposes approved save slot, snapshot, and integrity enum values', () => {
    const saveSlotStatuses = [
      'empty',
      'creating',
      'ready',
      'active',
      'importing',
      'migrating',
      'isolated',
      'resetting',
    ] as const satisfies readonly SaveSlotStatus[];
    const snapshotKinds = [
      'current',
      'last_valid',
      'pre_migration',
      'pre_import',
      'import_staging',
      'migration_staging',
      'manual_backup',
    ] as const satisfies readonly SnapshotKind[];
    const integrityStatuses = [
      'not_checked',
      'valid',
      'warning',
      'invalid',
      'unsupported_newer_version',
    ] as const satisfies readonly IntegrityStatus[];

    expect(saveSlotStatuses).toEqual([
      'empty',
      'creating',
      'ready',
      'active',
      'importing',
      'migrating',
      'isolated',
      'resetting',
    ]);
    expect(snapshotKinds).toEqual([
      'current',
      'last_valid',
      'pre_migration',
      'pre_import',
      'import_staging',
      'migration_staging',
      'manual_backup',
    ]);
    expect(integrityStatuses).toEqual([
      'not_checked',
      'valid',
      'warning',
      'invalid',
      'unsupported_newer_version',
    ]);
  });

  it('types event entries with approved category and stable namespaced event type', () => {
    const eventId = createRuntimeId<EventId>('123e4567-e89b-12d3-a456-426614174001', 'eventId');
    const slotId = createRuntimeId<SaveSlotId>('123e4567-e89b-12d3-a456-426614174002', 'slotId');
    const sequence = createPositiveInteger(1, 'sequence');
    const eventType = createDefinitionId('event.creation', 'eventType');

    expect(eventId.ok && slotId.ok && sequence.ok && eventType.ok).toBe(true);

    if (!eventId.ok || !slotId.ok || !sequence.ok || !eventType.ok) {
      throw new Error('expected valid event primitive inputs');
    }

    const eventEntry = {
      eventId: eventId.value,
      sequence: sequence.value,
      category: 'creation',
      eventType: eventType.value,
      slotId: slotId.value,
      rulesVersion: '0.1.0',
    } satisfies EventEntryCore;

    expect(eventEntry).toMatchObject({ category: 'creation', eventType: 'event.creation' });
  });

  it('types roll result table references as definition IDs or null', () => {
    const rollResultId = createRuntimeId<RollResultId>(
      '123e4567-e89b-12d3-a456-426614174003',
      'rollResultId',
    );
    const slotId = createRuntimeId<SaveSlotId>('123e4567-e89b-12d3-a456-426614174004', 'slotId');
    const streamDrawStart = createNonNegativeInteger(0, 'streamDrawStart');
    const tableId = createDefinitionId('table.adventurer_race', 'tableId');
    const tableRowId = createDefinitionId('row.race_human', 'tableRowId');

    expect(rollResultId.ok && slotId.ok && streamDrawStart.ok && tableId.ok && tableRowId.ok).toBe(
      true,
    );

    if (!rollResultId.ok || !slotId.ok || !streamDrawStart.ok || !tableId.ok || !tableRowId.ok) {
      throw new Error('expected valid roll result primitive inputs');
    }

    const rollResult = {
      rollResultId: rollResultId.value,
      slotId: slotId.value,
      streamKind: 'dungeon',
      streamDrawStart: streamDrawStart.value,
      naturalDice: [3, 4],
      inputMode: 'generated',
      tableId: tableId.value,
      tableRowId: tableRowId.value,
      finalValue: 7,
      rulesVersion: '0.1.0',
    } satisfies RollResultCore;

    expect(rollResult).toMatchObject({
      tableId: 'table.adventurer_race',
      tableRowId: 'row.race_human',
    });
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
    expect(createIntegerInRange(1.5, 'slotIndex', 1, 3)).toMatchObject({ ok: false });
    expect(createPositiveInteger(0, 'nextEventSequence')).toMatchObject({ ok: false });
    expect(createNonNegativeInteger(-1, 'eventSequence')).toMatchObject({ ok: false });
    expect(createNonNegativeInteger(Number.MAX_SAFE_INTEGER, 'eventSequence')).toMatchObject({
      ok: true,
      value: Number.MAX_SAFE_INTEGER,
    });
  });
});
