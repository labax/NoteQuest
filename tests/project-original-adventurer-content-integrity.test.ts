import { describe, expect, it } from 'vitest';

import {
  projectOriginalAdventurerCreationManifest,
  validatePalaceManifestIntegrity,
} from '@notequest/content';
import { createSha256Hasher, serializeCanonicalJson } from '@notequest/infrastructure';

describe('project-original adventurer content integrity', () => {
  it('reproduces every recorded RFC-8785/SHA-256 entry hash', async () => {
    const result = await validatePalaceManifestIntegrity(
      projectOriginalAdventurerCreationManifest,
      {
        canonicalJson: { serializeCanonicalJson },
        sha256: createSha256Hasher(),
      },
    );

    expect(result).toMatchObject({ valid: true, errors: [] });
    expect(result.evidence).toHaveLength(projectOriginalAdventurerCreationManifest.entries.length);
    expect(result.evidence.map(({ contentId }) => contentId)).toEqual(
      projectOriginalAdventurerCreationManifest.entries.map(({ id }) => id),
    );
  });
});
