import {
  palaceContentManifestSchemaVersion,
  palaceContentPackageId,
  type PalaceContentId,
  type PalaceContentManifest,
  type PalaceContentSourceCategory,
  type PalaceManifestEntry,
  type PalaceProvenance,
  type PalaceReviewState,
} from './palace-manifest.ts';

export const authorizedNoteQuestAdventurerCreationContentVersion = '1.0.0' as const;
export const authorizedNoteQuestAdventurerCreationRulesVersion =
  'digital-rules-specification-v0.1' as const;

export interface AuthorizedDamageExpression {
  readonly diceCount: 1;
  readonly dieSides: 6;
  readonly modifier: -2 | -1 | 0 | 1;
  readonly damageType: 'physical';
}

export interface AuthorizedWeaponDefinition {
  readonly id: string;
  readonly manifestId: PalaceContentId;
  readonly label: string;
  readonly hands: 1;
  readonly damage: AuthorizedDamageExpression;
}

export interface AuthorizedEffectDefinition {
  readonly id: string;
  readonly manifestId: PalaceContentId;
  readonly label: string;
  readonly trigger: string;
  readonly guards: readonly string[];
  readonly outcome: Readonly<Record<string, unknown>>;
}

export interface AuthorizedSpellDefinition {
  readonly id: string;
  readonly manifestId: PalaceContentId;
  readonly total: 1 | 2 | 3 | 4 | 5 | 6;
  readonly label: string;
  readonly effectId: string;
  readonly chargesPerGrant: 1;
}

export interface AuthorizedRaceDefinition {
  readonly id: string;
  readonly manifestId: PalaceContentId;
  readonly total: number;
  readonly label: string;
  readonly baseHp: number;
  readonly effectIds: readonly string[];
  readonly fixedSpellGrants: readonly {
    readonly spellId: string;
    readonly charges: number;
  }[];
  readonly randomSpellDraws: number;
}

export interface AuthorizedClassDefinition {
  readonly id: string;
  readonly manifestId: PalaceContentId;
  readonly total: number;
  readonly label: string;
  readonly hpModifier: number;
  readonly effectIds: readonly string[];
  readonly fixedSpellGrants: readonly {
    readonly spellId: string;
    readonly charges: number;
  }[];
  readonly randomSpellDraws: number;
  readonly weaponId: string;
}

export const authorizedNoteQuestAdventurerCreationTableIds = {
  races: 'palace.creation.notequest.races',
  classes: 'palace.creation.notequest.classes',
  spells: 'palace.creation.notequest.basic-spells',
} as const satisfies Readonly<Record<string, PalaceContentId>>;

export const authorizedNoteQuestStartingState = {
  id: 'starting-state.notequest-core',
  manifestId: 'palace.creation.notequest.starting-state',
  usableArms: 2,
  usableHands: 2,
  torches: 10,
  coins: 0,
  status: 'alive',
  location: 'town',
} as const;

