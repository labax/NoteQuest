# UI layer

Owns React presentation primitives and interaction surfaces. UI captures intent and renders read models; it is not the mechanical source of truth.

Allowed dependencies:

- React and UI-only utilities.
- Application commands, queries, and read-model types.
- UI-specific accessibility helpers and copy records.

Forbidden dependencies:

- Direct Dexie/IndexedDB/store access.
- Service-worker cache internals.
- Domain mutation internals used to bypass application commands.
- Bundled content source files used as component-owned rule data.

Component tests live beside components as `*.test.tsx`. Cross-browser, accessibility, and E2E checks should live under top-level `tests/` when configured.
