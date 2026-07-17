# [Acceptance Criteria / Test Plan v0.1](acceptance-criteria-test-plan-v0.1.md) - Part E - Test Levels, Environments, Data, Entry, and Exit

This file is a normative part of [Acceptance Criteria / Test Plan v0.1](acceptance-criteria-test-plan-v0.1.md).

*Status: Draft for Review | Last updated: 2026-07-17*

---

## 8. Test Levels

### 8.1 Unit tests - minimum coverage

- Every d6 boundary and every 2d6 total used by an approved lookup.
- Weighted race/class mapping, starting HP/resources, duplicate spell charges, and ability triggers.
- Door, trap, key, secret passage, stealth, alert, light, hands, limb, equipment, and retreat guards.
- Combat initiative, target legality, natural 1/6 triggers, modifiers, armour allocation, damage spill, defeat, boss, and simultaneous death.
- Item capacity, identity, transfer, durability, modifier composition, sale, consumption, drop, corpse/belongings, and recovery.
- Town costs/restoration and expedition/repopulation transitions.
- Dungeon graph validation, six-segment target, ten-segment hard maximum, forced stairs, boss reachability, and versioned constants.
- Event creation, retention selection, summary generation, player-note separation, and rule trace.
- Schema validation, canonical serialisation, hash/manifest validation, migration steps, import limits, and content references.
- Name/note grapheme validation and safe rendering transforms.

### 8.2 Component tests

- Save-state indicator: saving, saved, failed, recovery, migrating, incompatible, and offline-ready truth.
- Save-slot cards and all valid/invalid actions.
- Adventurer creation form, roll evidence, disabled/canonical controls, errors, and commit.
- Resource bar and survival-critical states.
- Visual map, textual map, current position, connection states, legal destinations, and parity.
- Action panel enabled/disabled guard explanations.
- Result/rule-trace card with natural dice, table/row, modifiers, versions, and outcome.
- Monster/turn components, inventory item cards, capacity sheet, and destructive confirmations.
- History timeline, pagination, player-note separation, and error/retry.
- Import/recovery preview and no-mutation cancellation.
- Credits/notices and offline reachability.
- Keyboard order, focus containment/restoration, labels, live regions, non-colour cues, reduced motion, zoom/reflow, long strings, and 360-pixel layout.

### 8.3 Integration tests

- Content definition to rules input and persisted version reference.
- Action validation, deterministic stream consumption, domain transition, event creation, and atomic save.
- Adventurer, dungeon, expedition, segment, encounter, monster, item, death, Graveyard, and history linkage.
- Save/reload of each aggregate and cross-reference.
- Last-valid and pre-destructive snapshot creation/rotation/activation.
- Export/import, slot replacement, schema/rules/content compatibility, and migration.
- Service-worker version/update safety with active IndexedDB state.
- Quota failure, unavailable storage, private mode, corrupted data, and missing content package.
- Content inventory/build validation and credits generation.

### 8.4 End-to-end tests

The selected build must automate or execute manually the detailed scenarios in Section 16 and at least the following terminal journeys:

1. Empty first launch -> new slot -> adventurer -> Palace -> boss victory -> completed history.
2. Existing slot -> safe retreat -> town -> re-entry -> continued persistent dungeon.
3. Adventurer death -> Graveyard -> replacement -> belongings recovery.
4. Darkness death -> no corpse -> belongings recovery.
5. Save failure -> blocked unsafe continuation -> last-valid recovery.
6. Export -> reset/replace -> validated import -> equivalent resumed state.
7. Supported migration -> equivalent state; unsupported newer schema -> no mutation.
8. Offline-ready -> network disabled -> complete ordinary play actions.
9. Phone width -> textual map -> combat/inventory/town -> save/reload.
10. Keyboard/assistive-technology path through a representative core flow.

---

## 9. Test Environments

### 9.1 Environment stages

| Environment | Purpose | Data | Required checks |
|---|---|---|---|
| Local development | Fast unit/component/integration feedback. | Synthetic deterministic fixtures. | Build, unit, component, static, schema, manifest. |
| CI pull request | Prevent merge regressions. | Synthetic fixtures and bounded simulation subset. | Build, lint/static, unit, component, integration, content/licence validation, smoke subset. |
| Nightly/deep validation | Longer deterministic and fault suites. | Large-save, migration corpus, fault matrix, extended seeds. | Endurance, faults, performance trends, accessibility automation. |
| QA build | Manual and automated integrated validation. | Resettable representative slots and Palace data. | Feature, E2E, browser, responsive, security/privacy. |
| Closed Palace playtest | Practical user validation. | Content-reviewed Palace package and rights-safe placeholders. | UAT, usability, pacing, map, phone, save/recovery. |
| Release candidate | Final production-equivalent artifact. | Complete approved six-dungeon content and release manifest. | All Must gates and required Should evidence. |
| Production verification | Verify deployed immutable artifact. | Non-private synthetic smoke data only. | Shell, manifest, service worker, versions, offline readiness, network requests, rollback readiness. |

