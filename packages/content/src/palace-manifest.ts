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

export const palaceContentSourceCategories = [
  'notequest_permissioned_mechanics',
  'notequest_permissioned_tables',
  'notequest_permissioned_names',
  'notequest_source_prose_exact',
  'notequest_source_visual',
  'project_original',
  'project_placeholder',
  'user_authored',
  'third_party_open',
  'third_party_licensed',
  'unknown',
  'restricted',
] as const;

export type PalaceContentSourceCategory = (typeof palaceContentSourceCategories)[number];

export const palacePermittedReleaseModes = [
  'internal-prototype',
  'closed-palace-playtest',
  'public-free-core-mvp',
  'future-commercial',
] as const;

export type PalacePermittedReleaseMode = (typeof palacePermittedReleaseModes)[number];

export const palaceSourceReferenceKinds = [
  'rulebook-section',
  'rulebook-table',
  'decision-register',
  'project-original-placeholder',
  'derived-mechanic',
  'controlled-evidence-record',
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

export const palaceManifestContentTypes = [
  'definition',
  'table',
  'row',
  'prose',
  'visual',
  'font',
  'icon',
  'dependency',
  'notice',
  'fixture',
  'documentation-asset',
] as const;

export type PalaceManifestContentType = (typeof palaceManifestContentTypes)[number];

export const palaceCompatibilityPolicies = [
  'saved-history-pins-content-version',
  'compatible-within-package-version',
  'superseded-by-explicit-migration',
  'not-applicable-placeholder',
  'pending-content-hash-story',
] as const;

export type PalaceCompatibilityPolicy = (typeof palaceCompatibilityPolicies)[number];

export const palaceContentHashStatuses = ['pending', 'not-applicable', 'recorded'] as const;

export type PalaceContentHashStatus = (typeof palaceContentHashStatuses)[number];

export type PalaceContentId = `palace.${string}`;
export type PalaceContentVersion = `${number}.${number}.${number}`;
export type PalaceNoticeLocation =
  | 'about-credits'
  | 'notice-file'
  | 'content-manifest'
  | 'release-listing'
  | 'export-package'
  | 'release-evidence-package';

export interface PalaceSourceReference {
  readonly kind: PalaceSourceReferenceKind;
  readonly sourceId: string;
  readonly citationLabel: string;
  readonly locator?: string;
  readonly sourceVersion?: string;
  readonly notes?: string;
}

export interface PalaceContentHashReference {
  readonly status: PalaceContentHashStatus;
  readonly algorithm: 'SHA-256' | 'not-applicable' | 'pending';
  readonly canonicalization: 'RFC-8785' | 'file-bytes' | 'not-applicable' | 'pending';
  readonly value: `sha256:${string}` | null;
  readonly deferredTo?: string;
}

export interface PalaceProvenance {
  readonly origin: 'approved-source' | 'project-original' | 'derived' | 'unknown';
  readonly sourceCategory: PalaceContentSourceCategory;
  readonly sourceName: string;
  readonly sourceLocation: string | null;
  readonly sourceEditionVersion: string;
  readonly sourceReferences: readonly PalaceSourceReference[];
  readonly authorRightsHolder: string;
  readonly permissionLicenseId: string;
  readonly rightsBasis: string;
  readonly evidenceReference: {
    readonly publicId: string;
    readonly location: string | null;
    readonly confidentiality: 'public-safe-reference' | 'private-controlled-record';
  };
  readonly permittedReleaseModes: readonly PalacePermittedReleaseMode[];
  readonly restrictions: readonly string[];
  readonly attributionRequired: boolean;
  readonly attributionNoticeId: string | null;
  readonly noticeLocations: readonly PalaceNoticeLocation[];
  readonly modifications: readonly string[];
  readonly compatibilityPolicy: PalaceCompatibilityPolicy;
  readonly contentHash: PalaceContentHashReference;
  readonly supersedes: readonly PalaceContentId[];
  readonly confidentialRightsEvidence: 'excluded-from-public-manifest';
  readonly containsExactSourceProse: false;
  readonly containsSourceArtwork: false;
  readonly containsTradeDress: false;
}

export interface PalaceReviewState {
  readonly approvalState: PalaceContentApprovalState;
  readonly reviewerRole?: 'content' | 'rights' | 'rules' | 'qa' | 'product';
  readonly reviewerReference?: string;
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
  readonly contentType: PalaceManifestContentType;
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
] as const;

export const palaceProvenanceFieldNames = [
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
] as const;

export function isPalaceContentApprovalState(value: string): value is PalaceContentApprovalState {
  return palaceContentApprovalStates.includes(value as PalaceContentApprovalState);
}

export function isPalacePublicReleaseEligibleReview(review: PalaceReviewState): boolean {
  return review.approvalState === 'selected' && review.publicReleaseEligible;
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
      contentType: 'fixture',
      kind: 'table',
      version: '0.1.0',
      label: 'Project-original placeholder Palace table',
      tags: ['palace', 'placeholder', 'rights-safe'],
      structuredDefinition: {
        purpose: 'Reserved manifest shape for later authorised Palace table rows.',
      },
      provenance: {
        origin: 'project-original',
        sourceCategory: 'project_placeholder',
        sourceName: 'NoteQuest Web Application project-original placeholder metadata',
        sourceLocation: 'packages/content/src/palace-manifest.ts',
        sourceEditionVersion: '0.1.0',
        sourceReferences: [
          {
            kind: 'project-original-placeholder',
            sourceId: 'story-m3-001',
            citationLabel: 'Issue #58 placeholder example',
          },
        ],
        authorRightsHolder: 'NoteQuest Web Application project',
        permissionLicenseId: 'PROJECT-ORIGINAL-PLACEHOLDER',
        rightsBasis:
          'Project-authored placeholder metadata only; no official source prose or rows.',
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
        attributionRequired: false,
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
      review: {
        approvalState: 'draft',
        decisionReference: 'STORY-M3-001',
        publicReleaseEligible: false,
      },
    },
  ],
} as const satisfies PalaceContentManifest;
