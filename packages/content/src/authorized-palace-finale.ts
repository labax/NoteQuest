import { authorizedNoteQuestAttributionNotice } from './authorized-notequest-adventurer-creation.ts';
import type {
  PalaceContentId,
  PalaceContentManifest,
  PalaceManifestEntry,
  PalaceRangeReference,
  PalaceSourceReference,
} from './palace-manifest.ts';

export const authorizedPalaceFinaleContentVersion = '1.0.0' as const;
export const authorizedPalaceFinaleRulesVersion = 'digital-rules-specification-v0.1' as const;

export type PalaceBossTraitId =
  | 'trait.undead'
  | 'trait.explosive'
  | 'trait.intangible'
  | 'trait.stoneskin'
  | 'trait.necromancy'
  | 'trait.horde';

const bossRow = (
  id: PalaceContentId,
  roll: number,
  label: string,
  bossId: `boss.${string}`,
  count: number,
  hitPoints: number,
  damage: number,
  traitIds: readonly PalaceBossTraitId[],
) => ({
  id,
  range: { dice: '1d6', rangeId: `palace-boss-${roll}`, from: roll, to: roll } as const,
  label,
  outcome: {
    bossId,
    count: { kind: 'fixed', value: count },
    hitPoints,
    damage,
    traitIds,
  },
});

export const authorizedPalaceBossTable = {
  id: 'palace.finale.table.boss.v1',
  label: 'Palace boss',
  dice: '1d6',
  inventoryId: 'INV-PAL-BOSS',
  rows: [
    bossRow(
      'palace.finale.boss.zombie-baron.v1',
      1,
      'Zombie Baron',
      'boss.zombie-baron',
      1,
      30,
      4,
      ['trait.undead'],
    ),
    bossRow('palace.finale.boss.mad-king.v1', 2, 'Mad King', 'boss.mad-king', 1, 22, 2, [
      'trait.explosive',
    ]),
    bossRow('palace.finale.boss.ghost-lady.v1', 3, 'Ghost Lady', 'boss.ghost-lady', 1, 13, 3, [
      'trait.intangible',
    ]),
    bossRow(
      'palace.finale.boss.unholy-gargoyles.v1',
      4,
      'Unholy Gargoyles',
      'boss.unholy-gargoyle',
      2,
      12,
      3,
      ['trait.stoneskin'],
    ),
    bossRow('palace.finale.boss.necromancer.v1', 5, 'Necromancer', 'boss.necromancer', 1, 16, 7, [
      'trait.necromancy',
    ]),
    bossRow('palace.finale.boss.orc-king.v1', 6, 'Orc King', 'boss.orc-king', 1, 24, 5, [
      'trait.horde',
    ]),
  ],
} as const;

export const authorizedPalaceFinalRoomContract = {
  id: 'palace.finale.contract.final-room.v1',
  segmentKind: 'final-room',
  roomSize: 'large',
  outwardConnectionCount: 0,
  encounterSource: {
    kind: 'boss-table',
    tableId: authorizedPalaceBossTable.id,
    resultCount: 1,
  },
  suppressOrdinaryResolution: {
    roomContent: true,
    monster: true,
  },
  floorThreeRoutes: [
    {
      routeKind: 'normal-downward-staircase',
      sourceFloor: 2,
      destinationFloor: 3,
    },
    {
      routeKind: 'secret-downward-staircase',
      sourceFloor: 2,
      destinationFloor: 3,
    },
  ],
  frontierExhaustionFallback: {
    evaluationPoint: 'after-destination-before-ordinary-room-resolution',
    generatedDestinationKind: 'room',
    generatedDestinationOutwardConnectionCount: 0,
    remainingReachableUnresolvedConnectionCount: 0,
    selection: 'current-generated-destination',
    transition: 'promote-to-final-room',
  },
  uniqueness: {
    maximumFinalRooms: 1,
    duplicateTransitionPolicy: 'reject-before-mutation',
  },
} as const;

export const authorizedPalaceFinalePackage = {
  packageId: 'palace.finale.authorized.v1',
  contentVersion: authorizedPalaceFinaleContentVersion,
  rulesVersion: authorizedPalaceFinaleRulesVersion,
  finalRoomContract: authorizedPalaceFinalRoomContract,
  bossTable: authorizedPalaceBossTable,
} as const;

