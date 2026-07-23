# Rules Extraction Taxonomy

## Generic Game Adaptation Process

*Version 0.1 | Template and process | Prepared for reuse across rules-first game adaptation projects*

| Field | Value |
|---|---|
| Template owner | Product Owner / Rules Designer |
| Process scope | Extracting source-game rules into implementation-ready domains, state, actions, data, tests, and review evidence |
| Related documents | Product-Agnostic Game Adaptation Process v0.1; Product Profile Template v0.1; Source Material Intake and Rights Matrix v0.1; Backlog Generation Playbook v0.1; Agent Task Template Standard v0.1 |
| Primary audience | Product owner, rules designer, technical lead, data modeller, UX designer, QA lead, content reviewer, and implementation agents |
| Status | Draft template |
| Last updated | 2026-07-23 |

---

## Contents

1. Purpose
2. When to Use This Taxonomy
3. Inputs and Outputs
4. Extraction Principles
5. Roles and Responsibilities
6. Identifier Standard
7. Taxonomy Overview
8. Extraction Register Template
9. Rules Domain Reference
10. State and Transition Model
11. Randomness and Tables
12. Exceptions and Edge Cases
13. UX and Explainability Requirements
14. Test and Fixture Requirements
15. Traceability Rules
16. Review Gates
17. Generic Example Rows
18. Acceptance Criteria
19. Approval

---

## 1. Purpose

This document defines a reusable taxonomy for turning tabletop, solo, board, procedural, or rulebook-driven games into software-ready rules specifications.

The taxonomy exists to ensure that each extracted rule is:

- tied to an authoritative source;
- classified by the kind of behaviour it controls;
- separated from protected prose, art, layout, and branding;
- represented as explicit state, input, action, random result, transition, or output;
- testable with deterministic examples;
- traceable to data, UX, content, backlog, and verification artifacts; and
- safe for implementation agents to work on without reinterpreting the source game.

The taxonomy is product-agnostic. Each product profile supplies the source title, edition, rules domains, release scope, rights policy, and implementation stack.

---

## 2. When to Use This Taxonomy

Use this taxonomy before writing or approving:

- a Digital Rules Specification;
- a rules engine architecture;
- content table manifests;
- deterministic simulation tests;
- issue bodies for rules-heavy implementation work;
- UI flows that expose rule state or legal actions;
- save, import, export, migration, or replay models;
- agent prompts for rules implementation; or
- acceptance criteria that depend on source-game mechanics.

Use it again whenever the project adds a supplement, edition, mode, variant, localization, or house ruling.

---

## 3. Inputs and Outputs

### 3.1 Required inputs

| Input | Purpose |
|---|---|
| Product profile | Supplies product name, edition, release mode, vocabulary, and branch/workflow conventions |
| Source material register | Lists all source rulebooks, sheets, tables, supplements, prototypes, and external references |
| Rights matrix | Defines which source-derived mechanics, tables, names, prose, assets, and layouts are approved |
| Decision register | Records adaptation rulings where the source is ambiguous, unsuitable for software, or intentionally scoped |
| Product scope | Defines which rules domains are in or out of the release |
| Data model draft | Supplies known entity, identity, ownership, and persistence boundaries if already available |
| UX draft | Supplies known interaction and state-presentation constraints if already available |

### 3.2 Required outputs

| Output | Purpose |
|---|---|
| Rules extraction register | Item-level list of rules, tables, domains, and implementation disposition |
| Rules domain map | Groups extracted items into coherent implementation modules |
| State transition model | Defines legal actions, preconditions, outcomes, persistence, and invalid states |
| Randomness model | Defines dice, card, table, seed, shuffle, draw, reroll, and replay requirements |
| Deterministic fixtures | Provides examples that can be used in automated tests and review evidence |
| Open questions register | Captures unresolved source ambiguity and adaptation decisions |
| Backlog input | Supplies epic/story candidates, dependencies, acceptance criteria, and verification needs |

---

## 4. Extraction Principles

