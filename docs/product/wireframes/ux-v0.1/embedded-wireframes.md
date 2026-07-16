# NoteQuest UX v0.1 Embedded Wireframes

This gallery embeds the canonical Wireloom sources directly in Markdown. Each block mirrors the linked `.wireloom` file; the standalone file remains authoritative for reuse, parsing, rendering, and diffs.

See the individual `.wireloom` sources in this directory. Each source can be embedded in any Wireloom-aware Markdown renderer using a fenced block such as:

```markdown
```wireloom
window "Example":
  text "Wireloom renders this block"
```
```

The complete embedded gallery is generated from the canonical sources by the accompanying renderer workflow.