const UINT64_MASK = (1n << 64n) - 1n;
const PCG32_MULTIPLIER = 6364136223846793005n;
const UINT32_MASK = 0xffff_ffffn;

export const pcg32AlgorithmId = 'pcg32' as const;
export const pcg32AlgorithmVersion = '1' as const;

export interface Pcg32SerializedState {
  readonly algorithmId: typeof pcg32AlgorithmId;
  readonly algorithmVersion: typeof pcg32AlgorithmVersion;
  readonly state: string;
  readonly streamSelector: string;
}

export interface Pcg32Draw {
  readonly value: number;
  readonly state: Pcg32;
}

/**
 * Pure project-owned PCG32 random number generator.
 *
 * PCG32 is deterministic and suitable for rules, generation, simulations,
 * fixtures, and persisted replay. It is not cryptographic randomness and must
 * not be used for secrets, security tokens, gambling, or other adversarial use.
 */
export class Pcg32 {
  readonly #state: bigint;
  readonly #streamSelector: bigint;
  readonly #increment: bigint;

  private constructor(state: bigint, streamSelector: bigint) {
    this.#state = toUint64(state);
    this.#streamSelector = toUint64(streamSelector);
    this.#increment = derivePcg32Increment(this.#streamSelector);
  }

  get state(): bigint {
    return this.#state;
  }

  get streamSelector(): bigint {
    return this.#streamSelector;
  }

  static fromSeed(seedState: bigint, streamSelector: bigint): Pcg32 {
    const normalizedStreamSelector = toUint64(streamSelector);
    let rng = new Pcg32(0n, normalizedStreamSelector);
    rng = rng.next().state;
    rng = new Pcg32(rng.#state + seedState, normalizedStreamSelector);
    return rng.next().state;
  }

  static fromState(state: bigint, streamSelector: bigint): Pcg32 {
    return new Pcg32(state, streamSelector);
  }

  static deserialize(serialized: Pcg32SerializedState): Pcg32 {
    if (serialized.algorithmId !== pcg32AlgorithmId) {
      throw new Error(`Unsupported RNG algorithm ID: ${serialized.algorithmId}`);
    }

    if (serialized.algorithmVersion !== pcg32AlgorithmVersion) {
      throw new Error(`Unsupported RNG algorithm version: ${serialized.algorithmVersion}`);
    }

    return new Pcg32(
      parseHexUint64(serialized.state, 'state'),
      parseHexUint64(serialized.streamSelector, 'streamSelector'),
    );
  }

  next(): Pcg32Draw {
    const oldState = this.#state;
    const nextState = toUint64(oldState * PCG32_MULTIPLIER + this.#increment);
    const xorshifted = Number(((oldState >> 18n) ^ oldState) >> 27n) >>> 0;
    const rotation = Number(oldState >> 59n) & 31;
    const value = ((xorshifted >>> rotation) | (xorshifted << (-rotation & 31))) >>> 0;

    return { value, state: new Pcg32(nextState, this.#streamSelector) };
  }

  nextBounded(exclusiveUpperBound: number): Pcg32Draw {
    if (
      !Number.isSafeInteger(exclusiveUpperBound) ||
      exclusiveUpperBound <= 0 ||
      exclusiveUpperBound > 0x1_0000_0000
    ) {
      throw new RangeError('exclusiveUpperBound must be a positive safe integer at most 2^32');
    }

    if (exclusiveUpperBound === 0x1_0000_0000) {
      return this.next();
    }

    const bound = exclusiveUpperBound >>> 0;
    const threshold = (0x1_0000_0000 - bound) % bound;
    let draw: Pcg32Draw = this.next();

    while (draw.value < threshold) {
      draw = draw.state.next();
    }

    return { value: draw.value % bound, state: draw.state };
  }

  serialize(): Pcg32SerializedState {
    return {
      algorithmId: pcg32AlgorithmId,
      algorithmVersion: pcg32AlgorithmVersion,
      state: formatHexUint64(this.#state),
      streamSelector: formatHexUint64(this.#streamSelector),
    };
  }
}

export function formatHexUint64(value: bigint): string {
  return `0x${toUint64(value).toString(16).padStart(16, '0')}`;
}

function derivePcg32Increment(streamSelector: bigint): bigint {
  return toUint64(streamSelector << 1n) | 1n;
}

function parseHexUint64(value: string, fieldName: string): bigint {
  if (!/^0x[0-9a-f]{16}$/u.test(value)) {
    throw new Error(`${fieldName} must be a lowercase 16-digit hexadecimal uint64 string`);
  }

  return BigInt(value);
}

function toUint64(value: bigint): bigint {
  return BigInt.asUintN(64, value & UINT64_MASK);
}

export function formatHexUint32(value: number): string {
  return `0x${(BigInt(value >>> 0) & UINT32_MASK).toString(16).padStart(8, '0')}`;
}
