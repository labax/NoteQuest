import {
  palaceContentManifestSchemaVersion,
  palaceContentPackageId,
  type PalaceContentId,
  type PalaceContentManifest,
  type PalaceManifestEntry,
  type PalaceProvenance,
  type PalaceReviewState,
} from './palace-manifest.ts';

export const projectOriginalAdventurerCreationContentVersion = '1.0.0' as const;
export const projectOriginalAdventurerCreationRulesVersion =
  'palace-project-original-creation-rules.v1' as const;

export interface ProjectOriginalDamageExpression {
  readonly diceCount: 1;
  readonly dieSides: 4 | 6 | 8;
  readonly modifier: number;
  readonly damageType: 'physical';
}

export interface ProjectOriginalWeaponDefinition {
  readonly id: PalaceContentId;
  readonly label: string;
  readonly hands: 1 | 2;
  readonly damage: ProjectOriginalDamageExpression;
}

export interface ProjectOriginalEffectDefinition {
  readonly id: PalaceContentId;
  readonly label: string;
  readonly trigger:
    'always' | 'enter-room' | 'make-check' | 'take-damage' | 'rest' | 'retreat' | 'spend-charge';
  readonly operation:
    | 'adjust-check'
    | 'adjust-damage'
    | 'adjust-healing'
    | 'retain-map-detail'
    | 'preserve-resource'
    | 'reveal-signal'
    | 'survive-at-one';
  readonly value: number;
  readonly limit: 'passive' | 'once-per-room' | 'once-per-expedition';
  readonly condition: string;
}

export interface ProjectOriginalSpellDefinition {
  readonly id: PalaceContentId;
  readonly total: 1 | 2 | 3 | 4 | 5 | 6;
  readonly label: string;
  readonly effectId: PalaceContentId;
  readonly chargesPerGrant: 1;
}

export interface ProjectOriginalHeritageDefinition {
  readonly id: PalaceContentId;
  readonly total: number;
  readonly label: string;
  readonly baseHp: number;
  readonly effectIds: readonly PalaceContentId[];
  readonly fixedSpellIds: readonly PalaceContentId[];
  readonly randomSpellDraws: number;
}

export interface ProjectOriginalCallingDefinition {
  readonly id: PalaceContentId;
  readonly total: number;
  readonly label: string;
  readonly hpModifier: number;
  readonly effectIds: readonly PalaceContentId[];
  readonly fixedSpellIds: readonly PalaceContentId[];
  readonly randomSpellDraws: number;
  readonly weaponId: PalaceContentId;
}

export const projectOriginalAdventurerCreationTableIds = {
  heritages: 'palace.creation.original.heritages',
  callings: 'palace.creation.original.callings',
  spells: 'palace.creation.original.spells',
} as const satisfies Readonly<Record<string, PalaceContentId>>;

export const projectOriginalStartingState = {
  id: 'palace.creation.original.starting-state',
  usableArms: 2,
  usableHands: 2,
  torches: 6,
  coins: 3,
  status: 'alive',
  location: 'town',
} as const;

