import {
  authorizedNoteQuestAdventurerCreationContentVersion,
  authorizedNoteQuestAdventurerCreationTableIds,
  authorizedNoteQuestAttributionNotice,
  authorizedNoteQuestSpells,
} from './authorized-notequest-adventurer-creation.ts';
import type {
  PalaceContentId,
  PalaceContentManifest,
  PalaceManifestEntry,
  PalaceRangeReference,
  PalaceSourceReference,
} from './palace-manifest.ts';

export const authorizedPalaceRewardContentVersion = '1.0.0' as const;
export const authorizedPalaceRewardRulesVersion = 'digital-rules-specification-v0.1' as const;

type PalaceRewardTableId =
  | 'palace.reward.table.treasure.v1'
  | 'palace.reward.table.wonders.v1'
  | 'palace.reward.table.magic-item.v1'
  | 'palace.reward.table.armour.v1'
  | 'palace.reward.table.weapon.v1';

interface PalaceRewardRowDefinition {
  readonly id: PalaceContentId;
  readonly range: PalaceRangeReference;
  readonly label: string;
  readonly outcome: Record<string, unknown>;
}

interface PalaceRewardTableDefinition {
  readonly id: PalaceRewardTableId;
  readonly label: string;
  readonly dice: '1d6';
  readonly inventoryId: 'INV-PAL-REWARD';
  readonly rows: readonly PalaceRewardRowDefinition[];
}

const rewardRow = (
  id: PalaceContentId,
  roll: number,
  label: string,
  outcome: Record<string, unknown>,
): PalaceRewardRowDefinition => ({
  id,
  range: { dice: '1d6', rangeId: `${id}.roll-${roll}`, from: roll, to: roll },
  label,
  outcome,
});

const treasureTable: PalaceRewardTableDefinition = {
  id: 'palace.reward.table.treasure.v1',
  label: 'Palace Treasure',
  dice: '1d6',
  inventoryId: 'INV-PAL-REWARD',
  rows: [
    rewardRow('palace.reward.treasure.ornament.v1', 1, 'Ornament', {
      kind: 'item',
      itemDefinitionId: 'item.ornament',
      itemCategory: 'treasure',
      effect: { effectId: 'effect.fixed_sale_value', coins: 5 },
    }),
    rewardRow('palace.reward.treasure.health-potion.v1', 2, 'Health Potion', {
      kind: 'item',
      itemDefinitionId: 'item.health-potion',
      itemCategory: 'consumable',
      backpackSlots: 1,
      effect: { effectId: 'effect.full_heal' },
    }),
    rewardRow('palace.reward.treasure.magic-scroll.v1', 3, 'Magic Scroll', {
      kind: 'item',
      itemDefinitionId: 'item.magic-scroll',
      itemCategory: 'consumable',
      backpackSlots: 1,
      effect: {
        effectId: 'effect.magic_scroll',
        spellSelectionTiming: 'item-creation',
        spellRollsPerItem: 1,
        spellTableId: authorizedNoteQuestAdventurerCreationTableIds.spells,
        spellContentVersion: authorizedNoteQuestAdventurerCreationContentVersion,
      },
    }),
    rewardRow('palace.reward.treasure.valuable-jewel.v1', 4, 'Valuable Jewel', {
      kind: 'item',
      itemDefinitionId: 'item.valuable-jewel',
      itemCategory: 'treasure',
      effect: {
        effectId: 'effect.rolled_sale_value',
        dice: '2d6',
        multiplier: 10,
        rollTiming: 'item-creation',
      },
    }),
    rewardRow('palace.reward.treasure.redirect-wonders.v1', 5, 'Wonders redirect', {
      kind: 'redirect',
      tableId: 'palace.reward.table.wonders.v1',
      rollCount: 1,
      grantsRedirectRow: false,
    }),
    rewardRow('palace.reward.treasure.redirect-magic-item.v1', 6, 'Magic Item redirect', {
      kind: 'redirect',
      tableId: 'palace.reward.table.magic-item.v1',
      rollCount: 1,
      grantsRedirectRow: false,
    }),
  ],
};

