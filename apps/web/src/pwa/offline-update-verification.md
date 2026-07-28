# Offline and update coordinator verification

Issue #76 subtask 6 records implementation-stage checks for the M5 coordinator. This note is not a
release approval, browser-matrix result, accessibility sign-off, or production incident runbook.

## Automated checks

Run from the repository root on 2026-07-28:

| Command                                                                                                                                                                                                                                            | Result                                                                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci`                                                                                                                                                                                                                                           | Passed; restored the lockfile-defined dependencies, audited 592 packages, and reported no vulnerabilities.                                                                                                                                |
| `npm run typecheck`                                                                                                                                                                                                                                | Passed with no TypeScript errors.                                                                                                                                                                                                         |
| `npm run lint`                                                                                                                                                                                                                                     | Passed with zero ESLint warnings or errors.                                                                                                                                                                                               |
| `npm run format:check`                                                                                                                                                                                                                             | Passed; all checked files use the configured Prettier style.                                                                                                                                                                              |
| `npm test -- --run apps/web/src/pwa/update-coordinator.test.ts apps/web/src/pwa/service-worker.test.ts apps/web/src/pwa/storage-capability.test.ts apps/web/src/pwa/status-presentation.test.ts apps/web/src/sw.test.ts apps/web/src/App.test.tsx` | Passed: 6 files and 84 tests. This covers coordinator transitions and blockers, service-worker lifecycle and messaging, cache verification, storage capability bands, shell presentation, and non-destructive activation/reload behavior. |
| `NOTEQUEST_RELEASE_ID=issue-76-subtask-6 npm run build`                                                                                                                                                                                            | Passed: TypeScript, Vite production build, Workbox `injectManifest`, PWA artifact verification, and production fault-boundary verification. The generated precache contained 3 approved entries; controlled activation was present.       |

The first typecheck attempt in the disposable environment reported missing Workbox and
`vite-plugin-pwa` modules because dependencies were absent. `npm ci` restored the committed
dependency graph, after which the same typecheck passed. This was an environment setup condition,
not a source or lockfile change.

## Verified implementation boundary

- Offline readiness requires verified cache readiness and available app-owned local storage.
- Online/offline transitions do not make an unverified cache ready, and established offline-ready
  local play does not require the network.
- Waiting updates remain deferred for unverified, pending, or failed saves and other declared
  blockers; the worker is not messaged while blocked.
- Activation and reload each require an explicit action. A failed update leaves current slot state
  and the active release usable.
- Shell failures expose stable capability/update codes and broad storage bands without save
  contents, names, notes, history, seeds, IP addresses, or persistent user identifiers.

## Deferred specialist and browser evidence

The following cannot be established by jsdom, fake IndexedDB, or Workbox unit mocks and remains at
the documented browser/device or later release gate:

1. Installed-PWA and normal-tab update activation with real current/waiting workers, including
   mixed-release clients and post-reload compatibility checks.
2. Offline cold start, cache eviction, partial/corrupt cache behavior, and old-cache retention across
   the supported browser matrix.
3. Private/restricted-mode durability across reload and browser restart, storage-persistence grants,
   quota pressure, and externally cleared site data.
4. Multi-tab save/update overlap, blocked IndexedDB upgrades, and `versionchange` ownership.
5. Keyboard, screen-reader, focus, announcement, zoom, and responsive review in representative real
   browsers and assistive technologies.

These gaps do not justify optimistic runtime claims: the coordinator remains unverified,
restricted, deferred, or failed until the applicable runtime evidence exists. The real-browser cases
are already enumerated by the M7 browser persistence gate and must not be represented as completed
release evidence by this M5 verification note.

## PR #160 review hardening

Review follow-up checks on 2026-07-28 additionally verify release-scoped cache lookup, correlated
controller/request evidence, the post-controller-change reload boundary, bounded readiness timeout,
explicit cache/update retries, and production safety-state transitions. The focused review suite
passed 90 tests across the PWA, shell, composition, and architecture files. The required
`format:check`, `lint`, `typecheck`, `test:ci`, and production build commands also passed with release
ID `pr-160-review`.

No browser offline/repeat-launch/update smoke test was run during this review follow-up because the
repository does not configure a browser E2E runner or disposable multi-release service-worker test
host. That evidence remains manual/deferred and is not implied by the successful Workbox/jsdom unit
checks.

The final PR #160 follow-up additionally exercised retryable first-install registration, bounded
storage rechecks, and rejected save-slot promises. `test:ci` passed 380 Vitest tests and 3 release-ID
tests; the production build passed with release ID `pr-160-follow-up`. These checks do not replace the
manual browser evidence above.
