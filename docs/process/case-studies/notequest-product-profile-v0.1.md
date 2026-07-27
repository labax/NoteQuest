# NoteQuest Product Profile

## Product-Agnostic Game Adaptation Case Study

*Version 0.1 | Draft case-study profile | Prepared for the NoteQuest project*

| Field | Value |
|---|---|
| Profile owner | Product Owner |
| Profile scope | Product-specific configuration for applying the generic game adaptation process to NoteQuest |
| Related documents | Product-Agnostic Game Adaptation Process v0.1; Product Profile Template v0.1; Source Material Intake and Rights Matrix v0.1; Rules Extraction Taxonomy v0.1; Backlog Generation Playbook v0.1; Agent Task Template Standard v0.1; NoteQuest product documents |
| Primary audience | Product owner, rules designer, technical lead, UX designer, QA lead, content/licensing reviewer, operations owner, implementation agents, and reviewers |
| Status | Draft case study |
| Last updated | 2026-07-23 |

---

## Contents

1. Purpose
2. Profile Authority
3. Canonical Profile Block
4. Product Identity
5. Source Material
6. Rights and Content Position
7. Product and Release Scope
8. Rules Domains
9. Data and Persistence Scope
10. UX, Accessibility, and Presentation Direction
11. Technical Stack and Repository Model
12. Delivery Phase Model
13. Agent and Review Workflow
14. Quality Gates
15. Out-of-Scope and Deferred Work
16. Product Leakage Watchlist
17. Open Questions
18. Acceptance Criteria
19. Approval

---

## 1. Purpose

This document shows how the generic Product Profile Template can be applied to NoteQuest.

It is a case study and working project profile. Generic process documents should not copy NoteQuest-specific values from this profile unless they are intentionally creating NoteQuest work.

---

## 2. Profile Authority

This profile summarizes the current NoteQuest process and product baseline from existing repository documents.

When this profile conflicts with a later approved NoteQuest decision register, product requirement, content/licensing requirement, or release decision, the later approved NoteQuest document controls and this profile should be updated.

When this profile conflicts with the generic process documents, the generic process controls the reusable workflow and this profile controls NoteQuest-specific substitutions.

---

## 3. Canonical Profile Block

    product:
      name: NoteQuest
      repository: labax/NoteQuest
      profile_type: case-study-product-profile
      status: draft
      profile_version: 0.1
      last_updated: 2026-07-23

    source_material:
      primary_source_title: NoteQuest
      primary_source_file: NoteQuest_eng.pdf
      creator_or_author: Tiago Junges
      edition: First edition
      publication_context: Author edition, Porto Alegre, 2020
      reviewed_pdf_pages: 24
      source_language: English source file
      known_supplements:
        - Expanded World
      supplement_policy: Expanded World is out of Core MVP scope and requires separate approval
      source_material_register: docs/process/generic/source-material-intake-and-rights-matrix-v0.1.md
      rights_matrix: docs/process/generic/source-material-intake-and-rights-matrix-v0.1.md

    release_model:
      product_type: faithful digital adaptation
      baseline_release_name: Core MVP
      prototype_name: Palace prototype
      release_mode: public free non-monetised web release
      monetisation: blocked
      localization: English-only for MVP
      multiplayer: out of scope
      accounts_or_cloud_saves: out of scope
      expanded_content: out of scope

    branch_model:
      integration_branch: develop
      release_branch: main
      feature_branch_pattern: agent/{description}
      release_forward_pattern: develop to main
      default_pr_state: draft
      documentation_only_ci: skipped when workflow path filters apply

    implementation_stack:
      language: TypeScript
      package_manager: npm
      node_version: 24.15.0
      npm_version: 11.4.2
      app_model: static offline-first web application
      frontend_framework: React
      build_tool: Vite
      test_runner: Vitest
      typecheck: TypeScript
      lint: ESLint
      format: Prettier
      persistence_direction: IndexedDB
      pwa_direction: service-worker cached application shell and approved static content
      hosting_direction: CDN-backed static web platform through protected GitHub Actions

    agent_workflow:
      implementation_target_branch: develop
      review_style: findings first, severity ordered
      codex_comment_format: fenced PR comments using the repository prompt template
      issue_closeout: merge PR, close child issue, update parent epic checklist
      labels:
        - Codex-task
        - agent-ready
        - agent-assisted
        - human-gated

