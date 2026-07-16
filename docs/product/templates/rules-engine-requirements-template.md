# Rules Engine Requirements

## {{PRODUCT_OR_RELEASE_NAME}}

*Version {{VERSION}} | {{STATUS}} | Prepared for the NoteQuest Project*

| Field | Value |
|---|---|
| Document owner | {{OWNER}} |
| Related documents | {{RELATED_DOCUMENTS}} |
| Rules scope | {{RULES_SCOPE}} |
| Primary audience | Product owner, developer, QA/tester, UX designer, and content/licensing reviewer |
| Status | {{STATUS}} |
| Last updated | {{DATE}} |

---

## Contents

1. Purpose
2. Source Basis
3. Rules Context
4. Scope
5. Rules Engine Principles
6. Priority Definitions
7. Module Summary
8. Detailed Requirements
9. Calculation Reference
10. State Transitions
11. Validation and Manual Overrides
12. Roll / Rules History
13. Deterministic Test Matrix
14. Traceability
15. Acceptance Criteria
16. Open Questions
17. Approval

---

## 1. Purpose

{{DEFINE_THE_DETERMINISTIC_MECHANICS_AND_RULE_ADJACENT_BEHAVIOR_COVERED_BY_THIS_DOCUMENT}}

The rules engine calculates NoteQuest outcomes, validates game state, and records the inputs used. It must not invent rules, tables, or consequences outside the approved digital rules specification.

## 2. Source Basis

- {{RULES_OR_SRD_SOURCE}}
- {{BUSINESS_OR_PRODUCT_REQUIREMENTS}}
- {{FUNCTIONAL_REQUIREMENTS}}
- {{DATA_MODEL}}
- {{CONTENT_AND_LICENSING_REQUIREMENTS}}

Record the exact source and version for every implemented rule. Do not rely on undocumented memory or copied rulebook text in code comments.

## 3. Rules Context

{{DESCRIBE_HOW_THE_RULES_ENGINE_SUPPORTS_THE_PRODUCT_AND_WHICH_DECISIONS_REMAIN_WITH_THE_USER}}

## 4. Scope

### 4.1 In scope

| Area | Rules behavior |
|---|---|
| Dice and random generation | d6 and 2d6 rolls, seeded randomness, manual entry, and natural-result preservation |
| Adventurer creation | Race and class rolls, HP, abilities, spells, starting weapon, coins, and torches |
| Dungeon generation | Dungeon names, segments, room content, monsters, bosses, floors, and final-room rules |
| Doors, traps, and secret passages | Door states, trap resolution, keys, torch costs, breakage, and alerting |
| Light, torches, and hands | Capacity, action costs, alternative light, darkness death, and hand requirements |
| Combat and monster traits | Initiative, damage, armour allocation, natural die triggers, escape, death, and loot |
| Inventory, equipment, and spells | Capacity, slots, durability, spell uses, keys, consumables, and dropped items |
| Town and persistence | Retreat, rest, repair, buying, selling, repopulation, corpse recovery, saves, and the Graveyard |

### 4.2 Out of scope

- {{OUT_OF_SCOPE_RULE_AUTOMATION_1}}
- {{OUT_OF_SCOPE_RULE_AUTOMATION_2}}
- Unsupported narrative generation or mechanics not present in the approved digital rules specification.
- Expanded World rules unless separately approved and specified.
- Unapproved official rules prose, tables, descriptions, artwork, or trade dress in the product or source comments.

## 5. Rules Engine Principles

