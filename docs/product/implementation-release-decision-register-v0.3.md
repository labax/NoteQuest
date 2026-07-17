# NoteQuest Implementation and Release Decision Register

## Approved Cross-Cutting Decisions after Requirements Baseline Approval

*Version 0.3 | Approved Decision Baseline | Prepared for the NoteQuest Project*

| Field | Value |
|---|---|
| Document owner | Product Owner |
| Relationship to earlier registers | Extends, and does not supersede, the [Original Decision Register](digital-adaptation-decision-register.md) or [Decision Register v0.2](digital-adaptation-decision-register-v0.2.md). Their approved product, rules, licensing, privacy, accessibility, and release-scope decisions remain controlling. |
| Related documents | [Business Requirements Document v0.1](business-requirements-v0.1.md); [MVP Scope v0.1](mvp-scope-v0.1.md); [Product Requirements Document v0.1](product-requirements-v0.1.md); [Functional Requirements Document v0.1](functional-requirements-v0.1.md); [Digital Rules Specification v0.1](digital-rules-specification-v0.1.md); [Data Model / Domain Model Specification v0.1](data-domain-model-v0.1.md); [UX Flow / Wireframe Requirements v0.1](ux-flow-wireframe-requirements-v0.1.md); [Non-Functional Requirements v0.1](non-functional-requirements-v0.1.md); [Content & Licensing Requirements v0.1](content-licensing-requirements-v0.1.md); [Acceptance Criteria / Test Plan v0.1](acceptance-criteria-test-plan-v0.1.md) |
| Purpose | Resolve the implementation, test-execution, hosting, content-governance, evidence, and public-release choices that remain after approval of the product requirements baseline. |
| Status | Approved decision baseline; all 66 recommended rulings are accepted as written. Downstream incorporation and implementation evidence remain pending. |
| Last updated | 2026-07-17 |
| Decision rows | All 66 recommended rulings approved (`yes`) |
| Scope | Architecture through public Core MVP release. Post-MVP expansion, commercialisation, localisation, multiplayer, cloud accounts, and other excluded systems remain outside this register. |

---

## 1. How to use this register

- Review each recommended ruling as a complete decision proposal.
- Enter `yes` in **Approved** when the recommendation is accepted without change.
- Enter `no` when the recommendation is rejected. In that case, the complete resolution written in **Comments / alternative ruling** becomes controlling.
- Do not enter `no` without a complete alternative that identifies the selected approach and any changed constraints.
- A blank **Approved** cell means the decision remains open.
- An approved row must be incorporated into its named downstream architecture, test, content, operations, UX, or release document.
- Later implementation details may refine an approved ruling, but may not contradict it without an approved amendment.
- Earlier approved rows concerning exact source prose and language scope are not reopened. In particular, LIC-002 and LIC-010 remain governed by the conservative paraphrase-by-default and English-only baselines already incorporated into [Decision Register v0.2](digital-adaptation-decision-register-v0.2.md) and the [Content & Licensing Requirements](content-licensing-requirements-v0.1.md).

### 1.1 Decision status vocabulary

| Status | Meaning |
|---|---|
| Open | Requires an approved recommendation or complete approved alternative. |
| Approved | The recommendation is accepted and becomes normative. |
| Approved alternative | The recommendation is rejected and the completed comments field becomes normative. |
| Deferred by gate | The decision is intentionally taken only after named evidence exists; the timing is itself approved. |
| Operational detail | A value may be selected in the named implementation plan provided it remains within an approved ruling. |

---

## 2. Baselines that this register must not reopen

| Area | Controlling baseline |
|---|---|
| Product | Faithful, complete digital adaptation of the six core dungeons rather than a tabletop assistant or expanded roguelike. |
| Delivery | Free, English-only, single-player, web-first Core MVP with no monetisation. |
| Connectivity | Installable static PWA; service-worker-cached application and approved static content; IndexedDB game state; no backend dependency for core play. |
| Persistence | Three named slots, truthful autosave, last-known-valid recovery, sequential migrations, versioned export/import, slot isolation, and no silent reset or reroll. |
| Rules | [Digital Rules Specification v0.1](digital-rules-specification-v0.1.md) and all approved Section 23 rulings. |
| Randomness | Separate deterministic streams for dungeon generation, combat, and expedition repopulation; committed outcomes survive reload. |
| Prototype | Palace is the one-dungeon prototype; all Must scenarios, seed/fault gates, usability thresholds, accessibility evidence, and written go/no-go are required. |
| Accessibility | WCAG 2.2 AA; approved keyboard, browser, NVDA, VoiceOver, TalkBack, reduced-motion, reflow, contrast, and textual-map baseline. |
| Privacy | Private play data remains local by default; no hidden analytics; diagnostics and feedback require explicit user action and review. |
| Content | Structured authorised mechanics, tables, names, and terminology may be represented; player-facing prose is project-original or paraphrased by default; exact source prose and source artwork require item-level permission. |
| Visual direction | Independent monochrome ink-and-notebook presentation with restrained warm torch accent; source trade dress is excluded. |
| Operations | Protected tagged builds, immutable release artifacts, retained previous release, one-action rollback, named owners, and quarterly maintenance review. |

---

## 3. Architecture and application-stack decisions

