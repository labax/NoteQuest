import { describe, expect, it } from 'vitest';

import type { PalaceContentManifest, PalaceManifestEntry } from './palace-manifest.ts';

import {
  isPalaceContentApprovalState,
  isPalacePublicReleaseEligibleReview,
  palaceContentApprovalStates,
  palaceManifestSchemaFieldNames,
  palacePlaceholderManifest,
  palaceProvenanceFieldNames,
  validatePalaceContentManifest,
} from './palace-manifest.ts';
import { palaceManifestExpectedHashFixtures } from './palace-manifest-integrity-fixtures.ts';
import {
  hashPalaceManifestEntry,
  validatePalaceManifestIntegrity,
} from './palace-manifest-integrity.ts';

const selectedReview = {
  approvalState: 'selected',
  publicReleaseEligible: true,
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
      sourceLocation: 'packages/content/src/palace-manifest.test.ts',
      sourceEditionVersion: '0.1.0',
      sourceReferences: [
        {
          kind: 'project-original-placeholder' as const,
          sourceId: 'story-m3-002',
          citationLabel: 'Issue #59 rights-safe test fixture',
        },
      ],
      authorRightsHolder: 'NoteQuest Web Application project',
      permissionLicenseId: 'PROJECT-ORIGINAL-TEST-FIXTURE',
      rightsBasis: 'Project-authored validation fixture only.',
      evidenceReference: {
        publicId: 'STORY-M3-002',
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

function makeValidPalaceManifest(): PalaceContentManifest {
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

  return {
    schemaVersion: 'palace-content-manifest.schema.v0.1',
    packageId: 'palace',
    contentVersion: '0.1.0',
    rulesVersion: 'digital-rules-specification-v0.1',
    generatedAt: '2026-07-19T00:00:00.000Z',
    entries: [table, mechanic, ...rows],
  };
}

function makeManifestWithRecordedHashes(): PalaceContentManifest {
  const manifest = makeValidPalaceManifest();
  const hashesByContentId: ReadonlyMap<
    string,
    (typeof palaceManifestExpectedHashFixtures)[number]
  > = new Map(palaceManifestExpectedHashFixtures.map((fixture) => [fixture.contentId, fixture]));

  return {
    ...manifest,
    entries: manifest.entries.map((entry) => {
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

describe('Palace content manifest schema', () => {
  it('defines all required approval states for content review gates', () => {
    expect(palaceContentApprovalStates).toEqual([
      'selected',
      'draft',
      'blocked',
      'unknown',
      'review-pending',
    ]);
    expect(isPalaceContentApprovalState('blocked')).toBe(true);
    expect(isPalaceContentApprovalState('approved')).toBe(false);
  });

  it('exposes required manifest fields for deterministic content validation', () => {
    expect(palaceManifestSchemaFieldNames).toEqual([
      'id',
      'contentType',
      'kind',
      'version',
      'label',
      'parentId',
      'range',
      'references',
      'tags',
      'structuredDefinition',
      'provenance',
      'review',
    ]);
  });

  it('exposes Section 12 provenance fields as explicit public-safe metadata', () => {
    expect(palaceProvenanceFieldNames).toEqual([
      'origin',
      'sourceCategory',
      'sourceName',
      'sourceLocation',
      'sourceEditionVersion',
      'sourceReferences',
      'authorRightsHolder',
      'permissionLicenseId',
      'rightsBasis',
      'evidenceReference',
      'permittedReleaseModes',
      'restrictions',
      'attributionRequired',
      'attributionNoticeId',
      'noticeLocations',
      'modifications',
      'compatibilityPolicy',
      'contentHash',
      'supersedes',
      'confidentialRightsEvidence',
      'containsExactSourceProse',
      'containsSourceArtwork',
      'containsTradeDress',
    ]);
  });

  it('keeps placeholder manifest metadata public and rights-safe', () => {
    expect(palacePlaceholderManifest).toMatchObject({
      schemaVersion: 'palace-content-manifest.schema.v0.1',
      packageId: 'palace',
      contentVersion: '0.1.0',
      entries: [
        {
          id: 'palace.placeholder.room-table',
          contentType: 'fixture' as const,
          version: '0.1.0' as const,
          review: { approvalState: 'draft', publicReleaseEligible: false },
          provenance: {
            sourceCategory: 'project_placeholder',
            sourceName: 'NoteQuest Web Application project-original placeholder metadata',
            sourceLocation: 'packages/content/src/palace-manifest.ts',
            sourceEditionVersion: '0.1.0',
            authorRightsHolder: 'NoteQuest Web Application project',
            permissionLicenseId: 'PROJECT-ORIGINAL-PLACEHOLDER',
            evidenceReference: {
              publicId: 'STORY-M3-001',
              location: null,
              confidentiality: 'public-safe-reference' as const,
            },
            permittedReleaseModes: ['internal-prototype'],
            restrictions: [
              'not-public-release-eligible',
              'replace-or-review-before-release',
              'contains-no-official-source-expression',
            ],
            attributionNoticeId: null,
            noticeLocations: [],
            modifications: ['project-original placeholder shape for future content manifests'],
            compatibilityPolicy: 'not-applicable-placeholder',
            contentHash: {
              status: 'pending',
              algorithm: 'pending',
              canonicalization: 'pending',
              value: null,
              deferredTo: 'STORY-M3-003 / issue #60',
            },
            supersedes: [],
            confidentialRightsEvidence: 'excluded-from-public-manifest' as const,
            containsExactSourceProse: false,
            containsSourceArtwork: false,
            containsTradeDress: false,
          },
        },
      ],
    });
  });

  it('does not treat blocked, unknown, draft, or review-pending entries as release eligible', () => {
    for (const approvalState of ['blocked', 'unknown', 'draft', 'review-pending'] as const) {
      expect(
        isPalacePublicReleaseEligibleReview({ approvalState, publicReleaseEligible: true }),
      ).toBe(false);
    }

    expect(
      isPalacePublicReleaseEligibleReview({
        approvalState: 'selected',
        publicReleaseEligible: true,
      }),
    ).toBe(true);
  });

  it('passes deterministic rights-safe Palace table fixtures', () => {
    expect(validatePalaceContentManifest(makeValidPalaceManifest())).toEqual({
      valid: true,
      errors: [],
    });
  });

  it('fails invalid Palace range coverage with content ID and field details', () => {
    const manifest = makeValidPalaceManifest();
    const invalid = {
      ...manifest,
      entries: manifest.entries.map((entry) =>
        entry.id === 'palace.fixture.room-table.row-6'
          ? {
              ...entry,
              range: { dice: '1d6' as const, rangeId: entry.range!.rangeId, from: 7, to: 7 },
            }
          : entry,
      ),
    };

    expect(validatePalaceContentManifest(invalid).errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          contentId: 'palace.fixture.room-table.row-6',
          field: 'range',
          reason: '1d6 ranges must stay within 1-6',
        }),
        expect.objectContaining({
          contentId: 'palace.fixture.room-table',
          field: 'entries',
          reason: 'table is missing 1d6 result 6',
        }),
      ]),
    );
  });

  it('fails missing content references and missing provenance', () => {
    const manifest = makeValidPalaceManifest();
    const invalid = {
      ...manifest,
      entries: manifest.entries.map((entry) =>
        entry.id === 'palace.fixture.mechanic'
          ? {
              ...entry,
              references: ['palace.fixture.missing' as const],
              provenance: { ...entry.provenance, sourceReferences: [], sourceName: '' },
            }
          : entry,
      ),
    };

    expect(validatePalaceContentManifest(invalid).errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ contentId: 'palace.fixture.mechanic', field: 'references' }),
        expect.objectContaining({
          contentId: 'palace.fixture.mechanic',
          field: 'provenance.sourceReferences',
        }),
        expect.objectContaining({
          contentId: 'palace.fixture.mechanic',
          field: 'provenance.sourceName',
        }),
      ]),
    );
  });

  it('fails blocked or unapproved selected content independently of UI rendering', () => {
    const manifest = makeValidPalaceManifest();
    const invalid = {
      ...manifest,
      entries: manifest.entries.map((entry) =>
        entry.id === 'palace.fixture.mechanic'
          ? {
              ...entry,
              provenance: { ...entry.provenance, sourceCategory: 'restricted' as const },
              review: { approvalState: 'blocked' as const, publicReleaseEligible: false },
            }
          : entry,
      ),
    };

    expect(validatePalaceContentManifest(invalid).errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          contentId: 'palace.fixture.mechanic',
          field: 'provenance.sourceCategory',
        }),
        expect.objectContaining({
          contentId: 'palace.fixture.mechanic',
          field: 'review.approvalState',
        }),
        expect.objectContaining({
          contentId: 'palace.fixture.mechanic',
          field: 'review.publicReleaseEligible',
        }),
      ]),
    );
  });

  it('fails selected public-release content with incomplete release provenance metadata', () => {
    const manifest = makeValidPalaceManifest();
    const invalid = {
      ...manifest,
      entries: manifest.entries.map((entry) =>
        entry.id === 'palace.fixture.mechanic'
          ? {
              ...entry,
              provenance: {
                ...entry.provenance,
                sourceLocation: null,
                sourceReferences: [
                  {
                    kind: 'project-original-placeholder' as const,
                    sourceId: '',
                    citationLabel: '',
                  },
                ],
                evidenceReference: {
                  ...entry.provenance.evidenceReference,
                  publicId: '',
                  confidentiality: 'private-controlled-record' as const,
                },
                permittedReleaseModes: [],
                restrictions: [],
                attributionRequired: true,
                attributionNoticeId: null,
                noticeLocations: [],
                compatibilityPolicy: 'pending-content-hash-story' as const,
                contentHash: {
                  status: 'pending' as const,
                  algorithm: 'pending' as const,
                  canonicalization: 'pending' as const,
                  value: null,
                },
              },
            }
          : entry,
      ),
    };

    expect(validatePalaceContentManifest(invalid).errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          contentId: 'palace.fixture.mechanic',
          field: 'provenance.sourceLocation',
        }),
        expect.objectContaining({
          contentId: 'palace.fixture.mechanic',
          field: 'provenance.sourceReferences[0].sourceId',
        }),
        expect.objectContaining({
          contentId: 'palace.fixture.mechanic',
          field: 'provenance.sourceReferences[0].citationLabel',
        }),
        expect.objectContaining({
          contentId: 'palace.fixture.mechanic',
          field: 'provenance.evidenceReference.publicId',
        }),
        expect.objectContaining({
          contentId: 'palace.fixture.mechanic',
          field: 'provenance.evidenceReference.confidentiality',
        }),
        expect.objectContaining({
          contentId: 'palace.fixture.mechanic',
          field: 'provenance.permittedReleaseModes',
        }),
        expect.objectContaining({
          contentId: 'palace.fixture.mechanic',
          field: 'provenance.restrictions',
        }),
        expect.objectContaining({
          contentId: 'palace.fixture.mechanic',
          field: 'provenance.attributionNoticeId',
        }),
        expect.objectContaining({
          contentId: 'palace.fixture.mechanic',
          field: 'provenance.noticeLocations',
        }),
        expect.objectContaining({
          contentId: 'palace.fixture.mechanic',
          field: 'provenance.compatibilityPolicy',
        }),
        expect.objectContaining({
          contentId: 'palace.fixture.mechanic',
          field: 'provenance.contentHash',
        }),
      ]),
    );
  });

  it('fails Palace table topology errors for empty dice tables and orphan rows', () => {
    const emptyTableManifest = {
      ...makeValidPalaceManifest(),
      entries: [
        makeValidEntry('palace.fixture.empty-table', {
          kind: 'table',
          parentId: undefined,
          range: undefined,
          structuredDefinition: { dice: '1d6', purpose: 'project-original empty table fixture' },
        }),
      ],
    };

    expect(validatePalaceContentManifest(emptyTableManifest).errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          contentId: 'palace.fixture.empty-table',
          field: 'entries',
          reason: 'dice table 1d6 must include table-row entries',
        }),
      ]),
    );

    const orphanRowManifest = {
      ...makeValidPalaceManifest(),
      entries: makeValidPalaceManifest().entries.map((entry) =>
        entry.id === 'palace.fixture.room-table.row-1'
          ? ({ ...entry, parentId: undefined } as unknown as PalaceManifestEntry)
          : entry,
      ),
    };

    expect(validatePalaceContentManifest(orphanRowManifest).errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          contentId: 'palace.fixture.room-table.row-1',
          field: 'parentId',
          reason: 'table-row entries must reference a parent table',
        }),
      ]),
    );
  });

  it('fails Palace table-row parents that do not point to tables', () => {
    const manifest = makeValidPalaceManifest();
    const invalid = {
      ...manifest,
      entries: manifest.entries.map((entry) =>
        entry.id === 'palace.fixture.room-table.row-1'
          ? { ...entry, parentId: 'palace.fixture.mechanic' as const }
          : entry,
      ),
    };

    expect(validatePalaceContentManifest(invalid).errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          contentId: 'palace.fixture.room-table.row-1',
          field: 'parentId',
          reason: 'table-row parent palace.fixture.mechanic must be a table',
        }),
      ]),
    );
  });

  it('records reproducible SHA-256 hashes for selected Palace manifest fixtures', async () => {
    const manifest = makeManifestWithRecordedHashes();

    for (const fixture of palaceManifestExpectedHashFixtures) {
      const entry = manifest.entries.find((candidate) => candidate.id === fixture.contentId);
      expect(entry).toBeDefined();
      if (entry === undefined) {
        throw new Error(`missing Palace manifest hash fixture ${fixture.contentId}`);
      }

      const evidence = await hashPalaceManifestEntry(entry);

      expect(evidence).toMatchObject({
        contentId: fixture.contentId,
        algorithm: 'SHA-256',
        canonicalization: 'RFC-8785',
        hashInputKind: 'palace-manifest-entry-integrity-payload.v0.1',
        checksum: fixture.checksum,
      });
    }
  });

  it('passes the Palace manifest integrity check when recorded hashes match', async () => {
    await expect(
      validatePalaceManifestIntegrity(makeManifestWithRecordedHashes()),
    ).resolves.toEqual({
      valid: true,
      evidence: expect.arrayContaining(
        palaceManifestExpectedHashFixtures.map((fixture) =>
          expect.objectContaining({ contentId: fixture.contentId, checksum: fixture.checksum }),
        ),
      ),
      errors: [],
    });
  });

  it('fails the Palace manifest integrity check when selected content changes without a hash update', async () => {
    const manifest = makeManifestWithRecordedHashes();
    const invalid = {
      ...manifest,
      entries: manifest.entries.map((entry) =>
        entry.id === 'palace.fixture.mechanic'
          ? {
              ...entry,
              structuredDefinition: { rule: 'project-original changed fixture mechanic' },
            }
          : entry,
      ),
    };

    const result = await validatePalaceManifestIntegrity(invalid);

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          contentId: 'palace.fixture.mechanic',
          field: 'provenance.contentHash.value',
        }),
      ]),
    );
  });
});