| ID | Principle | Meaning |
|---|---|---|
| REP-001 | Deterministic calculations | Identical inputs produce identical outputs. |
| REP-002 | Transparent results | Inputs, modifiers, caps, cancellations, and classifications are inspectable. |
| REP-003 | User-confirmed consequences | Major state changes are not silently applied. |
| REP-004 | Source-faithful | The engine implements approved NoteQuest rules without inventing additional mechanics or content. |
| REP-005 | Manual override | Users can correct state for mistakes, variants, and physical dice where safe. |
| REP-006 | Immutable completed rolls | Saved roll results are not silently recalculated later. |
| REP-007 | Testability | Pure rules logic can be tested without UI dependencies. |
| REP-008 | Licensing-conscious | Rule source and content provenance are recorded separately from mechanics. |
| REP-009 | {{PRINCIPLE}} | {{MEANING}} |

## 6. Priority Definitions

| Priority | Meaning |
|---|---|
| Must | Required for release unless formally descoped. |
| Should | Important but deferrable with documented impact. |
| Could | Optional enhancement. |
| Won't | Explicitly excluded. |

## 7. Module Summary

| Module | Requirement IDs | Priority | Owner |
|---|---|---:|---|
| Dice and random generation | RER-DICE-001 to RER-DICE-{{LAST}} | Must / Should | {{OWNER}} |
| Adventurer creation | RER-ADV-001 to RER-ADV-{{LAST}} | Must | {{OWNER}} |
| Dungeon generation | RER-DUN-001 to RER-DUN-{{LAST}} | Must | {{OWNER}} |
| Doors, traps, and secret passages | RER-DOOR-001 to RER-DOOR-{{LAST}} | Must | {{OWNER}} |
| Light, torches, and hands | RER-LIGHT-001 to RER-LIGHT-{{LAST}} | Must | {{OWNER}} |
| Combat and monster traits | RER-COMBAT-001 to RER-COMBAT-{{LAST}} | Must | {{OWNER}} |
| Inventory, equipment, and spells | RER-ITEM-001 to RER-ITEM-{{LAST}} | Must / Should | {{OWNER}} |
| Town and persistence | RER-PERSIST-001 to RER-PERSIST-{{LAST}} | Must / Should | {{OWNER}} |
| History and validation | RER-HIST-001 / RER-VAL-001 onward | Must / Should | {{OWNER}} |

## 8. Detailed Requirements

Repeat the following structure for each module.

### 8.1 {{MODULE_NAME}}

**Goal:** {{MODULE_GOAL}}

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---:|---|
| {{PREFIX}}-001 | The engine shall {{DETERMINISTIC_BEHAVIOR}}. | Must | {{EXPECTED_RESULT}} |
| {{PREFIX}}-002 | The engine should {{BEHAVIOR}}. | Should | {{EXPECTED_RESULT}} |
| {{PREFIX}}-003 | The engine could {{BEHAVIOR}}. | Could | {{EXPECTED_RESULT}} |

### Suggested module details

#### Dice and random generation

Define:

- Supported d6 and 2d6 procedures.
- Generated versus manual rolls.
- Seeded or injected randomness for reproducible tests and saves.
- Preservation of natural die values before modifiers.
- Reroll rules, if any, and result stability after save/reload.

#### Adventurer creation

Define:

- 2d6 race and class lookup.
- Maximum HP as race HP plus class HP.
- Starting weapon, abilities, spell results, ten torches, and zero coins.
- Duplicate spell results as separate uses.
- Validation for arms, hands, equipment, and light sources.

#### Dungeon generation

Define:

- Three-part dungeon-name generation and dungeon-type selection.
- Incremental generation when a door is opened.
- Segment-table column selection based on staircase, corridor, or room origin.
- Room-content and monster generation.
- Floor transitions, guaranteed termination, and final-room generation.
- Boss generation and boss-treasure resolution.

#### Doors, traps, and secret passages

Define:

- Door result 1 as trap, 2–3 as locked, and 4–6 as unlocked.
- Unlocking by torch, key, class ability, or approved item effect.
- Broken-door persistence and monster-alert propagation.
- Trap timing, damage, limb loss, spawned monsters, and cancelled traps.
- One-time secret-passage searches and generated results.

#### Light, torches, and hands

Define:

- Starting and maximum torch count of ten.
- Torch costs for dungeon entry and qualifying exploration actions.
- Alternative light from spells, lamps, and approved items.
- Darkness-death timing when no light source remains.
- One-handed and two-handed equipment constraints after limb loss.

#### Combat and monster traits

Define:

- Initiative from quiet opening, broken doors, traps, or alert state.
- Player damage rolls, target selection, and combined surviving-monster damage.
- Armour-piece allocation, durability, destruction, and spillover.
- Natural 1 and natural 6 trait triggers and modifier order.
- Spell and consumable actions, teleport escape, death, and loot.

#### Inventory, equipment, and spells

Define:

- Ten-item backpack capacity and separate ten-torch capacity.
- Equipped weapon, armour-piece uniqueness, and hand requirements.
- Item pickup, discard, room persistence, and corpse recovery.
- Spell-use exhaustion and restoration in town.
- Normal keys, master keys, consumables, and magical modifiers.

#### Town and persistence

Define:

- Safe retreat-path validation.
- Rest, armour repair, torch purchase, and item-sale costs.
- Dungeon state retained across expeditions and replacement adventurers.
- Monster healing and room repopulation on a later expedition.
- Death records, dropped equipment, darkness deaths, and the Graveyard.

## 9. Calculation Reference

### 9.1 Formula catalogue

| ID | Calculation | Formula / rule | Order of operations |
|---|---|---|---|
| CALC-001 | {{NAME}} | `{{FORMULA}}` | {{ORDER}} |
| CALC-002 | {{NAME}} | `{{FORMULA}}` | {{ORDER}} |

### 9.2 Classification table

| Condition | Result |
|---|---|
| {{CONDITION}} | {{RESULT}} |
| {{CONDITION}} | {{RESULT}} |

### 9.3 Boundary table

| Value / state | Minimum | Maximum | Default | Override allowed |
|---|---:|---:|---:|---|
| {{FIELD}} | {{MIN}} | {{MAX}} | {{DEFAULT}} | Yes / No |
| {{FIELD}} | {{MIN}} | {{MAX}} | {{DEFAULT}} | Yes / No |

## 10. State Transitions

### 10.1 {{STATEFUL_OBJECT}}

```mermaid
stateDiagram-v2
    [*] --> {{INITIAL_STATE}}
    {{INITIAL_STATE}} --> {{NEXT_STATE}}: {{TRIGGER}}
    {{NEXT_STATE}} --> {{FINAL_STATE}}: {{TRIGGER}}
    {{NEXT_STATE}} --> {{INITIAL_STATE}}: {{RECOVERY_OR_OVERRIDE}}
```

| From | Trigger | Guard | To | Side effects |
|---|---|---|---|---|
| {{FROM}} | {{TRIGGER}} | {{GUARD}} | {{TO}} | {{SIDE_EFFECTS}} |

## 11. Validation and Manual Overrides

| ID | Scenario | Standard validation | Override behavior | Audit / note |
|---|---|---|---|---|
| RER-VAL-001 | {{SCENARIO}} | {{VALIDATION}} | {{OVERRIDE}} | {{RECORD}} |
| RER-VAL-002 | {{SCENARIO}} | {{VALIDATION}} | {{OVERRIDE}} | {{RECORD}} |

Rules:

- Invalid generated values must never be produced.
- Invalid manual values receive a clear error and do not mutate state.
- Overrides must be explicit and must not silently change the standard rule definition.
- House-rule support must be separated from baseline calculations.
- Consequences requiring interpretation remain user-confirmed.

## 12. Roll / Rules History

