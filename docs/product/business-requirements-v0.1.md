# Business Requirements Document

## NoteQuest Web Application

*Version 0.1 | Draft | Prepared for the NoteQuest Project*

| Field | Value |
|---|---|
| Document owner | Product Owner |
| Product / release | NoteQuest Web Application — Core Release |
| Related documents | [Digital Adaptation Decision Register](digital-adaptation-decision-register.md); [Digital Adaptation Feasibility Study](digital-adaptation-feasibility-study.md); *NoteQuest* rulebook, first edition |
| Primary audience | Product owner, developer, UX designer, QA/tester, content/licensing reviewer, and project stakeholders |
| Status | Draft for review |
| Last updated | 2026-07-16 |

---

## Contents

1. Executive Summary
2. Business Context and Opportunity
3. Problem Statement
4. Business Objectives
5. Stakeholders and Target Users
6. Product Vision
7. Scope
8. Business Requirements
9. High-Level Capabilities
10. Success Measures
11. Assumptions
12. Dependencies
13. Constraints
14. Risks and Mitigations
15. Release Approach
16. Approval Criteria
17. Open Questions
18. Approval

---

## 1. Executive Summary

The NoteQuest project will create a free, web-first, fully responsive digital adaptation of the core *NoteQuest* solo dungeon-crawling game. The application will automate character creation, dice and table resolution, incremental dungeon generation, map tracking, combat, inventory, torch consumption, town actions, death, corpse recovery, and the Graveyard while preserving the source game’s meaningful decisions, lethality, procedural exploration, and persistent dungeon state.

The product addresses the friction inherent in manual solo play: consulting multiple random tables, drawing and maintaining a dungeon map, tracking resources and persistent state, applying edge-case rulings consistently, and preserving a dungeon across successive adventurers. The web application will make the complete core loop immediately playable without requiring a mandatory account or permanent network connection after the application is available locally.

The approved direction is a faithful full adaptation rather than a tabletop assistant or an expanded conventional roguelike. The initial release is single-player, contains the six core dungeon types and core rules, and excludes Expanded World material, multiplayer, crafting, tactical grid combat, campaign-world systems, account progression, live-service features, and generated narrative systems.

Written adaptation permission and permission to digitise the core tables and terminology have been recorded in the decision register. The application will be free to use. Content, artwork, fonts, audio, and third-party dependencies will remain subject to item-level provenance and rights review, and original publication trade dress will not be reproduced unless specifically authorised.

## 2. Business Context and Opportunity

### 2.1 Current situation

*NoteQuest* is a compact solo tabletop dungeon crawler built around dice-driven character generation, procedural dungeon tables, resource pressure from torches, simple turn-based combat, persistent dungeons, and recovery of equipment from fallen adventurers. The existing play experience depends on the player consulting tables, interpreting short rules, drawing the dungeon, recording changing state, and resolving ambiguities manually.

The feasibility study concluded that the core game is highly suitable for software because its systems consist primarily of discrete state changes, deterministic calculations, and structured random tables. The principal challenge is not technical feasibility but converting concise tabletop rules and edge cases into a complete, approved digital rules specification.

The decision register now provides approved baseline rulings for product scope, core mechanics, persistence, UX direction, licensing, accessibility, and release constraints. Where a recommendation was marked `no`, the comment in that row is the controlling resolution.

### 2.2 Opportunity

A faithful web adaptation can:

- Remove manual bookkeeping while preserving the original decisions and consequences.
- Make the game accessible to players who do not want to draw maps or maintain paper records.
- Provide consistent rule resolution and transparent dice outcomes.
- Preserve persistent dungeons, corpses, dropped equipment, and the Graveyard reliably across sessions.
- Reach desktop, tablet, and mobile users through one responsive browser-based product.
- Support offline-first play without requiring accounts or cloud infrastructure.
- Establish a stable data-driven foundation for approved future dungeon packs, challenge modes, accessibility improvements, or separately licensed expansions.

### 2.3 Why now

The project has reached the point where the source rules, technical feasibility, and formal product decisions are sufficiently understood to define business requirements. Creating the BRD now provides the business baseline needed before the Product Requirements Document, Digital Rules Specification, Functional Requirements, Data Model, UX Flow, Non-Functional Requirements, and Acceptance Criteria are completed.

## 3. Problem Statement

> Solo players who want to play NoteQuest digitally currently must reproduce the tabletop workflow manually, creating avoidable friction, inconsistent rule resolution, and risk of losing persistent dungeon and adventurer state.

