import { createSha256Hasher, serializeCanonicalJson } from '@notequest/infrastructure';
import { describe, expect, it } from 'vitest';
import {
  authorizedNoteQuestAdventurerCreationContentVersion,
  authorizedNoteQuestAdventurerCreationTableIds,
  authorizedNoteQuestSpells,
} from './authorized-notequest-adventurer-creation.ts';
import {
  authorizedPalaceRewardManifest,
  authorizedPalaceRewardPackage,
  authorizedPalaceRoomFollowOnContract,
} from './authorized-palace-rewards.ts';
import {
  getPalaceRoomFollowOn,
  resolvePalaceRewardBasicSpellRoll,
  resolvePalaceRewardRoll,
  validatePalaceRewardContent,
} from './palace-reward-content.ts';
import { validatePalaceContentManifest } from './palace-manifest.ts';
import { validatePalaceManifestIntegrity } from './palace-manifest-integrity.ts';

type Mutable<T> = T extends readonly (infer Item)[]
  ? Mutable<Item>[]
  : T extends object
    ? { -readonly [Key in keyof T]: Mutable<T[Key]> }
    : T;

type MutableRewardManifest = Mutable<typeof authorizedPalaceRewardManifest>;

const integrityAdapters = {
  canonicalJson: { serializeCanonicalJson },
  sha256: createSha256Hasher(),
};