const wondersTable: PalaceRewardTableDefinition = {
  id: 'palace.reward.table.wonders.v1',
  label: 'Palace Wonders',
  dice: '1d6',
  inventoryId: 'INV-PAL-REWARD',
  rows: [
    rewardRow('palace.reward.wonder.jester-hat.v1', 1, 'Jester Hat', {
      kind: 'item',
      itemDefinitionId: 'item.jester-hat',
      itemCategory: 'armour',
      equipmentSlot: 'helmet',
      maximumDurability: 2,
      effects: [{ effectId: 'effect.disable_stealth' }],
    }),
    rewardRow('palace.reward.wonder.emperor-sandals.v1', 2, "Emperor's Sandals", {
      kind: 'item',
      itemDefinitionId: 'item.emperor-sandals',
      itemCategory: 'armour',
      equipmentSlot: 'boots',
      maximumDurability: 2,
      effects: [
        {
          effectId: 'effect.damage_bonus_tagged',
          amount: 1,
          targetTags: ['monster.cockroach'],
        },
      ],
    }),
    rewardRow('palace.reward.wonder.amulet-of-the-dead.v1', 3, 'Amulet of the Dead', {
      kind: 'item',
      itemDefinitionId: 'item.amulet-of-the-dead',
      itemCategory: 'wonder',
      backpackSlots: 1,
      effects: [{ effectId: 'effect.ignore_monster_trait', traitId: 'trait.undead' }],
    }),
    rewardRow('palace.reward.wonder.potion-of-luck.v1', 4, 'Potion of Luck', {
      kind: 'item',
      itemDefinitionId: 'item.potion-of-luck',
      itemCategory: 'consumable',
      backpackSlots: 1,
      effects: [{ effectId: 'effect.trap_cancel_next' }],
    }),
    rewardRow('palace.reward.wonder.potion-of-fury.v1', 5, 'Potion of Fury', {
      kind: 'item',
      itemDefinitionId: 'item.potion-of-fury',
      itemCategory: 'consumable',
      backpackSlots: 1,
      effects: [{ effectId: 'effect.temporary_damage_bonus', amount: 2 }],
    }),
    rewardRow('palace.reward.wonder.lamp.v1', 6, 'Lamp', {
      kind: 'item',
      itemDefinitionId: 'item.lamp',
      itemCategory: 'light-source',
      backpackSlots: 1,
      hands: 0,
      ruleReferences: ['DRS-EXP-021'],
    }),
  ],
};

const magicItemTable: PalaceRewardTableDefinition = {
  id: 'palace.reward.table.magic-item.v1',
  label: 'Palace Magic Item',
  dice: '1d6',
  inventoryId: 'INV-PAL-REWARD',
  rows: [
    rewardRow('palace.reward.magic-item.armour-royalty.v1', 1, 'Armour of Royalty', {
      kind: 'composed-equipment',
      baseTableId: 'palace.reward.table.armour.v1',
      modifierId: 'modifier.armour.royalty',
      effects: [{ effectId: 'effect.cosmetic_change', field: 'style', value: 'royal' }],
    }),
    rewardRow('palace.reward.magic-item.armour-leprechaun.v1', 2, 'Leprechaun Armour', {
      kind: 'composed-equipment',
      baseTableId: 'palace.reward.table.armour.v1',
      modifierId: 'modifier.armour.leprechaun',
      effects: [{ effectId: 'effect.chest_coin_multiplier', multiplier: 2 }],
    }),
    rewardRow('palace.reward.magic-item.armour-centurion.v1', 3, 'Centurion Armour', {
      kind: 'composed-equipment',
      baseTableId: 'palace.reward.table.armour.v1',
      modifierId: 'modifier.armour.centurion',
      effects: [{ effectId: 'effect.armour_durability_modifier', amount: 1 }],
    }),
    rewardRow('palace.reward.magic-item.weapon-destruction.v1', 4, 'Weapon of Destruction', {
      kind: 'composed-equipment',
      baseTableId: 'palace.reward.table.weapon.v1',
      modifierId: 'modifier.weapon.destruction',
      effects: [{ effectId: 'effect.damage_bonus_flat', amount: 2 }],
    }),
    rewardRow('palace.reward.magic-item.weapon-war.v1', 5, 'Weapon of War', {
      kind: 'composed-equipment',
      baseTableId: 'palace.reward.table.weapon.v1',
      modifierId: 'modifier.weapon.war',
      effects: [
        {
          effectId: 'effect.damage_bonus_tagged',
          amount: 2,
          targetTags: ['monster.angel'],
        },
      ],
    }),
    rewardRow(
      'palace.reward.magic-item.weapon-dragon-slayer.v1',
      6,
      'Weapon of the Dragon Slayer',
      {
        kind: 'composed-equipment',
        baseTableId: 'palace.reward.table.weapon.v1',
        modifierId: 'modifier.weapon.dragon-slayer',
        effects: [
          {
            effectId: 'effect.damage_multiplier_tagged',
            multiplier: 2,
            targetTags: ['monster.dragon'],
          },
        ],
      },
    ),
  ],
};