### Evidence or observations

- The rulebook relies on repeated dice and table lookups for adventurers, dungeon segments, doors, traps, monsters, rewards, and bosses.
- The game expects the player to maintain a growing map and preserve changes between expeditions and replacement adventurers.
- Several rules require formal timing and edge-case rulings before they can be applied consistently by software.
- The feasibility study found the complete loop technically achievable but identified specification completeness, save integrity, map readability, combat repetition, and content repetition as the principal risks.

### Consequences of not addressing it

- The game remains inaccessible to players who want a complete browser-based experience rather than a paper workflow.
- Ad hoc implementation decisions may diverge from the approved source-faithful baseline.
- Persistent dungeon, corpse, inventory, and Graveyard data may be handled inconsistently or lost.
- Scope may expand into a generic roguelike before the original game loop is validated.

## 4. Business Objectives

| ID | Objective | Business rationale | Priority |
|---|---|---|---|
| BO-001 | Deliver a complete source-faithful digital version of the core NoteQuest gameplay loop. | The product must provide a full game rather than a partial table roller or record-keeping utility. | Must |
| BO-002 | Reduce manual bookkeeping and rule-interpretation friction without removing meaningful player decisions. | Automation is the primary user value, but it must not replace the identity of the source game. | Must |
| BO-003 | Make the application available as a web-first, fully responsive experience. | A browser-based product lowers access barriers and supports desktop, tablet, and mobile from one delivery model. | Must |
| BO-004 | Preserve player data and persistent dungeon state through reliable offline-first saving. | Dungeons persist across expeditions and adventurers, making data integrity central to the product’s value. | Must |
| BO-005 | Release the application free to use while respecting all approved rights, attribution, and content-provenance obligations. | The approved release model is free usage, and rights compliance is required for public distribution. | Must |
| BO-006 | Validate that automated NoteQuest remains understandable, replayable, and engaging across repeated dungeon runs. | Automation makes play faster and may expose repetition or passive combat more quickly than tabletop play. | Should |
| BO-007 | Establish a maintainable, data-driven foundation without expanding the initial release beyond the approved core scope. | Stable content definitions and modular rule effects enable future work without compromising the first release. | Should |

## 5. Stakeholders and Target Users

### 5.1 Stakeholders

| Stakeholder | Interest / responsibility | Decision authority |
|---|---|---|
| Product Owner | Product vision, scope, prioritisation, business acceptance, and release decisions | Final authority for product scope and business acceptance |
| Rules / Product Designer | Digital Rules Specification, source fidelity, approved rulings, and gameplay interpretation | Approves rules definitions before implementation |
| Developer / Technical Lead | Architecture, implementation feasibility, persistence, web delivery, and technical quality | Approves technical approach within product constraints |
| UX/UI Designer | Responsive flows, map readability, action clarity, accessibility, and presentation | Approves UX design against requirements |
| QA / Tester | Rules verification, regression, persistence testing, simulations, and release evidence | Recommends release acceptance or rejection based on evidence |
| Content / Licensing Reviewer | Rights evidence, provenance, notices, artwork eligibility, and release compliance | May block content or release when rights evidence is insufficient |
| Players / Playtesters | Validate usability, comprehension, pacing, replayability, and practical value | Advisory; provides acceptance evidence |
| Hosting / Operations Owner | Web hosting, deployment, backups for application assets, availability, and operating cost | Approves operational readiness |

### 5.2 Target users

| User type | Priority | Primary need | Current workaround |
|---|---:|---|---|
| Existing NoteQuest and solo-tabletop players | Primary | A faithful complete adaptation that removes table lookup, map drawing, and bookkeeping | Play with the rulebook, physical dice, paper map, and handwritten records |
| Players interested in minimalist solo dungeon crawlers | Primary | A low-friction browser game with transparent rules, short sessions, and persistent consequences | Use other roguelikes or learn the tabletop game manually |
| Mobile and tablet players | Secondary | A fully responsive interface that preserves access to critical state and actions | Use desktop-oriented tools or paper play |
| Players with accessibility needs | Secondary | Keyboard support, readable state, non-colour indicators, reduced motion, and a textual map alternative | Adapt paper components or rely on generic assistive tools |
| Future expansion or challenge-mode players | Later | New approved dungeon packs, shared seeds, variants, or separately licensed content | Repeat the six core dungeons or use unofficial variants |

## 6. Product Vision

> Deliver a free, responsive, offline-capable web adaptation that makes the complete core NoteQuest game immediately playable while preserving every meaningful choice, risk, and persistent consequence of the source game.

