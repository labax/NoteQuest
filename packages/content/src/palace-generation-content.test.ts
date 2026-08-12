import { describe, expect, it } from 'vitest';
import { palacePlaceholderManifest } from './palace-manifest.ts';
import { validatePalaceGenerationContent } from './palace-generation-content.ts';

describe('Palace generation content adapter', () => {
  it('rejects the draft placeholder rather than treating unapproved content as generation data', () => {
    expect(validatePalaceGenerationContent(palacePlaceholderManifest)).toMatchObject({
      ok: false,
      errors: expect.any(Array),
    });
  });
});
