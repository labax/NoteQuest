# Template Audit Checklist

## Generic Game Adaptation Process

*Version 0.1 | Checklist | Prepared for reuse across product-agnostic game adaptation templates*

| Field | Value |
|---|---|
| Checklist owner | Product Owner / Delivery Lead |
| Process scope | Auditing reusable templates, issue bodies, agent prompts, documentation scaffolds, and case-study examples for product leakage, missing placeholders, rights risk, and review readiness |
| Related documents | Product-Agnostic Game Adaptation Process v0.1; Product Profile Template v0.1; Source Material Intake and Rights Matrix v0.1; Rules Extraction Taxonomy v0.1; Backlog Generation Playbook v0.1; Agent Task Template Standard v0.1 |
| Primary audience | Product owner, delivery lead, technical lead, content/licensing reviewer, QA lead, template authors, and implementation agents |
| Status | Draft checklist |
| Last updated | 2026-07-23 |

---

## Contents

1. Purpose
2. When to Run This Audit
3. Audit Principles
4. Audit Inputs
5. Template Classification
6. Product-Leakage Checklist
7. Placeholder Checklist
8. Rights and Content Checklist
9. Agent Readiness Checklist
10. Documentation Quality Checklist
11. Repository and Workflow Checklist
12. Case-Study Checklist
13. Audit Register Template
14. Severity Guidance
15. Required Follow-Up Actions
16. Acceptance Criteria
17. Approval

---

## 1. Purpose

This checklist helps reviewers confirm that reusable templates and process documents are truly product-agnostic before they are used to create issues, prompts, milestones, or documentation for another game.

It exists because process materials often carry hidden assumptions from the product that created them. A single leftover product name, branch name, license rule, milestone model, or source-content warning can mislead future work.

The checklist is also useful for product-specific templates, where the goal is different: confirm that the template intentionally uses the current product profile and does not contain values from any other project.

---

## 2. When to Run This Audit

Run this audit:

- before approving a new generic template;
- before copying a template into a new product repo;
- before generating milestones, epics, issues, or prompts from a template;
- before marking an issue template agent-ready;
- before public release if templates generate user-facing copy or bundled content;
- after a product profile changes;
- after a rights policy changes;
- after importing templates from another project;
- when a reviewer finds product leakage; or
- during periodic documentation hygiene reviews.

---

## 3. Audit Principles

| ID | Principle | Meaning |
|---|---|---|
| TAC-001 | Generic means configurable | Reusable templates use placeholders, not hidden product defaults |
| TAC-002 | Case studies are allowed | Product-specific examples are fine when clearly labelled as examples or profiles |
| TAC-003 | Rights text is product-specific | Licensing assumptions should come from a product profile or rights matrix |
| TAC-004 | Branch models vary | Do not hard-code develop/main, trunk, release, or workflow names in generic templates |
| TAC-005 | Stack choices vary | Do not hard-code TypeScript, React, Godot, or any stack unless the product profile controls it |
| TAC-006 | Milestone models vary | Do not assume every product has the same phase count or M0/M1 naming |
| TAC-007 | Agent prompts need stop conditions | Reusable prompts must tell agents when not to proceed |
| TAC-008 | Unknown placeholders are visible | Unresolved placeholders should be obvious before issue creation |
| TAC-009 | Sensitive content stays out | Templates should not contain confidential rights evidence or personal data |
| TAC-010 | Audit findings create work | A failed audit should result in a fix, explicit exception, or follow-up issue |

---

## 4. Audit Inputs

| Input | Purpose |
|---|---|
| Template under review | The document, issue template, prompt template, checklist, or scaffold being audited |
| Product profile | Defines allowed product-specific values when the template is product-specific |
| Source material intake and rights matrix | Defines content categories, approval states, and release blockers |
| Agent task template standard | Defines required prompt fields and stop conditions |
| Backlog generation playbook | Defines issue, epic, label, and close-out expectations |
| PR and issue workflow | Defines repository-specific review and close-out rules |
| Case-study documents | Identify intentionally product-specific examples |
| Search results | Finds leftover names, branches, stack choices, and product terms |

---

## 5. Template Classification

Before auditing, classify the file.

| Classification | Meaning | Audit expectation |
|---|---|---|
| Generic template | Reusable across products | Must use placeholders for product-specific values |
| Product profile | Product-specific configuration | Must use current product values and no other product leakage |
| Case study | Example of one product | Must be clearly labelled and should not be copied as generic text |
| Repository workflow | Repo-specific process | May use repo values but should identify them as repo-specific |
| Agent prompt template | Reusable or product-specific prompt | Must include source of truth, checks, stop conditions, scope, verification |
| Issue template | Creates user-facing GitHub issues | Must avoid other product names and include rights/test sections when relevant |
| Release checklist | Product or repo release control | Must match branch, CI, hosting, rights, and rollback model |

---

## 6. Product-Leakage Checklist

Search for and review:

- [ ] Product names from other projects.
- [ ] Source titles from other projects.
- [ ] Character, faction, module, dungeon, move, class, table, or rules-domain names from another game.
- [ ] Branch names that are not placeholders or current repo values.
- [ ] Milestone names or epic numbers from another project.
- [ ] Repository names from another project.
- [ ] Issue or PR numbers from another project unless explicitly historical.
- [ ] Stack choices not controlled by the product profile.
- [ ] Hosting choices not controlled by the product profile.
- [ ] Licensing policy copied from another product.
- [ ] Attribution text copied from another product.
- [ ] Public-release assumptions copied from another product.
- [ ] User roles that do not fit the current product.
- [ ] Test commands that do not exist in the current repo.
- [ ] Labels that do not exist or are not mapped by the product profile.
- [ ] Any phrase like this project, this game, or the source without a clear referent.

Known NoteQuest audit example:

| File | Leakage risk |
|---|---|
| docs/product/templates/feature_story_template.md | Contains Ironsworn Digital Companion wording and Ironsworn-specific licensing checklist items inside the NoteQuest repository |

---

## 7. Placeholder Checklist

Generic templates should use placeholders for product-specific values.

Required placeholder categories:

| Category | Examples |
|---|---|
| Product identity | {{PRODUCT_NAME}}, {{PRODUCT_SHORT_NAME}}, {{SOURCE_TITLE}}, {{SOURCE_EDITION}} |
| Repository | {{REPOSITORY_FULL_NAME}}, {{INTEGRATION_BRANCH}}, {{RELEASE_BRANCH}} |
| Release model | {{PROTOTYPE_NAME}}, {{BASELINE_RELEASE_NAME}}, {{RELEASE_MODE}} |
| Milestones | {{PHASE_ID}}, {{EPIC_ID}}, {{MILESTONE_NAME}} |
| Agent workflow | {{AGENT_READY_LABEL}}, {{PROMPT_TEMPLATE_PATH}}, {{TEST_COMMANDS}} |
| Rights | {{RIGHTS_MATRIX_PATH}}, {{CONTENT_POLICY}}, {{ATTRIBUTION_REQUIREMENTS}} |
| Rules | {{RULES_SPEC_PATH}}, {{RULE_ID}}, {{TABLE_ID}}, {{FIXTURE_ID}} |
| UX | {{WIREFRAME_PATH}}, {{ACCESSIBILITY_TARGET}}, {{SUPPORTED_VIEWPORTS}} |
| Operations | {{HOSTING_MODEL}}, {{DEPLOYMENT_WORKFLOW}}, {{ROLLBACK_REQUIREMENT}} |

Placeholder checks:

- [ ] Every placeholder has a clear meaning.
- [ ] Placeholder names are consistent across documents.
- [ ] Required placeholders are listed in the template instructions.
- [ ] No placeholder has been half-replaced.
- [ ] No placeholder hides a hard-coded default in surrounding prose.
- [ ] Completed product-specific documents contain no unresolved placeholders unless intentionally marked TBD.
- [ ] TBD values have owners or follow-up questions.

---

## 8. Rights and Content Checklist

For templates that mention source material, content, assets, or user-facing text:

- [ ] Mechanics are separated from expressive prose.
- [ ] Tables are treated as rights-reviewed structured content.
- [ ] Source names and terms require product-profile or rights-matrix approval.
- [ ] Exact source prose is blocked by default unless explicitly approved.
- [ ] Source art, logo, layout, screenshots, page design, and trade dress are blocked unless asset-level rights exist.
- [ ] Third-party assets require license, attribution, and provenance.
- [ ] Generated assets require provenance and usage approval.
- [ ] Backer lists, credits, personal names, and correspondence are treated as sensitive unless a public-use purpose is approved.
- [ ] User-authored content is kept separate from bundled source content.
- [ ] Public-release blockers are explicit.
- [ ] Confidential permission evidence is referenced by controlled location, not copied into public templates.

---

## 9. Agent Readiness Checklist

For agent prompts and issue templates:

- [ ] Repository is explicit.
- [ ] Issue number and title are explicit where issue-based.
- [ ] Source of truth is explicit.
- [ ] pwd, git status, remote, branch, and file-inspection checks are included where relevant.
- [ ] Dependency checks are included.
- [ ] Stop conditions are included.
- [ ] Must-have, should-have, could-have, and out-of-scope sections exist.
- [ ] Implementation guidance names relevant files or modules.
- [ ] Rights/content guardrails exist when source content is involved.
- [ ] UX/accessibility guardrails exist when user-facing behaviour is involved.
- [ ] Persistence/migration guardrails exist when durable state is involved.
- [ ] Acceptance criteria are testable.
- [ ] Verification commands are named.
- [ ] Expected output asks for changed files, checks run, skipped checks, risks, and follow-ups.
- [ ] Prompt does not ask the agent to make human-gated decisions.
- [ ] Review-fix prompts list exact findings and preserve already-fixed behaviour.

---

## 10. Documentation Quality Checklist

For documentation templates and docs generated from them:

