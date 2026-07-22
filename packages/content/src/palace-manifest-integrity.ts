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

export interface PalaceCanonicalJsonSerializer {
  serializeCanonicalJson(value: unknown): string;
}

export type PalaceManifestHashResult =
  | {
      readonly ok: true;
      readonly algorithm: 'SHA-256';
      readonly checksum: string;
    }
  | {
      readonly ok: false;
      readonly error: { readonly message: string };
    };

export interface PalaceSha256Hasher {
  hashCanonicalUtf8(canonicalValue: string): Promise<PalaceManifestHashResult>;
}

export interface PalaceManifestIntegrityAdapters {
  readonly canonicalJson: PalaceCanonicalJsonSerializer;
  readonly sha256: PalaceSha256Hasher;
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
  adapters: PalaceManifestIntegrityAdapters,
): Promise<PalaceManifestHashEvidence> {
  const canonicalJson = adapters.canonicalJson.serializeCanonicalJson(
    createPalaceManifestEntryIntegrityPayload(entry),
  );
  const hashResult = await adapters.sha256.hashCanonicalUtf8(canonicalJson);

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
  adapters: PalaceManifestIntegrityAdapters,
): Promise<PalaceManifestIntegrityResult> {
  const evidence: PalaceManifestHashEvidence[] = [];
  const errors: PalaceManifestValidationError[] = [];

  for (const entry of manifest.entries) {
    const expected = entry.provenance.contentHash;
    const requiresRecordedHash =
      entry.review.approvalState === 'selected' && entry.review.publicReleaseEligible;

    if (expected.status !== 'recorded') {
      if (requiresRecordedHash) {
        errors.push({
          contentId: entry.id,
          field: 'provenance.contentHash.status',
          reason:
            'selected public-release Palace content must record canonical JSON SHA-256 integrity evidence',
        });
      }
      continue;
    }

    const actual = await hashPalaceManifestEntry(entry, adapters);
    evidence.push(actual);

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
