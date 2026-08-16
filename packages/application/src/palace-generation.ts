import type { SaveSlotId } from '@notequest/domain';
import {
  generatePalaceDungeon,
  type PalaceDungeonState,
  type ValidatedPalaceGenerationContent,
} from '@notequest/domain';
import {
  countActionCommitWrites,
  type ActionCommitEnvelope,
  type ActionCommitResult,
  type ActionTransactionCoordinator,
} from './action-commit.ts';
import type { PersistedRecord, RecordRepository, RepositoryError } from './repositories.ts';
import type {
  EventRepository,
  SlotRepository,
  SnapshotRepository,
  SlotRecord,
} from './repositories.ts';
import type { IdempotencyKey } from '@notequest/domain';

export interface GenerateAndEnterPalaceCommand {
  readonly actionId: string;
  readonly slotId: SaveSlotId;
  readonly adventurer: PalaceEntryAdventurer;
  readonly expeditionId: string;
  readonly seed: string;
  readonly light: PalaceEntryLightState;
  readonly selectedLightSource: PalaceEntryLightSource;
  readonly finalLightConfirmed: boolean;
  readonly expectedRevision: number;
  readonly expectedEventSequence: number;
  readonly now: string;
}

export interface PalaceEntryLightState {
  readonly physical: number;
  readonly virtual: number;
}

export interface PalaceEntryAdventurer {
  readonly adventurerId: string;
  readonly lifeState: 'alive' | 'dead';
  readonly location: 'town' | 'dungeon';
}

export type PalaceEntryLightSource = 'physical' | 'virtual';

export interface PalaceFinalLightTransition {
  readonly outcome:
    'continue' | 'light-charge-cast' | 'lamp-sustained' | 'miner-emergency-exit' | 'darkness-death';
  readonly physicalLight: number;
  readonly virtualLight: number;
  readonly consumedChargeId: string | null;
}

export function resolvePalaceFinalLightTransition(input: {
  readonly torchesBeforeEntry: number;
  readonly lightCharges: readonly { readonly chargeId: string; readonly available: boolean }[];
  readonly hasPersistentLamp: boolean;
  readonly isMiner: boolean;
}): PalaceFinalLightTransition {
  const physicalLight = Math.max(0, input.torchesBeforeEntry - 1);
  if (physicalLight > 0)
    return { outcome: 'continue', physicalLight, virtualLight: 0, consumedChargeId: null };
  const charge = input.lightCharges.find((candidate) => candidate.available);
  if (charge !== undefined)
    return {
      outcome: 'light-charge-cast',
      physicalLight: 0,
      virtualLight: 1,
      consumedChargeId: charge.chargeId,
    };
  if (input.hasPersistentLamp)
    return { outcome: 'lamp-sustained', physicalLight: 0, virtualLight: 0, consumedChargeId: null };
  if (input.isMiner)
    return {
      outcome: 'miner-emergency-exit',
      physicalLight: 0,
      virtualLight: 0,
      consumedChargeId: null,
    };
  return { outcome: 'darkness-death', physicalLight: 0, virtualLight: 0, consumedChargeId: null };
}

export type PalaceEntryGuard =
  | {
      readonly state: 'ready';
      readonly source: PalaceEntryLightSource;
      readonly consequence: {
        readonly physicalRemaining: number;
        readonly virtualRemaining: number;
      };
    }
  | {
      readonly state: 'confirmation-required';
      readonly source: PalaceEntryLightSource;
      readonly message: string;
      readonly consequence: {
        readonly physicalRemaining: number;
        readonly virtualRemaining: number;
      };
    }
  | {
      readonly state: 'blocked';
      readonly code:
        | 'adventurer_not_alive'
        | 'adventurer_not_in_town'
        | 'entry_light_required'
        | 'selected_light_unavailable';
      readonly message: string;
    };

/** Evaluates entry before generation so blocked/cancelled entry consumes no RNG and performs no write. */
export function evaluatePalaceEntryGuard(
  adventurer: PalaceEntryAdventurer,
  light: PalaceEntryLightState,
  source: PalaceEntryLightSource,
): PalaceEntryGuard {
  if (adventurer.lifeState !== 'alive') {
    return {
      state: 'blocked',
      code: 'adventurer_not_alive',
      message: 'A living adventurer is required to enter the Palace.',
    };
  }
  if (adventurer.location !== 'town') {
    return {
      state: 'blocked',
      code: 'adventurer_not_in_town',
      message: 'The adventurer must be in town to begin a Palace expedition.',
    };
  }
  if (
    !Number.isSafeInteger(light.physical) ||
    light.physical < 0 ||
    !Number.isSafeInteger(light.virtual) ||
    light.virtual < 0 ||
    light.physical + light.virtual < 1
  ) {
    return {
      state: 'blocked',
      code: 'entry_light_required',
      message: 'One physical or virtual light unit is required to enter the Palace.',
    };
  }
  if (light[source] < 1) {
    return {
      state: 'blocked',
      code: 'selected_light_unavailable',
      message: `The selected ${source} light source cannot pay the entry cost.`,
    };
  }
  const consequence = {
    physicalRemaining: light.physical - (source === 'physical' ? 1 : 0),
    virtualRemaining: light.virtual - (source === 'virtual' ? 1 : 0),
  };
  if (consequence.physicalRemaining + consequence.virtualRemaining === 0) {
    return {
      state: 'confirmation-required',
      source,
      message: 'Entering spends the final light unit and leaves no light after entry.',
      consequence,
    };
  }
  return { state: 'ready', source, consequence };
}

