import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { palaceManifestExpectedHashFixtures } from '@notequest/content';
import { serializeCanonicalJson } from '@notequest/infrastructure';
import {
  getContiguousIndexPartitionSlice,
  makeSeedManifestHashPayload,
  type SeedManifest,
  seedManifestHashInputKind,
  validateSeedManifest,
} from './index.ts';

function readFixture(name: string): unknown {
  return JSON.parse(readFileSync(join(process.cwd(), 'tests/fixtures/simulation', name), 'utf8'));
}

function readValidFixture(name = 'palace-seed-manifest-small.json'): SeedManifest {
  const fixture = readFixture(name);
  const result = validateSeedManifest(fixture);

  if (!result.valid) {
    throw new Error(`invalid test fixture ${name}: ${JSON.stringify(result.errors)}`);
  }

  return fixture as SeedManifest;
}

describe('seed manifest validation', () => {
  it('accepts a valid small Palace explicit-seed fixture with content hash evidence', () => {
    const fixture = readValidFixture();

    expect(validateSeedManifest(fixture)).toEqual({ valid: true, errors: [] });
    expect(fixture.versions.contentManifest.entries).toHaveLength(
      palaceManifestExpectedHashFixtures.length,
    );
    expect(fixture.versions.contentManifest.entries[0]).toMatchObject({
      contentId: palaceManifestExpectedHashFixtures[0]?.contentId,
      algorithm: 'SHA-256',
      canonicalization: 'RFC-8785',
      hashInputKind: 'palace-manifest-entry-integrity-payload.v0.1',
      checksum: palaceManifestExpectedHashFixtures[0]?.checksum,
    });
  });

  it('accepts a valid Palace range fixture with deterministic partition metadata', () => {
    expect(validateSeedManifest(readFixture('palace-seed-manifest-range-partition.json'))).toEqual({
      valid: true,
      errors: [],
    });
  });

  it('rejects malformed parsed JSON inputs without throwing', () => {
    const malformedInputs: readonly unknown[] = [
      null,
      [],
      {},
      { seedSet: null },
      { versions: null },
      { versions: { rng: null } },
      { partitioning: null },
      { privacy: null },
    ];

    for (const malformed of malformedInputs) {
      expect(() => validateSeedManifest(malformed)).not.toThrow();
      expect(validateSeedManifest(malformed).valid).toBe(false);
    }
  });

  it('reports clear field paths for missing nested sections', () => {
    expect(validateSeedManifest({})).toMatchObject({
      valid: false,
      errors: expect.arrayContaining([
        { field: 'seedSet', reason: 'seedSet is required and must be an object' },
        { field: 'seedSet.mode', reason: 'seed set mode must be explicit or range' },
        { field: 'versions', reason: 'versions is required and must be an object' },
        { field: 'versions.rng', reason: 'versions.rng is required and must be an object' },
        {
          field: 'versions.contentManifest',
          reason: 'versions.contentManifest is required and must be an object',
        },
        { field: 'partitioning', reason: 'partitioning is required and must be an object' },
        { field: 'privacy', reason: 'privacy is required and must be an object' },
      ]),
    });
  });

  it('rejects malformed or unsupported manifests with clear field reasons', () => {
    const valid = readValidFixture();
    const malformed = {
      ...valid,
      runPurpose: 'production-player-data',
      seedSet: { mode: 'explicit', seeds: ['1', '1'] },
      versions: {
        ...valid.versions,
        rng: { ...valid.versions.rng, algorithmVersion: '2' },
      },
      partitioning: {
        ...valid.partitioning,
        partitionCount: 2,
        partitionIndex: 2,
      },
      privacy: { containsRealUserData: true, fixtureDataClassification: 'private' },
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

  it('rejects invalid content manifest hash evidence', () => {
    const valid = readValidFixture();
    const malformed = {
      ...valid,
      versions: {
        ...valid.versions,
        contentManifest: {
          ...valid.versions.contentManifest,
          rulesVersion: 'different-rules-version',
          entries: [
            {
              ...valid.versions.contentManifest.entries[0],
              algorithm: 'MD5',
              canonicalization: 'custom',
              hashInputKind: 'custom-payload',
              checksum: 'sha256:not-lowercase-or-long-enough',
            },
            valid.versions.contentManifest.entries[0],
          ],
        },
      },
    };

    expect(validateSeedManifest(malformed)).toMatchObject({
      valid: false,
      errors: expect.arrayContaining([
        {
          field: 'versions.contentManifest.rulesVersion',
          reason: 'content manifest rules version must match versions.rulesVersion',
        },
        {
          field: 'versions.contentManifest.entries[0].algorithm',
          reason: 'content hash algorithm must be SHA-256',
        },
        {
          field: 'versions.contentManifest.entries[0].canonicalization',
          reason: 'content hash canonicalization must be RFC-8785',
        },
        {
          field: 'versions.contentManifest.entries[0].hashInputKind',
          reason: 'content hash input kind must be palace-manifest-entry-integrity-payload.v0.1',
        },
        {
          field: 'versions.contentManifest.entries[0].checksum',
          reason: 'content checksum must be sha256:<64 lowercase hex>',
        },
        {
          field: 'versions.contentManifest.entries',
          reason:
            'content manifest entry hash evidence must not contain duplicate contentId values',
        },
      ]),
    });
  });

  it('builds a canonical hash payload that includes content evidence', () => {
    const manifest = readValidFixture();
    const payload = makeSeedManifestHashPayload(manifest);
    const canonicalJson = serializeCanonicalJson(payload);

    expect(payload).toMatchObject({ hashInputKind: seedManifestHashInputKind });
    expect(canonicalJson).toContain('"hashInputKind"');
    expect(canonicalJson).toContain('"contentManifest"');
    expect(canonicalJson).toContain(palaceManifestExpectedHashFixtures[0]?.checksum);
  });
});

describe('contiguous index partition slices', () => {
  it('splits divisible counts into half-open zero-based slices', () => {
    expect(getContiguousIndexPartitionSlice(12, 3, 0)).toEqual({
      startInclusive: 0,
      endExclusive: 4,
    });
    expect(getContiguousIndexPartitionSlice(12, 3, 2)).toEqual({
      startInclusive: 8,
      endExclusive: 12,
    });
  });

  it('assigns non-divisible remainder seeds to the lowest partition indexes', () => {
    expect(
      Array.from({ length: 4 }, (_, index) => getContiguousIndexPartitionSlice(10, 4, index)),
    ).toEqual([
      { startInclusive: 0, endExclusive: 3 },
      { startInclusive: 3, endExclusive: 6 },
      { startInclusive: 6, endExclusive: 8 },
      { startInclusive: 8, endExclusive: 10 },
    ]);
  });
});
