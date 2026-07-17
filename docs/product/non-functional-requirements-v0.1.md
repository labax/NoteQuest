# Non-Functional Requirements

## NoteQuest Web Application — Core MVP

*Version 0.1 | Draft for Review | Prepared for the NoteQuest Project*

| Field | Value |
|---|---|
| Document owner | Technical Lead / QA and Release Lead |
| Related documents | [Business Requirements Document v0.1](business-requirements-v0.1.md); [MVP Scope v0.1](mvp-scope-v0.1.md); [Product Requirements Document v0.1](product-requirements-v0.1.md); [Functional Requirements Document v0.1](functional-requirements-v0.1.md); [Digital Rules Specification v0.1](digital-rules-specification-v0.1.md); [Data Model / Domain Model Specification v0.1](data-domain-model-v0.1.md); [UX Flow / Wireframe Requirements v0.1](ux-flow-wireframe-requirements-v0.1.md); [Digital Adaptation Decision Register](digital-adaptation-decision-register.md); [Decision Register v0.2](digital-adaptation-decision-register-v0.2.md) |
| Product scope | Palace production-intent prototype and complete six-dungeon Core MVP |
| Primary audience | Product owner, developer, QA/tester, UX/accessibility reviewer, release/operations owner, rules designer, data modeller, and content/licensing reviewer |
| Status | Draft for review; inherited approved constraints are binding, while new numeric quality targets remain proposed until this document is approved |
| Last updated | 2026-07-17 |

---

## Contents

1. Purpose
2. Source Basis
3. Quality Context
4. Scope and Assumptions
5. Priority and Measurement Conventions
6. Performance
7. Reliability and Data Integrity
8. Availability and Offline Behaviour
9. Security
10. Privacy
11. Accessibility
12. Compatibility and Responsive Support
13. Usability
14. Maintainability and Testability
15. Observability and Diagnostics
16. Backup, Recovery, Migration, and Portability
17. Content and Licensing Quality Controls
18. Build, Release, and Operations
19. Traceability and Verification
20. Acceptance Criteria
21. Open Questions
22. Approval

---

## 1. Purpose

This document defines the measurable quality attributes, technical constraints, verification environments, and release-quality thresholds for the NoteQuest Palace prototype and complete six-dungeon Core MVP.

It translates the approved product, rules, data, persistence, UX, accessibility, privacy, and release decisions into testable non-functional requirements. It controls how quickly, safely, reliably, accessibly, privately, compatibly, and maintainably the approved functional behaviour must operate.

This document does not:

- choose the frontend framework, state library, build system, IndexedDB wrapper, CDN provider, hosting vendor, or monitoring vendor;
- replace the [Digital Rules Specification](digital-rules-specification-v0.1.md) or [Functional Requirements Document](functional-requirements-v0.1.md);
- define final executable test cases, which belong to the [Acceptance Criteria / Test Plan](acceptance-criteria-test-plan-v0.1.md);
- approve new telemetry, cloud accounts, backend services, monetisation, localisation, or content;
- change source-faithful probabilities, outcomes, persistence semantics, or release scope.

### 1.1 Requirement language

- **Shall** identifies a mandatory or explicitly prioritised requirement.
- **Must**, **Should**, **Could**, and **Won't** retain the project priority meanings defined in Section 5.
- A numeric target marked **Proposed** is intended to become binding when this document is approved.
- An inherited target marked **Approved baseline** is already controlled by an approved upstream document.
- An implementation may exceed a target, but may not weaken it without an approved change.

---

## 2. Source Basis

### 2.1 Controlling sources

1. The BRD defines business outcomes, release constraints, privacy, free access, rights obligations, and operational ownership.
2. The [MVP Scope](mvp-scope-v0.1.md) defines the Palace gate, six-dungeon boundary, browser and viewport matrix, deterministic simulation thresholds, release gates, and exclusions.
3. The PRD defines product-level capabilities, recovery expectations, local-first use, success measures, and rollout.
4. The FRD defines observable application behaviour, functional error states, responsive behaviour, persistence obligations, and traceability.
5. The DRS defines deterministic mechanics, legal actions, timing, rules-result evidence, random-stream behaviour, and persistent consequences.
6. The Data Model defines durable identity, ownership, snapshots, events, imports, migrations, provenance, deletion, and recovery.
7. The UX specification defines information architecture, state presentation, responsive transformations, focus, announcements, visual/textual map equivalence, and recovery flows.
8. Approved decision registers define the PWA, IndexedDB, service-worker, three-slot, migration, privacy, accessibility, content, hosting, release, monitoring, and maintenance direction.

### 2.2 Precedence

When requirements conflict, apply this order:

1. Later approved decision-register ruling.
2. DRS for mechanical legality, timing, random behaviour, and rule evidence.
3. FRD for observable functional behaviour.
4. Data Model for durable ownership, persistence, identity, history, import, migration, and recovery.
5. UX specification for information hierarchy, interaction, focus, announcements, and responsive presentation.
6. PRD and [MVP Scope](mvp-scope-v0.1.md) for product and release boundaries.
7. This document for measurable quality attributes and verification thresholds.
8. Architecture and implementation documents for technical realisation.

### 2.3 Inherited approved baselines

The following constraints are not proposals in this document:

- installable static Progressive Web Application;
- service-worker-cached application shell and approved static content;
- IndexedDB game state and no backend dependency for core play;
- three named local save slots with last-valid recovery;
- versioned export and validated import;
- explicit sequential migrations;
- independent deterministic random streams persisted before presentation;
- six-segment dungeon target, ten-segment hard maximum, and at least 100,000 seeds per dungeon type;
- complete active/incomplete mechanical history, completion summary plus final 500 events for completed dungeons, and latest 200 shown by default;
- current and previous two major versions of Chrome, Edge, Firefox, and Safari;
- 360, 390, 768, 1024, 1280, and 1440 CSS-pixel validation widths;
- phone-browser support as Must;
- WCAG 2.2 Level AA;
- keyboard, NVDA, VoiceOver, TalkBack, reduced-motion, and textual-map coverage;
- local-private data by default and no hidden telemetry;
- static CDN deployment, protected release process, immutable artifacts, retained prior release, and rollback;
- item-level provenance, required notices, zero blocked content, and no copied trade dress;
- free access with no monetisation flow.

---

## 3. Quality Context

### 3.1 Highest-risk qualities

The quality attributes with the highest product impact are:

1. **Rules correctness:** software must never produce an unsupported result, consume the wrong random value, or hide the evidence needed to verify an outcome.
2. **Data integrity:** adventurers, dungeons, items, drops, corpses, Graveyard records, event history, notes, rules/content versions, and recovery data have persistent player value.
3. **Recovery:** interrupted writes, quota problems, invalid imports, failed migrations, incompatible data, and update activation must not cause silent reset or false success.
4. **Offline continuity:** after the application is ready locally, ordinary core play must not depend on the network.
5. **Accessible equivalence:** keyboard and assistive-technology users must receive the same required state, legal actions, results, and map information.
6. **Responsive viability:** the complete journey must remain operable on supported phone, tablet, and desktop widths.
7. **Privacy:** private play data, notes, history, Graveyard details, and backups must remain local unless the user deliberately exports or attaches them.
8. **Release integrity:** public artifacts must be reproducible, rights-safe, rollback-capable, and traceable to an approved commit.
9. **Maintainability:** rules, content, UI, persistence, migration, and diagnostics must remain independently testable.
10. **Performance under accumulated history:** maps, history, imports, migrations, recovery, and save operations must remain understandable and responsive as local data grows.

### 3.2 Quality failure severity

| Severity | Definition | Release treatment |
|---|---|---|
| Blocker | Prevents build, launch, core journey completion, or release validation for all users in a required environment. | Release blocked |
| Critical | Causes silent data loss/corruption, unsupported mechanical result, exploitable severe security/privacy exposure, inaccessible core journey, or unrecoverable migration/import failure. | Release blocked |
| High | Breaks a Must workflow or quality target for a material subset of supported users with no safe workaround. | Release blocked unless explicitly waived by Product, Technical, QA, and relevant specialist owner |
| Medium | Degrades a Should target or has a safe, documented workaround. | May release with documented owner and plan |
| Low | Cosmetic, minor, or non-blocking quality deviation. | Tracked according to normal prioritisation |

---

## 4. Scope and Assumptions

### 4.1 In scope

- Quality requirements for the Palace production-intent prototype and six-dungeon Core MVP.
- Online first load, offline repeat use, PWA installation where supported, and service-worker updates.
- Local IndexedDB persistence, save slots, snapshots, migrations, export/import, deletion, and recovery.
- Rules calculations, random streams, dungeon generation, event history, content packages, and traceability.
- Desktop, tablet, and phone browser use across the approved matrix.
- Keyboard, screen reader, zoom/reflow, contrast, reduced motion, touch, and textual map.
- Static hosting, release artifacts, deployment, rollback, smoke tests, and availability checks.
- Privacy-safe diagnostics and voluntary feedback support.
- Content provenance, dependency licences, notices, build gates, and release evidence.

### 4.2 Out of scope

- Backend, account, cloud-save, multiplayer, synchronisation, leaderboards, or authorisation service quality.
- Native mobile or desktop application certification.
- Payment, subscription, advertising, or commerce quality.
- Localised release quality.
- Expanded World or other separately approved content packs.
- Security controls for unapproved accounts, APIs, server databases, or user-to-user sharing.
- Production-art performance beyond assets approved for the Core MVP.
- Final vendor-specific operational procedures, which belong to the architecture/deployment specification.

### 4.3 Assumptions

| ID | Assumption | Validation |
|---|---|---|
| NFA-001 | Core play remains static-client and local-first with no required application backend. | Architecture review and network-offline tests |
| NFA-002 | Supported browsers provide IndexedDB and service-worker capabilities in ordinary non-private contexts. | Browser capability matrix |
| NFA-003 | Private/incognito modes may restrict persistence and are not relied upon for durable saves. | Capability detection and warning test |
| NFA-004 | A static CDN can meet the proposed public availability objective without collecting private play data. | Hosting plan and external availability check |
| NFA-005 | Representative local data fits comfortably within ordinary browser origin quotas when retention rules and compaction are applied. | Storage fixtures and quota tests |
| NFA-006 | Bundled rules/content can be separated from executable code and versioned independently. | Repository and build review |
| NFA-007 | Deterministic fixtures can reproduce all critical rules, generation, migration, and persistence outcomes. | Test-harness demonstration |
| NFA-008 | The Palace prototype is representative enough to validate phone, accessibility, save/recovery, map, and pacing quality before remaining content production. | Prototype review |
| NFA-009 | No user-created HTML, scripts, executable plugins, or arbitrary code is required. | Scope and security review |
| NFA-010 | Export files are user-controlled backups and are not automatically uploaded or encrypted by the application. | UX, privacy, and architecture review |
| NFA-011 | Final production assets will respect the budgets defined here or obtain an approved budget change. | Build-size report |
| NFA-012 | Exact vendor and tool choices remain implementation decisions provided they satisfy these requirements. | Architecture traceability review |

