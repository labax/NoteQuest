import { describe, expect, it } from 'vitest';

import {
  isPalaceContentApprovalState,
  isPalacePublicReleaseEligibleReview,
  palaceContentApprovalStates,
  palaceManifestSchemaFieldNames,
  palacePlaceholderManifest,
  palaceProvenanceFieldNames,
} from './palace-manifest.ts';

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
          contentType: 'fixture',
          version: '0.1.0',
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
              confidentiality: 'public-safe-reference',
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
            confidentialRightsEvidence: 'excluded-from-public-manifest',
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
});