### 9.2 NFR reference profiles

This plan adopts the reference profiles defined by the approved NFR:

| Profile | Required use |
|---|---|
| `REF-DESKTOP` | Desktop performance, compatibility, imports/exports, and large-save review. |
| `REF-MOBILE` | Phone performance, touch, responsive layout, and browser execution. |
| `REF-MIN-WIDTH` | Complete 360 CSS-pixel journey and long-content handling. |
| `REF-OFFLINE` | Previously loaded/offline-ready application with network disabled. |
| `REF-LARGE-SAVE` | Performance, storage, history, Graveyard, save, migration, and portability. |
| `REF-IMPORT-25` | Valid and malformed 25 MiB import packages and expansion limits. |
| `REF-AT-DESKTOP` | NVDA on Windows and VoiceOver on macOS at release-candidate freeze. |
| `REF-AT-MOBILE` | VoiceOver on iOS Safari and TalkBack on Android Chrome. |

### 9.3 Browser / viewport matrix

The current and previous two major release versions at release-candidate freeze are Must for:

- Chrome;
- Edge;
- Firefox;
- Safari.

Required widths: **360, 390, 768, 1024, 1280, and 1440 CSS pixels**.

Execution rules:

- keyboard-only core-flow coverage in every supported browser;
- touch/phone journeys on representative Android Chrome and iOS Safari;
- NVDA with Firefox and Chrome on Windows;
- VoiceOver with Safari on macOS and iOS;
- TalkBack with Chrome on Android;
- PWA installability where supported, with complete browser-tab fallback everywhere;
- exact OS, browser, device, and AT versions recorded in the RC report.

---

## 10. Test Data Strategy

### 10.1 Fixture catalogue

| Fixture ID | Definition | Primary use |
|---|---|---|
| FX-EMPTY | Three empty slots; no preferences beyond defaults. | First launch, empty states, new-game flow. |
| FX-ADV-MIN | Minimum/low-result race/class combination with all starting derivations. | Creation boundaries and weak-character usability. |
| FX-ADV-MAX | Maximum/high-result race/class combination, duplicate spells where applicable. | Creation upper bounds and display. |
| FX-PALACE-START | Approved deterministic Palace seed at entrance with new adventurer. | Core journey baseline. |
| FX-PALACE-DOOR | Known trapped, locked, and unlocked doors with keys/abilities variants. | Door/trap/action rules. |
| FX-PALACE-COMBAT | Known encounters covering initiative, natural traits, armour, spells, and rewards. | Combat integration. |
| FX-PALACE-BOSS | Reachable final room with deterministic boss and reward outcomes. | Completion path. |
| FX-DEATH-NORMAL | Low HP encounter causing normal death with items/coins. | Death, corpse/belongings, Graveyard. |
| FX-DEATH-DARK | Final light action causing darkness death with recoverable belongings. | Darkness death semantics. |
| FX-RECOVERY | Replacement adventurer adjacent to multiple death containers and capacity limits. | Recovery identity/capacity. |
| FX-TOWN | Town state with damaged armour, missing HP/spells, items, coins, and unfinished dungeon. | Town transactions and re-entry. |
| FX-LARGE | NFR `REF-LARGE-SAVE`. | Performance, history, storage, migration, export/import. |
| FX-MIG-N-1 | Valid prior supported schema with every aggregate type and provenance. | Sequential migration. |
| FX-MIG-BROKEN | Interrupted/invalid migration variants at each step. | Failure and snapshots. |
| FX-IMPORT-VALID | Versioned valid package with all three slot conditions. | Import preview/replace. |
| FX-IMPORT-BAD | Malformed, oversized, future, bad checksum, missing-reference, blocked-content packages. | Security and no-mutation. |
| FX-QUOTA | Storage adapter/fault setup that rejects writes at defined boundaries. | Quota and prior-valid preservation. |
| FX-CONTENT-BLOCKED | Manifest with unknown/restricted/source-visual item selected. | Build/runtime content gate. |
| FX-CONTENT-PALACE | Row-level Palace source/manifest comparison fixture. | Transcription and licensing. |
| FX-A11Y-LONG | 40-grapheme names, 10,000-grapheme note, long errors/events, zoom/reflow. | Accessibility/responsive. |