export const authorizedNoteQuestEffects = [
  {
    id: 'effect.slimemen.engulf',
    manifestId: 'palace.effect.slimemen.engulf',
    label: 'Engulf',
    trigger: 'after-eligible-enemy-defeat',
    guards: ['adventurer is alive', 'an eligible defeated enemy body is present'],
    outcome: {
      operation: 'restore-current-hp-to-maximum',
      consumes: 'defeated-enemy-body',
      optional: true,
    },
  },
  {
    id: 'effect.dwarf.secret-search',
    manifestId: 'palace.effect.dwarf.secret-search',
    label: 'Secret Search',
    trigger: 'secret-passage-result-roll',
    guards: ['a secret-passage result is being resolved'],
    outcome: { operation: 'roll-two-keep-highest', dice: '1d6', drawCount: 2 },
  },
  {
    id: 'effect.halfling.move-silently',
    manifestId: 'palace.effect.halfling.move-silently',
    label: 'Move Silently',
    trigger: 'move-silently-monster-check',
    guards: ['the room is not a boss room'],
    outcome: { operation: 'roll-two-keep-highest', dice: '1d6', drawCount: 2 },
  },
  {
    id: 'effect.cat-person.sale-value',
    manifestId: 'palace.effect.cat-person.sale-value',
    label: 'Trader',
    trigger: 'equipment-sale-value-finalization',
    guards: ['the sale occurs in town'],
    outcome: { operation: 'multiply-final-sale-value', multiplier: 2 },
  },
  {
    id: 'effect.rinoceroid.horn',
    manifestId: 'palace.effect.rinoceroid.horn',
    label: 'Natural Horn',
    trigger: 'weapon-action-selection',
    guards: ['adventurer is alive'],
    outcome: {
      operation: 'provide-natural-weapon',
      damage: { diceCount: 1, dieSides: 6, modifier: 0, damageType: 'physical' },
      hands: 0,
      createsItemInstance: false,
    },
  },
  {
    id: 'effect.grave-digger.undead-damage',
    manifestId: 'palace.effect.grave-digger.undead-damage',
    label: 'Undead Hunter',
    trigger: 'final-weapon-damage',
    guards: ['target has the Undead trait'],
    outcome: { operation: 'add-final-weapon-damage', value: 2 },
  },
  {
    id: 'effect.blacksmith.repair',
    manifestId: 'palace.effect.blacksmith.repair',
    label: 'Field Repair',
    trigger: 'outside-combat-action',
    guards: [
      'target armour is damaged',
      'target armour is not destroyed',
      'one light unit is available',
    ],
    outcome: {
      operation: 'restore-armour-to-maximum-durability',
      spend: { resource: 'light-unit', amount: 1 },
    },
  },
  {
    id: 'effect.cook.defeat-coin',
    manifestId: 'palace.effect.cook.defeat-coin',
    label: 'Cook',
    trigger: 'credited-monster-defeat',
    guards: ['defeated monster does not have the Undead trait'],
    outcome: { operation: 'gain-resource', resource: 'coin', amount: 1 },
  },
  {
    id: 'effect.locksmith.open-locked-door',
    manifestId: 'palace.effect.locksmith.open-locked-door',
    label: 'Locksmith',
    trigger: 'locked-door-action',
    guards: ['the door is locked'],
    outcome: {
      operation: 'open-locked-door',
      lightCost: 0,
      trapResolution: 'normal',
    },
  },
  {
    id: 'effect.lumberjack.torch-gain',
    manifestId: 'palace.effect.lumberjack.torch-gain',
    label: 'Salvage Wood',
    trigger: 'after-door-break',
    guards: ['physical torch count is below capacity'],
    outcome: {
      operation: 'conditional-resource-gain',
      roll: '1d6',
      successResults: [6],
      resource: 'physical-torch',
      amount: 1,
      cap: 'physical-torch-capacity',
    },
  },
  {
    id: 'effect.miner.emergency-exit',
    manifestId: 'palace.effect.miner.emergency-exit',
    label: 'Emergency Exit',
    trigger: 'light-depleted-after-action',
    guards: ['the current effect chain has completed', 'darkness death has not resolved'],
    outcome: { operation: 'end-expedition-in-town', timing: 'before-darkness-death' },
  },
  {
    id: 'effect.spell.heal',
    manifestId: 'palace.effect.spell.heal',
    label: 'Heal Effect',
    trigger: 'cast-spell',
    guards: ['adventurer death has not resolved'],
    outcome: { operation: 'restore-hp', amount: 5, cap: 'maximum-hp' },
  },
  {
    id: 'effect.spell.light',
    manifestId: 'palace.effect.spell.light',
    label: 'Light Effect',
    trigger: 'cast-spell',
    guards: ['entry preparation or active expedition'],
    outcome: {
      operation: 'add-virtual-expedition-light',
      amount: 1,
      hands: 0,
    },
  },
  {
    id: 'effect.spell.teleport',
    manifestId: 'palace.effect.spell.teleport',
    label: 'Teleport Effect',
    trigger: 'cast-spell',
    guards: [
      'target segment is discovered',
      'target is in the current dungeon',
      'target contains no living monsters',
      'current encounter is not a boss encounter',
    ],
    outcome: { operation: 'move-to-segment', mayEscapeCombat: true },
  },
  {
    id: 'effect.spell.cold-ray',
    manifestId: 'palace.effect.spell.cold-ray',
    label: 'Cold Ray Effect',
    trigger: 'cast-spell',
    guards: ['one living monster is selected'],
    outcome: {
      operation: 'damage-and-prevent-next-monster-attack',
      damage: 4,
      duration: 'one-monster-turn',
    },
  },
  {
    id: 'effect.spell.lightning',
    manifestId: 'palace.effect.spell.lightning',
    label: 'Lightning Effect',
    trigger: 'cast-spell',
    guards: ['one living monster is selected'],
    outcome: { operation: 'deal-direct-damage', damage: 6 },
  },
  {
    id: 'effect.spell.fireball',
    manifestId: 'palace.effect.spell.fireball',
    label: 'Fireball Effect',
    trigger: 'cast-spell',
    guards: ['at least one living monster is in the current room'],
    outcome: {
      operation: 'deal-direct-damage-to-each-living-monster',
      damagePerTarget: 5,
    },
  },
] as const satisfies readonly AuthorizedEffectDefinition[];

export const authorizedNoteQuestSpells = [
  {
    id: 'spell.heal',
    manifestId: 'palace.spell.heal',
    total: 1,
    label: 'Heal',
    effectId: 'effect.spell.heal',
    chargesPerGrant: 1,
  },
  {
    id: 'spell.light',
    manifestId: 'palace.spell.light',
    total: 2,
    label: 'Light',
    effectId: 'effect.spell.light',
    chargesPerGrant: 1,
  },
  {
    id: 'spell.teleport',
    manifestId: 'palace.spell.teleport',
    total: 3,
    label: 'Teleport',
    effectId: 'effect.spell.teleport',
    chargesPerGrant: 1,
  },
  {
    id: 'spell.cold_ray',
    manifestId: 'palace.spell.cold-ray',
    total: 4,
    label: 'Cold Ray',
    effectId: 'effect.spell.cold-ray',
    chargesPerGrant: 1,
  },
  {
    id: 'spell.lightning',
    manifestId: 'palace.spell.lightning',
    total: 5,
    label: 'Lightning',
    effectId: 'effect.spell.lightning',
    chargesPerGrant: 1,
  },
  {
    id: 'spell.fireball',
    manifestId: 'palace.spell.fireball',
    total: 6,
    label: 'Fireball',
    effectId: 'effect.spell.fireball',
    chargesPerGrant: 1,
  },
] as const satisfies readonly AuthorizedSpellDefinition[];

