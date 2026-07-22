import type { PalaceContentId } from './palace-manifest.ts';

export interface PalaceManifestExpectedHashFixture {
  readonly contentId: PalaceContentId;
  readonly checksum: `sha256:${string}`;
  readonly canonicalization: 'RFC-8785';
  readonly algorithm: 'SHA-256';
  readonly hashInputKind: 'palace-manifest-entry-integrity-payload.v0.1';
  readonly reviewNote: string;
}

export const palaceManifestExpectedHashFixtures = [
  {
    contentId: 'palace.fixture.room-table',
    checksum: 'sha256:8d13da0adf4900cea8cf2d582e9898c68659541c680b745bc0ca1e53d88a9c80',
    canonicalization: 'RFC-8785',
    algorithm: 'SHA-256',
    hashInputKind: 'palace-manifest-entry-integrity-payload.v0.1',
    reviewNote:
      'Project-original synthetic table fixture; update only with reviewed fixture changes.',
  },
  {
    contentId: 'palace.fixture.mechanic',
    checksum: 'sha256:3f357a2c7bcbc1681c2135c3bac7d33aa2bfa30c997ef2c82a88f27509de6cb9',
    canonicalization: 'RFC-8785',
    algorithm: 'SHA-256',
    hashInputKind: 'palace-manifest-entry-integrity-payload.v0.1',
    reviewNote:
      'Project-original synthetic mechanic fixture; update only with reviewed fixture changes.',
  },
] as const satisfies readonly PalaceManifestExpectedHashFixture[];