const armourTable: PalaceRewardTableDefinition = {
  id: 'palace.reward.table.armour.v1',
  label: 'Palace Armour',
  dice: '1d6',
  inventoryId: 'INV-PAL-REWARD',
  rows: [
    rewardRow('palace.reward.armour.ring.v1', 1, 'Ring', {
      kind: 'base-armour',
      baseItemId: 'armour.ring',
      equipmentSlot: 'ring',
      maximumDurability: 0,
    }),
    rewardRow('palace.reward.armour.bracelets.v1', 2, 'Bracelets', {
      kind: 'base-armour',
      baseItemId: 'armour.bracelets',
      equipmentSlot: 'bracelets',
      maximumDurability: 2,
    }),
    rewardRow('palace.reward.armour.boots.v1', 3, 'Boots', {
      kind: 'base-armour',
      baseItemId: 'armour.boots',
      equipmentSlot: 'boots',
      maximumDurability: 3,
    }),
    rewardRow('palace.reward.armour.shoulderpads.v1', 4, 'Shoulderpads', {
      kind: 'base-armour',
      baseItemId: 'armour.shoulderpads',
      equipmentSlot: 'shoulderpads',
      maximumDurability: 3,
    }),
    rewardRow('palace.reward.armour.helm.v1', 5, 'Helm', {
      kind: 'base-armour',
      baseItemId: 'armour.helm',
      equipmentSlot: 'helmet',
      maximumDurability: 4,
    }),
    rewardRow('palace.reward.armour.breastplate.v1', 6, 'Breastplate', {
      kind: 'base-armour',
      baseItemId: 'armour.breastplate',
      equipmentSlot: 'breastplate',
      maximumDurability: 10,
    }),
  ],
};

const weaponTable: PalaceRewardTableDefinition = {
  id: 'palace.reward.table.weapon.v1',
  label: 'Palace Weapon',
  dice: '1d6',
  inventoryId: 'INV-PAL-REWARD',
  rows: [
    rewardRow('palace.reward.weapon.candlestick.v1', 1, 'Candlestick', {
      kind: 'base-weapon',
      baseItemId: 'weapon.candlestick',
      hands: 1,
      damage: { dice: '1d6', modifier: -1 },
    }),
    rewardRow('palace.reward.weapon.sword.v1', 2, 'Sword', {
      kind: 'base-weapon',
      baseItemId: 'weapon.sword',
      hands: 1,
      damage: { dice: '1d6', modifier: 0 },
    }),
    rewardRow('palace.reward.weapon.rapier.v1', 3, 'Rapier', {
      kind: 'base-weapon',
      baseItemId: 'weapon.rapier',
      hands: 1,
      damage: { dice: '1d6', modifier: 1 },
    }),
    rewardRow('palace.reward.weapon.whip.v1', 4, 'Whip', {
      kind: 'base-weapon',
      baseItemId: 'weapon.whip',
      hands: 1,
      damage: { dice: '1d6', modifier: 1 },
    }),
    rewardRow('palace.reward.weapon.claw.v1', 5, 'Claw', {
      kind: 'base-weapon',
      baseItemId: 'weapon.claw',
      hands: 1,
      damage: { dice: '1d6', modifier: 1 },
    }),
    rewardRow('palace.reward.weapon.halberd.v1', 6, 'Halberd', {
      kind: 'base-weapon',
      baseItemId: 'weapon.halberd',
      hands: 2,
      damage: { dice: '1d6', modifier: 3 },
    }),
  ],
};

