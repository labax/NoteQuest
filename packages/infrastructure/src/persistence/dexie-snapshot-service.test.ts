import 'fake-indexeddb/auto';

import type { SaveSlotId } from '@notequest/domain';
import {
  createPersistenceFaultController,
  createProtectedSnapshotPersistenceFixture,
  PERSISTENCE_FAULT_SCENARIOS,
} from '@notequest/test-support';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createNoteQuestDatabase, type NoteQuestDexieDatabase } from './dexie-database';
import { DexieSnapshotService, type SnapshotWriteRequest } from './dexie-snapshot-service';
import { initializeSaveSlotFoundation, NOTEQUEST_SLOT_IDS } from './save-slot-foundation';
import { createNoteQuestTestDatabaseName } from './schema';

const slotOne = NOTEQUEST_SLOT_IDS[0];
const slotTwo = NOTEQUEST_SLOT_IDS[1];
const straySlot = '00000000-0000-4000-8000-000000000004' as SaveSlotId;
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
    const initialized = await initializeSaveSlotFoundation(
      database,
      () => '2026-01-01T00:00:00.000Z',
    );
    if (!initialized.ok) throw new Error(initialized.error.message);
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
    await database.slots.bulkPut(
      initialized.value.slots.map((slot) => ({
        ...baseSlot,
        slotId: slot.slotId,
        slotIndex: slot.slotIndex,
        displayName: slot.displayName,
      })),
    );
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

  it('rolls back a deterministic snapshot write fault and preserves the prior snapshot', async () => {
    await service.retainValidated(candidate(1, { hp: 9 }), () => true);
    const faults = createPersistenceFaultController();
    faults.arm('snapshot.retain.after-write');
    const faultingService = new DexieSnapshotService(database, undefined, faults);

    await expect(
      faultingService.retainValidated(candidate(2, { hp: 1 }), () => true),
    ).resolves.toMatchObject({
      ok: false,
      error: {
        code: 'storage_failure',
        message: 'Injected persistence fault at snapshot.retain.after-write.',
      },
    });
    await expect(database.snapshots.get([slotOne, 'last-valid'])).resolves.toMatchObject({
      sourceRevision: 1,
      body: { hp: 9 },
    });
    await expect(database.slots.get(slotOne)).resolves.toMatchObject({
      revision: 2,
      lastValidSnapshotId: 'last-valid',
    });
  });

  it('preserves the prior snapshot and pointer when failure occurs before retain completion', async () => {
    await service.retainValidated(candidate(1, { hp: 9, valid: true }), () => true);
    const slotBefore = await database.slots.get(slotOne);
    const faults = createPersistenceFaultController();
    faults.arm('snapshot.retain.before-completion');
    const faultingService = new DexieSnapshotService(database, undefined, faults);

    await expect(
      faultingService.retainValidated(candidate(2, { hp: 1, valid: false }), () => true),
    ).resolves.toEqual({
      ok: false,
      error: {
        code: 'storage_failure',
        message: 'Injected persistence fault at snapshot.retain.before-completion.',
      },
    });
    await expect(database.snapshots.get([slotOne, 'last-valid'])).resolves.toEqual(
      candidate(1, { hp: 9, valid: true }),
    );
    await expect(database.slots.get(slotOne)).resolves.toEqual(slotBefore);
  });

  it('simulates a recovery read failure without mutating the recoverable snapshot', async () => {
    await service.retainValidated(candidate(1, { hp: 8 }), () => true);
    const faults = createPersistenceFaultController();
    faults.armScenario(PERSISTENCE_FAULT_SCENARIOS.recoveryReadFailure);
    const faultingService = new DexieSnapshotService(database, undefined, faults);

    await expect(
      faultingService.selectForRestore(slotOne, {
        ...eligible,
        snapshotClass: 'last-valid',
      }),
    ).resolves.toEqual({
      ok: false,
      error: {
        code: 'storage_failure',
        message:
          'Injected persistence fault at snapshot.select.after-read (recovery_read_failure).',
      },
    });
    await expect(database.snapshots.get([slotOne, 'last-valid'])).resolves.toMatchObject({
      sourceRevision: 1,
      body: { hp: 8 },
    });
    await expect(database.slots.get(slotOne)).resolves.toMatchObject({
      revision: 2,
      lastValidSnapshotId: 'last-valid',
      recoveryAvailable: true,
    });
  });

  it('propagates an injected recovery read failure from listRecoverable without mutation', async () => {
    const existingRecord = {
      slotId: slotOne,
      recordType: 'adventurer',
      recordId: 'active',
      updatedAt: '2026-01-01T00:00:00.000Z',
      body: { hp: 8, valid: true },
    };
    await database.records.put(existingRecord);
    await service.retainValidated(candidate(1, { records: [existingRecord] }), () => true);
    const before = {
      slot: await database.slots.get(slotOne),
      records: await database.records.toArray(),
      snapshots: await database.snapshots.toArray(),
      staging: await database.staging.toArray(),
    };
    const faults = createPersistenceFaultController();
    faults.armScenario(PERSISTENCE_FAULT_SCENARIOS.recoveryReadFailure);
    const faultingService = new DexieSnapshotService(database, undefined, faults);

    await expect(faultingService.listRecoverable(slotOne, eligible)).resolves.toEqual({
      ok: false,
      error: {
        code: 'storage_failure',
        message:
          'Injected persistence fault at snapshot.select.after-read (recovery_read_failure).',
      },
    });
    await expect(database.slots.get(slotOne)).resolves.toEqual(before.slot);
    await expect(database.records.toArray()).resolves.toEqual(before.records);
    await expect(database.snapshots.toArray()).resolves.toEqual(before.snapshots);
    await expect(database.staging.toArray()).resolves.toEqual(before.staging);
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

  it('selects last-valid and every protected class from a recovery fixture without mutation', async () => {
    const fixture = createProtectedSnapshotPersistenceFixture();
    await database.slots.put(fixture.slot);
    await database.records.bulkPut([...fixture.records]);
    await database.snapshots.bulkPut([...fixture.snapshots]);
    await database.staging.bulkPut([...fixture.staging]);
    const before = {
      slot: await database.slots.get(slotOne),
      records: await database.records.toArray(),
      snapshots: await database.snapshots.toArray(),
      staging: await database.staging.toArray(),
    };

    for (const expected of fixture.snapshots) {
      await expect(
        service.selectForRestore(slotOne, {
          ...eligible,
          snapshotClass: expected.snapshotClass,
          validate: (selected) =>
            (selected.body as { selectionMarker?: string }).selectionMarker ===
            expected.snapshotClass,
        }),
      ).resolves.toEqual({
        ok: true,
        value: { snapshot: expected, slotRevision: fixture.slot.revision },
      });
    }

    await expect(service.listRecoverable(slotOne, eligible)).resolves.toEqual({
      ok: true,
      value: fixture.snapshots,
    });
    await expect(database.slots.get(slotOne)).resolves.toEqual(before.slot);
    await expect(database.records.toArray()).resolves.toEqual(before.records);
    await expect(database.snapshots.toArray()).resolves.toEqual(before.snapshots);
    await expect(database.staging.toArray()).resolves.toEqual(before.staging);
  });

  it('rejects incompatible or invalid last-valid selection candidates', async () => {
    await service.retainValidated(candidate(0, { complete: true }), () => true);

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

  it('aborts an injected restore failure and preserves all previous valid state', async () => {
    const previousRecord = {
      slotId: slotOne,
      recordType: 'adventurer',
      recordId: 'active',
      updatedAt: '2026-01-01T00:00:00.000Z',
      body: { hp: 6, valid: true },
    };
    const restoredRecord = {
      ...previousRecord,
      updatedAt: '2026-01-01T00:00:01.000Z',
      body: { hp: 10, valid: true },
    };
    await database.records.put(previousRecord);
    await service.retainValidated(candidate(1, { records: [restoredRecord] }), () => true);
    const slotBefore = await database.slots.get(slotOne);
    const faults = createPersistenceFaultController();
    faults.arm('snapshot.restore.before-completion');
    const faultingService = new DexieSnapshotService(database, undefined, faults);

    await expect(
      faultingService.restore(slotOne, {
        ...eligible,
        snapshotClass: 'last-valid',
        restoredCurrentSnapshotId: 'must-not-activate',
        preserveInvalidCurrent: true,
      }),
    ).resolves.toEqual({
      ok: false,
      error: {
        code: 'storage_failure',
        message: 'Injected persistence fault at snapshot.restore.before-completion.',
      },
    });
    await expect(database.records.get([slotOne, 'adventurer', 'active'])).resolves.toEqual(
      previousRecord,
    );
    await expect(database.slots.get(slotOne)).resolves.toEqual(slotBefore);
    await expect(database.staging.count()).resolves.toBe(0);
    await expect(database.snapshots.get([slotOne, 'last-valid'])).resolves.toEqual(
      candidate(1, { records: [restoredRecord] }),
    );
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

  it('rejects every protected snapshot operation for a stray fourth slot without mutation', async () => {
    const catalogueSlot = await database.slots.get(slotOne);
    if (catalogueSlot === undefined) throw new Error('catalogue test slot missing');
    await database.slots.put({
      ...catalogueSlot,
      slotId: straySlot,
      displayName: 'Stray slot',
      currentSnapshotId: 'stray.current',
      lastValidSnapshotId: null,
      recoveryAvailable: false,
    });
    const strayRecord = {
      slotId: straySlot,
      recordType: 'adventurer',
      recordId: 'stray.active',
      updatedAt: '2026-01-01T00:00:00.000Z',
      body: { hp: -1 },
    };
    await database.records.put(strayRecord);
    await database.snapshots.put({
      ...candidate(1, { records: [{ ...strayRecord, body: { hp: 7 } }] }),
      slotId: straySlot,
    });
    await database.staging.put({
      stageId: 'stray.existing-stage',
      targetSlotId: straySlot,
      createdAt: '2026-01-01T00:00:00.000Z',
      stageType: 'test-sentinel',
      status: 'preserved',
      body: { untouched: true },
    });
    const before = await Promise.all([
      database.slots.toArray(),
      database.snapshots.toArray(),
      database.records.toArray(),
      database.staging.toArray(),
    ]);

    await expect(
      service.retainValidated(
        candidate(2, { records: [], replacement: true }, { slotId: straySlot }),
        () => true,
      ),
    ).resolves.toMatchObject({ ok: false, error: { code: 'slot_not_found' } });
    await expect(service.read(straySlot, 'last-valid')).resolves.toMatchObject({
      ok: false,
      error: { code: 'slot_not_found' },
    });
    await expect(
      service.selectForRestore(straySlot, { ...eligible, snapshotClass: 'last-valid' }),
    ).resolves.toMatchObject({ ok: false, error: { code: 'slot_not_found' } });
    await expect(service.listRecoverable(straySlot, eligible)).resolves.toMatchObject({
      ok: false,
      error: { code: 'slot_not_found' },
    });
    await expect(
      service.restore(straySlot, {
        ...eligible,
        snapshotClass: 'last-valid',
        restoredCurrentSnapshotId: 'stray.restored',
        preserveInvalidCurrent: true,
      }),
    ).resolves.toMatchObject({ ok: false, error: { code: 'slot_not_found' } });

    await expect(
      Promise.all([
        database.slots.toArray(),
        database.snapshots.toArray(),
        database.records.toArray(),
        database.staging.toArray(),
      ]),
    ).resolves.toEqual(before);
  });
});
