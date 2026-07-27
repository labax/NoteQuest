import type {
  ContentPackageRecord,
  EventRecord,
  PersistedRecord,
  SlotRecord,
  SnapshotRecord,
  StagingRecord,
  WorkspaceEntry,
} from '@notequest/application';
import type { SaveSlotId } from '@notequest/domain';

export type SyntheticPersistenceState =
  'empty' | 'valid' | 'large' | 'recoverable' | 'invalid' | 'incompatible';

export interface SyntheticPersistenceFixture {
  readonly state: SyntheticPersistenceState;
  readonly slot: SlotRecord;
  readonly records: readonly PersistedRecord[];
  readonly events: readonly EventRecord[];
  readonly snapshots: readonly SnapshotRecord[];
  readonly staging: readonly StagingRecord[];
}

export interface LargePersistenceFixtureOptions {
  /** A deliberately explicit scale knob for later quota and performance suites. */
  readonly recordCount?: number;
  readonly eventCount?: number;
}

export type SyntheticWorkflowPlaceholder = 'import' | 'migration';

export const repositoryFixtureSlotId = '00000000-0000-4000-8000-000000000001' as SaveSlotId;

export const repositoryWorkspaceFixture = {
  key: 'release.current',
  value: { schemaVersion: 1, releaseId: 'test-release' },
  updatedAt: '2026-07-23T00:00:00.000Z',
} as const satisfies WorkspaceEntry;

export const repositorySlotFixture = {
  slotId: repositoryFixtureSlotId,
  slotIndex: 1,
  displayName: 'Save 1',
  revision: 1,
  createdAt: '2026-07-23T00:00:00.000Z',
  updatedAt: '2026-07-23T00:00:01.000Z',
  status: 'ready',
  schemaVersion: 1,
  rulesVersion: 'rules.test@0.1',
  contentVersion: 'content.test@0.1',
  currentSnapshotId: 'snapshot.fixture',
  lastValidSnapshotId: 'snapshot.fixture',
  recoveryAvailable: true,
  integrityStatus: 'valid',
} as const satisfies SlotRecord;

export const repositoryRecordFixture = {
  slotId: repositoryFixtureSlotId,
  recordType: 'adventurer',
  recordId: 'adventurer.fixture',
  ownerType: 'slot',
  ownerId: repositoryFixtureSlotId,
  updatedAt: '2026-07-23T00:00:02.000Z',
  body: { hp: 6, name: 'Synthetic repository fixture' },
} as const satisfies PersistedRecord;

export const repositoryEventFixture = {
  slotId: repositoryFixtureSlotId,
  sequence: 1,
  timestamp: '2026-07-23T00:00:03.000Z',
  eventType: 'event.fixture_created',
  aggregateType: 'adventurer',
  aggregateId: 'adventurer.fixture',
  retentionClass: 'active',
  body: { summary: 'Synthetic repository event fixture.' },
} as const satisfies EventRecord;

export const repositorySnapshotFixture = {
  slotId: repositoryFixtureSlotId,
  snapshotClass: 'last-valid',
  createdAt: '2026-07-23T00:00:04.000Z',
  schemaVersion: 1,
  sourceRevision: 1,
  body: { stateRootId: 'state.fixture' },
} as const satisfies SnapshotRecord;

export const repositoryContentPackageFixture = {
  packageId: 'content.fixture',
  version: '0.1.0',
  hash: 'sha256:fixture',
  approvalStatus: 'selected',
  installedAt: '2026-07-23T00:00:05.000Z',
  rulesVersion: 'rules.test@0.1',
  schemaCompatibility: 'schema-1',
  manifest: { entries: [] },
} as const satisfies ContentPackageRecord;

export const repositoryStagingFixture = {
  stageId: 'stage.fixture',
  targetSlotId: repositoryFixtureSlotId,
  createdAt: '2026-07-23T00:00:06.000Z',
  stageType: 'import-validation',
  status: 'pending',
  body: { validation: 'not-started' },
} as const satisfies StagingRecord;

