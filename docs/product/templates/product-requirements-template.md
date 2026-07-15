# Product Requirements Document

## {{PRODUCT_OR_RELEASE_NAME}}

*Version {{VERSION}} | {{STATUS}} | Prepared for the Ironsworn Project*

| Field | Value |
|---|---|
| Product owner | {{OWNER}} |
| Target release | {{RELEASE}} |
| Related documents | {{RELATED_DOCUMENTS}} |
| Primary audience | Product, UX, engineering, QA, content/licensing, and playtest stakeholders |
| Status | {{STATUS}} |
| Last updated | {{DATE}} |

---

## Contents

1. Product Summary
2. User Problem
3. Product Outcomes
4. Users and Use Cases
5. Product Principles
6. Scope and Priorities
7. User Journeys
8. Product Requirements
9. Feature Requirements
10. UX and Accessibility Expectations
11. Data, Rules, and Content Impact
12. Analytics and Success Metrics
13. Dependencies and Risks
14. Release and Rollout
15. Acceptance and Sign-Off
16. Open Questions

---

## 1. Product Summary

{{DESCRIBE_THE_PRODUCT_OR_RELEASE_AND_THE_VALUE_IT_PROVIDES}}

### Product statement

> For {{TARGET_USER}}, who {{USER_NEED}}, {{PRODUCT_OR_RELEASE}} is a {{PRODUCT_CATEGORY}} that {{PRIMARY_BENEFIT}}. Unlike {{CURRENT_ALTERNATIVE}}, it {{DIFFERENTIATOR}}.

## 2. User Problem

### Primary problem

{{DESCRIBE_THE_USER_PROBLEM_IN_PLAIN_LANGUAGE}}

### User evidence

- {{PLAYTEST_FEEDBACK_OR_OBSERVATION}}
- {{SUPPORT_OR_DEFECT_SIGNAL}}
- {{WORKFLOW_OR_USAGE_SIGNAL}}

### Current alternatives

| Alternative | Benefit | Limitation |
|---|---|---|
| {{ALTERNATIVE}} | {{BENEFIT}} | {{LIMITATION}} |
| {{ALTERNATIVE}} | {{BENEFIT}} | {{LIMITATION}} |

## 3. Product Outcomes

| ID | Outcome | User value | Product value | Priority |
|---|---|---|---|---|
| PO-001 | {{OUTCOME}} | {{USER_VALUE}} | {{PRODUCT_VALUE}} | Must |
| PO-002 | {{OUTCOME}} | {{USER_VALUE}} | {{PRODUCT_VALUE}} | Should |
| PO-003 | {{OUTCOME}} | {{USER_VALUE}} | {{PRODUCT_VALUE}} | Could |

### Non-goals

- {{NON_GOAL_1}}
- {{NON_GOAL_2}}
- {{NON_GOAL_3}}

## 4. Users and Use Cases

### 4.1 Personas

| Persona | Priority | Context | Primary need | Success condition |
|---|---:|---|---|---|
| {{PERSONA}} | Primary | {{CONTEXT}} | {{NEED}} | {{SUCCESS}} |
| {{PERSONA}} | Secondary | {{CONTEXT}} | {{NEED}} | {{SUCCESS}} |

### 4.2 Core use cases

| ID | Use case | Actor | Trigger | Expected outcome |
|---|---|---|---|---|
| UC-001 | {{USE_CASE}} | {{ACTOR}} | {{TRIGGER}} | {{OUTCOME}} |
| UC-002 | {{USE_CASE}} | {{ACTOR}} | {{TRIGGER}} | {{OUTCOME}} |

## 5. Product Principles

| ID | Principle | Product implication |
|---|---|---|
| PP-001 | Session-first | Common play actions remain close to the active session context. |
| PP-002 | Fiction-first | The product calculates mechanics and records interpretation without forcing narrative outcomes. |
| PP-003 | Transparent automation | Dice, modifiers, derived values, migrations, and state changes are visible or inspectable. |
| PP-004 | Manual control | Users can correct mistakes and support house rules where safe. |
| PP-005 | Data safety | Destructive operations are deliberate and recovery is considered. |
| PP-006 | Licensing-conscious | Bundled content is approved, attributed, and distinguishable from user-authored content. |
| PP-007 | {{PRINCIPLE}} | {{IMPLICATION}} |

## 6. Scope and Priorities

### Must have

- {{MUST_HAVE_1}}
- {{MUST_HAVE_2}}
- {{MUST_HAVE_3}}

### Should have

- {{SHOULD_HAVE_1}}
- {{SHOULD_HAVE_2}}

### Could have

- {{COULD_HAVE_1}}
- {{COULD_HAVE_2}}

### Won't have in this release

- {{WONT_HAVE_1}}
- {{WONT_HAVE_2}}
- {{WONT_HAVE_3}}

## 7. User Journeys

### Journey A: {{JOURNEY_NAME}}

```mermaid
flowchart TD
    A[{{START_STATE}}] --> B[{{ACTION}}]
    B --> C[{{ACTION}}]
    C --> D[{{SUCCESS_STATE}}]
```

| Step | User intent | Product behavior | Failure / recovery state |
|---|---|---|---|
| 1 | {{INTENT}} | {{BEHAVIOR}} | {{RECOVERY}} |
| 2 | {{INTENT}} | {{BEHAVIOR}} | {{RECOVERY}} |

