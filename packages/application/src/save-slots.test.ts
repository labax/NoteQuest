import { describe, expect, it } from 'vitest';
import type { SaveSlotId } from '@notequest/domain';
import type { SlotRecord } from './repositories';
import { describeSaveSlotCapability } from './save-slots';

const base: SlotRecord = {
  slotId: '00000000-0000-4000-8000-000000000001' as SaveSlotId,
  slotIndex: 1,
  displayName: 'Slot 1',
  revision: 1,
  createdAt: '2026-07-28T00:00:00.000Z',
  updatedAt: '2026-07-28T00:00:00.000Z',
  status: 'ready',
  schemaVersion: 1,
  rulesVersion: 'test',
  contentVersion: 'test',
  currentSnapshotId: 'current',
  lastValidSnapshotId: 'last-valid',
  recoveryAvailable: true,
  integrityStatus: 'valid',
};

describe('save-slot shell capability projection', () => {
  it.each([
    ['empty', { status: 'empty', schemaVersion: null, integrityStatus: 'not_checked' }],
    ['valid', {}],
    ['recoverable', { status: 'isolated', integrityStatus: 'invalid' }],
    ['invalid', { status: 'isolated', integrityStatus: 'invalid', recoveryAvailable: false }],
    ['incompatible', { schemaVersion: 2 }],
    ['migrating', { status: 'migrating' }],
  ] as const)('derives the %s fixture without UI-owned safety logic', (state, changes) => {
    expect(describeSaveSlotCapability({ ...base, ...changes }).state).toBe(state);
  });

  it.each(['saving', 'saved', 'failed', 'storage-limited'] as const)(
    'represents the transient %s signal when a persistence status adapter supplies it',
    (state) => {
      expect(describeSaveSlotCapability(base, state).state).toBe(state);
    },
  );

  it('only marks empty and valid states as directly usable', () => {
    expect(describeSaveSlotCapability(base).usable).toBe(true);
    expect(describeSaveSlotCapability({ ...base, status: 'empty' }).usable).toBe(true);
    expect(
      describeSaveSlotCapability({ ...base, status: 'isolated', integrityStatus: 'invalid' })
        .usable,
    ).toBe(false);
  });
});
