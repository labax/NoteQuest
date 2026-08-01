# Adventurer creation verification

**Issue scope:** STORY-M6-001 review follow-up  
**Verification date:** 2026-08-01  
**Source-state command:** `git rev-parse HEAD`  
**Status:** Governed authorized content is validated at composition, and production creation is composed through the atomic local persistence boundary.

## Automated evidence

| Concern                           | Command                                                                                                                                                                                                                                                          | Result                                                                                                                            |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Full repository verification      | `NOTEQUEST_RELEASE_ID=9c1d03145e0bfa003f4b4332c657117be9f739ae npm run verify`                                                                                                                                                                                   | Passed at the verified source state: 41 test files and 437 tests, release-ID checks, build, PWA/fault-boundary checks, and audit. |
| Focused creation/content behavior | `npx vitest run apps/web/src/composition/adventurer-creation.test.ts packages/application/src/adventurer-creation.test.ts packages/content/src/authorized-notequest-adventurer-creation.test.ts tests/authorized-notequest-adventurer-content-integrity.test.ts` | Production composition, deterministic application behavior, manifest structure, and recorded integrity pass.                      |
| Browser runner                    | `npm run test:browser-runner`                                                                                                                                                                                                                                    | Passed 3 browser-runner contract tests.                                                                                           |
| Chromium shell smoke              | `npm run test:browser:smoke`                                                                                                                                                                                                                                     | Passed 23 Chromium tests across desktop, 360 px, and 390 px.                                                                      |

## Scope and deferred evidence

1. Authorized structured definitions contain mechanics and names only; no source prose, artwork,
   screenshots, layout, or trade dress is bundled.
2. Persistence receipt-loss fault injection remains test-only and is excluded from production bundles.
3. Issue #91 manual zoom/reflow, representative assistive technology, non-Chromium/installed-PWA,
   browser-restart, and restricted-storage evidence remains deferred and is not claimed here.
