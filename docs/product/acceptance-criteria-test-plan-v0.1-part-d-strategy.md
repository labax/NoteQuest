# [Acceptance Criteria / Test Plan v0.1](acceptance-criteria-test-plan-v0.1.md) - Part D - Purpose, Sources, Context, Scope, and Strategy

This file is a normative part of [Acceptance Criteria / Test Plan v0.1](acceptance-criteria-test-plan-v0.1.md).

*Status: Draft for Review | Last updated: 2026-07-17*

---

## 1. Purpose

This plan converts the approved NoteQuest business, product, functional, rules, data, UX, non-functional, content, privacy, accessibility, and release requirements into executable acceptance evidence.

It defines:

- what must be tested before a feature enters QA;
- the minimum automated, manual, simulation, browser, accessibility, content, security, persistence, and playtest coverage;
- the Palace prototype go/no-go evidence;
- the Core MVP release gates;
- acceptance scenarios for the complete canonical journeys;
- traceability, defect severity, waiver, and approval rules.

The plan is implementation-tool-neutral. Architecture and test-tool choices may vary, but they must produce the evidence defined here.

### 1.1 Decision status

No new product or rules decision register is required before this plan. The existing approved decision registers already fix scope, Palace selection, success thresholds, browser/viewport support, accessibility matrix, simulation volume, persistence behaviour, release mode, content restrictions, and operations direction.

This plan introduces proposed execution details such as fixture names, minimum UAT participant counts, evidence formats, and suite partitioning. Approval of this document accepts those plan-level values unless comments provide an explicit alternative.

### 1.2 Result vocabulary

| Result | Meaning |
|---|---|
| Pass | Observed result and evidence satisfy the criterion. |
| Fail | Observed result contradicts the criterion or a Must threshold is missed. |
| Blocked | A named prerequisite, environment, or approved content item is unavailable; this is not a pass. |
| Not run | No valid execution evidence exists. |
| Not applicable | The criterion is formally outside the selected build/release and the exclusion is traceable. |
| Waived | A permitted failure is accepted through the documented waiver process; Blocker/Critical failures cannot be waived. |

---

## 2. Source Basis

The controlling sources are:

1. **BRD** - business outcomes, free release, rights, privacy, operational ownership, and high-level acceptance.
2. **[MVP Scope](mvp-scope-v0.1.md)** - Palace gate, six-dungeon boundary, supported browser/viewport matrix, release gates, simulation volume, exclusions, and success measures.
3. **PRD** - user outcomes, product capabilities, rollout, privacy, and measurable product success.
4. **FRD** - 12 feature areas, observable states, cross-feature behaviour, functional errors, and requirement IDs.
5. **DRS** - canonical mechanics, action timing, legal transitions, random results, persistence consequences, and reference tests.
6. **Data Model** - entities, ownership, identities, invariants, snapshots, events, import/export, migration, provenance, and retention.
7. **UX specification** - journeys, screens, component states, responsive transformations, keyboard/focus/announcement behaviour, visual/textual map parity, and Wireloom references.
8. **NFR** - reference performance profiles, quality thresholds, security/privacy, WCAG 2.2 AA, browser/AT matrix, fault volumes, build/release, and rollback.
9. **[Content & Licensing Requirements](content-licensing-requirements-v0.1.md)** - content use, paraphrase/visual restrictions, source inventory, provenance, notices, dependencies, and release gates.
10. **Decision Registers** - controlling approved rulings and any approved alternative comments.

When documents conflict, the later approved decision register and explicitly approved downstream baseline control. No test may redefine a rule through expected output; ambiguous behaviour must return to the requirements/decision process.

---

## 3. Test Context

The product is an installable, responsive, offline-first static PWA with three local save slots, versioned IndexedDB persistence, deterministic rules and generation, persistent dungeons, import/export, recovery snapshots, no backend dependency for core play, and no hidden telemetry.

### 3.1 Highest-risk areas

