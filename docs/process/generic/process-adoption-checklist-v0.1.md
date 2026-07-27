# Process Adoption Checklist

## Generic Game Adaptation Process

*Version 0.1 | Checklist | Prepared for adopting the generic process pack in rules-first game adaptation projects*

| Field | Value |
|---|---|
| Document owner | Product Owner |
| Review partners | Technical Lead, QA / Test Lead, Content / Licensing Reviewer, UX Reviewer |
| Process scope | First adoption of the generic game adaptation process for a new or existing product |
| Related documents | `README.md`, `product-agnostic-game-adaptation-process-v0.1.md`, `product-profile-template-v0.1.md`, `source-material-intake-and-rights-matrix-v0.1.md`, `rules-extraction-taxonomy-v0.1.md`, `backlog-generation-playbook-v0.1.md`, `generic-agent-task-template-standard-v0.1.md`, `release-readiness-checklist-v0.1.md`, `test-evidence-standard-v0.1.md`, `decision-register-template-v0.1.md`, `risk-register-template-v0.1.md`, `game-adaptation-glossary-template-v0.1.md`, `template-audit-checklist-v0.1.md` |
| Primary audience | Product owners, maintainers, contributors, reviewers, and implementation agents starting a reusable game adaptation workflow |
| Status | Draft template |
| Last updated | 2026-07-23 |

---

## Contents

