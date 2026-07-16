| DRS-DICE-004 | Random table definitions shall use stable table and row IDs and must contain no gaps or overlaps in their supported ranges. | Must | Schema validation rejects invalid ranges. |
| DRS-DICE-005 | The canonical mode shall generate race and class by 2d6 without free rerolls. | Must | Creation cannot reroll without leaving canonical mode. |
| DRS-DICE-006 | The engine shall use separate deterministic streams for dungeon generation, combat, rewards, and expedition repopulation. | Must | Unrelated actions do not alter another stream's sequence. |
| DRS-DICE-007 | The state or committed result of a random action shall be persisted before its result is presented as final. | Must | Reload reproduces the committed result. |
| DRS-DICE-008 | A random action shall consume values only from its assigned stream. | Must | Stream audit matches the module mapping. |
| DRS-DICE-009 | Manual physical-dice entry may be supported only as an explicit mode and shall be recorded as manual input. | Should | History distinguishes generated and manual results. |
| DRS-DICE-010 | A rejected, cancelled-before-commit action shall not mutate game state; whether it consumes a random value is an implementation detail only when no player-visible result has been committed. | Must | Cancellation tests preserve gameplay state. |
| DRS-DICE-011 | Imported saves shall retain committed outcomes and stream state. | Must | Import does not reroll or reseed existing state. |
| DRS-DICE-012 | Rules and content versions shall be recorded with each mechanically significant random result. | Must | Historical outcomes remain interpretable after updates. |

### 7.2 Stream allocation

| Stream | Uses |
|---|---|
| `dungeon` | Dungeon name, type, segment, door, trap, secret passage, room content, initial monsters, boss, and fixed dungeon rewards |
| `combat` | Weapon damage, trait rolls, Undead revival, spawned-effect rolls, and combat-only random effects |
| `reward` | Chests, loot traits, treasure, wonders, magic items, generated base weapon/armour, item values, and sale rolls |
| `repopulation` | Later-expedition room repopulation and its monster-table results |

## 8. Adventurer Creation and State

### 8.1 Creation sequence

1. Start a new adventurer record with a stable ID.
2. Roll 2d6 on the authorised Race table.
3. Roll 2d6 on the authorised Class table.
4. Set maximum HP to racial HP plus the class HP modifier.
5. Set current HP equal to maximum HP.
6. Add the class starting weapon as an equipped item instance when legal.
7. Apply race and class starting effects in source order: race, then class.
8. Resolve each granted random Basic Spell as a separate 1d6 roll and create one charge for each result.
9. Set physical torches to 10 and coins to 0.
10. Set usable arms and usable hands to 2.
11. Validate all derived state, persist it, and then present the completed adventurer.

### 8.2 Canonical race definitions

| 2d6 | Race ID | Base HP | Mechanical effect |
|---:|---|---:|---|
| 2 | `race.slimemen` | 10 | Optional post-defeat engulf effect restores current HP to maximum when an eligible defeated enemy body is consumed. |
| 3 | `race.lightbugster` | 16 | Start with three Light spell charges. |
| 4 | `race.pixie` | 8 | Generate five Basic Spell charges. |
| 5 | `race.gnome` | 14 | Generate three Basic Spell charges. |
| 6 | `race.elf` | 16 | Generate one Basic Spell charge. |
| 7 | `race.human` | 20 | No mechanical effect. |
| 8 | `race.dwarf` | 18 | For each secret-passage result, roll two d6 and use the higher result. |
| 9 | `race.halfling` | 14 | For each monster checked during Move Silently, roll two d6 and use the higher result; unavailable in boss rooms. |
| 10 | `race.cat_person` | 19 | Multiply the final town sale value of equipment by two. |
| 11 | `race.rinoceroid` | 24 | May attack with a 1d6 natural horn weapon that occupies no hand. |
| 12 | `race.dragonkin` | 30 | Start with three Fireball spell charges. |

### 8.3 Canonical class definitions

| 2d6 | Class ID | HP modifier | Starting weapon | Mechanical effect |
|---:|---|---:|---|---|
| 2 | `class.hobo` | +4 | Wood Stick, 1d6-2 | None. |
| 3 | `class.grave_digger` | +2 | Shovel, 1d6-1 | Add +2 final weapon damage against monsters with Undead. |
| 4 | `class.noble` | +0 | Rapier, 1d6+1 | Generate one Basic Spell charge. |
| 5 | `class.schoolar` | +0 | Dagger, 1d6-1 | Generate three Basic Spell charges. |
| 6 | `class.blacksmith` | +4 | Hammer, 1d6 | Outside combat, spend one light unit to fully restore one damaged, non-destroyed armour piece. |
| 7 | `class.guard` | +4 | Short Sword, 1d6 | None. |
| 8 | `class.cook` | +2 | Cleaver, 1d6 | Gain one coin for each non-Undead monster whose defeat is credited to the adventurer. |
| 9 | `class.locksmith` | +2 | Dagger, 1d6-1 | Open a locked door without spending a torch; traps resolve normally. |
| 10 | `class.lumberjack` | +4 | Lumberjack Axe, 1d6 | After breaking a door, roll 1d6; on 6 gain one physical torch up to capacity. |
| 11 | `class.miner` | +4 | Pickaxe, 1d6-1 | When no light unit remains, may immediately end the expedition in town before darkness death. |
| 12 | `class.gladiator` | +6 | Short Sword, 1d6 | None. |

