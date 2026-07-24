import type {
  ContentPackageRecord,
  ContentPackageRepository,
  EventRecord,
  EventRepository,
  PersistedRecord,
  PersistenceRepositories,
  RecordRepository,
  RepositoryError,
  RepositoryResult,
  SlotRecord,
  SlotRepository,
  SnapshotClass,
  SnapshotRecord,
  SnapshotRepository,
  StagingRecord,
  StagingRepository,
  WorkspaceEntry,
  WorkspaceRepository,
} from '@notequest/application';
import { repositoryFailure, repositorySuccess } from '@notequest/application';
import type { SaveSlotId } from '@notequest/domain';
import type { Table } from 'dexie';

import type {
  ContentPackageRow,
  EventRow,
  NoteQuestDexieDatabase,
  RecordRow,
  SlotRow,
  SnapshotRow,
  StagingRow,
  WorkspaceRow,
} from './dexie-database';

function isPresent<T>(value: T | undefined): value is T {
  return value !== undefined;
}

function missing(entity: string): RepositoryResult<never> {
  return repositoryFailure({ code: 'missing_record', entity, message: `${entity} was not found.` });
}

type StorageOperation = 'read' | 'write';

function translateStorageError(
  entity: string,
  operation: StorageOperation,
  cause: unknown,
): RepositoryResult<never> {
  const errorName = cause instanceof Error ? cause.name : undefined;

  if (errorName === 'MissingAPIError' || errorName === 'SecurityError') {
    return repositoryFailure({
      code: 'storage_unavailable',
      entity,
      message: `${entity} storage is unavailable in this environment.`,
      cause,
    });
  }

  if (operation === 'write' && errorName === 'DataCloneError') {
    return repositoryFailure({
      code: 'invalid_record',
      entity,
      message: `${entity} contains data that cannot be stored safely.`,
      cause,
    });
  }

  return repositoryFailure({
    code: operation === 'read' ? 'read_failure' : 'write_failure',
    entity,
    message: `${entity} ${operation} failed at the storage boundary.`,
    cause,
  });
}

export function requireString(
  value: string,
  field: string,
  entity: string,
): RepositoryError | null {
  return value.trim() === ''
    ? { code: 'validation_failure', entity, message: `${field} is required.` }
    : null;
}

export function validateWorkspaceEntry(entry: WorkspaceEntry): RepositoryError | null {
  return requireString(entry.key, 'key', 'workspace entry');
}

export function validateSlotRecord(slot: SlotRecord): RepositoryError | null {
  return requireString(slot.slotId, 'slotId', 'slot');
}

export function validatePersistedRecord(record: PersistedRecord): RepositoryError | null {
  return requireString(record.recordId, 'recordId', 'record');
}

export function validateEventRecord(event: EventRecord): RepositoryError | null {
  return event.sequence < 1
    ? { code: 'validation_failure', entity: 'event', message: 'sequence must be positive.' }
    : null;
}

export function validateSnapshotRecord(snapshot: SnapshotRecord): RepositoryError | null {
  return snapshot.sourceRevision < 0
    ? {
        code: 'validation_failure',
        entity: 'snapshot',
        message: 'sourceRevision cannot be negative.',
      }
    : null;
}

export function validateContentPackageRecord(
  contentPackage: ContentPackageRecord,
): RepositoryError | null {
  return requireString(contentPackage.packageId, 'packageId', 'content package');
}

export function validateStagingRecord(stagingRecord: StagingRecord): RepositoryError | null {
  return requireString(stagingRecord.stageId, 'stageId', 'staging record');
}

function clonePersistedPayload<T>(payload: T): T {
  return structuredClone(payload) as T;
}

async function readOne<TRow, TValue>(
  entity: string,
  operation: () => Promise<TRow | undefined>,
  map: (row: TRow) => TValue,
): Promise<RepositoryResult<TValue>> {
  try {
    const row = await operation();
    return isPresent(row) ? repositorySuccess(map(row)) : missing(entity);
  } catch (cause) {
    return translateStorageError(entity, 'read', cause);
  }
}

