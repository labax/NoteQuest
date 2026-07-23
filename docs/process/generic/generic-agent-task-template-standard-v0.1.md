# Generic Agent Task Template Standard

## Generic Game Adaptation Process

*Version 0.1 | Template standard | Prepared for reuse across agent-assisted game adaptation projects*

| Field | Value |
|---|---|
| Template owner | Product Owner / Technical Lead |
| Process scope | Standards for implementation-agent prompts, review-fix prompts, documentation prompts, verification expectations, and product-leakage controls |
| Related documents | Product-Agnostic Game Adaptation Process v0.1; Product Profile Template v0.1; Source Material Intake and Rights Matrix v0.1; Rules Extraction Taxonomy v0.1; Backlog Generation Playbook v0.1; PR and Issue Workflow |
| Primary audience | Product owner, delivery lead, technical lead, QA lead, implementation agents, and PR reviewers |
| Status | Draft template |
| Last updated | 2026-07-23 |

---

## Contents

1. Purpose
2. When to Use This Standard
3. Agent Work Classes
4. Prompt Principles
5. Required Prompt Fields
6. Dependency and Stop Conditions
7. Source, Rights, and Product-Leakage Controls
8. Implementation Prompt Template
9. Review-Fix Prompt Template
10. Documentation Prompt Template
11. Verification Requirements
12. Expected Output Standard
13. Review Checklist
14. Anti-Patterns
15. Acceptance Criteria
16. Approval

---

## 1. Purpose

This standard defines how to write safe, reusable, product-agnostic task prompts for implementation agents such as Codex.

The standard ensures that agent tasks:

- identify the exact repository, issue, branch, and source of truth;
- include enough context to complete the requested work without browsing unrelated issues or guessing from branch names;
- distinguish must-have scope from optional and out-of-scope work;
- preserve rights, source-material, and product-profile boundaries;
- stop when required dependencies or approvals are missing;
- require relevant verification; and
- produce predictable summaries for PR review.

This document does not replace issue bodies. It defines how issue bodies become executable prompts.

---

## 2. When to Use This Standard

Use this standard for:

- implementation issue prompts;
- review-fix prompts posted as PR comments;
- documentation creation or update prompts;
- test creation prompts;
- migration or release-readiness prompts;
- agent-assisted investigation tasks; and
- handoff prompts between chats, agents, or branches.

Do not use it to ask an agent to make product, rights, legal, or source-interpretation decisions that have not been approved.

---

## 3. Agent Work Classes

| Class | Meaning | Prompt requirement |
|---|---|---|
| Agent-ready | Agent may implement directly | Full scope, files, dependencies, acceptance criteria, tests, and stop conditions |
| Agent-assisted | Agent may draft or inspect but human decision remains | Explicit human decision points and no merge-ready expectation |
| Human-gated | Agent must not implement until approval exists | Prompt should gather evidence or create a decision task only |
| Human-led | Work is primarily judgment, negotiation, legal review, visual approval, or playtest | Agent may prepare materials but not decide |

An issue labelled agent-ready must satisfy the Backlog Generation Playbook readiness checklist.

---

## 4. Prompt Principles

| ID | Principle | Meaning |
|---|---|---|
| AGT-001 | Self-contained scope | The prompt must include enough issue text and references for the agent to act safely |
| AGT-002 | Repository certainty | The agent must verify repository, branch, remote, and workspace before editing |
| AGT-003 | Source of truth clarity | The prompt must say which issue text, docs, and source references control the task |
| AGT-004 | Dependency checks first | Required upstream work must be checked before implementation |
| AGT-005 | Stop conditions are explicit | Missing dependency, wrong repo, unapproved content, or failed setup must stop the task |
| AGT-006 | Rights are part of scope | Source-derived text, tables, terms, art, and layout need approved disposition |
| AGT-007 | Narrow edits | The prompt should ask for the smallest coherent change that satisfies the issue |
| AGT-008 | Verification is required | The prompt must name relevant tests or checks and require skipped-check explanations |
| AGT-009 | Output is reviewable | The agent summary must list changes, checks, skipped checks, risks, and follow-ups |
| AGT-010 | Templates must be product-clean | No terms from another product may remain in a reused prompt or issue template |