export const projectOriginalEffects = [
  {
    id: 'palace.creation.original.effect.lantern-sense',
    label: 'Lantern Sense',
    trigger: 'make-check',
    operation: 'adjust-check',
    value: 1,
    limit: 'once-per-room',
    condition: 'finding a hidden route while carrying light',
  },
  {
    id: 'palace.creation.original.effect.briar-hide',
    label: 'Briar Hide',
    trigger: 'take-damage',
    operation: 'adjust-damage',
    value: -1,
    limit: 'once-per-room',
    condition: 'damage from a trap',
  },
  {
    id: 'palace.creation.original.effect.copper-balance',
    label: 'Copper Balance',
    trigger: 'make-check',
    operation: 'adjust-check',
    value: 1,
    limit: 'passive',
    condition: 'resisting a shove or fall',
  },
  {
    id: 'palace.creation.original.effect.rain-step',
    label: 'Rain Step',
    trigger: 'make-check',
    operation: 'adjust-check',
    value: 1,
    limit: 'passive',
    condition: 'crossing wet or flooded ground',
  },
  {
    id: 'palace.creation.original.effect.hearth-rest',
    label: 'Hearth Rest',
    trigger: 'rest',
    operation: 'adjust-healing',
    value: 1,
    limit: 'once-per-expedition',
    condition: 'taking a safe rest',
  },
  {
    id: 'palace.creation.original.effect.road-memory',
    label: 'Road Memory',
    trigger: 'retreat',
    operation: 'retain-map-detail',
    value: 1,
    limit: 'once-per-expedition',
    condition: 'retreating from the Palace',
  },
  {
    id: 'palace.creation.original.effect.cloud-warning',
    label: 'Cloud Warning',
    trigger: 'enter-room',
    operation: 'reveal-signal',
    value: 1,
    limit: 'once-per-room',
    condition: 'a magical hazard is present',
  },
  {
    id: 'palace.creation.original.effect.moss-grip',
    label: 'Moss Grip',
    trigger: 'make-check',
    operation: 'adjust-check',
    value: 1,
    limit: 'passive',
    condition: 'climbing or holding a closing door',
  },
  {
    id: 'palace.creation.original.effect.ember-ward',
    label: 'Ember Ward',
    trigger: 'take-damage',
    operation: 'adjust-damage',
    value: -1,
    limit: 'once-per-room',
    condition: 'fire or heat damage',
  },
  {
    id: 'palace.creation.original.effect.moon-sight',
    label: 'Moon Sight',
    trigger: 'make-check',
    operation: 'adjust-check',
    value: 1,
    limit: 'passive',
    condition: 'acting in darkness',
  },
  {
    id: 'palace.creation.original.effect.dawn-resolve',
    label: 'Dawn Resolve',
    trigger: 'take-damage',
    operation: 'survive-at-one',
    value: 1,
    limit: 'once-per-expedition',
    condition: 'damage would reduce current HP below one',
  },
  {
    id: 'palace.creation.original.effect.measured-route',
    label: 'Measured Route',
    trigger: 'retreat',
    operation: 'retain-map-detail',
    value: 1,
    limit: 'once-per-expedition',
    condition: 'choosing one previously revealed connection',
  },
  {
    id: 'palace.creation.original.effect.hold-line',
    label: 'Hold the Line',
    trigger: 'make-check',
    operation: 'adjust-check',
    value: 1,
    limit: 'once-per-room',
    condition: 'defending an ally or doorway',
  },
  {
    id: 'palace.creation.original.effect.jury-rig',
    label: 'Jury-Rig',
    trigger: 'rest',
    operation: 'preserve-resource',
    value: 1,
    limit: 'once-per-expedition',
    condition: 'repairing one carried mundane item',
  },
  {
    id: 'palace.creation.original.effect.quiet-entry',
    label: 'Quiet Entry',
    trigger: 'enter-room',
    operation: 'adjust-check',
    value: 1,
    limit: 'once-per-room',
    condition: 'making the first stealth check in an unexplored room',
  },
  {
    id: 'palace.creation.original.effect.camp-broth',
    label: 'Camp Broth',
    trigger: 'rest',
    operation: 'adjust-healing',
    value: 1,
    limit: 'once-per-expedition',
    condition: 'sharing a safe rest',
  },
  {
    id: 'palace.creation.original.effect.good-leverage',
    label: 'Good Leverage',
    trigger: 'make-check',
    operation: 'adjust-check',
    value: 1,
    limit: 'passive',
    condition: 'forcing a stuck door or lifting debris',
  },
  {
    id: 'palace.creation.original.effect.echo-reading',
    label: 'Echo Reading',
    trigger: 'enter-room',
    operation: 'reveal-signal',
    value: 1,
    limit: 'once-per-room',
    condition: 'an encounter is present beyond an adjacent door',
  },
  {
    id: 'palace.creation.original.effect.field-dressing',
    label: 'Field Dressing',
    trigger: 'rest',
    operation: 'adjust-healing',
    value: 2,
    limit: 'once-per-expedition',
    condition: 'treating wounds after an encounter',
  },
  {
    id: 'palace.creation.original.effect.beast-pace',
    label: 'Beast Pace',
    trigger: 'make-check',
    operation: 'adjust-check',
    value: 1,
    limit: 'passive',
    condition: 'fleeing or pursuing',
  },
  {
    id: 'palace.creation.original.effect.knot-ward',
    label: 'Knot Ward',
    trigger: 'spend-charge',
    operation: 'preserve-resource',
    value: 1,
    limit: 'once-per-expedition',
    condition: 'spending a spell charge',
  },
  {
    id: 'palace.creation.original.effect.noon-guard',
    label: 'Noon Guard',
    trigger: 'make-check',
    operation: 'adjust-check',
    value: 1,
    limit: 'once-per-room',
    condition: 'defending while at least one torch remains',
  },
] as const satisfies readonly ProjectOriginalEffectDefinition[];

export const projectOriginalSpells = [
  {
    id: 'palace.creation.original.spell.guiding-spark',
    total: 1,
    label: 'Guiding Spark',
    effectId: 'palace.creation.original.effect.lantern-sense',
    chargesPerGrant: 1,
  },
  {
    id: 'palace.creation.original.spell.mending-thread',
    total: 2,
    label: 'Mending Thread',
    effectId: 'palace.creation.original.effect.field-dressing',
    chargesPerGrant: 1,
  },
  {
    id: 'palace.creation.original.spell.hushfield',
    total: 3,
    label: 'Hushfield',
    effectId: 'palace.creation.original.effect.quiet-entry',
    chargesPerGrant: 1,
  },
  {
    id: 'palace.creation.original.spell.stonepulse',
    total: 4,
    label: 'Stonepulse',
    effectId: 'palace.creation.original.effect.good-leverage',
    chargesPerGrant: 1,
  },
  {
    id: 'palace.creation.original.spell.veilstep',
    total: 5,
    label: 'Veilstep',
    effectId: 'palace.creation.original.effect.moon-sight',
    chargesPerGrant: 1,
  },
  {
    id: 'palace.creation.original.spell.binding-vine',
    total: 6,
    label: 'Binding Vine',
    effectId: 'palace.creation.original.effect.briar-hide',
    chargesPerGrant: 1,
  },
] as const satisfies readonly ProjectOriginalSpellDefinition[];

