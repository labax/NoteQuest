#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { applicationLayerName } from '@notequest/application';
import { bundledContentStatus, palaceManifestExpectedHashFixtures } from '@notequest/content';
import {
  createNamedRandomStream,
  pcg32AlgorithmId,
  pcg32AlgorithmVersion,
  randomStreamDerivationId,
  randomStreamDerivationVersion,
  randomStreamPurposeRegistry,
} from '@notequest/domain';
import {
  getContiguousIndexPartitionSlice,
  supportedSimulationDungeonTypes,
  type SeedManifest,
  validateSeedManifest,
} from './index.ts';

const usageText = `NoteQuest simulation CLI

Usage:
  npm run simulation:cli -- --dungeon palace --runs 3 --seed-manifest tests/fixtures/simulation/palace-seed-manifest-small.json --rules-version digital-rules-specification-v0.1 --content-version 0.1.0 --rng-version 1 --output .tmp/simulation-smoke.json
  npm run simulation:cli -- --seed-manifest tests/fixtures/simulation/palace-seed-manifest-small.json --dry-run

Options:
  --dungeon <type>          Dungeon type to simulate. Supported: palace.
  --runs <count>           Number of manifest seeds to execute for the smoke path.
  --seed-manifest <path>   JSON seed/content manifest to validate and execute.
  --rules-version <value>  Expected rules version in the seed manifest.
  --content-version <semver> Expected content manifest version in the seed manifest.
  --rng-version <value>    Expected production RNG algorithm version.
  --workers <count>        Worker count metadata for future partitioned execution; current shell runs serially.
  --output <path>          JSON report output path. Omit to write the report to stdout.
  --dry-run                Validate arguments and seed/content manifests without executing seed smoke draws.
  --help                   Show this help text.
`;

export interface SimulationCliResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

interface CliOptions {
  readonly dungeon?: string;
  readonly runs?: number;
  readonly seedManifestPath?: string;
  readonly rulesVersion?: string;
  readonly contentVersion?: string;
  readonly rngVersion?: string;
  readonly workers: number;
  readonly outputPath?: string;
  readonly dryRun: boolean;
  readonly help: boolean;
}

interface SmokeSeedResult {
  readonly seed: string;
  readonly dungeonGenerationDraw: number;
  readonly combatDraw: number;
  readonly expeditionRepopulationDraw: number;
}

export async function runSimulationCli(argv: readonly string[]): Promise<SimulationCliResult> {
  const parsed = parseCliOptions(argv);
  if (!parsed.ok) return failure(parsed.errors);

  const options = parsed.options;
  if (options.help) return { exitCode: 0, stdout: usageText, stderr: '' };

  const argumentErrors = validateCliOptions(options);
  if (argumentErrors.length > 0) return failure(argumentErrors);

  const manifestRead = readJsonFile(options.seedManifestPath ?? '');
  if (!manifestRead.ok) return failure([manifestRead.error]);

  const manifestValidation = validateSeedManifest(manifestRead.value);
  if (!manifestValidation.valid) {
    return failure(manifestValidation.errors.map((error) => `${error.field}: ${error.reason}`));
  }

  const manifest = manifestRead.value as SeedManifest;
  const invariantErrors = validateManifestInvariants(manifest, options);
  if (invariantErrors.length > 0) return failure(invariantErrors);

  const seeds = expandManifestSeeds(manifest).slice(0, options.runs);
  const report = {
    reportKind: 'notequest-simulation-cli-smoke.v0.1',
    status: options.dryRun ? 'validated' : 'placeholder-smoke-complete',
    boundary:
      'Palace generation is not implemented in this milestone; this CLI validates manifests and exercises production RNG streams only.',
    applicationLayer: applicationLayerName,
    contentStatus: bundledContentStatus,
    dungeonType: manifest.dungeonType,
    manifestId: manifest.manifestId,
    manifestVersion: manifest.manifestVersion,
    requestedRuns: options.runs,
    executedRuns: options.dryRun ? 0 : seeds.length,
    workers: options.workers,
    dryRun: options.dryRun,
    versions: manifest.versions,
    results: options.dryRun ? [] : seeds.map(runSmokeSeed),
  };

  const stdout = JSON.stringify(report, null, 2) + '\n';
  if (options.outputPath !== undefined) {
    mkdirSync(dirname(options.outputPath), { recursive: true });
    writeFileSync(options.outputPath, stdout, 'utf8');
    return {
      exitCode: 0,
      stdout: `Wrote simulation report to ${options.outputPath}\n`,
      stderr: '',
    };
  }

  return { exitCode: 0, stdout, stderr: '' };
}