---

## 5. Required Prompt Fields

Every implementation prompt should contain:

| Field | Required | Notes |
|---|---|---|
| Repository | Yes | Full owner/name |
| Designated issue | Yes when issue-based | Exact issue number and title |
| Branch instruction | Yes | Current branch, target branch, or branch creation expectation |
| Source of truth | Yes | Provided issue text, approved docs, and local files |
| Repository checks | Yes | pwd, git status, remote, branch, relevant files |
| Dependency checks | Yes | Required upstream files, issues, approvals, fixtures, or labels |
| Stop conditions | Yes | Wrong repo, missing dependency, unapproved content, unrelated branch |
| Issue goal | Yes | One concise goal |
| Must have | Yes | Required deliverables |
| Should have | If applicable | Optional within scope |
| Could have | If applicable | Low-priority optional items |
| Out of scope | Yes | Prevents accidental expansion |
| Implementation guidance | Yes | Files, patterns, design constraints, local helpers |
| Acceptance criteria | Yes | Observable outcomes |
| Verification requirements | Yes | Scripts, tests, screenshots, simulations, docs checks |
| Expected output | Yes | Summary format for review |
| Rights/content guardrails | When applicable | Required for source-derived work |
| UX/accessibility guardrails | When applicable | Required for user-facing work |
| Persistence/migration guardrails | When applicable | Required for durable state changes |

---

## 6. Dependency and Stop Conditions

Prompts should require the agent to stop when:

- the workspace is not the intended repository;
- the target issue does not match the prompt;
- required files or docs are absent;
- upstream issue dependencies are not merged or approved;
- source material rights are missing or unapproved;
- product profile values are missing for product-specific substitutions;
- tests or fixtures required by the issue do not exist and creating them is out of scope;
- local setup cannot install or run required dependencies;
- unrelated user changes would be overwritten;
- the branch base is wrong; or
- the task requires product, legal, UX, or rules judgment not provided in the issue.

Stop messages should be specific and actionable.

---

## 7. Source, Rights, and Product-Leakage Controls

Every prompt involving rules, content, tables, copy, art, layout, screenshots, generated assets, or branding must include a content/licensing block.

Minimum content/licensing block:

| Check | Requirement |
|---|---|
| Source-derived material | Reference the rights matrix item or approved content inventory |
| Exact prose | Block unless explicit permission exists |
| Tables | Use structured data only when approved and traceable |
| Terms and names | Use only approved terms from the product profile or content inventory |
| Art and layout | Block source art, logo, page design, and trade dress unless asset-level rights exist |
| Third-party content | Require license, attribution, and provenance |
| User-authored content | Keep separate from bundled source content |
| Product leakage | Search for leftover names from other product templates before PR completion |

Generic templates must use placeholders such as:

| Placeholder | Meaning |
|---|---|
| {{PRODUCT_NAME}} | Current product name |
| {{SOURCE_TITLE}} | Source material title |
| {{SOURCE_EDITION}} | Source edition or version |
| {{REPOSITORY_FULL_NAME}} | GitHub repository |
| {{INTEGRATION_BRANCH}} | Development branch |
| {{RELEASE_BRANCH}} | Release branch |
| {{PROTOTYPE_NAME}} | Vertical-slice or prototype name |
| {{BASELINE_RELEASE_NAME}} | MVP or release name |
| {{RIGHTS_MATRIX_PATH}} | Rights matrix document |
| {{RULES_SPEC_PATH}} | Rules specification |
| {{TEST_COMMANDS}} | Required verification commands |

---

## 8. Implementation Prompt Template

