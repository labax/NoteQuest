import {
  authorizedPalaceExplorationContentVersion,
  authorizedPalaceExplorationManifest,
  authorizedPalaceExplorationPackage,
  authorizedPalaceExplorationRulesVersion,
} from './authorized-palace-exploration.ts';
import {
  validatePalaceContentManifest,
  type PalaceContentManifest,
  type PalaceManifestEntry,
} from './palace-manifest.ts';

export type PalaceExplorationContentDefinition = typeof authorizedPalaceExplorationPackage;

export type PalaceExplorationContentResult =
  | {
      readonly ok: true;
      readonly content: PalaceExplorationContentDefinition;
      readonly validationEvidence: readonly string[];
    }
  | {
      readonly ok: false;
      readonly errors: readonly { readonly field: string; readonly reason: string }[];
    };

/**
 * Validates that a manifest contains exactly the selected, rights-cleared Palace
 * exploration package. The generic manifest validator supplies graph, dice-range,
 * governance, and release checks; this adapter pins every table and row payload.
 */
export function validatePalaceExplorationContent(
  manifest: PalaceContentManifest,
): PalaceExplorationContentResult {
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
  if (manifest.schemaVersion !== authorizedPalaceExplorationManifest.schemaVersion) {
    errors.push({ field: 'schemaVersion', reason: 'unsupported Palace manifest schema version' });
  }
  if (manifest.packageId !== 'palace') {
    errors.push({ field: 'packageId', reason: 'must identify the Palace content package' });
  }
  if (manifest.contentVersion !== authorizedPalaceExplorationContentVersion) {
    errors.push({
      field: 'contentVersion',
      reason: `must pin selected content version ${authorizedPalaceExplorationContentVersion}`,
    });
  }
  if (manifest.rulesVersion !== authorizedPalaceExplorationRulesVersion) {
    errors.push({
      field: 'rulesVersion',
      reason: `must pin rules version ${authorizedPalaceExplorationRulesVersion}`,
    });
  }

  const expectedById = indexUniqueEntries(authorizedPalaceExplorationManifest.entries);
  const actualById = indexUniqueEntries(manifest.entries);
  if (manifest.entries.length !== authorizedPalaceExplorationManifest.entries.length) {
    errors.push({
      field: 'entries',
      reason: `must contain exactly ${authorizedPalaceExplorationManifest.entries.length} selected table and row entries`,
    });
  }

  for (const [id, expected] of expectedById) {
    const actual = actualById.get(id);
    if (actual === undefined) {
      errors.push({ field: 'entries', reason: `missing selected content ${id}` });
      continue;
    }
    if (!deepEqualEntry(actual, expected)) {
      errors.push({
        field: `${id}.selectedDefinition`,
        reason: 'does not match the authorized, version-pinned Palace definition',
      });
    }
  }

  for (const id of actualById.keys()) {
    if (!expectedById.has(id)) {
      errors.push({ field: 'entries', reason: `unrecognized Palace exploration content ${id}` });
    }
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    content: authorizedPalaceExplorationPackage,
    validationEvidence: [
      `manifest:${manifest.packageId}@${manifest.contentVersion}`,
      `rules:${manifest.rulesVersion}`,
      ...authorizedPalaceExplorationPackage.tables.map(
        ({ id, rows }) => `table:${id}:${rows.length}-rows`,
      ),
    ],
  };
}

/** Resolve a validated table row without relying on array order. */
export function resolvePalaceExplorationRoll(
  table: PalaceExplorationContentDefinition['tables'][number],
  roll: number,
) {
  if (!Number.isInteger(roll)) return null;
  return table.rows.find(({ range }) => roll >= range.from && roll <= range.to) ?? null;
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
