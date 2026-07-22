import {
  pcg32AlgorithmId,
  pcg32AlgorithmVersion,
  randomStreamDerivationId,
  randomStreamDerivationVersion,
} from '@notequest/domain';
import type { PalaceContentId } from '@notequest/content';

export const seedManifestSchemaVersion = 'notequest-seed-manifest.schema.v0.1' as const;
export const seedManifestHashInputKind = 'notequest-seed-manifest-hash-input.v0.1' as const;
export const palaceManifestEntryIntegrityPayloadKind =
  'palace-manifest-entry-integrity-payload.v0.1' as const;
export const supportedSimulationRunPurposes = ['qa-smoke', 'qa-regression', 'participant'] as const;
export const supportedSimulationDungeonTypes = ['palace'] as const;
export const supportedSeedManifestPartitionStrategies = ['contiguous-index-range'] as const;

export type SimulationRunPurpose = (typeof supportedSimulationRunPurposes)[number];
export type SimulationDungeonType = (typeof supportedSimulationDungeonTypes)[number];
export type SeedManifestPartitionStrategy =
  (typeof supportedSeedManifestPartitionStrategies)[number];

export interface SeedManifestContentEntryEvidence {
  readonly contentId: PalaceContentId;
  readonly algorithm: 'SHA-256';
  readonly canonicalization: 'RFC-8785';
  readonly hashInputKind: typeof palaceManifestEntryIntegrityPayloadKind;
  readonly checksum: `sha256:${string}`;
}

export interface SeedManifestContentManifestEvidence {
  readonly schemaVersion: 'palace-content-manifest.schema.v0.1';
  readonly packageId: 'palace';
  readonly contentVersion: `${number}.${number}.${number}`;
  readonly rulesVersion: string;
  readonly entries: readonly SeedManifestContentEntryEvidence[];
}

export interface SeedManifestVersions {
  readonly rulesVersion: string;
  readonly contentManifest: SeedManifestContentManifestEvidence;
  readonly rng: {
    readonly algorithmId: typeof pcg32AlgorithmId;
    readonly algorithmVersion: typeof pcg32AlgorithmVersion;
    readonly streamDerivationId: typeof randomStreamDerivationId;
    readonly streamDerivationVersion: typeof randomStreamDerivationVersion;
  };
}

export type SeedManifestSeedSet =
  | { readonly mode: 'explicit'; readonly seeds: readonly `0x${string}`[] }
  | { readonly mode: 'range'; readonly start: `0x${string}`; readonly count: number };

export interface SeedManifestPartitioning {
  readonly strategy: SeedManifestPartitionStrategy;
  readonly partitionCount: number;
  readonly partitionIndex: number;
  readonly aggregateInvariant: 'sort-by-seed-before-reduction';
}

export interface SeedManifestPartitionSlice {
  readonly startInclusive: number;
  readonly endExclusive: number;
}

export interface SeedManifest {
  readonly schemaVersion: typeof seedManifestSchemaVersion;
  readonly manifestId: string;
  readonly manifestVersion: string;
  readonly runPurpose: SimulationRunPurpose;
  readonly dungeonType: SimulationDungeonType;
  readonly seedSet: SeedManifestSeedSet;
  readonly versions: SeedManifestVersions;
  readonly partitioning: SeedManifestPartitioning;
  readonly privacy: {
    readonly containsRealUserData: false;
    readonly fixtureDataClassification: 'synthetic-public-safe';
  };
  readonly notes?: string;
}

export interface SeedManifestValidationError {
  readonly field: string;
  readonly reason: string;
}

export interface SeedManifestValidationResult {
  readonly valid: boolean;
  readonly errors: readonly SeedManifestValidationError[];
}

const HEX_UINT64_PATTERN = /^0x[a-f0-9]{16}$/;
const SHA256_CHECKSUM_PATTERN = /^sha256:[a-f0-9]{64}$/;

export function validateSeedManifest(input: unknown): SeedManifestValidationResult {
  const errors: SeedManifestValidationError[] = [];
  const add = (field: string, reason: string): void => {
    errors.push({ field, reason });
  };

  if (!isRecord(input)) {
    add('manifest', 'seed manifest must be a JSON object');
    return { valid: false, errors };
  }

  if (input['schemaVersion'] !== seedManifestSchemaVersion)
    add('schemaVersion', 'unsupported seed manifest schema version');
  if (!isStringMatching(input['manifestId'], /^[a-z0-9][a-z0-9.-]{2,79}$/))
    add('manifestId', 'manifest identity must be 3-80 lowercase letters, digits, dots, or hyphens');
  if (!isSemanticVersion(input['manifestVersion']))
    add('manifestVersion', 'manifest version must be semantic version x.y.z');
  if (!isSupportedValue(input['runPurpose'], supportedSimulationRunPurposes))
    add('runPurpose', 'unsupported simulation run purpose');
  if (!isSupportedValue(input['dungeonType'], supportedSimulationDungeonTypes))
    add('dungeonType', 'unsupported dungeon type');

  validateSeedSet(input['seedSet'], add);
  validateVersions(input['versions'], add);
  validatePartitioning(input['partitioning'], add);
  validatePrivacy(input['privacy'], add);

  return { valid: errors.length === 0, errors };
}

