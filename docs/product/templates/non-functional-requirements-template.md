# Non-Functional Requirements

## {{PRODUCT_OR_RELEASE_NAME}}

*Version {{VERSION}} | {{STATUS}} | Prepared for the NoteQuest Project*

| Field | Value |
|---|---|
| Document owner | {{OWNER}} |
| Related documents | {{RELATED_DOCUMENTS}} |
| Product scope | {{SCOPE}} |
| Primary audience | Product owner, developer, QA/tester, UX designer, release owner, and content/licensing reviewer |
| Status | {{STATUS}} |
| Last updated | {{DATE}} |

---

## Contents

1. Purpose
2. Source Basis
3. Quality Context
4. Scope and Assumptions
5. Priority and Measurement Conventions
6. Performance
7. Reliability and Data Integrity
8. Availability and Offline Behavior
9. Security
10. Privacy
11. Accessibility
12. Compatibility and Responsive Support
13. Usability
14. Maintainability and Testability
15. Observability and Diagnostics
16. Backup, Recovery, Migration, and Portability
17. Content and Licensing Quality Controls
18. Build, Release, and Operations
19. Traceability and Verification
20. Acceptance Criteria
21. Open Questions
22. Approval

---

## 1. Purpose

{{DEFINE_THE_QUALITY_ATTRIBUTES_CONSTRAINTS_AND_MEASURABLE_SERVICE_LEVELS_FOR_THE_PRODUCT_OR_RELEASE}}

Non-functional requirements must be measurable. Replace vague terms such as “fast,” “secure,” or “accessible” with a test target, supported environment, threshold, or review method.

## 2. Source Basis

- {{BUSINESS_OR_PRODUCT_REQUIREMENTS}}
- {{MVP_OR_RELEASE_SCOPE}}
- {{FUNCTIONAL_REQUIREMENTS}}
- {{DATA_AND_RULES_REQUIREMENTS}}
- {{UX_AND_ACCESSIBILITY_REQUIREMENTS}}
- {{ARCHITECTURE_OR_RELEASE_DECISIONS}}

## 3. Quality Context

{{DESCRIBE_WHICH_USER_DATA_AND_WORKFLOWS_HAVE_THE_HIGHEST_QUALITY_RISK}}

Consider:

- Rules-result accuracy.
- Character, adventure, dungeon objective, and event log data loss.
- Local-first storage limitations.
- Long-running adventure data growth.
- Mobile browser usability.
- Content provenance and release compliance.

## 4. Scope and Assumptions

### In scope

- {{QUALITY_AREA_1}}
- {{QUALITY_AREA_2}}
- {{QUALITY_AREA_3}}

### Out of scope

- {{EXCLUSION_1}}
- {{EXCLUSION_2}}

### Assumptions

| ID | Assumption | Validation |
|---|---|---|
| NFA-001 | {{ASSUMPTION}} | {{METHOD}} |
| NFA-002 | {{ASSUMPTION}} | {{METHOD}} |

## 5. Priority and Measurement Conventions

| Priority | Meaning |
|---|---|
| Must | Required for release unless formally waived with risk acceptance. |
| Should | Important quality target; deferral requires documented impact. |
| Could | Optional improvement. |
| Won't | Explicitly excluded from this release. |

Measurement conventions:

- Browser timings use a documented device/network profile.
- Percentiles require a defined sample size and test environment.
- Storage limits use representative adventure fixtures.
- Accessibility references the agreed WCAG version and level.
- Security requirements identify threat, control, and verification method.

## 6. Performance

