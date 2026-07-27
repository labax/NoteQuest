import 'fake-indexeddb/auto';

import { describe, expect, it } from 'vitest';

import {
  repositoryContentPackageFixture,
  repositoryEventFixture,
  repositoryFixtureSlotId,
  repositoryRecordFixture,
  repositorySlotFixture,
  repositorySnapshotFixture,
  repositoryStagingFixture,
  repositoryWorkspaceFixture,
} from '@notequest/test-support';

import { createNoteQuestDatabase } from './dexie-database';
import {
  DexieRecordRepository,
  DexieWorkspaceRepository,
  createDexiePersistenceRepositories,
  mapContentPackageRow,
  mapRecordRow,
  toContentPackageRow,
  toRecordRow,
} from './dexie-repositories';
import type { RecordRow, WorkspaceRow } from './dexie-database';
import type { Table } from 'dexie';
import { createNoteQuestTestDatabaseName } from './schema';

let repositoryDatabaseCounter = 0;

function createRepositoryTestDatabaseName(): string {
  repositoryDatabaseCounter += 1;
  return createNoteQuestTestDatabaseName(`repository-${repositoryDatabaseCounter}`);
}

type PersistenceRepositorySet = ReturnType<typeof createDexiePersistenceRepositories>;

interface RepositoryTestContext {
  readonly databaseName: string;
  readonly repositories: PersistenceRepositorySet;
}

async function withRepositories<T>(
  run: (context: RepositoryTestContext) => Promise<T>,
): Promise<T> {
  const databaseName = createRepositoryTestDatabaseName();
  const database = await createNoteQuestDatabase(databaseName);

  try {
    await database.open();
    return await run({ databaseName, repositories: createDexiePersistenceRepositories(database) });
  } finally {
    database.close();
    await database.delete();
  }
}