const placeholderHash =
  'sha256:0000000000000000000000000000000000000000000000000000000000000000' as const;

export const authorizedPalaceFinaleContentHashes: Readonly<
  Record<PalaceContentId, `sha256:${string}`>
> = {
  'palace.finale.package.v1':
    'sha256:6b3464054389f454d3c293ad3f9aa8815081315dcbec1a9f344cdc347a450465',
  'palace.finale.contract.final-room.v1':
    'sha256:fdef3eea4dd9c161245aade6773fbfd648d1a9cf344642fa1bde2834ce64ff24',
  'palace.finale.table.boss.v1':
    'sha256:230c7d59da83b42b7e0c287a700a7941e626b5c277aca199b5b821763c46f1f0',
  'palace.finale.boss.zombie-baron.v1':
    'sha256:a7be1d69baa14854271850c2fc338be07ba280b94a2634378a592cf11832c082',
  'palace.finale.boss.mad-king.v1':
    'sha256:f2e343ada156ca52c44e8794d33140ff00345a0917eaea5cbacb23e3f7a39069',
  'palace.finale.boss.ghost-lady.v1':
    'sha256:b2ee0073898fea7707b5f916044e80655f21c353dc037d792c773f2fa8522db0',
  'palace.finale.boss.unholy-gargoyles.v1':
    'sha256:db40b6fe280e09821556ada30433195e2b12a78fa63c02d9f309b97b1c97325d',
  'palace.finale.boss.necromancer.v1':
    'sha256:8e7348568c8fc97aca877c3e80a4a49859587b445ea896d8bb839cb6abbe89f9',
  'palace.finale.boss.orc-king.v1':
    'sha256:59e5741c719b850e7d3b64fc99a79b3144df82cebec336d160aa79fcb99e30a7',
};

const rightsReference: PalaceSourceReference = {
  kind: 'controlled-evidence-record',
  sourceId: 'NOTEQUEST-ISSUE-80-TIAGO-JUNGES-PERMISSION-ATTESTATION',
  citationLabel: 'Project-owner permission attestation for NoteQuest content',
  locator: 'https://github.com/labax/NoteQuest/issues/80#issuecomment-5121522446',
  sourceVersion: '2026-07-29',
  notes: 'Public-safe attestation; private permission evidence is not published.',
};

const issueReference: PalaceSourceReference = {
  kind: 'decision-register',
  sourceId: 'ISSUE-179',
  citationLabel: 'Palace boss and final-room content decision',
  locator: 'https://github.com/labax/NoteQuest/issues/179',
  sourceVersion: authorizedPalaceFinaleContentVersion,
};

const finalRoomSourceReference: PalaceSourceReference = {
  kind: 'rulebook-section',
  sourceId: 'INV-PAL-FINAL',
  citationLabel: 'NoteQuest final-room mechanics',
  locator: 'NoteQuest first-author edition, Final Room, page 8',
  sourceVersion: '2020',
  notes: 'Mechanical rules only; source prose, artwork, and layout are excluded.',
};

const bossSourceReference: PalaceSourceReference = {
  kind: 'rulebook-table',
  sourceId: 'INV-PAL-BOSS',
  citationLabel: 'NoteQuest Palace boss table',
  locator: 'NoteQuest first-author edition, Palace, page 13',
  sourceVersion: '2020',
  notes: 'Structured values only; source flavour prose, artwork, and layout are excluded.',
};

