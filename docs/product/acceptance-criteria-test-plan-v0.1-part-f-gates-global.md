# Acceptance Criteria / Test Plan v0.1 - Part F - Release Gates and Global Acceptance Criteria

This file is a normative part of [Acceptance Criteria / Test Plan v0.1](acceptance-criteria-test-plan-v0.1.md).

*Status: Draft for Review | Last updated: 2026-07-17*

---

## 13. Release Acceptance Gates

### 13.1 Palace prototype gates

| Gate | Name | Pass condition | Evidence | Owner |
|---|---|---|---|---|
| GATE-PAL-001 | Scope | All Palace Must mechanics and terminal paths are implemented. | Scope/traceability report | Product / QA |
| GATE-PAL-002 | Rules | All applicable DRS reference and Palace rules fixtures pass. | Automated rules report | Rules / QA |
| GATE-PAL-003 | Generation | At least 100,000 Palace seeds produce zero non-terminating or unreachable-boss cases. | Simulation report with reproducible seed evidence | Technical / QA |
| GATE-PAL-004 | Persistence | Save/reload and fault matrices show zero silent corruption or required unrecoverable loss. | Persistence/fault report | Technical / QA |
| GATE-PAL-005 | Lifecycle | Boss victory, retreat/re-entry, normal death, darkness death, replacement, and recovery paths pass. | E2E evidence | QA / Product |
| GATE-PAL-006 | UX | At least 80% of representative users complete the agreed core flow unaided. | UAT report | Product / UX |
| GATE-PAL-007 | Perception | At least 70% rate combat pacing, map clarity, and overall play acceptable or better. | Standard survey | Product / UX |
| GATE-PAL-008 | Responsive | Phone, tablet, desktop, visual map, and textual map journeys pass. | Browser/viewport matrix | UX / QA |
| GATE-PAL-009 | Accessibility | Keyboard and representative NVDA/VoiceOver/TalkBack journeys pass with no Must failure. | Accessibility report | UX / QA |
| GATE-PAL-010 | NFR | Load, action, save, history, import, security/privacy, and storage targets applicable to Palace pass. | NFR evidence | Technical / QA |
| GATE-PAL-011 | Content | Palace row-level inventory, source transcription, placeholders, blocked-content, and notices pass. | Content/licensing report | Content / Rights / QA |
| GATE-PAL-012 | Decision | Product and Technical/Operations owners record written go/no-go; only written go unlocks remaining dungeon production. | Signed decision record | Product / Operations |

### 13.2 Core MVP release gates

| Gate | Name | Pass condition | Evidence | Owner |
|---|---|---|---|---|
| GATE-REL-001 | Documentation | BRD, MVP, PRD, FRD, DRS, Data, UX, NFR, Content/Licensing, Architecture/Operations, and this plan are approved sufficiently for release. | Approval/traceability record | Product / QA |
| GATE-REL-002 | Scope | All Must work is implemented or formally descoped; Won't items remain absent. | Scope audit | Product |
| GATE-REL-003 | Core journey | All major terminal journeys pass without external bookkeeping. | E2E report | QA / Product |
| GATE-REL-004 | Rules | 100% of Must deterministic fixtures and traceability checks pass. | Rules report | Rules / QA |
| GATE-REL-005 | Generation | Each of six dungeon types passes at least 100,000 seeds with zero required generation failure. | Six-dungeon simulation report | Technical / QA |
| GATE-REL-006 | Persistence | Three-slot, snapshots, migration, export/import, interruption, invalid data, quota, reset, and recovery pass. | Persistence matrix | QA |
| GATE-REL-007 | Performance | Must NFR timings and storage/large-save behaviour pass on reference profiles. | Performance report | Technical / QA |
| GATE-REL-008 | Compatibility | Current and previous two major Chrome, Edge, Firefox, and Safari versions pass at required widths. | Browser/viewport report | QA |
| GATE-REL-009 | Accessibility | WCAG 2.2 AA and approved keyboard/NVDA/VoiceOver/TalkBack/textual-map checks pass. | Accessibility audit | UX / QA |
| GATE-REL-010 | Security/privacy | Import safety, XSS, headers, secrets, dependencies, network, storage, logging, and diagnostics pass. | Security/privacy report | Technical / Privacy |
| GATE-REL-011 | Content/licensing | 100% selected content/dependencies/assets are approved; zero blocked items; final notices pass. | Manifest, inventory, notices, approvals | Content / Rights |
| GATE-REL-012 | Free access | Complete approved core experience has no payment, advertising, subscription, sponsorship, or paid unlock. | Release/product audit | Product |
| GATE-REL-013 | Build/release | Protected-ref reproducible artifact, immutable release, smoke, deploy, and previous-artifact rollback pass. | CI/deployment/rollback evidence | Technical / Operations |
| GATE-REL-014 | Defects | Zero Blocker/Critical and no unwaived High defect. | Defect report | Product / QA |
| GATE-REL-015 | Ownership | Named Product and Technical/Operations owners and support/incident procedures exist. | Release record | Product / Operations |

