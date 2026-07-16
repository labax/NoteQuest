| 3 | `spell.teleport` | Move to a discovered segment in the current dungeon that contains no living monsters; may escape non-boss combat. |
| 4 | `spell.cold_ray` | Deal 4 damage to one monster and prevent it from attacking on the next monster turn. |
| 5 | `spell.lightning` | Deal 6 damage to one monster. |
| 6 | `spell.fireball` | Deal 5 damage to every living monster in the current room. |

### 14.2 Requirements

| ID | Requirement | Priority | Acceptance signal |
|---|---|---:|---|
| DRS-SPELL-001 | Each generated spell shall create one charge and casting shall consume one matching charge. | Must | Duplicate charges decrement independently. |
| DRS-SPELL-002 | Resting in town shall restore every generated spell charge to its maximum count. | Must | Exhausted duplicates restore. |
| DRS-SPELL-003 | Casting in combat shall consume the player's action. | Must | Monster turn follows unless encounter ends. |
| DRS-SPELL-004 | Spell use outside combat shall be limited by the spell's timing and target rules. | Must | Attack spells require a living target. |
| DRS-SPELL-005 | Spells shall require zero hands unless a content definition explicitly states otherwise. | Must | Arm loss does not block Basic Spells. |
| DRS-SPELL-006 | Heal shall restore 5 HP, cap at maximum, and fail after death resolution; casting at maximum HP is allowed only after a no-benefit warning and consumes the charge. | Must | Damaged, full-HP, and death boundaries pass. |
| DRS-SPELL-007 | Light shall be cast only during entry preparation or an active expedition, consume one charge, add one virtual expedition light unit, and require no hand. | Must | The unit can pay entry/action cost or delay darkness and is cleared at expedition end. |
| DRS-SPELL-008 | Multiple Light charges and virtual units may exist; each cast consumes one charge and creates one separately countable unit. | Must | Charge and reserve counts remain explicit without town banking. |
| DRS-SPELL-009 | Teleport shall target only a discovered segment in the current dungeon with no living monsters. | Must | Undiscovered, occupied, and other-dungeon targets are rejected. |
| DRS-SPELL-010 | Teleport shall not generate content or bypass a final boss encounter. | Must | Boss escape and unexplored target are rejected. |
| DRS-SPELL-011 | Cold Ray shall apply 4 direct monster damage and a one-monster-turn attack-prevention state. | Must | Status duration passes. |
| DRS-SPELL-012 | Lightning shall apply 6 direct damage to one monster. | Must | Trait triggers are not evaluated. |
| DRS-SPELL-013 | Fireball shall apply 5 direct damage independently to every living monster in the room. | Must | Defeat and Undead checks resolve per target. |
| DRS-SPELL-014 | Fixed spell damage shall use normal monster defensive traits only where those traits inspect received damage rather than a natural weapon die. | Must | Stoneskin and Intangible apply; natural-1/6 triggers do not. |
| DRS-SPELL-015 | A spell secondary effect that does not state a damage prerequisite shall resolve even when a defensive trait prevents the spell's damage. | Must | Cold Ray prevents the next attack against an Intangible target even when its 4 damage is prevented. |

## 15. Town, Expeditions, Persistence, Death, and Recovery

### 15.1 Expedition lifecycle

An expedition begins when an adventurer enters a dungeon and the entry light cost is paid. It ends when the adventurer reaches town through a legal retreat or explicit exit effect, dies, or completes another approved exit action. Boss defeat completes the dungeon but does not itself require deletion of the expedition state.

At the start of a later expedition into an existing dungeon:

- restore every surviving monster instance to maximum HP;
- reset each ordinary room's per-expedition repopulation-check marker;
- retain topology, doors, traps already resolved, search state, drops, recoverable containers, boss state, and completion state.

On first entry into a previously generated ordinary room with no living monsters during that later expedition, roll the dungeon Monster table once. Corridors, staircases, and the final room do not repopulate. A result producing no monsters still consumes that room's repopulation check for the expedition.

### 15.2 Retreat and town

Normal retreat requires a continuous discovered route from the current segment to the entrance containing no living unbypassed monsters. Monsters passed through by stealth still make the route unsafe. A valid retreat moves the adventurer to town and ends the expedition.

Town actions:

- Rest: spend 1 coin; restore current HP to maximum and all spell charges.
- Repair Armour: spend 1 coin; fully restore one damaged, non-destroyed piece.
- Buy Torch: spend 1 coin; add one physical torch up to 10.
- Sell Item: apply ordinary or magic sale rules and remove the sold item.
- Start or resume a dungeon expedition.

### 15.3 Death and recovery