const fixtureTimestamp = (offset: number): string =>
  `2026-07-23T00:00:${String(offset).padStart(2, '0')}.000Z`;

function fixtureSlot(overrides: Partial<SlotRecord> = {}): SlotRecord {
  return { ...repositorySlotFixture, ...overrides };
}

function fixtureRecord(index: number): PersistedRecord {
  const id = `synthetic-record-${String(index).padStart(4, '0')}`;
  return {
    slotId: repositoryFixtureSlotId,
    recordType: 'fixture-state',
    recordId: id,
    ownerType: 'slot',
    ownerId: repositoryFixtureSlotId,
    updatedAt: fixtureTimestamp(10),
    body: { id, ordinal: index, marker: `deterministic-value-${index % 17}` },
  };
}

function fixtureEvent(sequence: number): EventRecord {
  return {
    slotId: repositoryFixtureSlotId,
    sequence,
    timestamp: fixtureTimestamp(20),
    eventType: 'fixture.synthetic_transition',
    aggregateType: 'fixture-state',
    aggregateId: `synthetic-record-${String(sequence - 1).padStart(4, '0')}`,
    retentionClass: 'active',
    body: { sequence, outcome: `synthetic-outcome-${sequence % 11}` },
  };
}

export function createEmptyPersistenceFixture(): SyntheticPersistenceFixture {
  return {
    state: 'empty',
    slot: fixtureSlot({
      revision: 0,
      status: 'empty',
      schemaVersion: null,
      rulesVersion: null,
      contentVersion: null,
      currentSnapshotId: null,
      lastValidSnapshotId: null,
      recoveryAvailable: false,
      integrityStatus: 'not_checked',
    }),
    records: [],
    events: [],
    snapshots: [],
    staging: [],
  };
}

export function createValidPersistenceFixture(): SyntheticPersistenceFixture {
  return {
    state: 'valid',
    slot: fixtureSlot(),
    records: [fixtureRecord(0)],
    events: [fixtureEvent(1)],
    snapshots: [{ ...repositorySnapshotFixture }],
    staging: [],
  };
}

export function createLargePersistenceFixture(
  options: LargePersistenceFixtureOptions = {},
): SyntheticPersistenceFixture {
  const recordCount = options.recordCount ?? 256;
  const eventCount = options.eventCount ?? 512;
  if (!Number.isSafeInteger(recordCount) || recordCount < 1) {
    throw new RangeError('recordCount must be a positive safe integer.');
  }
  if (!Number.isSafeInteger(eventCount) || eventCount < 1) {
    throw new RangeError('eventCount must be a positive safe integer.');
  }

  return {
    state: 'large',
    slot: fixtureSlot({ revision: eventCount }),
    records: Array.from({ length: recordCount }, (_, index) => fixtureRecord(index)),
    events: Array.from({ length: eventCount }, (_, index) => fixtureEvent(index + 1)),
    snapshots: [
      {
        ...repositorySnapshotFixture,
        sourceRevision: eventCount,
        body: { recordCount, eventCount, stateRootId: 'synthetic-large-root' },
      },
    ],
    staging: [],
  };
}

export function createRecoverablePersistenceFixture(): SyntheticPersistenceFixture {
  const valid = createValidPersistenceFixture();
  return {
    ...valid,
    state: 'recoverable',
    slot: fixtureSlot({
      revision: 2,
      currentSnapshotId: null,
      lastValidSnapshotId: 'last-valid',
      integrityStatus: 'invalid',
      status: 'isolated',
    }),
    records: [{ ...fixtureRecord(0), body: { integrity: 'synthetic-current-state-invalid' } }],
    staging: [
      {
        ...repositoryStagingFixture,
        stageType: 'recovery-validation',
        body: { sourceSnapshotClass: 'last-valid', validation: 'pending' },
      },
    ],
  };
}