export const projectOriginalWeapons = [
  {
    id: 'palace.creation.original.weapon.surveyor-staff',
    label: 'Surveyor Staff',
    hands: 2,
    damage: { diceCount: 1, dieSides: 6, modifier: 0, damageType: 'physical' },
  },
  {
    id: 'palace.creation.original.weapon.ward-pike',
    label: 'Ward Pike',
    hands: 2,
    damage: { diceCount: 1, dieSides: 8, modifier: 0, damageType: 'physical' },
  },
  {
    id: 'palace.creation.original.weapon.ratchet-bow',
    label: 'Ratchet Bow',
    hands: 2,
    damage: { diceCount: 1, dieSides: 6, modifier: 0, damageType: 'physical' },
  },
  {
    id: 'palace.creation.original.weapon.scout-sling',
    label: 'Scout Sling',
    hands: 1,
    damage: { diceCount: 1, dieSides: 4, modifier: 0, damageType: 'physical' },
  },
  {
    id: 'palace.creation.original.weapon.camp-cleaver',
    label: 'Camp Cleaver',
    hands: 1,
    damage: { diceCount: 1, dieSides: 6, modifier: 0, damageType: 'physical' },
  },
  {
    id: 'palace.creation.original.weapon.delver-pick',
    label: 'Delver Pick',
    hands: 2,
    damage: { diceCount: 1, dieSides: 8, modifier: 0, damageType: 'physical' },
  },
  {
    id: 'palace.creation.original.weapon.resonance-mace',
    label: 'Resonance Mace',
    hands: 1,
    damage: { diceCount: 1, dieSides: 6, modifier: 0, damageType: 'physical' },
  },
  {
    id: 'palace.creation.original.weapon.field-knife',
    label: 'Field Knife',
    hands: 1,
    damage: { diceCount: 1, dieSides: 4, modifier: 1, damageType: 'physical' },
  },
  {
    id: 'palace.creation.original.weapon.runner-spear',
    label: 'Runner Spear',
    hands: 2,
    damage: { diceCount: 1, dieSides: 6, modifier: 1, damageType: 'physical' },
  },
  {
    id: 'palace.creation.original.weapon.sigil-rod',
    label: 'Sigil Rod',
    hands: 1,
    damage: { diceCount: 1, dieSides: 4, modifier: 0, damageType: 'physical' },
  },
  {
    id: 'palace.creation.original.weapon.sunblade',
    label: 'Sunblade',
    hands: 1,
    damage: { diceCount: 1, dieSides: 8, modifier: 0, damageType: 'physical' },
  },
] as const satisfies readonly ProjectOriginalWeaponDefinition[];

export const projectOriginalHeritages = [
  {
    id: 'palace.creation.original.heritage.lanternblood',
    total: 2,
    label: 'Lanternblood',
    baseHp: 8,
    effectIds: ['palace.creation.original.effect.lantern-sense'],
    fixedSpellIds: ['palace.creation.original.spell.guiding-spark'],
    randomSpellDraws: 0,
  },
  {
    id: 'palace.creation.original.heritage.briarbound',
    total: 3,
    label: 'Briarbound',
    baseHp: 10,
    effectIds: ['palace.creation.original.effect.briar-hide'],
    fixedSpellIds: ['palace.creation.original.spell.binding-vine'],
    randomSpellDraws: 0,
  },
  {
    id: 'palace.creation.original.heritage.copperheart',
    total: 4,
    label: 'Copperheart',
    baseHp: 12,
    effectIds: ['palace.creation.original.effect.copper-balance'],
    fixedSpellIds: [],
    randomSpellDraws: 0,
  },
  {
    id: 'palace.creation.original.heritage.rainstrider',
    total: 5,
    label: 'Rainstrider',
    baseHp: 9,
    effectIds: ['palace.creation.original.effect.rain-step'],
    fixedSpellIds: [],
    randomSpellDraws: 0,
  },
  {
    id: 'palace.creation.original.heritage.hearthborn',
    total: 6,
    label: 'Hearthborn',
    baseHp: 11,
    effectIds: ['palace.creation.original.effect.hearth-rest'],
    fixedSpellIds: [],
    randomSpellDraws: 0,
  },
  {
    id: 'palace.creation.original.heritage.roadwise',
    total: 7,
    label: 'Roadwise',
    baseHp: 10,
    effectIds: ['palace.creation.original.effect.road-memory'],
    fixedSpellIds: [],
    randomSpellDraws: 0,
  },
  {
    id: 'palace.creation.original.heritage.cloud-touched',
    total: 8,
    label: 'Cloud-Touched',
    baseHp: 9,
    effectIds: ['palace.creation.original.effect.cloud-warning'],
    fixedSpellIds: [],
    randomSpellDraws: 1,
  },
  {
    id: 'palace.creation.original.heritage.mossback',
    total: 9,
    label: 'Mossback',
    baseHp: 13,
    effectIds: ['palace.creation.original.effect.moss-grip'],
    fixedSpellIds: [],
    randomSpellDraws: 0,
  },
  {
    id: 'palace.creation.original.heritage.embervein',
    total: 10,
    label: 'Embervein',
    baseHp: 11,
    effectIds: ['palace.creation.original.effect.ember-ward'],
    fixedSpellIds: ['palace.creation.original.spell.stonepulse'],
    randomSpellDraws: 0,
  },
  {
    id: 'palace.creation.original.heritage.moon-eyed',
    total: 11,
    label: 'Moon-Eyed',
    baseHp: 8,
    effectIds: ['palace.creation.original.effect.moon-sight'],
    fixedSpellIds: [],
    randomSpellDraws: 1,
  },
  {
    id: 'palace.creation.original.heritage.dawnmarked',
    total: 12,
    label: 'Dawnmarked',
    baseHp: 10,
    effectIds: ['palace.creation.original.effect.dawn-resolve'],
    fixedSpellIds: ['palace.creation.original.spell.mending-thread'],
    randomSpellDraws: 0,
  },
] as const satisfies readonly ProjectOriginalHeritageDefinition[];