| ID | Requirement | Target | Environment | Verification | Priority |
|---|---|---|---|---|---:|
| NFR-PERF-001 | Initial application load shall {{BEHAVIOR}}. | {{TARGET_MS_OR_SECONDS}} | {{DEVICE_BROWSER_NETWORK}} | {{METHOD}} | Must |
| NFR-PERF-002 | Navigation between primary local views shall complete within {{TARGET}}. | {{TARGET}} | {{ENVIRONMENT}} | {{METHOD}} | Should |
| NFR-PERF-003 | A dice or rules calculation shall return within {{TARGET}} after user action. | {{TARGET}} | Supported devices | Automated performance test | Must |
| NFR-PERF-004 | Save operations shall complete or show an explicit pending/error state within {{TARGET}}. | {{TARGET}} | {{ENVIRONMENT}} | Integration test | Must |
| NFR-PERF-005 | Event Log/history views shall remain responsive with {{FIXTURE_SIZE}} records. | {{TARGET}} | {{ENVIRONMENT}} | Fixture test | Should |
| NFR-PERF-006 | Import validation for a {{FILE_SIZE}} package shall complete within {{TARGET}}. | {{TARGET}} | {{ENVIRONMENT}} | Integration test | Should |

### Performance budgets

| Resource | Budget | Notes |
|---|---:|---|
| Initial JavaScript | {{BUDGET}} | {{NOTES}} |
| Initial CSS | {{BUDGET}} | {{NOTES}} |
| Bundled content | {{BUDGET}} | Keep licensed content separate and reviewable. |
| Persistent workspace | {{BUDGET}} | Include representative long-running adventure. |

## 7. Reliability and Data Integrity

| ID | Requirement | Target / behavior | Verification | Priority |
|---|---|---|---|---:|
| NFR-REL-001 | Committed user changes shall survive normal reload and browser restart. | 100% in persistence acceptance suite | Integration / e2e | Must |
| NFR-REL-002 | Failed saves shall not be reported as successful. | No false-success state | Fault-injection test | Must |
| NFR-REL-003 | Import validation shall not mutate current valid data before confirmation and successful commit. | Existing state unchanged on failure | Integration test | Must |
| NFR-REL-004 | Completed roll records shall not be silently recalculated after rules or code changes. | Stored result remains stable | Migration test | Must |
| NFR-REL-005 | Schema migration shall be deterministic and idempotent where designed. | Same input produces equivalent output | Unit / integration | Must |
| NFR-REL-006 | Destructive actions shall require explicit confirmation and identify scope. | No accidental destructive mutation | E2E / manual | Must |
| NFR-REL-007 | Application reset shall remove only application-owned data. | Unrelated origin data is untouched | Integration test | Must |
| NFR-REL-008 | {{RELIABILITY_REQUIREMENT}} | {{TARGET}} | {{METHOD}} | {{PRIORITY}} |

## 8. Availability and Offline Behavior

| ID | Requirement | Target / behavior | Verification | Priority |
|---|---|---|---|---:|
| NFR-AVL-001 | Ordinary play shall {{WORK_OFFLINE_OR_REQUIRE_NETWORK}}. | {{TARGET}} | Offline browser test | Must / Should |
| NFR-AVL-002 | Network-dependent features shall show clear unavailable and retry states. | No indefinite spinner | Manual / component test | Must if applicable |
| NFR-AVL-003 | Local-only storage shall be described accurately and shall not imply cloud backup. | Plain-language notice | Content / UX review | Must |
| NFR-AVL-004 | Recovery guidance shall remain accessible when stored data cannot be loaded. | User can reach backup/reset guidance | E2E | Must |

## 9. Security

### 9.1 Security context

Protected assets:

- Private adventure and event log data.
- Imported/exported backup files.
- Application integrity and content manifests.
- Credentials or tokens, if accounts or connectors are introduced.

### 9.2 Requirements

