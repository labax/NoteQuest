# STORY-M6-002 replacement verification

Verification date: 2026-08-16
Implementation commit tested locally: `d47245d19c83806b3a08e2235e45ab0a2b68d328`.
Required merge base: `develop` at `b49d8c56fbe69b8ade28dc3315567633358d6820`.
Local relationship after the implementation commit: 15 commits ahead and 0 behind (`git rev-list --left-right --count b49d8c56...HEAD`).

The checkout has no configured Git remote or GitHub credentials. Consequently this local run cannot
retarget PR #172, inspect its mergeability/review threads, wait for exact-head GitHub Actions, or
verify an exact-head Cloudflare deployment. Those remain required hosted gates; no earlier-head
browser or deployment evidence is claimed here.

## Passing local checks

- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm test` — 47 files / 541 tests passed.
- `npm run simulation:palace-smoke` — both deterministic smoke seeds completed and reports were written.
- `NOTEQUEST_RELEASE_ID=8f6299039fd43e170a9a9806cb90e8256270f55e npm run build` — typecheck, production Vite/PWA build, PWA artifact verification, and production fault-boundary verification passed before the recovery-only follow-up; the final implementation commit received format, lint, typecheck, and focused application/integration checks.
- `npm run test:browser:smoke` — 29 Chromium tests passed across desktop, 360 px, and 390 px projects after installing the container's Playwright runtime dependencies.
- `npm run test:browser:pwa` — 1 production-service-worker/offline Chromium test passed.

A 390 px local review screenshot was captured at `.tmp/palace-entry-phone-390.png`; generated test
artifacts are intentionally ignored by Git.

## Hosted exact-head gates

After pushing the evidence commit, PR #172 must target `develop`. The complete `develop...HEAD` diff
must contain no addition or deletion of `docs/product/github-issue-creation-process-v0.1.md`. GitHub
Actions, hosted Chromium/PWA, Cloudflare deployment, mergeability, and review-thread status must be
recorded from that pushed exact head before merge. PR #171 is superseded and is not a merge or
release path.

## Separate release-forward blocker

`npm run security:audit` remains failing and is owned by #170. This run reported three high-severity
advisory families (`brace-expansion`, `fast-uri`, and `nanoid`) plus one moderate `postcss` advisory,
for five vulnerable dependency findings in total. This story does not hide, lower, bypass, or absorb
that release-hardening gate.

The two-seed entrance simulation is not the future 100,000-seed multi-floor termination and
boss-reachability release gate. Issue #81 and epic #36 remain open for review.
