import type { PalaceContentManifest, PalaceManifestEntry } from './palace-manifest.ts';

export const authorizedPalaceEntranceContentVersion = '1.1.0' as const;
export const authorizedPalaceEntranceRulesVersion = 'digital-rules-specification-v0.1' as const;

export const authorizedPalaceEntranceTemplate = {
  id: 'palace.entrance.hall.v1',
  floorNumber: 1,
  segmentKind: 'entrance',
  encounterState: 'empty',
  connections: [
    {
      definitionId: 'palace.entrance.connection.side-door-1.v1',
      directionLabel: 'Side door 1',
      connectionState: 'unresolved',
      doorState: 'unknown',
      alertState: 'quiet',
    },
    {
      definitionId: 'palace.entrance.connection.side-door-2.v1',
      directionLabel: 'Side door 2',
      connectionState: 'unresolved',
      doorState: 'unknown',
      alertState: 'quiet',
    },
    {
      definitionId: 'palace.entrance.connection.side-door-3.v1',
      directionLabel: 'Side door 3',
      connectionState: 'unresolved',
      doorState: 'unknown',
      alertState: 'quiet',
    },
    {
      definitionId: 'palace.entrance.connection.side-door-4.v1',
      directionLabel: 'Side door 4',
      connectionState: 'unresolved',
      doorState: 'unknown',
      alertState: 'quiet',
    },
    {
      definitionId: 'palace.entrance.connection.central-staircase-wooden-door.v1',
      directionLabel: 'Central staircase and wooden door',
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
  label: 'Source-faithful Palace entrance mechanics',
  tags: ['palace', 'entrance', 'source-faithful', 'rights-safe'],
  references: [],
  structuredDefinition: authorizedPalaceEntranceTemplate,
  provenance: {
    origin: 'approved-source',
    sourceCategory: 'notequest_permissioned_mechanics',
    sourceName: 'Permitted Palace entrance mechanical topology',
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
    authorRightsHolder: 'Permitted NoteQuest source rights holder',
    permissionLicenseId: 'NOTEQUEST-PALACE-PERMITTED-MECHANICS',
    rightsBasis: 'Permitted mechanical facts, encoded without source prose, artwork, or layout.',
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
    restrictions: ['mechanics-only', 'contains-no-source-expression'],
    attributionRequired: false,
    attributionNoticeId: null,
    noticeLocations: [],
    modifications: ['Digital stable IDs and concise non-expressive labels added.'],
    compatibilityPolicy: 'saved-history-pins-content-version',
    contentHash: {
      status: 'recorded',
      algorithm: 'SHA-256',
      canonicalization: 'RFC-8785',
      value: 'sha256:81c216efa8fcc4f128d4c446b3a2fd8481a3b55d98b8f19890a93f23652a4049',
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
