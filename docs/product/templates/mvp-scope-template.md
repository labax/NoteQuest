# MVP Scope Document

## {{PRODUCT_OR_RELEASE_NAME}}

*Version {{VERSION}} | {{STATUS}} | Prepared for the NoteQuest Project*

| Field | Value |
|---|---|
| Document owner | {{OWNER}} |
| Related documents | {{RELATED_DOCUMENTS}} |
| MVP / release baseline | {{BASELINE}} |
| Primary audience | Product owner, developer, UX designer, QA/tester, and content/licensing reviewer |
| Status | {{STATUS}} |
| Last updated | {{DATE}} |

---

## 1. Purpose

{{DEFINE_WHAT_THIS_SCOPE_DOCUMENT_BOUNDS_AND_WHAT_DECISION_IT_SUPPORTS}}

## 2. Source Basis

This scope is based on:

- {{BUSINESS_OR_PRODUCT_DOCUMENT}}
- {{USER_RESEARCH_OR_PLAYTEST_EVIDENCE}}
- {{RULES_OR_DOMAIN_REFERENCE}}
- {{PROJECT_DECISION}}

## 3. MVP Goal

> {{ONE_SENTENCE_MINIMUM_RELEASE_OUTCOME}}

The MVP succeeds when {{PRIMARY_USER}} can {{END_TO_END_OUTCOME}} without {{UNACCEPTABLE_WORKAROUND_OR_RISK}}.

## 4. MVP Principles

| ID | Principle | Meaning for this release |
|---|---|---|
| MP-001 | Minimum but complete | Deliver an end-to-end usable loop rather than isolated controls. |
| MP-002 | Solo-first | Optimize the first release for the primary solo workflow unless explicitly changed. |
| MP-003 | Faithful adaptation | Implement the approved core rules and gameplay loop without adding unsupported mechanics or content. |
| MP-004 | Persistent and safe | Required user-created data survives normal save and resume behavior. |
| MP-005 | Extensible foundation | Avoid choices that block planned dungeon packs, platform support, accessibility work, or approved expansion content. |
| MP-006 | Licensing-conscious | Only approved bundled content is included. |
| MP-007 | {{PRINCIPLE}} | {{MEANING}} |

## 5. Target Users

| User type | Priority | Primary need | MVP support |
|---|---:|---|---|
| {{USER_TYPE}} | Primary | {{NEED}} | {{SUPPORT}} |
| {{USER_TYPE}} | Secondary | {{NEED}} | {{SUPPORT}} |
| {{USER_TYPE}} | Later | {{NEED}} | Deferred |

## 6. Core User Journey

1. {{STEP_1}}
2. {{STEP_2}}
3. {{STEP_3}}
4. {{STEP_4}}
5. {{STEP_5}}
6. The user closes and later resumes with required state preserved.

```mermaid
flowchart TD
    A[{{START}}] --> B[{{ACTION}}]
    B --> C[{{ACTION}}]
    C --> D[{{ACTION}}]
    D --> E[{{END_STATE}}]
```

## 7. Feature Set

| ID | Feature | Status | Summary | Owner |
|---|---|---|---|---|
| MVP-001 | {{FEATURE}} | Must Have | {{SUMMARY}} | {{OWNER}} |
| MVP-002 | {{FEATURE}} | Must Have | {{SUMMARY}} | {{OWNER}} |
| MVP-003 | {{FEATURE}} | Should Have | {{SUMMARY}} | {{OWNER}} |
| MVP-004 | {{FEATURE}} | Could Have | {{SUMMARY}} | {{OWNER}} |

## 8. Detailed Feature Scope

Repeat this section for each feature.

### 8.1 {{FEATURE_ID}}: {{FEATURE_NAME}}

**Goal:** {{FEATURE_GOAL}}

#### Included

| ID | Scope item | Priority | Acceptance signal |
|---|---|---:|---|
| {{PREFIX}}-001 | {{SCOPE_ITEM}} | Must | {{SIGNAL}} |
| {{PREFIX}}-002 | {{SCOPE_ITEM}} | Should | {{SIGNAL}} |
| {{PREFIX}}-003 | {{SCOPE_ITEM}} | Could | {{SIGNAL}} |

#### Excluded

- {{EXCLUDED_ITEM_1}}
- {{EXCLUDED_ITEM_2}}

#### Dependencies

- {{DEPENDENCY_1}}
- {{DEPENDENCY_2}}

#### Feature acceptance criteria

- [ ] {{ACCEPTANCE_CRITERION_1}}
- [ ] {{ACCEPTANCE_CRITERION_2}}
- [ ] {{PERSISTENCE_OR_RECOVERY_CRITERION}}
- [ ] {{RESPONSIVE_OR_ACCESSIBILITY_CRITERION}}
- [ ] {{CONTENT_OR_RULES_CRITERION_IF_APPLICABLE}}