Normal death creates a corpse/recoverable container in the death segment containing equipped items, backpack items, unused consumables, keys, and coins, except destroyed or consumed items. Darkness death creates belongings without a corpse. Each death immediately creates a Graveyard record.

Multiple death containers may coexist. Recovery applies normal capacity and equipment rules; excess belongings remain in the room. Containers persist for the lifetime of the save unless fully recovered, explicitly destroyed, or removed by a confirmed cleanup action.

### 15.4 Requirements

| ID | Requirement | Priority | Acceptance signal |
|---|---|---:|---|
| DRS-PER-001 | An expedition shall have explicit start and end events and a stable ID. | Must | History groups all actions correctly. |
| DRS-PER-002 | Entry shall cost one physical or virtual light unit before the expedition's first action; a Light charge may be cast during entry preparation to create the unit. | Must | Insufficient-light entry is blocked unless an exception applies. |
| DRS-PER-003 | Later expeditions shall restore surviving monsters to maximum HP. | Must | Healing occurs once at start. |
| DRS-PER-004 | Eligible empty ordinary rooms shall repopulate at most once on first entry per later expedition. | Must | Repeated movement does not reroll. |
| DRS-PER-005 | Rooms with corpses or drops shall remain eligible for repopulation. | Must | Coexistence fixture passes. |
| DRS-PER-006 | Corridors, staircases, and the final room shall not repopulate. | Must | No repopulation event is offered. |
| DRS-PER-007 | A no-monster repopulation result shall mark the room checked for that expedition. | Must | Re-entry does not reroll. |
| DRS-PER-008 | Normal retreat shall require a discovered safe route to the entrance. | Must | Occupied route is rejected. |
| DRS-PER-009 | Stealth-bypassed monsters shall keep a route unsafe. | Must | Retreat remains disabled. |
| DRS-PER-010 | The Miner emergency exit shall bypass route safety only at zero remaining light. | Must | Other classes die or require an alternative source. |
| DRS-PER-011 | Rest shall cost one coin and restore HP and all spell charges. | Must | Insufficient coin prevents action. |
| DRS-PER-012 | Buying a physical torch shall cost one coin and respect capacity 10. | Must | No over-cap purchase. |
| DRS-PER-013 | Town actions shall be unavailable while the adventurer is inside a dungeon unless an explicit exit has completed. | Must | State guard passes. |
| DRS-PER-014 | Normal death shall leave a corpse and recoverable belongings. | Must | Container inventory matches pre-death state. |
| DRS-PER-015 | Darkness death shall leave recoverable belongings without a corpse. | Must | Map marker and record distinguish it. |
| DRS-PER-016 | Destroyed, sold, spent, and consumed objects shall not appear in death recovery. | Must | Ownership ledger matches. |
| DRS-PER-017 | Graveyard record creation shall be atomic with death resolution. | Must | No death exists without a record. |
| DRS-PER-018 | Graveyard records shall include adventurer ID/name, dungeon, floor, segment, cause, timestamp, and recovery status/reference. | Must | Required fields validate. |
| DRS-PER-019 | Multiple deaths in one segment shall produce distinct records and containers. | Must | Recovery identifies each container. |
| DRS-PER-020 | Recovery shall enforce normal capacity; uncollected items remain. | Must | Partial recovery persists. |
| DRS-PER-021 | Completed dungeons shall preserve topology, drops, corpses, and completion state. | Must | Revisit is stable. |
| DRS-PER-022 | Bosses and one-time boss rewards shall not regenerate. | Must | Re-entry produces none. |
| DRS-PER-023 | The player may safely abandon one unfinished dungeon for another after returning to town. | Must | Both dungeons remain persistent. |
| DRS-PER-024 | Every meaningful transition shall autosave atomically and retain a last-known-valid recovery state. | Must | Fault matrix shows no silent corruption. |
| DRS-PER-025 | Existing runtime instances shall retain their rules and content versions across migration. | Must | Reload does not reinterpret historical effects. |

## 16. Calculation Reference

### 16.1 Formula catalogue

| ID | Calculation | Formula / order |
|---|---|---|
| CALC-001 | Maximum adventurer HP | `race.base_hp + class.hp_modifier` |
| CALC-002 | Weapon damage | `max(0, natural_d6 + weapon_modifier + ability_modifiers + item_modifiers + temporary_modifiers)` |
| CALC-003 | Weakness damage | `weapon_damage * 2`, before Stoneskin or Intangible prevention |
| CALC-004 | Normal monster-turn damage | Sum fixed damage and armed bonuses of active non-Poison monsters |
| CALC-005 | Poison monster-turn damage | Sum fixed damage and armed bonuses of active Poison monsters; apply directly to HP |
| CALC-006 | Armour spillover | `max(0, incoming_normal_damage - selected_piece.current_durability)` |
