# Acceptance Criteria / Test Plan

## {{PRODUCT_OR_RELEASE_NAME}}

*Version {{VERSION}} | {{STATUS}} | Prepared for the Ironsworn Project*

| Field | Value |
|---|---|
| Document owner | {{OWNER}} |
| Related documents | {{RELATED_DOCUMENTS}} |
| Product scope | {{SCOPE}} |
| Primary audience | Product owner, developer, UX designer, QA/tester, content/licensing reviewer, and playtesters |
| Status | {{STATUS}} |
| Last updated | {{DATE}} |

---

## Contents

1. Purpose
2. Source Basis
3. Test Context
4. Quality Objectives
5. Test Scope
6. Out of Scope
7. Test Strategy
8. Test Levels
9. Test Environments
10. Test Data Strategy
11. Entry Criteria
12. Exit Criteria
13. Release Acceptance Gates
14. Global Acceptance Criteria
15. Feature-Level Acceptance Criteria
16. Detailed Acceptance Scenarios
17. Rules Test Matrix
18. Persistence and Data Safety Matrix
19. UX, Accessibility, and Responsive Matrix
20. Content and Licensing Matrix
21. Regression and Smoke Tests
22. Playtest / UAT Plan
23. Defect Severity and Triage
24. Traceability
25. Test Execution Summary
26. Open Questions
27. Approval

---

## 1. Purpose

{{EXPLAIN_HOW_THIS_PLAN_CONVERTS_REQUIREMENTS_INTO_RELEASE_READINESS_EVIDENCE}}

## 2. Source Basis

- {{BUSINESS_OR_PRODUCT_REQUIREMENTS}}
- {{MVP_OR_RELEASE_SCOPE}}
- {{FUNCTIONAL_REQUIREMENTS}}
- {{RULES_ENGINE_REQUIREMENTS}}
- {{DATA_MODEL_REQUIREMENTS}}
- {{UX_REQUIREMENTS}}
- {{CONTENT_AND_LICENSING_REQUIREMENTS}}
- {{NON_FUNCTIONAL_REQUIREMENTS}}

## 3. Test Context

{{DESCRIBE_THE_PRODUCT_BOUNDARIES_AND_THE_HIGHEST_RISK_AREAS}}

| Risk area | Why it matters | Test response |
|---|---|---|
| Rules calculation errors | Incorrect outcomes damage player trust. | Deterministic unit and expected-result tests. |
| Data loss or corruption | Campaign and journal data may be irreplaceable. | Save/reload, migration, import, export, and recovery tests. |
| Poor active-play UX | Slow or confusing flows defeat the companion's purpose. | End-to-end flows and playtesting. |
| Over-automation | Forced story outcomes undermine fiction-first play. | Acceptance tests preserve user interpretation. |
| Licensing / content errors | Unapproved content can block release. | Inventory, provenance, notice, and build-gate tests. |
| {{RISK}} | {{RATIONALE}} | {{RESPONSE}} |

## 4. Quality Objectives

| ID | Objective | Acceptance signal |
|---|---|---|
| QO-001 | {{OBJECTIVE}} | {{SIGNAL}} |
| QO-002 | Produce correct deterministic rules results. | Rules matrix passes. |
| QO-003 | Preserve required user data. | Persistence and recovery gates pass. |
| QO-004 | Preserve fiction-first play. | No mandatory narrative interpretation is applied. |
| QO-005 | Meet responsive and accessibility baseline. | Supported matrix passes. |
| QO-006 | Be release-eligible from a content perspective. | Content and licensing gate passes. |

## 5. Test Scope

### 5.1 In scope

| Area | Testing included |
|---|---|
| {{AREA}} | {{TESTING}} |
| {{AREA}} | {{TESTING}} |

### 5.2 Conditional scope

| Area | Test when |
|---|---|
| Manual dice entry | Implemented. |
| Persistent roll history | Included in the release. |
| Import / export | Included in the release. |
| Account isolation | Account-based persistence is implemented. |
| Offline behavior | The release claims offline/local-first use. |
| {{AREA}} | {{CONDITION}} |

## 6. Out of Scope

