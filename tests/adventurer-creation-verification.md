# Adventurer creation verification

**Issue scope:** STORY-M6-001 review follow-up  
**Verification date:** 2026-07-29  
**Source-state command:** `git rev-parse HEAD`  
**Status:** Application/UI/persistence behavior is automated, but production creation remains gated because the repository declares that no approved content package exists. This record does not claim end-to-end story or release acceptance.

## Governance outcome

The detached runtime content assertion was removed. `bundledContentStatus` remains
`no-approved-content-packages-yet`, and the production composition deliberately does not expose an
adventurer-creation port until reviewed source definitions have a selected, integrity-recorded
`PalaceContentManifest`. Synthetic definitions remain test fixtures only; they are not labelled or
bundled as production content.

## Automated evidence

| Concern                                                                                                                                                                | Command                                                                                                                                                                                                                                                                                                   | Result                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Formatting, lint, types, unit/integration/component tests, release-ID tests, production build, PWA artifact boundary, production fault-hook boundary, dependency audit | `NOTEQUEST_RELEASE_ID=<exact-final-head> npm run verify`                                                                                                                                                                                                                                                  | Run at final source state; see PR verification report for exact SHA and counts.                                               |
| Focused creation/read/fault behavior                                                                                                                                   | `npx vitest run packages/application/src/adventurer-creation.test.ts packages/ui/src/adventurer-creation.test.tsx tests/adventurer-creation-persistence.integration.test.ts apps/web/src/composition/adventurer-creation.test.ts packages/infrastructure/src/persistence/persistence-fault-hooks.test.ts` | Passed 26 tests.                                                                                                              |
| Browser-runner wrapper                                                                                                                                                 | `npm run test:browser-runner`                                                                                                                                                                                                                                                                             | Run at final source state; see PR verification report.                                                                        |
| Chromium shell smoke                                                                                                                                                   | `npm run test:browser:smoke`                                                                                                                                                                                                                                                                              | Run at final source state; shell/unavailable-content coverage only. No production creation fault-path or create/reload claim. |

## Remaining blockers and deferred evidence

1. **Governed canonical content is blocked.** The repository does not contain reviewed, selected,
   row-level rights/provenance/attribution/integrity records for the source-derived creation tables,
   spells, effects, and weapons. Production creation therefore remains unavailable rather than
   mislabelling unvalidated definitions as approved.
2. **Canonical definition fixtures are incomplete.** Complete deterministic fixtures for all DRS
   race/class/spell/effect rows must accompany the future governed content package.
3. **Production browser creation and fault-path evidence is blocked by item 1.** Persistence rollback
   and receipt-loss behavior remains integration-level; no fault controls are bundled in production.
4. **Issue #91 evidence remains deferred.** Manual zoom/reflow, representative assistive technology,
   non-Chromium/installed-PWA, browser-restart, and restricted-storage evidence is not claimed.
5. **Hosted checks require repository access.** GitHub Actions, Cloudflare preview, branch freshness,
   mergeability, target branch, and unresolved review threads cannot be inspected from a checkout
   with no configured Git remote and must be rechecked by the PR owner.