| ID | Principle | Meaning |
|---|---|---|
| RXT-001 | Source first | Start from the authoritative source and approved decisions, not memory or prior projects |
| RXT-002 | Mechanics are not prose | Extract behaviour and data without copying unapproved expressive text |
| RXT-003 | State must be explicit | If the software must remember it, validate it, migrate it, display it, or test it, model it directly |
| RXT-004 | Every action has a lifecycle | Legal action, cost, roll, result, state change, persistence, and explanation must be known |
| RXT-005 | Randomness is a contract | Random draws, rolls, shuffles, seeds, and rerolls must be reproducible where the product requires it |
| RXT-006 | Edge cases are rules | Death, failure, exhaustion, invalid input, resource limits, interruption, and recovery are first-class rules |
| RXT-007 | UI cannot hide rules | The user must see or inspect required costs, legal options, rolls, modifiers, and consequences |
| RXT-008 | Tests anchor interpretation | Fixture examples should prove both ordinary flow and boundary behaviour |
| RXT-009 | Unknown means blocked | Ambiguous or unapproved rules remain open questions, not implementation assumptions |
| RXT-010 | Product terms are profile data | Generic process docs must not hard-code one game's vocabulary |

---

## 5. Roles and Responsibilities

| Role | Responsibilities |
|---|---|
| Product Owner | Approves scope, release inclusion, deferred domains, and adaptation tradeoffs |
| Rules Designer | Extracts mechanics, resolves source ambiguities, defines legal actions, and owns rules intent |
| Technical Lead | Maps rules into architecture, data structures, services, deterministic execution, and versioning |
| Data Modeller | Defines durable entities, identities, ownership, relationships, migrations, and validation |
| UX Designer | Defines how legal options, state, warnings, and outcomes are represented to users |
| QA Lead | Converts extraction rows into fixtures, simulations, acceptance criteria, and regression tests |
| Content / Licensing Reviewer | Confirms extracted items are permitted by the rights matrix and blocks unapproved expression |
| Implementation Agent | Implements only approved, self-contained, testable rules scope from issues and prompts |

---

## 6. Identifier Standard

Use stable identifiers so rules can be traced across documents, code, fixtures, issues, and PRs.

| Prefix | Item type | Example pattern |
|---|---|---|
| SRC | Source material | SRC-CORE-001 |
| RUL | Rule or procedure | RUL-EXPLORE-001 |
| ACT | Player or system action | ACT-COMBAT-ATTACK |
| STA | State field or aggregate | STA-CHAR-HP |
| TBL | Source or derived table | TBL-CHAR-RACE |
| RNG | Random process | RNG-DUNGEON-DOOR |
| EVT | Event or history entry | EVT-COMBAT-DAMAGE |
| FX | Effect, modifier, trait, or ability | FX-ITEM-HEALING |
| GATE | Review or release gate | GATE-RULES-PROTOTYPE |
| FIX | Test fixture or seed case | FIX-COMBAT-001 |
| OQ | Open question | OQ-RULES-001 |

Identifier rules:

- Do not reuse identifiers after deletion.
- Keep the prefix stable even if implementation modules change.
- Include the identifier in issue bodies when work depends on it.
- Include the identifier in test names or fixture metadata when practical.
- Keep source page, section, or evidence references in registers, not in code comments unless needed for maintainability.

---

## 7. Taxonomy Overview

| Category | Extract when the source defines | Software representation |
|---|---|---|
| Actor or role | Player, character, enemy, party, faction, referee, system, or environment participant | Entity type, owner, permissions, action set |
| Character or unit state | Attributes, resources, wounds, inventory, status, level, skills, abilities | State schema, validation, display model |
| Location or board state | Rooms, map, tiles, zones, paths, floors, regions, adjacency, fog, discovery | Graph, grid, region model, revealed state |
| Time or turn order | Rounds, phases, watches, actions, initiative, upkeep, cooldowns | Scheduler, phase machine, action queue |
| Action | Player choice, system trigger, optional response, forced event | Command, precondition, cost, transition |
| Procedure | Ordered source rule with multiple steps | Use case, state machine, service function |
| Randomizer | Dice, cards, tables, token draws, shuffled decks, weighted choices | RNG stream, draw function, table resolver |
| Table or lookup | Outcome keyed by roll, card, state, terrain, enemy, or context | Data manifest, table schema, resolver |
| Modifier or effect | Bonus, penalty, trait, ability, item effect, status effect | Effect model, stacking rules, duration |
| Conflict resolution | Combat, checks, tests, saves, hazards, negotiation, contests | Resolution algorithm and fixture suite |
| Economy or exchange | Coins, resources, markets, upkeep, prices, conversions | Transaction model and validation |
| Persistence rule | Save, resume, legacy state, death records, campaign history | Storage contract, migration, event log |
| Termination state | Victory, death, loss, completion, retreat, abandonment | End-state model, cleanup, rewards |
| Exception | Tie, impossible action, exhausted table, invalid state, missing data | Guard, error, recovery, review question |
| Presentation rule | Information that must be shown, hidden, delayed, explained, or announced | UX requirement, accessibility note |

