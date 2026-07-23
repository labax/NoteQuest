import type { Table } from 'dexie';

import {
  NOTEQUEST_DATABASE_NAME,
  NOTEQUEST_INITIAL_SCHEMA,
  NOTEQUEST_SCHEMA_VERSION,
} from './schema';

export interface WorkspaceRow {
  key: string;
  value: unknown;
  updatedAt?: string;
}
export interface SlotRow {
  slotId: string;
  updatedAt: string;
  status: string;
  schemaVersion: number;
  rulesVersion: string;
  contentVersion: string;
}
export interface RecordRow {
  slotId: string;
  recordType: string;
  recordId: string;
  ownerType?: string;
  ownerId?: string;
  locationType?: string;
  locationId?: string;
  dungeonId?: string;
  expeditionId?: string;
  updatedAt: string;
  body: unknown;
}
export interface EventRow {
  slotId: string;
  sequence: number;
  timestamp: string;
  eventType: string;
  dungeonId?: string;
  expeditionId?: string;
  aggregateType?: string;
  aggregateId?: string;
  retentionClass: string;
  body: unknown;
}
export interface SnapshotRow {
  slotId: string;
  snapshotClass: 'last-valid' | 'pre-migration' | 'pre-import' | 'pre-reset';
  createdAt: string;
  schemaVersion: number;
  sourceRevision: number;
  body: unknown;
}
export interface ContentPackageRow {
  packageId: string;
  version: string;
  hash: string;
  approvalStatus: string;
  installedAt: string;
  rulesVersion: string;
  schemaCompatibility: string;
  manifest: unknown;
}
export interface StagingRow {
  stageId: string;
  targetSlotId?: string;
  createdAt: string;
  stageType: string;
  status: string;
  expiresAt?: string;
  body: unknown;
}

export type NoteQuestTable<TEntity, TKey> = Table<TEntity, TKey>;

export interface DexieSchemaBuilder {
  stores(schema: Record<string, string>): unknown;
}

export interface DexieSchemaHost {
  version(versionNumber: number): DexieSchemaBuilder;
}

export interface DexieConstructor<TDatabase extends DexieSchemaHost = DexieSchemaHost> {
  new (databaseName: string): TDatabase;
}

export type NoteQuestDexieLifecycle = {
  open(): Promise<unknown>;
  close(): void;
  delete(): Promise<void>;
  backendDB(): IDBDatabase;
};

export type NoteQuestDexieDatabase = DexieSchemaHost &
  NoteQuestDexieLifecycle & {
    workspace: NoteQuestTable<WorkspaceRow, string>;
    slots: NoteQuestTable<SlotRow, string>;
    records: NoteQuestTable<RecordRow, [string, string, string]>;
    events: NoteQuestTable<EventRow, [string, number]>;
    snapshots: NoteQuestTable<SnapshotRow, [string, SnapshotRow['snapshotClass']]>;
    contentPackages: NoteQuestTable<ContentPackageRow, [string, string]>;
    staging: NoteQuestTable<StagingRow, string>;
  };

export function applyNoteQuestSchema(database: DexieSchemaHost): void {
  database.version(NOTEQUEST_SCHEMA_VERSION).stores(NOTEQUEST_INITIAL_SCHEMA);
}

export function createNoteQuestDatabaseWithDexie<TDatabase extends DexieSchemaHost>(
  DexieDatabase: DexieConstructor<TDatabase>,
  databaseName = NOTEQUEST_DATABASE_NAME,
): TDatabase & NoteQuestDexieDatabase {
  const database = new DexieDatabase(databaseName) as TDatabase & NoteQuestDexieDatabase;
  applyNoteQuestSchema(database);
  return database;
}

export async function createNoteQuestDatabase(
  databaseName = NOTEQUEST_DATABASE_NAME,
): Promise<NoteQuestDexieDatabase> {
  const DexieDatabase = (await import('dexie')).default as DexieConstructor;
  return createNoteQuestDatabaseWithDexie(DexieDatabase, databaseName);
}
