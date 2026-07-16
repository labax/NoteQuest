# Expedition — Desktop

Canonical source: [`03-expedition-desktop.wireloom`](03-expedition-desktop.wireloom)

```wireloom
window "Palace Expedition — Desktop":
  header:
    row:
      text "Palace — Floor 1" bold size=large
      spacer
      status "Saved" kind=success id="save-status"
  resourcebar:
    resource name="HP" value="18 / 24" icon="approval"
    resource name="ARMOUR" value="4 / 6" icon="military"
    resource name="TORCHES" value="7" icon="faith"
    resource name="COINS" value="3" icon="credits"
    resource name="HANDS" value="2 / 2" icon="leader"
  row:
    col 260:
      section "Adventurer":
        text "Mira — Human Guard" bold
        progress value=18 max=24 label="Health"
        kv "Weapon" "Short Sword"
        kv "Armour" "Leather 4/6"
        kv "Spell charges" "0"
      section "Equipment":
        slot "Main hand" active:
          text "Short Sword"
        slot "Armour" active:
          text "Leather Armour"
        button "Open inventory"
      section "Journey":
        kv "Expedition" "#2"
        kv "Current segment" "Room 7"
        kv "Route to entrance" "Safe"
        button "Retreat to town"
    col fill:
      tabs:
        tab "Visual map" active
        tab "Textual map"
      panel id="visual-map":
        grid cols=5 rows=5:
          cell "Entrance" row=3 col=1 state=maxed
          cell "Hall" row=3 col=2 state=maxed
          cell "Room 3" row=2 col=2 state=maxed
          cell "Room 4" row=2 col=3 state=maxed
          cell "Room 5" row=3 col=3 state=maxed
          cell "Room 6" row=4 col=3 state=maxed
          cell "Room 7" row=4 col=4 state=active accent=approval id="current-cell"
          cell "Unknown" row=4 col=5 state=locked
        text "Current position: Room 7. One discovered exit leads east to an unresolved door." muted
      row:
        status "Current segment announced" kind=info
        spacer
        button "Centre current segment"
    col 330:
      section "Current segment" badge="Room 7":
        text "Quiet ordinary room" bold
        status "No living monsters" kind=success
        kv "Searched" "No"
        kv "Repopulation checked" "This expedition"
      section "Available actions" id="action-panel":
        button "Open east door" primary
        button "Search for secret passage"
        button "Inspect dropped items" disabled
        button "View route details"
      section "Latest result":
        kv "Action" "Entered Room 7"
        kv "Table" "Palace room content"
        kv "Natural result" "4"
        kv "Outcome" "Empty room"
        button "View full rule trace"
  footer:
    text "All actions are keyboard accessible; visual and textual maps expose the same legal actions." muted

annotation "Visual position never hides the equivalent textual route." target="visual-map" position=top
annotation "Current position uses shape, text, and focus—not colour alone." target="current-cell" position=bottom
annotation "Only legal actions are enabled." target="action-panel" position=right
annotation "Save state reflects the actual committed state." target="save-status" position=top
```