function makeEntry(definition: {
  readonly id: PalaceContentId;
  readonly contentType: 'definition' | 'table' | 'row';
  readonly kind: 'mechanic-reference' | 'table' | 'table-row';
  readonly label: string;
  readonly parentId?: PalaceContentId;
  readonly range?: PalaceRangeReference;
  readonly references: readonly PalaceContentId[];
  readonly structuredDefinition: Record<string, unknown>;
  readonly sourceReferences: readonly PalaceSourceReference[];
  readonly sourceCategory: 'notequest_permissioned_mechanics' | 'notequest_permissioned_tables';
  readonly modifications: readonly string[];
}): PalaceManifestEntry {
  return {
    id: definition.id,
    contentType: definition.contentType,
    kind: definition.kind,
    version: authorizedPalaceFinaleContentVersion,
    label: definition.label,
    ...(definition.parentId === undefined ? {} : { parentId: definition.parentId }),
    ...(definition.range === undefined ? {} : { range: definition.range }),
    references: definition.references,
    tags: ['palace', 'finale', 'rights-safe'],
    structuredDefinition: definition.structuredDefinition,
    provenance: {
      origin: 'approved-source',
      sourceCategory: definition.sourceCategory,
      sourceName: 'Permitted NoteQuest Palace finale mechanics',
      sourceLocation: 'packages/content/src/authorized-palace-finale.ts',
      sourceEditionVersion: '2020',
      sourceReferences: [...definition.sourceReferences, issueReference, rightsReference],
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
      modifications: definition.modifications,
      compatibilityPolicy: 'saved-history-pins-content-version',
      contentHash: {
        status: 'recorded',
        algorithm: 'SHA-256',
        canonicalization: 'RFC-8785',
        value: authorizedPalaceFinaleContentHashes[definition.id] ?? placeholderHash,
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
      reviewerReference: 'ISSUE-179',
      reviewedAt: '2026-08-17T00:00:00.000Z',
      decisionReference: 'ISSUE-179-AUTHORIZED-PALACE-FINALE',
      publicReleaseEligible: true,
    },
  };
}

const contractEntry = makeEntry({
  id: authorizedPalaceFinalRoomContract.id,
  contentType: 'definition',
  kind: 'mechanic-reference',
  label: 'Palace final-room contract',
  references: [authorizedPalaceBossTable.id],
  structuredDefinition: authorizedPalaceFinalRoomContract,
  sourceReferences: [finalRoomSourceReference],
  sourceCategory: 'notequest_permissioned_mechanics',
  modifications: [
    'Stable IDs and a deterministic frontier-exhaustion transition were added for digital play.',
  ],
});

const bossTableEntry = makeEntry({
  id: authorizedPalaceBossTable.id,
  contentType: 'table',
  kind: 'table',
  label: authorizedPalaceBossTable.label,
  references: authorizedPalaceBossTable.rows.map(({ id }) => id),
  structuredDefinition: {
    dice: authorizedPalaceBossTable.dice,
    inventoryId: authorizedPalaceBossTable.inventoryId,
  },
  sourceReferences: [bossSourceReference],
  sourceCategory: 'notequest_permissioned_tables',
  modifications: ['Stable IDs, structured statistics, and concise non-expressive labels added.'],
});

const bossRowEntries = authorizedPalaceBossTable.rows.map((boss) =>
  makeEntry({
    id: boss.id,
    contentType: 'row',
    kind: 'table-row',
    label: boss.label,
    parentId: authorizedPalaceBossTable.id,
    range: boss.range,
    references: [],
    structuredDefinition: boss.outcome,
    sourceReferences: [bossSourceReference],
    sourceCategory: 'notequest_permissioned_tables',
    modifications: ['Stable IDs, structured statistics, and concise non-expressive labels added.'],
  }),
);

const packageEntry = makeEntry({
  id: 'palace.finale.package.v1',
  contentType: 'definition',
  kind: 'mechanic-reference',
  label: 'Authorized Palace finale package',
  references: [authorizedPalaceFinalRoomContract.id, authorizedPalaceBossTable.id],
  structuredDefinition: authorizedPalaceFinalePackage,
  sourceReferences: [finalRoomSourceReference, bossSourceReference],
  sourceCategory: 'notequest_permissioned_mechanics',
  modifications: [
    'Stable IDs, structured mechanics, concise labels, and deterministic digital termination metadata added.',
  ],
});

export const authorizedPalaceFinaleManifest: PalaceContentManifest = {
  schemaVersion: 'palace-content-manifest.schema.v0.1',
  packageId: 'palace',
  contentVersion: authorizedPalaceFinaleContentVersion,
  rulesVersion: authorizedPalaceFinaleRulesVersion,
  generatedAt: '2026-08-17T00:00:00.000Z',
  entries: [packageEntry, contractEntry, bossTableEntry, ...bossRowEntries],
};