- {{EXCLUDED_TEST_AREA_1}}
- {{EXCLUDED_TEST_AREA_2}}
- Features explicitly outside the release scope.
- Complete rules-compendium accuracy when no full compendium is included.
- Unapproved content, except to confirm it is blocked or absent.

## 7. Test Strategy

| Layer | Purpose | Method | Owner |
|---|---|---|---|
| Requirements review | Catch gaps before implementation. | Checklist and traceability review. | Product / QA |
| Unit | Verify pure calculations and validation. | Deterministic fixtures and boundary tests. | Developer |
| Component | Verify isolated UI states and interactions. | Component test tools. | Developer / QA |
| Integration | Verify features and persistence working together. | Service, storage, and linked-object tests. | Developer / QA |
| End-to-end | Verify complete user journeys. | Browser automation and manual confirmation. | QA |
| Accessibility | Verify baseline inclusive use. | Automated checks plus keyboard/screen-reader smoke tests. | UX / QA |
| Content review | Verify release eligibility. | Inventory and provenance validation. | Content reviewer |
| Playtest / UAT | Verify practical value during play. | Structured session and feedback survey. | Product owner |
| Regression | Protect core flows after changes. | Stable smoke suite. | QA / CI |

## 8. Test Levels

### 8.1 Unit tests

Must cover where applicable:

- Dice ranges and deterministic injection.
- Result classifications, ties, matches, caps, and modifier order.
- Momentum and progress calculations.
- Oracle range lookup and invalid table data.
- Domain validation and derived fields.
- Serialization, migration, and import validation.
- Content-manifest validation.

### 8.2 Component tests

- Forms and validation.
- Track controls and boundaries.
- Roll result and confirmation components.
- Empty, loading, success, error, and recovery states.
- Save status and destructive confirmations.
- Responsive component variants where practical.

### 8.3 Integration tests

- Character / campaign state used by rules inputs.
- Roll, oracle, progress, and journal linkage.
- Save/reload of linked objects.
- Session and campaign ownership.
- Migration and import atomicity.
- Application reset scope.

### 8.4 End-to-end tests

- {{E2E_FLOW_1}}
- {{E2E_FLOW_2}}
- {{E2E_FLOW_3}}
- Core play loop without external tracking tools.

## 9. Test Environments

| Environment | Purpose | Data | Required checks |
|---|---|---|---|
| Local development | Fast unit/component feedback. | Deterministic fixtures. | Build, tests, static checks. |
| QA build | Manual and automated integration testing. | Resettable representative data. | Functional and regression. |
| Closed playtest | Practical use validation. | Content-reviewed data. | UAT, usability, data safety. |
| Release candidate | Final approval. | Production-equivalent build. | All Must gates. |

### Browser / device matrix

| Platform | Browser / viewport | Priority | Result |
|---|---|---:|---|
| Desktop | {{BROWSER_VERSION}} | Must | Not run |
| Desktop | {{BROWSER_VERSION}} | Should | Not run |
| Mobile | {{BROWSER_DEVICE_OR_VIEWPORT}} | Should / Must | Not run |
| Tablet | {{VIEWPORT}} | Should | Not run |

## 10. Test Data Strategy

### 10.1 Standard character / campaign fixture

| Field | Value |
|---|---|
| Campaign | {{CAMPAIGN_NAME}} |
| Character | {{CHARACTER_NAME}} |
| Stats / resources | {{VALUES}} |
| Momentum | {{VALUES}} |
| Vows / tracks | {{VALUES}} |
| Journal / history | {{VALUES}} |

### 10.2 Boundary fixtures

- Minimum and maximum track values.
- Partially filled progress.
- Empty campaign / no active record.
- Long names and long journal entries.
- Multiple campaigns and sessions.
- Large history fixture.
- Invalid and older schema versions.
- Corrupted or incomplete stored data.
- Unknown / restricted content manifest entries.

### 10.3 Content fixtures

Use project-original content in automated tests unless an approved official data fixture is necessary. Test fixtures must carry provenance metadata.

## 11. Entry Criteria

A feature is ready for QA when:

- [ ] Requirement and story IDs are linked.
- [ ] Acceptance criteria are testable.
- [ ] Must scope is implemented or clearly marked incomplete.
- [ ] Test fixtures and seed data exist.
- [ ] Content-bearing UI has source/provenance assigned.
- [ ] Known limitations are documented.
- [ ] The build runs in the agreed environment.
- [ ] Relevant unit and component tests pass.

## 12. Exit Criteria

A feature or release passes when:

- [ ] All Must acceptance criteria pass.
- [ ] No blocker or critical defects remain open.
- [ ] High defects are fixed or explicitly accepted by the product owner.
- [ ] Affected regression smoke tests pass.
- [ ] Accessibility and responsive checks pass at the agreed baseline.
- [ ] Content and licensing checks pass.
- [ ] Known limitations and deferred items are documented.

## 13. Release Acceptance Gates

| Gate | Name | Pass condition | Evidence | Owner |
|---|---|---|---|---|
| GATE-001 | Scope | All Must work is implemented or formally descoped. | {{EVIDENCE}} | Product |
| GATE-002 | Core journey | Primary user completes the end-to-end flow. | {{EVIDENCE}} | QA / Product |
| GATE-003 | Rules | Deterministic rules tests pass. | {{EVIDENCE_OR_NA}} | Development / QA |
| GATE-004 | Persistence | Required data survives save, close, and resume. | {{EVIDENCE}} | QA |
| GATE-005 | Migration / recovery | Invalid or older data follows documented safe behavior. | {{EVIDENCE}} | QA |
| GATE-006 | UX | Required actions are discoverable and errors are recoverable. | {{EVIDENCE}} | UX / QA |
| GATE-007 | Accessibility | Agreed keyboard, labels, focus, contrast, and responsive baseline passes. | {{EVIDENCE}} | UX / QA |
| GATE-008 | Content | Inventory, provenance, notices, and blocked-content checks pass. | {{EVIDENCE}} | Content reviewer |
| GATE-009 | Data safety | Destructive actions and reset scope are safe. | {{EVIDENCE}} | QA |
| GATE-010 | Defects | No blocker or critical defects remain. | Defect report | Product / QA |

## 14. Global Acceptance Criteria

| ID | Acceptance criterion | Priority | Verification |
|---|---|---:|---|
| AC-GEN-001 | {{CRITERION}} | Must | {{METHOD}} |
| AC-GEN-002 | Required data persists across normal close/reopen. | Must | E2E / integration |
| AC-GEN-003 | Mechanical results are transparent and user interpretation is preserved. | Must | Acceptance review |
| AC-GEN-004 | Core flows work on supported desktop and mobile widths. | Must / Should | Responsive matrix |
| AC-GEN-005 | No blocked or unapproved bundled content is included. | Must | Manifest / review |

## 15. Feature-Level Acceptance Criteria

Repeat for each feature.

### 15.1 {{FEATURE_NAME}}

| ID | Given | When | Then | Priority | Requirement IDs |
|---|---|---|---|---:|---|
| AC-{{PREFIX}}-001 | {{CONTEXT}} | {{ACTION}} | {{EXPECTED_RESULT}} | Must | {{REQ_IDS}} |
| AC-{{PREFIX}}-002 | {{CONTEXT}} | {{ACTION}} | {{EXPECTED_RESULT}} | Should | {{REQ_IDS}} |

Include:

- Happy path.
- Empty state.
- Boundary values.
- Invalid input.
- Cancel / no-change path.
- Save failure or recovery.
- Reload / persistence.
- Responsive and keyboard behavior.
- Content provenance where applicable.

## 16. Detailed Acceptance Scenarios

### AT-001: {{SCENARIO_NAME}}

**Requirement IDs:** {{IDS}}

**Preconditions:**

- {{PRECONDITION}}

**Steps:**

1. {{STEP}}
2. {{STEP}}
3. {{STEP}}

**Expected results:**

- {{EXPECTED_RESULT}}
- {{EXPECTED_RESULT}}

**Evidence:** {{SCREENSHOT_LOG_TEST_OUTPUT_OR_PLAYTEST_NOTE}}

**Result:** Not run / Pass / Fail / Blocked

## 17. Rules Test Matrix