export const authorizedNoteQuestWeapons = [
  {
    id: 'weapon.wood_stick',
    manifestId: 'palace.weapon.wood-stick',
    label: 'Wood Stick',
    hands: 1,
    damage: { diceCount: 1, dieSides: 6, modifier: -2, damageType: 'physical' },
  },
  {
    id: 'weapon.shovel',
    manifestId: 'palace.weapon.shovel',
    label: 'Shovel',
    hands: 1,
    damage: { diceCount: 1, dieSides: 6, modifier: -1, damageType: 'physical' },
  },
  {
    id: 'weapon.rapier',
    manifestId: 'palace.weapon.rapier',
    label: 'Rapier',
    hands: 1,
    damage: { diceCount: 1, dieSides: 6, modifier: 1, damageType: 'physical' },
  },
  {
    id: 'weapon.dagger',
    manifestId: 'palace.weapon.dagger',
    label: 'Dagger',
    hands: 1,
    damage: { diceCount: 1, dieSides: 6, modifier: -1, damageType: 'physical' },
  },
  {
    id: 'weapon.hammer',
    manifestId: 'palace.weapon.hammer',
    label: 'Hammer',
    hands: 1,
    damage: { diceCount: 1, dieSides: 6, modifier: 0, damageType: 'physical' },
  },
  {
    id: 'weapon.short_sword',
    manifestId: 'palace.weapon.short-sword',
    label: 'Short Sword',
    hands: 1,
    damage: { diceCount: 1, dieSides: 6, modifier: 0, damageType: 'physical' },
  },
  {
    id: 'weapon.cleaver',
    manifestId: 'palace.weapon.cleaver',
    label: 'Cleaver',
    hands: 1,
    damage: { diceCount: 1, dieSides: 6, modifier: 0, damageType: 'physical' },
  },
  {
    id: 'weapon.lumberjack_axe',
    manifestId: 'palace.weapon.lumberjack-axe',
    label: 'Lumberjack Axe',
    hands: 1,
    damage: { diceCount: 1, dieSides: 6, modifier: 0, damageType: 'physical' },
  },
  {
    id: 'weapon.pickaxe',
    manifestId: 'palace.weapon.pickaxe',
    label: 'Pickaxe',
    hands: 1,
    damage: { diceCount: 1, dieSides: 6, modifier: -1, damageType: 'physical' },
  },
] as const satisfies readonly AuthorizedWeaponDefinition[];

export const authorizedNoteQuestRaces = [
  {
    id: 'race.slimemen',
    manifestId: 'palace.race.slimemen',
    total: 2,
    label: 'Slimemen',
    baseHp: 10,
    effectIds: ['effect.slimemen.engulf'],
    fixedSpellGrants: [],
    randomSpellDraws: 0,
  },
  {
    id: 'race.lightbugster',
    manifestId: 'palace.race.lightbugster',
    total: 3,
    label: 'Lightbugster',
    baseHp: 16,
    effectIds: [],
    fixedSpellGrants: [{ spellId: 'spell.light', charges: 3 }],
    randomSpellDraws: 0,
  },
  {
    id: 'race.pixie',
    manifestId: 'palace.race.pixie',
    total: 4,
    label: 'Pixie',
    baseHp: 8,
    effectIds: [],
    fixedSpellGrants: [],
    randomSpellDraws: 5,
  },
  {
    id: 'race.gnome',
    manifestId: 'palace.race.gnome',
    total: 5,
    label: 'Gnome',
    baseHp: 14,
    effectIds: [],
    fixedSpellGrants: [],
    randomSpellDraws: 3,
  },
  {
    id: 'race.elf',
    manifestId: 'palace.race.elf',
    total: 6,
    label: 'Elf',
    baseHp: 16,
    effectIds: [],
    fixedSpellGrants: [],
    randomSpellDraws: 1,
  },
  {
    id: 'race.human',
    manifestId: 'palace.race.human',
    total: 7,
    label: 'Human',
    baseHp: 20,
    effectIds: [],
    fixedSpellGrants: [],
    randomSpellDraws: 0,
  },
  {
    id: 'race.dwarf',
    manifestId: 'palace.race.dwarf',
    total: 8,
    label: 'Dwarf',
    baseHp: 18,
    effectIds: ['effect.dwarf.secret-search'],
    fixedSpellGrants: [],
    randomSpellDraws: 0,
  },
  {
    id: 'race.halfling',
    manifestId: 'palace.race.halfling',
    total: 9,
    label: 'Halfling',
    baseHp: 14,
    effectIds: ['effect.halfling.move-silently'],
    fixedSpellGrants: [],
    randomSpellDraws: 0,
  },
  {
    id: 'race.cat_person',
    manifestId: 'palace.race.cat-person',
    total: 10,
    label: 'Cat-Person',
    baseHp: 19,
    effectIds: ['effect.cat-person.sale-value'],
    fixedSpellGrants: [],
    randomSpellDraws: 0,
  },
  {
    id: 'race.rinoceroid',
    manifestId: 'palace.race.rinoceroid',
    total: 11,
    label: 'Rinoceroid',
    baseHp: 24,
    effectIds: ['effect.rinoceroid.horn'],
    fixedSpellGrants: [],
    randomSpellDraws: 0,
  },
  {
    id: 'race.dragonkin',
    manifestId: 'palace.race.dragonkin',
    total: 12,
    label: 'Dragonkin',
    baseHp: 30,
    effectIds: [],
    fixedSpellGrants: [{ spellId: 'spell.fireball', charges: 3 }],
    randomSpellDraws: 0,
  },
] as const satisfies readonly AuthorizedRaceDefinition[];

