# GitHub Issue Creation Process

## NoteQuest Project

*Version 0.1 | Draft for Review | Prepared for the NoteQuest Project*

| Field | Value |
|---|---|
| Document owner | Product Owner |
| Process scope | Turning approved NoteQuest documentation into GitHub milestones, epic issues, feature stories, Codex task labels, implementation prompts, and close-out evidence |
| Related documents | [Documentation Development and Governance Process v0.1](documentation-development-governance-process-v0.1.md); [MVP Scope v0.1](mvp-scope-v0.1.md); [Functional Requirements v0.1](functional-requirements-v0.1.md); [Digital Rules Specification v0.1](digital-rules-specification-v0.1.md); [Data / Domain Model v0.1](data-domain-model-v0.1.md); [UX Flow / Wireframe Requirements v0.1](ux-flow-wireframe-requirements-v0.1.md); [Acceptance Criteria / Test Plan v0.1](acceptance-criteria-test-plan-v0.1.md); [Web Architecture, Offline Strategy and Hosting Plan v0.1](web-architecture-offline-hosting-plan-v0.1.md) |
| Templates used | [Epic template](templates/epic_template.md); [Feature story template](templates/feature_story_template.md); [Codex prompt template](templates/codex_prompt_template.txt) |
| Status | Draft for review |
| Last updated | 2026-07-18 |

---

## 1. Purpose

This process formalizes the workflow used to create and maintain the NoteQuest GitHub implementation backlog from the approved product documentation.

It exists to ensure that:

- milestones represent delivery phases and gates;
- epic issues summarize milestone-level outcomes;
- feature stories remain linked to their parent epic and milestone;
- issue scope traces back to approved requirements, architecture, rules, UX, testing, and content constraints;
- Codex-ready implementation work is clearly identified;
- human-led review, licensing, product, and release work is not misclassified as implementation work;
- complex implementation stories include useful checkbox subtasks;
- Codex prompts are self-contained and reusable; and
- issue closure is based on evidence rather than assumption.

This process is a companion to the documentation governance process. The governance process defines how project documents are created and approved; this document defines how those approved documents are translated into GitHub planning issues.

## 2. Scope

### 2.1 In scope

This process governs:

- reviewing approved project documentation before backlog creation;
- defining milestone phases;
- creating milestone epic issues;
- creating child feature story issues;
- linking epics, child stories, milestones, and supporting issues;
- classifying issues by Codex implementation suitability;
- adding labels that reflect Codex ownership;
- adding checkbox subtasks where useful;
- adding Codex prompt comments;
- checking task status before closure; and
- updating related issues when a story closes.

### 2.2 Out of scope

This process does not define:

- how to implement the application code;
- how to run a sprint ceremony;
- legal approval itself;
- UX approval itself;
- public release approval itself; or
- native GitHub project-board automation.

## 3. Inputs

Before creating or updating backlog issues, inspect the current repository documentation and identify the controlling inputs for the work being planned.

Required inputs include:

- source material and any permitted project source extracts;
- product and MVP scope documents;
- digital rules specification;
- functional requirements;
- data and domain model;
- UX flow and wireframe requirements;
- wireframes under `docs/product/wireframes/ux-v0.1/`;
- non-functional requirements;
- content and licensing requirements;
- acceptance criteria and test plan;
- implementation and release decisions;
- architecture, offline, and hosting plan; and
- issue templates under `docs/product/templates/`.

Do not create issue scope from memory when a controlling document exists. If an implementation-relevant decision is absent or contradictory, create or identify a decision issue instead of hiding the uncertainty inside a story.

## 4. Issue Hierarchy

Use the following hierarchy unless the repository later adopts a native GitHub hierarchy feature.

| Level | GitHub object | Purpose |
|---|---|---|
| Delivery phase | Milestone | Groups all work for a numbered implementation phase, such as `M0` through `M9`. |
| Milestone epic | Issue using the epic template | Describes the outcome, scope, acceptance criteria, dependencies, child stories, and implementation order for one milestone. |
| Feature story | Issue using the feature story template | Describes one deliverable user-facing, technical, documentation, testing, or governance slice. |
| Supporting issue | Issue using the feature story template or a focused tracking format | Captures cross-epic work, implementation-order records, release gates, or ownership classifications that support multiple stories. |
| Checkbox subtask | Markdown checklist item inside an issue | Breaks down a complex story without creating extra GitHub issues. |
| Codex prompt | Issue comment containing a fenced prompt block | Provides self-contained implementation instructions for Codex. |