## 9. Cross-Cutting Scope

### 9.1 Persistence and data safety

- {{SAVE_BEHAVIOR}}
- {{RELOAD_BEHAVIOR}}
- {{BACKUP_OR_EXPORT_POSITION}}
- {{DESTRUCTIVE_ACTION_POSITION}}

### 9.2 Responsive and accessibility baseline

- {{SUPPORTED_VIEWPORTS}}
- {{KEYBOARD_BASELINE}}
- {{LABEL_AND_FOCUS_BASELINE}}
- {{READABILITY_BASELINE}}

### 9.3 Content and licensing

- Approved content sources: {{SOURCES}}
- Prohibited or deferred content: {{CONTENT}}
- Attribution location: {{LOCATION}}
- Commercial / non-commercial release position: {{POSITION}}

### 9.4 Quality baseline

- {{UNIT_TEST_EXPECTATION}}
- {{INTEGRATION_TEST_EXPECTATION}}
- {{E2E_OR_PLAYTEST_EXPECTATION}}
- {{BUILD_AND_FORMAT_EXPECTATION}}

## 10. Explicit MVP Exclusions

The following are not required for MVP acceptance:

- {{EXCLUSION_1}}
- {{EXCLUSION_2}}
- {{EXCLUSION_3}}
- Full virtual tabletop features unless explicitly in scope.
- AI-authored narrative or automated GM behavior unless explicitly in scope.
- Real-time multiplayer unless explicitly in scope.
- Monetization before content and licensing approval.
- Unapproved NoteQuest rules text, tables, item or monster descriptions, art, icons, screenshots, copied layout, or trade dress.

## 11. Release Gates

| Gate | Requirement | Pass condition |
|---|---|---|
| Scope gate | Must features are implemented or formally descoped. | {{PASS_CONDITION}} |
| End-to-end gate | Primary user can complete the core journey. | {{PASS_CONDITION}} |
| Rules gate | Deterministic mechanics pass expected-result tests. | {{PASS_CONDITION_OR_NA}} |
| Persistence gate | Required user data survives close/reopen. | {{PASS_CONDITION}} |
| UX gate | Core actions are discoverable and usable. | {{PASS_CONDITION}} |
| Accessibility gate | Agreed baseline passes. | {{PASS_CONDITION}} |
| Content gate | Inventory, provenance, notices, and approval pass. | {{PASS_CONDITION}} |
| Defect gate | No blocker or critical defects remain open. | Pass |

## 12. Success Measures

| ID | Measure | Target | Evidence |
|---|---|---|---|
| MVP-SM-001 | {{MEASURE}} | {{TARGET}} | {{EVIDENCE}} |
| MVP-SM-002 | {{MEASURE}} | {{TARGET}} | {{EVIDENCE}} |
| MVP-SM-003 | {{MEASURE}} | {{TARGET}} | {{EVIDENCE}} |

## 13. Assumptions and Dependencies

### Assumptions

- {{ASSUMPTION_1}}
- {{ASSUMPTION_2}}

### Dependencies

| ID | Dependency | Status | Blocking scope |
|---|---|---|---|
| DEP-001 | {{DEPENDENCY}} | {{STATUS}} | {{FEATURE_OR_GATE}} |
| DEP-002 | {{DEPENDENCY}} | {{STATUS}} | {{FEATURE_OR_GATE}} |

## 14. Risks and Scope Controls

| Risk | Scope impact | Control |
|---|---|---|
| {{RISK}} | {{IMPACT}} | {{CONTROL}} |
| Scope creep | Delays validation and raises defect risk. | New work requires explicit Must/Should/Could/Won't decision. |
| Unapproved content | Can block public release. | Content inventory and release gate. |
| Data loss | Damages player trust. | Persistence tests, confirmations, and recovery planning. |

## 15. Deferred Backlog

| Item | Reason deferred | Target milestone | Prerequisite |
|---|---|---|---|
| {{ITEM}} | {{REASON}} | {{MILESTONE}} | {{PREREQUISITE}} |
| {{ITEM}} | {{REASON}} | {{MILESTONE}} | {{PREREQUISITE}} |

## 16. Open Questions

| ID | Question | Owner | Decision point | Status |
|---|---|---|---|---|
| OQ-001 | {{QUESTION}} | {{OWNER}} | {{DATE_OR_MILESTONE}} | Open |
| OQ-002 | {{QUESTION}} | {{OWNER}} | {{DATE_OR_MILESTONE}} | Open |

## 17. Approval

- [ ] Product owner approves the bounded scope.
- [ ] Technical feasibility has been reviewed.
- [ ] UX flow is sufficient for estimation and implementation.
- [ ] Content/licensing implications are understood.
- [ ] QA can trace each Must item to acceptance evidence.
