| DRT-009 | Locked door + normal key from other dungeon | Action rejected with no mutation. | DRS-DOOR-007 |
| DRT-010 | Locked door broken | Door Broken, no torch spent, destination monsters alerted. | DRS-DOOR-010, 011 |
| DRT-011 | Chest dice 6 and 2 | 6 coins and 2 Treasure resolutions. | DRS-DOOR-018 |
| DRT-012 | Chest dice 1 and 1 | Zero rewards and one trap. | DRS-DOOR-019 |
| DRT-013 | Floor non-stair count 5 | No additional stair-pressure roll. | DRS-DUN-008 |
| DRT-014 | Counts 6/7/8/9 with pressure die at threshold | Stair generated at 1/2/3/4 respectively. | DRS-DUN-008 |
| DRT-015 | Count 10 | Next valid connection forced to stairs. | DRS-DUN-008 |
| DRT-016 | Floor-2 downward stair | Destination is final room with boss only. | DRS-DUN-009 to 011 |
| DRT-017 | Final physical torch spent opening lock; no alternate light | Door and destination persist, then darkness death. | DRS-EXP-013 to 020 |
| DRT-018 | Same as DRT-017 with lamp | Adventurer survives; lamp does not pay lock cost. | DRS-EXP-015, 018 |
| DRT-019 | Same as DRT-017 with Miner | Expedition ends in town before death. | DRS-ADV-017, DRS-EXP-019 |
| DRT-020 | Two-handed weapon + physical torch + two arms | Attack unavailable. | DRS-EXP-018 |
| DRT-021 | Two-handed weapon + lamp + two arms | Attack available. | DRS-EXP-018 |
| DRT-022 | Weapon natural 1 against Explosive monster at 7 HP | Monster defeated; normal attack cancelled; adventurer receives 7 normal damage. | DRS-CMB-009, 010 |
| DRT-023 | Weapon natural 6, base final damage 3, target Weakness + Stoneskin | Damage doubles to 6, Stoneskin does not prevent, 6 applied. | DRS-CMB-008, 012 |
| DRT-024 | Final calculated weapon damage 4 against Intangible | Prevented because final value is even. | DRS-CMB-011 |
| DRT-025 | Undead reaches 0 HP, revival die 1 | Monster returns at 1 HP; no reward or Cook coin. | DRS-CMB-014, 030 |
| DRT-026 | Mixed normal damage 7 and Poison damage 3 | 3 applies to HP; player allocates 7 to HP or one armour piece. | DRS-CMB-017 to 019 |
| DRT-027 | Armour durability 4 receives 7 | Armour destroyed; 3 spills to HP. | DRS-CMB-020, 021 |
| DRT-028 | Cold Ray target | 4 damage; target excluded from next monster turn only. | DRS-SPELL-011 |
| DRT-029 | Fireball versus three monsters including Undead | Each receives 5; Undead revival checks resolve individually; no natural traits. | DRS-SPELL-013, 014 |
| DRT-030 | Magic item sale natural die 1 by Cat-Person | Base 0, doubled final remains 0. | DRS-ITEM-019, 020 |
| DRT-031 | Full backpack receives two items | Resolution pauses until capacity is legal; no silent loss. | DRS-ITEM-007 |
| DRT-032 | Later expedition enters empty room twice | Repopulation rolls on first entry only. | DRS-PER-004, 007 |
| DRT-033 | Retreat path includes stealth-bypassed monster | Retreat rejected. | DRS-PER-008, 009 |
| DRT-034 | Normal death with equipment, key, coins, consumed potion | Corpse contains all except consumed potion; Graveyard created. | DRS-PER-014 to 018 |
| DRT-035 | Darkness death in same state | Belongings remain without corpse; Graveyard created. | DRS-PER-015, 018 |
| DRT-036 | Reload after committed combat roll | Same dice, target, effects, and turn state; no duplicate event. | DRS-DICE-007, DRS-HIST-006 |
| DRT-037 | Import newer unsupported schema | Reject without modifying current slots. | DRS-VAL-006 |
| DRT-038 | 100,000 seeds per dungeon type | Zero non-termination and zero unreachable bosses. | DRS-DUN-020 |
| DRT-039 | Valuable jewel creation dice 4 and 5 | Persisted ordinary sale value 90 coins. | DRS-ITEM-028 |
| DRT-040 | Magic Scroll creation spell 4, later cast | Cold Ray stored; valid cast consumes scroll; town rest does not recreate it. | DRS-ITEM-029 |
| DRT-041 | Sapphire roll 2 | Adds one permanent restorable Light charge. | DRS-ITEM-031 |
| DRT-042 | Helping Hand at one arm, then at two | First restores to two; second warns, consumes the item, and leaves arms at two. | DRS-ITEM-032 |
| DRT-043 | Potion of Luck and Cultist armour both available | Player chooses one cancellation source; only chosen source is consumed/discarded. | DRS-ITEM-034 |
| DRT-044 | Protector Candle, chest dice 6 and 2 | Candle consumed; 12 coins and 4 Treasures. | DRS-ITEM-038 |
| DRT-045 | Protector Candle, chest dice 1 and 1 | Candle consumed; zero rewards; trap resolves. | DRS-ITEM-038 |
| DRT-046 | Vampiric weapon attack prevented by Stoneskin | Adventurer heals 1 after completed attack. | DRS-ITEM-045 |
| DRT-047 | Vorpal natural 6 against Undead, revival die 1 | Target reaches zero then revives at 1 HP. | DRS-ITEM-046 |
| DRT-048 | Goblin Whistle in Goblin + Orc encounter | Goblin flees without rewards; Orc remains. | DRS-ITEM-047 |
| DRT-049 | Boatman's Oar final even damage against Intangible + Stoneskin | Intangible ignored; Stoneskin still prevents if final damage <=3. | DRS-ITEM-048 |
| DRT-050 | Cosmic weapon natural 1 in Core profile | Portal marker persists; no travel action appears. | DRS-ITEM-049 |
| DRT-051 | Equip plain Ring with 0 durability | Ring leaves backpack, remains equipped, cannot absorb damage, and is not destroyed. | DRS-ITEM-051, DRS-ITEM-052 |
| DRT-052 | Cold Ray against Intangible target | 4 damage is prevented; target still skips the next monster turn. | DRS-SPELL-015 |

