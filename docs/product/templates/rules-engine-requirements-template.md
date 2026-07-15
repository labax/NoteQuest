# Rules Engine Requirements

## {{PRODUCT_OR_RELEASE_NAME}}

*Version {{VERSION}} | {{STATUS}} | Prepared for the Ironsworn Project*

| Field | Value |
|---|---|
| Document owner | {{OWNER}} |
| Related documents | {{RELATED_DOCUMENTS}} |
| Rules scope | {{RULES_SCOPE}} |
| Primary audience | Product owner, developer, QA/tester, UX designer, and content/licensing reviewer |
| Status | {{STATUS}} |
| Last updated | {{DATE}} |

---

## Contents

1. Purpose
2. Source Basis
3. Rules Context
4. Scope
5. Rules Engine Principles
6. Priority Definitions
7. Module Summary
8. Detailed Requirements
9. Calculation Reference
10. State Transitions
11. Validation and Manual Overrides
12. Roll / Rules History
13. Deterministic Test Matrix
14. Traceability
15. Acceptance Criteria
16. Open Questions
17. Approval

---

## 1. Purpose

{{DEFINE_THE_DETERMINISTIC_MECHANICS_AND_RULE_ADJACENT_BEHAVIOR_COVERED_BY_THIS_DOCUMENT}}

The rules engine calculates mechanical results and validates state. It does not replace player interpretation or automatically author narrative consequences unless explicitly approved.

## 2. Source Basis

- {{RULES_OR_SRD_SOURCE}}
- {{BUSINESS_OR_PRODUCT_REQUIREMENTS}}
- {{FUNCTIONAL_REQUIREMENTS}}
- {{DATA_MODEL}}
- {{CONTENT_AND_LICENSING_REQUIREMENTS}}

Record the exact source and version for every implemented rule. Do not rely on undocumented memory or copied rulebook text in code comments.

## 3. Rules Context

{{DESCRIBE_HOW_THE_RULES_ENGINE_SUPPORTS_THE_PRODUCT_AND_WHICH_DECISIONS_REMAIN_WITH_THE_USER}}

## 4. Scope

### 4.1 In scope

| Area | Rules behavior |
|---|---|
| Dice | {{DICE_BEHAVIOR}} |
| Action rolls | {{ACTION_ROLL_BEHAVIOR}} |
| Momentum | {{MOMENTUM_BEHAVIOR}} |
| Progress | {{PROGRESS_BEHAVIOR}} |
| Oracles | {{ORACLE_BEHAVIOR}} |
| Character state | {{STATE_BEHAVIOR}} |
| History | {{HISTORY_BEHAVIOR}} |

### 4.2 Out of scope

- {{OUT_OF_SCOPE_RULE_AUTOMATION_1}}
- {{OUT_OF_SCOPE_RULE_AUTOMATION_2}}
- AI interpretation or mandatory narrative outcomes.
- Full asset automation unless explicitly approved.
- Unapproved official rules prose in the product or source comments.

## 5. Rules Engine Principles

| ID | Principle | Meaning |
|---|---|---|
| REP-001 | Deterministic calculations | Identical inputs produce identical outputs. |
| REP-002 | Transparent results | Inputs, modifiers, caps, cancellations, and classifications are inspectable. |
| REP-003 | User-confirmed consequences | Major state changes are not silently applied. |
| REP-004 | Fiction-first | The engine provides mechanical outcomes, not compulsory story prose. |
| REP-005 | Manual override | Users can correct state for mistakes, variants, and physical dice where safe. |
| REP-006 | Immutable completed rolls | Saved roll results are not silently recalculated later. |
| REP-007 | Testability | Pure rules logic can be tested without UI dependencies. |
| REP-008 | Licensing-conscious | Rule source and content provenance are recorded separately from mechanics. |
| REP-009 | {{PRINCIPLE}} | {{MEANING}} |

## 6. Priority Definitions

| Priority | Meaning |
|---|---|
| Must | Required for release unless formally descoped. |
| Should | Important but deferrable with documented impact. |
| Could | Optional enhancement. |
| Won't | Explicitly excluded. |

## 7. Module Summary