| Field | Required | Notes |
|---|---:|---|
| ID | Yes | Stable identifier. |
| Result type | Yes | Race, class, door, segment, room content, monster, combat, reward, trap, or custom. |
| Inputs | Yes | Natural die values, source table, modifiers, relevant item or ability, and current state. |
| Initial result | Yes | Unmodified dice or source-table result. |
| Final result | Yes | Resolved outcome after approved modifiers and user choices. |
| Natural die values | Yes where applicable | Preserve natural 1 and 6 results used by monster traits and item effects. |
| Context | Should | Save slot, adventurer, dungeon, floor, segment, encounter, and expedition. |
| Rule version | Should | Supports future migrations and interpretation. |
| Source | Should | Generated, manual, seeded, or imported result. |
| Timestamp | Should | Links the record to the event log and save history. |
| User note | Could | Optional player-created note. |

## 13. Deterministic Test Matrix

| Test ID | Inputs | Expected intermediate values | Expected result | Requirement IDs |
|---|---|---|---|---|
| RT-001 | {{FIXED_INPUTS}} | {{INTERMEDIATE}} | {{RESULT}} | {{RER_IDS}} |
| RT-002 | {{FIXED_INPUTS}} | {{INTERMEDIATE}} | {{RESULT}} | {{RER_IDS}} |
| RT-003 | Boundary: {{CASE}} | {{INTERMEDIATE}} | {{RESULT}} | {{RER_IDS}} |
| RT-004 | Invalid input: {{CASE}} | No state mutation | Validation error | {{RER_IDS}} |

Minimum categories:

- Minimum and maximum d6 results and every 2d6 table value.
- Race, class, spell, dungeon-name, door, segment, room, monster, boss, and reward lookups.
- Door trap, locked, and unlocked boundaries.
- Torch capacity, qualifying action costs, alternative light, and zero-light death.
- Floor transitions, final-room generation, and dungeon-termination rules.
- Weapon and spell modifiers, armour allocation, and monster natural 1 or 6 trait triggers.
- Inventory, equipment-slot, spell-use, key, and hand constraints.
- Monster healing, room repopulation, dropped items, and corpse recovery across expeditions.
- First and last table ranges plus invalid gaps or overlaps.
- Invalid manual input and explicit override behavior.

## 14. Traceability

| Rules requirement | Functional requirement | Data model | UX flow | Test |
|---|---|---|---|---|
| RER-{{ID}} | {{FR_ID}} | {{ENTITY_OR_FIELD}} | {{UX_ID}} | RT-{{ID}} |
| RER-{{ID}} | {{FR_ID}} | {{ENTITY_OR_FIELD}} | {{UX_ID}} | RT-{{ID}} |

## 15. Acceptance Criteria

- [ ] Must calculations are deterministic and unit-testable without UI dependencies.
- [ ] Calculation order and boundaries are explicit.
- [ ] Initial and final results are preserved where user choices can change an outcome.
- [ ] Major state consequences require explicit user action unless documented otherwise.
- [ ] Manual input and override behavior are validated.
- [ ] Rules history stores sufficient information to explain a saved result.
- [ ] Official text is not required to execute the mechanics.
- [ ] Rule sources and bundled content provenance are documented.

## 16. Open Questions

| ID | Question | Owner | Decision point | Status |
|---|---|---|---|---|
| OQ-001 | {{QUESTION}} | {{OWNER}} | {{DATE_OR_MILESTONE}} | Open |
| OQ-002 | {{QUESTION}} | {{OWNER}} | {{DATE_OR_MILESTONE}} | Open |

## 17. Approval

| Role | Name | Decision | Date | Notes |
|---|---|---|---|---|
| Product Owner | {{NAME}} | Pending / Approved / Rejected | {{DATE}} | {{NOTES}} |
| Rules / Technical Reviewer | {{NAME}} | Pending / Approved / Rejected | {{DATE}} | {{NOTES}} |
| QA Reviewer | {{NAME}} | Pending / Approved / Rejected | {{DATE}} | {{NOTES}} |
| Content / Licensing Reviewer | {{NAME}} | Pending / Approved / Rejected | {{DATE}} | {{NOTES}} |
