import { describe, expect, it } from 'vitest';
import { serializeCanonicalJson, createSha256Hasher } from '@notequest/infrastructure';
import {
  authorizedPalaceEntranceManifest,
  authorizedPalaceEntranceTemplate,
} from './authorized-palace-entrance.ts';
import { validatePalaceGenerationContent } from './palace-generation-content.ts';
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
});
