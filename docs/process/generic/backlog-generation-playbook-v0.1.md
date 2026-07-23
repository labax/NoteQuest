# Backlog Generation Playbook

## Generic Game Adaptation Process

*Version 0.1 | Template and process | Prepared for reuse across rules-first game adaptation projects*

| Field | Value |
|---|---|
| Template owner | Product Owner / Delivery Lead |
| Process scope | Translating approved adaptation documents into milestones, epics, issues, labels, agent prompts, verification evidence, and close-out updates |
| Related documents | Product-Agnostic Game Adaptation Process v0.1; Product Profile Template v0.1; Source Material Intake and Rights Matrix v0.1; Rules Extraction Taxonomy v0.1; Agent Task Template Standard v0.1; PR and Issue Workflow |
| Primary audience | Product owner, delivery lead, technical lead, rules designer, QA lead, content reviewer, implementation agents, and reviewers |
| Status | Draft template |
| Last updated | 2026-07-23 |

---

## Contents

1. Purpose
2. When to Use This Playbook
3. Required Inputs
4. Backlog Principles
5. Roles and Responsibilities
6. Backlog Object Model
7. Phase Planning
8. Epic Creation
9. Story Creation
10. Label and Classification Model
11. Dependency Mapping
12. Agent Readiness
13. Issue Body Standard
14. Prompt Generation
15. Review and Merge Flow
16. Issue Closure and Tracker Updates
17. Release-Forward Work
18. Quality Gates
19. Generic Example
20. Acceptance Criteria
21. Approval

---

## 1. Purpose

This playbook defines how to convert approved game adaptation documents into a GitHub-ready backlog that can be implemented, reviewed, merged, and closed with evidence.

It abstracts the NoteQuest issue-creation approach into a product-agnostic workflow:

approved documents -> delivery phases -> epics -> child stories -> labels -> agent prompts -> PRs -> verification -> issue closure -> release tracking

The playbook is intentionally configurable. Product profiles supply the product name, branch model, milestone names, labels, release boundaries, stack, and content policy.

---

## 2. When to Use This Playbook

Use this playbook when:

- starting backlog creation for a new game adaptation;
- turning approved documents into milestones and issues;
- splitting a large rules domain into implementation stories;
- deciding whether an issue is agent-ready, agent-assisted, or human-gated;
- writing issue bodies that implementation agents can complete safely;
- preparing Codex or other agent prompts;
- reviewing whether PRs satisfy linked issues;
- closing issues and updating parent epics; or
- preparing a release-forward PR from an integration branch to a release branch.

Do not use this playbook to bypass missing product, rules, rights, data, UX, or test decisions. Missing decisions should become open questions or human-gated issues.

---

## 3. Required Inputs

| Input | Required before | Notes |
|---|---|---|
| Product profile | Any backlog generation | Controls product-specific terms and branch model |
| Source material intake and rights matrix | Content or rules issues | Blocks unapproved material from implementation scope |
| Product scope | Epic planning | Defines release boundary and exclusions |
| Decision register | Issue creation | Resolves adaptation rulings and open questions |
| Rules extraction taxonomy/register | Rules-heavy stories | Supplies rule IDs, tables, actions, fixtures, edge cases |
| Data/domain model | Persistence and entity stories | Supplies identities, ownership, schema, import/export, migrations |
| UX/wireframe requirements | UI stories | Supplies flows, states, accessibility, responsive expectations |
| Non-functional requirements | Quality and platform stories | Supplies performance, privacy, compatibility, accessibility, release gates |
| Acceptance criteria/test plan | Story and PR review | Supplies scenario and verification requirements |
| Agent task template standard | Agent-ready issues | Supplies self-contained implementation prompt rules |
| PR and issue workflow | Review and close-out | Supplies merge, re-review, Codex-comment, and closure discipline |

If an input is missing, create an enabling documentation or decision issue before implementation issues that depend on it.

---

## 4. Backlog Principles

