# Adventurer creation verification

**Issue scope:** STORY-M6-001 review follow-up  
**Verification date:** 2026-08-01  
**Verified implementation commit:** `ae3b836a00f72496b47bb8762e269174c85c7921`  
**Verified implementation tree:** `8046c47f2be376262f9d3844a3b9ce7c7fb9c811`  
**Status:** Governed authorized content is validated at composition, and production creation is composed through the atomic local persistence boundary.

## Automated evidence

| Concern                           | Command                                                                                                                                                                              | Result                                                                                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Full repository verification      | `NOTEQUEST_RELEASE_ID=ae3b836a00f72496b47bb8762e269174c85c7921 npm run verify`                                                                                                       | Passed at the verified implementation: 41 test files and 450 tests, release-ID checks, build, PWA/fault-boundary checks, and audit.         |
| Focused durable creation behavior | `npx vitest run packages/application/src/adventurer-creation.test.ts tests/adventurer-creation-persistence.integration.test.ts apps/web/src/composition/adventurer-creation.test.ts` | Passed 28 semantic-corruption, later-state/snapshot, persistence, and reconciliation-classification tests.                                  |
| Browser runner                    | `npm run test:browser-runner`                                                                                                                                                        | Passed 3 browser-runner contract tests.                                                                                                     |
| Chromium shell smoke              | `npm run test:browser:smoke`                                                                                                                                                         | Passed 26 Chromium tests across desktop, 360 px, and 390 px, including create, durable reload, identical evidence, and full-store equality. |
| Chromium PWA smoke                | `npm run test:browser:pwa`                                                                                                                                                           | Passed the production service-worker install and offline relaunch check.                                                                    |

## Scope and deferred evidence

1. Authorized structured definitions contain mechanics and names only; no source prose, artwork,
   screenshots, layout, or trade dress is bundled.
2. Persistence receipt-loss fault injection remains test-only and is excluded from production bundles.
3. Issue #91 manual zoom/reflow, representative assistive technology, non-Chromium/installed-PWA,
   browser-restart, and restricted-storage evidence remains deferred and is not claimed here.
4. GitHub Actions, Cloudflare deployment, mergeability, and review-thread conclusions are mutable
   hosted evidence and are intentionally reported in the PR rather than embedded as self-staling source.