export const projectOriginalCallings = [
  {
    id: 'palace.creation.original.calling.rift-cartographer',
    total: 2,
    label: 'Rift Cartographer',
    hpModifier: -1,
    effectIds: ['palace.creation.original.effect.measured-route'],
    fixedSpellIds: [],
    randomSpellDraws: 0,
    weaponId: 'palace.creation.original.weapon.surveyor-staff',
  },
  {
    id: 'palace.creation.original.calling.gate-warden',
    total: 3,
    label: 'Gate Warden',
    hpModifier: 2,
    effectIds: ['palace.creation.original.effect.hold-line'],
    fixedSpellIds: [],
    randomSpellDraws: 0,
    weaponId: 'palace.creation.original.weapon.ward-pike',
  },
  {
    id: 'palace.creation.original.calling.relic-tinker',
    total: 4,
    label: 'Relic Tinker',
    hpModifier: 0,
    effectIds: ['palace.creation.original.effect.jury-rig'],
    fixedSpellIds: [],
    randomSpellDraws: 0,
    weaponId: 'palace.creation.original.weapon.ratchet-bow',
  },
  {
    id: 'palace.creation.original.calling.gloom-scout',
    total: 5,
    label: 'Gloom Scout',
    hpModifier: 0,
    effectIds: ['palace.creation.original.effect.quiet-entry'],
    fixedSpellIds: [],
    randomSpellDraws: 0,
    weaponId: 'palace.creation.original.weapon.scout-sling',
  },
  {
    id: 'palace.creation.original.calling.trail-cook',
    total: 6,
    label: 'Trail Cook',
    hpModifier: 1,
    effectIds: ['palace.creation.original.effect.camp-broth'],
    fixedSpellIds: [],
    randomSpellDraws: 0,
    weaponId: 'palace.creation.original.weapon.camp-cleaver',
  },
  {
    id: 'palace.creation.original.calling.vault-delver',
    total: 7,
    label: 'Vault Delver',
    hpModifier: 2,
    effectIds: ['palace.creation.original.effect.good-leverage'],
    fixedSpellIds: [],
    randomSpellDraws: 0,
    weaponId: 'palace.creation.original.weapon.delver-pick',
  },
  {
    id: 'palace.creation.original.calling.echo-listener',
    total: 8,
    label: 'Echo Listener',
    hpModifier: -1,
    effectIds: ['palace.creation.original.effect.echo-reading'],
    fixedSpellIds: ['palace.creation.original.spell.hushfield'],
    randomSpellDraws: 0,
    weaponId: 'palace.creation.original.weapon.resonance-mace',
  },
  {
    id: 'palace.creation.original.calling.field-chirurgeon',
    total: 9,
    label: 'Field Chirurgeon',
    hpModifier: 0,
    effectIds: ['palace.creation.original.effect.field-dressing'],
    fixedSpellIds: [],
    randomSpellDraws: 0,
    weaponId: 'palace.creation.original.weapon.field-knife',
  },
  {
    id: 'palace.creation.original.calling.beast-runner',
    total: 10,
    label: 'Beast Runner',
    hpModifier: 1,
    effectIds: ['palace.creation.original.effect.beast-pace'],
    fixedSpellIds: [],
    randomSpellDraws: 0,
    weaponId: 'palace.creation.original.weapon.runner-spear',
  },
  {
    id: 'palace.creation.original.calling.rune-binder',
    total: 11,
    label: 'Rune Binder',
    hpModifier: -1,
    effectIds: ['palace.creation.original.effect.knot-ward'],
    fixedSpellIds: [],
    randomSpellDraws: 1,
    weaponId: 'palace.creation.original.weapon.sigil-rod',
  },
  {
    id: 'palace.creation.original.calling.sun-guard',
    total: 12,
    label: 'Sun Guard',
    hpModifier: 3,
    effectIds: ['palace.creation.original.effect.noon-guard'],
    fixedSpellIds: ['palace.creation.original.spell.guiding-spark'],
    randomSpellDraws: 0,
    weaponId: 'palace.creation.original.weapon.sunblade',
  },
] as const satisfies readonly ProjectOriginalCallingDefinition[];

