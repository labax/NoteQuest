import {
  authorizedPalaceFinaleContentVersion,
  authorizedPalaceFinaleManifest,
  authorizedPalaceFinalePackage,
  authorizedPalaceFinaleRulesVersion,
} from './authorized-palace-finale.ts';
import {
  validatePalaceContentManifest,
  type PalaceContentManifest,
  type PalaceManifestEntry,
} from './palace-manifest.ts';

export type PalaceFinaleContentDefinition = typeof authorizedPalaceFinalePackage;

export type PalaceFinaleContentResult =
  | {
      readonly ok: true;
      readonly content: PalaceFinaleContentDefinition;
      readonly validationEvidence: readonly string[];
    }
  | {
      readonly ok: false;
      readonly errors: readonly { readonly field: string; readonly reason: string }[];
    };

export function validatePalaceFinaleContent(
  manifest: PalaceContentManifest,
): PalaceFinaleContentResult {
  if (!isManifestShape(manifest)) {
    return { ok: false, errors: [{ field: 'manifest', reason: 'must be a Palace manifest' }] };
  }

  let genericValidation: ReturnType<typeof validatePalaceContentManifest>;
  try {
    genericValidation = validatePalaceContentManifest(manifest);
  } catch {
    return {
      ok: false,
      errors: [{ field: 'manifest', reason: 'contains malformed manifest entry metadata' }],
    };
  }
  if (!genericValidation.valid) return { ok: false, errors: genericValidation.errors };

  const errors: { field: string; reason: string }[] = [];
  if (manifest.schemaVersion !== authorizedPalaceFinaleManifest.schemaVersion) {
    errors.push({ field: 'schemaVersion', reason: 'unsupported Palace manifest schema version' });
  }
  if (manifest.packageId !== 'palace') {
    errors.push({ field: 'packageId', reason: 'must identify the Palace content package' });
  }
  if (manifest.contentVersion !== authorizedPalaceFinaleContentVersion) {
    errors.push({
      field: 'contentVersion',
      reason: `must pin selected finale content version ${authorizedPalaceFinaleContentVersion}`,
    });
  }
  if (manifest.rulesVersion !== authorizedPalaceFinaleRulesVersion) {
    errors.push({
      field: 'rulesVersion',
      reason: `must pin rules version ${authorizedPalaceFinaleRulesVersion}`,
    });
  }

  const expectedById = indexUniqueEntries(authorizedPalaceFinaleManifest.entries);
  const actualById = indexUniqueEntries(manifest.entries);
  if (manifest.entries.length !== authorizedPalaceFinaleManifest.entries.length) {
    errors.push({
      field: 'entries',
      reason: `must contain exactly ${authorizedPalaceFinaleManifest.entries.length} selected finale entries`,
    });
  }

  for (const [id, expected] of expectedById) {
    const actual = actualById.get(id);
    if (actual === undefined) {
      errors.push({ field: 'entries', reason: `missing selected finale content ${id}` });
      continue;
    }
    if (!deepEqualEntry(actual, expected)) {
      errors.push({
        field: `${id}.selectedDefinition`,
        reason: 'does not match the authorized, version-pinned Palace finale definition',
      });
    }
  }

  for (const id of actualById.keys()) {
    if (!expectedById.has(id)) {
      errors.push({ field: 'entries', reason: `unrecognized Palace finale content ${id}` });
    }
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    content: authorizedPalaceFinalePackage,
    validationEvidence: [
      `manifest:${manifest.packageId}@${manifest.contentVersion}`,
      `rules:${manifest.rulesVersion}`,
      `contract:${authorizedPalaceFinalePackage.finalRoomContract.id}`,
      `table:${authorizedPalaceFinalePackage.bossTable.id}:6-rows`,
    ],
  };
}

export function resolvePalaceBossRoll(content: PalaceFinaleContentDefinition, roll: number) {
  if (!Number.isInteger(roll)) return null;
  return content.bossTable.rows.find(({ range }) => roll >= range.from && roll <= range.to) ?? null;
}

