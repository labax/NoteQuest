import type { PalaceContentManifest, PalaceManifestEntry } from './palace-manifest.ts';
import { authorizedNoteQuestAttributionNotice } from './authorized-notequest-adventurer-creation.ts';

export const authorizedPalaceEntranceContentVersion = '1.2.0' as const;
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
      generationOriginCategory: 'room',
      connectionState: 'unresolved',
      doorState: 'unknown',
      alertState: 'quiet',
    },
    {
      definitionId: 'palace.entrance.connection.side-door-2.v1',
      directionLabel: 'Side door 2',
      generationOriginCategory: 'room',
      connectionState: 'unresolved',
      doorState: 'unknown',
      alertState: 'quiet',
    },
    {
      definitionId: 'palace.entrance.connection.side-door-3.v1',
      directionLabel: 'Side door 3',
      generationOriginCategory: 'room',
      connectionState: 'unresolved',
      doorState: 'unknown',
      alertState: 'quiet',
    },
    {
      definitionId: 'palace.entrance.connection.side-door-4.v1',
      directionLabel: 'Side door 4',
      generationOriginCategory: 'room',
      connectionState: 'unresolved',
      doorState: 'unknown',
      alertState: 'quiet',
    },
    {
      definitionId: 'palace.entrance.connection.central-staircase-wooden-door.v1',
      directionLabel: 'Central staircase and wooden door',
      generationOriginCategory: 'staircase',
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
        kind: 'rulebook-section',
        sourceId: 'INV-PAL-INTRO',
        citationLabel: 'NoteQuest first-author-edition Palace entrance mechanics',
        locator: 'NoteQuest first-author edition, Palace, page 12',
        sourceVersion: '2020',
        notes: 'Mechanical topology only; source prose, artwork, and layout are excluded.',
      },
      {
        kind: 'decision-register',
        sourceId: 'STORY-M6-002',
        citationLabel: 'Palace vertical-slice implementation decision',
        locator: 'docs/product/digital-rules-specification-v0.1.md#92-topology-model',
        sourceVersion: authorizedPalaceEntranceRulesVersion,
      },
      {
        kind: 'decision-register',
        sourceId: 'ISSUE-177',
        citationLabel: 'Palace entrance connection generation-origin decision',
        locator: 'https://github.com/labax/NoteQuest/issues/177',
        sourceVersion: authorizedPalaceEntranceContentVersion,
        notes:
          'The four side doors generate from the room column; the central staircase door generates from the staircase column.',
      },
      {
        kind: 'controlled-evidence-record',
        sourceId: 'NOTEQUEST-ISSUE-80-TIAGO-JUNGES-PERMISSION-ATTESTATION',
        citationLabel: 'Project-owner permission attestation for NoteQuest content',
        locator: 'https://github.com/labax/NoteQuest/issues/80#issuecomment-5121522446',
        sourceVersion: '2026-07-29',
        notes: 'Public-safe attestation; private permission evidence is not published.',
      },
    ],
    authorRightsHolder: 'Tiago Junges',
    permissionLicenseId: 'TIAGO-JUNGES-FULL-PERMISSION-OWNER-ATTESTATION-2026-07-29',
    rightsBasis:
      'The project owner attests that Tiago Junges granted full permission to use, adapt, and distribute NoteQuest content for this digital adaptation.',
    evidenceReference: {
      publicId: 'NOTEQUEST-ISSUE-80-TIAGO-JUNGES-PERMISSION-ATTESTATION',
      location: 'https://github.com/labax/NoteQuest/issues/80#issuecomment-5121522446',
      confidentiality: 'public-safe-reference',
    },
    permittedReleaseModes: [
      'internal-prototype',
      'closed-palace-playtest',
      'public-free-core-mvp',
      'future-commercial',
    ],
    restrictions: [
      'permission-attested-by-project-owner',
      'private-permission-evidence-not-published',
      'source-artwork-layout-and-trade-dress-excluded-from-this-package',
      'long-form-copied-source-prose-excluded-from-this-package',
    ],
    attributionRequired: true,
    attributionNoticeId: authorizedNoteQuestAttributionNotice.id,
    noticeLocations: [
      'about-credits',
      'notice-file',
      'content-manifest',
      'release-listing',
      'release-evidence-package',
    ],
    modifications: [
      'Digital stable IDs and concise non-expressive labels added.',
      'Connection-specific segment-generation origin categories added from the authorized entrance topology.',
    ],
    compatibilityPolicy: 'saved-history-pins-content-version',
    contentHash: {
      status: 'recorded',
      algorithm: 'SHA-256',
      canonicalization: 'RFC-8785',
      value: 'sha256:bd2af30e88da1c63b0cd7f60f39d9310813306087c6316316dad84249903b25e',
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
    reviewerReference: 'ISSUE-177',
    reviewedAt: '2026-08-17T00:00:00.000Z',
    decisionReference: 'ISSUE-177-PALACE-ENTRANCE-ORIGINS',
    publicReleaseEligible: true,
  },
};

export const authorizedPalaceEntranceManifest: PalaceContentManifest = {
  schemaVersion: 'palace-content-manifest.schema.v0.1',
  packageId: 'palace',
  contentVersion: authorizedPalaceEntranceContentVersion,
  rulesVersion: authorizedPalaceEntranceRulesVersion,
  generatedAt: '2026-08-17T00:00:00.000Z',
  entries: [entranceEntry],
};
