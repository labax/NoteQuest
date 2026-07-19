# Infrastructure layer

Owns concrete adapters for browser and platform services after those services are approved: persistence, migration storage, hashing, compression, import/export file APIs, service-worker coordination, and hosted-static integration.

Allowed dependencies:

- Application ports.
- Domain types needed by adapters.
- Approved platform libraries and browser APIs.

Forbidden dependencies:

- Inventing domain rules or mechanical outcomes.
- React presentation components or route-owned control flow.
- Bundled content authoring/source files except through approved content repositories or manifests.

Tests live beside adapters as `*.test.ts` for focused adapter behaviour. Browser-specific integration and E2E coverage should live under top-level `tests/` when added.

## Canonical JSON boundary

`serializeCanonicalJson` is the project-owned deterministic JSON adapter for future hashing, content manifest, snapshot, fixture, export, and import workflows. It is host-neutral TypeScript with no UI, storage, network, browser-global, or cryptographic-signing responsibilities.

Supported inputs are JSON-compatible values only: `null`, booleans, strings, finite numbers, arrays, and plain objects. Object keys are serialized in sorted order at every nesting level, arrays keep caller-provided order, and strings/numbers use the platform JSON encoder for primitive JSON spelling.

Unsupported JavaScript values fail with `CanonicalJsonError`, including functions, `undefined` fields or array entries, symbols, symbol-keyed properties, bigints, non-finite numbers, sparse arrays, extra own array properties, cyclic data, and non-plain objects such as `Date`. Callers should canonicalize structured data with this adapter instead of ad hoc string concatenation whenever bytes will later be hashed or compared across Node and browser runtimes.

## SHA-256 integrity hashing boundary

`createSha256Hasher` and the default `sha256Hasher` provide the project-owned SHA-256 adapter for deterministic canonical strings. Callers must pass the exact canonical string returned by `serializeCanonicalJson`; the adapter encodes that string as UTF-8 bytes before hashing so Node tests and future browser code use the same byte boundary.

Successful hash results include a lowercase 64-character hexadecimal digest and a checksum string formatted as `sha256:<digest>`. The `sha256CanonicalJsonFixtures` export records known canonical JSON strings and expected checksums for regression tests and future manifest work.

Hash results are typed. Unsupported hosts return an `unsupported` error when Web Crypto `subtle.digest` is unavailable, and digest failures return a `failed` error with the original cause. These hashes detect accidental corruption or mismatched deterministic data. They are not signatures, message authentication codes, encryption, tamper-proof proof of authorship, or a release-signing mechanism.
