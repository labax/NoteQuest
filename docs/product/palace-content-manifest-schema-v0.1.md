# Palace Content Manifest Schema v0.1

| Field | Value |
|---|---|
| Document ID | `palace-content-manifest-schema-v0.1` |
| Scope | Palace content manifest foundation for M3 implementation stories |
| Status | Draft implementation baseline |
| Related story | STORY-M3-001 / issue #58 |

## 1. Purpose

The Palace content manifest is the structured, public, runtime-facing index for Palace content definitions. It records stable identifiers, content versions, source references, provenance, and review status without publishing confidential rights correspondence or copying unapproved source expression.

This schema is a foundation for later M3 stories. It does not transcribe Palace tables, validate every range, implement the full validation engine, add final notices, or create manifests for other dungeon types.

## 2. Rights and content-safety rules

Manifest entries must follow the approved content/licensing baseline:

- Store structured identifiers, references, mechanics metadata, and project-original labels rather than source prose.
- Keep public fields non-confidential. Private permission correspondence and signatures stay outside the public manifest.
- Mark exact source prose, source artwork, layout, screenshots, logos, and trade dress as absent unless a later item-level approval explicitly changes the rule.
- Represent unreviewed, blocked, or uncertain content with an approval state instead of inventing replacement content.

## 3. Top-level manifest shape

| Field | Type | Required | Use |
|---|---|---:|---|
| `schemaVersion` | literal string | Yes | Schema identifier, currently `palace-content-manifest.schema.v0.1`. |
| `packageId` | literal string | Yes | Content package identifier, currently `palace`. |
| `contentVersion` | semantic version string | Yes | Version of the Palace content package for deterministic saves, tests, and simulation evidence. |
| `rulesVersion` | string | Yes | Rules specification version the manifest targets. |
| `generatedAt` | ISO-8601 string | Yes | Build or authoring timestamp for traceability. |
| `entries` | array | Yes | Structured Palace manifest entries. |

## 4. Entry shape

| Field | Type | Required | Use |
|---|---|---:|---|
| `id` | stable string | Yes | Deterministic content ID, using the `palace.` prefix. |
| `contentType` | enum | Yes | Section 12 `contentType` equivalent: `definition`, `table`, `row`, `prose`, `visual`, `font`, `icon`, `dependency`, `notice`, `fixture`, or `documentation-asset`. |
| `kind` | enum | Yes | Runtime entry kind: `table`, `table-row`, `range`, `mechanic-reference`, or `placeholder`. |
| `version` | semantic version string | Yes | Section 12 `contentVersion` equivalent for deterministic fixtures and migrations. |
| `label` | project-authored string | Yes | Internal/public-safe label; do not copy official prose. |
| `parentId` | content ID | No | Parent table or grouping entry for rows/ranges. |
| `range` | object | No | Future dice/range validation metadata. |
| `references` | content ID array | No | Links to other manifest entries without duplicating definitions. |
| `tags` | string array | Yes | Search, review, and package metadata. |
| `structuredDefinition` | object | Yes | Runtime-safe structured data. Later stories may specialize this by entry kind. |
| `provenance` | object | Yes | Source, rights, and content-safety metadata. |
| `review` | object | Yes | Approval state and release eligibility metadata. |

## 5. Provenance shape

Each entry has an explicit `provenance` object aligned to Content & Licensing Requirements Section 12. Required values that are not yet available in STORY-M3-001 must be represented with public-safe `null`, `pending`, `not-applicable`, or deferred references rather than hidden in prose.