function parseCliOptions(
  argv: readonly string[],
):
  | { readonly ok: true; readonly options: CliOptions }
  | { readonly ok: false; readonly errors: readonly string[] } {
  const mutable: {
    dungeon?: string;
    runs?: number;
    seedManifestPath?: string;
    rulesVersion?: string;
    contentVersion?: string;
    rngVersion?: string;
    workers: number;
    outputPath?: string;
    dryRun: boolean;
    help: boolean;
  } = {
    workers: 1,
    dryRun: false,
    help: false,
  };
  const errors: string[] = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];
    switch (arg) {
      case '--help':
      case '-h':
        mutable.help = true;
        break;
      case '--dry-run':
        mutable.dryRun = true;
        break;
      case '--dungeon':
        assignStringOption(mutable, 'dungeon', readOptionValue(arg, value, errors));
        index += 1;
        break;
      case '--runs':
        assignNumberOption(mutable, 'runs', readPositiveInteger(arg, value, errors));
        index += 1;
        break;
      case '--seed-manifest':
        assignStringOption(mutable, 'seedManifestPath', readOptionValue(arg, value, errors));
        index += 1;
        break;
      case '--rules-version':
        assignStringOption(mutable, 'rulesVersion', readOptionValue(arg, value, errors));
        index += 1;
        break;
      case '--content-version':
        assignStringOption(mutable, 'contentVersion', readOptionValue(arg, value, errors));
        index += 1;
        break;
      case '--rng-version':
        assignStringOption(mutable, 'rngVersion', readOptionValue(arg, value, errors));
        index += 1;
        break;
      case '--workers':
        mutable.workers = readPositiveInteger(arg, value, errors) ?? mutable.workers;
        index += 1;
        break;
      case '--output':
        assignStringOption(mutable, 'outputPath', readOptionValue(arg, value, errors));
        index += 1;
        break;
      default:
        errors.push(`unknown argument: ${arg ?? '<empty>'}`);
    }
  }

  return errors.length > 0 ? { ok: false, errors } : { ok: true, options: mutable };
}

function assignStringOption(
  target: { [key: string]: string | number | boolean | undefined },
  key: string,
  value: string | undefined,
): void {
  if (value !== undefined) target[key] = value;
}

function assignNumberOption(
  target: { [key: string]: string | number | boolean | undefined },
  key: string,
  value: number | undefined,
): void {
  if (value !== undefined) target[key] = value;
}

function validateCliOptions(options: CliOptions): readonly string[] {
  const errors: string[] = [];
  if (options.seedManifestPath === undefined) errors.push('--seed-manifest is required');
  if (options.dungeon === undefined) errors.push('--dungeon is required unless --help is used');
  if (options.runs === undefined && !options.dryRun)
    errors.push('--runs is required unless --dry-run is used');
  if (options.rulesVersion === undefined) errors.push('--rules-version is required');
  if (options.contentVersion === undefined) errors.push('--content-version is required');
  if (options.rngVersion === undefined) errors.push('--rng-version is required');
  if (
    options.dungeon !== undefined &&
    !supportedSimulationDungeonTypes.includes(
      options.dungeon as (typeof supportedSimulationDungeonTypes)[number],
    )
  )
    errors.push(`unsupported dungeon type: ${options.dungeon}`);
  return errors;
}

