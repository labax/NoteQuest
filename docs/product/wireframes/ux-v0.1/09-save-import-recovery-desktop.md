# Save, Import, and Recovery — Desktop

Canonical source: [`09-save-import-recovery-desktop.wireloom`](09-save-import-recovery-desktop.wireloom)

```wireloom
window "Save, Import, and Recovery":
  header:
    row:
      text "Manage local data" bold size=large
      spacer
      status "Offline ready" kind=success
  tabs:
    tab "Save slots" active
    tab "Export"
    tab "Import"
    tab "Recovery"
  row:
    col 360:
      section "Save slots":
        slot "Slot 1 — Empty"
        slot "Slot 2 — Palace expedition" active id="target-slot":
          kv "Schema" "1"
          kv "Last valid" "Available"
          kv "Last saved" "18:42"
        slot "Slot 3 — Core run":
          kv "Schema" "1"
          kv "Last valid" "Available"
          kv "Last saved" "Yesterday"
      button "Export selected slot"
    col fill:
      section "Import preview" id="import-preview":
        status "Package valid" kind=success
        kv "Package schema" "1"
        kv "Target" "Slot 2"
        kv "Adventurers" "3"
        kv "Dungeons" "2"
        kv "Events" "846"
        kv "Private data" "Names, notes, history, Graveyard"
        kv "Content references" "Approved package v0.1"
        text "The current slot is unchanged until validation, preview, and confirmation all succeed." muted
      section "Warnings":
        list:
          item "Slot 2 will be replaced"
          item "A pre-import recovery snapshot will be created"
          item "No data will be uploaded"
      row:
        button "Cancel import"
        spacer
        button "Continue to confirmation" primary id="continue-import"
    col 300:
      section "Recovery":
        status "Last-known-valid available" kind=info
        kv "Snapshot time" "18:40"
        kv "Reason" "Write interrupted"
        button "Review recovery differences"
        button "Restore last valid" accent=warning
      section "Destructive actions":
        button "Reset selected slot" accent=danger
        text "Reset names the exact slot and requires stronger confirmation." muted
  footer:
    status "No mutation during preview" kind=info

annotation "Target scope is explicit; other slots remain untouched." target="target-slot" position=left
annotation "Validation and privacy scope are shown before replacement." target="import-preview" position=top
annotation "The next step opens a deliberate replacement confirmation." target="continue-import" position=bottom
```
