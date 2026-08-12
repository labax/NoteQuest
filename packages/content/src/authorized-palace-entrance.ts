import type { PalaceContentManifest, PalaceManifestEntry } from './palace-manifest.ts';

export const authorizedPalaceEntranceContentVersion = '1.0.0' as const;
export const authorizedPalaceEntranceRulesVersion = 'digital-rules-specification-v0.1' as const;

export const authorizedPalaceEntranceTemplate = {
  id: 'palace.entrance.project-original.v1',
  floorNumber: 1,
  segmentKind: 'entrance',
  encounterState: 'empty',
  connections: [
    {
      definitionId: 'palace.entrance.connection.north.v1',
      directionLabel: 'North exit',
      connectionState: 'unresolved',
      doorState: 'unknown',
      alertState: 'quiet',
    },
    {
      definitionId: 'palace.entrance.connection.east.v1',
      directionLabel: 'East exit',
      connectionState: 'unresolved',
      doorState: 'unknown',
      alertState: 'quiet',
    },
  ],
} as const;

const entranceEntry: PalaceManifestEntry = {
  id: authorizedPalaceEntranceTemplate.id,
  contentType: 'definition',
  kind: 'mechanic-reference',
  version: authorizedPalaceEntranceContentVersion,
  label: 'Project-original Palace entrance template',
  tags: ['palace', 'entrance', 'project-original', 'rights-safe'],
  references: [],
  structuredDefinition: authorizedPalaceEntranceTemplate,
  provenance: {
    origin: 'project-original',
    sourceCategory: 'project_original',
    sourceName: 'NoteQuest web project Palace entrance template',
    sourceLocation: 'packages/content/src/authorized-palace-entrance.ts',
    sourceEditionVersion: authorizedPalaceEntranceContentVersion,
    sourceReferences: [
      {
        kind: 'decision-register',
        sourceId: 'STORY-M6-002',
        citationLabel: 'Palace vertical-slice implementation decision',
        locator: 'docs/product/digital-rules-specification-v0.1.md#92-topology-model',
        sourceVersion: authorizedPalaceEntranceRulesVersion,
      },
    ],
    authorRightsHolder: 'NoteQuest Web Application project',
    permissionLicenseId: 'PROJECT-ORIGINAL-PALACE-ENTRANCE-1.0.0',
    rightsBasis: 'Project-authored mechanical template containing no copied source expression.',
    evidenceReference: {
      publicId: 'STORY-M6-002-PALACE-ENTRANCE',
      location: 'packages/content/src/authorized-palace-entrance.ts',
      confidentiality: 'public-safe-reference',
    },
    permittedReleaseModes: [
      'internal-prototype',
      'closed-palace-playtest',
      'public-free-core-mvp',
      'future-commercial',
    ],
    restrictions: ['mechanical-placeholder', 'contains-no-official-source-expression'],
    attributionRequired: false,
    attributionNoticeId: null,
    noticeLocations: [],
    modifications: ['Initial stable project-original entrance topology.'],
    compatibilityPolicy: 'saved-history-pins-content-version',
    contentHash: {
      status: 'recorded',
      algorithm: 'SHA-256',
      canonicalization: 'RFC-8785',
      value: 'sha256:3a4e012609b49dce3946ddeec1d8d698ad2484361d7951380979e7e382829782',
    },
    supersedes: [],
    confidentialRightsEvidence: 'excluded-from-public-manifest',
    containsExactSourceProse: false,
    containsSourceArtwork: false,
    containsTradeDress: false,
  },
  review: {
    approvalState: 'selected',
    reviewerRole: 'product',
    reviewerReference: 'STORY-M6-002',
    reviewedAt: '2026-08-12T00:00:00.000Z',
    decisionReference: 'STORY-M6-002-PALACE-ENTRANCE',
    publicReleaseEligible: true,
  },
};

export const authorizedPalaceEntranceManifest: PalaceContentManifest = {
  schemaVersion: 'palace-content-manifest.schema.v0.1',
  packageId: 'palace',
  contentVersion: authorizedPalaceEntranceContentVersion,
  rulesVersion: authorizedPalaceEntranceRulesVersion,
  generatedAt: '2026-08-12T00:00:00.000Z',
  entries: [entranceEntry],
};
