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
| `kind` | enum | Yes | `table`, `table-row`, `range`, `mechanic-reference`, or `placeholder`. |
| `version` | semantic version string | Yes | Entry-level version for deterministic fixtures and migrations. |
| `label` | project-authored string | Yes | Internal/public-safe label; do not copy official prose. |
| `parentId` | content ID | No | Parent table or grouping entry for rows/ranges. |
| `range` | object | No | Future dice/range validation metadata. |
| `references` | content ID array | No | Links to other manifest entries without duplicating definitions. |
| `tags` | string array | Yes | Search, review, and package metadata. |
| `structuredDefinition` | object | Yes | Runtime-safe structured data. Later stories may specialize this by entry kind. |
| `provenance` | object | Yes | Source, rights, and content-safety metadata. |
| `review` | object | Yes | Approval state and release eligibility metadata. |

## 5. Provenance shape

| Field | Type | Required | Use |
|---|---|---:|---|
| `origin` | enum | Yes | `approved-source`, `project-original`, `derived`, or `unknown`. |
| `rightsBasis` | string | Yes | Public-safe summary of the rights basis; no private correspondence. |
| `permissionReference` | string | Yes | Public-safe document, register, or evidence-index reference. |
| `attributionRequired` | boolean | Yes | Whether a later public notice/credits workflow must include attribution. |
| `confidentialRightsEvidence` | literal string | Yes | Always `excluded-from-public-manifest` in public manifest data. |
| `sourceReferences` | array | Yes | Public-safe references such as source edition/table identifiers, decision-register IDs, or project placeholder IDs. |
| `containsExactSourceProse` | boolean | Yes | Must remain `false` unless exact-text approval is later recorded. |
| `containsSourceArtwork` | boolean | Yes | Must remain `false` unless artwork approval is later recorded. |
| `containsTradeDress` | boolean | Yes | Must remain `false`; public manifests must not reproduce source layout/trade dress. |

`sourceReferences` may identify the kind of reference, source ID, public citation label, locator, source version, and notes. They should be specific enough to support later review and validation while avoiding copied table text.

## 6. Review and approval states

Allowed `approvalState` values are:

| State | Meaning |
|---|---|
| `selected` | Selected for implementation/review, but still subject to release gates. |
| `draft` | Project-authored or incomplete placeholder data under active drafting. |
| `blocked` | Known not eligible for use until the recorded blocker is resolved. |
| `unknown` | Provenance or approval is not established. |
| `review-pending` | Awaiting content, rights, rules, QA, or product review. |

The `review` object also records optional reviewer role, review date, public-safe decision reference, blocked reason, and `publicReleaseEligible`. Blocked, unknown, draft, and review-pending entries should set `publicReleaseEligible` to `false` until a later gate explicitly changes their status.

## 7. Example placeholder entry

The implementation includes one project-original placeholder manifest entry. It demonstrates the schema fields and deterministic IDs without official source prose, official table rows, art, screenshots, layout, logo, or trade dress.

Future M3 stories should replace or extend placeholder entries only with approved structured definitions, stable row/range IDs, and provenance metadata that satisfies this schema.
