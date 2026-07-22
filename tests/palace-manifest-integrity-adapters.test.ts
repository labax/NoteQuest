import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import type { PalaceContentManifest, PalaceManifestEntry } from '@notequest/content';
import {
  hashPalaceManifestEntry,
  palaceManifestExpectedHashFixtures,
  validatePalaceManifestIntegrity,
} from '@notequest/content';
import { createSha256Hasher, serializeCanonicalJson } from '@notequest/infrastructure';

const selectedReview = {
  approvalState: 'selected',
  publicReleaseEligible: true,
} as const;

const infrastructureIntegrityAdapters = {
  canonicalJson: { serializeCanonicalJson },
  sha256: createSha256Hasher(),
} as const;

type PalaceManifestEntryOverrides = {
  readonly [Key in keyof PalaceManifestEntry]?: PalaceManifestEntry[Key] | undefined;
};

function makeValidEntry(
  id: `palace.${string}`,
  overrides: PalaceManifestEntryOverrides = {},
): PalaceManifestEntry {
  const entry: PalaceManifestEntry = {
    id,
    contentType: 'fixture' as const,
    kind: 'table-row' as const,
    version: '0.1.0' as const,
    label: `Project-original ${id}`,
    parentId: 'palace.fixture.room-table',
    range: { dice: '1d6' as const, rangeId: `${id}.range`, from: 1, to: 1 },
    tags: ['palace', 'fixture', 'rights-safe'],
    structuredDefinition: { outcome: id },
    provenance: {
      origin: 'project-original' as const,
      sourceCategory: 'project_original' as const,
      sourceName: 'NoteQuest Web Application test fixture',
      sourceLocation: 'tests/palace-manifest-integrity-adapters.test.ts',
      sourceEditionVersion: '0.1.0',
      sourceReferences: [
        {
          kind: 'project-original-placeholder' as const,
          sourceId: 'story-m3-003',
          citationLabel: 'Issue #60 rights-safe integrity fixture',
        },
      ],
      authorRightsHolder: 'NoteQuest Web Application project',
      permissionLicenseId: 'PROJECT-ORIGINAL-TEST-FIXTURE',
      rightsBasis: 'Project-authored validation fixture only.',
      evidenceReference: {
        publicId: 'STORY-M3-003',
        location: null,
        confidentiality: 'public-safe-reference' as const,
      },
      permittedReleaseModes: ['public-free-core-mvp' as const],
      restrictions: ['contains-no-official-source-expression'],
      attributionRequired: false,
      attributionNoticeId: null,
      noticeLocations: [],
      modifications: ['project-original deterministic validation fixture'],
      compatibilityPolicy: 'compatible-within-package-version' as const,
      contentHash: {
        status: 'not-applicable' as const,
        algorithm: 'not-applicable' as const,
        canonicalization: 'not-applicable' as const,
        value: null,
      },
      supersedes: [],
      confidentialRightsEvidence: 'excluded-from-public-manifest' as const,
      containsExactSourceProse: false,
      containsSourceArtwork: false,
      containsTradeDress: false,
    },
    review: selectedReview,
  };

  return { ...entry, ...overrides } as PalaceManifestEntry;
}

function makeFixtureManifest(): PalaceContentManifest {
  const table = makeValidEntry('palace.fixture.room-table', {
    kind: 'table',
    parentId: undefined,
    range: undefined,
    references: ['palace.fixture.mechanic'],
    structuredDefinition: { dice: '1d6', purpose: 'project-original validation table' },
  });
  const mechanic = makeValidEntry('palace.fixture.mechanic', {
    kind: 'mechanic-reference',
    parentId: undefined,
    range: undefined,
    structuredDefinition: { rule: 'project-original fixture mechanic' },
  });
  const rows = [1, 2, 3, 4, 5, 6].map((value) =>
    makeValidEntry(`palace.fixture.room-table.row-${value}`, {
      range: {
        dice: '1d6',
        rangeId: `palace.fixture.room-table.row-${value}.range`,
        from: value,
        to: value,
      },
    }),
  );

  const hashesByContentId: ReadonlyMap<
    string,
    (typeof palaceManifestExpectedHashFixtures)[number]
  > = new Map(palaceManifestExpectedHashFixtures.map((fixture) => [fixture.contentId, fixture]));

  return {
    schemaVersion: 'palace-content-manifest.schema.v0.1',
    packageId: 'palace',
    contentVersion: '0.1.0',
    rulesVersion: 'digital-rules-specification-v0.1',
    generatedAt: '2026-07-19T00:00:00.000Z',
    entries: [table, mechanic, ...rows].map((entry) => {
      const fixture = hashesByContentId.get(entry.id);

      if (fixture === undefined) {
        return entry;
      }

      return {
        ...entry,
        provenance: {
          ...entry.provenance,
          contentHash: {
            status: 'recorded' as const,
            algorithm: fixture.algorithm,
            canonicalization: fixture.canonicalization,
            value: fixture.checksum,
          },
        },
      };
    }),
  };
}

describe('Palace manifest integrity adapters at the infrastructure boundary', () => {
  it('reproduces recorded synthetic fixture hashes with canonical JSON and SHA-256 adapters', async () => {
    const manifest = makeFixtureManifest();

    for (const fixture of palaceManifestExpectedHashFixtures) {
      const entry = manifest.entries.find((candidate) => candidate.id === fixture.contentId);
      expect(entry).toBeDefined();
      if (entry === undefined) {
        throw new Error(`missing Palace manifest hash fixture ${fixture.contentId}`);
      }

      await expect(
        hashPalaceManifestEntry(entry, infrastructureIntegrityAdapters),
      ).resolves.toEqual(
        expect.objectContaining({
          contentId: fixture.contentId,
          algorithm: 'SHA-256',
          canonicalization: 'RFC-8785',
          hashInputKind: 'palace-manifest-entry-integrity-payload.v0.1',
          checksum: fixture.checksum,
        }),
      );
    }
  });

  it('validates recorded fixture integrity evidence with injected infrastructure adapters', async () => {
    await expect(
      validatePalaceManifestIntegrity(makeFixtureManifest(), infrastructureIntegrityAdapters),
    ).resolves.toMatchObject({ valid: true, errors: [] });
  });

  it('keeps @notequest/content package metadata dependency-clean from infrastructure', () => {
    const contentPackage = JSON.parse(
      readFileSync(join(process.cwd(), 'packages/content/package.json'), 'utf8'),
    ) as { readonly dependencies?: Record<string, string> };
    const contentIndex = readFileSync(join(process.cwd(), 'packages/content/src/index.ts'), 'utf8');
    const contentIntegrity = readFileSync(
      join(process.cwd(), 'packages/content/src/palace-manifest-integrity.ts'),
      'utf8',
    );

    expect(contentPackage.dependencies?.['@notequest/infrastructure']).toBeUndefined();
    expect(contentIndex).not.toContain('@notequest/infrastructure');
    expect(contentIntegrity).not.toContain('@notequest/infrastructure');
  });
});
