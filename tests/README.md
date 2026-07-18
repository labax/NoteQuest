# Test layout conventions

- `src/domain/**/*.test.ts`: pure domain unit/property tests with no React, browser storage, routing, service-worker, or adapter imports.
- `src/application/**/*.test.ts`: command/query and port-contract tests using domain and test doubles.
- `src/infrastructure/**/*.test.ts`: adapter tests for persistence, migration, hashing, import/export, and service-worker coordination once implemented.
- `src/ui/**/*.test.tsx`: React component and accessibility-focused component tests.
- `tests/e2e/`, `tests/browser/`, `tests/performance/`, `tests/security/`, and `tests/accessibility/`: future cross-layer suites when tooling is added.
- `src/content/` fixtures must remain approved or project-original and separate from executable application logic.
