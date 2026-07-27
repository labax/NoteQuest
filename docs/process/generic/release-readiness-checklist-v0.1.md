# Generic Release Readiness Checklist

## Generic Game Adaptation Process

*Version 0.1 | Checklist | Prepared for reuse across rules-first game adaptation projects*

| Field | Value |
|---|---|
| Document owner | Product Owner |
| Review partners | Technical Lead, QA, Content/Licensing Reviewer, UX Reviewer |
| Process scope | Prototype, MVP, public release, and patch release readiness |
| Related documents | `product-profile-template-v0.1.md`, `source-material-intake-and-rights-matrix-v0.1.md`, `test-evidence-standard-v0.1.md`, `risk-register-template-v0.1.md` |

## Purpose

This checklist defines the minimum evidence required before a rules-first game adaptation can move from implementation into a named release state. It is product-agnostic: each project supplies names, phase labels, branch rules, deployment targets, and rights policies through its Product Profile.

Use this document to decide whether a release candidate is ready, blocked, or approved with explicit follow-up work.

## Release Levels

| Release level | Description | Typical audience | Default bar |
|---|---|---|---|
| Prototype | A vertical slice or proof of capability for a narrow rules area | Project team and invited reviewers | Demonstrates the core interaction safely and truthfully |
| MVP | The baseline usable product scope defined by the project profile | Internal users, early testers, or limited distribution | Complete enough to evaluate the intended product loop |
| Public release | A release that can be used outside the immediate project team | Public users or a broader community | Legal, UX, quality, support, and deployment gates are satisfied |
| Patch release | A focused correction or maintenance release | Existing users | Regression risk is controlled and release notes are accurate |

Projects may rename these levels, but the readiness evidence should remain equivalent.

## Required Inputs

A release readiness review requires:

- Current Product Profile
- Source Material Intake and Rights Matrix
- Current scope document or release issue
- Open risk register
- Current decision register
- Test evidence summary
- PR list or changelog for the release candidate
- Known defects and deferred-work list
- Deployment or packaging instructions, where applicable

If one of these inputs is intentionally absent, record the reason in the readiness decision.

## Gate Summary

| Gate | Prototype | MVP | Public release | Evidence required |
|---|---:|---:|---:|---|
| Release identity is defined | Required | Required | Required | Version, branch, tag or candidate identifier |
| Scope is traceable to approved docs | Required | Required | Required | Linked issues, milestone, or release checklist |
| Source material rights are reviewed | Required | Required | Required | Rights matrix rows for included content |
| No blocked source expression is shipped | Required | Required | Required | Content review sign-off |
| Core rules behavior is verified | Required | Required | Required | Automated tests or documented manual evidence |
| Persistence and migration are safe | If applicable | Required | Required | Save/load, migration, and compatibility checks |
| UI supports the primary flow | Required | Required | Required | Screenshots, manual checks, or browser validation |
| Accessibility baseline is checked | Recommended | Required | Required | Keyboard, labels, contrast, resize checks |
| CI is green or exceptions are justified | Required | Required | Required | CI run links or documented skip rationale |
| Deployment or package path is repeatable | Recommended | Required | Required | Build/deploy steps and artifact location |
| Risks are accepted or mitigated | Required | Required | Required | Risk register status |
| Release notes are accurate | Recommended | Required | Required | Changelog or release summary |
| Support and rollback path exist | Optional | Recommended | Required | Owner, rollback, and known issue notes |

## Release Identity Checklist

- [ ] Product name and release name are confirmed.
- [ ] Release level is declared: prototype, MVP, public release, or patch.
- [ ] Source branch, target branch, and release candidate identifier are recorded.
- [ ] Included milestones, issues, and PRs are listed.
- [ ] Out-of-scope items are listed separately from known defects.
- [ ] Any product-specific naming is consistent with the Product Profile and Glossary.

## Scope and Traceability Checklist

- [ ] Every included feature traces to an approved requirement, decision, issue, or release note.
- [ ] Every requirement expected for the release level is either complete, deferred, or explicitly removed.
- [ ] Deferred items have owners and follow-up issue references.
- [ ] Human-gated work is marked and not silently converted into agent-only work.
- [ ] The release does not depend on unapproved assumptions from another project.

## Source and Rights Checklist

- [ ] Every included source-derived item has a row in the Source Material Intake and Rights Matrix.
- [ ] Included mechanics, table structures, terms, prose, art, layout, and branding are classified separately.
- [ ] No item with `blocked`, `unknown`, or `pending review` status is included in a distributable build unless the release level explicitly allows internal-only use.
- [ ] Public-facing text is original, licensed, or approved for use.
- [ ] Source citations and provenance notes are stored outside runtime UI unless the Product Profile requires visible attribution.
- [ ] Any third-party assets, fonts, icons, images, or generated assets have recorded rights and allowed-use notes.

## Rules and Content Behavior Checklist

