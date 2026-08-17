import {
  authorizedPalaceRewardContentVersion,
  authorizedPalaceRewardManifest,
  authorizedPalaceRewardPackage,
  authorizedPalaceRewardRulesVersion,
} from './authorized-palace-rewards.ts';
import {
  validatePalaceContentManifest,
  type PalaceContentId,
  type PalaceContentManifest,
  type PalaceManifestEntry,
} from './palace-manifest.ts';

export type PalaceRewardContentDefinition = typeof authorizedPalaceRewardPackage;
export type PalaceRewardTableDefinition = PalaceRewardContentDefinition['tables'][number];

export type PalaceRewardContentResult =
  | {
      readonly ok: true;
      readonly content: PalaceRewardContentDefinition;
      readonly validationEvidence: readonly string[];
    }
  | {
      readonly ok: false;
      readonly errors: readonly { readonly field: string; readonly reason: string }[];
    };

export function validatePalaceRewardContent(
  manifest: PalaceContentManifest,
): PalaceRewardContentResult {
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
  if (manifest.schemaVersion !== authorizedPalaceRewardManifest.schemaVersion) {
    errors.push({ field: 'schemaVersion', reason: 'unsupported Palace manifest schema version' });
  }
  if (manifest.packageId !== 'palace') {
    errors.push({ field: 'packageId', reason: 'must identify the Palace content package' });
  }
  if (manifest.contentVersion !== authorizedPalaceRewardContentVersion) {
    errors.push({
      field: 'contentVersion',
      reason: `must pin selected reward content version ${authorizedPalaceRewardContentVersion}`,
    });
  }
  if (manifest.rulesVersion !== authorizedPalaceRewardRulesVersion) {
    errors.push({
      field: 'rulesVersion',
      reason: `must pin rules version ${authorizedPalaceRewardRulesVersion}`,
    });
  }

  const expectedById = indexUniqueEntries(authorizedPalaceRewardManifest.entries);
  const actualById = indexUniqueEntries(manifest.entries);
  if (manifest.entries.length !== authorizedPalaceRewardManifest.entries.length) {
    errors.push({
      field: 'entries',
      reason: `must contain exactly ${authorizedPalaceRewardManifest.entries.length} selected reward entries`,
    });
  }

  for (const [id, expected] of expectedById) {
    const actual = actualById.get(id);
    if (actual === undefined) {
      errors.push({ field: 'entries', reason: `missing selected reward content ${id}` });
      continue;
    }
    if (!deepEqualEntry(actual, expected)) {
      errors.push({
        field: `${id}.selectedDefinition`,
        reason: 'does not match the authorized, version-pinned Palace reward definition',
      });
    }
  }
  for (const id of actualById.keys()) {
    if (!expectedById.has(id)) {
      errors.push({ field: 'entries', reason: `unrecognized Palace reward content ${id}` });
    }
  }
  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    content: authorizedPalaceRewardPackage,
    validationEvidence: [
      `manifest:${manifest.packageId}@${manifest.contentVersion}`,
      `rules:${manifest.rulesVersion}`,
      `contract:${authorizedPalaceRewardPackage.followOnContract.id}`,
      `spell-table:${authorizedPalaceRewardPackage.basicSpellTableReference.tableId}@${authorizedPalaceRewardPackage.basicSpellTableReference.contentVersion}`,
      ...authorizedPalaceRewardPackage.tables.map(
        ({ id, rows }) => `table:${id}:${rows.length}-rows`,
      ),
    ],
  };
}

export function resolvePalaceRewardRoll(
  content: PalaceRewardContentDefinition,
  tableId: PalaceContentId,
  roll: number,
) {
  if (!Number.isInteger(roll)) return null;
  const table = content.tables.find(({ id }) => id === tableId);
  if (table === undefined) return null;
  return table.rows.find(({ range }) => roll >= range.from && roll <= range.to) ?? null;
}

export function resolvePalaceRewardBasicSpellRoll(
  content: PalaceRewardContentDefinition,
  roll: number,
) {
  if (!Number.isInteger(roll)) return null;
  return content.basicSpellTableReference.rows.find((row) => row.roll === roll) ?? null;
}

export function getPalaceRoomFollowOn(
  content: PalaceRewardContentDefinition,
  sourceRowId: PalaceContentId,
) {
  const { roomContent } = content.followOnContract;
  if (roomContent.magicScrolls.sourceRowId === sourceRowId) {
    return { kind: 'magic-scrolls', definition: roomContent.magicScrolls } as const;
  }
  if (roomContent.magicItems.sourceRowId === sourceRowId) {
    return { kind: 'magic-items', definition: roomContent.magicItems } as const;
  }
  if (roomContent.chests.sourceRowIds.some((id) => id === sourceRowId)) {
    return { kind: 'chest', definition: roomContent.chests } as const;
  }
  return null;
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
