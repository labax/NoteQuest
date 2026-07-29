# Content packages

Holds bundled, versioned content package scaffolding and manifests separately from executable application logic. This folder must not contain unapproved Palace definitions, copied official prose, source tables, art, screenshots, trade dress, or runtime save data.

Allowed dependencies:

- Manifest/data shapes that can be validated by domain or application code.
- Project-original placeholder metadata that contains no protected game content.

Forbidden dependencies:

- React components, UI layouts, persistence adapters, user data, and runtime instances.
- Domain rule implementation hidden inside content data.

Content validation tests should live with future content-validation tooling or top-level test folders. Package-specific fixtures should remain clearly labelled as synthetic/project-original.

The selected adventurer-creation package is project-original and lives in
`src/project-original-adventurer-creation.ts`. Its manifest enumerates every runtime row,
effect, spell, weapon, and starting-state definition with public-safe provenance and recorded
RFC-8785/SHA-256 integrity evidence. It does not make source-derived content available.