### Journey B: {{JOURNEY_NAME}}

{{DESCRIBE_OR_ADD_A_SECOND_FLOW}}

## 8. Product Requirements

| ID | Requirement | Priority | Acceptance signal | Linked outcome |
|---|---|---:|---|---|
| PR-001 | The product shall {{REQUIREMENT}}. | Must | {{OBSERVABLE_SIGNAL}} | PO-001 |
| PR-002 | The product should {{REQUIREMENT}}. | Should | {{OBSERVABLE_SIGNAL}} | PO-002 |
| PR-003 | The product could {{REQUIREMENT}}. | Could | {{OBSERVABLE_SIGNAL}} | PO-003 |

## 9. Feature Requirements

Repeat this section for each feature area.

### 9.1 {{FEATURE_NAME}}

**Goal:** {{FEATURE_GOAL}}

**Primary user:** {{USER}}

#### Included behavior

| ID | Requirement | Priority | Notes |
|---|---|---:|---|
| {{PREFIX}}-001 | The product shall {{BEHAVIOR}}. | Must | {{NOTES}} |
| {{PREFIX}}-002 | The product should {{BEHAVIOR}}. | Should | {{NOTES}} |

#### Empty, loading, error, and confirmation states

- Empty: {{EMPTY_STATE}}
- Loading: {{LOADING_STATE}}
- Error: {{ERROR_STATE}}
- Confirmation: {{CONFIRMATION_STATE}}
- Recovery: {{RECOVERY_STATE}}

#### Exclusions

- {{FEATURE_EXCLUSION_1}}
- {{FEATURE_EXCLUSION_2}}

## 10. UX and Accessibility Expectations

| Area | Requirement |
|---|---|
| Navigation | {{EXPECTATION}} |
| Responsive behavior | Core flow works at supported desktop, tablet, and mobile widths. |
| Keyboard | Interactive controls are keyboard operable in a logical order. |
| Labels | Inputs and status indicators have programmatically associated labels. |
| Focus | Modals, drawers, errors, and destructive confirmations manage focus correctly. |
| Readability | Results are not communicated by color alone. |
| Guidance | New-player guidance uses progressive disclosure and can be skipped. |

## 11. Data, Rules, and Content Impact

### Data impact

- Entities affected: {{ENTITIES}}
- Persistence / migration changes: {{CHANGES}}
- Export / import changes: {{CHANGES}}
- Data-loss or recovery risks: {{RISKS}}

### Rules impact

- Calculations affected: {{CALCULATIONS_OR_NONE}}
- Manual override requirements: {{OVERRIDES}}
- Deterministic test needs: {{TESTS}}

### Content and licensing impact

- Bundled content affected: {{CONTENT_OR_NONE}}
- Source / license: {{SOURCE_AND_LICENSE}}
- Attribution changes: {{ATTRIBUTION}}
- Provenance requirements: {{PROVENANCE}}
- User-authored content remains separate: Yes / No / Not applicable

## 12. Analytics and Success Metrics

Do not add analytics by default. Record only metrics that are necessary and privacy-appropriate.

| ID | Metric | Definition | Target | Collection method | Privacy note |
|---|---|---|---|---|---|
| PM-001 | {{METRIC}} | {{DEFINITION}} | {{TARGET}} | Playtest / local telemetry / manual observation | {{NOTE}} |
| PM-002 | {{METRIC}} | {{DEFINITION}} | {{TARGET}} | {{METHOD}} | {{NOTE}} |

## 13. Dependencies and Risks

### Dependencies

| ID | Dependency | Owner | Required by | Status |
|---|---|---|---|---|
| DEP-001 | {{DEPENDENCY}} | {{OWNER}} | {{MILESTONE}} | {{STATUS}} |

### Risks

| ID | Risk | Impact | Mitigation | Owner |
|---|---|---|---|---|
| RISK-001 | {{RISK}} | {{IMPACT}} | {{MITIGATION}} | {{OWNER}} |

## 14. Release and Rollout

### Delivery stages

1. {{INTERNAL_STAGE}}
2. {{QA_STAGE}}
3. {{CLOSED_PLAYTEST_STAGE}}
4. {{PUBLIC_OR_RELEASE_CANDIDATE_STAGE}}

### Rollback / recovery

{{DESCRIBE_HOW_TO_DISABLE_REVERT_OR_RECOVER_IF_THE_RELEASE_FAILS}}

### Known limitations

- {{LIMITATION_1}}
- {{LIMITATION_2}}

## 15. Acceptance and Sign-Off

- [ ] Must requirements have acceptance criteria.
- [ ] User journeys cover happy paths and recovery paths.
- [ ] Data and migration impact has been reviewed.
- [ ] Rules behavior has deterministic tests where applicable.
- [ ] Responsive and accessibility expectations are testable.
- [ ] Bundled content has provenance, attribution, and approval.
- [ ] No blocked or unapproved content is included.
- [ ] Product owner approves the release scope.

## 16. Open Questions

| ID | Question | Owner | Decision point | Status / resolution |
|---|---|---|---|---|
| OQ-001 | {{QUESTION}} | {{OWNER}} | {{DATE_OR_MILESTONE}} | Open |
| OQ-002 | {{QUESTION}} | {{OWNER}} | {{DATE_OR_MILESTONE}} | Open |
