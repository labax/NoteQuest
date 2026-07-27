import 'fake-indexeddb/auto';

import { describe, expect, it } from 'vitest';

import { createNoteQuestDatabase } from './dexie-database';
import { createDexiePersistenceRepositories } from './dexie-repositories';
import {
  initializeSaveSlotFoundation,
  NOTEQUEST_SLOT_IDS,
  NOTEQUEST_WORKSPACE_SLOT_CATALOGUE_KEY,
} from './save-slot-foundation';
import { createNoteQuestTestDatabaseName } from './schema';

let counter = 0;

async function withDatabase<T>(
  run: (database: Awaited<ReturnType<typeof createNoteQuestDatabase>>) => Promise<T>,
) {
  counter += 1;
  const database = await createNoteQuestDatabase(
    createNoteQuestTestDatabaseName(`slots-${counter}`),
  );
  try {
    await database.open();
    return await run(database);
  } finally {
    database.close();
    await database.delete();
  }
}

describe('three-slot persistence foundation', () => {
  it('initializes exactly three stable, named empty slots with truthful metadata', async () => {
    await withDatabase(async (database) => {
      const result = await initializeSaveSlotFoundation(database, () => '2026-07-25T10:00:00.000Z');

      expect(result).toMatchObject({ ok: true });
      if (!result.ok) throw new Error(result.error.message);
      expect(result.value.catalogue.slotIds).toEqual(NOTEQUEST_SLOT_IDS);
      expect(result.value.slots).toHaveLength(3);
      expect(
        result.value.slots.map(({ slotIndex, displayName, revision, status }) => ({
          slotIndex,
          displayName,
          revision,
          status,
        })),
      ).toEqual([
        { slotIndex: 1, displayName: 'Save 1', revision: 0, status: 'empty' },
        { slotIndex: 2, displayName: 'Save 2', revision: 0, status: 'empty' },
        { slotIndex: 3, displayName: 'Save 3', revision: 0, status: 'empty' },
      ]);
      expect(
        result.value.slots.every(
          (slot) =>
            slot.createdAt === '2026-07-25T10:00:00.000Z' &&
            slot.updatedAt === slot.createdAt &&
            slot.currentSnapshotId === null &&
            slot.lastValidSnapshotId === null &&
            !slot.recoveryAvailable,
        ),
      ).toBe(true);
    });
  });

  it('is idempotent and repairs a missing empty slot without overwriting an existing slot', async () => {
    await withDatabase(async (database) => {
      const initial = await initializeSaveSlotFoundation(
        database,
        () => '2026-07-25T10:00:00.000Z',
      );
      if (!initial.ok) throw new Error(initial.error.message);
      const existing = {
        ...initial.value.slots[1],
        status: 'ready' as const,
        revision: 7,
        displayName: 'My run',
      };
      await database.slots.put(existing);
      await database.slots.delete(NOTEQUEST_SLOT_IDS[2]);

      const repeated = await initializeSaveSlotFoundation(
        database,
        () => '2026-07-25T11:00:00.000Z',
      );
      if (!repeated.ok) throw new Error(repeated.error.message);

      expect(repeated.value.slots).toHaveLength(3);
      expect(repeated.value.slots[1]).toEqual(existing);
      expect(repeated.value.slots[2]).toMatchObject({ slotIndex: 3, revision: 0, status: 'empty' });
      expect(repeated.value.catalogue.createdAt).toBe('2026-07-25T10:00:00.000Z');
      expect(await database.workspace.get(NOTEQUEST_WORKSPACE_SLOT_CATALOGUE_KEY)).toBeDefined();
    });
  });

  it('keeps records, events, and snapshots with identical child keys isolated by slot', async () => {
    await withDatabase(async (database) => {
      await initializeSaveSlotFoundation(database);
      const repositories = createDexiePersistenceRepositories(database);
      const [first, second] = NOTEQUEST_SLOT_IDS;
      const timestamp = '2026-07-25T12:00:00.000Z';

      await repositories.records.put({
        slotId: first,
        recordType: 'state',
        recordId: 'same',
        updatedAt: timestamp,
        body: { hp: 1 },
      });
      await repositories.records.put({
        slotId: second,
        recordType: 'state',
        recordId: 'same',
        updatedAt: timestamp,
        body: { hp: 9 },
      });
      await repositories.events.append({
        slotId: first,
        sequence: 1,
        timestamp,
        eventType: 'test',
        retentionClass: 'active',
        body: { slot: 1 },
      });
      await repositories.events.append({
        slotId: second,
        sequence: 1,
        timestamp,
        eventType: 'test',
        retentionClass: 'active',
        body: { slot: 2 },
      });
      await repositories.snapshots.put({
        slotId: first,
        snapshotClass: 'last-valid',
        createdAt: timestamp,
        schemaVersion: 1,
        sourceRevision: 1,
        body: { slot: 1 },
      });
      await repositories.snapshots.put({
        slotId: second,
        snapshotClass: 'last-valid',
        createdAt: timestamp,
        schemaVersion: 1,
        sourceRevision: 1,
        body: { slot: 2 },
      });

      await expect(repositories.records.get(first, 'state', 'same')).resolves.toMatchObject({
        ok: true,
        value: { body: { hp: 1 } },
      });
      await expect(repositories.records.get(second, 'state', 'same')).resolves.toMatchObject({
        ok: true,
        value: { body: { hp: 9 } },
      });
      await expect(repositories.events.listForSlot(first)).resolves.toMatchObject({
        ok: true,
        value: [{ body: { slot: 1 } }],
      });
      await expect(repositories.snapshots.get(second, 'last-valid')).resolves.toMatchObject({
        ok: true,
        value: { body: { slot: 2 } },
      });
    });
  });
});
