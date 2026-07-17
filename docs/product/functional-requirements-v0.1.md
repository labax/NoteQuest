# Functional Requirements Document

## NoteQuest Web Application — Core MVP

*Version 0.1 | Draft for Review | Prepared for the NoteQuest Project*

| Field | Value |
|---|---|
| Document owner | Product Owner / Technical Lead |
| Related documents | [Business Requirements Document v0.1](business-requirements-v0.1.md); [MVP Scope v0.1](mvp-scope-v0.1.md); [Product Requirements Document v0.1](product-requirements-v0.1.md); [Digital Rules Specification v0.1](digital-rules-specification-v0.1.md); [Digital Adaptation Decision Register](digital-adaptation-decision-register.md); [Decision Register v0.2](digital-adaptation-decision-register-v0.2.md); [Digital Adaptation Feasibility Study](digital-adaptation-feasibility-study.md) |
| Product scope | Palace production-intent prototype and complete six-dungeon Core MVP |
| Primary audience | Product owner, developer, rules designer, UX designer, QA/tester, data modeller, content/licensing reviewer, accessibility reviewer, and operations owner |
| Status | Draft for review |
| Last updated | 2026-07-16 |

---

## Contents

1. [Purpose](#1-purpose)
2. [Source Basis](#2-source-basis)
3. [Product Context](#3-product-context)
4. [Functional Scope](#4-functional-scope)
5. [Users and Permissions](#5-users-and-permissions)
6. [Functional Assumptions](#6-functional-assumptions)
7. [Priority Definitions](#7-priority-definitions)
8. [Requirement Summary](#8-requirement-summary)
9. [Detailed Functional Requirements](#9-detailed-functional-requirements)
10. [Cross-Feature Behavior](#10-cross-feature-behavior)
11. [Error and Recovery Behavior](#11-error-and-recovery-behavior)
12. [MVP / Release Exclusions](#12-mvp-release-exclusions)
13. [Traceability Matrix](#13-traceability-matrix)
14. [Acceptance Criteria Summary](#14-acceptance-criteria-summary)
15. [Open Questions](#15-open-questions)
16. [Approval](#16-approval)

---

## 1. Purpose

This document defines the observable application behavior required to deliver the NoteQuest Palace prototype and the complete six-dungeon Core MVP. It converts the approved business, scope, product, and rules baselines into testable system behavior covering entry, adventurer creation, dungeon exploration, combat, inventory, town, persistence, death, recovery, accessibility, content controls, and release-facing application behavior.

This document controls **what the application must do in response to user actions and system conditions**. The approved [Digital Rules Specification](digital-rules-specification-v0.1.md) controls formulas, probabilities, timing, state transitions, and canonical mechanical outcomes.

This document does not define final software architecture, database schemas, migration code, visual layouts, asset production, hosting-provider selection, or every executable test case. Those details belong in the Data / Domain Model, UX Flow and Wireframe Requirements, [Non-Functional Requirements](non-functional-requirements-v0.1.md), Content and Licensing Requirements, architecture plan, and [Acceptance Criteria / Test Plan](acceptance-criteria-test-plan-v0.1.md).

## 2. Source Basis

The controlling sources are:

1. [Business Requirements Document v0.1](business-requirements-v0.1.md).
2. [MVP Scope v0.1](mvp-scope-v0.1.md).
3. [Product Requirements Document v0.1](product-requirements-v0.1.md).
4. [Digital Rules Specification v0.1](digital-rules-specification-v0.1.md), including all approved Section 23 interpretive rulings.
5. Approved Digital Adaptation Decision Registers v0.1 and v0.2.
6. [Digital Adaptation Feasibility Study](digital-adaptation-feasibility-study.md).
7. Approved content definitions and the item-level content and rights inventory when available.

When sources conflict, the precedence rules in the [Digital Rules Specification](digital-rules-specification-v0.1.md) apply to mechanical behavior. Later approved product or decision-register amendments control release scope and product behavior.

## 3. Product Context

The application is a free, single-player, installable web application that automates the complete first-edition NoteQuest Core Book loop. The player uses one of three named local save slots, creates a canonical adventurer, enters persistent procedural dungeons, resolves exploration and combat, manages resources and equipment, returns to town, survives or dies, recovers prior belongings with replacement adventurers, completes bosses, and resumes later without external bookkeeping.

The Core MVP includes all six approved core dungeon types. The Palace dungeon is the required production-intent prototype and must demonstrate the complete core loop, persistence, responsive behavior, accessibility path, deterministic generation, fault recovery, and playtest gates before full six-dungeon production proceeds.

Core play requires no account, backend, payment, or continuous connection. Local state is stored through the approved browser persistence baseline, while this document defines the observable save, validation, recovery, export, import, and update behavior independent of the final implementation library.

## 4. Functional Scope

### 4.1 In scope

| Area | In-scope behavior |
|---|---|
| Application entry | Launch, version status, offline readiness, PWA installation, safe update notification, and three named save slots |
| Adventurers | Canonical generation, naming, state display, abilities, spells, equipment, arms, hands, HP, resources, and status |
| Dungeons | Six core dungeon types, persistent records, deterministic incremental generation, multi-floor graph, boss completion, and map views |
| Exploration | Doors, locks, keys, breaking, traps, secret passages, stealth, alerts, light, movement, costs, and legal-action control |
| Combat | Initiative, turns, targeting, weapon attacks, spells, consumables, monster traits, damage, armour, escape, defeat, rewards, and death |
| Inventory | Backpack capacity, equipment, armour durability, spell charges, keys, consumables, rewards, overflow, drops, sales, and recovery |
| Town and expeditions | Entry, retreat, rest, spell restoration, repair, resupply, sale, re-entry, monster healing, and repopulation |
| Death and continuity | Normal death, darkness death, corpse or belongings persistence, Graveyard, replacement adventurers, recovery, and completion |
| Persistence | Autosave, three slots, snapshots, validation, migrations, export/import, deterministic streams, update safety, and failure visibility |
| Transparency | Dice and table results, event history, modifiers, costs, warnings, immutable mechanical records, and privacy-safe diagnostics |
| UX and accessibility | Responsive operation, keyboard access, focus, labels, announcements, reduced motion, scalable text, and textual map equivalence |
| Content and release | Approved bundled content, provenance, credits, English-only boundary, free access, privacy, and public feedback entry points |

### 4.2 Out of scope

| Area | Excluded behavior |
|---|---|
| Multiplayer | Cooperative play, shared campaigns, public leaderboards, competitive validation, or network-authoritative sessions |
| Cloud services | Accounts, cloud saves, cloud backup, cloud recovery, mandatory login, or cross-device synchronisation |
| Expanded content | Expanded World or any separately scoped supplement |
| Expanded systems | Crafting, tactical grid combat, real-time movement, campaign maps, factions, settlements, quests, or generated narrative |
| Presentation | 3D dungeon rendering, real-time torch timers, or source-trade-dress reproduction |
| Baseline variants | Free canonical rerolls, point-buy creation, mandatory balance corrections, or bundled house-rule presets |
| Monetisation | Payment, subscription, advertising, paid access, or paid Core MVP content |
| Localisation | Translated public releases in the Core MVP |
| Unapproved content | Exact source prose, artwork, logo, page layout, character-sheet design, or other assets without item-specific approval |

## 5. Users and Permissions

### 5.1 User types

| User type | Role | Functional access |
|---|---|---|
| Local player | Primary user | Full control of the selected local save slot, including play, export, import, restore, rename, reset, and local preferences |
| Playtester / QA reviewer | Supporting user | Same public gameplay functions plus test-build-only deterministic fixtures or diagnostics when explicitly enabled outside the public release |
| Content / release reviewer | Project role, not an application account | Reviews bundled content, credits, notices, and release evidence outside the gameplay application |
| Operations owner | Project role, not an application account | Publishes and rolls back immutable releases outside the gameplay application |

The public application has no user accounts, authentication roles, administrator screen, or server-side permission model.

### 5.2 Permission requirements

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---:|---|
| PERM-001 | The application shall not require authentication, registration, or an online identity for core play. | Must | A new user completes the Palace core flow without creating an account or sending identity data. |
| PERM-002 | A player shall be able to mutate only the local slot explicitly selected for an action. | Must | Create, reset, import, restore, and overwrite tests leave non-selected slots unchanged. |
| PERM-003 | Destructive slot actions shall require explicit confirmation identifying the slot and consequence. | Must | Cancellation applies no mutation; confirmation changes only the named slot. |
| PERM-004 | Test-only seed, fixture, or diagnostic controls shall not appear in the public production interface unless separately approved as player-facing behavior. | Must | Production release audit finds no unapproved test controls. |
| PERM-005 | Exported data shall be provided only through an explicit player action and shall include a private-data warning. | Must | No automatic upload or transmission occurs; warning appears before export completion. |

## 6. Functional Assumptions

| ID | Assumption |
|---|---|
| FA-001 | The approved [Digital Rules Specification v0.1](digital-rules-specification-v0.1.md), including Section 23, is the normative source for all mechanical behavior. |
| FA-002 | Exactly three named local save slots are available in the Core MVP. |
| FA-003 | One active adventurer may exist per save at a time; dead adventurers remain in the Graveyard. |
| FA-004 | Core gameplay data remains local to the browser profile and device unless the player explicitly exports it. |
| FA-005 | The application can run without a backend after the approved shell and content are available locally. |
| FA-006 | The visual map is a presentation of graph truth; presentation coordinates do not alter mechanics. |
| FA-007 | The textual map provides functionally equivalent navigation, state, and action access. |
| FA-008 | Random outcomes are committed and persisted before being presented as final. |
| FA-009 | Content definitions have stable IDs and are validated before they can create or mutate game state. |
| FA-010 | Exact data schemas, UI composition, performance thresholds, and provider choices will be defined in downstream specifications without changing these observable requirements. |
| FA-011 | Palace is the prototype dungeon, while the accepted public Core MVP includes all six approved dungeon types. |
| FA-012 | No production analytics or telemetry is enabled without a separate approved decision and privacy review. |

## 7. Priority Definitions

| Priority | Meaning |
|---|---|
| Must | Required for the applicable Palace prototype or Core MVP gate unless formally descoped through the approved change process. |
| Should | Important behavior that may be deferred only with documented impact and Product Owner approval. |
| Could | Optional enhancement that may be included when it does not threaten Must delivery. |
| Won't | Explicitly excluded from this release baseline. |

## 8. Requirement Summary

| Feature area | Requirement IDs | Priority range | Palace applicability | Owner |
|---|---|---|---|---|
| Application entry and local slots | APP-001 to APP-014 | Must / Should | Full | Product / Technical / UX |
| Adventurer creation and management | ADV-001 to ADV-016 | Must / Should | Full | Rules / Product / Technical |
| Dungeon selection, generation, and map | DUN-001 to DUN-019 | Must | Palace content first; shared engine full | Rules / Technical / UX |
| Exploration and movement | EXP-001 to EXP-021 | Must / Should | Full Palace subset | Rules / Technical / UX |
| Encounters and combat | CMB-001 to CMB-023 | Must / Should | Full Palace subset | Rules / Technical / UX |
| Inventory, equipment, spells, and rewards | INV-001 to INV-023 | Must / Should | Full Palace subset | Rules / Technical / UX |
| Town and expedition lifecycle | TWN-001 to TWN-016 | Must | Full | Rules / Technical |
| Death, recovery, Graveyard, and completion | DTH-001 to DTH-015 | Must | Full | Rules / Technical / UX |
| Persistence, migration, export, and update | SAV-001 to SAV-024 | Must | Full | Technical / QA |
| History, transparency, and diagnostics | HIS-001 to HIS-015 | Must / Should / Could | Full | Technical / UX / QA |
| Responsive, accessibility, and guidance | UXA-001 to UXA-020 | Must / Should | Full | UX / Accessibility / QA |
| Content, credits, privacy, and release boundary | CNT-001 to CNT-014 | Must / Should | Prototype-safe subset; full release gate | Product / Content / Operations |

## 9. Detailed Functional Requirements

### 9.1 Application Entry, Installation, and Local Save Slots

**Goal:** Let a player launch, install, start, resume, and manage private local play safely.

#### Requirements

| ID | Requirement | Priority | Acceptance criteria | Dependencies |
|---|---|---:|---|---|
| APP-001 | The application shall launch into a usable entry screen when online or when the approved application shell is available offline. | Must | Supported online and offline launch scenarios reach the slot screen without requiring a backend. | PR-015 |
| APP-002 | The application shall display exactly three named local save slots. | Must | Slot screen always shows three distinct slot positions. | PR-016 |
| APP-003 | Each slot shall show its name, state summary, last update, rules/content version, and recovery availability when known. | Must | Metadata matches stored state after create, save, migrate, import, and restore. | PR-016 |
| APP-004 | An empty slot shall offer creation and explain that play begins with adventurer creation. | Must | Selecting create establishes a valid slot and enters the creation flow. | PR-001 |
| APP-005 | A valid occupied slot shall offer resume without rerolling or recomputing committed outcomes. | Must | Resume restores the latest committed state and random-stream positions. | PR-020 |
| APP-006 | A slot shall support rename without changing mechanical state or history. | Must | Rename persists and all non-name data remains equivalent. | PR-016 |
| APP-007 | Reset, overwrite, import replacement, and recovery restoration shall identify the target slot and require confirmation. | Must | Cancel leaves the slot byte-for-byte or semantically unchanged. | PR-006, PR-019 |
| APP-008 | A corrupted, unsupported, or invalid slot shall be isolated without blocking other valid slots. | Must | Other slots remain playable and the affected slot exposes safe actions only. | PR-018 |
| APP-009 | The application shall communicate current version, offline readiness, installation availability, and a pending safe update. | Must | Status is visible or discoverable and does not falsely claim offline readiness. | PR-015, PR-032 |
| APP-010 | PWA installation shall be optional and ordinary browser play shall remain available. | Must | Dismissing or lacking install support does not block core play. | PR-015 |
| APP-011 | A pending update shall not replace the active version during an unresolved action. | Must | Update activates only after a successful save point and reload/restart. | PR-032 |
| APP-012 | First-run storage guidance shall explain local-only saves, browser-data deletion risk, and export backup. | Should | Guidance is readable, skippable, and available later from help/settings. | PR-019, PR-025 |
| APP-013 | The application shall not present payment, login, advertising, subscription, or account-recovery controls. | Must | Release audit finds no such controls in the Core MVP. | PR-002, PR-027 |
| APP-014 | The application shall provide an About/Credits entry from the application shell. | Must | Credits and required notices remain accessible online and offline. | PR-028, PR-029 |

#### Functional states

| State | Required behavior |
|---|---|
| Empty | Three slots are visible; unused slots offer creation. |
| Loading | Slot validation, migration, or recovery inspection is announced and does not expose premature play controls. |
| Success | Valid slots expose resume and management actions appropriate to their state. |
| Validation error | The affected slot shows the reason and safe next actions; no silent reset occurs. |
| System error | Failure is visible and other valid slots remain available where possible. |
| Recovery | Last-valid restoration or export of recoverable data is offered when available. |
| Confirmation | Destructive actions identify the slot and consequences before mutation. |

#### Notes and exclusions

- No account selector or cloud slot list is included.
- More than three active slots is not required.
- Exact visual layout belongs in UX Flow and Wireframes.

### 9.2 Adventurer Creation and Management

**Goal:** Create and maintain a valid canonical adventurer without external tables.

#### Requirements

| ID | Requirement | Priority | Acceptance criteria | Dependencies |
|---|---|---:|---|---|
| ADV-001 | A slot with no living active adventurer shall offer adventurer creation. | Must | New, post-death, and recovered saves enter creation correctly. | PR-001, PR-014 |
| ADV-002 | Creation shall generate race and class through the approved weighted 2d6 procedures. | Must | Every deterministic 2d6 fixture maps to the authorised row. | DRS-ADV-001 |
| ADV-003 | Creation shall calculate HP and assign abilities, spells, starting weapon, ten torches, zero coins, arms, and hands according to the DRS. | Must | Complete creation fixtures match the DRS. | DRS-ADV-002 to 020 |
| ADV-004 | Random creation results shall be committed before the completed adventurer is presented. | Must | Reload after commitment reproduces the same adventurer. | DRS-DICE-006 to 012 |
| ADV-005 | The player shall enter and persist an adventurer name without changing generated mechanics. | Must | Name changes do not alter any mechanical field or random state. | PRD-ADV-003 |
| ADV-006 | The application shall display current/max HP, race, class, abilities, spells and uses, arms, hands, equipment, armour, torches, coins, inventory, location, status, and relevant death/recovery state. | Must | All survival-critical state is visible or available through one direct action. | PR-006, PR-010 to 014 |
| ADV-007 | The application shall show concise explanations of race, class, ability, and spell effects using approved wording. | Must | Copy is sufficient to make legal decisions and passes content review. | PR-029 |
| ADV-008 | The application shall expose only actions legal for the adventurer's current HP, arms, hands, light, location, combat state, and inventory state. | Must | Invalid-action tests produce no state mutation. | DRS-VAL-001 to 010 |
| ADV-009 | Changes to HP, arms, hands, charges, equipment, resources, location, and status shall autosave as part of the committing action. | Must | Close/reload after each change restores equivalent state. | PR-017 |
| ADV-010 | Duplicate spell results shall remain separately usable where the DRS defines separate charges. | Must | Duplicate fixtures produce the correct number of uses. | DRS-ADV, DRS-SPELL |
| ADV-011 | A player shall not receive a free canonical reroll or point-buy alternative. | Must | Creation flow contains no unapproved reroll or stat allocation path. | PR-004, PR-034 |
| ADV-012 | Abandoning an incomplete creation shall require confirmation when committed state would be discarded. | Must | Cancel returns to creation; confirm returns to the prior valid state or empty slot as specified. | PR-006 |
| ADV-013 | Invalid content definitions shall block creation before the active save is replaced. | Must | Failure leaves the previous valid slot state unchanged. | PR-028, DRS-VAL |
| ADV-014 | Manual physical-dice entry may be offered only as an explicit mode that labels and records manual results. | Should | History distinguishes manual from generated results. | PRD-ADV-006, DRS-DICE-009 |
| ADV-015 | The application shall support replacement-adventurer creation after death without deleting the prior Graveyard entry or recoverable belongings. | Must | Replacement creation preserves prior continuity records. | PR-014 |
| ADV-016 | Portrait generation, account unlocks, custom-stat creation, and balance presets shall not be required or exposed in canonical creation. | Must | Release audit confirms exclusion. | PR-034 |

#### Functional states

| State | Required behavior |
|---|---|
| Empty | Explain that no living adventurer exists and offer creation or Graveyard review. |
| Loading | Show committed generation progress without exposing partial editable mechanical state. |
| Success | Present the complete adventurer and next legal action. |
| Validation error | Identify the failed definition or rule validation and preserve prior state. |
| System error | Do not create a partial active adventurer. |
| Recovery | Return to the last valid slot snapshot or restart uncommitted creation. |
| Confirmation | Confirm abandonment only when committed or entered information would be lost. |

### 9.3 Dungeon Selection, Generation, and Map

**Goal:** Create, preserve, and present dungeons that always reach the boss and terminate.

#### Requirements

| ID | Requirement | Priority | Acceptance criteria | Dependencies |
|---|---|---:|---|---|
| DUN-001 | A living adventurer in town shall be able to create or select an approved persistent dungeon. | Must | Valid new and existing dungeons appear with legal entry actions. | PR-003 |
| DUN-002 | The Core MVP shall expose all six approved core dungeon types; the Palace prototype shall expose Palace. | Must | Content inventory and environment-specific acceptance checks pass. | PR-003, PR-031 |
| DUN-003 | Each dungeon shall retain stable identity, type, rules/content version, completion state, floors, segments, connections, encounters, drops, corpses/belongings, and boss state. | Must | Close/reload and export/import preserve the same dungeon. | PR-007, PR-016 |
| DUN-004 | Unknown destination content shall not be generated until its connection is successfully opened. | Must | Failed, cancelled, trapped, or still-locked paths contain no destination result. | PR-008, DRS-DUN |
| DUN-005 | A generated destination and its random results shall be persisted before presentation as final. | Must | Reload produces the same segment, content, and connection. | PR-008, PR-020 |
| DUN-006 | Floor generation shall use the approved six non-stair segment target, ten-segment maximum, staircase pressure, forced staircase, and final-room rules. | Must | Boundary fixtures and seed simulations pass. | PR-009, DRS-DUN-001 to 025 |
| DUN-007 | The generator shall never expose an unreachable boss or non-terminating floor as a valid committed dungeon. | Must | At least 100,000 seeds per dungeon type produce zero failures. | PR-009, PR-031 |
| DUN-008 | The application shall display a visual map derived from graph truth. | Must | Map shows current position, floors, connections, doors, stairs, entrance, boss, occupants, hazards, corpses/belongings, drops, and search state as applicable. | PR-007 |
| DUN-009 | The application shall provide a textual map with equivalent state, route, and action access. | Must | A keyboard/screen-reader user can perform every required map action. | PR-024 |
| DUN-010 | Presentation coordinates may change for readability without changing graph identity, adjacency, or mechanics. | Must | Re-layout tests preserve graph and legal moves. | PRD-DUN-004 |
| DUN-011 | Current segment and available adjacent actions shall remain identifiable at every supported viewport. | Must | Responsive matrix completes navigation without hidden required controls. | PR-023 |
| DUN-012 | Generated content shall carry stable definition and row identifiers sufficient for history and defect reproduction. | Must | Event records cite the relevant table/row or content definition. | PR-005, PR-021 |
| DUN-013 | Invalid content or impossible generation shall fail safely before corrupt graph state is committed. | Must | The previous valid graph and random-stream state remain recoverable. | PR-017, PR-018 |
| DUN-014 | Completed bosses and unique completion rewards shall not regenerate on revisit. | Must | Re-entry preserves defeated boss and resolved reward state. | PR-013 |
| DUN-015 | Unfinished branches, drops, corpses/belongings, and eligible persistent content shall remain available after retreat and re-entry. | Must | Expedition lifecycle scenarios restore expected dungeon state. | PR-013, PR-014 |
| DUN-016 | A dungeon selection view shall distinguish unstarted, active/incomplete, and completed dungeons. | Must | Status and legal actions match actual stored state. | PR-006 |
| DUN-017 | Deleting an individual persistent dungeon is not required for the Core MVP; reset occurs at the save-slot level unless separately approved. | Must | No unapproved partial deletion path exists. | PR-034 |
| DUN-018 | Manual map editing shall not change graph truth. | Must | No public control can create, delete, or reconnect mechanical segments. | PR-004 |
| DUN-019 | Dungeon seed display or copy may be provided when it does not expose unapproved test controls or private data. | Could | Any seed UI is read-only for committed canonical runs unless separately approved. | PR-020 |

#### Functional states

| State | Required behavior |
|---|---|
| Empty | Offer authorised dungeon creation choices. |
| Loading | Commit generation and save before showing a final destination. |
| Success | Show current graph, state, and legal navigation actions. |
| Validation error | Stop safely and identify invalid content or state. |
| System error | Preserve the last valid graph and do not present a false segment. |
| Recovery | Restore committed graph and deterministic stream state. |
| Confirmation | Warn before entry when the entry-light consequence is materially dangerous. |

### 9.4 Exploration, Doors, Traps, Secret Passages, Stealth, and Light

**Goal:** Present legal exploration actions, costs, and consequences transparently.

#### Requirements

| ID | Requirement | Priority | Acceptance criteria | Dependencies |
|---|---|---:|---|---|
| EXP-001 | The application shall represent every approved door state and expose only valid transitions. | Must | Door-state fixtures pass without invalid transitions. | DRS-DOOR-001 to 020 |
| EXP-002 | Opening an unresolved connection shall resolve trap or lock behavior before destination generation. | Must | Resolution order matches DRS fixtures. | PR-008, DRS-IR-008 |
| EXP-003 | The player shall be shown material costs and consequences before spending a torch, key, item, or irreversible door action. | Must | Confirmation or action copy identifies the cost and resulting risk. | PR-006 |
| EXP-004 | Normal and master keys shall be consumed or retained exactly as defined by the DRS. | Must | Key fixtures and history entries match. | DRS-DOOR, DRS-ITEM |
| EXP-005 | Door breaking shall resolve approved costs, risks, class effects, and final state. | Must | Deterministic breaking fixtures pass. | DRS-DOOR, DRS-ADV |
| EXP-006 | Traps shall expose applicable prevention or cancellation choices before damage or effects are finalised. | Must | Eligible choices appear once and cancelled effects are recorded correctly. | DRS-DOOR, DRS-ITEM |
| EXP-007 | Secret-passage searches shall obey location, repeat-search, race, cost, and result rules. | Must | Search availability and deterministic results match the DRS. | DRS-DOOR, DRS-EXP |
| EXP-008 | Successful secret passages shall appear in both visual and textual maps with equivalent traversal. | Must | Both map paths navigate the same connection. | PR-007, PR-024 |
| EXP-009 | Move Silently shall be available only in legal non-boss contexts and shall resolve per eligible monster. | Must | Stealth fixtures, including Halfling behavior, pass. | DRS-EXP |
| EXP-010 | Failed stealth shall update encounter alert or combat state before further actions are offered. | Must | No illegal bypass remains after failure. | DRS-EXP, DRS-CMB |
| EXP-011 | Stealth-bypassed living monsters shall continue to block normal safe retreat as defined by the DRS. | Must | Retreat path validation rejects the route. | DRS-PER, DRT-033 |
| EXP-012 | Physical and virtual light units shall be displayed separately when their source or persistence differs. | Must | Entry, spell, potion, lamp, and expedition-end fixtures remain distinguishable. | DRS-EXP, DRS-SPELL, DRS-IR-007/018 |
| EXP-013 | The application shall prevent or warn against an action that would create a defined darkness-death state unless the DRS requires immediate resolution. | Must | Last-light scenarios show the approved warning or death resolution. | PR-006, DRS-EXP |
| EXP-014 | The Miner emergency-exit action shall appear only at the approved zero-light timing point. | Must | It bypasses normal retreat safety and ends in town as defined. | DRS-IR-006 |
| EXP-015 | Hand and arm requirements shall be validated before weapon, shield, item, or light actions are committed. | Must | Illegal combinations are blocked without mutation. | DRS-EXP, DRS-VAL |
| EXP-016 | Movement shall be limited to legal connected segments and encounter restrictions. | Must | Invalid movement never changes location. | DRS-EXP, DRS-CMB |
| EXP-017 | Exploration actions shall append structured history with natural dice, manual/generated source, table/row IDs, costs, choices, and state changes. | Must | History reconstructs each significant action. | PR-021, PR-022 |
| EXP-018 | Repeat-action shortcuts may reduce interaction steps but shall not conceal costs, warnings, rolls, or results. | Should | Pacing tests preserve all required information. | PR-033 |
| EXP-019 | Cancellation before commitment shall leave gameplay state unchanged. | Must | Cancel-path tests show no resource, graph, or stream mutation visible to the player. | DRS-DICE-010 |
| EXP-020 | Reload after a committed exploration roll shall restore the same outcome and next legal state. | Must | No reroll or duplicate event occurs. | PR-020 |
| EXP-021 | Hover shall not be required to discover or invoke any exploration action. | Must | Touch and keyboard checks pass. | PR-023, PR-024 |

#### Functional states

| State | Required behavior |
|---|---|
| Empty | No action is shown where no legal door, search, movement, or light action exists. |
| Loading | Committing actions show progress and block duplicate submission. |
| Success | Result, cost, state change, and next legal actions are visible. |
| Validation error | Invalid actions are rejected without state mutation. |
| System error | The previous committed state remains available and save failure is explicit. |
| Recovery | Reload resumes after the last committed action. |
| Confirmation | Irreversible or last-light actions identify consequences. |

### 9.5 Encounters, Combat, and Monster Traits

**Goal:** Resolve canonical turn-based encounters transparently and deterministically.

#### Requirements

| ID | Requirement | Priority | Acceptance criteria | Dependencies |
|---|---|---:|---|---|
| CMB-001 | Entering an unresolved encounter shall establish encounter participants, state, and initiative according to the DRS. | Must | Initiative fixtures produce the approved first actor and state. | DRS-CMB-001 to 033 |
| CMB-002 | The application shall show every living monster's identity, current/max HP, relevant traits, status, and targetability. | Must | Encounter state matches runtime instances. | PR-011 |
| CMB-003 | The application shall expose only legal actions for the current turn, adventurer state, targets, equipment, spell charges, items, and encounter status. | Must | Invalid actions do not mutate state. | PR-006, DRS-VAL |
| CMB-004 | A weapon attack shall require a legal weapon or natural attack and valid target. | Must | Hand, arm, target, and weapon fixtures pass. | DRS-CMB, DRS-EXP |
| CMB-005 | Attack results shall preserve and display natural dice, modifiers, final damage, prevention, triggered traits, and applied HP change. | Must | Event and UI output reconstruct the complete calculation. | PR-005 |
| CMB-006 | Spell and consumable actions shall show target, charge/item cost, fixed or rolled effect, prevention, status, and resulting state. | Must | DRS spell and item fixtures pass. | DRS-SPELL, DRS-ITEM |
| CMB-007 | Multi-target effects shall resolve each target in stable deterministic order. | Must | Fireball and simultaneous-trigger fixtures pass. | DRS-IR-014 |
| CMB-008 | Monster turns shall resolve active living monsters, traits, attacks, combined damage, and statuses in the approved order. | Must | Complete turn fixtures match the DRS. | DRS-CMB |
| CMB-009 | The player shall allocate eligible normal damage to HP or one armour piece as permitted; poison or other non-allocable damage shall apply as defined. | Must | Mixed-damage fixtures pass. | DRS-CMB-017 to 021 |
| CMB-010 | Armour durability, destruction, and spillover damage shall be visible and persisted. | Must | Durability fixtures and close/reload tests pass. | DRS-CMB, DRS-ITEM |
| CMB-011 | Defensive and offensive monster traits shall use the approved final-damage and trigger semantics. | Must | Intangible, Stoneskin, Weakness, Undead, Explosive, and other trait fixtures pass. | DRS-IR-001 to 024 |
| CMB-012 | Armed next-attack effects and skipped turns shall remain visible until resolved or cleared. | Must | Paralyze, Deathtouch, Cold Ray, and related fixtures pass. | DRS-IR-004/005, DRS-SPELL |
| CMB-013 | Undead revival shall resolve before final defeat rewards and removal. | Must | Revival success grants no defeat reward; failure completes defeat. | DRS-IR-009/020 |
| CMB-014 | Defeat rewards shall be granted once per finally defeated eligible monster and once per completed boss as defined. | Must | No duplicate reward occurs across reload or revisit. | DRS-IR-001, PR-013 |
| CMB-015 | Flight or removal that is not defeat shall not grant defeat rewards. | Must | Goblin Whistle fixture grants no reward. | DRS-IR-021 |
| CMB-016 | The escape action shall appear only when legal and shall apply its full approved consequence. | Must | Escape fixtures produce correct location, encounter, and persistence state. | DRS-CMB |
| CMB-017 | Adventurer death during an attack chain shall resolve before post-chain healing or further actions when the DRS requires it. | Must | Simultaneous and Vampiric fixtures pass. | DRS-IR-019 |
| CMB-018 | Encounter victory shall unlock only the legal post-encounter rewards, movement, corpse effects, or room actions. | Must | No living monster remains and all required final-defeat checks complete first. | DRS-CMB |
| CMB-019 | Every committed combat action shall autosave before final presentation and append one non-duplicated structured history sequence. | Must | Reload produces the same result and no duplicate event. | PR-017, PR-020, PR-021 |
| CMB-020 | Repeat attack or reduced-animation controls may be provided but shall stop for new decisions, triggers, warnings, target changes, defeat, death, or errors. | Should | Pacing controls never skip a player decision. | PR-033 |
| CMB-021 | The encounter interface shall remain operable by keyboard and touch without hover-only information. | Must | Supported matrix completes combat. | PR-023, PR-024 |
| CMB-022 | Dynamic combat updates shall be announced at an appropriate level without repeatedly reading the full encounter. | Must | Screen-reader tests confirm understandable, non-excessive announcements. | PR-024 |
| CMB-023 | Closing or reloading during combat shall restore the latest committed turn and legal next actor rather than restart the encounter. | Must | Combat resume integration tests pass. | PR-017, PR-020 |

#### Functional states

| State | Required behavior |
|---|---|
| Empty | No encounter controls appear when no active encounter exists. |
| Loading | A committed action blocks duplicate input until its state is available. |
| Success | Result and next actor/actions are clear. |
| Validation error | Illegal target or action is rejected without consuming resources. |
| System error | Save/result failure is truthful and unsafe continuation is blocked. |
| Recovery | Reload returns to the latest committed turn. |
| Confirmation | Only materially irreversible optional actions require confirmation; ordinary attacks do not. |

### 9.6 Inventory, Equipment, Armour, Spells, Keys, and Rewards

**Goal:** Keep item identity, ownership, capacity, equipment legality, and effects explicit.

#### Requirements

| ID | Requirement | Priority | Acceptance criteria | Dependencies |
|---|---|---:|---|---|
| INV-001 | The application shall display backpack capacity, occupied capacity, equipped items, armour durability, spell charges, keys, consumables, coins, and dropped/recoverable items relevant to the current context. | Must | Display matches persisted item instances and resources. | PR-012 |
| INV-002 | Every item instance shall retain stable identity, definition, state, value where rolled, location, ownership, and provenance references needed by the DRS and data model. | Must | Transfer and persistence tests preserve identity and state. | DRS-ITEM |
| INV-003 | Adding items beyond capacity shall pause resolution until the player creates a legal state or explicitly leaves eligible items behind. | Must | No item is silently deleted or merged. | DRT-031 |
| INV-004 | The application shall expose only equipment combinations legal for current arms, hands, slots, and item definitions. | Must | Invalid equip actions do not mutate state. | DRS-EXP, DRS-ITEM |
| INV-005 | Equip, unequip, use, consume, discard, drop, sell, repair, recover, and transfer actions shall preserve item identity and append history. | Must | Lifecycle integration tests pass. | PR-012, PR-021 |
| INV-006 | Consumed items and spell charges shall be decremented once as part of the committing action. | Must | Reload does not restore or double-consume the resource. | PR-017, PR-020 |
| INV-007 | Duplicate spell charges shall remain separately countable and restorable only as defined by the DRS. | Must | Generation, casting, and town-rest fixtures pass. | DRS-SPELL |
| INV-008 | Magic Scrolls shall reveal and persist their spell at creation, not cast time. | Must | DRT-040 passes across save/reload. | DRS-IR-023 |
| INV-009 | Rolled item values shall be determined at the approved timing point and shall not be rerolled at sale. | Must | Valuable-jewel fixture remains stable. | DRS-IR-016 |
| INV-010 | Armour shall display current/max durability and shall not silently absorb ineligible damage. | Must | Damage-allocation fixtures pass. | DRS-CMB, DRS-ITEM |
| INV-011 | A zero-durability magical Ring shall remain equipped and usable for magical effects but shall not absorb damage. | Must | DRT-051 passes. | DRS-IR-024 |
| INV-012 | Item effects that alter light, limbs, damage, traits, rewards, cancellation, or movement shall be offered only at their approved timing point. | Must | All relevant DRS item fixtures pass. | DRS-ITEM, DRS-IR |
| INV-013 | Where multiple eligible cancellation sources exist, the player shall choose one and only the chosen source shall be consumed or discarded. | Must | DRT-043 passes. | DRS-ITEM-034 |
| INV-014 | Chest and reward resolution shall show source dice, multipliers, traps, item count, coins, and resulting capacity decisions. | Must | Protector Candle and chest fixtures pass. | DRS-IR-017 |
| INV-015 | Defeat and chest rewards shall be committed before the player can reload or navigate away. | Must | Reload cannot reroll rewards. | PR-020 |
| INV-016 | Dropped items shall appear in the correct segment and remain recoverable subject to normal rules. | Must | Retreat, re-entry, death, and recovery tests pass. | PR-012 to 014 |
| INV-017 | Corpse or belongings recovery shall use normal capacity and equipment legality rather than automatically moving all items. | Must | Partial recovery and overflow tests pass. | PR-014 |
| INV-018 | Town sales shall show final sale value and applicable character modifiers before confirmation. | Must | Cat-Person and zero-value fixtures pass. | DRS-ITEM |
| INV-019 | Selling, discarding, or overwriting a valuable item shall require a clear irreversible-action confirmation when appropriate. | Must | Cancel preserves the item; confirm applies exactly once. | PR-006 |
| INV-020 | Core portal references shall create only the approved inert marker and shall expose no Expanded World travel action. | Must | DRT-050 passes and no travel UI appears. | DRS-IR-022 |
| INV-021 | Inventory and equipment shall remain usable at every supported viewport and with keyboard and screen reader. | Must | Matrix scenarios complete equip, overflow, use, drop, and recovery. | PR-023, PR-024 |
| INV-022 | Optional item filtering or sorting may be provided when it does not alter mechanical order, identity, or history. | Could | Sorting changes presentation only. | Data / UX |
| INV-023 | The application shall not include crafting, item fusion, account collections, or paid item acquisition. | Must | Scope audit passes. | PR-027, PR-034 |

#### Functional states

| State | Required behavior |
|---|---|
| Empty | Explain when no items, spells, keys, or drops exist. |
| Loading | Committing use/transfer/reward actions block duplicate submission. |
| Success | Updated capacity, equipment, resources, and history are visible. |
| Validation error | Illegal capacity, slot, hand, target, or timing actions are rejected. |
| System error | No item is silently lost; previous valid state remains recoverable. |
| Recovery | Restore item identities and locations from the last valid state. |
| Confirmation | Irreversible discard, sale, overwrite, or valuable drop identifies the item and result. |

### 9.7 Town, Retreat, and Expedition Lifecycle

**Goal:** Connect repeated expeditions through canonical retreat, recovery, resupply, and re-entry.

#### Requirements

| ID | Requirement | Priority | Acceptance criteria | Dependencies |
|---|---|---:|---|---|
| TWN-001 | A valid new expedition shall start from town with the approved entry cost and entrance placement. | Must | Entry fixtures and event history pass. | DRS-PER |
| TWN-002 | Entry shall be blocked or warned when the post-cost state produces an approved immediate danger. | Must | Last-light scenarios match the DRS. | PR-006 |
| TWN-003 | Normal retreat shall be offered only when a safe discovered path to the entrance exists under the DRS. | Must | Path-validation fixtures accept and reject correctly. | DRS-PER-008/009 |
| TWN-004 | Successful retreat shall end the expedition in town without regenerating the dungeon. | Must | Dungeon state persists across close/reload. | PR-013 |
| TWN-005 | The Miner emergency exit shall be offered and resolved separately from normal retreat. | Must | DRS-IR-006 fixture passes. | EXP-014 |
| TWN-006 | Town shall expose only actions legal for the current adventurer, resources, equipment, and spell state. | Must | Invalid town actions do not mutate state. | DRS-PER, DRS-VAL |
| TWN-007 | Rest shall resolve HP and spell restoration exactly as defined by the DRS. | Must | Rest fixtures pass, including non-restorable consumed item effects. | DRS-PER, DRS-SPELL |
| TWN-008 | Armour repair shall show eligible pieces, cost or class effect, and resulting durability. | Must | Standard and Blacksmith repair fixtures pass. | DRS-ADV, DRS-ITEM |
| TWN-009 | Torch purchase and other approved resupply shall show cost, quantity, limits, and final resources before commitment. | Must | Purchase fixtures pass without negative coins or illegal capacity. | DRS-PER |
| TWN-010 | Item sale shall show selected items, modifiers, final value, and resulting coins before commitment. | Must | Sale fixtures pass. | INV-018 |
| TWN-011 | Re-entering a dungeon shall preserve graph and persistent state and apply approved monster healing and room-repopulation preparation. | Must | Re-entry fixtures pass. | DRS-PER-001 to 025 |
| TWN-012 | Eligible empty rooms shall receive at most one repopulation check per later expedition entry as defined. | Must | DRT-032 passes. | DRS-PER-004/007 |
| TWN-013 | Repopulation shall use its separate deterministic random stream and shall be committed before presentation. | Must | Unrelated combat/reward actions do not shift results. | PR-020 |
| TWN-014 | Town and expedition transitions shall append structured history and autosave atomically. | Must | Close/reload after transition restores correct context. | PR-017, PR-021 |
| TWN-015 | The application shall clearly distinguish town, active expedition, completed expedition, and no-living-adventurer states. | Must | Available actions match context. | PR-006 |
| TWN-016 | Detailed town exploration, shops as spatial locations, quests, factions, and settlement systems shall not be included. | Must | Scope audit passes. | PR-034 |

#### Functional states

| State | Required behavior |
|---|---|
| Empty | Explain when no living adventurer or dungeon is available for a town action. |
| Loading | Transition and transaction commits block duplicate input. |
| Success | Updated adventurer, dungeon, and resource state is visible. |
| Validation error | Unsafe retreat or unaffordable/illegal town action is rejected. |
| System error | Previous valid context and resources remain recoverable. |
| Recovery | Resume in the latest committed town or expedition state. |
| Confirmation | Purchases, sales, entry risk, and irreversible transitions identify consequences where material. |

### 9.8 Death, Belongings Recovery, Graveyard, and Dungeon Completion

**Goal:** Preserve NoteQuest continuity through lethal outcomes and persistent recovery.

#### Requirements

| ID | Requirement | Priority | Acceptance criteria | Dependencies |
|---|---|---:|---|---|
| DTH-001 | Adventurer death shall be detected at the exact DRS timing point and shall block further living-adventurer actions. | Must | Normal, darkness, and simultaneous-death fixtures pass. | DRS-PER |
| DTH-002 | Normal death shall create the approved corpse or recoverable container with eligible belongings at the death segment. | Must | DRT-034 passes. | DRS-PER-014 to 018 |
| DTH-003 | Darkness death shall create the approved belongings state without a corpse where specified. | Must | DRT-035 passes. | DRS-PER-015/018 |
| DTH-004 | Consumed items and already-resolved resources shall not reappear in death belongings. | Must | Death fixture excludes consumed potion and equivalent resources. | DRS-PER |
| DTH-005 | Death shall create an immutable Graveyard record with approved adventurer and death context. | Must | Record persists across replacement creation, reload, export/import, and completion. | PR-014 |
| DTH-006 | Private names and Graveyard details shall remain local by default. | Must | Network and diagnostics review confirms no transmission. | PR-025 |
| DTH-007 | A dead adventurer shall not be resumable as the active adventurer. | Must | Slot offers replacement creation, Graveyard, and recovery context only. | PR-014 |
| DTH-008 | Replacement-adventurer creation shall preserve existing dungeon and recoverable belongings. | Must | New adventurer can enter the same dungeon. | ADV-015 |
| DTH-009 | Reaching a prior death segment shall expose legal belongings-recovery actions. | Must | Recovery respects capacity, equipment, and encounter restrictions. | PR-014 |
| DTH-010 | Partial recovery shall leave uncollected eligible items in the segment. | Must | Close/reload preserves remaining items. | PR-012 |
| DTH-011 | Boss final defeat shall mark the dungeon complete and resolve the approved unique reward once. | Must | Reload/revisit cannot duplicate boss or reward. | PR-013 |
| DTH-012 | Completion shall preserve unfinished branches and recoverable persistent objects when the DRS permits revisit. | Must | Completed-dungeon revisit scenarios pass. | DRS-PER |
| DTH-013 | Completion shall create a permanent summary and retain the final 500 mechanically relevant history entries. | Must | Retention transition passes. | PR-021 |
| DTH-014 | Death and completion transitions shall autosave atomically before the resulting screen is presented as final. | Must | Failure injection never presents an unpersisted final state. | PR-017 |
| DTH-015 | Deleting individual Graveyard records or editing mechanical death facts is not required and shall not be exposed in the Core MVP. | Must | Records remain immutable for the life of the save. | PR-022 |

#### Functional states

| State | Required behavior |
|---|---|
| Empty | Graveyard explains when no deaths exist; recovery view explains when no belongings exist. |
| Loading | Death/completion commit blocks further actions. |
| Success | Graveyard, belongings, active-adventurer status, and dungeon completion are consistent. |
| Validation error | Illegal recovery or duplicate reward is rejected. |
| System error | Last valid pre-transition state and recovery snapshot remain available. |
| Recovery | Reload returns to the committed death or completion outcome. |
| Confirmation | No confirmation delays mandatory death; optional destructive actions are not exposed. |

### 9.9 Persistence, Validation, Migration, Export, Import, and Safe Update

**Goal:** Preserve long-lived local play without silent loss or rerolling.

#### Requirements

| ID | Requirement | Priority | Acceptance criteria | Dependencies |
|---|---|---:|---|---|
| SAV-001 | Each save slot shall persist all mechanically relevant adventurer, dungeon, expedition, inventory, history, Graveyard, version, and random-stream state. | Must | Save/close/reopen restores equivalent required state. | PR-016 |
| SAV-002 | Every meaningful state-changing action shall commit atomically. | Must | Fault injection yields either prior valid or complete new state, never a partial hybrid. | PR-017 |
| SAV-003 | The application shall not display save success until the commit succeeds. | Must | Simulated failures show truthful error status. | PR-017 |
| SAV-004 | A committing action shall prevent duplicate submission until success or failure is known. | Must | Rapid-input tests create one outcome and one event sequence. | PR-017 |
| SAV-005 | Each slot shall retain a last-known-valid recovery snapshot separate from active state. | Must | Corruption and failed-migration scenarios can restore the snapshot. | PR-016 |
| SAV-006 | Recovery shall identify what state will be restored and shall require confirmation before replacing active state. | Must | Cancel preserves active state; confirm restores only the selected slot. | PR-006 |
| SAV-007 | Save schemas shall use explicit sequential migrations. | Must | Every supported source version reaches the current version through recorded steps. | PR-018 |
| SAV-008 | A pre-migration recovery snapshot shall be retained before mutation. | Must | Migration failure preserves the original and recovery snapshot. | PR-018 |
| SAV-009 | A newer unsupported schema shall be rejected without mutation. | Must | DRT-037 passes and all current slots remain unchanged. | PR-018 |
| SAV-010 | Content/rules version incompatibility shall be explained without silently substituting or regenerating content. | Must | Incompatible saves remain preserved and non-playable until supported. | PR-018 |
| SAV-011 | Export shall create a versioned package containing complete slot state and necessary provenance/version metadata. | Must | Export/import round trip restores equivalent state. | PR-019 |
| SAV-012 | Export shall require explicit action and warn that the package contains private play data. | Must | Warning appears and no upload occurs. | PR-019, PR-025 |
| SAV-013 | Import shall validate structure, schema, versions, references, and required invariants before mutation. | Must | Invalid packages produce no slot changes. | PR-019 |
| SAV-014 | Import shall preview target slot and replacement impact before confirmation. | Must | Player can cancel with no mutation. | PR-019 |
| SAV-015 | Import shall preserve committed outcomes, event history, and all deterministic random-stream states. | Must | Imported play cannot reroll prior outcomes. | PR-020 |
| SAV-016 | Separate deterministic streams shall be maintained for dungeon generation, combat, rewards, and repopulation. | Must | Stream-isolation tests pass. | PR-020 |
| SAV-017 | Rules/content versions shall accompany mechanically significant random results and saved state. | Must | Historical outcomes remain interpretable after updates. | DRS-DICE-012 |
| SAV-018 | A reload shall never initiate a new random resolution for an already committed action. | Must | All committed-action reload fixtures pass. | PR-020 |
| SAV-019 | A pending application update may download in the background but shall activate only after a successful save point and reload/restart. | Must | Mid-action update tests retain current version until safe activation. | PR-032 |
| SAV-020 | Rollback to the prior application artifact shall not delete, reset, or silently migrate saves. | Must | Rollback rehearsal preserves compatible saves and explains incompatibility. | PR-032 |
| SAV-021 | Storage quota, eviction risk, private browsing, browser-data deletion, and device loss shall be communicated truthfully. | Must | Help and relevant failure states explain risk and export mitigation. | PR-025 |
| SAV-022 | A slot-level reset shall remove or reinitialise only the confirmed target slot. | Must | Other slots and application content remain unchanged. | PERM-002 |
| SAV-023 | A full-application reset is not required; any future implementation shall require a separate explicit confirmation distinct from slot reset. | Must | Core MVP contains no ambiguous global reset. | PR-006 |
| SAV-024 | Persistence errors shall provide privacy-safe troubleshooting information without attaching or transmitting a full save automatically. | Must | Error view contains no undisclosed data transmission. | PR-025, PR-026 |

#### Functional states

| State | Required behavior |
|---|---|
| Empty | An unused slot has no active state but remains a valid slot record or creatable position. |
| Loading | Save, migration, import, export, or restore progress is visible and duplicate actions are blocked. |
| Success | Accurate status and updated metadata are shown. |
| Validation error | Invalid import/save state is rejected before mutation. |
| System error | No false success; prior state and snapshot remain recoverable. |
| Recovery | Restore, export recoverable data, or retry from a safe state. |
| Confirmation | Reset, overwrite, import replacement, and restoration identify target and consequence. |

### 9.10 Event History, Rule Transparency, and Diagnostics

**Goal:** Make automated outcomes inspectable without compromising privacy or usability.

#### Requirements

| ID | Requirement | Priority | Acceptance criteria | Dependencies |
|---|---|---:|---|---|
| HIS-001 | Every mechanically significant random result and state-changing action needed to explain gameplay shall create a structured event record. | Must | Rules and journey tests reconstruct outcomes from events. | PR-021 |
| HIS-002 | Event records shall include stable event ID, ordering, time or sequence, action type, relevant definition/table/row IDs, natural dice, modifiers, choices, costs, results, rules/content version, and resulting references where applicable. | Must | Event schema review covers every DRS module. | DRS-HIST |
| HIS-003 | Generated and manual dice results shall be distinguishable. | Must | Manual-mode fixtures show source. | DRS-DICE-009 |
| HIS-004 | Committed mechanical event records shall be immutable. | Must | No public edit/delete action changes mechanical history. | PR-022 |
| HIS-005 | Optional player notes, when provided, shall remain separate from mechanical records. | Should | Editing a note does not alter event content or order. | PR-022 |
| HIS-006 | Active and incomplete dungeons shall retain complete structured history. | Must | Close/reload, export/import, and re-entry preserve all entries. | PR-021 |
| HIS-007 | Completed dungeons shall retain a permanent completion summary plus the final 500 mechanically relevant entries. | Must | Completion transition applies exact retention. | PR-021 |
| HIS-008 | The latest 200 entries shall be shown by default without preventing access to retained older entries. | Must | History view initially loads latest 200 and can reach older retained entries. | PR-022 |
| HIS-009 | History shall present concise human-readable summaries while preserving structured details for inspection. | Must | Player view is readable and QA detail is available. | PR-005 |
| HIS-010 | History filters may be provided by category, encounter, expedition, or severity when they do not change retention or order. | Should | Filtering changes presentation only. | UX Flow |
| HIS-011 | Reloading a committed action shall not duplicate its event sequence. | Must | DRT-036 passes. | DRS-HIST-006 |
| HIS-012 | Error and migration records shall avoid names, notes, Graveyard detail, event text, full saves, and export contents unless the player explicitly includes them. | Must | Diagnostics privacy review passes. | PR-025 |
| HIS-013 | A local diagnostic package may be offered only through explicit action with a preview of included fields. | Could | Package excludes private fields by default and is not uploaded automatically. | PRD Could scope |
| HIS-014 | Production analytics or telemetry shall remain absent unless separately approved. | Must | Network and source review finds no unapproved collector. | PR-026 |
| HIS-015 | History and result announcements shall remain usable with keyboard, small screens, and screen readers. | Must | Supported accessibility matrix can inspect an action result. | PR-023, PR-024 |

#### Functional states

| State | Required behavior |
|---|---|
| Empty | Explain when no relevant events exist. |
| Loading | Loading older retained events does not block current gameplay state. |
| Success | Latest events, filters, and details are available as applicable. |
| Validation error | Invalid filter or diagnostic selection does not change history. |
| System error | Gameplay remains usable and the history error is visible. |
| Recovery | Retry display without creating duplicate events. |
| Confirmation | Diagnostic export previews included data before creation. |

### 9.11 Responsive, Accessibility, Guidance, and Local Preferences

**Goal:** Provide the complete core journey across the approved browser, viewport, keyboard, and assistive-technology matrix.

#### Requirements

| ID | Requirement | Priority | Acceptance criteria | Dependencies |
|---|---|---:|---|---|
| UXA-001 | Every required workflow shall be usable in the current and previous two major versions of Chrome, Edge, Firefox, and Safari. | Must | Browser matrix completes the core journey. | PR-023 |
| UXA-002 | Every required workflow shall be usable at 360, 390, 768, 1024, 1280, and 1440 CSS pixels. | Must | No required action or critical state is clipped or unavailable. | PR-023 |
| UXA-003 | Phone-browser support shall include the same complete core loop rather than a read-only or reduced mode. | Must | Phone widths complete Palace scenarios. | PR-023 |
| UXA-004 | No required action or information shall depend on hover alone. | Must | Touch and keyboard checks pass. | PR-023 |
| UXA-005 | All interactive controls shall be keyboard operable in logical task order. | Must | Keyboard-only core journey passes in every supported browser. | PR-024 |
| UXA-006 | Focus shall be visible and managed for dialogs, drawers, errors, route changes, and destructive confirmations. | Must | Focus returns to a logical control after close or commit. | PR-024 |
| UXA-007 | Inputs, controls, status indicators, and errors shall have programmatically associated names and descriptions. | Must | Automated and screen-reader checks pass. | PR-024 |
| UXA-008 | Dynamic results, save state, combat changes, errors, and confirmations shall be announced appropriately. | Must | NVDA, VoiceOver, and TalkBack scenarios understand state changes. | PR-024 |
| UXA-009 | Status and available actions shall not be communicated by colour alone. | Must | Non-colour indicators remain understandable. | PR-024 |
| UXA-010 | Text shall support the approved scaling baseline without losing required controls or information. | Must | Text-scaling matrix passes. | PR-024 |
| UXA-011 | Reduced-motion preference shall remove or shorten non-essential motion without hiding state changes. | Must | Reduced-motion checks pass. | PR-024 |
| UXA-012 | The visual and textual maps shall expose equivalent graph information and required actions. | Must | Action-equivalence matrix passes. | PR-007, PR-024 |
| UXA-013 | The approved assistive-technology matrix shall include NVDA with Firefox and Chrome, VoiceOver with Safari on macOS and iOS, and TalkBack with Chrome on Android. | Must | Named smoke and core-flow tests pass. | PR-024 |
| UXA-014 | Critical adventurer state, encounter state, inventory state, map context, actions, and recent result shall remain visible or reachable through one direct action. | Must | Usability review confirms no hidden survival-critical state. | PP-001 |
| UXA-015 | Destructive confirmations shall state the object, consequence, and safe cancel action. | Must | Confirmation-content tests pass. | PR-006 |
| UXA-016 | First-time guidance shall be progressive, skippable, and available later without creating a separate tutorial campaign. | Should | New-player flow can complete unaided and experienced players can skip. | PRD Should scope |
| UXA-017 | Pacing preferences may include reduced animation or result speed but shall not suppress required decisions, warnings, rolls, costs, or history. | Should | Pacing-control acceptance tests pass. | PR-033 |
| UXA-018 | Preferences shall remain local and shall not require an account. | Must | Close/reopen restores supported preferences locally. | PR-025 |
| UXA-019 | The presentation shall use the approved 2D monochrome ink/notebook direction with a restrained warm torch accent while remaining WCAG-testable. | Must | UX/content/accessibility review passes. | PR-030 |
| UXA-020 | The application shall target WCAG 2.2 Level AA for the approved scope. | Must | Accessibility acceptance report has no open Must failure. | PR-024 |

#### Functional states

| State | Required behavior |
|---|---|
| Empty | Empty views explain the next legal action. |
| Loading | Loading status is perceivable visually and programmatically. |
| Success | Focus and announcements reflect the completed action. |
| Validation error | Error is associated with the relevant control and focus moves appropriately. |
| System error | Error is understandable without colour or transient animation. |
| Recovery | The user can return to a known context using keyboard and assistive technology. |
| Confirmation | Dialog receives focus, traps it appropriately, and restores focus on close. |

### 9.12 Content, Credits, Privacy, Free Access, and Release Boundary

**Goal:** Expose only authorised content and the approved free, private, English-only product boundary.

#### Requirements

| ID | Requirement | Priority | Acceptance criteria | Dependencies |
|---|---|---:|---|---|
| CNT-001 | The application shall load only bundled content definitions approved for the applicable build. | Must | Build validation rejects unknown, blocked, or unapproved content. | PR-028 |
| CNT-002 | Bundled content shall retain source, rights/licence or permission, approval status, attribution requirement, and version/review metadata outside or alongside runtime definitions. | Must | Item-level inventory covers every bundled item. | PR-028 |
| CNT-003 | Application copy shall use original concise wording and paraphrase by default. | Must | Content review finds no unapproved source-prose reproduction. | PR-029 |
| CNT-004 | Exact source prose or artwork shall appear only when item-specific digital-use permission is recorded. | Must | Release gate blocks unauthorised items. | PR-029 |
| CNT-005 | The original logo, page layout, character-sheet design, trade dress, and unknown-rights artwork shall remain excluded unless separately approved. | Must | Visual/content audit passes. | PR-028 to 030 |
| CNT-006 | About/Credits shall include creator, title, licence or permission, third-party dependency, asset, and unofficial-product notices as required. | Must | Credits inventory and rendered page agree. | PR-028, APP-014 |
| CNT-007 | The public Core MVP shall be English-only. | Must | No incomplete localisation selector or translated release content appears. | PR-029 |
| CNT-008 | The complete Core MVP shall be usable without payment, subscription, advertising, donation requirement, or paid unlock. | Must | Public release completes core loop free of charge. | PR-027 |
| CNT-009 | The application shall not transmit private play data, names, notes, history, Graveyard detail, saves, or exports by default. | Must | Network and privacy review passes. | PR-025 |
| CNT-010 | Production telemetry shall remain disabled unless separately approved. | Must | Release contains no analytics identifiers or requests. | PR-026 |
| CNT-011 | A voluntary feedback link or form may be provided without automatically attaching save data. | Should | Opening feedback sends no save or private context automatically. | RD-OPS-005 |
| CNT-012 | Expanded World, multiplayer, crafting, tactical combat, localisation, cloud accounts, generated narrative, and other Won't systems shall not be exposed. | Must | Release scope audit passes. | PR-034 |
| CNT-013 | Placeholder art may be used through Palace validation when it is rights-safe and clearly replaceable. | Must | Prototype content inventory records placeholder status. | [Decision Register v0.2](digital-adaptation-decision-register-v0.2.md) |
| CNT-014 | Final replacement-art production and inclusion shall follow Palace go approval and item-level rights review. | Must | Public release gate confirms approval and provenance. | PR-031, PR-028 |

#### Functional states

| State | Required behavior |
|---|---|
| Empty | Missing required approved content blocks the affected build or feature rather than substituting silently. |
| Loading | Content validation completes before the affected action becomes playable. |
| Success | Approved content and credits are available. |
| Validation error | The application or build identifies the invalid definition without mutating play state. |
| System error | Prior valid content/state remains available where safe. |
| Recovery | Restore the prior approved content artifact or block the incompatible save safely. |
| Confirmation | Feedback or diagnostic export previews any included information. |

## 10. Cross-Feature Behavior

### 10.1 Save behavior

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---:|---|
| XFR-SAVE-001 | Every meaningful state-changing action shall either commit complete state and history atomically or leave the prior valid state intact. | Must | Fault-injection matrix finds no partial committed state. |
| XFR-SAVE-002 | The system shall communicate saving, saved, failed, recovery-available, migrating, incompatible, and offline-ready states truthfully. | Must | UI/state tests match actual persistence condition. |
| XFR-SAVE-003 | User navigation shall not discard an unresolved capacity, target, confirmation, or validation decision. | Must | Navigation is blocked or the decision is explicitly cancelled without mutation. |
| XFR-SAVE-004 | Committed outcomes shall remain immutable across reload, update, export/import, and rollback. | Must | Deterministic resume matrix passes. |
| XFR-SAVE-005 | Save failure during an unsafe transition shall block further mutation until retry, recovery, or explicit safe exit. | Must | Failure scenarios cannot continue from an unpersisted final state. |

### 10.2 Linked-object behavior

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---:|---|
| XFR-LINK-001 | Adventurer, dungeon, expedition, segment, encounter, monster, item, corpse/belongings, Graveyard, event, and content-definition references shall remain consistent after every transfer and transition. | Must | Referential-invariant tests pass. |
| XFR-LINK-002 | Moving an item between backpack, equipment, segment drop, corpse/belongings, sale, consumption, and destruction shall update one authoritative location only. | Must | No duplicate or orphan item instance appears. |
| XFR-LINK-003 | Completing a dungeon shall update boss, reward, dungeon status, history summary, and available actions as one committing transition. | Must | Completion integration test passes. |
| XFR-LINK-004 | Adventurer death shall update active adventurer, Graveyard, belongings, encounter/segment, and available actions as one committing transition. | Must | Death integration test passes. |
| XFR-LINK-005 | Reset or import replacement shall affect only the confirmed slot and all objects owned by that slot. | Must | Other slots remain unchanged. |

### 10.3 Manual correction and override

- Manual physical-dice entry may be supported only as an explicit recorded mode.
- The public canonical mode shall not permit editing committed mechanical events, rerolling committed outcomes, changing graph truth, or silently altering HP/items/resources.
- Player notes may be editable only as records separate from immutable mechanics.
- House-rule presets and unsupported balance overrides are excluded.
- A development/test build may use fixtures or seeds outside the public interface, provided production output remains canonical and the test mode cannot contaminate public saves.

### 10.4 Responsive behavior

- Core workflows shall be usable at 360, 390, 768, 1024, 1280, and 1440 CSS pixels.
- No required action shall depend on hover alone.
- Modals, drawers, forms, maps, history, inventory, and combat controls shall remain operable on small screens.
- Reflow may change placement but shall not remove required state or action access.
- Touch targets and scrolling behavior shall be specified and tested in the UX and NFR documents.

### 10.5 Accessibility behavior

- Inputs have labels and errors are associated with the relevant controls.
- Keyboard order follows visual and task order.
- Focus is managed for dialogs, route/context changes, errors, and destructive confirmations.
- Status is not communicated by colour alone.
- Dynamic result updates are announced where appropriate.
- Visual and textual map routes provide equivalent required actions.
- Reduced-motion and text-scaling behavior apply across the complete core journey.
- Accessibility behavior is validated against the approved browser and assistive-technology matrix.

### 10.6 Privacy behavior

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---:|---|
| XFR-PRIV-001 | Private play data shall remain local unless the player explicitly exports or submits selected information. | Must | Network inspection shows no default transmission. |
| XFR-PRIV-002 | Error messages and diagnostic records shall avoid names, notes, full event text, Graveyard detail, and save contents by default. | Must | Privacy review passes. |
| XFR-PRIV-003 | Voluntary feedback shall not attach local saves or identifiers automatically. | Must | Feedback link/form opens without data attachment. |

## 11. Error and Recovery Behavior

| ID | Scenario | Required behavior | User data impact |
|---|---|---|---|
| ERR-001 | Save commit fails | Show failure, retain prior valid state, block unsafe continuation, and offer retry or recovery where applicable. | No silent loss or false success |
| ERR-002 | Stored active state is invalid | Isolate the slot, preserve raw/recoverable data, show last-valid availability, and leave other slots usable. | Affected slot unavailable until recovery |
| ERR-003 | Last-valid snapshot is invalid | Preserve both records, explain that automatic recovery is unavailable, and allow privacy-safe export where feasible. | No silent reset |
| ERR-004 | Import package is malformed | Reject before mutation and show validation reason. | Existing slots unchanged |
| ERR-005 | Import package uses unsupported newer schema | Reject before mutation and preserve package/current slots unchanged. | None |
| ERR-006 | Migration step fails | Stop, preserve original and pre-migration snapshot, and show recovery options. | No destructive partial migration |
| ERR-007 | Required content definition is missing or invalid | Block affected creation/resolution before state mutation and identify the stable definition/reference. | Prior valid state retained |
| ERR-008 | Deterministic generation violates invariant | Do not commit the invalid graph; record privacy-safe diagnostic context and preserve prior graph. | No invalid dungeon committed |
| ERR-009 | Storage quota or browser write is denied | Show truthful failure and backup guidance; do not claim the action completed. | Prior valid state retained |
| ERR-010 | Service-worker update is ready during play | Defer activation until safe save point and reload. | None |
| ERR-011 | Current application cannot read a save version | Explain incompatibility and preserve the save unchanged. | Save remains intact but unavailable |
| ERR-012 | User cancels a destructive action | Apply no mutation and return focus to the invoking control. | None |
| ERR-013 | Duplicate action submission occurs | Accept at most one committing action and suppress duplicate mutation/event. | One valid outcome |
| ERR-014 | History view fails | Keep gameplay state usable, show history error, and allow retry without creating events. | No mechanical impact |
| ERR-015 | Visual map fails to render | Preserve textual map and legal action access where possible; show the visual-map error. | No mechanical impact |
| ERR-016 | Optional feedback or diagnostic creation fails | Show failure without affecting saves or gameplay. | None |

## 12. MVP / Release Exclusions

The following are explicitly excluded:

- Multiplayer, cooperative play, shared campaigns, public leaderboards, or competitive validation.
- Accounts, cloud backup, cloud sync, mandatory login, or server-authoritative saves.
- Expanded World and all other separately scoped supplements.
- Crafting, tactical grid combat, spatial enemy movement, detailed town exploration, campaign maps, factions, settlements, kingdoms, or quests.
- 3D dungeon presentation or real-time torch simulation.
- Free canonical rerolls, point-buy creation, mandatory balance correction, or baseline house-rule presets.
- AI-authored narrative, rules, rewards, or mechanical consequences.
- Localisation or translated Core MVP releases.
- Payment, subscriptions, advertising, paid access, or paid core content.
- Unapproved official rules prose, artwork, logo, page layout, character-sheet design, or trade dress.
- Production analytics or telemetry without a new approved decision and privacy review.
- Public editing of mechanical history, graph truth, committed outcomes, death facts, or completion facts.
- Automatic attachment or upload of saves in feedback or diagnostics.

## 13. Traceability Matrix

| Functional requirements | Business / product requirements | Primary DRS impact | Downstream targets | Acceptance evidence |
|---|---|---|---|---|
| PERM-001 to 005 | BR-009, BR-014, BR-016; PR-002, 019, 025, 027 | DRS-VAL | UX, NFR, test plan | AT-PERM |
| APP-001 to 014 | BR-008 to 011, BR-014 to 017; PR-001, 015 to 019, 023 to 029, 032 | DRS-VAL, DRS-HIST | UX, data, NFR, architecture | AT-APP |
| ADV-001 to 016 | BR-001 to 005, BR-010; PR-001, 004 to 006, 012, 014, 017, 020 | DRS-DICE, DRS-ADV, DRS-VAL | Data model, UX, tests | AT-ADV |
| DUN-001 to 019 | BR-003, BR-006, BR-010, BR-012, BR-022; PR-003, 007 to 009, 013, 020, 023, 024, 031 | DRS-DUN, DRS-DICE, DRS-PER | Data, architecture, UX, simulation | AT-DUN |
| EXP-001 to 021 | BR-005 to 007, BR-010; PR-005, 006, 008, 010, 020 to 024 | DRS-DOOR, DRS-EXP, DRS-IR | UX, tests | AT-EXP |
| CMB-001 to 023 | BR-001, BR-002, BR-005, BR-013, BR-021; PR-005, 006, 011, 017, 020 to 024, 033 | DRS-CMB, DRS-SPELL, DRS-ITEM, DRS-IR | UX, data, tests | AT-CMB |
| INV-001 to 023 | BR-001, BR-005, BR-007, BR-010, BR-013; PR-006, 012 to 014, 017, 020 to 024 | DRS-ITEM, DRS-SPELL, DRS-CMB, DRS-PER | Data, UX, tests | AT-INV |
| TWN-001 to 016 | BR-001, BR-005, BR-007, BR-010, BR-013; PR-006, 013, 017, 020, 021 | DRS-PER, DRS-ITEM, DRS-SPELL | Data, UX, tests | AT-TWN |
| DTH-001 to 015 | BR-001, BR-010, BR-013, BR-019; PR-014, 017, 021, 022, 025 | DRS-PER, DRS-HIST | Data, UX, tests | AT-DTH |
| SAV-001 to 024 | BR-009 to 011, BR-016, BR-019; PR-015 to 022, 025, 026, 032 | DRS-DICE, DRS-VAL, DRS-HIST | Data, NFR, architecture, tests | AT-SAV |
| HIS-001 to 015 | BR-005, BR-016, BR-019; PR-005, 020 to 022, 025, 026 | DRS-HIST, DRS-DICE | Data, UX, privacy/NFR, tests | AT-HIS |
| UXA-001 to 020 | BR-007, BR-008, BR-017, BR-021; PR-006, 007, 023, 024, 030, 033 | UI-independent; DRS action/state IDs | UX, accessibility, NFR, tests | AT-UXA |
| CNT-001 to 014 | BR-003, BR-014 to 016, BR-020, BR-022; PR-003, 025 to 031, 034 | Content IDs and approved prose boundary | Content/licensing, UX, operations | AT-CNT |
| XFR-SAVE / LINK / PRIV | BR-010, BR-011, BR-016, BR-019; PR-016 to 026, 032 | DRS-DICE, DRS-VAL, DRS-HIST, DRS-PER | Data, NFR, architecture, tests | AT-XFR |
| ERR-001 to 016 | BR-004, BR-010, BR-011, BR-016, BR-017; PR-006, 017 to 026, 032 | DRS-VAL | UX, NFR, test plan | AT-ERR |

Every detailed downstream requirement and acceptance test should cite the applicable FRD ID and, for mechanics, one or more specific `DRS-*` IDs.

## 14. Acceptance Criteria Summary

- [ ] Every Must functional requirement has a testable acceptance criterion.
- [ ] The Palace subset covers adventurer creation, Palace generation, map, doors, traps, light, combat, inventory, retreat, town, re-entry, death, recovery, Graveyard, persistence, export/import, responsive behavior, keyboard use, and textual map.
- [ ] The full Core MVP scope extends the shared functional behavior to all six approved dungeon types.
- [ ] Happy paths, validation, errors, cancellation, confirmation, and recovery states are defined.
- [ ] All mechanical behavior delegates formulas, timing, probabilities, and transitions to the approved [Digital Rules Specification](digital-rules-specification-v0.1.md).
- [ ] All 24 approved DRS interpretive rulings are represented where they affect observable behavior.
- [ ] Cross-feature persistence, deterministic randomness, linked-object behavior, and event history are unambiguous.
- [ ] Three named slots, atomic autosave, last-valid snapshots, sequential migration, export/import, safe update, and rollback-facing behavior are included.
- [ ] Visual and textual map actions are functionally equivalent.
- [ ] Browser, viewport, keyboard, NVDA, VoiceOver, TalkBack, text scaling, reduced motion, and WCAG expectations are included.
- [ ] Content-bearing behavior includes provenance, approval, attribution, English-only, and release constraints.
- [ ] Privacy behavior excludes default transmission and unapproved analytics.
- [ ] Free access and no-monetisation behavior is explicit.
- [ ] No blocked, unapproved, Expanded World, or Won't behavior is required.
- [ ] Requirement ranges are traceable to BRD, PRD, DRS, and downstream acceptance evidence.
- [ ] Product Owner, Technical Lead, Rules Designer, UX Lead, QA Lead, Content/Licensing Reviewer, Accessibility Reviewer, and Operations Owner review their applicable sections.

## 15. Open Questions

No unresolved product or rules decision blocks FRD review. The following implementation-detail decisions remain for downstream specifications and shall not change the observable requirements without an approved amendment.

| ID | Question | Owner | Decision point | Status |
|---|---|---|---|---|
| OQ-FRD-001 | What exact entities, fields, references, event schema, export package, and migration records implement these behaviors? | Technical Lead / Data Modeller | Data / Domain Model approval | Open; downstream |
| OQ-FRD-002 | What exact route structure, responsive composition, panel behavior, and interaction hierarchy implement each feature state? | UX Lead | UX Flow / Wireframes approval | Open; downstream |
| OQ-FRD-003 | What exact textual-map command, focus, announcement, and verbosity model achieves full action equivalence? | UX / Accessibility Reviewer | UX and accessibility approval | Open; downstream |
| OQ-FRD-004 | Which frontend, state-management, deterministic RNG, IndexedDB, and service-worker implementations satisfy the requirements? | Technical Lead | Architecture and NFR approval | Open; downstream |
| OQ-FRD-005 | What performance, storage, reliability, security, offline, update, and monitoring thresholds apply? | Technical / Operations / QA | NFR approval | Open; downstream |
| OQ-FRD-006 | Which exact content and artwork items are approved, replaced, or excluded in Palace and public builds? | Content / Licensing Reviewer | Content inventory gates | In progress |
| OQ-FRD-007 | What complete test cases, fixtures, seed sets, fault injections, browser/device coverage, and evidence format approve Palace and Core MVP? | QA Lead | [Acceptance Criteria / Test Plan](acceptance-criteria-test-plan-v0.1.md) approval | Open; downstream |
| OQ-FRD-008 | Who participates in Palace playtests and how is voluntary feedback recorded and summarised? | Product / UX | Before Palace playtest | Open; downstream |
| OQ-FRD-009 | Which hosting provider, budget, monitoring mechanism, maintenance owner, and operational rollback procedure are selected? | Product / Operations | Before public release gate | Direction approved; details pending |

## 16. Approval

| Role | Name | Decision | Date | Notes |
|---|---|---|---|---|
| Product Owner |  | Pending / Approved / Rejected |  |  |
| Technical Lead |  | Pending / Approved / Rejected |  |  |
| Rules / Product Designer |  | Pending / Approved / Rejected |  |  |
| UX Lead |  | Pending / Approved / Rejected |  |  |
| QA Lead |  | Pending / Approved / Rejected |  |  |
| Accessibility Reviewer |  | Pending / Approved / Rejected |  |  |
| Content / Licensing Reviewer |  | Pending / Approved / Rejected |  |  |
| Operations Owner |  | Pending / Approved / Rejected |  |  |
