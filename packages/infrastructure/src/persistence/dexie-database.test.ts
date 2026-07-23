import 'fake-indexeddb/auto';

import { describe, expect, it } from 'vitest';

import {
  applyNoteQuestSchema,
  createNoteQuestDatabase,
  createNoteQuestDatabaseWithDexie,
  type DexieSchemaBuilder,
} from './dexie-database';
import {
  NOTEQUEST_DATABASE_NAME,
  NOTEQUEST_INITIAL_MIGRATION_PLACEHOLDER,
  NOTEQUEST_INITIAL_SCHEMA,
  NOTEQUEST_SCHEMA_OWNERSHIP,
  NOTEQUEST_SCHEMA_VERSION,
  NOTEQUEST_SCHEMA_MIGRATION_PLACEHOLDERS,
  NOTEQUEST_STORE_DEFINITIONS,
  createNoteQuestTestDatabaseName,
  NOTEQUEST_STORE_NAMES,
} from './schema';

const expectedStores = [
  'workspace',
  'slots',
  'records',
  'events',
  'snapshots',
  'contentPackages',
  'staging',
] as const;

function readObjectStoreNames(database: IDBDatabase): string[] {
  return Array.from(database.objectStoreNames).sort();
}

function createUniqueSchemaOpenDatabaseName(): string {
  return createNoteQuestTestDatabaseName(`schema-open-smoke-${Date.now()}-${process.pid}`);
}

class RecordingDexieDatabase {
  static databaseNames: string[] = [];

  schemaVersion?: number;
  schema?: Record<string, string>;

  constructor(databaseName: string) {
    RecordingDexieDatabase.databaseNames.push(databaseName);
  }

  version(versionNumber: number): DexieSchemaBuilder {
    this.schemaVersion = versionNumber;
    return {
      stores: (schema) => {
        this.schema = schema;
      },
    };
  }
}

describe('NoteQuest Dexie schema', () => {
  it('defines the approved physical stores and schema version', () => {
    expect(NOTEQUEST_SCHEMA_VERSION).toBe(1);
    expect(NOTEQUEST_STORE_NAMES).toEqual(expectedStores);
    expect(Object.keys(NOTEQUEST_STORE_DEFINITIONS)).toEqual(expectedStores);
    expect(Object.keys(NOTEQUEST_INITIAL_SCHEMA)).toEqual(expectedStores);
    expect(Object.keys(NOTEQUEST_SCHEMA_OWNERSHIP)).toEqual(expectedStores);
  });

  it('reserves the first sequential schema migration placeholder', () => {
    expect(NOTEQUEST_INITIAL_MIGRATION_PLACEHOLDER).toEqual({
      fromVersion: 1,
      toVersion: 2,
      migrationId: 'schema-1-to-2-reserved',
      status: 'reserved',
      purpose: 'Reserved registration point for the first approved sequential schema evolution.',
    });
    expect(NOTEQUEST_SCHEMA_MIGRATION_PLACEHOLDERS).toEqual([
      NOTEQUEST_INITIAL_MIGRATION_PLACEHOLDER,
    ]);
  });

  it('defines each store primary key explicitly', () => {
    expect(NOTEQUEST_STORE_DEFINITIONS.workspace.primaryKey).toBe('key');
    expect(NOTEQUEST_STORE_DEFINITIONS.slots.primaryKey).toBe('slotId');
    expect(NOTEQUEST_STORE_DEFINITIONS.records.primaryKey).toBe('[slotId+recordType+recordId]');
    expect(NOTEQUEST_STORE_DEFINITIONS.events.primaryKey).toBe('[slotId+sequence]');
    expect(NOTEQUEST_STORE_DEFINITIONS.snapshots.primaryKey).toBe('[slotId+snapshotClass]');
    expect(NOTEQUEST_STORE_DEFINITIONS.contentPackages.primaryKey).toBe('[packageId+version]');
    expect(NOTEQUEST_STORE_DEFINITIONS.staging.primaryKey).toBe('stageId');
  });

  it('defines indexes for slot isolation, record lookup, event ordering, snapshots, content, and staging', () => {
    expect(NOTEQUEST_STORE_DEFINITIONS.records.indexes).toEqual([
      '[slotId+recordType]',
      '[slotId+ownerType+ownerId]',
      '[slotId+locationType+locationId]',
      '[slotId+dungeonId+recordType]',
      '[slotId+expeditionId+recordType]',
      '[slotId+updatedAt]',
    ]);
    expect(NOTEQUEST_STORE_DEFINITIONS.events.indexes).toEqual([
      '[slotId+timestamp]',
      '[slotId+eventType+sequence]',
      '[slotId+dungeonId+sequence]',
      '[slotId+expeditionId+sequence]',
      '[slotId+aggregateType+aggregateId+sequence]',
      '[slotId+retentionClass+sequence]',
    ]);
    expect(NOTEQUEST_STORE_DEFINITIONS.snapshots.indexes).toEqual([
      '[slotId+createdAt]',
      '[slotId+schemaVersion]',
      '[slotId+sourceRevision]',
    ]);
    expect(NOTEQUEST_STORE_DEFINITIONS.contentPackages.indexes).toEqual([
      'hash',
      'approvalStatus',
      'installedAt',
      '[rulesVersion+schemaCompatibility]',
    ]);
    expect(NOTEQUEST_STORE_DEFINITIONS.staging.indexes).toEqual([
      '[targetSlotId+createdAt]',
      'stageType',
      'status',
      'expiresAt',
    ]);
  });

  it('derives Dexie store strings from the primary key and indexes', () => {
    for (const storeName of NOTEQUEST_STORE_NAMES) {
      const { primaryKey, indexes } = NOTEQUEST_STORE_DEFINITIONS[storeName];

      expect(NOTEQUEST_INITIAL_SCHEMA[storeName]).toBe([primaryKey, ...indexes].join(', '));
    }
  });

  it('applies the initial schema to a Dexie-compatible database instance', () => {
    const database = new RecordingDexieDatabase('schema-smoke-test');

    applyNoteQuestSchema(database);

    expect(database.schemaVersion).toBe(NOTEQUEST_SCHEMA_VERSION);
    expect(database.schema).toEqual(NOTEQUEST_INITIAL_SCHEMA);
  });

  it('opens the initial schema in a clean IndexedDB test database', async () => {
    const testDatabaseName = createUniqueSchemaOpenDatabaseName();
    const database = await createNoteQuestDatabase(testDatabaseName);

    try {
      await database.open();

      expect(readObjectStoreNames(database.backendDB())).toEqual([...expectedStores].sort());
    } finally {
      database.close();
      await database.delete();
    }
  });

  it('constructs the default application database name through the Dexie boundary', () => {
    RecordingDexieDatabase.databaseNames = [];

    const database = createNoteQuestDatabaseWithDexie(RecordingDexieDatabase);

    expect(RecordingDexieDatabase.databaseNames).toEqual([NOTEQUEST_DATABASE_NAME]);
    expect(database.schemaVersion).toBe(NOTEQUEST_SCHEMA_VERSION);
    expect(database.schema).toEqual(NOTEQUEST_INITIAL_SCHEMA);
  });
});
