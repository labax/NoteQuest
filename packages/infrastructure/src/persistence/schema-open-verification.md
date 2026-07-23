# NoteQuest Persistence Schema Open Verification

This note records the clean test database verification path for the initial IndexedDB/Dexie schema foundation.

## Scope

- Subtask: issue #65 subtask 5/6, schema-open smoke verification.
- Boundary: infrastructure persistence only.
- Out of scope: repositories, transaction coordination, import/export, save-slot UI, and gameplay state.

## Controlled test database requirements

A schema-open smoke check must use a unique test database name from `createNoteQuestTestDatabaseName` so it does not touch production workspace storage. The database must be deleted or otherwise reset before and after the smoke check.

Expected open sequence:

1. Install the real `dexie` package and a test IndexedDB implementation such as `fake-indexeddb` in an environment with registry access.
2. Create a unique database name with `createNoteQuestTestDatabaseName('schema-open-smoke')`.
3. Provide the test IndexedDB globals before constructing the Dexie database.
4. Call `createNoteQuestDatabase(testDatabaseName)`.
5. Open the database and assert that the object store names are exactly `workspace`, `slots`, `records`, `events`, `snapshots`, `contentPackages`, and `staging`.
6. Close and delete the test database.

## Current repository verification

The committed unit tests currently verify the versioned schema descriptor, every store name, every primary key, every required index, the migration placeholder, Dexie schema string derivation, and schema application through a Dexie-compatible host.

A true open against a clean IndexedDB database is deferred in this container because dependency installation is blocked by the npm registry. The attempted command was:

```sh
npm install dexie fake-indexeddb --workspace @notequest/infrastructure
```

The registry returned `403 Forbidden` for `https://registry.npmjs.org/dexie`, so the real Dexie clean-open smoke cannot be completed here without changing dependency availability.

## Follow-up trigger

When dependency installation is available, add a real smoke test that imports `fake-indexeddb/auto`, opens a unique test database through `createNoteQuestDatabase`, verifies the seven object stores, and deletes the database during cleanup.

## Subtask 6 local verification record

The subtask 6 verification pass ran the relevant local commands for this schema foundation:

- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm test -- --run packages/infrastructure/src/persistence/dexie-database.test.ts` — passed.
- `npx prettier --check packages/infrastructure/src/index.ts packages/infrastructure/src/persistence/dexie-database.test.ts packages/infrastructure/src/persistence/dexie-database.ts packages/infrastructure/src/persistence/schema.ts packages/infrastructure/src/persistence/schema-open-verification.md` — passed.
- `npm run build` — passed.
- `rg -n "Dexie|indexedDB|IndexedDB|dexie" packages/domain packages/application || true` — found only package README boundary documentation, not domain/application source dependencies.

Unavailable or warning-only checks:

- `npm test` — all non-web suites and persistence tests passed, but `apps/web/src/App.test.tsx` failed in this local checkout because installed `react` and `react-dom` package versions differ.
- `npm run format:check` — reports pre-existing formatting warnings in `docs/process/**` files outside the persistence schema change.
- `npm install dexie fake-indexeddb --workspace @notequest/infrastructure` — unavailable in this container because the npm registry returned `403 Forbidden` for `dexie`.
