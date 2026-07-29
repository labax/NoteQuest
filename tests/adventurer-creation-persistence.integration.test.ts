import 'fake-indexeddb/auto';

import { afterEach, describe, expect, it } from 'vitest';
import { AdventurerCreationService, type AdventurerCreationContent } from '@notequest/application';
import type {
  CommandId,
  ContentVersion,
  DefinitionId,
  IdempotencyKey,
  RulesVersion,
} from '@notequest/domain';
import {
  createDexieActionTransactionCoordinator,
  createDexiePersistenceRepositories,
  createNoteQuestDatabase,
  createNoteQuestTestDatabaseName,
  initializeSaveSlotFoundation,
  NOTEQUEST_SLOT_IDS,
} from '@notequest/infrastructure';
import { createPersistenceFaultController } from '@notequest/test-support';
import type { PersistenceFaultPoint } from '@notequest/test-support';

const timestamp = '2026-07-29T00:00:00.000Z';
const rulesVersion = 'rules.persistence-fixture.v1' as RulesVersion;
const contentVersion = 'content.persistence-fixture.v1' as ContentVersion;
const definition = (value: string) => value as DefinitionId;
const databases: Array<Awaited<ReturnType<typeof createNoteQuestDatabase>>> = [];
let databaseCounter = 0;

const content: AdventurerCreationContent = {
  raceTableId: definition('fixture.races'),
  classTableId: definition('fixture.classes'),
  spellTableId: definition('fixture.spells'),
  races: Array.from({ length: 11 }, (_, index) => ({
    id: definition(`fixture.race_${index + 2}`),
    total: index + 2,
    label: `Fixture race ${index + 2}`,
    baseHp: index + 10,
    startingSpellCharges: index === 5 ? 1 : 0,
    effectIds: [],
  })),
  classes: Array.from({ length: 11 }, (_, index) => ({
    id: definition(`fixture.class_${index + 2}`),
    total: index + 2,
    label: `Fixture class ${index + 2}`,
    hpModifier: index % 3,
    startingSpellCharges: 0,
    weapon: {
      definitionId: definition('fixture.training_weapon'),
      label: 'Project fixture weapon',
      hands: 1,
    },
    effectIds: [],
  })),
  spells: Object.fromEntries(
    Array.from({ length: 6 }, (_, index) => [
      index + 1,
      { id: definition(`fixture.spell_${index + 1}`), label: `Fixture spell ${index + 1}` },
    ]),
  ),
};

afterEach(async () => {
  await Promise.all(
    databases.splice(0).map(async (database) => {
      database.close();
      await database.delete();
    }),
  );
});

async function harness(faultPoint?: PersistenceFaultPoint) {
  const database = await createNoteQuestDatabase(
    createNoteQuestTestDatabaseName(`adventurer-creation-${++databaseCounter}`),
  );
  databases.push(database);
  await database.open();
  const initialized = await initializeSaveSlotFoundation(database, () => timestamp);
  if (!initialized.ok) throw new Error(initialized.error.message);
  const repositories = createDexiePersistenceRepositories(database);
  const faults = createPersistenceFaultController();
  if (faultPoint !== undefined) faults.arm(faultPoint);
  let nextId = 0;
  const service = new AdventurerCreationService({
    slots: repositories.slots,
    records: repositories.records,
    coordinator: createDexieActionTransactionCoordinator(
      database,
      {},
      () => timestamp,
      faultPoint === undefined ? undefined : faults,
    ),
    content,
    rulesVersion,
    contentVersion,
    masterSeedForSlot: () => '0x0000000000000080',
    newId: () => `00000000-0000-4000-8000-${String(++nextId).padStart(12, '0')}`,
    now: () => timestamp,
  });
  return { database, repositories, service };
}

function command() {
  return {
    type: 'create_adventurer' as const,
    module: 'adventurer' as const,
    slotId: NOTEQUEST_SLOT_IDS[0],
    playerAuthoredName: 'Local fixture hero',
    creationMode: 'canonical_random' as const,
    metadata: {
      commandId: 'create.persistence-fixture' as CommandId,
      idempotencyKey: 'create.persistence-fixture' as IdempotencyKey,
    },
  };
}