export type GenerateAndEnterPalaceResult =
  | {
      readonly ok: true;
      readonly dungeon: PalaceDungeonState;
      readonly light: PalaceEntryLightState;
      readonly commit: ActionCommitResult;
    }
  | {
      readonly ok: false;
      readonly error: { readonly code: string; readonly message: string };
      readonly commit?: ActionCommitResult;
    };

export async function generateAndEnterPalace(
  command: GenerateAndEnterPalaceCommand,
  content: ValidatedPalaceGenerationContent,
  coordinator: ActionTransactionCoordinator,
): Promise<GenerateAndEnterPalaceResult> {
  const guard = evaluatePalaceEntryGuard(
    command.adventurer,
    command.light,
    command.selectedLightSource,
  );
  if (guard.state === 'blocked') {
    return {
      ok: false,
      error: { code: guard.code, message: guard.message },
    };
  }
  if (guard.state === 'confirmation-required' && !command.finalLightConfirmed) {
    return {
      ok: false,
      error: { code: 'final_light_confirmation_required', message: guard.message },
    };
  }
  const generated = generatePalaceDungeon(command.seed, content);
  if (!generated.ok) return generated;
  const dungeon = generated.dungeon;
  const expedition = {
    expeditionId: command.expeditionId,
    adventurerId: command.adventurer.adventurerId,
    dungeonId: dungeon.dungeonId,
    currentSegmentId: dungeon.currentSegmentId,
    physicalLight: guard.consequence.physicalRemaining,
    virtualLight: guard.consequence.virtualRemaining,
    status: 'active',
  } as const;
  const eventBody = {
    seed: dungeon.seed,
    rulesVersion: dungeon.rulesVersion,
    contentVersion: dungeon.contentVersion,
    generationVersion: dungeon.generationVersion,
    entranceDefinitionId: dungeon.generationEvidence.entranceDefinitionId,
    validationEvidence: dungeon.generationEvidence.validationEvidence,
    lightSpent: { amount: 1, source: guard.source },
    finalLightConfirmed: guard.state === 'confirmation-required',
  };
  const stateRecords = [
    persistedRecord(command, 'dungeon', dungeon.dungeonId, dungeon, dungeon.dungeonId),
    ...dungeon.floors.map((floor) =>
      persistedRecord(command, 'dungeon-floor', floor.floorId, floor, dungeon.dungeonId),
    ),
    ...dungeon.segments.map((segment) =>
      persistedRecord(command, 'dungeon-segment', segment.segmentId, segment, dungeon.dungeonId),
    ),
    ...dungeon.connections.map((connection) =>
      persistedRecord(
        command,
        'dungeon-connection',
        connection.connectionId,
        connection,
        dungeon.dungeonId,
      ),
    ),
    persistedRecord(
      command,
      'expedition',
      command.expeditionId,
      expedition,
      dungeon.dungeonId,
      command.expeditionId,
    ),
    persistedRecord(
      command,
      'generation-evidence',
      `${dungeon.dungeonId}:generation`,
      dungeon.generationEvidence,
      dungeon.dungeonId,
    ),
  ];
  const commit = await coordinator.commit({
    actionId: command.actionId,
    slotId: command.slotId,
    expectedRevision: command.expectedRevision,
    stateRecords,
    randomStreamRecords: [
      {
        slotId: command.slotId,
        recordType: 'random-stream',
        recordId: `${dungeon.dungeonId}:generation`,
        dungeonId: dungeon.dungeonId,
        updatedAt: command.now,
        body: dungeon.generationStream,
      },
    ],
    randomResultRecords: [
      {
        slotId: command.slotId,
        recordType: 'random-result',
        recordId: `${dungeon.dungeonId}:entrance-generation`,
        dungeonId: dungeon.dungeonId,
        updatedAt: command.now,
        body: {
          seed: dungeon.seed,
          streamPurpose: dungeon.generationStream.purpose,
          draws: dungeon.generationEvidence.draws,
          entranceDefinitionId: dungeon.generationEvidence.entranceDefinitionId,
          contentVersion: dungeon.contentVersion,
          rulesVersion: dungeon.rulesVersion,
        },
      },
    ],
    events: [
      {
        slotId: command.slotId,
        sequence: command.expectedEventSequence,
        timestamp: command.now,
        eventType: 'palace.generated-and-entered',
        dungeonId: dungeon.dungeonId,
        expeditionId: command.expeditionId,
        aggregateType: 'dungeon',
        aggregateId: dungeon.dungeonId,
        retentionClass: 'canonical',
        body: eventBody,
      },
    ],
  });
  if (!commit.ok)
    return { ok: false, error: { code: commit.error.code, message: commit.error.message }, commit };
  return {
    ok: true,
    dungeon,
    light: {
      physical: expedition.physicalLight,
      virtual: expedition.virtualLight,
    },
    commit,
  };
}