| ID | Requirement | Threat / rationale | Verification | Priority |
|---|---|---|---|---:|
| NFR-SEC-001 | User-authored content shall be rendered safely without executing injected script or markup. | XSS | Automated and manual security test | Must |
| NFR-SEC-002 | Imported files shall be parsed as data and validated before use. | Malicious / malformed import | Unit / integration | Must |
| NFR-SEC-003 | Exported data shall not contain secrets or unrelated browser data. | Data exposure | Export inspection | Must |
| NFR-SEC-004 | Dependencies shall be reviewed for known high-severity vulnerabilities before release. | Supply chain | Audit / review | Must |
| NFR-SEC-005 | Production builds shall not expose debug secrets, source credentials, or development endpoints. | Secret leakage | Build inspection | Must |
| NFR-SEC-006 | External links shall use safe navigation behavior where appropriate. | Tabnabbing / unsafe redirect | Component review | Should |
| NFR-SEC-007 | Account-based data, if implemented, shall be isolated by authenticated owner. | Unauthorized access | Authorization tests | Must if applicable |
| NFR-SEC-008 | {{SECURITY_REQUIREMENT}} | {{THREAT}} | {{METHOD}} | {{PRIORITY}} |

### 9.3 Security exclusions / future work

- {{EXCLUSION_OR_LATER_CONTROL}}

## 10. Privacy

| ID | Requirement | Target / behavior | Verification | Priority |
|---|---|---|---|---:|
| NFR-PRIV-001 | Collect only data necessary for the documented product workflow. | No undeclared data collection | Data-flow review | Must |
| NFR-PRIV-002 | Private user-authored content shall not be used for marketing, examples, analytics, or training without explicit permission. | Default private | Policy / code review | Must |
| NFR-PRIV-003 | Analytics shall be disabled by default unless separately approved and documented. | No hidden telemetry | Network inspection | Must |
| NFR-PRIV-004 | Storage location and backup limitations shall be explained in plain language. | Notice is discoverable | UX review | Must |
| NFR-PRIV-005 | Export shall clearly indicate that files may contain private adventure notes. | Warning before / during export | UX test | Should |
| NFR-PRIV-006 | Deletion and reset behavior shall state what is removed and what may remain in user-controlled backups. | Accurate notice | Content / UX review | Must |

## 11. Accessibility

Target standard: **{{WCAG_VERSION_AND_LEVEL}}**

| ID | Requirement | Target | Verification | Priority |
|---|---|---|---|---:|
| NFR-A11Y-001 | Core workflows shall be keyboard operable. | All required actions | Keyboard test | Must |
| NFR-A11Y-002 | Focus order and dialog focus shall be predictable. | No focus traps or loss | Manual / component | Must |
| NFR-A11Y-003 | Inputs shall have accessible labels and associated errors. | 100% of required forms | Automated / manual | Must |
| NFR-A11Y-004 | Result and status meaning shall not depend on color alone. | Icons/text/state included | Visual review | Must |
| NFR-A11Y-005 | Text and UI contrast shall meet {{STANDARD}}. | {{RATIO_OR_STANDARD}} | Automated / manual | Must |
| NFR-A11Y-006 | Dynamic roll, save, import, and error updates shall be announced where appropriate. | Screen-reader smoke test passes | Manual | Should |
| NFR-A11Y-007 | Touch targets shall meet {{TARGET_SIZE}} where practical. | {{TARGET}} | Mobile review | Should |
| NFR-A11Y-008 | Reduced-motion preferences shall be respected. | No essential motion | Browser preference test | Should |

## 12. Compatibility and Responsive Support

### Supported environments

| Platform | Browser / version policy | Priority | Notes |
|---|---|---:|---|
| Desktop | Chromium current and previous major | Must | {{NOTES}} |
| Desktop | Firefox current and previous major | Should | {{NOTES}} |
| Mobile | Chromium-based current | Should / Must | {{NOTES}} |
| Mobile | Safari current | Should before public release | {{NOTES}} |
| Tablet | Representative responsive widths | Should | {{NOTES}} |

### Requirements

| ID | Requirement | Verification | Priority |
|---|---|---|---:|
| NFR-COMP-001 | Core workflows shall work at {{MIN_WIDTH}} through {{MAX_WIDTH}} without clipped required controls. | Responsive test matrix | Must |
| NFR-COMP-002 | Required behavior shall not depend on hover. | Mobile / keyboard test | Must |
| NFR-COMP-003 | Stored data shall remain compatible across supported browser updates, subject to platform storage limits. | Migration / reload test | Should |
| NFR-COMP-004 | Unsupported environments shall fail gracefully or display documented limitations. | Manual test | Should |

