# Adventurer Creation — Desktop

Canonical source: [`02-adventurer-creation-desktop.wireloom`](02-adventurer-creation-desktop.wireloom)

```wireloom
window "Create Adventurer":
  header:
    row:
      backbutton "Save slots"
      spacer
      status "Canonical mode" kind=info
  row:
    col 290:
      section "Identity":
        input placeholder="Adventurer name" id="adventurer-name"
        text "Name is stored only in this save slot." muted size=small
      section "Creation steps":
        slot "1. Race roll" state=maxed accent=success:
          kv "Natural dice" "4 + 3"
          kv "Total" "7"
          kv "Result" "Human"
        slot "2. Class roll" state=maxed accent=success:
          kv "Natural dice" "5 + 2"
          kv "Total" "7"
          kv "Result" "Guard"
        slot "3. Starting state" active:
          text "Review before creating" muted
    col fill:
      section "Generated adventurer" id="generated-adventurer":
        row:
          col:
            image label="Portrait placeholder" width=150 height=170
          col fill:
            text "Mira" bold size=large
            stats:
              stat "MAX HP" "24" bold
              stat "CURRENT HP" "24"
              stat "ARMS" "2"
              stat "HANDS" "2"
            divider
            kv "Race" "Human"
            kv "Class" "Guard"
            kv "Weapon" "Short Sword"
            kv "Torches" "10"
            kv "Coins" "0"
      section "Creation evidence":
        text "The natural dice, table rows, derived HP, and starting effects will be recorded with their rules and content versions." muted
        row:
          button "View calculation details"
          spacer
          button "Create adventurer" primary id="create-adventurer"
  footer:
    status "Not saved until creation is committed" kind=info

annotation "Generated results cannot be freely rerolled in canonical mode." target="generated-adventurer" position=right
annotation "Creation commits the complete adventurer and history atomically." target="create-adventurer" position=bottom
```
