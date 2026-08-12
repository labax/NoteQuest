import type { SaveSlotId } from '@notequest/domain';
import { describe, expect, it, vi } from 'vitest';
import type {
  ActionCommitEnvelope,
  ActionCommitResult,
  ActionTransactionCoordinator,
} from './action-commit.ts';
import type { PersistedRecord } from './repositories.ts';
import {
  evaluatePalaceEntryGuard,
  generateAndEnterPalace,
  loadPalaceRun,
  projectPalaceMapSurfaces,
  resolvePalaceFinalLightTransition,
} from './palace-generation.ts';

const content = {
  packageId: 'palace',
  contentVersion: '0.1.0',
  rulesVersion: 'digital-rules-specification-v0.1',
  entranceDefinitionId: 'palace.entrance.prototype',
  entranceConnections: [
    {
      definitionId: 'palace.fixture.connection-a',
      directionLabel: 'Exit A',
      connectionState: 'unresolved',
      doorState: 'unknown',
      alertState: 'quiet',
    },
    {
      definitionId: 'palace.fixture.connection-b',
      directionLabel: 'Exit B',
      connectionState: 'unresolved',
      doorState: 'unknown',
      alertState: 'quiet',
    },
  ],
  validationEvidence: ['manifest:palace@0.1.0', 'range:entrance.connections=2'],
} as const;

const command = {
  actionId: 'generate-palace-1',
  slotId: '00000000-0000-4000-8000-000000000001' as SaveSlotId,
  adventurer: {
    adventurerId: '00000000-0000-4000-8000-000000000002',
    lifeState: 'alive',
    location: 'town',
  },
  expeditionId: '00000000-0000-4000-8000-000000000003',
  seed: '0x0000000000000001',
  light: { physical: 2, virtual: 0 },
  selectedLightSource: 'physical',
  finalLightConfirmed: false,
  expectedRevision: 4,
  expectedEventSequence: 5,
  now: '2026-08-12T00:00:00.000Z',
} as const;

function coordinator(
  result: ActionCommitResult = {
    ok: true,
    actionId: command.actionId,
    committed: true,
    duplicate: false,
    stateRevision: 5,
    written: {
      stateRecords: 2,
      events: 1,
      randomStreamRecords: 1,
      randomResultRecords: 0,
      slotMetadata: 0,
      recoverySnapshots: 0,
      recoveryWorkspaceEntries: 0,
      idempotencyMarkers: 0,
    },
  } as const,
) {
  const commit = vi.fn(async (envelope: ActionCommitEnvelope) => {
    void envelope;
    return result;
  });
  return { port: { commit } as ActionTransactionCoordinator, commit };
}