- [ ] Core rules procedures included in the release are modeled as deterministic, inspectable behavior.
- [ ] Random tables and dice procedures have repeatable fixture tests or documented manual cases.
- [ ] State transitions are tested for valid, invalid, boundary, and recovery cases.
- [ ] Save/load behavior preserves rules state accurately.
- [ ] Player-facing labels do not leak internal or source-only terminology unless approved.
- [ ] Known deviations from the source material are documented as product decisions.

## Test and Evidence Checklist

- [ ] Automated tests cover the riskiest included behavior.
- [ ] Manual checks cover workflows that are not practical to automate yet.
- [ ] Evidence follows `test-evidence-standard-v0.1.md`.
- [ ] Skipped tests or unavailable tools are explained with impact.
- [ ] CI results are linked or summarized.
- [ ] Regression checks cover areas affected by shared data, rules helpers, or persistence changes.

## UX and Accessibility Checklist

- [ ] Primary user flow can be completed without hidden setup.
- [ ] Empty, loading, error, disabled, and recovery states are covered where relevant.
- [ ] Keyboard navigation is acceptable for required controls.
- [ ] Text has readable contrast and does not clip at supported viewport sizes.
- [ ] Mobile or narrow layout behavior is checked if the Product Profile includes responsive support.
- [ ] Screenshots or browser notes demonstrate the release state for user-facing changes.

## Technical Readiness Checklist

- [ ] Build commands are documented and run successfully, or exceptions are recorded.
- [ ] Test commands are documented and run successfully, or exceptions are recorded.
- [ ] Dependency changes are intentional and reviewed.
- [ ] Configuration changes are documented, including required environment variables.
- [ ] Runtime storage, persistence, and migration behavior are checked.
- [ ] Performance risks are reviewed for generation, simulation, import, export, and rendering workflows.
- [ ] Error logging or local diagnostics are sufficient for the release level.

## Deployment and Operations Checklist

- [ ] Deployment target is named in the Product Profile or release issue.
- [ ] Deployment steps are repeatable from a clean checkout or documented environment.
- [ ] Rollback path is documented for public releases.
- [ ] Release artifact, deployment URL, or package output is recorded.
- [ ] Post-release smoke checks are listed.
- [ ] Monitoring, analytics, or feedback channels are identified where relevant.

## Documentation Checklist

- [ ] User-facing documentation is updated for new workflows or changed behavior.
- [ ] Product docs are updated for changed scope, decisions, or risks.
- [ ] Developer docs are updated for changed commands, architecture, or data models.
- [ ] Release notes explain user-visible changes and known limitations.
- [ ] Template or process docs are updated if the release changed the workflow itself.

## Readiness Decision Record

Use this table in a release issue, PR description, or release notes document.

| Field | Value |
|---|---|
| Product | `{{PRODUCT_NAME}}` |
| Release candidate | `{{RELEASE_CANDIDATE_ID}}` |
| Release level | `{{PROTOTYPE|MVP|PUBLIC|PATCH}}` |
| Source branch | `{{SOURCE_BRANCH}}` |
| Target branch | `{{TARGET_BRANCH}}` |
| Included issues | `{{ISSUE_LIST}}` |
| Included PRs | `{{PR_LIST}}` |
| Required checks | `{{CHECK_LIST}}` |
| Failed or skipped checks | `{{FAILURE_OR_SKIP_LIST}}` |
| Open blocking risks | `{{RISK_IDS_OR_NONE}}` |
| Open rights blockers | `{{RIGHTS_ITEM_IDS_OR_NONE}}` |
| Known limitations | `{{LIMITATION_LIST}}` |
| Decision | `Approved`, `Approved with follow-up`, or `Blocked` |
| Decision owner | `{{NAME_OR_ROLE}}` |
| Decision date | `{{YYYY-MM-DD}}` |

## Blocking Rules

A release is blocked when any of the following is true:

- A public build includes source material with unknown, blocked, or unreviewed rights status.
- A required core user flow cannot be completed.
- Data loss is possible in supported save/load or migration paths and no warning or rollback exists.
- Required CI or manual checks fail without an accepted exception.
- A high-severity risk is open without an accepted mitigation or explicit release-owner sign-off.
- The release candidate contains unrelated changes that have not been reviewed.

## Exception Rules

Exceptions are allowed only when they are explicit. Record:

- What is being waived
- Why the release can proceed
- Who accepted the risk
- What follow-up work will close the gap
- Which release level the exception applies to

Internal prototype exceptions must not be treated as public-release approval.

## Reviewer Checklist

- [ ] I can identify what is being released.
- [ ] I can trace release content to approved scope.
- [ ] I can see evidence for the important behavior.
- [ ] I can see rights status for source-derived content.
- [ ] I can see what remains risky or incomplete.
- [ ] I can tell whether this is approved, blocked, or approved with follow-up.

## Acceptance Criteria

This checklist is ready to use when:

- It can be copied into a release issue without product-specific rewriting.
- It supports prototype, MVP, public release, and patch release decisions.
- It references the source-rights, test-evidence, decision, and risk documents.
- It makes release blockers explicit.
- It does not assume a specific product name, repository, stack, branch model, license, or milestone structure.
