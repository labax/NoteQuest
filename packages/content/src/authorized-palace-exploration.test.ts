import { createSha256Hasher, serializeCanonicalJson } from '@notequest/infrastructure';
import { describe, expect, it } from 'vitest';
import {
  authorizedPalaceExplorationManifest,
  authorizedPalaceExplorationPackage,
} from './authorized-palace-exploration.ts';
import {
  resolvePalaceExplorationRoll,
  validatePalaceExplorationContent,
} from './palace-exploration-content.ts';
import { validatePalaceContentManifest } from './palace-manifest.ts';
import { validatePalaceManifestIntegrity } from './palace-manifest-integrity.ts';

type Mutable<T> = T extends readonly (infer Item)[]
  ? Mutable<Item>[]
  : T extends object
    ? { -readonly [Key in keyof T]: Mutable<T[Key]> }
    : T;

type MutableExplorationManifest = Mutable<typeof authorizedPalaceExplorationManifest>;

const integrityAdapters = {
  canonicalJson: { serializeCanonicalJson },
  sha256: createSha256Hasher(),
};

describe('authorized Palace exploration content', () => {
  it('bundles the complete selected table package with provenance and valid hashes', async () => {
    expect(authorizedPalaceExplorationPackage.tables).toHaveLength(8);
    expect(authorizedPalaceExplorationManifest.entries).toHaveLength(60);
    expect(validatePalaceContentManifest(authorizedPalaceExplorationManifest)).toEqual({
      valid: true,
      errors: [],
    });
    expect(validatePalaceExplorationContent(authorizedPalaceExplorationManifest)).toMatchObject({
      ok: true,
      content: authorizedPalaceExplorationPackage,
    });
    await expect(
      validatePalaceManifestIntegrity(authorizedPalaceExplorationManifest, integrityAdapters),
    ).resolves.toMatchObject({ valid: true, errors: [] });

    for (const entry of authorizedPalaceExplorationManifest.entries) {
      expect(entry.provenance).toMatchObject({
        origin: 'approved-source',
        authorRightsHolder: 'Tiago Junges',
        permissionLicenseId: 'TIAGO-JUNGES-FULL-PERMISSION-OWNER-ATTESTATION-2026-07-29',
        containsExactSourceProse: false,
        containsSourceArtwork: false,
        containsTradeDress: false,
      });
      expect(entry.provenance.contentHash.value).not.toMatch(/^sha256:0{64}$/);
    }
  });

  it('resolves every boundary without depending on entry order', () => {
    for (const table of authorizedPalaceExplorationPackage.tables) {
      const lowerBound = table.dice === '1d6' ? 1 : 2;
      const upperBound = table.dice === '1d6' ? 6 : 12;
      for (let roll = lowerBound; roll <= upperBound; roll += 1) {
        expect(
          resolvePalaceExplorationRoll(table, roll),
          `${table.id} roll ${roll}`,
        ).not.toBeNull();
      }
      expect(resolvePalaceExplorationRoll(table, lowerBound - 1)).toBeNull();
      expect(resolvePalaceExplorationRoll(table, upperBound + 1)).toBeNull();
      expect(resolvePalaceExplorationRoll(table, 2.5)).toBeNull();
    }

    const reordered = structuredClone(
      authorizedPalaceExplorationManifest,
    ) as MutableExplorationManifest;
    reordered.entries = [...reordered.entries].reverse();
    expect(validatePalaceExplorationContent(reordered)).toMatchObject({ ok: true });
  });

  it('pins dangerous trap effects and monster encounter definitions', () => {
    const trapTable = authorizedPalaceExplorationPackage.tables.find(
      ({ id }) => id === 'palace.exploration.table.trap.v1',
    )!;
    expect(resolvePalaceExplorationRoll(trapTable, 1)?.outcome).toEqual({
      effect: {
        kind: 'secondary-roll',
        dice: '1d6',
        outcomes: [
          { from: 1, to: 1, operation: 'death' },
          { from: 2, to: 2, operation: 'lose-arm', amount: 1 },
          { from: 3, to: 6, operation: 'none' },
        ],
      },
    });
    expect(resolvePalaceExplorationRoll(trapTable, 3)?.outcome).toEqual({
      effect: { kind: 'spend-physical-torch', amount: 1 },
    });

    const monsterTable = authorizedPalaceExplorationPackage.tables.find(
      ({ id }) => id === 'palace.exploration.table.monster.v1',
    )!;
    expect(resolvePalaceExplorationRoll(monsterTable, 7)?.outcome).toMatchObject({
      monsterId: null,
      count: { kind: 'fixed', value: 0 },
    });
    expect(resolvePalaceExplorationRoll(monsterTable, 10)?.outcome).toMatchObject({
      monsterId: 'monster.fungoid',
      count: { kind: 'fixed', value: 3 },
      traitIds: ['trait.loot', 'trait.regeneration'],
    });

    const segmentTables = authorizedPalaceExplorationPackage.tables.filter(
      ({ originCategory }) => originCategory !== null,
    );
    expect(segmentTables.map(({ originCategory }) => originCategory)).toEqual([
      'staircase',
      'corridor',
      'room',
    ]);

    const roomTable = authorizedPalaceExplorationPackage.tables.find(
      ({ id }) => id === 'palace.exploration.table.room-content.v1',
    )!;
    expect(resolvePalaceExplorationRoll(roomTable, 2)?.outcome).toMatchObject({
      secretSearchEligible: true,
    });
    expect(resolvePalaceExplorationRoll(roomTable, 3)?.outcome).toMatchObject({
      secretSearchEligible: false,
    });
  });

  it.each([
    ['missing row', (manifest: MutableExplorationManifest) => manifest.entries.pop()],
    [
      'duplicate row',
      (manifest: MutableExplorationManifest) =>
        manifest.entries.push(structuredClone(manifest.entries[1]!)),
    ],
    [
      'overlapping range',
      (manifest: MutableExplorationManifest) => {
        manifest.entries.find(
          ({ id }) => id === 'palace.exploration.door-state.locked.v1',
        )!.range!.from = 1;
      },
    ],
    [
      'changed trap operation',
      (manifest: MutableExplorationManifest) => {
        manifest.entries.find(
          ({ id }) => id === 'palace.exploration.trap.pit.v1',
        )!.structuredDefinition.effect = { kind: 'spend-light', amount: 1 };
      },
    ],
    [
      'changed monster trait',
      (manifest: MutableExplorationManifest) => {
        manifest.entries.find(
          ({ id }) => id === 'palace.exploration.monster.10.v1',
        )!.structuredDefinition.traitIds = ['trait.unknown'];
      },
    ],
    [
      'corrupt hash',
      (manifest: MutableExplorationManifest) => {
        manifest.entries[0]!.provenance.contentHash.value =
          'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
      },
    ],
    [
      'unknown version',
      (manifest: MutableExplorationManifest) => {
        manifest.contentVersion = '2.0.0';
      },
    ],
    [
      'unselected row',
      (manifest: MutableExplorationManifest) => {
        manifest.entries[1]!.review.approvalState = 'draft';
        manifest.entries[1]!.review.publicReleaseEligible = false;
      },
    ],
    [
      'orphan row',
      (manifest: MutableExplorationManifest) => {
        manifest.entries.find(
          ({ id }) => id === 'palace.exploration.door-state.locked.v1',
        )!.parentId = 'palace.missing.table.v1';
      },
    ],
    [
      'wrong dice expression',
      (manifest: MutableExplorationManifest) => {
        manifest.entries.find(
          ({ id }) => id === 'palace.exploration.door-state.locked.v1',
        )!.range!.dice = '2d6';
      },
    ],
    [
      'altered package payload',
      (manifest: MutableExplorationManifest) => {
        manifest.entries[0]!.structuredDefinition.tables = [];
      },
    ],
    [
      'source prose marker',
      (manifest: MutableExplorationManifest) => {
        Reflect.set(manifest.entries[1]!.provenance, 'containsExactSourceProse', true);
      },
    ],
  ])('rejects %s', async (_name, mutate) => {
    const malformed = structuredClone(
      authorizedPalaceExplorationManifest,
    ) as MutableExplorationManifest;
    mutate(malformed);
    expect(validatePalaceExplorationContent(malformed)).toMatchObject({ ok: false });
  });

  it('rejects non-manifest input without throwing', () => {
    expect(validatePalaceExplorationContent(null as never)).toEqual({
      ok: false,
      errors: [{ field: 'manifest', reason: 'must be a Palace manifest' }],
    });
  });

  it('requires a new checksum for any selected payload mutation', async () => {
    const changed = structuredClone(
      authorizedPalaceExplorationManifest,
    ) as MutableExplorationManifest;
    changed.entries.find(
      ({ id }) => id === 'palace.exploration.trap.acid.v1',
    )!.structuredDefinition.effect = { kind: 'damage', amount: 4 };

    await expect(
      validatePalaceManifestIntegrity(changed, integrityAdapters),
    ).resolves.toMatchObject({ valid: false });
  });
});