function validateManifestInvariants(
  manifest: SeedManifest,
  options: CliOptions,
): readonly string[] {
  const errors: string[] = [];
  if (manifest.dungeonType !== options.dungeon)
    errors.push(
      `manifest dungeonType ${manifest.dungeonType} does not match --dungeon ${options.dungeon}`,
    );
  if (manifest.versions.rulesVersion !== options.rulesVersion)
    errors.push('manifest rules version does not match --rules-version');
  if (manifest.versions.contentManifest.contentVersion !== options.contentVersion)
    errors.push('manifest content version does not match --content-version');
  if (manifest.versions.rng.algorithmVersion !== options.rngVersion)
    errors.push('manifest RNG algorithm version does not match --rng-version');
  if (manifest.versions.rng.algorithmId !== pcg32AlgorithmId)
    errors.push('unsupported production RNG');
  if (manifest.versions.rng.algorithmVersion !== pcg32AlgorithmVersion)
    errors.push('unsupported production RNG version');
  if (manifest.versions.rng.streamDerivationId !== randomStreamDerivationId)
    errors.push('unsupported production RNG stream derivation');
  if (manifest.versions.rng.streamDerivationVersion !== randomStreamDerivationVersion)
    errors.push('unsupported production RNG stream derivation version');

  const expectedChecksums = new Map(
    palaceManifestExpectedHashFixtures.map((entry): [string, string] => [
      entry.contentId,
      entry.checksum,
    ]),
  );
  for (const entry of manifest.versions.contentManifest.entries) {
    if (expectedChecksums.get(entry.contentId) !== entry.checksum) {
      errors.push(`content manifest checksum mismatch for ${entry.contentId}`);
    }
  }

  const seedCount = expandManifestSeeds(manifest).length;
  const slice = getContiguousIndexPartitionSlice(
    seedCount,
    manifest.partitioning.partitionCount,
    manifest.partitioning.partitionIndex,
  );
  if ((options.runs ?? 0) > slice.endExclusive - slice.startInclusive)
    errors.push('--runs cannot exceed the selected manifest partition seed count');
  return errors;
}

function expandManifestSeeds(manifest: SeedManifest): readonly string[] {
  const allSeeds = expandSeedSet(manifest);
  const slice = getContiguousIndexPartitionSlice(
    allSeeds.length,
    manifest.partitioning.partitionCount,
    manifest.partitioning.partitionIndex,
  );
  return allSeeds.slice(slice.startInclusive, slice.endExclusive);
}

function expandSeedSet(manifest: SeedManifest): readonly string[] {
  const seedSet = manifest.seedSet;
  if (seedSet.mode === 'explicit') return seedSet.seeds;

  return Array.from({ length: seedSet.count }, (_, index) =>
    formatSeed(BigInt(seedSet.start) + BigInt(index)),
  );
}

function runSmokeSeed(seed: string): SmokeSeedResult {
  const dungeon = createNamedRandomStream(seed, randomStreamPurposeRegistry.dungeonGeneration.name);
  const combat = createNamedRandomStream(seed, randomStreamPurposeRegistry.combat.name);
  const repopulation = createNamedRandomStream(
    seed,
    randomStreamPurposeRegistry.expeditionRepopulation.name,
  );
  return {
    seed,
    dungeonGenerationDraw: dungeon.rng.nextBounded(6).value + 1,
    combatDraw: combat.rng.nextBounded(6).value + 1,
    expeditionRepopulationDraw: repopulation.rng.nextBounded(6).value + 1,
  };
}

function readJsonFile(
  path: string,
): { readonly ok: true; readonly value: unknown } | { readonly ok: false; readonly error: string } {
  try {
    return { ok: true, value: JSON.parse(readFileSync(path, 'utf8')) };
  } catch (error) {
    return { ok: false, error: `failed to read seed manifest: ${String(error)}` };
  }
}

function readOptionValue(
  option: string,
  value: string | undefined,
  errors: string[],
): string | undefined {
  if (value === undefined || value.startsWith('--')) {
    errors.push(`${option} requires a value`);
    return undefined;
  }
  return value;
}

function readPositiveInteger(
  option: string,
  value: string | undefined,
  errors: string[],
): number | undefined {
  const raw = readOptionValue(option, value, errors);
  if (raw === undefined) return undefined;
  const parsed = Number(raw);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    errors.push(`${option} must be a positive integer`);
    return undefined;
  }
  return parsed;
}

function formatSeed(value: bigint): `0x${string}` {
  return `0x${value.toString(16).padStart(16, '0')}`;
}

function failure(errors: readonly string[]): SimulationCliResult {
  return {
    exitCode: 1,
    stdout: '',
    stderr: errors.map((error) => `Error: ${error}`).join('\n') + '\n',
  };
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = await runSimulationCli(process.argv.slice(2));
  if (result.stdout.length > 0) process.stdout.write(result.stdout);
  if (result.stderr.length > 0) process.stderr.write(result.stderr);
  process.exitCode = result.exitCode;
}