| ID | Principle | Meaning |
|---|---|---|
| BGP-001 | Documents before dependent implementation | Implementation stories should depend on approved source, rules, rights, UX, data, and test decisions |
| BGP-002 | Epics describe outcomes | Epics should represent deliverable product capabilities or process gates, not vague work buckets |
| BGP-003 | Stories are independently reviewable | Each story should have a bounded diff, acceptance criteria, and verification evidence |
| BGP-004 | Labels communicate ownership and gates | Labels should show domain, agent readiness, milestone, risk, and human-gated dependencies |
| BGP-005 | Agent prompts are derived, not invented | Prompts should be generated from the issue body and approved documents |
| BGP-006 | Rights are release gates | Unapproved source content blocks public deliverables |
| BGP-007 | Tests scale with risk | Shared rules, persistence, content, and UX contracts require stronger verification |
| BGP-008 | Closure is evidence-based | Close issues only after merge, required checks, delivered scope, and parent trackers are updated |
| BGP-009 | Product vocabulary is profile data | Generic backlog templates should not hard-code one game's names |
| BGP-010 | Deferred work remains visible | Out-of-scope and follow-up items should become explicit deferrals or future issues |

---

## 5. Roles and Responsibilities

| Role | Responsibilities |
|---|---|
| Product Owner | Approves release phases, epic scope, acceptance criteria, and out-of-scope decisions |
| Delivery Lead | Maintains milestone plan, dependencies, issue sequencing, labels, and tracker hygiene |
| Rules Designer | Supplies rules IDs, fixtures, edge cases, and implementation boundaries |
| Technical Lead | Confirms architecture, branch model, dependency order, build/test scripts, and code ownership |
| UX Designer | Supplies flow and responsive/accessibility requirements for UI issues |
| QA Lead | Confirms test plan coverage, simulations, CI requirements, and manual verification needs |
| Content / Licensing Reviewer | Confirms source content disposition and release blockers |
| Implementation Agent | Works only from self-contained agent-ready issues and reports verification evidence |
| Reviewer | Reviews PRs against linked issue scope, acceptance criteria, and regression risk |

---

## 6. Backlog Object Model

| Object | Purpose | Required fields |
|---|---|---|
| Phase | Major delivery interval or release gate | Name, goal, entry criteria, exit criteria, dependencies |
| Epic | Product capability, process package, or milestone outcome | Summary, scope, child stories, acceptance gates, owner |
| Story | Independently reviewable unit of work | Goal, must/should/could, out of scope, acceptance criteria, tests |
| Task prompt | Agent-ready work instruction | Repo, issue, scope, files, dependencies, verification, expected output |
| PR | Proposed implementation or doc change | Linked issue, summary, changed files, checks, risks |
| Review finding | Concrete defect or missing evidence | Severity, file/line if applicable, impact, requested fix |
| Close-out record | Evidence that work is done | Merge status, checks, issue closure, epic checkbox, follow-ups |

---

## 7. Phase Planning

A phase is valid when it has:

- a product goal;
- entry criteria;
- exit criteria;
- blocking dependencies;
- included epics;
- excluded work;
- quality gates; and
- release or handoff expectations.

Example phase categories:

| Phase type | Use for |
|---|---|
| Foundation | Repository, tooling, architecture, documentation, CI, labels |
| Source and rights | Source inventory, permission evidence, content policy, blocked materials |
| Rules core | Rules extraction, deterministic engine, table resolution, fixtures |
| Vertical slice | One representative module or dungeon proving the architecture |
| Full content | Remaining approved content domains |
| UX and accessibility | Responsive flows, textual equivalents, keyboard paths, visual polish |
| Persistence and recovery | Save model, migration, import/export, recovery, history |
| Simulation and QA | Large seed runs, smoke failures, deterministic reports |
| Release | notices, deployment, rollback, release-forward branch, public artifacts |

Do not assume a fixed M0 to M9 sequence. A product profile may define any phase model.

---

## 8. Epic Creation

Each epic should include:

| Field | Guidance |
|---|---|
| Epic title | Short deliverable outcome, prefixed consistently if the product uses milestone IDs |
| Goal | What product or process state will exist when the epic is complete |
| Source documents | Approved docs that control the epic |
| Scope | Included domains, systems, docs, or gates |
| Out of scope | Explicit deferred work |
| Child stories | Checklist with issue numbers once created |
| Dependencies | Prior epics, decisions, rights approvals, or technical foundations |
| Acceptance gates | What must be true before the epic closes |
| Agent suitability | Which child stories can be agent-ready |
| Close-out rules | Merge, checks, issue closure, tracker updates, release handoff |

Epic anti-patterns:

- mixing unrelated product outcomes only because they share a milestone;
- creating one giant implementation issue for an entire rules domain;
- leaving rights review as an implicit later task;
- making child stories depend on unapproved source interpretation;
- failing to include tests or evidence in child stories.

---

## 9. Story Creation

A story is ready when it answers:

| Question | Required answer |
|---|---|
| What user, system, or reviewer outcome changes? | Clear goal |
| What must be delivered? | Must-have checklist |
| What may be delivered if cheap and safe? | Should/could checklist |
| What must not be touched? | Out-of-scope section |
| Which source/rule/content IDs control it? | Traceability references |
| Which files or modules are likely affected? | Implementation notes |
| What tests prove it? | Verification requirements |
| What blocks it? | Dependencies or human gates |
| Who can do it? | Agent-ready, agent-assisted, or human-gated classification |

Story sizing guidance:

| Story size | Good fit |
|---|---|
| Small | Single doc, table, resolver, UI state, fixture, or workflow check |
| Medium | One coherent feature slice with tests and docs |
| Large | Epic candidate; split before assigning to an implementation agent |
| Risk-heavy | Keep narrow and add stronger test gates |

---

## 10. Label and Classification Model

Recommended label groups:

| Label group | Examples | Purpose |
|---|---|---|
| Work type | feature, bug, docs, test, refactor, chore | Basic issue kind |
| Domain | rules, content, ui, data, persistence, qa, ops, licensing | Ownership and review routing |
| Priority | must, should, could, blocker | Scope pressure |
| Agent fit | agent-ready, agent-assisted, human-gated | Automation suitability |
| Risk | rights-risk, migration-risk, rules-risk, accessibility-risk | Review emphasis |
| Phase | phase-foundation, phase-prototype, phase-release | Roadmap tracking |
| Status | blocked, needs-decision, needs-review, ready | Triage state |

Projects may use different label names, but the product profile should define the mapping.

Classification rules:

| Classification | Meaning |
|---|---|
| Agent-ready | Issue is self-contained, rights-safe, testable, and does not require judgment outside the issue and referenced docs |
| Agent-assisted | Agent can draft or implement portions, but a human must resolve interpretation, UX, rights, or product decisions |
| Human-gated | Work cannot proceed until human approval, source permission, design choice, or legal/product decision exists |
| Human-led | Work is primarily human judgment, negotiation, visual approval, playtest, or legal review |

---

## 11. Dependency Mapping

Before creating implementation issues, map dependencies:

| Dependency type | Examples |
|---|---|
| Document dependency | Rules spec before rules engine issue |
| Rights dependency | Source table approved before bundled content issue |
| Data dependency | Schema before persistence feature |
| UX dependency | Wireframe before responsive UI implementation |
| Test dependency | Fixture manifest before resolver implementation |
| Technical dependency | Build scripts before CI issue |
| Product dependency | Prototype go decision before full content expansion |
| External dependency | Permission, asset delivery, hosting credential, or domain setup |

Represent dependencies in:

- issue body;
- epic checklist order;
- labels;
- milestones;
- Codex prompt dependency checks;
- PR description; and
- close-out notes.

---

## 12. Agent Readiness

An issue is agent-ready only when:

- the repository and target branch are known;
- relevant source documents are linked or quoted in bounded form;
- source-derived content has rights disposition;
- implementation scope is explicit;
- out-of-scope items are explicit;
- dependencies are satisfied or the issue tells the agent to stop;
- likely files or folders are identified;
- acceptance criteria are testable;
- verification commands are listed;
- expected output format is specified; and
- there is no unresolved product, rights, legal, UX, or rules judgment.

If an issue fails one or more checks, classify it as agent-assisted or human-gated and create the missing decision work.

---

## 13. Issue Body Standard

Every implementation story should include:

1. Title
2. User story or system goal
3. Linked epic/milestone
4. Source and decision references
5. Scope
6. Must have
7. Should have
8. Could have
9. Out of scope
10. Dependencies
11. Implementation notes
12. Data/rules/content impact
13. UX/accessibility notes
14. Acceptance criteria
15. Testing/build notes
16. Content/licensing checklist
17. Agent readiness classification
18. Definition of done

Minimum acceptance criteria:

- behaviour or artifact exists;
- relevant tests or verification evidence exist;
- no unrelated scope is added;
- source/content restrictions are respected;
- docs or trackers are updated when required.

---

## 14. Prompt Generation

Agent prompts should be generated from the issue body and the Agent Task Template Standard.

Prompt generation rules:

- Include repository, issue number, and issue title.
- Tell the agent what source of truth to use.
- Include relevant files or folders.
- Include dependency checks and stop conditions.
- Include goal, must-have, should-have, could-have, and out-of-scope sections.
- Include implementation guidance.
- Include acceptance criteria.
- Include verification requirements.
- Include expected output.
- Preserve already-fixed behaviour in follow-up prompts.
- Keep review-fix prompts narrowed to the findings.