describe('Dexie persistence repositories', () => {
  it('writes and reads workspace, slot, record, event, snapshot, content package, and staging records', async () => {
    await withRepositories(async ({ repositories }) => {
      await expect(repositories.workspace.put(repositoryWorkspaceFixture)).resolves.toMatchObject({
        ok: true,
      });
      await expect(repositories.slots.put(repositorySlotFixture)).resolves.toMatchObject({
        ok: true,
      });
      await expect(repositories.records.put(repositoryRecordFixture)).resolves.toMatchObject({
        ok: true,
      });
      await expect(repositories.events.append(repositoryEventFixture)).resolves.toMatchObject({
        ok: true,
      });
      await expect(repositories.snapshots.put(repositorySnapshotFixture)).resolves.toMatchObject({
        ok: true,
      });
      await expect(
        repositories.contentPackages.put(repositoryContentPackageFixture),
      ).resolves.toMatchObject({ ok: true });
      await expect(repositories.staging.put(repositoryStagingFixture)).resolves.toMatchObject({
        ok: true,
      });

      await expect(repositories.workspace.get(repositoryWorkspaceFixture.key)).resolves.toEqual({
        ok: true,
        value: repositoryWorkspaceFixture,
      });
      await expect(repositories.slots.get(repositoryFixtureSlotId)).resolves.toEqual({
        ok: true,
        value: repositorySlotFixture,
      });
      await expect(
        repositories.records.get(repositoryFixtureSlotId, 'adventurer', 'adventurer.fixture'),
      ).resolves.toEqual({ ok: true, value: repositoryRecordFixture });
      await expect(repositories.events.get(repositoryFixtureSlotId, 1)).resolves.toEqual({
        ok: true,
        value: repositoryEventFixture,
      });
      await expect(
        repositories.snapshots.get(repositoryFixtureSlotId, 'last-valid'),
      ).resolves.toEqual({ ok: true, value: repositorySnapshotFixture });
      await expect(repositories.contentPackages.get('content.fixture', '0.1.0')).resolves.toEqual({
        ok: true,
        value: repositoryContentPackageFixture,
      });
      await expect(repositories.staging.get('stage.fixture')).resolves.toEqual({
        ok: true,
        value: repositoryStagingFixture,
      });
    });
  });

  it('keeps adapter tests isolated across unique test databases', async () => {
    await withRepositories(async (first) => {
      await withRepositories(async (second) => {
        expect(first.databaseName).not.toBe(second.databaseName);

        await expect(
          first.repositories.workspace.put(repositoryWorkspaceFixture),
        ).resolves.toMatchObject({
          ok: true,
        });

        await expect(
          second.repositories.workspace.get(repositoryWorkspaceFixture.key),
        ).resolves.toEqual({
          ok: false,
          error: {
            code: 'missing_record',
            entity: 'workspace entry',
            message: 'workspace entry was not found.',
          },
        });

        await expect(
          first.repositories.workspace.get(repositoryWorkspaceFixture.key),
        ).resolves.toEqual({
          ok: true,
          value: repositoryWorkspaceFixture,
        });
      });
    });
  });

  it('maps persisted DTO payloads to application-facing records without sharing mutable payload references', () => {
    const recordBody = { nested: { hp: 6 } };
    const recordRow = toRecordRow({ ...repositoryRecordFixture, body: recordBody });

    recordBody.nested.hp = 1;
    expect(recordRow.body).toEqual({ nested: { hp: 6 } });

    const applicationRecord = mapRecordRow(recordRow);
    expect(applicationRecord).toEqual({ ...repositoryRecordFixture, body: { nested: { hp: 6 } } });

    (applicationRecord.body as { nested: { hp: number } }).nested.hp = 2;
    expect(recordRow.body).toEqual({ nested: { hp: 6 } });

    const manifest = { entries: [{ id: 'content.fixture.entry' }] };
    const packageRow = toContentPackageRow({ ...repositoryContentPackageFixture, manifest });
    manifest.entries[0] = { id: 'mutated' };
    expect(packageRow.manifest).toEqual({ entries: [{ id: 'content.fixture.entry' }] });

    const applicationPackage = mapContentPackageRow(packageRow);
    expect(applicationPackage).toEqual({
      ...repositoryContentPackageFixture,
      manifest: { entries: [{ id: 'content.fixture.entry' }] },
    });
  });

  it('translates unavailable storage, failed reads and writes, invalid records, and validation failures', async () => {
    await withRepositories(async ({ repositories }) => {
      await expect(repositories.workspace.get('missing')).resolves.toEqual({
        ok: false,
        error: {
          code: 'missing_record',
          entity: 'workspace entry',
          message: 'workspace entry was not found.',
        },
      });

      await expect(
        repositories.events.append({ ...repositoryEventFixture, sequence: 0 }),
      ).resolves.toEqual({
        ok: false,
        error: {
          code: 'validation_failure',
          entity: 'event',
          message: 'sequence must be positive.',
        },
      });

      const readCause = new Error('forced IndexedDB read failure');
      const failingReadWorkspaceTable = {
        get: async () => Promise.reject(readCause),
      } as unknown as Table<WorkspaceRow, string>;

      await expect(
        new DexieWorkspaceRepository(failingReadWorkspaceTable).get('release.current'),
      ).resolves.toEqual({
        ok: false,
        error: {
          code: 'read_failure',
          entity: 'workspace entry',
          message: 'workspace entry read failed at the storage boundary.',
          cause: readCause,
        },
      });

      const unavailableCause = new Error('IndexedDB API unavailable');
      unavailableCause.name = 'MissingAPIError';
      const unavailableWorkspaceTable = {
        get: async () => Promise.reject(unavailableCause),
      } as unknown as Table<WorkspaceRow, string>;

      await expect(
        new DexieWorkspaceRepository(unavailableWorkspaceTable).get('release.current'),
      ).resolves.toEqual({
        ok: false,
        error: {
          code: 'storage_unavailable',
          entity: 'workspace entry',
          message: 'workspace entry storage is unavailable in this environment.',
          cause: unavailableCause,
        },
      });

      const writeCause = new Error('forced IndexedDB write failure');
      const failingWriteWorkspaceTable = {
        put: async () => Promise.reject(writeCause),
      } as unknown as Table<WorkspaceRow, string>;

      await expect(
        new DexieWorkspaceRepository(failingWriteWorkspaceTable).put(repositoryWorkspaceFixture),
      ).resolves.toEqual({
        ok: false,
        error: {
          code: 'write_failure',
          entity: 'workspace entry',
          message: 'workspace entry write failed at the storage boundary.',
          cause: writeCause,
        },
      });

      const acceptingRecordTable = {
        put: async () => Promise.resolve(),
      } as unknown as Table<RecordRow, [string, string, string]>;

      await expect(
        new DexieRecordRepository(acceptingRecordTable).put({
          ...repositoryRecordFixture,
          body: { unsupported: () => 'not cloneable' },
        }),
      ).resolves.toMatchObject({
        ok: false,
        error: {
          code: 'invalid_record',
          entity: 'record',
          message: 'record contains data that cannot be stored safely.',
        },
      });
    });
  });
});
