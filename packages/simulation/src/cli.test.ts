import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { runSimulationCli } from './cli.ts';

const fixturePath = 'tests/fixtures/simulation/palace-seed-manifest-small.json';
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
        readonly status: string;
        readonly executedRuns: number;
        readonly results: readonly unknown[];
      };

      expect(result).toEqual({
        exitCode: 0,
        stdout: `Wrote simulation report to ${outputPath}\n`,
        stderr: '',
      });
      expect(report.status).toBe('placeholder-smoke-complete');
      expect(report.executedRuns).toBe(2);
      expect(report.results).toHaveLength(2);
    } finally {
      rmSync(directory, { recursive: true, force: true });
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
      readonly executedRuns: number;
    };

    expect(result.exitCode).toBe(0);
    expect(report.status).toBe('validated');
    expect(report.executedRuns).toBe(0);
  });
});
