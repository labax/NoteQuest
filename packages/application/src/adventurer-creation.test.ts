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
    startingSpellCharges: 1,
    fixedSpellGrants: [{ spellId: definition('fixture.spell_1'), charges: 1 }],
    effectIds: [definition('fixture.effect')],
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
      damage: { diceCount: 1, dieSides: 6, modifier: 0, damageType: 'physical' },
    },
    effectIds: [],
  })),
  spells: Object.fromEntries(
    Array.from({ length: 6 }, (_, index) => [
      index + 1,
      { id: definition(`fixture.spell_${index + 1}`), label: `Fixture spell ${index + 1}` },
    ]),
  ),
  effects: {
    'fixture.effect': {
      id: definition('fixture.effect'),
      label: 'Fixture effect',
      version: contentVersion,
      trigger: 'fixture-trigger',
      guards: ['fixture guard'],
      outcome: { operation: 'fixture-operation', value: 1 },
    },
  },
  startingState: {
    usableArms: 2,
    usableHands: 2,
    torches: 10,
    coins: 0,
    status: 'alive',
    location: 'town',
  },
};

function success<T>(value: T): RepositoryResult<T> {
  return { ok: true, value };
}

function harness(commitFailure = false) {
  let id = 0;
  let clockReads = 0;
  const records: PersistedRecord[] = [];
  let commitCalls = 0;
  const committedEvents: EventRecord[] = [];
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
      if (envelope.events[0]) committedEvents.push(envelope.events[0]);
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
      committedEvents[0] === undefined
        ? { ok: false as const, error: { code: 'missing_record' as const, message: 'missing' } }
        : success(committedEvents[0]),
    append: async (event: EventRecord) => success(event),
    listForSlot: async () => success(committedEvents),
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
    now: () => {
      clockReads += 1;
      return timestamp;
    },
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
    get idAllocations() {
      return id;
    },
    get clockReads() {
      return clockReads;
    },
    get committedSnapshot() {
      return committedSnapshot;
    },
    setCommittedSnapshot(value: SnapshotRecord) {
      committedSnapshot = value;
    },
    setSlot(value: SlotRecord) {
      slot = value;
    },
    addEvent(value: EventRecord) {
      committedEvents.push(value);
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

  it.each([
    [
      'stale snapshot',
      (slot: SlotRecord, snapshot: SnapshotRecord) => ({
        slot: { ...slot, revision: 2 },
        snapshot,
      }),
    ],
    [
      'future snapshot',
      (slot: SlotRecord, snapshot: SnapshotRecord) => ({
        slot,
        snapshot: { ...snapshot, sourceRevision: 2 },
      }),
    ],
    [
      'unsupported slot schema',
      (slot: SlotRecord, snapshot: SnapshotRecord) => ({
        slot: { ...slot, schemaVersion: 2 },
        snapshot,
      }),
    ],
    [
      'unsupported snapshot schema',
      (slot: SlotRecord, snapshot: SnapshotRecord) => ({
        slot,
        snapshot: { ...snapshot, schemaVersion: 2 },
      }),
    ],
  ])('rejects %s at the protected snapshot gate', async (_label, mutate) => {
    const context = harness();
    const prepared = await context.service.prepare(command());
    if (!prepared.ok) throw new Error(prepared.message);
    await context.service.commit(prepared.prepared);
    const currentSlot = await context.slots.get();
    if (!currentSlot.ok) throw new Error(currentSlot.error.message);
    const changed = mutate(currentSlot.value, context.committedSnapshot!);
    context.setSlot(changed.slot);
    context.setCommittedSnapshot(changed.snapshot);
    await expect(context.service.loadCommitted(slotId)).resolves.toMatchObject({
      kind: 'incoherent',
    });
  });

  it.each(['creating', 'importing', 'resetting', 'migrating', 'isolated'] as const)(
    'rejects %s slot status during restore',
    async (status) => {
      const context = harness();
      const prepared = await context.service.prepare(command());
      if (!prepared.ok) throw new Error(prepared.message);
      await context.service.commit(prepared.prepared);
      const currentSlot = await context.slots.get();
      if (!currentSlot.ok) throw new Error(currentSlot.error.message);
      context.setSlot({ ...currentSlot.value, status });
      await expect(context.service.loadCommitted(slotId)).resolves.toMatchObject({
        kind: 'incoherent',
      });
    },
  );

  it('rejects invalid slot integrity during restore', async () => {
    const context = harness();
    const prepared = await context.service.prepare(command());
    if (!prepared.ok) throw new Error(prepared.message);
    await context.service.commit(prepared.prepared);
    const currentSlot = await context.slots.get();
    if (!currentSlot.ok) throw new Error(currentSlot.error.message);
    context.setSlot({ ...currentSlot.value, integrityStatus: 'invalid' });
    await expect(context.service.loadCommitted(slotId)).resolves.toMatchObject({
      kind: 'incoherent',
    });
  });

  it.each([
    ['state effects', 'adventurer', (body: Record<string, unknown>) => delete body.effects],
    [
      'effect label',
      'adventurer',
      (body: Record<string, unknown>) => {
        const effects = body.effects as Record<string, unknown>[];
        if (effects[0]) effects[0].label = '';
        else body.effectIds = ['fixture.effect'];
      },
    ],
    [
      'creation spell evidence',
      'adventurer-creation-evidence',
      (body: Record<string, unknown>) => delete (body.evidence as Record<string, unknown>).spells,
    ],
  ])('blocks malformed nested %s without throwing', async (_label, recordType, corrupt) => {
    const context = harness();
    const prepared = await context.service.prepare(command());
    if (!prepared.ok) throw new Error(prepared.message);
    await context.service.commit(prepared.prepared);
    const record = context.records.find((candidate) => candidate.recordType === recordType)!;
    corrupt(record.body as Record<string, unknown>);
    await expect(context.service.loadCommitted(slotId)).resolves.toMatchObject({
      kind: 'incoherent',
    });
  });

  it.each([
    [
      'class roll on a second stream',
      (context: ReturnType<typeof harness>) => {
        const body = context.records.find(
          (record) => record.recordType === 'adventurer-creation-evidence',
        )!.body as { evidence: { adventurerClass: Record<string, unknown> } };
        body.evidence.adventurerClass.streamId = 'second-stream';
      },
    ],
    [
      'spell roll on a second stream',
      (context: ReturnType<typeof harness>) => {
        const body = context.records.find(
          (record) => record.recordType === 'adventurer-creation-evidence',
        )!.body as { evidence: { spells: Record<string, unknown>[] } };
        body.evidence.spells[0]!.streamId = 'second-stream';
      },
    ],
    [
      'event roll reference on a second stream',
      (context: ReturnType<typeof harness>) => {
        const body = context.records.find(
          (record) => record.recordType === 'adventurer-creation-evidence',
        )!.body as { event: { rollRefs: Record<string, unknown>[] } };
        body.event.rollRefs[0]!.streamId = 'second-stream';
      },
    ],
    [
      'duplicate creation result ID',
      (context: ReturnType<typeof harness>) => {
        const body = context.records.find(
          (record) => record.recordType === 'adventurer-creation-evidence',
        )!.body as {
          evidence: { race: { rollResultId: string }; adventurerClass: Record<string, unknown> };
        };
        body.evidence.adventurerClass.rollResultId = body.evidence.race.rollResultId;
      },
    ],
    [
      'missing creation result',
      (context: ReturnType<typeof harness>) => {
        const index = context.records.findIndex((record) => record.recordType === 'random-result');
        context.records.splice(index, 1);
      },
    ],
    [
      'extra result on the creation stream',
      (context: ReturnType<typeof harness>) => {
        const existing = context.records.find((record) => record.recordType === 'random-result')!;
        context.records.push({ ...structuredClone(existing), recordId: 'extra-result' });
      },
    ],
    [
      'creation timestamp family',
      (context: ReturnType<typeof harness>) => {
        const index = context.records.findIndex((record) => record.recordType === 'random-stream');
        context.records[index] = {
          ...context.records[index]!,
          updatedAt: '2026-07-29T02:00:00.000Z',
        };
      },
    ],
    ...(['', '   ', 'Local\u0007Hero', 'x'.repeat(41)] as const).map(
      (name) =>
        [
          `private name ${JSON.stringify(name)}`,
          (context: ReturnType<typeof harness>) => {
            const body = context.records.find(
              (record) => record.recordType === 'adventurer-profile',
            )!.body as Record<string, unknown>;
            body.playerAuthoredName = name;
          },
        ] as const,
    ),
    [
      'fixed spell label',
      (context: ReturnType<typeof harness>) => {
        const state = context.records.find((record) => record.recordType === 'adventurer')!
          .body as { spellCharges: Record<string, unknown>[] };
        state.spellCharges.find((charge) => charge.source === 'fixed')!.label = 'Wrong';
      },
    ],
    [
      'fixed spell remaining uses',
      (context: ReturnType<typeof harness>) => {
        const state = context.records.find((record) => record.recordType === 'adventurer')!
          .body as { spellCharges: Record<string, unknown>[] };
        state.spellCharges.find((charge) => charge.source === 'fixed')!.remainingUses = 0;
      },
    ],
    [
      'empty equipment item ID',
      (context: ReturnType<typeof harness>) => {
        const state = context.records.find((record) => record.recordType === 'adventurer')!
          .body as { equipment: Record<string, unknown>[] };
        state.equipment[0]!.itemId = '';
      },
    ],
    [
      'duplicate equipment item ID',
      (context: ReturnType<typeof harness>) => {
        const state = context.records.find((record) => record.recordType === 'adventurer')!
          .body as { equipment: Record<string, unknown>[] };
        state.equipment.push(structuredClone(state.equipment[0]!));
      },
    ],
    [
      'empty spell charge ID',
      (context: ReturnType<typeof harness>) => {
        const state = context.records.find((record) => record.recordType === 'adventurer')!
          .body as { spellCharges: Record<string, unknown>[] };
        state.spellCharges[0]!.chargeId = '';
      },
    ],
    [
      'duplicate spell charge ID',
      (context: ReturnType<typeof harness>) => {
        const state = context.records.find((record) => record.recordType === 'adventurer')!
          .body as { spellCharges: Record<string, unknown>[] };
        state.spellCharges[1]!.chargeId = state.spellCharges[0]!.chargeId;
      },
    ],
    [
      'race identity',
      (context: ReturnType<typeof harness>) => {
        const state = context.records.find((record) => record.recordType === 'adventurer')!
          .body as Record<string, unknown>;
        state.raceId = 'race.unrelated';
      },
    ],
    [
      'event module, timestamp, and summary',
      (context: ReturnType<typeof harness>) => {
        const evidence = context.records.find(
          (record) => record.recordType === 'adventurer-creation-evidence',
        )!.body as { event: Record<string, unknown> };
        evidence.event.module = 'combat';
        evidence.event.summary = '';
        (evidence.event.metadata as Record<string, unknown>).occurredAt = 'not-a-date';
      },
    ],
    [
      'named stream derivation',
      (context: ReturnType<typeof harness>) => {
        const stream = context.records.find((record) => record.recordType === 'random-stream')!
          .body as Record<string, unknown>;
        delete stream.derivationId;
        delete stream.derivationVersion;
        delete stream.masterSeed;
        delete stream.rng;
      },
    ],
    [
      'named stream RNG state',
      (context: ReturnType<typeof harness>) => {
        const stream = context.records.find((record) => record.recordType === 'random-stream')!
          .body as { rng: Record<string, unknown> };
        stream.rng.state = '0x0000000000000000';
      },
    ],
    [
      'class result label',
      (context: ReturnType<typeof harness>) => {
        const evidence = context.records.find(
          (record) => record.recordType === 'adventurer-creation-evidence',
        )!.body as { evidence: { adventurerClass: Record<string, unknown> } };
        evidence.evidence.adventurerClass.resultLabel = 'Unrelated class';
      },
    ],
    [
      'equipment mechanics',
      (context: ReturnType<typeof harness>) => {
        const state = context.records.find((record) => record.recordType === 'adventurer')!
          .body as { equipment: { damage: Record<string, unknown> }[] };
        state.equipment[0]!.damage.dieSides = 20;
      },
    ],
    [
      'effect outcome mechanics',
      (context: ReturnType<typeof harness>) => {
        const state = context.records.find((record) => record.recordType === 'adventurer')!
          .body as { effects: { outcome: Record<string, unknown> }[] };
        state.effects[0]!.outcome.value = 99;
      },
    ],
    [
      'record timestamp',
      (context: ReturnType<typeof harness>) => {
        const index = context.records.findIndex((record) => record.recordType === 'adventurer');
        context.records[index] = {
          ...context.records[index]!,
          updatedAt: '2026-07-29T02:00:00.000Z',
        };
      },
    ],
    [
      'private profile identity',
      (context: ReturnType<typeof harness>) => {
        const profile = context.records.find(
          (record) => record.recordType === 'adventurer-profile',
        )!.body as Record<string, unknown>;
        profile.adventurerId = 'adventurer.unrelated';
      },
    ],
    [
      'snapshot metadata',
      (context: ReturnType<typeof harness>) => {
        context.setCommittedSnapshot({ ...context.committedSnapshot!, sourceRevision: 0 });
      },
    ],
    [
      'snapshot record arrays',
      (context: ReturnType<typeof harness>) => {
        const snapshot = context.committedSnapshot!;
        const body = snapshot.body as { stateRecords: PersistedRecord[] };
        context.setCommittedSnapshot({
          ...snapshot,
          body: {
            ...body,
            stateRecords: [
              ...body.stateRecords,
              {
                slotId,
                recordType: 'unrelated',
                recordId: 'unrelated',
                updatedAt: timestamp,
                body: {},
              },
            ],
          },
        });
      },
    ],
  ] as readonly [string, (context: ReturnType<typeof harness>) => void][])(
    'rejects semantic corruption in %s without writes',
    async (_label, corrupt) => {
      const context = harness();
      const prepared = await context.service.prepare(command());
      if (!prepared.ok) throw new Error(prepared.message);
      await context.service.commit(prepared.prepared);
      corrupt(context);
      const recordCount = context.records.length;
      const idAllocations = context.idAllocations;
      const clockReads = context.clockReads;
      await expect(context.service.loadCommitted(slotId)).resolves.toMatchObject({
        kind: 'incoherent',
      });
      expect(context.records).toHaveLength(recordCount);
      expect(context.commitCalls).toBe(1);
      expect(context.idAllocations).toBe(idAllocations);
      expect(context.clockReads).toBe(clockReads);
    },
  );

  it('rejects a revision-bumped creation snapshot that does not declare a later schema', async () => {
    const context = harness();
    const prepared = await context.service.prepare(command());
    if (!prepared.ok) throw new Error(prepared.message);
    await context.service.commit(prepared.prepared);
    context.records.push(
      {
        slotId,
        recordType: 'random-stream',
        recordId: 'later-stream',
        updatedAt: timestamp,
        body: { streamId: 'later-stream', purpose: 'palace-generation', drawCount: 1 },
      },
      {
        slotId,
        recordType: 'random-result',
        recordId: 'later-result',
        updatedAt: timestamp,
        body: { streamId: 'later-stream', naturalDice: [4], finalValue: 4 },
      },
    );
    const snapshot = context.committedSnapshot!;
    context.setCommittedSnapshot({ ...snapshot, sourceRevision: 2 });
    const currentSlot = await context.slots.get();
    if (!currentSlot.ok) throw new Error(currentSlot.error.message);
    context.setSlot({
      ...currentSlot.value,
      revision: 2,
    });
    await expect(context.service.loadCommitted(slotId)).resolves.toMatchObject({
      kind: 'incoherent',
    });
  });

  it('restores current state through a genuinely later cumulative snapshot', async () => {
    const context = harness();
    const prepared = await context.service.prepare(command());
    if (!prepared.ok) throw new Error(prepared.message);
    await context.service.commit(prepared.prepared);
    const stateRecordIndex = context.records.findIndex(
      (record) => record.recordType === 'adventurer',
    );
    const priorRecord = structuredClone(context.records[stateRecordIndex]!);
    const currentRecord: PersistedRecord = {
      ...priorRecord,
      updatedAt: '2026-07-29T01:00:00.000Z',
      body: {
        ...(priorRecord.body as Record<string, unknown>),
        currentHp: prepared.prepared.state.maxHp - 1,
        torches: 9,
        location: 'palace.entrance',
      },
    };
    context.records[stateRecordIndex] = currentRecord;
    context.addEvent({
      slotId,
      sequence: 2,
      timestamp: '2026-07-29T01:00:00.000Z',
      eventType: 'palace_entered',
      aggregateType: 'adventurer',
      aggregateId: prepared.prepared.state.adventurerId,
      retentionClass: 'mechanical-history',
      body: { type: 'palace_entered', revision: 2 },
    });
    context.records.push({
      slotId,
      recordType: 'random-stream',
      recordId: 'later-stream',
      updatedAt: '2026-07-29T01:00:00.000Z',
      body: { streamId: 'later-stream', purpose: 'dungeon-generation', drawCount: 1 },
    });
    context.setCommittedSnapshot({
      slotId,
      snapshotClass: 'last-valid',
      createdAt: '2026-07-29T01:00:00.000Z',
      schemaVersion: 1,
      sourceRevision: 2,
      body: { stateRecords: [currentRecord], schema: 'cumulative-state-v1' },
    });
    const currentSlot = await context.slots.get();
    if (!currentSlot.ok) throw new Error(currentSlot.error.message);
    context.setSlot({
      ...currentSlot.value,
      revision: 2,
      status: 'active',
      updatedAt: currentRecord.updatedAt,
    });
    const recordCount = context.records.length;
    await expect(context.service.loadCommitted(slotId)).resolves.toMatchObject({
      kind: 'committed',
      result: {
        stateRevision: 2,
        state: { currentHp: prepared.prepared.state.maxHp - 1, torches: 9 },
        evidence: prepared.prepared.evidence,
      },
    });
    expect(context.records).toHaveLength(recordCount);
    expect(context.commitCalls).toBe(1);
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
    });
  });
});
