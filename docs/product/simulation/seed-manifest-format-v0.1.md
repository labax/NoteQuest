# Deterministic Seed Manifest Format v0.1

## Purpose

This document defines the small, deterministic seed manifest boundary for Palace simulation runs. A seed manifest is input metadata for a future simulation CLI; it is not a player-facing save, recruitment list, rights record, or source of private user data.

## Format summary

Seed manifests use JSON compatible with canonical JSON hashing. The code representation and validator live in `packages/simulation/src/index.ts`.

Required top-level fields:

| Field | Requirement |
|---|---|
| `schemaVersion` | Must be `notequest-seed-manifest.schema.v0.1`. |
| `manifestId` | Stable lowercase manifest identity, unique within the project. |
| `manifestVersion` | Semantic version for changes to the manifest itself. |
| `runPurpose` | One of `qa-smoke`, `qa-regression`, or `participant`. |
| `dungeonType` | `palace` for this story. |
| `seedSet` | Either explicit 64-bit hexadecimal seeds or a contiguous range start and count. |
| `versions.rulesVersion` | Rules specification version used by the run. |
| `versions.contentManifest` | Palace content manifest identity plus public-safe entry-level hash evidence derived from the Palace manifest integrity payload. |
| `versions.rng` | RNG algorithm and named-stream derivation versions. |
| `partitioning` | Deterministic partition metadata for later parallel execution. |
| `privacy` | Must state that the manifest contains no real user data and uses synthetic public-safe fixtures. |

## Palace content identity and hash evidence

`versions.contentManifest` links a simulation seed set to the exact selected Palace content/hash set used by the run. It contains:

| Field | Requirement |
|---|---|
| `schemaVersion` | `palace-content-manifest.schema.v0.1`. |
| `packageId` | `palace`. |
| `contentVersion` | Semantic Palace content version. |
| `rulesVersion` | Must match `versions.rulesVersion`. |
| `entries[]` | Public-safe entry hash evidence records. |

Each `entries[]` item records `contentId`, `algorithm: "SHA-256"`, `canonicalization: "RFC-8785"`, `hashInputKind: "palace-manifest-entry-integrity-payload.v0.1"`, and a `sha256:<64 lowercase hex>` checksum. The evidence intentionally omits canonical JSON payloads, private rights evidence, user data, save data, participant data, and official source expression.

## Seeds

Explicit seed sets list `0x`-prefixed lowercase 64-bit hexadecimal strings. Range seed sets provide a `start` value in the same format plus a positive `count`. Duplicate explicit seeds are rejected so aggregate results cannot silently double-count a run.

## Deterministic partitioning

The v0.1 partition strategy is `contiguous-index-range`. It uses zero-based seed indexes and assigns each partition a half-open `[startInclusive, endExclusive)` index range.

For a seed set with `totalCount`, `partitionCount`, and `partitionIndex`:

```text
baseSize = Math.floor(totalCount / partitionCount)
remainder = totalCount % partitionCount
startInclusive = partitionIndex * baseSize + Math.min(partitionIndex, remainder)
endExclusive = startInclusive + baseSize + (partitionIndex < remainder ? 1 : 0)
```

Partitions with `partitionIndex < remainder` receive one extra seed, so non-divisible remainder seeds always go to the lowest partition indexes. Aggregate reports must use the invariant `sort-by-seed-before-reduction`, so worker count and completion order cannot change final aggregate results.

## Hash payload

Reports may hash `{ "hashInputKind": "notequest-seed-manifest-hash-input.v0.1", "manifest": <manifest> }` using canonical JSON and SHA-256. The manifest includes the Palace content identity/hash evidence described above. This optional report hash is an integrity marker, not a signature, authentication mechanism, privacy control, or rights record.

## QA and participant seed sets

Internal QA manifests should use broad deterministic ranges plus curated regression and boundary explicit seeds. Participant manifests should be separately frozen before recruitment, balanced for the study plan, and never rerolled for facilitator or participant preference. Participant seed manifests must still contain only seed metadata and synthetic identifiers; recruitment records, names, notes, save data, consent records, and observations belong in access-controlled research evidence storage, not in seed manifests.

## Fixtures

Small rights-safe Palace fixtures are stored under `tests/fixtures/simulation/`. They are project-original synthetic manifests and contain no real player saves, participant data, official prose, art, screenshots, trade dress, private rights evidence, consent records, recruitment records, observations, or facilitator data.
