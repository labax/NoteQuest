import 'fake-indexeddb/auto';

import { describe, expect, it } from 'vitest';

import type { SaveSlotId } from '@notequest/domain';

import { createNoteQuestDatabase } from './dexie-database';
import { createDexiePersistenceRepositories } from './dexie-repositories';
import { createDexieSaveSlotService, NOTEQUEST_SELECTED_SLOT_KEY } from './dexie-save-slot-service';
import { initializeSaveSlotFoundation, NOTEQUEST_SLOT_IDS } from './save-slot-foundation';
import { createNoteQuestTestDatabaseName } from './schema';

let counter = 0;

async function withSlots<T>(
  run: (context: {
    database: Awaited<ReturnType<typeof createNoteQuestDatabase>>;
    service: ReturnType<typeof createDexieSaveSlotService>;
  }) => Promise<T>,
) {
  counter += 1;
  const database = await createNoteQuestDatabase(
    createNoteQuestTestDatabaseName(`slot-service-${counter}`),
  );
  try {
    await database.open();
    const initialized = await initializeSaveSlotFoundation(
      database,
      () => '2026-07-25T10:00:00.000Z',
    );
    if (!initialized.ok) throw new Error(initialized.error.message);
    return await run({
      database,
      service: createDexieSaveSlotService(database, () => '2026-07-25T11:00:00.000Z'),
    });
  } finally {
    database.close();
    await database.delete();
  }
}

describe('Dexie save-slot service', () => {
  it('lists and looks up only the three catalogue slots in stable display order', async () => {
    await withSlots(async ({ service }) => {
      await expect(service.list()).resolves.toMatchObject({
        ok: true,
        value: [
          { slotId: NOTEQUEST_SLOT_IDS[0], slotIndex: 1, displayName: 'Save 1' },
          { slotId: NOTEQUEST_SLOT_IDS[1], slotIndex: 2, displayName: 'Save 2' },
          { slotId: NOTEQUEST_SLOT_IDS[2], slotIndex: 3, displayName: 'Save 3' },
        ],
      });
      await expect(service.lookup(NOTEQUEST_SLOT_IDS[1])).resolves.toMatchObject({
        ok: true,
        value: { slotIndex: 2, revision: 0, status: 'empty' },
      });
      await expect(
        service.lookup('00000000-0000-4000-8000-999999999999' as SaveSlotId),
      ).resolves.toMatchObject({
        ok: false,
        error: { code: 'invalid_slot' },
      });
    });
  });

  it('persists selection without changing any slot metadata or active state', async () => {
    await withSlots(async ({ database, service }) => {
      const before = await database.slots.toArray();
      await expect(service.select(NOTEQUEST_SLOT_IDS[1])).resolves.toMatchObject({
        ok: true,
        value: {
          selectedSlotId: NOTEQUEST_SLOT_IDS[1],
          selectedAt: '2026-07-25T11:00:00.000Z',
          slot: { slotIndex: 2 },
        },
      });

      expect(await database.slots.toArray()).toEqual(before);
      expect(await database.workspace.get(NOTEQUEST_SELECTED_SLOT_KEY)).toMatchObject({
        value: { selectedSlotId: NOTEQUEST_SLOT_IDS[1] },
      });
    });
  });

  it('updates only the addressed slot metadata and rejects stale or foreign updates', async () => {
    await withSlots(async ({ database, service }) => {
      const untouched = await database.slots.get(NOTEQUEST_SLOT_IDS[1]);

      await expect(
        service.updateMetadata(NOTEQUEST_SLOT_IDS[0], {
          displayName: '  Synthetic run  ',
          expectedRevision: 0,
        }),
      ).resolves.toMatchObject({
        ok: true,
        value: {
          displayName: 'Synthetic run',
          revision: 0,
          updatedAt: '2026-07-25T11:00:00.000Z',
        },
      });
      expect(await database.slots.get(NOTEQUEST_SLOT_IDS[1])).toEqual(untouched);

      await expect(
        service.updateMetadata(NOTEQUEST_SLOT_IDS[0], {
          displayName: 'Stale overwrite',
          expectedRevision: 1,
        }),
      ).resolves.toMatchObject({
        ok: false,
        error: { code: 'revision_conflict', currentRevision: 0, expectedRevision: 1 },
      });
      await expect(
        service.updateMetadata('00000000-0000-4000-8000-999999999999' as SaveSlotId, {
          displayName: 'Foreign overwrite',
          expectedRevision: 0,
        }),
      ).resolves.toMatchObject({ ok: false, error: { code: 'invalid_slot' } });
    });
  });

  it('keeps random state and committed random results isolated by slot', async () => {
    await withSlots(async ({ database }) => {
      const repositories = createDexiePersistenceRepositories(database);
      const timestamp = '2026-07-25T12:00:00.000Z';
      for (const [slotId, state] of [
        [NOTEQUEST_SLOT_IDS[0], 'state-one'],
        [NOTEQUEST_SLOT_IDS[1], 'state-two'],
      ] as const) {
        await repositories.records.put({
          slotId,
          recordType: 'random-stream',
          recordId: 'combat',
          updatedAt: timestamp,
          body: { state },
        });
        await repositories.records.put({
          slotId,
          recordType: 'random-result',
          recordId: 'roll-1',
          updatedAt: timestamp,
          body: { state },
        });
      }

      await expect(
        repositories.records.get(NOTEQUEST_SLOT_IDS[0], 'random-stream', 'combat'),
      ).resolves.toMatchObject({
        ok: true,
        value: { body: { state: 'state-one' } },
      });
      await expect(
        repositories.records.get(NOTEQUEST_SLOT_IDS[1], 'random-result', 'roll-1'),
      ).resolves.toMatchObject({
        ok: true,
        value: { body: { state: 'state-two' } },
      });
    });
  });
});
