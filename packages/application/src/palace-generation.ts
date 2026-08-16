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
    const [slot, adventurerRecord, profileRecord, allAdventurers, priorSnapshot, priorEvents] =
      await Promise.all([
        this.dependencies.slots.get(command.slotId),
        this.dependencies.records.get(command.slotId, 'adventurer', command.adventurerId),
        this.dependencies.records.get(command.slotId, 'adventurer-profile', command.adventurerId),
        this.dependencies.records.listByType(command.slotId, 'adventurer'),
        this.dependencies.snapshots.get(command.slotId, 'last-valid'),
        this.dependencies.events.listForSlot(command.slotId),
      ]);
    if (!slot.ok || !adventurerRecord.ok || !profileRecord.ok || !allAdventurers.ok) {
      return {
        ok: false,
        committed: false,
        code: 'missing_adventurer',
        message: 'The selected committed adventurer was not found.',
      };
    }
    if (
      !priorSnapshot.ok ||
      !priorEvents.ok ||
      !isCoherentPriorRecovery(
        priorSnapshot.value,
        priorEvents.value,
        slot.value,
        adventurerRecord.value,
      )
    ) {
      return {
        ok: false,
        committed: false,
        code: 'recovery_prerequisite_unavailable',
        message: 'The current durable recovery history could not be read coherently.',
      };
    }
    if (
      adventurerRecord.value.slotId !== command.slotId ||
      adventurerRecord.value.recordId !== command.adventurerId ||
      profileRecord.value.slotId !== command.slotId ||
      profileRecord.value.recordType !== 'adventurer-profile' ||
      profileRecord.value.recordId !== command.adventurerId ||
      profileRecord.value.ownerType !== 'adventurer' ||
      profileRecord.value.ownerId !== command.adventurerId ||
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
    const inventory = validateCanonicalInventory(itemRecords.value, adventurer);
    if (!inventory.ok) {
      return {
        ok: false,
        committed: false,
        code: 'invalid_item_state',
        message: inventory.message,
      };
    }
    const hasLamp = inventory.hasActiveLamp;
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
    const transitionAt = captured.events[0]?.timestamp ?? this.dependencies.now();
    const recoveryRecordId = `${expeditionId}:recoverable-belongings`;
    const transferredItems = darknessDeath
      ? inventory.items.filter((record) => isTransferableItem(record, adventurer))
      : [];
    const transferredItemIds = transferredItems.map((record) => record.recordId);
    const excludedItemIds = new Set(
      inventory.items
        .filter(
          (record) =>
            record.body.status !== undefined && nonRecoverableItemStatuses.has(record.body.status),
        )
        .map((record) => record.recordId),
    );
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
      backpackItemIds: darknessDeath ? [] : adventurer.backpackItemIds,
      armourItemIds: darknessDeath ? [] : adventurer.armourItemIds,
      equipment: darknessDeath ? [] : adventurer.equipment,
      coins: darknessDeath ? 0 : adventurer.coins,
      death: darknessDeath
        ? {
            cause: 'darkness',
            dungeonId: generated.dungeon.dungeonId,
            expeditionId,
            floor: 1,
            segmentId: generated.dungeon.currentSegmentId,
            occurredAt: transitionAt,
            recoveryRecordId,
          }
        : adventurer.death,
    };
    const stateRecords = [
      ...captured.stateRecords.filter((record) => record.recordType !== 'expedition'),
      { ...adventurerRecord.value, updatedAt: transitionAt, body: updatedAdventurer },
      ...transferredItems.map((record) =>
        transferItemToRecovery(record, recoveryRecordId, transitionAt),
      ),
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
              updatedAt: transitionAt,
              body: {
                adventurerId: command.adventurerId,
                profileRecordId: profileRecord.value.recordId,
                cause: 'darkness',
                dungeonId: generated.dungeon.dungeonId,
                expeditionId,
                floor: 1,
                segmentId: generated.dungeon.currentSegmentId,
                occurredAt: transitionAt,
                recoveryStatus: 'recoverable-belongings-available',
                recoveryRecordId,
              },
            } satisfies PersistedRecord,
            {
              slotId: command.slotId,
              recordType: 'recoverable-belongings',
              recordId: recoveryRecordId,
              dungeonId: generated.dungeon.dungeonId,
              expeditionId,
              ownerType: 'expedition-recovery',
              ownerId: recoveryRecordId,
              locationType: 'dungeon-segment',
              locationId: generated.dungeon.currentSegmentId,
              updatedAt: transitionAt,
              body: {
                adventurerId: command.adventurerId,
                dungeonId: generated.dungeon.dungeonId,
                expeditionId,
                floor: 1,
                segmentId: generated.dungeon.currentSegmentId,
                createdAt: transitionAt,
                recoveryStatus: 'available',
                corpsePresent: false,
                itemIds: transferredItemIds,
                backpackItemIds: adventurer.backpackItemIds.filter((id) =>
                  transferredItemIds.includes(id),
                ),
                armourItemIds: adventurer.armourItemIds.filter((id) =>
                  transferredItemIds.includes(id),
                ),
                equipment: structuredClone(
                  adventurer.equipment.filter((item) => !excludedItemIds.has(item.itemId)),
                ),
                coins: adventurer.coins,
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
        updatedAt: transitionAt,
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
      updatedAt: transitionAt,
      schemaVersion: 1,
      rulesVersion: generated.dungeon.rulesVersion,
      contentVersion: generated.dungeon.contentVersion,
      currentSnapshotId: 'last-valid',
      lastValidSnapshotId: 'last-valid',
      recoveryAvailable: true,
      integrityStatus: 'valid',
    };
    const enrichedEvents = captured.events.map((event) => ({
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
    }));
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
            createdAt: transitionAt,
            schemaVersion: 1,
            sourceRevision: slot.value.revision + 1,
            body: cumulativeSnapshotBody(priorSnapshot.value.body, {
              stateRecords,
              randomStreamRecords: captured.randomStreamRecords ?? [],
              randomResultRecords: captured.randomResultRecords ?? [],
              events: enrichedEvents,
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
      events: enrichedEvents,
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
    const [pointer, snapshot, slot] = await Promise.all([
      this.dependencies.records.get(slotId, 'palace-current-run', 'current'),
      this.dependencies.snapshots.get(slotId, 'last-valid'),
      this.dependencies.slots.get(slotId),
    ]);
    let liveFailure: LoadPalaceRunResult | { readonly ok: false; readonly error: RepositoryError } =
      pointer.ok
        ? {
            ok: false,
            error: { code: 'invalid_record', message: 'The current Palace pointer is malformed.' },
          }
        : pointer;
    if (
      pointer.ok &&
      pointer.value.slotId === slotId &&
      pointer.value.recordType === 'palace-current-run' &&
      pointer.value.recordId === 'current' &&
      isCurrentRunPointer(pointer.value.body)
    ) {
      const current = await loadPalaceRun(
        slotId,
        pointer.value.body.dungeonId,
        pointer.value.body.expeditionId,
        this.dependencies.records,
      );
      liveFailure = current;
      if (
        current.ok &&
        current.expedition.adventurerId === pointer.value.body.adventurerId &&
        current.outcome === pointer.value.body.outcome
      ) {
        const adventurer = await this.dependencies.records.get(
          slotId,
          'adventurer',
          pointer.value.body.adventurerId,
        );
        if (
          adventurer.ok &&
          isAdventurerOutcomeCoherent(adventurer.value, pointer.value.body) &&
          (await this.hasCoherentTerminalEvidence(slotId, pointer.value.body))
        )
          return current;
      }
    }
    if (!slot.ok) return slot;
    if (!snapshot.ok) return liveFailure;
    if (
      snapshot.value.slotId !== slotId ||
      snapshot.value.snapshotClass !== 'last-valid' ||
      snapshot.value.schemaVersion !== 1 ||
      snapshot.value.sourceRevision !== slot.value.revision ||
      slot.value.currentSnapshotId !== 'last-valid' ||
      slot.value.lastValidSnapshotId !== 'last-valid' ||
      slot.value.integrityStatus !== 'valid' ||
      typeof snapshot.value.body !== 'object' ||
      snapshot.value.body === null
    )
      return liveFailure;
    const body = snapshot.value.body as Record<string, unknown>;
    const rows = [
      ...(Array.isArray(body['stateRecords']) ? body['stateRecords'] : []),
      ...(Array.isArray(body['randomStreamRecords']) ? body['randomStreamRecords'] : []),
      ...(Array.isArray(body['randomResultRecords']) ? body['randomResultRecords'] : []),
    ].filter(isPersistedRecordValue);
    const snapshotPointer = isCurrentRunPointer(body['currentRun'])
      ? body['currentRun']
      : undefined;
    if (snapshotPointer === undefined) return liveFailure;
    const recoveredDungeons = rows.filter(
      (record) => record.recordType === 'dungeon' && record.recordId === snapshotPointer.dungeonId,
    );
    const recoveredExpeditions = rows.filter(
      (record) =>
        record.recordType === 'expedition' && record.recordId === snapshotPointer.expeditionId,
    );
    if (recoveredDungeons.length !== 1 || recoveredExpeditions.length !== 1) return liveFailure;
    const recoveredDungeon = recoveredDungeons[0]!;
    const recoveredExpedition = recoveredExpeditions[0]!;
    const recoveryRecords: Pick<RecordRepository, 'get'> = {
      async get(requestedSlotId, recordType, recordId) {
        const values = rows.filter(
          (record) =>
            record.slotId === requestedSlotId &&
            record.recordType === recordType &&
            record.recordId === recordId,
        );
        return values.length !== 1
          ? {
              ok: false,
              error: {
                code: 'invalid_record',
                message: 'Recovery record is missing or duplicated.',
              },
            }
          : { ok: true, value: values[0]! };
      },
    };
    const recovered = await loadPalaceRun(
      slotId,
      recoveredDungeon.recordId,
      recoveredExpedition.recordId,
      recoveryRecords,
    );
    if (!recovered.ok) return liveFailure;
    if (
      recovered.dungeon.rulesVersion !== slot.value.rulesVersion ||
      recovered.dungeon.contentVersion !== slot.value.contentVersion ||
      recovered.expedition.adventurerId !== snapshotPointer.adventurerId ||
      recovered.outcome !== snapshotPointer.outcome
    )
      return liveFailure;
    const recoveredAdventurers = rows.filter(
      (record) =>
        record.recordType === 'adventurer' && record.recordId === snapshotPointer.adventurerId,
    );
    const recoveredEvents = Array.isArray(body['events']) ? body['events'] : [];
    if (
      recoveredAdventurers.length !== 1 ||
      !isAdventurerOutcomeCoherent(recoveredAdventurers[0]!, snapshotPointer) ||
      recoveredEvents.filter(
        (event) =>
          typeof event === 'object' &&
          event !== null &&
          Reflect.get(event, 'slotId') === slotId &&
          Reflect.get(event, 'expeditionId') === snapshotPointer.expeditionId &&
          typeof Reflect.get(event, 'body') === 'object' &&
          Reflect.get(event, 'body') !== null &&
          Reflect.get(Reflect.get(event, 'body'), 'adventurerId') === snapshotPointer.adventurerId,
      ).length !== 1 ||
      !hasCoherentRecoveredTerminalEvidence(rows, snapshotPointer)
    )
      return liveFailure;
    return recovered;
  }

  private async hasCoherentTerminalEvidence(
    slotId: SaveSlotId,
    pointer: Required<CurrentRunPointer>,
  ): Promise<boolean> {
    if (pointer.outcome !== 'darkness-death') return true;
    const [graveyard, belongings] = await Promise.all([
      this.dependencies.records.listByType(slotId, 'graveyard'),
      this.dependencies.records.listByType(slotId, 'recoverable-belongings'),
    ]);
    return (
      graveyard.ok &&
      belongings.ok &&
      hasCoherentRecoveredTerminalEvidence([...graveyard.value, ...belongings.value], pointer)
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

function isAdventurerOutcomeCoherent(
  record: PersistedRecord,
  pointer: Required<CurrentRunPointer>,
): boolean {
  if (
    record.recordType !== 'adventurer' ||
    record.recordId !== pointer.adventurerId ||
    typeof record.body !== 'object' ||
    record.body === null ||
    Reflect.get(record.body, 'adventurerId') !== pointer.adventurerId
  )
    return false;
  const status = Reflect.get(record.body, 'status');
  const location = Reflect.get(record.body, 'location');
  if (pointer.outcome === 'active') return status === 'alive' && location === 'dungeon';
  if (pointer.outcome === 'miner-emergency-exit') return status === 'alive' && location === 'town';
  const death = Reflect.get(record.body, 'death');
  return (
    status === 'dead' &&
    location === 'dungeon' &&
    typeof death === 'object' &&
    death !== null &&
    Reflect.get(death, 'cause') === 'darkness' &&
    Reflect.get(death, 'dungeonId') === pointer.dungeonId &&
    Reflect.get(death, 'expeditionId') === pointer.expeditionId
  );
}

function hasCoherentRecoveredTerminalEvidence(
  rows: readonly PersistedRecord[],
  pointer: Required<CurrentRunPointer>,
): boolean {
  if (pointer.outcome !== 'darkness-death') return true;
  const graves = rows.filter(
    (record) =>
      record.recordType === 'graveyard' &&
      record.dungeonId === pointer.dungeonId &&
      record.expeditionId === pointer.expeditionId,
  );
  const belongings = rows.filter(
    (record) =>
      record.recordType === 'recoverable-belongings' &&
      record.dungeonId === pointer.dungeonId &&
      record.expeditionId === pointer.expeditionId,
  );
  if (graves.length !== 1 || belongings.length !== 1) return false;
  const grave = graves[0]!.body;
  const recovery = belongings[0]!.body;
  return (
    typeof grave === 'object' &&
    grave !== null &&
    Reflect.get(grave, 'adventurerId') === pointer.adventurerId &&
    Reflect.get(grave, 'cause') === 'darkness' &&
    Reflect.get(grave, 'floor') === 1 &&
    typeof Reflect.get(grave, 'segmentId') === 'string' &&
    typeof Reflect.get(grave, 'occurredAt') === 'string' &&
    Reflect.get(grave, 'recoveryStatus') === 'recoverable-belongings-available' &&
    typeof recovery === 'object' &&
    recovery !== null &&
    Reflect.get(recovery, 'adventurerId') === pointer.adventurerId &&
    Reflect.get(recovery, 'corpsePresent') === false &&
    Reflect.get(recovery, 'recoveryStatus') === 'available' &&
    Reflect.get(recovery, 'segmentId') === Reflect.get(grave, 'segmentId')
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

function isCoherentPriorRecovery(
  snapshot: import('./repositories.ts').SnapshotRecord,
  events: readonly import('./repositories.ts').EventRecord[],
  slot: SlotRecord,
  adventurer: PersistedRecord,
): boolean {
  if (
    snapshot.slotId !== slot.slotId ||
    snapshot.snapshotClass !== 'last-valid' ||
    snapshot.schemaVersion !== 1 ||
    snapshot.sourceRevision !== slot.revision ||
    slot.currentSnapshotId !== 'last-valid' ||
    slot.lastValidSnapshotId !== 'last-valid' ||
    slot.integrityStatus !== 'valid' ||
    typeof snapshot.body !== 'object' ||
    snapshot.body === null
  )
    return false;
  const body = snapshot.body as Record<string, unknown>;
  const stateRecords = body['stateRecords'];
  if (!Array.isArray(stateRecords) || !stateRecords.every(isPersistedRecordValue)) return false;
  const matchingAdventurers = stateRecords.filter(
    (record) =>
      record.slotId === slot.slotId &&
      record.recordType === 'adventurer' &&
      record.recordId === adventurer.recordId,
  );
  if (
    matchingAdventurers.length !== 1 ||
    !safeSameValue(matchingAdventurers[0]!.body, adventurer.body)
  )
    return false;
  for (const key of ['randomStreamRecords', 'randomResultRecords'] as const) {
    const records = body[key];
    if (!Array.isArray(records) || !records.every(isPersistedRecordValue)) return false;
    const identities = records.map((record) => `${record.recordType}:${record.recordId}`);
    if (new Set(identities).size !== identities.length) return false;
  }
  if (events.length === 0 || events.some((event) => event.slotId !== slot.slotId)) return false;
  const sequences = events.map((event) => event.sequence).sort((left, right) => left - right);
  return (
    new Set(sequences).size === sequences.length &&
    sequences.every((sequence, index) => sequence === index + 1)
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
    Number.isSafeInteger(candidate.coins) &&
    (candidate.coins ?? -1) >= 0 &&
    Array.isArray(candidate.backpackItemIds) &&
    candidate.backpackItemIds.every((itemId) => typeof itemId === 'string' && itemId.length > 0) &&
    new Set(candidate.backpackItemIds).size === candidate.backpackItemIds.length &&
    Array.isArray(candidate.armourItemIds) &&
    candidate.armourItemIds.every((itemId) => typeof itemId === 'string' && itemId.length > 0) &&
    Array.isArray(candidate.equipment) &&
    candidate.equipment.every(
      (item) => typeof item === 'object' && item !== null && typeof item.itemId === 'string',
    ) &&
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

type CanonicalItemRecord = PersistedRecord & {
  readonly body: {
    readonly definitionId: string;
    readonly ownerAdventurerId: string | null;
    readonly carried: boolean;
    readonly active: boolean;
    readonly status?: string;
    readonly locationType?: string;
    readonly locationId?: string;
    readonly [key: string]: unknown;
  };
};

export function validateCanonicalInventory(
  records: readonly PersistedRecord[],
  adventurer: CanonicalEntryAdventurer,
):
  | {
      readonly ok: true;
      readonly items: readonly CanonicalItemRecord[];
      readonly hasActiveLamp: boolean;
    }
  | { readonly ok: false; readonly message: string } {
  const ids = records.map((record) => record.recordId);
  if (new Set(ids).size !== ids.length)
    return { ok: false, message: 'Canonical item identities are duplicated.' };
  const items = records as readonly CanonicalItemRecord[];
  const byId = new Map(items.map((record) => [record.recordId, record]));
  for (const backpackId of adventurer.backpackItemIds) {
    const record = byId.get(backpackId);
    if (
      record === undefined ||
      record.body.ownerAdventurerId !== adventurer.adventurerId ||
      record.body.carried !== true ||
      (record.body.locationType !== undefined && record.body.locationType !== 'backpack') ||
      (record.body.locationId !== undefined && record.body.locationId !== adventurer.adventurerId)
    )
      return { ok: false, message: 'A backpack item reference is missing or incoherent.' };
  }
  for (const record of items) {
    const selectedOwner = record.body.ownerAdventurerId === adventurer.adventurerId;
    const inBackpack = adventurer.backpackItemIds.includes(record.recordId);
    if (selectedOwner && record.body.carried !== inBackpack)
      return { ok: false, message: 'Selected-adventurer carried item membership is incoherent.' };
    if (selectedOwner && !inBackpack && record.body.locationType === 'backpack')
      return {
        ok: false,
        message: 'Selected-adventurer item location conflicts with its backpack.',
      };
    if (selectedOwner && record.body.active && !record.body.carried)
      return { ok: false, message: 'A non-carried selected-adventurer item cannot remain active.' };
  }
  return {
    ok: true,
    items,
    hasActiveLamp: items.some(
      (record) =>
        adventurer.backpackItemIds.includes(record.recordId) &&
        isCarriedActiveLamp(record.body, adventurer.adventurerId),
    ),
  };
}

const nonRecoverableItemStatuses = new Set(['destroyed', 'sold', 'spent', 'consumed']);

function isTransferableItem(
  record: CanonicalItemRecord,
  adventurer: CanonicalEntryAdventurer,
): boolean {
  if (
    record.body.ownerAdventurerId !== adventurer.adventurerId ||
    (record.body.status !== undefined && nonRecoverableItemStatuses.has(record.body.status))
  )
    return false;
  const equipmentIds = adventurer.equipment.map((item) => item.itemId);
  return (
    adventurer.backpackItemIds.includes(record.recordId) ||
    adventurer.armourItemIds.includes(record.recordId) ||
    equipmentIds.includes(record.recordId) ||
    record.body.carried
  );
}

export function transferItemToRecovery(
  record: PersistedRecord,
  recoveryRecordId: string,
  timestamp: string,
): PersistedRecord {
  const canonical = record as CanonicalItemRecord;
  return {
    ...canonical,
    ownerType: 'expedition-recovery',
    ownerId: recoveryRecordId,
    locationType: 'recoverable-belongings',
    locationId: recoveryRecordId,
    updatedAt: timestamp,
    body: {
      ...canonical.body,
      ownerAdventurerId: null,
      carried: false,
      active: false,
      locationType: 'recoverable-belongings',
      locationId: recoveryRecordId,
    },
  };
}

function isCanonicalItemState(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof Reflect.get(value, 'definitionId') === 'string' &&
    (typeof Reflect.get(value, 'ownerAdventurerId') === 'string' ||
      Reflect.get(value, 'ownerAdventurerId') === null) &&
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
  readonly coins: number;
  readonly backpackItemIds: readonly string[];
  readonly armourItemIds: readonly string[];
  readonly equipment: readonly { readonly itemId: string; readonly [key: string]: unknown }[];
  readonly spellCharges: readonly {
    readonly chargeId: string;
    readonly definitionId: string;
    readonly remainingUses: 0 | 1;
  }[];
  readonly death: Readonly<Record<string, unknown>> | null;
  readonly [key: string]: unknown;
}
