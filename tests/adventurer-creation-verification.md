# Adventurer creation verification

**Issue scope:** STORY-M6-001, subtask 6 of 6  
**Verification date:** 2026-07-29  
**Reviewed source state:** `71f0d7a` plus the PR #165 review-fix commit  
**Status:** Automated application, UI, persistence, build, and shell smoke checks pass. This is
implementation evidence, not release approval.

## Automated evidence

| Concern                                                                                                                                                                | Command                                                                                                                                                                                                                           | Result                                                                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Formatting, lint, types, unit/integration/component tests, release-ID tests, production build, PWA artifact boundary, production fault-hook boundary, dependency audit | `NOTEQUEST_RELEASE_ID=71f0d7a000000000000000000000000000000000 npm run verify`                                                                                                                                                    | Passed. Vitest ran 38 files and 430 tests; the dependency audit reported zero vulnerabilities.                                                                                                                        |
| Focused creation behavior                                                                                                                                              | `npx vitest run packages/application/src/adventurer-creation.test.ts packages/ui/src/adventurer-creation.test.tsx apps/web/src/composition/adventurer-creation.test.ts tests/adventurer-creation-persistence.integration.test.ts` | Passed 24 tests covering production composition, successful creation, cancellation, validation, failed commit rollback, committed reload, repeated inspection, duplicate submission, and lost receipt reconciliation. |
| Browser-runner wrapper                                                                                                                                                 | `npm run test:browser-runner`                                                                                                                                                                                                     | Passed all 3 runner contract tests.                                                                                                                                                                                   |
| Chromium shell smoke                                                                                                                                                   | `npm run test:browser:smoke`                                                                                                                                                                                                      | Passed 26 tests across desktop, 360 px phone, and 390 px phone projects, including durable create-once/reload coverage.                                                                                               |

The committed-reload persistence fixture constructs a new application service whose ID allocator
throws if called. It reloads the same state and evidence twice, then compares durable records,
events, and snapshots before and after inspection. The persistence-failure fixture injects a fault
after required writes and verifies that records, events, and snapshots remain empty and that the
slot remains at revision zero.

## Acceptance mapping

| Acceptance concern               | Evidence                                                                  | Outcome                                                       |
| -------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Deterministic canonical creation | Application RNG and creation fixtures                                     | Pass with synthetic, project-original content definitions.    |
| Successful atomic commit         | Application fixture plus Dexie integration fixture                        | Pass.                                                         |
| Cancellation                     | Application and Dexie cancellation fixtures                               | Pass; no partial durable state.                               |
| Validation                       | Application Unicode/name fixtures and UI accessibility fixtures           | Pass.                                                         |
| Persistence failure              | Dexie transaction fault fixture and UI failure fixture                    | Pass; prior empty-slot state remains truthful.                |
| Reload and evidence inspection   | New-service reload and immutable-store comparisons                        | Pass. No IDs, random results, events, or snapshots are added. |
| No reroll or duplicate creation  | Idempotency, repeated-commit, lost-receipt, and duplicate-submit fixtures | Pass.                                                         |
| Responsive shell routing         | Chromium desktop and phone smoke projects                                 | Pass for the shell and guarded creation destination.          |

## Documented gaps and deferred checks

1. **Non-production browser fault injection remains integration-level.** The production bundle
   contains no fault hooks. Transaction rollback and lost-receipt behavior are covered through the
   test-only Dexie seam rather than a browser-bundled control.
2. **Cross-browser release evidence is deferred.** The local automated smoke covers Chromium at
   three viewports. Required Firefox, Safari/WebKit, installed-PWA, assistive-technology, and manual
   zoom/reflow evidence remains part of the later browser/release matrix rather than this subtask.
3. **No development fixed-seed control was added.** Existing synthetic fixtures inject explicit
   seeds in tests; exposing a development-only control remains optional and separately reviewable.

These gaps do not invalidate the application-layer and persistence checks, but they prevent this
verification record from claiming end-to-end Palace prototype acceptance or release readiness.
