import 'fake-indexeddb/auto';

import { describe, expect, it } from 'vitest';
import { PalaceEntryService } from '@notequest/application';
import {
  validatePalaceGenerationContent,
  authorizedPalaceEntranceManifest,
} from '@notequest/content';
import type { IdempotencyKey } from '@notequest/domain';
import {
  createDexieActionTransactionCoordinator,
  createDexiePersistenceRepositories,
  createNoteQuestDatabase,
  createNoteQuestTestDatabaseName,
  initializeSaveSlotFoundation,
} from '@notequest/infrastructure';
import { repositoryFixtureSlotId } from '@notequest/test-support';

const timestamp = '2026-08-12T00:00:00.000Z';

describe('Palace generation persistence', () => {
  it('enters with a canonical persisted adventurer and reloads without rerolling', async () => {
    const database = await createNoteQuestDatabase(createNoteQuestTestDatabaseName('palace-entry'));
    try {
      await database.open();
      const initialized = await initializeSaveSlotFoundation(database, () => timestamp);
      if (!initialized.ok) throw new Error(initialized.error.message);
      const repositories = createDexiePersistenceRepositories(database);
      const coordinator = createDexieActionTransactionCoordinator(database, {}, () => timestamp);
      const emptySlot = await repositories.slots.get(repositoryFixtureSlotId);
      if (!emptySlot.ok) throw new Error(emptySlot.error.message);
      const adventurerId = '00000000-0000-4000-8000-000000000002';
      const canonicalAdventurer = {
        adventurerId,
        raceId: 'race.synthetic',
        classId: 'class.guard',
        maxHp: 8,
        currentHp: 8,
        usableArms: 2,
        usableHands: 2,
        torches: 2,
        coins: 0,
        status: 'alive',
        location: 'town',
        backpackItemIds: [],
        armourItemIds: [],
        death: null,
        equipment: [],
        spellCharges: [],
        effectIds: [],
        effects: [],
        rulesVersion: 'digital-rules-specification-v0.1',
        contentVersion: 'authorized-notequest-adventurer-creation-v0.1',
      } as const;
      const creation = await coordinator.commit({
        actionId: 'integration.create-adventurer',
        idempotencyKey: 'integration-create-adventurer' as IdempotencyKey,
        slotId: repositoryFixtureSlotId,
        expectedRevision: 0,
        stateRecords: [
          {
            slotId: repositoryFixtureSlotId,
            recordType: 'adventurer',
            recordId: adventurerId,
            updatedAt: timestamp,
            body: canonicalAdventurer,
          },
        ],
        events: [
          {
            slotId: repositoryFixtureSlotId,
            sequence: 1,
            timestamp,
            eventType: 'adventurer_created',
            aggregateType: 'adventurer',
            aggregateId: adventurerId,
            retentionClass: 'mechanical-history',
            body: { adventurerId },
          },
        ],
        slotMetadata: {
          ...emptySlot.value,
          status: 'ready',
          schemaVersion: 1,
          rulesVersion: canonicalAdventurer.rulesVersion,
          contentVersion: canonicalAdventurer.contentVersion,
          integrityStatus: 'valid',
          updatedAt: timestamp,
        },
        recoveryPointers: {
          snapshots: [
            {
              slotId: repositoryFixtureSlotId,
              snapshotClass: 'last-valid',
              createdAt: timestamp,
              schemaVersion: 1,
              sourceRevision: 1,
              body: {
                stateRecords: [
                  { recordType: 'adventurer', recordId: adventurerId, body: canonicalAdventurer },
                ],
              },
            },
          ],
        },
      });
      expect(creation).toMatchObject({ ok: true, stateRevision: 1 });

      const adapted = validatePalaceGenerationContent(authorizedPalaceEntranceManifest);
      if (!adapted.ok) throw new Error(adapted.errors[0]?.reason);
      let id = 10;
      const service = new PalaceEntryService({
        slots: repositories.slots,
        records: repositories.records,
        events: repositories.events,
        snapshots: repositories.snapshots,
        coordinator,
        content: adapted.content,
        newId: () => `00000000-0000-4000-8000-${String(id++).padStart(12, '0')}`,
        now: () => timestamp,
      });
      const entered = await service.enter({
        actionId: 'integration.enter-palace',
        idempotencyKey: 'integration-enter-palace' as IdempotencyKey,
        slotId: repositoryFixtureSlotId,
        adventurerId,
        seed: '0x0000000000000001',
        finalLightConfirmed: false,
      });
      if (!entered.ok) throw new Error(entered.message);
      const reloaded = await service.load(repositoryFixtureSlotId);
      expect(reloaded).toMatchObject({ ok: true, dungeon: entered.dungeon });
      await expect(
        repositories.records.get(repositoryFixtureSlotId, 'adventurer', adventurerId),
      ).resolves.toMatchObject({
        ok: true,
        value: { body: { torches: 1, location: 'dungeon', status: 'alive' } },
      });
      const events = await repositories.events.listForSlot(repositoryFixtureSlotId);
      expect(events).toMatchObject({ ok: true, value: [{ sequence: 1 }, { sequence: 2 }] });
    } finally {
      database.close();
      await database.delete();
    }
  });
});
