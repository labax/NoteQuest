# Acceptance Criteria / Test Plan v0.1 - Part G - Regression, UAT, Defects, Traceability, Execution, Questions, and Approval

This file is a normative part of [Acceptance Criteria / Test Plan v0.1](acceptance-criteria-test-plan-v0.1.md).

*Status: Draft for Review | Last updated: 2026-07-17*

---

## 21. Regression and Smoke Tests

### 21.1 Pull-request smoke

- [ ] Clean dependency install succeeds.
- [ ] Format and static/lint checks succeed.
- [ ] Production build succeeds.
- [ ] Unit, component, and bounded integration suites succeed.
- [ ] Content/schema/manifest/link validation succeeds.
- [ ] Dependency/secret/licence policy checks report no unreviewed blocker.
- [ ] Core creation, one exploration action, one combat action, save/reload, and About/Credits smoke succeed.
- [ ] No unapproved generated artifact is committed.

### 21.2 Release-candidate smoke

- [ ] Empty and existing slots open.
- [ ] Adventurer creation commits and reloads.
- [ ] Palace and every other core dungeon package loads/generates.
- [ ] Door, trap, combat, reward, capacity, retreat, town, death/recovery, and boss completion representative actions succeed.
- [ ] Save status is truthful.
- [ ] Export/import representative round trip succeeds.
- [ ] Offline-ready and offline launch succeed.
- [ ] Visual/textual maps and keyboard path work.
- [ ] About/Credits and version information are reachable.
- [ ] Content/licence manifest matches candidate.
- [ ] No unexpected external runtime request occurs.
- [ ] Previous accepted artifact is retained.

### 21.3 Post-deployment smoke

- [ ] Shell and release manifest resolve over HTTPS.
- [ ] Application, commit, schema, rules, content, generation, and inventory versions match the approved release.
- [ ] Service worker installs/updates as designed.
- [ ] Core content loads and offline-ready becomes truthful.
- [ ] A synthetic local slot can create/save/reload without private real-user data.
- [ ] About/Credits and notices render.
- [ ] No unexpected tracker/backend request occurs.
- [ ] Rollback action remains available and previous artifact is deployable.

### 21.4 Regression selection

Every change must run:

- tests mapped to the changed requirement/rule/entity/content record;
- all affected invariant/fault fixtures;
- stable core smoke;
- migration/export/import compatibility tests when schema/content versions change;
- browser/UX/accessibility checks when layout/components change;
- content/licensing gates when copy/assets/dependencies/manifests change;
- deployment/rollback checks when build/service-worker/release configuration changes.

---

## 22. Playtest / UAT Plan

### 22.1 Objective

Validate that the automated Palace experience remains understandable, usable, source-faithful, and engaging enough to justify six-dungeon production, while confirming that players can trust the map, state, saves, recovery, and rules evidence without external bookkeeping.

### 22.2 Participant plan

The minimum Palace usability sample is **10 representative primary users**.

| Segment / characteristic | Minimum target | Notes |
|---|---:|---|
| Prior solo/tabletop dungeon-crawler experience | 4 | May include NoteQuest players. |
| No prior NoteQuest experience | 4 | Tests onboarding and unaided comprehension. |
| Phone-browser session | 3 | May overlap other segments. |
| Desktop/tablet session | 5 | May overlap experience segments. |
| Accessibility specialist or participant sessions | 3 evidence sessions | At least one NVDA, one VoiceOver, and one TalkBack path; may overlap the 10 when representative. |

The main 10-person usability denominator should include a reasonable mix rather than mutually exclusive quota groups. If fewer than 10 valid sessions complete, the quantitative gate is not met and the result is Blocked, not extrapolated.

### 22.3 Session script

1. Begin from first launch without the source rulebook or facilitator instruction.
2. Create an adventurer.
3. Generate and enter Palace.
4. Open doors, interpret map/current state, and complete exploration actions.
5. Resolve at least one combat and one reward/capacity decision.
6. Demonstrate retreat/town/re-entry or continue toward a terminal path.
7. Encounter either a prepared save/recovery task or a natural session opportunity.
8. Close and resume the application.
9. Locate rules-result evidence and About/Credits.
10. Complete standard rating and comprehension questions.

Facilitators record assistance. Clarifying the task wording is not assistance; explaining where or how to perform a product action is assistance.

### 22.4 Measures