function persistedRecord(
  command: GenerateAndEnterPalaceCommand,
  recordType: string,
  recordId: string,
  body: unknown,
  dungeonId?: string,
  expeditionId?: string,
): PersistedRecord {
  return {
    slotId: command.slotId,
    recordType,
    recordId,
    ...(dungeonId === undefined ? {} : { dungeonId }),
    ...(expeditionId === undefined ? {} : { expeditionId }),
    updatedAt: command.now,
    body,
  };
}

interface PersistedPalaceExpedition {
  readonly expeditionId: string;
  readonly adventurerId: string;
  readonly dungeonId: string;
  readonly currentSegmentId: string;
  readonly physicalLight: number;
  readonly virtualLight: number;
  readonly status: 'active' | 'ended' | 'ended-death';
}

export type LoadPalaceRunResult =
  | {
      readonly ok: true;
      readonly dungeon: PalaceDungeonState;
      readonly expedition: PersistedPalaceExpedition;
      readonly outcome: 'active' | 'miner-emergency-exit' | 'darkness-death';
    }
  | {
      readonly ok: false;
      readonly error:
        RepositoryError | { readonly code: 'invalid_state'; readonly message: string };
    };

/** Loads only committed records. This path never accepts a seed or invokes generation. */
export async function loadPalaceRun(
  slotId: SaveSlotId,
  dungeonId: string,
  expeditionId: string,
  records: Pick<RecordRepository, 'get'>,
): Promise<LoadPalaceRunResult> {
  const dungeonRecord = await records.get(slotId, 'dungeon', dungeonId);
  if (!dungeonRecord.ok) return dungeonRecord;
  const expeditionRecord = await records.get(slotId, 'expedition', expeditionId);
  if (!expeditionRecord.ok) return expeditionRecord;
  if (!isPalaceDungeonState(dungeonRecord.value.body)) {
    return {
      ok: false,
      error: { code: 'invalid_state', message: 'Persisted Palace graph is invalid.' },
    };
  }
  const dungeon = dungeonRecord.value.body;
  const expedition = expeditionRecord.value.body;
  if (
    dungeonRecord.value.slotId !== slotId ||
    dungeonRecord.value.recordId !== dungeon.dungeonId ||
    expeditionRecord.value.slotId !== slotId ||
    !isPalaceExpedition(expedition) ||
    expeditionRecord.value.recordId !== expedition.expeditionId ||
    expedition.dungeonId !== dungeon.dungeonId
  ) {
    return {
      ok: false,
      error: { code: 'invalid_state', message: 'Persisted Palace expedition is invalid.' },
    };
  }
  if (expedition.currentSegmentId !== dungeon.currentSegmentId) {
    return {
      ok: false,
      error: { code: 'invalid_state', message: 'Persisted Palace positions disagree.' },
    };
  }
  const componentReads = await Promise.all([
    ...dungeon.floors.map((floor) => records.get(slotId, 'dungeon-floor', floor.floorId)),
    ...dungeon.segments.map((segment) => records.get(slotId, 'dungeon-segment', segment.segmentId)),
    ...dungeon.connections.map((connection) =>
      records.get(slotId, 'dungeon-connection', connection.connectionId),
    ),
    records.get(slotId, 'generation-evidence', `${dungeon.dungeonId}:generation`),
    records.get(slotId, 'random-stream', `${dungeon.dungeonId}:generation`),
    records.get(slotId, 'random-result', `${dungeon.dungeonId}:entrance-generation`),
  ]);
  const failedRead = componentReads.find((read) => !read.ok);
  if (failedRead !== undefined && !failedRead.ok) return failedRead;

  const expectedBodies: readonly unknown[] = [
    ...dungeon.floors,
    ...dungeon.segments,
    ...dungeon.connections,
    dungeon.generationEvidence,
    dungeon.generationStream,
    {
      seed: dungeon.seed,
      streamPurpose: dungeon.generationStream.purpose,
      draws: dungeon.generationEvidence.draws,
      entranceDefinitionId: dungeon.generationEvidence.entranceDefinitionId,
      contentVersion: dungeon.contentVersion,
      rulesVersion: dungeon.rulesVersion,
    },
  ];
  const expectedRecords = [
    ...dungeon.floors.map((floor) => ['dungeon-floor', floor.floorId] as const),
    ...dungeon.segments.map((segment) => ['dungeon-segment', segment.segmentId] as const),
    ...dungeon.connections.map(
      (connection) => ['dungeon-connection', connection.connectionId] as const,
    ),
    ['generation-evidence', `${dungeon.dungeonId}:generation`] as const,
    ['random-stream', `${dungeon.dungeonId}:generation`] as const,
    ['random-result', `${dungeon.dungeonId}:entrance-generation`] as const,
  ];
  const componentsMatch = componentReads.every(
    (read, index) =>
      read.ok &&
      read.value.slotId === slotId &&
      read.value.recordType === expectedRecords[index]?.[0] &&
      read.value.recordId === expectedRecords[index]?.[1] &&
      safeSameValue(read.value.body, expectedBodies[index]),
  );
  if (!componentsMatch) {
    return {
      ok: false,
      error: { code: 'invalid_state', message: 'Persisted Palace component records disagree.' },
    };
  }
  return {
    ok: true,
    dungeon,
    expedition,
    outcome:
      expedition.status === 'active'
        ? 'active'
        : expedition.status === 'ended'
          ? 'miner-emergency-exit'
          : 'darkness-death',
  };
}

