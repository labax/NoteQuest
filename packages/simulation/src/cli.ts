#!/usr/bin/env node
import { createHash } from 'node:crypto';
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
  makeSeedManifestHashPayload,
  supportedSimulationDungeonTypes,
  type SeedManifest,
  validateSeedManifest,
} from './index.ts';

const usageText = `NoteQuest simulation CLI

Usage:
  npm run simulation:cli -- --dungeon palace --runs 3 --seed-manifest tests/fixtures/simulation/palace-seed-manifest-small.json --rules-version digital-rules-specification-v0.1 --content-version 0.1.0 --rng-version 1 --output .tmp/simulation-smoke.json
  npm run simulation:cli -- --dry-run --dungeon palace --seed-manifest tests/fixtures/simulation/palace-seed-manifest-small.json --rules-version digital-rules-specification-v0.1 --content-version 0.1.0 --rng-version 1

Options:
  --dungeon <type>          Dungeon type to simulate. Supported: palace.
  --runs <count>           Number of manifest seeds to execute for the smoke path.
  --seed-manifest <path>   JSON seed/content manifest to validate and execute.
  --rules-version <value>  Expected rules version in the seed manifest.
  --content-version <semver> Expected content manifest version in the seed manifest.
  --rng-version <value>    Expected production RNG algorithm version.
  --workers <count>        Worker count metadata for future partitioned execution; current shell runs serially.
  --output <path>          JSON report output path. Omit to write the JSON report to stdout.
  --markdown-output <path> Markdown summary report output path.
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
  readonly markdownOutputPath?: string;
  readonly dryRun: boolean;
  readonly help: boolean;
}

interface SmokeSeedResult {
  readonly seed: string;
  readonly dungeonGenerationDraw: number;
  readonly combatDraw: number;
  readonly expeditionRepopulationDraw: number;
}

interface SeedWindow {
  readonly partitionStartInclusive: number;
  readonly partitionEndExclusive: number;
}

interface SimulationReport {
  readonly reportKind: 'notequest-simulation-report.v0.1';
  readonly status: 'validated' | 'placeholder-smoke-complete';
  readonly boundary: string;
  readonly build: {
    readonly packageName: 'notequest';
    readonly packageVersion: '0.0.0';
    readonly applicationLayer: typeof applicationLayerName;
  };
  readonly versions: {
    readonly rulesVersion: string;
    readonly content: {
      readonly schemaVersion: string;
      readonly packageId: string;
      readonly contentVersion: string;
      readonly rulesVersion: string;
      readonly status: typeof bundledContentStatus;
    };
    readonly rng: SeedManifest['versions']['rng'];
  };
  readonly seedManifest: {
    readonly manifestId: string;
    readonly manifestVersion: string;
    readonly schemaVersion: string;
    readonly hash: {
      readonly algorithm: 'SHA-256';
      readonly canonicalization: 'RFC-8785';
      readonly hashInputKind: string;
      readonly checksum: string;
    };
  };
  readonly run: {
    readonly dungeonType: string;
    readonly runPurpose: string;
    readonly requestedRuns: number;
    readonly executedRuns: number;
    readonly workers: number;
    readonly dryRun: boolean;
    readonly partition: SeedManifest['partitioning'];
  };
  readonly counts: {
    readonly manifestSeedCount: number;
    readonly partitionSeedCount: number;
    readonly selectedSeedCount: number;
    readonly resultCount: number;
    readonly invariantFailureCount: number;
  };
  readonly invariantFailures: readonly string[];
  readonly termination: {
    readonly status: 'not-executed' | 'placeholder-not-implemented';
    readonly reachedTerminalStateCount: number;
    readonly maxStepLimitHitCount: number;
  };
  readonly reachability: {
    readonly status: 'placeholder-not-measured';
    readonly unreachableRequiredNodeCount: number;
  };
  readonly duration: {
    readonly milliseconds: number;
    readonly runtimeMetadata: true;
  };
  readonly environment: {
    readonly runtimeMetadata: true;
    readonly nodeVersion: string;
    readonly platform: NodeJS.Platform;
    readonly arch: string;
    readonly ci: boolean;
  };
  readonly distributionSummary: {
    readonly status: 'placeholder-not-measured';
    readonly sections: readonly unknown[];
  };
  readonly results: readonly SmokeSeedResult[];
}

const UINT64_MAX = 0xffff_ffff_ffff_ffffn;

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

  const startedAt = performance.now();
  const seeds = options.dryRun ? [] : selectManifestSeeds(manifest, options.runs ?? 0);
  const results = options.dryRun ? [] : seeds.map(runSmokeSeed);
  const durationMs = Math.max(0, Math.round((performance.now() - startedAt) * 1000) / 1000);
  const report: SimulationReport = {
    reportKind: 'notequest-simulation-report.v0.1',
    status: options.dryRun ? 'validated' : 'placeholder-smoke-complete',
    boundary:
      'Palace generation is not implemented in this milestone; this CLI validates manifests and exercises production RNG streams only.',
    build: {
      packageName: 'notequest',
      packageVersion: '0.0.0',
      applicationLayer: applicationLayerName,
    },
    versions: {
      rulesVersion: manifest.versions.rulesVersion,
      content: {
        schemaVersion: manifest.versions.contentManifest.schemaVersion,
        packageId: manifest.versions.contentManifest.packageId,
        contentVersion: manifest.versions.contentManifest.contentVersion,
        rulesVersion: manifest.versions.contentManifest.rulesVersion,
        status: bundledContentStatus,
      },
      rng: manifest.versions.rng,
    },
    seedManifest: {
      manifestId: manifest.manifestId,
      manifestVersion: manifest.manifestVersion,
      schemaVersion: manifest.schemaVersion,
      hash: hashSeedManifest(manifest),
    },
    run: {
      dungeonType: manifest.dungeonType,
      runPurpose: manifest.runPurpose,
      requestedRuns: options.runs ?? 0,
      executedRuns: results.length,
      workers: options.workers,
      dryRun: options.dryRun,
      partition: manifest.partitioning,
    },
    counts: {
      manifestSeedCount: getSeedSetCount(manifest),
      partitionSeedCount: getPartitionSeedCount(manifest),
      selectedSeedCount: seeds.length,
      resultCount: results.length,
      invariantFailureCount: 0,
    },
    invariantFailures: [],
    termination: {
      status: options.dryRun ? 'not-executed' : 'placeholder-not-implemented',
      reachedTerminalStateCount: 0,
      maxStepLimitHitCount: 0,
    },
    reachability: {
      status: 'placeholder-not-measured',
      unreachableRequiredNodeCount: 0,
    },
    duration: {
      milliseconds: durationMs,
      runtimeMetadata: true,
    },
    environment: getEnvironmentMetadata(),
    distributionSummary: {
      status: 'placeholder-not-measured',
      sections: [],
    },
    results,
  };

  const jsonOutput = JSON.stringify(report, null, 2) + '\n';
  const writtenPaths: string[] = [];
  if (options.outputPath !== undefined) {
    writeTextFile(options.outputPath, jsonOutput);
    writtenPaths.push(`JSON report to ${options.outputPath}`);
  }

  if (options.markdownOutputPath !== undefined) {
    writeTextFile(options.markdownOutputPath, renderMarkdownReport(report));
    writtenPaths.push(`Markdown report to ${options.markdownOutputPath}`);
  }

  if (writtenPaths.length > 0) {
    return {
      exitCode: 0,
      stdout: `Wrote simulation ${writtenPaths.join(' and ')}\n`,
      stderr: '',
    };
  }

  return { exitCode: 0, stdout: jsonOutput, stderr: '' };
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
    markdownOutputPath?: string;
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
      case '--markdown-output':
        assignStringOption(mutable, 'markdownOutputPath', readOptionValue(arg, value, errors));
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

  errors.push(...validateExpectedPalaceContentHashSet(manifest));
  errors.push(...validateSeedRangeBounds(manifest));

  const seedWindow = getSeedWindow(manifest);
  const partitionSeedCount = seedWindow.partitionEndExclusive - seedWindow.partitionStartInclusive;
  if ((options.runs ?? 0) > partitionSeedCount)
    errors.push('--runs cannot exceed the selected manifest partition seed count');
  return errors;
}

function validateExpectedPalaceContentHashSet(manifest: SeedManifest): readonly string[] {
  const errors: string[] = [];
  const expectedChecksums = new Map(
    palaceManifestExpectedHashFixtures.map((entry): [string, string] => [
      entry.contentId,
      entry.checksum,
    ]),
  );
  const seen = new Set<string>();

  for (const [index, entry] of manifest.versions.contentManifest.entries.entries()) {
    const field = `versions.contentManifest.entries[${index}].contentId`;
    if (!expectedChecksums.has(entry.contentId)) {
      errors.push(`${field}: unknown Palace content hash entry ${entry.contentId}`);
      continue;
    }

    if (seen.has(entry.contentId)) {
      errors.push(`${field}: duplicate Palace content hash entry ${entry.contentId}`);
      continue;
    }

    seen.add(entry.contentId);
    if (expectedChecksums.get(entry.contentId) !== entry.checksum) {
      errors.push(
        `versions.contentManifest.entries[${index}].checksum: checksum mismatch for ${entry.contentId}`,
      );
    }
  }

  for (const contentId of expectedChecksums.keys()) {
    if (!seen.has(contentId)) {
      errors.push(
        `versions.contentManifest.entries: missing Palace content hash entry ${contentId}`,
      );
    }
  }

  return errors;
}

function validateSeedRangeBounds(manifest: SeedManifest): readonly string[] {
  if (manifest.seedSet.mode === 'explicit') return [];

  const start = BigInt(manifest.seedSet.start);
  const finalSeed = start + BigInt(manifest.seedSet.count) - 1n;
  if (finalSeed > UINT64_MAX) {
    return [
      'seedSet.range: range exceeds the 64-bit RNG seed domain; start + count - 1 must be at most 0xffffffffffffffff',
    ];
  }

  return [];
}

function getSeedWindow(manifest: SeedManifest): SeedWindow {
  const totalCount = getSeedSetCount(manifest);
  const slice = getContiguousIndexPartitionSlice(
    totalCount,
    manifest.partitioning.partitionCount,
    manifest.partitioning.partitionIndex,
  );
  return {
    partitionStartInclusive: slice.startInclusive,
    partitionEndExclusive: slice.endExclusive,
  };
}

function getSeedSetCount(manifest: SeedManifest): number {
  return manifest.seedSet.mode === 'explicit'
    ? manifest.seedSet.seeds.length
    : manifest.seedSet.count;
}

function serializeCanonicalJson(value: unknown): string {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') {
    return JSON.stringify(value);
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('Cannot canonicalize non-finite numbers');
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) return `[${value.map(serializeCanonicalJson).join(',')}]`;

  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${serializeCanonicalJson(record[key])}`)
      .join(',')}}`;
  }

  throw new TypeError(`Cannot canonicalize ${typeof value} values`);
}

function getPartitionSeedCount(manifest: SeedManifest): number {
  const seedWindow = getSeedWindow(manifest);
  return seedWindow.partitionEndExclusive - seedWindow.partitionStartInclusive;
}

function hashSeedManifest(manifest: SeedManifest): SimulationReport['seedManifest']['hash'] {
  const payload = makeSeedManifestHashPayload(manifest);
  const hex = createHash('sha256').update(serializeCanonicalJson(payload), 'utf8').digest('hex');
  return {
    algorithm: 'SHA-256',
    canonicalization: 'RFC-8785',
    hashInputKind: String(payload['hashInputKind']),
    checksum: `sha256:${hex}`,
  };
}

function getEnvironmentMetadata(): SimulationReport['environment'] {
  return {
    runtimeMetadata: true,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    ci: process.env['CI'] === 'true',
  };
}

function renderMarkdownReport(report: SimulationReport): string {
  return [
    '# NoteQuest Simulation Summary',
    '',
    `- Status: ${report.status}`,
    `- Dungeon: ${report.run.dungeonType}`,
    `- Seed manifest: ${report.seedManifest.manifestId}@${report.seedManifest.manifestVersion}`,
    `- Seed manifest hash: ${report.seedManifest.hash.checksum}`,
    `- Rules version: ${report.versions.rulesVersion}`,
    `- Content version: ${report.versions.content.contentVersion}`,
    `- RNG: ${report.versions.rng.algorithmId}@${report.versions.rng.algorithmVersion}`,
    `- Runs: ${report.run.executedRuns}/${report.run.requestedRuns}`,
    `- Invariant failures: ${report.counts.invariantFailureCount}`,
    `- Termination: ${report.termination.status}`,
    `- Reachability: ${report.reachability.status}`,
    `- Duration: ${report.duration.milliseconds} ms (runtime metadata)`,
    `- Environment: Node ${report.environment.nodeVersion} on ${report.environment.platform}/${report.environment.arch} (runtime metadata)`,
    '',
  ].join('\n');
}

function writeTextFile(path: string, contents: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents, 'utf8');
}

function selectManifestSeeds(manifest: SeedManifest, requestedRuns: number): readonly string[] {
  const seedWindow = getSeedWindow(manifest);
  const selectedCount = Math.min(
    requestedRuns,
    seedWindow.partitionEndExclusive - seedWindow.partitionStartInclusive,
  );

  if (manifest.seedSet.mode === 'explicit') {
    return manifest.seedSet.seeds.slice(
      seedWindow.partitionStartInclusive,
      seedWindow.partitionStartInclusive + selectedCount,
    );
  }

  const start = BigInt(manifest.seedSet.start);
  const firstSelectedSeed = start + BigInt(seedWindow.partitionStartInclusive);
  return Array.from({ length: selectedCount }, (_, index) =>
    formatSeed(firstSelectedSeed + BigInt(index)),
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