async function writeOne<TValue>(
  entity: string,
  value: TValue,
  validate: () => RepositoryError | null,
  operation: () => Promise<unknown>,
): Promise<RepositoryResult<TValue>> {
  const validationError = validate();

  if (validationError !== null) {
    return repositoryFailure(validationError);
  }

  try {
    await operation();
    return repositorySuccess(value);
  } catch (cause) {
    return translateStorageError(entity, 'write', cause);
  }
}

export class DexieWorkspaceRepository implements WorkspaceRepository {
  constructor(private readonly table: Table<WorkspaceRow, string>) {}

  async get(key: string): Promise<RepositoryResult<WorkspaceEntry>> {
    return readOne('workspace entry', () => this.table.get(key), mapWorkspaceRow);
  }

  async put(entry: WorkspaceEntry): Promise<RepositoryResult<WorkspaceEntry>> {
    return writeOne(
      'workspace entry',
      entry,
      () => validateWorkspaceEntry(entry),
      () => this.table.put(toWorkspaceRow(entry)),
    );
  }
}

export class DexieSlotRepository implements SlotRepository {
  constructor(private readonly table: Table<SlotRow, string>) {}

  async get(slotId: SaveSlotId): Promise<RepositoryResult<SlotRecord>> {
    return readOne('slot', () => this.table.get(slotId), mapSlotRow);
  }

  async put(slot: SlotRecord): Promise<RepositoryResult<SlotRecord>> {
    return writeOne(
      'slot',
      slot,
      () => validateSlotRecord(slot),
      () => this.table.put(toSlotRow(slot)),
    );
  }
}

export class DexieRecordRepository implements RecordRepository {
  constructor(private readonly table: Table<RecordRow, [string, string, string]>) {}

  async get(
    slotId: SaveSlotId,
    recordType: string,
    recordId: string,
  ): Promise<RepositoryResult<PersistedRecord>> {
    return readOne('record', () => this.table.get([slotId, recordType, recordId]), mapRecordRow);
  }

  async put(record: PersistedRecord): Promise<RepositoryResult<PersistedRecord>> {
    return writeOne(
      'record',
      record,
      () => validatePersistedRecord(record),
      () => this.table.put(toRecordRow(record)),
    );
  }

  async listByType(
    slotId: SaveSlotId,
    recordType: string,
  ): Promise<RepositoryResult<readonly PersistedRecord[]>> {
    try {
      return repositorySuccess(
        (await this.table.where('[slotId+recordType]').equals([slotId, recordType]).toArray()).map(
          mapRecordRow,
        ),
      );
    } catch (cause) {
      return translateStorageError('record', 'read', cause);
    }
  }
}

export class DexieEventRepository implements EventRepository {
  constructor(private readonly table: Table<EventRow, [string, number]>) {}

  async get(slotId: SaveSlotId, sequence: number): Promise<RepositoryResult<EventRecord>> {
    return readOne('event', () => this.table.get([slotId, sequence]), mapEventRow);
  }

  async append(event: EventRecord): Promise<RepositoryResult<EventRecord>> {
    return writeOne(
      'event',
      event,
      () => validateEventRecord(event),
      () => this.table.add(toEventRow(event)),
    );
  }

  async listForSlot(slotId: SaveSlotId): Promise<RepositoryResult<readonly EventRecord[]>> {
    try {
      return repositorySuccess(
        (await this.table.where('slotId').equals(slotId).sortBy('sequence')).map(mapEventRow),
      );
    } catch (cause) {
      return translateStorageError('event', 'read', cause);
    }
  }
}

export class DexieSnapshotRepository implements SnapshotRepository {
  constructor(private readonly table: Table<SnapshotRow, [string, SnapshotClass]>) {}

  async get(
    slotId: SaveSlotId,
    snapshotClass: SnapshotClass,
  ): Promise<RepositoryResult<SnapshotRecord>> {
    return readOne('snapshot', () => this.table.get([slotId, snapshotClass]), mapSnapshotRow);
  }

  async put(snapshot: SnapshotRecord): Promise<RepositoryResult<SnapshotRecord>> {
    return writeOne(
      'snapshot',
      snapshot,
      () => validateSnapshotRecord(snapshot),
      () => this.table.put(toSnapshotRow(snapshot)),
    );
  }
}

export class DexieContentPackageRepository implements ContentPackageRepository {
  constructor(private readonly table: Table<ContentPackageRow, [string, string]>) {}

