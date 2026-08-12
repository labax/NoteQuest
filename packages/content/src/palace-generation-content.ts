import { validatePalaceContentManifest, type PalaceContentManifest } from './palace-manifest.ts';

export interface PalaceGenerationContentDefinition {
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

export type PalaceGenerationContentResult =
  | { readonly ok: true; readonly content: PalaceGenerationContentDefinition }
  | {
      readonly ok: false;
      readonly errors: readonly { readonly field: string; readonly reason: string }[];
    };

/** Adapts an approved, schema-valid M3 manifest into the narrow generator input. */
export function validatePalaceGenerationContent(
  manifest: PalaceContentManifest,
): PalaceGenerationContentResult {
  const validation = validatePalaceContentManifest(manifest);
  if (!validation.valid) return { ok: false, errors: validation.errors };

  const entrances = manifest.entries.filter(
    (entry) =>
      entry.tags.includes('entrance') &&
      entry.review.approvalState === 'selected' &&
      entry.review.publicReleaseEligible,
  );
  if (entrances.length !== 1) {
    return {
      ok: false,
      errors: [
        {
          field: 'entries',
          reason: 'exactly one selected, release-eligible Palace entrance is required',
        },
      ],
    };
  }
  const entrance = entrances[0]!;
  const connections = entrance.structuredDefinition['connections'];
  if (!isEntranceConnections(connections)) {
    return {
      ok: false,
      errors: [
        {
          field: `${entrance.id}.structuredDefinition.connections`,
          reason: 'entrance connections must have unique stable definitions and valid states',
        },
      ],
    };
  }

  return {
    ok: true,
    content: {
      packageId: 'palace',
      contentVersion: manifest.contentVersion,
      rulesVersion: manifest.rulesVersion,
      entranceDefinitionId: entrance.id,
      entranceConnections: connections,
      validationEvidence: [
        `manifest:${manifest.packageId}@${manifest.contentVersion}`,
        `entry:${entrance.id}@${entrance.version}`,
      ],
    },
  };
}

function isEntranceConnections(
  value: unknown,
): value is PalaceGenerationContentDefinition['entranceConnections'] {
  if (!Array.isArray(value) || value.length < 1) return false;
  const definitions = value.map((candidate) =>
    typeof candidate === 'object' && candidate !== null
      ? Reflect.get(candidate, 'definitionId')
      : undefined,
  );
  return (
    definitions.every(
      (definition) => typeof definition === 'string' && definition.startsWith('palace.'),
    ) &&
    new Set(definitions).size === definitions.length &&
    value.every(
      (candidate) =>
        typeof Reflect.get(candidate, 'directionLabel') === 'string' &&
        Reflect.get(candidate, 'connectionState') === 'unresolved' &&
        Reflect.get(candidate, 'doorState') === 'unknown' &&
        Reflect.get(candidate, 'alertState') === 'quiet',
    )
  );
}