### 8.4 Adventurer requirements

| ID | Requirement | Priority | Acceptance signal |
|---|---|---:|---|
| DRS-ADV-001 | Race and class shall use the authorised weighted 2d6 rows. | Must | All 11 totals map correctly. |
| DRS-ADV-002 | Maximum HP shall equal race HP plus class modifier. | Must | Deterministic fixtures match. |
| DRS-ADV-003 | Current HP shall start at maximum HP and remain between zero and maximum unless a rule explicitly changes maximum HP. | Must | Boundary validation passes. |
| DRS-ADV-004 | Starting weapon, abilities, spells, 10 torches, and 0 coins shall be applied before play. | Must | New state is complete. |
| DRS-ADV-005 | Each generated spell result shall create one independent charge, including duplicates. | Must | Duplicate spell fixtures retain separate uses. |
| DRS-ADV-006 | Race and class abilities shall be represented as effect definitions with triggers, guards, targets, and outcomes. | Must | Effects are testable without class-name branching in UI code. |
| DRS-ADV-007 | Canonical generation shall not rebalance weak combinations. | Must | Source probabilities and values remain unchanged. |
| DRS-ADV-008 | The engine shall track current and maximum HP, arms, hands, spells and charges, equipment, armour durability, torches, coins, inventory, location, status, and death data. | Must | Save/reload preserves every field. |
| DRS-ADV-009 | Adventurer naming shall not alter mechanical generation. | Must | Same seed produces same mechanics across names. |
| DRS-ADV-010 | Current HP reaching zero or below shall trigger death after the current effect chain completes. | Must | Death timing fixtures pass. |
| DRS-ADV-011 | Healing shall not exceed maximum HP and cannot revive a resolved death. | Must | Heal boundaries pass. |
| DRS-ADV-012 | Losing an arm shall reduce usable arms and hands by one and immediately invalidate illegal held equipment. | Must | Equipment is unequipped and choice is requested. |
| DRS-ADV-013 | A zero-hand adventurer may use only effects and equipment requiring zero hands. | Must | Illegal actions are unavailable. |
| DRS-ADV-014 | The Rinoceroid horn shall remain available without an item instance and require zero hands. | Must | Horn remains legal after arm loss. |
| DRS-ADV-015 | Starting and permanent effects shall be idempotent and shall not reapply on reload. | Must | Reload does not duplicate spells or resources. |
| DRS-ADV-016 | Ability-triggered resource gains shall respect capacity and minimum rules. | Must | No resource exceeds its cap. |
| DRS-ADV-017 | The Miner emergency exit shall occur after the final action resolves but before darkness death. | Must | Zero-light Miner reaches town alive. |
| DRS-ADV-018 | A manual race or class selection, when supported, shall mark the adventurer as non-canonical or manually generated. | Should | History and save metadata record mode. |
| DRS-ADV-019 | Defeated-monster credit shall be assigned once for class and reward triggers. | Must | Cook and similar effects do not double-trigger. |
| DRS-ADV-020 | Generated content IDs and effect versions shall be persisted with the adventurer. | Must | Later content updates do not reinterpret existing state silently. |

## 9. Dungeon Creation, Topology, and Termination

### 9.1 Dungeon name and type

A new dungeon uses three independent d6 rolls: the first selects one of the six core dungeon types and the first name part; the second and third select the remaining authorised name parts. The six core types are Palace, Crypt, Tomb, Sanctuary, Temple, and Prison.

The dungeon type selects one versioned content set containing:

- entrance template;
- segment table with staircase-origin, corridor-origin, and room-origin columns;
- trap table;
- secret-passage table;
- room-content table;
- monster table;
- reward table with Treasure, Wonders, and Magic Item columns;
- boss table;
- weapon and armour tables.

### 9.2 Topology model

A dungeon is a persistent graph. Nodes are entrance, corridor, room, staircase, and final-room segments. Edges are normal doors or secret passages. Visual coordinates are presentation data and have no mechanical effect.

Each segment has a stable ID, floor number, type, resolved content, encounter references, search state, drops, recoverable containers, and completion markers. Each connection has a stable ID, source, destination, direction label, door state where applicable, and alert propagation state.

### 9.3 Generation algorithm

1. A dungeon begins with its authorised entrance template on floor 1.
2. An unexplored connection has no destination content until successfully opened or otherwise resolved.
3. After a connection opens, determine the origin segment category and select the corresponding segment-table column.
