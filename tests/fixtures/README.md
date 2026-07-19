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