| Module | Requirement IDs | Priority | Owner |
|---|---|---:|---|
| Dice service | RER-DICE-001 to RER-DICE-{{LAST}} | Must / Should | {{OWNER}} |
| Action roll resolution | RER-ACT-001 to RER-ACT-{{LAST}} | Must | {{OWNER}} |
| Momentum | RER-MOM-001 to RER-MOM-{{LAST}} | Must / Should | {{OWNER}} |
| Progress tracks | RER-TRK-001 to RER-TRK-{{LAST}} | Must / Should | {{OWNER}} |
| Progress rolls | RER-PROG-001 to RER-PROG-{{LAST}} | Must | {{OWNER}} |
| Oracles | RER-ORC-001 to RER-ORC-{{LAST}} | Must / Should | {{OWNER}} |
| Character state | RER-CHAR-001 to RER-CHAR-{{LAST}} | Must / Should | {{OWNER}} |
| History and validation | RER-HIST-001 / RER-VAL-001 onward | Must / Should | {{OWNER}} |

## 8. Detailed Requirements

Repeat the following structure for each module.

### 8.1 {{MODULE_NAME}}

**Goal:** {{MODULE_GOAL}}

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---:|---|
| {{PREFIX}}-001 | The engine shall {{DETERMINISTIC_BEHAVIOR}}. | Must | {{EXPECTED_RESULT}} |
| {{PREFIX}}-002 | The engine should {{BEHAVIOR}}. | Should | {{EXPECTED_RESULT}} |
| {{PREFIX}}-003 | The engine could {{BEHAVIOR}}. | Could | {{EXPECTED_RESULT}} |

### Suggested module details

#### Dice service

Define:

- Supported die types and ranges.
- Percentile representation, including how 00 is handled.
- Generated versus manual rolls.
- Deterministic dice injection for tests.
- Reroll behavior and result stability.

#### Action roll resolution

Define:

- Inputs and action-score formula.
- Caps and cancellation order.
- Strict comparison behavior and tie handling.
- Strong hit, weak hit, and miss classification.
- Match detection.
- Pre-burn and post-burn result preservation.

#### Momentum

Define:

- Minimum, maximum, reset, and current values.
- Derived values and override behavior.
- Negative momentum cancellation.
- Burn eligibility, preview, confirmation, and reset.
- Behavior at boundaries.

#### Progress tracks and progress rolls

Define:

- Box and tick representation.
- Rank-based progress helper values.
- Filled-box-only progress score.
- Progress-roll comparison and tie behavior.
- Momentum exclusion.
- Track completion, archive, and correction behavior.

#### Oracles

Define:

- d100 generation.
- Yes/no odds thresholds.
- Inclusive table range lookup.
- Gaps, overlaps, invalid entries, and missing content.
- Match or twist behavior where applicable.
- Provenance for bundled table data.

#### Character and state rules

Define:

- Track boundaries.
- Derived values.
- Debility or condition effects.
- Manual overrides.
- Shared versus character-owned state.

## 9. Calculation Reference

### 9.1 Formula catalogue

| ID | Calculation | Formula / rule | Order of operations |
|---|---|---|---|
| CALC-001 | {{NAME}} | `{{FORMULA}}` | {{ORDER}} |
| CALC-002 | {{NAME}} | `{{FORMULA}}` | {{ORDER}} |

### 9.2 Classification table

| Condition | Result |
|---|---|
| {{CONDITION}} | {{RESULT}} |
| {{CONDITION}} | {{RESULT}} |

### 9.3 Boundary table

| Value / state | Minimum | Maximum | Default | Override allowed |
|---|---:|---:|---:|---|
| {{FIELD}} | {{MIN}} | {{MAX}} | {{DEFAULT}} | Yes / No |
| {{FIELD}} | {{MIN}} | {{MAX}} | {{DEFAULT}} | Yes / No |

## 10. State Transitions

### 10.1 {{STATEFUL_OBJECT}}

```mermaid
stateDiagram-v2
    [*] --> {{INITIAL_STATE}}
    {{INITIAL_STATE}} --> {{NEXT_STATE}}: {{TRIGGER}}
    {{NEXT_STATE}} --> {{FINAL_STATE}}: {{TRIGGER}}
    {{NEXT_STATE}} --> {{INITIAL_STATE}}: {{RECOVERY_OR_OVERRIDE}}
```

| From | Trigger | Guard | To | Side effects |
|---|---|---|---|---|
| {{FROM}} | {{TRIGGER}} | {{GUARD}} | {{TO}} | {{SIDE_EFFECTS}} |