| Field | Section 12 equivalent | Required for release content | Placeholder / blocked / unknown handling | Use |
|---|---|---:|---|---|
| `origin` | Supporting origin | Yes | Use `project-original`, `unknown`, or `derived` as appropriate. | Coarse runtime provenance category. |
| `sourceCategory` | `sourceCategory` | Yes | Use `project_placeholder`, `unknown`, or `restricted` rather than selecting unreviewed source content. | Controlled category from the licensing baseline. |
| `sourceName` | `sourceName` | Yes | Public-safe project/source label. | Human-readable source without confidential correspondence. |
| `sourceLocation` | `sourceLocation` | Yes for source-derived content | `null` only when not applicable; project placeholders may point to the project file/story. | Public-safe page/table/record/file locator. |
| `sourceEditionVersion` | `sourceEditionVersion` | Yes | Use package version, reviewed date, or placeholder version. | Edition, package, asset, or reviewed version. |
| `sourceReferences` | Source references | Yes | Use placeholder or controlled evidence references. | Structured references without copied source table text. |
| `authorRightsHolder` | `authorRightsHolder` | Yes where known | Project placeholder uses the project owner label. | Creator, rights holder, vendor, or project owner. |
| `permissionLicenseId` | `permissionLicenseId` | Yes | Use project-original or pending/blocked IDs when not approved. | Canonical permission, licence, contract, or project-original identifier. |
| `rightsBasis` | Rights/licence basis | Yes | Public-safe summary only. | Explains why the item can be held in this state. |
| `evidenceReference` | `evidenceLocation` | Yes for bundled non-original content | Public ID may be present while private location is `null`; confidential details stay outside the manifest. | Non-confidential evidence ID/location metadata. |
| `permittedReleaseModes` | `permittedReleaseModes` | Yes | Empty or internal-only for blocked/unapproved placeholders. | Internal prototype, closed playtest, public free Core MVP, or future commercial compatibility. |
| `restrictions` | `restrictions` | Yes | Must record blockers such as not public-release eligible or replace before release. | Verbatim, visual, attribution, expiry, modification, redistribution, or other constraints. |
| `attributionRequired` | Attribution requirement | Yes | `false` only when no notice is required. | Whether an approved notice must be displayed. |
| `attributionNoticeId` | `attributionNoticeId` | When required | `null` when not applicable or pending. | Link to controlled notice wording. |
| `noticeLocations` | `noticeLocations` | When required | Empty when no notice applies. | About/Credits, NOTICE, manifest, release listing, export package, or release evidence package. |
| `modifications` | `modifications` | Should | Record placeholder/original status or pending normalisation policy. | Paraphrase, transcription, correction, normalisation, derived asset, or original implementation notes. |
| `compatibilityPolicy` | `compatibilityPolicy` | For saved definitions | Use `not-applicable-placeholder` or `pending-content-hash-story` when not applicable yet. | Defines how prior saves/history resolve the item/version. |
| `contentHash` | `contentHash` | Yes for release items | Use a deferred `pending` or `not-applicable` object until #60 records canonical hashes. | Future SHA-256/canonicalisation metadata. |
| `supersedes` | `supersedes` | When applicable | Empty array when not applicable. | Prior content IDs replaced by this entry. |
| `confidentialRightsEvidence` | Privacy-aware evidence control | Yes | Always `excluded-from-public-manifest` in public manifests. | Confirms private correspondence is not exposed. |
| `containsExactSourceProse` | Exact prose restriction | Yes | Must remain `false` unless a later exact-text approval exists. | Safety flag. |
| `containsSourceArtwork` | Visual restriction | Yes | Must remain `false` unless separate artwork approval exists. | Safety flag. |
| `containsTradeDress` | Trade-dress restriction | Yes | Must remain `false`. | Safety flag. |

`sourceReferences` may identify the kind of reference, source ID, public citation label, locator, source version, and notes. They should be specific enough to support later review and validation while avoiding copied table text.

`contentHash` records the integrity state for each manifest entry. Selected public-release Palace entries must use `status: recorded`, `algorithm: SHA-256`, `canonicalization: RFC-8785`, and a `sha256:<hex>` value generated from the project canonical JSON payload. Draft, rejected, or internal-only entries may defer hashes only when their review and release-mode metadata make the non-release state explicit.

## 6. Review and approval states

Allowed `approvalState` values are:

| State | Meaning |
|---|---|
| `selected` | Selected for implementation/review, but still subject to release gates. |
| `draft` | Project-authored or incomplete placeholder data under active drafting. |
| `blocked` | Known not eligible for use until the recorded blocker is resolved. |
| `unknown` | Provenance or approval is not established. |
| `review-pending` | Awaiting content, rights, rules, QA, or product review. |

The `review` object also records optional reviewer role, public-safe reviewer reference, review date, public-safe decision reference, blocked reason, and `publicReleaseEligible`. Blocked, unknown, draft, and review-pending entries are not release eligible even if malformed data sets `publicReleaseEligible` to `true`; later validation work should fail those combinations. Selected release items must also have complete provenance, notice, compatibility, and hash metadata before release gates can pass.

## 7. Example placeholder entry

The implementation includes one project-original placeholder manifest entry. It demonstrates the schema fields and deterministic IDs without official source prose, official table rows, art, screenshots, layout, logo, or trade dress.

Future M3 stories should replace or extend placeholder entries only with approved structured definitions, stable row/range IDs, and provenance metadata that satisfies this schema.

## Content hash review workflow

Palace manifest entries that carry a recorded integrity hash use the project canonical JSON serializer over the `palace-manifest-entry-integrity-payload.v0.1` payload and hash the resulting UTF-8 bytes with SHA-256. The content package defines the integrity payload, validation types, and dependency-injected serializer/hasher interfaces; infrastructure or composition code supplies the canonical JSON and SHA-256 adapters. The stored value is formatted as `sha256:<64 lowercase hexadecimal characters>` and is intended as deterministic integrity evidence for validation, simulation, and release reporting.

Hash updates are required for selected public-release Palace content and must be reviewed with the content change that caused them. Reviewers should confirm that the changed fixture or manifest entry remains rights-safe, contains no unapproved official prose, table text, artwork, screenshots, layout, trade dress, or confidential permission evidence, and that the new checksum was generated from canonical JSON rather than ad hoc file bytes. A checksum change without a corresponding approved content change should be treated as an integrity failure rather than a routine update.

These hashes detect accidental or unauthorized manifest drift. They are not encryption, signatures, permission evidence, or release artifact signing.