describe('Palace generation and entry application flow', () => {
  it.each([
    [
      'ordinary entry',
      { torchesBeforeEntry: 2, lightCharges: [], hasPersistentLamp: false, isMiner: false },
      'continue',
    ],
    [
      'Light charge conversion',
      {
        torchesBeforeEntry: 1,
        lightCharges: [{ chargeId: 'light-1', available: true }],
        hasPersistentLamp: false,
        isMiner: false,
      },
      'light-charge-cast',
    ],
    [
      'persistent lamp',
      { torchesBeforeEntry: 1, lightCharges: [], hasPersistentLamp: true, isMiner: false },
      'lamp-sustained',
    ],
    [
      'Miner emergency exit',
      { torchesBeforeEntry: 1, lightCharges: [], hasPersistentLamp: false, isMiner: true },
      'miner-emergency-exit',
    ],
    [
      'ordinary darkness death',
      { torchesBeforeEntry: 1, lightCharges: [], hasPersistentLamp: false, isMiner: false },
      'darkness-death',
    ],
  ] as const)('resolves %s after entry atomically', (_label, input, outcome) => {
    expect(resolvePalaceFinalLightTransition(input)).toMatchObject({ outcome });
  });
  it.each(['0x0000000000000001', '0xffffffffffffffff'])(
    'is deterministic for representative seed %s',
    async (seed) => {
      const first = coordinator();
      const second = coordinator();
      const a = await generateAndEnterPalace({ ...command, seed }, content, first.port);
      const b = await generateAndEnterPalace({ ...command, seed }, content, second.port);
      expect(a.ok).toBe(true);
      expect(b).toEqual(a);
    },
  );

  it('commits graph, expedition, stream, versions, and evidence in one envelope', async () => {
    const target = coordinator();
    const result = await generateAndEnterPalace(command, content, target.port);
    expect(result).toMatchObject({ ok: true, light: { physical: 1, virtual: 0 } });
    const envelope = target.commit.mock.calls[0]?.[0];
    expect(envelope?.stateRecords).toHaveLength(7);
    expect(envelope?.randomStreamRecords).toHaveLength(1);
    expect(envelope?.events[0]).toMatchObject({
      eventType: 'palace.generated-and-entered',
      sequence: 5,
      body: {
        seed: command.seed,
        contentVersion: '0.1.0',
        lightSpent: { amount: 1, source: 'physical' },
      },
    });
    expect(
      (envelope?.stateRecords[0]?.body as { connections: unknown[] }).connections,
    ).toHaveLength(2);
    expect(envelope?.stateRecords.map((record) => record.recordType)).toEqual([
      'dungeon',
      'dungeon-floor',
      'dungeon-segment',
      'dungeon-connection',
      'dungeon-connection',
      'expedition',
      'generation-evidence',
    ]);
  });

  it('guards entry light without generation or persistence', async () => {
    const target = coordinator();
    const result = await generateAndEnterPalace(
      { ...command, light: { physical: 0, virtual: 0 } },
      content,
      target.port,
    );
    expect(result).toMatchObject({ ok: false, error: { code: 'entry_light_required' } });
    expect(target.commit).not.toHaveBeenCalled();
  });

  it('requires explicit confirmation before spending the final light and cancellation is inert', async () => {
    const target = coordinator();
    const result = await generateAndEnterPalace(
      { ...command, light: { physical: 0, virtual: 1 }, selectedLightSource: 'virtual' },
      content,
      target.port,
    );
    expect(result).toMatchObject({
      ok: false,
      error: { code: 'final_light_confirmation_required' },
    });
    expect(target.commit).not.toHaveBeenCalled();
  });

  it('commits a confirmed final-light entry once with its selected source', async () => {
    const target = coordinator();
    const result = await generateAndEnterPalace(
      {
        ...command,
        light: { physical: 0, virtual: 1 },
        selectedLightSource: 'virtual',
        finalLightConfirmed: true,
      },
      content,
      target.port,
    );
    expect(result).toMatchObject({ ok: true, light: { physical: 0, virtual: 0 } });
    expect(target.commit.mock.calls[0]?.[0].events[0]?.body).toMatchObject({
      lightSpent: { amount: 1, source: 'virtual' },
      finalLightConfirmed: true,
    });
  });

  it('blocks dead adventurers and unavailable selected sources before generation', async () => {
    expect(
      evaluatePalaceEntryGuard(
        { ...command.adventurer, lifeState: 'dead' },
        { physical: 1, virtual: 0 },
        'physical',
      ),
    ).toMatchObject({ state: 'blocked', code: 'adventurer_not_alive' });
    expect(
      evaluatePalaceEntryGuard(command.adventurer, { physical: 1, virtual: 0 }, 'virtual'),
    ).toMatchObject({ state: 'blocked', code: 'selected_light_unavailable' });
  });

  it('preserves the previous state when the atomic commit fails', async () => {
    const failure = {
      ok: false,
      actionId: command.actionId,
      committed: false,
      error: { code: 'write_failed', message: 'synthetic failure' },
    } as const;
    const target = coordinator(failure);
    const previous = Object.freeze({ dungeonId: 'previous' });
    const result = await generateAndEnterPalace(command, content, target.port);
    expect(result).toMatchObject({ ok: false, error: { code: 'write_failed' } });
    expect(previous).toEqual({ dungeonId: 'previous' });
  });

  it('derives equivalent visual and textual actions from one authoritative model', async () => {
    const target = coordinator();
    const result = await generateAndEnterPalace(command, content, target.port);
    if (!result.ok) throw new Error(result.error.message);
    const surfaces = projectPalaceMapSurfaces(result.dungeon);
    expect(surfaces.visual).toBe(surfaces.textual);
    expect(surfaces.visual.actions).toHaveLength(2);
  });

  it('reloads the committed aggregate without accepting a seed or rerolling', async () => {
    const target = coordinator();
    const generated = await generateAndEnterPalace(command, content, target.port);
    if (!generated.ok) throw new Error(generated.error.message);
    const envelope = target.commit.mock.calls[0]?.[0];
    const persisted = new Map(
      [
        ...(envelope?.stateRecords ?? []),
        ...(envelope?.randomStreamRecords ?? []),
        ...(envelope?.randomResultRecords ?? []),
      ].map((record) => [`${record.recordType}:${record.recordId}`, structuredClone(record)]),
    );
    const get = vi.fn(async (_slotId: SaveSlotId, recordType: string, recordId: string) => {
      const value = persisted.get(`${recordType}:${recordId}`);
      return value === undefined
        ? { ok: false as const, error: { code: 'missing_record' as const, message: 'missing' } }
        : { ok: true as const, value };
    });
    const reloaded = await loadPalaceRun(
      command.slotId,
      generated.dungeon.dungeonId,
      command.expeditionId,
      { get },
    );
    expect(reloaded).toMatchObject({ ok: true, dungeon: generated.dungeon });
    expect(get).toHaveBeenCalledTimes(9);
  });

  it('rejects mismatched persisted components and leaves committed records untouched', async () => {
    const target = coordinator();
    const generated = await generateAndEnterPalace(command, content, target.port);
    if (!generated.ok) throw new Error(generated.error.message);
    const envelope = target.commit.mock.calls[0]?.[0];
    const records: PersistedRecord[] = [
      ...(envelope?.stateRecords ?? []),
      ...(envelope?.randomStreamRecords ?? []),
      ...(envelope?.randomResultRecords ?? []),
    ].map((record) => structuredClone(record));
    const connectionIndex = records.findIndex(
      (record) => record.recordType === 'dungeon-connection',
    );
    const connection = records[connectionIndex];
    if (connection === undefined) throw new Error('missing connection fixture');
    records[connectionIndex] = {
      ...connection,
      body: { ...(connection.body as object), state: 'tampered' },
    };
    const beforeLoad = structuredClone(records);
    const get = vi.fn(async (_slotId: SaveSlotId, recordType: string, recordId: string) => {
      const value = records.find(
        (record) => record.recordType === recordType && record.recordId === recordId,
      );
      return value === undefined
        ? { ok: false as const, error: { code: 'missing_record' as const, message: 'missing' } }
        : { ok: true as const, value };
    });

    await expect(
      loadPalaceRun(command.slotId, generated.dungeon.dungeonId, command.expeditionId, { get }),
    ).resolves.toMatchObject({
      ok: false,
      error: { code: 'invalid_state', message: 'Persisted Palace component records disagree.' },
    });
    expect(records).toEqual(beforeLoad);
  });

  it('rejects a missing generation stream instead of rerolling from the persisted seed', async () => {
    const target = coordinator();
    const generated = await generateAndEnterPalace(command, content, target.port);
    if (!generated.ok) throw new Error(generated.error.message);
    const envelope = target.commit.mock.calls[0]?.[0];
    const persisted = new Map(
      (envelope?.stateRecords ?? []).map((record) => [
        `${record.recordType}:${record.recordId}`,
        structuredClone(record),
      ]),
    );
    const get = vi.fn(async (_slotId: SaveSlotId, recordType: string, recordId: string) => {
      const value = persisted.get(`${recordType}:${recordId}`);
      return value === undefined
        ? {
            ok: false as const,
            error: { code: 'missing_record' as const, entity: recordType, message: 'missing' },
          }
        : { ok: true as const, value };
    });
    await expect(
      loadPalaceRun(command.slotId, generated.dungeon.dungeonId, command.expeditionId, { get }),
    ).resolves.toMatchObject({
      ok: false,
      error: { code: 'missing_record', entity: 'random-stream' },
    });
    expect(get).toHaveBeenCalledWith(
      command.slotId,
      'random-stream',
      `${generated.dungeon.dungeonId}:generation`,
    );
  });
});