| Test ID | Fixed inputs | Expected intermediate values | Expected result | Requirement IDs | Automated |
|---|---|---|---|---|---:|
| RT-001 | {{INPUTS}} | {{VALUES}} | {{RESULT}} | {{IDS}} | Yes / No |
| RT-002 | {{INPUTS}} | {{VALUES}} | {{RESULT}} | {{IDS}} | Yes / No |

Minimum cases where applicable:

- Every result classification.
- Ties and matches.
- Minimum and maximum dice.
- Modifier order and score caps.
- Negative momentum and burn behavior.
- Partial progress and filled-box-only score.
- Oracle first/last ranges and invalid gaps/overlaps.
- Manual input and override.

## 18. Persistence and Data Safety Matrix

| Test ID | Scenario | Expected behavior | Data comparison | Result |
|---|---|---|---|---|
| DATA-T001 | Normal save and reload | Equivalent required state is restored. | {{METHOD}} | Not run |
| DATA-T002 | Save failure | Error is visible; no false-success state. | {{METHOD}} | Not run |
| DATA-T003 | Invalid import | Existing data remains unchanged. | Before/after snapshot | Not run |
| DATA-T004 | Supported migration | Required records and links are preserved. | Fixture equivalence | Not run |
| DATA-T005 | Corrupted stored data | Recovery guidance appears; no silent reset. | {{METHOD}} | Not run |
| DATA-T006 | Application reset | Only application-owned data is removed. | Storage inspection | Not run |
| DATA-T007 | Destructive action cancel | No state changes. | Before/after snapshot | Not run |

## 19. UX, Accessibility, and Responsive Matrix

| Test ID | Area | Method | Expected result | Result |
|---|---|---|---|---|
| UX-T001 | Keyboard completion of core flow | Manual | All required actions operable. | Not run |
| UX-T002 | Dialog focus | Manual / component | Focus enters, remains, and returns correctly. | Not run |
| UX-T003 | Form labels and errors | Automated / manual | Labels and associated errors present. | Not run |
| UX-T004 | Dynamic status | Screen-reader smoke | Important updates announced appropriately. | Not run |
| UX-T005 | Color-independent state | Visual review | Text/icon/structure communicates meaning. | Not run |
| UX-T006 | Desktop width | Browser | No clipped required controls. | Not run |
| UX-T007 | Mobile width | Browser/device | Core flow remains usable. | Not run |
| UX-T008 | Long content | Fixture | Layout wraps and remains operable. | Not run |

## 20. Content and Licensing Matrix

| Test ID | Check | Expected result | Evidence | Result |
|---|---|---|---|---|
| LIC-T001 | Content inventory | Every bundled item is listed. | Manifest / inventory | Not run |
| LIC-T002 | Source categories | No missing category. | Validation | Not run |
| LIC-T003 | Unknown / restricted content | None in release build. | Validation | Not run |
| LIC-T004 | Attribution and notices | Present and accurate in required locations. | Screenshot / file review | Not run |
| LIC-T005 | Unofficial-product disclaimer | Visible and approved. | Screenshot | Not run |
| LIC-T006 | Art / trade dress | No unapproved official visuals or copied layout. | Design review | Not run |
| LIC-T007 | Commercial compatibility | No non-commercial-only content in commercial build. | Inventory review | Not run |
| LIC-T008 | User content separation | User-authored data is not labeled as bundled official content. | Functional test | Not run |

## 21. Regression and Smoke Tests

### Build smoke

- [ ] Clean dependency install succeeds.
- [ ] Production build succeeds.
- [ ] Unit / CI test command succeeds.
- [ ] Static / lint check succeeds.
- [ ] Format check succeeds.
- [ ] Content validation succeeds.

### Product smoke

- [ ] App opens with empty and existing data.
- [ ] Primary record can be created and edited.
- [ ] Core roll / rules action succeeds.
- [ ] Progress or primary state can be updated.
- [ ] Journal / history entry can be created where in scope.
- [ ] Save status is accurate.
- [ ] Reload restores state.
- [ ] Destructive action can be canceled safely.
- [ ] About / Legal notices are reachable.

## 22. Playtest / UAT Plan

### Objective

{{PLAYTEST_OBJECTIVE}}

### Participants

