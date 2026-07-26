import 'fake-indexeddb/auto';

import type { SaveSlotId } from '@notequest/domain';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createNoteQuestDatabase, type NoteQuestDexieDatabase } from './dexie-database';
import { DexieSnapshotService, type SnapshotWriteRequest } from './dexie-snapshot-service';
import { createNoteQuestTestDatabaseName } from './schema';

const slotOne = 'slot-one' as SaveSlotId;
const slotTwo = 'slot-two' as SaveSlotId;
const eligible = {
  supportedSchemaVersions: [1],
  validate: () => true,
} as const;

function candidate(
  sourceRevision: number,
  body: unknown,
  overrides: Partial<SnapshotWriteRequest> = {},
): SnapshotWriteRequest {
  return {
    slotId: slotOne,
    snapshotClass: 'last-valid',
    createdAt: `2026-01-01T00:00:0${sourceRevision}.000Z`,
    schemaVersion: 1,
    sourceRevision,
    body,
    ...overrides,
  };
}

describe('DexieSnapshotService', () => {
  let database: NoteQuestDexieDatabase;
  let service: DexieSnapshotService;

  beforeEach(async () => {
    database = await createNoteQuestDatabase(
      createNoteQuestTestDatabaseName(`snapshot-${Date.now()}-${Math.random()}`),
    );
    await database.open();
    const baseSlot = {
      slotIndex: 1 as const,
      displayName: 'One',
      revision: 2,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      status: 'ready' as const,
      schemaVersion: 1,
      rulesVersion: 'rules-1',
      contentVersion: 'content-1',
      currentSnapshotId: null,
      lastValidSnapshotId: null,
      recoveryAvailable: false,
      integrityStatus: 'valid' as const,
    };
    await database.slots.bulkPut([
      { ...baseSlot, slotId: slotOne },
      { ...baseSlot, slotId: slotTwo, slotIndex: 2, displayName: 'Two' },
    ]);
    service = new DexieSnapshotService(database);
  });

  afterEach(async () => {
    database.close();
    await database.delete();
  });

  it('creates a validated last-valid snapshot and exposes it for restore selection', async () => {
    const result = await service.retainValidated(candidate(1, { hp: 7 }), (stored) =>
      Boolean((stored.body as { hp?: number }).hp),
    );

    expect(result).toEqual({ ok: true, value: candidate(1, { hp: 7 }) });
    expect(await service.read(slotOne, 'last-valid')).toEqual(result);
    expect(await service.listRecoverable(slotOne, eligible)).toEqual({
      ok: true,
      value: [candidate(1, { hp: 7 })],
    });
    expect(
      await service.selectForRestore(slotOne, { ...eligible, snapshotClass: 'last-valid' }),
    ).toEqual({
      ok: true,
      value: { snapshot: candidate(1, { hp: 7 }), slotRevision: 2 },
    });
    expect(await database.slots.get(slotOne)).toMatchObject({
      lastValidSnapshotId: 'last-valid',
      recoveryAvailable: true,
    });
  });

  it('rolls back an invalid replacement and preserves the prior recoverable snapshot and pointer', async () => {
    await service.retainValidated(candidate(1, { hp: 7 }), () => true);

    const rejected = await service.retainValidated(candidate(2, { hp: 0 }), () => false);

    expect(rejected).toMatchObject({ ok: false, error: { code: 'invalid_snapshot' } });
    expect(await service.read(slotOne, 'last-valid')).toMatchObject({
      ok: true,
      value: { sourceRevision: 1, body: { hp: 7 } },
    });
    expect(await database.slots.get(slotOne)).toMatchObject({
      lastValidSnapshotId: 'last-valid',
      recoveryAvailable: true,
    });
  });

  it('retains one snapshot per protected class and preserves slot isolation', async () => {
    for (const snapshotClass of ['last-valid', 'pre-import', 'pre-reset'] as const) {
      await service.retainValidated(candidate(1, { snapshotClass }, { snapshotClass }), () => true);
    }
    await service.retainValidated(
      candidate(1, { slot: 2 }, { slotId: slotTwo, snapshotClass: 'last-valid' }),
      () => true,
    );
    await service.retainValidated(candidate(2, { newest: true }), () => true);

    const slotOneSnapshots = await service.listRecoverable(slotOne, eligible);
    const slotTwoSnapshots = await service.listRecoverable(slotTwo, eligible);
    expect(slotOneSnapshots.ok && slotOneSnapshots.value).toHaveLength(3);
    expect(slotOneSnapshots.ok && slotOneSnapshots.value[0]).toMatchObject({
      sourceRevision: 2,
      body: { newest: true },
    });
    expect(slotTwoSnapshots).toMatchObject({
      ok: true,
      value: [{ slotId: slotTwo, body: { slot: 2 } }],
    });
    expect(await database.snapshots.count()).toBe(4);
  });

  it('protects pre-migration snapshots until prior migration verification is confirmed', async () => {
    await service.retainValidated(
      candidate(1, { version: 1 }, { snapshotClass: 'pre-migration' }),
      () => true,
    );

    const blocked = await service.retainValidated(
      candidate(2, { version: 2 }, { snapshotClass: 'pre-migration' }),
      () => true,
    );
    expect(blocked).toMatchObject({
      ok: false,
      error: { code: 'replacement_not_verified' },
    });

    const replaced = await service.retainValidated(
      candidate(
        2,
        { version: 2 },
        { snapshotClass: 'pre-migration', priorOperationVerified: true },
      ),
      () => true,
    );
    expect(replaced).toMatchObject({ ok: true, value: { sourceRevision: 2 } });
  });

  it('selects each protected class explicitly and rejects incompatible or invalid candidates', async () => {
    const protectedClasses = ['last-valid', 'pre-migration', 'pre-import', 'pre-reset'] as const;
    for (const snapshotClass of protectedClasses) {
      await service.retainValidated(
        candidate(0, { complete: true, snapshotClass }, { snapshotClass }),
        () => true,
      );
      await expect(
        service.selectForRestore(slotOne, { ...eligible, snapshotClass }),
      ).resolves.toMatchObject({
        ok: true,
        value: { snapshot: { slotId: slotOne, snapshotClass, body: { complete: true } } },
      });
    }

    await expect(
      service.selectForRestore(slotOne, {
        snapshotClass: 'last-valid',
        supportedSchemaVersions: [2],
        validate: () => true,
      }),
    ).resolves.toMatchObject({ ok: false, error: { code: 'incompatible_snapshot' } });
    await expect(
      service.selectForRestore(slotOne, {
        ...eligible,
        snapshotClass: 'last-valid',
        validate: () => false,
      }),
    ).resolves.toMatchObject({ ok: false, error: { code: 'invalid_snapshot' } });
  });

  it('does not select a protected snapshot through a different slot', async () => {
    await service.retainValidated(candidate(0, { privateToSlotOne: true }), () => true);

    await expect(
      service.selectForRestore(slotTwo, { ...eligible, snapshotClass: 'last-valid' }),
    ).resolves.toMatchObject({ ok: false, error: { code: 'snapshot_not_found' } });
  });

  it('does not create a recoverable snapshot for an uncommitted future revision', async () => {
    const result = await service.retainValidated(
      candidate(3, { future: true }, { slotId: slotTwo }),
      () => true,
    );

    expect(result).toMatchObject({ ok: false, error: { code: 'invalid_snapshot' } });
    await expect(service.read(slotTwo, 'last-valid')).resolves.toMatchObject({
      ok: false,
      error: { code: 'snapshot_not_found' },
    });
    await expect(database.slots.get(slotTwo)).resolves.toMatchObject({
      recoveryAvailable: false,
      lastValidSnapshotId: null,
    });
  });

  it('inspects recovery for a valid current state without mutating active data', async () => {
    const validCurrent = {
      slotId: slotOne,
      recordType: 'adventurer',
      recordId: 'active',
      updatedAt: '2026-01-01T00:00:02.000Z',
      body: { hp: 8 },
    };
    const olderValid = { ...validCurrent, updatedAt: '2026-01-01T00:00:01.000Z', body: { hp: 7 } };
    await database.records.put(validCurrent);
    await service.retainValidated(candidate(1, { records: [olderValid] }), () => true);
    const slotBefore = await database.slots.get(slotOne);

    await expect(
      service.selectForRestore(slotOne, { ...eligible, snapshotClass: 'last-valid' }),
    ).resolves.toMatchObject({
      ok: true,
      value: { snapshot: { body: { records: [olderValid] } }, slotRevision: 2 },
    });

    await expect(database.records.get([slotOne, 'adventurer', 'active'])).resolves.toEqual(
      validCurrent,
    );
    await expect(database.slots.get(slotOne)).resolves.toEqual(slotBefore);
    await expect(database.staging.count()).resolves.toBe(0);
  });

  it('restores a complete package atomically while preserving invalid current data', async () => {
    const invalidCurrent = {
      slotId: slotOne,
      recordType: 'adventurer',
      recordId: 'active',
      updatedAt: '2026-01-01T00:00:00.000Z',
      body: { hp: -1 },
    };
    const otherSlotRecord = { ...invalidCurrent, slotId: slotTwo, body: { hp: 9 } };
    const restoredRecord = {
      ...invalidCurrent,
      updatedAt: '2026-01-01T00:00:01.000Z',
      body: { hp: 7 },
    };
    await database.records.bulkPut([invalidCurrent, otherSlotRecord]);
    await service.retainValidated(candidate(1, { records: [restoredRecord] }), () => true);

    const result = await service.restore(slotOne, {
      ...eligible,
      snapshotClass: 'last-valid',
      restoredCurrentSnapshotId: 'restored.last-valid.1',
      preserveInvalidCurrent: true,
    });

    expect(result).toEqual({
      ok: true,
      value: {
        snapshotClass: 'last-valid',
        sourceRevision: 1,
        committedRevision: 3,
        preservedStageId: `slot.${slotOne}.recovery-failed-source`,
      },
    });
    await expect(database.records.get([slotOne, 'adventurer', 'active'])).resolves.toEqual(
      restoredRecord,
    );
    await expect(database.records.get([slotTwo, 'adventurer', 'active'])).resolves.toEqual(
      otherSlotRecord,
    );
    await expect(
      database.staging.get(`slot.${slotOne}.recovery-failed-source`),
    ).resolves.toMatchObject({
      targetSlotId: slotOne,
      stageType: 'recovery-failed-source',
      status: 'preserved',
      body: { records: [invalidCurrent] },
    });
    await expect(database.snapshots.get([slotOne, 'last-valid'])).resolves.toMatchObject({
      sourceRevision: 1,
      body: { records: [restoredRecord] },
    });
    await expect(database.slots.get(slotOne)).resolves.toMatchObject({
      revision: 3,
      status: 'ready',
      currentSnapshotId: 'restored.last-valid.1',
      integrityStatus: 'valid',
    });
  });

  it('leaves invalid current data untouched when a restore package is incomplete', async () => {
    const invalidCurrent = {
      slotId: slotOne,
      recordType: 'adventurer',
      recordId: 'active',
      updatedAt: '2026-01-01T00:00:00.000Z',
      body: { hp: -1 },
    };
    await database.records.put(invalidCurrent);
    await service.retainValidated(candidate(1, { stateRootId: 'incomplete' }), () => true);

    await expect(
      service.restore(slotOne, {
        ...eligible,
        snapshotClass: 'last-valid',
        restoredCurrentSnapshotId: 'not-activated',
        preserveInvalidCurrent: true,
      }),
    ).resolves.toMatchObject({ ok: false, error: { code: 'invalid_snapshot' } });
    await expect(database.records.get([slotOne, 'adventurer', 'active'])).resolves.toEqual(
      invalidCurrent,
    );
    await expect(
      database.staging.get(`slot.${slotOne}.recovery-failed-source`),
    ).resolves.toBeUndefined();
    await expect(database.slots.get(slotOne)).resolves.toMatchObject({
      revision: 2,
      currentSnapshotId: null,
    });
  });

  it('rejects an invalid snapshot with duplicate or cross-slot records before restore mutation', async () => {
    const invalidCurrent = {
      slotId: slotOne,
      recordType: 'adventurer',
      recordId: 'active',
      updatedAt: '2026-01-01T00:00:00.000Z',
      body: { hp: -1 },
    };
    const duplicate = { ...invalidCurrent, body: { hp: 7 } };
    const foreign = { ...duplicate, slotId: slotTwo, recordId: 'foreign' };
    await database.records.put(invalidCurrent);
    await service.retainValidated(
      candidate(1, { records: [duplicate, { ...duplicate }, foreign] }),
      () => true,
    );

    await expect(
      service.restore(slotOne, {
        ...eligible,
        snapshotClass: 'last-valid',
        restoredCurrentSnapshotId: 'not-activated',
        preserveInvalidCurrent: true,
      }),
    ).resolves.toMatchObject({ ok: false, error: { code: 'invalid_snapshot' } });
    await expect(database.records.get([slotOne, 'adventurer', 'active'])).resolves.toEqual(
      invalidCurrent,
    );
    await expect(database.records.get([slotTwo, 'adventurer', 'foreign'])).resolves.toBeUndefined();
    await expect(database.staging.count()).resolves.toBe(0);
    await expect(database.slots.get(slotOne)).resolves.toMatchObject({
      revision: 2,
      currentSnapshotId: null,
    });
  });

  it('keeps protected recovery sources and failed-source preservation bounded across restores', async () => {
    const current = {
      slotId: slotOne,
      recordType: 'adventurer',
      recordId: 'active',
      updatedAt: '2026-01-01T00:00:00.000Z',
      body: { state: 'invalid-first' },
    };
    const restored = { ...current, body: { state: 'protected' } };
    await database.records.put(current);
    await service.retainValidated(
      candidate(1, { records: [restored] }, { snapshotClass: 'pre-import' }),
      () => true,
    );

    for (const invalidState of ['invalid-first', 'invalid-second']) {
      await database.records.put({ ...current, body: { state: invalidState } });
      await expect(
        service.restore(slotOne, {
          ...eligible,
          snapshotClass: 'pre-import',
          restoredCurrentSnapshotId: `restored.${invalidState}`,
          preserveInvalidCurrent: true,
        }),
      ).resolves.toMatchObject({ ok: true, value: { snapshotClass: 'pre-import' } });
    }

    await expect(database.snapshots.get([slotOne, 'pre-import'])).resolves.toMatchObject({
      body: { records: [restored] },
    });
    await expect(database.staging.count()).resolves.toBe(1);
    await expect(
      database.staging.get(`slot.${slotOne}.recovery-failed-source`),
    ).resolves.toMatchObject({ body: { records: [{ body: { state: 'invalid-second' } }] } });
    await expect(database.snapshots.count()).resolves.toBe(1);
  });
});