### Product principles

| ID | Principle | Meaning |
|---|---|---|
| BP-001 | Source-faithful | Mechanics and interfaces implement approved NoteQuest rules and rulings without inventing unsupported gameplay outcomes. |
| BP-002 | Complete core loop | The product supports play from adventurer creation through exploration, combat, retreat, death or boss victory, town recovery, and continued play. |
| BP-003 | Web-first and responsive | The application is designed for browsers first and remains usable across supported desktop, tablet, and mobile viewports. |
| BP-004 | Transparent automation | Dice, table results, costs, modifiers, triggers, state changes, and consequences remain visible or inspectable. |
| BP-005 | Data safety | Saved adventurers, dungeons, inventories, corpses, dropped items, event history, and Graveyard records are treated as valuable data. |
| BP-006 | Offline-first privacy | Core play requires no mandatory account or persistent network connection, and private play data remains local by default. |
| BP-007 | Accessibility by design | Accessibility is considered in navigation, map representation, controls, feedback, and content from the start. |
| BP-008 | Free and rights-conscious | The application is free to use and includes only content and assets supported by documented rights and provenance. |
| BP-009 | Scope discipline | Major expansion systems remain excluded until the core release is accepted. |
| BP-010 | Data-driven extensibility | Rules content, tables, entities, and reusable effects are separated from application code where practical. |

## 7. Scope

### 7.1 In scope

- A single-player web application with full responsive support.
- Offline-first play with local saves and no mandatory account.
- Weighted 2d6 adventurer race and class generation, starting equipment, abilities, spells, HP, torches, and coins.
- The six core dungeon types and their approved character, dungeon, encounter, monster, boss, trap, item, spell, and reward content.
- Incremental procedural dungeon generation using a persistent graph and readable hybrid dungeon map.
- Guaranteed dungeon termination and boss access through approved floor-generation limits.
- Door, lock, trap, key, secret-passage, stealth, alert, torch, light-source, limb, and hand-use rules.
- Turn-based combat, monster traits, armour allocation and durability, spells, consumables, escape, loot, and boss resolution.
- Ten-item backpack rules, equipped items, keys, dropped-item persistence, inventory overflow choices, and corpse recovery.
- Town rest, spell restoration, armour repair, torch purchase, item sale, safe retreat, and re-entry.
- Persistent dungeons, expedition resets, monster healing, room repopulation, completed-dungeon state, and replacement adventurers.
- Character death, recoverable belongings, darkness-death handling, and the Graveyard.
- Seeded or reproducible random generation, transparent event history, and autosaving after meaningful actions.
- Accessible keyboard interaction, scalable and high-contrast presentation, reduced motion, non-colour status indicators, and a textual map alternative.
- Content provenance, required notices, rights records, and release gating.
- Free public use of the approved release.

### 7.2 Out of scope

- Multiplayer or cooperative play.
- Expanded World or other separately scoped supplements.
- Crafting, tactical grid combat, detailed town exploration, or a pre-generated campaign world.
- Custom character builders that replace the canonical generation rules.
- Account-wide progression, cloud accounts, online leaderboards, live-service systems, or mandatory server connectivity.
- AI-authored or procedurally authored narrative systems that create unsupported gameplay consequences.
- Monetisation, paid access, subscriptions, advertising, or commercial distribution in the approved core release.
- Localisation or translated public releases in the initial scope.
- Console release and controller-first navigation.
- Reproduction of the original logo, page layout, character-sheet trade dress, or other publication design without explicit authorisation.
- Unapproved artwork, audio, fonts, third-party assets, or source content.

### 7.3 Future considerations

- Separately approved dungeon and content packs.
- Expanded World integration after separate rights and scope approval.
- Optional house-rule or balance presets clearly separated from canonical play.
- Daily or shareable seeded dungeons and challenge modes.
- Localisation after rights and content approval.
- Optional cloud backup or synchronisation without making accounts mandatory.
- Additional accessibility modes and platform support.

## 8. Business Requirements