Prompt anti-patterns:

- asking the agent to infer from branch name;
- omitting source or rights context;
- asking for broad cleanup with implementation work;
- copying source prose into the prompt unnecessarily;
- using a template from a different product without replacement;
- asking for tests without saying which checks exist.

---

## 15. Review and Merge Flow

Each PR should be reviewed against:

- the linked issue;
- relevant acceptance criteria;
- changed files;
- rules, data, UX, and rights contracts;
- tests added or updated;
- CI status for the current head SHA;
- branch compare state;
- prior review comments; and
- regression risk.

Findings should lead review output and be ordered by severity.

Merge only when:

- required findings are resolved;
- required checks pass or documented exceptions are approved;
- scope matches the issue;
- linked issues and epics are ready for close-out; and
- release gates are not bypassed.

---

## 16. Issue Closure and Tracker Updates

Close a child issue only after:

- the PR is merged to the correct integration branch;
- the merge commit is known or visible;
- required tests/checks are complete;
- acceptance criteria are satisfied;
- follow-up issues are created for deferred work when needed;
- the issue is closed with a completed reason if supported; and
- the parent epic checklist is updated accurately.

Do not mark future or deferred work complete.

Close an epic only after:

- every child story is merged or explicitly removed from scope;
- phase exit criteria are satisfied;
- required release notes, docs, or reports exist;
- unresolved blockers are closed or moved to a later approved phase; and
- the product owner accepts the phase close-out.

---

## 17. Release-Forward Work

Use release-forward PRs when integrating from an active development branch to a release branch.

A release-forward PR should include:

- source branch and target branch;
- included milestone or phase;
- list of included epics/issues;
- verification status;
- unresolved risks;
- release notes or docs changes;
- rollback or deployment notes when relevant.

Do not assume branch names. The product profile controls the integration and release branch model.

---

## 18. Quality Gates

| Gate | Required evidence |
|---|---|
| Backlog ready | Product profile, source intake, rights matrix, scope, and decision register are available |
| Epic ready | Goal, child story plan, dependencies, exit criteria, and scope boundaries exist |
| Story ready | Self-contained issue body with acceptance criteria and tests |
| Agent ready | No unresolved human judgment, rights, source, UX, or rules ambiguity |
| PR ready | Linked issue, bounded diff, verification evidence, and clean scope |
| Merge ready | Findings resolved and required checks acceptable |
| Issue close ready | Merge complete, acceptance satisfied, tracker updated |
| Release ready | Release-forward PR, gates, notices, rollback, and residual risks reviewed |

---

## 19. Generic Example

| Phase | Epic | Example child stories |
|---|---|---|
| Foundation | Establish repository and process baseline | Tooling, CI, docs governance, product profile |
| Source and rights | Approve source material boundary | Intake register, rights matrix, content disposition |
| Rules core | Implement deterministic rules foundation | Rule IDs, random streams, table resolver, fixture harness |
| Vertical slice | Deliver representative playable module | One module, persistence, UI, smoke simulation |
| Full release | Complete approved release scope | Remaining modules, accessibility, release gates, notices |

---

## 20. Acceptance Criteria

This playbook is ready to use when:

- [ ] The product profile defines branch model, phase model, labels, and agent classifications.
- [ ] Required source, rights, scope, decision, rules, data, UX, NFR, and test documents are listed.
- [ ] Every phase has entry and exit criteria.
- [ ] Every epic has child stories or an explicit planning task to create them.
- [ ] Every story has scope, out-of-scope, dependencies, acceptance criteria, and verification requirements.
- [ ] Every agent-ready issue passes the agent-readiness checklist.
- [ ] Every source-derived issue references rights disposition.
- [ ] Every rules-heavy issue references rule IDs and fixture requirements.
- [ ] PR review and close-out rules are documented.
- [ ] Parent epic and release-forward updates are part of the workflow.

---

## 21. Approval

| Role | Name | Decision | Date | Notes |
|---|---|---|---|---|
| Product Owner |  | Pending / Approved / Rejected |  |  |
| Delivery Lead |  | Pending / Approved / Rejected |  |  |
| Technical Lead |  | Pending / Approved / Rejected |  |  |
| QA Lead |  | Pending / Approved / Rejected |  |  |
