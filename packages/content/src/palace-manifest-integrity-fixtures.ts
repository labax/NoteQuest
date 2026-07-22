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
  {
    contentId: 'palace.fixture.room-table.row-1',
    checksum: 'sha256:548e76024ecbc7df2bfa828ba23b7d915d27932e5376b29e528bd0feb4ea531f',
    canonicalization: 'RFC-8785',
    algorithm: 'SHA-256',
    hashInputKind: 'palace-manifest-entry-integrity-payload.v0.1',
    reviewNote:
      'Project-original synthetic row fixture; update only with reviewed fixture changes.',
  },
  {
    contentId: 'palace.fixture.room-table.row-2',
    checksum: 'sha256:f792edf780e933caec3c72669648b786f9bedb34f7b64ffb08888ed108134cf2',
    canonicalization: 'RFC-8785',
    algorithm: 'SHA-256',
    hashInputKind: 'palace-manifest-entry-integrity-payload.v0.1',
    reviewNote:
      'Project-original synthetic row fixture; update only with reviewed fixture changes.',
  },
  {
    contentId: 'palace.fixture.room-table.row-3',
    checksum: 'sha256:3f616cd0fbafce49458a297a7addc06a6fb19ea5c60289c6d48cd72eee48eb64',
    canonicalization: 'RFC-8785',
    algorithm: 'SHA-256',
    hashInputKind: 'palace-manifest-entry-integrity-payload.v0.1',
    reviewNote:
      'Project-original synthetic row fixture; update only with reviewed fixture changes.',
  },
  {
    contentId: 'palace.fixture.room-table.row-4',
    checksum: 'sha256:2faa60f65201202956ab184b5135378075cc64f1a39b86efc1fb9cb98f1e9b0e',
    canonicalization: 'RFC-8785',
    algorithm: 'SHA-256',
    hashInputKind: 'palace-manifest-entry-integrity-payload.v0.1',
    reviewNote:
      'Project-original synthetic row fixture; update only with reviewed fixture changes.',
  },
  {
    contentId: 'palace.fixture.room-table.row-5',
    checksum: 'sha256:a1f77c8b6a0a4a8d943a65e673127c798f6249b252bf211442c0a9bcab5cc628',
    canonicalization: 'RFC-8785',
    algorithm: 'SHA-256',
    hashInputKind: 'palace-manifest-entry-integrity-payload.v0.1',
    reviewNote:
      'Project-original synthetic row fixture; update only with reviewed fixture changes.',
  },
  {
    contentId: 'palace.fixture.room-table.row-6',
    checksum: 'sha256:012da1ee2b19c818e76ecc3bbf35a95aa77ff86141f0de8b21741b434638784d',
    canonicalization: 'RFC-8785',
    algorithm: 'SHA-256',
    hashInputKind: 'palace-manifest-entry-integrity-payload.v0.1',
    reviewNote:
      'Project-original synthetic row fixture; update only with reviewed fixture changes.',
  },
] as const satisfies readonly PalaceManifestExpectedHashFixture[];
