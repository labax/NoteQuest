# M2 deterministic fixture notes

These fixtures protect deterministic core boundaries without copying official NoteQuest prose,
tables, art, or trade dress.

- `packages/domain/src/rng.test.ts` locks PCG32 outputs, serialized state restoration, bounded draws, and named stream derivation so rules work cannot accidentally reroll committed outcomes.
- `packages/infrastructure/src/canonical-json-fixtures.ts` locks small canonical JSON values plus their UTF-8 byte hex for future browser-equivalence checks.
- `packages/infrastructure/src/sha256-fixtures.ts` locks SHA-256 checksums over canonical UTF-8 bytes.
- Domain primitive and action model tests use synthetic identifiers and summaries to cover representative valid and invalid boundaries.

The vectors are intentionally ordered arrays and literal objects. They must not depend on
`Math.random()`, wall-clock time, local timezone, worker ordering, or runtime object iteration beyond
the canonical serializer's explicit key sort.

## M4 synthetic persistence states

`packages/test-support/src/persistence-fixtures.ts` provides reusable builders for empty, valid,
large, recoverable, invalid, and incompatible slot states. All identifiers, timestamps, payloads,
and labels are deterministic project-owned test values; they contain no player saves, private notes,
personal data, or source-game content.

The builders cover fixture classification, valid-state and protected-snapshot relationships,
isolated invalid state, unsupported-newer schema state, and caller-selected record/event scale. The
scale controls are the preparation point for later quota and performance suites; they do not claim a
browser quota boundary or performance certification in this subtask.

Transaction abort/no-change and snapshot creation, replacement, retention, and recovery behavior are
exercised by the infrastructure persistence suites. The transaction coordinator tests inject faults
after required writes and immediately before completion, then compare every transaction-owned store
with a complete prior-valid fixture snapshot. This proves that attempted record, RNG/result, event,
slot, recovery snapshot, and workspace-pointer writes are rolled back together and no success receipt
is returned. Lost-receipt, snapshot-service, and expanded fault-matrix work remain separate checks or
later parent-story subtasks.

Recovery selection tests seed one deterministic candidate for each bounded protected class. They
prove explicit `last-valid`, `pre-migration`, `pre-import`, and `pre-reset` selection, ordered eligible
listing, schema and complete-state rejection, and inspection-only behavior across active slot,
record, snapshot, and staging data. Snapshot activation and the expanded recovery workflow remain
separate parent-story subtasks.

## Workflow placeholders

Import and migration placeholder builders use the implemented staging repository shape and the
corresponding `pre-import` or `pre-migration` protected snapshot. They represent inactive,
deterministic workflow inputs only; no archive parser, migration execution, activation, or user data
is implied. The migration payload names the currently reserved schema 1-to-2 registration point.

The quota placeholder composes the scalable large fixture with a synthetic pressure marker for the
existing quota-like fault scenario. Counts remain caller-controlled: the fixture does not encode or
claim a real browser quota, warning threshold, storage estimate, or performance result because those
supporting runtime APIs and browser certification are not implemented in this subtask.

Browser-engine persistence cases and the evidence required at the M7 gate are enumerated in
`packages/infrastructure/src/persistence/browser-persistence-m7-gate.md`. That record distinguishes
the fake-IndexedDB M4 guarantees from deferred native IndexedDB, lifecycle, quota, eviction,
private-mode, multi-tab, update, portability, and performance execution; it is a deferral record, not
a gate-pass claim.

The reproducible local command results for issue #71 subtask 6 are recorded in
`packages/infrastructure/src/persistence/persistence-fixture-verification.md`, including focused test
counts, the complete repository verification chain, environment versions, the dependency-audit gap,
and the boundary between local evidence and deferred browser execution.