Use this structure for agent-ready implementation issues.

    Repository: {{REPOSITORY_FULL_NAME}}
    Designated issue: #{{ISSUE_NUMBER}}
    Issue title: {{ISSUE_TITLE}}

    Use the issue text provided in this prompt as the source of truth.
    Do not infer the task from branch name, milestone name, latest issue, cached context, or web search.

    Before making changes:
    1. Run pwd.
    2. Run git status.
    3. Run git remote -v.
    4. Confirm the current branch and target branch.
    5. Inspect the files or folders listed below:
       - {{RELEVANT_FILES_OR_FOLDERS}}

    Repository/context checks:
    - Confirm you are working in {{REPOSITORY_FULL_NAME}}.
    - If the repository appears unrelated, empty when it should not be, or missing required dependency work, stop and report the mismatch.
    - Preserve unrelated user changes.

    Dependency checks:
    {{DEPENDENCY_CHECKS}}

    Stop if:
    {{STOP_CONDITIONS}}

    Issue goal:
    {{ISSUE_GOAL}}

    Must have:
    {{MUST_HAVE_LIST}}

    Should have:
    {{SHOULD_HAVE_LIST}}

    Could have:
    {{COULD_HAVE_LIST}}

    Out of scope:
    {{OUT_OF_SCOPE_LIST}}

    Implementation guidance:
    {{IMPLEMENTATION_GUIDANCE}}

    Content/licensing guardrails:
    {{CONTENT_LICENSING_GUARDRAILS}}

    UX/accessibility guardrails:
    {{UX_ACCESSIBILITY_GUARDRAILS}}

    Persistence/migration guardrails:
    {{PERSISTENCE_MIGRATION_GUARDRAILS}}

    Acceptance criteria:
    {{ACCEPTANCE_CRITERIA}}

    Verification requirements:
    - Run relevant local checks for this issue.
    - Prefer existing package scripts and documented commands.
    - If a check cannot be run, explain exactly why.
    - If a script or tool is not configured yet, document it as deferred rather than forcing unrelated changes.

    Expected output:
    1. Implement only the scope of issue #{{ISSUE_NUMBER}}.
    2. Summarize changed files.
    3. Summarize verification commands run and results.
    4. List skipped or deferred checks with reasons.
    5. Call out risks, assumptions, and follow-up issues.

---

## 9. Review-Fix Prompt Template

Use this structure for PR comments that ask an agent to fix review findings.

    Use this PR branch and fix only the remaining review blockers.

    Repository: {{REPOSITORY_FULL_NAME}}
    Pull request: #{{PR_NUMBER}}
    Base branch: {{BASE_BRANCH}}
    Head branch: {{HEAD_BRANCH}}
    Reviewed head SHA: {{HEAD_SHA}}

    Preserve already-correct behaviour and avoid unrelated refactors.

    Findings to fix:
    1. {{FINDING_1}}
    2. {{FINDING_2}}

    Scope:
    - Fix only the findings listed above.
    - Do not change unrelated files unless required by the fix.
    - Do not introduce unapproved source prose, art, layout, tables, or branding.
    - Keep tests focused on the changed behaviour.

    Relevant files:
    {{RELEVANT_FILES_OR_FOLDERS}}

    Required verification:
    {{VERIFICATION_REQUIREMENTS}}

    Expected output:
    1. Summary of fixes.
    2. Files changed.
    3. Verification commands and results.
    4. Any remaining risk or skipped checks.

Review-fix comments in the NoteQuest workflow are expected to be fenced when posted in GitHub. The standard here defines the contents; the repository PR workflow controls the exact comment formatting.

---

## 10. Documentation Prompt Template

