import 'fake-indexeddb/auto';

import { describe, expect, it } from 'vitest';

import type { ActionCommitEnvelope, SlotRecord } from '@notequest/application';
import type { IdempotencyKey } from '@notequest/domain';
import {
  createDexieActionTransactionCoordinator,
  createDexiePersistenceRepositories,
  createDexieSaveSlotService,
  createNoteQuestDatabase,
  createNoteQuestTestDatabaseName,
  initializeSaveSlotFoundation,
  NOTEQUEST_SLOT_IDS,
} from '@notequest/infrastructure';

let databaseCounter = 0;

function databaseName(): string {
  databaseCounter += 1;
  return createNoteQuestTestDatabaseName(`slot-reliability-${databaseCounter}`);
}

function committedSlot(slot: SlotRecord, snapshotId: string): SlotRecord {
  return {
    ...slot,
    status: 'ready',
    schemaVersion: 1,
    rulesVersion: 'rules.synthetic@0.1',
    contentVersion: 'content.synthetic@0.1',
    currentSnapshotId: snapshotId,
    lastValidSnapshotId: snapshotId,
    recoveryAvailable: true,
    integrityStatus: 'valid',
  };
}

function actionEnvelope(
  slot: SlotRecord,
  options: {
    actionId: string;
    token: string;
    value: string;
    sequence?: number;
    expectedRevision?: number;
  },
): ActionCommitEnvelope {
  const sequence = options.sequence ?? 1;
  const snapshotId = `snapshot.${slot.slotIndex}`;
  return {
    actionId: options.actionId,
    slotId: slot.slotId,
    idempotencyKey: options.token as IdempotencyKey,
    expectedRevision: options.expectedRevision ?? 0,
    stateRecords: [
      {
        slotId: slot.slotId,
        recordType: 'active-state',
        recordId: 'current',
        updatedAt: '2026-07-25T12:00:00.000Z',
        body: { value: options.value },
      },
    ],
    randomStreamRecords: [
      {
        slotId: slot.slotId,
        recordType: 'random-stream',
        recordId: 'combat',
        updatedAt: '2026-07-25T12:00:00.000Z',
        body: { state: options.value },
      },
    ],
    randomResultRecords: [
      {
        slotId: slot.slotId,
        recordType: 'random-result',
        recordId: 'roll-1',
        updatedAt: '2026-07-25T12:00:00.000Z',
        body: { result: options.value },
      },
    ],
    events: [
      {
        slotId: slot.slotId,
        sequence,
        timestamp: '2026-07-25T12:00:00.000Z',
        eventType: 'event.synthetic_commit',
        retentionClass: 'active',
        body: { value: options.value },
      },
    ],
    slotMetadata: committedSlot(slot, snapshotId),
    recoveryPointers: {
      snapshots: [
        {
          slotId: slot.slotId,
          snapshotClass: 'last-valid',
          createdAt: '2026-07-25T12:00:00.000Z',
          schemaVersion: 1,
          sourceRevision: sequence,
          body: { value: options.value },
        },
      ],
    },
  };
}

