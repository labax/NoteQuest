export const SHA256_HEX_LENGTH = 64;
export const SHA256_CHECKSUM_PREFIX = 'sha256:';

export type Sha256HexDigest = string & { readonly __sha256HexDigestBrand: unique symbol };
export type Sha256Checksum = string & { readonly __sha256ChecksumBrand: unique symbol };

export type Sha256HashErrorCode = 'unsupported' | 'failed';

export interface Sha256HashError {
  readonly code: Sha256HashErrorCode;
  readonly message: string;
  readonly cause?: unknown;
}

export type Sha256HashResult =
  | {
      readonly ok: true;
      readonly algorithm: 'SHA-256';
      readonly hex: Sha256HexDigest;
      readonly checksum: Sha256Checksum;
    }
  | {
      readonly ok: false;
      readonly error: Sha256HashError;
    };

export interface Sha256SubtleCrypto {
  digest(algorithm: AlgorithmIdentifier, data: BufferSource): Promise<ArrayBuffer>;
}

export interface Sha256Hasher {
  hashCanonicalUtf8(canonicalValue: string): Promise<Sha256HashResult>;
}

/**
 * Creates a project-owned SHA-256 adapter for deterministic canonical strings.
 *
 * The adapter hashes the exact UTF-8 bytes of the supplied canonical value. The returned
 * checksum is formatted as `sha256:<64 lowercase hex characters>`. These checksums are
 * integrity markers for detecting accidental corruption or mismatched deterministic data;
 * they are not digital signatures, authentication codes, encryption, or tamper-proof proof
 * of authorship.
 */
export function createSha256Hasher(
  subtleCrypto: Sha256SubtleCrypto | null | undefined = globalThis.crypto?.subtle,
): Sha256Hasher {
  return {
    async hashCanonicalUtf8(canonicalValue: string): Promise<Sha256HashResult> {
      if (subtleCrypto == null) {
        return {
          ok: false,
          error: {
            code: 'unsupported',
            message: 'SHA-256 hashing requires Web Crypto subtle.digest support.',
          },
        };
      }

      try {
        const canonicalBytes = new TextEncoder().encode(canonicalValue);
        const digest = await subtleCrypto.digest('SHA-256', canonicalBytes);
        const hex = toLowercaseHex(digest) as Sha256HexDigest;

        return {
          ok: true,
          algorithm: 'SHA-256',
          hex,
          checksum: `${SHA256_CHECKSUM_PREFIX}${hex}` as Sha256Checksum,
        };
      } catch (cause) {
        return {
          ok: false,
          error: {
            code: 'failed',
            message: 'SHA-256 hashing failed for the provided canonical UTF-8 bytes.',
            cause,
          },
        };
      }
    },
  };
}

export const sha256Hasher = createSha256Hasher();

function toLowercaseHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