| ID | Remaining decision | Source | Recommended ruling | Owner / decision point | Comments / alternative ruling | Approved |
|---|---|---|---|---|---|---|
| IRD-ARCH-001 | Which implementation language, UI framework, and build system form the production-intent web application? | OQ-FRD-004; DEP-MVP-010; OQ-NFR-003 | Use **strict TypeScript**, **React**, and **Vite** for the static client application. Use the current maintained Node.js LTS only for build, test, and tooling. Produce static assets only; do not introduce SSR, Pages Functions, or an application backend for Core MVP play. | Technical Lead — before initial application scaffold |  | yes |
| IRD-ARCH-002 | How are domain rules isolated from UI and infrastructure code? | FRD traceability; DRS; Data Model principles | Organise the application into dependency-directed layers: `domain` for pure rules and state transitions; `application` for commands, validation, use cases, and transaction orchestration; `infrastructure` for IndexedDB, import/export, service worker, and platform adapters; `ui` for React views and interaction state; and `content` for validated versioned definitions. Domain code must not import React, browser storage, networking, or UI libraries. | Technical Lead / Rules Designer — architecture approval |  | yes |
| IRD-ARCH-003 | What is the authoritative state-management model? | OQ-FRD-004; DMI action atomicity; FRD duplicate-action requirements | Treat committed domain state held behind application services as authoritative. UI stores may hold view, selection, draft, and loading state but must not become a second source of mechanical truth. Every mechanical mutation is submitted as one typed command, validated once, committed at most once, and returns a typed result plus emitted event records. | Technical Lead — architecture approval |  | yes |
| IRD-ARCH-004 | What client routing model is used? | UX information architecture; static-hosting constraint | Use client-side routes for stable top-level destinations such as save selection, town, expedition, history, Graveyard, settings, and About/Credits. Use history-based URLs only where the selected static host supplies a tested SPA fallback; otherwise use a hash-based route adapter without changing UX semantics. Unresolved mechanical actions are represented by domain state, not solely by URL state. | Technical Lead / UX Lead — hosting and shell implementation |  | yes |
| IRD-ARCH-005 | How is the service worker implemented and updated safely? | RD-TECH-003/004; NFR offline/update requirements | Use a Workbox-based custom service worker through an `injectManifest`-style build. Precache the versioned shell and approved static content, separate runtime caches by release/content version, download updates in the background, and activate only after a successful safe save point plus explicit reload. Never use `skipWaiting` to replace an active session silently. | Technical Lead / QA — PWA architecture |  | yes |
| IRD-ARCH-006 | What package-management and dependency policy applies? | NFR maintainability/security; OQ-NFR-011 | Use npm with a committed lockfile and reproducible `npm ci` builds. Pin direct production dependencies to reviewed compatible ranges, pin GitHub Actions by immutable commit SHA, enable weekly dependency-update proposals, and require CI plus licence/security review before merge. Major dependency upgrades require an architecture-impact note and regression evidence. | Technical Lead / QA / Licensing — initial scaffold and maintenance plan |  | yes |

---

## 4. IndexedDB, persistence, and local-data decisions

| ID | Remaining decision | Source | Recommended ruling | Owner / decision point | Comments / alternative ruling | Approved |
|---|---|---|---|---|---|---|
| IRD-DATA-001 | Which IndexedDB abstraction is used? | OQ-DM-001; OQ-FRD-004 | Use **Dexie** as the IndexedDB abstraction and migration wrapper. Browser-native IndexedDB semantics remain controlling; application code accesses storage only through project-owned repository and transaction interfaces so Dexie can be upgraded or replaced without changing domain rules. | Technical Lead — persistence architecture |  | yes |
| IRD-DATA-002 | What physical object-store boundaries implement the logical model? | OQ-DM-001 | Use one versioned application database with these project-owned stores: `workspace` for application metadata; `slots` for stable slot metadata and pointers; `records` for normalised slot-owned domain records keyed by slot/type/ID; `events` for immutable mechanically relevant events keyed by slot/sequence; `snapshots` for last-valid and protected recovery packages; `contentPackages` for installed versioned definitions needed by saves; and `staging` for validated import/migration work that is never treated as active state. Exact indexes are documented in the architecture specification. | Technical Lead / Data Modeller — physical schema approval |  | yes |
| IRD-DATA-003 | Is the save model event-sourced? | DRS history; Data Model event/state distinction | No. Current validated domain records are the authoritative game state. Mechanical events are immutable explanation and evidence records, not the sole reconstruction source. A save must remain recoverable without replaying its entire history. | Technical Lead / Rules Designer / QA — persistence architecture |  | yes |
| IRD-DATA-004 | What must one action-level transaction commit atomically? | DMI atomicity; NFR reliability; ERR-013 | One transaction commits all changed domain records, immutable event records, random-stream advances or resolved random results, slot metadata, and recovery-pointer changes required by the action. If any required write fails, the transaction aborts and no success is shown. Effects outside IndexedDB must not be required to establish mechanical truth. | Technical Lead / QA — persistence implementation |  | yes |
| IRD-DATA-005 | Which recovery snapshots are retained? | OQ-DM-006; OQ-NFR-005 | Retain, per slot, the active state plus at most one snapshot for each protected class: `last-valid`, `pre-migration`, `pre-import`, and `pre-reset`. A newer validated snapshot of the same class replaces the older one only after durable validation. Do not keep an unbounded automatic snapshot history. User exports are independent and are never deleted by the application. | Product Owner / Technical Lead — recovery architecture |  | yes |
| IRD-DATA-006 | Which in-progress workflows survive browser termination? | OQ-DM-007; OQ-UX-003 | Persist every unresolved **mechanically blocking decision** that already follows a committed event, including required inventory-capacity, equipment-legality, target, recovery-transfer, migration, or import-confirmation state. Pure presentation state, filters, open panels, hover state, and unsubmitted destructive confirmations return to the last committed state. Adventurer-creation drafts may be stored separately as clearly labelled non-mechanical drafts and never masquerade as a created adventurer. | Product Owner / UX Lead / Technical Lead — architecture and UX implementation |  | yes |
| IRD-DATA-007 | What retention policy applies to player notes and archived notes? | OQ-DM-011; OQ-UX-006 | Retain user-created notes until the user explicitly deletes them. Archiving changes visibility only and does not trigger automatic cleanup. Any future bulk-cleanup feature requires an explicit scope decision, preview, export/backup guidance, and confirmation. | Product Owner / UX / Privacy — before note implementation |  | yes |
| IRD-DATA-008 | What validation limits apply to names and notes? | OQ-DM-012; OQ-NFR-007; OQ-UX-005 | Adopt the approved NFR defaults: maximum **40 Unicode grapheme clusters** for slot and adventurer names and **10,000 Unicode grapheme clusters** per player note. Trim leading/trailing whitespace, reject control characters other than permitted line breaks in notes, preserve the user's Unicode text, and show an accessible remaining-length/error state. | UX / Accessibility / Technical — form implementation |  | yes |
| IRD-DATA-009 | What storage-warning and compaction baseline applies? | OQ-DM-005; OQ-NFR-006; OQ-UX-008 | Use the approved NFR warning threshold when estimated application storage reaches 70% of quota or estimated remaining space falls below 20 MiB. Warn without blocking play while a safe commit remains possible. Never compact immutable mechanical meaning, Graveyard facts, required completion summaries, or protected snapshots below approved retention. Offer export before any user-confirmed cleanup. | Product / UX / Technical / QA — Palace storage testing |  | yes |