## 13. Usability

| ID | Requirement | Target | Verification | Priority |
|---|---|---|---|---:|
| NFR-USE-001 | A new user shall complete {{CORE_ONBOARDING_FLOW}} without external instruction. | {{SUCCESS_RATE_OR_TEST_TARGET}} | Moderated playtest | Should |
| NFR-USE-002 | A returning user shall identify active adventure/session context and next likely action within {{TARGET}}. | {{TARGET}} | Playtest | Should |
| NFR-USE-003 | Common actions shall require no more than {{COUNT}} navigation transitions from the active play view. | {{TARGET}} | UX review | Should |
| NFR-USE-004 | Errors shall explain what happened, whether data changed, and the next recovery action. | All release-blocking errors | Content / QA review | Must |
| NFR-USE-005 | The product shall avoid forced narrative text and preserve user interpretation. | No mandatory authored consequence | Acceptance test | Must |

## 14. Maintainability and Testability

| ID | Requirement | Target / behavior | Verification | Priority |
|---|---|---|---|---:|
| NFR-MAINT-001 | Rules calculations shall be isolated from UI rendering. | Pure/testable domain functions | Architecture / unit tests | Must |
| NFR-MAINT-002 | Persisted schema versions and migrations shall be explicit. | No implicit breaking migration | Code / test review | Must |
| NFR-MAINT-003 | New feature modules shall follow documented project structure and naming. | Consistent repository layout | Code review | Should |
| NFR-MAINT-004 | Must requirements shall map to automated or manual acceptance evidence. | Traceability complete | Test-plan review | Must |
| NFR-MAINT-005 | Build, test, lint/static check, and format commands shall be documented and reproducible. | Clean checkout passes | CI / local verification | Must |
| NFR-MAINT-006 | Bundled content shall be stored separately from application source logic. | Reviewable content files/manifests | Repository review | Must |
| NFR-MAINT-007 | {{MAINTAINABILITY_REQUIREMENT}} | {{TARGET}} | {{METHOD}} | {{PRIORITY}} |

## 15. Observability and Diagnostics

| ID | Requirement | Target / behavior | Verification | Priority |
|---|---|---|---|---:|
| NFR-OBS-001 | User-facing failures shall include actionable context without exposing sensitive data. | Clear error + recovery | Fault test | Must |
| NFR-OBS-002 | Development diagnostics shall identify failing persistence, migration, import, and rules operations. | Structured development logs | Review / test | Should |
| NFR-OBS-003 | Production diagnostics shall not log private event log content or full imported backups by default. | No sensitive logging | Log inspection | Must |
| NFR-OBS-004 | Release builds shall expose application and schema version in a support-accessible location. | Version visible | Manual test | Should |
| NFR-OBS-005 | {{OBSERVABILITY_REQUIREMENT}} | {{TARGET}} | {{METHOD}} | {{PRIORITY}} |

## 16. Backup, Recovery, Migration, and Portability

| ID | Requirement | Target / behavior | Verification | Priority |
|---|---|---|---|---:|
| NFR-DR-001 | Export packages shall be versioned and self-identifying. | Schema version and export timestamp present | Export test | Must if export is in scope |
| NFR-DR-002 | Invalid imports shall make no changes to valid current data. | Atomic validation / commit | Integration test | Must if import is in scope |
| NFR-DR-003 | Supported earlier saves shall migrate without losing required records. | Fixture equivalence | Migration tests | Must |
| NFR-DR-004 | Unsupported or corrupted data shall produce a recovery path and preserve recoverable evidence where practical. | No silent reset | E2E / fault test | Must |
| NFR-DR-005 | Exported data shall use documented, portable encoding and date formats. | UTF-8 / ISO dates / documented JSON | Inspection | Must |
| NFR-DR-006 | Restore or replacement shall require explicit confirmation. | No accidental overwrite | E2E | Must |

