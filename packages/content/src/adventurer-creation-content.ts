/** Permissioned structured mechanics only; contains no source prose, art, layout, or trade dress. */
export const palaceAdventurerCreationApproval = {
  packageId: 'palace',
  contentVersion: '0.1.0',
  rulesVersion: 'digital-rules-specification-v0.1',
  approvalState: 'selected',
  sourceCategories: ['notequest_permissioned_mechanics', 'notequest_permissioned_names'],
  permittedReleaseModes: ['internal-prototype', 'closed-palace-playtest', 'public-free-core-mvp'],
  attributionRequired: false,
  integrity: {
    algorithm: 'SHA-256',
    canonicalization: 'RFC-8785',
    manifestEntry: 'palace.creation',
  },
  containsExactSourceProse: false,
  containsSourceArtwork: false,
  containsTradeDress: false,
} as const;

const raceData = [
  ['slimemen', 10, 0],
  ['lightbugster', 16, 0],
  ['pixie', 8, 5],
  ['gnome', 14, 3],
  ['elf', 16, 1],
  ['human', 20, 0],
  ['dwarf', 18, 0],
  ['halfling', 14, 0],
  ['cat_person', 19, 0],
  ['rinoceroid', 24, 0],
  ['dragonkin', 30, 0],
] as const;
const classData = [
  ['hobo', 4, 'wood_stick', 0],
  ['grave_digger', 2, 'shovel', 0],
  ['noble', 0, 'rapier', 1],
  ['schoolar', 0, 'dagger', 3],
  ['blacksmith', 4, 'hammer', 0],
  ['guard', 4, 'short_sword', 0],
  ['cook', 2, 'cleaver', 0],
  ['locksmith', 2, 'dagger', 0],
  ['lumberjack', 4, 'lumberjack_axe', 0],
  ['miner', 4, 'pickaxe', 0],
  ['gladiator', 6, 'short_sword', 0],
] as const;
const display = (value: string) =>
  value.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const palaceAdventurerCreationContent = {
  raceTableId: 'creation.races',
  classTableId: 'creation.classes',
  spellTableId: 'creation.basic_spells',
  races: raceData.map(([name, baseHp, startingSpellCharges], index) => ({
    id: `race.${name}`,
    total: index + 2,
    label: display(name),
    baseHp,
    startingSpellCharges,
    effectIds: [],
  })),
  classes: classData.map(([name, hpModifier, weapon, startingSpellCharges], index) => ({
    id: `class.${name}`,
    total: index + 2,
    label: display(name),
    hpModifier,
    startingSpellCharges,
    weapon: { definitionId: `item.${weapon}`, label: display(weapon), hands: 1 },
    effectIds: [],
  })),
  spells: Object.fromEntries(
    ['light', 'fireball', 'ward', 'mend', 'spark', 'veil'].map((name, index) => [
      index + 1,
      { id: `spell.${name}`, label: display(name) },
    ]),
  ),
} as const;