export function getContiguousIndexPartitionSlice(
  totalCount: number,
  partitionCount: number,
  partitionIndex: number,
): SeedManifestPartitionSlice {
  if (!Number.isSafeInteger(totalCount) || totalCount < 0) {
    throw new RangeError('totalCount must be a non-negative safe integer');
  }

  if (!Number.isSafeInteger(partitionCount) || partitionCount < 1) {
    throw new RangeError('partitionCount must be a positive safe integer');
  }

  if (
    !Number.isSafeInteger(partitionIndex) ||
    partitionIndex < 0 ||
    partitionIndex >= partitionCount
  ) {
    throw new RangeError('partitionIndex must be an integer within partitionCount');
  }

  const baseSize = Math.floor(totalCount / partitionCount);
  const remainder = totalCount % partitionCount;
  const startInclusive = partitionIndex * baseSize + Math.min(partitionIndex, remainder);
  const endExclusive = startInclusive + baseSize + (partitionIndex < remainder ? 1 : 0);

  return { startInclusive, endExclusive };
}

export function makeSeedManifestHashPayload(manifest: SeedManifest): Record<string, unknown> {
  return { hashInputKind: seedManifestHashInputKind, manifest };
}

function validateSeedSet(seedSet: unknown, add: (field: string, reason: string) => void): void {
  if (!isRecord(seedSet)) {
    add('seedSet', 'seedSet is required and must be an object');
    add('seedSet.mode', 'seed set mode must be explicit or range');
    return;
  }

  if (seedSet['mode'] === 'explicit') {
    const seeds = seedSet['seeds'];
    if (!Array.isArray(seeds)) {
      add('seedSet.seeds', 'explicit seed sets must include a seeds array');
      return;
    }

    if (seeds.length === 0)
      add('seedSet.seeds', 'explicit seed sets must include at least one seed');
    for (const [index, seed] of seeds.entries())
      if (!isStringMatching(seed, HEX_UINT64_PATTERN))
        add(
          `seedSet.seeds[${index}]`,
          'seed must be a 64-bit lowercase hex string such as 0x0000000000000001',
        );
    if (new Set(seeds).size !== seeds.length)
      add('seedSet.seeds', 'explicit seed sets must not contain duplicate seeds');
    return;
  }

  if (seedSet['mode'] === 'range') {
    const count = seedSet['count'];
    if (!isStringMatching(seedSet['start'], HEX_UINT64_PATTERN))
      add('seedSet.start', 'range start must be a 64-bit lowercase hex string');
    if (typeof count !== 'number' || !Number.isSafeInteger(count) || count < 1)
      add('seedSet.count', 'range count must be a positive safe integer');
    return;
  }

  add('seedSet.mode', 'seed set mode must be explicit or range');
}

function validateVersions(versions: unknown, add: (field: string, reason: string) => void): void {
  if (!isRecord(versions)) {
    add('versions', 'versions is required and must be an object');
    add('versions.rng', 'versions.rng is required and must be an object');
    add('versions.contentManifest', 'versions.contentManifest is required and must be an object');
    return;
  }

  if (!isNonEmptyString(versions['rulesVersion']))
    add('versions.rulesVersion', 'rules version is required');
  validateContentManifestEvidence(versions['contentManifest'], versions['rulesVersion'], add);
  validateRngVersions(versions['rng'], add);
}