export const authorizedPalaceRoomFollowOnContract = {
  id: 'palace.reward.contract.room-follow-on.v1',
  roomContent: {
    magicScrolls: {
      sourceRowId: 'palace.exploration.room-content.5.v1',
      countDice: '1d6',
      itemDefinitionId: 'item.magic-scroll',
      perItem: {
        tableId: authorizedNoteQuestAdventurerCreationTableIds.spells,
        contentVersion: authorizedNoteQuestAdventurerCreationContentVersion,
        rollDice: '1d6',
        rollCount: 1,
        resolutionTiming: 'item-creation',
      },
    },
    chests: {
      sourceRowIds: [
        'palace.exploration.room-content.6.v1',
        'palace.exploration.room-content.8.v1',
      ],
      createState: 'unopened',
      openAction: {
        dice: '2d6-as-two-d6',
        doubleOne: { coins: 0, treasureCount: 0, resolveTrap: true },
        normal: {
          coinsFrom: 'higher-die',
          treasureCountFrom: 'lower-die',
          treasureTableId: treasureTable.id,
        },
      },
    },
    magicItems: {
      sourceRowId: 'palace.exploration.room-content.12.v1',
      countDice: '2d6',
      perItem: {
        tableId: magicItemTable.id,
        rollDice: '1d6',
        rollCount: 1,
        composedEquipmentBaseRollCount: 1,
      },
    },
  },
  persistence: {
    initialLocation: 'generated-room',
    backpackCapacityDecisionTiming: 'later-player-action',
    requiredEvidence: [
      'source-row-id',
      'table-id',
      'selected-row-id',
      'content-version',
      'natural-rolls',
      'redirect-chain',
      'base-item-id',
      'modifier-id',
      'spell-id',
      'stable-created-identity',
    ],
    commitBoundary: 'owning-action-atomic',
  },
} as const;

export const authorizedPalaceRewardPackage = {
  packageId: 'palace.reward.authorized.v1',
  contentVersion: authorizedPalaceRewardContentVersion,
  rulesVersion: authorizedPalaceRewardRulesVersion,
  followOnContract: authorizedPalaceRoomFollowOnContract,
  basicSpellTableReference: {
    tableId: authorizedNoteQuestAdventurerCreationTableIds.spells,
    contentVersion: authorizedNoteQuestAdventurerCreationContentVersion,
    rows: authorizedNoteQuestSpells.map(({ id, manifestId, total }) => ({
      roll: total,
      spellId: id,
      sourceManifestId: manifestId,
    })),
  },
  tables: [treasureTable, wondersTable, magicItemTable, armourTable, weaponTable],
} as const;

const placeholderHash =
  'sha256:0000000000000000000000000000000000000000000000000000000000000000' as const;

export const authorizedPalaceRewardContentHashes: Readonly<
  Record<PalaceContentId, `sha256:${string}`>
