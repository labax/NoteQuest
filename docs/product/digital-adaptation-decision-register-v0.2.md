# NoteQuest Digital Adaptation Decision Register

## Remaining Decisions after BRD and MVP Scope Approval

*Version 0.2 | Draft for Review | Prepared for the NoteQuest Project*

| Field | Value |
|---|---|
| Document owner | Product Owner |
| Supersedes | The open-question function of `digital-adaptation-decision-register.md`; previously approved decisions remain valid |
| Related documents | [Original Decision Register](digital-adaptation-decision-register.md); [Business Requirements Document v0.1](business-requirements-v0.1.md); [MVP Scope v0.1](mvp-scope-v0.1.md); [Digital Adaptation Feasibility Study](digital-adaptation-feasibility-study.md); *NoteQuest* rulebook, first edition |
| Purpose | Consolidate the formal decisions still required before detailed rules, architecture, UX, content, operations, and test specifications are approved |
| Status | Draft for review |
| Last updated | 2026-07-16 |

---

## 1. How to use this register

- Review each recommended ruling.
- Enter `yes` in **Approved** when the recommendation is accepted without change.
- Enter `no` when the recommendation is rejected; in that case, the resolution written in **Comments / alternative ruling** becomes the approved baseline.
- Do not leave **Comments / alternative ruling** empty when **Approved** is `no`.
- A row remains open until it contains either an approved recommendation or a complete approved alternative.
- Approved rows must be incorporated into the relevant Digital Rules, Functional Requirements, Data Model, UX, Non-Functional Requirements, Content/Licensing, Operations, and Acceptance Criteria documents.

## 2. Decisions already fixed by approved documents

The following matters are no longer open and should not be reconsidered without formal scope change:

| Area | Approved baseline |
|---|---|
| Product | Faithful full digital adaptation rather than a tabletop assistant or expanded roguelike |
| Delivery | Free web application, designed web-first |
| Interaction | Full responsive support; no native mobile application is required for MVP |
| Player model | Single-player only for the core MVP |
| Content | Six core dungeon types and core NoteQuest content |
| Connectivity | Offline-first local play with no mandatory account or continuous connection |
| Core loop | Adventurer generation, exploration, combat, retreat, town, death/recovery, boss completion, and resume |
| Persistence | Persistent dungeons, adventurers, inventory, dropped items, corpses or belongings, event history, and Graveyard |
| Prototype | One complete dungeon must pass a mechanical prototype gate before full six-dungeon production |
| Exclusions | Expanded World, multiplayer, crafting, tactical grid combat, cloud accounts, live services, monetisation, and localisation are outside the core MVP |
| Privacy | No production analytics or reuse of private play data without separate approval |

---

## 3. Product and prototype decisions

| ID | Remaining decision | Source | Recommended ruling | Owner / decision point | Comments / alternative ruling | Approved |
|---|---|---|---|---|---|---|
| RD-PROD-001 | Which core dungeon will be used for the one-dungeon mechanical prototype? | OQ-MVP-005 | Use **Palace**, because it is the first core dungeon set and provides a neutral representative baseline for generation, encounters, treasure, boss resolution, persistence, and recovery. | Product Owner / Rules Designer — before prototype backlog creation |  | yes |
| RD-PROD-002 | What evidence is required to pass the prototype go/no-go gate? | BRD OQ-008; MVP prototype gate | Require all Must prototype scenarios to pass, zero non-terminating seeds in the approved simulation set, zero save-state corruption in the fault matrix, at least 80% unaided core-flow completion, and at least 70% of representative testers rating combat pacing, map clarity, and overall play as acceptable or better. | Product Owner / QA — before prototype acceptance plan |  | yes |
| RD-PROD-003 | When may all six dungeons enter full production? | BR-022; MVP section 7.1 | Only after a written go decision confirms the prototype passed rules, termination, persistence, map, torch-pressure, death/recovery, responsive, and playtest gates. | Product Owner — prototype review |  | yes |
| RD-PROD-004 | What is the release-planning model? | BRD OQ-010 | Use milestone-based planning rather than a fixed public date until the prototype passes. Establish dates only after Rules, Architecture, UX, Data, NFR, and Test specifications are approved and estimated. | Product Owner — roadmap approval |  | yes |

---

## 4. Browser, responsive, and web architecture decisions

