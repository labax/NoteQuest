# Data Model / Domain Model Specification

## {{PRODUCT_OR_RELEASE_NAME}}

*Version {{VERSION}} | {{STATUS}} | Prepared for the Ironsworn Project*

| Field | Value |
|---|---|
| Document owner | {{OWNER}} |
| Related documents | {{RELATED_DOCUMENTS}} |
| Product scope | {{SCOPE}} |
| Primary audience | Product owner, developer, UX designer, QA/tester, and content/licensing reviewer |
| Status | {{STATUS}} |
| Last updated | {{DATE}} |

---

## Contents

1. Purpose
2. Source Basis
3. Modeling Context
4. Data Model Scope
5. Modeling Principles
6. Bounded Contexts
7. Domain Overview
8. Entity Relationship Summary
9. Core Entities
10. Value Objects
11. Enumeration Catalogue
12. Validation Rules and Invariants
13. Lifecycle and State Transitions
14. Persistence and Storage Guidance
15. Content Provenance and Licensing Data
16. Import, Export, and Migration
17. Audit, History, and Journal Linkage
18. Deletion, Archival, and Recovery
19. Traceability
20. Acceptance Criteria
21. Open Questions
22. Approval

---

## 1. Purpose

{{EXPLAIN_WHICH_LOGICAL_DATA_STRUCTURES_RELATIONSHIPS_AND_INVARIANTS_THIS_DOCUMENT_DEFINES}}

This specification is implementation-neutral unless a section explicitly records an approved storage or architecture decision.

## 2. Source Basis

- {{BUSINESS_OR_PRODUCT_REQUIREMENTS}}
- {{FUNCTIONAL_REQUIREMENTS}}
- {{RULES_ENGINE_REQUIREMENTS}}
- {{UX_REQUIREMENTS}}
- {{CONTENT_AND_LICENSING_REQUIREMENTS}}

## 3. Modeling Context

{{DESCRIBE_THE_CURRENT_PRODUCT_MODEL_AND_THE_FUTURE_CAPABILITIES_THE_MODEL_MUST_NOT_BLOCK}}

Examples may include multiple campaigns, multiple characters, session history, custom content, co-op play, export, and migration.

## 4. Data Model Scope

### 4.1 In scope

| Area | Data support |
|---|---|
| {{AREA}} | {{SUPPORT}} |
| {{AREA}} | {{SUPPORT}} |

### 4.2 Out of scope

| Area | Exclusion |
|---|---|
| {{AREA}} | {{EXCLUSION}} |
| {{AREA}} | {{EXCLUSION}} |

## 5. Modeling Principles

| ID | Principle | Meaning |
|---|---|---|
| DMP-001 | MVP-simple, future-safe | The first interface may simplify concepts that remain explicit in the domain. |
| DMP-002 | Fiction-first data | User-authored interpretation is stored separately from mechanical results. |
| DMP-003 | Stable identity | Persisted entities use stable IDs, not array positions or display names. |
| DMP-004 | Immutable completed results | Saved rolls and imported snapshots are not silently recalculated. |
| DMP-005 | Manual override support | Overrides are explicit and do not erase the standard derived value. |
| DMP-006 | Provenance by default | Bundled, imported, and user-authored content identify their source category. |
| DMP-007 | Soft deletion preferred | Valuable user-created records are archived before hard deletion where practical. |
| DMP-008 | Exportable by design | Persisted data serializes into versioned, validated packages. |
| DMP-009 | Rules / UI separation | Domain state is not coupled to view-only state or rendering components. |
| DMP-010 | {{PRINCIPLE}} | {{MEANING}} |

## 6. Bounded Contexts

| Context | Responsibility | Primary entities / services |
|---|---|---|
| {{CONTEXT}} | {{RESPONSIBILITY}} | {{ENTITIES}} |
| {{CONTEXT}} | {{RESPONSIBILITY}} | {{ENTITIES}} |

Suggested contexts:

- Workspace / ownership.
- Campaign and session.
- Character.
- Progress and vows.
- Rolls and rules results.
- Oracles and bundled content.
- Journal and activity history.
- Content / licensing.
- Import / export / migration.

## 7. Domain Overview

### 7.1 Recommended hierarchy

```text
{{TOP_LEVEL_OWNER}}
  └── {{CONTAINER}}
        ├── {{ENTITY}}
        ├── {{ENTITY}}
        └── {{ENTITY}}
```

### 7.2 MVP exposure versus domain capability

| Domain capability | Current UI exposure | Future use |
|---|---|---|
| {{CAPABILITY}} | {{EXPOSURE}} | {{FUTURE_USE}} |
| {{CAPABILITY}} | {{EXPOSURE}} | {{FUTURE_USE}} |

## 8. Entity Relationship Summary