## 11. Validation and Manual Overrides

| ID | Scenario | Standard validation | Override behavior | Audit / note |
|---|---|---|---|---|
| RER-VAL-001 | {{SCENARIO}} | {{VALIDATION}} | {{OVERRIDE}} | {{RECORD}} |
| RER-VAL-002 | {{SCENARIO}} | {{VALIDATION}} | {{OVERRIDE}} | {{RECORD}} |

Rules:

- Invalid generated values must never be produced.
- Invalid manual values receive a clear error and do not mutate state.
- Overrides must be explicit and must not silently change the standard rule definition.
- House-rule support must be separated from baseline calculations.
- Consequences requiring interpretation remain user-confirmed.

## 12. Roll / Rules History

| Field | Required | Notes |
|---|---:|---|
| ID | Yes | Stable identifier. |
| Roll type | Yes | Action, progress, oracle, or custom. |
| Inputs | Yes | Dice, stat, adds, progress score, odds, or table. |
| Initial result | Yes where applicable | Result before optional mutation such as momentum burn. |
| Final result | Yes | Result accepted by the user. |
| Match state | Yes where applicable | Preserve exact matched value. |
| Rule version | Should | Supports future migrations and interpretation. |
| Source | Should | Generated or manual dice. |
| Timestamp / session | Should | Links the record to play history. |
| User note | Could | Interpretation remains user-authored. |

## 13. Deterministic Test Matrix

| Test ID | Inputs | Expected intermediate values | Expected result | Requirement IDs |
|---|---|---|---|---|
| RT-001 | {{FIXED_INPUTS}} | {{INTERMEDIATE}} | {{RESULT}} | {{RER_IDS}} |
| RT-002 | {{FIXED_INPUTS}} | {{INTERMEDIATE}} | {{RESULT}} | {{RER_IDS}} |
| RT-003 | Boundary: {{CASE}} | {{INTERMEDIATE}} | {{RESULT}} | {{RER_IDS}} |
| RT-004 | Invalid input: {{CASE}} | No state mutation | Validation error | {{RER_IDS}} |

Minimum categories:

- Minimum and maximum die results.
- Every result classification.
- Ties.
- Matches.
- Score caps.
- Negative momentum cancellation.
- Momentum burn eligibility and reset.
- Partially filled progress boxes.
- Oracle table first and last ranges.
- Invalid manual input.
- Manual override behavior.

## 14. Traceability

| Rules requirement | Functional requirement | Data model | UX flow | Test |
|---|---|---|---|---|
| RER-{{ID}} | {{FR_ID}} | {{ENTITY_OR_FIELD}} | {{UX_ID}} | RT-{{ID}} |
| RER-{{ID}} | {{FR_ID}} | {{ENTITY_OR_FIELD}} | {{UX_ID}} | RT-{{ID}} |

## 15. Acceptance Criteria

- [ ] Must calculations are deterministic and unit-testable without UI dependencies.
- [ ] Calculation order and boundaries are explicit.
- [ ] Initial and final results are preserved where user choices can change an outcome.
- [ ] Major state consequences require explicit user action unless documented otherwise.
- [ ] Manual input and override behavior are validated.
- [ ] Rules history stores sufficient information to explain a saved result.
- [ ] Official text is not required to execute the mechanics.
- [ ] Rule sources and bundled content provenance are documented.

## 16. Open Questions

| ID | Question | Owner | Decision point | Status |
|---|---|---|---|---|
| OQ-001 | {{QUESTION}} | {{OWNER}} | {{DATE_OR_MILESTONE}} | Open |
| OQ-002 | {{QUESTION}} | {{OWNER}} | {{DATE_OR_MILESTONE}} | Open |

## 17. Approval

| Role | Name | Decision | Date | Notes |
|---|---|---|---|---|
| Product Owner | {{NAME}} | Pending / Approved / Rejected | {{DATE}} | {{NOTES}} |
| Rules / Technical Reviewer | {{NAME}} | Pending / Approved / Rejected | {{DATE}} | {{NOTES}} |
| QA Reviewer | {{NAME}} | Pending / Approved / Rejected | {{DATE}} | {{NOTES}} |
| Content / Licensing Reviewer | {{NAME}} | Pending / Approved / Rejected | {{DATE}} | {{NOTES}} |