---

## 5. Deterministic randomness, serialisation, hashing, and export decisions

| ID | Remaining decision | Source | Recommended ruling | Owner / decision point | Comments / alternative ruling | Approved |
|---|---|---|---|---|---|---|
| IRD-RNG-001 | Which deterministic RNG algorithm and state format are used? | OQ-DM-002; DEP-MVP-012 | Use a project-owned, versioned **PCG32** implementation using exact unsigned 64-bit arithmetic represented with JavaScript `BigInt`. Persist the algorithm ID, algorithm version, state, and stream selector as hexadecimal strings. The implementation is non-cryptographic and must pass fixed cross-browser/Node reference vectors before use. | Technical Lead / Rules Designer / QA — architecture and harness approval |  | yes |
| IRD-RNG-002 | How are separate random streams created and identified? | RD-TECH-008; DRS-DICE | Create a master save seed and derive stable named stream selectors for at least dungeon generation, combat, and expedition repopulation. Additional streams require a registered purpose and version. Stream names and derivation rules are part of the rules/architecture version; calls may not be moved between streams without deterministic regression review. | Rules Designer / Technical Lead — RNG specification |  | yes |
| IRD-SER-001 | Which canonical serialisation and integrity-hash standards are used? | OQ-DM-003; OQ-CL-008 | Canonicalise JSON-compatible manifests, snapshots, and exported state using **RFC 8785 JSON Canonicalization Scheme** semantics and calculate **SHA-256** hashes over UTF-8 canonical bytes. Binary attachments, if later approved, receive individual SHA-256 entries in the manifest. Hashes detect accidental corruption and are not signatures or encryption. | Technical Lead / QA / Content Reviewer — architecture approval |  | yes |
| IRD-EXP-001 | What is the user-facing export format? | OQ-DM-004; OQ-NFR-004; OQ-UX-004 | Export one versioned `.nqsave` ZIP archive containing at minimum `manifest.json`, `save.json`, and `checksums.sha256`. JSON payloads remain human-inspectable after extraction. The archive contains no executable content and is not encrypted. The export UI must explain that the file contains private play data. | Product Owner / Technical Lead / UX — architecture and UX approval |  | yes |
| IRD-EXP-002 | What import process is normative? | Data Model import lifecycle; NFR security | Read the archive into isolated staging; enforce file-count, path, compression, and uncompressed-size limits; reject traversal, duplicate, unsupported, or extra required files; verify hashes; parse without executing content; validate schema and content references; migrate sequentially if supported; show a privacy/scope preview; create a protected pre-import snapshot; and commit only after explicit confirmation. Any failure leaves the target slot unchanged. | Technical Lead / QA / Security / UX — import implementation |  | yes |
| IRD-SER-002 | Does the content manifest use the same canonicalisation and hashing policy? | [Content & Licensing Requirements](content-licensing-requirements-v0.1.md); OQ-CL-008 | Yes. Runtime content packages and the release content inventory use the same canonical JSON and SHA-256 policy, with independent package/version IDs and per-item provenance. A release build fails when selected content and the recorded manifest hashes differ. | Technical Lead / Content Reviewer / QA — content pipeline |  | yes |

---

## 6. Content-authoring and rights-governance decisions

