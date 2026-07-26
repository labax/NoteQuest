# Persistence fault-injection hooks

Issue #70 subtasks 1 and 2 identify stable transaction and snapshot failure boundaries and place
their injectable adapter behind the private `@notequest/test-support` workspace. Production exports
do not expose the controller or scenario registry. Persistence constructors also reject any supplied
hook unless `NODE_ENV` is `test`. An armed point fires once, reports its exact identifier through
`InjectedPersistenceFault`, and then clears itself.

## Supported points

| Operation        | Point                                         | Expected durability                                                                          |
| ---------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Action commit    | `transaction.before-transaction`              | No writes begin.                                                                             |
| Action commit    | `transaction.after-required-writes`           | The open transaction aborts; prior state remains.                                            |
| Action commit    | `transaction.before-completion`               | The open transaction aborts; prior state remains.                                            |
| Action commit    | `transaction.after-completion-before-receipt` | The commit is durable but the caller receives a failure, supporting retry/idempotency tests. |
| Snapshot retain  | `snapshot.retain.before-transaction`          | No snapshot write begins.                                                                    |
| Snapshot retain  | `snapshot.retain.after-write`                 | Snapshot replacement and pointer changes roll back.                                          |
| Snapshot retain  | `snapshot.retain.before-completion`           | The open transaction aborts; the prior snapshot remains.                                     |
| Snapshot read    | `snapshot.read.before-transaction`            | The protected-snapshot read fails before IndexedDB access.                                   |
| Snapshot read    | `snapshot.read.after-read`                    | A successful protected-snapshot read is hidden from the caller.                              |
| Recovery select  | `snapshot.select.before-transaction`          | Recovery selection fails before IndexedDB access.                                            |
| Recovery select  | `snapshot.select.after-read`                  | Recovery data remains unchanged but selection reports a read failure.                        |
| Snapshot restore | `snapshot.restore.before-transaction`         | No restore begins.                                                                           |
| Snapshot restore | `snapshot.restore.after-required-writes`      | Record, staging, and slot writes roll back together.                                         |
| Snapshot restore | `snapshot.restore.before-completion`          | The open transaction aborts; prior state remains.                                            |

Tests import `createPersistenceFaultController` from `@notequest/test-support`, arm exactly one named
point, inject it into the persistence adapter, and assert both the returned failure and durable state.
Production construction omits the optional hook dependency; attempting to supply one outside a test
process fails during adapter construction.

Production-boundary verification covers three independent controls: the infrastructure entrypoint
does not export the controller or registry, both persistence adapters reject supplied hooks outside
test mode while normal construction remains available, and every production web build scans emitted
assets for test-controller identifiers.

Integrity tests seed a previous valid record or snapshot before injection, then compare the durable
record, event, slot pointer, staging, and protected-snapshot state after failure. Failures before
transaction completion report `committed: false`; a lost post-commit receipt reports
`committed: "unknown"` with `commit_receipt_failed`, so callers are not falsely told that the durable
commit aborted and can reconcile before retrying.

Post-completion receipt-loss injection remains supported for action commits because that contract can
report `committed: "unknown"`. It is deliberately not exposed for snapshot retain or restore: their
current result contract cannot distinguish a durable write with a lost receipt from an aborted
`storage_failure`. Those two points are deferred until a typed snapshot receipt-loss result exists.

The controller accepts machine-readable `storage_failure`, `quota_exceeded`, and
`recovery_read_failure` kinds. `PERSISTENCE_FAULT_SCENARIOS` provides representative transaction
abort, snapshot write, quota-like transaction, and recovery-read fixtures. Quota injection is a
deterministic storage-error placeholder; browser-specific quota behavior remains a later subtask.

## Deferred sibling subtasks

Subtasks 4 and 5 verify normal production behavior and prior-state preservation but do not mark later
sibling work complete. This subtask does not implement an exhaustive fault matrix, browser-native
quota simulation, UI error presentation, or production diagnostics. Later issue #70 subtasks may
extend the same stable naming scheme with staging, migration, and import points and fixture scenarios.
