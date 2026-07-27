# Generic Decision Register Template

## Generic Game Adaptation Process

*Version 0.1 | Template | Prepared for reuse across rules-first game adaptation projects*

| Field | Value |
|---|---|
| Document owner | Product Owner or Technical Lead |
| Review partners | Product Owner, Technical Lead, UX Lead, Content/Licensing Reviewer |
| Process scope | Product, technical, content, licensing, UX, and process decisions |
| Related documents | `product-profile-template-v0.1.md`, `risk-register-template-v0.1.md`, `release-readiness-checklist-v0.1.md` |

## Purpose

This template records durable decisions that shape a game adaptation project. It prevents important choices from living only in chat history, issue comments, or implicit implementation patterns.

Use it for decisions that future contributors must understand before changing product scope, source treatment, rules behavior, architecture, data, UX, release policy, or workflow.

## When to Record a Decision

Create a decision record when a choice:

- Changes product scope, release boundaries, or milestone structure
- Establishes the project stack, hosting, storage, or architecture
- Accepts a deviation from source material behavior
- Defines how source-derived content may be used
- Chooses terminology that appears in UI, docs, data, or issues
- Introduces or retires a major workflow
- Accepts a meaningful risk or constraint
- Reverses or supersedes a previous decision

Do not create a decision record for routine implementation details that are fully explained by the code or issue.

## Decision States

| State | Meaning |
|---|---|
| Proposed | Suggested but not approved |
| Accepted | Approved and active |
| Superseded | Replaced by a newer decision |
| Deprecated | Still relevant historically but should not guide new work |
| Rejected | Considered and intentionally not chosen |

Only `Accepted` decisions should guide implementation by default.

## Decision ID Format

Recommended format:

```text
DEC-{{YYYY}}-{{NNN}}
```

Examples:

- `DEC-2026-001`
- `DEC-2026-002`

Projects may use shorter IDs if the Product Profile defines them.

## Register Table

Maintain a table like this in the project decision register.

| ID | Title | Category | State | Date | Owner | Supersedes | Links |
|---|---|---|---|---|---|---|---|
| `DEC-YYYY-NNN` | `{{SHORT_TITLE}}` | `{{CATEGORY}}` | `Proposed` | `YYYY-MM-DD` | `{{ROLE_OR_NAME}}` | `{{ID_OR_NONE}}` | `{{ISSUE_OR_PR}}` |

## Decision Categories

| Category | Use for |
|---|---|
| Product scope | MVP, prototype, public release, feature boundaries |
| Source treatment | Mechanics, prose, tables, branding, attribution, permissions |
| Rules behavior | Source deviations, deterministic behavior, randomization policy |
| UX | Navigation, interaction model, terminology, accessibility posture |
| Data | Domain model, schema, persistence, migration, import/export |
| Architecture | Stack, module boundaries, dependency strategy, hosting |
| Quality | Test strategy, fixture policy, evidence requirements |
| Release | Branch model, readiness gates, deployment, rollback |
| Process | Issue workflow, agent workflow, review process, documentation governance |
| Risk | Accepted risks, mitigations, contingency rules |

## Decision Record Template

Copy this section for each decision.

```markdown
# DEC-{{YYYY}}-{{NNN}} - {{DECISION_TITLE}}

| Field | Value |
|---|---|
| Status | Proposed |
| Date | {{YYYY-MM-DD}} |
| Owner | {{ROLE_OR_NAME}} |
| Category | {{CATEGORY}} |
| Product | {{PRODUCT_NAME}} |
| Related issues | {{ISSUE_LINKS_OR_NONE}} |
| Related PRs | {{PR_LINKS_OR_NONE}} |
| Supersedes | {{DECISION_ID_OR_NONE}} |
| Superseded by | {{DECISION_ID_OR_NONE}} |

## Context

{{Describe the problem, constraint, or fork in the road. Include source, product, technical, legal, or UX context needed to understand the choice.}}

## Decision

{{State the decision clearly. Use direct language.}}

## Rationale

{{Explain why this option was chosen. Include relevant alternatives and tradeoffs.}}

## Alternatives Considered

| Option | Reason not chosen |
|---|---|
| {{OPTION}} | {{RATIONALE}} |

## Consequences

### Positive

- {{BENEFIT}}

### Negative

- {{COST_OR_LIMITATION}}

### Follow-up

- {{FOLLOW_UP_ACTION_OR_NONE}}

## Validation

- {{HOW_THIS_DECISION_WILL_BE_CHECKED}}

## Review Notes

- {{WHEN_TO_REVISIT_OR_NONE}}
```

## Decision Quality Checklist

- [ ] The decision is stated in one clear sentence.
- [ ] Context explains why the decision was needed.
- [ ] Alternatives are named, even briefly.
- [ ] Consequences include at least one cost or limitation.
- [ ] Links point to issues, PRs, source records, or risks where relevant.
- [ ] The decision has an owner and date.
- [ ] The status is one of the allowed states.
- [ ] Superseded decisions are linked both ways.

## Relationship to Risk Register

Create or update a risk when a decision:

- Accepts legal, licensing, security, data loss, delivery, or UX uncertainty
- Defers a known release gate
- Chooses a temporary workaround
- Depends on a future permission, dependency, tool, or service
- Changes public release posture

Use the decision record to explain the choice. Use the risk register to track exposure, mitigation, and review cadence.

## Relationship to Product Profile

Update the Product Profile when a decision changes:

- Product name or release naming
- Source material identity
- Rights policy
- Branch model
- Implementation stack
- Milestone or phase model
- Public release rules
- Human-gated versus agent-implementable work

Decision records should not become a substitute for updating the profile.

## Relationship to Glossary

Update the Game Adaptation Glossary when a decision introduces, renames, or forbids a term used in:

- User-facing UI
- Documentation
- Issue templates
- Data schemas
- Test fixtures
- Agent prompts

## Review Cadence

| Trigger | Required action |
|---|---|
| New milestone or release phase | Review accepted decisions for relevance |
| Public release planning | Confirm rights, release, and support decisions |
| Major architecture change | Review architecture and data decisions |
| Source material update | Review source treatment and rules behavior decisions |
| Template reuse for another product | Confirm no product-specific decisions are embedded in generic docs |

## Acceptance Criteria

This template is ready to use when:

- It records decisions in a stable, reviewable format.
- It distinguishes active decisions from proposed, rejected, and superseded ones.
- It links decisions to risks, product profile updates, glossary updates, and release gates.
- It can be used across projects without assuming a specific game, stack, license, or repository workflow.
