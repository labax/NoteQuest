# Project-Original Adventurer Creation Content v0.1

**Status:** Selected project-original replacement package

**Decision:** Issue #80 project-owner request, 2026-07-29

**Runtime content version:** `1.0.0`

**Rules version:** `palace-project-original-creation-rules.v1`

## Purpose

This package replaces the blocked source-derived adventurer-creation content path with independently
authored names, definitions, effects, weapons, starting resources, and concise presentation text. It
exists so the M6 Palace vertical slice can exercise deterministic creation and persistence without
claiming that unapproved source rows are available.

The attached or repository-referenced NoteQuest rulebook is not an input to this package. The
package does not reproduce source names, prose, table rows, artwork, layout, character-sheet design,
or trade dress. The `2d6` and `1d6` table interfaces are generic deterministic application
contracts; their row content and effects are project-original.

## Selected content

- 11 project-original heritages covering results 2–12.
- 11 project-original callings covering results 2–12.
- Six project-original spells covering results 1–6.
- 22 versioned project-original effect definitions.
- 11 versioned project-original starting weapons with complete hand and damage data.
- One explicit starting-state definition.

Fixed spell grants and random spell draws are represented separately. This permits deterministic
tests for both paths, including duplicate independent charges, without relying on source-derived
rows.

## Governance

Every runtime definition is enumerated in
`packages/content/src/project-original-adventurer-creation.ts` with:

- a stable `palace.*` content ID and semantic version;
- `project-original` origin and `project_original` source category;
- the issue #80 replacement decision as public-safe evidence;
- internal-prototype, closed-Palace-playtest, and public-free-core release modes;
- an explicit non-commercial-future-decision restriction;
- saved-history content-version pinning;
- selected project review metadata; and
- a recorded RFC-8785 canonical JSON SHA-256 hash.

The package is public-release eligible as project-original content, but this does not declare the
application or M6 milestone ready for public release. M6 release operations and the remaining
specialist/manual evidence keep their existing gates.

## Compatibility and product position

Saved state and history must pin content version `1.0.0` and rules version
`palace-project-original-creation-rules.v1`. A future source-derived package, if separately approved,
must use different content IDs and an explicit migration or new-save policy. It must not silently
replace these definitions in existing saves.

These names and mechanics are project content, not official NoteQuest material. User-entered
adventurer names remain private local data and are not part of this package.
