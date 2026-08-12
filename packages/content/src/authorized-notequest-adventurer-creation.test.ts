import { describe, expect, it } from 'vitest';

import {
  authorizedNoteQuestAdventurerCreationHashes,
  authorizedNoteQuestAdventurerCreationManifest,
  authorizedNoteQuestAdventurerCreationTableIds,
  authorizedNoteQuestClasses,
  authorizedNoteQuestEffects,
  authorizedNoteQuestRaces,
  authorizedNoteQuestSpells,
  authorizedNoteQuestStartingState,
  authorizedNoteQuestWeapons,
} from './authorized-notequest-adventurer-creation.ts';
import { bundledContentStatus } from './index.ts';
import { validatePalaceContentManifest } from './palace-manifest.ts';

describe('authorized NoteQuest adventurer creation content', () => {
  it('selects the permissioned source package with public-safe rights evidence', () => {
    expect(bundledContentStatus).toBe('authorized-notequest-adventurer-creation-selected');
    expect(validatePalaceContentManifest(authorizedNoteQuestAdventurerCreationManifest)).toEqual({
      valid: true,
      errors: [],
    });

    for (const entry of authorizedNoteQuestAdventurerCreationManifest.entries) {
      expect(entry.provenance).toMatchObject({
        authorRightsHolder: 'Tiago Junges',
        permissionLicenseId: 'TIAGO-JUNGES-FULL-PERMISSION-OWNER-ATTESTATION-2026-07-29',
        attributionRequired: true,
        attributionNoticeId: 'NOTEQUEST-TIAGO-JUNGES-CREDIT-V1',
        containsExactSourceProse: false,
        containsSourceArtwork: false,
        containsTradeDress: false,
      });
      expect(entry.provenance.evidenceReference).toEqual({
        publicId: 'NOTEQUEST-ISSUE-80-TIAGO-JUNGES-PERMISSION-ATTESTATION',
        location: 'https://github.com/labax/NoteQuest/issues/80#issuecomment-5121522446',
        confidentiality: 'public-safe-reference',
      });
      expect(entry.provenance.permittedReleaseModes).toEqual(
        expect.arrayContaining([
          'internal-prototype',
          'closed-palace-playtest',
          'public-free-core-mvp',
          'future-commercial',
        ]),
      );
      expect(entry.review).toMatchObject({
        approvalState: 'selected',
        reviewerRole: 'product',
        reviewerReference: 'github:labax',
        publicReleaseEligible: true,
      });
      expect(entry.provenance.contentHash.value).toBe(
        authorizedNoteQuestAdventurerCreationHashes[entry.id],
      );
      expect(entry.provenance.contentHash.value).not.toMatch(/^sha256:0{64}$/);
    }
  });

  it('matches the canonical deterministic race, class, and Basic Spell tables', () => {
    expect(authorizedNoteQuestRaces.map(({ total }) => total)).toEqual([
      2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
    expect(authorizedNoteQuestClasses.map(({ total }) => total)).toEqual([
      2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
    expect(authorizedNoteQuestSpells.map(({ total }) => total)).toEqual([1, 2, 3, 4, 5, 6]);

    expect(
      authorizedNoteQuestRaces.map(({ id, baseHp, randomSpellDraws, fixedSpellGrants }) => ({
        id,
        baseHp,
        randomSpellDraws,
        fixedSpellGrants,
      })),
    ).toEqual([
      { id: 'race.slimemen', baseHp: 10, randomSpellDraws: 0, fixedSpellGrants: [] },
      {
        id: 'race.lightbugster',
        baseHp: 16,
        randomSpellDraws: 0,
        fixedSpellGrants: [{ spellId: 'spell.light', charges: 3 }],
      },
      { id: 'race.pixie', baseHp: 8, randomSpellDraws: 5, fixedSpellGrants: [] },
      { id: 'race.gnome', baseHp: 14, randomSpellDraws: 3, fixedSpellGrants: [] },
      { id: 'race.elf', baseHp: 16, randomSpellDraws: 1, fixedSpellGrants: [] },
      { id: 'race.human', baseHp: 20, randomSpellDraws: 0, fixedSpellGrants: [] },
      { id: 'race.dwarf', baseHp: 18, randomSpellDraws: 0, fixedSpellGrants: [] },
      { id: 'race.halfling', baseHp: 14, randomSpellDraws: 0, fixedSpellGrants: [] },
      { id: 'race.cat_person', baseHp: 19, randomSpellDraws: 0, fixedSpellGrants: [] },
      { id: 'race.rinoceroid', baseHp: 24, randomSpellDraws: 0, fixedSpellGrants: [] },
      {
        id: 'race.dragonkin',
        baseHp: 30,
        randomSpellDraws: 0,
        fixedSpellGrants: [{ spellId: 'spell.fireball', charges: 3 }],
      },
    ]);

    expect(
      authorizedNoteQuestClasses.map(({ id, hpModifier, weaponId, randomSpellDraws }) => ({
        id,
        hpModifier,
        weaponId,
        randomSpellDraws,
      })),
    ).toEqual([
      { id: 'class.hobo', hpModifier: 4, weaponId: 'weapon.wood_stick', randomSpellDraws: 0 },
      {
        id: 'class.grave_digger',
        hpModifier: 2,
        weaponId: 'weapon.shovel',
        randomSpellDraws: 0,
      },
      { id: 'class.noble', hpModifier: 0, weaponId: 'weapon.rapier', randomSpellDraws: 1 },
      {
        id: 'class.schoolar',
        hpModifier: 0,
        weaponId: 'weapon.dagger',
        randomSpellDraws: 3,
      },
      {
        id: 'class.blacksmith',
        hpModifier: 4,
        weaponId: 'weapon.hammer',
        randomSpellDraws: 0,
      },
      {
        id: 'class.guard',
        hpModifier: 4,
        weaponId: 'weapon.short_sword',
        randomSpellDraws: 0,
      },
      { id: 'class.cook', hpModifier: 2, weaponId: 'weapon.cleaver', randomSpellDraws: 0 },
      {
        id: 'class.locksmith',
        hpModifier: 2,
        weaponId: 'weapon.dagger',
        randomSpellDraws: 0,
      },
      {
        id: 'class.lumberjack',
        hpModifier: 4,
        weaponId: 'weapon.lumberjack_axe',
        randomSpellDraws: 0,
      },
      {
        id: 'class.miner',
        hpModifier: 4,
        weaponId: 'weapon.pickaxe',
        randomSpellDraws: 0,
      },
      {
        id: 'class.gladiator',
        hpModifier: 6,
        weaponId: 'weapon.short_sword',
        randomSpellDraws: 0,
      },
    ]);
  });

  it('enumerates every referenced effect, spell, weapon, notice, and starting value', () => {
    const entryIds = new Set(
      authorizedNoteQuestAdventurerCreationManifest.entries.map(({ id }) => id),
    );
    const effectIds = new Set(authorizedNoteQuestEffects.map(({ id }) => id));
    const spellIds = new Set(authorizedNoteQuestSpells.map(({ id }) => id));
    const weaponIds = new Set(authorizedNoteQuestWeapons.map(({ id }) => id));

    expect(entryIds).toContain(authorizedNoteQuestAdventurerCreationTableIds.races);
    expect(entryIds).toContain(authorizedNoteQuestAdventurerCreationTableIds.classes);
    expect(entryIds).toContain(authorizedNoteQuestAdventurerCreationTableIds.spells);
    expect(entryIds).toContain(authorizedNoteQuestStartingState.manifestId);
    expect(entryIds).toContain('palace.notice.notequest-tiago-junges-credit');

    for (const race of authorizedNoteQuestRaces) {
      expect(race.effectIds.every((id) => effectIds.has(id))).toBe(true);
      expect(race.fixedSpellGrants.every(({ spellId }) => spellIds.has(spellId))).toBe(true);
    }

    for (const characterClass of authorizedNoteQuestClasses) {
      expect(characterClass.effectIds.every((id) => effectIds.has(id))).toBe(true);
      expect(characterClass.fixedSpellGrants.every(({ spellId }) => spellIds.has(spellId))).toBe(
        true,
      );
      expect(weaponIds).toContain(characterClass.weaponId);
    }

    for (const spell of authorizedNoteQuestSpells) {
      expect(effectIds).toContain(spell.effectId);
    }

    for (const entry of authorizedNoteQuestAdventurerCreationManifest.entries) {
      for (const reference of entry.references ?? []) {
        expect(entryIds).toContain(reference);
      }
    }

    expect(authorizedNoteQuestStartingState).toMatchObject({
      usableArms: 2,
      usableHands: 2,
      torches: 10,
      coins: 0,
      status: 'alive',
      location: 'town',
    });
  });

  it('records the complete canonical starting-weapon expressions', () => {
    expect(
      authorizedNoteQuestWeapons.map(({ id, hands, damage }) => ({ id, hands, damage })),
    ).toEqual([
      {
        id: 'weapon.wood_stick',
        hands: 1,
        damage: { diceCount: 1, dieSides: 6, modifier: -2, damageType: 'physical' },
      },
      {
        id: 'weapon.shovel',
        hands: 1,
        damage: { diceCount: 1, dieSides: 6, modifier: -1, damageType: 'physical' },
      },
      {
        id: 'weapon.rapier',
        hands: 1,
        damage: { diceCount: 1, dieSides: 6, modifier: 1, damageType: 'physical' },
      },
      {
        id: 'weapon.dagger',
        hands: 1,
        damage: { diceCount: 1, dieSides: 6, modifier: -1, damageType: 'physical' },
      },
      {
        id: 'weapon.hammer',
        hands: 1,
        damage: { diceCount: 1, dieSides: 6, modifier: 0, damageType: 'physical' },
      },
      {
        id: 'weapon.short_sword',
        hands: 1,
        damage: { diceCount: 1, dieSides: 6, modifier: 0, damageType: 'physical' },
      },
      {
        id: 'weapon.cleaver',
        hands: 1,
        damage: { diceCount: 1, dieSides: 6, modifier: 0, damageType: 'physical' },
      },
      {
        id: 'weapon.lumberjack_axe',
        hands: 1,
        damage: { diceCount: 1, dieSides: 6, modifier: 0, damageType: 'physical' },
      },
      {
        id: 'weapon.pickaxe',
        hands: 1,
        damage: { diceCount: 1, dieSides: 6, modifier: -1, damageType: 'physical' },
      },
    ]);
  });
});
