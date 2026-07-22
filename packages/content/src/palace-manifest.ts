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
  readonly canonicalization: 'RFC-8785' | 'not-applicable' | 'pending';
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

export interface PalaceManifestValidationError {
  readonly contentId: PalaceContentId | 'manifest';
  readonly field: string;
  readonly reason: string;
}

export interface PalaceManifestValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PalaceManifestValidationError[];
}

const palaceRequiredIdentityTextFields = ['id', 'version', 'label'] as const;

const palaceRequiredProvenanceTextFields = [
  'sourceName',
  'sourceEditionVersion',
  'authorRightsHolder',
  'permissionLicenseId',
  'rightsBasis',
] as const;

const palaceBlockedApprovalStates = ['blocked', 'unknown', 'draft', 'review-pending'] as const;

const palaceReleaseCompatiblePolicies = [
  'saved-history-pins-content-version',
  'compatible-within-package-version',
  'superseded-by-explicit-migration',
] as const;

function addPalaceValidationError(
  errors: PalaceManifestValidationError[],
  contentId: PalaceContentId | 'manifest',
  field: string,
  reason: string,
): void {
  errors.push({ contentId, field, reason });
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isSelectedPublicReleaseEntry(entry: PalaceManifestEntry): boolean {
  return entry.review.approvalState === 'selected' && entry.review.publicReleaseEligible;
}

function getPalaceTableDiceStructure(
  entry: PalaceManifestEntry,
): '1d6' | '2d6' | 'unsupported' | null {
  const dice = entry.structuredDefinition['dice'];
  if (dice === '1d6' || dice === '2d6') {
    return dice;
  }

  if (typeof dice === 'string') {
    return 'unsupported';
  }

  return null;
}

function validatePalaceIdentity(
  entry: PalaceManifestEntry,
  errors: PalaceManifestValidationError[],
): void {
  for (const field of palaceRequiredIdentityTextFields) {
    if (!isNonEmptyString(entry[field])) {
      addPalaceValidationError(errors, entry.id, field, 'required identity field is missing');
    }
  }

  if (!entry.id.startsWith('palace.')) {
    addPalaceValidationError(
      errors,
      entry.id,
      'id',
      'Palace content IDs must use the palace. prefix',
    );
  }

  if (!/^\d+\.\d+\.\d+$/.test(entry.version)) {
    addPalaceValidationError(errors, entry.id, 'version', 'version must be a semantic version');
  }

  if (entry.tags.length === 0) {
    addPalaceValidationError(errors, entry.id, 'tags', 'at least one tag is required');
  }
}

function validatePalaceContentHash(
  entry: PalaceManifestEntry,
  errors: PalaceManifestValidationError[],
): void {
  const { contentHash } = entry.provenance;

  if (contentHash.status === 'pending') {
    if (
      contentHash.algorithm !== 'pending' ||
      contentHash.canonicalization !== 'pending' ||
      contentHash.value !== null ||
      !isNonEmptyString(contentHash.deferredTo)
    ) {
      addPalaceValidationError(
        errors,
        entry.id,
        'provenance.contentHash',
        'pending content hash metadata must use pending algorithm/canonicalization, null value, and a deferredTo reference',
      );
    }
    return;
  }

  if (contentHash.status === 'not-applicable') {
    if (
      contentHash.algorithm !== 'not-applicable' ||
      contentHash.canonicalization !== 'not-applicable' ||
      contentHash.value !== null
    ) {
      addPalaceValidationError(
        errors,
        entry.id,
        'provenance.contentHash',
        'not-applicable content hash metadata must use not-applicable algorithm/canonicalization and null value',
      );
    }
    return;
  }

  if (
    contentHash.algorithm !== 'SHA-256' ||
    contentHash.canonicalization !== 'RFC-8785' ||
    contentHash.value === null ||
    !/^sha256:[a-f0-9]{64}$/.test(contentHash.value)
  ) {
    addPalaceValidationError(
      errors,
      entry.id,
      'provenance.contentHash',
      'recorded content hash metadata must include SHA-256 algorithm, RFC-8785 canonicalization, and sha256:<64 lowercase hex> value',
    );
  }
}

function validatePalaceRange(
  entry: PalaceManifestEntry,
  errors: PalaceManifestValidationError[],
): void {
  if (entry.kind === 'table-row' && entry.range === undefined) {
    addPalaceValidationError(
      errors,
      entry.id,
      'range',
      'table-row entries must define a dice/result range',
    );
    return;
  }

  if (entry.range === undefined) {
    return;
  }

  const { dice, from, to, rangeId } = entry.range;
  if (!isNonEmptyString(rangeId)) {
    addPalaceValidationError(errors, entry.id, 'range.rangeId', 'rangeId is required');
  }

  if (!Number.isInteger(from) || !Number.isInteger(to) || from > to) {
    addPalaceValidationError(
      errors,
      entry.id,
      'range',
      'range must use integer bounds with from <= to',
    );
    return;
  }

  if (dice === '1d6' && (from < 1 || to > 6)) {
    addPalaceValidationError(errors, entry.id, 'range', '1d6 ranges must stay within 1-6');
  }

  if (dice === '2d6' && (from < 2 || to > 12)) {
    addPalaceValidationError(errors, entry.id, 'range', '2d6 ranges must stay within 2-12');
  }

  if (dice === 'fixed' && from !== to) {
    addPalaceValidationError(
      errors,
      entry.id,
      'range',
      'fixed ranges must have matching from and to values',
    );
  }

  if (dice === 'other') {
    addPalaceValidationError(
      errors,
      entry.id,
      'range.dice',
      'unsupported Palace dice/result structure',
    );
  }
}

function validatePalaceProvenance(
  entry: PalaceManifestEntry,
  errors: PalaceManifestValidationError[],
): void {
  for (const field of palaceRequiredProvenanceTextFields) {
    if (!isNonEmptyString(entry.provenance[field])) {
      addPalaceValidationError(
        errors,
        entry.id,
        `provenance.${field}`,
        'required provenance field is missing',
      );
    }
  }

  if (isSelectedPublicReleaseEntry(entry) && !isNonEmptyString(entry.provenance.sourceLocation)) {
    addPalaceValidationError(
      errors,
      entry.id,
      'provenance.sourceLocation',
      'selected public-release content must include a source location or project file reference',
    );
  }

  if (entry.provenance.sourceReferences.length === 0) {
    addPalaceValidationError(
      errors,
      entry.id,
      'provenance.sourceReferences',
      'at least one source reference is required',
    );
  }

  for (const [index, sourceReference] of entry.provenance.sourceReferences.entries()) {
    if (!isNonEmptyString(sourceReference.kind)) {
      addPalaceValidationError(
        errors,
        entry.id,
        `provenance.sourceReferences[${index}].kind`,
        'source reference kind is required',
      );
    }

    if (!isNonEmptyString(sourceReference.sourceId)) {
      addPalaceValidationError(
        errors,
        entry.id,
        `provenance.sourceReferences[${index}].sourceId`,
        'source reference sourceId is required',
      );
    }

    if (!isNonEmptyString(sourceReference.citationLabel)) {
      addPalaceValidationError(
        errors,
        entry.id,
        `provenance.sourceReferences[${index}].citationLabel`,
        'source reference citationLabel is required',
      );
    }
  }

  if (!isNonEmptyString(entry.provenance.evidenceReference.publicId)) {
    addPalaceValidationError(
      errors,
      entry.id,
      'provenance.evidenceReference.publicId',
      'evidence publicId is required',
    );
  }

  if (entry.provenance.evidenceReference.confidentiality !== 'public-safe-reference') {
    addPalaceValidationError(
      errors,
      entry.id,
      'provenance.evidenceReference.confidentiality',
      'public manifests must reference public-safe evidence only',
    );
  }

  if (entry.provenance.permittedReleaseModes.length === 0) {
    addPalaceValidationError(
      errors,
      entry.id,
      'provenance.permittedReleaseModes',
      'at least one permitted release mode is required',
    );
  }

  if (
    isSelectedPublicReleaseEntry(entry) &&
    !entry.provenance.permittedReleaseModes.includes('public-free-core-mvp')
  ) {
    addPalaceValidationError(
      errors,
      entry.id,
      'provenance.permittedReleaseModes',
      'selected public-release content must permit public-free-core-mvp release',
    );
  }

  if (entry.provenance.restrictions.length === 0) {
    addPalaceValidationError(
      errors,
      entry.id,
      'provenance.restrictions',
      'restrictions must be explicitly recorded, even when only rights-safe fixture restrictions apply',
    );
  }

  if (entry.provenance.attributionRequired) {
    if (!isNonEmptyString(entry.provenance.attributionNoticeId)) {
      addPalaceValidationError(
        errors,
        entry.id,
        'provenance.attributionNoticeId',
        'attributionRequired content must name an attribution notice ID',
      );
    }

    if (entry.provenance.noticeLocations.length === 0) {
      addPalaceValidationError(
        errors,
        entry.id,
        'provenance.noticeLocations',
        'attributionRequired content must include at least one notice location',
      );
    }
  }

  if (
    isSelectedPublicReleaseEntry(entry) &&
    !palaceReleaseCompatiblePolicies.includes(
      entry.provenance.compatibilityPolicy as (typeof palaceReleaseCompatiblePolicies)[number],
    )
  ) {
    addPalaceValidationError(
      errors,
      entry.id,
      'provenance.compatibilityPolicy',
      'selected public-release content must use a release-compatible saved-definition policy; hashes must remain reproducible for release evidence',
    );
  }

  validatePalaceContentHash(entry, errors);

  if (
    entry.provenance.sourceCategory === 'unknown' ||
    entry.provenance.sourceCategory === 'restricted'
  ) {
    addPalaceValidationError(
      errors,
      entry.id,
      'provenance.sourceCategory',
      'unknown or restricted content is blocked',
    );
  }

  if (
    entry.provenance.containsExactSourceProse ||
    entry.provenance.containsSourceArtwork ||
    entry.provenance.containsTradeDress
  ) {
    addPalaceValidationError(
      errors,
      entry.id,
      'provenance.contentSafety',
      'source prose, artwork, and trade dress must not be bundled',
    );
  }
}

function validatePalaceReview(
  entry: PalaceManifestEntry,
  errors: PalaceManifestValidationError[],
): void {
  if (
    palaceBlockedApprovalStates.includes(
      entry.review.approvalState as (typeof palaceBlockedApprovalStates)[number],
    )
  ) {
    addPalaceValidationError(
      errors,
      entry.id,
      'review.approvalState',
      'selected content cannot be blocked, unknown, draft, or review-pending',
    );
  }

  if (!entry.review.publicReleaseEligible) {
    addPalaceValidationError(
      errors,
      entry.id,
      'review.publicReleaseEligible',
      'selected content must be public release eligible',
    );
  }
}

function validatePalaceTableCoverage(
  table: PalaceManifestEntry,
  rows: readonly PalaceManifestEntry[],
  errors: PalaceManifestValidationError[],
): void {
  const dice = getPalaceTableDiceStructure(table);

  if (dice === 'unsupported') {
    addPalaceValidationError(
      errors,
      table.id,
      'structuredDefinition.dice',
      'unsupported Palace dice table structure',
    );
    return;
  }

  if (dice === null) {
    return;
  }

  if (rows.length === 0) {
    addPalaceValidationError(
      errors,
      table.id,
      'entries',
      `dice table ${dice} must include table-row entries`,
    );
    return;
  }

  const min = dice === '1d6' ? 1 : 2;
  const max = dice === '1d6' ? 6 : 12;
  const covered = new Map<number, PalaceContentId>();

  for (const row of rows) {
    if (row.range?.dice !== dice) {
      addPalaceValidationError(
        errors,
        row.id,
        'range.dice',
        `row dice must match parent ${dice} table structure`,
      );
      continue;
    }

    for (let value = row.range.from; value <= row.range.to; value += 1) {
      const prior = covered.get(value);
      if (prior !== undefined) {
        addPalaceValidationError(
          errors,
          row.id,
          'range',
          `range overlaps ${prior} at result ${value}`,
        );
      }
      covered.set(value, row.id);
    }
  }

  for (let value = min; value <= max; value += 1) {
    if (!covered.has(value)) {
      addPalaceValidationError(
        errors,
        table.id,
        'entries',
        `table is missing ${dice} result ${value}`,
      );
    }
  }
}

export function validatePalaceContentManifest(
  manifest: PalaceContentManifest,
): PalaceManifestValidationResult {
  const errors: PalaceManifestValidationError[] = [];
  const entriesById = new Map<PalaceContentId, PalaceManifestEntry>();

  for (const entry of manifest.entries) {
    if (entriesById.has(entry.id)) {
      addPalaceValidationError(errors, entry.id, 'id', 'duplicate content ID');
    }
    entriesById.set(entry.id, entry);
  }

  for (const entry of manifest.entries) {
    validatePalaceIdentity(entry, errors);
    validatePalaceRange(entry, errors);
    validatePalaceProvenance(entry, errors);
    validatePalaceReview(entry, errors);

    if (entry.kind === 'table-row' && entry.parentId === undefined) {
      addPalaceValidationError(
        errors,
        entry.id,
        'parentId',
        'table-row entries must reference a parent table',
      );
    }

    if (entry.parentId !== undefined) {
      const parent = entriesById.get(entry.parentId);
      if (parent === undefined) {
        addPalaceValidationError(
          errors,
          entry.id,
          'parentId',
          `missing referenced parent ${entry.parentId}`,
        );
      } else if (entry.kind === 'table-row' && parent.kind !== 'table') {
        addPalaceValidationError(
          errors,
          entry.id,
          'parentId',
          `table-row parent ${entry.parentId} must be a table`,
        );
      }
    }

    for (const referenceId of entry.references ?? []) {
      if (!entriesById.has(referenceId)) {
        addPalaceValidationError(
          errors,
          entry.id,
          'references',
          `missing referenced content ${referenceId}`,
        );
      }
    }

    for (const supersededId of entry.provenance.supersedes) {
      if (!entriesById.has(supersededId)) {
        addPalaceValidationError(
          errors,
          entry.id,
          'provenance.supersedes',
          `missing superseded content ${supersededId}`,
        );
      }
    }
  }

  for (const table of manifest.entries.filter((entry) => entry.kind === 'table')) {
    validatePalaceTableCoverage(
      table,
      manifest.entries.filter((entry) => entry.parentId === table.id && entry.kind === 'table-row'),
      errors,
    );
  }

  return { valid: errors.length === 0, errors };
}