| ID | Requirement | Priority | Acceptance signal | Source objective |
|---|---|---:|---|---|
| BR-001 | The product shall provide a complete playable loop from adventurer creation through dungeon completion, town return, or character death and recovery. | Must | A player can complete the full end-to-end journey without external bookkeeping tools. | BO-001 |
| BR-002 | The product shall implement the approved core NoteQuest rules and digital rulings without silently inventing or changing mechanics. | Must | Every implemented mechanic traces to the rulebook or an approved decision-register / Digital Rules Specification entry. | BO-001 |
| BR-003 | The product shall include the six core dungeon types and approved core character, spell, item, monster, boss, trap, and reward content. | Must | The content inventory and functional test suite confirm all approved core content is available. | BO-001 |
| BR-004 | The product shall support single-player play without requiring a second participant, game master, or manual table interpretation. | Must | Primary users complete the core loop independently during acceptance testing. | BO-001 |
| BR-005 | The product shall automate dice rolls, table lookups, calculations, triggers, and state changes while making the inputs and results inspectable. | Must | The UI and event history expose relevant dice, source table, modifiers, costs, and final outcomes. | BO-002 |
| BR-006 | The product shall maintain a readable persistent dungeon map and show the player’s current position, connections, and relevant markers. | Must | Players can navigate generated dungeons and identify entrances, doors, stairs, occupied rooms, dropped items, and boss locations. | BO-002 |
| BR-007 | The product shall clearly present available actions, resource costs, warnings, and irreversible consequences before commitment where appropriate. | Must | Usability tests confirm players understand torch costs, alerting, damage, inventory overflow, limb loss, retreat limits, and death risks. | BO-002 |
| BR-008 | The product shall be delivered as a web application designed web-first with full responsive support. | Must | The agreed browser and viewport matrix passes the core journey without clipped or unavailable required controls. | BO-003 |
| BR-009 | The product shall support offline-first core play and shall not require a mandatory account or continuous server connection. | Must | After initial availability under the selected web delivery approach, the core game and existing saves remain usable under the agreed offline test conditions. | BO-003 |
| BR-010 | The product shall persist generated dungeon state, adventurer state, inventory, monsters, corpses, dropped items, Graveyard records, and completed outcomes. | Must | Save, close, reopen, and recovery tests restore equivalent required state. | BO-004 |
| BR-011 | The product shall autosave after meaningful state-changing actions and shall not display false success when persistence fails. | Must | Failure-injection and recovery tests show accurate save status and no silent data loss. | BO-004 |
| BR-012 | The product shall guarantee that every generated dungeon can reach a final boss room and terminate under approved generation rules. | Must | Large deterministic simulation suites produce no non-terminating dungeon. | BO-004 |
| BR-013 | The product shall preserve death, corpse or belongings, replacement-adventurer, room-repopulation, monster-healing, and equipment-recovery behavior across expeditions. | Must | Integration tests demonstrate the complete death-and-recovery loop across save/reload. | BO-001 |
| BR-014 | The product shall provide the core release free of charge and shall include no paid-access or monetisation mechanism. | Must | Public access does not require payment and the release contains no monetisation flow. | BO-005 |
| BR-015 | The product shall include only content and assets with documented source, rights or licence, approval status, and required attribution. | Must | The release content inventory contains no unknown, restricted, or unapproved item. | BO-005 |
| BR-016 | The product shall preserve user privacy by keeping personal play data local by default and avoiding hidden analytics or reuse of private records. | Must | Network, storage, and policy review confirm no undisclosed collection or external use of private save data. | BO-004 |
| BR-017 | The product shall meet the agreed accessibility baseline for keyboard use, labels, focus, scalable text, contrast, reduced motion, non-colour status, and textual map access. | Must | Accessibility review and acceptance testing pass the agreed support matrix. | BO-003 |
| BR-018 | The product shall use data-driven content definitions and reusable effect mechanisms where practical. | Should | New approved content can be added without duplicating core application logic or changing unrelated systems. | BO-007 |
| BR-019 | The product shall record sufficient event and random-result history to explain gameplay outcomes and support reproducible defect reports. | Should | Testers can reconstruct the inputs and rule version behind a saved outcome. | BO-002 |
| BR-020 | The project shall prevent unapproved major expansion systems from entering the core release. | Must | Release scope review confirms all excluded systems remain absent or separately approved. | BO-007 |
| BR-021 | The product should use presentation, pacing controls, cosmetic variation, and feedback to reduce perceived repetition without changing mechanical balance. | Should | Playtests show repeated combat and dungeon runs remain understandable and acceptable against agreed satisfaction targets. | BO-006 |
| BR-022 | The project shall validate the one-dungeon mechanical prototype before committing to full content and presentation production. | Must | Prototype acceptance confirms termination, saving, death/recovery, map readability, torch pressure, and core-loop value. | BO-006 |

## 9. High-Level Capabilities

