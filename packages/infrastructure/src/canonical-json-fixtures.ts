import type { CanonicalJsonValue } from './canonical-json.ts';

export interface CanonicalJsonFixture {
  readonly name: string;
  readonly protects: string;
  readonly value: CanonicalJsonValue;
  readonly canonicalJson: string;
  readonly utf8Hex: string;
}

/**
 * M2 deterministic boundary fixtures.
 *
 * These fixtures are intentionally small, project-owned values that avoid licensed
 * NoteQuest prose and table rows. They protect canonical object ordering, array
 * ordering, primitive rendering, escaping, and UTF-8 byte boundaries for future
 * browser-equivalence checks.
 */
export const canonicalJsonFixtures = [
  {
    name: 'empty manifest object',
    protects: 'Empty object boundaries remain byte-stable across hosts.',
    value: {},
    canonicalJson: '{}',
    utf8Hex: '7b7d',
  },
  {
    name: 'ordered manifest-like object',
    protects: 'Object keys sort recursively without depending on insertion order.',
    value: {
      version: 1,
      id: 'manifest.synthetic',
      content: { z: 'last', a: 'first', nested: { beta: 2, alpha: 1 } },
    },
    canonicalJson:
      '{"content":{"a":"first","nested":{"alpha":1,"beta":2},"z":"last"},"id":"manifest.synthetic","version":1}',
    utf8Hex:
      '7b22636f6e74656e74223a7b2261223a226669727374222c226e6573746564223a7b22616c706861223a312c2262657461223a327d2c227a223a226c617374227d2c226964223a226d616e69666573742e73796e746865746963222c2276657273696f6e223a317d',
  },
  {
    name: 'snapshot array with nested objects',
    protects: 'Array order is preserved while nested object keys are canonicalized.',
    value: [{ b: 2, a: 1 }, ['x', { d: null, c: [3, 2, 1] }]],
    canonicalJson: '[{"a":1,"b":2},["x",{"c":[3,2,1],"d":null}]]',
    utf8Hex:
      '5b7b2261223a312c2262223a327d2c5b2278222c7b2263223a5b332c322c315d2c2264223a6e756c6c7d5d5d',
  },
  {
    name: 'browser utf8 text boundary',
    protects: 'Canonical strings hash the exact UTF-8 bytes, including non-ASCII text.',
    value: 'torch 🕯️',
    canonicalJson: '"torch 🕯️"',
    utf8Hex: '22746f72636820f09f95afefb88f22',
  },
] as const satisfies readonly CanonicalJsonFixture[];