---

## 14. Global Acceptance Criteria

| ID | Acceptance criterion | Priority | Verification |
|---|---|---|---|
| AC-GEN-001 | The complete canonical journey can be completed without the source rulebook, paper map, physical bookkeeping, or external notes. | Must | E2E/UAT |
| AC-GEN-002 | Every legal state-changing action either commits complete state/random/event metadata atomically or leaves the prior valid state unchanged. | Must | Integration/fault |
| AC-GEN-003 | No committed outcome rerolls or duplicates after reload, retry, update, import/export, or rollback. | Must | Deterministic resume matrix |
| AC-GEN-004 | Mechanical results show or retain natural dice, table/row, modifiers, versions, and resulting state changes where applicable. | Must | Rules trace/E2E |
| AC-GEN-005 | Invalid, illegal, incompatible, blocked, or unsupported input fails explicitly and does not mutate valid state. | Must | Negative/fault tests |
| AC-GEN-006 | Cancel and back actions apply no hidden mechanical mutation and restore a logical focus/context. | Must | E2E/accessibility |
| AC-GEN-007 | Required data persists through ordinary close/reopen and is portable through approved export/import. | Must | Persistence/round trip |
| AC-GEN-008 | Each slot is isolated; reset/import/recovery affects only the confirmed scope. | Must | Storage comparison |
| AC-GEN-009 | All required workflows operate at 360, 390, 768, 1024, 1280, and 1440 CSS pixels. | Must | Responsive matrix |
| AC-GEN-010 | All required actions are keyboard operable in every supported browser and do not depend on hover. | Must | Keyboard/browser matrix |
| AC-GEN-011 | Visual and textual maps expose equivalent topology, state, routes, and legal actions. | Must | Parity matrix |
| AC-GEN-012 | Dynamic changes, errors, save failures, turns, movement, death, and completion are announced appropriately without unnecessary focus theft. | Must | AT/manual |
| AC-GEN-013 | The application respects reduced motion, text scaling/reflow, contrast, non-colour communication, and touch-target requirements. | Must | Accessibility audit |
| AC-GEN-014 | Ordinary core play works offline after truthful offline-ready confirmation. | Must | Offline E2E |
| AC-GEN-015 | A failed update or deployment preserves a previously working artifact and cannot corrupt local state. | Must | Update/rollback tests |
| AC-GEN-016 | No hidden telemetry, tracker, automatic diagnostic attachment, or unapproved third-party runtime request occurs. | Must | Network/storage inspection |
| AC-GEN-017 | User names/notes render safely as text and remain private/separate from bundled mechanics. | Must | Security/privacy/UX |
| AC-GEN-018 | All selected content, assets, notices, and dependencies are inventory-listed and approved; blocked items are absent. | Must | Content/licensing gate |
| AC-GEN-019 | No source artwork, logo, page layout, character sheet, screenshot, trade dress, or unapproved verbatim prose appears. | Must | Content/visual audit |
| AC-GEN-020 | The selected public build is English-only, free, non-monetised, single-player, and limited to approved core content. | Must | Scope/release audit |
| AC-GEN-021 | Every Must requirement has planned evidence and final pass/waiver status in traceability. | Must | Traceability audit |
| AC-GEN-022 | A clean checkout can install, validate, test, and build with documented commands. | Must | CI/local verification |
| AC-GEN-023 | Release artifacts identify application, commit, schema, rules, content, generation, and inventory versions. | Must | Artifact/manifest inspection |
| AC-GEN-024 | No Blocker/Critical defect remains and no High defect lacks the required waiver. | Must | Defect report |
