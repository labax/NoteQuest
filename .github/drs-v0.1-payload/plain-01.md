# Digital Rules Specification

## NoteQuest Web Application - Core Rules

*Version 0.1 | Draft for Review | Prepared for the NoteQuest Project*

| Field | Value |
|---|---|
| Document owner | Rules / Product Designer |
| Related documents | [Business Requirements Document v0.1](business-requirements-v0.1.md); [MVP Scope v0.1](mvp-scope-v0.1.md); [Digital Adaptation Decision Register](digital-adaptation-decision-register.md); [Decision Register v0.2](digital-adaptation-decision-register-v0.2.md); [Digital Adaptation Feasibility Study](digital-adaptation-feasibility-study.md); *NoteQuest* rulebook, first edition |
| Rules scope | Canonical single-player Core Book rules for the Palace prototype and six-dungeon MVP |
| Primary audience | Product owner, rules designer, developer, QA/tester, UX designer, data modeller, and content/licensing reviewer |
| Status | Draft for review; normative after approval |
| Last updated | 2026-07-16 |

---

## Contents

1. Purpose and Authority
2. Source Basis and Precedence
3. Normative Language and Conventions
4. Scope
5. Rules Principles
6. Rules Modules
7. Randomness and Dice
8. Adventurer Creation and State
9. Dungeon Creation, Topology, and Termination
10. Doors, Traps, Secret Passages, and Chests
11. Exploration, Torches, Light, Arms, and Hands
12. Encounters, Combat, and Monster Traits
13. Inventory, Equipment, Armour, Rewards, and Coins
14. Spells and Special Effects
15. Town, Expeditions, Persistence, Death, and Recovery
16. Calculation Reference
17. State Machines and Transition Guards
18. Validation, Manual Input, and Overrides
19. Rules and Event History
20. Deterministic Test Matrix
21. Traceability
22. Acceptance Criteria
23. Draft Interpretive Rulings
24. Approval

---

## 1. Purpose and Authority

This document defines the deterministic and stateful rules required to implement the canonical NoteQuest Core Book as a single-player web application. It converts the printed procedures and approved digital-adaptation decisions into explicit calculations, timing rules, state transitions, validation rules, persistence effects, and testable outcomes.

The specification controls **how the game behaves**. It does not define screen layout, software architecture, database technology, final artwork, deployment configuration, or the full prose displayed to players except where those concerns directly affect rules correctness.

Implementation must not invent a mechanic, timing exception, probability, reward, or consequence outside this specification and its approved content definitions. Any discovered ambiguity must be resolved through a versioned amendment rather than silently in code.

## 2. Source Basis and Precedence

### 2.1 Sources

1. The *NoteQuest* first-edition Core Book is the source for canonical mechanics, tables, names, and content.
2. The approved original Digital Adaptation Decision Register formalises ambiguous digital behaviour.
3. Decision Register v0.2 supplies the controlling prototype, dungeon-generation, randomness, persistence, accessibility, and operations decisions.
4. The approved BRD and MVP Scope define the required release boundary.
5. Approved content definitions provide the authorised rows for races, classes, spells, dungeon tables, monsters, bosses, traps, rewards, weapons, and armour.

### 2.2 Precedence

When sources conflict, apply this order:

1. A later approved decision-register ruling.
2. This approved and versioned Digital Rules Specification.
3. An earlier approved decision-register ruling.
4. The Core Book rule or table.
5. A content definition that does not alter mechanics.

A content definition may parameterise a rule, but may not override a normative rule unless it cites an approved exception ID.

### 2.3 Content and prose boundary

Exact rulebook prose is not required to execute the mechanics. Application copy should use original concise wording and paraphrased explanations unless explicit digital-reproduction permission covers the exact source text. Authorised table data and names may be stored in validated content definitions with provenance metadata.

## 3. Normative Language and Conventions

- **Must / shall**: required canonical behaviour.
- **Should**: expected behaviour that may be deferred only with documented impact.
- **May**: permitted optional behaviour.
- **Natural result**: the unmodified face value rolled on a die.
- **Final value**: the value after all approved modifiers, floors, caps, and multipliers.
- **Current dungeon**: the dungeon containing the active expedition.
- **Current segment**: the segment occupied by the active adventurer.
- **Room**: a segment whose content table is resolved. Corridors and staircases are not rooms.
- **Living monster**: a monster instance with current HP greater than zero and no resolved defeat state.
- **Active monster**: a living monster not prevented from acting by an effect such as Cold Ray.
- **Empty room**: a generated room containing no living monsters. Dropped items, recoverable containers, or a corpse do not make a room non-empty for repopulation.
- **Committed outcome**: a random result or user choice that has been accepted and persisted and therefore cannot be rerolled by reload.