function isPalaceDungeonState(value: unknown): value is PalaceDungeonState {
  if (typeof value !== 'object' || value === null) return false;
  const state = value as Partial<PalaceDungeonState>;
  if (
    typeof state.dungeonId !== 'string' ||
    typeof state.seed !== 'string' ||
    typeof state.rulesVersion !== 'string' ||
    typeof state.contentVersion !== 'string' ||
    !Array.isArray(state.floorIds) ||
    !Array.isArray(state.floors) ||
    !Array.isArray(state.segments) ||
    !Array.isArray(state.connections)
  )
    return false;
  const floorsValid = state.floors.every(
    (floor) =>
      typeof floor === 'object' &&
      floor !== null &&
      typeof floor.floorId === 'string' &&
      floor.dungeonId === state.dungeonId &&
      floor.floorNumber === 1 &&
      Array.isArray(floor.segmentIds) &&
      Array.isArray(floor.connectionIds),
  );
  const segmentsValid = state.segments.every(
    (segment) =>
      typeof segment === 'object' &&
      segment !== null &&
      typeof segment.segmentId === 'string' &&
      segment.floor === 1 &&
      typeof segment.definitionId === 'string' &&
      typeof segment.encounter === 'object' &&
      segment.encounter !== null,
  );
  const segmentIds = new Set(state.segments.map((segment) => segment.segmentId));
  const floorIds = new Set(state.floors.map((floor) => floor.floorId));
  const connectionIds = new Set(state.connections.map((connection) => connection.connectionId));
  const connectionsValid = state.connections.every(
    (connection) =>
      typeof connection === 'object' &&
      connection !== null &&
      typeof connection.connectionId === 'string' &&
      typeof connection.definitionId === 'string' &&
      connection.definitionVersion === state.contentVersion &&
      segmentIds.has(connection.sourceSegmentId) &&
      connection.destinationSegmentId === null &&
      connection.state === 'unresolved' &&
      connection.doorState === 'unknown' &&
      connection.alertState === 'quiet',
  );
  const stream = state.generationStream;
  const streamValid =
    typeof stream === 'object' &&
    stream !== null &&
    stream.purpose === 'dungeon-generation' &&
    stream.masterSeed === state.seed &&
    typeof stream.rng === 'object' &&
    stream.rng !== null &&
    typeof stream.rng.state === 'string';
  return (
    state.dungeonType === 'palace' &&
    state.rulesVersion === 'digital-rules-specification-v0.1' &&
    state.generationVersion === 'palace-generation.v0.1' &&
    typeof state.currentSegmentId === 'string' &&
    state.floors.length === 1 &&
    state.segments.length === 1 &&
    state.connections.length > 0 &&
    floorsValid &&
    segmentsValid &&
    connectionsValid &&
    streamValid &&
    new Set(state.floorIds).size === state.floorIds.length &&
    floorIds.size === state.floors.length &&
    segmentIds.size === state.segments.length &&
    connectionIds.size === state.connections.length &&
    state.floorIds[0] === state.floors[0]?.floorId &&
    safeSameValue(
      state.floors[0]?.segmentIds,
      state.segments.map(({ segmentId }) => segmentId),
    ) &&
    safeSameValue(
      state.floors[0]?.connectionIds,
      state.connections.map(({ connectionId }) => connectionId),
    ) &&
    state.segments.some((segment) => segment.segmentId === state.currentSegmentId) &&
    typeof state.generationEvidence === 'object' &&
    state.generationEvidence !== null
  );
}

function safeSameValue(left: unknown, right: unknown): boolean {
  try {
    return JSON.stringify(left) === JSON.stringify(right);
  } catch {
    return false;
  }
}

function isPalaceExpedition(value: unknown): value is PersistedPalaceExpedition {
  if (typeof value !== 'object' || value === null) return false;
  const expedition = value as Record<string, unknown>;
  return (
    typeof expedition['expeditionId'] === 'string' &&
    typeof expedition['adventurerId'] === 'string' &&
    typeof expedition['dungeonId'] === 'string' &&
    typeof expedition['currentSegmentId'] === 'string' &&
    Number.isSafeInteger(expedition['physicalLight']) &&
    Number.isSafeInteger(expedition['virtualLight']) &&
    (expedition['physicalLight'] as number) >= 0 &&
    (expedition['virtualLight'] as number) >= 0 &&
    (expedition['status'] === 'active' ||
      expedition['status'] === 'ended' ||
      expedition['status'] === 'ended-death')
  );
}