| ID | Remaining decision | Source | Recommended ruling | Owner / decision point | Comments / alternative ruling | Approved |
|---|---|---|---|---|---|---|
| IRD-CONT-001 | How are spelling variants, apparent errors, and translation artefacts normalised? | OQ-CL-009; OQ-TP-015 | Preserve a stable source reference and transcription field separately from project-facing canonical data. A display-only correction records the original form, canonical form, reason, reviewer, and content version. A correction that can affect probability, targeting, timing, cost, identity, or outcome requires Rules Designer approval and a new content/rules version; it may not be silently normalised. | Rules Designer / Content Lead / QA — content-authoring workflow |  | yes |
| IRD-CONT-002 | May any exact source phrase be used by default? | LIC-002; RD-CONT-001; OQ-CL-011 | No. Keep the existing project-original/paraphrase-by-default policy. Exact source wording remains blocked unless an item-level evidence record explicitly authorises that text or the Rights Reviewer determines that exact wording is legally required. This row does not reopen LIC-002. | Content / Rights / UX — content review |  | yes |
| IRD-CONT-003 | Where is confidential written-permission evidence stored? | OQ-CL-001; OQ-CL-012 | Store private rights correspondence in access-controlled project storage outside the public repository. Assign each evidence item a non-confidential ID, scope summary, owner, date, and review status. Public manifests reference only that ID and approved scope summary, never private correspondence or personal contact details. | Product Owner / Rights Reviewer / Operations — before external Palace distribution |  | yes |
| IRD-CONT-004 | How are dependencies, fonts, icons, audio, and visual assets admitted? | OQ-CL-004/005/007; content gate | Every bundled dependency and asset requires a manifest row containing package/asset identity, version, source, licence or permission, attribution, modification status, distribution compatibility, approval state, and hash. Unknown, incompatible, expired, blocked, or unapproved items fail the build. Palace placeholders follow the same gate. | Technical Lead / Content & Licensing Reviewer / UX — before bundling |  | yes |
| IRD-CONT-005 | What content fixture review is required before Palace testing? | Content pre-release checklist; Test Plan | Complete row-level Palace content IDs, source references, normalised values, deterministic expected results, provenance, approval status, and hashes. Require independent transcription review for every probability/table row used by the Palace build. Corrections after fixture freeze create a new content version and rerun affected deterministic tests. | Rules Designer / Content Lead / QA — Palace fixture freeze |  | yes |

---

## 7. Test, CI, security, and evidence-toolchain decisions

| ID | Remaining decision | Source | Recommended ruling | Owner / decision point | Comments / alternative ruling | Approved |
|---|---|---|---|---|---|---|
| IRD-TEST-001 | Which core automated test tools are used? | OQ-TP-001; OQ-NFR-011 | Use **Vitest** for unit and integration tests, **React Testing Library** for component behaviour, **Playwright** for browser/E2E and responsive runs, **axe-core** integration for automated accessibility checks, and **fast-check** for property-based rules and state-machine tests. Use the same pure domain package in browser tests and simulation tools. | Technical Lead / QA — initial codebase |  | yes |
| IRD-TEST-002 | Is mutation testing required? | OQ-TP-001; NFR testability | Use **Stryker** against critical rule, persistence, migration, and validation modules on scheduled and release-candidate runs. Mutation score is diagnostic during Palace development; before Core MVP release, surviving mutations in Must-critical modules require test improvement or an explicit QA-reviewed explanation. | QA / Technical Lead — CI design |  | yes |
| IRD-TEST-003 | Which checks run on each cadence? | OQ-TP-002; OQ-NFR-018 | On every PR run formatting/lint, type checking, unit/integration/component tests, selected property tests, content/manifest validation, automated accessibility checks, bundle budgets, secret/dependency/licence gates, and a Chromium Palace smoke flow. Nightly run the complete Playwright browser matrix, extended property/simulation suites, fault subsets, and mutation tests. Release candidates run every required browser/AT/manual test, full seed and fault/endurance matrices, performance, security/privacy, content, deployment, and rollback gates. | Technical Lead / QA / Accessibility — CI plan |  | yes |
| IRD-TEST-004 | Which security and supply-chain controls are mandatory? | OQ-NFR-011; OQ-TP-011 | Require GitHub CodeQL, Dependabot update review, OSV vulnerability scanning, Gitleaks secret scanning, a CycloneDX SBOM, dependency-licence allow/deny policy, CSP/header checks, lockfile integrity, pinned Actions, and adversarial import fixtures. A Critical or High exploitable release finding blocks release unless the approved NFR waiver process explicitly permits it. | Security / Technical / QA / Licensing — CI and release plan |  | yes |
| IRD-TEST-005 | How are flaky tests handled? | OQ-TP-014 | A flaky test may be quarantined only with an owner, linked defect, captured failure evidence, documented risk, and expiry no later than seven calendar days. A test covering a release gate, save integrity, deterministic rules, content eligibility, security, or required accessibility may not be removed from the release gate; the release remains blocked until it is reliable or an approved equivalent test replaces it. | QA Lead / Technical Lead — CI policy |  | yes |
| IRD-TEST-006 | What coverage thresholds apply? | OQ-NFR-012; approved NFR | Retain the approved NFR targets: at least 90% statement and branch coverage for identified critical rule, persistence, migration, validation, and content-gate modules, and at least 80% statement and branch coverage overall. Coverage never substitutes for deterministic boundary, property, mutation, browser, accessibility, or E2E evidence. | QA / Technical Lead — test configuration |  | yes |
| IRD-TEST-007 | Where is release evidence retained? | OQ-TP-012; release governance | Store privacy-safe release summaries, gate matrices, manifests, SBOMs, hashes, and approval records under `docs/evidence/releases/<release-id>/` in the repository. Store raw videos, detailed AT notes, large logs, private participant records, rights evidence, and other sensitive artifacts in access-controlled project storage referenced by non-confidential evidence IDs. Public evidence must contain no user names, notes, save contents, rights correspondence, or participant personal data. | QA / Operations / Privacy / Rights — evidence repository design |  | yes |

---

## 8. Deterministic simulation and synthetic-fixture decisions