> = {
  'palace.reward.package.v1':
    'sha256:7a81bfbd544731c75ffb9d2bbe314ecd41091fceb5d7a5d6d77afc174980df41',
  'palace.reward.contract.room-follow-on.v1':
    'sha256:f3e3efa8d24270e75f10337db4fcdd5f3c99e3d7bcd0ea5d85daffb867c98ebd',
  'palace.reward.table.treasure.v1':
    'sha256:2f28f9eec1a2d65a08647e0ff649b87f958db28a69e6e318951f57adae9eeb37',
  'palace.reward.treasure.ornament.v1':
    'sha256:c93f6022b64459009ab26627a595960112945fda51f93dc98bde5a4c993664f1',
  'palace.reward.treasure.health-potion.v1':
    'sha256:325ffb2696b01f6733084c671c356d25d457fa8fe3136dab3e8d719683e800aa',
  'palace.reward.treasure.magic-scroll.v1':
    'sha256:ca25b152843581262a41ae473cbe6515bf22188f0a8ec3296b5cae92ec42fe4f',
  'palace.reward.treasure.valuable-jewel.v1':
    'sha256:efaa6f187a9173966a71ca6de06deb571c3b035b4b298f7c67f646be8cc62a76',
  'palace.reward.treasure.redirect-wonders.v1':
    'sha256:37a9e7ee2fdcd5f4af79307aa9fcb2b111ad0055527eead0bc33434d387c9fbe',
  'palace.reward.treasure.redirect-magic-item.v1':
    'sha256:ff1250f5a298c7a9c03b7be9cb2883072d2994d83c9ba0d4620cb474112a47b2',
  'palace.reward.table.wonders.v1':
    'sha256:be9b93ffecff185ef6ba10a66b011b0de441d83836f4722a24d0d1745e509f68',
  'palace.reward.wonder.jester-hat.v1':
    'sha256:618ece5813b578de32d01e5e8c833aa4e532cc8f852fd7b4ca965b3072adada0',
  'palace.reward.wonder.emperor-sandals.v1':
    'sha256:3ef48c8e3039e85fa2b2608d1c1aab01d53eff17102f4b8854062e7623228171',
  'palace.reward.wonder.amulet-of-the-dead.v1':
    'sha256:a45d756be6ba3907a269d54b56cd8447f5b725fbfc15c2615c5738be5d778d89',
  'palace.reward.wonder.potion-of-luck.v1':
    'sha256:162131489c47942af256cc5252228d9fbe0871a9058c31cada077046ea45051a',
  'palace.reward.wonder.potion-of-fury.v1':
    'sha256:d29f046fb188d15498f17081288199b76d39664a6d35d4c9eb74ec08ff7c7f97',
  'palace.reward.wonder.lamp.v1':
    'sha256:1e53bb9c684868b74aee7837db5c92fd45eb7da8079f40824947ca1438650f2b',
  'palace.reward.table.magic-item.v1':
    'sha256:b5c195f7033e95d187292624cb35841338fa42a32d0101f249431f46be5c1751',
  'palace.reward.magic-item.armour-royalty.v1':
    'sha256:aa5826bfd8b96b56cf0853d622eeef688ca37953f28cfe57cb9aad2f823717ed',
  'palace.reward.magic-item.armour-leprechaun.v1':
    'sha256:7daa83954305461b879ec83993f23e908442b5b2ed475826da4d43c7dbe1e065',
  'palace.reward.magic-item.armour-centurion.v1':
    'sha256:74332031acdbc6e4d872c605d10211686b99b477f70c898bcf7158496106c332',
  'palace.reward.magic-item.weapon-destruction.v1':
    'sha256:253a54b106ce21253879b2885e859b8441603fa3c02db765405dcfad4d4cb200',
  'palace.reward.magic-item.weapon-war.v1':
    'sha256:9878dce7cf53fc7df401a61b6ec43325735dad47a875679299345472dfe85cd0',
  'palace.reward.magic-item.weapon-dragon-slayer.v1':
    'sha256:58669c5e0e2bf1c25d45295b0b937d26aab47870474fa486a6b18f0c6db9fd53',
  'palace.reward.table.armour.v1':
    'sha256:f5e7c4372b3e7a065bc20b50830ff618ae50202930bef96c6230fe87d5a276b9',
  'palace.reward.armour.ring.v1':
    'sha256:cb4d5444f808dd6421e40034dc39362313065eb1b9246a810a9c23dde528fd71',
  'palace.reward.armour.bracelets.v1':
    'sha256:25ee0292531887e5153822a3983a0cdf512476e27d2302c4af303ef99937498a',
  'palace.reward.armour.boots.v1':
    'sha256:71c49bc74c1e8d57a6ff819bb5439f8d2c4669f3b099d70d354bfc385ac5e2bb',
  'palace.reward.armour.shoulderpads.v1':
    'sha256:cf1eda3b20d9fbaf4084f8700db3e2aee65e44b09e061f2335c5a55c69c166dc',
  'palace.reward.armour.helm.v1':
    'sha256:c771ef3add6a61c077c6686e363d522c813178b304030614214caaa3a7169df1',
  'palace.reward.armour.breastplate.v1':
    'sha256:21f11e1716de8200451bdf00ea07ce1e55fd0213a042fc8b895f85bbe9d64ed0',
  'palace.reward.table.weapon.v1':
    'sha256:5e35dd08eae713150a3a4af63d8b4a41a1a2ce53993ef226ef7a016519cd086f',
  'palace.reward.weapon.candlestick.v1':
    'sha256:d03638ca2ac745f6a95f154e8712aa1fec6c8c819178daf3560460baea6954d7',
  'palace.reward.weapon.sword.v1':
    'sha256:57ef8f45953b0ae6d6cfb91008186f48593245768fa3f1dc36e6b6bcadb0f994',
  'palace.reward.weapon.rapier.v1':
    'sha256:26b63e7f23a845e84339a1f43fda97bdb355db482ecabf1af1475d31bd464a57',
  'palace.reward.weapon.whip.v1':
    'sha256:bb23fcaad1186c576d9afc55f6280c601a9d7c956d4e4762cd8cc3ab19c8bace',
  'palace.reward.weapon.claw.v1':
    'sha256:157db8ea02c82b25680e087cffdaa7129df16fb69b7ca2d493a9b446f7119e77',
  'palace.reward.weapon.halberd.v1':
    'sha256:7d808089b7f80598576ce9b2c49dc3b9d8cc671cafd7a2d8fd70f1e3d1577d50',
};