function validateContentManifestEvidence(
  contentManifest: unknown,
  seedRulesVersion: unknown,
  add: (field: string, reason: string) => void,
): void {
  if (!isRecord(contentManifest)) {
    add('versions.contentManifest', 'versions.contentManifest is required and must be an object');
    return;
  }

  if (contentManifest['schemaVersion'] !== 'palace-content-manifest.schema.v0.1')
    add(
      'versions.contentManifest.schemaVersion',
      'unsupported Palace content manifest schema version',
    );
  if (contentManifest['packageId'] !== 'palace')
    add(
      'versions.contentManifest.packageId',
      'Palace seed manifests must reference the palace content package',
    );
  if (!isSemanticVersion(contentManifest['contentVersion']))
    add(
      'versions.contentManifest.contentVersion',
      'content manifest version must be semantic version x.y.z',
    );
  if (!isNonEmptyString(contentManifest['rulesVersion']))
    add('versions.contentManifest.rulesVersion', 'content manifest rules version is required');
  if (
    isNonEmptyString(seedRulesVersion) &&
    isNonEmptyString(contentManifest['rulesVersion']) &&
    contentManifest['rulesVersion'] !== seedRulesVersion
  )
    add(
      'versions.contentManifest.rulesVersion',
      'content manifest rules version must match versions.rulesVersion',
    );

  const entries = contentManifest['entries'];
  if (!Array.isArray(entries)) {
    add(
      'versions.contentManifest.entries',
      'content manifest entry hash evidence array is required',
    );
    return;
  }

  if (entries.length === 0)
    add(
      'versions.contentManifest.entries',
      'content manifest entry hash evidence must not be empty',
    );

  const seen = new Set<string>();
  for (const [index, entry] of entries.entries()) {
    const prefix = `versions.contentManifest.entries[${index}]`;
    if (!isRecord(entry)) {
      add(prefix, 'content manifest entry hash evidence must be an object');
      continue;
    }

    const contentId = entry['contentId'];
    if (!isStringMatching(contentId, /^palace\.[a-z0-9.-]+$/)) {
      add(`${prefix}.contentId`, 'contentId must be a Palace content ID');
    } else if (seen.has(contentId)) {
      add(
        'versions.contentManifest.entries',
        'content manifest entry hash evidence must not contain duplicate contentId values',
      );
    } else {
      seen.add(contentId);
    }

    if (entry['algorithm'] !== 'SHA-256')
      add(`${prefix}.algorithm`, 'content hash algorithm must be SHA-256');
    if (entry['canonicalization'] !== 'RFC-8785')
      add(`${prefix}.canonicalization`, 'content hash canonicalization must be RFC-8785');
    if (entry['hashInputKind'] !== palaceManifestEntryIntegrityPayloadKind)
      add(
        `${prefix}.hashInputKind`,
        'content hash input kind must be palace-manifest-entry-integrity-payload.v0.1',
      );
    if (!isStringMatching(entry['checksum'], SHA256_CHECKSUM_PATTERN))
      add(`${prefix}.checksum`, 'content checksum must be sha256:<64 lowercase hex>');
  }
}

function validateRngVersions(rng: unknown, add: (field: string, reason: string) => void): void {
  if (!isRecord(rng)) {
    add('versions.rng', 'versions.rng is required and must be an object');
    return;
  }

  if (rng['algorithmId'] !== pcg32AlgorithmId)
    add('versions.rng.algorithmId', 'unsupported RNG algorithm');
  if (rng['algorithmVersion'] !== pcg32AlgorithmVersion)
    add('versions.rng.algorithmVersion', 'unsupported RNG algorithm version');
  if (rng['streamDerivationId'] !== randomStreamDerivationId)
    add('versions.rng.streamDerivationId', 'unsupported stream derivation');
  if (rng['streamDerivationVersion'] !== randomStreamDerivationVersion)
    add('versions.rng.streamDerivationVersion', 'unsupported stream derivation version');
}

function validatePartitioning(
  partitioning: unknown,
  add: (field: string, reason: string) => void,
): void {
  if (!isRecord(partitioning)) {
    add('partitioning', 'partitioning is required and must be an object');
    return;
  }

  const partitionCount = partitioning['partitionCount'];
  const partitionIndex = partitioning['partitionIndex'];
  if (!isSupportedValue(partitioning['strategy'], supportedSeedManifestPartitionStrategies))
    add('partitioning.strategy', 'unsupported partitioning strategy');
  if (
    typeof partitionCount !== 'number' ||
    !Number.isSafeInteger(partitionCount) ||
    partitionCount < 1
  )
    add('partitioning.partitionCount', 'partition count must be a positive safe integer');
  if (
    typeof partitionIndex !== 'number' ||
    !Number.isSafeInteger(partitionIndex) ||
    partitionIndex < 0 ||
    (typeof partitionCount === 'number' &&
      Number.isSafeInteger(partitionCount) &&
      partitionIndex >= partitionCount)
  )
    add('partitioning.partitionIndex', 'partition index must be an integer within partition count');
  if (partitioning['aggregateInvariant'] !== 'sort-by-seed-before-reduction')
    add(
      'partitioning.aggregateInvariant',
      'aggregate invariant must keep worker-count-independent report reductions',
    );
}

function validatePrivacy(privacy: unknown, add: (field: string, reason: string) => void): void {
  if (!isRecord(privacy)) {
    add('privacy', 'privacy is required and must be an object');
    return;
  }

  if (privacy['containsRealUserData'] !== false)
    add('privacy.containsRealUserData', 'seed manifests must not contain real user data');
  if (privacy['fixtureDataClassification'] !== 'synthetic-public-safe')
    add(
      'privacy.fixtureDataClassification',
      'seed manifest fixtures must be synthetic and public-safe',
    );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStringMatching(value: unknown, pattern: RegExp): value is string {
  return typeof value === 'string' && pattern.test(value);
}

function isSemanticVersion(value: unknown): value is `${number}.${number}.${number}` {
  return isStringMatching(value, /^\d+\.\d+\.\d+$/);
}

function isSupportedValue<const Values extends readonly string[]>(
  value: unknown,
  supportedValues: Values,
): value is Values[number] {
  return typeof value === 'string' && supportedValues.includes(value);
}