```mermaid
erDiagram
    {{ENTITY_A}} ||--o{ {{ENTITY_B}} : {{RELATIONSHIP}}
    {{ENTITY_B}} ||--o| {{ENTITY_C}} : {{RELATIONSHIP}}
```

| Relationship | Cardinality | Ownership / deletion behavior | Notes |
|---|---:|---|---|
| {{ENTITY_A}} to {{ENTITY_B}} | 1-to-many | {{BEHAVIOR}} | {{NOTES}} |
| {{ENTITY_B}} to {{ENTITY_C}} | {{CARDINALITY}} | {{BEHAVIOR}} | {{NOTES}} |

## 9. Core Entities

Repeat this structure for each entity.

### 9.1 {{ENTITY_NAME}}

**Purpose:** {{PURPOSE}}

**Aggregate / owner:** {{OWNER_ENTITY_OR_ROOT}}

| Field | Type | Required | Default | Priority | Notes |
|---|---|---:|---|---|---|
| id | UUID / string | Yes | Generated | Must | Stable primary ID. |
| {{fieldName}} | {{TYPE}} | Yes / No | {{DEFAULT}} | Must / Should / Could | {{NOTES}} |
| createdAt | datetime | Yes | Current time | Must | Creation timestamp. |
| updatedAt | datetime | Yes | Current time | Must | Last persisted update. |
| status | enum {{STATUS_ENUM}} | Yes | {{DEFAULT}} | Should | Archive / lifecycle state. |

#### Derived fields

| Field | Formula / source | Persisted or calculated | Override behavior |
|---|---|---|---|
| {{DERIVED_FIELD}} | {{FORMULA}} | {{MODE}} | {{OVERRIDE}} |

#### Validation

- {{VALIDATION_RULE_1}}
- {{VALIDATION_RULE_2}}

#### Ownership and lifecycle

- Created when: {{TRIGGER}}
- Archived when: {{TRIGGER}}
- Deleted when: {{TRIGGER_AND_CONFIRMATION}}
- Child records: {{CASCADE_OR_PRESERVE_BEHAVIOR}}

## 10. Value Objects

### 10.1 {{VALUE_OBJECT}}

**Purpose:** {{PURPOSE}}

| Field | Type | Validation |
|---|---|---|
| {{FIELD}} | {{TYPE}} | {{VALIDATION}} |
| {{FIELD}} | {{TYPE}} | {{VALIDATION}} |

**Equality:** {{HOW_EQUALITY_IS_DETERMINED}}

**Serialization:** {{FORMAT}}

Suggested value objects:

- Stat block.
- Dice result.
- Progress value.
- Momentum state.
- Content provenance reference.
- Date range or session duration.
- Export manifest metadata.

## 11. Enumeration Catalogue

### 11.1 {{ENUM_NAME}}

| Value | Meaning | Allowed transitions / use |
|---|---|---|
| `{{value}}` | {{MEANING}} | {{USE}} |
| `{{value}}` | {{MEANING}} | {{USE}} |

Rules:

- Persist canonical machine values, not translated labels.
- Do not reuse one enum for unrelated lifecycle concepts.
- Unknown imported enum values must fail validation or follow an explicit compatibility rule.

## 12. Validation Rules and Invariants

| ID | Entity / value | Invariant | Enforcement point | Error / recovery behavior |
|---|---|---|---|---|
| INV-001 | {{OBJECT}} | {{INVARIANT}} | Domain / persistence / import | {{BEHAVIOR}} |
| INV-002 | {{OBJECT}} | {{INVARIANT}} | {{POINT}} | {{BEHAVIOR}} |

Include:

- Numeric ranges and defaults.
- Cross-field rules.
- Ownership and foreign-key rules.
- Unique active-record constraints.
- Progress / roll immutability.
- Content source and license requirements.
- Timestamp and schema-version requirements.

## 13. Lifecycle and State Transitions

### 13.1 {{ENTITY_OR_AGGREGATE}}

```mermaid
stateDiagram-v2
    [*] --> {{INITIAL}}
    {{INITIAL}} --> {{ACTIVE}}: {{TRIGGER}}
    {{ACTIVE}} --> {{ARCHIVED}}: {{TRIGGER}}
    {{ARCHIVED}} --> {{ACTIVE}}: {{RESTORE_TRIGGER}}
    {{ARCHIVED}} --> {{DELETED}}: {{CONFIRMED_TRIGGER}}
```

| From | Event | Guard | To | Data side effects |
|---|---|---|---|---|
| {{FROM}} | {{EVENT}} | {{GUARD}} | {{TO}} | {{SIDE_EFFECTS}} |

## 14. Persistence and Storage Guidance

| Concern | Requirement / decision |
|---|---|
| Storage mode | {{LOCAL_ACCOUNT_SERVER_OR_HYBRID}} |
| Transaction boundary | {{BOUNDARY}} |
| Autosave | {{BEHAVIOR}} |
| Concurrency | {{BEHAVIOR_OR_NOT_APPLICABLE}} |
| Schema version | {{VERSION_STRATEGY}} |
| Maximum practical size | {{LIMIT_OR_TEST_TARGET}} |
| Sensitive data | {{HANDLING}} |
| Offline behavior | {{BEHAVIOR}} |