export interface PalaceMapSurface {
  readonly currentSegmentId: string;
  readonly segments: PalaceDungeonState['segments'];
  readonly connections: PalaceDungeonState['connections'];
  readonly actions: readonly { readonly id: string; readonly connectionId: string }[];
}

/** Both renderers consume this projection; coordinates and labels cannot create mechanics. */
export function projectPalaceMapSurfaces(dungeon: PalaceDungeonState): {
  readonly visual: PalaceMapSurface;
  readonly textual: PalaceMapSurface;
} {
  const actions = dungeon.connections
    .filter((connection) => connection.sourceSegmentId === dungeon.currentSegmentId)
    .map((connection) => ({ id: 'open-connection', connectionId: connection.connectionId }));
  const authoritative = {
    currentSegmentId: dungeon.currentSegmentId,
    segments: dungeon.segments,
    connections: dungeon.connections,
    actions,
  };
  return { visual: authoritative, textual: authoritative };
}

export interface EnterCanonicalPalaceCommand {
  readonly actionId: string;
  readonly idempotencyKey: IdempotencyKey;
  readonly slotId: SaveSlotId;
  readonly adventurerId: string;
  readonly seed: string;
  readonly finalLightConfirmed: boolean;
}

export interface PalaceEntryServiceDependencies {
  readonly slots: Pick<SlotRepository, 'get'>;
  readonly records: Pick<RecordRepository, 'get' | 'listByType'>;
  readonly events: Pick<EventRepository, 'listForSlot'>;
  readonly snapshots: Pick<SnapshotRepository, 'get'>;
  readonly coordinator: ActionTransactionCoordinator;
  readonly content: ValidatedPalaceGenerationContent;
  readonly newId: () => string;
  readonly now: () => string;
}

export type CanonicalPalaceEntryResult =
  | {
      readonly ok: true;
      readonly dungeon: PalaceDungeonState;
      readonly expeditionId: string;
      readonly outcome: 'active' | 'miner-emergency-exit' | 'darkness-death';
    }
  | {
      readonly ok: false;
      readonly committed: false | 'unknown';
      readonly code: string;
      readonly message: string;
    };

/** Canonical entry boundary: caller identity selects persisted state but never supplies mechanics. */
export class PalaceEntryService {
  constructor(private readonly dependencies: PalaceEntryServiceDependencies) {}