| Measure | Definition | Palace pass |
|---|---|---|
| Unaided core-flow completion | Participant completes the agreed flow without facilitator action guidance or external bookkeeping. | At least 80%; with 10 valid sessions, at least 8 pass. |
| Combat pacing | Rating on approved 5-point scale; acceptable = 3 or higher. | At least 70%; with 10 valid sessions, at least 7 acceptable. |
| Map clarity | Same scale/threshold. | At least 70%. |
| Overall play | Same scale/threshold. | At least 70%. |
| Current-state comprehension | Correctly identifies adventurer, location, critical resources, encounter state, and saved status at checkpoints. | At least 80% of checkpoints across valid sessions. |
| Next-action comprehension | Identifies at least one legal next action and its visible cost/consequence at checkpoints. | At least 80% of checkpoints. |
| Save/recovery trust | Correctly explains local-only storage, saved/failed/recovery state, and export limitation after tasks. | At least 80%. |
| External-tool dependence | Uses no paper map, manual ledger, or rulebook for required flow. | 100% of passing unaided sessions. |
| Phone viability | Required phone tasks complete without layout workaround or desktop switch. | All valid phone sessions; any Must blocker fails gate. |
| Accessibility evidence | Scripted keyboard/AT journeys pass without a Must barrier. | All required evidence sessions pass or gate fails. |

### 22.5 Rating questions

Use consistent wording and a five-point scale:

1. Combat pacing: unacceptable / poor / acceptable / good / excellent.
2. Map clarity: unacceptable / poor / acceptable / good / excellent.
3. Overall play experience: unacceptable / poor / acceptable / good / excellent.
4. Confidence that the game saved correctly.
5. Clarity of the next available action.
6. Clarity of dice/rules results.
7. Clarity of local backup/recovery limitations.

Open feedback should ask for the most confusing point, most repetitive point, any external information desired, and any trust/accessibility concern.

### 22.6 UAT acceptance and go/no-go

- Quantitative gates use valid completed sessions only.
- Any Blocker/Critical data-loss, rules, privacy, accessibility, or complete-flow defect causes no-go regardless of percentages.
- Any systematic facilitator assistance pattern is a failed unaided-flow signal.
- Product, QA, UX, Rules, Content, and Technical/Operations reviewers review the evidence.
- Only the Product Owner's written go, after all Palace gates pass, authorises remaining dungeon production.

---

## 23. Defect Severity and Triage

### 23.1 Severity model

| Severity | Definition | Examples | Release position |
|---|---|---|---|
| Blocker | Prevents meaningful testing/release or causes unavoidable broad severe loss. | App/RC cannot load; all slots inaccessible; test environment invalid; required content package missing. | Must fix; no waiver. |
| Critical | High-impact rules, security, privacy, accessibility, or data-integrity failure. | Incorrect core result; silent corruption; duplicate random outcome; import overwrites valid data; private save upload; keyboard/textual map cannot complete core flow. | Must fix; no waiver. |
| High | Major required flow or NFR fails with limited workaround. | Cannot enter/complete a dungeon, resolve a common combat path, retreat, recover items, use phone width, meet Must timing, or render required notice. | Fix before release or permitted multi-owner waiver; no Palace go when it invalidates gate evidence. |
| Medium | Important defect with a reasonable workaround and no corrupted required state. | Incorrect focus return; confusing validation; noncritical responsive issue; Should timing miss. | Prioritise; may defer with owner/impact. |
| Low | Cosmetic or minor documentation issue. | Spacing, copy consistency, nonessential visual polish. | May defer. |

### 23.2 Waiver requirements

A permitted High or lower waiver must record:

- defect ID and exact affected requirement/test;
- severity and evidence;
- user, data, rules, privacy, accessibility, content, and operations impact;
- workaround and compensating control;
- owner and expiry/review milestone;
- affected release/build;
- approval from Product, Technical, QA, and every affected specialist owner.

Blocker and Critical defects cannot be waived. A failure that invalidates Palace sample results requires rerun after correction.

### 23.3 Triage cadence

- Blocker/Critical: immediate triage during active testing.
- High: triage within one business day.
- Medium/Low: regular test-cycle triage.
- Security/privacy/content-rights defects include the relevant specialist reviewer.
- Data-loss defects preserve fixtures, seeds, logs, and the last-valid evidence without exposing private data.

---

## 24. Traceability

### 24.1 Traceability rule

Every Must requirement must map to:

1. at least one acceptance criterion;
2. at least one planned test or review;
3. an owner;
4. execution evidence or an explicit not-applicable/waiver record;
5. final status in the release recommendation.

### 24.2 Area traceability

| Requirement area | Acceptance / test groups | Principal evidence | Owner |
|---|---|---|---|
| BRD/MVP scope and release gates | AC-GEN; GATE-PAL; GATE-REL | Scope audit, UAT, release record | Product / QA |
| PRD outcomes/capabilities | Feature AC and E2E scenarios | E2E/UAT/product review | Product / QA |
| FRD APP/ADV/DUN/EXP/CMB/INV/TWN/DTH/SAV/HIS/UXA/CNT | AC-APP through AC-CNT | Unit/component/integration/E2E/matrices | Developer / QA / specialists |
| DRS rules and reference tests | RT-DICE through RT-HIST; E2E mechanics | Deterministic fixtures, simulation, rule traces | Rules / QA |
| Data Model entities/invariants | DATA matrix; feature linked-object AC | Canonical/invariant/fault/migration tests | Technical / QA |
| UX journeys/components/states | AC-UXA; UX matrix; E2E | Browser, keyboard, AT, usability | UX / QA |
| NFR quality attributes | Global AC; NFR-linked gates/matrices | Performance, security, privacy, browser, build, rollback | Technical / QA / Operations |
| Content/Licensing requirements/inventory | AC-CNT; LIC matrix; AT-E2E-016 | Manifest, source, notices, dependency, visual audit | Content / Rights / QA |

### 24.3 Traceability record format

| Requirement ID | Acceptance criteria | Test IDs | Evidence URI / artifact | Result | Defects / waiver |
|---|---|---|---|---|---|
| To be populated by execution tooling |  |  |  | Not run |  |

The execution repository may store this as generated JSON/CSV/HTML in addition to the human-readable release report, provided stable IDs remain unchanged.

---

## 25. Test Execution Summary

### 25.1 Planned evidence groups

| Area | Minimum planned evidence |
|---|---|
| Requirements/static review | Complete cross-document traceability and zero unresolved hidden rule decision |
| Unit/rules | All Must DRS reference fixtures, every source table row/range, boundaries and guards |
| Component | All required component states, keyboard/focus/labels/announcements, responsive variants |
| Integration | Every aggregate/action family, snapshots, import/export, migration, content linkage |
| Simulation | At least 100,000 seeds per dungeon type |
| Fault/endurance | At least 1,000 injected persistence faults and 10,000 deterministic actions |
| E2E | All 16 detailed scenarios plus stable smoke paths |
| Performance | All Must NFR timings/budgets on required profiles |
| Browser/responsive | Four browser families, version policy, six widths, phone/tablet/desktop |
| Accessibility | Keyboard in each browser; NVDA, VoiceOver, TalkBack; WCAG manual/automated evidence |
| Security/privacy | Import adversarial set, XSS, headers, secrets, dependencies, network/log/diagnostic review |
| Content/licensing | Full inventory/source/manifest/notices/assets/dependency/blocked-content audit |
| UAT | At least 10 valid Palace usability sessions plus required accessibility evidence sessions |
| Release/operations | Protected artifact, smoke, deployment, previous artifact, rollback drill |

### 25.2 Execution result table

| Area | Planned | Passed | Failed | Blocked | Not run | Evidence |
|---|---:|---:|---:|---:|---:|---|
| Requirements/static review |  |  |  |  |  |  |
| Unit/rules |  |  |  |  |  |  |
| Component |  |  |  |  |  |  |
| Integration |  |  |  |  |  |  |
| Simulation |  |  |  |  |  |  |
| Fault/endurance |  |  |  |  |  |  |
| E2E |  |  |  |  |  |  |
| Performance |  |  |  |  |  |  |
| Browser/responsive |  |  |  |  |  |  |
| Accessibility |  |  |  |  |  |  |
| Security/privacy |  |  |  |  |  |  |
| Content/licensing |  |  |  |  |  |  |
| UAT |  |  |  |  |  |  |
| Release/operations |  |  |  |  |  |  |

### 25.3 Release recommendation

**Recommendation:** Not yet executed - Approve / Approve with permitted accepted risks / Reject

The final recommendation shall summarise:

- gate results;
- Must failures;
- High waivers;
- UAT results;
- known limitations;
- content/rights status;
- browser/accessibility status;
- persistence/security/privacy risk;
- rollback readiness;
- specialist approvals.

---

## 26. Open Questions