Do not store UI-only state inside durable domain records unless it is required to resume a user workflow.

## 15. Content Provenance and Licensing Data

### 15.1 Minimum provenance fields

| Field | Required | Notes |
|---|---:|---|
| sourceCategory | Yes | Official, SRD-derived, project-original, user-authored, third-party, unknown, or restricted. |
| sourceName | Yes for bundled/imported content | Human-readable source. |
| sourceVersion | Should | Version or retrieval date. |
| licenseId | Yes for bundled/imported content | Canonical license identifier. |
| attribution | Yes when required | Display-ready attribution text or reference. |
| approvalStatus | Yes for bundled content | Draft, approved, blocked, or restricted. |
| contentHash | Should | Detects changed reviewed content. |

### 15.2 Separation rules

- User-authored content must not be mislabeled as official.
- Unknown or restricted bundled content must not be included in release builds.
- Rules-engine mechanics must not depend on copying official prose into domain records.
- Art, icons, and trade dress require separate approval from text content.

## 16. Import, Export, and Migration

### 16.1 Export package

```json
{
  "schemaVersion": "{{SCHEMA_VERSION}}",
  "exportedAt": "{{ISO_DATETIME}}",
  "scope": "{{SCOPE}}",
  "manifest": {},
  "data": {}
}
```

| Requirement | Definition |
|---|---|
| Scope | {{CAMPAIGN_WORKSPACE_OR_RECORD_SCOPE}} |
| Completeness | {{REQUIRED_RECORDS}} |
| Ordering | {{STABLE_ORDERING_IF_NEEDED}} |
| Privacy warning | {{WARNING}} |
| Content inclusion | {{BUNDLED_VS_REFERENCED_CONTENT_POSITION}} |

### 16.2 Import workflow

1. Parse without mutating current data.
2. Validate schema and required fields.
3. Run supported migrations in memory.
4. Produce an import preview and warnings.
5. Require confirmation for replacement or merge.
6. Commit atomically.
7. Retain existing valid data on failure.

### 16.3 Migration table

| From version | To version | Migration | Reversible | Failure behavior |
|---|---|---|---:|---|
| {{FROM}} | {{TO}} | {{DESCRIPTION}} | Yes / No | {{BEHAVIOR}} |

## 17. Audit, History, and Journal Linkage

| Record type | History expectation | Linkage |
|---|---|---|
| Roll result | Immutable result plus explicit amendment if corrected. | Character, campaign, session, journal entry. |
| Progress event | Append-only change reason where implemented. | Progress track and optional vow / session. |
| Journal entry | User-editable with updated timestamp. | Campaign, session, vow, track, roll, or oracle result. |
| Import / migration | Import report and schema versions. | Workspace or campaign. |
| Destructive action | Confirmation and optional recovery record. | Affected aggregate. |

## 18. Deletion, Archival, and Recovery

| Object | Default action | Restore supported | Hard-delete condition | Child behavior |
|---|---|---:|---|---|
| {{OBJECT}} | Archive / delete | Yes / No | {{CONDITION}} | {{BEHAVIOR}} |
| {{OBJECT}} | {{ACTION}} | {{SUPPORTED}} | {{CONDITION}} | {{BEHAVIOR}} |

Rules:

- Destructive actions identify the exact scope.
- Application reset removes only application-owned storage.
- Imports do not overwrite valid data before successful validation and confirmation.
- Recoverable data should be preserved when stored state is partially invalid.

## 19. Traceability

| Entity / invariant | Functional requirement | Rules requirement | UX flow | Acceptance test |
|---|---|---|---|---|
| {{ENTITY_OR_INV}} | {{FR_ID}} | {{RER_ID_OR_NA}} | {{UX_ID}} | {{TEST_ID}} |

## 20. Acceptance Criteria

- [ ] Every persisted aggregate has a stable ID and ownership boundary.
- [ ] Required relationships and deletion behavior are explicit.
- [ ] Derived values and override behavior are documented.
- [ ] Validation rules are testable at domain and import boundaries.
- [ ] Completed rolls and historical events are not silently recalculated.
- [ ] Export packages are versioned and import validation is non-destructive.
- [ ] User-authored content is separate from bundled content.
- [ ] Bundled content carries source, license, attribution, and approval metadata.
- [ ] Recovery behavior exists for invalid or incompatible persisted data.

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
| QA Reviewer | {{NAME}} | Pending / Approved / Rejected | {{DATE}} | {{NOTES}} |
| Content / Licensing Reviewer | {{NAME}} | Pending / Approved / Rejected | {{DATE}} | {{NOTES}} |