## 5. Historical NoteQuest Issue Sequence

The NoteQuest backlog was created in the following sequence:

1. Reviewed the approved documentation set and the attached NoteQuest source material to identify the implementation flow.
2. Broke the flow into numbered milestones `M0` through `M9`.
3. Created one epic issue for each milestone using the epic template.
4. Populated each epic with planned child-story placeholders before the child issues existed.
5. Created child feature story issues for each epic using the feature story template.
6. Assigned every child story to the same milestone as its parent epic.
7. Replaced parent-epic child-story placeholders with real GitHub issue links.
8. Updated epic relation sections so child stories, supporting issues, blockers, and cross-epic dependencies were visible from the parent.
9. Created a supporting story for recommended implementation order and Codex ownership classification.
10. Reviewed the implementation story range and labeled each issue as `codex-task`, `codex-assist`, or `human-led`.
11. Added checkbox subtasks to Codex implementation issues that were too broad to execute safely as a single action.
12. Verified checkbox status issue by issue, updating only checkboxes supported by evidence.
13. Added self-contained Codex prompt comments to Codex implementation issues, with one prompt per subtask where subtasks existed.
14. Closed initial M0 planning stories only after adding close-out evidence comments, checking applicable boxes, and updating the parent M0 epic.

The observed issue structure was:

- milestone epics: `#30` through `#39`;
- child stories: `#40` through `#111`; and
- implementation-order and ownership support story: `#112`.

This historical sequence is descriptive, not a permanent numbering requirement. Future issue numbers may differ, but the relationship model and evidence rules should remain the same.

## 6. Milestone Creation Process

1. Review the architecture implementation sequence and product release gates.
2. Break the flow into numbered milestones, such as `M0` through `M9`.
3. Give each milestone a concise title, phase goal, and outcome description.
4. Ensure each milestone has clear entry dependencies and exit conditions.
5. Avoid mixing planning, implementation, release evidence, and post-MVP work in the same milestone unless the docs explicitly require that coupling.
6. Confirm that every future issue can be assigned to exactly one primary milestone.

Milestones are delivery containers. They do not replace epics, and they should not carry all story-level acceptance detail.

## 7. Epic Creation Process

Create one epic issue for each milestone using `docs/product/templates/epic_template.md`.

Each epic should include:

- a user or stakeholder story;
- a one-sentence goal;
- milestone scope grouped as Must, Should, Could, and Out of Scope;
- testable milestone acceptance criteria;
- planned child stories;
- supporting or cross-epic work;
- implementation order;
- completed and ongoing dependencies; and
- definition of done.

When child stories have not yet been created, populate the `Child Stories` section with planned story placeholders. Once each child story exists, replace the placeholder with the actual issue link.

The epic issue must be assigned to the same GitHub milestone it represents.

## 8. Feature Story Creation Process

Create child stories using `docs/product/templates/feature_story_template.md`.

For each story:

1. Identify the parent epic and milestone.
2. Identify the controlling product, rules, data, UX, test, architecture, and licensing sources.
3. Write the user story and goal in terms of the deliverable outcome.
4. Fill Must, Should, Could, and Out of Scope sections.
5. Add implementation notes that point to relevant repository docs without copying large specification text.
6. Add acceptance criteria that can be verified by code, tests, documentation evidence, review, or explicit non-applicability.
7. Complete the UX notes section for UI-related work, including relevant wireframe paths.
8. Complete the data/rules/content impact checklist truthfully.
9. Complete testing/build expectations or explain when they are not applicable.
10. Complete the content/licensing checklist whenever content, asset, text, rulebook-derived material, or public release work is involved.
11. Assign the story to the same milestone as the parent epic.

Every child story must link back to:

- its parent epic;
- its milestone; and
- any directly related upstream or downstream issues.

## 9. Reciprocal Linking Rules

Because the process uses normal GitHub issues for both epics and stories, relationship integrity is maintained through Markdown links in issue bodies and comments.

Required links:

- Parent epic `Child Stories` section links to each child issue.
- Parent epic `Relations` or dependency section includes important child, supporting, blocking, or cross-epic relationships.
- Child story `Linked epic/milestone` section links to the parent epic and milestone.
- Supporting issues link to every epic or story whose sequencing or ownership they affect.
- Close-out comments mention related issue updates when those updates are made.

