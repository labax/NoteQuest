# NoteQuest UX v0.1 Embedded Wireframes

Wireloom can be embedded directly in Markdown by using a fenced `wireloom` block. The standalone `.wireloom` files remain the canonical reusable sources; the matching `.md` files mirror them for inline rendering in a Wireloom-aware Markdown pipeline.

~~~markdown
```wireloom
window "Example":
  text "Wireloom renders this block"
```
~~~

## Embedded previews

| Screen | Embedded Markdown | Canonical source |
|---|---|---|
| First launch / save slots | [`01-first-launch-desktop.md`](01-first-launch-desktop.md) | [`01-first-launch-desktop.wireloom`](01-first-launch-desktop.wireloom) |
| Adventurer creation | [`02-adventurer-creation-desktop.md`](02-adventurer-creation-desktop.md) | [`02-adventurer-creation-desktop.wireloom`](02-adventurer-creation-desktop.wireloom) |
| Expedition — desktop | [`03-expedition-desktop.md`](03-expedition-desktop.md) | [`03-expedition-desktop.wireloom`](03-expedition-desktop.wireloom) |
| Expedition — mobile | [`04-expedition-mobile.md`](04-expedition-mobile.md) | [`04-expedition-mobile.wireloom`](04-expedition-mobile.wireloom) |
| Combat — desktop | [`05-combat-desktop.md`](05-combat-desktop.md) | [`05-combat-desktop.wireloom`](05-combat-desktop.wireloom) |
| Inventory overflow — mobile | [`06-inventory-overflow-mobile.md`](06-inventory-overflow-mobile.md) | [`06-inventory-overflow-mobile.wireloom`](06-inventory-overflow-mobile.wireloom) |
| Town — desktop | [`07-town-desktop.md`](07-town-desktop.md) | [`07-town-desktop.wireloom`](07-town-desktop.wireloom) |
| Death and recovery — desktop | [`08-death-recovery-desktop.md`](08-death-recovery-desktop.md) | [`08-death-recovery-desktop.wireloom`](08-death-recovery-desktop.wireloom) |
| Save/import/recovery — desktop | [`09-save-import-recovery-desktop.md`](09-save-import-recovery-desktop.md) | [`09-save-import-recovery-desktop.wireloom`](09-save-import-recovery-desktop.wireloom) |
| Textual map — mobile | [`10-textual-map-mobile.md`](10-textual-map-mobile.md) | [`10-textual-map-mobile.wireloom`](10-textual-map-mobile.wireloom) |
| History and rule trace — desktop | [`11-history-rule-trace-desktop.md`](11-history-rule-trace-desktop.md) | [`11-history-rule-trace-desktop.wireloom`](11-history-rule-trace-desktop.wireloom) |

A renderer must register `wireloom` as a Markdown fence language and pass the block contents to `wireloom.render`. Markdown hosts without that extension will display the source as a code block rather than an SVG.