Use this structure for documentation-only tasks.

    Repository: {{REPOSITORY_FULL_NAME}}
    Documentation task: {{TASK_TITLE}}
    Target path: {{TARGET_PATH}}

    Goal:
    {{DOCUMENT_GOAL}}

    Source documents:
    {{SOURCE_DOCUMENTS}}

    Must include:
    {{MUST_INCLUDE}}

    Must not include:
    {{MUST_NOT_INCLUDE}}

    Product-clean template requirements:
    - Use placeholders for product-specific values unless this is a product-specific case study.
    - Do not carry over names, licensing text, branches, stack choices, or milestone names from another product.
    - Include status, last updated date, owner, related documents, acceptance criteria, and approval section where appropriate.

    Verification:
    - Confirm the target path is correct.
    - Confirm the document contains no unresolved placeholders unless intentionally a template.
    - Confirm links are relative and point to expected project locations.
    - Confirm docs-only CI behavior if applicable.

    Expected output:
    1. Summary of document added or changed.
    2. Path.
    3. Verification performed.
    4. Any follow-up documents or decisions.

---

## 11. Verification Requirements

Prompts should name checks, not just say test it.

Common verification commands by work type:

| Work type | Example verification |
|---|---|
| TypeScript implementation | npm run typecheck; npm test; npm run build |
| Formatting/lint | npm run format:check; npm run lint |
| Full repo verification | npm run verify when configured and practical |
| Rules engine | Unit tests, fixture tests, deterministic seed tests |
| Simulation | Product-specific simulation command and output artifact |
| UI | Component tests, responsive manual check, accessibility check |
| Persistence | Migration tests, import/export tests, recovery tests |
| Documentation | Link check when available, markdown review, template audit |
| Workflow | Compare diff, trigger syntax review, docs-only path behavior |

If dependencies cannot be installed or commands cannot run, the agent must report the exact blocker.

---

## 12. Expected Output Standard

Every agent run should end with:

- what changed;
- files changed;
- verification commands run and outcomes;
- checks skipped and why;
- risks, assumptions, or follow-ups;
- whether the issue is ready for review or remains blocked.

For review-fix work, also state whether each finding was fixed.

For documentation-only work, also state whether build/test commands were intentionally skipped.

---

## 13. Review Checklist

Before accepting an agent prompt or issue template, verify:

- [ ] Repository and issue are explicit.
- [ ] Source of truth is explicit.
- [ ] Dependency checks exist.
- [ ] Stop conditions exist.
- [ ] Scope and out-of-scope sections are clear.
- [ ] Rights/content guardrails are present when needed.
- [ ] UX/accessibility guardrails are present when needed.
- [ ] Persistence/migration guardrails are present when needed.
- [ ] Acceptance criteria are testable.
- [ ] Verification commands are named.
- [ ] Expected output is reviewable.
- [ ] No product names from another project remain.
- [ ] No unapproved source prose is copied into the prompt.
- [ ] Prompt does not ask the agent to make human-gated decisions.

---

## 14. Anti-Patterns

Avoid prompts that:

- ask the agent to look around and decide what issue to implement;
- rely on a branch name as the issue source of truth;
- omit acceptance criteria;
- omit out-of-scope boundaries;
- ask for broad cleanup alongside feature work;
- ask for all tests without identifying configured scripts;
- tell the agent to copy source text from a rulebook;
- include rights-sensitive information that does not belong in a public issue;
- include another product's licensing policy by accident;
- say to fix all problems without listing findings;
- ask the agent to close issues or merge PRs from inside an implementation task unless that is the explicit workflow task.

---

## 15. Acceptance Criteria

This standard is ready to use when:

- [ ] Agent work classes are defined.
- [ ] Required prompt fields are documented.
- [ ] Dependency and stop conditions are documented.
- [ ] Source, rights, and product-leakage controls are documented.
- [ ] Implementation, review-fix, and documentation prompt structures are available.
- [ ] Verification requirements are tied to work types.
- [ ] Expected output standard is defined.
- [ ] Review checklist can catch incomplete prompts.
- [ ] Product-specific values are represented as placeholders or in product profiles.
- [ ] The standard aligns with the repository PR and issue workflow.

---

## 16. Approval

| Role | Name | Decision | Date | Notes |
|---|---|---|---|---|
| Product Owner |  | Pending / Approved / Rejected |  |  |
| Technical Lead |  | Pending / Approved / Rejected |  |  |
| QA Lead |  | Pending / Approved / Rejected |  |  |