export const authorizedNoteQuestClasses = [
  {
    id: 'class.hobo',
    manifestId: 'palace.class.hobo',
    total: 2,
    label: 'Hobo',
    hpModifier: 4,
    effectIds: [],
    fixedSpellGrants: [],
    randomSpellDraws: 0,
    weaponId: 'weapon.wood_stick',
  },
  {
    id: 'class.grave_digger',
    manifestId: 'palace.class.grave-digger',
    total: 3,
    label: 'Grave Digger',
    hpModifier: 2,
    effectIds: ['effect.grave-digger.undead-damage'],
    fixedSpellGrants: [],
    randomSpellDraws: 0,
    weaponId: 'weapon.shovel',
  },
  {
    id: 'class.noble',
    manifestId: 'palace.class.noble',
    total: 4,
    label: 'Noble',
    hpModifier: 0,
    effectIds: [],
    fixedSpellGrants: [],
    randomSpellDraws: 1,
    weaponId: 'weapon.rapier',
  },
  {
    id: 'class.schoolar',
    manifestId: 'palace.class.schoolar',
    total: 5,
    label: 'Schoolar',
    hpModifier: 0,
    effectIds: [],
    fixedSpellGrants: [],
    randomSpellDraws: 3,
    weaponId: 'weapon.dagger',
  },
  {
    id: 'class.blacksmith',
    manifestId: 'palace.class.blacksmith',
    total: 6,
    label: 'Blacksmith',
    hpModifier: 4,
    effectIds: ['effect.blacksmith.repair'],
    fixedSpellGrants: [],
    randomSpellDraws: 0,
    weaponId: 'weapon.hammer',
  },
  {
    id: 'class.guard',
    manifestId: 'palace.class.guard',
    total: 7,
    label: 'Guard',
    hpModifier: 4,
    effectIds: [],
    fixedSpellGrants: [],
    randomSpellDraws: 0,
    weaponId: 'weapon.short_sword',
  },
  {
    id: 'class.cook',
    manifestId: 'palace.class.cook',
    total: 8,
    label: 'Cook',
    hpModifier: 2,
    effectIds: ['effect.cook.defeat-coin'],
    fixedSpellGrants: [],
    randomSpellDraws: 0,
    weaponId: 'weapon.cleaver',
  },
  {
    id: 'class.locksmith',
    manifestId: 'palace.class.locksmith',
    total: 9,
    label: 'Locksmith',
    hpModifier: 2,
    effectIds: ['effect.locksmith.open-locked-door'],
    fixedSpellGrants: [],
    randomSpellDraws: 0,
    weaponId: 'weapon.dagger',
  },
  {
    id: 'class.lumberjack',
    manifestId: 'palace.class.lumberjack',
    total: 10,
    label: 'Lumberjack',
    hpModifier: 4,
    effectIds: ['effect.lumberjack.torch-gain'],
    fixedSpellGrants: [],
    randomSpellDraws: 0,
    weaponId: 'weapon.lumberjack_axe',
  },
  {
    id: 'class.miner',
    manifestId: 'palace.class.miner',
    total: 11,
    label: 'Miner',
    hpModifier: 4,
    effectIds: ['effect.miner.emergency-exit'],
    fixedSpellGrants: [],
    randomSpellDraws: 0,
    weaponId: 'weapon.pickaxe',
  },
  {
    id: 'class.gladiator',
    manifestId: 'palace.class.gladiator',
    total: 12,
    label: 'Gladiator',
    hpModifier: 6,
    effectIds: [],
    fixedSpellGrants: [],
    randomSpellDraws: 0,
    weaponId: 'weapon.short_sword',
  },
] as const satisfies readonly AuthorizedClassDefinition[];

export const authorizedNoteQuestAttributionNotice = {
  id: 'NOTEQUEST-TIAGO-JUNGES-CREDIT-V1',
  manifestId: 'palace.notice.notequest-tiago-junges-credit',
  text: 'NoteQuest was created by Tiago Junges. This digital adaptation uses NoteQuest content with the creator’s permission.',
} as const;

const unrecordedHash =
  'sha256:0000000000000000000000000000000000000000000000000000000000000000' as const;

/**
 * Generated from each entry's
 * palace-manifest-entry-integrity-payload.v0.1 canonical JSON. The integrity
 * adapter test rejects stale or missing values.
 */
export const authorizedNoteQuestAdventurerCreationHashes: Readonly<
  Partial<Record<PalaceContentId, `sha256:${string}`>>