| ID | Capability | Description | Business value | Release |
|---|---|---|---|---|
| CAP-001 | Adventurer generation and management | Generate and maintain race, class, HP, abilities, spells, equipment, torches, coins, limbs, and status. | Removes character-sheet setup and tracking friction. | Prototype / Core |
| CAP-002 | Procedural dungeon engine | Generate persistent dungeon segments, floors, connections, contents, bosses, and guaranteed termination. | Preserves replayable exploration while automating map creation. | Prototype / Core |
| CAP-003 | Interactive dungeon map | Present a responsive hybrid graph-and-room map with navigation and state markers. | Makes procedural state understandable across device sizes. | Prototype / Core |
| CAP-004 | Door and exploration resolution | Handle locks, traps, keys, breaking, stealth, secret passages, alerting, and torch costs. | Automates one of the game’s main decision loops. | Prototype / Core |
| CAP-005 | Torch, light, limb, and hand management | Track expedition light, alternative light sources, last-torch warnings, darkness death, and legal equipment configurations. | Preserves the game’s primary time and survival pressure. | Prototype / Core |
| CAP-006 | Combat and monster-trait engine | Resolve initiative, player actions, natural-die triggers, combined monster damage, armour, spells, escape, death, and victory. | Delivers the central risk/reward encounter loop consistently. | Prototype / Core |
| CAP-007 | Inventory and equipment | Manage backpack capacity, equipped items, armour durability, keys, consumables, spells, loot choices, and dropped items. | Eliminates manual inventory bookkeeping while preserving trade-offs. | Core |
| CAP-008 | Town and expedition lifecycle | Support safe retreat, rest, spell restoration, repair, purchasing, sales, re-entry, monster healing, and room repopulation. | Connects repeated dungeon expeditions into a persistent game. | Prototype / Core |
| CAP-009 | Death, recovery, and Graveyard | Persist death records, corpses or belongings, replacement adventurers, recoverable equipment, and Graveyard history. | Preserves NoteQuest’s distinctive continuity and metagame. | Prototype / Core |
| CAP-010 | Save, recovery, and reproducibility | Autosave meaningful actions, restore state, version data, preserve random outcomes, and support reproducible testing. | Protects valuable persistent state and increases trust. | Prototype / Core |
| CAP-011 | Event history and rule transparency | Show dice, table results, action costs, modifiers, traits, state changes, and recent history. | Helps players understand outcomes and supports QA. | Core |
| CAP-012 | Responsive and accessible interaction | Support agreed browsers, viewports, keyboard use, readable state, textual map navigation, and reduced-motion options. | Broadens access and avoids a desktop-only experience. | Core |
| CAP-013 | Content and rights management | Maintain content definitions, provenance, approval status, attribution, and release validation. | Protects the project from rights and release-compliance failures. | Foundation / Core |
| CAP-014 | Free web delivery | Publish and operate the application without paid-access requirements. | Maximises accessibility and conforms to the approved release decision. | Release |

## 10. Success Measures

### 10.1 Release acceptance measures

| ID | Measure | Target | Evidence source |
|---|---|---|---|
| SM-001 | Core journey completion | 100% of Must end-to-end acceptance scenarios pass for adventurer creation, dungeon exploration, combat, town return, boss completion, death, and recovery. | Acceptance test execution report |
| SM-002 | Rules conformance | 100% of Must rules requirements and deterministic fixtures pass. | Unit, integration, and rules-matrix results |
| SM-003 | Dungeon termination | Zero non-terminating dungeons in the agreed large-seed simulation set. | Automated generation simulation |
| SM-004 | Save integrity | 100% of required save/reload, interrupted-save, migration, and recovery scenarios preserve or safely recover required state. | Persistence test matrix |
| SM-005 | Core usability | At least 80% of representative primary users complete the agreed core flow without facilitator intervention or external bookkeeping. | Moderated playtest / UAT |
| SM-006 | Responsive support | All Must browser and viewport combinations complete the core flow without clipped or inaccessible required controls. | Responsive test matrix |
| SM-007 | Accessibility | All Must requirements in the agreed accessibility baseline pass automated and manual checks. | Accessibility audit and keyboard/screen-reader smoke tests |
| SM-008 | Content release eligibility | 100% of bundled content and assets have an approved provenance record; no unknown or restricted item is present. | Content inventory and release-gate report |
| SM-009 | Defect readiness | No blocker or critical defect remains open at release; high defects require explicit product-owner waiver. | Defect report and release approval |
| SM-010 | Free access | The release provides the complete approved core experience without payment or monetisation flow. | Release review |
| SM-011 | Core-loop validation | The one-dungeon prototype demonstrates meaningful torch decisions, readable mapping, functional death/recovery, and acceptable repeated combat before full production. | Prototype playtest and go/no-go record |

