# Adventurer creation verification

**Issue scope:** STORY-M6-001, subtask 6 of 6  
**Verification date:** 2026-07-29  
**Verified implementation commit:** `5f4615a`  
**Status:** Automated application, UI, persistence, build, and shell smoke checks pass. This is
implementation evidence, not release approval.

## Automated evidence

| Concern                                                                                                                                                                | Command                                                                                                                                                                      | Result                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Formatting, lint, types, unit/integration/component tests, release-ID tests, production build, PWA artifact boundary, production fault-hook boundary, dependency audit | `NOTEQUEST_RELEASE_ID=5f4615a-subtask6 npm run verify`                                                                                                                       | Passed. Vitest ran 37 files and 427 tests; the dependency audit reported zero vulnerabilities.                                                                               |
| Focused creation behavior                                                                                                                                              | `npx vitest run packages/application/src/adventurer-creation.test.ts packages/ui/src/adventurer-creation.test.tsx tests/adventurer-creation-persistence.integration.test.ts` | Covered successful creation, cancellation, validation, failed commit rollback, committed reload, repeated inspection, duplicate submission, and lost receipt reconciliation. |
| Browser-runner wrapper                                                                                                                                                 | `npm run test:browser-runner`                                                                                                                                                | Passed all 3 runner contract tests.                                                                                                                                          |
| Production artifact for browser smoke                                                                                                                                  | `NOTEQUEST_RELEASE_ID=5f4615a000000000000000000000000000000000 npm run build`                                                                                                | Passed with an exact 40-character synthetic commit-shaped release identity.                                                                                                  |
| Chromium shell smoke                                                                                                                                                   | `npm run test:browser:smoke`                                                                                                                                                 | Passed 23 tests across desktop, 360 px phone, and 390 px phone projects.                                                                                                     |

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

1. **Runnable production creation is not composed.** `createWebComposition` does not provide the
   optional `adventurerCreation` UI port because the repository has no approved production Palace
   race, class, equipment, and spell content adapter. The shipped shell therefore truthfully shows
   an unavailable-content message and does not mutate the selected slot. Automated tests prove the
   service and UI through synthetic fixtures, but they do not prove that a player can complete the
   flow in the production composition. Do not replace this gap with copied source tables or an
   unapproved placeholder advertised as canonical content.
2. **The browser smoke suite is shell-level.** It verifies routing to the guarded creation
   destination, reload behavior, landmarks, focus, and responsive separation. It cannot complete
   creation until the production port above exists. A browser test covering create, durable result,
   refresh, evidence equivalence, and failure injection remains required when that adapter is
   approved and composed.
3. **Cross-browser release evidence is deferred.** The local automated smoke covers Chromium at
   three viewports. Required Firefox, Safari/WebKit, installed-PWA, assistive-technology, and manual
   zoom/reflow evidence remains part of the later browser/release matrix rather than this subtask.
4. **No development fixed-seed control was added.** Existing synthetic fixtures inject explicit
   seeds in tests; exposing a development-only control remains optional and separately reviewable.

These gaps do not invalidate the application-layer and persistence checks, but they prevent this
verification record from claiming end-to-end Palace prototype acceptance or release readiness.