### 10.2 Fixture rules

- Every deterministic fixture records application commit, schema, DRS version, content package, inventory version, and random stream states.
- Expected state uses canonical JSON/object comparison with implementation-specific ordering removed.
- Source-derived fixture data carries provenance IDs; project-original fixtures are labelled accordingly.
- No fixture contains real user data, backer names, confidential rights evidence, or copied source page images.
- Failure fixtures preserve expected prior-valid state and expected recovery metadata.
- When a source table is required, the minimal structured row data is used rather than a source-page screenshot or copied prose.

### 10.3 Boundary and combinatorial coverage

At minimum test:

- every d6 value and every 2d6 total used by a table;
- zero, one, maximum, and invalid values for HP, armour, torches, coins, hands, spells, inventory, doors, segments, events, names, and notes;
- every door initial state and transition;
- every monster trait and natural trigger combination;
- every armour slot and damage spill condition;
- empty/full inventory and equipment invalidation after limb loss;
- safe/unsafe retreat routes;
- first/repeated expedition entry and repopulation eligibility;
- one/multiple deaths and partial recovery;
- active/incomplete/completed history retention boundaries;
- all save slots, other-slot isolation, and reset scopes;
- current, prior supported, future unsupported, malformed, and corrupted schemas/content;
- online, offline, failed update, missing asset, quota, and restricted-storage conditions.

---

## 11. Entry Criteria

### 11.1 Feature QA entry

A feature is ready for QA when:

- [ ] Requirement IDs and affected decision/DRS/data/UX/NFR/content IDs are linked.
- [ ] Acceptance criteria include happy, empty, boundary, invalid, cancel/no-change, failure/recovery, reload, responsive, accessibility, and content states where applicable.
- [ ] The selected Must scope is implemented or explicitly marked incomplete.
- [ ] Deterministic fixtures and expected canonical states exist.
- [ ] Content-bearing definitions/assets have provenance and approval state.
- [ ] Unit/component tests for implemented Must behaviour pass.
- [ ] The build and test commands run from a clean checkout.
- [ ] Known limitations, test hooks, and environment needs are documented.
- [ ] No unresolved product/rules ambiguity is hidden in test expectations.

### 11.2 Palace playtest entry

- [ ] All Palace Must functional and NFR automated scenarios pass.
- [ ] Palace content/transcription/placeholder inventory passes.
- [ ] No known Blocker or Critical defect is open.
- [ ] Save/reload, fault recovery, death/replacement/recovery, phone, keyboard, and textual map pass internal QA.
- [ ] The test build is stable, resettable, and includes privacy-safe feedback materials.
- [ ] Facilitators have a common script and do not teach the flow unless assistance is being recorded.
- [ ] Consent/privacy information and recording policy are approved where sessions are recorded.

### 11.3 Release-candidate entry

- [ ] All Must features are implemented or formally descoped.
- [ ] All six content packages are approved and manifest-complete.
- [ ] The candidate is built from a protected ref with locked dependencies.
- [ ] Previous release artifact and rollback path exist.
- [ ] Required test environments and exact browser/AT versions are frozen.
- [ ] No Blocker/Critical defect is open and High defects have an explicit plan.
- [ ] Final notice wording, content inventory, assets, and dependency reports are approved.

---

## 12. Exit Criteria

### 12.1 Feature exit

- [ ] All affected Must acceptance criteria pass.
- [ ] Affected deterministic and persistence regression tests pass.
- [ ] No Blocker/Critical defect remains.
- [ ] High defects are fixed or have a permitted documented waiver.
- [ ] Accessibility/responsive/content checks pass for affected surfaces.
- [ ] Evidence is linked to requirement/test IDs.
- [ ] Known limitations and deferred Should/Could items are documented.

### 12.2 Palace exit / written go

The Palace prototype passes only when all conditions in Gate `GATE-PAL-001` through `GATE-PAL-012` pass and the Product Owner records a written go decision. A partial or “promising” result is not a go.

### 12.3 Core MVP release exit

The public release passes only when every Must gate in Section 13 passes, no Blocker/Critical defect remains, no unwaived High defect remains, and all required specialist approvals are recorded.