### 10.2 Post-release indicators

Because hidden analytics are not part of the approved baseline, post-release indicators should be gathered through voluntary feedback, playtests, issue reports, and privacy-approved measurements only:

- Reported save corruption or unrecoverable data-loss incidents.
- Rules discrepancy and ambiguous-outcome reports.
- Core-flow completion and abandonment observed in voluntary playtests.
- Player feedback on combat repetition, map clarity, torch pressure, and mobile usability.
- Accessibility issues reported by keyboard, screen-reader, low-vision, and reduced-motion users.
- Browser compatibility and offline-play failures.
- Requests for future dungeon packs, challenge modes, localisation, or optional variants.

## 11. Assumptions

| ID | Assumption | Validation method | Owner |
|---|---|---|---|
| ASM-001 | Written permission has been obtained for the digital adaptation and use of the approved core tables, names, and terminology. | Store and review the permission evidence in the project’s rights records. | Content / Licensing Reviewer |
| ASM-002 | The initial public application will be free to use and will not require monetisation features. | Confirm during release-scope and deployment review. | Product Owner |
| ASM-003 | The core six dungeons and associated content are sufficient for the first complete release, provided presentation and pacing reduce exposed repetition. | Prototype and closed-playtest feedback. | Product Owner |
| ASM-004 | A web-first responsive interface can present the map, critical adventurer state, enemies, and actions effectively across agreed viewports. | Responsive wireframes, prototypes, and usability testing. | UX/UI Designer |
| ASM-005 | Offline-first local persistence is technically viable under the selected browser support matrix. | Architecture spike and persistence tests. | Technical Lead |
| ASM-006 | Players accept canonical 2d6 generation and source balance differences without mandatory rebalancing. | Playtest feedback and simulation results. | Rules / Product Designer |
| ASM-007 | Approved digital rulings in the decision register will be converted into a versioned Digital Rules Specification before production implementation. | Requirements review and traceability audit. | Rules / Product Designer |
| ASM-008 | Replacement artwork can be commissioned or created when existing artwork lacks documented digital-use rights. | Asset inventory and art-production plan. | Content / Licensing Reviewer |
| ASM-009 | The project can operate the free web application within an approved hosting and maintenance budget. | Hosting architecture, cost estimate, and owner approval. | Product Owner / Operations Owner |
| ASM-010 | Users understand that local-first saves may require explicit export or backup procedures to protect against browser-data deletion. | UX testing of storage notices and backup flows. | UX/UI Designer |

## 12. Dependencies

| ID | Dependency | Type | Required by | Status |
|---|---|---|---|---|
| DEP-001 | Approved Digital Adaptation Decision Register | Product / rules | BRD and all downstream specifications | Approved baseline recorded |
| DEP-002 | Versioned Digital Rules Specification | Product / rules | Mechanical prototype | Required next |
| DEP-003 | Content and licensing inventory, including permission evidence and asset-level approval | Legal / content | Any public build | In progress; core permissions recorded |
| DEP-004 | Product Requirements Document and MVP Scope | Product | Detailed planning and release governance | Pending |
| DEP-005 | Functional Requirements Specification | Product / technical | Production implementation | Pending |
| DEP-006 | Data / Domain Model Specification | Technical | Persistence and content implementation | Pending |
| DEP-007 | UX Flow and Wireframe Requirements | UX | Responsive prototype and application design | Pending |
| DEP-008 | Non-Functional Requirements | Technical / operational | Architecture and release acceptance | Pending |
| DEP-009 | Acceptance Criteria / Test Plan | QA | Prototype and release approval | Pending |
| DEP-010 | Web architecture, supported browser matrix, offline strategy, and hosting plan | Technical / operational | Prototype deployment | Pending |
| DEP-011 | Approved visual direction and asset-production plan | UX / content | Release presentation | Pending |
| DEP-012 | Automated test harness and deterministic random-generation support | Technical / QA | Prototype validation | Pending |
| DEP-013 | Closed playtest participants and feedback process | External / product | Prototype and release validation | Pending |

## 13. Constraints