| ID | Remaining decision | Source | Recommended ruling | Owner / decision point | Comments / alternative ruling | Approved |
|---|---|---|---|---|---|---|
| IRD-SIM-001 | How is the deterministic simulation harness implemented? | DEP-MVP-012; OQ-DM-002; OQ-TP-008 | Implement a Node-executable TypeScript CLI that imports the exact production domain, content, validation, and RNG packages. Do not duplicate rules in test-only code. The harness accepts explicit seed manifests, rules/content versions, dungeon type, run count, and output path. | Technical Lead / Rules Designer / QA — before Palace generation implementation |  | yes |
| IRD-SIM-002 | What evidence does a simulation run produce? | RD-RULE-002; Test Plan | Produce machine-readable JSON plus a concise Markdown summary containing build/rules/content/RNG versions, seed-manifest hash, counts, invariant failures, termination and reachability results, distribution summaries, duration, and environment. Every failure records the smallest reproducible seed and action trace that the harness can produce without changing semantics. | QA / Technical Lead — simulation report design |  | yes |
| IRD-SIM-003 | How are QA and participant seeds selected? | OQ-TP-008 | Maintain versioned seed manifests. Internal QA uses broad deterministic ranges plus curated boundary/regression seeds. Participant sessions use a separately frozen, balanced seed set selected before recruitment, with no reroll for preference. Any facilitator-forced state is labelled and excluded from unassisted random-run measures where applicable. | Rules Designer / QA / UX Research — fixture freeze |  | yes |
| IRD-SIM-004 | How are large-save, migration, corruption, and recovery corpora produced? | OQ-DM-010; OQ-TP-009 | Generate synthetic fixtures only through project-owned builders and prior-version serializers. Include minimum, typical, large, boundary, corrupted, interrupted, unsupported-newer, partial-recovery, and retention-compaction cases. Retain source seeds/builders and expected hashes; do not use real player saves or personal data as default fixtures. | Technical Lead / QA / Privacy — test-data implementation |  | yes |
| IRD-SIM-005 | What execution policy applies to the 100,000-seed gate? | DRS/MVP/NFR/Test Plan | Allow deterministic parallel execution by partitioning the explicit seed manifest, but require stable aggregate results independent of worker count and ordering. Palace and each Core dungeon must complete at least 100,000 accepted seeds with zero required termination or boss-reachability failure before the applicable gate passes. | QA / Technical Lead — Palace and Core gate execution |  | yes |

---

## 9. Palace playtest and feedback-process decisions

| ID | Remaining decision | Source | Recommended ruling | Owner / decision point | Comments / alternative ruling | Approved |
|---|---|---|---|---|---|---|
| IRD-UAT-001 | How many Palace sessions are planned? | OQ-TP-004; approved Test Plan | Run two pilot sessions that do not count toward the gate, followed by at least **10 valid scored sessions**. Add five more scored sessions when pilot findings materially change the script, when fewer than 10 valid sessions remain, or when a gate result is within ten percentage points of its threshold and the Product Owner requests more confidence. Accessibility evidence sessions may overlap only when they also meet the scored-session criteria. | Product Owner / UX / QA — before recruitment |  | yes |
| IRD-UAT-002 | Who should participate? | DEP-MVP-013; OQ-TP-005 | Recruit a balanced primary-user sample: approximately half familiar with solo tabletop or dungeon-crawling games and half without NoteQuest experience. Include phone and desktop users and obtain separate keyboard and representative screen-reader evidence. Exclude project authors, implementers, and anyone who has rehearsed the scored script from the unaided-completion denominator. | Product / UX Research / Accessibility — recruitment plan |  | yes |
| IRD-UAT-003 | What constitutes the scored core flow? | OQ-TP-006 | Score a frozen task set covering first launch/save selection, canonical adventurer creation, Palace entry, map understanding, door/trap/light resolution, one combat, loot or capacity handling, safe retreat, town action, re-entry/resume, and recognition of save/recovery state. Exercise death/replacement/recovery through a controlled follow-on scenario when the natural run does not reach it. Facilitator intervention is any instruction that identifies the next control, rule answer, route, or required decision rather than asking neutral think-aloud or safety questions. | Product Owner / UX / QA / Rules — UAT script freeze |  | yes |
| IRD-UAT-004 | What rating scale defines “acceptable or better”? | OQ-TP-007 | Use the same five labels for combat pacing, map clarity, and overall play: `Very poor`, `Poor`, `Acceptable`, `Good`, `Very good`. A score of `Acceptable`, `Good`, or `Very good` counts toward the approved 70% threshold. Preserve the exact wording across scored sessions and report counts as well as percentages. | Product Owner / UX — questionnaire approval |  | yes |
| IRD-UAT-005 | What consent and recording policy applies? | OQ-TP-005; privacy baseline | Obtain informed consent before each external session. Do not record audio, video, or screen by default; recording is optional, separately consented, purpose-limited, and stored in access-controlled evidence storage. Collect only participant code, eligibility attributes needed for analysis, task outcomes, observations, ratings, and consent status. Publish only aggregated or de-identified results. | Product / Privacy / UX Research — recruitment approval |  | yes |
| IRD-UAT-006 | What compensation policy applies? | OQ-TP-005 | External participants receive the same fixed compensation stated before recruitment and paid regardless of success or opinion. The Product Owner approves the amount and total budget in the recruitment brief. Internal volunteer or pilot participation is labelled and cannot be used to pressure favourable ratings. | Product Owner / Operations — before recruitment |  | yes |
| IRD-UAT-007 | When is a session invalid or excluded? | Test Plan execution | Exclude a session from the scored denominator only for documented technical failure that prevents the agreed flow, withdrawal of consent, participant ineligibility, prior rehearsal, material facilitator coaching, or use of an unapproved build/script. Preserve the exclusion reason and do not replace an unfavourable valid result. Recruit replacements until the approved valid-session minimum is met. | QA / UX Research — UAT execution |  | yes |

