# Generic Risk Register Template

## Generic Game Adaptation Process

*Version 0.1 | Template | Prepared for reuse across rules-first game adaptation projects*

| Field | Value |
|---|---|
| Document owner | Product Owner or Delivery Lead |
| Review partners | Technical Lead, QA Lead, Content/Licensing Reviewer, UX Lead |
| Process scope | Legal, content, product, technical, UX, data, delivery, and operational risks |
| Related documents | `source-material-intake-and-rights-matrix-v0.1.md`, `decision-register-template-v0.1.md`, `release-readiness-checklist-v0.1.md`, `test-evidence-standard-v0.1.md` |

## Purpose

This template tracks risks that could affect a game adaptation project. It is meant to keep uncertain or dangerous work visible until it is mitigated, accepted, transferred, or closed.

Use the risk register during planning, issue creation, PR review, milestone review, and release readiness.

## Risk Principles

- Risks must be concrete enough to review.
- Risks must have owners.
- Risks must name both impact and mitigation.
- Legal, source-content, data-loss, and public-release risks must not be hidden inside implementation notes.
- Accepted risk is still risk; record who accepted it and for which release level.

## Risk ID Format

Recommended format:

```text
RISK-{{YYYY}}-{{NNN}}
```

Examples:

- `RISK-2026-001`
- `RISK-2026-002`

## Risk States

| State | Meaning |
|---|---|
| Open | Risk is active and needs mitigation or monitoring |
| Mitigating | Mitigation work is underway |
| Accepted | Owner has explicitly accepted the risk for a defined scope |
| Transferred | Risk is owned by another team, dependency, or external decision |
| Closed | Risk no longer applies or is mitigated |
| Superseded | Replaced by a newer risk entry |

## Risk Categories

| Category | Examples |
|---|---|
| Source rights | Unclear permission, blocked prose, art reuse, attribution uncertainty |
| Content integrity | Incorrect table transcription, ambiguous source mechanics, source deviation |
| Rules correctness | Invalid state transition, randomness bug, broken edge case |
| Data | Save corruption, migration failure, export incompatibility |
| UX | Confusing primary flow, inaccessible control, misleading terminology |
| Technical | Fragile architecture, dependency risk, performance bottleneck |
| Security and privacy | Sensitive stored data, unsafe import, account or deployment exposure |
| Delivery | Underestimated scope, missing owner, blocked dependency |
| Release | Unclear rollback, failing CI, incomplete documentation |
| Process | Template leakage, poor traceability, weak evidence standards |

## Scoring Model

Use a simple 1 to 5 score for likelihood and impact.

| Score | Likelihood | Impact |
|---:|---|---|
| 1 | Rare | Negligible |
| 2 | Unlikely | Minor |
| 3 | Possible | Moderate |
| 4 | Likely | Major |
| 5 | Almost certain | Severe |

Exposure score:

```text
exposure = likelihood * impact
```

| Exposure | Severity | Default handling |
|---:|---|---|
| 1-4 | Low | Track in register |
| 5-9 | Medium | Mitigation or owner acceptance required |
| 10-15 | High | Mitigation plan required before MVP or public release |
| 16-25 | Critical | Blocks public release unless explicitly accepted by release owner |

Projects may add detectability or confidence scores if the Product Profile requires them.

## Register Table

| ID | Title | Category | State | Likelihood | Impact | Exposure | Owner | Target release | Mitigation | Links |
|---|---|---|---|---:|---:|---:|---|---|---|---|
| `RISK-YYYY-NNN` | `{{SHORT_TITLE}}` | `{{CATEGORY}}` | `Open` | `3` | `4` | `12` | `{{ROLE_OR_NAME}}` | `{{RELEASE}}` | `{{MITIGATION_SUMMARY}}` | `{{LINKS}}` |

## Risk Entry Template

```markdown
# RISK-{{YYYY}}-{{NNN}} - {{RISK_TITLE}}

| Field | Value |
|---|---|
| State | Open |
| Category | {{CATEGORY}} |
| Owner | {{ROLE_OR_NAME}} |
| Date opened | {{YYYY-MM-DD}} |
| Target release | {{RELEASE_OR_NONE}} |
| Likelihood | {{1-5}} |
| Impact | {{1-5}} |
| Exposure | {{LIKELIHOOD_X_IMPACT}} |
| Related decisions | {{DECISION_IDS_OR_NONE}} |
| Related rights items | {{MATRIX_IDS_OR_NONE}} |
| Related issues/PRs | {{LINKS_OR_NONE}} |

## Risk Statement

If {{CONDITION}}, then {{IMPACT}}, affecting {{PRODUCT_AREA_OR_RELEASE}}.

## Context

{{Explain why this risk exists.}}

## Mitigation Plan

- {{MITIGATION_ACTION}}

## Contingency Plan

- {{WHAT_TO_DO_IF_RISK_MATERIALIZES}}

## Acceptance Criteria for Closure

- {{EVIDENCE_OR_DECISION_REQUIRED_TO_CLOSE}}

## Review Notes

- {{DATE}} - {{NOTE}}
```

## Mandatory Risk Triggers

Create or update a risk when:

- Source rights are unknown for public-facing content.
- A release includes source-derived prose, art, layout, branding, or table values without final review.
- A rules deviation may surprise users or invalidate source expectations.
- Save data, migration, or import/export behavior changes.
- A dependency, hosting provider, build tool, or API becomes release-critical.
- CI is skipped, unstable, or failing for a release candidate.
- A human-gated task is attempted through agent-only implementation.
- A template or generic doc contains product-specific leaked language.
- A public release depends on future permission or unresolved policy.

## Mitigation Types

| Mitigation type | Description | Example |
|---|---|---|
| Avoid | Change scope to remove the risk | Exclude unapproved source prose from MVP |
| Reduce | Lower likelihood or impact | Add fixture tests around ambiguous rules |
| Transfer | Move ownership to another party or dependency | Require legal review before public distribution |
| Accept | Explicitly proceed with known risk | Internal-only prototype with documented limitation |
| Monitor | Watch for change | Recheck source permission before public release |

## Release Gate Rules

- Public release cannot proceed with critical open risks unless the release owner explicitly accepts them.
- Public release cannot proceed with unknown source-rights risk for included public-facing content.
- MVP cannot proceed with high rules-correctness or data-loss risks unless mitigation is planned and visible.
- Prototype may proceed with higher risk only when distribution is constrained and the risk is labeled internal-only.

## Review Cadence

| Event | Action |
|---|---|
| New milestone begins | Review open risks and assign owners |
| New release candidate | Re-score release-related risks |
| PR changes source-derived content | Check rights and content integrity risks |
| PR changes persistence or data model | Check data risks |
| PR changes generic templates | Check process leakage risk |
| Risk accepted | Record owner, scope, and expiry or revisit date |

## Closure Checklist

- [ ] Risk condition no longer applies, or mitigation is complete.
- [ ] Evidence is linked.
- [ ] Related decision records are updated.
- [ ] Related source-rights matrix rows are updated, if applicable.
- [ ] Release readiness checklist no longer treats this as blocking.
- [ ] Closure date and owner are recorded.

## Acceptance Criteria

This template is ready to use when:

- Risks can be tracked consistently across products.
- Source, legal, rules, data, UX, technical, delivery, release, and process risks are covered.
- Severity is easy to compare.
- Release blockers are explicit.
- The template links risks to decisions, rights records, test evidence, and release readiness.
