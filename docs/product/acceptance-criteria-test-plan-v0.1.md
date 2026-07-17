# Acceptance Criteria / Test Plan

## NoteQuest Web Application - Palace Prototype and Core MVP

*Version 0.1 | Draft for Review | Prepared for the NoteQuest Project*

| Field | Value |
|---|---|
| Document owner | QA / Test Lead |
| Related documents | [Business Requirements Document v0.1](business-requirements-v0.1.md); [MVP Scope v0.1](mvp-scope-v0.1.md); [Product Requirements Document v0.1](product-requirements-v0.1.md); [Functional Requirements Document v0.1](functional-requirements-v0.1.md); [Digital Rules Specification v0.1](digital-rules-specification-v0.1.md); [Data Model / Domain Model Specification v0.1](data-domain-model-v0.1.md); [UX Flow / Wireframe Requirements v0.1](ux-flow-wireframe-requirements-v0.1.md); [Non-Functional Requirements v0.1](non-functional-requirements-v0.1.md); [Content & Licensing Requirements v0.1](content-licensing-requirements-v0.1.md); [Digital Adaptation Decision Register](digital-adaptation-decision-register.md); [Decision Register v0.2](digital-adaptation-decision-register-v0.2.md) |
| Product scope | Palace production-intent prototype, followed by complete six-dungeon Core MVP after written Palace go |
| Primary audience | Product owner, developer, rules designer, UX/accessibility reviewer, QA/tester, content/licensing reviewer, operations owner, and playtesters |
| Status | Draft for review; this index and all linked normative parts form one test-plan baseline |
| Last updated | 2026-07-17 |

---

## 1. Document structure

The test plan is maintained as a master document plus seven normative parts. This keeps detailed acceptance criteria and execution matrices reviewable while preserving one stable plan version.

| Part | Coverage |
|---|---|
| [Part D - Purpose, Sources, Context, Scope, and Strategy](acceptance-criteria-test-plan-v0.1-part-d-strategy.md) | Sections 1-7 |
| [Part E - Test Levels, Environments, Data, Entry, and Exit](acceptance-criteria-test-plan-v0.1-part-e-levels-environments.md) | Sections 8-12 |
| [Part F - Release Gates and Global Criteria](acceptance-criteria-test-plan-v0.1-part-f-gates-global.md) | Sections 13-14 |
| [Appendix A - Feature-Level Acceptance Criteria](acceptance-criteria-test-plan-v0.1-appendix-a-feature-criteria.md) | Section 15 |
| [Appendix B - Detailed Acceptance Scenarios](acceptance-criteria-test-plan-v0.1-appendix-b-scenarios.md) | Section 16 |
| [Appendix C - Rules, Data, UX, and Content Matrices](acceptance-criteria-test-plan-v0.1-appendix-c-matrices.md) | Sections 17-20 |
| [Part G - Regression, UAT, Defects, Traceability, Execution, Questions, and Approval](acceptance-criteria-test-plan-v0.1-part-g-execution-approval.md) | Sections 21-27 |

Approval of the master document approves all linked parts at the same version unless the approval comments explicitly identify an excluded or amended part.

## 2. Decision status

No new product or rules decision register is required before this plan. The existing approved decision registers already fix:

- Palace as the production-intent prototype;
- all Must prototype scenarios and written go/no-go;
- at least 100,000 deterministic seeds per dungeon type;
- zero non-terminating or unreachable-boss cases;
- zero required persistence corruption/loss in the fault matrix;
- at least 80% unaided core-flow completion;
- at least 70% acceptable-or-better ratings for combat pacing, map clarity, and overall play;
- current and previous two major Chrome, Edge, Firefox, and Safari versions;
- 360, 390, 768, 1024, 1280, and 1440 CSS-pixel validation;
- WCAG 2.2 AA, keyboard, NVDA, VoiceOver, TalkBack, and textual-map parity;
- three local save slots, recovery, deterministic streams, import/export, and sequential migration;
- content, privacy, release, and operations gates.

The plan introduces execution-level values such as a proposed minimum of ten valid Palace usability sessions, evidence structure, fixture naming, and suite partitioning. These are test-plan decisions and become normative only when this plan is approved.

## 3. Primary release gates

### Palace written-go gate

Palace may receive written go only when:

1. all Palace Must functional and non-functional scenarios pass;
2. the Palace generation suite produces zero required failure across at least 100,000 deterministic seeds;
3. persistence, interruption, quota, migration/import, and recovery matrices produce zero silent corruption or required unrecoverable loss;
4. at least 80% of valid representative participants complete the agreed core flow without facilitator intervention or external bookkeeping;
5. at least 70% rate combat pacing, map clarity, and overall play acceptable or better;
6. phone, keyboard, visual/textual-map, and representative screen-reader journeys pass;
7. rights-safe placeholder content and the Palace manifest pass;
8. no Blocker or Critical defect remains open; and
9. Product and Technical/Operations owners record a written go/no-go decision.

### Core MVP release gate

The Core MVP may release only when:

- all approved Must requirements and Must NFRs have passing evidence or a permitted documented waiver;
- all six dungeon types pass the approved deterministic generation volume;
- the browser, viewport, accessibility, persistence, security, privacy, content, build, deployment, and rollback gates pass;
- the public artifact is traceable to a protected reviewed release ref and exact content manifest;
- the previous accepted artifact remains deployable;
- no Blocker or Critical defect and no unwaived High defect remains; and
- the complete approved experience remains English-only, free, and non-monetised.

## 4. Evidence and result rules

Every Must requirement maps to at least one acceptance criterion, planned test/review, owner, and execution artifact.

Valid results are:

| Result | Meaning |
|---|---|
| Pass | Observed result and evidence satisfy the criterion. |
| Fail | Observed result contradicts the criterion or a required threshold is missed. |
| Blocked | A named prerequisite or environment is unavailable; this is not a pass. |
| Not run | No valid execution evidence exists. |
| Not applicable | Formally outside the selected build and traceably excluded. |
| Waived | A permitted High-or-lower failure is accepted through the documented waiver process. |

Blocker and Critical failures cannot be waived.

## 5. Approval

| Role | Name | Decision | Date | Notes |
|---|---|---|---|---|
| Product Owner |  | Pending / Approved / Rejected |  | Scope, Palace flow, UAT thresholds, go/no-go, release |
| QA / Test Lead |  | Pending / Approved / Rejected |  | Strategy, coverage, fixtures, evidence, severity, traceability |
| Technical Lead |  | Pending / Approved / Rejected |  | Automation, fault/simulation/performance/security/build evidence |
| Rules / Product Designer |  | Pending / Approved / Rejected |  | Expected rules outcomes and source-fidelity evidence |
| UX / Accessibility Reviewer |  | Pending / Approved / Rejected |  | Browser/viewport, keyboard, AT, usability, accessibility |
| Content / Licensing Reviewer |  | Pending / Approved / Rejected |  | Content/source/manifest/notices/dependency coverage |
| Privacy / Security Reviewer |  | Pending / Approved / Rejected |  | Privacy, diagnostics, import, network, logging, security |
| Technical / Operations Owner |  | Pending / Approved / Rejected |  | Deployment, production smoke, incident, availability, rollback |
