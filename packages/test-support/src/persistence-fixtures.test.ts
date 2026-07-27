import { describe, expect, it } from 'vitest';

import {
  createEmptyPersistenceFixture,
  createIncompatiblePersistenceFixture,
  createImportPlaceholderPersistenceFixture,
  createInvalidPersistenceFixture,
  createLargePersistenceFixture,
  createMigrationPlaceholderPersistenceFixture,
  createProtectedSnapshotPersistenceFixture,
  createQuotaPlaceholderPersistenceFixture,
  createRecoverablePersistenceFixture,
  createValidPersistenceFixture,
} from './persistence-fixtures';

describe('synthetic persistence fixture builders', () => {
  it('builds each representative state with explicit integrity and recovery signals', () => {
    const empty = createEmptyPersistenceFixture();
    const valid = createValidPersistenceFixture();
    const recoverable = createRecoverablePersistenceFixture();
    const invalid = createInvalidPersistenceFixture();
    const incompatible = createIncompatiblePersistenceFixture();

    expect(empty).toMatchObject({ state: 'empty', slot: { status: 'empty' }, records: [] });
    expect(valid).toMatchObject({
      state: 'valid',
      slot: { integrityStatus: 'valid', recoveryAvailable: true },
    });
    expect(recoverable).toMatchObject({
      state: 'recoverable',
      slot: { status: 'isolated', recoveryAvailable: true },
      snapshots: [{ snapshotClass: 'last-valid' }],
    });
    expect(invalid).toMatchObject({
      state: 'invalid',
      slot: { integrityStatus: 'invalid', recoveryAvailable: false },
      snapshots: [],
    });
    expect(incompatible).toMatchObject({
      state: 'incompatible',
      slot: { status: 'isolated', schemaVersion: 2 },
      snapshots: [{ schemaVersion: 2 }],
    });
  });

  it('creates deterministic large fixtures at default and caller-selected scales', () => {
    expect(createLargePersistenceFixture()).toEqual(createLargePersistenceFixture());

    const boundary = createLargePersistenceFixture({ recordCount: 1, eventCount: 1 });
    expect(boundary.records).toHaveLength(1);
    expect(boundary.events).toHaveLength(1);
    expect(boundary.slot.revision).toBe(1);
    expect(boundary.snapshots[0]?.body).toEqual({
      recordCount: 1,
      eventCount: 1,
      stateRootId: 'synthetic-large-root',
    });
  });

  it('builds one deterministic recovery candidate for every protected snapshot class', () => {
    const fixture = createProtectedSnapshotPersistenceFixture();

    expect(fixture.state).toBe('recoverable');
    expect(fixture.snapshots.map(({ snapshotClass }) => snapshotClass)).toEqual([
      'last-valid',
      'pre-migration',
      'pre-import',
      'pre-reset',
    ]);
    expect(fixture.snapshots.map(({ body }) => body)).toEqual([
      { stateRootId: 'synthetic-last-valid-root', selectionMarker: 'last-valid' },
      { stateRootId: 'synthetic-pre-migration-root', selectionMarker: 'pre-migration' },
      { stateRootId: 'synthetic-pre-import-root', selectionMarker: 'pre-import' },
      { stateRootId: 'synthetic-pre-reset-root', selectionMarker: 'pre-reset' },
    ]);
  });

  it.each([
    {
      workflow: 'import',
      create: createImportPlaceholderPersistenceFixture,
      status: 'importing',
      snapshotClass: 'pre-import',
      stageType: 'import-validation',
    },
    {
      workflow: 'migration',
      create: createMigrationPlaceholderPersistenceFixture,
      status: 'migrating',
      snapshotClass: 'pre-migration',
      stageType: 'migration-validation',
    },
  ] as const)(
    'builds an isolated $workflow staging placeholder with its protected snapshot',
    ({ create, status, snapshotClass, stageType }) => {
      const fixture = create();

      expect(fixture).toMatchObject({
        state: 'recoverable',
        slot: { status },
        snapshots: [
          { snapshotClass: 'last-valid' },
          { snapshotClass, sourceRevision: fixture.slot.revision },
        ],
        staging: [{ stageType, status: 'pending' }],
      });
      expect(fixture.records).toHaveLength(1);
      expect(fixture.events).toHaveLength(1);
    },
  );

  it('builds a scalable quota-pressure placeholder without claiming a browser quota limit', () => {
    const fixture = createQuotaPlaceholderPersistenceFixture({ recordCount: 2, eventCount: 3 });

    expect(fixture).toMatchObject({
      state: 'large',
      slot: { revision: 3 },
      snapshots: [
        {
          body: {
            recordCount: 2,
            eventCount: 3,
            quotaScenario: 'synthetic-pressure-candidate',
          },
        },
      ],
    });
    expect(fixture.records).toHaveLength(2);
    expect(fixture.events).toHaveLength(3);
  });

  it('rejects invalid scale inputs and returns independent object graphs', () => {
    expect(() => createLargePersistenceFixture({ recordCount: 0 })).toThrow(RangeError);
    expect(() => createLargePersistenceFixture({ eventCount: 1.5 })).toThrow(RangeError);

    const first = createValidPersistenceFixture();
    const second = createValidPersistenceFixture();
    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    expect(first.slot).not.toBe(second.slot);
    expect(first.records).not.toBe(second.records);
  });
});
