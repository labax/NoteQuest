# Game Adaptation Glossary Template

## Generic Game Adaptation Process

*Version 0.1 | Template | Prepared for reuse across rules-first game adaptation projects*

| Field | Value |
|---|---|
| Document owner | Product Owner or Content Lead |
| Review partners | UX Lead, Technical Lead, Content/Licensing Reviewer, QA Lead |
| Process scope | Mapping source, product, UI, data, issue, and generic process terminology |
| Related documents | `product-profile-template-v0.1.md`, `source-material-intake-and-rights-matrix-v0.1.md`, `generic-agent-task-template-standard-v0.1.md`, `template-audit-checklist-v0.1.md` |

## Purpose

This template prevents terminology drift and product leakage when adapting a game into software. It defines how source terms, product terms, UI labels, data names, issue labels, and generic process terms relate to one another.

Use this glossary before generating issues, writing agent prompts, naming data models, drafting UI copy, or reusing process templates across products.

## Core Rule

Generic process documents must use generic terms. Product-specific terms belong in the Product Profile, case study, or glossary.

A term should not move from a source rulebook into UI, code, tests, docs, prompts, or issue templates until its status is known.

## Term Statuses

| Status | Meaning |
|---|---|
| Proposed | Suggested term, not yet approved |
| Approved | Canonical term for the defined context |
| Source-only | May refer to source material internally but should not appear in product UI without approval |
| Internal-only | May appear in code, tests, or implementation docs but not user-facing UI |
| Deprecated | Should be replaced in new work |
| Blocked | Must not be used in the defined context |

## Term Contexts

| Context | Description | Review needed |
|---|---|---|
| Source term | Term used by source material | Content and rights review |
| Product term | Canonical project vocabulary | Product review |
| UI label | Player-facing text | Product, UX, rights review |
| Data term | Code, schema, fixture, or API naming | Technical review |
| Issue term | Backlog, label, milestone, or agent prompt language | Process review |
| Generic process term | Reusable framework vocabulary | Template audit review |

## Glossary Register

| ID | Generic concept | Source term | Product term | UI label | Data/API term | Status | Rights matrix ID | Notes |
|---|---|---|---|---|---|---|---|---|
| `TERM-001` | `{{GENERIC_CONCEPT}}` | `{{SOURCE_TERM_OR_NONE}}` | `{{PRODUCT_TERM}}` | `{{UI_LABEL_OR_NONE}}` | `{{DATA_TERM_OR_NONE}}` | `Proposed` | `{{MATRIX_ID_OR_NONE}}` | `{{NOTES}}` |

## Term Entry Template

```markdown
## TERM-{{NNN}} - {{PRODUCT_TERM}}

| Field | Value |
|---|---|
| Generic concept | {{GENERIC_CONCEPT}} |
| Source term | {{SOURCE_TERM_OR_NONE}} |
| Product term | {{PRODUCT_TERM}} |
| UI label | {{UI_LABEL_OR_NONE}} |
| Data/API term | {{DATA_TERM_OR_NONE}} |
| Status | Proposed |
| Rights matrix ID | {{MATRIX_ID_OR_NONE}} |
| Decision ID | {{DECISION_ID_OR_NONE}} |
| Owner | {{ROLE_OR_NAME}} |
| Last reviewed | {{YYYY-MM-DD}} |

### Definition

{{Short definition in product-neutral language where possible.}}

### Usage Rules

- User-facing UI: {{ALLOWED|BLOCKED|CONDITIONAL}}
- Code/data: {{ALLOWED|BLOCKED|CONDITIONAL}}
- Test fixtures: {{ALLOWED|BLOCKED|CONDITIONAL}}
- Agent prompts/issues: {{ALLOWED|BLOCKED|CONDITIONAL}}
- Generic templates: {{ALLOWED|BLOCKED|CONDITIONAL}}

### Notes

- {{NOTES_OR_NONE}}
```

## Generic Vocabulary Baseline

Use these terms in reusable process documents unless a more specific generic term is needed.

| Generic term | Meaning | Avoid replacing with |
|---|---|---|
| Product | The specific game adaptation project | A product name |
| Source material | The original rulebook, supplement, SRD, content pack, or reference | A source title |
| Rules domain | A coherent rules area such as combat, travel, inventory, character creation, or random events | A product-specific subsystem name |
| Content item | A source-derived or original unit of data, text, table value, image, audio, or asset | A source table name unless approved |
| Vertical slice | A narrow playable or testable proof of capability | A project-specific prototype name |
| Baseline release | The smallest release with the agreed core loop | A project-specific MVP name |
| Release phase | A configurable delivery stage | A hard-coded milestone model |
| Agent task | A task that can be handled by an implementation agent | A specific agent brand unless required |
| Human-gated task | Work requiring product, legal, UX, or owner judgment | A specific person unless assigned |
| Rights matrix | The project register tracking allowed use of source-derived material | A product-specific legal doc title |

## Source Term Review

Before adopting a source term, check:

- Is the term a common gameplay concept or distinctive expression?
- Does the rights matrix allow this use?
- Will the term appear in public UI?
- Does the term have a clearer product-neutral alternative?
- Does changing the term create player confusion?
- Does the data model need a stable internal name different from the UI label?

## Naming Rules

- Use source terms only when they are approved for the target context.
- Prefer generic process terms in reusable templates.
- Prefer product terms in product docs and user-facing flows.
- Prefer stable technical terms in code and data schemas.
- Do not use one project's product terms as examples in generic templates unless explicitly marked as examples.
- Do not encode source-page numbers or copyrighted text into identifiers unless the rights matrix allows it.

## Glossary Review Gates

| Gate | Required glossary action |
|---|---|
| Product Profile creation | Define product name, release names, source names, and core domain terms |
| Rules extraction | Map source rule domains to product and data terms |
| Backlog generation | Confirm issue labels and story vocabulary |
| Agent prompt creation | Confirm no prompt contains stale product terms |
| UI implementation | Confirm labels are approved for player-facing use |
| Public release | Confirm blocked or source-only terms are not shipped in UI or documentation |
| Template reuse | Audit for product leakage before copying docs into another project |

## Deprecated and Blocked Terms

Maintain a table for terms that should not be reused.

| Term | Status | Replacement | Reason | Applies to |
|---|---|---|---|---|
| `{{TERM}}` | `Deprecated` | `{{REPLACEMENT}}` | `{{REASON}}` | `{{CONTEXT}}` |

## Template Leakage Check

When reviewing reusable docs, search for:

- Product names
- Source material titles
- Prototype or milestone names
- Specific branch names not represented as placeholders
- Stack names not represented as Product Profile fields
- Licensing text copied from one product
- Issue labels that exist only in one repository
- UI labels that belong to one adaptation

Use `template-audit-checklist-v0.1.md` for the full audit.

## Acceptance Criteria

This template is ready to use when:

- It maps source, product, UI, data, issue, and generic terms separately.
- It gives each term a status and allowed-use context.
- It helps prevent product-specific vocabulary from leaking into reusable templates.
- It links rights-sensitive terms to the Source Material Intake and Rights Matrix.
- It can be reused without assuming a specific game, source, stack, branch model, or license.
