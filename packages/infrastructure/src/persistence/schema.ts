export const NOTEQUEST_DATABASE_NAME = 'notequest-local-workspace';
export const NOTEQUEST_TEST_DATABASE_PREFIX = 'notequest-test-workspace';
export const NOTEQUEST_SCHEMA_VERSION = 1;

export type NoteQuestSchemaMigrationPlaceholder = {
  readonly fromVersion: number;
  readonly toVersion: number;
  readonly migrationId: string;
  readonly status: 'reserved';
  readonly purpose: string;
};

export const NOTEQUEST_INITIAL_MIGRATION_PLACEHOLDER = {
  fromVersion: NOTEQUEST_SCHEMA_VERSION,
  toVersion: NOTEQUEST_SCHEMA_VERSION + 1,
  migrationId: 'schema-1-to-2-reserved',
  status: 'reserved',
  purpose: 'Reserved registration point for the first approved sequential schema evolution.',
} as const satisfies NoteQuestSchemaMigrationPlaceholder;

export const NOTEQUEST_SCHEMA_MIGRATION_PLACEHOLDERS = [
  NOTEQUEST_INITIAL_MIGRATION_PLACEHOLDER,
] as const;

export const NOTEQUEST_STORE_NAMES = [
  'workspace',
  'slots',
  'records',
  'events',
  'snapshots',
  'contentPackages',
  'staging',
] as const;

export type NoteQuestStoreName = (typeof NOTEQUEST_STORE_NAMES)[number];

export type NoteQuestStoreDefinition = {
  readonly primaryKey: string;
  readonly indexes: readonly string[];
  readonly owner: 'application' | 'slot' | 'content' | 'staging';
  readonly purpose: string;
};

export const NOTEQUEST_STORE_DEFINITIONS = {
  workspace: {
    primaryKey: 'key',
    indexes: [],
    owner: 'application',
    purpose:
      'Application workspace metadata, release/content markers, preferences, and upkeep state.',
  },
  slots: {
    primaryKey: 'slotId',
    indexes: ['updatedAt', 'status', '[schemaVersion+status]', '[rulesVersion+contentVersion]'],
    owner: 'application',
    purpose: 'Stable save-slot metadata, revisions, health, compatibility, and snapshot pointers.',
  },
  records: {
    primaryKey: '[slotId+recordType+recordId]',
    indexes: [
      '[slotId+recordType]',
      '[slotId+ownerType+ownerId]',
      '[slotId+locationType+locationId]',
      '[slotId+dungeonId+recordType]',
      '[slotId+expeditionId+recordType]',
      '[slotId+updatedAt]',
    ],
    owner: 'slot',
    purpose:
      'Slot-owned normalized current domain records grouped by type, ownership, location, and scope.',
  },
  events: {
    primaryKey: '[slotId+sequence]',
    indexes: [
      '[slotId+timestamp]',
      '[slotId+eventType+sequence]',
      '[slotId+dungeonId+sequence]',
      '[slotId+expeditionId+sequence]',
      '[slotId+aggregateType+aggregateId+sequence]',
      '[slotId+retentionClass+sequence]',
    ],
    owner: 'slot',
    purpose: 'Slot-owned immutable mechanical event evidence ordered by per-slot sequence.',
  },
  snapshots: {
    primaryKey: '[slotId+snapshotClass]',
    indexes: ['[slotId+createdAt]', '[slotId+schemaVersion]', '[slotId+sourceRevision]'],
    owner: 'slot',
    purpose:
      'Slot-owned protected recovery packages for last-valid and pre-operation restore points.',
  },
  contentPackages: {
    primaryKey: '[packageId+version]',
    indexes: ['hash', 'approvalStatus', 'installedAt', '[rulesVersion+schemaCompatibility]'],
    owner: 'content',
    purpose: 'Approved versioned content definitions needed by releases and durable saves.',
  },
  staging: {
    primaryKey: 'stageId',
    indexes: ['[targetSlotId+createdAt]', 'stageType', 'status', 'expiresAt'],
    owner: 'staging',
    purpose:
      'Inactive import, migration, validation, and recovery work isolated from active state.',
  },
} as const satisfies Record<NoteQuestStoreName, NoteQuestStoreDefinition>;

export const NOTEQUEST_INITIAL_SCHEMA = Object.fromEntries(
  NOTEQUEST_STORE_NAMES.map((storeName) => {
    const { primaryKey, indexes } = NOTEQUEST_STORE_DEFINITIONS[storeName];
    return [storeName, [primaryKey, ...indexes].join(', ')];
  }),
) as Record<NoteQuestStoreName, string>;

export const NOTEQUEST_SCHEMA_OWNERSHIP = Object.fromEntries(
  NOTEQUEST_STORE_NAMES.map((storeName) => [
    storeName,
    NOTEQUEST_STORE_DEFINITIONS[storeName].purpose,
  ]),
) as Record<NoteQuestStoreName, string>;

export function createNoteQuestTestDatabaseName(suffix: string): string {
  return `${NOTEQUEST_TEST_DATABASE_PREFIX}-${suffix}`;
}
