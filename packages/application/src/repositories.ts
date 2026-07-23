import type { SaveSlotId } from '@notequest/domain';

export type RepositoryErrorCode =
  | 'missing_record'
  | 'validation_failure'
  | 'invalid_record'
  | 'storage_unavailable'
  | 'read_failure'
  | 'write_failure'
  | 'storage_failure';

export interface RepositoryError {
  readonly code: RepositoryErrorCode;
  readonly message: string;
  readonly entity?: string;
  readonly cause?: unknown;
}

export type RepositoryResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: RepositoryError };

export interface WorkspaceEntry {
  readonly key: string;
  readonly value: unknown;
  readonly updatedAt?: string;
}

export interface SlotRecord {
  readonly slotId: SaveSlotId;
  readonly updatedAt: string;
  readonly status: string;
  readonly schemaVersion: number;
  readonly rulesVersion: string;
  readonly contentVersion: string;
}

export interface PersistedRecord {
  readonly slotId: SaveSlotId;
  readonly recordType: string;
  readonly recordId: string;
  readonly ownerType?: string;
  readonly ownerId?: string;
  readonly locationType?: string;
  readonly locationId?: string;
  readonly dungeonId?: string;
  readonly expeditionId?: string;
  readonly updatedAt: string;
  readonly body: unknown;
}

export interface EventRecord {
  readonly slotId: SaveSlotId;
  readonly sequence: number;
  readonly timestamp: string;
  readonly eventType: string;
  readonly dungeonId?: string;
  readonly expeditionId?: string;
  readonly aggregateType?: string;
  readonly aggregateId?: string;
  readonly retentionClass: string;
  readonly body: unknown;
}

export type SnapshotClass = 'last-valid' | 'pre-migration' | 'pre-import' | 'pre-reset';

export interface SnapshotRecord {
  readonly slotId: SaveSlotId;
  readonly snapshotClass: SnapshotClass;
  readonly createdAt: string;
  readonly schemaVersion: number;
  readonly sourceRevision: number;
  readonly body: unknown;
}

export interface ContentPackageRecord {
  readonly packageId: string;
  readonly version: string;
  readonly hash: string;
  readonly approvalStatus: string;
  readonly installedAt: string;
  readonly rulesVersion: string;
  readonly schemaCompatibility: string;
  readonly manifest: unknown;
}

export interface StagingRecord {
  readonly stageId: string;
  readonly targetSlotId?: SaveSlotId;
  readonly createdAt: string;
  readonly stageType: string;
  readonly status: string;
  readonly expiresAt?: string;
  readonly body: unknown;
}

export interface WorkspaceRepository {
  get(key: string): Promise<RepositoryResult<WorkspaceEntry>>;
  put(entry: WorkspaceEntry): Promise<RepositoryResult<WorkspaceEntry>>;
}

export interface SlotRepository {
  get(slotId: SaveSlotId): Promise<RepositoryResult<SlotRecord>>;
  put(slot: SlotRecord): Promise<RepositoryResult<SlotRecord>>;
}

export interface RecordRepository {
  get(
    slotId: SaveSlotId,
    recordType: string,
    recordId: string,
  ): Promise<RepositoryResult<PersistedRecord>>;
  put(record: PersistedRecord): Promise<RepositoryResult<PersistedRecord>>;
  listByType(
    slotId: SaveSlotId,
    recordType: string,
  ): Promise<RepositoryResult<readonly PersistedRecord[]>>;
}

export interface EventRepository {
  get(slotId: SaveSlotId, sequence: number): Promise<RepositoryResult<EventRecord>>;
  append(event: EventRecord): Promise<RepositoryResult<EventRecord>>;
  listForSlot(slotId: SaveSlotId): Promise<RepositoryResult<readonly EventRecord[]>>;
}

export interface SnapshotRepository {
  get(slotId: SaveSlotId, snapshotClass: SnapshotClass): Promise<RepositoryResult<SnapshotRecord>>;
  put(snapshot: SnapshotRecord): Promise<RepositoryResult<SnapshotRecord>>;
}

export interface ContentPackageRepository {
  get(packageId: string, version: string): Promise<RepositoryResult<ContentPackageRecord>>;
  put(contentPackage: ContentPackageRecord): Promise<RepositoryResult<ContentPackageRecord>>;
}

export interface StagingRepository {
  get(stageId: string): Promise<RepositoryResult<StagingRecord>>;
  put(stagingRecord: StagingRecord): Promise<RepositoryResult<StagingRecord>>;
}

export interface PersistenceRepositories {
  readonly workspace: WorkspaceRepository;
  readonly slots: SlotRepository;
  readonly records: RecordRepository;
  readonly events: EventRepository;
  readonly snapshots: SnapshotRepository;
  readonly contentPackages: ContentPackageRepository;
  readonly staging: StagingRepository;
}

export function repositorySuccess<T>(value: T): RepositoryResult<T> {
  return { ok: true, value };
}

export function repositoryFailure(error: RepositoryError): RepositoryResult<never> {
  return { ok: false, error };
}
