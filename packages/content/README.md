# Content packages

Holds bundled, versioned content package scaffolding and manifests separately from executable application logic. Source-derived Palace definitions require recorded permission, provenance, attribution, review, release-mode, compatibility, and integrity evidence. Copied long-form prose, source art, screenshots, layouts, trade dress, and runtime save data remain outside the package.

Allowed dependencies:

- Manifest/data shapes that can be validated by domain or application code.
- Project-original placeholder metadata that contains no protected game content.
- Permissioned structured source definitions enumerated by the selected Palace manifest.

Forbidden dependencies:

- React components, UI layouts, persistence adapters, user data, and runtime instances.
- Domain rule implementation hidden inside content data.

Content validation tests should live with future content-validation tooling or top-level test folders. Package-specific fixtures must identify whether they are synthetic, project-original, or permissioned source data.

The selected adventurer-creation package lives in
`src/authorized-notequest-adventurer-creation.ts`. Its manifest enumerates every runtime Race,
Class, Basic Spell, effect, weapon, starting-state, and attribution definition with the issue #80
project-owner permission attestation, row-level source/DRS locators, required creator credit,
release-mode restrictions, and recorded RFC-8785/SHA-256 integrity evidence.