describe('authorized Palace reward content', () => {
  it('bundles the complete selected follow-on package with provenance and valid hashes', async () => {
    expect(authorizedPalaceRewardPackage.tables).toHaveLength(5);
    expect(authorizedPalaceRewardManifest.entries).toHaveLength(37);
    expect(validatePalaceContentManifest(authorizedPalaceRewardManifest)).toEqual({
      valid: true,
      errors: [],
    });
    expect(validatePalaceRewardContent(authorizedPalaceRewardManifest)).toMatchObject({
      ok: true,
      content: authorizedPalaceRewardPackage,
    });
    await expect(
      validatePalaceManifestIntegrity(authorizedPalaceRewardManifest, integrityAdapters),
    ).resolves.toMatchObject({ valid: true, errors: [] });

    for (const entry of authorizedPalaceRewardManifest.entries) {
      expect(entry.provenance).toMatchObject({
        origin: 'approved-source',
        authorRightsHolder: 'Tiago Junges',
        permissionLicenseId: 'TIAGO-JUNGES-FULL-PERMISSION-OWNER-ATTESTATION-2026-07-29',
        attributionRequired: true,
        containsExactSourceProse: false,
        containsSourceArtwork: false,
        containsTradeDress: false,
      });
      expect(entry.provenance.sourceReferences.map(({ sourceId }) => sourceId)).toEqual(
        expect.arrayContaining([
          'ISSUE-181',
          'NOTEQUEST-ISSUE-80-TIAGO-JUNGES-PERMISSION-ATTESTATION',
        ]),
      );
      expect(entry.provenance.contentHash.value).not.toMatch(/^sha256:0{64}$/);
    }
  });

  it('resolves every boundary from all five tables without depending on entry order', () => {
    for (const table of authorizedPalaceRewardPackage.tables) {
      expect(table.rows).toHaveLength(6);
      for (let roll = 1; roll <= 6; roll += 1) {
        expect(
          resolvePalaceRewardRoll(authorizedPalaceRewardPackage, table.id, roll)?.range.from,
          `${table.id} roll ${roll}`,
        ).toBe(roll);
      }
      expect(resolvePalaceRewardRoll(authorizedPalaceRewardPackage, table.id, 0)).toBeNull();
      expect(resolvePalaceRewardRoll(authorizedPalaceRewardPackage, table.id, 7)).toBeNull();
      expect(resolvePalaceRewardRoll(authorizedPalaceRewardPackage, table.id, 1.5)).toBeNull();
    }
    expect(
      resolvePalaceRewardRoll(authorizedPalaceRewardPackage, 'palace.reward.table.unknown.v1', 1),
    ).toBeNull();

    const reordered = structuredClone(authorizedPalaceRewardManifest) as MutableRewardManifest;
    reordered.entries = [...reordered.entries].reverse();
    expect(validatePalaceRewardContent(reordered)).toMatchObject({ ok: true });
  });

  it('pins Palace Treasure redirects and concrete item outcomes', () => {
    const outcomes = Object.fromEntries(
      authorizedPalaceRewardPackage.tables
        .find(({ id }) => id === 'palace.reward.table.treasure.v1')!
        .rows.map(({ range, outcome }) => [range.from, outcome]),
    );
    expect(outcomes).toEqual({
      1: {
        kind: 'item',
        itemDefinitionId: 'item.ornament',
        itemCategory: 'treasure',
        effect: { effectId: 'effect.fixed_sale_value', coins: 5 },
      },
      2: {
        kind: 'item',
        itemDefinitionId: 'item.health-potion',
        itemCategory: 'consumable',
        backpackSlots: 1,
        effect: { effectId: 'effect.full_heal' },
      },
      3: expect.objectContaining({
        kind: 'item',
        itemDefinitionId: 'item.magic-scroll',
        effect: expect.objectContaining({
          effectId: 'effect.magic_scroll',
          spellSelectionTiming: 'item-creation',
        }),
      }),
      4: expect.objectContaining({
        kind: 'item',
        itemDefinitionId: 'item.valuable-jewel',
        effect: {
          effectId: 'effect.rolled_sale_value',
          dice: '2d6',
          multiplier: 10,
          rollTiming: 'item-creation',
        },
      }),
      5: {
        kind: 'redirect',
        tableId: 'palace.reward.table.wonders.v1',
        rollCount: 1,
        grantsRedirectRow: false,
      },
      6: {
        kind: 'redirect',
        tableId: 'palace.reward.table.magic-item.v1',
        rollCount: 1,
        grantsRedirectRow: false,
      },
    });

    for (const roll of [5, 6]) {
      const redirect = outcomes[roll] as { tableId: `palace.${string}` };
      expect(
        resolvePalaceRewardRoll(authorizedPalaceRewardPackage, redirect.tableId, 1),
      ).toMatchObject({ outcome: { kind: expect.stringMatching(/item|composed-equipment/) } });
    }
  });

  it('pins every Palace armour and weapon base identity', () => {
    const armour = authorizedPalaceRewardPackage.tables.find(
      ({ id }) => id === 'palace.reward.table.armour.v1',
    )!;
    expect(
      armour.rows.map(({ outcome }) => ({
        id: outcome['baseItemId'],
        slot: outcome['equipmentSlot'],
        durability: outcome['maximumDurability'],
      })),
    ).toEqual([
      { id: 'armour.ring', slot: 'ring', durability: 0 },
      { id: 'armour.bracelets', slot: 'bracelets', durability: 2 },
      { id: 'armour.boots', slot: 'boots', durability: 3 },
      { id: 'armour.shoulderpads', slot: 'shoulderpads', durability: 3 },
      { id: 'armour.helm', slot: 'helmet', durability: 4 },
      { id: 'armour.breastplate', slot: 'breastplate', durability: 10 },
    ]);

    const weapons = authorizedPalaceRewardPackage.tables.find(
      ({ id }) => id === 'palace.reward.table.weapon.v1',
    )!;
    expect(
      weapons.rows.map(({ outcome }) => ({
        id: outcome['baseItemId'],
        hands: outcome['hands'],
        modifier: (outcome['damage'] as { modifier: number }).modifier,
      })),
    ).toEqual([
      { id: 'weapon.candlestick', hands: 1, modifier: -1 },
      { id: 'weapon.sword', hands: 1, modifier: 0 },
      { id: 'weapon.rapier', hands: 1, modifier: 1 },
      { id: 'weapon.whip', hands: 1, modifier: 1 },
      { id: 'weapon.claw', hands: 1, modifier: 1 },
      { id: 'weapon.halberd', hands: 2, modifier: 3 },
    ]);
  });

  it('keeps Magic Item base and modifier identities separate', () => {
    const magicItems = authorizedPalaceRewardPackage.tables.find(
      ({ id }) => id === 'palace.reward.table.magic-item.v1',
    )!;
    expect(
      magicItems.rows.map(({ outcome }) => ({
        baseTableId: outcome['baseTableId'],
        modifierId: outcome['modifierId'],
      })),
    ).toEqual([
      {
        baseTableId: 'palace.reward.table.armour.v1',
        modifierId: 'modifier.armour.royalty',
      },
      {
        baseTableId: 'palace.reward.table.armour.v1',
        modifierId: 'modifier.armour.leprechaun',
      },
      {
        baseTableId: 'palace.reward.table.armour.v1',
        modifierId: 'modifier.armour.centurion',
      },
      {
        baseTableId: 'palace.reward.table.weapon.v1',
        modifierId: 'modifier.weapon.destruction',
      },
      {
        baseTableId: 'palace.reward.table.weapon.v1',
        modifierId: 'modifier.weapon.war',
      },
      {
        baseTableId: 'palace.reward.table.weapon.v1',
        modifierId: 'modifier.weapon.dragon-slayer',
      },
    ]);
  });

  it('references the existing selected Basic Spell table for scroll creation', () => {
    expect(authorizedPalaceRewardPackage.basicSpellTableReference).toEqual({
      tableId: authorizedNoteQuestAdventurerCreationTableIds.spells,
      contentVersion: authorizedNoteQuestAdventurerCreationContentVersion,
      rows: authorizedNoteQuestSpells.map(({ id, manifestId, total }) => ({
        roll: total,
        spellId: id,
        sourceManifestId: manifestId,
      })),
    });
    for (let roll = 1; roll <= 6; roll += 1) {
      expect(resolvePalaceRewardBasicSpellRoll(authorizedPalaceRewardPackage, roll)).toMatchObject({
        roll,
        sourceManifestId: expect.stringMatching(/^palace\.spell\./),
      });
    }
    expect(resolvePalaceRewardBasicSpellRoll(authorizedPalaceRewardPackage, 0)).toBeNull();
    expect(resolvePalaceRewardBasicSpellRoll(authorizedPalaceRewardPackage, 7)).toBeNull();
  });

  it('closes every immediate room-content follow-on without forcing pickup', () => {
    expect(
      getPalaceRoomFollowOn(authorizedPalaceRewardPackage, 'palace.exploration.room-content.5.v1'),
    ).toMatchObject({
      kind: 'magic-scrolls',
      definition: {
        countDice: '1d6',
        perItem: {
          tableId: authorizedNoteQuestAdventurerCreationTableIds.spells,
          rollDice: '1d6',
          resolutionTiming: 'item-creation',
        },
      },
    });
    for (const rowId of [
      'palace.exploration.room-content.6.v1',
      'palace.exploration.room-content.8.v1',
    ] as const) {
      expect(getPalaceRoomFollowOn(authorizedPalaceRewardPackage, rowId)).toMatchObject({
        kind: 'chest',
        definition: {
          createState: 'unopened',
          openAction: {
            normal: { treasureTableId: 'palace.reward.table.treasure.v1' },
          },
        },
      });
    }
    expect(
      getPalaceRoomFollowOn(authorizedPalaceRewardPackage, 'palace.exploration.room-content.12.v1'),
    ).toMatchObject({
      kind: 'magic-items',
      definition: {
        countDice: '2d6',
        perItem: {
          tableId: 'palace.reward.table.magic-item.v1',
          composedEquipmentBaseRollCount: 1,
        },
      },
    });
    expect(
      getPalaceRoomFollowOn(authorizedPalaceRewardPackage, 'palace.exploration.room-content.2.v1'),
    ).toBeNull();
    expect(authorizedPalaceRoomFollowOnContract.persistence).toMatchObject({
      initialLocation: 'generated-room',
      backpackCapacityDecisionTiming: 'later-player-action',
      commitBoundary: 'owning-action-atomic',
    });
  });

  it.each([
    ['missing row', (manifest: MutableRewardManifest) => manifest.entries.pop()],
    [
      'duplicate row',
      (manifest: MutableRewardManifest) =>
        manifest.entries.push(structuredClone(manifest.entries.at(-1)!)),
    ],
    [
      'overlapping range',
      (manifest: MutableRewardManifest) => {
        manifest.entries.find(
          ({ id }) => id === 'palace.reward.treasure.health-potion.v1',
        )!.range!.from = 1;
      },
    ],
    [
      'unknown effect',
      (manifest: MutableRewardManifest) => {
        const outcome = manifest.entries.find(
          ({ id }) => id === 'palace.reward.treasure.health-potion.v1',
        )!.structuredDefinition;
        (outcome.effect as { effectId: string }).effectId = 'effect.unknown';
      },
    ],
    [
      'unknown redirect',
      (manifest: MutableRewardManifest) => {
        manifest.entries.find(
          ({ id }) => id === 'palace.reward.treasure.redirect-wonders.v1',
        )!.structuredDefinition.tableId = 'palace.reward.table.unknown.v1';
      },
    ],
    [
      'unsafe armour durability',
      (manifest: MutableRewardManifest) => {
        manifest.entries.find(
          ({ id }) => id === 'palace.reward.armour.boots.v1',
        )!.structuredDefinition.maximumDurability = -1;
      },
    ],
    [
      'unknown spell reference',
      (manifest: MutableRewardManifest) => {
        const contract = manifest.entries.find(
          ({ id }) => id === authorizedPalaceRoomFollowOnContract.id,
        )!.structuredDefinition;
        (contract.basicSpellTableReference as { tableId: string }).tableId =
          'palace.creation.notequest.unknown';
      },
    ],
    [
      'unknown version',
      (manifest: MutableRewardManifest) => {
        manifest.contentVersion = '2.0.0';
      },
    ],
    [
      'unselected row',
      (manifest: MutableRewardManifest) => {
        const row = manifest.entries.find(
          ({ id }) => id === 'palace.reward.magic-item.weapon-war.v1',
        )!;
        row.review.approvalState = 'draft';
        row.review.publicReleaseEligible = false;
      },
    ],
  ])('rejects %s', (_name, mutate) => {
    const malformed = structuredClone(authorizedPalaceRewardManifest) as MutableRewardManifest;
    mutate(malformed);
    expect(validatePalaceRewardContent(malformed)).toMatchObject({ ok: false });
  });

  it('requires new integrity evidence for selected payload mutations', async () => {
    const changed = structuredClone(authorizedPalaceRewardManifest) as MutableRewardManifest;
    changed.entries.find(
      ({ id }) => id === 'palace.reward.weapon.halberd.v1',
    )!.structuredDefinition.hands = 1;

    await expect(
      validatePalaceManifestIntegrity(changed, integrityAdapters),
    ).resolves.toMatchObject({ valid: false });
    expect(validatePalaceRewardContent(null as never)).toEqual({
      ok: false,
      errors: [{ field: 'manifest', reason: 'must be a Palace manifest' }],
    });
  });
});