| ID | Remaining decision | Source | Recommended ruling | Owner / decision point | Comments / alternative ruling | Approved |
|---|---|---|---|---|---|---|
| RD-TECH-001 | What browser and viewport matrix is supported? | BRD OQ-001; OQ-MVP-001 | Support the current and previous two major versions of Chrome, Edge, Firefox, and Safari at release. Validate representative widths of 360, 390, 768, 1024, 1280, and 1440 CSS pixels. Required controls and state must remain available at every supported width. | Technical Lead / UX Lead — before UX and NFR approval |  | yes |
| RD-TECH-002 | Does “full responsive support” include phone browsers? | Decision-register conflict; approved BRD and MVP | Yes. Phone-browser support is a Must for the responsive web MVP. This does not require a native phone application, equal information density, or identical layout across sizes. | Product Owner / UX Lead — before wireframes |  | yes |
| RD-TECH-003 | What offline web strategy should be used? | BRD OQ-002; OQ-MVP-002 | Deliver an installable Progressive Web Application. Cache the versioned application shell and approved static content with a service worker; store game state in IndexedDB; do not require a backend for core play. | Technical Lead — architecture approval |  | yes |
| RD-TECH-004 | What happens when an application update is available? | Offline/update dependency | Keep the active session on its current application version until a safe save point. Notify the user that an update is available, then activate it after reload. Never replace an active rules/content version silently during an unresolved action. | Technical Lead / UX Lead — architecture and UX approval |  | yes |
| RD-TECH-005 | How many local save slots are required? | MVP-007 detail | Provide three named save slots. Each slot contains one active game state, one last-known-valid recovery snapshot, schema version, rules/content version, and update timestamp. | Product Owner / Technical Lead — Data Model approval |  | yes |
| RD-TECH-006 | Is save export/import required for MVP? | BRD OQ-006; OQ-MVP-003 | Promote versioned save export and validated import from Should to **Must** because browser storage can be cleared outside the application. Export must include a plain warning that the file contains private play data. | Product Owner / Technical Lead — persistence architecture review |  | yes |
| RD-TECH-007 | What save-migration policy applies? | BRD BR-010/011; MVP persistence scope | Use explicit versioned migrations. Migrate sequentially, retain the pre-migration last-valid snapshot, reject newer unsupported schemas without modification, and never report success unless validation and durable write complete. | Technical Lead / QA — Data Model and NFR approval |  | yes |
| RD-TECH-008 | What randomness and reload policy applies? | Feasibility study; MVP persistence scope | Use separate deterministic random streams for dungeon generation, combat, and expedition repopulation. Persist the resolved result or stream state before presentation so reloading cannot reroll an already committed outcome. | Rules Designer / Technical Lead — Digital Rules and Architecture approval |  | yes |

---

## 5. Dungeon-generation decisions

| ID | Remaining decision | Source | Recommended ruling | Owner / decision point | Comments / alternative ruling | Approved |
|---|---|---|---|---|---|---|
| RD-RULE-001 | What target and hard maximum govern each generated floor? | BRD OQ-007; OQ-MVP-006 | Use a target of **six generated non-stair segments** per floor and a hard maximum of **ten**. After the target, increase the downward-stair probability by one sixth for each additional valid generated segment; at the hard maximum, force the next valid unexplored connection to become stairs. | Rules Designer — Digital Rules Specification approval |  | yes |
| RD-RULE-002 | What simulation volume validates termination? | BR-012; MVP release gate | Test at least 100,000 deterministic seeds per dungeon type for the final generation algorithm. Acceptance requires zero non-terminating dungeons, zero unreachable boss rooms, and reproducible failure details for any rejected build. | QA / Technical Lead — Test Plan approval |  | yes |
| RD-RULE-003 | Can generation constants change after saves exist? | Persistence and reproducibility dependency | Treat generation constants as rules-versioned content. Existing dungeons retain the version under which they were created; new constants apply only to new dungeons unless an explicit migration is approved. | Rules Designer / Technical Lead — Rules and Data Model approval |  | yes |

---

## 6. Event history, explainability, and storage decisions

