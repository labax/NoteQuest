# Inventory Capacity Decision — Mobile

Canonical source: [`06-inventory-overflow-mobile.wireloom`](06-inventory-overflow-mobile.wireloom)

```wireloom
window "Inventory Capacity Decision":
  navbar:
    leading:
      backbutton "Room 9"
    center:
      text "Inventory" bold
    trailing:
      status "10 / 10" kind=warning
  section "Equipped":
    slot "Main hand — Short Sword" active
    slot "Armour — Leather Armour" active
  section "Backpack" badge="Full":
    list:
      slot "Healing Potion" chevron
      slot "Normal Key — Palace" chevron
      slot "Magic Ring" chevron
      slot "Rope" chevron
      slot "Six more items" chevron
  tabbar:
    tabitem "Explore" icon="planet"
    tabitem "Adventurer" icon="leader"
    tabitem "Inventory" icon="ship" selected badge="10/10"
    tabitem "History" icon="policy"
  sheet position=bottom title="Backpack full" id="capacity-sheet":
    text "Choose what happens to the newly found item before continuing." bold
    slot "New item — Magic Shield" active accent=wealth:
      text "Requires one backpack slot" muted
    section "Options":
      radio "Leave the new item in Room 9" group="capacity" selected label-right
      radio "Drop an existing backpack item" group="capacity" label-right
      radio "Equip the new item and resolve hand limits" group="capacity" label-right
    row:
      button "Cancel"
      spacer
      button "Confirm choice" primary id="confirm-capacity"

annotation "The game cannot continue while capacity is unresolved." target="capacity-sheet" position=top
annotation "Confirmation commits the transfer once and preserves item identity." target="confirm-capacity" position=bottom
```