  async enter(command: EnterCanonicalPalaceCommand): Promise<CanonicalPalaceEntryResult> {
    const [slot, adventurerRecord, allAdventurers, priorSnapshot, priorEvents] = await Promise.all([
      this.dependencies.slots.get(command.slotId),
      this.dependencies.records.get(command.slotId, 'adventurer', command.adventurerId),
      this.dependencies.records.listByType(command.slotId, 'adventurer'),
      this.dependencies.snapshots.get(command.slotId, 'last-valid'),
      this.dependencies.events.listForSlot(command.slotId),
    ]);
    if (!slot.ok || !adventurerRecord.ok || !allAdventurers.ok) {
      return {
        ok: false,
        committed: false,
        code: 'missing_adventurer',
        message: 'The selected committed adventurer was not found.',
      };
    }
    if (
      adventurerRecord.value.slotId !== command.slotId ||
      adventurerRecord.value.recordId !== command.adventurerId ||
      allAdventurers.value.filter((record) => record.recordId === command.adventurerId).length !==
        1 ||
      !isCanonicalEntryAdventurer(adventurerRecord.value.body, command.adventurerId)
    ) {
      return {
        ok: false,
        committed: false,
        code: 'invalid_adventurer',
        message: 'The selected adventurer state is incoherent.',
      };
    }
    const adventurer = adventurerRecord.value.body;
    const lightCharge = adventurer.spellCharges.find(
      (charge) => charge.remainingUses > 0 && charge.definitionId === 'spell.light',
    );
    const itemRecords = await this.dependencies.records.listByType(command.slotId, 'item');
    if (
      !itemRecords.ok ||
      itemRecords.value.some(
        (record) => record.slotId !== command.slotId || !isCanonicalItemState(record.body),
      )
    ) {
      return {
        ok: false,
        committed: false,
        code: 'invalid_item_state',
        message: 'Canonical carried-item state could not be read coherently.',
      };
    }
    const hasLamp = itemRecords.value.some((record) =>
      isCarriedActiveLamp(record.body, command.adventurerId),
    );
    const isMiner = adventurer.classId === 'class.miner';
    const entryCharge = adventurer.torches === 0 ? lightCharge : undefined;
    if (adventurer.torches === 0 && entryCharge === undefined) {
      return {
        ok: false,
        committed: false,
        code: 'entry_light_required',
        message: 'One physical or prepared virtual light unit is required to enter the Palace.',
      };
    }
    const remainingCharges = adventurer.spellCharges.filter(
      (charge) => charge.chargeId !== entryCharge?.chargeId,
    );
    const preview = resolvePalaceFinalLightTransition({
      torchesBeforeEntry: adventurer.torches,
      lightCharges: remainingCharges.map((charge) => ({
        chargeId: charge.chargeId,
        available: charge.remainingUses > 0 && charge.definitionId === 'spell.light',
      })),
      hasPersistentLamp: hasLamp,
      isMiner,
    });
    const spendsFinalEntryLight = adventurer.torches <= 1;
    if (spendsFinalEntryLight && !command.finalLightConfirmed) {
      const consequence =
        preview.outcome === 'light-charge-cast'
          ? 'a different Light charge will be cast after entry'
          : preview.outcome === 'lamp-sustained'
            ? 'the carried Lamp will protect the adventurer'
            : preview.outcome === 'miner-emergency-exit'
              ? 'the Miner will return to Town immediately'
              : 'the adventurer will die in darkness';
      return {
        ok: false,
        committed: false,
        code: 'final_light_confirmation_required',
        message: `Entering spends the final payable light; ${consequence}.`,
      };
    }

    const expeditionId = this.dependencies.newId();
    let captured: ActionCommitEnvelope | undefined;
    const capture: ActionTransactionCoordinator = {
      commit: async (envelope) => {
        captured = envelope;
        return syntheticCaptureReceipt(envelope, slot.value.revision + 1);
      },
    };
    const generated = await generateAndEnterPalace(
      {
        actionId: command.actionId,
        slotId: command.slotId,
        adventurer: { adventurerId: command.adventurerId, lifeState: 'alive', location: 'town' },
        expeditionId,
        seed: command.seed,
        light: { physical: adventurer.torches, virtual: entryCharge === undefined ? 0 : 1 },
        selectedLightSource: adventurer.torches === 0 ? 'virtual' : 'physical',
        finalLightConfirmed: command.finalLightConfirmed,
        expectedRevision: slot.value.revision,
        expectedEventSequence:
          priorEvents.ok && priorEvents.value.length > 0
            ? Math.max(...priorEvents.value.map((event) => event.sequence)) + 1
            : 1,
        now: this.dependencies.now(),
      },
      this.dependencies.content,
      capture,
    );
    if (!generated.ok || captured === undefined) {
      return {
        ok: false,
        committed: false,
        code: generated.ok ? 'generation_failed' : generated.error.code,
        message: generated.ok ? 'Generation did not prepare a commit.' : generated.error.message,
      };
    }

    const transition = preview;
    const remainingTorches = transition.physicalLight;
    const minerExit = transition.outcome === 'miner-emergency-exit';
    const darknessDeath = transition.outcome === 'darkness-death';
    const updatedAdventurer = {
      ...adventurer,
      torches: remainingTorches,
      location: minerExit ? 'town' : 'dungeon',
      status: darknessDeath ? 'dead' : 'alive',
      currentHp: darknessDeath ? 0 : adventurer.currentHp,
      spellCharges: adventurer.spellCharges.map((charge) =>
        charge.chargeId === transition.consumedChargeId || charge.chargeId === entryCharge?.chargeId
          ? { ...charge, remainingUses: 0 as const }
          : charge,
      ),
      death: darknessDeath
        ? { cause: 'darkness', dungeonId: generated.dungeon.dungeonId, expeditionId }
        : adventurer.death,
    };
    const stateRecords = [
      ...captured.stateRecords.filter((record) => record.recordType !== 'expedition'),
      { ...adventurerRecord.value, updatedAt: this.dependencies.now(), body: updatedAdventurer },
      ...captured.stateRecords
        .filter((record) => record.recordType === 'expedition')
        .map((record) => ({
          ...record,
          body: {
            ...(record.body as object),
            status: minerExit ? 'ended' : darknessDeath ? 'ended-death' : 'active',
            physicalLight: remainingTorches,
            virtualLight: transition.virtualLight,
            persistentLamp: hasLamp,
          },
        })),
      ...(darknessDeath
        ? [
            {
              slotId: command.slotId,
              recordType: 'graveyard',
              recordId: this.dependencies.newId(),
              dungeonId: generated.dungeon.dungeonId,
              expeditionId,
              updatedAt: this.dependencies.now(),
              body: {
                adventurerId: command.adventurerId,
                cause: 'darkness',
                dungeonId: generated.dungeon.dungeonId,
                expeditionId,
              },
            } satisfies PersistedRecord,
          ]
        : []),
      {
        slotId: command.slotId,
        recordType: 'palace-current-run',
        recordId: 'current',
        dungeonId: generated.dungeon.dungeonId,
        expeditionId,
        updatedAt: this.dependencies.now(),
        body: {
          dungeonId: generated.dungeon.dungeonId,
          expeditionId,
          adventurerId: command.adventurerId,
          outcome: minerExit ? 'miner-emergency-exit' : darknessDeath ? 'darkness-death' : 'active',
        },
      } satisfies PersistedRecord,
    ];
    const nextSlot: SlotRecord = {
      ...slot.value,
      revision: slot.value.revision,
      status: minerExit || darknessDeath ? 'ready' : 'active',
      updatedAt: this.dependencies.now(),
      schemaVersion: 1,
      rulesVersion: generated.dungeon.rulesVersion,
      contentVersion: generated.dungeon.contentVersion,
      currentSnapshotId: 'last-valid',
      lastValidSnapshotId: 'last-valid',
      recoveryAvailable: true,
      integrityStatus: 'valid',
    };
    const envelope: ActionCommitEnvelope = {
      ...captured,
      idempotencyKey: command.idempotencyKey,
      stateRecords,
      slotMetadata: nextSlot,
      recoveryPointers: {
        snapshots: [
          {
            slotId: command.slotId,
            snapshotClass: 'last-valid',
            createdAt: this.dependencies.now(),
            schemaVersion: 1,
            sourceRevision: slot.value.revision + 1,
            body: cumulativeSnapshotBody(priorSnapshot.ok ? priorSnapshot.value.body : undefined, {
              stateRecords,
              randomStreamRecords: captured.randomStreamRecords ?? [],
              randomResultRecords: captured.randomResultRecords ?? [],
              events: captured.events,
              currentRun: {
                dungeonId: generated.dungeon.dungeonId,
                expeditionId,
                adventurerId: command.adventurerId,
                outcome: minerExit
                  ? 'miner-emergency-exit'
                  : darknessDeath
                    ? 'darkness-death'
                    : 'active',
              },
            }),
          },
        ],
      },
      events: captured.events.map((event) => ({
        ...event,
        body: {
          ...(event.body as object),
          adventurerId: command.adventurerId,
          outcome: transition.outcome === 'continue' ? 'entered' : transition.outcome,
          entryPreparationChargeId: entryCharge?.chargeId ?? null,
          postEntryChargeId: transition.consumedChargeId,
          persistentLamp: hasLamp,
          minerEmergencyExit: minerExit,
          darknessDeath,
        },
      })),
    };
    const committed = await this.dependencies.coordinator.commit(envelope);
    if (!committed.ok)
      return {
        ok: false,
        committed: committed.committed,
        code: committed.error.code,
        message: committed.error.message,
      };
    if (committed.duplicate) {
      const reconciled = await this.load(command.slotId);
      return reconciled.ok
        ? {
            ok: true,
            dungeon: reconciled.dungeon,
            expeditionId: reconciled.expedition.expeditionId,
            outcome: reconciled.outcome,
          }
        : {
            ok: false,
            committed: 'unknown',
            code: 'reconciliation_failed',
            message: 'The original Palace entry commit could not be reconciled.',
          };
    }
    return {
      ok: true,
      dungeon: generated.dungeon,
      expeditionId,
      outcome: minerExit ? 'miner-emergency-exit' : darknessDeath ? 'darkness-death' : 'active',
    };
  }

