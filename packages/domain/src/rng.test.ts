import { describe, expect, it } from 'vitest';

import { formatHexUint32, Pcg32, pcg32AlgorithmId, pcg32AlgorithmVersion } from './rng.ts';

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
      streamSelector: '0x1fdb97530eca8643',
    });

    const restored = Pcg32.deserialize(serialized);
    const originalContinuation = rng.next();
    const restoredContinuation = restored.next();

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
