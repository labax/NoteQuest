import { describe, expect, it } from 'vitest';
import { serializeCanonicalJson, createSha256Hasher } from '@notequest/infrastructure';
import {
  authorizedPalaceEntranceManifest,
  authorizedPalaceEntranceTemplate,
} from './authorized-palace-entrance.ts';
import {
  approvedPalaceEntranceGenerationOrigins,
  validatePalaceGenerationContent,
} from './palace-generation-content.ts';
import { validatePalaceContentManifest } from './palace-manifest.ts';
import { validatePalaceManifestIntegrity } from './palace-manifest-integrity.ts';

describe('authorized Palace entrance', () => {
  it('passes governance and integrity validation', async () => {
    const provenance = authorizedPalaceEntranceManifest.entries[0]!.provenance;
    expect(provenance).toMatchObject({
      authorRightsHolder: 'Tiago Junges',
      permissionLicenseId: 'TIAGO-JUNGES-FULL-PERMISSION-OWNER-ATTESTATION-2026-07-29',
      attributionRequired: true,
      attributionNoticeId: 'NOTEQUEST-TIAGO-JUNGES-CREDIT-V1',
    });
    expect(provenance.sourceReferences.map(({ sourceId }) => sourceId)).toEqual(
      expect.arrayContaining([
        'INV-PAL-INTRO',
        'STORY-M6-002',
        'ISSUE-177',
        'NOTEQUEST-ISSUE-80-TIAGO-JUNGES-PERMISSION-ATTESTATION',
      ]),
    );
    expect(validatePalaceContentManifest(authorizedPalaceEntranceManifest)).toEqual({
      valid: true,
      errors: [],
    });
    await expect(
      validatePalaceManifestIntegrity(authorizedPalaceEntranceManifest, {
        canonicalJson: { serializeCanonicalJson },
        sha256: createSha256Hasher(),
      }),
    ).resolves.toMatchObject({ valid: true, errors: [] });
  });

  it('adapts stable connection definitions and rejects malformed templates', () => {
    expect(validatePalaceGenerationContent(authorizedPalaceEntranceManifest)).toMatchObject({
      ok: true,
      content: { entranceConnections: authorizedPalaceEntranceTemplate.connections },
    });
    const malformed = structuredClone(authorizedPalaceEntranceManifest);
    malformed.entries[0]!.structuredDefinition.connections = [
      authorizedPalaceEntranceTemplate.connections[0],
      authorizedPalaceEntranceTemplate.connections[0],
    ];
    expect(validatePalaceGenerationContent(malformed)).toMatchObject({ ok: false });

    const reordered = structuredClone(authorizedPalaceEntranceManifest);
    const definition = reordered.entries[0]!.structuredDefinition;
    definition['connections'] = [...authorizedPalaceEntranceTemplate.connections].reverse();
    const adapted = validatePalaceGenerationContent(reordered);
    expect(adapted.ok).toBe(true);
    if (adapted.ok) {
      expect(adapted.content.entranceConnections.map(({ definitionId }) => definitionId)).toEqual(
        [...authorizedPalaceEntranceTemplate.connections]
          .reverse()
          .map(({ definitionId }) => definitionId),
      );
    }
    expect(validatePalaceGenerationContent(null as never)).toMatchObject({ ok: false });
  });

  it('authorizes a room origin for each side door and a staircase origin for the central door', () => {
    expect(approvedPalaceEntranceGenerationOrigins).toEqual({
      'palace.entrance.connection.side-door-1.v1': 'room',
      'palace.entrance.connection.side-door-2.v1': 'room',
      'palace.entrance.connection.side-door-3.v1': 'room',
      'palace.entrance.connection.side-door-4.v1': 'room',
      'palace.entrance.connection.central-staircase-wooden-door.v1': 'staircase',
    });

    const adapted = validatePalaceGenerationContent(authorizedPalaceEntranceManifest);
    if (!adapted.ok) throw new Error('expected authorized entrance content');
    expect(
      Object.fromEntries(
        adapted.content.entranceConnections.map(({ definitionId, generationOriginCategory }) => [
          definitionId,
          generationOriginCategory,
        ]),
      ),
    ).toEqual(approvedPalaceEntranceGenerationOrigins);
  });

  it.each([
    ['missing', undefined],
    ['invalid', 'entrance'],
    ['blanket room mapping', 'room'],
  ] as const)('rejects a %s generation origin on the central staircase door', (_case, origin) => {
    const malformed = structuredClone(authorizedPalaceEntranceManifest);
    const connections = malformed.entries[0]!.structuredDefinition.connections as unknown as Array<
      Record<string, unknown>
    >;
    const centralDoor = connections.find(({ definitionId }) =>
      String(definitionId).includes('central-staircase'),
    )!;
    if (origin === undefined) delete centralDoor['generationOriginCategory'];
    else centralDoor['generationOriginCategory'] = origin;

    expect(validatePalaceGenerationContent(malformed)).toMatchObject({ ok: false });
  });

  it('rejects swapping a side-door origin to staircase', () => {
    const malformed = structuredClone(authorizedPalaceEntranceManifest);
    const connections = malformed.entries[0]!.structuredDefinition.connections as unknown as Array<
      Record<string, unknown>
    >;
    connections[0]!['generationOriginCategory'] = 'staircase';

    expect(validatePalaceGenerationContent(malformed)).toMatchObject({ ok: false });
  });
});