  async load(slotId: SaveSlotId): Promise<
    | LoadPalaceRunResult
    | {
        readonly ok: false;
        readonly error: { readonly code: 'not_found'; readonly message: string };
      }
  > {
    const pointer = await this.dependencies.records.get(slotId, 'palace-current-run', 'current');
    if (!pointer.ok || !isCurrentRunPointer(pointer.value.body)) {
      return {
        ok: false,
        error: { code: 'not_found', message: 'No committed Palace run exists.' },
      };
    }
    const current = await loadPalaceRun(
      slotId,
      pointer.value.body.dungeonId,
      pointer.value.body.expeditionId,
      this.dependencies.records,
    );
    if (
      current.ok &&
      current.expedition.adventurerId === pointer.value.body.adventurerId &&
      current.outcome === pointer.value.body.outcome
    )
      return current;
    const snapshot = await this.dependencies.snapshots.get(slotId, 'last-valid');
    if (!snapshot.ok || typeof snapshot.value.body !== 'object' || snapshot.value.body === null)
      return current;
    const body = snapshot.value.body as Record<string, unknown>;
    const rows = [
      ...(Array.isArray(body['stateRecords']) ? body['stateRecords'] : []),
      ...(Array.isArray(body['randomStreamRecords']) ? body['randomStreamRecords'] : []),
      ...(Array.isArray(body['randomResultRecords']) ? body['randomResultRecords'] : []),
    ].filter(isPersistedRecordValue);
    const snapshotPointer = isCurrentRunPointer(body['currentRun'])
      ? body['currentRun']
      : undefined;
    if (snapshotPointer === undefined) return current;
    const recoveredDungeons = rows.filter(
      (record) => record.recordType === 'dungeon' && record.recordId === snapshotPointer.dungeonId,
    );
    const recoveredExpeditions = rows.filter(
      (record) =>
        record.recordType === 'expedition' && record.recordId === snapshotPointer.expeditionId,
    );
    if (recoveredDungeons.length !== 1 || recoveredExpeditions.length !== 1) return current;
    const recoveredDungeon = recoveredDungeons[0]!;
    const recoveredExpedition = recoveredExpeditions[0]!;
    const recoveryRecords: Pick<RecordRepository, 'get'> = {
      async get(requestedSlotId, recordType, recordId) {
        const value = rows.find(
          (record) =>
            record.slotId === requestedSlotId &&
            record.recordType === recordType &&
            record.recordId === recordId,
        );
        return value === undefined
          ? {
              ok: false,
              error: { code: 'missing_record', message: 'Recovery record is missing.' },
            }
          : { ok: true, value };
      },
    };
    return loadPalaceRun(
      slotId,
      recoveredDungeon.recordId,
      recoveredExpedition.recordId,
      recoveryRecords,
    );
  }
}

