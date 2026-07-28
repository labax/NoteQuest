import { describe, expect, it } from 'vitest';
import type { SaveSlotId } from '@notequest/domain';
import type { SlotRecord } from './repositories';
import {
  describeSaveSlotCapability,
  hasProtectedLastValidRecovery,
  type SaveSlotOperationalState,
} from './save-slots';

const valid: SlotRecord = {
  slotId: '00000000-0000-4000-8000-000000000001' as SaveSlotId,
  slotIndex: 1,
  displayName: 'Slot 1',
  revision: 1,
  createdAt: '2026-07-28T00:00:00.000Z',
  updatedAt: '2026-07-28T00:00:00.000Z',
  status: 'ready',
  schemaVersion: 1,
  rulesVersion: 'rules.test',
  contentVersion: 'content.test',
  currentSnapshotId: 'current',
  lastValidSnapshotId: 'last-valid',
  recoveryAvailable: true,
  integrityStatus: 'valid',
};

const empty: SlotRecord = {
  ...valid,
  revision: 0,
  status: 'empty',
  schemaVersion: null,
  rulesVersion: null,
  contentVersion: null,
  currentSnapshotId: null,
  lastValidSnapshotId: null,
  recoveryAvailable: false,
  integrityStatus: 'not_checked',
};

const unsafeFixtures = [
  ['creating', { ...valid, status: 'creating' }],
  ['importing', { ...valid, status: 'importing' }],
  ['resetting', { ...valid, status: 'resetting' }],
  ['migrating', { ...valid, status: 'migrating' }],
  ['isolated', { ...valid, status: 'isolated' }],
  ['invalid', { ...valid, integrityStatus: 'invalid', recoveryAvailable: false }],
  ['recoverable', { ...valid, status: 'isolated', integrityStatus: 'invalid' }],
  ['incompatible', { ...valid, schemaVersion: 2 }],
  ['unchecked', { ...valid, integrityStatus: 'not_checked' }],
  ['ready without snapshot', { ...valid, currentSnapshotId: null }],
] as const satisfies ReadonlyArray<readonly [string, SlotRecord]>;

const operationalSignals: readonly SaveSlotOperationalState[] = [
  'saving',
  'saved',
  'failed',
  'storage-limited',
];

describe('save-slot shell capability projection', () => {
  it('allows only genuinely empty and durable compatible integrity-valid playable slots', () => {
    expect(describeSaveSlotCapability(empty)).toMatchObject({ state: 'empty', usable: true });
    expect(describeSaveSlotCapability(valid)).toMatchObject({ state: 'valid', usable: true });
    expect(describeSaveSlotCapability({ ...valid, status: 'active' })).toMatchObject({
      state: 'valid',
      usable: true,
    });
  });

  it.each(unsafeFixtures)('fails closed for the %s durable fixture', (_name, slot) => {
    expect(describeSaveSlotCapability(slot).usable).toBe(false);
  });

  it.each(
    unsafeFixtures.flatMap(([name, slot]) =>
      operationalSignals.map((signal) => [name, slot, signal] as const),
    ),
  )('does not let %s durable data become usable under a %s signal', (_name, slot, signal) => {
    expect(describeSaveSlotCapability(slot, signal).usable).toBe(false);
  });

  it('especially does not let saved upgrade unsafe durable data', () => {
    for (const [, slot] of unsafeFixtures) {
      expect(describeSaveSlotCapability(slot, 'saved').state).not.toBe('saved');
    }
  });

  it.each([
    ['saving', false],
    ['saved', true],
    ['failed', false],
    ['storage-limited', false],
  ] as const)(
    'overlays a safe playable slot with %s without optimistic usability',
    (state, usable) => {
      expect(describeSaveSlotCapability(valid, state)).toMatchObject({ state, usable });
    },
  );

  it('preserves recovery availability for every blocked presentation', () => {
    expect(describeSaveSlotCapability({ ...valid, status: 'migrating' })).toMatchObject({
      state: 'migrating',
      recoveryAvailable: true,
    });
    expect(
      describeSaveSlotCapability({ ...valid, status: 'isolated', integrityStatus: 'invalid' }),
    ).toMatchObject({ state: 'recoverable', recoveryAvailable: true });
  });

  it.each([
    [true, 'last-valid', true],
    [true, null, false],
    [true, 'wrong-pointer', false],
    [false, 'last-valid', false],
  ] as const)(
    'requires recovery flag %s and pointer %s together',
    (recoveryAvailable, lastValidSnapshotId, expected) => {
      const slot = { ...valid, recoveryAvailable, lastValidSnapshotId };
      expect(hasProtectedLastValidRecovery(slot)).toBe(expected);
      expect(describeSaveSlotCapability(slot).recoveryAvailable).toBe(expected);
    },
  );

  it.each([
    [true, null],
    [true, 'wrong-pointer'],
    [false, 'last-valid'],
  ] as const)(
    'does not classify invalid data as recoverable with inconsistent evidence %s / %s',
    (recoveryAvailable, lastValidSnapshotId) => {
      const capability = describeSaveSlotCapability(
        {
          ...valid,
          status: 'isolated',
          integrityStatus: 'invalid',
          recoveryAvailable,
          lastValidSnapshotId,
        },
        'saved',
      );
      expect(capability).toMatchObject({
        state: 'invalid',
        usable: false,
        recoveryAvailable: false,
      });
      expect(
        describeSaveSlotCapability({ ...valid, recoveryAvailable, lastValidSnapshotId }, 'failed'),
      ).toMatchObject({ actionLabel: 'Review save failure', recoveryAvailable: false });
    },
  );
});
