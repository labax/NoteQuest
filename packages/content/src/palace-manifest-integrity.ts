import { type Sha256Hasher, serializeCanonicalJson, sha256Hasher } from '@notequest/infrastructure';

import type {
  PalaceContentId,
  PalaceContentManifest,
  PalaceManifestEntry,
  PalaceManifestValidationError,
} from './palace-manifest.ts';

export interface PalaceManifestHashEvidence {
  readonly contentId: PalaceContentId;
  readonly algorithm: 'SHA-256';
  readonly canonicalization: 'RFC-8785';
  readonly hashInputKind: 'palace-manifest-entry-integrity-payload.v0.1';
  readonly canonicalJson: string;
  readonly checksum: `sha256:${string}`;
}

export interface PalaceManifestIntegrityResult {
  readonly valid: boolean;
  readonly evidence: readonly PalaceManifestHashEvidence[];
  readonly errors: readonly PalaceManifestValidationError[];
}

export function createPalaceManifestEntryIntegrityPayload(entry: PalaceManifestEntry) {
  return {
    contentType: entry.contentType,
    id: entry.id,
    kind: entry.kind,
    label: entry.label,
    parentId: entry.parentId ?? null,
    range: entry.range ?? null,
    references: entry.references ?? [],
    structuredDefinition: entry.structuredDefinition,
    tags: entry.tags,
    version: entry.version,
  } as const;
}

export async function hashPalaceManifestEntry(
  entry: PalaceManifestEntry,
  hasher: Sha256Hasher = sha256Hasher,
): Promise<PalaceManifestHashEvidence> {
  const canonicalJson = serializeCanonicalJson(createPalaceManifestEntryIntegrityPayload(entry));
  const hashResult = await hasher.hashCanonicalUtf8(canonicalJson);

  if (!hashResult.ok) {
    throw new Error(hashResult.error.message);
  }

  return {
    contentId: entry.id,
    algorithm: hashResult.algorithm,
    canonicalization: 'RFC-8785',
    hashInputKind: 'palace-manifest-entry-integrity-payload.v0.1',
    canonicalJson,
    checksum: hashResult.checksum as `sha256:${string}`,
  };
}

export async function validatePalaceManifestIntegrity(
  manifest: PalaceContentManifest,
  hasher: Sha256Hasher = sha256Hasher,
): Promise<PalaceManifestIntegrityResult> {
  const evidence: PalaceManifestHashEvidence[] = [];
  const errors: PalaceManifestValidationError[] = [];

  for (const entry of manifest.entries) {
    if (entry.provenance.contentHash.status !== 'recorded') {
      continue;
    }

    const actual = await hashPalaceManifestEntry(entry, hasher);
    evidence.push(actual);

    const expected = entry.provenance.contentHash;
    if (expected.algorithm !== 'SHA-256' || expected.canonicalization !== 'RFC-8785') {
      errors.push({
        contentId: entry.id,
        field: 'provenance.contentHash',
        reason: 'recorded Palace manifest hashes must use canonical JSON UTF-8 bytes and SHA-256',
      });
      continue;
    }

    if (expected.value !== actual.checksum) {
      errors.push({
        contentId: entry.id,
        field: 'provenance.contentHash.value',
        reason: `recorded manifest hash ${expected.value ?? 'null'} does not match computed ${actual.checksum}`,
      });
    }
  }

  return { valid: errors.length === 0, evidence, errors };
}
