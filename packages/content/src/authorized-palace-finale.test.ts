import { createSha256Hasher, serializeCanonicalJson } from '@notequest/infrastructure';
import { describe, expect, it } from 'vitest';
import {
  authorizedPalaceBossTable,
  authorizedPalaceFinaleManifest,
  authorizedPalaceFinalePackage,
  authorizedPalaceFinalRoomContract,
} from './authorized-palace-finale.ts';
import {
  resolvePalaceBossRoll,
  selectPalaceFinalRoomTransition,
  validatePalaceFinaleContent,
} from './palace-finale-content.ts';
import { validatePalaceContentManifest } from './palace-manifest.ts';
import { validatePalaceManifestIntegrity } from './palace-manifest-integrity.ts';

type Mutable<T> = T extends readonly (infer Item)[]
  ? Mutable<Item>[]
  : T extends object
    ? { -readonly [Key in keyof T]: Mutable<T[Key]> }
    : T;

type MutableFinaleManifest = Mutable<typeof authorizedPalaceFinaleManifest>;

const integrityAdapters = {
  canonicalJson: { serializeCanonicalJson },
  sha256: createSha256Hasher(),
};

describe('authorized Palace finale content', () => {
  it('bundles selected finale mechanics with provenance and valid hashes', async () => {
    expect(authorizedPalaceFinaleManifest.entries).toHaveLength(9);
    expect(validatePalaceContentManifest(authorizedPalaceFinaleManifest)).toEqual({
      valid: true,
      errors: [],
    });
    expect(validatePalaceFinaleContent(authorizedPalaceFinaleManifest)).toMatchObject({
      ok: true,
      content: authorizedPalaceFinalePackage,
    });
    await expect(
      validatePalaceManifestIntegrity(authorizedPalaceFinaleManifest, integrityAdapters),
    ).resolves.toMatchObject({ valid: true, errors: [] });

    for (const entry of authorizedPalaceFinaleManifest.entries) {
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
          'ISSUE-179',
          'NOTEQUEST-ISSUE-80-TIAGO-JUNGES-PERMISSION-ATTESTATION',
        ]),
      );
      expect(entry.provenance.contentHash.value).not.toMatch(/^sha256:0{64}$/);
    }

    expect(
      authorizedPalaceFinaleManifest.entries
        .flatMap(({ provenance }) => provenance.sourceReferences)
        .map(({ sourceId }) => sourceId),
    ).toEqual(expect.arrayContaining(['INV-PAL-FINAL', 'INV-PAL-BOSS']));
  });

  it('pins all six Palace boss results and resolves without relying on row order', () => {
    expect(
      authorizedPalaceBossTable.rows.map(({ range, outcome }) => ({
        roll: range.from,
        bossId: outcome.bossId,
        count: outcome.count.value,
        hitPoints: outcome.hitPoints,
        damage: outcome.damage,
        traitIds: outcome.traitIds,
      })),
    ).toEqual([
      {
        roll: 1,
        bossId: 'boss.zombie-baron',
        count: 1,
        hitPoints: 30,
        damage: 4,
        traitIds: ['trait.undead'],
      },
      {
        roll: 2,
        bossId: 'boss.mad-king',
        count: 1,
        hitPoints: 22,
        damage: 2,
        traitIds: ['trait.explosive'],
      },
      {
        roll: 3,
        bossId: 'boss.ghost-lady',
        count: 1,
        hitPoints: 13,
        damage: 3,
        traitIds: ['trait.intangible'],
      },
      {
        roll: 4,
        bossId: 'boss.unholy-gargoyle',
        count: 2,
        hitPoints: 12,
        damage: 3,
        traitIds: ['trait.stoneskin'],
      },
      {
        roll: 5,
        bossId: 'boss.necromancer',
        count: 1,
        hitPoints: 16,
        damage: 7,
        traitIds: ['trait.necromancy'],
      },
      {
        roll: 6,
        bossId: 'boss.orc-king',
        count: 1,
        hitPoints: 24,
        damage: 5,
        traitIds: ['trait.horde'],
      },
    ]);

    for (let roll = 1; roll <= 6; roll += 1) {
      expect(resolvePalaceBossRoll(authorizedPalaceFinalePackage, roll)?.range.from).toBe(roll);
    }
    expect(resolvePalaceBossRoll(authorizedPalaceFinalePackage, 0)).toBeNull();
    expect(resolvePalaceBossRoll(authorizedPalaceFinalePackage, 7)).toBeNull();
    expect(resolvePalaceBossRoll(authorizedPalaceFinalePackage, 2.5)).toBeNull();

    const reordered = structuredClone(authorizedPalaceFinaleManifest) as MutableFinaleManifest;
    reordered.entries = [...reordered.entries].reverse();
    expect(validatePalaceFinaleContent(reordered)).toMatchObject({ ok: true });
  });

  it('selects the same single final-room contract for normal and secret floor-three descents', () => {
    const normal = selectPalaceFinalRoomTransition(authorizedPalaceFinalePackage, {
      routeKind: 'normal-downward-staircase',
      sourceFloor: 2,
      existingFinalRoomCount: 0,
    });
    const secret = selectPalaceFinalRoomTransition(authorizedPalaceFinalePackage, {
      routeKind: 'secret-downward-staircase',
      sourceFloor: 2,
      existingFinalRoomCount: 0,
    });

    expect(normal).toEqual(secret);
    expect(normal).toEqual({
      ok: true,
      transition: 'create-final-room',
      destinationFloor: 3,
      reason: 'floor-three-descent',
      contract: authorizedPalaceFinalRoomContract,
    });
    expect(authorizedPalaceFinalRoomContract).toMatchObject({
      segmentKind: 'final-room',
      roomSize: 'large',
      outwardConnectionCount: 0,
      encounterSource: {
        kind: 'boss-table',
        tableId: 'palace.finale.table.boss.v1',
        resultCount: 1,
      },
      suppressOrdinaryResolution: { roomContent: true, monster: true },
    });
  });

  it('promotes only the current terminal room when the reachable frontier is exhausted', () => {
    expect(
      selectPalaceFinalRoomTransition(authorizedPalaceFinalePackage, {
        routeKind: 'generated-destination',
        destinationFloor: 2,
        destinationKind: 'room',
        outwardConnectionCount: 0,
        remainingReachableUnresolvedConnectionCount: 0,
        existingFinalRoomCount: 0,
      }),
    ).toEqual({
      ok: true,
      transition: 'create-final-room',
      destinationFloor: 2,
      reason: 'frontier-exhaustion',
      contract: authorizedPalaceFinalRoomContract,
    });

    for (const context of [
      {
        destinationKind: 'room' as const,
        outwardConnectionCount: 1,
        remainingReachableUnresolvedConnectionCount: 0,
      },
      {
        destinationKind: 'room' as const,
        outwardConnectionCount: 0,
        remainingReachableUnresolvedConnectionCount: 1,
      },
      {
        destinationKind: 'corridor' as const,
        outwardConnectionCount: 0,
        remainingReachableUnresolvedConnectionCount: 0,
      },
    ]) {
      expect(
        selectPalaceFinalRoomTransition(authorizedPalaceFinalePackage, {
          routeKind: 'generated-destination',
          destinationFloor: 1,
          existingFinalRoomCount: 0,
          ...context,
        }),
      ).toEqual({ ok: true, transition: 'continue-ordinary-generation' });
    }
  });

  it('rejects duplicate or malformed final-room transitions before mutation', () => {
    expect(
      selectPalaceFinalRoomTransition(authorizedPalaceFinalePackage, {
        routeKind: 'secret-downward-staircase',
        sourceFloor: 2,
        existingFinalRoomCount: 1,
      }),
    ).toMatchObject({ ok: false, error: { code: 'duplicate_final_room' } });
    expect(
      selectPalaceFinalRoomTransition(authorizedPalaceFinalePackage, {
        routeKind: 'generated-destination',
        destinationFloor: 1,
        destinationKind: 'room',
        outwardConnectionCount: -1,
        remainingReachableUnresolvedConnectionCount: 0,
        existingFinalRoomCount: 0,
      }),
    ).toMatchObject({ ok: false, error: { code: 'invalid_finale_context' } });
    expect(
      selectPalaceFinalRoomTransition(authorizedPalaceFinalePackage, {
        routeKind: 'normal-downward-staircase',
        sourceFloor: 1,
        existingFinalRoomCount: 0,
      }),
    ).toEqual({ ok: true, transition: 'continue-ordinary-generation' });
  });

  it.each([
    ['missing row', (manifest: MutableFinaleManifest) => manifest.entries.pop()],
    [
      'duplicate row',
      (manifest: MutableFinaleManifest) =>
        manifest.entries.push(structuredClone(manifest.entries.at(-1)!)),
    ],
    [
      'overlapping range',
      (manifest: MutableFinaleManifest) => {
        manifest.entries.find(({ id }) => id === 'palace.finale.boss.mad-king.v1')!.range!.from = 1;
      },
    ],
    [
      'altered boss HP',
      (manifest: MutableFinaleManifest) => {
        manifest.entries.find(
          ({ id }) => id === 'palace.finale.boss.zombie-baron.v1',
        )!.structuredDefinition.hitPoints = 31;
      },
    ],
    [
      'unknown trait',
      (manifest: MutableFinaleManifest) => {
        manifest.entries.find(
          ({ id }) => id === 'palace.finale.boss.orc-king.v1',
        )!.structuredDefinition.traitIds = ['trait.unknown'];
      },
    ],
    [
      'ordinary room resolution enabled',
      (manifest: MutableFinaleManifest) => {
        const contract = manifest.entries.find(
          ({ id }) => id === authorizedPalaceFinalRoomContract.id,
        )!.structuredDefinition;
        (
          contract.suppressOrdinaryResolution as {
            roomContent: boolean;
          }
        ).roomContent = false;
      },
    ],
    [
      'unknown version',
      (manifest: MutableFinaleManifest) => {
        manifest.contentVersion = '2.0.0';
      },
    ],
    [
      'unselected boss row',
      (manifest: MutableFinaleManifest) => {
        const row = manifest.entries.find(({ id }) => id === 'palace.finale.boss.ghost-lady.v1')!;
        row.review.approvalState = 'draft';
        row.review.publicReleaseEligible = false;
      },
    ],
  ])('rejects %s', (_name, mutate) => {
    const malformed = structuredClone(authorizedPalaceFinaleManifest) as MutableFinaleManifest;
    mutate(malformed);
    expect(validatePalaceFinaleContent(malformed)).toMatchObject({ ok: false });
  });

  it('requires new integrity evidence for any selected payload mutation', async () => {
    const changed = structuredClone(authorizedPalaceFinaleManifest) as MutableFinaleManifest;
    changed.entries.find(
      ({ id }) => id === 'palace.finale.boss.necromancer.v1',
    )!.structuredDefinition.damage = 8;

    await expect(
      validatePalaceManifestIntegrity(changed, integrityAdapters),
    ).resolves.toMatchObject({ valid: false });
    expect(validatePalaceFinaleContent(null as never)).toEqual({
      ok: false,
      errors: [{ field: 'manifest', reason: 'must be a Palace manifest' }],
    });
  });
});
