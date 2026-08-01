# Adventurer creation verification

**Issue scope:** STORY-M6-001 review follow-up  
**Verification date:** 2026-08-01  
**Verified implementation commit:** `c029d509acc39fb845725a60e98e2e635bcff4d1`  
**Verified implementation tree:** `450cf5bb571511d22fea9bc927b413a56064dafd`  
**Status:** Governed authorized content is validated at composition, and production creation is composed through the atomic local persistence boundary.

## Automated evidence

| Concern                           | Command                                                                                                                                                                                                                                                          | Result                                                                                                                                       |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Full repository verification      | `NOTEQUEST_RELEASE_ID=c029d509acc39fb845725a60e98e2e635bcff4d1 npm run verify`                                                                                                                                                                                   | Passed at the verified implementation: 41 test files and 442 tests, release-ID checks, build, PWA/fault-boundary checks, and audit.          |
| Focused creation/content behavior | `npx vitest run apps/web/src/composition/adventurer-creation.test.ts packages/application/src/adventurer-creation.test.ts packages/content/src/authorized-notequest-adventurer-creation.test.ts tests/authorized-notequest-adventurer-content-integrity.test.ts` | Production composition, deterministic application behavior, manifest structure, and recorded integrity pass.                                 |
| Browser runner                    | `npm run test:browser-runner`                                                                                                                                                                                                                                    | Passed 3 browser-runner contract tests.                                                                                                      |
| Chromium shell smoke              | `npm run test:browser:smoke`                                                                                                                                                                                                                                     | Passed 26 Chromium tests across desktop, 360 px, and 390 px, including create, durable reload, identical evidence, and no additional writes. |

## Scope and deferred evidence

1. Authorized structured definitions contain mechanics and names only; no source prose, artwork,
   screenshots, layout, or trade dress is bundled.
2. Persistence receipt-loss fault injection remains test-only and is excluded from production bundles.
3. Issue #91 manual zoom/reflow, representative assistive technology, non-Chromium/installed-PWA,
   browser-restart, and restricted-storage evidence remains deferred and is not claimed here.
4. GitHub Actions, Cloudflare deployment, mergeability, and review-thread conclusions are mutable
   hosted evidence and are intentionally reported in the PR rather than embedded as self-staling source.