---

## 8. Extraction Register Template

Create one row for each extracted rule, table, procedure, action, state aggregate, or unresolved rules item.

| Field | Required | Notes |
|---|---|---|
| ID | Yes | Stable identifier using the standard above |
| Product domain | Yes | Example domains: character, exploration, combat, inventory, town, persistence |
| Source reference | Yes | Source ID plus page, section, table, sheet, or evidence pointer |
| Rights matrix reference | Yes | Required when source terms, tables, prose, or assets are involved |
| Source item type | Yes | Rule, procedure, table, term, example, art, layout, sheet, card, variant |
| Extracted behaviour | Yes | Concise behaviour description in project-original wording |
| Inputs | Yes | State, user choices, random values, context, external data |
| Preconditions | Yes | Legal state before the rule may run |
| Randomness | If applicable | Dice, table, deck, seed, stream, or no randomness |
| Outputs | Yes | Results, events, user-facing messages, generated data |
| State changes | Yes | Durable and transient fields affected |
| Persistence requirement | Yes | None, session, save slot, history, export, migration |
| UX requirement | If applicable | Visible state, legal actions, warning, explanation, accessibility |
| Test requirement | Yes | Unit, fixture, simulation, property, UI, migration, manual |
| Open questions | If any | Link to OQ IDs; do not hide uncertainty |
| Implementation disposition | Yes | Approved, blocked, deferred, human-gated, agent-ready |
| Notes | Optional | Keep notes concise and avoid source prose copying |

---

## 9. Rules Domain Reference

### 9.1 Actors and ownership

Extract:

- who or what can act;
- who owns each state object;
- what the system controls automatically;
- what the user may choose;
- when hidden state becomes visible;
- whether multiple actors may affect the same object; and
- what happens when an actor is removed, defeated, retired, or completed.

Implementation questions:

- Does the actor need a durable ID?
- Can the actor be renamed?
- Can the actor move between containers, locations, saves, campaigns, or users?
- Is actor history retained after death, deletion, or completion?

### 9.2 Stats, resources, and counters

Extract:

- maximum, minimum, default, and starting values;
- costs and recovery;
- overflow, underflow, exhaustion, and caps;
- temporary versus permanent values;
- modifiers and stacking;
- UI warnings; and
- persistence and migration requirements.

Common pitfalls:

- assuming a resource cannot go below zero when the source never says that;
- forgetting whether a cost is paid before or after a result;
- collapsing temporary and permanent changes into one field;
- losing source-required history after recovery; and
- failing to display a resource before asking the user to spend it.

### 9.3 Actions and procedures

For every action, extract:

| Action field | Required question |
|---|---|
| Actor | Who initiates it? |
| Availability | When is it legal? |
| Cost | What is paid or consumed? |
| Input | What does the user choose? |
| Randomness | What is rolled, drawn, shuffled, or looked up? |
| Resolution | What ordered steps happen? |
| Result | What visible outcome occurs? |
| State change | What changes permanently or temporarily? |
| Event history | What must be recorded? |
| Failure | What happens if the action is illegal, interrupted, or impossible? |
| Repeatability | Can it be repeated immediately, later, once, or never? |

### 9.4 Tables and structured content

For every table, extract:

- table identity and source reference;
- roll or lookup key;
- range coverage and gaps;
- weighted outcomes;
- nested table calls;
- side effects;
- source terms that require rights review;
- whether values can be stored as data;
- whether player-facing text must be paraphrased; and
- deterministic fixture cases for low, middle, high, boundary, and nested outcomes.

### 9.5 State transitions

For every transition, define:

- prior state;
- triggering action or event;
- validation and preconditions;
- random values consumed;
- transition result;
- events written;
- new state;
- rollback or recovery expectations; and
- user-facing explanation.

