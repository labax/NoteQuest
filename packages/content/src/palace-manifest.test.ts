import { describe, expect, it } from 'vitest';

import {
  isPalaceContentApprovalState,
  palaceContentApprovalStates,
  palaceManifestSchemaFieldNames,
  palacePlaceholderManifest,
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

  it('keeps placeholder manifest metadata public and rights-safe', () => {
    expect(palacePlaceholderManifest).toMatchObject({
      schemaVersion: 'palace-content-manifest.schema.v0.1',
      packageId: 'palace',
      contentVersion: '0.1.0',
      entries: [
        {
          id: 'palace.placeholder.room-table',
          version: '0.1.0',
          review: { approvalState: 'draft', publicReleaseEligible: false },
          provenance: {
            confidentialRightsEvidence: 'excluded-from-public-manifest',
            containsExactSourceProse: false,
            containsSourceArtwork: false,
            containsTradeDress: false,
          },
        },
      ],
    });
  });
});