---

## 5. Priority and Measurement Conventions

### 5.1 Priority

| Priority | Meaning |
|---|---|
| Must | Required for prototype/release acceptance unless formally waived with explicit risk acceptance. |
| Should | Important quality target; deferral requires documented impact, owner, and review point. |
| Could | Optional improvement that must not compromise a Must or Should. |
| Won't | Explicitly excluded from this release. |

### 5.2 Target status

| Status | Meaning |
|---|---|
| Approved baseline | Already controlled by an approved upstream document. |
| Proposed | Recommended measurable target introduced by this NFR draft; becomes binding upon approval. |
| Derived | Directly quantified from an approved upstream requirement without changing its intent. |
| Downstream | Must be implemented or expanded in architecture, test, content, or operational documentation. |

### 5.3 Reference test profiles

Performance results shall identify browser build, operating system, hardware class, viewport, cache state, network state, data fixture, application commit, content version, schema version, and sample count.

| Profile | Definition | Primary use |
|---|---|---|
| REF-DESKTOP | Four or more logical CPU cores, 8 GiB RAM, 1280×720 or larger viewport, hardware at least five years old or equivalent throttling, stable 10 Mbps down / 2 Mbps up, 100 ms round-trip latency. | Desktop performance and compatibility |
| REF-MOBILE | Four-core mobile-class CPU or equivalent browser throttling, 4 GiB RAM, 390×844 viewport, stable 10 Mbps down / 2 Mbps up, 150 ms round-trip latency. | Phone performance and touch/responsive testing |
| REF-MIN-WIDTH | Supported browser at 360 CSS pixels wide, 100% zoom, portrait orientation. | Minimum supported layout |
| REF-OFFLINE | Application previously loaded and marked offline-ready; network disabled before navigation or play. | Offline continuity |
| REF-LARGE-SAVE | Three slots populated with all six dungeon definitions, at least 20 adventurers and 200 Graveyard records per slot, one active dungeon with 5,000 mechanical events, completed-dungeon retained histories, 2,000 item instances, and representative notes. | Storage, history, save, migration, export/import |
| REF-IMPORT-25 | Valid 25 MiB compressed-or-raw import package and a malformed package of the same size; uncompressed expansion capped by security requirements. | Import performance and safety |
| REF-AT-DESKTOP | Current stable Windows browser with NVDA and current stable macOS Safari with VoiceOver at release-candidate time. | Desktop assistive-technology validation |
| REF-AT-MOBILE | Current stable iOS Safari with VoiceOver and Android Chrome with TalkBack at release-candidate time. | Mobile assistive-technology validation |

### 5.4 Statistical conventions

- Interactive timings use at least 30 clean repetitions per profile and report median, p75, and p95.
- Cold-load tests use at least 20 clean-cache repetitions per required browser family.
- Save and rules-action performance uses at least 1,000 deterministic actions per relevant fixture.
- Fault-injection tests identify fault point, expected durable state, and observed recovery state.
- A percentile target passes only when the stated percentile is at or below the threshold and no Critical defect occurs.
- Browser/AT tests record exact versions at release-candidate freeze.
- File sizes use binary units: KiB, MiB, and GiB.
- Time limits exclude deliberate player confirmation time.
- “No data loss” means all required committed records remain equivalent by canonical comparison, not merely that a screen still opens.

---

## 6. Performance

### 6.1 User-perceived performance

| ID | Requirement | Target | Environment | Verification | Priority | Status |
|---|---|---|---|---|---:|---|
| NFR-PERF-001 | A cold online launch shall display a usable application shell and truthful loading state. | p75 ≤ 2.5 s; p95 ≤ 4.0 s | REF-MOBILE, clean cache | Browser performance test | Must | Proposed |
| NFR-PERF-002 | A cold online launch shall become ready for the first legal local action. | p75 ≤ 4.0 s; p95 ≤ 6.0 s | REF-MOBILE, clean cache | E2E timing | Must | Proposed |
| NFR-PERF-003 | A repeat launch from a valid service-worker cache shall become ready. | p75 ≤ 1.5 s; p95 ≤ 2.5 s | REF-MOBILE and REF-OFFLINE | E2E timing | Must | Proposed |
| NFR-PERF-004 | Navigation between already-loaded primary local views shall complete. | p95 ≤ 250 ms | REF-DESKTOP and REF-MOBILE | Automated interaction timing | Should | Proposed |
| NFR-PERF-005 | Opening a drawer, sheet, dialog, inventory, or current-segment panel shall show its initial content. | p95 ≤ 200 ms | REF-MOBILE, normal save | Component/E2E timing | Should | Proposed |
| NFR-PERF-006 | A non-generation rules calculation shall resolve and make its committed result available. | p95 ≤ 100 ms; maximum ≤ 250 ms | Supported devices, deterministic fixture | Automated rules benchmark | Must | Proposed |
| NFR-PERF-007 | A legal player action including validation, deterministic random consumption, state transition, event creation, and local commit shall complete. | p95 ≤ 500 ms; maximum ≤ 1.5 s | REF-LARGE-SAVE | Integration benchmark | Must | Proposed |
| NFR-PERF-008 | A new dungeon floor/segment generation action shall resolve, validate graph invariants, commit, and display. | p95 ≤ 750 ms; maximum ≤ 2.0 s | REF-MOBILE, approved generation constants | Integration benchmark | Must | Proposed |
| NFR-PERF-009 | Save-state UI shall enter saving/pending state promptly after a state-changing action. | ≤ 100 ms | Supported devices | UI integration test | Must | Proposed |
| NFR-PERF-010 | A successful ordinary save commit shall show truthful completion. | p95 ≤ 500 ms; maximum ≤ 1.5 s | REF-LARGE-SAVE | Persistence benchmark | Must | Proposed |
| NFR-PERF-011 | A failed save shall show failure and block unsafe continuation. | ≤ 1.0 s after failure is known | Fault-injection profile | E2E fault test | Must | Proposed |
| NFR-PERF-012 | Current history shall show the latest 200 events. | p95 ≤ 500 ms | REF-LARGE-SAVE | Fixture/E2E benchmark | Should | Proposed |
| NFR-PERF-013 | Loading another retained page of up to 500 events shall complete without blocking core play. | p95 ≤ 1.0 s | REF-LARGE-SAVE | Fixture/E2E benchmark | Should | Proposed |
| NFR-PERF-014 | Graveyard search/filter/sort over the reference fixture shall update. | p95 ≤ 300 ms | REF-LARGE-SAVE | UI benchmark | Should | Proposed |
| NFR-PERF-015 | Export generation shall complete or present progress. | p95 ≤ 5 s for 25 MiB logical package | REF-LARGE-SAVE | Integration benchmark | Should | Proposed |
| NFR-PERF-016 | Import parsing, validation, supported migration, and preview shall complete. | p95 ≤ 8 s for REF-IMPORT-25; progress visible after 1 s | REF-DESKTOP and REF-MOBILE | Integration benchmark | Must | Proposed |
| NFR-PERF-017 | Application startup shall not synchronously process unbounded history. | Initial view reads only bounded indexes/pages required by the UX | REF-LARGE-SAVE | Profiling and code review | Must | Derived |
| NFR-PERF-018 | Long-running work shall not make required controls unresponsive. | No main-thread task > 200 ms without documented exception; cancellation/recovery remains available where safe | REF-MOBILE | Browser profiling | Should | Proposed |

### 6.2 Resource budgets

| Resource | Budget | Verification | Priority | Status |
|---|---:|---|---:|---|
| Initial executable JavaScript | ≤ 350 KiB gzip/brotli transferred for first usable shell | Build report | Should | Proposed |
| Total application JavaScript | ≤ 1.25 MiB gzip/brotli, excluding source maps and development tools | Build report | Should | Proposed |
| Initial CSS | ≤ 100 KiB gzip/brotli | Build report | Should | Proposed |
| Initial HTML + manifest + critical icons | ≤ 150 KiB transferred | Build report | Should | Proposed |
| Core bundled content package | ≤ 8 MiB compressed, excluding separately approved production art/audio | Build report and content manifest | Should | Proposed |
| Complete first-install offline cache | ≤ 30 MiB for Core MVP | Service-worker cache inspection | Should | Proposed |
| Individual raster image | Prefer ≤ 250 KiB at delivered viewport; larger assets require responsive variants and review | Asset audit | Should | Proposed |
| Individual font family | ≤ 200 KiB delivered, with system-font fallback; additional families require review | Asset audit | Should | Proposed |
| Source maps in public production response | Not publicly served unless access is controlled and privacy/security review approves | Deployment inspection | Must | Proposed |

### 6.3 Storage performance budgets

| ID | Requirement | Target | Verification | Priority |
|---|---|---|---|---:|
| NFR-PERF-019 | The application shall remain operable with REF-LARGE-SAVE. | All Must timing targets continue to pass | Full fixture suite | Must |
| NFR-PERF-020 | App-owned persistent data shall be indexed for common lookups rather than fully scanned. | No full-store scan on launch, current-segment view, ordinary save, or latest-history view | Profiling / architecture review | Must |
| NFR-PERF-021 | Compaction shall never run inside a committed mechanical action without bounded work or deferral. | Action timing remains within NFR-PERF-007 | Fault/performance test | Must |
| NFR-PERF-022 | Quota estimation and usage reporting shall not block core play. | p95 ≤ 250 ms or run asynchronously | Browser test | Should |

---

## 7. Reliability and Data Integrity

### 7.1 Core integrity

