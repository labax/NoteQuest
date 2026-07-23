import 'fake-indexeddb/auto';

import { describe, expect, it } from 'vitest';

import type { ActionCommitEnvelope } from '@notequest/application';
import {
  createDexieActionTransactionCoordinator,
  createDexiePersistenceRepositories,
  createNoteQuestDatabase,
  createNoteQuestTestDatabaseName,
} from '@notequest/infrastructure';
import {
  repositoryEventFixture,
  repositoryFixtureSlotId,
  repositoryRecordFixture,
  repositorySlotFixture,
  repositorySnapshotFixture,
  repositoryWorkspaceFixture,
} from '@notequest/test-support';

let integrationDatabaseCounter = 0;

function createIntegrationTestDatabaseName(): string {
  integrationDatabaseCounter += 1;
  return createNoteQuestTestDatabaseName(`action-commit-integration-${integrationDatabaseCounter}`);
}

function createIntegrationEnvelope(
  overrides: Partial<ActionCommitEnvelope> = {},
): ActionCommitEnvelope {
  return {
    actionId: 'integration.action.commit',
    slotId: repositoryFixtureSlotId,
    expectedRevision: 0,
    stateRecords: [repositoryRecordFixture],
    randomStreamRecords: [
      {
        ...repositoryRecordFixture,
        recordType: 'random-stream',
        recordId: 'random-stream.integration',
        body: { algorithm: 'pcg32', drawCount: 7, state: 'state-after-integration' },
      },
    ],
    randomResultRecords: [
      {
        ...repositoryRecordFixture,
        recordType: 'random-result',
        recordId: 'roll.integration',
        body: { natural: 5, result: 'integration-outcome' },
      },
    ],
    events: [repositoryEventFixture],
    slotMetadata: repositorySlotFixture,
    recoveryPointers: {
      snapshots: [repositorySnapshotFixture],
      workspaceEntries: [
        {
          ...repositoryWorkspaceFixture,
          key: `slot.${repositoryFixtureSlotId}.integrationRecoveryPointer`,
          value: { snapshotClass: 'last-valid', sourceRevision: 1 },
        },
      ],
    },
    ...overrides,
  };
}

async function withIntegrationDatabase<T>(
  run: (context: {
    readonly database: Awaited<ReturnType<typeof createNoteQuestDatabase>>;
    readonly repositories: ReturnType<typeof createDexiePersistenceRepositories>;
    readonly coordinator: ReturnType<typeof createDexieActionTransactionCoordinator>;
  }) => Promise<T>,
): Promise<T> {
  const database = await createNoteQuestDatabase(createIntegrationTestDatabaseName());

  try {
    await database.open();
    const repositories = createDexiePersistenceRepositories(database);
    const coordinator = createDexieActionTransactionCoordinator(database);
    return await run({ database, repositories, coordinator });
  } finally {
    database.close();
    await database.delete();
  }
}

describe('action commit transaction integration', () => {
  it('successfully commits all action persistence categories through public package entrypoints', async () => {
    await withIntegrationDatabase(async ({ repositories, coordinator }) => {
      const result = await coordinator.commit(createIntegrationEnvelope());

      expect(result).toMatchObject({
        ok: true,
        committed: true,
        duplicate: false,
        stateRevision: 1,
      });
      await expect(repositories.slots.get(repositoryFixtureSlotId)).resolves.toEqual({
        ok: true,
        value: repositorySlotFixture,
      });
      await expect(
        repositories.records.get(repositoryFixtureSlotId, 'adventurer', 'adventurer.fixture'),
      ).resolves.toEqual({ ok: true, value: repositoryRecordFixture });
      await expect(
        repositories.records.get(
          repositoryFixtureSlotId,
          'random-stream',
          'random-stream.integration',
        ),
      ).resolves.toMatchObject({ ok: true });
      await expect(
        repositories.records.get(repositoryFixtureSlotId, 'random-result', 'roll.integration'),
      ).resolves.toMatchObject({ ok: true });
      await expect(repositories.events.get(repositoryFixtureSlotId, 1)).resolves.toEqual({
        ok: true,
        value: repositoryEventFixture,
      });
      await expect(
        repositories.snapshots.get(repositoryFixtureSlotId, 'last-valid'),
      ).resolves.toEqual({ ok: true, value: repositorySnapshotFixture });
      await expect(
        repositories.workspace.get(`slot.${repositoryFixtureSlotId}.integrationRecoveryPointer`),
      ).resolves.toMatchObject({ ok: true });
    });
  });

  it('returns no success and leaves no partial writes when an in-transaction write throws', async () => {
    await withIntegrationDatabase(async ({ database, repositories, coordinator }) => {
      const previousSlot = { ...repositorySlotFixture, status: 'previous-valid' };
      const previousRecord = {
        ...repositoryRecordFixture,
        body: { hp: 4, name: 'Previous integration state' },
      };
      await expect(repositories.slots.put(previousSlot)).resolves.toMatchObject({ ok: true });
      await expect(repositories.records.put(previousRecord)).resolves.toMatchObject({ ok: true });

      const originalBulkPut = database.records.bulkPut.bind(database.records);
      const thrownCause = new Error('forced integration bulkPut failure');
      database.records.bulkPut = (async () =>
        Promise.reject(thrownCause)) as unknown as typeof database.records.bulkPut;

      try {
        const result = await coordinator.commit(createIntegrationEnvelope());

        expect(result).toMatchObject({
          ok: false,
          committed: false,
          duplicate: false,
          error: { code: 'transaction_failed', cause: thrownCause },
        });
      } finally {
        database.records.bulkPut = originalBulkPut;
      }

      await expect(repositories.slots.get(repositoryFixtureSlotId)).resolves.toEqual({
        ok: true,
        value: previousSlot,
      });
      await expect(
        repositories.records.get(repositoryFixtureSlotId, 'adventurer', 'adventurer.fixture'),
      ).resolves.toEqual({ ok: true, value: previousRecord });
      await expect(repositories.events.get(repositoryFixtureSlotId, 1)).resolves.toMatchObject({
        ok: false,
        error: { code: 'missing_record' },
      });
      await expect(
        repositories.snapshots.get(repositoryFixtureSlotId, 'last-valid'),
      ).resolves.toMatchObject({ ok: false, error: { code: 'missing_record' } });
    });
  });
});