When a child issue is created, immediately update the parent epic. When a child issue is closed, immediately update the parent epic checklist and add a short trace comment.

## 10. Supporting Issue Process

Create a supporting issue when a concern spans several epics or when the work is useful to the backlog but is not itself a product implementation slice.

Appropriate supporting issues include:

- recommended implementation order;
- Codex task ownership classification;
- release gate coordination;
- content evidence tracking;
- playtest evidence tracking;
- cross-milestone dependency review; and
- label or project-board cleanup.

Supporting issues should still use clear acceptance criteria and should be linked from affected epics.

## 11. Codex Suitability Classification

After stories are created, review each story and classify whether it should be implemented by Codex.

Use these classifications:

| Label | Meaning | Typical examples |
|---|---|---|
| `codex-task` | Codex can directly implement and verify the work in the repository. | Data model, rules engine, UI implementation, persistence, tests, build tooling, PWA setup, import/export, diagnostics. |
| `codex-assist` | Codex can prepare artifacts or evidence, but human judgment or external review remains central. | Playtest packages, release evidence summaries, content manifests, accessibility review prep. |
| `human-led` | The main work requires product, legal, content, UX, operational, or external approval rather than code implementation. | Licensing approval, public release decision, product sign-off, playtest recruitment, final go/no-go. |

Classification rules:

- Mark an issue `codex-task` only when the issue can be advanced substantially through repository edits and local verification.
- Mark an issue `codex-assist` when Codex can create or organize evidence but cannot decide acceptance alone.
- Mark an issue `human-led` when closing the issue depends mainly on human approval, external evidence, or legal/product judgment.
- Do not treat documentation-only issue creation as product implementation unless it directly changes implementation readiness.
- Revisit labels after story scope changes.

## 12. Implementation Order Process

Create or maintain a supporting story that records the recommended implementation order and Codex ownership status for the planned issue range.

The implementation-order issue should include:

- issue number;
- issue title;
- milestone;
- parent epic;
- recommended order group;
- Codex classification;
- dependency notes;
- whether parallel work is safe; and
- any human approval gates.

Recommended ordering should favor:

1. repository baseline, tooling, and architecture confirmation;
2. deterministic rules and domain foundations;
3. persistence, save, import, export, and migration behavior;
4. application shell and PWA infrastructure;
5. main user flows;
6. UI responsiveness and accessibility;
7. history, diagnostics, and evidence;
8. content and licensing gates;
9. release hardening; and
10. post-MVP expansion.

## 13. Checkbox Subtask Process

Add checkbox subtasks only where they help Codex or reviewers execute the issue safely.

Use checkbox subtasks when:

- the issue contains multiple implementation surfaces;
- the issue crosses data, rules, UI, and tests;
- the work has clear dependency steps;
- the story has multiple verification responsibilities; or
- the issue is likely to be assigned to Codex.

Avoid checkbox subtasks when:

- the story is already a small single action;
- subtasks would duplicate acceptance criteria without adding execution clarity;
- the work is human approval rather than implementation; or
- each subtask should actually be its own independently trackable issue.

Subtasks should be imperative and verifiable, for example:

```markdown
- [ ] Add deterministic fixtures for torch depletion and dungeon exit cases.
- [ ] Implement the state transition guard in the rules engine.
- [ ] Add unit coverage for success, failure, and boundary cases.
```

## 14. Checkbox Verification Process

Before closing an issue or reporting progress:

1. Review every checkbox in the issue body.
2. Inspect the repository, documentation, comments, and related issues for evidence.
3. Check only boxes that are actually satisfied.
4. Leave boxes unchecked when evidence is missing.
5. For non-applicable template checks, either leave them unchecked or add a close-out comment explaining why they do not apply before checking them.
6. Do not make unrelated edits while verifying checkbox status.
7. Do not close an issue solely because a checkbox was added by template if the underlying story outcome is incomplete.

The preferred close-out pattern is:

- add a short evidence comment;
- update supported checkbox statuses;
- close the issue as completed only when remaining unchecked items are either out of scope, non-applicable, or intentionally deferred with evidence; and
- update related epic or supporting issue checklists immediately.

## 15. Codex Prompt Comment Process

For every `codex-task` issue, add Codex implementation prompts as issue comments using `docs/product/templates/codex_prompt_template.txt`.

Prompt rules:

