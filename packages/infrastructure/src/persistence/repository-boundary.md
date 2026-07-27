# Persistence Repository Boundary

Issue #66 subtask 1 adds application-owned repository ports in `@notequest/application` and Dexie-backed adapters in `@notequest/infrastructure`.

- Application services depend on repository interfaces and typed `RepositoryResult` values.
- Dexie, IndexedDB, physical store names, and compound keys remain infrastructure details.
- Persisted DTO rows are mapped through adapter-owned mapper functions before crossing into application-facing repository records.
- Storage exceptions are translated to application-owned repository errors for unavailable storage, failed reads/writes, and invalid records.
- Adapter tests use unique test databases or explicit fake tables so reads and writes remain isolated and deterministic.
- Domain code must not import repository ports or Dexie adapters; domain state stays persistence-implementation independent.
- The adapter replacement seam is `createDexiePersistenceRepositories(database)`: another storage implementation can provide the same `PersistenceRepositories` interface for tests or future storage changes.

Later M4 subtasks can add atomic transaction coordination, migrations, import/export staging workflows, and UI composition without changing this ownership boundary.
