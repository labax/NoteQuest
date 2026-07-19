import { describe, expect, it } from 'vitest';

import {
  createNamedRandomStream,
  deriveNamedStreamSelector,
  deserializeNamedRandomStream,
  formatHexUint32,
  formatHexUint64,
  listRandomStreamPurposes,
  Pcg32,
  pcg32AlgorithmId,
  pcg32AlgorithmVersion,
  randomStreamDerivationId,
  randomStreamDerivationVersion,
  serializeNamedRandomStream,
  type RandomStreamPurpose,
} from './rng.ts';

describe('Pcg32', () => {
  it('matches fixed PCG32 reference vectors for the approved algorithm version', () => {
    let rng = Pcg32.fromSeed(42n, 54n);
    const outputs: string[] = [];

    for (let index = 0; index < 6; index += 1) {
      const draw = rng.next();
      outputs.push(formatHexUint32(draw.value));
      rng = draw.state;
    }

    expect(outputs).toEqual([
      '0xa15c02b7',
      '0x7b47f409',
      '0xba1d3330',
      '0x83d2f293',
      '0xbfa4784b',
      '0xcbed606e',
    ]);
  });

  it('serializes explicit versioned state and restores without changing the next outputs', () => {
    let rng = Pcg32.fromSeed(0x1234_5678_9abc_def0n, 0x0fed_cba9_8765_4321n);
    const first = rng.next();
    rng = first.state;

    const serialized = rng.serialize();
    expect(serialized).toEqual({
      algorithmId: pcg32AlgorithmId,
      algorithmVersion: pcg32AlgorithmVersion,
      state: '0x70583300b019ef75',
      streamSelector: '0x0fedcba987654321',
    });

    const restored = Pcg32.deserialize(serialized);
    const originalContinuation = rng.next();
    const restoredContinuation = restored.next();

    expect(restored.serialize()).toEqual(serialized);
    expect(restoredContinuation.value).toBe(originalContinuation.value);
    expect(restoredContinuation.state.serialize()).toEqual(originalContinuation.state.serialize());
  });

  it('rejects unsupported persisted algorithms and malformed hexadecimal state', () => {
    expect(() =>
      Pcg32.deserialize({
        algorithmId: 'other' as 'pcg32',
        algorithmVersion: pcg32AlgorithmVersion,
        state: '0x0000000000000000',
        streamSelector: '0x0000000000000001',
      }),
    ).toThrow('Unsupported RNG algorithm ID');

    expect(() =>
      Pcg32.deserialize({
        algorithmId: pcg32AlgorithmId,
        algorithmVersion: pcg32AlgorithmVersion,
        state: '0x0',
        streamSelector: '0x0000000000000001',
      }),
    ).toThrow('state must be a lowercase 16-digit hexadecimal uint64 string');

    expect(() =>
      Pcg32.deserialize({
        algorithmId: pcg32AlgorithmId,
        algorithmVersion: pcg32AlgorithmVersion,
        state: '0x0000000000000000',
        streamSelector: '0x1',
      }),
    ).toThrow('streamSelector must be a lowercase 16-digit hexadecimal uint64 string');
  });

  it('treats a 2^32 bound as the full uint32 range', () => {
    const rng = Pcg32.fromSeed(0x1234n, 0x5678n);

    const unboundedDraw = rng.next();
    const boundedDraw = rng.nextBounded(0x1_0000_0000);

    expect(Number.isInteger(boundedDraw.value)).toBe(true);
    expect(boundedDraw.value).toBeGreaterThanOrEqual(0);
    expect(boundedDraw.value).toBeLessThan(0x1_0000_0000);
    expect(boundedDraw.value).toBe(unboundedDraw.value);
    expect(boundedDraw.state.serialize()).toEqual(unboundedDraw.state.serialize());
  });

  it('produces deterministic bounded values without Math.random', () => {
    let rng = Pcg32.fromSeed(99n, 7n);
    const values: number[] = [];

    for (let index = 0; index < 8; index += 1) {
      const draw = rng.nextBounded(6);
      values.push(draw.value + 1);
      rng = draw.state;
    }

    expect(values).toEqual([6, 5, 6, 5, 3, 3, 5, 5]);
  });
});

describe('named deterministic random streams', () => {
  it('creates repeatable named streams from the same master save seed', () => {
    const first = createNamedRandomStream(0x1234_5678_9abc_def0n, 'dungeon-generation');
    const second = createNamedRandomStream('0x123456789abcdef0', 'dungeon-generation');

    expect(serializeNamedRandomStream(first)).toEqual(serializeNamedRandomStream(second));

    let firstRng = first.rng;
    let secondRng = second.rng;
    const firstValues: string[] = [];
    const secondValues: string[] = [];

    for (let index = 0; index < 5; index += 1) {
      const firstDraw = firstRng.next();
      const secondDraw = secondRng.next();
      firstValues.push(formatHexUint32(firstDraw.value));
      secondValues.push(formatHexUint32(secondDraw.value));
      firstRng = firstDraw.state;
      secondRng = secondDraw.state;
    }

    expect(firstValues).toEqual(secondValues);
  });

  it('derives stable independent selectors and outputs for required stream purposes', () => {
    const masterSeed = 0x1234_5678_9abc_def0n;
    const streams = listRandomStreamPurposes().map((purpose) =>
      createNamedRandomStream(masterSeed, purpose),
    );

    expect(streams.map((stream) => stream.identity.purpose)).toEqual([
      'dungeon-generation',
      'combat',
      'expedition-repopulation',
    ]);
    expect(streams.map((stream) => stream.rng.serialize().streamSelector)).toEqual([
      '0xaf34abb34bdcb2b4',
      '0x2ec16124cd842ccf',
      '0x0a575e8371d2c93d',
    ]);
    expect(streams.map((stream) => formatHexUint32(stream.rng.next().value))).toEqual([
      '0xde27295d',
      '0x44c39925',
      '0x1e4e9080',
    ]);
  });

  it('serializes stream identity and version for persistence and restores state', () => {
    const initial = createNamedRandomStream(0n, 'combat');
    const advanced = initial.rng.next().state.next().state;
    const serialized = serializeNamedRandomStream({ ...initial, rng: advanced });

    expect(serialized).toEqual({
      purpose: 'combat',
      derivationId: randomStreamDerivationId,
      derivationVersion: randomStreamDerivationVersion,
      masterSeed: '0x0000000000000000',
      rng: {
        algorithmId: pcg32AlgorithmId,
        algorithmVersion: pcg32AlgorithmVersion,
        state: advanced.serialize().state,
        streamSelector: formatHexUint64(deriveNamedStreamSelector(0n, 'combat')),
      },
    });

    const restored = deserializeNamedRandomStream(serialized);

    expect(restored.identity).toEqual(initial.identity);
    expect(restored.rng.serialize()).toEqual(advanced.serialize());
  });

  it('rejects unregistered purposes and mismatched persisted selectors', () => {
    expect(() => createNamedRandomStream(0n, 'reward' as RandomStreamPurpose)).toThrow(
      'Unsupported random stream purpose',
    );

    const serialized = serializeNamedRandomStream(
      createNamedRandomStream(0n, 'expedition-repopulation'),
    );

    expect(() =>
      deserializeNamedRandomStream({
        ...serialized,
        rng: { ...serialized.rng, streamSelector: '0x0000000000000001' },
      }),
    ).toThrow('Persisted stream selector does not match');
  });
});