| Risk area | Why it matters | Test response |
|---|---|---|
| Rules-result correctness | Incorrect dice, table, combat, item, or timing results undermine source fidelity. | Deterministic unit/reference fixtures; intermediate-value assertions; DRS traceability. |
| Dungeon termination and boss access | A generated dungeon can block the complete journey. | At least 100,000 deterministic seeds per dungeon type; invariant and reproducibility checks. |
| Atomic persistence | Partial writes can duplicate random outcomes, lose items, corrupt death/recovery, or falsify save status. | Transactional integration tests, 1,000+ injected failures, canonical before/after comparison. |
| Save portability and migration | Browser storage can be cleared and schemas will evolve. | Export/import round trips, cross-browser tests, supported sequential migration, newer/corrupt rejection, snapshots. |
| Persistent identity and ownership | Items, monsters, corpses, events, and references can duplicate or orphan. | Domain invariants after every action and migration. |
| Active-play UX | Hidden state or unclear legal actions defeat the automation value. | E2E journeys, Wireloom-based review, usability and unaided completion. |
| Phone and responsive support | Map, combat, inventory, and confirmations can become unusable at small widths. | All required widths, touch, keyboard, long-content, orientation, and reflow tests. |
| Accessibility | Map-centric play may exclude keyboard and assistive-technology users. | WCAG 2.2 AA, keyboard in each browser, NVDA, VoiceOver, TalkBack, textual-map parity. |
| Offline/update behaviour | A stale or failed service worker can strand or mix versions. | First-ready, offline journey, update deferral, failed update, rollback, asset failure. |
| Content/licensing | Unapproved prose, visuals, assets, or dependencies can block release. | Manifest, source/transcription, notice, visual/trade-dress, dependency, and build-gate tests. |
| Security/privacy | Imports, user text, diagnostics, and third-party requests can expose data or execute content. | Adversarial import, XSS, headers, secret scans, network/storage inspection, diagnostic allowlist. |
| Performance and storage growth | History, Graveyard, content, and snapshots may degrade local use. | NFR reference profiles, large-save fixture, p75/p95 measures, quota/compaction tests. |
| Release/rollback | A bad artifact or mixed cache can break users. | Protected-ref build, immutable artifact, smoke, deployment, previous-artifact rollback drill. |

### 3.2 Test principles

- Test the canonical mode first; optional or future modes cannot mask a canonical failure.
- Assert intermediate values where they explain a result, not only final screen text.
- Use seeded deterministic inputs for repeatability.
- Compare canonical domain state, not only rendered UI.
- Treat false success, silent reset, duplicate random consumption, or lost durable identity as Critical.
- Use project-original or minimal structured fixtures unless an approved source fixture is necessary.
- Preserve privacy: test evidence must not contain real user saves, names, notes, or rights correspondence.
- A passing happy path never compensates for a failed cancellation, recovery, reload, or accessibility path.
- Manual evidence supplements automation; it does not replace deterministic checks where automation is practical.

---

## 4. Quality Objectives

| ID | Objective | Acceptance signal |
|---|---|---|
| QO-001 | Deliver the complete approved core journey without external bookkeeping. | All required E2E terminal paths pass. |
| QO-002 | Produce correct, reproducible, source-faithful mechanical outcomes. | All Must DRS fixtures and rules matrices pass. |
| QO-003 | Guarantee finite dungeon generation and boss reachability. | Zero required generation failures in the approved seed volume. |
| QO-004 | Preserve all committed user value and recover safely from faults. | Persistence, recovery, migration, import/export, and invariant matrices pass. |
| QO-005 | Prevent reload or retry from rerolling or duplicating committed outcomes. | Random-stream and action-boundary equivalence passes. |
| QO-006 | Make the complete journey usable on supported desktop, tablet, and phone widths. | Browser/viewport matrix passes. |
| QO-007 | Meet WCAG 2.2 AA and the approved keyboard/AT/textual-map baseline. | Accessibility report has no unwaived Must failure. |
| QO-008 | Meet approved performance, bundle, storage, availability, security, and operations thresholds. | NFR evidence passes. |
| QO-009 | Ship only release-eligible content with complete provenance and notices. | Content/licensing matrix passes with zero blocked items. |
| QO-010 | Protect local privacy and avoid hidden telemetry or automatic data attachment. | Network, storage, log, and diagnostic review passes. |
| QO-011 | Validate practical usability and pacing before six-dungeon production. | Palace 80% unaided and 70% acceptable-or-better thresholds pass. |
| QO-012 | Provide reproducible release, deployment, smoke, and rollback evidence. | Release and rollback gates pass. |

---

## 5. Test Scope

### 5.1 In scope

| Area | Testing included |
|---|---|
| Application shell and local data | First launch, installability, offline readiness, three slots, settings, About/Credits, version display. |
| Adventurer creation | Weighted race/class generation, HP, abilities, spells, resources, evidence, atomic creation. |
| Dungeon generation | Names, incremental graph generation, floor limits, stairs, final room, versioned constants, invariants. |
| Exploration | Segments, doors, traps, locks, keys, searches, stealth, light, movement, retreat eligibility. |
| Combat | Initiative, targets, natural triggers, traits, damage, armour, spells, items, escape, rewards, bosses. |
| Inventory/equipment | Capacity, hands, limb loss, equipment, durability, keys, drops, rewards, sale, consumption, stable identity. |
| Town and expedition lifecycle | Rest, spells, repair, torches, sales, safe return, re-entry, healing, repopulation, multiple dungeons. |
| Death, Graveyard, and recovery | Normal/darkness death, atomic records, replacement adventurer, belongings, capacity, multiple deaths. |
| Persistence and portability | Autosave, reload, snapshots, recovery, quota, export/import, migration, reset, slot isolation. |
| History and explainability | Immutable events, rolls, rule/content versions, retention, completion summary, player notes. |
| UX/responsive/accessibility | All journeys, screens/states, keyboard, focus, announcements, text/visual map parity, widths, touch, reflow. |
| NFR quality | Performance, availability, security, privacy, compatibility, maintainability, diagnostics, build/release, rollback. |
| Content/licensing | Inventory, transcription, provenance, blocked content, notices, assets, dependencies, release mode. |
| Palace playtest/UAT | Unaided completion, comprehension, pacing, map clarity, phone, save/recovery trust. |
| Core MVP release | All six dungeons, complete gates, smoke/regression, operations and defect acceptance. |

