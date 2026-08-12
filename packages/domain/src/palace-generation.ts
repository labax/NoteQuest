import {
  createNamedRandomStream,
  randomStreamPurposeRegistry,
  serializeNamedRandomStream,
  type NamedRandomStreamState,
} from './rng.ts';

export const palaceGenerationRulesVersion = 'digital-rules-specification-v0.1' as const;

export interface ValidatedPalaceGenerationContent {
  readonly packageId: 'palace';
  readonly contentVersion: string;
  readonly rulesVersion: string;
  readonly entranceDefinitionId: `palace.${string}`;
  readonly entranceConnections: readonly {
    readonly definitionId: `palace.${string}`;
    readonly directionLabel: string;
    readonly connectionState: 'unresolved';
    readonly doorState: 'unknown';
    readonly alertState: 'quiet';
  }[];
  readonly validationEvidence: readonly string[];
}

export interface PalaceSegmentState {
  readonly segmentId: string;
  readonly floor: 1;
  readonly kind: 'entrance';
  readonly definitionId: `palace.${string}`;
  readonly encounter: { readonly state: 'empty'; readonly encounterId: null };
  readonly searched: false;
}

export interface PalaceConnectionState {
  readonly connectionId: string;
  readonly sourceSegmentId: string;
  readonly destinationSegmentId: null;
  readonly state: 'unresolved';
  readonly directionLabel: string;
  readonly definitionId: `palace.${string}`;
  readonly definitionVersion: string;
  readonly doorState: 'unknown';
  readonly alertState: 'quiet';
}

export interface PalaceFloorState {
  readonly floorId: string;
  readonly dungeonId: string;
  readonly floorNumber: 1;
  readonly entranceSegmentId: string;
  readonly segmentIds: readonly string[];
  readonly connectionIds: readonly string[];
  readonly generationStatus: 'active';
}

export interface PalaceDungeonState {
  readonly dungeonId: string;
  readonly dungeonType: 'palace';
  readonly seed: string;
  readonly rulesVersion: string;
  readonly contentVersion: string;
  readonly generationVersion: 'palace-generation.v0.1';
  readonly floorIds: readonly [string];
  readonly floors: readonly [PalaceFloorState];
  readonly currentSegmentId: string;
  readonly segments: readonly PalaceSegmentState[];
  readonly connections: readonly PalaceConnectionState[];
  readonly generationStream: NamedRandomStreamState;
  readonly generationEvidence: {
    readonly entranceDefinitionId: `palace.${string}`;
    readonly validationEvidence: readonly string[];
    readonly draws: readonly number[];
  };
}

export type PalaceGenerationResult =
  | { readonly ok: true; readonly dungeon: PalaceDungeonState }
  | {
      readonly ok: false;
      readonly error: {
        readonly code: string;
        readonly message: string;
        readonly evidence: {
          readonly seed: string;
          readonly rulesVersion: string;
          readonly contentVersion: string;
          readonly generationVersion: 'palace-generation.v0.1';
          readonly trace: readonly string[];
        };
      };
    };

/** Pure generation: callers can reject a result without changing the previous committed state. */
export function generatePalaceDungeon(
  seed: string,
  content: ValidatedPalaceGenerationContent,
): PalaceGenerationResult {
  const failure = (
    code: string,
    message: string,
    trace: readonly string[],
  ): PalaceGenerationResult => ({
    ok: false,
    error: {
      code,
      message,
      evidence: {
        seed,
        rulesVersion: content.rulesVersion,
        contentVersion: content.contentVersion,
        generationVersion: 'palace-generation.v0.1',
        trace,
      },
    },
  });
  if (content.packageId !== 'palace' || content.validationEvidence.length === 0) {
    return failure('content_not_validated', 'Validated Palace content is required.', [
      'validate-content-evidence',
    ]);
  }
  if (content.rulesVersion !== palaceGenerationRulesVersion) {
    return failure('rules_version_mismatch', 'Palace content rules are incompatible.', [
      'validate-rules-version',
    ]);
  }
  if (
    !Array.isArray(content.entranceConnections) ||
    content.entranceConnections.length < 1 ||
    new Set(content.entranceConnections.map((connection) => connection.definitionId)).size !==
      content.entranceConnections.length
  ) {
    return failure('invalid_entrance', 'The Palace entrance needs a connection.', [
      'validate-entrance-connection-count',
    ]);
  }

  try {
    const stream = createNamedRandomStream(
      seed,
      randomStreamPurposeRegistry.dungeonGeneration.name,
    );
    let rng = stream.rng;
    const draws: number[] = [];
    const idDraw = rng.next();
    rng = idDraw.state;
    const dungeonId = deterministicUuid(idDraw.value, 'dungeon');
    const entranceDraw = rng.next();
    rng = entranceDraw.state;
    draws[0] = entranceDraw.value;
    const entranceId = deterministicUuid(draws[0] ?? 0, 'entrance');
    const floorId = deterministicUuid(draws[0] ?? 0, 'floor-1');
    const connections: PalaceConnectionState[] = [];
    for (const definition of content.entranceConnections) {
      const draw = rng.next();
      rng = draw.state;
      draws.push(draw.value);
      connections.push({
        connectionId: deterministicUuid(entranceDraw.value, definition.definitionId),
        sourceSegmentId: entranceId,
        destinationSegmentId: null,
        state: 'unresolved',
        directionLabel: definition.directionLabel,
        definitionId: definition.definitionId,
        definitionVersion: content.contentVersion,
        doorState: definition.doorState,
        alertState: definition.alertState,
      });
    }
    return {
      ok: true,
      dungeon: {
        dungeonId,
        dungeonType: 'palace',
        seed,
        rulesVersion: palaceGenerationRulesVersion,
        contentVersion: content.contentVersion,
        generationVersion: 'palace-generation.v0.1',
        currentSegmentId: entranceId,
        segments: [
          {
            segmentId: entranceId,
            floor: 1,
            kind: 'entrance',
            definitionId: content.entranceDefinitionId,
            encounter: { state: 'empty', encounterId: null },
            searched: false,
          },
        ],
        connections,
        floorIds: [floorId],
        floors: [
          {
            floorId,
            dungeonId,
            floorNumber: 1,
            entranceSegmentId: entranceId,
            segmentIds: [entranceId],
            connectionIds: connections.map((connection) => connection.connectionId),
            generationStatus: 'active',
          },
        ],
        generationStream: serializeNamedRandomStream({ identity: stream.identity, rng }),
        generationEvidence: {
          entranceDefinitionId: content.entranceDefinitionId,
          validationEvidence: content.validationEvidence,
          draws,
        },
      },
    };
  } catch (cause) {
    return failure('invalid_seed', cause instanceof Error ? cause.message : String(cause), [
      'create-dungeon-generation-stream',
    ]);
  }
}

function deterministicUuid(draw: number, namespace: string): string {
  let hash = BigInt(draw >>> 0);
  for (const character of namespace)
    hash = BigInt.asUintN(64, (hash * 1099511628211n) ^ BigInt(character.charCodeAt(0)));
  const hex = hash.toString(16).padStart(32, '0');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}
