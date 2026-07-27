# Product Profile Template

## Generic Game Adaptation Process

*Version 0.1 | Template | Prepared for reuse across rules-first game adaptation projects*

| Field | Value |
|---|---|
| Template owner | Product Owner |
| Process scope | Product-specific configuration for reusable game adaptation workflows |
| Related documents | Product-Agnostic Game Adaptation Process v0.1; Source Material Intake and Rights Matrix; Rules Extraction Taxonomy; Backlog Generation Playbook; Agent Task Template Standard |
| Primary audience | Product owner, rules designer, technical lead, UX designer, QA lead, content/licensing reviewer, operations owner, and implementation agents |
| Status | Draft template |
| Last updated | 2026-07-23 |

---

## Contents

1. [Purpose](#1-purpose)
2. [When to Create a Product Profile](#2-when-to-create-a-product-profile)
3. [How to Use This Template](#3-how-to-use-this-template)
4. [Profile Authority and Lifecycle](#4-profile-authority-and-lifecycle)
5. [Canonical Profile Block](#5-canonical-profile-block)
6. [Field Reference](#6-field-reference)
7. [Markdown Profile Template](#7-markdown-profile-template)
8. [Validation Rules](#8-validation-rules)
9. [Product Leakage Audit](#9-product-leakage-audit)
10. [Abbreviated Example](#10-abbreviated-example)
11. [Approval Checklist](#11-approval-checklist)

---

## 1. Purpose

A product profile captures the product-specific choices needed to apply the generic game adaptation process to one game, edition, ruleset, or release line.

The profile prevents reusable process documents, issue templates, Codex prompts, milestones, and review checklists from silently inheriting assumptions from a different product.

Use a product profile to define:

- the product name and source material being adapted;
- the authoritative source hierarchy;
- the rights and content policy for mechanics, tables, prose, art, branding, and third-party material;
- the release model, prototype names, milestone shape, and public release constraints;
- the rules domains and content modules expected for the product;
- the repository, branch, label, and issue workflow conventions;
- the implementation stack and runtime constraints;
- the quality gates required before implementation, merge, and release; and
- the open questions that must be resolved before downstream work depends on them.

A product profile is not a requirements document by itself. It is the configuration layer that tells generic templates and workflows what product they are serving.

---

## 2. When to Create a Product Profile

Create a product profile before generating product requirements, milestone epics, reusable task prompts, or implementation issues for a new game adaptation.

Create a separate profile when:

- adapting a different game;
- adapting a different edition or materially different rules release;
- creating a commercial release after a non-commercial prototype;
- introducing a new source supplement with separate rights constraints;
- splitting a product into separate public and private versions;
- changing the branch, release, hosting, or agent workflow model; or
- reusing templates from another project where product-specific terms may leak.

Do not rely on a product profile from another project unless the current product owner explicitly approves it as the controlling profile for the new work.

---

## 3. How to Use This Template

1. Copy the [Markdown Profile Template](#7-markdown-profile-template) into a new product-specific document.
2. Replace every placeholder wrapped in double braces, for example `{{PRODUCT_NAME}}`.
3. Delete or complete all instructional notes before approval.
4. Keep unknown values as `TBD` only when the downstream workflow can safely proceed without them.
5. Mark blockers explicitly as `Blocked`, `Deferred`, or `Requires approval`.
6. Record source and rights evidence locations without committing confidential correspondence or private personal data.
7. Run the [Product Leakage Audit](#9-product-leakage-audit) before using the profile to generate docs, issues, or prompts.
8. Re-approve the profile when a material field changes.

The canonical YAML block should be included near the top of each completed product profile. The human-readable sections may expand the same information, but they must not contradict the YAML block.

---

## 4. Profile Authority and Lifecycle

### 4.1 Authority

The product profile controls product-specific substitutions in generic process materials.

When the profile conflicts with a downstream generated artifact, the profile controls unless a later approved decision register or amendment explicitly supersedes it.

When the profile conflicts with source rights evidence, rights evidence controls and the profile must be corrected.

### 4.2 Lifecycle States

| State | Meaning | Allowed downstream use |
|---|---|---|
| Draft | Initial profile under construction | Discovery and planning only |
| Review | Profile is complete enough for stakeholder review | Template testing and dry-run backlog generation |
| Approved | Profile is accepted as the current product configuration | Requirements, backlog, issue, and prompt generation |
| Amended | Approved profile changed through a controlled update | New work follows the amended profile; older work needs impact review |
| Superseded | Replaced by a later profile or release profile | Historical reference only |

### 4.3 Minimum Approval Roles

| Concern | Required reviewer |
|---|---|
| Product identity, audience, release model, and scope | Product Owner |
| Source hierarchy and rules domains | Product Owner and Rules / Product Designer |
| Rights policy and public release constraints | Content / Licensing Reviewer |
| Repository, branch, CI, hosting, and implementation stack | Technical Lead |
| Quality gates and evidence model | QA / Test Lead |
| UX and accessibility defaults | UX / Accessibility Lead |

One person may hold multiple roles in a small project, but the approval record must state which concerns were reviewed.

---

## 5. Canonical Profile Block

Every completed product profile should include a canonical block in this shape.

```yaml
profile:
  id: "{{PROFILE_ID}}"
  product_name: "{{PRODUCT_NAME}}"
  product_short_name: "{{PRODUCT_SHORT_NAME}}"
  version: "0.1"
  status: "Draft"
  last_updated: "{{YYYY-MM-DD}}"
  owner: "{{PRODUCT_OWNER}}"

product_identity:
  product_type: "{{digital_adaptation | companion_app | rules_reference | play_aid | simulator | other}}"
  source_game_title: "{{SOURCE_GAME_TITLE}}"
  source_edition: "{{SOURCE_EDITION}}"
  source_language: "{{SOURCE_LANGUAGE}}"
  target_language: "{{TARGET_LANGUAGE}}"
  adaptation_mode: "{{faithful_adaptation | inspired_by | utility_only | original_with_compatibility}}"
  public_positioning: "{{official | licensed | permissioned_unofficial | unofficial | internal_only}}"

source_material:
  authoritative_sources:
    - title: "{{SOURCE_TITLE}}"
      type: "{{rulebook | supplement | errata | SRD | website | correspondence | other}}"
      version_or_date: "{{VERSION_OR_DATE}}"
      location: "{{CONTROLLED_LOCATION_OR_PUBLIC_URL}}"
      rights_status: "{{approved | requires_review | blocked | public_license | unknown}}"
      allowed_use_summary: "{{SHORT_ALLOWED_USE_SUMMARY}}"
  excluded_sources:
    - title: "{{EXCLUDED_SOURCE_TITLE}}"
      reason: "{{OUT_OF_SCOPE_OR_BLOCKED_REASON}}"

rights_and_content_policy:
  release_mode: "{{free_non_commercial | commercial | internal | private_test | TBD}}"
  mechanics_policy: "{{allowed | requires_review | blocked}}"
  table_structure_policy: "{{allowed | requires_review | blocked}}"
  table_value_policy: "{{allowed | requires_review | blocked}}"
  term_and_name_policy: "{{allowed | requires_review | blocked}}"
  exact_prose_policy: "{{blocked_by_default | item_approved_only | allowed_under_license}}"
  paraphrase_policy: "{{required_by_default | optional | blocked}}"
  art_asset_policy: "{{blocked_by_default | item_approved_only | allowed_under_license}}"
  logo_brand_policy: "{{blocked | item_approved_only | allowed_under_license}}"
  layout_trade_dress_policy: "{{blocked_by_default | item_approved_only | allowed_under_license}}"
  third_party_asset_policy: "{{review_required | approved_manifest_only | blocked}}"
  attribution_required: true
  confidential_evidence_allowed_in_repo: false

release_model:
  prototype_name: "{{PROTOTYPE_NAME}}"
  baseline_release_name: "{{BASELINE_RELEASE_NAME}}"
  future_release_names:
    - "{{FUTURE_RELEASE_NAME}}"
  public_release_gate: "{{PUBLIC_RELEASE_GATE_NAME}}"
  release_constraints:
    - "{{RELEASE_CONSTRAINT}}"

rules_model:
  primary_rules_domains:
    - "{{RULES_DOMAIN}}"
  content_modules:
    - id: "{{MODULE_ID}}"
      name: "{{MODULE_NAME}}"
      status: "{{in_scope | deferred | blocked | future}}"
      source_basis: "{{SOURCE_REFERENCE}}"
  deterministic_examples_required: true
  randomization_policy: "{{seeded | auditable_roll_log | free_random | none}}"

implementation_context:
  repository: "{{OWNER/REPOSITORY}}"
  default_branch: "{{DEFAULT_BRANCH}}"
  integration_branch: "{{INTEGRATION_BRANCH}}"
  release_branch: "{{RELEASE_BRANCH}}"
  branch_prefix: "{{agent | feature | docs | other}}"
  issue_tracker: "{{github_issues | other}}"
  labels:
    agent_implementable: "{{LABEL_NAME}}"
    agent_assisted: "{{LABEL_NAME}}"
    human_gated: "{{LABEL_NAME}}"
  stack:
    app_runtime: "{{APP_RUNTIME}}"
    language: "{{LANGUAGE}}"
    ui_framework: "{{UI_FRAMEWORK}}"
    persistence: "{{PERSISTENCE}}"
    hosting: "{{HOSTING}}"
    test_runner: "{{TEST_RUNNER}}"

quality_gates:
  documentation_ready:
    - "{{DOCUMENTATION_GATE}}"
  implementation_ready:
    - "{{IMPLEMENTATION_GATE}}"
  merge_ready:
    - "{{MERGE_GATE}}"
  release_ready:
    - "{{RELEASE_GATE}}"

agent_workflow:
  prompt_template_path: "{{PROMPT_TEMPLATE_PATH}}"
  issue_template_paths:
    - "{{ISSUE_TEMPLATE_PATH}}"
  review_style: "findings_first"
  codex_comments_fenced: true
  require_scope_boundaries: true
  require_verification_steps: true
```

---

## 6. Field Reference

### 6.1 Profile Metadata

| Field | Required | Description |
|---|---|---|
| `profile.id` | Yes | Stable lowercase identifier for the profile, for example `notequest-core` or `ironsworn-mvp`. |
| `profile.product_name` | Yes | Human-readable product name used in generated documents and issue titles. |
| `profile.product_short_name` | Yes | Short name used where UI, labels, or branch names need compact text. |
| `profile.status` | Yes | One of Draft, Review, Approved, Amended, or Superseded. |
| `profile.owner` | Yes | Person or role accountable for keeping the profile current. |

### 6.2 Product Identity

| Field | Required | Description |
|---|---|---|
| `product_type` | Yes | The kind of software being built. Use the closest listed value or define a controlled project-specific value. |
| `source_game_title` | Yes | Title of the game or ruleset being adapted. |
| `source_edition` | Yes | Edition, printing, version, or reviewed date of the source rules. |
| `adaptation_mode` | Yes | Whether the product is a faithful adaptation, inspired work, utility, simulator, or original compatible project. |
| `public_positioning` | Yes | Whether the product is official, licensed, permissioned unofficial, unofficial, or internal only. |

### 6.3 Source Material

| Field | Required | Description |
|---|---|---|
| `authoritative_sources` | Yes | Source materials that control product scope, rules, content, and rights. |
| `excluded_sources` | Recommended | Supplements, expansions, editions, assets, or websites that are explicitly out of scope. |
| `rights_status` | Yes | Current rights status for each source. Unknown or requires_review cannot support public release without a gate. |
| `allowed_use_summary` | Yes | Short statement of what the project may do with the source. Avoid private legal detail in public docs. |

Use controlled source types where possible:

| Source type | Examples |
|---|---|
| `rulebook` | Core game PDF, printed book, starter rules |
| `supplement` | Expansion book, adventure module, optional rules pack |
| `errata` | Official corrections, designer clarifications |
| `SRD` | Open rules reference, system document |
| `website` | Public online rules or FAQ |
| `correspondence` | Permission email, licence grant, rights clarification |
| `other` | Any source that does not fit the above |

### 6.4 Rights and Content Policy

The profile should state the default policy for each content class. Item-level inventories can be created later, but the profile must define the default.

| Content class | Policy question |
|---|---|
| Mechanics | Can rules procedures be implemented as software behaviour? |
| Table structure | Can table shapes, ranges, and lookup structures be represented? |
| Table values | Can table entries, names, effects, and values be included? |
| Terms and names | Can named races, classes, locations, moves, items, monsters, or stats be used? |
| Exact prose | Can source text be copied verbatim? |
| Paraphrased prose | Should product copy be original and paraphrased by default? |
| Art and visual assets | Can source images, icons, maps, sheets, or decorative art be reused? |
| Logo and branding | Can source logos, marks, titles, or trade names be used? |
| Layout and trade dress | Can page design, character-sheet design, and visual presentation be reproduced? |
| Third-party assets | Which external fonts, icons, images, audio, datasets, or packages may ship? |

Recommended conservative defaults for rights-sensitive adaptations:

```yaml
exact_prose_policy: "blocked_by_default"
paraphrase_policy: "required_by_default"
art_asset_policy: "blocked_by_default"
logo_brand_policy: "item_approved_only"
layout_trade_dress_policy: "blocked_by_default"
third_party_asset_policy: "approved_manifest_only"
confidential_evidence_allowed_in_repo: false
```

### 6.5 Release Model

| Field | Required | Description |
|---|---|---|
| `prototype_name` | Recommended | Name of the first vertical slice, proof of concept, or pilot module. |
| `baseline_release_name` | Yes | Name of the first complete usable release target. |
| `future_release_names` | Optional | Known future release lines, expansions, or post-MVP phases. |
| `public_release_gate` | Yes | Named gate that must pass before publishing beyond private/internal use. |
| `release_constraints` | Yes | Constraints such as free-only, English-only, no source art, no analytics, or no accounts. |

Do not assume every product uses the same milestone names, number of epics, or prototype structure.

### 6.6 Rules Model

| Field | Required | Description |
|---|---|---|
| `primary_rules_domains` | Yes | Top-level mechanical areas to extract and test. |
| `content_modules` | Yes | Modular content groups such as dungeons, moves, oracles, careers, bestiary sets, spell lists, scenes, or missions. |
| `deterministic_examples_required` | Yes | Whether documented fixtures and deterministic examples are required. |
| `randomization_policy` | Yes | How dice, random tables, seeds, or roll logs must behave. |

Common rules domains:

- character creation;
- character state and resources;
- actions, moves, or procedures;
- random tables and oracles;
- map, location, scene, or encounter generation;
- combat, conflict, hazards, and recovery;
- inventory, equipment, spells, powers, or abilities;
- progression and rewards;
- save, import, export, undo, and audit log behaviour; and
- end, death, retirement, success, or campaign termination conditions.

### 6.7 Implementation Context

| Field | Required | Description |
|---|---|---|
| `repository` | Yes | GitHub repository or other source-control location. |
| `default_branch` | Yes | Repository default branch. Record reality, not preference. |
| `integration_branch` | Required if used | Branch targeted by feature or docs PRs. |
| `release_branch` | Required if used | Branch representing public release baseline. |
| `branch_prefix` | Recommended | Branch naming prefix for generated work. |
| `issue_tracker` | Yes | Issue tracking system used for generated backlog work. |
| `labels` | Recommended | Product-specific labels used for agent implementability and review gates. |
| `stack` | Required when implementation work begins | Runtime, language, UI framework, persistence, hosting, and test runner. |

The profile records stack decisions. It must not make another project's stack the default unless that is an explicit approved decision.

### 6.8 Quality Gates

| Gate | Purpose |
|---|---|
| Documentation ready | Required docs exist and agree on scope, rights, rules, UX, data, NFR, and testing. |
| Implementation ready | A slice has enough approved detail to begin coding without inventing product behaviour. |
| Merge ready | PR has passed review, checks, scope verification, and evidence requirements. |
| Release ready | Rights, content inventory, accessibility, QA, hosting, notices, and rollback are approved. |

Each gate should list project-specific evidence, not only a generic statement that testing is complete.

### 6.9 Agent Workflow

| Field | Required | Description |
|---|---|---|
| `prompt_template_path` | Recommended | Path to the agent prompt template used for issue comments or implementation prompts. |
| `issue_template_paths` | Recommended | Paths to issue templates used for epics, features, reviews, and tests. |
| `review_style` | Yes | Expected review style. `findings_first` is recommended. |
| `codex_comments_fenced` | Yes | Whether Codex comments must be fenced code blocks. |
| `require_scope_boundaries` | Yes | Whether generated tasks must include explicit out-of-scope constraints. |
| `require_verification_steps` | Yes | Whether generated tasks must name concrete checks and evidence. |

---

## 7. Markdown Profile Template

Copy this section into a new product profile document and replace every placeholder.

```md
# {{PRODUCT_NAME}} Product Profile

## Generic Game Adaptation Process

*Version {{PROFILE_VERSION}} | {{PROFILE_STATUS}} | Prepared for the {{PRODUCT_NAME}} Project*

| Field | Value |
|---|---|
| Profile ID | {{PROFILE_ID}} |
| Product owner | {{PRODUCT_OWNER}} |
| Source game / ruleset | {{SOURCE_GAME_TITLE}} |
| Source edition / version | {{SOURCE_EDITION}} |
| Adaptation mode | {{ADAPTATION_MODE}} |
| Release mode | {{RELEASE_MODE}} |
| Repository | {{OWNER/REPOSITORY}} |
| Status | {{PROFILE_STATUS}} |
| Last updated | {{YYYY-MM-DD}} |

---

## 1. Product Identity

| Field | Value |
|---|---|
| Product name | {{PRODUCT_NAME}} |
| Short name | {{PRODUCT_SHORT_NAME}} |
| Product type | {{PRODUCT_TYPE}} |
| Public positioning | {{PUBLIC_POSITIONING}} |
| Target language | {{TARGET_LANGUAGE}} |
| Primary audience | {{PRIMARY_AUDIENCE}} |
| Primary use case | {{PRIMARY_USE_CASE}} |

## 2. Source Material

| Source | Type | Version / date | Location | Rights status | Approved use |
|---|---|---|---|---|---|
| {{SOURCE_TITLE}} | {{SOURCE_TYPE}} | {{VERSION_OR_DATE}} | {{CONTROLLED_LOCATION_OR_PUBLIC_URL}} | {{RIGHTS_STATUS}} | {{ALLOWED_USE_SUMMARY}} |

### Excluded Sources

| Source | Reason | Revisit condition |
|---|---|---|
| {{EXCLUDED_SOURCE_TITLE}} | {{EXCLUDED_REASON}} | {{REVISIT_CONDITION}} |

## 3. Rights and Content Policy

| Content class | Default policy | Notes / evidence |
|---|---|---|
| Mechanics | {{POLICY}} | {{NOTES}} |
| Table structure | {{POLICY}} | {{NOTES}} |
| Table values | {{POLICY}} | {{NOTES}} |
| Terms and names | {{POLICY}} | {{NOTES}} |
| Exact source prose | {{POLICY}} | {{NOTES}} |
| Paraphrased product prose | {{POLICY}} | {{NOTES}} |
| Source art and icons | {{POLICY}} | {{NOTES}} |
| Logo and branding | {{POLICY}} | {{NOTES}} |
| Layout and trade dress | {{POLICY}} | {{NOTES}} |
| Third-party assets | {{POLICY}} | {{NOTES}} |

## 4. Release Model

| Field | Value |
|---|---|
| Prototype / vertical slice | {{PROTOTYPE_NAME}} |
| Baseline release | {{BASELINE_RELEASE_NAME}} |
| Future release lines | {{FUTURE_RELEASE_NAMES}} |
| Public release gate | {{PUBLIC_RELEASE_GATE}} |
| Release constraints | {{RELEASE_CONSTRAINTS}} |

## 5. Rules Model

| Rules domain | In scope? | Source basis | Notes |
|---|---|---|---|
| {{RULES_DOMAIN}} | {{YES_NO_DEFERRED}} | {{SOURCE_REFERENCE}} | {{NOTES}} |

| Content module | Status | Source basis | Release target |
|---|---|---|---|
| {{MODULE_NAME}} | {{in_scope/deferred/blocked/future}} | {{SOURCE_REFERENCE}} | {{RELEASE_TARGET}} |

## 6. Repository and Delivery Model

| Field | Value |
|---|---|
| Repository | {{OWNER/REPOSITORY}} |
| Default branch | {{DEFAULT_BRANCH}} |
| Integration branch | {{INTEGRATION_BRANCH}} |
| Release branch | {{RELEASE_BRANCH}} |
| Branch prefix | {{BRANCH_PREFIX}} |
| Issue tracker | {{ISSUE_TRACKER}} |
| Milestone model | {{MILESTONE_MODEL}} |
| Agent implementable label | {{LABEL_NAME}} |
| Agent assisted label | {{LABEL_NAME}} |
| Human gated label | {{LABEL_NAME}} |

## 7. Implementation Stack

| Concern | Decision | Status |
|---|---|---|
| Runtime | {{APP_RUNTIME}} | {{approved/proposed/TBD}} |
| Language | {{LANGUAGE}} | {{approved/proposed/TBD}} |
| UI framework | {{UI_FRAMEWORK}} | {{approved/proposed/TBD}} |
| Persistence | {{PERSISTENCE}} | {{approved/proposed/TBD}} |
| Hosting | {{HOSTING}} | {{approved/proposed/TBD}} |
| Test runner | {{TEST_RUNNER}} | {{approved/proposed/TBD}} |

## 8. Quality Gates

| Gate | Required evidence | Owner |
|---|---|---|
| Documentation ready | {{DOCUMENTATION_GATE_EVIDENCE}} | {{OWNER}} |
| Implementation ready | {{IMPLEMENTATION_GATE_EVIDENCE}} | {{OWNER}} |
| Merge ready | {{MERGE_GATE_EVIDENCE}} | {{OWNER}} |
| Release ready | {{RELEASE_GATE_EVIDENCE}} | {{OWNER}} |

## 9. Agent Workflow

| Field | Value |
|---|---|
| Prompt template | {{PROMPT_TEMPLATE_PATH}} |
| Issue templates | {{ISSUE_TEMPLATE_PATHS}} |
| Review style | {{REVIEW_STYLE}} |
| Codex comments fenced | {{YES_NO}} |
| Scope boundaries required | {{YES_NO}} |
| Verification steps required | {{YES_NO}} |

## 10. Open Questions

| ID | Question | Owner | Blocks | Target resolution |
|---|---|---|---|---|
| PPQ-001 | {{QUESTION}} | {{OWNER}} | {{BLOCKED_WORK}} | {{DATE_OR_GATE}} |

## 11. Approval

| Role | Name | Status | Date | Notes |
|---|---|---|---|---|
| Product Owner | {{NAME}} | {{approved/rejected/pending}} | {{DATE}} | {{NOTES}} |
| Rules / Product Designer | {{NAME}} | {{approved/rejected/pending}} | {{DATE}} | {{NOTES}} |
| Content / Licensing Reviewer | {{NAME}} | {{approved/rejected/pending}} | {{DATE}} | {{NOTES}} |
| Technical Lead | {{NAME}} | {{approved/rejected/pending}} | {{DATE}} | {{NOTES}} |
| QA / Test Lead | {{NAME}} | {{approved/rejected/pending}} | {{DATE}} | {{NOTES}} |
```

---

## 8. Validation Rules

A completed product profile is valid when all of the following are true:

- every placeholder has been replaced or intentionally marked `TBD`;
- every `TBD` field has an owner and a blocking/non-blocking status;
- the product name, source title, edition, release model, and repository are unambiguous;
- source materials are classified with rights status and allowed-use summaries;
- rights defaults distinguish mechanics, tables, prose, art, branding, layout, and third-party assets;
- confidential rights evidence is referenced by controlled location, not pasted into public files;
- release constraints are explicit enough to block unsafe public release;
- rules domains and content modules are named at a level that can drive extraction and backlog planning;
- milestone and branch conventions reflect the target repository, not a copied project;
- agent labels, issue templates, and prompt requirements match the actual workflow;
- quality gates name evidence that can be verified by reviewers; and
- approval records identify the role approving each concern.

### 8.1 Blocking Validation Failures

The profile must not be used for backlog or prompt generation if any of these are true:

| Failure | Why it blocks |
|---|---|
| Product name or source game is still a placeholder | Generated docs and issues may target the wrong product. |
| Source edition is unknown | Rules extraction may mix incompatible editions. |
| Rights status is unknown for public release content | Public release could include unapproved material. |
| Exact prose or source art policy is missing | Implementers may copy protected expression accidentally. |
| Repository or branch model is missing | Generated PRs may target the wrong branch. |
| Milestone model is copied from another product without approval | Backlog shape may encode false scope assumptions. |
| Quality gates are generic only | Reviewers cannot verify readiness. |
| Template instructions remain in the approved profile | The file is not a finished project document. |

### 8.2 Non-Blocking Warnings

The profile may proceed to planning with warnings when:

- future release names are unknown;
- final hosting is proposed but not approved;
- issue labels are not yet created;
- optional UX themes are still undecided;
- non-critical content modules are marked future or deferred; or
- public release is not planned for the current phase.

Each warning should be recorded as an open question or follow-up task.

---

## 9. Product Leakage Audit

Run this audit before approving a profile and before using it to generate templates, issues, or agent prompts.

### 9.1 Forbidden Leakage

Search generated materials for terms from unrelated products, including:

- product names;
- source game titles;
- creator or publisher names;
- release names such as prototype, MVP, milestone, epic, or module names;
- branch names and repository names;
- labels and issue template paths;
- licensing assumptions;
- character, class, move, location, dungeon, oracle, monster, faction, or item names;
- UI vocabulary that belongs to another game; and
- old approval records or reviewer names.

Any match must be either removed, replaced with the current product value, or documented as an intentional cross-reference.

### 9.2 Placeholder Audit

Search for unresolved placeholder patterns:

```text
{{
}}
TBD
TODO
PRODUCT_NAME
SOURCE_GAME_TITLE
OWNER/REPOSITORY
M0
M1
develop
main
Ironsworn
NoteQuest
Scarlet Heroes
```

Product names in this audit list are examples. Replace or extend them based on the projects whose templates are being reused.

### 9.3 Branch and Milestone Audit

Confirm that:

- the listed branches exist in the target repository;
- default, integration, and release branches are not assumed from another repo;
- milestone names match the approved product roadmap;
- epic and child-story labels exist or are scheduled for creation;
- release-forward PR rules match the repository's actual branch model; and
- no workflow refers to `development`, `master`, `develop`, or `main` unless those are verified branch names for the target repo.

### 9.4 Rights Leakage Audit

Confirm that:

- no source art, logos, trade dress, or page layout are approved merely because mechanics are approved;
- no exact source prose is allowed unless the evidence explicitly grants that right;
- source table entries are covered separately from table structures where needed;
- public attribution text is approved for this product, not copied from another product;
- third-party asset licences are reviewed for this release mode; and
- private correspondence or personal data is not committed to public docs.

---

## 10. Abbreviated Example

This example illustrates the level of specificity expected. It is not a complete profile and must not be copied as an approved product profile.

```yaml
profile:
  id: "notequest-core"
  product_name: "NoteQuest"
  product_short_name: "NoteQuest"
  version: "0.1"
  status: "Example only"
  last_updated: "2026-07-23"
  owner: "Product Owner"

product_identity:
  product_type: "digital_adaptation"
  source_game_title: "NoteQuest"
  source_edition: "English PDF, first edition, 2020"
  source_language: "English"
  target_language: "English"
  adaptation_mode: "faithful_adaptation"
  public_positioning: "permissioned_unofficial"

source_material:
  authoritative_sources:
    - title: "NoteQuest rulebook"
      type: "rulebook"
      version_or_date: "First edition, 2020"
      location: "Controlled project source"
      rights_status: "requires_review"
      allowed_use_summary: "Structured mechanics and approved terminology only; exact prose and visuals blocked unless separately approved."
  excluded_sources:
    - title: "Expanded supplements"
      reason: "Outside Core MVP scope"

rights_and_content_policy:
  release_mode: "free_non_commercial"
  mechanics_policy: "allowed"
  table_structure_policy: "allowed"
  table_value_policy: "requires_review"
  term_and_name_policy: "requires_review"
  exact_prose_policy: "blocked_by_default"
  paraphrase_policy: "required_by_default"
  art_asset_policy: "blocked_by_default"
  logo_brand_policy: "item_approved_only"
  layout_trade_dress_policy: "blocked_by_default"
  third_party_asset_policy: "approved_manifest_only"
  attribution_required: true
  confidential_evidence_allowed_in_repo: false

release_model:
  prototype_name: "Palace"
  baseline_release_name: "Core MVP"
  future_release_names:
    - "Post-MVP expansions"
  public_release_gate: "Rights, content inventory, QA, accessibility, and hosting review"
  release_constraints:
    - "English-only"
    - "Free, non-commercial release"
    - "No source art or page layout"

implementation_context:
  repository: "labax/NoteQuest"
  default_branch: "main"
  integration_branch: "develop"
  release_branch: "main"
  branch_prefix: "agent"
  issue_tracker: "github_issues"
```

---

## 11. Approval Checklist

Before a product profile is approved, confirm:

- product identity and source edition are correct;
- source materials and excluded materials are listed;
- rights defaults are conservative and reviewable;
- release mode and public release constraints are explicit;
- prototype, baseline release, and future release names are product-specific;
- rules domains and content modules are sufficient to drive extraction work;
- repository, branch, issue, label, and agent conventions are verified;
- implementation stack decisions are approved or clearly marked proposed;
- documentation, implementation, merge, and release gates have evidence requirements;
- unresolved decisions are recorded as open questions with owners;
- product leakage audit passed;
- placeholder audit passed; and
- approval records identify the role and date for each concern.

Approval of a product profile authorises generic process materials to be instantiated for the product. It does not approve implementation, public release, or rights-sensitive content by itself.