export function createProtectedSnapshotPersistenceFixture(): SyntheticPersistenceFixture {
  const recoverable = createRecoverablePersistenceFixture();
  return {
    ...recoverable,
    snapshots: (['last-valid', 'pre-migration', 'pre-import', 'pre-reset'] as const).map(
      (snapshotClass) => ({
        ...repositorySnapshotFixture,
        snapshotClass,
        body: {
          stateRootId: `synthetic-${snapshotClass}-root`,
          selectionMarker: snapshotClass,
        },
      }),
    ),
  };
}

function createWorkflowPlaceholderPersistenceFixture(
  workflow: SyntheticWorkflowPlaceholder,
): SyntheticPersistenceFixture {
  const valid = createValidPersistenceFixture();
  const snapshotClass = workflow === 'import' ? 'pre-import' : 'pre-migration';
  return {
    ...valid,
    state: 'recoverable',
    slot: fixtureSlot({ status: workflow === 'import' ? 'importing' : 'migrating' }),
    snapshots: [
      ...valid.snapshots,
      {
        ...repositorySnapshotFixture,
        snapshotClass,
        body: {
          stateRootId: `synthetic-${snapshotClass}-root`,
          sourceRevision: valid.slot.revision,
        },
      },
    ],
    staging: [
      {
        ...repositoryStagingFixture,
        stageId: `stage.synthetic-${workflow}`,
        stageType: `${workflow}-validation`,
        body:
          workflow === 'import'
            ? { phase: 'parsed', sourceSchemaVersion: 1, syntheticEntryCount: 1 }
            : {
                phase: 'reserved',
                migrationId: 'schema-1-to-2-reserved',
                fromSchemaVersion: 1,
                toSchemaVersion: 2,
              },
      },
    ],
  };
}

export function createImportPlaceholderPersistenceFixture(): SyntheticPersistenceFixture {
  return createWorkflowPlaceholderPersistenceFixture('import');
}

export function createMigrationPlaceholderPersistenceFixture(): SyntheticPersistenceFixture {
  return createWorkflowPlaceholderPersistenceFixture('migration');
}

export function createQuotaPlaceholderPersistenceFixture(
  options: LargePersistenceFixtureOptions = {},
): SyntheticPersistenceFixture {
  const large = createLargePersistenceFixture({
    recordCount: options.recordCount ?? 1_024,
    eventCount: options.eventCount ?? 2_048,
  });
  return {
    ...large,
    snapshots: large.snapshots.map((snapshot) => ({
      ...snapshot,
      body: {
        ...(snapshot.body as Record<string, unknown>),
        quotaScenario: 'synthetic-pressure-candidate',
      },
    })),
  };
}

export function createInvalidPersistenceFixture(): SyntheticPersistenceFixture {
  return {
    state: 'invalid',
    slot: fixtureSlot({
      status: 'isolated',
      integrityStatus: 'invalid',
      currentSnapshotId: null,
      lastValidSnapshotId: null,
      recoveryAvailable: false,
    }),
    records: [{ ...fixtureRecord(0), body: { integrity: 'synthetic-reference-missing' } }],
    events: [fixtureEvent(1)],
    snapshots: [],
    staging: [],
  };
}

export function createIncompatiblePersistenceFixture(): SyntheticPersistenceFixture {
  const unsupportedSchemaVersion = 2;
  return {
    state: 'incompatible',
    slot: fixtureSlot({
      status: 'isolated',
      schemaVersion: unsupportedSchemaVersion,
      integrityStatus: 'invalid',
      currentSnapshotId: null,
      lastValidSnapshotId: null,
      recoveryAvailable: false,
    }),
    records: [],
    events: [],
    snapshots: [
      {
        ...repositorySnapshotFixture,
        schemaVersion: unsupportedSchemaVersion,
        body: { compatibility: 'synthetic-unsupported-newer-schema' },
      },
    ],
    staging: [],
  };
}