- Each prompt must be self-contained.
- The prompt must not require Codex to read or remember the GitHub issue.
- The prompt must include repository name, issue number, title, goal, scope, acceptance criteria, dependencies, verification requirements, and expected output.
- The prompt must preserve issue scope and avoid unrelated implementation.
- The prompt must tell Codex to inspect relevant local files and folders before making changes.
- The prompt must include dependency checks and a clear stop condition if required dependencies are missing.
- The prompt must be posted as a fenced code block in a GitHub issue comment.
- If the issue has checkbox subtasks, each subtask that is intended for Codex should receive its own prompt comment.
- Avoid duplicate prompt comments by searching existing comments for the issue number, title, or a stable prompt marker before adding a new one.

For UI-related implementation prompts:

- point Codex to the relevant wireframe file under `docs/product/wireframes/ux-v0.1/`;
- point Codex to the project agent guidance file in `docs/` when that file exists;
- if the expected agent guidance file is missing, state that absence in the prompt or close-out evidence rather than inventing a path;
- include responsive, keyboard, focus, screen-reader, and visual-regression expectations where relevant; and
- require desktop and mobile width checks.

## 16. Issue Close-Out Process

To close an issue:

1. Fetch or review the issue body and comments.
2. Identify unchecked Must Have scope, acceptance criteria, subtasks, testing notes, and content/licensing checks.
3. Identify related epics, milestones, supporting issues, and downstream blockers.
4. Inspect repository documentation or code evidence.
5. If documentation or clarification is missing and the issue cannot be resolved safely, ask the Product Owner before changing status.
6. Add a close-out evidence comment that summarizes what was verified.
7. Update only the checkbox statuses supported by evidence.
8. Close the issue as completed when the story outcome is satisfied.
9. Update the parent epic child-story checklist.
10. Update parent epic acceptance criteria only when the closed story satisfies that epic-level criterion.
11. Update downstream dependency checkboxes only when the new evidence truly satisfies them.
12. Leave unrelated issues unchanged.

Close-out comments should include:

- the actions required;
- the evidence reviewed;
- the outcome;
- any non-applicable checks and why they are non-applicable;
- related issue updates made; and
- remaining follow-up, if any.

## 17. Labeling Process

Apply labels after story creation and again after any scope change.

Required ownership labels:

- `codex-task`;
- `codex-assist`; or
- `human-led`.

Recommended optional labels:

- `type:epic`;
- `type:story`;
- `type:gate`;
- `type:task`;
- `area:rules`;
- `area:data`;
- `area:ui`;
- `area:persistence`;
- `area:pwa`;
- `area:content`;
- `area:qa`;
- `area:release`;
- `gate:licensing`;
- `gate:accessibility`;
- `gate:playtest`;
- `M0` through `M9`, if milestone labels are useful in addition to GitHub milestones.

Do not create label complexity before it helps filtering or execution.

## 18. Quality Controls

Before considering backlog creation complete, verify:

- every milestone has a clear purpose and exit condition;
- every epic is assigned to the correct milestone;
- every child story is assigned to the same milestone as its parent epic;
- every child story links back to its parent epic;
- every parent epic links to its child stories;
- every placeholder child entry has either been replaced by a real issue link or explicitly marked as future/descoped;
- every implementation story has an ownership classification label;
- every `codex-task` issue has a self-contained prompt comment;
- every UI-related `codex-task` prompt references the relevant wireframe path;
- every complex Codex implementation issue has useful subtasks;
- issue checkboxes reflect actual evidence;
- related epics are updated when child issues close;
- no issue closes with hidden unresolved blockers; and
- no unapproved official content, copied layouts, screenshots, art, icons, or trade dress is added through issue creation.

## 19. Process Acceptance Criteria

This process may be accepted when:

- [ ] It describes how NoteQuest milestones, epics, stories, supporting issues, labels, subtasks, and Codex prompts are created.
- [ ] It preserves the distinction between GitHub milestones and epic issues.
- [ ] It requires reciprocal links between parent epics and child stories.
- [ ] It defines how to classify Codex, Codex-assist, and human-led work.
- [ ] It defines when checkbox subtasks should be added.
- [ ] It defines how checkbox status should be verified.
- [ ] It defines the issue close-out process and related-issue update rules.
- [ ] It uses the existing product templates as controlling formats.
- [ ] It references approved project documentation as the source of backlog scope.
- [ ] It avoids inventing implementation scope not supported by the approved docs.