| ID | Requirement | Target / behaviour | Verification | Priority | Status |
|---|---|---|---|---:|---|
| NFR-REL-001 | Committed user changes shall survive normal reload and browser restart. | 100% of Must persistence scenarios | Integration/E2E | Must | Approved baseline |
| NFR-REL-002 | Failed saves shall never be reported as successful. | Zero false-success states | Fault injection | Must | Approved baseline |
| NFR-REL-003 | A state-changing action shall commit domain state, random-stream state, event evidence, and persistence metadata atomically. | Zero partial committed actions | Transaction/fault tests | Must | Derived |
| NFR-REL-004 | A retry after an uncommitted failure shall not duplicate an action or consume an additional random value. | 100% deterministic equivalence | Fault/retry fixtures | Must | Derived |
| NFR-REL-005 | Import validation and migration staging shall not mutate current valid data before confirmation and successful commit. | Existing slots byte/canonical-equivalent after any rejected import | Integration test | Must | Approved baseline |
| NFR-REL-006 | Completed roll records shall not be silently recalculated after code, rules, or content changes. | Stored natural dice, modifiers, final result, versions, and linked state remain stable | Migration regression | Must | Approved baseline |
| NFR-REL-007 | Sequential schema migration shall be deterministic. | Same canonical input and target version produce equivalent output | Unit/integration | Must | Approved baseline |
| NFR-REL-008 | A successfully applied migration step shall be idempotent where re-entry is technically possible, or shall reject re-entry safely. | No duplicate transformation | Migration tests | Must | Proposed |
| NFR-REL-009 | Destructive actions shall require explicit confirmation and identify exact scope. | Zero mutation on cancel; no ambiguous target | E2E/manual | Must | Approved baseline |
| NFR-REL-010 | Application reset shall remove only application-owned data for the named scope. | Unrelated origin data and other save slots remain untouched | Integration test | Must | Approved baseline |
| NFR-REL-011 | Item identity shall remain stable through inventory, equipment, drops, sale, consumption, death, and recovery until explicit destruction. | Zero duplicate/live multi-location identities | Domain/integration tests | Must | Derived |
| NFR-REL-012 | Dungeon topology and mechanically relevant segment state shall persist across expeditions and replacement adventurers. | 100% equivalence across close/reopen and import/export | E2E fixtures | Must | Approved baseline |
| NFR-REL-013 | Death, Graveyard record, belongings container, and resulting save shall commit as one durable outcome. | Zero orphaned or contradictory death records | Fault injection | Must | Derived |
| NFR-REL-014 | Completed dungeons shall preserve the approved summary and retained event boundary. | Summary present; final 500 mechanical events retained; latest 200 shown by default | Retention tests | Must | Approved baseline |
| NFR-REL-015 | Active/incomplete dungeons shall retain complete mechanical history. | Zero mechanical event loss before completion/archive policy applies | Fixture/migration tests | Must | Approved baseline |
| NFR-REL-016 | Player notes shall remain separate from immutable mechanical events. | Editing/deleting a note changes no mechanical record | Domain/E2E | Must | Derived |
| NFR-REL-017 | Save-slot validation shall isolate an invalid or incompatible slot. | Other valid slots remain loadable and unchanged | Fault/E2E | Must | Approved baseline |
| NFR-REL-018 | Unsupported data shall not trigger silent reset, downgrade, or partial load. | Explicit incompatible/recovery state | E2E | Must | Approved baseline |
| NFR-REL-019 | Service-worker update activation shall not interrupt or replace an unresolved committed-state write. | Update deferred until safe save point | Update/fault E2E | Must | Approved baseline |
| NFR-REL-020 | Definitions referenced by durable state shall be resolvable by stable ID and version or produce an explicit compatibility failure. | Zero silent substitution | Migration/content tests | Must | Derived |

### 7.2 Fault and endurance targets

| ID | Requirement | Target | Verification | Priority |
|---|---|---|---|---:|
| NFR-REL-021 | Persistence fault matrix shall cover write interruption before, during, and after each atomic boundary. | At least 1,000 injected failures across representative actions with zero silent corruption | Automated fault suite | Must |
| NFR-REL-022 | Import fault matrix shall cover malformed syntax, invalid schema, unsupported future version, missing references, bad checksums, excessive size, and interrupted replacement. | 100% rejected safely or recovered to prior valid state | Automated import suite | Must |
| NFR-REL-023 | Migration fault matrix shall cover interruption at every migration step and snapshot switch. | Zero partial active-state migration | Automated migration suite | Must |
| NFR-REL-024 | Repeated ordinary play shall not accumulate duplicate events, items, snapshots, or random consumption. | 10,000 deterministic actions with invariant checks after every action | Endurance test | Must |
| NFR-REL-025 | Approved dungeon generation shall terminate and reach a boss. | Zero non-terminating or unreachable-boss cases across ≥100,000 seeds per dungeon type | Simulation harness | Must |
| NFR-REL-026 | Invariant validation shall run before importing, activating a migrated slot, or accepting a generated dungeon. | 100% invalid fixtures rejected before activation | Integration tests | Must |
| NFR-REL-027 | A recovered state shall identify its snapshot source and recovery reason. | Recovery metadata present and inspectable | E2E/data inspection | Should |
| NFR-REL-028 | The application shall preserve the previous valid state when a new commit fails. | Canonical comparison equal to prior state | Fault tests | Must |
| NFR-REL-029 | Storage compaction or archival shall be deterministic and shall not remove records required by approved retention. | Canonical retained set matches policy | Unit/integration | Must |
| NFR-REL-030 | Closing and reopening at every committed action boundary shall resume at the exact legal committed state. | 100% of boundary fixtures | E2E matrix | Must |

---

## 8. Availability and Offline Behaviour

| ID | Requirement | Target / behaviour | Verification | Priority | Status |
|---|---|---|---|---:|---|
| NFR-AVL-001 | After a successful first load and offline-ready confirmation, ordinary Core MVP play shall work without a network connection. | 100% of Must core journeys excluding first install, optional external links, feedback submission, and update download | REF-OFFLINE E2E | Must | Approved baseline |
| NFR-AVL-002 | Offline readiness shall be reported only after required shell and approved static content are verifiably cached. | Zero premature offline-ready state | Service-worker tests | Must | Derived |
| NFR-AVL-003 | A missing optional asset shall not prevent rules, persistence, textual map, or recovery use. | Core journey remains usable with placeholder/fallback | Asset-failure tests | Must | Proposed |
| NFR-AVL-004 | Network-dependent features shall show clear unavailable and retry states. | No indefinite spinner; no false save risk | Offline/manual tests | Must | Proposed |
| NFR-AVL-005 | Local-only storage shall be described accurately and shall not imply cloud backup. | Notice visible on first use, Data area, export, and recovery contexts | UX/content review | Must | Approved baseline |
| NFR-AVL-006 | Recovery and reset guidance shall remain reachable when a slot cannot load. | User can access last-valid review, export where safe, other slots, and scoped reset | E2E | Must | Approved baseline |
| NFR-AVL-007 | PWA installation shall be optional. | Complete Core MVP remains usable in a normal supported browser tab | Browser matrix | Must | Approved baseline |
| NFR-AVL-008 | Browsers that do not offer installation shall not show a broken install requirement. | No blocked workflow | Browser matrix | Must | Proposed |
| NFR-AVL-009 | The hosted static application shall target monthly availability. | ≥99.5% successful shell response, excluding announced maintenance and broad upstream Internet/CDN incidents | External synthetic check | Should | Proposed |
| NFR-AVL-010 | Release-critical static assets shall be served over HTTPS. | 100% production requests; HTTP redirects or fails closed | Deployment inspection | Must | Proposed |
| NFR-AVL-011 | A failed update download shall leave the current working version available. | 100% update-failure scenarios preserve prior shell | Service-worker E2E | Must | Approved baseline |
| NFR-AVL-012 | A new release shall not activate during an unsafe gameplay state. | Activation deferred to documented safe point and user informed where needed | Update E2E | Must | Approved baseline |
| NFR-AVL-013 | The prior production artifact shall remain deployable. | Previous release retained until next release is accepted and rollback window closes | Release audit | Must | Approved baseline |
| NFR-AVL-014 | A hosting outage shall not prevent already-cached ordinary play. | Cached app completes offline core journey | REF-OFFLINE | Must | Derived |
| NFR-AVL-015 | Private/incognito or restricted-storage environments shall fail gracefully. | Persistence limitation detected on first meaningful write and explained before relying on durability | Browser/fault test | Must | Proposed |

---

## 9. Security

### 9.1 Security context

Protected assets include:

- save slots, adventurer names, notes, dungeon state, inventories, event history, Graveyard records, and recovery snapshots;
- imported/exported backup files;
- random seeds and deterministic stream states;
- application, rules, content, schema, and migration integrity;
- release artifacts, manifests, deployment credentials, and source-control protections;
- privacy-safe diagnostics generated for voluntary support.

The Core MVP has no approved accounts, backend API, cloud database, shared saves, payments, plugins, or executable user content. Controls for those systems are outside scope until separately approved.

### 9.2 Application security requirements

| ID | Requirement | Threat / rationale | Verification | Priority | Status |
|---|---|---|---|---:|---|
| NFR-SEC-001 | User-authored names and notes shall render as text, not executable HTML or script. | Stored/reflected XSS | Automated and manual security tests | Must | Proposed |
| NFR-SEC-002 | Imported files shall be parsed strictly as data and validated before use. | Malicious/malformed import | Unit/integration | Must | Approved baseline |
| NFR-SEC-003 | Import parsers shall enforce package, entry-count, nesting, string-length, and uncompressed-size limits before activation. | Resource exhaustion / decompression bomb | Adversarial import tests | Must | Proposed |
| NFR-SEC-004 | The maximum accepted input package shall be 25 MiB unless a later approved architecture raises it; uncompressed parsed data shall be capped at 100 MiB. | Memory/storage exhaustion | Boundary tests | Must | Proposed |
| NFR-SEC-005 | Exported data shall contain only the selected documented application scope. | Unrelated data exposure | Export inspection | Must | Approved baseline |
| NFR-SEC-006 | Production shall use a restrictive Content Security Policy without unsafe inline script or dynamic code evaluation, except a reviewed nonce/hash mechanism if required. | XSS/supply chain | Header/build inspection | Must | Proposed |
| NFR-SEC-007 | Production shall set `X-Content-Type-Options: nosniff`, a restrictive `Referrer-Policy`, suitable `Permissions-Policy`, and anti-framing protection through CSP `frame-ancestors`. | MIME confusion, referrer leakage, unwanted permissions, clickjacking | Header scan | Must | Proposed |
| NFR-SEC-008 | Application code shall not use `eval`, `new Function`, remote script execution, or runtime code download. | Arbitrary code execution | Static review | Must | Proposed |
| NFR-SEC-009 | Third-party runtime requests shall be absent from ordinary core play unless separately approved, documented, and compatible with offline/privacy requirements. | Tracking/supply-chain exposure | Network inspection | Must | Approved baseline |
| NFR-SEC-010 | External links shall use safe navigation and shall not grant the destination access to the opener. | Tabnabbing | Component test | Should | Proposed |
| NFR-SEC-011 | Production builds shall not expose credentials, deployment tokens, private keys, unpublished endpoints, or debug secrets. | Secret leakage | Secret scan/build inspection | Must | Proposed |
| NFR-SEC-012 | Deployment credentials shall be stored only in approved secret storage with least privilege. | Repository/account compromise | Operations review | Must | Proposed |
| NFR-SEC-013 | Release artifacts shall be generated from a reviewed protected ref and identified by commit/hash. | Artifact tampering | Release audit | Must | Approved baseline |
| NFR-SEC-014 | Content and migration manifests shall include integrity metadata sufficient to detect accidental or unauthorised change. | Content/schema tampering | Manifest validation | Must | Derived |
| NFR-SEC-015 | Imported references shall resolve only to approved schema/content types and shall not request arbitrary local or network resources. | Path/URL injection | Adversarial tests | Must | Proposed |
| NFR-SEC-016 | Filenames suggested for export shall exclude path separators, control characters, and executable extensions. | Unsafe file handling/social engineering | Unit/E2E | Should | Proposed |
| NFR-SEC-017 | Application errors shall not expose raw stack traces, local file contents, full imports, notes, or internal secrets to ordinary users. | Information disclosure | Error inspection | Must | Proposed |
| NFR-SEC-018 | Release builds shall contain no known exploitable Critical or High dependency vulnerability without an explicit security waiver. | Supply-chain compromise | Dependency audit | Must | Proposed |
| NFR-SEC-019 | A Critical vulnerability with plausible Core MVP impact shall block release; a High vulnerability requires documented exploitability assessment and waiver if unresolved. | Risk governance | Release review | Must | Proposed |
| NFR-SEC-020 | Security-sensitive dependency and browser changes shall be reviewed at least quarterly and before each public release. | Stale controls | Review record | Must | Approved baseline / proposed detail |
| NFR-SEC-021 | Application-owned IndexedDB data shall not be treated as confidential against another process or person with access to the same browser profile. | False security claim | Privacy/security copy review | Must | Proposed |
| NFR-SEC-022 | Export files shall warn that they may contain private data and are not encrypted by default. | Backup exposure | UX/security review | Must | Proposed |
| NFR-SEC-023 | No anti-cheat, DRM, obfuscation, or device fingerprinting shall be introduced for Core MVP. | Scope/privacy conflict | Code/network review | Must | Derived |
| NFR-SEC-024 | The application shall request no browser permission not required by an approved workflow. | Unnecessary privilege | Permissions/network review | Must | Proposed |

