import type { SaveSlotId } from '@notequest/domain';
import {
  generatePalaceDungeon,
  type PalaceDungeonState,
  type ValidatedPalaceGenerationContent,
} from '@notequest/domain';
import type { ActionCommitResult, ActionTransactionCoordinator } from './action-commit.ts';
import type { PersistedRecord, RecordRepository, RepositoryError } from './repositories.ts';

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

interface PersistedActiveExpedition {
  readonly expeditionId: string;
  readonly dungeonId: string;
  readonly currentSegmentId: string;
  readonly physicalLight: number;
  readonly virtualLight: number;
  readonly status: 'active';
}

export type LoadPalaceRunResult =
  | {
      readonly ok: true;
      readonly dungeon: PalaceDungeonState;
      readonly expedition: PersistedActiveExpedition;
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
  if (!isActiveExpedition(expedition) || expedition.dungeonId !== dungeon.dungeonId) {
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
  ]);
  const failedRead = componentReads.find((read) => !read.ok);
  if (failedRead !== undefined && !failedRead.ok) return failedRead;

  const expectedBodies: readonly unknown[] = [
    ...dungeon.floors,
    ...dungeon.segments,
    ...dungeon.connections,
    dungeon.generationEvidence,
    dungeon.generationStream,
  ];
  const componentsMatch = componentReads.every(
    (read, index) =>
      read.ok && JSON.stringify(read.value.body) === JSON.stringify(expectedBodies[index]),
  );
  if (!componentsMatch) {
    return {
      ok: false,
      error: { code: 'invalid_state', message: 'Persisted Palace component records disagree.' },
    };
  }
  return { ok: true, dungeon, expedition };
}

function isPalaceDungeonState(value: unknown): value is PalaceDungeonState {
  if (typeof value !== 'object' || value === null) return false;
  const state = value as Partial<PalaceDungeonState>;
  return (
    state.dungeonType === 'palace' &&
    state.generationVersion === 'palace-generation.v0.1' &&
    typeof state.currentSegmentId === 'string' &&
    Array.isArray(state.floors) &&
    state.floors.length === 1 &&
    Array.isArray(state.segments) &&
    state.segments.some((segment) => segment.segmentId === state.currentSegmentId) &&
    Array.isArray(state.connections) &&
    typeof state.generationEvidence === 'object' &&
    state.generationEvidence !== null
  );
}

function isActiveExpedition(value: unknown): value is PersistedActiveExpedition {
  if (typeof value !== 'object' || value === null) return false;
  const expedition = value as Record<string, unknown>;
  return (
    typeof expedition['expeditionId'] === 'string' &&
    typeof expedition['dungeonId'] === 'string' &&
    typeof expedition['currentSegmentId'] === 'string' &&
    Number.isSafeInteger(expedition['physicalLight']) &&
    Number.isSafeInteger(expedition['virtualLight']) &&
    (expedition['physicalLight'] as number) >= 0 &&
    (expedition['virtualLight'] as number) >= 0 &&
    expedition['status'] === 'active'
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
