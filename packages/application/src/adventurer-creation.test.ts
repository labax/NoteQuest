import { describe, expect, it } from 'vitest';
import type {
  CommandId,
  ContentVersion,
  DefinitionId,
  IdempotencyKey,
  RulesVersion,
  SaveSlotId,
} from '@notequest/domain';

import type { ActionCommitEnvelope, ActionCommitResult } from './action-commit';
import {
  ADVENTURER_NAME_MAX_GRAPHEMES,
  AdventurerCreationService,
  validateAdventurerName,
  type AdventurerCreationContent,
} from './adventurer-creation';
import type {
  PersistedRecord,
  EventRecord,
  EventRepository,
  RecordRepository,
  RepositoryResult,
  SlotRecord,
  SlotRepository,
  SnapshotRecord,
  SnapshotRepository,
} from './repositories';

const slotId = '00000000-0000-4000-8000-000000000001' as SaveSlotId;
const rulesVersion = 'rules.fixture.v1' as RulesVersion;
const contentVersion = 'content.fixture.v1' as ContentVersion;
const timestamp = '2026-07-29T00:00:00.000Z';
const definition = (value: string) => value as DefinitionId;

const content: AdventurerCreationContent = {
  raceTableId: definition('fixture.races'),
  classTableId: definition('fixture.classes'),
  spellTableId: definition('fixture.spells'),
  races: Array.from({ length: 11 }, (_, index) => ({
    id: definition(`fixture.race_${index + 2}`),
    total: index + 2,
    label: `Fixture race ${index + 2}`,
    baseHp: 10 + index,
    startingSpellCharges: index === 5 ? 1 : 0,
    effectIds: [],
  })),
  classes: Array.from({ length: 11 }, (_, index) => ({
    id: definition(`fixture.class_${index + 2}`),
    total: index + 2,
    label: `Fixture class ${index + 2}`,
    hpModifier: index % 3,
    startingSpellCharges: 0,
    weapon: {
      definitionId: definition('fixture.training_weapon'),
      label: 'Project fixture weapon',
      hands: 1,
    },
    effectIds: [],
  })),
  spells: Object.fromEntries(
    Array.from({ length: 6 }, (_, index) => [
      index + 1,
      { id: definition(`fixture.spell_${index + 1}`), label: `Fixture spell ${index + 1}` },
    ]),
  ),
};

function success<T>(value: T): RepositoryResult<T> {
  return { ok: true, value };
}