| ID | Remaining decision | Source | Recommended ruling | Owner / decision point | Comments / alternative ruling | Approved |
|---|---|---|---|---|---|---|
| RD-DATA-001 | Which events must be persisted? | OQ-MVP-007; BR-019 | Persist every random result and every state-changing action needed to explain adventurer, dungeon, encounter, inventory, torch, town, death, recovery, and completion outcomes. Cosmetic-only animations and repeated UI navigation need not be stored. | Product Owner / QA / Technical Lead — Data Model approval |  | yes |
| RD-DATA-002 | How much event history remains available to the player? | OQ-MVP-007 | Keep the complete structured history for active and incomplete dungeons. After completion, retain a permanent summary plus the final 500 mechanically relevant entries. Display the most recent 200 entries by default while allowing older retained entries to be loaded. | Product Owner / Technical Lead — NFR approval |  | yes |
| RD-DATA-003 | May diagnostic logs contain game history? | Privacy baseline | Production diagnostics may contain event IDs, rule/content versions, error codes, and non-sensitive technical context, but not adventurer names, private notes, full event text, save contents, Graveyard details, or exported files. | Technical Lead / Privacy Reviewer — NFR approval |  | yes |

---

## 7. Accessibility and UX decisions

| ID | Remaining decision | Source | Recommended ruling | Owner / decision point | Comments / alternative ruling | Approved |
|---|---|---|---|---|---|---|
| RD-UX-001 | What accessibility standard applies? | BRD OQ-005; OQ-MVP-004 | Target **WCAG 2.2 Level AA** for applicable web content and controls. Any exception must be documented, justified, and approved before release. | UX Lead / QA — NFR approval |  | yes |
| RD-UX-002 | What assistive-technology matrix is required? | OQ-MVP-004 | Test keyboard-only use in every supported browser; NVDA with Firefox and Chrome on Windows; VoiceOver with Safari on macOS and iOS; and TalkBack with Chrome on Android for phone-browser smoke testing. | UX Lead / QA — Test Plan approval |  | yes |
| RD-UX-003 | What is the textual-map baseline? | BRD OQ-005 | Provide the current segment, floor, occupants, hazards, dropped items or corpses, each connection and door state, and a navigable ordered route toward the entrance. All map actions available visually must have an equivalent keyboard and textual path. | UX Lead / Rules Designer — UX requirements approval |  | yes |
| RD-UX-004 | What is the MVP visual direction? | OQ-MVP-008 | Use a 2D monochrome ink-and-notebook presentation with a restrained warm torch accent. The map draws as a flexible diagram; monsters and items use simple illustrated cards or silhouettes; animations remain optional and skippable. | Product Owner / UX Lead — visual-direction approval |  | yes |
| RD-UX-005 | When is final replacement art commissioned? | BRD OQ-004; OQ-MVP-008 | Use placeholders through the mechanical prototype. Complete the asset-rights inventory and approve an art-production plan and capped budget only after the prototype passes. Source artwork is excluded unless explicit digital-use evidence exists for that asset. | Product Owner / Content Reviewer — after prototype go decision |  | yes |

---

## 8. Content, rights, notices, and language decisions

| ID | Remaining decision | Source | Recommended ruling | Owner / decision point | Comments / alternative ruling | Approved |
|---|---|---|---|---|---|---|
| RD-CONT-001 | May exact rulebook prose appear in the application? | Original LIC-002; OQ-MVP-010 | Default to original concise UI wording and paraphrased rule explanations. Use exact source prose only where the written permission explicitly covers digital reproduction of that text. | Content / Licensing Reviewer — Content Requirements approval |  | yes |
| RD-CONT-002 | How are source artwork rights handled? | BRD OQ-004 | Maintain an asset-by-asset rights record. Absence of explicit digital-use evidence means replacement art is required; permission for rules, tables, names, or adaptation does not automatically approve artwork. | Content / Licensing Reviewer — before art production |  | yes |
| RD-CONT-003 | What attribution and rights notices are required? | BRD OQ-009 | Place the approved author/publisher credit, source-edition reference, adaptation-rights statement, asset licences, and required third-party notices in an About/Credits view reachable from the main menu and in the distributed repository or release notices. Exact legal wording must be supplied or approved by the rights reviewer. | Content / Licensing Reviewer — before public release candidate |  | yes |
| RD-CONT-004 | What language is included in MVP? | Original LIC-010; approved MVP exclusion | Release the MVP in English only. Localisation and translated public releases remain deferred until translation rights, terminology ownership, and localisation workflow are separately approved. Externalise user-facing strings where practical, but localisation completeness is not an MVP gate. | Product Owner / Content Reviewer — Content Requirements approval |  | yes |

