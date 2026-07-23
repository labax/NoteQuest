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

export const repositoryFixtureSlotId = '123e4567-e89b-42d3-a456-426614174066' as SaveSlotId;

export const repositoryWorkspaceFixture = {
  key: 'release.current',
  value: { schemaVersion: 1, releaseId: 'test-release' },
  updatedAt: '2026-07-23T00:00:00.000Z',
} as const satisfies WorkspaceEntry;

export const repositorySlotFixture = {
  slotId: repositoryFixtureSlotId,
  updatedAt: '2026-07-23T00:00:01.000Z',
  status: 'ready',
  schemaVersion: 1,
  rulesVersion: 'rules.test@0.1',
  contentVersion: 'content.test@0.1',
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