### 9.3 Secure development and response

| ID | Requirement | Target | Verification | Priority |
|---|---|---|---|---:|
| NFR-SEC-025 | Static analysis, dependency audit, and secret scan shall run on release candidates. | 100% release candidates; no unreviewed failure | CI evidence | Must |
| NFR-SEC-026 | Security defects shall use the project severity model. | Critical and High release treatment as Section 3.2 | Defect review | Must |
| NFR-SEC-027 | A newly confirmed Critical vulnerability affecting production shall receive owner triage within one business day. | Triage record | Operations audit | Should |
| NFR-SEC-028 | A security fix shall not bypass rules, persistence, migration, accessibility, or content gates. | Full affected regression suite passes | Release evidence | Must |
| NFR-SEC-029 | Security waivers shall name scope, rationale, compensating controls, owner, expiry/review date, and affected releases. | Complete waiver record | Release review | Must |

---

## 10. Privacy

| ID | Requirement | Target / behaviour | Verification | Priority | Status |
|---|---|---|---|---:|---|
| NFR-PRIV-001 | The application shall collect only data necessary for approved local workflows. | No undeclared collection | Data-flow review | Must | Approved baseline |
| NFR-PRIV-002 | Save data, names, notes, history, Graveyard details, seeds, and imports shall remain local unless the user deliberately exports or attaches them. | Zero automatic upload | Network/code review | Must | Approved baseline |
| NFR-PRIV-003 | Private user-authored content shall not be used for marketing, examples, analytics, AI training, or product research without explicit separate permission. | Default private | Policy/code review | Must | Approved baseline |
| NFR-PRIV-004 | Analytics, session replay, advertising, fingerprinting, and behavioural tracking shall be absent unless separately approved through a documented privacy decision. | Zero tracker requests/cookies | Network/storage inspection | Must | Approved baseline |
| NFR-PRIV-005 | Ordinary Core MVP use shall set no nonessential cookie. | Zero nonessential cookies | Browser inspection | Must | Proposed |
| NFR-PRIV-006 | Storage location, durability limits, private-mode risks, and backup responsibilities shall be explained in plain language. | Notices discoverable and comprehension tested | UX/privacy review | Must | Approved baseline |
| NFR-PRIV-007 | Export shall warn that the file may contain names, notes, history, Graveyard records, seeds, and complete game state. | Warning before file generation or download | E2E/UX | Must | Approved baseline |
| NFR-PRIV-008 | Import preview shall identify the private-data scope before replacement. | Counts/scope shown; no mutation | E2E | Must | Approved baseline |
| NFR-PRIV-009 | Reset/deletion shall state what local data is removed and that user-controlled exports may remain elsewhere. | Accurate scoped notice | UX/content review | Must | Approved baseline |
| NFR-PRIV-010 | Feedback links shall not automatically attach save data, diagnostics, event history, or identifiers. | Zero automatic attachment | Network/E2E | Must | Approved baseline |
| NFR-PRIV-011 | A diagnostic package shall be generated only after an explicit user action and shall be reviewable before attachment. | User can inspect included fields and cancel | E2E/privacy review | Must | Approved baseline |
| NFR-PRIV-012 | Default diagnostic data shall exclude names, notes, event bodies, item names chosen by users, Graveyard details, seeds, full backups, and raw storage records. | Zero prohibited fields | Fixture inspection | Must | Proposed |
| NFR-PRIV-013 | Privacy-safe diagnostics may include app/schema/rules/content versions, browser family/major, OS family, storage availability/usage bands, error codes, and anonymised invariant counts. | Explicit allowlist only | Schema review | Should | Proposed |
| NFR-PRIV-014 | Production diagnostics shall not persist private data to console, local logs, remote logs, or crash services. | Zero sensitive log findings | Log/network inspection | Must | Approved baseline |
| NFR-PRIV-015 | Hosting and CDN metrics shall be limited to availability, deployment, asset delivery, and aggregate infrastructure information. | No play-state or user-content metrics | Vendor/config review | Must | Approved baseline |
| NFR-PRIV-016 | Any unavoidable infrastructure access-log retention shall be documented, minimised, and reviewed before public release. | Named provider, fields, retention, access, and deletion documented | Operations/privacy review | Must | Proposed |
| NFR-PRIV-017 | The application shall not claim anonymity, encryption, secure deletion, or cloud backup that it does not provide. | Accurate copy | Content/privacy review | Must | Proposed |
| NFR-PRIV-018 | Local data shall have no project-imposed expiry. | Retained until user action, browser eviction, migration failure, or approved retention/compaction rule | Persistence test | Must | Derived |
| NFR-PRIV-019 | Player-controlled names shall be limited to 40 grapheme clusters and notes to 10,000 grapheme clusters per note unless later usability evidence approves a change. | Validation without splitting grapheme clusters | Unit/E2E | Should | Proposed |
| NFR-PRIV-020 | A save-slot display name shall be limited to 40 grapheme clusters and shall safely render control characters as invalid. | Validation and safe display | Unit/E2E | Should | Proposed |

---

## 11. Accessibility

### 11.1 Standard and evidence

Target standard: **WCAG 2.2 Level AA**.

Automated scans are supporting evidence only. Core-flow keyboard, screen-reader, zoom/reflow, contrast, reduced-motion, and touch tests require manual or assisted review.

### 11.2 Requirements

| ID | Requirement | Target | Verification | Priority | Status |
|---|---|---|---|---|---:|---|
| NFR-A11Y-001 | All Must workflows and controls shall be keyboard operable. | 100% core journey; no keyboard trap | Full keyboard walkthrough | Must | Approved baseline |
| NFR-A11Y-002 | Focus order shall follow task and reading order. | No unexplained focus jump or lost focus | Manual/AT | Must | Approved baseline |
| NFR-A11Y-003 | Focus shall remain visible and not be obscured by sticky headers, sheets, or navigation. | WCAG 2.2 focus criteria pass | Manual/visual | Must | Proposed detail |
| NFR-A11Y-004 | Dialog and sheet focus shall move to a labelled context, remain contained where modal, and restore to the invoking control or safe successor. | 100% modal components | Component/manual | Must | Approved baseline |
| NFR-A11Y-005 | Every input shall have an accessible name, instructions where needed, and programmatically associated validation error. | 100% required forms | Automated/manual | Must | Approved baseline |
| NFR-A11Y-006 | Headings, landmarks, lists, tables, statuses, and controls shall expose semantic structure. | No core screen depends on visual position alone | Screen-reader review | Must | Approved baseline |
| NFR-A11Y-007 | Meaning shall not depend on colour alone. | Text, icon, pattern, state, or position also conveys meaning | Visual/manual | Must | Approved baseline |
| NFR-A11Y-008 | Text contrast shall meet WCAG AA. | 4.5:1 normal text; 3:1 large text | Automated/manual | Must | Derived |
| NFR-A11Y-009 | Non-text UI and focus indicators shall meet applicable WCAG contrast. | 3:1 against adjacent colours where required | Automated/manual | Must | Derived |
| NFR-A11Y-010 | Visual and textual maps shall expose equivalent required topology, current position, occupancy, connections, route, and legal actions. | 100% parity in mapped Must scenarios | Parity test | Must | Approved baseline |
| NFR-A11Y-011 | Dice, table, modifier, result, and state-change evidence shall have a readable text representation. | 100% mechanical result types | Screen-reader/manual | Must | Approved baseline |
| NFR-A11Y-012 | Dynamic roll, turn, save, import, migration, recovery, error, death, and completion states shall be announced appropriately. | Announcement matrix passes without repetitive focus theft | AT smoke and task tests | Must | Approved baseline |
| NFR-A11Y-013 | Polite status updates shall not steal focus. | Save/success announcements preserve current task | AT review | Must | Approved baseline |
| NFR-A11Y-014 | Assertive announcements shall be limited to urgent failure or major context changes. | No repeated or overlapping urgent announcements | AT review | Should | Proposed |
| NFR-A11Y-015 | Text shall support 200% browser zoom without loss of content or required function. | All supported widths and core screens | Responsive/manual | Must | Derived |
| NFR-A11Y-016 | Core content shall reflow at an effective width of 320 CSS pixels without two-dimensional scrolling, except intrinsically spatial content with a textual equivalent. | WCAG reflow audit passes | Manual | Must | Proposed detail |
| NFR-A11Y-017 | Text-spacing overrides shall not cause loss or overlap. | WCAG text-spacing values pass | Browser/manual | Must | Derived |
| NFR-A11Y-018 | User preference for reduced motion shall be respected. | No essential information depends on motion; nonessential animation removed/reduced | Browser preference test | Must | Approved baseline |
| NFR-A11Y-019 | Primary and destructive touch controls shall provide a target of at least 44×44 CSS pixels where layout permits. | 100% primary/destructive phone controls | Mobile inspection | Should | Proposed |
| NFR-A11Y-020 | No essential touch target shall be smaller than 24×24 CSS pixels unless an allowed spacing/equivalent-control exception is documented. | WCAG 2.2 target-size audit | Mobile inspection | Must | Derived |
| NFR-A11Y-021 | Pointer actions shall have keyboard and non-drag alternatives. | 100% required actions | Input-mode tests | Must | Derived |
| NFR-A11Y-022 | Time limits shall not be imposed on ordinary play, decisions, reading, or recovery. | Zero player-facing expiration except technical sessions not present in MVP | E2E/review | Must | Proposed |
| NFR-A11Y-023 | Error messages shall identify the affected control/context, data impact, and recovery action in text. | 100% release-blocking errors | Content/AT review | Must | Approved baseline |
| NFR-A11Y-024 | The active adventurer, current segment, HP, armour, torches/light, turn, target, and save state shall be programmatically available. | 100% applicable play states | AT review | Must | Derived |
| NFR-A11Y-025 | Content shall remain usable in forced-colours/high-contrast modes supported by target platforms. | Core journey passes with visible focus/status | Manual | Should | Proposed |
| NFR-A11Y-026 | Auto-playing audio, flashing content, and motion-triggered effects shall not be required. | Zero prohibited content | Asset/UX review | Must | Proposed |
| NFR-A11Y-027 | Page/document language shall be identified as English for Core MVP. | Valid language metadata | Automated/manual | Must | Derived |
| NFR-A11Y-028 | Every Wireloom-informed implemented screen shall be reviewed for keyboard order, accessible naming, state semantics, and map equivalence. | 100% implemented core screens | UX/AT review | Must | Proposed |