function harness(commitFailure = false) {
  let id = 0;
  const records: PersistedRecord[] = [];
  let commitCalls = 0;
  let committedEvent: EventRecord | undefined;
  let committedSnapshot: SnapshotRecord | undefined;
  let slot: SlotRecord = {
    slotId,
    slotIndex: 1,
    displayName: 'Save 1',
    revision: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
    status: 'empty',
    schemaVersion: null,
    rulesVersion: null,
    contentVersion: null,
    currentSnapshotId: null,
    lastValidSnapshotId: null,
    recoveryAvailable: false,
    integrityStatus: 'not_checked',
  };
  const slots = {
    get: async () => success(slot),
    list: async () => success([slot]),
    put: async (value: SlotRecord) => success(value),
  } satisfies SlotRepository;
  const recordRepository = {
    get: async (_slotId: SaveSlotId, recordType: string, recordId: string) => {
      const record = records.find(
        (candidate) => candidate.recordType === recordType && candidate.recordId === recordId,
      );
      return record === undefined
        ? { ok: false as const, error: { code: 'missing_record' as const, message: 'missing' } }
        : success(record);
    },
    put: async (record: PersistedRecord) => {
      records.push(record);
      return success(record);
    },
    listByType: async (_slotId: SaveSlotId, recordType: string) =>
      success(records.filter((record) => record.recordType === recordType)),
  } satisfies RecordRepository;
  const coordinator = {
    commit: async (envelope: ActionCommitEnvelope): Promise<ActionCommitResult> => {
      commitCalls += 1;
      if (commitFailure) {
        return {
          ok: false,
          actionId: envelope.actionId,
          committed: false,
          duplicate: false,
          error: { code: 'transaction_failed', message: 'Fixture transaction failed.' },
        };
      }
      records.push(
        ...envelope.stateRecords,
        ...(envelope.randomStreamRecords ?? []),
        ...(envelope.randomResultRecords ?? []),
      );
      committedEvent = envelope.events[0];
      committedSnapshot = envelope.recoveryPointers?.snapshots?.[0];
      slot = {
        ...(envelope.slotMetadata ?? slot),
        revision: 1,
        lastValidSnapshotId: 'last-valid',
        recoveryAvailable: true,
      };
      return {
        ok: true,
        actionId: envelope.actionId,
        committed: true,
        duplicate: false,
        stateRevision: 1,
        written: {
          stateRecords: envelope.stateRecords.length,
          events: 1,
          randomStreamRecords: 1,
          randomResultRecords: envelope.randomResultRecords?.length ?? 0,
          slotMetadata: 1,
          recoverySnapshots: envelope.recoveryPointers?.snapshots?.length ?? 0,
          recoveryWorkspaceEntries: 0,
          idempotencyMarkers: 1,
        },
      };
    },
  };
  const events = {
    get: async () =>
      committedEvent === undefined
        ? { ok: false as const, error: { code: 'missing_record' as const, message: 'missing' } }
        : success(committedEvent),
    append: async (event: EventRecord) => success(event),
    listForSlot: async () => success(committedEvent === undefined ? [] : [committedEvent]),
  } satisfies EventRepository;
  const snapshots = {
    get: async () =>
      committedSnapshot === undefined
        ? { ok: false as const, error: { code: 'missing_record' as const, message: 'missing' } }
        : success(committedSnapshot),
    put: async (snapshot: SnapshotRecord) => success(snapshot),
  } satisfies SnapshotRepository;
  const service = new AdventurerCreationService({
    slots,
    records: recordRepository,
    events,
    snapshots,
    coordinator,
    content,
    rulesVersion,
    contentVersion,
    masterSeedForSlot: () => '0x0000000000000050',
    newId: () => `00000000-0000-4000-8000-${String(++id).padStart(12, '0')}`,
    now: () => timestamp,
  });
  return {
    service,
    records,
    slots,
    recordRepository,
    events,
    snapshots,
    coordinator,
    get commitCalls() {
      return commitCalls;
    },
  };
}

function command(name = 'Local Hero') {
  return {
    type: 'create_adventurer' as const,
    module: 'adventurer' as const,
    slotId,
    playerAuthoredName: name,
    creationMode: 'canonical_random' as const,
    metadata: {
      commandId: 'create.fixture' as CommandId,
      idempotencyKey: 'create.fixture' as IdempotencyKey,
    },
  };
}

