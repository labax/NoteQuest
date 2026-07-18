# Test layout conventions

Run all committed tests in non-watch mode with `npm test` or the explicit CI alias `npm run test:ci`.
The root Vitest config defaults to the `node` environment so pure domain and application tests do not depend on browser-only APIs.
React/UI tests that need DOM APIs must opt in explicitly, for example with `// @vitest-environment jsdom` or a later dedicated UI test project.

- `packages/domain/**/*.test.ts`: pure domain unit/property tests with no React, browser storage, routing, service-worker, adapter, app, or UI imports.
- `packages/application/**/*.test.ts`: command/query and port-contract tests using domain and test doubles.
- `packages/infrastructure/**/*.test.ts`: adapter tests for persistence, migration, hashing, import/export, and service-worker coordination once implemented.
- `packages/ui/**/*.test.tsx`: shared React component and accessibility-focused component tests; opt in to jsdom when DOM rendering is needed.
- `apps/web/src/**/*.test.tsx`: web-app shell, composition, and app-specific component tests; opt in to jsdom when DOM rendering is needed.
- `tests/**/*.test.ts`: repository-level scaffold, architecture, and cross-workspace tests that should avoid browser-only APIs unless explicitly marked.
- `tests/e2e/`, `tests/browser/`, `tests/performance/`, `tests/security/`, and `tests/accessibility/`: future cross-layer suites when tooling is added.
- `packages/test-support/`: shared test builders and synthetic fixtures; do not duplicate production domain rules here.
- `packages/content/` fixtures must remain approved or project-original and separate from executable application logic.
