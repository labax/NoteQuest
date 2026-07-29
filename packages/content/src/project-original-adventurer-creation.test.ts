import { describe, expect, it } from 'vitest';

import { bundledContentStatus } from './index.ts';
import {
  projectOriginalAdventurerCreationHashes,
  projectOriginalAdventurerCreationManifest,
  projectOriginalAdventurerCreationTableIds,
  projectOriginalCallings,
  projectOriginalEffects,
  projectOriginalHeritages,
  projectOriginalSpells,
  projectOriginalStartingState,
  projectOriginalWeapons,
} from './project-original-adventurer-creation.ts';
import { validatePalaceContentManifest } from './palace-manifest.ts';

describe('project-original adventurer creation content', () => {
  it('selects a complete rights-safe package instead of source-derived content', () => {
    expect(bundledContentStatus).toBe('project-original-adventurer-creation-selected');
    expect(validatePalaceContentManifest(projectOriginalAdventurerCreationManifest)).toEqual({
      valid: true,
      errors: [],
    });

    for (const entry of projectOriginalAdventurerCreationManifest.entries) {
      expect(entry.provenance).toMatchObject({
        origin: 'project-original',
        sourceCategory: 'project_original',
        attributionRequired: false,
        containsExactSourceProse: false,
        containsSourceArtwork: false,
        containsTradeDress: false,
      });
      expect(entry.provenance.permissionLicenseId).toBe(
        'PROJECT-ORIGINAL-ADVENTURER-CONTENT-1.0.0',
      );
      expect(entry.provenance.permittedReleaseModes).toEqual(
        expect.arrayContaining([
          'internal-prototype',
          'closed-palace-playtest',
          'public-free-core-mvp',
        ]),
      );
      expect(entry.review).toMatchObject({
        approvalState: 'selected',
        reviewerReference: 'github:labax',
        publicReleaseEligible: true,
      });
      expect(entry.provenance.contentHash.value).toBe(
        projectOriginalAdventurerCreationHashes[entry.id],
      );
      expect(entry.provenance.contentHash.value).not.toMatch(/^sha256:0{64}$/);
    }
  });

  it('provides complete deterministic table coverage and independent spell grants', () => {
    expect(projectOriginalHeritages).toHaveLength(11);
    expect(projectOriginalHeritages.map(({ total }) => total)).toEqual([
      2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
    expect(projectOriginalCallings).toHaveLength(11);
    expect(projectOriginalCallings.map(({ total }) => total)).toEqual([
      2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
    expect(projectOriginalSpells).toHaveLength(6);
    expect(projectOriginalSpells.map(({ total }) => total)).toEqual([1, 2, 3, 4, 5, 6]);

    expect(projectOriginalHeritages.some(({ fixedSpellIds }) => fixedSpellIds.length > 0)).toBe(
      true,
    );
    expect(projectOriginalHeritages.some(({ randomSpellDraws }) => randomSpellDraws > 0)).toBe(
      true,
    );
    expect(projectOriginalCallings.some(({ fixedSpellIds }) => fixedSpellIds.length > 0)).toBe(
      true,
    );
    expect(projectOriginalCallings.some(({ randomSpellDraws }) => randomSpellDraws > 0)).toBe(true);
  });

  it('enumerates every referenced effect, spell, and weapon as a versioned manifest entry', () => {
    const entryIds = new Set(projectOriginalAdventurerCreationManifest.entries.map(({ id }) => id));
    const effectIds = new Set(projectOriginalEffects.map(({ id }) => id));
    const spellIds = new Set(projectOriginalSpells.map(({ id }) => id));
    const weaponIds = new Set(projectOriginalWeapons.map(({ id }) => id));

    expect(entryIds).toContain(projectOriginalAdventurerCreationTableIds.heritages);
    expect(entryIds).toContain(projectOriginalAdventurerCreationTableIds.callings);
    expect(entryIds).toContain(projectOriginalAdventurerCreationTableIds.spells);
    expect(entryIds).toContain(projectOriginalStartingState.id);

    for (const heritage of projectOriginalHeritages) {
      expect(heritage.effectIds.every((id) => effectIds.has(id))).toBe(true);
      expect(heritage.fixedSpellIds.every((id) => spellIds.has(id))).toBe(true);
    }

    for (const calling of projectOriginalCallings) {
      expect(calling.effectIds.every((id) => effectIds.has(id))).toBe(true);
      expect(calling.fixedSpellIds.every((id) => spellIds.has(id))).toBe(true);
      expect(weaponIds).toContain(calling.weaponId);
    }

    for (const spell of projectOriginalSpells) {
      expect(effectIds).toContain(spell.effectId);
    }

    for (const entry of projectOriginalAdventurerCreationManifest.entries) {
      for (const reference of entry.references ?? []) {
        expect(entryIds).toContain(reference);
      }
    }
  });

  it('records complete starting weapon mechanics and explicit starting resources', () => {
    for (const weapon of projectOriginalWeapons) {
      expect(weapon.hands === 1 || weapon.hands === 2).toBe(true);
      expect([4, 6, 8]).toContain(weapon.damage.dieSides);
      expect(weapon.damage).toMatchObject({
        diceCount: 1,
        damageType: 'physical',
      });
    }

    expect(projectOriginalStartingState).toMatchObject({
      usableArms: 2,
      usableHands: 2,
      torches: 6,
      coins: 3,
      status: 'alive',
      location: 'town',
    });
  });
});
