# Persistence fault-injection verification record

Issue #70 subtask 6 records the local verification pass for the bounded transaction and snapshot
fault-hook implementation.

## Scope

- Subtask: issue #70 subtask 6/6, run the build, strict typecheck, lint, and focused fault tests.
- Boundary: the private one-shot test controller, transaction and protected-snapshot fault seams,
  prior-state preservation, truthful lost-receipt reporting, and production-control exclusion.
- Environment: Node 24.15.0 and npm 11.4.2, matching the repository engine declaration.
- Out of scope: the full release-candidate fault matrix, browser-native quota behavior, UI failure
  presentation, production diagnostics, and future staging/migration/import fault expansion.

## Verification commands

The following commands passed locally on 2026-07-26:

- `npm ci` — restored the committed dependency tree successfully.
- `npm test -- --run packages/test-support/src/persistence-fault-controller.test.ts packages/infrastructure/src/persistence/dexie-action-transaction-coordinator.test.ts packages/infrastructure/src/persistence/dexie-snapshot-service.test.ts tests/production-persistence-fault-boundary.test.ts`
  — 47 focused tests passed across four files.
- `npm run verify` — the repository verification chain passed:
  - `npm run format:check` passed;
  - `npm run lint` completed with zero warnings;
  - `npm run typecheck` completed successfully under strict TypeScript;
  - `npm test` passed 181 tests across 23 files; and
  - `npm run build` completed the typecheck and Vite production build, then inspected three emitted
    files and found no test persistence fault controls.
- `git diff --check` — the final patch contains no whitespace errors.

## Verified claims

- Transaction faults before the transaction, after required writes, and before completion abort and
  retain the previous valid record, empty event position, and slot revision.
- A post-completion lost receipt reports an unknown commit outcome rather than falsely claiming an
  abort, while the committed revision remains durable.
- Snapshot replacement and restore faults retain the prior protected snapshot, slot pointer, records,
  and staging state.
- Quota-like and recovery-read scenarios identify their exact point and machine-readable failure kind.
- Recovery listing propagates injected recovery-read storage failures without returning a partial or
  misleading successful list and without mutating persistence state.
- Production construction rejects supplied hooks, the infrastructure entrypoint excludes the test
  controller, and emitted web assets exclude test-controller identifiers.

## Gaps and deferred scope

No required local verification command was skipped. `npm ci` reported one high-severity audit advisory;
dependency remediation is not part of this persistence fault-hook subtask and must follow the project's
separate dependency review process. The exhaustive 1,000-fault release-candidate matrix, real browser
quota simulation, and staging/migration/import scenarios remain explicitly deferred.
Post-completion snapshot retain/restore receipt-loss points are also deferred until their service
contract can represent a durable-but-unacknowledged result without calling it a rolled-back failure.