| Segment | Count target | Experience |
|---|---:|---|
| {{SEGMENT}} | {{COUNT}} | {{EXPERIENCE}} |
| {{SEGMENT}} | {{COUNT}} | {{EXPERIENCE}} |

### Session script

1. {{TASK_1}}
2. {{TASK_2}}
3. {{TASK_3}}
4. Close and resume the application where persistence is in scope.
5. Complete feedback questions.

### Feedback measures

- Task completion and assistance required.
- Confidence that data was saved.
- Clarity of rules results and next actions.
- Friction caused by navigation or forms.
- Need for external tools.
- Trust in backup / recovery behavior.
- Content and attribution clarity.

### UAT acceptance

{{DEFINE_SUCCESS_THRESHOLD_AND_WHO_APPROVES}}

## 23. Defect Severity and Triage

| Severity | Definition | Examples | Release position |
|---|---|---|---|
| Blocker | Prevents testing or causes unavoidable severe loss. | App cannot load; all saves destroyed. | Must fix. |
| Critical | High-impact rules, security, privacy, or data-loss defect. | Incorrect core calculation; import overwrites valid data. | Must fix. |
| High | Major flow fails with limited workaround. | Cannot complete a required vow or session action. | Fix or explicit product waiver. |
| Medium | Important defect with reasonable workaround. | Incorrect focus return; confusing non-critical validation. | Prioritize. |
| Low | Cosmetic or minor issue. | Spacing or copy inconsistency. | May defer. |

Triage record:

| Defect | Severity | Owner | Decision | Target |
|---|---|---|---|---|
| {{ID}} | {{SEVERITY}} | {{OWNER}} | Fix / accept / defer | {{MILESTONE}} |

## 24. Traceability

| Requirement ID | Acceptance criteria | Test IDs | Evidence | Status |
|---|---|---|---|---|
| {{REQ_ID}} | {{AC_ID}} | {{TEST_IDS}} | {{EVIDENCE}} | Not run |
| {{REQ_ID}} | {{AC_ID}} | {{TEST_IDS}} | {{EVIDENCE}} | Not run |

## 25. Test Execution Summary

| Area | Planned | Passed | Failed | Blocked | Not run |
|---|---:|---:|---:|---:|---:|
| Unit | {{COUNT}} | {{COUNT}} | {{COUNT}} | {{COUNT}} | {{COUNT}} |
| Component | {{COUNT}} | {{COUNT}} | {{COUNT}} | {{COUNT}} | {{COUNT}} |
| Integration | {{COUNT}} | {{COUNT}} | {{COUNT}} | {{COUNT}} | {{COUNT}} |
| E2E | {{COUNT}} | {{COUNT}} | {{COUNT}} | {{COUNT}} | {{COUNT}} |
| Accessibility | {{COUNT}} | {{COUNT}} | {{COUNT}} | {{COUNT}} | {{COUNT}} |
| Content / licensing | {{COUNT}} | {{COUNT}} | {{COUNT}} | {{COUNT}} | {{COUNT}} |

### Release recommendation

Approve / Approve with accepted risks / Reject

{{SUMMARY_AND_RATIONALE}}

## 26. Open Questions

| ID | Question | Owner | Decision point | Status |
|---|---|---|---|---|
| OQ-001 | {{QUESTION}} | {{OWNER}} | {{DATE_OR_MILESTONE}} | Open |
| OQ-002 | {{QUESTION}} | {{OWNER}} | {{DATE_OR_MILESTONE}} | Open |

## 27. Approval

| Role | Name | Decision | Date | Notes |
|---|---|---|---|---|
| Product Owner | {{NAME}} | Pending / Approved / Rejected | {{DATE}} | {{NOTES}} |
| QA / Test Lead | {{NAME}} | Pending / Approved / Rejected | {{DATE}} | {{NOTES}} |
| Technical Lead | {{NAME}} | Pending / Approved / Rejected | {{DATE}} | {{NOTES}} |
| UX / Accessibility Reviewer | {{NAME}} | Pending / Approved / Rejected | {{DATE}} | {{NOTES}} |
| Content / Licensing Reviewer | {{NAME}} | Pending / Approved / Rejected | {{DATE}} | {{NOTES}} |