---

## 9. Hosting, operations, maintenance, and feedback decisions

| ID | Remaining decision | Source | Recommended ruling | Owner / decision point | Comments / alternative ruling | Approved |
|---|---|---|---|---|---|---|
| RD-OPS-001 | What hosting and deployment model should operate the free application? | BRD OQ-003; OQ-MVP-009 | Host the static PWA on a CDN-backed static web platform. Deploy through protected GitHub Actions from versioned tags, keep immutable release artifacts, retain the previous production release, and support one-action rollback. Core gameplay must not depend on an application server. | Technical Lead / Operations Owner — before prototype deployment |  | yes |
| RD-OPS-002 | What monitoring is permitted? | Privacy baseline; OQ-MVP-009 | Monitor availability, deployment status, asset errors, and aggregate infrastructure health without collecting private saves or gameplay events. Any user telemetry requires a separate decision register entry and privacy approval. | Operations Owner / Privacy Reviewer — NFR approval |  | yes |
| RD-OPS-003 | Who owns post-release maintenance? | BRD OQ-010 | Assign a named Product Owner for release decisions and a named Technical/Operations Owner for deployment, rollback, dependency updates, browser compatibility, and critical defects before release approval. | Product Owner — roadmap and operations approval |  | yes |
| RD-OPS-004 | What maintenance commitment applies? | BRD OQ-010 | Provide critical data-loss and security fixes as release blockers, review dependency and browser compatibility at least quarterly, and publish no guaranteed feature cadence for the free application. | Product Owner / Operations Owner — release plan approval |  | yes |
| RD-OPS-005 | How is post-release feedback collected without analytics? | BRD success indicators; privacy baseline | Use voluntary GitHub issues or a clearly linked feedback form that does not attach save data automatically. Users may attach an exported diagnostic package only after reviewing its contents. | Product Owner / QA — release UX approval |  | yes |

---

## 10. Decision priority and sequencing

| Sequence | Decisions required | Blocks |
|---:|---|---|
| 1 | RD-PROD-001, RD-RULE-001, RD-RULE-003, RD-TECH-008 | Digital Rules Specification and prototype backlog |
| 2 | RD-TECH-001 through RD-TECH-007 | Architecture, Data Model, UX flows, and NFRs |
| 3 | RD-UX-001 through RD-UX-003 | Responsive wireframes, accessibility requirements, and test plan |
| 4 | RD-DATA-001 through RD-DATA-003 | Data Model, persistence, privacy, and observability requirements |
| 5 | RD-CONT-001 through RD-CONT-004 | Content/Licensing Requirements and public content gate |
| 6 | RD-OPS-001 through RD-OPS-005 | Prototype deployment and release operations |
| 7 | RD-PROD-002 through RD-PROD-004 and RD-RULE-002 | Prototype go/no-go and full-production approval |
| 8 | RD-UX-004 and RD-UX-005 | Final presentation production after prototype validation |

## 11. Completion gate

This register is complete when:

- [ ] Every row contains `yes`, or `no` with a complete controlling alternative in the comments column.
- [ ] Conflicting earlier statements have been resolved by the newer approved ruling.
- [ ] Approved rules decisions are incorporated into the Digital Rules Specification.
- [ ] Approved technical and persistence decisions are incorporated into the architecture, Data Model, and NFR documents.
- [ ] Approved UX and accessibility decisions are incorporated into UX flows, wireframes, and the test plan.
- [ ] Approved content and rights decisions are incorporated into the Content and Licensing Requirements and content inventory.
- [ ] Approved operations decisions are incorporated into the deployment and maintenance plan.
- [ ] All downstream documents cite this register version where they depend on these decisions.

## 12. Approval record

| Role | Name | Decision | Date | Notes |
|---|---|---|---|---|
| Product Owner |  | Pending / Approved / Rejected |  |  |
| Rules / Product Designer |  | Pending / Approved / Rejected |  |  |
| Technical Lead |  | Pending / Approved / Rejected |  |  |
| UX/UI Lead |  | Pending / Approved / Rejected |  |  |
| QA Lead |  | Pending / Approved / Rejected |  |  |
| Content / Licensing Reviewer |  | Pending / Approved / Rejected |  |  |
| Operations Owner |  | Pending / Approved / Rejected |  |  |