## 17. Content and Licensing Quality Controls

| ID | Requirement | Target / behavior | Verification | Priority |
|---|---|---|---|---:|
| NFR-LIC-001 | Every bundled content item shall have provenance metadata. | 100% inventory coverage | Manifest validation | Must |
| NFR-LIC-002 | Unknown and restricted content shall be absent from release builds. | Zero blocked entries | Build / release check | Must |
| NFR-LIC-003 | Attribution and unofficial-product notices shall be present and readable. | Required locations pass review | Manual / content test | Must |
| NFR-LIC-004 | Official visual trade dress shall not be copied. | Independent design review passes | Review | Must |
| NFR-LIC-005 | Commercial builds shall exclude non-commercial-only content unless separately permitted. | Commercial gate passes | Manifest / legal review | Must |

## 18. Build, Release, and Operations

| ID | Requirement | Target / behavior | Verification | Priority |
|---|---|---|---|---:|
| NFR-OPS-001 | A clean checkout shall install and build using documented commands. | CI and local verification pass | CI | Must |
| NFR-OPS-002 | Release artifacts shall be reproducible from committed source and lock files. | Same commit produces equivalent artifact | CI / review | Should |
| NFR-OPS-003 | Environment-specific values shall be separated from source code. | No production secrets in repository | Review | Must |
| NFR-OPS-004 | Release candidates shall pass the documented smoke test. | 100% Must smoke cases pass | QA | Must |
| NFR-OPS-005 | Rollback or disablement strategy shall be documented for release-critical changes. | Procedure exists | Release review | Should |
| NFR-OPS-006 | {{OPERATIONS_REQUIREMENT}} | {{TARGET}} | {{METHOD}} | {{PRIORITY}} |

## 19. Traceability and Verification

| NFR | Functional / product requirement | Test / evidence | Owner | Status |
|---|---|---|---|---|
| NFR-{{ID}} | {{REQUIREMENT_ID}} | {{TEST_OR_REVIEW}} | {{OWNER}} | {{STATUS}} |
| NFR-{{ID}} | {{REQUIREMENT_ID}} | {{TEST_OR_REVIEW}} | {{OWNER}} | {{STATUS}} |

## 20. Acceptance Criteria

- [ ] Every Must NFR has a measurable target or explicit review method.
- [ ] Performance targets use documented environments and representative data.
- [ ] Save, migration, import, destructive action, and recovery behavior is verified.
- [ ] Security and privacy requirements cover user-authored content and backup files.
- [ ] Accessibility requirements match the agreed standard and core workflows.
- [ ] Supported browsers and responsive widths are explicit.
- [ ] Build and test commands pass from a clean checkout.
- [ ] Content provenance and licensing controls pass release validation.
- [ ] No blocker or critical quality defects remain open.

## 21. Open Questions

| ID | Question | Owner | Decision point | Status |
|---|---|---|---|---|
| OQ-001 | {{QUESTION}} | {{OWNER}} | {{DATE_OR_MILESTONE}} | Open |
| OQ-002 | {{QUESTION}} | {{OWNER}} | {{DATE_OR_MILESTONE}} | Open |

## 22. Approval

| Role | Name | Decision | Date | Notes |
|---|---|---|---|---|
| Product Owner | {{NAME}} | Pending / Approved / Rejected | {{DATE}} | {{NOTES}} |
| Technical Lead | {{NAME}} | Pending / Approved / Rejected | {{DATE}} | {{NOTES}} |
| QA / Release Reviewer | {{NAME}} | Pending / Approved / Rejected | {{DATE}} | {{NOTES}} |
| UX / Accessibility Reviewer | {{NAME}} | Pending / Approved / Rejected | {{DATE}} | {{NOTES}} |
| Content / Licensing Reviewer | {{NAME}} | Pending / Approved / Rejected | {{DATE}} | {{NOTES}} |