### 11.3 Assistive-technology release matrix

| Environment | Coverage | Priority |
|---|---|---:|
| Windows + current stable Chrome + current stable NVDA | Full Must journey, visual/text map parity, forms, dialogs, combat, import/recovery | Must |
| Windows + current stable Firefox + current stable NVDA | Critical smoke journey and all known browser-specific defects | Must |
| macOS + current stable Safari + current stable VoiceOver | Full Must journey | Must |
| iOS + current stable Safari + VoiceOver | Phone core journey, map/text parity, combat, capacity sheet, save/recovery | Must |
| Android + current stable Chrome + TalkBack | Phone core journey, map/text parity, combat, capacity sheet, save/recovery | Must |
| Keyboard-only in every required desktop browser family | Full Must journey | Must |

Exact version numbers shall be frozen in the release test report, not hard-coded permanently in this document.

---

## 12. Compatibility and Responsive Support

### 12.1 Supported browser policy

| Platform | Browser policy | Priority | Notes |
|---|---|---:|---|
| Desktop | Chrome current and previous two major versions | Must | Windows representative coverage |
| Desktop | Edge current and previous two major versions | Must | Windows representative coverage |
| Desktop | Firefox current and previous two major versions | Must | Windows and/or macOS representative coverage |
| Desktop | Safari current and previous two major versions | Must | macOS |
| Mobile | Safari current and previous two major versions | Must | iOS/iPadOS where available |
| Mobile | Chrome current and previous two major versions | Must | Android |
| Tablet | Safari and Chrome under the same policy | Must | Portrait and landscape representative devices |

“Current” is frozen at release-candidate start. A browser released after freeze is assessed through smoke testing and becomes part of the next scheduled review unless a severe compatibility issue requires immediate action.

### 12.2 Requirements

| ID | Requirement | Target / behaviour | Verification | Priority | Status |
|---|---|---|---|---:|---|
| NFR-COMP-001 | All Must workflows shall work at 360, 390, 768, 1024, 1280, and 1440 CSS pixels. | 100% responsive matrix | E2E/manual | Must | Approved baseline |
| NFR-COMP-002 | Required behaviour shall not depend on hover. | Zero hover-only action or explanation | Input-mode tests | Must | Approved baseline |
| NFR-COMP-003 | Portrait and landscape changes shall preserve committed state and current task. | Zero reset/duplicate action | Mobile/tablet tests | Must | Proposed |
| NFR-COMP-004 | Required controls shall remain visible, reachable, or predictably available through labelled navigation/drawers. | Zero clipped/unreachable Must control | Responsive review | Must | Approved baseline |
| NFR-COMP-005 | Dialogs and sheets shall fit the viewport and keep close/cancel/confirm reachable. | 100% modal components | Responsive E2E | Must | Approved baseline |
| NFR-COMP-006 | Long names, notes, errors, events, and notices shall wrap or truncate accessibly without overlap. | Boundary fixtures pass | Visual/AT tests | Must | Proposed |
| NFR-COMP-007 | Stored data shall remain compatible across supported browser updates subject to documented platform storage limits. | Reload/migration suite passes before browser support claim | Browser matrix | Must | Proposed |
| NFR-COMP-008 | PWA installation and standalone display shall be tested where the browser supports them. | Install, first launch, update, offline, and uninstall guidance smoke pass | Browser/PWA test | Should | Proposed |
| NFR-COMP-009 | Failure or absence of installation support shall not block browser play. | Full browser journey remains available | Browser matrix | Must | Approved baseline |
| NFR-COMP-010 | Unsupported or capability-restricted environments shall show documented limitations and safe options. | No silent data-durability assumption | Capability/fault tests | Must | Proposed |
| NFR-COMP-011 | The application shall feature-detect required APIs instead of relying only on user-agent detection. | IndexedDB/service-worker/storage capabilities checked | Code review/tests | Must | Proposed |
| NFR-COMP-012 | The service worker shall not serve incompatible application and content/schema combinations. | Version compatibility guard passes | Update E2E | Must | Derived |
| NFR-COMP-013 | Browser back/forward and refresh shall not duplicate committed gameplay actions. | 100% navigation-state fixtures | E2E | Must | Proposed |
| NFR-COMP-014 | Required browser storage failures shall produce a truthful recovery state. | Quota, blocked DB, transaction abort, and eviction fixtures pass | Fault tests | Must | Approved baseline |
| NFR-COMP-015 | The complete journey shall remain usable with touch, mouse/pointer, and keyboard where the platform supplies them. | Input matrix passes | Manual/E2E | Must | Proposed |
| NFR-COMP-016 | A visual-map rendering failure shall leave the textual map and legal actions available. | Textual fallback passes | Fault test | Must | Approved baseline |
| NFR-COMP-017 | Date/time display shall not affect canonical ordering or exported timestamps. | ISO-8601 storage; locale display only | Unit/integration | Must | Derived |
| NFR-COMP-018 | Unicode names and notes shall round-trip through save, migration, export, import, and display. | Canonical Unicode fixture passes | Integration | Must | Proposed |

---

## 13. Usability

| ID | Requirement | Target | Verification | Priority | Status |
|---|---|---|---|---|---:|---|
| NFR-USE-001 | A representative new player shall complete the agreed Palace core flow without facilitator intervention or external bookkeeping. | ≥80% of participants | Moderated prototype/UAT | Must | Approved baseline |
| NFR-USE-002 | Participants shall rate combat pacing, map clarity, and overall play acceptable or better. | ≥70% for each measure | Palace playtest | Must for Palace go | Approved baseline |
| NFR-USE-003 | A returning player shall identify active adventurer, current dungeon/segment, HP, torches/light, save state, and next legal action. | ≥80% identify all within 15 seconds | Task-based playtest | Should | Proposed |
| NFR-USE-004 | A new player shall understand that saves are local and that export protects against browser-data deletion. | ≥80% answer storage/backup comprehension questions correctly | First-use test | Must | Proposed |
| NFR-USE-005 | A user shown saving, saved, failed, migrating, incompatible, recovery, and offline-ready states shall identify the actual data condition. | ≥80% correct per critical state; 100% no false-success copy | Comprehension test | Must | Proposed |
| NFR-USE-006 | Common active-play actions shall require no more than two navigation transitions from the expedition or combat workspace. | Attack, move/open door, search, item use, inventory, textual map, retreat | UX review/E2E | Should | Proposed |
| NFR-USE-007 | A destructive confirmation shall communicate object/scope, consequence, cancel, and recovery/backup where applicable. | ≥90% identify affected slot/object and consequence | Usability test | Must | Proposed |
| NFR-USE-008 | Import preview shall communicate target slot, compatibility, counts, private-data scope, and replacement consequence. | ≥80% answer all target/consequence questions correctly | Usability test | Must | Proposed |
| NFR-USE-009 | Error messages shall explain what happened, whether committed data changed, and the next safe action. | 100% release-blocking errors reviewed; ≥80% user comprehension in sampled critical errors | Content/QA/playtest | Must | Approved baseline / proposed measure |
| NFR-USE-010 | Disabled actions shall expose the reason when understanding the guard is useful. | 100% rules-critical disabled actions | UX/rules review | Must | Approved baseline |
| NFR-USE-011 | Legal action labels shall be specific enough to distinguish target, cost, or scope where ambiguity could cause a different mechanical outcome. | Zero ambiguous Must action in review | UX/rules review | Must | Proposed |
| NFR-USE-012 | Rule evidence shall be inspectable without requiring the player to understand internal IDs. | Natural dice, table/result, modifier, final outcome, and linked state visible in plain language | UX/playtest | Must | Approved baseline |
| NFR-USE-013 | Repeated or accelerated actions shall never obscure costs, targets, random outcomes, or stopping conditions. | All repeated-action variants pass rules/UX review | E2E/manual | Must | Derived |
| NFR-USE-014 | The interface shall not require the original rulebook for ordinary approved core play. | 100% Must journey without external rules reference | UAT | Must | Approved baseline |
| NFR-USE-015 | User-created names/notes at maximum length shall not obscure survival-critical state or actions. | Boundary layouts pass all supported widths | Responsive review | Must | Proposed |
| NFR-USE-016 | The application shall provide plain-language About/Credits, privacy/local-save, export, and unofficial-product notices. | Notices discoverable in ≤3 navigation transitions from primary shell | UX/content review | Should | Proposed |

---

## 14. Maintainability and Testability

### 14.1 Architecture-neutral quality requirements