---

## 10. UX implementation-refinement decisions

| ID | Remaining decision | Source | Recommended ruling | Owner / decision point | Comments / alternative ruling | Approved |
|---|---|---|---|---|---|---|
| IRD-UX-001 | Does mobile combat retain global bottom navigation? | OQ-UX-002 | Retain the global bottom navigation for orientation and access to safe supporting views, but disable or guard any destination that would abandon an unresolved required combat decision. Combat state remains committed domain state and is not lost by opening Adventurer, Inventory, History, or textual-map views. Return focus to the prior combat control when the user returns. | UX / Rules / Accessibility / QA — interactive Palace prototype |  | yes |
| IRD-UX-002 | What label and icon policy applies? | OQ-UX-001 | Required destinations and actions use visible text labels. Icons may reinforce but never replace required labels unless the control has an unambiguous accessible name and passes Palace usability/accessibility review. Reuse one icon for one concept; do not rely on colour or unfamiliar fantasy symbolism alone. | UX / Accessibility — component design |  | yes |
| IRD-UX-003 | How are destructive and blocking workflows presented across responsive layouts? | UX requirements; NFR; Data Model | Use an inline guarded panel where the decision is part of the current mechanical context and a modal/dialog only where the user must explicitly confirm a destructive cross-context action. On phone layouts, bottom sheets may implement the same semantics. Every pattern preserves scope, consequence, cancel, focus return, and duplicate-submission protection. | UX / Accessibility / Technical — component specification |  | yes |
| IRD-UX-004 | How are voluntary diagnostics presented? | OQ-UX-009; OQ-NFR-013 | Generate diagnostics only after an explicit user action. Show a human-readable preview grouped by included technical fields and explicitly excluded private data. Allow copy/download only after review; attach nothing automatically to feedback. Cancelling or generation failure has no gameplay or save effect. | Product / UX / Privacy / Technical — diagnostics UX |  | yes |
| IRD-UX-005 | How are Wireloom layouts governed after Palace testing? | OQ-UX-012 | Treat the approved Wireloom sources as requirements-level low-fidelity baselines, not immutable final layouts. Record each material post-test revision with the affected `WF-UX-*` ID, evidence, accessibility impact, and requirement trace. A layout change may not alter rules, persistence, or scope without the corresponding specification amendment. | UX Lead / Product Owner / QA — Palace review |  | yes |

---

## 11. Hosting, deployment, monitoring, diagnostics, and operations decisions

| ID | Remaining decision | Source | Recommended ruling | Owner / decision point | Comments / alternative ruling | Approved |
|---|---|---|---|---|---|---|
| IRD-OPS-001 | Which static hosting provider is selected? | DEP-MVP-010; OQ-NFR-009; OQ-FRD-009 | Use **Cloudflare Pages** as the production static host, deployed by direct upload from protected GitHub Actions rather than provider-side unreviewed branch builds. Use no Pages Functions for Core MVP. Keep core play and persistence entirely client-side. The hosting plan must record account ownership, recovery access, domain/DNS control, and current cost limits. | Product Owner / Technical-Operations Owner — before prototype deployment |  | yes |
| IRD-OPS-002 | How are immutable artifacts and deployments related? | RD-OPS-001; NFR release integrity | A protected release tag builds one deterministic `dist` archive, content manifest, SBOM, and checksums. Attach the accepted artifact to the corresponding GitHub Release and deploy those exact bytes to Cloudflare Pages. Record the Git commit, artifact hash, Pages deployment ID, rules/content/schema versions, and approval evidence. Do not rebuild source during rollback. | Technical / Operations / QA — deployment pipeline |  | yes |
| IRD-OPS-003 | What rollback procedure and objective apply? | OQ-NFR-017; approved NFR | Retain at least the current and immediately previous accepted production artifacts and Pages deployments. Roll back through the provider deployment rollback or redeploy the retained prior artifact, then run the production smoke suite. Retain the approved **15-minute objective** from declaration to serving the prior accepted shell, excluding external DNS incidents. Rollback must never delete or downgrade local saves. | Operations / QA — deployment drill |  | yes |
| IRD-OPS-004 | What availability monitoring is used? | OQ-NFR-009/010; RD-OPS-002 | Retain the approved 99.5% monthly hosted-shell target. Use an external synthetic HTTPS monitor with checks from at least two geographic regions at no slower than five-minute intervals, plus deployment and asset-error checks. Do not enable real-user analytics, session replay, or gameplay telemetry. The hosting plan selects the monitor vendor and records its data fields and retention. | Operations / Privacy / Product — hosting approval |  | yes |
| IRD-OPS-005 | What security headers and cache controls are required? | NFR security/build; hosting plan | Serve a restrictive Content Security Policy that permits only project-owned static resources unless a reviewed exception exists; deny framing; set MIME-sniffing, referrer, and permissions protections; and separate immutable hashed assets from short-lived HTML/manifest/update metadata. Define headers in the repository and test them in CI and production. | Technical Lead / Security / QA — hosting implementation |  | yes |
| IRD-OPS-006 | What provider logging policy applies? | OQ-NFR-014 | Do not enable Cloudflare Web Analytics or export access logs for routine product analytics. Document unavoidable provider-level request logs, fields, jurisdiction, and retention before public release. Export or retain additional logs only for a time-bounded security/availability incident, with access restricted to the Technical/Operations Owner and no attempt to correlate requests with private gameplay. | Operations / Privacy — hosting approval |  | yes |
| IRD-OPS-007 | Which fields may appear in a voluntary diagnostic package? | OQ-DM-009; OQ-NFR-013; OQ-UX-009 | Permit application/build ID; rules/content/schema/RNG versions; browser and OS family/major version; viewport and input-mode bucket; install/offline/update state; storage usage/quota bands rather than exact contents; error codes and stack fingerprints; feature/context identifiers; and mechanically opaque event IDs needed for support. Exclude names, notes, event text, dice/history payloads, full seeds unless separately selected by the user, save records, Graveyard details, exports, IP address, and persistent user identifiers. | Product / Privacy / Technical / QA — diagnostics schema |  | yes |
| IRD-OPS-008 | Which owners must be named and what access separation applies? | RD-OPS-003; MVP operational gate | Name a Product Owner and Technical/Operations Owner before any external Palace deployment. Before public release, record at least two recoverable administrators for the domain, GitHub organisation/repository, hosting account, and private evidence store. Use least-privilege tokens, protected environments, and documented emergency rotation/revocation. No personal token is embedded in build artifacts. | Product Owner / Operations — prototype and release readiness |  | yes |

