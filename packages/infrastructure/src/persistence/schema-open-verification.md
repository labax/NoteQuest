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

The committed unit tests verify the versioned schema descriptor, every store name, every primary key, every required index, the migration placeholder, Dexie schema string derivation, and schema application through a Dexie-compatible host.

The test suite also includes a real clean-open smoke test using `dexie` and `fake-indexeddb/auto`. The smoke test opens a unique database through `createNoteQuestDatabase`, verifies the exact seven object stores, closes the database, and deletes it during cleanup.

## Follow-up trigger

When later persistence repositories are added, keep this clean-open smoke test focused on schema initialization and add separate repository/transaction tests for data writes.

## Subtask 6 local verification record

The subtask 6 verification pass ran the relevant local commands for this schema foundation:

- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm test -- --run packages/infrastructure/src/persistence/dexie-database.test.ts` — passed.
- `npx prettier --check packages/infrastructure/src/index.ts packages/infrastructure/src/persistence/dexie-database.test.ts packages/infrastructure/src/persistence/dexie-database.ts packages/infrastructure/src/persistence/schema.ts packages/infrastructure/src/persistence/schema-open-verification.md` — passed.
- `npm run build` — passed.
- `npm run test:ci` — passed.
- `npm test` — passed.
- `npm ci` — passed after `dexie` and `fake-indexeddb` were added through npm.
- `rg -n "from 'dexie'|from \"dexie\"|indexedDB|IndexedDB" packages/domain packages/application` — found only package README boundary documentation, not domain/application source dependencies.

Unavailable or warning-only checks:

- Historical local `npm test` failures from mismatched installed React packages were resolved after `npm ci` refreshed dependencies.
- `docs/process/**` is excluded from Prettier checks so unrelated process-document formatting does not block mixed code/docs persistence PRs.
