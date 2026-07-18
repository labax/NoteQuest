# EPIC-{{EPIC_NUMBER}}: {{EPIC_TITLE}}

## Epic Story

As a {{USER_OR_STAKEHOLDER}}, I want {{HIGH_LEVEL_CAPABILITY}} so that {{USER_OR_PRODUCT_VALUE}}.

## Goal

{{ONE_SENTENCE_DESCRIPTION_OF_THE_EPIC_OUTCOME}}.

{{ONE_OR_TWO_PARAGRAPHS_EXPLAINING_WHAT_THE_EPIC_SHOULD_DELIVER, WHY_IT_MATTERS, AND_THE_IMPORTANT_PRODUCT_BOUNDARIES.}}

## {{MVP_OR_RELEASE}} Scope

### Must Have

- {{REQUIRED_CAPABILITY_1}}
- {{REQUIRED_CAPABILITY_2}}
- {{REQUIRED_CAPABILITY_3}}
- {{REQUIRED_CAPABILITY_4}}

### Should Have

- {{IMPORTANT_BUT_DEFERRABLE_CAPABILITY_1}}
- {{IMPORTANT_BUT_DEFERRABLE_CAPABILITY_2}}
- {{IMPORTANT_BUT_DEFERRABLE_CAPABILITY_3}}

### Could Have

- {{OPTIONAL_ENHANCEMENT_1}}
- {{OPTIONAL_ENHANCEMENT_2}}
- {{OPTIONAL_ENHANCEMENT_3}}

## Out of Scope

- {{EXPLICITLY_EXCLUDED_CAPABILITY_1}}
- {{EXPLICITLY_EXCLUDED_CAPABILITY_2}}
- {{EXPLICITLY_EXCLUDED_CAPABILITY_3}}
- {{FUTURE_MILESTONE_CAPABILITY}}

## Acceptance Criteria

- [ ] {{TESTABLE_USER_OR_SYSTEM_OUTCOME_1}}
- [ ] {{TESTABLE_USER_OR_SYSTEM_OUTCOME_2}}
- [ ] {{TESTABLE_USER_OR_SYSTEM_OUTCOME_3}}
- [ ] {{DATA_PERSISTENCE_OR_RECOVERY_CRITERION}}
- [ ] {{RESPONSIVE_OR_ACCESSIBILITY_CRITERION}}
- [ ] {{RULES_OR_CALCULATION_CRITERION_IF_APPLICABLE}}
- [ ] {{CONTENT_AND_LICENSING_CRITERION_IF_APPLICABLE}}
- [ ] No blocked or unapproved content is included.

## Child Stories

- [ ] #{{ISSUE_NUMBER}} — {{CHILD_STORY_TITLE_AND_SHORT_PURPOSE}}
- [ ] #{{ISSUE_NUMBER}} — {{CHILD_STORY_TITLE_AND_SHORT_PURPOSE}}
- [ ] #{{ISSUE_NUMBER}} — {{CHILD_STORY_TITLE_AND_SHORT_PURPOSE}}
- [ ] #{{ISSUE_NUMBER}} — {{CHILD_STORY_TITLE_AND_SHORT_PURPOSE}}

Supporting or cross-epic work:

- #{{ISSUE_NUMBER}} — {{SUPPORTING_ISSUE_TITLE}}
- #{{ISSUE_NUMBER}} — {{SUPPORTING_ISSUE_TITLE}}

## Implementation Order

```text
#{{ISSUE}} {{FIRST_FOUNDATION_STORY}}
  ├── #{{ISSUE}} {{PARALLEL_STORY_A}}
  ├── #{{ISSUE}} {{PARALLEL_STORY_B}}
  └── #{{ISSUE}} {{PARALLEL_STORY_C}}

#{{ISSUE}} {{FOUNDATION}}
  → #{{ISSUE}} {{DEPENDENT_STORY}}
  → #{{ISSUE}} {{FINAL_HARDENING_OR_ACCEPTANCE_STORY}}
```

{{EXPLAIN_WHICH_STORIES_CAN_PROCEED_IN_PARALLEL_AND_WHICH_MUST_WAIT_FOR_DEPENDENCIES.}}

## Dependencies

### Completed Foundation Dependencies

- [ ] {{COMPLETED_OR_REQUIRED_FOUNDATION_1}}
- [ ] {{COMPLETED_OR_REQUIRED_FOUNDATION_2}}

### Ongoing Dependencies

- {{RELATED_EPIC_OR_SYSTEM_DEPENDENCY_1}}
- {{RELATED_EPIC_OR_SYSTEM_DEPENDENCY_2}}
- {{CONTENT_DATA_RULES_OR_PERSISTENCE_DEPENDENCY}}
- {{EXTERNAL_REVIEW_OR_RELEASE_DEPENDENCY}}

## Definition of Done

- The {{EPIC_NAME}} flow is implemented.
- All Must Have scope is delivered or formally descoped.
- Must-have acceptance criteria pass.
- Required data survives save, reload, export, and import where applicable.
- Manual correction or override remains possible where required.
- Rules calculations are covered by deterministic tests where applicable.
- Relevant unit, component, integration, and acceptance tests pass.
- UX has been checked at desktop and mobile widths.
- Accessibility requirements pass at the agreed baseline.
- Content provenance, attribution, and licensing checks pass.
- No blocker or critical defects remain open.
- No blocked or unapproved content is included.