If a source rule is conversational or prose-led, the digital adaptation must still define a finite set of software states and transitions before implementation begins.

### 9.6 Persistence, recovery, and versioning

Extract persistence rules for:

- active session state;
- durable saves;
- autosave timing;
- export and import;
- undo, redo, or replay if supported;
- event history;
- migration;
- deleted, dead, completed, retired, abandoned, or archived entities;
- corrupted, partial, incompatible, or future-version data; and
- rules/content version pinning.

Rules that affect persistence must be reviewed by both the rules owner and the technical owner.

### 9.7 User-authored content

Separate source content from user-authored content.

Examples of user-authored content include:

- character names;
- notes;
- annotations;
- custom labels;
- imported saves;
- campaign logs;
- house rules; and
- optional diagnostic attachments.

User-authored content should not be used to justify bundling source content, and bundled source content should not be mixed into private user records without a clear reason.

---

## 10. State and Transition Model

A rule is implementation-ready only when these questions have concrete answers:

| Question | Required answer |
|---|---|
| What state exists before the rule? | Entity and field names, ownership, and validation |
| What triggers the rule? | User action, system event, random result, timer, phase, or import |
| What conditions make it legal? | Preconditions and blocked states |
| What random values are consumed? | Stream, roll, draw, table, and persistence timing |
| What state changes? | Every durable and transient change |
| What event is recorded? | Event type, payload, privacy class, and retention |
| What does the user see? | Summary, details, warnings, and accessibility announcement |
| What can go wrong? | Invalid input, missing data, conflict, interruption, or unsupported version |
| What proves correctness? | Fixture, unit test, simulation, UI test, or manual test |

Use a transition table for each rules domain before creating implementation issues.

| From state | Trigger | Preconditions | Randomness | To state | Event | Test |
|---|---|---|---|---|---|---|
| Pending action | User confirms action | Required resource is available | None or listed stream | Resolved action | EVT-domain-result | FIX-domain-001 |

---

## 11. Randomness and Tables

Randomness must be modelled explicitly.

Record:

- dice notation or draw type;
- number and order of random values consumed;
- stream or generator ownership;
- seed persistence;
- reroll and advantage/disadvantage rules;
- nested table behaviour;
- whether the resolved result or RNG state is persisted before display;
- replay expectations;
- boundary outcomes;
- table exhaustion or reshuffle behaviour;
- weighted probabilities; and
- simulation volume if termination, fairness, or reachability must be proven.

A random table is not implementation-ready until the full outcome range is covered by tests or fixtures.

---

## 12. Exceptions and Edge Cases

Create extraction rows for edge cases rather than leaving them as notes.

Common edge-case classes:

| Edge case | Examples of required handling |
|---|---|
| Invalid action | Action hidden, disabled, rejected, or explained |
| Resource exhaustion | No cost available, forced failure, alternative action, death, or wait state |
| Boundary result | Lowest roll, highest roll, tie, empty deck, max capacity, zero HP |
| Interrupted persistence | Write failed, quota exceeded, tab closed, update available, import canceled |
| Ambiguous source wording | Open question and decision gate before implementation |
| Conflicting rules | Priority decision or source hierarchy |
| Generated impossible state | Recovery rule, validation failure, or algorithm change |
| Rights block | Replace, paraphrase, remove, or human-gate the item |
| Accessibility conflict | Equivalent non-visual path or blocked UX pattern |

---

## 13. UX and Explainability Requirements

Rules extraction must tell UX what must be visible or inspectable.

For each user-facing rule, decide:

- what state must be visible before the user chooses;
- what legal actions are available;
- what costs and risks must be clear;
- what random result must be shown;
- what explanation is necessary after resolution;
- what event history must retain;
- what warnings are required before destructive or irreversible choices;
- whether the rule needs textual map or non-visual equivalent support;
- whether animation or timing can be skipped; and
- whether exact source wording is allowed or project-original copy is required.

Do not treat UI copy as harmless. If the copy derives from source prose, it must follow the rights matrix.

---

## 14. Test and Fixture Requirements

Each rules domain should define:

| Test type | Use for |
|---|---|
| Unit test | Single effect, transition, table resolver, validation, or boundary case |
| Fixture test | Named deterministic case with fixed inputs and expected outputs |
| Simulation test | Large seed set, reachability, termination, pacing, or invariant checks |
| Property test | Broad invariants across generated states or random values |
| Migration test | Save schema and rules/content version changes |
| UI test | Legal actions, visible state, keyboard path, warning, or explanation |
| Manual review | Rights, ambiguous interpretation, player comprehension, or playtest pacing |

Minimum fixture set per rules domain:

- one ordinary success;
- one ordinary failure;
- one lowest-boundary result;
- one highest-boundary result;
- one illegal action;
- one persistence or recovery case if state is durable;
- one rights-sensitive content case if source terms or text are involved.

---

## 15. Traceability Rules

Every implementation-ready rule should trace to:

| Trace target | Required evidence |
|---|---|
| Product profile | Product, edition, release mode, scope |
| Source material | Source ID and location |
| Rights matrix | Approved disposition for source-derived material |
| Decision register | Adaptation ruling if source is ambiguous or changed |
| Rules spec | Canonical behaviour and state transition |
| Data model | State fields and persistence ownership |
| UX spec | Display, action, warning, explanation, accessibility |
| Backlog | Epic, story, task, dependency |
| Test plan | Fixture, test case, simulation, manual review |
| PR evidence | Files changed, checks run, review outcome |

Traceability does not require heavy tooling at first. A stable identifier in documents, issue bodies, fixtures, and PR summaries is enough to start.

---

## 16. Review Gates

| Gate | Required evidence |
|---|---|
| Extraction complete | All in-scope rules domains have extraction register rows or explicit deferrals |
| Rights safe | All source-derived rows have rights matrix references and approval states |
| Decision complete | Open questions blocking implementation are resolved or scoped out |
| Rules ready | Actions, state transitions, randomness, and exceptions are explicit |
| Data ready | Durable fields, ownership, migrations, and event history are known |
| UX ready | Legal actions, costs, outcomes, warnings, and accessibility needs are known |
| Test ready | Fixture and simulation requirements are defined |
| Agent ready | Issue scope is self-contained, bounded, and verifiable |
| Release ready | No blocked, unknown, or unreviewed rules/content is bundled |

---

## 17. Generic Example Rows

These examples are intentionally generic and do not copy any source game's protected expression.

| ID | Domain | Source item type | Extracted behaviour | Disposition |
|---|---|---|---|---|
| RUL-CHAR-001 | Character | Creation procedure | Create a new player character from approved starting tables and initial resources | Agent-ready after tables are approved |
| TBL-CHAR-001 | Character | Random table | Resolve a weighted starting trait from a bounded dice range | Rights review required for names and values |
| ACT-EXPLORE-001 | Exploration | Player action | Spend an exploration resource to reveal the next connected location | Agent-ready after transition fixture exists |
| RNG-COMBAT-001 | Combat | Random process | Consume a deterministic combat roll before resolving damage | Agent-ready after stream ownership is defined |
| OQ-RULES-001 | Rules | Ambiguity | Source does not define tie priority for a contested result | Human decision required |

---

## 18. Acceptance Criteria

This taxonomy is ready to use when:

- [ ] The product profile names the rules domains in scope.
- [ ] Source material and rights matrix references exist for all source-derived domains.
- [ ] Each in-scope rules domain has extraction register rows.
- [ ] Every action has actor, availability, cost, input, randomness, result, state change, event, failure, and repeatability fields.
- [ ] Every random table has full range coverage and boundary fixtures.
- [ ] Every durable state change has a persistence and migration position.
- [ ] Every user-facing rule has a UX and accessibility position.
- [ ] Every blocked, deferred, or ambiguous rule has an open question or explicit scope exclusion.
- [ ] Every agent-ready implementation issue can cite rule IDs, test requirements, and rights disposition.
- [ ] Reviewers can trace a PR from changed code back to rule IDs and acceptance criteria.

---

## 19. Approval

| Role | Name | Decision | Date | Notes |
|---|---|---|---|---|
| Product Owner |  | Pending / Approved / Rejected |  |  |
| Rules Designer |  | Pending / Approved / Rejected |  |  |
| Technical Lead |  | Pending / Approved / Rejected |  |  |
| QA Lead |  | Pending / Approved / Rejected |  |  |
| Content / Licensing Reviewer |  | Pending / Approved / Rejected |  |  |