- [ ] Title clearly states whether the document is generic, template, process, profile, or case study.
- [ ] Version, status, owner, audience, and last-updated fields exist.
- [ ] Related documents are listed.
- [ ] Purpose and scope are explicit.
- [ ] In-scope and out-of-scope boundaries are clear.
- [ ] Roles and responsibilities are defined when useful.
- [ ] Required registers or fields are listed.
- [ ] Acceptance criteria exist.
- [ ] Approval section exists when the document can become controlling.
- [ ] Tables use consistent wording and columns.
- [ ] Links are relative and point to expected repository paths.
- [ ] The document avoids unnecessary duplication of source material.
- [ ] The document avoids confidential or personal data.

---

## 11. Repository and Workflow Checklist

For repo-specific workflow templates:

- [ ] Repository name is correct.
- [ ] Default branch is correct.
- [ ] Integration branch is correct.
- [ ] Release branch is correct.
- [ ] Feature branch naming is correct.
- [ ] PR target branch is correct.
- [ ] CI workflow names and commands are current.
- [ ] Documentation-only CI behaviour is current.
- [ ] Required checks are not accidentally skipped for mixed code/docs PRs.
- [ ] Issue labels match current repository labels or product-profile mappings.
- [ ] Epic and issue close-out rules match current project practice.
- [ ] Release-forward flow is documented separately from feature work.

---

## 12. Case-Study Checklist

Case studies may contain product-specific values, but they must be labelled clearly.

- [ ] The title identifies the document as a case study or product profile.
- [ ] Product-specific values are intentional.
- [ ] The case study warns generic-template authors not to copy the values blindly.
- [ ] Source material facts are accurate and minimal.
- [ ] Rights-sensitive details are summarized without exposing confidential evidence.
- [ ] Out-of-scope supplements or variants are listed.
- [ ] Branch, stack, CI, and workflow values match the current repo.
- [ ] Product-leakage watchlist explains what must be replaced for reuse.
- [ ] Open questions are captured for anything not yet controlling.

---

## 13. Audit Register Template

Use one row per finding.

| Field | Required | Notes |
|---|---|---|
| Audit ID | Yes | TAC-YYYYMMDD-001 or repo-specific equivalent |
| File | Yes | Path under review |
| Classification | Yes | Generic template, product profile, case study, issue template, workflow |
| Finding | Yes | Concrete issue |
| Severity | Yes | High, Medium, Low |
| Category | Yes | Product leakage, rights risk, missing placeholder, agent readiness, workflow mismatch |
| Evidence | Yes | Short quote or description; avoid copying sensitive material |
| Required action | Yes | Replace, remove, add placeholder, update profile, create follow-up |
| Owner | Yes | Person or role |
| Status | Yes | Open, fixed, accepted exception, deferred |
| Follow-up issue | If applicable | Issue number or TODO until created |

---

## 14. Severity Guidance

| Severity | Use when |
|---|---|
| High | Template would direct work for the wrong product, permit unapproved content, skip required checks, or ask an agent to make a human-gated decision |
| Medium | Template is usable but missing placeholders, stop conditions, ownership, verification, or clear scope |
| Low | Wording, link, formatting, or minor consistency issue that does not materially misdirect work |

High findings block template reuse until fixed or explicitly accepted by the product owner and relevant reviewer.

---

## 15. Required Follow-Up Actions

| Finding type | Required action |
|---|---|
| Other product name | Replace with placeholder in generic template or correct current product value in product-specific doc |
| Other product rights text | Remove and derive from current product rights matrix |
| Hard-coded branch in generic template | Replace with branch placeholders |
| Missing agent stop condition | Add explicit stop condition |
| Missing verification commands | Add configured commands or documented check category |
| Unapproved source prose | Remove, paraphrase, or mark blocked pending rights review |
| Personal data in template | Remove or move to controlled evidence location |
| Broken link | Fix link or create follow-up issue |
| Missing product profile field | Update product profile or mark TBD with owner |
| Unsupported CI assumption | Update workflow section or product profile |

---

## 16. Acceptance Criteria

This checklist is ready to use when:

- [ ] Template classifications are defined.
- [ ] Product-leakage checks cover names, branches, milestones, stack, labels, and rights language.
- [ ] Placeholder checks define required placeholder categories.
- [ ] Rights and content checks align with the rights matrix.
- [ ] Agent-readiness checks align with the agent task template standard.
- [ ] Documentation quality checks align with the generic process document style.
- [ ] Repository workflow checks cover branch, CI, labels, PRs, and close-out.
- [ ] Case-study checks allow intentional product-specific examples.
- [ ] Audit register fields are defined.
- [ ] Severity guidance and follow-up actions are clear.

---

## 17. Approval

| Role | Name | Decision | Date | Notes |
|---|---|---|---|---|
| Product Owner |  | Pending / Approved / Rejected |  |  |
| Delivery Lead |  | Pending / Approved / Rejected |  |  |
| Technical Lead |  | Pending / Approved / Rejected |  |  |
| Content / Licensing Reviewer |  | Pending / Approved / Rejected |  |  |