## 21. Traceability

| Rules area | Primary decision sources | BRD / MVP sources | Downstream targets |
|---|---|---|---|
| Character generation | CHAR-001 to CHAR-008 | BR-001 to BR-005; MVP-001 | Functional Requirements, Data Model, tests |
| Dungeon topology and termination | DUN-001 to DUN-014; RD-RULE-001 to 003 | BR-006, BR-012, BR-022; MVP-002 | Architecture, Data Model, simulation plan |
| Doors, traps, stealth, light | DOOR-001 to 012; LIGHT-001 to 010; STEALTH-001 to 007 | BR-005 to BR-007; MVP-003 | Functional Requirements, UX flows, tests |
| Combat and traits | COMBAT-001 to 018 | BR-002, BR-005, BR-013; MVP-004 | Combat service, event model, deterministic tests |
| Inventory, spells, town | ITEM-001 to 014; SPELL-001 to 010; TOWN-001 to 008 | BR-001, BR-007, BR-010; MVP-005/006 | Data Model, UX, tests |
| Persistence and death | PERSIST-001 to 014; ARCH-006 to 014; RD-TECH-005 to 008 | BR-010, BR-011, BR-013, BR-019; MVP-007/008/009 | Persistence design, migration plan, fault tests |
| Event history | ARCH-011; RD-DATA-001 to 003 | BR-005, BR-019; MVP-009 | Event schema, privacy/NFR, UX |
| Canonical content | LIC-003/004/012; RD-CONT-001 to 004 | BR-003, BR-015; MVP-011 | Content and Licensing Requirements, content manifest |

Every downstream requirement should cite one or more `DRS-*` IDs. Content rows should cite their table/row IDs and effect-definition IDs.

## 22. Acceptance Criteria

The Digital Rules Specification may be approved when:

- [ ] Every Must rule is deterministic and testable without UI dependencies.
- [ ] All authorised 1d6 and 2d6 tables have stable IDs, complete ranges, and verified source provenance.
- [ ] Character generation and all race/class starting effects have deterministic fixtures.
- [ ] The six/ten staircase algorithm and floor-3 final-room rule pass boundary tests.
- [ ] At least 100,000 seeds per dungeon type produce zero non-terminating or unreachable-boss dungeons.
- [ ] Door, trap, secret passage, chest, stealth, light, and hand timing is explicit.
- [ ] Combat order, monster traits, armour allocation, spell timing, escape, and simultaneous death are explicit.
- [ ] Inventory, rewards, keys, equipment, sale, repair, and capacity rules are explicit.
- [ ] Expedition, repopulation, retreat, death, recovery, Graveyard, and completion rules are explicit.
- [ ] Random streams, committed outcomes, event history, save versions, and import/migration behaviour are traceable.
- [ ] Exact source prose is not required by implementation logic.
- [ ] Content/licensing review confirms that referenced tables and names are eligible for the intended build.
- [ ] Product, rules, technical, QA, and content reviewers approve the draft interpretive rulings below.

## 23. Draft Interpretive Rulings

The following implementation-level rulings are made explicit in v0.1 because the source text does not fully specify digital timing. They are normative only after this document is approved.

| ID | Ruling |
|---|---|
| DRS-IR-001 | Each finally defeated monster with Loot produces one separate Loot roll after encounter victory. |
| DRS-IR-002 | Regeneration is capped at monster maximum HP and resolves before normal attack damage. |
| DRS-IR-003 | Intangible and Stoneskin inspect final calculated attack damage after modifiers and Weakness. |
| DRS-IR-004 | Paralyze causes the adventurer to skip the rolled number of player turns while monster turns continue. |
| DRS-IR-005 | Deathtouch kills before normal damage allocation when the armed monster next attacks. |
| DRS-IR-006 | The Miner zero-light ability is an immediate emergency exit to town that bypasses normal retreat safety. |
| DRS-IR-007 | A Light charge may be cast during entry preparation or an active expedition to create one virtual light unit that is cleared at expedition end; a lamp prevents darkness but does not pay explicit light costs. |
| DRS-IR-008 | A trapped-door result opens the door after the trap is cancelled or fully survived; it is not additionally locked. |
| DRS-IR-009 | Cook rewards and other defeat effects trigger only after Undead revival fails and the monster is finally defeated. |
| DRS-IR-010 | The Rinoceroid horn is a zero-hand natural weapon. |
| DRS-IR-011 | Slimemen may use the engulf effect after final defeat of a monster that was not destroyed by Explosive; using it restores HP to maximum. |
| DRS-IR-012 | Fixed-damage spells do not trigger natural weapon-die traits but are still subject to damage-based prevention such as Stoneskin and Intangible. |