No unresolved product or rules decision blocks approval of this plan. The following are execution, architecture, tooling, scheduling, or release-freeze details.

| ID | Question | Owner | Decision point | Status |
|---|---|---|---|---|
| OQ-TP-001 | Which unit, component, browser, accessibility, performance, mutation/property, and reporting tools form the implementation test stack? | Technical / QA | Architecture/initial codebase | Open; downstream |
| OQ-TP-002 | Which tests run on every PR, nightly, release candidate, and manual cadence while preserving required coverage? | Technical / QA | CI design | Open; downstream |
| OQ-TP-003 | Which exact OS/browser/device/AT versions are frozen for the first RC? | QA / UX | RC test freeze | Open; downstream |
| OQ-TP-004 | Are the proposed 10 valid Palace usability sessions sufficient after pilot variance, or should the Product Owner approve a larger sample? | Product / UX / QA | Before Palace UAT | Open; proposed plan value |
| OQ-TP-005 | Which participant recruitment channel and compensation/consent policy will be used? | Product / Operations / Privacy | Before recruitment | Open; operational |
| OQ-TP-006 | What exact tasks constitute the scored 'agreed core flow' for the 80% denominator? | Product / UX / QA | UAT script freeze | Open; downstream detail |
| OQ-TP-007 | Which five-point survey wording and acceptable threshold labels are approved for the 70% measures? | Product / UX | UAT materials | Open; downstream detail |
| OQ-TP-008 | Which deterministic Palace seed set is used for internal QA versus participant sessions? | Rules / QA | Fixture freeze | Open; downstream |
| OQ-TP-009 | How are large-save and migration corpora generated and retained without using private user data? | Technical / QA / Privacy | Test-data implementation | Open; downstream |
| OQ-TP-010 | Which performance environment uses physical maintained devices versus equivalent throttling? | Technical / QA | Performance plan | Open; downstream |
| OQ-TP-011 | Which security scanner, dependency/licence scanner, secret scanner, header checker, and adversarial corpus become required release tools? | Technical / QA / Content | CI/security design | Open; downstream |
| OQ-TP-012 | Where are screenshots, videos, AT notes, benchmark outputs, manifests, and signed approvals retained? | QA / Operations | Evidence repository design | Open; downstream |
| OQ-TP-013 | Which architecture/operations document supplies the final hosting, synthetic availability, deployment, and rollback test procedure? | Technical / Operations | Architecture/hosting plan | Open; downstream dependency |
| OQ-TP-014 | How are flaky tests detected, quarantined, time-bounded, and prevented from weakening release gates? | Technical / QA | CI policy | Open; downstream |
| OQ-TP-015 | Which source/DRS transcription corrections are part of the initial content corpus and which require new content versions? | Rules / Content / QA | Content-authoring workflow | Open; downstream |
| OQ-TP-016 | Which known browser-storage limitations qualify as documented platform limitations versus release failures? | Technical / QA / Product | Browser matrix execution | Open; downstream |

---

## 27. Approval

Approval accepts the test scope, gates, matrices, minimum participant plan, evidence rules, severity model, and proposed execution thresholds. Tool/vendor selections and exact RC version numbers remain downstream implementation details provided they satisfy this plan.

| Role | Name | Decision | Date | Notes |
|---|---|---|---|---|
| Product Owner |  | Pending / Approved / Rejected |  | Approves scope, Palace flow, UAT thresholds, go/no-go, and release recommendation |
| QA / Test Lead |  | Pending / Approved / Rejected |  | Approves strategy, coverage, fixtures, evidence, severity, and traceability |
| Technical Lead |  | Pending / Approved / Rejected |  | Approves automation feasibility, fault/simulation/performance/security/build evidence |
| Rules / Product Designer |  | Pending / Approved / Rejected |  | Approves expected rules outcomes, fixtures, and source-fidelity evidence |
| UX / Accessibility Reviewer |  | Pending / Approved / Rejected |  | Approves browser/viewport, keyboard, AT, usability, and accessibility evidence |
| Content / Licensing Reviewer |  | Pending / Approved / Rejected |  | Approves content/source/manifest/notices/dependency test coverage |
| Privacy / Security Reviewer |  | Pending / Approved / Rejected |  | Approves privacy, diagnostics, import, network, logging, and security evidence |
| Technical / Operations Owner |  | Pending / Approved / Rejected |  | Approves deployment, production smoke, incident, availability, and rollback evidence |
