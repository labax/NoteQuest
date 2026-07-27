# Generic Game Adaptation Process Documents

*Version 0.1 | Process index | Prepared for reuse across rules-first game adaptation projects*

This directory contains reusable process documents for adapting tabletop, solo, and rules-first games into software products. The documents are intentionally product-agnostic. Product-specific vocabulary, release names, source titles, branch models, stack decisions, and licensing posture should live in a Product Profile or case study, not in the generic templates.

## Document Map

| Order | Document | Use when |
|---:|---|---|
| 0 | `process-adoption-checklist-v0.1.md` | You are starting a new adaptation or checking whether an existing project is ready to use the generic process pack |
| 1 | `product-agnostic-game-adaptation-process-v0.1.md` | You need the overall reusable lifecycle for source intake, planning, backlog generation, implementation, review, and release |
| 2 | `product-profile-template-v0.1.md` | You are starting or configuring a specific adaptation project |
| 3 | `source-material-intake-and-rights-matrix-v0.1.md` | You need to classify source material and define allowed use before implementation |
| 4 | `rules-extraction-taxonomy-v0.1.md` | You need to convert source rules into structured software domains |
| 5 | `backlog-generation-playbook-v0.1.md` | You need to translate approved docs into phases, epics, issues, labels, and prompts |
| 6 | `generic-agent-task-template-standard-v0.1.md` | You need agent-ready implementation or review prompts without project leakage |
| 7 | `template-audit-checklist-v0.1.md` | You need to verify that reusable templates are not carrying product-specific assumptions |
| 8 | `release-readiness-checklist-v0.1.md` | You need to decide whether a prototype, MVP, public release, or patch is ready |
| 9 | `test-evidence-standard-v0.1.md` | You need consistent evidence for issue closure, PR review, or release readiness |
| 10 | `decision-register-template-v0.1.md` | You need to record durable product, technical, rights, UX, release, or process decisions |
| 11 | `risk-register-template-v0.1.md` | You need to track legal, source, rules, data, UX, technical, delivery, release, or process risks |
| 12 | `game-adaptation-glossary-template-v0.1.md` | You need to map source terms, product terms, UI labels, data names, and generic process vocabulary |

Case studies live outside this directory, under `docs/process/case-studies/`. A case study may use product-specific language because it documents one concrete implementation of the generic process.

## Recommended Paths

### Adopting the Process

1. Start with `process-adoption-checklist-v0.1.md`.
2. Choose an adoption mode: new project, existing migration, second-product reuse, prototype rescue, or public-release hardening.
3. Confirm owners for product, rights, technical, QA, UX, and release concerns.
4. Record the adoption decision before generating product-specific issues or prompts.
5. Use the scorecard to decide whether the project is discovery ready, backlog ready, implementation ready, or blocked.

### Starting a New Adaptation

1. Run `process-adoption-checklist-v0.1.md` to confirm adoption mode, owners, and blockers.
2. Create a Product Profile from `product-profile-template-v0.1.md`.
3. Inventory source material with `source-material-intake-and-rights-matrix-v0.1.md`.
4. Create an initial glossary with `game-adaptation-glossary-template-v0.1.md`.
5. Extract rules domains with `rules-extraction-taxonomy-v0.1.md`.
6. Record major choices with `decision-register-template-v0.1.md`.
7. Open initial risks with `risk-register-template-v0.1.md`.

### Creating the Backlog

1. Confirm the Product Profile and source rights status.
2. Use `backlog-generation-playbook-v0.1.md` to define phases, epics, stories, labels, and dependencies.
3. Use `generic-agent-task-template-standard-v0.1.md` for agent-ready issue prompts.
4. Use `template-audit-checklist-v0.1.md` before copying templates across projects.

### Reviewing Pull Requests

1. Check that the PR maps to an approved issue or documented decision.
2. Use `test-evidence-standard-v0.1.md` to evaluate evidence.
3. Check source-derived content against the rights matrix.
4. Update risks and decisions when the PR changes release posture.

### Preparing a Release

1. Use `release-readiness-checklist-v0.1.md` as the release gate.
2. Pull test evidence from PRs and CI.
3. Confirm source rights and public-facing content status.
4. Confirm open risks are mitigated, accepted, or blocking.
5. Record release decision and follow-up work.

## Product-Specific Material Belongs Elsewhere

Do not hard-code these into generic process documents:

- Product names
- Source material titles
- Prototype names
- MVP names
- Milestone names
- Branch names
- Hosting targets
- Stack choices
- Legal conclusions for one product
- UI labels from one game
- Issue labels that exist only in one repository

Use placeholders such as `{{PRODUCT_NAME}}`, `{{SOURCE_TITLE}}`, `{{RELEASE_PHASE}}`, `{{BRANCH_MODEL}}`, and `{{RULES_DOMAIN}}` in generic templates.

## Maintenance Rules

- Keep generic docs reusable across products.
- Move product-specific examples into case studies.
- Update the Product Profile when a project-specific decision changes.
- Update the Decision Register when a durable choice changes the process or product.
- Update the Risk Register when a new uncertainty can affect release readiness.
- Run the Template Audit Checklist before reusing docs in another project.

## Versioning

Use semantic document versions only when the process meaning changes.

| Version change | Use for |
|---|---|
| Patch | Clarifications, typo fixes, minor examples |
| Minor | New sections, new required fields, stronger gates |
| Major | Workflow-breaking changes or incompatible template structure |

For now, these documents use `v0.1` because the process is still being proven through concrete adaptation projects.

## Acceptance Criteria

This index is useful when:

- A new contributor can identify which document to use first.
- A project owner can configure a new adaptation without editing generic templates.
- Reviewers can move from issue evidence to release readiness without hunting through chat history.
- Product-specific knowledge remains in profiles and case studies, not in reusable process docs.