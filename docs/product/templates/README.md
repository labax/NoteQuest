# Product document templates

This folder contains reusable Markdown templates for planning Ironsworn Digital Companion releases and features.

The templates are intentionally implementation-neutral. Replace every `{{PLACEHOLDER}}`, remove guidance that does not apply, and preserve stable requirement IDs once a document has entered review.

## Core templates

| Template | Use |
|---|---|
| [Business Requirements](business-requirements-template.md) | Business need, objectives, stakeholders, scope, success measures, constraints, and approval. |
| [Product Requirements](product-requirements-template.md) | Product outcomes, user problems, capabilities, release behavior, metrics, and prioritization. |
| [MVP Scope](mvp-scope-template.md) | Bounded minimum release, included/excluded scope, feature priorities, and release gates. |
| [Functional Requirements](functional-requirements-template.md) | Observable system behavior and testable user-facing requirements. |
| [Rules Engine Requirements](rules-engine-requirements-template.md) | Deterministic game calculations, validation, overrides, and rules-related history. |
| [Data / Domain Model](data-domain-model-template.md) | Entities, relationships, value objects, invariants, lifecycle, and persistence expectations. |
| [UX Flow / Wireframe Requirements](ux-flow-wireframe-requirements-template.md) | Information architecture, user flows, screen requirements, states, responsiveness, and accessibility. |
| [Content & Licensing Requirements](content-licensing-requirements-template.md) | Content provenance, permitted use, attribution, branding, inventory, and release gates. |
| [Non-Functional Requirements](non-functional-requirements-template.md) | Performance, reliability, security, privacy, accessibility, compatibility, maintainability, and operations. |
| [Acceptance Criteria / Test Plan](acceptance-criteria-test-plan-template.md) | Quality objectives, test strategy, release gates, scenarios, traceability, and sign-off. |
| [Release Addendum](release-addendum-template.md) | A version-specific supplement when a new release extends rather than replaces baseline documents. |

## Recommended document order

1. Business Requirements or Product Requirements.
2. MVP Scope or release addendum.
3. Functional Requirements.
4. Rules Engine Requirements where mechanics are affected.
5. Data / Domain Model.
6. UX Flow / Wireframe Requirements.
7. Content & Licensing Requirements.
8. Non-Functional Requirements.
9. Acceptance Criteria / Test Plan.

## Project conventions

- Use `Must`, `Should`, `Could`, and `Won't` priorities consistently.
- Give requirements stable IDs, such as `BR-001`, `FR-CHAR-001`, or `NFR-PERF-001`.
- Link requirements to acceptance criteria and tests instead of duplicating conflicting wording.
- Keep mechanics, user-authored fiction, and bundled content as separate concerns.
- Do not add unapproved Ironsworn prose, move text, oracle text, asset text, artwork, icons, copied layouts, screenshots, or trade dress.
- Record source, license, attribution, and provenance for bundled content.
- Treat public and commercial release as separate licensing gates.
- Mark unresolved decisions explicitly; do not hide them inside implementation notes.

## File naming

Recommended patterns:

```text
{{document-name}}-v{{major}}.{{minor}}.md
{{release-name}}-{{document-type}}-addendum-v{{major}}.{{minor}}.md
```

Examples:

```text
business-requirements-v0.1.md
solo-campaign-depth-functional-requirements-addendum-v0.2.md
```
