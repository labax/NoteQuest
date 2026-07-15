# Business Requirements Document

## {{PRODUCT_OR_RELEASE_NAME}}

*Version {{VERSION}} | {{STATUS}} | Prepared for the Ironsworn Project*

| Field | Value |
|---|---|
| Document owner | {{OWNER}} |
| Product / release | {{PRODUCT_OR_RELEASE}} |
| Related documents | {{RELATED_DOCUMENTS}} |
| Primary audience | Product owner, developer, UX designer, QA/tester, content/licensing reviewer, and other stakeholders |
| Status | {{STATUS}} |
| Last updated | {{DATE}} |

---

## Contents

1. Executive Summary
2. Business Context and Opportunity
3. Problem Statement
4. Business Objectives
5. Stakeholders and Target Users
6. Product Vision
7. Scope
8. Business Requirements
9. High-Level Capabilities
10. Success Measures
11. Assumptions
12. Dependencies
13. Constraints
14. Risks and Mitigations
15. Release Approach
16. Approval Criteria
17. Open Questions
18. Approval

---

## 1. Executive Summary

{{SUMMARIZE_THE_BUSINESS_NEED_PRODUCT_DIRECTION_TARGET_USERS_AND_EXPECTED_VALUE_IN_TWO_TO_FOUR_PARAGRAPHS}}

The product remains a companion to tabletop play. It should reduce friction without replacing player interpretation, reproducing the full rulebook, or introducing unapproved content.

## 2. Business Context and Opportunity

### 2.1 Current situation

{{DESCRIBE_THE_EXISTING_USER_WORKFLOW_MARKET_OR_PROJECT_STATE}}

### 2.2 Opportunity

{{DESCRIBE_THE_VALUE_CREATED_BY_SOLVING_THE_PROBLEM}}

### 2.3 Why now

{{EXPLAIN_TIMING_DEPENDENCIES_OR_RELEASE_RATIONALE}}

## 3. Problem Statement

> {{ONE_SENTENCE_USER_OR_BUSINESS_PROBLEM}}

### Evidence or observations

- {{EVIDENCE_1}}
- {{EVIDENCE_2}}
- {{EVIDENCE_3}}

### Consequences of not addressing it

- {{CONSEQUENCE_1}}
- {{CONSEQUENCE_2}}

## 4. Business Objectives

| ID | Objective | Business rationale | Priority |
|---|---|---|---|
| BO-001 | {{OBJECTIVE}} | {{RATIONALE}} | Must |
| BO-002 | {{OBJECTIVE}} | {{RATIONALE}} | Should |
| BO-003 | {{OBJECTIVE}} | {{RATIONALE}} | Could |

## 5. Stakeholders and Target Users

### 5.1 Stakeholders

| Stakeholder | Interest / responsibility | Decision authority |
|---|---|---|
| Product Owner | Scope, prioritization, acceptance, and release decisions | {{AUTHORITY}} |
| Developer | Implementation and technical feasibility | {{AUTHORITY}} |
| UX/UI Designer | User flows, usability, responsive behavior, and accessibility | {{AUTHORITY}} |
| QA / Tester | Verification, regression, and release evidence | {{AUTHORITY}} |
| Content / Licensing Reviewer | Content provenance, attribution, and release eligibility | {{AUTHORITY}} |
| {{OTHER_STAKEHOLDER}} | {{RESPONSIBILITY}} | {{AUTHORITY}} |

### 5.2 Target users

| User type | Priority | Primary need | Current workaround |
|---|---:|---|---|
| {{USER_TYPE}} | Primary | {{NEED}} | {{WORKAROUND}} |
| {{USER_TYPE}} | Secondary | {{NEED}} | {{WORKAROUND}} |
| {{USER_TYPE}} | Later | {{NEED}} | {{WORKAROUND}} |

## 6. Product Vision

> {{VISION_STATEMENT}}

### Product principles

| ID | Principle | Meaning |
|---|---|---|
| BP-001 | Fiction-first | Mechanics and prompts support interpretation rather than authoring mandatory narrative outcomes. |
| BP-002 | Companion, not replacement | The product does not attempt to replace the complete tabletop experience or rulebook. |
| BP-003 | Data safety | User-authored campaign records are treated as valuable data. |
| BP-004 | Licensing-conscious | Bundled content is inventoried, attributed, and approved before release. |
| BP-005 | {{PRINCIPLE}} | {{MEANING}} |

## 7. Scope

### 7.1 In scope

- {{IN_SCOPE_ITEM_1}}
- {{IN_SCOPE_ITEM_2}}
- {{IN_SCOPE_ITEM_3}}

### 7.2 Out of scope

- {{OUT_OF_SCOPE_ITEM_1}}
- {{OUT_OF_SCOPE_ITEM_2}}
- {{OUT_OF_SCOPE_ITEM_3}}

