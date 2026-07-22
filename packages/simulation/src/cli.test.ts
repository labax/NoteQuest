import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { type SeedManifest } from './index.ts';
import { runSimulationCli } from './cli.ts';

const fixturePath = 'tests/fixtures/simulation/palace-seed-manifest-small.json';
function readValidManifest(): SeedManifest {
  return JSON.parse(readFileSync(fixturePath, 'utf8')) as SeedManifest;
}

function writeManifestFixture(manifest: unknown): string {
  const directory = mkdtempSync(join(tmpdir(), 'notequest-simulation-cli-manifest-'));
  const path = join(directory, 'manifest.json');
  writeFileSync(path, JSON.stringify(manifest), 'utf8');
  return path;
}

const validArgs = [
  '--dungeon',
  'palace',
  '--runs',
  '2',
  '--seed-manifest',
  fixturePath,
  '--rules-version',
  'digital-rules-specification-v0.1',
  '--content-version',
  '0.1.0',
  '--rng-version',
  '1',
] as const;

describe('simulation CLI shell', () => {
  it('prints local QA help output', async () => {
    const result = await runSimulationCli(['--help']);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('NoteQuest simulation CLI');
    expect(result.stdout).toContain('--seed-manifest');
  });

  it('fails clearly when required arguments are missing', async () => {
    const result = await runSimulationCli(['--dungeon', 'palace']);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('--seed-manifest is required');
    expect(result.stderr).toContain('--rules-version is required');
  });

  it('runs a deterministic production-RNG smoke path and writes a JSON report', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'notequest-simulation-cli-'));
    const outputPath = join(directory, 'smoke.json');

    try {
      const result = await runSimulationCli([...validArgs, '--output', outputPath]);
      const report = JSON.parse(readFileSync(outputPath, 'utf8')) as {
        readonly reportKind: string;
        readonly status: string;
        readonly counts: { readonly executedRuns: number };
        readonly seedManifest: { readonly hash: string };
        readonly duration: { readonly milliseconds: number; readonly runtimeMetadata: boolean };
        readonly environment: { readonly runtimeMetadata: boolean; readonly nodeVersion: string };
        readonly results: readonly unknown[];
      };

      expect(result).toEqual({
        exitCode: 0,
        stdout: `Wrote simulation reports\nJSON report: ${outputPath}\n`,
        stderr: '',
      });
      expect(report.reportKind).toBe('notequest-simulation-report.v0.1');
      expect(report.status).toBe('placeholder-smoke-complete');
      expect(report.counts.executedRuns).toBe(2);
      expect(report.seedManifest.hash).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(report.duration).toMatchObject({ runtimeMetadata: true });
      expect(report.duration.milliseconds).toBeGreaterThanOrEqual(0);
      expect(report.environment).toMatchObject({
        runtimeMetadata: true,
        nodeVersion: process.versions.node,
      });
      expect(report.results).toHaveLength(2);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('reports reproducible seed diagnostics and exits non-zero for smoke invariant failures', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'notequest-simulation-cli-failure-'));
    const jsonOutputPath = join(directory, 'failure.json');
    const markdownOutputPath = join(directory, 'failure.md');

    try {
      const result = await runSimulationCli([
        ...validArgs,
        '--expect-first-seed',
        '0x0000000000000002',
        '--json-output',
        jsonOutputPath,
        '--markdown-output',
        markdownOutputPath,
      ]);
      const report = JSON.parse(readFileSync(jsonOutputPath, 'utf8')) as {
        readonly counts: { readonly invariantFailureCount: number };
        readonly invariantFailures: readonly {
          readonly invariantId: string;
          readonly seed: string;
          readonly seedReference: { readonly manifestId: string; readonly manifestHash: string };
          readonly reproduction: {
            readonly expectedFirstSeed: string;
            readonly observedFirstSeed: string;
            readonly workers: number;
          };
          readonly rerun: string;
          readonly actionTrace: readonly unknown[];
        }[];
      };
      const markdown = readFileSync(markdownOutputPath, 'utf8');

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Smallest reproducible seed: 0x0000000000000001');
      expect(result.stderr).toContain(`Report output: JSON report: ${jsonOutputPath}`);
      expect(report.counts.invariantFailureCount).toBe(1);
      expect(report.invariantFailures[0]).toMatchObject({
        invariantId: 'SMOKE-FIRST-SEED',
        seed: '0x0000000000000001',
        seedReference: { manifestId: 'palace.qa-smoke.small.synthetic' },
      });
      expect(report.invariantFailures[0]?.seedReference.manifestHash).toMatch(
        /^sha256:[a-f0-9]{64}$/,
      );
      expect(report.invariantFailures[0]?.reproduction).toMatchObject({
        expectedFirstSeed: '0x0000000000000002',
        observedFirstSeed: '0x0000000000000001',
        workers: 1,
      });
      expect(report.invariantFailures[0]?.rerun).toContain('npm run simulation:cli');
      expect(report.invariantFailures[0]?.rerun).toContain(
        '--expect-first-seed 0x0000000000000002',
      );
      expect(report.invariantFailures[0]?.rerun).toContain('--workers 1');
      expect(report.invariantFailures[0]?.actionTrace.length).toBeGreaterThan(0);
      expect(markdown).toContain('- Invariant failures: 1');
      expect(markdown).toContain('## Invariant failure details');
      expect(markdown).toContain('### 1. SMOKE-FIRST-SEED');
      expect(markdown).toContain('- Failure seed: 0x0000000000000001');
      expect(markdown).toContain(
        '- Seed reference: palace.qa-smoke.small.synthetic@0.1.0; hash=sha256:',
      );
      expect(markdown).toContain('index=0');
      expect(markdown).toContain('--expect-first-seed 0x0000000000000002');
      expect(markdown).toContain(
        '| 1 | derive dungeon generation RNG stream | dungeon-generation | stream ready |',
      );
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('rejects a partial Palace content hash set even when supplied checksums are correct', async () => {
    const manifest = readValidManifest();
    const partialManifest = {
      ...manifest,
      versions: {
        ...manifest.versions,
        contentManifest: {
          ...manifest.versions.contentManifest,
          entries: [manifest.versions.contentManifest.entries[0]],
        },
      },
    };
    const path = writeManifestFixture(partialManifest);

    try {
      const result = await runSimulationCli([...validArgs, '--seed-manifest', path]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('missing Palace content hash entry');
    } finally {
      rmSync(dirnameFromFilePath(path), { recursive: true, force: true });
    }
  });

  it('rejects unknown Palace content hash entries', async () => {
    const manifest = readValidManifest();
    const manifestWithUnknownEntry = {
      ...manifest,
      versions: {
        ...manifest.versions,
        contentManifest: {
          ...manifest.versions.contentManifest,
          entries: [
            ...manifest.versions.contentManifest.entries,
            {
              ...manifest.versions.contentManifest.entries[0],
              contentId: 'palace.fixture.unknown-extra',
            },
          ],
        },
      },
    };
    const path = writeManifestFixture(manifestWithUnknownEntry);

    try {
      const result = await runSimulationCli([...validArgs, '--seed-manifest', path]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(
        'unknown Palace content hash entry palace.fixture.unknown-extra',
      );
    } finally {
      rmSync(dirnameFromFilePath(path), { recursive: true, force: true });
    }
  });

  it('rejects duplicate Palace content hash entries through manifest validation', async () => {
    const manifest = readValidManifest();
    const manifestWithDuplicateEntry = {
      ...manifest,
      versions: {
        ...manifest.versions,
        contentManifest: {
          ...manifest.versions.contentManifest,
          entries: [
            ...manifest.versions.contentManifest.entries,
            manifest.versions.contentManifest.entries[0],
          ],
        },
      },
    };
    const path = writeManifestFixture(manifestWithDuplicateEntry);

    try {
      const result = await runSimulationCli([...validArgs, '--seed-manifest', path]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('duplicate contentId values');
    } finally {
      rmSync(dirnameFromFilePath(path), { recursive: true, force: true });
    }
  });

  it('rejects range seed sets that overflow the uint64 RNG seed domain', async () => {
    const manifest = {
      ...readValidManifest(),
      seedSet: { mode: 'range', start: '0xffffffffffffffff', count: 2 },
    };
    const path = writeManifestFixture(manifest);

    try {
      const result = await runSimulationCli([...validArgs, '--seed-manifest', path]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('range exceeds the 64-bit RNG seed domain');
    } finally {
      rmSync(dirnameFromFilePath(path), { recursive: true, force: true });
    }
  });

  it('writes configured JSON and Markdown reports with required report fields', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'notequest-simulation-cli-reports-'));
    const jsonOutputPath = join(directory, 'report.json');
    const markdownOutputPath = join(directory, 'report.md');

    try {
      const result = await runSimulationCli([
        ...validArgs,
        '--json-output',
        jsonOutputPath,
        '--markdown-output',
        markdownOutputPath,
      ]);
      const report = JSON.parse(readFileSync(jsonOutputPath, 'utf8')) as {
        readonly versions: {
          readonly rulesVersion: string;
          readonly contentManifest: {
            readonly contentVersion: string;
            readonly entries: readonly { readonly contentId: string; readonly checksum: string }[];
          };
          readonly rng: { readonly algorithmId: string; readonly algorithmVersion: string };
          readonly build: {
            readonly packageName: string;
            readonly simulationReportSchemaVersion: string;
          };
        };
        readonly seedManifest: { readonly manifestId: string; readonly hash: string };
        readonly counts: {
          readonly requestedRuns: number;
          readonly executedRuns: number;
          readonly invariantFailureCount: number;
        };
        readonly invariantFailures: readonly string[];
        readonly termination: { readonly status: string };
        readonly reachability: { readonly status: string };
        readonly environment: { readonly dryRun: boolean };
      };
      const markdown = readFileSync(markdownOutputPath, 'utf8');

      expect(result.exitCode).toBe(0);
      expect(report.versions).toMatchObject({
        rulesVersion: 'digital-rules-specification-v0.1',
        contentManifest: { contentVersion: '0.1.0' },
        rng: { algorithmId: 'pcg32', algorithmVersion: '1' },
        build: { packageName: 'notequest', simulationReportSchemaVersion: '0.1.0' },
      });
      expect(report.seedManifest).toMatchObject({ manifestId: 'palace.qa-smoke.small.synthetic' });
      expect(report.seedManifest.hash).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(report.counts).toMatchObject({
        requestedRuns: 2,
        executedRuns: 2,
        invariantFailureCount: 0,
      });
      expect(report.invariantFailures).toEqual([]);
      expect(report.termination.status).toBe('not-evaluated');
      expect(report.reachability.status).toBe('not-evaluated');
      expect(report.environment.dryRun).toBe(false);
      expect(markdown).toContain('# NoteQuest Simulation Report');
      expect(markdown).toContain('- Status: placeholder-smoke-complete');
      expect(markdown).toContain('- Invariant failures: 0');
      expect(markdown).toContain('## Selected content hash evidence');
      expect(markdown).toContain('palace.fixture.room-table');
      expect(markdown).toContain(report.versions.contentManifest.entries[0]?.checksum);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('writes Markdown-only output while keeping parseable JSON on stdout', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'notequest-simulation-cli-markdown-only-'));
    const markdownOutputPath = join(directory, 'report.md');

    try {
      const result = await runSimulationCli([
        ...validArgs,
        '--markdown-output',
        markdownOutputPath,
      ]);
      const stdoutReport = JSON.parse(result.stdout) as {
        readonly reportKind: string;
        readonly versions: {
          readonly contentManifest: {
            readonly entries: readonly { readonly contentId: string; readonly checksum: string }[];
          };
        };
      };
      const markdown = readFileSync(markdownOutputPath, 'utf8');

      expect(result.exitCode).toBe(0);
      expect(result.stderr).toBe('');
      expect(stdoutReport.reportKind).toBe('notequest-simulation-report.v0.1');
      expect(stdoutReport.versions.contentManifest.entries.length).toBeGreaterThan(0);
      expect(markdown).toContain('## Selected content hash evidence');
      expect(markdown).toContain(stdoutReport.versions.contentManifest.entries[0]?.contentId);
      expect(markdown).toContain(stdoutReport.versions.contentManifest.entries[0]?.checksum);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('selects only requested seeds from a large range for small smoke runs', async () => {
    const manifest = {
      ...readValidManifest(),
      seedSet: { mode: 'range', start: '0x0000000000000000', count: Number.MAX_SAFE_INTEGER },
    };
    const path = writeManifestFixture(manifest);

    try {
      const result = await runSimulationCli([...validArgs, '--seed-manifest', path]);
      const report = JSON.parse(result.stdout) as {
        readonly counts: { readonly executedRuns: number };
        readonly results: readonly { readonly seed: string }[];
      };

      expect(result.exitCode).toBe(0);
      expect(report.counts.executedRuns).toBe(2);
      expect(report.results.map((entry) => entry.seed)).toEqual([
        '0x0000000000000000',
        '0x0000000000000001',
      ]);
    } finally {
      rmSync(dirnameFromFilePath(path), { recursive: true, force: true });
    }
  });

  it('dry-runs a large range without materializing seeds or executing RNG smoke draws', async () => {
    const manifest = {
      ...readValidManifest(),
      seedSet: { mode: 'range', start: '0x0000000000000000', count: Number.MAX_SAFE_INTEGER },
    };
    const path = writeManifestFixture(manifest);

    try {
      const result = await runSimulationCli([
        '--dry-run',
        '--dungeon',
        'palace',
        '--seed-manifest',
        path,
        '--rules-version',
        'digital-rules-specification-v0.1',
        '--content-version',
        '0.1.0',
        '--rng-version',
        '1',
      ]);
      const report = JSON.parse(result.stdout) as {
        readonly counts: { readonly executedRuns: number };
        readonly results: readonly unknown[];
      };

      expect(result.exitCode).toBe(0);
      expect(report.counts.executedRuns).toBe(0);
      expect(report.results).toEqual([]);
    } finally {
      rmSync(dirnameFromFilePath(path), { recursive: true, force: true });
    }
  });

  it('supports dry-run seed/content manifest validation without executing seeds', async () => {
    const result = await runSimulationCli([
      '--dry-run',
      '--dungeon',
      'palace',
      '--seed-manifest',
      fixturePath,
      '--rules-version',
      'digital-rules-specification-v0.1',
      '--content-version',
      '0.1.0',
      '--rng-version',
      '1',
    ]);
    const report = JSON.parse(result.stdout) as {
      readonly status: string;
      readonly counts: { readonly executedRuns: number };
    };

    expect(result.exitCode).toBe(0);
    expect(report.status).toBe('validated');
    expect(report.counts.executedRuns).toBe(0);
  });
});

function dirnameFromFilePath(path: string): string {
  return path.slice(0, path.lastIndexOf('/'));
}
