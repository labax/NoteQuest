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
  });
});