| ID | Requirement | Target / behaviour | Verification | Priority | Status |
|---|---|---|---|---:|---|
| NFR-MAINT-001 | Rules calculations shall be isolated from UI rendering. | Pure or deterministically testable domain interfaces | Architecture/unit tests | Must | Approved baseline |
| NFR-MAINT-002 | Random-stream selection and consumption shall be explicit and testable. | No ambient/global random source in domain logic | Static review/deterministic tests | Must | Derived |
| NFR-MAINT-003 | UI components shall not directly invent mechanical state transitions. | All mutations pass through approved application/domain action boundary | Architecture review | Must | Proposed |
| NFR-MAINT-004 | Persistence schema versions and migrations shall be explicit and sequential. | No implicit breaking migration | Code/test review | Must | Approved baseline |
| NFR-MAINT-005 | Rules/content definitions shall be stored separately from application source logic where practical. | Reviewable versioned files/manifests | Repository review | Must | Approved baseline |
| NFR-MAINT-006 | Durable domain objects shall not store transient visual layout as authoritative state. | Data-model conformance | Schema/code review | Must | Approved baseline |
| NFR-MAINT-007 | Stable requirement, rule, entity, content, error, event, and migration IDs shall be preserved. | No silent ID reuse | Review/validation | Must | Derived |
| NFR-MAINT-008 | Build, test, type/static check, lint, format, and wireframe validation commands shall be documented and reproducible. | Clean checkout passes | CI/local | Must | Proposed |
| NFR-MAINT-009 | A clean checkout shall require no unpublished local dependency or secret to run unit tests and build the static application. | CI passes from documented prerequisites | CI | Must | Proposed |
| NFR-MAINT-010 | Must requirements shall map to automated or manual evidence. | 100% traceability before release | Test-plan audit | Must | Approved baseline |
| NFR-MAINT-011 | Critical rules, persistence, import, migration, recovery, and generation modules shall meet coverage thresholds. | ≥90% statement and branch coverage, plus 100% approved deterministic fixtures | Coverage/fixture report | Should / Must fixtures | Proposed |
| NFR-MAINT-012 | Overall executable application code shall meet a baseline automated coverage threshold. | ≥80% statement coverage, excluding generated/vendor code | Coverage report | Should | Proposed |
| NFR-MAINT-013 | Coverage shall not substitute for invariant, mutation/fault, browser, accessibility, or playtest evidence. | All required evidence classes present | QA review | Must | Proposed |
| NFR-MAINT-014 | Public module interfaces and migrations shall be documented sufficiently for review. | No undocumented persisted field or migration side effect | Review | Must | Proposed |
| NFR-MAINT-015 | Circular dependencies across rules, data, persistence, and UI layers shall be prevented or explicitly reviewed. | Zero unreviewed cycle | Static analysis/architecture review | Should | Proposed |
| NFR-MAINT-016 | New content packages shall be addable without changing unrelated rules/UI code unless a new mechanic is explicitly approved. | Existing suites pass with package substitution | Architecture/content test | Should | Proposed |
| NFR-MAINT-017 | Error handling shall use stable error categories/codes separate from user-facing copy. | 100% release-blocking errors categorised | Code/test review | Must | Proposed |
| NFR-MAINT-018 | Migrations shall have forward fixtures from every supported prior schema to current. | 100% supported paths | CI | Must | Approved baseline |
| NFR-MAINT-019 | The previous production data format shall remain represented by fixtures until its support window is formally closed. | Fixture retained and tested | Migration review | Must | Proposed |
| NFR-MAINT-020 | Technical debt that weakens a Must NFR shall be recorded as a defect/risk, not hidden in implementation notes. | Complete release risk register | QA/release review | Must | Proposed |

### 14.2 Test execution quality

| ID | Requirement | Target | Verification | Priority |
|---|---|---|---|---:|
| NFR-TEST-001 | Unit and deterministic domain suites shall be repeatable. | Same commit/seed produces identical pass/fail and canonical outputs | Repeated CI | Must |
| NFR-TEST-002 | Tests shall not depend on live network services for core rules/persistence validation. | Core CI passes offline after dependencies are installed | CI isolation | Must |
| NFR-TEST-003 | Flaky tests shall not be silently retried to green. | Retry, if used, reports original failure and opens a tracked defect above agreed threshold | CI review | Must |
| NFR-TEST-004 | Release-candidate Must suites shall pass without ignored/skipped cases unless waiver identifies requirement and risk. | 100% Must tests executed | QA report | Must |
| NFR-TEST-005 | Deterministic simulation output shall identify seed, rules/content/generation versions, commit, and invariant failure. | 100% simulation reports | Harness inspection | Must |
| NFR-TEST-006 | Browser E2E fixtures shall reset only application-owned test data. | No contamination between cases | Test harness review | Must |
| NFR-TEST-007 | Accessibility checks shall combine automated and manual/AT evidence. | Both evidence types present | QA audit | Must |
| NFR-TEST-008 | Performance regressions beyond 10% against an accepted baseline shall be investigated even when absolute budgets still pass. | Regression report or documented explanation | CI/performance review | Should |

---

## 15. Observability and Diagnostics

### 15.1 Principles

Observability for Core MVP is intentionally limited. It supports release availability, deployment verification, local error explanation, and voluntary diagnostics without creating hidden behavioural telemetry.

### 15.2 Requirements

| ID | Requirement | Target / behaviour | Verification | Priority | Status |
|---|---|---|---|---:|---|
| NFR-OBS-001 | User-facing failures shall include actionable context without exposing sensitive data. | Stable error category, affected scope, data impact, and recovery action | Fault/UX review | Must | Approved baseline |
| NFR-OBS-002 | Development diagnostics shall identify failing rules, persistence, migration, import, content, and update operations. | Structured development events with stable codes | Review/tests | Should | Proposed |
| NFR-OBS-003 | Production diagnostics shall not log names, notes, event bodies, Graveyard details, full imports, seeds, or raw save state by default. | Zero prohibited findings | Log inspection | Must | Approved baseline |
| NFR-OBS-004 | Application, build commit, schema, rules, content, and generation versions shall be visible in a support-accessible location. | All version fields available without developer tools | Manual test | Must | Proposed |
| NFR-OBS-005 | Save, import, migration, recovery, and update states shall expose a stable privacy-safe error code when they fail. | 100% release-blocking failure types | Fault tests | Must | Proposed |
| NFR-OBS-006 | Diagnostic packages shall use an allowlist schema and show included fields before export/attachment. | No arbitrary object dump | Privacy/E2E | Must | Proposed |
| NFR-OBS-007 | Diagnostic generation shall not modify gameplay state. | Canonical state unchanged | Integration test | Must | Proposed |
| NFR-OBS-008 | The application shall function fully when remote logging, crash reporting, or analytics services are absent. | Zero runtime dependency | Network-offline test | Must | Approved baseline |
| NFR-OBS-009 | Production console output shall contain no uncaught exception, repeated warning loop, or sensitive data during the smoke journey. | Zero findings | Browser console audit | Must | Proposed |
| NFR-OBS-010 | External production monitoring shall check only shell/asset availability and deployment health unless separately approved. | No user/play data | Monitoring review | Must | Approved baseline |
| NFR-OBS-011 | Availability checks shall run from at least two regions at a cadence no slower than five minutes during public operation. | Documented synthetic monitor | Operations review | Should | Proposed |
| NFR-OBS-012 | A release shall have a human-readable changelog and support version identifier. | Present for every public release | Release audit | Should | Proposed |
| NFR-OBS-013 | A privacy-safe support identifier shall not be globally stable across users or browser profiles unless separately approved. | No persistent tracking ID | Schema/network review | Must | Proposed |
| NFR-OBS-014 | Local diagnostic retention shall be session-bounded unless the user explicitly saves a package. | No hidden persistent diagnostic history | Storage inspection | Must | Proposed |
| NFR-OBS-015 | Operations records shall distinguish deployment failure, asset outage, and application defect without requiring private user data. | Incident template contains required fields | Operations review | Should | Proposed |

---

## 16. Backup, Recovery, Migration, and Portability

### 16.1 Export and import

| ID | Requirement | Target / behaviour | Verification | Priority | Status |
|---|---|---|---|---:|---|
| NFR-DR-001 | Export packages shall be versioned and self-identifying. | Schema, app, rules/content, export timestamp, selected slot ID/name, and manifest present | Export test | Must | Approved baseline |
| NFR-DR-002 | Exported textual data shall use UTF-8 and machine-readable ISO-8601 timestamps. | 100% package fields | Inspection/round-trip | Must | Proposed |
| NFR-DR-003 | Export shall include integrity metadata for the package or manifest. | Corruption is detected before activation | Corruption tests | Must | Proposed |
| NFR-DR-004 | An export shall represent one explicitly selected slot unless a future multi-slot format is separately approved. | Other slots absent | Export inspection | Must | Proposed |
| NFR-DR-005 | Invalid imports shall make no changes to current valid data. | Canonical pre/post equivalence | Integration test | Must | Approved baseline |
| NFR-DR-006 | Import shall parse, validate, migrate, and build a preview in staging before confirmation. | No active-slot mutation before final commit | E2E/integration | Must | Approved baseline |
| NFR-DR-007 | Import preview shall identify target slot, compatibility, counts, warnings, and private-data scope. | 100% fields present | E2E | Must | Approved baseline |
| NFR-DR-008 | Replacement shall create a pre-import recovery snapshot before atomic activation. | Snapshot present and previous state recoverable | Fault/E2E | Must | Approved baseline |
| NFR-DR-009 | Export/import round-trip shall preserve all required domain identities and canonical values. | 100% equivalence for supported fixture | Round-trip suite | Must | Proposed |
| NFR-DR-010 | Import shall reject unsupported future schema versions without destructive conversion. | Explicit incompatible result | Integration | Must | Approved baseline |
| NFR-DR-011 | Import shall not resolve arbitrary external URLs, paths, scripts, or executable dependencies. | Zero external resolution | Security tests | Must | Proposed |
| NFR-DR-012 | Export format shall be documented sufficiently for project-controlled migration and validation. | Versioned schema/manifest documentation | Review | Must | Proposed |

### 16.2 Recovery and snapshots

| ID | Requirement | Target / behaviour | Verification | Priority |
|---|---|---|---|---:|
| NFR-DR-013 | Each non-empty slot shall retain a last-known-valid recovery snapshot. | 100% eligible slots | Persistence tests | Must |
| NFR-DR-014 | A pre-import or pre-migration snapshot shall be retained until the new state has passed validation and at least one later successful ordinary save. | Recovery remains available through activation risk window | E2E/fault | Must |
| NFR-DR-015 | At least the current active state, last-known-valid snapshot, and latest protected pre-destructive snapshot shall be distinguishable where all exist. | Metadata identifies purpose/time/schema | Data/E2E inspection | Must |
| NFR-DR-016 | Snapshot rotation shall not delete the only valid recovery state. | Zero last-valid loss | Fault/rotation tests | Must |
| NFR-DR-017 | Recovery preview shall state snapshot time, reason, schema/version compatibility, target slot, and replacement scope. | 100% required fields | E2E | Must |
| NFR-DR-018 | Recovery activation shall require explicit confirmation and commit atomically. | Cancel changes nothing; failure preserves prior active state | E2E/fault | Must |
| NFR-DR-019 | Corrupted recovery data shall not replace a valid active state. | Validation before switch | Integration | Must |
| NFR-DR-020 | The application shall not promise recovery from browser-origin deletion, device loss, profile reset, or user deletion without an external export. | Accurate notice | UX/privacy review | Must |

### 16.3 Migration

| ID | Requirement | Target / behaviour | Verification | Priority |
|---|---|---|---|---:|
| NFR-DR-021 | Every supported migration shall advance through explicit sequential versions. | No skipped implicit transform | Migration suite | Must |
| NFR-DR-022 | Migration shall validate input, each step result, and final invariants before activation. | 100% supported paths | Fault/integration | Must |
| NFR-DR-023 | A failed migration shall preserve the original state and recovery evidence. | Canonical original remains available | Fault tests | Must |
| NFR-DR-024 | Migration shall preserve immutable roll/event evidence and stable identities. | 100% canonical equivalence | Migration fixtures | Must |
| NFR-DR-025 | Migration reports shall identify source/target schema, applied steps, warnings, result, and privacy-safe failure code. | Report available | Integration | Should |
| NFR-DR-026 | Downgrade migration is not required for Core MVP. | Newer data is rejected by older builds unless separately supported | Compatibility test | Won't |
| NFR-DR-027 | A schema version may leave support only through an approved compatibility decision and release notice. | Decision and fixture removal reviewed | Release governance | Must |

