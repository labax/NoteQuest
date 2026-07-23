import 'fake-indexeddb/auto';

import { describe, expect, it } from 'vitest';

import {
  repositoryEventFixture,
  repositoryFixtureSlotId,
  repositoryRecordFixture,
  repositorySlotFixture,
  repositorySnapshotFixture,
  repositoryWorkspaceFixture,
} from '@notequest/test-support';
import type { ActionCommitEnvelope, ActionTransactionDiagnostics } from '@notequest/application';
import type { IdempotencyKey } from '@notequest/domain';

import { createNoteQuestDatabase } from './dexie-database';
import { createDexiePersistenceRepositories } from './dexie-repositories';
import {
  actionCommitIdempotencyWorkspaceKey,
  createDexieActionTransactionCoordinator,
} from './dexie-action-transaction-coordinator';
import { createNoteQuestTestDatabaseName } from './schema';

const fixtureIdempotencyKey = 'fixture-idempotency-key' as IdempotencyKey;

let transactionDatabaseCounter = 0;

function createTransactionTestDatabaseName(): string {
  transactionDatabaseCounter += 1;
  return createNoteQuestTestDatabaseName(`action-transaction-${transactionDatabaseCounter}`);
}

async function withCoordinator<T>(
  run: (context: {
    readonly coordinator: ReturnType<typeof createDexieActionTransactionCoordinator>;
    readonly repositories: ReturnType<typeof createDexiePersistenceRepositories>;
  }) => Promise<T>,
  diagnostics: ActionTransactionDiagnostics = {},
): Promise<T> {
  const database = await createNoteQuestDatabase(createTransactionTestDatabaseName());

  try {
    await database.open();
    return await run({
      coordinator: createDexieActionTransactionCoordinator(database, diagnostics),
      repositories: createDexiePersistenceRepositories(database),
    });
  } finally {
    database.close();
    await database.delete();
  }
}

function createEnvelope(overrides: Partial<ActionCommitEnvelope> = {}): ActionCommitEnvelope {
  return {
    actionId: 'action.fixture.commit',
    slotId: repositoryFixtureSlotId,
    stateRecords: [repositoryRecordFixture],
    randomStreamRecords: [
      {
        ...repositoryRecordFixture,
        recordType: 'random-stream',
        recordId: 'random-stream.fixture',
        body: { algorithm: 'pcg32', drawCount: 1, state: 'state-after' },
      },
    ],
    randomResultRecords: [
      {
        ...repositoryRecordFixture,
        recordType: 'random-result',
        recordId: 'roll.fixture',
        body: { natural: 4, result: 'fixture-outcome' },
      },
    ],
    events: [repositoryEventFixture],
    slotMetadata: repositorySlotFixture,
    recoveryPointers: {
      snapshots: [repositorySnapshotFixture],
      workspaceEntries: [
        {
          ...repositoryWorkspaceFixture,
          key: `slot.${repositoryFixtureSlotId}.lastValidPointer`,
          value: { snapshotClass: 'last-valid', sourceRevision: 1 },
        },
      ],
    },
    ...overrides,
  };
}