interface CurrentRunPointer {
  readonly dungeonId: string;
  readonly expeditionId: string;
  readonly adventurerId: string;
  readonly outcome?: 'active' | 'miner-emergency-exit' | 'darkness-death';
}

function isCurrentRunPointer(value: unknown): value is Required<CurrentRunPointer> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof Reflect.get(value, 'dungeonId') === 'string' &&
    typeof Reflect.get(value, 'expeditionId') === 'string' &&
    typeof Reflect.get(value, 'adventurerId') === 'string' &&
    (Reflect.get(value, 'outcome') === 'active' ||
      Reflect.get(value, 'outcome') === 'miner-emergency-exit' ||
      Reflect.get(value, 'outcome') === 'darkness-death')
  );
}

function cumulativeSnapshotBody(
  prior: unknown,
  additions: Readonly<Record<string, unknown>>,
): Readonly<Record<string, unknown>> {
  const previous = typeof prior === 'object' && prior !== null ? prior : {};
  const mergeRecords = (key: string): readonly unknown[] => {
    const before = Array.isArray(Reflect.get(previous, key)) ? Reflect.get(previous, key) : [];
    const after = Array.isArray(additions[key]) ? additions[key] : [];
    const replacements = new Set(
      after
        .filter(isPersistedRecordValue)
        .map((record) => `${record.recordType}:${record.recordId}`),
    );
    return [
      ...before.filter(
        (record: unknown) =>
          !isPersistedRecordValue(record) ||
          !replacements.has(`${record.recordType}:${record.recordId}`),
      ),
      ...after,
    ];
  };
  return {
    ...previous,
    ...additions,
    stateRecords: mergeRecords('stateRecords'),
    randomStreamRecords: mergeRecords('randomStreamRecords'),
    randomResultRecords: mergeRecords('randomResultRecords'),
    events: [
      ...(Array.isArray(Reflect.get(previous, 'events')) ? Reflect.get(previous, 'events') : []),
      ...(Array.isArray(additions['events']) ? additions['events'] : []),
    ],
  };
}

function isPersistedRecordValue(value: unknown): value is PersistedRecord {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof Reflect.get(value, 'slotId') === 'string' &&
    typeof Reflect.get(value, 'recordType') === 'string' &&
    typeof Reflect.get(value, 'recordId') === 'string' &&
    typeof Reflect.get(value, 'updatedAt') === 'string' &&
    Reflect.has(value, 'body')
  );
}

function syntheticCaptureReceipt(
  envelope: ActionCommitEnvelope,
  revision: number,
): ActionCommitResult {
  return {
    ok: true,
    actionId: envelope.actionId,
    committed: true,
    duplicate: false,
    stateRevision: revision,
    written: countActionCommitWrites(envelope),
  };
}

function isCanonicalEntryAdventurer(
  value: unknown,
  adventurerId: string,
): value is CanonicalEntryAdventurer {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<CanonicalEntryAdventurer>;
  return (
    candidate.adventurerId === adventurerId &&
    candidate.status === 'alive' &&
    candidate.location === 'town' &&
    Number.isSafeInteger(candidate.torches) &&
    (candidate.torches ?? -1) >= 0 &&
    Array.isArray(candidate.spellCharges) &&
    candidate.spellCharges.every(isCanonicalSpellCharge) &&
    new Set(candidate.spellCharges.map((charge) => charge.chargeId)).size ===
      candidate.spellCharges.length &&
    typeof candidate.classId === 'string'
  );
}

function isCanonicalSpellCharge(
  value: unknown,
): value is CanonicalEntryAdventurer['spellCharges'][number] {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof Reflect.get(value, 'chargeId') === 'string' &&
    typeof Reflect.get(value, 'definitionId') === 'string' &&
    (Reflect.get(value, 'remainingUses') === 0 || Reflect.get(value, 'remainingUses') === 1)
  );
}

/** Fail closed: a persistent lamp is usable only when its canonical instance is active and carried by this adventurer. */
function isCarriedActiveLamp(value: unknown, adventurerId: string): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    Reflect.get(value, 'definitionId') === 'item.lamp' &&
    Reflect.get(value, 'ownerAdventurerId') === adventurerId &&
    Reflect.get(value, 'carried') === true &&
    Reflect.get(value, 'active') === true
  );
}

function isCanonicalItemState(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof Reflect.get(value, 'definitionId') === 'string' &&
    typeof Reflect.get(value, 'ownerAdventurerId') === 'string' &&
    typeof Reflect.get(value, 'carried') === 'boolean' &&
    typeof Reflect.get(value, 'active') === 'boolean'
  );
}

interface CanonicalEntryAdventurer {
  readonly adventurerId: string;
  readonly classId: string;
  readonly status: 'alive' | 'dead';
  readonly location: string;
  readonly torches: number;
  readonly currentHp: number;
  readonly spellCharges: readonly {
    readonly chargeId: string;
    readonly definitionId: string;
    readonly remainingUses: 0 | 1;
  }[];
  readonly death: Readonly<Record<string, unknown>> | null;
  readonly [key: string]: unknown;
}