  async get(packageId: string, version: string): Promise<RepositoryResult<ContentPackageRecord>> {
    return readOne(
      'content package',
      () => this.table.get([packageId, version]),
      mapContentPackageRow,
    );
  }

  async put(contentPackage: ContentPackageRecord): Promise<RepositoryResult<ContentPackageRecord>> {
    return writeOne(
      'content package',
      contentPackage,
      () => validateContentPackageRecord(contentPackage),
      () => this.table.put(toContentPackageRow(contentPackage)),
    );
  }
}

export class DexieStagingRepository implements StagingRepository {
  constructor(private readonly table: Table<StagingRow, string>) {}

  async get(stageId: string): Promise<RepositoryResult<StagingRecord>> {
    return readOne('staging record', () => this.table.get(stageId), mapStagingRow);
  }

  async put(stagingRecord: StagingRecord): Promise<RepositoryResult<StagingRecord>> {
    return writeOne(
      'staging record',
      stagingRecord,
      () => validateStagingRecord(stagingRecord),
      () => this.table.put(toStagingRow(stagingRecord)),
    );
  }
}

export function createDexiePersistenceRepositories(
  database: NoteQuestDexieDatabase,
): PersistenceRepositories {
  return {
    workspace: new DexieWorkspaceRepository(database.workspace),
    slots: new DexieSlotRepository(database.slots),
    records: new DexieRecordRepository(database.records),
    events: new DexieEventRepository(database.events),
    snapshots: new DexieSnapshotRepository(database.snapshots),
    contentPackages: new DexieContentPackageRepository(database.contentPackages),
    staging: new DexieStagingRepository(database.staging),
  };
}

export function toWorkspaceRow(entry: WorkspaceEntry): WorkspaceRow {
  return { ...entry, value: clonePersistedPayload(entry.value) };
}

export function mapWorkspaceRow(row: WorkspaceRow): WorkspaceEntry {
  return { ...row, value: clonePersistedPayload(row.value) };
}

export function toSlotRow(slot: SlotRecord): SlotRow {
  return { ...slot };
}

export function mapSlotRow(row: SlotRow): SlotRecord {
  return { ...row, slotId: row.slotId as SaveSlotId };
}

export function toRecordRow(record: PersistedRecord): RecordRow {
  return { ...record, body: clonePersistedPayload(record.body) };
}

export function mapRecordRow(row: RecordRow): PersistedRecord {
  return { ...row, slotId: row.slotId as SaveSlotId, body: clonePersistedPayload(row.body) };
}

export function toEventRow(event: EventRecord): EventRow {
  return { ...event, body: clonePersistedPayload(event.body) };
}

export function mapEventRow(row: EventRow): EventRecord {
  return { ...row, slotId: row.slotId as SaveSlotId, body: clonePersistedPayload(row.body) };
}

export function toSnapshotRow(snapshot: SnapshotRecord): SnapshotRow {
  return { ...snapshot, body: clonePersistedPayload(snapshot.body) };
}

export function mapSnapshotRow(row: SnapshotRow): SnapshotRecord {
  return {
    ...row,
    slotId: row.slotId as SaveSlotId,
    snapshotClass: row.snapshotClass as SnapshotClass,
    body: clonePersistedPayload(row.body),
  };
}

export function toContentPackageRow(contentPackage: ContentPackageRecord): ContentPackageRow {
  return { ...contentPackage, manifest: clonePersistedPayload(contentPackage.manifest) };
}

export function mapContentPackageRow(row: ContentPackageRow): ContentPackageRecord {
  return { ...row, manifest: clonePersistedPayload(row.manifest) };
}

export function toStagingRow(stagingRecord: StagingRecord): StagingRow {
  return { ...stagingRecord, body: clonePersistedPayload(stagingRecord.body) };
}

export function mapStagingRow(row: StagingRow): StagingRecord {
  const base = {
    stageId: row.stageId,
    createdAt: row.createdAt,
    stageType: row.stageType,
    status: row.status,
    ...(row.expiresAt === undefined ? {} : { expiresAt: row.expiresAt }),
    body: clonePersistedPayload(row.body),
  };

  return row.targetSlotId === undefined
    ? base
    : { ...base, targetSlotId: row.targetSlotId as SaveSlotId };
}
