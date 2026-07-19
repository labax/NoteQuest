const UINT64_MASK = (1n << 64n) - 1n;
const PCG32_MULTIPLIER = 6364136223846793005n;
const UINT32_MASK = 0xffff_ffffn;
const FNV1A_64_OFFSET_BASIS = 0xcbf2_9ce4_8422_2325n;
const FNV1A_64_PRIME = 0x0000_0100_0000_01b3n;

export const pcg32AlgorithmId = 'pcg32' as const;
export const pcg32AlgorithmVersion = '1' as const;
export const randomStreamDerivationId = 'notequest-pcg32-named-stream' as const;
export const randomStreamDerivationVersion = '1' as const;

export const randomStreamPurposeRegistry = {
  dungeonGeneration: {
    name: 'dungeon-generation',
    description: 'Dungeon graph, room, door, trap, and table generation outcomes.',
  },
  combat: {
    name: 'combat',
    description: 'Initiative, attacks, damage, monster actions, and combat-only dice.',
  },
  expeditionRepopulation: {
    name: 'expedition-repopulation',
    description: 'Later-expedition room repopulation and related lifecycle rolls.',
  },
} as const;

export type RandomStreamPurpose =
  (typeof randomStreamPurposeRegistry)[keyof typeof randomStreamPurposeRegistry]['name'];

export interface Pcg32SerializedState {
  readonly algorithmId: typeof pcg32AlgorithmId;
  readonly algorithmVersion: typeof pcg32AlgorithmVersion;
  readonly state: string;
  readonly streamSelector: string;
}

export interface NamedRandomStreamState {
  readonly purpose: RandomStreamPurpose;
  readonly derivationId: typeof randomStreamDerivationId;
  readonly derivationVersion: typeof randomStreamDerivationVersion;
  readonly masterSeed: string;
  readonly rng: Pcg32SerializedState;
}

export interface Pcg32Draw {
  readonly value: number;
  readonly state: Pcg32;
}

export interface NamedRandomStream {
  readonly identity: Omit<NamedRandomStreamState, 'rng'>;
  readonly rng: Pcg32;
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

export function createNamedRandomStream(
  masterSeed: bigint | string,
  purpose: RandomStreamPurpose,
): NamedRandomStream {
  assertRegisteredRandomStreamPurpose(purpose);

  const normalizedMasterSeed = normalizeMasterSeed(masterSeed);
  const streamSelector = deriveNamedStreamSelector(normalizedMasterSeed, purpose);

  return {
    identity: {
      purpose,
      derivationId: randomStreamDerivationId,
      derivationVersion: randomStreamDerivationVersion,
      masterSeed: formatHexUint64(normalizedMasterSeed),
    },
    rng: Pcg32.fromSeed(normalizedMasterSeed, streamSelector),
  };
}

export function serializeNamedRandomStream(stream: NamedRandomStream): NamedRandomStreamState {
  return {
    ...stream.identity,
    rng: stream.rng.serialize(),
  };
}

export function deserializeNamedRandomStream(
  serialized: NamedRandomStreamState,
): NamedRandomStream {
  assertRegisteredRandomStreamPurpose(serialized.purpose);

  if (serialized.derivationId !== randomStreamDerivationId) {
    throw new Error(`Unsupported random stream derivation ID: ${serialized.derivationId}`);
  }

  if (serialized.derivationVersion !== randomStreamDerivationVersion) {
    throw new Error(
      `Unsupported random stream derivation version: ${serialized.derivationVersion}`,
    );
  }

  const masterSeed = normalizeMasterSeed(serialized.masterSeed);
  const expectedSelector = formatHexUint64(
    deriveNamedStreamSelector(masterSeed, serialized.purpose),
  );

  if (serialized.rng.streamSelector !== expectedSelector) {
    throw new Error('Persisted stream selector does not match the named stream derivation');
  }

  return {
    identity: {
      purpose: serialized.purpose,
      derivationId: serialized.derivationId,
      derivationVersion: serialized.derivationVersion,
      masterSeed: formatHexUint64(masterSeed),
    },
    rng: Pcg32.deserialize(serialized.rng),
  };
}

export function deriveNamedStreamSelector(
  masterSeed: bigint | string,
  purpose: RandomStreamPurpose,
): bigint {
  assertRegisteredRandomStreamPurpose(purpose);

  const normalizedMasterSeed = normalizeMasterSeed(masterSeed);
  return fnv1a64(
    `${randomStreamDerivationId}:${randomStreamDerivationVersion}:${formatHexUint64(
      normalizedMasterSeed,
    )}:${purpose}`,
  );
}

export function listRandomStreamPurposes(): readonly RandomStreamPurpose[] {
  return Object.values(randomStreamPurposeRegistry).map((entry) => entry.name);
}

export function assertRegisteredRandomStreamPurpose(
  purpose: string,
): asserts purpose is RandomStreamPurpose {
  if (!listRandomStreamPurposes().includes(purpose as RandomStreamPurpose)) {
    throw new Error(`Unsupported random stream purpose: ${purpose}`);
  }
}

export function formatHexUint64(value: bigint): string {
  return `0x${toUint64(value).toString(16).padStart(16, '0')}`;
}

function derivePcg32Increment(streamSelector: bigint): bigint {
  return toUint64(streamSelector << 1n) | 1n;
}

function normalizeMasterSeed(masterSeed: bigint | string): bigint {
  return typeof masterSeed === 'bigint'
    ? toUint64(masterSeed)
    : parseHexUint64(masterSeed, 'masterSeed');
}

function fnv1a64(input: string): bigint {
  let hash = FNV1A_64_OFFSET_BASIS;

  for (let index = 0; index < input.length; index += 1) {
    const codePoint = input.charCodeAt(index);

    if (codePoint > 0x7f) {
      throw new Error('Random stream derivation input must be ASCII');
    }

    hash = toUint64(hash ^ BigInt(codePoint));
    hash = toUint64(hash * FNV1A_64_PRIME);
  }

  return hash;
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
