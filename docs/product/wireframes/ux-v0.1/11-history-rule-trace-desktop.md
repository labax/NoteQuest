# History and Rule Trace — Desktop

Canonical source: [`11-history-rule-trace-desktop.wireloom`](11-history-rule-trace-desktop.wireloom)

```wireloom
window "History and Rule Trace":
  header:
    row:
      text "Mechanical history" bold size=large
      spacer
      status "Latest 200 shown" kind=info
  tabs:
    tab "Timeline" active
    tab "Completion summaries"
    tab "Graveyard"
    tab "Player notes"
  row:
    col 430:
      section "Palace — Active expedition" badge="Complete history":
        list:
          slot "18:42 — Attack resolved" active chevron id="history-entry":
            text "Goblin A defeated; 5 damage" muted
          slot "18:41 — Target selected" chevron:
            text "Goblin A" muted
          slot "18:40 — Entered Room 8" chevron:
            text "Encounter generated" muted
          slot "18:39 — Door opened" chevron:
            text "1 torch spent" muted
        button "Load earlier events"
    col fill:
      section "Selected mechanical event" id="rule-trace":
        text "Attack resolved" bold size=large
        kv "Event sequence" "846"
        kv "Actor" "Mira"
        kv "Target" "Goblin A"
        kv "Natural d6" "5"
        kv "Weapon modifier" "+0"
        kv "Final damage" "5"
        kv "Target HP" "5 → 0"
        kv "Random stream" "combat"
        kv "Rules version" "DRS 0.1"
        kv "Content version" "Core 0.1"
      section "Linked state changes":
        list:
          item "Monster marked defeated"
          item "Encounter living count changed 2 → 1"
          item "Cook reward not applicable"
          item "Autosave committed"
      row:
        button "Copy privacy-safe event ID"
        spacer
        button "Add player note"
    col 300:
      section "History policy":
        text "Active and incomplete dungeons retain complete mechanical history." muted
        text "Completed dungeons retain a completion summary and at least the final 500 mechanical entries." muted
      section "Notes":
        text "Player notes are editable and stored separately from immutable mechanics." muted
  footer:
    status "Mechanical event is immutable" kind=success

annotation "Timeline entries reveal concise outcomes before details." target="history-entry" position=left
annotation "Natural dice, modifiers, versions, and state changes remain inspectable." target="rule-trace" position=right
```
