import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { generatePalaceDungeon } from './palace-generation.ts';

interface SeedFixture {
  readonly id: string;
  readonly kind: 'normal' | 'boundary' | 'failure';
  readonly seed: string;
  readonly entranceConnectionCount: number;
  readonly expectedError?: string;
}

const seedFixtures = (
  JSON.parse(readFileSync('tests/fixtures/palace-generation-seeds.json', 'utf8')) as {
    readonly fixtures: readonly SeedFixture[];
  }
).fixtures;

function content(entranceConnectionCount: number) {
  return {
    packageId: 'palace' as const,
    contentVersion: '0.1.0',
    rulesVersion: 'digital-rules-specification-v0.1',
    entranceDefinitionId: 'palace.entrance.prototype' as const,
    entranceConnectionCount,
    validationEvidence: ['fixture:palace-generation-seeds@v0.1'],
  };
}

describe('Palace generation seed fixtures', () => {
  it.each(seedFixtures.filter((fixture) => fixture.kind !== 'failure'))(
    'reproduces $id',
    (fixture) => {
      const first = generatePalaceDungeon(fixture.seed, content(fixture.entranceConnectionCount));
      const replay = generatePalaceDungeon(fixture.seed, content(fixture.entranceConnectionCount));
      expect(first).toEqual(replay);
      expect(first).toMatchObject({
        ok: true,
        dungeon: {
          seed: fixture.seed,
          connections: { length: fixture.entranceConnectionCount },
          generationEvidence: {
            validationEvidence: ['fixture:palace-generation-seeds@v0.1'],
          },
        },
      });
    },
  );

  it.each(seedFixtures.filter((fixture) => fixture.kind === 'failure'))(
    'rejects $id reproducibly without returning partial state',
    (fixture) => {
      const result = generatePalaceDungeon(fixture.seed, content(fixture.entranceConnectionCount));
      expect(result).toMatchObject({ ok: false, error: { code: fixture.expectedError } });
      expect(result).toMatchObject({
        error: {
          evidence: {
            seed: fixture.seed,
            rulesVersion: 'digital-rules-specification-v0.1',
            contentVersion: '0.1.0',
            generationVersion: 'palace-generation.v0.1',
            trace: expect.any(Array),
          },
        },
      });
      expect(result).not.toHaveProperty('dungeon');
    },
  );
});
