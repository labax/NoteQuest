import 'fake-indexeddb/auto';

import { describe, expect, it } from 'vitest';
import { generateAndEnterPalace, loadPalaceRun } from '@notequest/application';
import {
  createDexieActionTransactionCoordinator,
  createDexiePersistenceRepositories,
  createNoteQuestDatabase,
  createNoteQuestTestDatabaseName,
  initializeSaveSlotFoundation,
} from '@notequest/infrastructure';
import { repositoryFixtureSlotId } from '@notequest/test-support';

describe('Palace generation persistence', () => {
  it('atomically persists and reloads the committed graph without rerolling', async () => {
    const database = await createNoteQuestDatabase(
      createNoteQuestTestDatabaseName('palace-generation-reload'),
    );
    try {
      await database.open();
      const initialized = await initializeSaveSlotFoundation(
        database,
        () => '2026-08-12T00:00:00.000Z',
      );
      if (!initialized.ok) throw new Error(initialized.error.message);
      const repositories = createDexiePersistenceRepositories(database);
      const coordinator = createDexieActionTransactionCoordinator(database);
      const generated = await generateAndEnterPalace(
        {
          actionId: 'integration.generate-palace',
          slotId: repositoryFixtureSlotId,
          adventurer: {
            adventurerId: '00000000-0000-4000-8000-000000000002',
            lifeState: 'alive',
            location: 'town',
          },
          expeditionId: '00000000-0000-4000-8000-000000000003',
          seed: '0x0000000000000001',
          light: { physical: 2, virtual: 0 },
          selectedLightSource: 'physical',
          finalLightConfirmed: false,
          expectedRevision: 0,
          expectedEventSequence: 1,
          now: '2026-08-12T00:00:00.000Z',
        },
        {
          packageId: 'palace',
          contentVersion: '0.1.0',
          rulesVersion: 'digital-rules-specification-v0.1',
          entranceDefinitionId: 'palace.entrance.prototype',
          entranceConnectionCount: 2,
          validationEvidence: ['manifest:palace@0.1.0'],
        },
        coordinator,
      );
      if (!generated.ok) throw new Error(generated.error.message);

      const reloaded = await loadPalaceRun(
        repositoryFixtureSlotId,
        generated.dungeon.dungeonId,
        '00000000-0000-4000-8000-000000000003',
        repositories.records,
      );
      expect(reloaded).toMatchObject({
        ok: true,
        dungeon: generated.dungeon,
        expedition: {
          currentSegmentId: generated.dungeon.currentSegmentId,
          physicalLight: 1,
          virtualLight: 0,
        },
      });
      await expect(
        repositories.records.listByType(repositoryFixtureSlotId, 'dungeon-floor'),
      ).resolves.toMatchObject({ ok: true, value: [{ body: generated.dungeon.floors[0] }] });
      await expect(
        repositories.records.listByType(repositoryFixtureSlotId, 'generation-evidence'),
      ).resolves.toMatchObject({
        ok: true,
        value: [{ body: generated.dungeon.generationEvidence }],
      });
    } finally {
      database.close();
      await database.delete();
    }
  });
});