### 16.4 Storage quota and portability

| ID | Requirement | Target / behaviour | Verification | Priority |
|---|---|---|---|---:|
| NFR-DR-028 | App-owned storage usage and available quota shall be estimated when the platform permits. | Data area shows understandable usage/availability band | Browser/E2E | Should |
| NFR-DR-029 | The user shall receive a non-alarming warning when app-owned usage exceeds 70% of reported quota or remaining reported quota falls below 20 MiB, whichever occurs first. | Warning includes export and cleanup guidance; no false certainty when API unavailable | Quota tests | Should |
| NFR-DR-030 | A quota failure shall not be reported as success and shall block unsafe further mutation. | Prior valid state retained | Fault tests | Must |
| NFR-DR-031 | Compaction shall target only data eligible under approved retention/archive rules. | No required state removed | Integration | Must |
| NFR-DR-032 | Exports shall be portable across supported browsers and devices using the same or later supported application schema. | Cross-browser round-trip passes | Browser matrix | Must |
| NFR-DR-033 | Platform-specific internal IndexedDB keys or object layouts shall not leak into the documented portable contract unless explicitly versioned. | Export remains implementation-neutral | Schema review | Must |

---

## 17. Content and Licensing Quality Controls

| ID | Requirement | Target / behaviour | Verification | Priority | Status |
|---|---|---|---|---:|---|
| NFR-LIC-001 | Every bundled content and asset item shall have provenance metadata. | 100% inventory coverage | Manifest validation | Must | Approved baseline |
| NFR-LIC-002 | Unknown, blocked, expired, incompatible, or restricted content shall be absent from public release builds. | Zero blocked entries | Build/release check | Must | Approved baseline |
| NFR-LIC-003 | Required attribution, permission, licence, creator/title, third-party, and unofficial-product notices shall be readable and discoverable. | 100% applicable notices | Content/manual test | Must | Approved baseline |
| NFR-LIC-004 | Original publication logo, page layout, character-sheet design, screenshots, icons, and trade dress shall not be copied without explicit item-level authorisation. | Independent design review passes | Review | Must | Approved baseline |
| NFR-LIC-005 | Source prose shall be paraphrased by default; verbatim text requires recorded permission and approval. | 100% exact-text entries trace to rights evidence | Content audit | Must | Approved baseline |
| NFR-LIC-006 | Content manifests shall include stable ID, type, version, source/provenance, licence/permission status, restrictions, attribution, approval status, and integrity hash. | 100% required fields | Schema/manifest validation | Must | Derived |
| NFR-LIC-007 | Build tooling shall fail the release build when a required bundled item lacks approved status or required provenance. | Zero warning-only bypass for Must fields | CI test | Must | Proposed |
| NFR-LIC-008 | Placeholder assets shall be rights-safe, replaceable, and nonessential to rules comprehension. | 100% Palace placeholders reviewed | Content/UX review | Must | Approved baseline |
| NFR-LIC-009 | Third-party software and development dependencies distributed with the product shall have compatible licences and required notices. | 100% distributable dependency inventory | Dependency/licence audit | Must | Proposed |
| NFR-LIC-010 | Non-commercial-only content shall not enter a commercial build unless separately permitted; Core MVP remains free and non-monetised. | Commercial gate explicit even though current release is free | Manifest/legal review | Must | Approved conservative constraint |
| NFR-LIC-011 | Content updates shall not silently change historical rule evidence or saved definition references. | Versioned definitions; compatibility/migration decision required | Content/migration tests | Must | Derived |
| NFR-LIC-012 | Imported/user-authored notes shall remain distinguishable from bundled official or project-authored mechanical content. | Visual/semantic separation | UX/content test | Must | Approved baseline |
| NFR-LIC-013 | Final public content shall be English-only for Core MVP. | No incomplete localisation path | Build/content review | Must | Approved baseline |
| NFR-LIC-014 | Release evidence shall identify the exact content-package version and inventory used. | Manifest attached to release record | Release audit | Must | Proposed |

---

## 18. Build, Release, and Operations

### 18.1 Build and artifact integrity

| ID | Requirement | Target / behaviour | Verification | Priority | Status |
|---|---|---|---|---:|---|
| NFR-OPS-001 | A clean checkout shall install, validate, test, and build using documented commands. | CI and independent local verification pass | CI/local | Must | Proposed |
| NFR-OPS-002 | Dependency versions shall be locked for release builds. | Lock file committed and respected | Build review | Must | Proposed |
| NFR-OPS-003 | Release artifacts shall be reproducible from committed source, lock files, and documented toolchain. | Same commit produces functionally equivalent artifact and matching manifest inputs | CI/review | Should | Approved direction / proposed measure |
| NFR-OPS-004 | Environment-specific values shall be separated from source; production secrets shall not be committed. | Zero secret findings | Review/scan | Must | Proposed |
| NFR-OPS-005 | A release artifact shall identify application, commit, schema, rules, content, and generation versions. | 100% public releases | Manifest/manual | Must | Proposed |
| NFR-OPS-006 | Production deployment shall originate from a protected release ref/tag and reviewed commit. | Zero direct unreviewed branch deployment | Repository/CI audit | Must | Approved baseline |
| NFR-OPS-007 | Published artifacts shall be immutable. | Existing release URL/version content not overwritten | Deployment audit | Must | Approved baseline |
| NFR-OPS-008 | Release source maps and debug assets shall follow the security/privacy decision in NFR-SEC-005/017. | No accidental public debug data | Artifact inspection | Must | Proposed |
| NFR-OPS-009 | The content/licensing manifest and dependency licence report shall be retained with release evidence. | 100% public releases | Release audit | Must | Proposed |

### 18.2 Release gates

| ID | Requirement | Target / behaviour | Verification | Priority |
|---|---|---|---|---:|
| NFR-OPS-010 | Every release candidate shall pass documented smoke tests. | 100% Must smoke cases | QA report | Must |
| NFR-OPS-011 | Every release candidate shall pass required rules fixtures, persistence/fault, migration/import, browser, responsive, accessibility, security, content, and build gates. | No unwaived Must failure | Release checklist | Must |
| NFR-OPS-012 | No Blocker or Critical defect may remain open. | Zero | Defect report | Must |
| NFR-OPS-013 | A High defect requires explicit documented waiver from Product, Technical, QA, and affected specialist owner. | 100% waivers complete | Release review | Must |
| NFR-OPS-014 | Palace shall pass approved seed, persistence, usability, and rating thresholds before remaining dungeon production receives written go. | Approved prototype gate met | Go/no-go record | Must |
| NFR-OPS-015 | A public release shall have named Product and Technical/Operations owners. | Both assigned | Release record | Must |
| NFR-OPS-016 | Release notes shall identify known limitations affecting browser support, storage, recovery, accessibility, or content. | Complete known-limitations section | Release review | Must |
| NFR-OPS-017 | Browser/dependency/content compatibility shall be reviewed at least quarterly. | Review record every calendar quarter while supported | Operations audit | Must |
| NFR-OPS-018 | No fixed feature-delivery cadence shall be promised as an availability commitment. | Public copy consistent | Product/operations review | Must |

### 18.3 Deployment and rollback

| ID | Requirement | Target / behaviour | Verification | Priority |
|---|---|---|---|---:|
| NFR-OPS-019 | Deployment shall be automated from the protected release process. | Repeatable documented pipeline | CI/deployment audit | Must |
| NFR-OPS-020 | The previous production artifact shall be retained and redeployable. | At least one prior accepted release | Artifact audit | Must |
| NFR-OPS-021 | Rollback to the previous accepted artifact shall be executable in one documented operator action or pipeline dispatch. | Procedure demonstrated | Rollback drill | Must |
| NFR-OPS-022 | Rollback shall restore the prior shell/content artifact within 15 minutes of an authorised decision. | ≤15 minutes in drill | Timed exercise | Should |
| NFR-OPS-023 | Rollback shall not downgrade or destructively rewrite local save data. | Newer incompatible saves receive safe compatibility handling | Rollback/migration E2E | Must |
| NFR-OPS-024 | Release activation shall respect safe service-worker update behaviour. | No active commit interruption | Update E2E | Must |
| NFR-OPS-025 | A deployment smoke check shall verify shell, manifest, service worker, core content, version display, offline readiness, and no unexpected network dependency. | 100% checks | Post-deploy automation/manual | Must |
| NFR-OPS-026 | Operations documentation shall include deploy, verify, rollback, incident, browser-support, dependency-review, and owner-contact procedures. | Procedures reviewed before public release | Operations review | Must |
| NFR-OPS-027 | A failed deployment shall not remove the last accepted artifact. | Previous artifact remains available | Pipeline failure test | Must |
| NFR-OPS-028 | CDN/cache invalidation shall preserve immutable versioned assets and update only release pointers/manifests as designed. | No mixed incompatible version | Deployment test | Must |

### 18.4 Incident and maintenance quality

| ID | Requirement | Target | Verification | Priority |
|---|---|---|---|---:|
| NFR-OPS-029 | A Critical data-loss, security, or broad-unavailability incident shall receive owner acknowledgement within one business day. | Incident record | Operations audit | Should |
| NFR-OPS-030 | An incident shall record affected release, scope, detection, privacy impact, data impact, mitigation, recovery, and follow-up. | Complete incident template | Review | Must |
| NFR-OPS-031 | A hotfix shall pass the affected Must regression gates and rollback check. | 100% affected gates | Release evidence | Must |
| NFR-OPS-032 | User communication shall not claim recovery of local data that the project cannot access. | Accurate incident copy | Product/privacy review | Must |
| NFR-OPS-033 | The project shall retain source, release manifests, dependency records, and accepted artifacts for every supported public release. | 100% supported releases | Repository/artifact audit | Must |

---

## 19. Traceability and Verification

### 19.1 Quality-area traceability