const unrecordedHash =
  'sha256:0000000000000000000000000000000000000000000000000000000000000000' as const;

/**
 * Generated from each entry's
 * palace-manifest-entry-integrity-payload.v0.1 canonical JSON. The integrity
 * adapter test rejects stale or missing values.
 */
export const projectOriginalAdventurerCreationHashes: Readonly<
  Partial<Record<PalaceContentId, `sha256:${string}`>>
> = {
  'palace.creation.original.heritages':
    'sha256:83079412e0075fcffab20ef043714c05e773e370f6adad63f7877227e71fa3c2',
  'palace.creation.original.callings':
    'sha256:220b83d0ee2b9bb8d4b40ac1977f2e4dfa6bf079e05a0b85cd78ddc388eee009',
  'palace.creation.original.spells':
    'sha256:e1a79696d5200a65f7a14d2f5b4084739d9b63bcb2e1bef0257874240a41aefd',
  'palace.creation.original.heritage.lanternblood':
    'sha256:8f1203ca6b3dec05631fa69d98056e3eaad759353ba605a6cf1bf26f62f2841e',
  'palace.creation.original.heritage.briarbound':
    'sha256:26fda62f2440ad79f733a85a000322d33770e4726897daaa7b017cd0d0fdda7e',
  'palace.creation.original.heritage.copperheart':
    'sha256:5538c1b4b234c9ca348348a4d4c46ad06401a45900b9bb2bd976cbdb11a341b9',
  'palace.creation.original.heritage.rainstrider':
    'sha256:d6852de61ea9722d9dc3cc0e1c171e9be8bdf1b1817af432f530b46be15841b8',
  'palace.creation.original.heritage.hearthborn':
    'sha256:8a1ae9ca8d556f354d99bc80d4649ee5b007e1be76b0f88ad8cf08c20727b86b',
  'palace.creation.original.heritage.roadwise':
    'sha256:e0b78d8050083830f21aef663c2355167219275ea440af7990c2ac6b388e2596',
  'palace.creation.original.heritage.cloud-touched':
    'sha256:b2e3d94e50f2de29afcf13aacacc7fca215b27f39aac4542e878b170e8b9471d',
  'palace.creation.original.heritage.mossback':
    'sha256:96f7720edd5595be1d0ee8b752bba0969016dd16f7d8002f292cfbf961e521a5',
  'palace.creation.original.heritage.embervein':
    'sha256:4702ac2793dcdbf652ead05b40ba7f97c303455a8bb29bf6e5e064d4d5c58a91',
  'palace.creation.original.heritage.moon-eyed':
    'sha256:8385e1cffbe733e0bbb8c880dc355f7e62239d6155f897bc62a7666f56ece69c',
  'palace.creation.original.heritage.dawnmarked':
    'sha256:c926d5e0412f62d61edfcb5bca05b1f8251c41668d51f625330e3aa5d4713f35',
  'palace.creation.original.calling.rift-cartographer':
    'sha256:951e56a599e03481c6b5a17eafd9563e9e90e9e4f3f38080fc86cd4dc17b71da',
  'palace.creation.original.calling.gate-warden':
    'sha256:2922c5c2cb15f877ef921ee30a2a962893d03cf33f29afa6e6bc42f0d9e74583',
  'palace.creation.original.calling.relic-tinker':
    'sha256:a43331ceef755d82702a40924c6ad7289033d580224acba90bd16149d401948e',
  'palace.creation.original.calling.gloom-scout':
    'sha256:0c62b6f24ee07cefbaa0b6af1da4c221eaada5c1a48356d37e728b29ef7ffd9e',
  'palace.creation.original.calling.trail-cook':
    'sha256:9d53a34f3db4f92b7ec01c64f06666300888778556ba2e383a30b2073e24647a',
  'palace.creation.original.calling.vault-delver':
    'sha256:5397a29f49d86ff6ddac5e39ca7e6763f41029ddb75747d98a8f245c3d33379b',
  'palace.creation.original.calling.echo-listener':
    'sha256:34f4cce9ef3bc112294aca3f66e8f36f8ac43a813fa984976c55ee7eec1c346e',
  'palace.creation.original.calling.field-chirurgeon':
    'sha256:f44c4e7d66bd01148b0bdd2535321c67c34bdfde55ebe300f49fc95a01629f6d',
  'palace.creation.original.calling.beast-runner':
    'sha256:75ca17acbcae55722944ba6a6a904afc06da9f23ce45bb3e15acd9de72a00c8d',
  'palace.creation.original.calling.rune-binder':
    'sha256:00cceb07fc027425e0b8e727498043bec219843ae2debe0b8e87cad26ebdb98d',
  'palace.creation.original.calling.sun-guard':
    'sha256:15645f30f66aae83e5ce625106e156d8b3c9c28f3bda8a9dd36deb6f2c41ac29',
  'palace.creation.original.spell.guiding-spark':
    'sha256:638cef0e08a5edd5ddf25d4a6529e0e87823e2038916f527762494c1de415baf',
  'palace.creation.original.spell.mending-thread':
    'sha256:2761454ba354281752f4d7dfff1f3240fe65fdc828e405c0fe5f4d2bd40b6251',
  'palace.creation.original.spell.hushfield':
    'sha256:327ab09efd5a9d8a79d1ee5c4713260b33cc50c16c0fede4a6bb209c425d8366',
  'palace.creation.original.spell.stonepulse':
    'sha256:52c4c19e4fd07216356c66fd581e55f3531040b51f3b579fc23fe1bb4d2d359e',
  'palace.creation.original.spell.veilstep':
    'sha256:e997ff3ce45e1870c73e655948c70d759f04e6692fc2cb8a1eca4f11c4a11d16',
  'palace.creation.original.spell.binding-vine':
    'sha256:25fcde2215a49eb558eafa73bf994a02c8f5be8e8cc32aa8b078a18bb450920f',
  'palace.creation.original.effect.lantern-sense':
    'sha256:6d65eb2f6648a2110a3b221546e2221a50209224d33e54302aae0bbf62964b22',
  'palace.creation.original.effect.briar-hide':
    'sha256:2363736d72427400377bb4506630ef9b6f5deba6ceb3061bbe964f201721bf38',
  'palace.creation.original.effect.copper-balance':
    'sha256:846c2ce34335ac9b37c127c1d33a9eda23b2c895de21bef7514405032f222067',
  'palace.creation.original.effect.rain-step':
    'sha256:1e9466cd14d3ab34a24fb18415ae7f22b8fb1d7d0c2f8a679bbe93e38a987ed9',
  'palace.creation.original.effect.hearth-rest':
    'sha256:68d68214b5aefcfe991120784e78491a700f3e052a52ed016bbb934a7a04a884',
  'palace.creation.original.effect.road-memory':
    'sha256:2fddb21454d41d3bff0488d28741f2cda5a82ca00d9e720b1a1bc665521aa455',
  'palace.creation.original.effect.cloud-warning':
    'sha256:dc459830173fc75c88de166550115225ec079f6e5002fbf64c0611895b74d7c9',
  'palace.creation.original.effect.moss-grip':
    'sha256:f0f97587942213ca02e83a0ad5a9d15ed6552fb2a62a7696a0a103bd31eba5c4',
  'palace.creation.original.effect.ember-ward':
    'sha256:9ba9fdbf16f6f8a34df5cbebc83b5b7d61de6ebe65e14339c7ded5f3db9fb8f3',
  'palace.creation.original.effect.moon-sight':
    'sha256:d9617a13c6678fea4bed9d79a885dddb70ed1ca00bdeef40390a884d2dbfd6b6',
  'palace.creation.original.effect.dawn-resolve':
    'sha256:f96dff83b90efa555b4618c0270adc4c129e65f8431b78d0ba56ded0ef16b42e',
  'palace.creation.original.effect.measured-route':
    'sha256:35073f6ad036d96ffcc3d71c7fd29cb3d6283c1630a4f4a54dc00fd7358b1751',
  'palace.creation.original.effect.hold-line':
    'sha256:e8b279919ea36efdf92c7a094f699f3b470ef1a3fe87dbdc74bb529228192fa0',
  'palace.creation.original.effect.jury-rig':
    'sha256:de8ca8369a0f98f5930c9c319c44bbdabc72df9c668197a5c8dfd46ab8c2325f',
  'palace.creation.original.effect.quiet-entry':
    'sha256:0d962ebba16c658db95bac01e579dd3cbe757e604ee6112fb674829f0756cb06',
  'palace.creation.original.effect.camp-broth':
    'sha256:2007fb87463ce97a4b3316fbb653700ff6265c3799308a53a0df1f2f230784b6',
  'palace.creation.original.effect.good-leverage':
    'sha256:2c88f260b436a21e23ca9c595e922ac1c49eebf741690ccdc392e3fd5effedff',
  'palace.creation.original.effect.echo-reading':
    'sha256:e800bacd2ad1a818fab30dc1a4553d2e4a101590360ef82e52196b6127204f05',
  'palace.creation.original.effect.field-dressing':
    'sha256:6bf8fac91e010b1d9a0b7cf0dbfde530c2db3012ba6e9b820bfe6f8c787721b5',
  'palace.creation.original.effect.beast-pace':
    'sha256:21741f03d7e40c72a3503afd4955be0af106bb1d4bcd0f238640c9ac730023e4',
  'palace.creation.original.effect.knot-ward':
    'sha256:4fd09514d7772e2fc195e8f7434ad43eb920ed4bcce71a47c46ebdf0d30a3b75',
  'palace.creation.original.effect.noon-guard':
    'sha256:d29414033c5cb7d2fc95764d52544800e4c46833f289747120d5c9145316acc6',
  'palace.creation.original.weapon.surveyor-staff':
    'sha256:86a7e9e5d7ad9637339a4294f7033b0cc78105eedc5e2c7f50b17bc0963a7770',
  'palace.creation.original.weapon.ward-pike':
    'sha256:ef8281cf9f5cc24a48b84cc0ef4e8d33cfc72040ebd7cf7ea6c1d4cc54cc87fc',
  'palace.creation.original.weapon.ratchet-bow':
    'sha256:8141a75f36d13aa59a42b877a6c25fac3b8878d6b0bffb0a98523728849bc4e1',
  'palace.creation.original.weapon.scout-sling':
    'sha256:78d0e9dc44e7b6bb98149f769eeec7929bdb4fd6b812dd77020003868907e236',
  'palace.creation.original.weapon.camp-cleaver':
    'sha256:9c2f8fbe10ba7f04cf58e593d6bd281b4c3640952a72f551001998a06c6ca501',
  'palace.creation.original.weapon.delver-pick':
    'sha256:8b10ad3c4c31f53fc8954af1a156c98f414cf7b837930cb11543361e1acbc227',
  'palace.creation.original.weapon.resonance-mace':
    'sha256:67bb19a65fbc3e0d35e709d8bfdbcbd0f63585743fdcf81fdbe939c98b22f963',
  'palace.creation.original.weapon.field-knife':
    'sha256:d8301f1803064c16d68e8768c4b7df7058345d507bb979ad192119410a9e891e',
  'palace.creation.original.weapon.runner-spear':
    'sha256:7d385866d110fc4f93cb227947c9afe8fdcbf5908e2c5b30f047c57e8e9da817',
  'palace.creation.original.weapon.sigil-rod':
    'sha256:df67fbff2491213ad130ef36ebc12b0c208571e1d778b8a22b2d6219b8cf3ef0',
  'palace.creation.original.weapon.sunblade':
    'sha256:13b266084f4120e05fbbc047df177a91fbefec32a1cee171b1b77e9471ba6c1c',
  'palace.creation.original.starting-state':
    'sha256:03d31250d27a3d1c0a7d2fdae893f1c35533948b3f48e91f4d876aa7a71c8511',
};