### 5.2 Conditional scope

| Area | Test when |
|---|---|
| PWA installation prompt/standalone mode | The browser/platform supports installation. Normal browser-tab use remains mandatory regardless. |
| Optional pacing/animation controls | Implemented in the selected build. |
| Optional manual physical-dice entry | Separately approved and implemented; never required by Core MVP acceptance. |
| Diagnostic package | Implemented; privacy preview and allowlist tests then become Must. |
| Final commissioned artwork/audio | Selected after Palace go; item-level asset and accessibility tests then apply. |
| Future commercial, translated, expansion, cloud, multiplayer, or account features | Not part of this plan; require separate scope and test addendum. |

---

## 6. Out of Scope

- Expanded World and other supplements.
- Multiplayer, co-op, cloud accounts, synchronisation, leaderboards, live services, payments, ads, subscriptions, sponsorship, and monetisation.
- Crafting, tactical grid combat, 3D rooms, detailed town/campaign exploration, generated narrative, localisation, console certification, and controller-first navigation.
- Testing unapproved house-rule modes as release requirements.
- Full source-rulebook reading/compendium reproduction; the application implements approved mechanics and concise help.
- Unapproved content except tests confirming it is blocked or absent.
- Recovery from user/device/browser-profile deletion without an external export.
- Confidential legal advice or adjudication of rights disputes.
- Penetration testing of services not present in the Core MVP, such as accounts or backend APIs.
- Public-scale load testing of gameplay servers, because core play has no gameplay backend.

---

## 7. Test Strategy

| Layer | Purpose | Method | Owner |
|---|---|---|---|
| Requirements review | Find contradiction, missing acceptance signal, untestable wording, and traceability gaps before implementation. | Structured checklist and cross-document matrix. | Product / QA / specialist reviewers |
| Static validation | Reject invalid content, schema, manifests, links, licences, and configuration before runtime. | Schema, linter, build, dependency, licence, secret, and policy checks. | Technical / QA / Content |
| Unit | Verify pure rules, ranges, validation, transforms, guards, and canonical serialisation. | Seeded fixtures, parameterised/boundary/property tests. | Developer |
| Component | Verify controls, states, focus, announcements, validation, and responsive variants. | Component harness and accessibility checks. | Developer / QA / UX |
| Integration | Verify domain, rules, content, storage, migration, import, history, and linked records. | In-memory/real IndexedDB, fault injection, canonical comparisons. | Developer / QA |
| Simulation | Verify procedural termination and statistical/structural invariants. | At least 100,000 deterministic seeds per dungeon type. | Technical / QA / Rules |
| End-to-end | Verify complete browser journeys and terminal outcomes. | Browser automation plus selected manual confirmation. | QA |
| Performance | Verify timings, bundle budgets, storage growth, and responsiveness. | NFR reference profiles, browser profiling, p75/p95 reporting. | Technical / QA |
| Security/privacy | Verify input safety, headers, dependencies, secrets, network behaviour, logs, and diagnostics. | Adversarial fixtures, scans, inspection, threat review. | Technical / Privacy / QA |
| Accessibility | Verify WCAG structure and practical keyboard/screen-reader use. | Automated support plus manual keyboard, NVDA, VoiceOver, TalkBack, zoom/reflow. | UX / QA |
| Content/licensing | Verify source use, transcription, provenance, notices, dependencies, assets, and blocked-content absence. | Inventory/manifest comparison, source review, build gate, visual audit. | Content / Rights / QA |
| Playtest/UAT | Verify unaided practical use, comprehension, trust, pacing, and map clarity. | Moderated task sessions and standard survey. | Product / UX / QA |
| Regression/smoke | Protect accepted flows and validate each candidate/deployment. | Stable automated suite plus release smoke. | QA / CI / Operations |

### 7.1 Automation position

Automation is required for deterministic rules, table boundaries, domain invariants, migration, import validation, content manifests, generation simulation, and repeatable persistence faults. Manual-only evidence is acceptable where human perception or assistive-technology behaviour is central, but the result must still use a documented script and evidence record.

### 7.2 Test independence

- Tests reset or create their own slot/data scope.
- Parallel tests do not share mutable random streams or storage.
- Seeds, schemas, rules, and content versions are recorded.
- Failure evidence identifies the last valid state and expected/actual result.
- Test-only modes cannot contaminate public saves or release builds.