### 7.3 Future considerations

- {{FUTURE_ITEM_1}}
- {{FUTURE_ITEM_2}}

## 8. Business Requirements

| ID | Requirement | Priority | Acceptance signal | Source objective |
|---|---|---:|---|---|
| BR-001 | The product shall {{REQUIREMENT}}. | Must | {{OBSERVABLE_BUSINESS_OUTCOME}} | BO-001 |
| BR-002 | The product should {{REQUIREMENT}}. | Should | {{OBSERVABLE_BUSINESS_OUTCOME}} | BO-002 |
| BR-003 | The product could {{REQUIREMENT}}. | Could | {{OBSERVABLE_BUSINESS_OUTCOME}} | BO-003 |

## 9. High-Level Capabilities

| ID | Capability | Description | Business value | Release |
|---|---|---|---|---|
| CAP-001 | {{CAPABILITY}} | {{DESCRIPTION}} | {{VALUE}} | {{RELEASE}} |
| CAP-002 | {{CAPABILITY}} | {{DESCRIPTION}} | {{VALUE}} | {{RELEASE}} |

## 10. Success Measures

### 10.1 Release acceptance measures

| ID | Measure | Target | Evidence source |
|---|---|---|---|
| SM-001 | {{MEASURE}} | {{TARGET}} | {{TEST_ANALYTICS_OR_PLAYTEST}} |
| SM-002 | {{MEASURE}} | {{TARGET}} | {{TEST_ANALYTICS_OR_PLAYTEST}} |

### 10.2 Post-release indicators

- {{INDICATOR_1}}
- {{INDICATOR_2}}
- {{INDICATOR_3}}

## 11. Assumptions

| ID | Assumption | Validation method | Owner |
|---|---|---|---|
| ASM-001 | {{ASSUMPTION}} | {{HOW_TO_VALIDATE}} | {{OWNER}} |
| ASM-002 | {{ASSUMPTION}} | {{HOW_TO_VALIDATE}} | {{OWNER}} |

## 12. Dependencies

| ID | Dependency | Type | Required by | Status |
|---|---|---|---|---|
| DEP-001 | {{DEPENDENCY}} | Product / technical / legal / external | {{MILESTONE_OR_DATE}} | {{STATUS}} |
| DEP-002 | {{DEPENDENCY}} | {{TYPE}} | {{MILESTONE_OR_DATE}} | {{STATUS}} |

## 13. Constraints

- {{BUDGET_OR_TIME_CONSTRAINT}}
- {{TECHNICAL_CONSTRAINT}}
- {{LICENSING_OR_CONTENT_CONSTRAINT}}
- {{PLATFORM_OR_OPERATIONAL_CONSTRAINT}}

## 14. Risks and Mitigations

| ID | Risk | Probability | Impact | Mitigation | Owner |
|---|---|---:|---:|---|---|
| RISK-001 | {{RISK}} | Low / Medium / High | Low / Medium / High / Critical | {{MITIGATION}} | {{OWNER}} |
| RISK-002 | {{RISK}} | {{PROBABILITY}} | {{IMPACT}} | {{MITIGATION}} | {{OWNER}} |

Include product-specific risks such as rules-calculation errors, data loss, scope creep, poor solo usability, over-automation, and unapproved content where applicable.

## 15. Release Approach

1. {{DELIVERY_STEP_1}}
2. {{DELIVERY_STEP_2}}
3. {{DELIVERY_STEP_3}}
4. Complete QA, accessibility, content, and licensing gates.
5. {{PLAYTEST_OR_RELEASE_STEP}}

## 16. Approval Criteria

The document or release may be approved when:

- [ ] Business objectives are agreed.
- [ ] Must requirements are measurable and traceable.
- [ ] Included and excluded scope is explicit.
- [ ] Dependencies and material risks have owners.
- [ ] Success measures have evidence sources.
- [ ] Content and licensing implications have been reviewed.
- [ ] No unresolved decision makes the scope unsafe to implement.

## 17. Open Questions

| ID | Question | Owner | Due / decision point | Resolution |
|---|---|---|---|---|
| OQ-001 | {{QUESTION}} | {{OWNER}} | {{DATE_OR_MILESTONE}} | Open |
| OQ-002 | {{QUESTION}} | {{OWNER}} | {{DATE_OR_MILESTONE}} | Open |

## 18. Approval

| Role | Name | Decision | Date | Notes |
|---|---|---|---|---|
| Product Owner | {{NAME}} | Pending / Approved / Rejected | {{DATE}} | {{NOTES}} |
| Content / Licensing Reviewer | {{NAME}} | Pending / Approved / Rejected | {{DATE}} | {{NOTES}} |
| Technical Lead | {{NAME}} | Pending / Approved / Rejected | {{DATE}} | {{NOTES}} |
