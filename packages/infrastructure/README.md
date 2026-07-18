# Infrastructure layer

Owns concrete adapters for browser and platform services after those services are approved: persistence, migration storage, hashing, compression, import/export file APIs, service-worker coordination, and hosted-static integration.

Allowed dependencies:

- Application ports.
- Domain types needed by adapters.
- Approved platform libraries and browser APIs.

Forbidden dependencies:

- Inventing domain rules or mechanical outcomes.
- React presentation components or route-owned control flow.
- Bundled content authoring/source files except through approved content repositories or manifests.

Tests live beside adapters as `*.test.ts` for focused adapter behaviour. Browser-specific integration and E2E coverage should live under top-level `tests/` when added.
