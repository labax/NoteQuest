import { describe, expect, it } from 'vitest';

import {
  authorizedNoteQuestAdventurerCreationManifest,
  validatePalaceManifestIntegrity,
} from '../packages/content/src/index.ts';
import {
  createSha256Hasher,
  serializeCanonicalJson,
} from '../packages/infrastructure/src/index.ts';

describe('authorized NoteQuest adventurer content integrity', () => {
  it('reproduces every recorded RFC-8785/SHA-256 entry hash', async () => {
    const result = await validatePalaceManifestIntegrity(
      authorizedNoteQuestAdventurerCreationManifest,
      {
        canonicalJson: { serializeCanonicalJson },
        sha256: createSha256Hasher(),
      },
    );

    expect(result).toMatchObject({ valid: true, errors: [] });
    expect(result.evidence).toHaveLength(
      authorizedNoteQuestAdventurerCreationManifest.entries.length,
    );
    expect(result.evidence.map(({ contentId }) => contentId)).toEqual(
      authorizedNoteQuestAdventurerCreationManifest.entries.map(({ id }) => id),
    );
  });
});