> = {
  'palace.creation.notequest.races':
    'sha256:3a0022c3fdfd9ebe6365d805a014f1b81afdb19d81fd0bff89b2836203afaf6e',
  'palace.creation.notequest.classes':
    'sha256:ef28045e0b60dbd9cfbbe2a79214c0929e48c92860362ee88142364a03582d47',
  'palace.creation.notequest.basic-spells':
    'sha256:abfd704ffe55179da9647ec4ccb7db98c3a235384f3bb0712458658bfa9648cc',
  'palace.race.slimemen': 'sha256:e71d0729b3e1aa323ec1b1eb1af585285552e84b68dee242d158e4bdbf13c037',
  'palace.race.lightbugster':
    'sha256:04dcc4fab2a54aa4b37df7707d407a1592a31586cdb3d0b078e04e6b6037e94c',
  'palace.race.pixie': 'sha256:c7adc20fb95e3848ce19eb2d99462daf9df93459f472f24d459af71024523778',
  'palace.race.gnome': 'sha256:41acea1a4dca3a867880d35b1a4718361fd549c8db80dce60a3e9100cf15691a',
  'palace.race.elf': 'sha256:ccbabadb5ec4c851e5870771baaa97f90b7b234342e7e1c91812a80bf33c3ff1',
  'palace.race.human': 'sha256:a4358ab8062df01e46b8627c5a4015973646758b24bba2588e732cb04e2784ec',
  'palace.race.dwarf': 'sha256:71ce59fdce67dea13496eb955c0f7bb0391f5c6c94ad7562eafac05f82348561',
  'palace.race.halfling': 'sha256:1bb7d718403b0da1587d9e4300586a17c063f88a8aaca6fe8281c32b1e58a407',
  'palace.race.cat-person':
    'sha256:46b4af5dbb7cc754041670e687edb559766c3e824634170b878f4ad1aab4347c',
  'palace.race.rinoceroid':
    'sha256:b200f37f7710854164e0b675ec19a917e88f4159a006ece3acc611d7a59ca420',
  'palace.race.dragonkin':
    'sha256:b0e2476f4b992ec2d7aa5be010ea8d5cfeae6a543ee1a5afc984ca8ef2395fbb',
  'palace.class.hobo': 'sha256:62a93fd0c8bd90586f23252794990aeb37933d9b0e01ee1700be0a662fc7efcd',
  'palace.class.grave-digger':
    'sha256:0699378fac13ac5a5e6eb47c46d072eed6106ca0e204c19f8a3fd0a62d2949f7',
  'palace.class.noble': 'sha256:43d05b9c994e1432d1e99e5ba11b4a5058c3aa571fb4f2f712300f8e906d1c8b',
  'palace.class.schoolar':
    'sha256:a202c59a0b76405b9aaab572768f2b7bc1c088d37897ca843ee46391aadf1414',
  'palace.class.blacksmith':
    'sha256:23b688ec6a7b6f7638f60016047bec56f7ddfe001be9f3d486f484f827711967',
  'palace.class.guard': 'sha256:1c6aa85fab3482b8b7fe2b3cc7ea0e8719ae540bd57d5d1c3b02fc7beddb1c89',
  'palace.class.cook': 'sha256:0fe9a4a345d12302d5f15c7c9080787a7552b4945c111a7987743667e65b02a2',
  'palace.class.locksmith':
    'sha256:c8b975caee5712210d14407c2d791449b76021f3b8c2b31736e6143dd1a94269',
  'palace.class.lumberjack':
    'sha256:b03a4c8b9720571e2bdcd9a570851159624fb9d0353ae443fd9e9e06453fab8e',
  'palace.class.miner': 'sha256:c767335ee9bd7eed58648e6f31af6dd8744bfa5c41f49e8f7a8c6526ed721e49',
  'palace.class.gladiator':
    'sha256:bb3f35099ff87335283c5982f2c101d537c0be92dcbcde9500907b8fe7402654',
  'palace.spell.heal': 'sha256:28cbcac05ebfc0d7d1ec03bae7883c697c4c795d566c6324306ca0041e56c589',
  'palace.spell.light': 'sha256:ce5e5c72da8b1a2a98c4139525f823de8e159729f1822d572d7ed64f757911b8',
  'palace.spell.teleport':
    'sha256:60a1d47cb62139082b3564587ff81659c16fa4f55e1c3b6f0869ef48e28859da',
  'palace.spell.cold-ray':
    'sha256:678042fa6a91f780820e5facca1735117458e330aa0d3bb09f08af8d58bfe460',
  'palace.spell.lightning':
    'sha256:0d5d033e2397f8ded26ad8ee27ba6a19f579b0e654ccf6cce6f1d2ce2cbe1a53',
  'palace.spell.fireball':
    'sha256:511bbd2de3b076bc293df776be4728edb0e30dcc59ba7c224e09b131262bfa3d',
  'palace.effect.slimemen.engulf':
    'sha256:50f3286912b476e5cd58d15dc0c4727b5d1c71642e08cbab8e28ba17468a9a28',
  'palace.effect.dwarf.secret-search':
    'sha256:2413182c34eec0a687ebcedbe948df376860c744c933cdddbae2c890f9312ee8',
  'palace.effect.halfling.move-silently':
    'sha256:a6a5d3c0fd5a5e7fb12e7638b2092ca5e3c1fbc3f9fdd580a035b359f6cf7f5a',
  'palace.effect.cat-person.sale-value':
    'sha256:5122b8d3be09f6728c8c05b605af5f77fa0beda357b5714a5b1074383a02ce3a',
  'palace.effect.rinoceroid.horn':
    'sha256:5d51ecfe9d9d08e9631a59f8e0817eb2f689e1e8cec7bcf75e30c8ee17e0a4cf',
  'palace.effect.grave-digger.undead-damage':
    'sha256:eca85e15724f7f431bcae82fdc2fb4b5379d5ebd4d3a9dd25c70c2512441323c',
  'palace.effect.blacksmith.repair':
    'sha256:e06e155bb1b74a33ecb10bda1385a3ca2210660580459f71d02107adb4f76ee1',
  'palace.effect.cook.defeat-coin':
    'sha256:5a459c07edda2439b4f8937d4dd64ce6479cb2449c05107b13def88f758edc08',
  'palace.effect.locksmith.open-locked-door':
    'sha256:8bc2d5872df9b50a2b9d1e6f27c8c54d908affa1a1d143ac7b3fa9fe652a8a8d',
  'palace.effect.lumberjack.torch-gain':
    'sha256:c258d3fb47447eea49b6d3676a4da17d7387a6786f35b053e45e4230d3b8e21b',
  'palace.effect.miner.emergency-exit':
    'sha256:8fbf5dc59c9ac414888b86c62956d73e5950c05a647cc4320e05042a2d9b3322',
  'palace.effect.spell.heal':
    'sha256:578fa714404a26f3808d391a309a97a90a9e3d11ce50b57bb5c60f25d3cf0a5f',
  'palace.effect.spell.light':
    'sha256:682d5c557c302b6b9ffeb2837faebd5c7e93707a275deb3e7149468bd0f22d7e',
  'palace.effect.spell.teleport':
    'sha256:40039994a775a325add91a35cf2e0dbc463390e02573be623dc9cc4afd332492',
  'palace.effect.spell.cold-ray':
    'sha256:c67e72e82637c1d62c150a1aab662628b3ae01bf93ecff40ae1d934169f220ed',
  'palace.effect.spell.lightning':
    'sha256:b732e242d7b9bd553eb64f5fbdc61cb4aac0a190907e0c5b043d8015927c917e',
  'palace.effect.spell.fireball':
    'sha256:492e411dce761dc26e7cf98034c1a04b6a92345bcb4799cd9975c8f810934b14',
  'palace.weapon.wood-stick':
    'sha256:a2421d6cd4934a1e4aee1f7d29948551a6b750692910ee037bea85f8b20e2dd5',
  'palace.weapon.shovel': 'sha256:5efd55e95335ec4cba8b793e614887d1e6da07799e99799b89504a21fe7c2843',
  'palace.weapon.rapier': 'sha256:89cbb10252ac8cf460a936108949b903178b119cf9b8a1e7c170ecba9d002dc9',
  'palace.weapon.dagger': 'sha256:e7a44f6a8eee3405108f46c3710c3042de09b8eace855069019b9522eef8e4b9',
  'palace.weapon.hammer': 'sha256:35867098210eebd63ca514926321ba22166c2b4303fa4a44a61b4c4e97432ce0',
  'palace.weapon.short-sword':
    'sha256:81cd22b702768fd841d18960494ecdf9979ab1724f9603f3cfb2c0ad9ae53780',
  'palace.weapon.cleaver':
    'sha256:58cf04ca2abf32890c281110289375f6130edaa61cfce5612372fdedf0b67481',
  'palace.weapon.lumberjack-axe':
    'sha256:f4211c456de9b69da570763eb417e6f59d6df5ff541711d2f7d3f846e1ce3347',
  'palace.weapon.pickaxe':
    'sha256:37a2a83bc0ad55e2d2ad936df1631dc71ea9ac07a141248651421fc449643131',
  'palace.creation.notequest.starting-state':
    'sha256:23ede359f74c1aeecad312abc66bf3e57ae0ec29e77d45eb36a8592209a968e6',
  'palace.notice.notequest-tiago-junges-credit':
    'sha256:7cb81bce137e4046288170fe088f83b9af3b766b513f0c87e9f36f73ebd9e167',
};

