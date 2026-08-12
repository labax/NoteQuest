# Adventurer creation verification

**Issue scope:** STORY-M6-001 review follow-up  
**Verification date:** 2026-08-12  
**Verified implementation commit:** `d3dc8bdc1a972091e373f24719b52a8649a0e8f0`  
**Verified implementation tree:** `e3cd8836296e8a9ede04b6f54c14aefa01c8921e`  
**Status:** Governed authorized content is validated at composition, and production creation is composed through the atomic local persistence boundary.

## Automated evidence

| Concern                           | Command                                                                                                                                                                                                   | Result                                                                                                                                                                                                                      |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Full repository verification      | `NOTEQUEST_RELEASE_ID=d3dc8bdc1a972091e373f24719b52a8649a0e8f0 npm run verify`                                                                                                                            | Formatting, lint, typecheck, 41 files / 511 tests, release-ID checks, build, PWA artifact, and fault-boundary checks passed; audit was blocked by newly published advisories in locked transitive development dependencies. |
| Focused durable creation behavior | `npx vitest run packages/application/src/adventurer-creation.test.ts apps/web/src/composition/adventurer-creation.test.ts` and `npx vitest run tests/adventurer-creation-persistence.integration.test.ts` | Passed 85 focused application/composition tests and 4 real-Dexie persistence tests.                                                                                                                                         |
| Browser runner                    | `npm run test:browser-runner`                                                                                                                                                                             | Passed 3 browser-runner contract tests.                                                                                                                                                                                     |
| Chromium shell smoke              | `npm run test:browser:smoke`                                                                                                                                                                              | Passed 26 Chromium tests across desktop, 360 px, and 390 px, including create, durable reload, identical evidence, and full-store equality.                                                                                 |
| Chromium PWA smoke                | `npm run test:browser:pwa`                                                                                                                                                                                | Passed the production service-worker install and offline relaunch check.                                                                                                                                                    |

## Scope and deferred evidence

1. Authorized structured definitions contain mechanics and names only; no source prose, artwork,
   screenshots, layout, or trade dress is bundled.
2. Persistence receipt-loss fault injection remains test-only and is excluded from production bundles.
3. Issue #91 manual zoom/reflow, representative assistive technology, non-Chromium/installed-PWA,
   browser-restart, and restricted-storage evidence remains deferred and is not claimed here.
4. GitHub Actions, Cloudflare deployment, mergeability, and review-thread conclusions are mutable
   hosted evidence and are intentionally reported in the PR rather than embedded as self-staling source.