describe('save-slot persistence reliability', () => {
  it('isolates complete active state for two slots that use identical child keys', async () => {
    const name = databaseName();
    const database = await createNoteQuestDatabase(name);
    try {
      await database.open();
      const initialized = await initializeSaveSlotFoundation(
        database,
        () => '2026-07-25T10:00:00.000Z',
      );
      if (!initialized.ok) throw new Error(initialized.error.message);
      const coordinator = createDexieActionTransactionCoordinator(
        database,
        {},
        () => '2026-07-25T12:00:01.000Z',
      );

      await expect(
        coordinator.commit(
          actionEnvelope(initialized.value.slots[0], {
            actionId: 'slot-one.commit',
            token: 'slot-one.token',
            value: 'one',
          }),
        ),
      ).resolves.toMatchObject({ ok: true, stateRevision: 1 });
      await expect(
        coordinator.commit(
          actionEnvelope(initialized.value.slots[1], {
            actionId: 'slot-two.commit',
            token: 'slot-two.token',
            value: 'two',
          }),
        ),
      ).resolves.toMatchObject({ ok: true, stateRevision: 1 });

      const repositories = createDexiePersistenceRepositories(database);
      for (const [slotId, value] of [
        [NOTEQUEST_SLOT_IDS[0], 'one'],
        [NOTEQUEST_SLOT_IDS[1], 'two'],
      ] as const) {
        await expect(
          repositories.records.get(slotId, 'active-state', 'current'),
        ).resolves.toMatchObject({
          ok: true,
          value: { body: { value } },
        });
        await expect(
          repositories.records.get(slotId, 'random-stream', 'combat'),
        ).resolves.toMatchObject({
          ok: true,
          value: { body: { state: value } },
        });
        await expect(
          repositories.records.get(slotId, 'random-result', 'roll-1'),
        ).resolves.toMatchObject({
          ok: true,
          value: { body: { result: value } },
        });
        await expect(repositories.events.get(slotId, 1)).resolves.toMatchObject({
          ok: true,
          value: { body: { value } },
        });
        await expect(repositories.snapshots.get(slotId, 'last-valid')).resolves.toMatchObject({
          ok: true,
          value: { body: { value } },
        });
        await expect(repositories.slots.get(slotId)).resolves.toMatchObject({
          ok: true,
          value: { revision: 1, updatedAt: '2026-07-25T12:00:01.000Z' },
        });
      }
      await expect(repositories.slots.get(NOTEQUEST_SLOT_IDS[2])).resolves.toMatchObject({
        ok: true,
        value: { status: 'empty', revision: 0 },
      });
    } finally {
      database.close();
      await database.delete();
    }
  });

  it('survives reload with truthful metadata and rejects duplicate and stale retry mutations', async () => {
    const name = databaseName();
    let database = await createNoteQuestDatabase(name);
    try {
      await database.open();
      const initialized = await initializeSaveSlotFoundation(
        database,
        () => '2026-07-25T10:00:00.000Z',
      );
      if (!initialized.ok) throw new Error(initialized.error.message);
      const original = actionEnvelope(initialized.value.slots[0], {
        actionId: 'reload.commit',
        token: 'reload.token',
        value: 'committed-before-reload',
      });
      await expect(
        createDexieActionTransactionCoordinator(
          database,
          {},
          () => '2026-07-25T13:00:00.000Z',
        ).commit(original),
      ).resolves.toMatchObject({ ok: true, committed: true, stateRevision: 1 });

      database.close();
      database = await createNoteQuestDatabase(name);
      await database.open();
      const service = createDexieSaveSlotService(database);
      await expect(service.list()).resolves.toMatchObject({
        ok: true,
        value: [
          {
            slotId: NOTEQUEST_SLOT_IDS[0],
            revision: 1,
            updatedAt: '2026-07-25T13:00:00.000Z',
            currentSnapshotId: 'snapshot.1',
            lastValidSnapshotId: 'last-valid',
            recoveryAvailable: true,
          },
          { slotId: NOTEQUEST_SLOT_IDS[1], revision: 0, status: 'empty' },
          { slotId: NOTEQUEST_SLOT_IDS[2], revision: 0, status: 'empty' },
        ],
      });

      const coordinator = createDexieActionTransactionCoordinator(database);
      const changedRetry = actionEnvelope(initialized.value.slots[0], {
        actionId: 'reload.commit',
        token: 'reload.token',
        value: 'must-not-overwrite',
        sequence: 2,
        expectedRevision: 1,
      });
      await expect(coordinator.commit(changedRetry)).resolves.toMatchObject({
        ok: true,
        committed: false,
        duplicate: true,
        stateRevision: 1,
      });

      const staleRetry = actionEnvelope(initialized.value.slots[0], {
        actionId: 'reload.stale',
        token: 'reload.stale-token',
        value: 'stale-must-not-overwrite',
        sequence: 2,
        expectedRevision: 0,
      });
      await expect(coordinator.commit(staleRetry)).resolves.toMatchObject({
        ok: false,
        error: { code: 'revision_conflict', currentRevision: 1, expectedRevision: 0 },
      });

      const repositories = createDexiePersistenceRepositories(database);
      await expect(
        repositories.records.get(NOTEQUEST_SLOT_IDS[0], 'active-state', 'current'),
      ).resolves.toMatchObject({
        ok: true,
        value: { body: { value: 'committed-before-reload' } },
      });
      await expect(
        repositories.records.get(NOTEQUEST_SLOT_IDS[0], 'random-stream', 'combat'),
      ).resolves.toMatchObject({
        ok: true,
        value: { body: { state: 'committed-before-reload' } },
      });
      await expect(repositories.events.listForSlot(NOTEQUEST_SLOT_IDS[0])).resolves.toMatchObject({
        ok: true,
        value: [{ sequence: 1 }],
      });
      await expect(repositories.slots.get(NOTEQUEST_SLOT_IDS[0])).resolves.toMatchObject({
        ok: true,
        value: { revision: 1, updatedAt: '2026-07-25T13:00:00.000Z' },
      });
    } finally {
      database.close();
      await database.delete();
    }
  });
});