const selectedReview: PalaceReviewState = {
  approvalState: 'selected',
  reviewerRole: 'product',
  reviewerReference: 'github:labax',
  reviewedAt: '2026-07-29T19:54:06.000Z',
  decisionReference: 'https://github.com/labax/NoteQuest/issues/80#issuecomment-5121522446',
  publicReleaseEligible: true,
};

function provenanceFor(
  id: PalaceContentId,
  sourceCategory: PalaceContentSourceCategory,
  sourceLocator: string,
  origin: PalaceProvenance['origin'] = 'approved-source',
): PalaceProvenance {
  return {
    origin,
    sourceCategory,
    sourceName: 'NoteQuest, first author edition',
    sourceLocation: 'docs/product/digital-rules-specification-v0.1.md',
    sourceEditionVersion: 'first-author-edition-2020',
    sourceReferences: [
      {
        kind:
          sourceCategory === 'notequest_permissioned_tables'
            ? 'rulebook-table'
            : 'rulebook-section',
        sourceId: 'notequest-first-author-edition-2020',
        citationLabel: 'NoteQuest by Tiago Junges, first author edition',
        locator: sourceLocator,
        sourceVersion: '2020',
        notes: 'Normalized structured data; no artwork, layout, or long-form source prose.',
      },
      {
        kind: 'decision-register',
        sourceId: authorizedNoteQuestAdventurerCreationRulesVersion,
        citationLabel: 'Approved NoteQuest Digital Rules Specification v0.1',
        locator: 'docs/product/digital-rules-specification-v0.1.md',
        sourceVersion: authorizedNoteQuestAdventurerCreationRulesVersion,
      },
      {
        kind: 'controlled-evidence-record',
        sourceId: 'NOTEQUEST-ISSUE-80-TIAGO-JUNGES-PERMISSION-ATTESTATION',
        citationLabel: 'Project-owner permission attestation for issue #80',
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
      'Normalized source tables and mechanics to stable IDs and structured definitions.',
      'Used concise project-authored labels and mechanical descriptions.',
    ],
    compatibilityPolicy: 'saved-history-pins-content-version',
    contentHash: {
      status: 'recorded',
      algorithm: 'SHA-256',
      canonicalization: 'RFC-8785',
      value: authorizedNoteQuestAdventurerCreationHashes[id] ?? unrecordedHash,
    },
    supersedes: [],
    confidentialRightsEvidence: 'excluded-from-public-manifest',
    containsExactSourceProse: false,
    containsSourceArtwork: false,
    containsTradeDress: false,
  };
}

function entry(
  definition: Omit<PalaceManifestEntry, 'provenance' | 'review' | 'version'>,
  sourceCategory: PalaceContentSourceCategory,
  sourceLocator: string,
  origin?: PalaceProvenance['origin'],
): PalaceManifestEntry {
  return {
    ...definition,
    version: authorizedNoteQuestAdventurerCreationContentVersion,
    provenance: provenanceFor(definition.id, sourceCategory, sourceLocator, origin),
    review: selectedReview,
  };
}

function effectManifestId(effectId: string): PalaceContentId {
  const definition = authorizedNoteQuestEffects.find(({ id }) => id === effectId);
  if (definition === undefined) {
    throw new Error(`Unknown authorized NoteQuest effect ${effectId}`);
  }
  return definition.manifestId;
}

function spellManifestId(spellId: string): PalaceContentId {
  const definition = authorizedNoteQuestSpells.find(({ id }) => id === spellId);
  if (definition === undefined) {
    throw new Error(`Unknown authorized NoteQuest spell ${spellId}`);
  }
  return definition.manifestId;
}

function weaponManifestId(weaponId: string): PalaceContentId {
  const definition = authorizedNoteQuestWeapons.find(({ id }) => id === weaponId);
  if (definition === undefined) {
    throw new Error(`Unknown authorized NoteQuest weapon ${weaponId}`);
  }
  return definition.manifestId;
}

const tableEntries = [
  entry(
    {
      id: authorizedNoteQuestAdventurerCreationTableIds.races,
      contentType: 'table',
      kind: 'table',
      label: 'Authorized NoteQuest Race table',
      tags: ['palace', 'adventurer-creation', 'race', 'permissioned-source'],
      references: authorizedNoteQuestRaces.map(({ manifestId }) => manifestId),
      structuredDefinition: {
        dice: '2d6',
        drawCount: 1,
        resultField: 'total',
        purpose: 'Select one canonical NoteQuest race.',
      },
    },
    'notequest_permissioned_tables',
    'Digital Rules Specification section 8.2 / source Race table',
  ),
  entry(
    {
      id: authorizedNoteQuestAdventurerCreationTableIds.classes,
      contentType: 'table',
      kind: 'table',
      label: 'Authorized NoteQuest Class table',
      tags: ['palace', 'adventurer-creation', 'class', 'permissioned-source'],
      references: authorizedNoteQuestClasses.map(({ manifestId }) => manifestId),
      structuredDefinition: {
        dice: '2d6',
        drawCount: 1,
        resultField: 'total',
        purpose: 'Select one canonical NoteQuest class.',
      },
    },
    'notequest_permissioned_tables',
    'Digital Rules Specification section 8.3 / source Class table',
  ),
  entry(
    {
      id: authorizedNoteQuestAdventurerCreationTableIds.spells,
      contentType: 'table',
      kind: 'table',
      label: 'Authorized NoteQuest Basic Spell table',
      tags: ['palace', 'adventurer-creation', 'spell', 'permissioned-source'],
      references: authorizedNoteQuestSpells.map(({ manifestId }) => manifestId),
      structuredDefinition: {
        dice: '1d6',
        drawCount: 1,
        resultField: 'total',
        purpose: 'Select one canonical NoteQuest Basic Spell charge.',
      },
    },
    'notequest_permissioned_tables',
    'Digital Rules Specification section 14.1 / source Basic Spell table',
  ),
] as const;

const raceEntries = authorizedNoteQuestRaces.map((race) =>
  entry(
    {
      id: race.manifestId,
      contentType: 'row',
      kind: 'table-row',
      label: race.label,
      parentId: authorizedNoteQuestAdventurerCreationTableIds.races,
      range: {
        dice: '2d6',
        rangeId: `${race.manifestId}.total-${race.total}`,
        from: race.total,
        to: race.total,
      },
      references: [
        ...race.effectIds.map(effectManifestId),
        ...race.fixedSpellGrants.map(({ spellId }) => spellManifestId(spellId)),
      ],
      tags: ['palace', 'adventurer-creation', 'race', 'permissioned-source'],
      structuredDefinition: {
        canonicalId: race.id,
        total: race.total,
        baseHp: race.baseHp,
        effectIds: race.effectIds,
        fixedSpellGrants: race.fixedSpellGrants,
        randomSpellDraws: race.randomSpellDraws,
      },
    },
    'notequest_permissioned_tables',
    `Digital Rules Specification section 8.2 row ${race.total}`,
  ),
);

const classEntries = authorizedNoteQuestClasses.map((characterClass) =>
  entry(
    {
      id: characterClass.manifestId,
      contentType: 'row',
      kind: 'table-row',
      label: characterClass.label,
      parentId: authorizedNoteQuestAdventurerCreationTableIds.classes,
      range: {
        dice: '2d6',
        rangeId: `${characterClass.manifestId}.total-${characterClass.total}`,
        from: characterClass.total,
        to: characterClass.total,
      },
      references: [
        ...characterClass.effectIds.map(effectManifestId),
        ...characterClass.fixedSpellGrants.map(({ spellId }) => spellManifestId(spellId)),
        weaponManifestId(characterClass.weaponId),
      ],
      tags: ['palace', 'adventurer-creation', 'class', 'permissioned-source'],
      structuredDefinition: {
        canonicalId: characterClass.id,
        total: characterClass.total,
        hpModifier: characterClass.hpModifier,
        effectIds: characterClass.effectIds,
        fixedSpellGrants: characterClass.fixedSpellGrants,
        randomSpellDraws: characterClass.randomSpellDraws,
        weaponId: characterClass.weaponId,
      },
    },
    'notequest_permissioned_tables',
    `Digital Rules Specification section 8.3 row ${characterClass.total}`,
  ),
);

const spellEntries = authorizedNoteQuestSpells.map((spell) =>
  entry(
    {
      id: spell.manifestId,
      contentType: 'row',
      kind: 'table-row',
      label: spell.label,
      parentId: authorizedNoteQuestAdventurerCreationTableIds.spells,
      range: {
        dice: '1d6',
        rangeId: `${spell.manifestId}.total-${spell.total}`,
        from: spell.total,
        to: spell.total,
      },
      references: [effectManifestId(spell.effectId)],
      tags: ['palace', 'adventurer-creation', 'spell', 'permissioned-source'],
      structuredDefinition: {
        canonicalId: spell.id,
        total: spell.total,
        effectId: spell.effectId,
        chargesPerGrant: spell.chargesPerGrant,
      },
    },
    'notequest_permissioned_tables',
    `Digital Rules Specification section 14.1 row ${spell.total}`,
  ),
);

const effectEntries = authorizedNoteQuestEffects.map((effect) =>
  entry(
    {
      id: effect.manifestId,
      contentType: 'definition',
      kind: 'mechanic-reference',
      label: effect.label,
      tags: ['palace', 'adventurer-creation', 'effect', 'permissioned-source'],
      structuredDefinition: {
        canonicalId: effect.id,
        trigger: effect.trigger,
        guards: effect.guards,
        outcome: effect.outcome,
      },
    },
    'notequest_permissioned_mechanics',
    effect.id.startsWith('effect.spell.')
      ? 'Digital Rules Specification sections 14.1-14.2'
      : 'Digital Rules Specification sections 8.2-8.4',
  ),
);

const weaponEntries = authorizedNoteQuestWeapons.map((weapon) =>
  entry(
    {
      id: weapon.manifestId,
      contentType: 'definition',
      kind: 'mechanic-reference',
      label: weapon.label,
      tags: ['palace', 'adventurer-creation', 'weapon', 'permissioned-source'],
      structuredDefinition: {
        canonicalId: weapon.id,
        hands: weapon.hands,
        damage: weapon.damage,
      },
    },
    'notequest_permissioned_tables',
    'Digital Rules Specification section 8.3 starting-weapon column',
  ),
);

const startingStateEntry = entry(
  {
    id: authorizedNoteQuestStartingState.manifestId,
    contentType: 'definition',
    kind: 'mechanic-reference',
    label: 'Authorized NoteQuest starting state',
    tags: ['palace', 'adventurer-creation', 'starting-state', 'permissioned-source'],
    structuredDefinition: {
      canonicalId: authorizedNoteQuestStartingState.id,
      usableArms: authorizedNoteQuestStartingState.usableArms,
      usableHands: authorizedNoteQuestStartingState.usableHands,
      torches: authorizedNoteQuestStartingState.torches,
      coins: authorizedNoteQuestStartingState.coins,
      status: authorizedNoteQuestStartingState.status,
      location: authorizedNoteQuestStartingState.location,
    },
  },
  'notequest_permissioned_mechanics',
  'Digital Rules Specification section 8.1',
);

const attributionNoticeEntry = entry(
  {
    id: authorizedNoteQuestAttributionNotice.manifestId,
    contentType: 'notice',
    kind: 'mechanic-reference',
    label: 'NoteQuest creator and permission credit',
    tags: ['palace', 'notice', 'attribution', 'permission'],
    structuredDefinition: {
      noticeId: authorizedNoteQuestAttributionNotice.id,
      text: authorizedNoteQuestAttributionNotice.text,
    },
  },
  'project_original',
  'Issue #80 public-safe permission attestation',
  'derived',
);

export const authorizedNoteQuestAdventurerCreationManifest = {
  schemaVersion: palaceContentManifestSchemaVersion,
  packageId: palaceContentPackageId,
  contentVersion: authorizedNoteQuestAdventurerCreationContentVersion,
  rulesVersion: authorizedNoteQuestAdventurerCreationRulesVersion,
  generatedAt: '2026-07-29T19:54:06.000Z',
  entries: [
    ...tableEntries,
    ...raceEntries,
    ...classEntries,
    ...spellEntries,
    ...effectEntries,
    ...weaponEntries,
    startingStateEntry,
    attributionNoticeEntry,
  ],
} as const satisfies PalaceContentManifest;