const permissionReference: PalaceSourceReference = {
  kind: 'controlled-evidence-record',
  sourceId: 'NOTEQUEST-ISSUE-80-TIAGO-JUNGES-PERMISSION-ATTESTATION',
  citationLabel: 'Project-owner permission attestation for NoteQuest content',
  locator: 'https://github.com/labax/NoteQuest/issues/80#issuecomment-5121522446',
  sourceVersion: '2026-07-29',
  notes: 'Public-safe attestation; private permission evidence is not published.',
};

const issueReference: PalaceSourceReference = {
  kind: 'decision-register',
  sourceId: 'ISSUE-181',
  citationLabel: 'Palace reward and room follow-on content decision',
  locator: 'https://github.com/labax/NoteQuest/issues/181',
  sourceVersion: authorizedPalaceRewardContentVersion,
};

const rewardSourceReference: PalaceSourceReference = {
  kind: 'rulebook-table',
  sourceId: 'INV-PAL-REWARD',
  citationLabel: 'NoteQuest Palace reward, armour, and weapon tables',
  locator: 'NoteQuest first-author edition, Palace, page 13',
  sourceVersion: '2020',
  notes: 'Structured values and names only; source prose, artwork, and layout are excluded.',
};

const roomSourceReference: PalaceSourceReference = {
  kind: 'rulebook-table',
  sourceId: 'INV-PAL-ROOM',
  citationLabel: 'NoteQuest Palace room-content table',
  locator: 'NoteQuest first-author edition, Palace, page 12',
  sourceVersion: '2020',
  notes: 'Mechanical follow-on references only; source prose, artwork, and layout are excluded.',
};