---

## 4. Product Identity

| Field | Value |
|---|---|
| Product name | NoteQuest |
| Repository | labax/NoteQuest |
| Adaptation type | Faithful digital adaptation |
| Product format | Free, responsive, offline-first web application |
| Primary play mode | Single-player solo play |
| Baseline release | Core MVP |
| Prototype gate | Palace prototype |
| Case-study purpose | Demonstrate how the generic process becomes a concrete product profile |

---

## 5. Source Material

| Source | Profile value |
|---|---|
| Primary source | NoteQuest_eng.pdf |
| Author/creator | Tiago Junges |
| Edition | First edition |
| Publication context | Author edition, Porto Alegre, 2020 |
| PDF metadata | 24 pages; created from Adobe InDesign/PDF tooling |
| Source content shape | Solo dungeon-crawler rules, character creation, tables, dungeon procedures, combat, equipment, spells, dungeon sections, credits/backers |
| Supplement reference | Expanded World is referenced by the source but is out of Core MVP scope |
| Sensitive content | Backer names and other personal-name credit material are not needed for gameplay and should not be reproduced in the application without separate purpose and review |
| Source file role | Review source, not a direct asset source |

The source PDF includes rules, tables, player-facing prose, layout, and credits. The digital product should model approved mechanics and tables as structured behaviour/data while avoiding unapproved reproduction of expressive prose, page layout, art, logo, and trade dress.

---

## 6. Rights and Content Position

| Area | NoteQuest position |
|---|---|
| Adaptation permission | Existing project decision registers record written adaptation, table, and name permissions |
| Mechanics | Approved for faithful structured implementation under project decisions |
| Tables | Approved as structured content where covered by rights evidence and provenance |
| Terms and names | Approved where covered by project rights decisions and content inventory |
| Exact prose | Blocked by default unless explicit permission covers digital reproduction of the exact text |
| Source artwork | Blocked unless asset-level digital-use rights evidence exists |
| Logo, layout, trade dress | Blocked unless separately approved |
| Backer or credit lists | Excluded from gameplay and public app content unless a separate purpose, privacy review, and rights review are recorded |
| Third-party assets | Require license, attribution, and provenance |
| User-authored content | Kept separate from bundled source content |
| Public release | Blocked if unknown, unsupported, expired, or unreviewed content is bundled |

Controlling content/licensing baseline:

- docs/product/content-licensing-requirements-v0.1.md
- docs/product/digital-adaptation-decision-register-v0.2.md
- docs/process/generic/source-material-intake-and-rights-matrix-v0.1.md

---

## 7. Product and Release Scope

| Scope area | NoteQuest baseline |
|---|---|
| MVP goal | Complete playable six-dungeon core loop without paper tables, manual bookkeeping, or unresolved rule interpretation |
| Prototype | Palace production-intent prototype before full six-dungeon production |
| MVP content | Six core dungeon types and core source content |
| Core loop | Adventurer generation, dungeon generation, exploration, combat, loot, light, retreat, town, death/recovery, boss completion, resume |
| Persistence | Local saves, event history, dungeons, adventurers, inventory, dropped items, corpses or belongings, Graveyard |
| Release mode | Public free non-monetised web release |
| Supported form factor | Responsive web, including phone browsers |
| Offline position | Offline-first local play after app shell and static content are available |
| Account model | No mandatory account |
| Backend model | Core gameplay must not require an application server |

---

## 8. Rules Domains

The NoteQuest rules work should be grouped into these domains for extraction, backlog, and implementation.

| Domain | Includes |
|---|---|
| Adventurer generation | Race, class, HP, abilities, starting weapon, spells, starting resources, name |
| Dungeon identity and generation | Dungeon naming, type, floor/segment generation, connections, stairs, boss access, termination |
| Exploration | Doors, movement, locks, keys, traps, secret passages, stealth, light, torches |
| Encounters and combat | Initiative, attacks, damage, armor, monster behaviour, traits, escape, death, victory |
| Inventory and equipment | Backpack, equipped items, weapons, armor durability, consumables, coins, dropped items |
| Spells and effects | Spell acquisition, uses, casting, recovery, effect resolution |
| Town and expedition lifecycle | Retreat, rest, spell restoration, repairs, purchases, selling, re-entry |
| Death and recovery | Character death, belongings/corpse recovery, replacement adventurers, Graveyard |
| Boss and dungeon completion | Boss encounter, reward, completion state, no duplicate unique reward |
| Randomness and transparency | Deterministic streams, table results, event history, visible rolls and outcomes |
| Persistence and migration | Save slots, last-valid snapshots, export/import, schema/rules/content versions |
| Content and rights | Source table provenance, approved terms, notices, blocked content |