- The product must be a web application designed web-first with full responsive support.
- Core play must remain offline-first and require no mandatory account or continuous connection.
- The initial release is single-player and limited to the six core dungeons and core rules.
- The approved release is free to use and contains no monetisation or paid-access mechanism.
- Expanded World, localisation, multiplayer, cloud accounts, and major expansion systems are outside the initial scope.
- Rule ambiguities must be resolved in approved documentation rather than silently in implementation.
- Dungeon generation must guarantee termination and boss access.
- Persistent state must survive ordinary close/reopen behavior and handle failures without silent loss.
- The UI must keep survival-critical information and consequences visible or readily accessible across supported viewports.
- Bundled content and assets must have documented provenance, permission or licence, approval status, and required attribution.
- The original publication’s logo, page layout, character-sheet design, and trade dress must not be copied unless specifically authorised.
- Private user data remains local by default and may not be reused for analytics, marketing, examples, or training without explicit permission.
- Canonical play preserves source generation probabilities and balance unless an optional variant is separately approved.

## 14. Risks and Mitigations

| ID | Risk | Probability | Impact | Mitigation | Owner |
|---|---|---:|---:|---|---|
| RISK-001 | Incomplete or inconsistent rule formalisation causes gameplay defects or rules drift. | High | High | Complete the Digital Rules Specification first; require traceability and deterministic tests for every critical ruling. | Rules / Product Designer |
| RISK-002 | Procedural generation produces an unreachable or non-terminating dungeon. | Medium | High | Implement hidden targets, hard limits, forced staircases, invariant checks, and large-seed simulations. | Technical Lead / QA |
| RISK-003 | Save failures or schema defects corrupt persistent dungeons and Graveyard history. | Medium | Critical | Use atomic or transactional persistence, autosave status, versioned schemas, recovery tests, and export/backup guidance. | Technical Lead |
| RISK-004 | Automated combat feels repetitive or too passive. | Medium | High | Preserve visible dice and decisions; add clear feedback, repeat-action controls, pacing options, and playtest gates without changing balance. | Product Owner / UX Designer |
| RISK-005 | Core content repetition becomes visible faster in software. | High | Medium | Use approved cosmetic variation, environmental text, room naming, visual variants, event history, and later content packs. | Product Owner / Content Designer |
| RISK-006 | The fully responsive interface becomes crowded or hides critical state on mobile. | Medium | High | Design web-first responsive flows from the start; test tabs, panels, textual map access, and portrait/landscape behavior early. | UX/UI Designer |
| RISK-007 | Browser storage is deleted, restricted, or behaves differently across supported environments. | Medium | High | Define the browser matrix, communicate storage limitations, support safe export/backup where included, and test failure/recovery paths. | Technical Lead / UX Designer |
| RISK-008 | Asset-level rights remain unclear despite core adaptation permission. | Medium | High | Maintain an item-level inventory; block unknown assets; commission replacements; require release review. | Content / Licensing Reviewer |
| RISK-009 | Scope expands into a generic roguelike before the core loop is validated. | High | High | Enforce the approved exclusions, prototype gate, traceable scope, and separate approval for expansion work. | Product Owner |
| RISK-010 | Free hosting and maintenance costs become unsustainable. | Medium | Medium | Select a cost-controlled static or low-operation architecture, define budgets, monitor usage only through approved operational metrics, and assign an operations owner. | Product Owner / Operations Owner |
| RISK-011 | Accessibility is treated as late polish and requires major redesign. | Medium | High | Include accessibility in wireframes, component requirements, map semantics, keyboard flows, and acceptance tests from the start. | UX/UI Designer / QA |
| RISK-012 | Players misunderstand automated consequences or distrust hidden calculations. | Medium | Medium | Expose dice, tables, costs, modifiers, warnings, event history, and rule references; use usability testing. | UX/UI Designer |
| RISK-013 | Source race/class imbalance causes unexpectedly high failure rates or poor first impressions. | High | Medium | Preserve canonical mode, measure through simulation and playtests, and consider only clearly labelled optional variants later. | Rules / Product Designer |
| RISK-014 | Rejected or altered decision-register recommendations are accidentally implemented instead of their comment resolutions. | Medium | High | Treat the approved value and comment resolution as authoritative; carry decision IDs into downstream traceability. | Product Owner / Business Analyst |

## 15. Release Approach

