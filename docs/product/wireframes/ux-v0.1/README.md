# NoteQuest UX v0.1 Wireloom Wireframes

This directory contains the low-fidelity wireframes referenced by `docs/product/ux-flow-wireframe-requirements-v0.1.md`.

## Format and version

- Source format: Wireloom `.wireloom`
- Renderer: `wireloom` npm package
- Pinned version: `0.7.0`
- Theme: `default`
- Generated output: self-contained SVG

The `.wireloom` source is authoritative for layout review and version control. SVG files may be regenerated from the same-basename sources for rendered review.

## Artifact index

| Basename | Screen |
|---|---|
| `01-first-launch-desktop` | First launch and three local save slots |
| `02-adventurer-creation-desktop` | Canonical adventurer creation |
| `03-expedition-desktop` | Wide desktop expedition workspace |
| `04-expedition-mobile` | Phone expedition workspace |
| `05-combat-desktop` | Combat and rule-result workspace |
| `06-inventory-overflow-mobile` | Blocking full-capacity item decision |
| `07-town-desktop` | Town actions and dungeon selection |
| `08-death-recovery-desktop` | Graveyard and belongings recovery |
| `09-save-import-recovery-desktop` | Save management, import preview, and recovery |
| `10-textual-map-mobile` | Equivalent mobile textual map |
| `11-history-rule-trace-desktop` | Mechanical timeline and rule trace |

## Regeneration

```bash
cd docs/product/wireframes/ux-v0.1
npm install --package-lock=false
npm run render
```

The helper parses and serializes every source as a validity check, then renders default-theme SVG files. Wireloom is an MIT-licensed documentation dependency from `StardockCorp/Wireloom`; it is not an application runtime dependency.

Do not silently regenerate with another Wireloom version. Update `package.json`, this README, and review all layout differences when changing the pinned version.

## Review boundary

These wireframes specify information hierarchy, task flow, responsive composition, and state/action placement. They are not final visual design, production artwork, or a copy of the NoteQuest rulebook layout or trade dress.