export type PalaceFinalRoomTransitionContext =
  | {
      readonly routeKind: 'normal-downward-staircase' | 'secret-downward-staircase';
      readonly sourceFloor: 1 | 2;
      readonly existingFinalRoomCount: number;
    }
  | {
      readonly routeKind: 'generated-destination';
      readonly destinationFloor: 1 | 2;
      readonly destinationKind: 'corridor' | 'room' | 'staircase';
      readonly outwardConnectionCount: number;
      readonly remainingReachableUnresolvedConnectionCount: number;
      readonly existingFinalRoomCount: number;
    };

export type PalaceFinalRoomTransitionResult =
  | {
      readonly ok: true;
      readonly transition: 'create-final-room';
      readonly destinationFloor: 1 | 2 | 3;
      readonly reason: 'floor-three-descent' | 'frontier-exhaustion';
      readonly contract: PalaceFinaleContentDefinition['finalRoomContract'];
    }
  | {
      readonly ok: true;
      readonly transition: 'continue-ordinary-generation';
    }
  | {
      readonly ok: false;
      readonly error: {
        readonly code: 'invalid_finale_context' | 'duplicate_final_room';
        readonly message: string;
      };
    };

/**
 * Selects the authorized final-room transition without generating identities,
 * rolling the boss table, or mutating topology.
 */
export function selectPalaceFinalRoomTransition(
  content: PalaceFinaleContentDefinition,
  context: PalaceFinalRoomTransitionContext,
): PalaceFinalRoomTransitionResult {
  if (!Number.isSafeInteger(context.existingFinalRoomCount) || context.existingFinalRoomCount < 0) {
    return {
      ok: false,
      error: {
        code: 'invalid_finale_context',
        message: 'Final-room count must be a non-negative safe integer.',
      },
    };
  }

  const floorThreeDescent =
    (context.routeKind === 'normal-downward-staircase' ||
      context.routeKind === 'secret-downward-staircase') &&
    context.sourceFloor === 2;

  let frontierExhaustion = false;
  if (context.routeKind === 'generated-destination') {
    if (
      !Number.isSafeInteger(context.outwardConnectionCount) ||
      context.outwardConnectionCount < 0 ||
      !Number.isSafeInteger(context.remainingReachableUnresolvedConnectionCount) ||
      context.remainingReachableUnresolvedConnectionCount < 0
    ) {
      return {
        ok: false,
        error: {
          code: 'invalid_finale_context',
          message: 'Connection counts must be non-negative safe integers.',
        },
      };
    }
    frontierExhaustion =
      context.destinationKind ===
        content.finalRoomContract.frontierExhaustionFallback.generatedDestinationKind &&
      context.outwardConnectionCount ===
        content.finalRoomContract.frontierExhaustionFallback
          .generatedDestinationOutwardConnectionCount &&
      context.remainingReachableUnresolvedConnectionCount ===
        content.finalRoomContract.frontierExhaustionFallback
          .remainingReachableUnresolvedConnectionCount;
  }

  if (!floorThreeDescent && !frontierExhaustion) {
    return { ok: true, transition: 'continue-ordinary-generation' };
  }
  if (context.existingFinalRoomCount !== 0) {
    return {
      ok: false,
      error: {
        code: 'duplicate_final_room',
        message: 'A Palace dungeon may contain only one final room.',
      },
    };
  }

  return {
    ok: true,
    transition: 'create-final-room',
    destinationFloor: context.routeKind === 'generated-destination' ? context.destinationFloor : 3,
    reason: floorThreeDescent ? 'floor-three-descent' : 'frontier-exhaustion',
    contract: content.finalRoomContract,
  };
}

function isManifestShape(value: unknown): value is PalaceContentManifest {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray(Reflect.get(value, 'entries')) &&
    typeof Reflect.get(value, 'schemaVersion') === 'string' &&
    typeof Reflect.get(value, 'packageId') === 'string' &&
    typeof Reflect.get(value, 'contentVersion') === 'string' &&
    typeof Reflect.get(value, 'rulesVersion') === 'string'
  );
}

function indexUniqueEntries(entries: readonly PalaceManifestEntry[]) {
  return new Map(entries.map((entry) => [entry.id, entry]));
}

function deepEqualEntry(left: PalaceManifestEntry, right: PalaceManifestEntry): boolean {
  return JSON.stringify(sortJsonValue(left)) === JSON.stringify(sortJsonValue(right));
}

function sortJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJsonValue);
  if (typeof value !== 'object' || value === null) return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => [key, sortJsonValue(child)]),
  );
}