| NFR area | Primary upstream requirements | Principal evidence | Owner |
|---|---|---|---|
| Performance | PRD application flow; FRD APP/SAV/HIS/UXA; UX screen/component requirements | Browser benchmarks, build report, large-save fixtures | Technical Lead / QA |
| Reliability | FRD SAV, DTH, HIS, ERR, XFR-SAVE; DRS persistence/history; Data Model invariants | Unit/integration, fault injection, endurance, canonical comparison | Technical Lead / QA |
| Offline/availability | BRD/MVP PWA baseline; PRD offline use; FRD APP/SAV | Offline E2E, service-worker tests, synthetic availability | Technical/Operations |
| Security | FRD privacy/errors/import; Data Model import/provenance; release decisions | Threat review, scans, adversarial import, headers/network audit | Technical Lead |
| Privacy | BRD/PRD privacy; FRD CNT/XFR-PRIV; UX data/recovery flows | Data-flow, network/storage, diagnostic-schema, content review | Product / Privacy / Technical |
| Accessibility | MVP/decision register; FRD UXA; UX A11Y/announcement/map requirements | Keyboard, automated scan, NVDA, VoiceOver, TalkBack, zoom/reflow | UX/Accessibility / QA |
| Compatibility | MVP browser/viewport matrix; FRD UXA; UX responsive rules | Browser/viewport/input/PWA matrix | QA / Technical |
| Usability | Palace gate; PRD outcomes; UX journeys/states | Moderated playtest/UAT/comprehension | Product / UX |
| Maintainability/testability | DRS reference fixtures; Data Model boundaries; FRD traceability | CI, coverage, deterministic fixtures, architecture review | Technical Lead / QA |
| Observability | Decision-register aggregate metrics; FRD diagnostics; UX error/recovery | Error-code review, console/network/log audit, diagnostic schema | Technical/Operations / Privacy |
| Backup/recovery/migration | FRD SAV/ERR; Data Model import/migration/snapshot sections; UX Data flows | Export/import round-trip, fault and migration suites | Technical Lead / QA |
| Licensing | BRD content gate; FRD CNT; Data Model provenance; UX licensing UX | Inventory/manifests, build gate, legal/content review | Content/Licensing |
| Build/release/operations | BRD/MVP operational gate; approved deployment direction | CI, artifact manifest, smoke, deploy/rollback drill | Technical/Operations / QA |

### 19.2 Requirement verification status

At draft stage, each requirement is **Specified**. The [Acceptance Criteria / Test Plan](acceptance-criteria-test-plan-v0.1.md) shall assign:

- test case or review ID;
- automated/manual classification;
- environment and fixture;
- owner;
- prototype, release-candidate, or operational execution point;
- evidence location;
- current pass/fail/waived status.

No Must NFR may be marked verified solely because implementation exists. Verification requires recorded evidence against the stated target.

### 19.3 Required evidence packages

1. Performance and bundle-size report.
2. Deterministic rules and 100,000-seed-per-dungeon simulation report.
3. Persistence, interruption, quota, snapshot, migration, and import fault matrix.
4. Browser/version/viewport/input/PWA matrix.
5. Keyboard, automated accessibility, NVDA, VoiceOver, TalkBack, contrast, reflow, reduced-motion, and textual-map parity report.
6. Security headers, dependency, secret, import, network, and production-console audit.
7. Privacy data-flow and diagnostic-schema review.
8. Content provenance/licensing manifest and zero-blocked-item release report.
9. Clean-checkout build and reproducibility report.
10. Deployment, smoke, availability-monitor, and rollback drill.
11. Palace usability, comprehension, pacing, map clarity, and overall-play report.
12. Defect/waiver and final release decision record.

---

## 20. Acceptance Criteria

### 20.1 Document acceptance

- [ ] Every Must NFR has a measurable target, explicit behaviour, or objective review method.
- [ ] New numeric targets are clearly distinguished from inherited approved baselines.
- [ ] Performance targets identify representative environments and fixtures.
- [ ] Data integrity covers atomic actions, random streams, durable identity, snapshots, history, and fault recovery.
- [ ] Offline behaviour covers first readiness, cached use, update failure, and hosting outage.
- [ ] Security covers user content, imports, supply chain, headers, secrets, release integrity, and backup risk.
- [ ] Privacy covers local data, telemetry absence, diagnostics, feedback, hosting logs, and truthful notices.
- [ ] Accessibility matches WCAG 2.2 AA and the approved keyboard/AT/textual-map baseline.
- [ ] Browser families, version policy, viewports, input modes, and PWA fallback are explicit.
- [ ] Usability targets include the approved Palace thresholds and local-save comprehension.
- [ ] Maintainability/testability covers deterministic rules, schema migrations, code/content separation, CI, coverage, and traceability.
- [ ] Backup/recovery/migration requirements preserve valid state and prevent silent destructive change.
- [ ] Content/licensing controls require 100% provenance and zero blocked release items.
- [ ] Build/release requirements include protected refs, immutable artifacts, prior release retention, smoke tests, and rollback.
- [ ] Open questions do not conceal an unresolved product or rules decision.

### 20.2 Palace prototype quality gate

Before written Palace go:

- [ ] All Palace Must functional and NFR scenarios pass.
- [ ] At least 100,000 Palace seeds produce zero non-terminating or unreachable-boss dungeons.
- [ ] Persistence, interruption, migration/import, quota, and recovery fault matrices produce zero silent corruption or required unrecoverable loss.
- [ ] At least 80% of representative users complete the agreed core flow unaided.
- [ ] At least 70% rate combat pacing, map clarity, and overall play acceptable or better.
- [ ] Phone, keyboard, visual/textual map, and representative screen-reader journeys pass.
- [ ] Load, action, save, history, and import targets pass on reference profiles.
- [ ] No Blocker or Critical defect remains open.
- [ ] Rights-safe placeholder inventory passes.
- [ ] Product and Technical/Operations owners record a written go/no-go decision.

### 20.3 Core MVP release quality gate

- [ ] Every approved Must functional requirement and Must NFR has passing evidence or an explicit permitted waiver.
- [ ] All six dungeon types pass at least 100,000 deterministic seeds each with zero required generation failure.
- [ ] Current and previous two major Chrome, Edge, Firefox, and Safari versions pass the approved viewport matrix.
- [ ] WCAG 2.2 AA, keyboard, NVDA, VoiceOver, TalkBack, contrast, reflow, reduced-motion, and textual-map evidence passes.
- [ ] Three-slot, last-valid, export/import, sequential migration, interrupted-write, invalid-data, quota, and recovery scenarios pass.
- [ ] Security, privacy, content/licensing, build, deployment, smoke, and rollback gates pass.
- [ ] Public artifact and manifest are traceable to an approved protected release commit.
- [ ] The previous accepted artifact remains deployable.
- [ ] Zero Blocker/Critical defect and no unwaived High defect remains.
- [ ] The complete approved core experience is available without payment or monetisation.

---

## 21. Open Questions

No unresolved product or rules question blocks approval of this NFR structure. The following decisions are NFR, architecture, test, operations, or content refinements.

| ID | Question | Owner | Decision point | Status |
|---|---|---|---|---|
| OQ-NFR-001 | Do the proposed REF-DESKTOP and REF-MOBILE profiles represent the minimum practical target hardware, or should the Test Plan name specific maintained devices? | Technical / QA | Test Plan | Open; non-blocking |
| OQ-NFR-002 | Are the proposed cold/repeat-load, action, save, history, generation, and import thresholds accepted after the first interactive Palace build? | Product / Technical / QA | Palace performance baseline | Open; review target |
| OQ-NFR-003 | Are the JavaScript, CSS, content, image, font, and offline-cache budgets achievable under the selected frontend and asset architecture? | Technical / UX | Architecture spike | Open; review target |
| OQ-NFR-004 | Is the portable export presented as plain versioned JSON or a versioned archive containing JSON and integrity metadata? | Product / UX / Technical | Architecture | Open; downstream |
| OQ-NFR-005 | Should a slot retain more than the minimum active, last-valid, and latest protected pre-destructive snapshots, and what storage cap applies? | Technical / Product | Persistence architecture | Open; downstream |
| OQ-NFR-006 | Are the proposed 70%-quota / 20-MiB-remaining warning thresholds useful across real browsers without alarming users? | Product / UX / Technical | Palace storage testing | Open; review target |
| OQ-NFR-007 | Are 40 grapheme clusters for slot/adventurer names and 10,000 per note appropriate after responsive and assistive-technology testing? | UX / Accessibility / Technical | Palace UX review | Open; non-blocking |
| OQ-NFR-008 | Which exact browser, OS, device, and assistive-technology versions are frozen for the first release candidate? | QA / Accessibility | RC test-plan freeze | Open; downstream |
| OQ-NFR-009 | Which hosting/CDN provider, synthetic monitor, availability regions, and access-log fields/retention satisfy privacy and budget constraints? | Technical/Operations / Privacy | Architecture/hosting plan | Open; downstream |
| OQ-NFR-010 | Is the proposed ≥99.5% monthly hosted-shell availability target appropriate for a free static application? | Product / Operations | Hosting approval | Open; review target |
| OQ-NFR-011 | Which vulnerability, licence, secret, static-analysis, and bundle tools become the required release toolchain? | Technical / QA / Licensing | Architecture/CI | Open; downstream |
| OQ-NFR-012 | Are the proposed 90% critical-module and 80% overall coverage thresholds suitable for the chosen code structure? | Technical / QA | Test-plan/architecture | Open; review target |
| OQ-NFR-013 | Which privacy-safe diagnostic fields and storage usage bands are included in the voluntary diagnostic schema? | Privacy / Technical / Product | Operations/Test Plan | Open; downstream |
| OQ-NFR-014 | What unavoidable CDN access-log retention exists, and can it be disabled, shortened, or anonymised? | Operations / Privacy | Hosting approval | Open; release-blocking detail |
| OQ-NFR-015 | Which final approved production assets require exceptions to the proposed image, font, content, or cache budgets? | UX / Content / Technical | Post-Palace asset plan | Open; deferred |
| OQ-NFR-016 | How long are older schema versions supported for import/migration after public release? | Product / Technical / QA | Versioning policy before release 2 | Open; future policy |
| OQ-NFR-017 | Is the proposed 15-minute rollback objective appropriate for the selected deployment platform? | Operations / QA | Deployment drill | Open; review target |
| OQ-NFR-018 | Which performance and accessibility checks run on every pull request versus nightly, release-candidate, or manual cadence? | Technical / QA / Accessibility | Test Plan/CI | Open; downstream |

---

## 22. Approval

Approval of this document makes all Must requirements and accepted numeric targets normative for the Palace prototype and Core MVP, subject to the project change-control and waiver process.

| Role | Name | Decision | Date | Notes |
|---|---|---|---|---|
| Product Owner |  | Pending / Approved / Rejected |  | Approves quality priorities, usability, availability, privacy, and release thresholds |
| Technical Lead |  | Pending / Approved / Rejected |  | Approves feasibility, security, performance, persistence, maintainability, and architecture constraints |
| QA / Release Reviewer |  | Pending / Approved / Rejected |  | Approves measurability, environments, evidence, defect, and release gates |
| UX / Accessibility Reviewer |  | Pending / Approved / Rejected |  | Approves usability, responsive, WCAG, assistive-technology, and announcement targets |
| Content / Licensing Reviewer |  | Pending / Approved / Rejected |  | Approves provenance, dependency-licence, notices, and content-release controls |
| Technical / Operations Owner |  | Pending / Approved / Rejected |  | Approves hosting, availability, monitoring, deployment, incident, maintenance, and rollback targets |
