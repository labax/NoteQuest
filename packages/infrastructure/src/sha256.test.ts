import { describe, expect, it } from 'vitest';

import { serializeCanonicalJson } from './canonical-json.ts';
import { sha256CanonicalJsonFixtures } from './sha256-fixtures.ts';
import { createSha256Hasher, SHA256_CHECKSUM_PREFIX, SHA256_HEX_LENGTH } from './sha256.ts';

const fixtureInputs = [
  {
    name: 'empty manifest object',
    input: {},
  },
  {
    name: 'ordered manifest-like object',
    input: {
      version: 1,
      id: 'manifest.synthetic',
      content: { z: 'last', a: 'first', nested: { beta: 2, alpha: 1 } },
    },
  },
  {
    name: 'snapshot array with nested objects',
    input: [{ b: 2, a: 1 }, ['x', { d: null, c: [3, 2, 1] }]],
  },
] as const;

describe('SHA-256 canonical UTF-8 hashing adapter', () => {
  it.each(fixtureInputs)(
    'produces the reference SHA-256 fixture for $name',
    async (fixtureInput) => {
      const fixture = sha256CanonicalJsonFixtures.find(({ name }) => name === fixtureInput.name);
      expect(fixture).toBeDefined();
      if (fixture === undefined) {
        throw new Error(`missing SHA-256 fixture for ${fixtureInput.name}`);
      }

      const canonicalJson = serializeCanonicalJson(fixtureInput.input);
      const result = await createSha256Hasher().hashCanonicalUtf8(canonicalJson);

      expect(canonicalJson).toBe(fixture.canonicalJson);
      expect(result).toMatchObject({ ok: true, algorithm: 'SHA-256' });

      if (!result.ok) {
        throw new Error(result.error.message);
      }

      expect(result.hex).toBe(fixture.sha256);
      expect(result.hex).toHaveLength(SHA256_HEX_LENGTH);
      expect(result.checksum).toBe(`${SHA256_CHECKSUM_PREFIX}${fixture.sha256}`);
      expect(result.checksum).toBe(fixture.checksum);
    },
  );

  it('hashes UTF-8 bytes for non-ASCII canonical strings', async () => {
    const result = await createSha256Hasher().hashCanonicalUtf8('"torch 🕯️"');

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error(result.error.message);
    }
    expect(result.hex).toBe('048a0715f0d8d74e4d528de75387ce4080a4208fa08ec06834bf0b7c71fba040');
  });

  it('returns a typed unsupported error when Web Crypto digest support is unavailable', async () => {
    const result = await createSha256Hasher(null).hashCanonicalUtf8('{}');

    expect(result).toEqual({
      ok: false,
      error: {
        code: 'unsupported',
        message: 'SHA-256 hashing requires Web Crypto subtle.digest support.',
      },
    });
  });

  it('returns a typed failed error when the underlying digest operation rejects', async () => {
    const cause = new Error('digest unavailable');
    const subtleCrypto = {
      digest: async () => Promise.reject(cause),
    };

    const result = await createSha256Hasher(subtleCrypto).hashCanonicalUtf8('{}');

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error('expected hashing to fail');
    }
    expect(result.error).toEqual({
      code: 'failed',
      message: 'SHA-256 hashing failed for the provided canonical UTF-8 bytes.',
      cause,
    });
  });
});