1. [Purpose](#1-purpose)
2. [When to Use This Checklist](#2-when-to-use-this-checklist)
3. [Adoption Outcomes](#3-adoption-outcomes)
4. [Adoption Roles](#4-adoption-roles)
5. [Required Inputs](#5-required-inputs)
6. [Adoption Modes](#6-adoption-modes)
7. [Checklist Summary](#7-checklist-summary)
8. [Phase 0: Start Safely](#8-phase-0-start-safely)
9. [Phase 1: Configure the Product](#9-phase-1-configure-the-product)
10. [Phase 2: Classify Source Material](#10-phase-2-classify-source-material)
11. [Phase 3: Extract Rules and Terms](#11-phase-3-extract-rules-and-terms)
12. [Phase 4: Establish Governance Registers](#12-phase-4-establish-governance-registers)
13. [Phase 5: Generate the Backlog](#13-phase-5-generate-the-backlog)
14. [Phase 6: Prepare Agent and Human Workflows](#14-phase-6-prepare-agent-and-human-workflows)
15. [Phase 7: Review, Merge, and Close Work](#15-phase-7-review-merge-and-close-work)
16. [Phase 8: Prepare Releases](#16-phase-8-prepare-releases)
17. [Adoption Readiness Scorecard](#17-adoption-readiness-scorecard)
18. [Common Failure Modes](#18-common-failure-modes)
19. [Adoption Decision Record](#19-adoption-decision-record)
20. [Acceptance Criteria](#20-acceptance-criteria)

---

## 1. Purpose

This checklist helps a team adopt the generic game adaptation process for a specific rules-first product.

Use it as the first operational document when starting a new adaptation or when converting an existing project to the reusable process pack. It turns the surrounding process documents into an ordered adoption path with concrete gates.

The checklist answers four practical questions:

- What must be known before the project starts implementation work?
- Which generic documents must be filled in, reviewed, or created for this product?
- Which responsibilities belong to humans, agents, reviewers, and release owners?
- What evidence proves the process has actually been adopted instead of only copied into the repository?

This document is product-agnostic. Product names, source titles, release names, branch names, stack decisions, and rights conclusions belong in the Product Profile or case-study documents.

---

## 2. When to Use This Checklist

Use this checklist when:

- starting a new digital adaptation of a tabletop, solo, procedural, or rules-first game;
- applying the generic process pack to a second product after a successful first use;
- converting an existing game project from ad hoc documentation into a traceable process;
- preparing a backlog for agent-assisted implementation;
- onboarding new contributors into a documented game adaptation workflow;
- checking whether a project is ready for prototype or MVP planning; or
- auditing whether templates copied from another project still contain product-specific assumptions.

Do not use this checklist as a substitute for legal review, product approval, technical architecture, or test planning. It coordinates those activities; it does not replace them.

---

## 3. Adoption Outcomes

A project has adopted the process when the following outcomes are true.

| Outcome | Evidence |
|---|---|
| Product-specific context is isolated | Approved Product Profile exists and generic templates do not contain product names except placeholders |
| Source material is controlled | Source Material Intake and Rights Matrix identifies source items, provenance, allowed use, approval state, and blockers |
| Rules are extractable | Rules Extraction Taxonomy has been used to identify domains, procedures, state, randomizers, and fixtures |
| Terminology is explicit | Game Adaptation Glossary maps source terms, product terms, UI labels, data names, and generic process vocabulary |
| Decisions are auditable | Decision Register records durable product, technical, rights, release, and process choices |
| Risks are visible | Risk Register tracks legal, rules, content, technical, UX, delivery, and release risks |
| Backlog is traceable | Epics, issues, labels, dependencies, and prompts trace to approved documents |
| Agent work is bounded | Agent task templates include scope, context, constraints, verification, and output requirements |
| Review evidence is consistent | PRs and issues follow the Test Evidence Standard |
| Release gates are enforceable | Release Readiness Checklist can approve, block, or defer a release candidate |

---

## 4. Adoption Roles

Small projects may assign multiple roles to one person. The role responsibilities should still be explicit.

| Role | Adoption responsibility |
|---|---|
| Product Owner | Owns the Product Profile, scope boundaries, release names, milestone model, and adoption decision |
| Rules / Product Designer | Extracts rules domains, procedures, state transitions, edge cases, and deviations from source material |
| Content / Licensing Reviewer | Classifies source material, defines allowed use, reviews public-facing content, and blocks unknown rights |
| Technical Lead | Defines stack, repository, branch model, CI, architecture dependencies, and implementation constraints |
| QA / Test Lead | Defines evidence standards, fixtures, regression expectations, and release test gates |
| UX Reviewer | Defines workflow expectations, accessibility defaults, terminology fit, and user-facing review needs |
| Implementation Agent | Executes bounded issues using approved prompts, verifies changes, and records evidence |
| Reviewer / Maintainer | Reviews PRs against scope, rights matrix, tests, risks, and release gates |

---

## 5. Required Inputs

Before adopting the process, gather these inputs or mark them as unavailable.

| Input | Required for | Acceptable initial state |
|---|---|---|
| Source material inventory | All adaptation projects | Partial list allowed for discovery; complete list required before public release |
| Source provenance | Rights review and traceability | Known owner, source location, edition, and acquisition notes |
| Product goal | Product Profile and backlog | One paragraph or approved concept brief |
| Intended release level | Scope and release gates | Prototype, MVP, public release, patch, or custom level |
| Repository and branch model | Backlog and PR workflow | Existing repo, new repo, or pending setup decision |
| Implementation stack | Technical tasks | Draft is enough for planning; approved before implementation issues |
| Public distribution intent | Rights and release gates | Internal only, invited testers, free public, commercial, or TBD |
| Existing docs | Migration projects | Inventory of reusable, superseded, and product-specific docs |
| Stakeholder approvals | Gate decisions | Named owner for each unresolved approval |

Unknown source rights, unknown public distribution intent, or unknown release ownership should block public-release planning until resolved.

---

## 6. Adoption Modes

Choose one adoption mode before applying the checklist.

| Mode | Use when | Recommended depth |
|---|---|---|
| New project | No implementation backlog exists yet | Complete all phases before creating implementation issues |
| Existing project migration | Code, docs, or issues already exist | Inventory first, then reconcile existing work with the process pack |
| Second-product reuse | Process was already used on another game | Start with Template Audit and Product Profile to prevent product leakage |
| Prototype rescue | Implementation began before governance | Prioritize rights matrix, risk register, and release readiness before adding features |
| Public-release hardening | Product is close to public distribution | Prioritize source rights, test evidence, release readiness, and support/rollback gates |

Record the chosen mode in the Adoption Decision Record at the end of this document or in the project Decision Register.

---

## 7. Checklist Summary

| Phase | Gate | Required artifact |
|---|---|---|
| 0. Start safely | Adoption scope is explicit | Adoption decision or issue |
| 1. Configure the product | Product context is isolated | Product Profile |
| 2. Classify source material | Rights posture is known | Source Material Intake and Rights Matrix |
| 3. Extract rules and terms | Adaptation units are visible | Rules taxonomy output and glossary |
| 4. Establish governance | Decisions and risks are auditable | Decision Register and Risk Register |
| 5. Generate backlog | Work is traceable | Backlog, epics, issues, labels, dependencies |
| 6. Prepare workflows | Agents and humans have bounded tasks | Agent task templates and review checklist |
| 7. Review and close work | Evidence is consistent | PR/issue evidence records |
| 8. Prepare releases | Release can be approved or blocked | Release Readiness Checklist |

---

## 8. Phase 0: Start Safely

Goal: confirm that the project is ready to adopt the process and that the adoption scope is not ambiguous.

### Checklist

- [ ] Identify the product, source material, and adaptation intent.
- [ ] Identify whether this is a new project, migration, reuse, rescue, or release-hardening adoption.
- [ ] Identify the repository or documentation home where process artifacts will live.
- [ ] Confirm the target branch or review flow for process documents.
- [ ] Confirm who can approve product, technical, rights, QA, and release decisions.
- [ ] Identify source material that cannot be read, stored, quoted, copied, or distributed.
- [ ] Identify whether public release or commercial release is in scope.
- [ ] Identify any existing process docs that should be reused, superseded, or archived.
- [ ] Open an adoption issue or decision record if the project uses issue tracking.

### Gate

Proceed when:

- adoption mode is selected;
- repository or documentation location is known;
- at least one owner is accountable for the Product Profile; and
- rights-sensitive source material is not being copied into generic process templates.

Block when:

- the source material cannot be lawfully accessed by the team;
- no owner can approve source rights or public distribution posture;
- the project is trying to reuse another product's profile as-is; or
- the team cannot distinguish generic process docs from product-specific docs.

---

## 9. Phase 1: Configure the Product

Goal: create a Product Profile that isolates all product-specific facts and decisions.

### Checklist

- [ ] Create a product-specific profile from `product-profile-template-v0.1.md`.
- [ ] Fill in product identity, source hierarchy, release model, and audience.
- [ ] Define prototype, MVP, public release, and patch terms used by the project.
- [ ] Define branch model, repository conventions, labels, and milestone shape.
- [ ] Define implementation stack and runtime constraints.
- [ ] Define content policy for mechanics, tables, prose, art, layout, branding, third-party assets, and generated material.
- [ ] Define quality gates for implementation issues, PRs, and releases.
- [ ] Mark unknowns as `TBD`, `Blocked`, `Deferred`, or `Requires approval`.
- [ ] Run the Product Leakage Audit in the Product Profile Template.
- [ ] Review the profile with product, rights, technical, QA, and UX owners.

### Gate

Proceed when the Product Profile is approved or explicitly approved for discovery-only use.

Block implementation issue creation when the Product Profile lacks:

- source hierarchy;
- release level definitions;
- public distribution posture;
- content rights policy;
- branch/review model; or
- minimum test evidence expectations.

---

## 10. Phase 2: Classify Source Material

Goal: identify what can be adapted, what requires approval, and what must not ship.

### Checklist

- [ ] Create a Source Material Intake and Rights Matrix for the product.
- [ ] Inventory source documents, editions, supplements, errata, websites, assets, and third-party dependencies.
- [ ] Classify source-derived items separately as mechanics, table structures, table values, short terms, player-facing prose, art, layout, branding, third-party assets, or generated assets.
- [ ] Record provenance, location, owner, reviewer, and approval state for each item.
- [ ] Define allowed use for internal planning, tests, runtime data, UI text, public docs, marketing, and distribution.
- [ ] Mark unknown, pending, blocked, or approval-required items clearly.
- [ ] Identify source-derived content that must be transformed into original expression before release.
- [ ] Identify content that can be represented as structured mechanics without copying source prose.
- [ ] Confirm attribution, license, or permission requirements.
- [ ] Record unresolved rights questions in the Risk Register.

### Gate

Proceed to backlog generation only when source-derived implementation candidates have known allowed-use status.

Block public release when any shipped content has `unknown`, `pending review`, or `blocked` rights status.

---

## 11. Phase 3: Extract Rules and Terms

Goal: convert source material into structured domains, procedures, data, terminology, and fixtures.

### Checklist

- [ ] Use `rules-extraction-taxonomy-v0.1.md` to identify rules domains.
- [ ] Identify actors, resources, counters, actions, randomizers, tables, maps, inventory, progression, failure, recovery, win/loss, and termination rules.
- [ ] Identify state transitions and invalid-state boundaries.
- [ ] Identify fixture examples for deterministic tests.
- [ ] Identify rules that require human interpretation or product decisions.
- [ ] Identify intentional deviations from the source material.
- [ ] Create or update the Game Adaptation Glossary.
- [ ] Map source terms to product terms, UI labels, data names, and generic process terms.
- [ ] Record unresolved rules ambiguity in the Decision Register or Risk Register.
- [ ] Confirm rules domains are small enough to become epics or stories.

### Gate

Proceed when each implementation candidate maps to:

- a rules domain or content module;
- source provenance;
- rights status;
- expected state behavior;
- test evidence expectation; and
- glossary terms where user-facing language is affected.

---

## 12. Phase 4: Establish Governance Registers

Goal: make important choices and uncertainties visible before they silently shape implementation.

### Decision Register Checklist

- [ ] Create or update a Decision Register from `decision-register-template-v0.1.md`.
- [ ] Record source hierarchy decisions.
- [ ] Record rules interpretation decisions.
- [ ] Record product-scope and release decisions.
- [ ] Record technical stack and architecture decisions.
- [ ] Record UX terminology and accessibility decisions.
- [ ] Record agent workflow and review decisions.
- [ ] Link decisions to source material, issues, PRs, and affected docs.

### Risk Register Checklist

- [ ] Create or update a Risk Register from `risk-register-template-v0.1.md`.
- [ ] Record legal, licensing, and source-expression risks.
- [ ] Record rules ambiguity and content completeness risks.
- [ ] Record technical, persistence, deployment, and CI risks.
- [ ] Record UX, accessibility, and onboarding risks.
- [ ] Record delivery, ownership, and review-capacity risks.
- [ ] Assign owner, likelihood, impact, mitigation, trigger, and status.
- [ ] Mark release-blocking risks explicitly.

### Gate

Proceed when every known material uncertainty is either:

- decided;
- accepted with owner and rationale;
- mitigated with follow-up work; or
- marked as a blocker.

---

## 13. Phase 5: Generate the Backlog

Goal: translate approved process artifacts into traceable epics, issues, labels, dependencies, and tasks.

### Checklist

- [ ] Confirm Product Profile, rights matrix, rules taxonomy, glossary, decision register, and risk register are current enough for backlog generation.
- [ ] Use `backlog-generation-playbook-v0.1.md` to define phases and epics.
- [ ] Avoid hard-coding milestone models from another project.
- [ ] Create epics for product-specific release phases and rules domains.
- [ ] Create stories with acceptance criteria, source references, rights notes, dependencies, test expectations, and closure evidence.
- [ ] Classify tasks as agent-implementable, agent-assisted, human-gated, or human-led.
- [ ] Apply labels consistently according to the Product Profile.
- [ ] Add dependency links and ordering constraints.
- [ ] Ensure issues do not copy protected source prose unless approved.
- [ ] Run the Template Audit Checklist before cloning issue templates from another product.

### Gate

Proceed when each implementation issue has:

- clear scope;
- source and rights context;
- rules/domain context;
- acceptance criteria;
- verification requirements;
- ownership or agent suitability classification; and
- dependency status.

---

## 14. Phase 6: Prepare Agent and Human Workflows

Goal: make implementation and review tasks safe, bounded, and repeatable.

### Checklist

- [ ] Use `generic-agent-task-template-standard-v0.1.md` for agent-ready tasks.
- [ ] Include product profile context without copying unrelated product assumptions.
- [ ] Include source and rights constraints in issue prompts.
- [ ] Include allowed files, excluded files, and expected evidence.
- [ ] Include required commands, fixtures, screenshots, or manual checks.
- [ ] Include reviewer instructions for PR scope, test evidence, rights checks, and risk updates.
- [ ] Define how Codex or other agents should comment on PRs.
- [ ] Define when a human must resolve ambiguity before implementation continues.
- [ ] Define how CI failures, skipped tests, or unavailable tools should be documented.
- [ ] Confirm agent prompts are fenced or formatted according to the project's repository convention.

### Gate

Proceed when a new contributor or agent can pick up an issue and know:

- what to change;
- what not to change;
- what source material may be used;
- how to verify the change;
- where to record evidence; and
- when to stop for human review.

---

## 15. Phase 7: Review, Merge, and Close Work

Goal: ensure completed work is evaluated consistently before merge and issue closure.

### Checklist

- [ ] Confirm each PR maps to an approved issue, decision, or release need.
- [ ] Review code, docs, data, tests, and generated artifacts against the issue scope.
- [ ] Check source-derived content against the rights matrix.
- [ ] Check terminology against the glossary.
- [ ] Check implementation behavior against rules taxonomy and accepted decisions.
- [ ] Evaluate PR evidence using `test-evidence-standard-v0.1.md`.
- [ ] Confirm skipped tests or unavailable tools have a reason and impact statement.
- [ ] Update the Decision Register when implementation locks in a durable choice.
- [ ] Update the Risk Register when risk status changes.
- [ ] Close related issues only after merge, evidence, and follow-up updates are complete.

### Gate

Merge only when:

- review findings are resolved or intentionally accepted;
- CI and evidence meet the project's required bar;
- rights-sensitive content is approved for the target release level;
- risks and decisions are updated where needed; and
- issue closure criteria are satisfied.

---

## 16. Phase 8: Prepare Releases

Goal: decide whether a prototype, MVP, public release, or patch is ready to ship.

### Checklist

- [ ] Use `release-readiness-checklist-v0.1.md` for the release level.
- [ ] Confirm release identity, branch, tag, version, or candidate identifier.
- [ ] Confirm included issues and PRs are complete.
- [ ] Confirm deferred work is explicit and not hidden inside done issues.
- [ ] Confirm all shipped source-derived content is allowed for the release audience.
- [ ] Confirm automated and manual test evidence is complete enough for the release level.
- [ ] Confirm UX, accessibility, deployment, persistence, and rollback expectations are met.
- [ ] Confirm release-blocking risks are mitigated, accepted, or still blocking.
- [ ] Prepare release notes or changelog.
- [ ] Record release decision, approvers, known issues, and follow-up work.

### Gate

Release only when the readiness decision is one of:

- `Approved`;
- `Approved with explicit follow-up`; or
- `Internal-only release approved with documented restrictions`.

Do not public-release when source rights, privacy, security, critical rules behavior, or deployment path is unknown.

---

## 17. Adoption Readiness Scorecard

Use this scorecard to decide whether adoption is complete enough for the next project stage.

| Area | 0 - Missing | 1 - Partial | 2 - Ready |
|---|---|---|---|
| Product Profile | No profile exists | Draft profile exists with gaps | Approved profile controls product-specific context |
| Source rights | Source not inventoried | Major materials listed but approvals incomplete | Rights matrix controls source use and blockers |
| Rules extraction | Rules are informal notes | Domains identified but fixtures incomplete | Domains, state, randomizers, and tests are traceable |
| Glossary | Terms are implicit | Key source terms mapped | Source, product, UI, data, and process terms are mapped |
| Decisions | Decisions live in chat/issues only | Important decisions recorded inconsistently | Decision Register is current and referenced |
| Risks | Risks are informal | Risks listed but owners/gates incomplete | Risk Register has owners, mitigations, and release blockers |
| Backlog | Work items are ad hoc | Epics/issues exist with uneven evidence | Backlog is traceable to approved docs and source rights |
| Agent tasks | Prompts are informal | Some tasks are bounded | Agent templates define context, scope, constraints, and evidence |
| Review evidence | PR evidence varies by author | Tests run but evidence is inconsistent | Test Evidence Standard is enforced |
| Release readiness | Release decision is informal | Some gates checked | Release Readiness Checklist controls release decisions |

### Interpretation

| Total score | Meaning | Recommended action |
|---:|---|---|
| 0-7 | Adoption not ready | Stop implementation planning and complete missing foundation |
| 8-14 | Discovery ready | Continue source analysis and profile work, but avoid broad implementation issues |
| 15-18 | Backlog ready | Generate or refine epics and implementation stories |
| 19-20 | Implementation ready | Start agent/human implementation with standard review and evidence gates |

A public release should not proceed unless the source rights, test evidence, risk, and release readiness areas each score `2`.

---

## 18. Common Failure Modes

| Failure mode | Symptom | Prevention |
|---|---|---|
| Product leakage | Generic templates mention another game, release name, stack, or branch model | Run Template Audit Checklist before reuse |
| Rights drift | Runtime content includes source prose or assets without approval | Maintain item-level rights matrix and review PRs against it |
| Backlog before source control | Issues are created before source material is classified | Require rights and rules context in backlog generation |
| Agent overreach | Implementation changes unrelated files or invents product rules | Use bounded agent task templates and dependency checks |
| Hidden decisions | Rules deviations or architecture choices live only in chat | Record durable choices in the Decision Register |
| Silent risk acceptance | Known legal, technical, or UX risk does not block anything | Put release-blocking flags in the Risk Register |
| Weak evidence | PR says tests passed without command output, fixtures, or manual notes | Enforce Test Evidence Standard |
| Release by momentum | Project ships because work is merged, not because gates passed | Use Release Readiness Checklist for every named release |

---

## 19. Adoption Decision Record

Use this lightweight record when the project does not yet have a full Decision Register. Move or copy it into the Decision Register once that register exists.

| Field | Value |
|---|---|
| Product | `{{PRODUCT_NAME}}` |
| Source material | `{{SOURCE_TITLE_AND_EDITION}}` |
| Adoption mode | `{{new_project | existing_project_migration | second_product_reuse | prototype_rescue | public_release_hardening}}` |
| Repository / docs home | `{{REPOSITORY_OR_DOCS_LOCATION}}` |
| Target branch or review path | `{{BRANCH_OR_REVIEW_FLOW}}` |
| Process version | `0.1` |
| Adoption owner | `{{OWNER}}` |
| Required reviewers | `{{REVIEWERS}}` |
| Public distribution intent | `{{INTERNAL_ONLY | INVITED_TESTERS | FREE_PUBLIC | COMMERCIAL | TBD}}` |
| Major blockers | `{{BLOCKERS_OR_NONE}}` |
| Decision | `{{ADOPT | ADOPT_FOR_DISCOVERY_ONLY | BLOCKED | SUPERSEDED}}` |
| Decision date | `{{YYYY-MM-DD}}` |
| Follow-up links | `{{ISSUES_OR_DOCS}}` |

---

## 20. Acceptance Criteria

This checklist is successfully applied when:

- the project has an explicit adoption mode and owner;
- product-specific facts live in a Product Profile or case study, not generic templates;
- source material and rights status are tracked before public-facing content is implemented;
- rules domains and glossary terms are explicit enough to generate backlog items;
- durable decisions and open risks have owners and review status;
- implementation issues can be generated with source, rights, scope, and verification context;
- PR review can evaluate behavior, rights, evidence, and risk consistently;
- release decisions use named gates instead of informal confidence; and
- a new contributor can start at the generic process index and understand the next required action.