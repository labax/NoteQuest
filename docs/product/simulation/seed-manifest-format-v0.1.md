# Deterministic Seed Manifest Format v0.1

## Purpose

This document defines the small, deterministic seed manifest boundary for Palace simulation runs. A seed manifest is input metadata for a future simulation CLI; it is not a player-facing save, recruitment list, or source of private user data.

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
| `versions` | Reproduction versions for rules, content package/content version, RNG algorithm, and RNG stream derivation. |
| `partitioning` | Deterministic partition metadata for later parallel execution. |
| `privacy` | Must state that the manifest contains no real user data and uses synthetic public-safe fixtures. |

## Seeds

Explicit seed sets list `0x`-prefixed lowercase 64-bit hexadecimal strings. Range seed sets provide a `start` value in the same format plus a positive `count`. Duplicate explicit seeds are rejected so aggregate results cannot silently double-count a run.

## Deterministic partitioning

The v0.1 partition strategy is `contiguous-index-range`. A worker receives a `partitionCount` and zero-based `partitionIndex`; future simulation code can select seed indexes where the partition owns the contiguous slice for that index range. Aggregate reports must use the invariant `sort-by-seed-before-reduction`, so worker count and completion order cannot change final aggregate results.

## Hash payload

Reports may hash `{ "hashInputKind": "notequest-seed-manifest-hash-input.v0.1", "manifest": <manifest> }` using canonical JSON and SHA-256. This optional report hash is an integrity marker, not a signature, authentication code, or privacy control.

## QA and participant seed sets

Internal QA manifests should use broad deterministic ranges plus curated regression and boundary explicit seeds. Participant manifests should be separately frozen before recruitment, balanced for the study plan, and never rerolled for facilitator or participant preference. Participant seed manifests must still contain only seed metadata and synthetic identifiers; recruitment records, names, notes, save data, consent records, and observations belong in access-controlled research evidence storage, not in seed manifests.

## Fixtures

Small rights-safe Palace fixtures are stored under `tests/fixtures/simulation/`. They are project-original synthetic manifests and contain no real player saves, participant data, official prose, art, screenshots, trade dress, or private rights evidence.