describe('Dexie action transaction coordinator', () => {
  it('commits state records, events, random records, slot metadata, and recovery pointers atomically', async () => {
    const diagnosticEvents: string[] = [];

    await withCoordinator(
      async ({ coordinator, repositories }) => {
        const result = await coordinator.commit(createEnvelope());

        expect(result).toEqual({
          ok: true,
          actionId: 'action.fixture.commit',
          committed: true,
          duplicate: false,
          stateRevision: 1,
          written: {
            stateRecords: 1,
            events: 1,
            randomStreamRecords: 1,
            randomResultRecords: 1,
            slotMetadata: 1,
            recoverySnapshots: 1,
            recoveryWorkspaceEntries: 1,
            idempotencyMarkers: 0,
          },
        });

        await expect(repositories.slots.get(repositoryFixtureSlotId)).resolves.toEqual({
          ok: true,
          value: repositorySlotFixture,
        });
        await expect(
          repositories.records.get(
            repositoryFixtureSlotId,
            'random-stream',
            'random-stream.fixture',
          ),
        ).resolves.toMatchObject({ ok: true });
        await expect(
          repositories.records.get(repositoryFixtureSlotId, 'random-result', 'roll.fixture'),
        ).resolves.toMatchObject({ ok: true });
        await expect(repositories.events.get(repositoryFixtureSlotId, 1)).resolves.toEqual({
          ok: true,
          value: repositoryEventFixture,
        });
        await expect(repositories.events.get(repositoryFixtureSlotId, 2)).resolves.toMatchObject({
          ok: false,
          error: { code: 'missing_record' },
        });
        await expect(
          repositories.snapshots.get(repositoryFixtureSlotId, 'last-valid'),
        ).resolves.toEqual({ ok: true, value: repositorySnapshotFixture });
      },
      {
        transactionStarted: (_envelope, plannedWrites) => {
          diagnosticEvents.push(`started:${plannedWrites.events}`);
        },
        transactionCommitted: (_envelope, written) => {
          diagnosticEvents.push(`committed:${written.events}`);
        },
        transactionDuplicate: () => {
          diagnosticEvents.push('duplicate');
        },
        transactionAborted: () => {
          diagnosticEvents.push('aborted');
        },
      },
    );

    expect(diagnosticEvents).toEqual(['started:1', 'committed:1']);
  });

  it('aborts every write and preserves prior durable state when a required write fails', async () => {
    const diagnosticEvents: string[] = [];

    await withCoordinator(
      async ({ coordinator, repositories }) => {
        const previousSlot = { ...repositorySlotFixture, status: 'previous-valid' };
        const previousStateRecord = {
          ...repositoryRecordFixture,
          body: { hp: 3, name: 'Previous durable adventurer' },
        };
        const previousRandomStreamRecord = {
          ...repositoryRecordFixture,
          recordType: 'random-stream',
          recordId: 'random-stream.fixture',
          body: { algorithm: 'pcg32', drawCount: 0, state: 'state-before' },
        };
        const previousRandomResultRecord = {
          ...repositoryRecordFixture,
          recordType: 'random-result',
          recordId: 'roll.fixture',
          body: { natural: 2, result: 'previous-outcome' },
        };
        const previousSnapshot = {
          ...repositorySnapshotFixture,
          sourceRevision: 0,
          body: { stateRootId: 'previous-state.fixture' },
        };
        const previousRecoveryPointer = {
          ...repositoryWorkspaceFixture,
          key: `slot.${repositoryFixtureSlotId}.lastValidPointer`,
          value: { snapshotClass: 'last-valid', sourceRevision: 0 },
        };

        await expect(repositories.slots.put(previousSlot)).resolves.toMatchObject({ ok: true });
        await expect(repositories.records.put(previousStateRecord)).resolves.toMatchObject({
          ok: true,
        });
        await expect(repositories.records.put(previousRandomStreamRecord)).resolves.toMatchObject({
          ok: true,
        });
        await expect(repositories.records.put(previousRandomResultRecord)).resolves.toMatchObject({
          ok: true,
        });
        await expect(repositories.snapshots.put(previousSnapshot)).resolves.toMatchObject({
          ok: true,
        });
        await expect(repositories.workspace.put(previousRecoveryPointer)).resolves.toMatchObject({
          ok: true,
        });
        await expect(repositories.events.append(repositoryEventFixture)).resolves.toMatchObject({
          ok: true,
        });

        const result = await coordinator.commit(
          createEnvelope({
            slotMetadata: repositorySlotFixture,
            stateRecords: [
              {
                ...repositoryRecordFixture,
                body: { unsupported: () => 'not cloneable' },
              },
            ],
            events: [
              {
                ...repositoryEventFixture,
                sequence: 2,
                body: { summary: 'valid next event never reaches durable storage' },
              },
            ],
          }),
        );

        expect(result).toMatchObject({
          ok: false,
          actionId: 'action.fixture.commit',
          committed: false,
          error: { code: 'transaction_failed' },
        });

        await expect(repositories.slots.get(repositoryFixtureSlotId)).resolves.toEqual({
          ok: true,
          value: previousSlot,
        });
        await expect(
          repositories.records.get(repositoryFixtureSlotId, 'adventurer', 'adventurer.fixture'),
        ).resolves.toEqual({ ok: true, value: previousStateRecord });
        await expect(
          repositories.records.get(
            repositoryFixtureSlotId,
            'random-stream',
            'random-stream.fixture',
          ),
        ).resolves.toEqual({ ok: true, value: previousRandomStreamRecord });
        await expect(
          repositories.records.get(repositoryFixtureSlotId, 'random-result', 'roll.fixture'),
        ).resolves.toEqual({ ok: true, value: previousRandomResultRecord });
        await expect(
          repositories.snapshots.get(repositoryFixtureSlotId, 'last-valid'),
        ).resolves.toEqual({ ok: true, value: previousSnapshot });
        await expect(repositories.workspace.get(previousRecoveryPointer.key)).resolves.toEqual({
          ok: true,
          value: previousRecoveryPointer,
        });
        await expect(repositories.events.get(repositoryFixtureSlotId, 1)).resolves.toEqual({
          ok: true,
          value: repositoryEventFixture,
        });
        await expect(repositories.events.get(repositoryFixtureSlotId, 2)).resolves.toMatchObject({
          ok: false,
          error: { code: 'missing_record' },
        });
      },
      {
        transactionStarted: () => {
          diagnosticEvents.push('started');
        },
        transactionCommitted: () => {
          diagnosticEvents.push('committed');
        },
        transactionDuplicate: () => {
          diagnosticEvents.push('duplicate');
        },
        transactionAborted: (_envelope, error) => {
          diagnosticEvents.push(`aborted:${error.code}`);
        },
      },
    );

    expect(diagnosticEvents).toEqual(['started', 'aborted:transaction_failed']);
  });

  it('rejects invalid required writes before durable mutation or idempotency markers', async () => {
    const diagnosticEvents: string[] = [];

    await withCoordinator(
      async ({ coordinator, repositories }) => {
        const result = await coordinator.commit(
          createEnvelope({
            idempotencyKey: fixtureIdempotencyKey,
            stateRecords: [{ ...repositoryRecordFixture, recordId: '   ' }],
          }),
        );

        expect(result).toMatchObject({
          ok: false,
          actionId: 'action.fixture.commit',
          idempotencyKey: fixtureIdempotencyKey,
          committed: false,
          duplicate: false,
          error: {
            code: 'invalid_required_write',
            validationErrors: [
              {
                code: 'invalid_required_write',
                path: 'stateRecords.0',
                message: 'recordId is required.',
              },
            ],
          },
        });
        await expect(
          repositories.records.get(repositoryFixtureSlotId, 'adventurer', '   '),
        ).resolves.toMatchObject({ ok: false, error: { code: 'missing_record' } });
        await expect(
          repositories.workspace.get(
            actionCommitIdempotencyWorkspaceKey(repositoryFixtureSlotId, fixtureIdempotencyKey),
          ),
        ).resolves.toMatchObject({ ok: false, error: { code: 'missing_record' } });
      },
      {
        transactionStarted: () => {
          diagnosticEvents.push('started');
        },
        transactionCommitted: () => {
          diagnosticEvents.push('committed');
        },
        transactionDuplicate: () => {
          diagnosticEvents.push('duplicate');
        },
        transactionAborted: () => {
          diagnosticEvents.push('aborted');
        },
      },
    );

    expect(diagnosticEvents).toEqual([]);
  });

  it('rejects invalid recovery pointers before durable mutation or idempotency markers', async () => {
    await withCoordinator(async ({ coordinator, repositories }) => {
      const invalidSnapshotResult = await coordinator.commit(
        createEnvelope({
          idempotencyKey: fixtureIdempotencyKey,
          recoveryPointers: {
            snapshots: [{ ...repositorySnapshotFixture, sourceRevision: -1 }],
            workspaceEntries: [],
          },
        }),
      );

      expect(invalidSnapshotResult).toMatchObject({
        ok: false,
        committed: false,
        duplicate: false,
        error: {
          code: 'invalid_required_write',
          validationErrors: [
            {
              code: 'invalid_required_write',
              path: 'recoveryPointers.snapshots.0',
              message: 'sourceRevision cannot be negative.',
            },
          ],
        },
      });

      const invalidWorkspaceResult = await coordinator.commit(
        createEnvelope({
          idempotencyKey: fixtureIdempotencyKey,
          recoveryPointers: {
            snapshots: [],
            workspaceEntries: [{ ...repositoryWorkspaceFixture, key: '   ' }],
          },
        }),
      );

      expect(invalidWorkspaceResult).toMatchObject({
        ok: false,
        committed: false,
        duplicate: false,
        error: {
          code: 'invalid_required_write',
          validationErrors: [
            {
              code: 'invalid_required_write',
              path: 'recoveryPointers.workspaceEntries.0',
              message: 'key is required.',
            },
          ],
        },
      });

      await expect(
        repositories.records.get(repositoryFixtureSlotId, 'adventurer', 'adventurer.fixture'),
      ).resolves.toMatchObject({ ok: false, error: { code: 'missing_record' } });
      await expect(
        repositories.workspace.get(
          actionCommitIdempotencyWorkspaceKey(repositoryFixtureSlotId, fixtureIdempotencyKey),
        ),
      ).resolves.toMatchObject({ ok: false, error: { code: 'missing_record' } });
    });
  });

  it('rejects event sequence gaps before durable mutation or idempotency markers', async () => {
    const diagnosticEvents: string[] = [];

    await withCoordinator(
      async ({ coordinator, repositories }) => {
        await expect(repositories.events.append(repositoryEventFixture)).resolves.toMatchObject({
          ok: true,
        });

        const result = await coordinator.commit(
          createEnvelope({
            idempotencyKey: fixtureIdempotencyKey,
            expectedRevision: 1,
            events: [{ ...repositoryEventFixture, sequence: 3 }],
          }),
        );

        expect(result).toMatchObject({
          ok: false,
          actionId: 'action.fixture.commit',
          idempotencyKey: fixtureIdempotencyKey,
          committed: false,
          duplicate: false,
          error: {
            code: 'sequence_conflict',
            currentRevision: 1,
            expectedSequences: [2],
            submittedSequences: [3],
          },
        });
        await expect(
          repositories.records.get(repositoryFixtureSlotId, 'adventurer', 'adventurer.fixture'),
        ).resolves.toMatchObject({ ok: false, error: { code: 'missing_record' } });
        await expect(repositories.events.get(repositoryFixtureSlotId, 3)).resolves.toMatchObject({
          ok: false,
          error: { code: 'missing_record' },
        });
        await expect(
          repositories.workspace.get(
            actionCommitIdempotencyWorkspaceKey(repositoryFixtureSlotId, fixtureIdempotencyKey),
          ),
        ).resolves.toMatchObject({ ok: false, error: { code: 'missing_record' } });
      },
      {
        transactionStarted: () => {
          diagnosticEvents.push('started');
        },
        transactionCommitted: () => {
          diagnosticEvents.push('committed');
        },
        transactionDuplicate: () => {
          diagnosticEvents.push('duplicate');
        },
        transactionAborted: (_envelope, error) => {
          diagnosticEvents.push(`aborted:${error.code}`);
        },
      },
    );

    expect(diagnosticEvents).toEqual(['started', 'aborted:sequence_conflict']);
  });

  it('uses idempotency and expected revisions to avoid duplicate mutations', async () => {
    const diagnosticEvents: string[] = [];

    await withCoordinator(
      async ({ coordinator, repositories }) => {
        const idempotentEnvelope = createEnvelope({
          idempotencyKey: fixtureIdempotencyKey,
          expectedRevision: 0,
        });

        const firstResult = await coordinator.commit(idempotentEnvelope);

        expect(firstResult).toEqual({
          ok: true,
          actionId: 'action.fixture.commit',
          idempotencyKey: fixtureIdempotencyKey,
          committed: true,
          duplicate: false,
          stateRevision: 1,
          written: {
            stateRecords: 1,
            events: 1,
            randomStreamRecords: 1,
            randomResultRecords: 1,
            slotMetadata: 1,
            recoverySnapshots: 1,
            recoveryWorkspaceEntries: 1,
            idempotencyMarkers: 1,
          },
        });

        const duplicateResult = await coordinator.commit(
          createEnvelope({
            idempotencyKey: fixtureIdempotencyKey,
            expectedRevision: 1,
            stateRecords: [
              {
                ...repositoryRecordFixture,
                body: { hp: 99, name: 'Duplicate submit must not mutate' },
              },
            ],
            events: [
              {
                ...repositoryEventFixture,
                sequence: 2,
                body: { summary: 'duplicate submit must not append event' },
              },
            ],
          }),
        );

        expect(duplicateResult).toEqual({
          ok: true,
          actionId: 'action.fixture.commit',
          idempotencyKey: fixtureIdempotencyKey,
          committed: false,
          duplicate: true,
          stateRevision: 1,
          written: {
            stateRecords: 0,
            events: 0,
            randomStreamRecords: 0,
            randomResultRecords: 0,
            slotMetadata: 0,
            recoverySnapshots: 0,
            recoveryWorkspaceEntries: 0,
            idempotencyMarkers: 0,
          },
        });

        await expect(
          repositories.records.get(repositoryFixtureSlotId, 'adventurer', 'adventurer.fixture'),
        ).resolves.toEqual({ ok: true, value: repositoryRecordFixture });
        await expect(repositories.events.get(repositoryFixtureSlotId, 2)).resolves.toMatchObject({
          ok: false,
          error: { code: 'missing_record' },
        });
        await expect(
          repositories.workspace.get(
            actionCommitIdempotencyWorkspaceKey(repositoryFixtureSlotId, fixtureIdempotencyKey),
          ),
        ).resolves.toMatchObject({
          ok: true,
          value: {
            key: actionCommitIdempotencyWorkspaceKey(
              repositoryFixtureSlotId,
              fixtureIdempotencyKey,
            ),
            value: { actionId: 'action.fixture.commit', stateRevision: 1 },
          },
        });
      },
      {
        transactionStarted: (_envelope, plannedWrites) => {
          diagnosticEvents.push(`started:${plannedWrites.idempotencyMarkers}`);
        },
        transactionCommitted: (_envelope, written) => {
          diagnosticEvents.push(`committed:${written.idempotencyMarkers}`);
        },
        transactionDuplicate: (_envelope, stateRevision) => {
          diagnosticEvents.push(`duplicate:${stateRevision}`);
        },
        transactionAborted: (_envelope, error) => {
          diagnosticEvents.push(`aborted:${error.code}`);
        },
      },
    );

    expect(diagnosticEvents).toEqual(['started:1', 'committed:1', 'started:1', 'duplicate:1']);
  });

  it('rejects stale expected revisions without writing mutations', async () => {
    const diagnosticEvents: string[] = [];

    await withCoordinator(
      async ({ coordinator, repositories }) => {
        await expect(repositories.events.append(repositoryEventFixture)).resolves.toMatchObject({
          ok: true,
        });

        const result = await coordinator.commit(
          createEnvelope({
            expectedRevision: 0,
            events: [{ ...repositoryEventFixture, sequence: 2 }],
          }),
        );

        expect(result).toMatchObject({
          ok: false,
          actionId: 'action.fixture.commit',
          committed: false,
          duplicate: false,
          error: { code: 'revision_conflict', currentRevision: 1, expectedRevision: 0 },
        });

        await expect(
          repositories.records.get(repositoryFixtureSlotId, 'adventurer', 'adventurer.fixture'),
        ).resolves.toMatchObject({ ok: false, error: { code: 'missing_record' } });
        await expect(repositories.events.get(repositoryFixtureSlotId, 2)).resolves.toMatchObject({
          ok: false,
          error: { code: 'missing_record' },
        });
      },
      {
        transactionStarted: () => {
          diagnosticEvents.push('started');
        },
        transactionCommitted: () => {
          diagnosticEvents.push('committed');
        },
        transactionDuplicate: () => {
          diagnosticEvents.push('duplicate');
        },
        transactionAborted: (_envelope, error) => {
          diagnosticEvents.push(`aborted:${error.code}`);
        },
      },
    );

    expect(diagnosticEvents).toEqual(['started', 'aborted:revision_conflict']);
  });

  it('returns no success result when validation fails before durable writes', async () => {
    const diagnosticEvents: string[] = [];

    await withCoordinator(
      async ({ coordinator, repositories }) => {
        const result = await coordinator.commit(createEnvelope({ actionId: '   ' }));

        expect(result).toMatchObject({
          ok: false,
          actionId: '   ',
          committed: false,
          error: { code: 'empty_action_id' },
        });

        await expect(repositories.events.get(repositoryFixtureSlotId, 1)).resolves.toMatchObject({
          ok: false,
          error: { code: 'missing_record' },
        });
      },
      {
        transactionStarted: () => {
          diagnosticEvents.push('started');
        },
        transactionCommitted: () => {
          diagnosticEvents.push('committed');
        },
        transactionAborted: () => {
          diagnosticEvents.push('aborted');
        },
      },
    );

    expect(diagnosticEvents).toEqual([]);
  });
});
