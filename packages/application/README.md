# Application layer

Coordinates use cases around the domain. This layer will own command/query boundaries, transaction intent, and ports for persistence, RNG, content lookup, import/export, diagnostics, and update coordination.

Allowed dependencies:

- Domain exports.
- Application-owned ports and data-transfer types.

Forbidden dependencies:

- React components, JSX, layout, browser routing, or concrete UI state.
- Concrete Dexie databases, IndexedDB stores, Workbox/service-worker code, Cloudflare APIs, or host-specific infrastructure.
- Bundled content definitions as executable rule shortcuts.

Tests live beside application modules as `*.test.ts` for use-case and port-contract tests. Adapter integration tests belong with infrastructure or higher-level test folders.
