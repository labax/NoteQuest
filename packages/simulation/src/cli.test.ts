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
        readonly versions: {
          readonly rulesVersion: string;
          readonly rng: { readonly algorithmVersion: string };
        };
        readonly seedManifest: {
          readonly manifestId: string;
          readonly hash: { readonly checksum: string };
        };
        readonly run: { readonly executedRuns: number };
        readonly counts: { readonly invariantFailureCount: number; readonly resultCount: number };
        readonly invariantFailures: readonly unknown[];
        readonly termination: { readonly status: string };
        readonly reachability: { readonly status: string };
        readonly duration: { readonly milliseconds: number; readonly runtimeMetadata: true };
        readonly environment: { readonly runtimeMetadata: true; readonly nodeVersion: string };
        readonly results: readonly unknown[];
      };

      expect(result).toEqual({
        exitCode: 0,
        stdout: `Wrote simulation JSON report to ${outputPath}\n`,
        stderr: '',
      });
      expect(report.reportKind).toBe('notequest-simulation-report.v0.1');
      expect(report.status).toBe('placeholder-smoke-complete');
      expect(report.versions.rulesVersion).toBe('digital-rules-specification-v0.1');
      expect(report.versions.rng.algorithmVersion).toBe('1');
      expect(report.seedManifest.manifestId).toBe('palace.qa-smoke.small.synthetic');
      expect(report.seedManifest.hash.checksum).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(report.run.executedRuns).toBe(2);
      expect(report.counts.resultCount).toBe(2);
      expect(report.counts.invariantFailureCount).toBe(0);
      expect(report.invariantFailures).toEqual([]);
      expect(report.termination.status).toBe('placeholder-not-implemented');
      expect(report.reachability.status).toBe('placeholder-not-measured');
      expect(report.duration.runtimeMetadata).toBe(true);
      expect(report.duration.milliseconds).toBeGreaterThanOrEqual(0);
      expect(report.environment.runtimeMetadata).toBe(true);
      expect(report.environment.nodeVersion).toBe(process.version);
      expect(report.results).toHaveLength(2);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('writes a concise Markdown report to the configured output path', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'notequest-simulation-cli-markdown-'));
    const jsonOutputPath = join(directory, 'smoke.json');
    const markdownOutputPath = join(directory, 'smoke.md');

    try {
      const result = await runSimulationCli([
        ...validArgs,
        '--output',
        jsonOutputPath,
        '--markdown-output',
        markdownOutputPath,
      ]);
      const markdown = readFileSync(markdownOutputPath, 'utf8');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain(`JSON report to ${jsonOutputPath}`);
      expect(result.stdout).toContain(`Markdown report to ${markdownOutputPath}`);
      expect(markdown).toContain('# NoteQuest Simulation Summary');
      expect(markdown).toContain('- Status: placeholder-smoke-complete');
      expect(markdown).toContain('- Seed manifest: palace.qa-smoke.small.synthetic@0.1.0');
      expect(markdown).toContain('- Invariant failures: 0');
      expect(markdown).not.toContain('source prose');
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

  it('selects only requested seeds from a large range for small smoke runs', async () => {
    const manifest = {
      ...readValidManifest(),
      seedSet: { mode: 'range', start: '0x0000000000000000', count: Number.MAX_SAFE_INTEGER },
    };
    const path = writeManifestFixture(manifest);

    try {
      const result = await runSimulationCli([...validArgs, '--seed-manifest', path]);
      const report = JSON.parse(result.stdout) as {
        readonly run: { readonly executedRuns: number };
        readonly results: readonly { readonly seed: string }[];
      };

      expect(result.exitCode).toBe(0);
      expect(report.run.executedRuns).toBe(2);
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
        readonly run: { readonly executedRuns: number };
        readonly results: readonly unknown[];
      };

      expect(result.exitCode).toBe(0);
      expect(report.run.executedRuns).toBe(0);
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
      readonly run: { readonly executedRuns: number };
    };

    expect(result.exitCode).toBe(0);
    expect(report.status).toBe('validated');
    expect(report.run.executedRuns).toBe(0);
  });
});

function dirnameFromFilePath(path: string): string {
  return path.slice(0, path.lastIndexOf('/'));
}