const chestSourceReference: PalaceSourceReference = {
  kind: 'rulebook-section',
  sourceId: 'INV-NQ-CHEST',
  citationLabel: 'NoteQuest chest procedure',
  locator: 'NoteQuest first-author edition, Dungeon Actions, page 8',
  sourceVersion: '2020',
  notes: 'Mechanical procedure only; source prose, artwork, and layout are excluded.',
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
}): PalaceManifestEntry {
  return {
    id: definition.id,
    contentType: definition.contentType,
    kind: definition.kind,
    version: authorizedPalaceRewardContentVersion,
    label: definition.label,
    ...(definition.parentId === undefined ? {} : { parentId: definition.parentId }),
    ...(definition.range === undefined ? {} : { range: definition.range }),
    references: definition.references,
    tags: ['palace', 'reward', 'rights-safe'],
    structuredDefinition: definition.structuredDefinition,
    provenance: {
      origin: 'approved-source',
      sourceCategory: 'notequest_permissioned_tables',
      sourceName: 'Permitted NoteQuest Palace reward mechanics',
      sourceLocation: 'packages/content/src/authorized-palace-rewards.ts',
      sourceEditionVersion: '2020',
      sourceReferences: [...definition.sourceReferences, issueReference, permissionReference],
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
        'Stable IDs, structured effects, concise labels, and explicit follow-on references added.',
      ],
      compatibilityPolicy: 'saved-history-pins-content-version',
      contentHash: {
        status: 'recorded',
        algorithm: 'SHA-256',
        canonicalization: 'RFC-8785',
        value: authorizedPalaceRewardContentHashes[definition.id] ?? placeholderHash,
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
      reviewerReference: 'ISSUE-181',
      reviewedAt: '2026-08-17T00:00:00.000Z',
      decisionReference: 'ISSUE-181-AUTHORIZED-PALACE-REWARDS',
      publicReleaseEligible: true,
    },
  };
}

const contractEntry = makeEntry({
  id: authorizedPalaceRoomFollowOnContract.id,
  contentType: 'definition',
  kind: 'mechanic-reference',
  label: 'Palace room follow-on resolution contract',
  references: [treasureTable.id, magicItemTable.id, armourTable.id, weaponTable.id],
  structuredDefinition: {
    ...authorizedPalaceRoomFollowOnContract,
    basicSpellTableReference: authorizedPalaceRewardPackage.basicSpellTableReference,
  },
  sourceReferences: [roomSourceReference, rewardSourceReference, chestSourceReference],
});

const tableEntries = authorizedPalaceRewardPackage.tables.flatMap((table) => [
  makeEntry({
    id: table.id,
    contentType: 'table',
    kind: 'table',
    label: table.label,
    references: table.rows.map(({ id }) => id),
    structuredDefinition: { dice: table.dice, inventoryId: table.inventoryId },
    sourceReferences: [rewardSourceReference],
  }),
  ...table.rows.map((tableRow) =>
    makeEntry({
      id: tableRow.id,
      contentType: 'row',
      kind: 'table-row',
      label: tableRow.label,
      parentId: table.id,
      range: tableRow.range,
      references:
        Reflect.get(tableRow.outcome, 'kind') === 'redirect'
          ? [Reflect.get(tableRow.outcome, 'tableId') as PalaceContentId]
          : Reflect.get(tableRow.outcome, 'kind') === 'composed-equipment'
            ? [Reflect.get(tableRow.outcome, 'baseTableId') as PalaceContentId]
            : [],
      structuredDefinition: tableRow.outcome,
      sourceReferences: [rewardSourceReference],
    }),
  ),
]);

const packageEntry = makeEntry({
  id: 'palace.reward.package.v1',
  contentType: 'definition',
  kind: 'mechanic-reference',
  label: 'Authorized Palace reward package',
  references: [
    authorizedPalaceRoomFollowOnContract.id,
    ...authorizedPalaceRewardPackage.tables.map(({ id }) => id),
  ],
  structuredDefinition: authorizedPalaceRewardPackage,
  sourceReferences: [roomSourceReference, rewardSourceReference, chestSourceReference],
});

export const authorizedPalaceRewardManifest: PalaceContentManifest = {
  schemaVersion: 'palace-content-manifest.schema.v0.1',
  packageId: 'palace',
  contentVersion: authorizedPalaceRewardContentVersion,
  rulesVersion: authorizedPalaceRewardRulesVersion,
  generatedAt: '2026-08-17T00:00:00.000Z',
  entries: [packageEntry, contractEntry, ...tableEntries],
};
