# STORY-M6-002 integrated verification

Verification date: 2026-08-12
Integrated base: `develop` at `b49d8c56fbe69b8ade28dc3315567633358d6820`.

## Passing checks

- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm test` — 47 files and 541 tests passed after integration with the issue #80 adventurer flow.
- `npm run simulation:palace-smoke` — the two configured deterministic harness seeds completed and reports were written.
- `NOTEQUEST_RELEASE_ID=81abcdef81abcdef81abcdef81abcdef81abcdef npm run build` — static build, PWA artifact verification, and production fault-boundary verification passed.

## Browser evidence

A production browser journey now creates and saves the issue #80 adventurer, continues to Town,
enters the Palace through canonical persisted state, switches between equivalent visual/textual map
surfaces, reloads, and compares the durable records/events before and after reload. It is included in
`tests/browser/shell.spec.ts` for desktop, 360 px, and 390 px Chromium projects.

The browser command could not be completed in the final container state because the Playwright
Chromium runtime dependency `libatk-1.0.so.0` is absent. An earlier run after installing Playwright
system dependencies passed the existing 23 shell checks; system packages were not retained by the
execution environment. This is an environment limitation, not a suppressed application failure.

## Honest remaining gates

The two-seed simulation smoke is not the 100,000-seed multi-floor termination and boss-reachability
release gate. This story persists a governed entrance topology; later incremental floor generation
must complete before that release gate can be claimed. Issue #81 and epic #36 remain open for review,
and this work does not bypass the separate release blocker #170.