Each domain should use the Rules Extraction Taxonomy identifiers before becoming implementation issues.

---

## 9. Data and Persistence Scope

| Area | NoteQuest baseline |
|---|---|
| Save slots | Three named local save slots |
| Storage direction | IndexedDB |
| Recovery | Last-valid recovery snapshot per slot |
| Export/import | Versioned export and validated import are Must |
| Migration | Explicit sequential migrations |
| Randomness | Separate deterministic streams for dungeon generation, combat, and expedition repopulation |
| Event history | Required for mechanical transparency and recovery evidence |
| Completed dungeon retention | Permanent summary plus retained mechanically relevant history per existing requirements |
| Privacy | Private play data remains local unless deliberately exported or attached by the user |
| Diagnostics | Production diagnostics must not include private save content or full game history without separate approval |

---

## 10. UX, Accessibility, and Presentation Direction

| Area | NoteQuest baseline |
|---|---|
| Visual direction | 2D monochrome ink-and-notebook presentation with restrained warm torch accent |
| Prototype assets | Placeholder presentation is acceptable through Palace prototype gate |
| Source art | Excluded unless explicit asset-level approval exists |
| Responsive support | Current and previous two major Chrome, Edge, Firefox, and Safari versions |
| Viewport validation | 360, 390, 768, 1024, 1280, and 1440 CSS pixels |
| Accessibility target | WCAG 2.2 Level AA |
| Assistive technology checks | Keyboard-only, NVDA, VoiceOver, TalkBack, and textual-map coverage per approved NFR |
| Map accessibility | Visual map must have an equivalent textual path for required gameplay |
| Motion | Non-essential animation should be optional or skippable |

---

## 11. Technical Stack and Repository Model

| Area | NoteQuest value |
|---|---|
| Repository | labax/NoteQuest |
| Default branch | main |
| Integration branch | develop |
| Release-forward branch flow | develop to main |
| Workspace model | npm workspaces under apps and packages |
| Runtime versions | Node 24.15.0 and npm 11.4.2 as recorded in package.json |
| Language | TypeScript |
| Frontend | React |
| Build | Vite |
| Tests | Vitest |
| Type checking | TypeScript no-emit |
| Lint | ESLint |
| Formatting | Prettier |
| Full verification script | npm run verify |
| Simulation command | npm run simulation:palace-smoke |
| Deployment direction | Static PWA on CDN-backed platform through protected GitHub Actions |

---

## 12. Delivery Phase Model

NoteQuest currently uses milestone epics and child story issues.

Known baseline:

| Phase concept | NoteQuest usage |
|---|---|
| Integration branch | develop |
| Release branch | main |
| Feature branches | Agent or issue-specific branches |
| Child stories | GitHub issues linked from epic checklists |
| Reviews | Findings-first review against linked issue and current head SHA |
| Fix prompts | Codex comments on PRs using repository prompt template |
| Close-out | Merge PR, close issue, update epic checklist |
| Release-forward | PR from develop to main after milestone or epic completion |

The generic process should not assume the exact NoteQuest M0 to M9 sequence for other products.

---

## 13. Agent and Review Workflow

| Area | NoteQuest convention |
|---|---|
| Agent implementation | Use issue text as source of truth |
| Prompt template | docs/product/templates/codex_prompt_template.txt |
| PR fix comments | Fenced comments in the PR conversation |
| Review stance | Findings first, severity ordered |
| CI | Pull request CI, with documentation-only skip where configured |
| Verification | Use package scripts and issue-specific simulation commands |
| Issue closure | Only after merge and acceptance evidence |
| Epic updates | Check off only delivered child stories |

Known product-leakage risk:

- docs/product/templates/feature_story_template.md currently contains Ironsworn wording and should be audited before reuse.

