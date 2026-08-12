import { validatePalaceContentManifest, type PalaceContentManifest } from './palace-manifest.ts';

export interface PalaceGenerationContentDefinition {
  readonly packageId: 'palace';
  readonly contentVersion: string;
  readonly rulesVersion: string;
  readonly entranceDefinitionId: `palace.${string}`;
  readonly entranceConnectionCount: number;
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
  const connectionCount = entrance?.structuredDefinition['connectionCount'];
  if (!Number.isSafeInteger(connectionCount) || (connectionCount as number) < 1) {
    return {
      ok: false,
      errors: [
        {
          field: `${entrance?.id ?? 'entrance'}.structuredDefinition.connectionCount`,
          reason: 'entrance connectionCount must be a positive safe integer',
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
      entranceConnectionCount: connectionCount as number,
      validationEvidence: [
        `manifest:${manifest.packageId}@${manifest.contentVersion}`,
        `entry:${entrance.id}@${entrance.version}`,
      ],
    },
  };
}
