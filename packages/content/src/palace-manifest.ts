export const palaceContentManifestSchemaVersion = 'palace-content-manifest.schema.v0.1' as const;

export const palaceContentPackageId = 'palace' as const;

export const palaceContentApprovalStates = [
  'selected',
  'draft',
  'blocked',
  'unknown',
  'review-pending',
] as const;

export type PalaceContentApprovalState = (typeof palaceContentApprovalStates)[number];

export const palaceSourceReferenceKinds = [
  'rulebook-section',
  'rulebook-table',
  'decision-register',
  'project-original-placeholder',
  'derived-mechanic',
] as const;

export type PalaceSourceReferenceKind = (typeof palaceSourceReferenceKinds)[number];

export const palaceManifestEntryKinds = [
  'table',
  'table-row',
  'range',
  'mechanic-reference',
  'placeholder',
] as const;

export type PalaceManifestEntryKind = (typeof palaceManifestEntryKinds)[number];

export type PalaceContentId = `palace.${string}`;
export type PalaceContentVersion = `${number}.${number}.${number}`;

export interface PalaceSourceReference {
  readonly kind: PalaceSourceReferenceKind;
  readonly sourceId: string;
  readonly citationLabel: string;
  readonly locator?: string;
  readonly sourceVersion?: string;
  readonly notes?: string;
}

export interface PalaceProvenance {
  readonly origin: 'approved-source' | 'project-original' | 'derived' | 'unknown';
  readonly rightsBasis: string;
  readonly permissionReference: string;
  readonly attributionRequired: boolean;
  readonly confidentialRightsEvidence: 'excluded-from-public-manifest';
  readonly sourceReferences: readonly PalaceSourceReference[];
  readonly containsExactSourceProse: false;
  readonly containsSourceArtwork: false;
  readonly containsTradeDress: false;
}

export interface PalaceReviewState {
  readonly approvalState: PalaceContentApprovalState;
  readonly reviewerRole?: 'content' | 'rights' | 'rules' | 'qa' | 'product';
  readonly reviewedAt?: string;
  readonly decisionReference?: string;
  readonly blockedReason?: string;
  readonly publicReleaseEligible: boolean;
}

export interface PalaceRangeReference {
  readonly dice: '1d6' | '2d6' | 'fixed' | 'other';
  readonly rangeId: string;
  readonly from: number;
  readonly to: number;
}

export interface PalaceManifestEntry {
  readonly id: PalaceContentId;
  readonly kind: PalaceManifestEntryKind;
  readonly version: PalaceContentVersion;
  readonly label: string;
  readonly parentId?: PalaceContentId;
  readonly range?: PalaceRangeReference;
  readonly references?: readonly PalaceContentId[];
  readonly tags: readonly string[];
  readonly structuredDefinition: Record<string, unknown>;
  readonly provenance: PalaceProvenance;
  readonly review: PalaceReviewState;
}

export interface PalaceContentManifest {
  readonly schemaVersion: typeof palaceContentManifestSchemaVersion;
  readonly packageId: typeof palaceContentPackageId;
  readonly contentVersion: PalaceContentVersion;
  readonly rulesVersion: string;
  readonly generatedAt: string;
  readonly entries: readonly PalaceManifestEntry[];
}

export const palaceManifestSchemaFieldNames = [
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
] as const;

export function isPalaceContentApprovalState(value: string): value is PalaceContentApprovalState {
  return palaceContentApprovalStates.includes(value as PalaceContentApprovalState);
}

export const palacePlaceholderManifest = {
  schemaVersion: palaceContentManifestSchemaVersion,
  packageId: palaceContentPackageId,
  contentVersion: '0.1.0',
  rulesVersion: 'digital-rules-specification-v0.1',
  generatedAt: '2026-07-19T00:00:00.000Z',
  entries: [
    {
      id: 'palace.placeholder.room-table',
      kind: 'table',
      version: '0.1.0',
      label: 'Project-original placeholder Palace table',
      tags: ['palace', 'placeholder', 'rights-safe'],
      structuredDefinition: {
        purpose: 'Reserved manifest shape for later authorised Palace table rows.',
      },
      provenance: {
        origin: 'project-original',
        rightsBasis:
          'Project-authored placeholder metadata only; no official source prose or rows.',
        permissionReference: 'content-licensing-requirements-v0.1',
        attributionRequired: false,
        confidentialRightsEvidence: 'excluded-from-public-manifest',
        sourceReferences: [
          {
            kind: 'project-original-placeholder',
            sourceId: 'story-m3-001',
            citationLabel: 'Issue #58 placeholder example',
          },
        ],
        containsExactSourceProse: false,
        containsSourceArtwork: false,
        containsTradeDress: false,
      },
      review: {
        approvalState: 'draft',
        decisionReference: 'STORY-M3-001',
        publicReleaseEligible: false,
      },
    },
  ],
} as const satisfies PalaceContentManifest;