---

## 12. Product identity, code licensing, notices, and evidence-governance decisions

| ID | Remaining decision | Source | Recommended ruling | Owner / decision point | Comments / alternative ruling | Approved |
|---|---|---|---|---|---|---|
| IRD-REL-001 | What public product name and visual identity are used before brand review? | OQ-CL-003 | Use **“NoteQuest Web Application”** as the internal/working title only. Before a public landing page or social preview, obtain Rights Reviewer approval for the public title, domain, wordmark/logo, favicon, and social image. Create an independent project mark; do not imitate the source logo, cover, character sheet, page furniture, or trade dress. | Product / UX / Rights — before public landing page |  | yes |
| IRD-REL-002 | What licence applies to project-original code? | OQ-CL-006 | Subject to Rights Reviewer confirmation, license project-original source code under the **MIT License** while explicitly excluding bundled NoteQuest content, table data, names/terminology governed by permission, commissioned/licensed assets, fonts, audio, and third-party components from that grant. Keep code and content/assets in clearly separated paths and publish a licence-boundary notice. Until that boundary is approved, no broad licence statement applies to embedded content. | Product / Technical / Rights — before first public source release/tag |  | yes |
| IRD-REL-003 | Who approves final credits and legal notices? | OQ-CL-002; RD-CONT-003 | The Rights Reviewer supplies or explicitly approves the creator/source-edition credit, adaptation-permission statement, unofficial-product disclaimer, and public evidence wording. The Content Reviewer verifies completeness and the UX Reviewer verifies discoverability online and offline. Draft wording may appear in closed Palace builds only when clearly marked as review-pending and not represented as final legal approval. | Rights / Product / Content / UX — before public RC |  | yes |
| IRD-REL-004 | Which public documentation and marketing surfaces are required? | OQ-CL-010 | For first public release require: repository README, application About/Credits and storage/privacy guidance, release notes, installation/offline instructions, known limitations, feedback/diagnostic instructions, favicon/application icons, and one approved social-preview image. Additional trailers, storefronts, press kits, or campaign sites are not Core MVP release gates. | Product / Documentation / Content — release plan |  | yes |
| IRD-REL-005 | How are approval and waiver records signed and retained? | Test Plan approval; evidence governance | Record approvals and waivers as dated repository documents or protected review records identifying role, decision, scope, release ID, conditions, and evidence references. A waiver expires at the named release or date and cannot waive a blocker/critical rule, data-corruption, rights, or required accessibility gate unless the controlling approved specification expressly allows it. Private signatures/contact data remain outside the public repository. | Product Owner / QA / Operations / Rights — release governance |  | yes |

---

## 13. Post-Palace visual and asset-production decisions

| ID | Remaining decision | Source | Recommended ruling | Owner / decision point | Comments / alternative ruling | Approved |
|---|---|---|---|---|---|---|
| IRD-ASSET-001 | When is the final visual/asset plan created? | DEP-MVP-011; RD-UX-005 | Create and approve the detailed visual direction and asset-production plan only after a written Palace go decision. Palace uses inventoried rights-safe placeholders. This timing is approved now; the actual final asset list and budget remain deferred by gate. | Product Owner / UX / Content — after Palace go |  | yes |
| IRD-ASSET-002 | What must the post-Palace plan contain? | OQ-UX-011; OQ-NFR-015; OQ-CL-005 | Include final design tokens, typography, map symbols, iconography, illustration/card list, motion/audio plan, responsive variants, accessibility checks, source/licence or commission records, file formats, size/cache budgets, production ownership, schedule, capped budget, and replacement/fallback policy. Every asset remains independently release-gated. | UX / Accessibility / Content / Technical / Product — asset-plan approval |  | yes |
| IRD-ASSET-003 | How are visual exceptions to NFR budgets approved? | OQ-NFR-015 | Treat NFR image, font, content, and offline-cache budgets as controlling. An exception requires measured Palace/Core benefit, accessible fallback, revised performance evidence on reference profiles, quantified cache impact, and Product/Technical/UX approval. Rights approval alone does not justify a performance-budget exception. | Product / Technical / UX / QA — post-Palace asset review |  | yes |

---

## 14. Decision priority and sequencing

