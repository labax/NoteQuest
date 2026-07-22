import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { serializeCanonicalJson } from '@notequest/infrastructure';
import {
  makeSeedManifestHashPayload,
  type SeedManifest,
  seedManifestHashInputKind,
  validateSeedManifest,
} from './index.ts';

function readFixture(name: string): SeedManifest {
  return JSON.parse(
    readFileSync(join(process.cwd(), 'tests/fixtures/simulation', name), 'utf8'),
  ) as SeedManifest;
}

describe('seed manifest validation', () => {
  it('accepts a valid small Palace explicit-seed fixture', () => {
    expect(validateSeedManifest(readFixture('palace-seed-manifest-small.json'))).toEqual({
      valid: true,
      errors: [],
    });
  });

  it('accepts a valid Palace range fixture with deterministic partition metadata', () => {
    expect(validateSeedManifest(readFixture('palace-seed-manifest-range-partition.json'))).toEqual({
      valid: true,
      errors: [],
    });
  });

  it('rejects malformed or unsupported manifests with clear field reasons', () => {
    const malformed: SeedManifest = {
      ...readFixture('palace-seed-manifest-small.json'),
      runPurpose: 'production-player-data' as SeedManifest['runPurpose'],
      seedSet: { mode: 'explicit', seeds: ['1', '1'] as unknown as readonly `0x${string}`[] },
      versions: {
        ...readFixture('palace-seed-manifest-small.json').versions,
        rng: {
          ...readFixture('palace-seed-manifest-small.json').versions.rng,
          algorithmVersion: '2' as '1',
        },
      },
      partitioning: {
        ...readFixture('palace-seed-manifest-small.json').partitioning,
        partitionCount: 2,
        partitionIndex: 2,
      },
      privacy: {
        containsRealUserData: true as false,
        fixtureDataClassification: 'private' as 'synthetic-public-safe',
      },
    };

    expect(validateSeedManifest(malformed)).toMatchObject({
      valid: false,
      errors: expect.arrayContaining([
        { field: 'runPurpose', reason: 'unsupported simulation run purpose' },
        { field: 'seedSet.seeds[0]', reason: expect.stringContaining('64-bit lowercase hex') },
        { field: 'seedSet.seeds', reason: 'explicit seed sets must not contain duplicate seeds' },
        { field: 'versions.rng.algorithmVersion', reason: 'unsupported RNG algorithm version' },
        {
          field: 'partitioning.partitionIndex',
          reason: expect.stringContaining('within partition count'),
        },
        {
          field: 'privacy.containsRealUserData',
          reason: 'seed manifests must not contain real user data',
        },
      ]),
    });
  });

  it('builds a canonical hash payload for future reports without user data fields', () => {
    const payload = makeSeedManifestHashPayload(readFixture('palace-seed-manifest-small.json'));

    expect(payload).toMatchObject({ hashInputKind: seedManifestHashInputKind });
    expect(serializeCanonicalJson(payload)).toContain('"hashInputKind"');
  });
});
