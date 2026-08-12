# Test layout conventions

Run all committed tests in non-watch mode with `npm test` or the explicit CI alias `npm run test:ci`.
The root Vitest config defaults to the `node` environment so pure domain and application tests do not depend on browser-only APIs.
React/UI tests that need DOM APIs must opt in explicitly, for example with `// @vitest-environment jsdom` or a later dedicated UI test project.

Issue-specific build and smoke evidence for STORY-M6-002 subtask 6 is recorded in
[`docs/process/story-m6-002-subtask-6-verification.md`](../docs/process/story-m6-002-subtask-6-verification.md).

- `packages/domain/**/*.test.ts`: pure domain unit/property tests with no React, browser storage, routing, service-worker, adapter, app, or UI imports.
- `packages/application/**/*.test.ts`: command/query and port-contract tests using domain and test doubles.
- `packages/infrastructure/**/*.test.ts`: adapter tests for persistence, migration, hashing, import/export, and service-worker coordination once implemented.
- `packages/ui/**/*.test.tsx`: shared React component and accessibility-focused component tests; opt in to jsdom when DOM rendering is needed.
- `apps/web/src/**/*.test.tsx`: web-app shell, composition, and app-specific component tests; opt in to jsdom when DOM rendering is needed.
- `tests/**/*.test.ts`: repository-level scaffold, architecture, and cross-workspace tests that should avoid browser-only APIs unless explicitly marked.
- `tests/browser/`: Playwright shell smoke tests. Run `npm run test:browser` to build and run all projects, `npm run test:browser:ci` against an already-built app for the same shell-plus-PWA sequence used by CI, `npm run test:browser:smoke` for the 1280px desktop plus 360px and 390px phone checks, or `npm run test:browser:pwa` for only the Chromium service-worker/offline project.
- `tests/e2e/`, `tests/performance/`, `tests/security/`, and `tests/accessibility/`: future cross-layer suites when tooling is added.
- `packages/test-support/`: shared test builders and synthetic fixtures; do not duplicate production domain rules here.
- `packages/content/` fixtures must remain approved or project-original and separate from executable application logic.

Browser fixtures live under `tests/browser/fixtures/`, are test-only and project-original, and must
not be imported by the application. The shell suite currently covers load, routing/fallback,
reload, empty save-slot readiness, landmark/focus/live-region foundations, minimum-width control
separation, and an offline relaunch. The responsive smoke asserts the 1280px two-region/three-slot
desktop composition and the 360px/390px single-column regions/slots, 44px controls, and lack of horizontal
overflow; it is a DOM geometry check rather than a screenshot-baseline review. Synthetic
blocked/waiting/failed/update-ready PWA state
injection remains deferred to later story subtasks because the production browser composition does
not expose a test-state override. Full assistive-technology and non-Chromium PWA behavior remain
manual/release-matrix checks.

The dedicated Chromium PWA smoke runs against the production build on loopback (a secure service
worker context). It verifies a controlling worker, the correlated cache-readiness protocol, the
release-scoped Workbox cache and precached responses, truthful cache/storage detail states, and an
offline document/fetch relaunch. It does not simulate browser-process restart, external cache
eviction/corruption, private-mode durability, multi-release tabs, or the non-Chromium release matrix;
those require disposable multi-release hosts or manual browser/device evidence.
Playwright's Chromium network emulation blocks uncached requests but does not consistently change
`navigator.onLine` or emit a platform `offline` event after a service-worker navigation, so this
suite verifies the truthful `Offline ready` shell state rather than asserting `Offline active`;
online/offline event presentation remains covered by the coordinator and shell component tests.

The desktop and phone shell projects block service workers so background install/update messages
cannot race route-announcement assertions; real worker behavior is isolated in `chromium-pwa`.
Accessibility smoke checks validate unique labelled landmarks, the H1/H2 shell structure, sequential
keyboard activation, unobscured visible focus, destination focus, `aria-current`, and
polite/assertive live-region behavior. They are not a substitute for the required axe, full keyboard
journey, screen-reader, browser zoom, contrast, or full
assistive-technology release matrices.

## Browser smoke execution

For a fresh local checkout, use the repository-pinned Node/npm versions and run:

```bash
npm ci
npx playwright install --with-deps chromium
npm run test:browser
```

`test:browser` uses a repository-owned Node runner that supplies a synthetic 40-character release
identity when no release identity is
already set, performs the production build and artifact checks, starts the loopback preview server,
and runs desktop, phone, and PWA projects. When a production build already exists, run
`npm run test:browser:ci` to reproduce the browser portion of the pull-request workflow without
building twice. The CI workflow installs Chromium and its Linux libraries, then gates the pull
request on both the shell/responsive/accessibility projects and the service-worker/offline project.

Browser execution requires a supported Chromium binary plus its host libraries. Environments that
cannot install or launch them can still run Vitest/typecheck/build checks, but that is an environment
limitation rather than passing browser evidence and must be reported with the failing install or
launch command. A successful jsdom run must never be substituted for the Playwright result.

The phone projects open About/Credits and verify the exact build identity remains visible, unchanged,
contained, and free of horizontal overflow at 360px and 390px. Genuine 200% browser zoom requires
interactive browser chrome and is not equivalent to Playwright page-scale or device-scale-factor
emulation. Follow and record the explicit manual procedure in
[`manual-zoom-reflow.md`](browser/manual-zoom-reflow.md); its current review result is **Not run**.