---

## 14. Quality Gates

| Gate | Required NoteQuest evidence |
|---|---|
| Product baseline | Approved BRD, MVP scope, PRD, FRD, decision register, and related product docs |
| Prototype gate | Palace prototype passes must scenarios, deterministic seed checks, persistence fault checks, and playtest thresholds |
| Rules gate | Digital Rules Specification and extraction rows cover relevant domains |
| Content gate | Rights matrix and content/licensing requirements approve all bundled source-derived content |
| Data gate | Data/domain model covers save slots, migration, event history, import/export, and recovery |
| UX gate | Responsive and accessible flows cover core gameplay |
| NFR gate | Browser matrix, performance, reliability, accessibility, privacy, and release controls are testable |
| PR gate | Linked issue, checks, review findings resolved, correct target branch |
| Release gate | Release-forward PR from develop to main, notices, immutable artifact, rollback position, no blocked content |

---

## 15. Out-of-Scope and Deferred Work

| Area | Status |
|---|---|
| Expanded World | Out of Core MVP scope |
| Multiplayer | Out of MVP scope |
| Native mobile application | Out of MVP scope |
| Cloud accounts or cloud saves | Out of MVP scope |
| Live services | Out of MVP scope |
| Monetisation | Blocked for MVP |
| Localization | Deferred; MVP is English-only |
| Crafting or tactical grid combat | Out of MVP scope unless future approved scope changes |
| Source art and layout reuse | Blocked unless asset-level rights evidence exists |
| Public analytics or private play-data reuse | Blocked without separate approval |

---

## 16. Product Leakage Watchlist

When reusing NoteQuest process materials for another product, replace or remove:

| NoteQuest value | Generic replacement |
|---|---|
| NoteQuest | {{PRODUCT_NAME}} |
| NoteQuest_eng.pdf | {{SOURCE_FILE}} |
| Palace prototype | {{PROTOTYPE_NAME}} |
| Core MVP | {{BASELINE_RELEASE_NAME}} |
| Six core dungeons | {{RELEASE_SCOPE}} |
| Expanded World | {{OUT_OF_SCOPE_SUPPLEMENT}} |
| develop | {{INTEGRATION_BRANCH}} |
| main | {{RELEASE_BRANCH}} |
| TypeScript/React/Vite | {{IMPLEMENTATION_STACK}} |
| IndexedDB/PWA | {{PERSISTENCE_AND_DELIVERY_MODEL}} |
| Codex-task | {{AGENT_READY_LABEL}} |
| Ironsworn wording in templates | Remove before reuse |

---

## 17. Open Questions

| ID | Question | Owner | Status |
|---|---|---|---|
| NQ-PROFILE-OQ-001 | Should this case-study profile become a controlling NoteQuest product profile or remain an example document? | Product Owner | Open |
| NQ-PROFILE-OQ-002 | Should the feature story template be corrected in the same process-docs line of work or handled in a separate cleanup issue? | Product Owner / Delivery Lead | Open |
| NQ-PROFILE-OQ-003 | Should a product-specific source-item matrix be created for NoteQuest in addition to the generic matrix? | Content / Licensing Reviewer | Open |

---

## 18. Acceptance Criteria

This profile is ready for use when:

- [ ] Product identity and repository are defined.
- [ ] Source material and edition are recorded.
- [ ] Release mode and major exclusions are defined.
- [ ] Rights and content position links to controlling NoteQuest docs.
- [ ] Rules domains are listed for extraction and backlog generation.
- [ ] Data, persistence, UX, accessibility, technical, and branch-model baselines are recorded.
- [ ] Agent and review workflow conventions are documented.
- [ ] Quality gates are listed.
- [ ] Product-leakage watchlist identifies values that must not enter generic templates.
- [ ] Open questions are assigned for follow-up.

---

## 19. Approval

| Role | Name | Decision | Date | Notes |
|---|---|---|---|---|
| Product Owner |  | Pending / Approved / Rejected |  |  |
| Rules Designer |  | Pending / Approved / Rejected |  |  |
| Technical Lead |  | Pending / Approved / Rejected |  |  |
| QA Lead |  | Pending / Approved / Rejected |  |  |
| Content / Licensing Reviewer |  | Pending / Approved / Rejected |  |  |
