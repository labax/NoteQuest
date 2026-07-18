# Domain layer

Owns pure NoteQuest mechanical meaning: entities, value objects, deterministic rules, guards, invariants, and transitions.

Allowed dependencies:

- TypeScript language/runtime features.
- Other domain modules.
- Stable data shapes passed in by callers.

Forbidden dependencies:

- React or JSX.
- DOM, browser storage, IndexedDB, Dexie, Cache Storage, service workers, or routing.
- UI copy, layout, analytics, network access, timers, or test-only code.
- Application, infrastructure, UI, content-package implementation, or composition-root modules.

Tests live beside domain modules as `*.test.ts` when they are pure unit/property tests. Cross-layer tests that exercise adapters or UI belong outside this folder.