All arithmetic uses integers. Unless a rule states otherwise, a calculated damage, sale, quantity, or resource result cannot fall below zero.

## 4. Scope

### 4.1 In scope

| Area | Normative scope |
|---|---|
| Dice and randomness | d6 and 2d6 procedures, weighted lookup, deterministic streams, result commitment, and natural-result preservation |
| Adventurers | Race, class, HP, abilities, spells, weapon, torches, coins, arms, hands, inventory, and status |
| Dungeons | Name, type, entrance, graph topology, segments, floors, doors, rooms, encounters, boss room, completion, and guaranteed termination |
| Exploration | Door resolution, traps, locks, keys, breaking, stealth, secret passages, chests, torch costs, and darkness |
| Combat | Initiative, legal actions, target selection, weapon damage, spells, monster damage, armour, traits, escape, defeat, death, and rewards |
| Items and economy | Backpack, equipment, armour durability, consumables, normal and master keys, rewards, selling, buying, repair, and dropping |
| Persistence | Expeditions, monster healing, room repopulation, corpses, belongings, Graveyard, save-safe outcomes, and event history |
| Core content integration | Six authorised core dungeon types and their versioned content definitions |

### 4.2 Out of scope

- Expanded World rules or content.
- Multiplayer, cooperative play, shared campaigns, and competitive validation.
- Crafting, tactical grid combat, spatial enemy movement, detailed town exploration, campaign maps, settlements, factions, kingdoms, or quests.
- Free rerolls, point-buy creation, mandatory balance correction, or baseline house-rule presets.
- AI-authored narrative or mechanics.
- Real-time torch timers.
- Cloud-authoritative saves, online anti-cheat, or account progression.
- Rules inferred from source artwork or layout when not stated in approved text or data.

## 5. Rules Principles

| ID | Principle | Normative meaning |
|---|---|---|
| DRS-P-001 | Deterministic resolution | Identical state, choices, and random-stream state produce identical outcomes. |
| DRS-P-002 | Source-faithful baseline | Canonical mode preserves authorised probabilities, content, lethality, and imbalance. |
| DRS-P-003 | Explicit timing | Every effect has a trigger, timing point, target, duration, and resolution order. |
| DRS-P-004 | Transparent automation | Natural dice, table IDs, row IDs, modifiers, choices, and state changes remain inspectable. |
| DRS-P-005 | Immutable committed outcomes | Reloading cannot reroll an initiated and committed action. |
| DRS-P-006 | State validity | The engine exposes only actions whose guards are satisfied and prevents invalid state mutation. |
| DRS-P-007 | Data-driven content | Races, classes, spells, tables, monsters, items, and abilities are definitions separate from runtime instances. |
| DRS-P-008 | Persistent consequences | Generated topology, opened or broken doors, damage, loot, deaths, drops, and completion survive save and reload. |
| DRS-P-009 | No silent ambiguity | A missing rule blocks the affected behaviour until a documented ruling exists. |
| DRS-P-010 | UI-independent logic | Rules calculations and transitions are testable without rendering or animation. |

## 6. Rules Modules

| Module | Requirement IDs | Priority |
|---|---|---:|
| Randomness and dice | DRS-DICE-001 to DRS-DICE-012 | Must |
| Adventurer creation and state | DRS-ADV-001 to DRS-ADV-020 | Must |
| Dungeon generation | DRS-DUN-001 to DRS-DUN-025 | Must |
| Doors, traps, passages, and chests | DRS-DOOR-001 to DRS-DOOR-020 | Must |
| Exploration, torches, and hands | DRS-EXP-001 to DRS-EXP-021 | Must |
| Combat and traits | DRS-CMB-001 to DRS-CMB-033 | Must |
| Items, rewards, and economy | DRS-ITEM-001 to DRS-ITEM-052 | Must |
| Spells | DRS-SPELL-001 to DRS-SPELL-015 | Must |
| Expeditions, death, and persistence | DRS-PER-001 to DRS-PER-025 | Must |
| Validation and history | DRS-VAL-001 to DRS-VAL-010; DRS-HIST-001 to DRS-HIST-012 | Must / Should |

## 7. Randomness and Dice

### 7.1 Requirements

| ID | Requirement | Priority | Acceptance signal |
|---|---|---:|---|
| DRS-DICE-001 | The engine shall support fair integer d6 results from 1 through 6. | Must | Distribution and boundary tests produce only 1-6. |
| DRS-DICE-002 | A 2d6 lookup shall sum two independent d6 results and preserve both natural dice. | Must | Every total 2-12 maps to the correct weighted row. |
| DRS-DICE-003 | The engine shall preserve natural die values separately from modified values. | Must | Natural 1 and 6 triggers remain correct after modifiers. |