1. **Foundation and formalisation** — Approve the BRD, create the Digital Rules Specification, complete the content/rights inventory, and define the MVP and success gates.
2. **One-dungeon web prototype** — Implement adventurer generation, one dungeon type, incremental mapping, doors and traps, torches, basic combat, town return, death, save/load, and responsive web delivery without final art.
3. **Prototype validation** — Test termination, torch pressure, combat decisions, map readability, save integrity, death/recovery, offline behavior, and representative responsive layouts. Make an explicit go/no-go decision.
4. **Core MVP implementation** — Add all six dungeons, races, classes, spells, equipment, monster traits, secret passages, stealth, armour, repopulation, corpse recovery, Graveyard, bosses, full persistence, and event history.
5. **Experience and release hardening** — Complete responsive UX, accessibility, replacement or approved art, sound, tutorial, settings, save recovery/backup behavior, performance work, and content notices.
6. **Closed playtest and release candidate** — Run deterministic tests, simulations, browser/device checks, accessibility review, content/licensing review, and structured UAT.
7. **Free public web release** — Publish only after scope, rules, data safety, UX, accessibility, defects, operations, and content-rights gates pass.

## 16. Approval Criteria

The BRD may be approved when:

- [ ] The faithful full-adaptation vision and web-first free-release model are agreed.
- [ ] Business objectives and Must requirements are measurable and traceable.
- [ ] Included, excluded, and future scope are explicit.
- [ ] Decision-register comments have been applied wherever recommendations were marked `no`.
- [ ] Core adaptation, table, and terminology permissions are evidenced in project records.
- [ ] Remaining asset-level rights and provenance work have owners and release gates.
- [ ] Dependencies and material risks have owners.
- [ ] Success measures have defined evidence sources.
- [ ] The one-dungeon prototype gate is accepted as a prerequisite to full production.
- [ ] Web, responsive, offline-first, privacy, accessibility, and data-safety constraints are agreed.
- [ ] No unresolved business decision makes downstream product or rules specification unsafe to begin.

A release may be approved when:

- [ ] All Must business requirements have acceptance evidence.
- [ ] A complete core journey succeeds without external bookkeeping.
- [ ] Dungeon generation terminates reliably across the agreed simulation set.
- [ ] Save, reload, migration, failure, and recovery tests pass.
- [ ] Death, corpse/belongings, replacement-adventurer, and recovery flows pass.
- [ ] The responsive browser matrix and accessibility baseline pass.
- [ ] No blocker or critical defect remains open.
- [ ] No unknown, restricted, or unapproved content or asset is included.
- [ ] The application is publicly accessible without payment or a mandatory account.

## 17. Open Questions

| ID | Question | Owner | Due / decision point | Resolution |
|---|---|---|---|---|
| OQ-001 | Which browsers, operating systems, and minimum viewport sizes form the Must support matrix? | Technical Lead / UX Designer | Before UX and NFR approval | Open |
| OQ-002 | What exact browser technology and packaging approach will provide offline-first web use? | Technical Lead | Before prototype architecture approval | Open |
| OQ-003 | What is the approved hosting, deployment, domain, availability, and operating-cost model for the free application? | Product Owner / Operations Owner | Before public prototype deployment | Open |
| OQ-004 | Which existing artwork, if any, has explicit digital-use permission, and what replacement-art scope is required? | Content / Licensing Reviewer | Before release-art production | Open |
| OQ-005 | What exact accessibility standard, level, assistive-technology matrix, and textual-map behavior will be required? | UX Designer / QA | Before UX and NFR approval | Open |
| OQ-006 | Will save export/import be a Must capability for the core release or a release-hardening feature? | Product Owner / Technical Lead | Before MVP scope approval | Open |
| OQ-007 | What are the final numeric floor target and hard maximum used by the guaranteed-staircase rule? | Rules / Product Designer | Before Digital Rules Specification approval | Open |
| OQ-008 | What playtest thresholds define acceptable combat repetition, dungeon repetition, torch pressure, and overall replayability? | Product Owner / QA | Before prototype go/no-go | Open |
| OQ-009 | What approved wording and placement are required for attribution, rights notices, and any unofficial-product statement? | Content / Licensing Reviewer | Before public release candidate | Open |
| OQ-010 | What is the initial release schedule and who will provide ongoing maintenance after launch? | Product Owner | Before roadmap approval | Open |

## 18. Approval

| Role | Name | Decision | Date | Notes |
|---|---|---|---|---|
| Product Owner |  | Pending |  |  |
| Rules / Product Designer |  | Pending |  |  |
| Content / Licensing Reviewer |  | Pending |  |  |
| Technical Lead |  | Pending |  |  |
| UX/UI Lead |  | Pending |  |  |
| QA Lead |  | Pending |  |  |
| Operations Owner |  | Pending |  |  |