| Sequence | Decisions | Required before |
|---:|---|---|
| 1 | IRD-ARCH-001 through IRD-ARCH-006; IRD-DATA-001 through IRD-DATA-004; IRD-RNG-001/002 | Application scaffold, domain implementation, and persistence code |
| 2 | IRD-SER-001/002; IRD-EXP-001/002; IRD-DATA-005 through IRD-DATA-009 | Save/export/import, migration, recovery, history, and form implementation |
| 3 | IRD-CONT-001 through IRD-CONT-005; IRD-TEST-001 through IRD-TEST-006; IRD-SIM-001 through IRD-SIM-005 | Palace content freeze, CI, deterministic fixtures, and simulation gate |
| 4 | IRD-UX-001 through IRD-UX-005; IRD-UAT-001 through IRD-UAT-007 | Interactive Palace prototype and participant recruitment |
| 5 | IRD-OPS-001 through IRD-OPS-008; IRD-TEST-007; IRD-REL-001 through IRD-REL-005 | External Palace deployment, public RC, and release operations |
| 6 | IRD-ASSET-001 through IRD-ASSET-003 | Final asset production after written Palace go |

### 14.1 Blocking interpretation

- Coding may begin after Sequence 1 decisions are approved and the Architecture Specification incorporates them.
- Palace external testing may not begin until Sequences 1 through 4 and the applicable rights/hosting controls in Sequence 5 are approved and implemented.
- Public release may not proceed until all applicable rows are approved and evidenced.
- Asset-production rows deliberately do not authorise spending or commissioning before the Palace go decision.

---

## 15. Downstream document and artifact updates

Approval of this register requires the following follow-up work:

| Area | Required update |
|---|---|
| Architecture | Create the [Web Architecture, Offline Strategy and Hosting Plan](web-architecture-offline-hosting-plan-v0.1.md) with component boundaries, physical IndexedDB schema/indexes, PWA lifecycle, import/export pipeline, deployment design, threat controls, and architecture diagrams. |
| Data Model | Add a physical-schema mapping appendix or implementation note without changing logical invariants. |
| UX | Apply approved mobile-combat, diagnostics, blocking-workflow, and post-test Wireloom governance decisions. |
| NFR | Record accepted provider/reference-environment refinements while preserving approved Must thresholds. |
| Content | Create Palace row-level manifest, normalisation log, placeholder inventory, permission evidence index, dependency/asset manifests, and draft/final notice records. |
| Test Plan | Freeze toolchain, cadence, fixtures, UAT script, survey, evidence locations, flaky-test policy, and RC matrix. |
| Operations | Create hosting runbook, account/access register, deployment and rollback procedures, monitoring/logging record, incident process, and owner assignments. |
| Repository | Add the application scaffold, CI workflows, security/licence gates, evidence directories, and licence-boundary files only after applicable decisions are approved. |

---

## 16. Completion gate

The decision-approval portion of this register is complete. Downstream incorporation and implementation evidence remain open.

- [x] Every decision row contains `yes`, or `no` with a complete controlling alternative.
- [x] No approved alternative contradicts Decision Registers v0.1/v0.2, the DRS, BRD, [MVP Scope](mvp-scope-v0.1.md), or approved licensing boundaries without an explicit scope amendment.
- [ ] Architecture-blocking rows are incorporated into the approved [Web Architecture, Offline Strategy and Hosting Plan](web-architecture-offline-hosting-plan-v0.1.md).
- [ ] Physical persistence, RNG, canonical serialisation, export, import, and recovery decisions have deterministic reference tests.
- [ ] Test, security, licence, simulation, and CI decisions are implemented in protected workflows.
- [ ] Palace content, placeholder, participant, consent, task, questionnaire, seed, and evidence plans are frozen before external testing.
- [x] Hosting, monitoring, logging, diagnostics, owner, access, rollback, evidence, identity, notice, and licence-boundary decision rulings are approved; their required implementation and specialist review remain release-gated.
- [x] Post-Palace asset decisions remain deferred until a written go decision and are not treated as pre-approved production spend.
- [ ] BRD, [MVP Scope](mvp-scope-v0.1.md), PRD, FRD, Data Model, UX, NFR, Content Requirements, Test Plan, and future Architecture documents reference this register where applicable.

---

## 17. Approval record

The Product Owner has explicitly accepted all 66 recommended rulings as written. Specialist reviewers must still approve or verify their applicable downstream implementation, evidence, rights, accessibility, security, testing, and operational artefacts.

| Role | Name | Decision | Date | Notes |
|---|---|---|---|---|
| Product Owner |  | Approved | 2026-07-17 | All 66 recommended rulings accepted as written. |
| Rules / Product Designer |  | Pending / Approved / Rejected |  | Domain isolation, RNG use, content normalisation, fixtures, and simulations |
| Technical Lead / Architect |  | Pending / Approved / Rejected |  | Stack, state, storage, PWA, serialisation, import/export, CI, and deployment |
| Data Modeller |  | Pending / Approved / Rejected |  | Physical mapping, transaction, snapshot, and retention decisions |
| UX / Accessibility Lead |  | Pending / Approved / Rejected |  | Responsive patterns, mobile combat, diagnostics, labels, UAT, and assets |
| QA / Test Lead |  | Pending / Approved / Rejected |  | Toolchain, coverage, cadence, fixtures, evidence, simulation, and gates |
| Content / Licensing Reviewer |  | Pending / Approved / Rejected |  | Content workflow, manifests, assets, dependency licences, and notices |
| Rights / Legal Reviewer |  | Pending / Approved / Rejected |  | Permission evidence, product identity, exact text, code/content boundary, and public notices |
| Privacy / Security Reviewer |  | Pending / Approved / Rejected |  | Diagnostics, participant data, logs, imports, scanning, and evidence handling |
| Technical / Operations Owner |  | Pending / Approved / Rejected |  | Hosting, access, monitoring, artifacts, deployment, incident handling, and rollback |