describe('AdventurerCreationService', () => {
  it('prepares deterministic mechanics without writing or consuming different refresh results', async () => {
    const first = harness();
    const second = harness();
    const a = await first.service.prepare(command('First name'));
    const b = await second.service.prepare(command('Different name'));
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) return;
    expect(a.prepared.evidence).toEqual(b.prepared.evidence);
    expect(a.prepared.state).toMatchObject({
      currentHp: a.prepared.state.maxHp,
      torches: 10,
      coins: 0,
    });
    expect(first.records).toEqual([]);
  });

  it('returns the same prepared action for duplicate inspection without allocating or drawing again', async () => {
    const context = harness();
    const first = await context.service.prepare(command());
    const second = await context.service.prepare(command());
    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) return;
    expect(second.prepared).toBe(first.prepared);
    expect(second.prepared.streamRecord).toEqual(first.prepared.streamRecord);
    expect(context.records).toEqual([]);
  });

  it('cancels without a commit or partial state', () => {
    const context = harness();
    expect(context.service.cancel()).toMatchObject({ ok: false, kind: 'cancelled' });
    expect(context.commitCalls).toBe(0);
    expect(context.records).toEqual([]);
  });

  it('returns evidence only after durable commit and restores equivalent local state on reload', async () => {
    const context = harness();
    const prepared = await context.service.prepare(command());
    if (!prepared.ok) throw new Error(prepared.message);
    const committed = await context.service.commit(prepared.prepared);
    expect(committed).toMatchObject({
      ok: true,
      committed: true,
      playerAuthoredName: 'Local Hero',
    });
    expect(
      context.records.find((record) => record.recordType === 'adventurer-profile')?.body,
    ).toEqual({
      adventurerId: prepared.prepared.state.adventurerId,
      playerAuthoredName: 'Local Hero',
      sourceCategory: 'user-authored',
      private: true,
      updatedAt: timestamp,
    });
    const restored = await context.service.loadCommitted(slotId);
    expect(restored).toMatchObject({
      kind: 'committed',
      result: { ok: true, state: prepared.prepared.state, evidence: prepared.prepared.evidence },
    });
  });

  it('reconciles a repeated commit from durable state without a duplicate transaction', async () => {
    const context = harness();
    const prepared = await context.service.prepare(command());
    if (!prepared.ok) throw new Error(prepared.message);
    const first = await context.service.commit(prepared.prepared);
    const recordCount = context.records.length;
    const repeated = await context.service.commit(prepared.prepared);
    expect(first).toMatchObject({ ok: true, stateRevision: 1 });
    expect(repeated).toMatchObject({
      ok: true,
      stateRevision: 1,
      state: prepared.prepared.state,
      evidence: prepared.prepared.evidence,
    });
    expect(context.commitCalls).toBe(1);
    expect(context.records).toHaveLength(recordCount);
  });

  it('reports commit failure truthfully and leaves the prior slot without partial records', async () => {
    const context = harness(true);
    const prepared = await context.service.prepare(command());
    if (!prepared.ok) throw new Error(prepared.message);
    await expect(context.service.commit(prepared.prepared)).resolves.toMatchObject({
      ok: false,
      committed: false,
      message: 'Fixture transaction failed.',
    });
    expect(context.records).toEqual([]);
  });

  it('validates the local player-authored name before generation', async () => {
    await expect(harness().service.prepare(command('   '))).resolves.toMatchObject({
      ok: false,
      kind: 'validation',
    });
  });

  it('applies the approved 40-grapheme boundary without rejecting combined Unicode text', async () => {
    const combinedCharacter = 'e\u0301';
    const accepted = combinedCharacter.repeat(ADVENTURER_NAME_MAX_GRAPHEMES);
    const rejected = combinedCharacter.repeat(ADVENTURER_NAME_MAX_GRAPHEMES + 1);

    expect(validateAdventurerName(accepted)).toEqual({
      ok: true,
      normalized: accepted,
      graphemeCount: ADVENTURER_NAME_MAX_GRAPHEMES,
    });
    expect(validateAdventurerName(rejected)).toEqual({
      ok: false,
      message: 'Use 40 or fewer characters for the adventurer name.',
    });
    await expect(harness().service.prepare(command(accepted))).resolves.toMatchObject({ ok: true });
  });

  it('rejects control characters before allocating or consuming creation state', async () => {
    const context = harness();
    await expect(context.service.prepare(command('Local\u0007Hero'))).resolves.toEqual({
      ok: false,
      kind: 'validation',
      message: 'Adventurer names cannot contain control characters.',
    });
    expect(context.records).toEqual([]);
    expect(context.commitCalls).toBe(0);
  });

  it('requires an idempotency key before consuming creation results', async () => {
    const withoutIdempotency = {
      ...command(),
      metadata: { commandId: 'create.without-idempotency' as CommandId },
    };
    await expect(harness().service.prepare(withoutIdempotency)).resolves.toMatchObject({
      ok: false,
      kind: 'validation',
      message: 'Creation requires a stable idempotency key.',
    });
  });

  it('rejects incomplete content before any ID allocation or random draw', async () => {
    const context = harness();
    const service = new AdventurerCreationService({
      slots: context.slots,
      records: context.recordRepository,
      events: context.events,
      snapshots: context.snapshots,
      coordinator: context.coordinator,
      content: { ...content, spells: {} },
      rulesVersion,
      contentVersion,
      masterSeedForSlot: () => {
        throw new Error('RNG seed must not be requested for malformed content.');
      },
      newId: () => {
        throw new Error('ID must not be allocated for malformed content.');
      },
      now: () => timestamp,
    });
    await expect(service.prepare(command())).resolves.toMatchObject({
      ok: false,
      kind: 'unavailable',
      message: 'Approved spell creation content is incomplete or invalid.',
    });
  });
});