describe('adventurer creation persistence', () => {
  it('atomically persists state, private identity, versions, evidence, and a valid snapshot', async () => {
    const { database, repositories, service } = await harness();
    const prepared = await service.prepare(command());
    if (!prepared.ok) throw new Error(prepared.message);
    const committed = await service.commit(prepared.prepared);
    expect(committed).toMatchObject({ ok: true, committed: true, stateRevision: 1 });

    const slot = await repositories.slots.get(NOTEQUEST_SLOT_IDS[0]);
    expect(slot).toMatchObject({
      ok: true,
      value: {
        revision: 1,
        status: 'ready',
        rulesVersion,
        contentVersion,
        currentSnapshotId: 'last-valid',
        lastValidSnapshotId: 'last-valid',
        integrityStatus: 'valid',
      },
    });
    expect(await database.snapshots.get([NOTEQUEST_SLOT_IDS[0], 'last-valid'])).toMatchObject({
      sourceRevision: 1,
      schemaVersion: 1,
    });
    expect(await database.events.get([NOTEQUEST_SLOT_IDS[0], 1])).toMatchObject({
      eventType: 'adventurer_created',
      body: { metadata: { rulesVersion, contentVersion } },
    });

    const reloadedService = new AdventurerCreationService({
      slots: repositories.slots,
      records: repositories.records,
      coordinator: createDexieActionTransactionCoordinator(database, {}, () => timestamp),
      content,
      rulesVersion,
      contentVersion,
      masterSeedForSlot: () => '0x0000000000000080',
      newId: () => {
        throw new Error('Reload must not draw or allocate creation results.');
      },
      now: () => timestamp,
    });
    await expect(reloadedService.loadCommitted(NOTEQUEST_SLOT_IDS[0])).resolves.toMatchObject({
      ok: true,
      state: prepared.prepared.state,
      evidence: prepared.prepared.evidence,
      event: prepared.prepared.event,
      playerAuthoredName: 'Local fixture hero',
    });
    const durableBeforeInspection = {
      records: await database.records.toArray(),
      events: await database.events.toArray(),
      snapshots: await database.snapshots.toArray(),
    };
    await expect(reloadedService.loadCommitted(NOTEQUEST_SLOT_IDS[0])).resolves.toMatchObject({
      ok: true,
      state: prepared.prepared.state,
      evidence: prepared.prepared.evidence,
    });
    expect(await database.records.toArray()).toEqual(durableBeforeInspection.records);
    expect(await database.events.toArray()).toEqual(durableBeforeInspection.events);
    expect(await database.snapshots.toArray()).toEqual(durableBeforeInspection.snapshots);
  });

  it('cancels a prepared creation without persisting partial state or consuming on reload', async () => {
    const { database, repositories, service } = await harness();
    const prepared = await service.prepare(command());
    expect(prepared).toMatchObject({ ok: true });
    expect(service.cancel()).toMatchObject({ ok: false, kind: 'cancelled' });
    await expect(database.records.count()).resolves.toBe(0);
    await expect(database.events.count()).resolves.toBe(0);
    await expect(database.snapshots.count()).resolves.toBe(0);
    await expect(service.loadCommitted(NOTEQUEST_SLOT_IDS[0])).resolves.toBeNull();
    await expect(repositories.slots.get(NOTEQUEST_SLOT_IDS[0])).resolves.toMatchObject({
      ok: true,
      value: { revision: 0, status: 'empty' },
    });
  });

  it('rolls back every creation record and leaves the slot empty after a save fault', async () => {
    const { database, repositories, service } = await harness('transaction.after-required-writes');
    const prepared = await service.prepare(command());
    if (!prepared.ok) throw new Error(prepared.message);
    await expect(service.commit(prepared.prepared)).resolves.toMatchObject({
      ok: false,
      committed: false,
    });
    await expect(database.records.count()).resolves.toBe(0);
    await expect(database.events.count()).resolves.toBe(0);
    await expect(database.snapshots.count()).resolves.toBe(0);
    await expect(repositories.slots.get(NOTEQUEST_SLOT_IDS[0])).resolves.toMatchObject({
      ok: true,
      value: { revision: 0, status: 'empty', currentSnapshotId: null },
    });
  });

  it('reconciles a lost commit receipt and does not append a duplicate event on retry', async () => {
    const { database, service } = await harness('transaction.after-completion-before-receipt');
    const prepared = await service.prepare(command());
    if (!prepared.ok) throw new Error(prepared.message);

    await expect(service.commit(prepared.prepared)).resolves.toMatchObject({
      ok: true,
      committed: true,
      stateRevision: 1,
      state: prepared.prepared.state,
      evidence: prepared.prepared.evidence,
    });
    await expect(service.commit(prepared.prepared)).resolves.toMatchObject({
      ok: true,
      committed: true,
      stateRevision: 1,
    });
    await expect(database.events.count()).resolves.toBe(1);
    const randomResults = (await database.records.toArray()).filter(
      (record) => record.recordType === 'random-result',
    );
    expect(randomResults).toHaveLength(prepared.prepared.rollRecords.length);
  });
});
