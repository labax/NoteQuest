# Authorized NoteQuest Adventurer Creation Content v0.1

**Status:** Selected permissioned-source package, pending ordinary PR review

**Rights instruction:** Issue #80 project-owner attestation, 2026-07-29

**Runtime content version:** `1.0.0`

**Rules version:** `digital-rules-specification-v0.1`

## Purpose

This package makes the canonical NoteQuest adventurer-creation definitions available to the M6
Palace vertical slice. It supersedes the proposed project-original replacement from draft PR #166.

The project owner states that Tiago Junges, creator and rights holder of NoteQuest, granted full
permission to use, adapt, and distribute NoteQuest content in this digital adaptation. The
public-safe project record is:

`https://github.com/labax/NoteQuest/issues/80#issuecomment-5121522446`

The public record is the project owner's attestation. Private correspondence is not published, and
the repository automation has not independently verified it.

## Package boundary

The package contains:

- all 11 canonical Race rows for 2d6 totals 2-12;
- all 11 canonical Class rows for 2d6 totals 2-12;
- all six canonical Basic Spell rows for 1d6 results 1-6;
- fixed Light and Fireball grants, separate from random Basic Spell draws;
- 17 versioned race, class, and spell effect definitions;
- nine distinct starting weapons with complete damage and hand requirements;
- the canonical two-arm, two-hand, 10-torch, zero-coin starting state; and
- a concise creator/permission attribution notice.

The package uses stable manifest IDs while retaining the canonical DRS identifiers in each
structured definition.

## Rights and content safety

Every definition records:

- Tiago Junges as author and rights holder;
- the project-owner permission attestation and controlled evidence ID;
- internal, closed-playtest, public-free-core, and future-commercial release modes;
- required attribution and notice locations;
- source and DRS locators;
- saved-history content-version pinning; and
- an RFC-8785 canonical JSON SHA-256 hash.

This package deliberately excludes source artwork, page layout, trade dress, backer/personal data,
and copied long-form rulebook prose. Player-facing explanations remain concise project-authored
copy even though the permission instruction is broad.

## Review boundary

The project-owner attestation supplies the rights instruction and content-selection decision. It
does not fabricate separate Rules/Product, Content/Licensing, QA/Test, Technical Lead, or Data
Modeller identities. The definitions and fixtures in this PR are the evidence those roles review
through the normal PR process.

Merging this prerequisite does not complete issue #80. PR #165 must still integrate the selected
package through the command/persistence boundary and satisfy its durability, reconciliation,
reload, browser, and exact-head review requirements.

## Compatibility

Saved state and history must pin content version `1.0.0` and rules version
`digital-rules-specification-v0.1`. Future content changes require a new semantic version and an
explicit compatibility or migration decision; existing saved results must not be silently
reinterpreted.
