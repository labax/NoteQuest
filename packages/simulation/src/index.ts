import {
  pcg32AlgorithmId,
  pcg32AlgorithmVersion,
  randomStreamDerivationId,
  randomStreamDerivationVersion,
} from '@notequest/domain';

export const seedManifestSchemaVersion = 'notequest-seed-manifest.schema.v0.1' as const;
export const seedManifestHashInputKind = 'notequest-seed-manifest-hash-input.v0.1' as const;
export const supportedSimulationRunPurposes = ['qa-smoke', 'qa-regression', 'participant'] as const;
export const supportedSimulationDungeonTypes = ['palace'] as const;
export const supportedSeedManifestPartitionStrategies = ['contiguous-index-range'] as const;

export type SimulationRunPurpose = (typeof supportedSimulationRunPurposes)[number];
export type SimulationDungeonType = (typeof supportedSimulationDungeonTypes)[number];
export type SeedManifestPartitionStrategy =
  (typeof supportedSeedManifestPartitionStrategies)[number];

export interface SeedManifestVersions {
  readonly rulesVersion: string;
  readonly contentPackageId: string;
  readonly contentVersion: string;
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

export function validateSeedManifest(manifest: SeedManifest): SeedManifestValidationResult {
  const errors: SeedManifestValidationError[] = [];
  const add = (field: string, reason: string): void => {
    errors.push({ field, reason });
  };

  if (manifest.schemaVersion !== seedManifestSchemaVersion)
    add('schemaVersion', 'unsupported seed manifest schema version');
  if (!/^[a-z0-9][a-z0-9.-]{2,79}$/.test(manifest.manifestId))
    add('manifestId', 'manifest identity must be 3-80 lowercase letters, digits, dots, or hyphens');
  if (!/^\d+\.\d+\.\d+$/.test(manifest.manifestVersion))
    add('manifestVersion', 'manifest version must be semantic version x.y.z');
  if (!supportedSimulationRunPurposes.includes(manifest.runPurpose))
    add('runPurpose', 'unsupported simulation run purpose');
  if (!supportedSimulationDungeonTypes.includes(manifest.dungeonType))
    add('dungeonType', 'unsupported dungeon type');

  validateSeedSet(manifest.seedSet, add);

  if (manifest.versions.rulesVersion.trim().length === 0)
    add('versions.rulesVersion', 'rules version is required');
  if (manifest.versions.contentPackageId !== 'palace')
    add(
      'versions.contentPackageId',
      'Palace seed manifests must reference the palace content package',
    );
  if (!/^\d+\.\d+\.\d+$/.test(manifest.versions.contentVersion))
    add('versions.contentVersion', 'content version must be semantic version x.y.z');
  if (manifest.versions.rng.algorithmId !== pcg32AlgorithmId)
    add('versions.rng.algorithmId', 'unsupported RNG algorithm');
  if (manifest.versions.rng.algorithmVersion !== pcg32AlgorithmVersion)
    add('versions.rng.algorithmVersion', 'unsupported RNG algorithm version');
  if (manifest.versions.rng.streamDerivationId !== randomStreamDerivationId)
    add('versions.rng.streamDerivationId', 'unsupported stream derivation');
  if (manifest.versions.rng.streamDerivationVersion !== randomStreamDerivationVersion)
    add('versions.rng.streamDerivationVersion', 'unsupported stream derivation version');

  if (!supportedSeedManifestPartitionStrategies.includes(manifest.partitioning.strategy))
    add('partitioning.strategy', 'unsupported partitioning strategy');
  if (
    !Number.isSafeInteger(manifest.partitioning.partitionCount) ||
    manifest.partitioning.partitionCount < 1
  )
    add('partitioning.partitionCount', 'partition count must be a positive safe integer');
  if (
    !Number.isSafeInteger(manifest.partitioning.partitionIndex) ||
    manifest.partitioning.partitionIndex < 0 ||
    manifest.partitioning.partitionIndex >= manifest.partitioning.partitionCount
  )
    add('partitioning.partitionIndex', 'partition index must be an integer within partition count');
  if (manifest.partitioning.aggregateInvariant !== 'sort-by-seed-before-reduction')
    add(
      'partitioning.aggregateInvariant',
      'aggregate invariant must keep worker-count-independent report reductions',
    );

  if (manifest.privacy.containsRealUserData !== false)
    add('privacy.containsRealUserData', 'seed manifests must not contain real user data');
  if (manifest.privacy.fixtureDataClassification !== 'synthetic-public-safe')
    add(
      'privacy.fixtureDataClassification',
      'seed manifest fixtures must be synthetic and public-safe',
    );

  return { valid: errors.length === 0, errors };
}

export function makeSeedManifestHashPayload(manifest: SeedManifest): Record<string, unknown> {
  return { hashInputKind: seedManifestHashInputKind, manifest };
}

function validateSeedSet(
  seedSet: SeedManifestSeedSet,
  add: (field: string, reason: string) => void,
): void {
  if (seedSet.mode === 'explicit') {
    if (seedSet.seeds.length === 0)
      add('seedSet.seeds', 'explicit seed sets must include at least one seed');
    for (const [index, seed] of seedSet.seeds.entries())
      if (!HEX_UINT64_PATTERN.test(seed))
        add(
          `seedSet.seeds[${index}]`,
          'seed must be a 64-bit lowercase hex string such as 0x0000000000000001',
        );
    if (new Set(seedSet.seeds).size !== seedSet.seeds.length)
      add('seedSet.seeds', 'explicit seed sets must not contain duplicate seeds');
    return;
  }

  if (seedSet.mode === 'range') {
    if (!HEX_UINT64_PATTERN.test(seedSet.start))
      add('seedSet.start', 'range start must be a 64-bit lowercase hex string');
    if (!Number.isSafeInteger(seedSet.count) || seedSet.count < 1)
      add('seedSet.count', 'range count must be a positive safe integer');
    return;
  }

  add('seedSet.mode', 'seed set mode must be explicit or range');
}