const selectedReview: PalaceReviewState = {
  approvalState: 'selected',
  reviewerRole: 'product',
  reviewerReference: 'github:labax',
  reviewedAt: '2026-07-29T16:41:54.000Z',
  decisionReference: 'github:labax/NoteQuest#80-project-original-replacement',
  publicReleaseEligible: true,
};

function provenanceFor(id: PalaceContentId): PalaceProvenance {
  return {
    origin: 'project-original',
    sourceCategory: 'project_original',
    sourceName: 'NoteQuest Web Application project-original adventurer creation package',
    sourceLocation: 'packages/content/src/project-original-adventurer-creation.ts',
    sourceEditionVersion: projectOriginalAdventurerCreationContentVersion,
    sourceReferences: [
      {
        kind: 'controlled-evidence-record',
        sourceId: 'github:labax/NoteQuest#80-project-original-replacement',
        citationLabel: 'Issue #80 project-original replacement decision',
        locator: 'https://github.com/labax/NoteQuest/issues/80',
        sourceVersion: projectOriginalAdventurerCreationContentVersion,
        notes:
          'Original names, structured definitions, and presentation; no source prose, rows, art, layout, or trade dress.',
      },
    ],
    authorRightsHolder: 'NoteQuest Web Application project contributors',
    permissionLicenseId: 'PROJECT-ORIGINAL-ADVENTURER-CONTENT-1.0.0',
    rightsBasis:
      'Original project-authored content proposed at the project owner request; no source file content is reproduced.',
    evidenceReference: {
      publicId: 'NOTEQUEST-ISSUE-80-PROJECT-ORIGINAL-REPLACEMENT',
      location: 'https://github.com/labax/NoteQuest/issues/80',
      confidentiality: 'public-safe-reference',
    },
    permittedReleaseModes: ['internal-prototype', 'closed-palace-playtest', 'public-free-core-mvp'],
    restrictions: [
      'not-official-notequest-content',
      'contains-no-source-derived-expression',
      'future-commercial-requires-separate-decision',
    ],
    attributionRequired: false,
    attributionNoticeId: null,
    noticeLocations: ['content-manifest', 'release-evidence-package'],
    modifications: ['Initial project-original edition; no source-derived transformation.'],
    compatibilityPolicy: 'saved-history-pins-content-version',
    contentHash: {
      status: 'recorded',
      algorithm: 'SHA-256',
      canonicalization: 'RFC-8785',
      value: projectOriginalAdventurerCreationHashes[id] ?? unrecordedHash,
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
): PalaceManifestEntry {
  return {
    ...definition,
    version: projectOriginalAdventurerCreationContentVersion,
    provenance: provenanceFor(definition.id),
    review: selectedReview,
  };
}

const tableEntries = [
  entry({
    id: projectOriginalAdventurerCreationTableIds.heritages,
    contentType: 'table',
    kind: 'table',
    label: 'Project-original heritage table',
    tags: ['palace', 'adventurer-creation', 'heritage', 'project-original'],
    references: projectOriginalHeritages.map((heritage) => heritage.id),
    structuredDefinition: {
      dice: '2d6',
      drawCount: 1,
      resultField: 'total',
      purpose: 'Select one project-original heritage.',
    },
  }),
  entry({
    id: projectOriginalAdventurerCreationTableIds.callings,
    contentType: 'table',
    kind: 'table',
    label: 'Project-original calling table',
    tags: ['palace', 'adventurer-creation', 'calling', 'project-original'],
    references: projectOriginalCallings.map((calling) => calling.id),
    structuredDefinition: {
      dice: '2d6',
      drawCount: 1,
      resultField: 'total',
      purpose: 'Select one project-original calling.',
    },
  }),
  entry({
    id: projectOriginalAdventurerCreationTableIds.spells,
    contentType: 'table',
    kind: 'table',
    label: 'Project-original spell table',
    tags: ['palace', 'adventurer-creation', 'spell', 'project-original'],
    references: projectOriginalSpells.map((spell) => spell.id),
    structuredDefinition: {
      dice: '1d6',
      drawCount: 1,
      resultField: 'total',
      purpose: 'Select one project-original spell charge.',
    },
  }),
] as const;

const heritageEntries = projectOriginalHeritages.map((heritage) =>
  entry({
    id: heritage.id,
    contentType: 'row',
    kind: 'table-row',
    label: heritage.label,
    parentId: projectOriginalAdventurerCreationTableIds.heritages,
    range: {
      dice: '2d6',
      rangeId: `${heritage.id}.total-${heritage.total}`,
      from: heritage.total,
      to: heritage.total,
    },
    references: [...heritage.effectIds, ...heritage.fixedSpellIds],
    tags: ['palace', 'adventurer-creation', 'heritage', 'project-original'],
    structuredDefinition: {
      total: heritage.total,
      baseHp: heritage.baseHp,
      effectIds: heritage.effectIds,
      fixedSpellIds: heritage.fixedSpellIds,
      randomSpellDraws: heritage.randomSpellDraws,
    },
  }),
);

const callingEntries = projectOriginalCallings.map((calling) =>
  entry({
    id: calling.id,
    contentType: 'row',
    kind: 'table-row',
    label: calling.label,
    parentId: projectOriginalAdventurerCreationTableIds.callings,
    range: {
      dice: '2d6',
      rangeId: `${calling.id}.total-${calling.total}`,
      from: calling.total,
      to: calling.total,
    },
    references: [...calling.effectIds, ...calling.fixedSpellIds, calling.weaponId],
    tags: ['palace', 'adventurer-creation', 'calling', 'project-original'],
    structuredDefinition: {
      total: calling.total,
      hpModifier: calling.hpModifier,
      effectIds: calling.effectIds,
      fixedSpellIds: calling.fixedSpellIds,
      randomSpellDraws: calling.randomSpellDraws,
      weaponId: calling.weaponId,
    },
  }),
);

const spellEntries = projectOriginalSpells.map((spell) =>
  entry({
    id: spell.id,
    contentType: 'row',
    kind: 'table-row',
    label: spell.label,
    parentId: projectOriginalAdventurerCreationTableIds.spells,
    range: {
      dice: '1d6',
      rangeId: `${spell.id}.total-${spell.total}`,
      from: spell.total,
      to: spell.total,
    },
    references: [spell.effectId],
    tags: ['palace', 'adventurer-creation', 'spell', 'project-original'],
    structuredDefinition: {
      total: spell.total,
      effectId: spell.effectId,
      chargesPerGrant: spell.chargesPerGrant,
    },
  }),
);

const effectEntries = projectOriginalEffects.map((effect) =>
  entry({
    id: effect.id,
    contentType: 'definition',
    kind: 'mechanic-reference',
    label: effect.label,
    tags: ['palace', 'adventurer-creation', 'effect', 'project-original'],
    structuredDefinition: {
      trigger: effect.trigger,
      operation: effect.operation,
      value: effect.value,
      limit: effect.limit,
      condition: effect.condition,
    },
  }),
);

const weaponEntries = projectOriginalWeapons.map((weapon) =>
  entry({
    id: weapon.id,
    contentType: 'definition',
    kind: 'mechanic-reference',
    label: weapon.label,
    tags: ['palace', 'adventurer-creation', 'weapon', 'project-original'],
    structuredDefinition: {
      hands: weapon.hands,
      damage: weapon.damage,
    },
  }),
);

const startingStateEntry = entry({
  id: projectOriginalStartingState.id,
  contentType: 'definition',
  kind: 'mechanic-reference',
  label: 'Project-original starting state',
  tags: ['palace', 'adventurer-creation', 'starting-state', 'project-original'],
  structuredDefinition: {
    usableArms: projectOriginalStartingState.usableArms,
    usableHands: projectOriginalStartingState.usableHands,
    torches: projectOriginalStartingState.torches,
    coins: projectOriginalStartingState.coins,
    status: projectOriginalStartingState.status,
    location: projectOriginalStartingState.location,
  },
});

export const projectOriginalAdventurerCreationManifest = {
  schemaVersion: palaceContentManifestSchemaVersion,
  packageId: palaceContentPackageId,
  contentVersion: projectOriginalAdventurerCreationContentVersion,
  rulesVersion: projectOriginalAdventurerCreationRulesVersion,
  generatedAt: '2026-07-29T00:00:00.000Z',
  entries: [
    ...tableEntries,
    ...heritageEntries,
    ...callingEntries,
    ...spellEntries,
    ...effectEntries,
    ...weaponEntries,
    startingStateEntry,
  ],
} as const satisfies PalaceContentManifest;
