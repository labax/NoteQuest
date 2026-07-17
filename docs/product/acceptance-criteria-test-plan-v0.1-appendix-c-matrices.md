# Acceptance Criteria / Test Plan v0.1 - Appendix C - Rules, Persistence, UX, Accessibility, Responsive, Content, and Licensing Matrices

This file is a normative part of [Acceptance Criteria / Test Plan v0.1](acceptance-criteria-test-plan-v0.1.md).

*Status: Draft for Review | Last updated: 2026-07-17*

---

## 17. Rules Test Matrix

The DRS reference tests remain authoritative. This matrix defines required suite families and expansion coverage; it does not replace individual expected values.

### 17.1 Rules families

| Test family | Fixed inputs / subject | Minimum expected-value coverage | Requirement IDs | Automated |
|---|---|---|---|---|
| RT-DICE | d6/2d6 mapping, fixed seeds, natural results, modifiers, invalid ranges | Every d6 face, every 2d6 total, first/last ranges, gaps/overlaps rejected | DRS-DICE; FRD ADV/DUN/CMB | Yes |
| RT-ADV | Race/class/spells/HP/resources/abilities/starting weapons | Every source row, duplicate spells, min/max HP, no free reroll | DRS-ADV; CHAR | Yes |
| RT-DUN | Name, graph generation, floors, segment table, final room, termination | Every table range; six/ten limits; 100k seeds/dungeon; version constants | DRS-DUN; RD-RULE | Yes |
| RT-DOOR | Door roll/states, traps, locks, keys, breaking, disarm, secret passage | All door outcomes/transitions, costs, repeat guards, generation order | DRS-DOOR; DOOR | Yes |
| RT-LIGHT | Entry/action costs, capacity, final torch, alternative light, hands/arms | Zero/one/ten, warnings, darkness timing, invalid equipment | DRS-LIGHT; LIGHT | Yes |
| RT-CMB | Initiative, turns, target, damage, natural traits, armour, defeat, boss | Natural 1/6 all traits; modifiers; spill/bypass; simultaneous death | DRS-CMB; COMBAT | Yes |
| RT-SPELL | Charges, timing, target, Heal/Light/Teleport/attack spells | Every spell row, zero/max charges, duplicate charges, invalid target | DRS-SPELL; SPELL | Yes |
| RT-ITEM | Capacity, equipment, identity, drops, armour, rewards, modifiers, sales | Every item/armour/weapon/reward row; all locations and boundaries | DRS-ITEM; ITEM/TOWN | Yes |
| RT-STEALTH | Eligibility, cost, dice count, failure, hidden actions, break/end/boss | 0/1/many monsters, natural 1, noisy actions, re-entry, boss | DRS-STEALTH; STEALTH | Yes |
| RT-PER | Expedition, retreat, healing, repopulation, death, containers, recovery | Safe/unsafe routes, first/repeat entry, normal/dark death, multiple deaths | DRS-PER; PERSIST | Yes |
| RT-TOWN | Rest, repair, torches, ordinary/magic sale and modifiers | Insufficient/sufficient coins, caps, every sale die and order | DRS-TOWN; TOWN | Yes |
| RT-HIST | Event evidence, order, summaries, retention, corrections, notes | Every state-changing family, active/completed boundaries, note separation | DRS-HIST; RD-DATA | Yes |
| RT-CONT | Content table transcription and stable definition resolution | Every global and six-dungeon runtime row; source/DRS corrections traced | CNT/CLR; Data provenance | Yes |

### 17.2 Rules acceptance

- 100% of DRS Must reference fixtures pass.
- Every approved table row/range has at least one deterministic selection test.
- Every legal transition has a valid case; every guard has an invalid/no-mutation case.
- Intermediate values are asserted for natural dice, modifiers, costs, damage allocation, table IDs/rows, stream state, and resulting domain changes.
- Any source transcription difference is either a defect or traces to an approved DRS/decision.
- Simulation failures record seed, rules/content/generation versions, graph/result, and invariant.
- Randomness tests validate stream separation so unrelated actions do not alter future results in another stream.

---

## 18. Persistence and Data Safety Matrix

| Test ID | Scenario | Expected behaviour | Data comparison | Result |
|---|---|---|---|---|
| DATA-T001 | Normal save/reload after every committed action family | Equivalent required state; exact legal resume context. | Canonical state + event/random comparison | Not run |
| DATA-T002 | Close/reopen before action confirmation | No uncommitted mutation; safe prior context. | Before/after comparison | Not run |
| DATA-T003 | Failure before transaction begins | Prior valid state; failure visible; no random/event consumption. | Canonical comparison | Not run |
| DATA-T004 | Failure during state/random/event write | No partial commit; prior or complete new state only. | Fault boundary comparison | Not run |
| DATA-T005 | Failure after durable commit before UI success | Reload reveals complete committed state; UI reconciles truthfully. | Storage/event comparison | Not run |
| DATA-T006 | Retry after failed uncommitted action | No duplicate action/event/item or extra random value. | Stream/event counts | Not run |
| DATA-T007 | Quota exceeded during representative actions | No false success; prior valid state and recovery/export guidance. | Storage/fault evidence | Not run |
| DATA-T008 | Private/restricted storage mode | Limitation detected before durability is relied upon; graceful guidance. | Browser test | Not run |
| DATA-T009 | Invalid/corrupt slot | Affected slot isolated; other slots unchanged/loadable. | Per-slot canonical comparison | Not run |
| DATA-T010 | Last-valid snapshot creation and rotation | Eligible slot retains valid recovery; only recovery state not deleted. | Snapshot metadata/content | Not run |
| DATA-T011 | Recovery preview/cancel/confirm/failure | Exact scope/reason shown; cancel no change; activation atomic. | Snapshot/state comparison | Not run |
| DATA-T012 | Export round trip same browser | Equivalent selected slot, versions, provenance, identities. | Canonical comparison | Not run |
| DATA-T013 | Export/import cross browser/device | Portable equivalent state in same/later supported schema. | Canonical comparison | Not run |
| DATA-T014 | Malformed/future/blocked/oversized import | Rejected; no valid data changes. | Before/after snapshot | Not run |
| DATA-T015 | Import replacement cancel/interrupt | Cancel no change; interruption restores prior/pre-import state. | Snapshot comparison | Not run |
| DATA-T016 | Supported sequential migration | All required records/links/evidence preserved; invariants pass. | Fixture equivalence | Not run |
| DATA-T017 | Interrupted migration every step | No partial active migration; original/recovery retained. | Fault matrix | Not run |
| DATA-T018 | Unsupported newer schema | Explicit incompatible state; no downgrade/reset/mutation. | Before/after comparison | Not run |
| DATA-T019 | Application reset selected slot | Only named app-owned slot data removed; other slots/origin data untouched. | Storage inspection | Not run |
| DATA-T020 | Death atomicity | Death, Graveyard, container, items, segment, active state, event consistent. | Invariant/canonical comparison | Not run |
| DATA-T021 | Boss completion atomicity | Boss/rewards/completion/summary/actions/save consistent. | Invariant/canonical comparison | Not run |
| DATA-T022 | Item transfer endurance | One identity/one location after 10,000 deterministic actions. | Invariant counts | Not run |
| DATA-T023 | Active/completed history retention | Complete active; summary + final 500 completed; latest 200 default. | Record/count comparison | Not run |
| DATA-T024 | Service-worker update/rollback | No unsafe activation or destructive save downgrade; prior artifact remains. | E2E/storage comparison | Not run |
| DATA-T025 | Content definition removed/changed | Stable version resolves or explicit incompatibility; no silent substitution. | Content/migration comparison | Not run |

### 18.1 Fault-volume acceptance

- At least **1,000 injected persistence failures** across representative action families and atomic boundaries.
- At least **10,000 deterministic ordinary actions** with invariants after every action.
- At least one interruption case at every supported migration step and snapshot switch.
- Every invalid import category from NFR-SEC/NFR-DR.
- Zero silent corruption, false success, duplicate committed outcome, lost required identity, or required unrecoverable loss.

---

## 19. UX, Accessibility, and Responsive Matrix

| Test ID | Area | Environment/method | Expected result | Result |
|---|---|---|---|---|
| UX-T001 | Keyboard completion - first launch/creation | Every supported browser | All actions operable; visible logical focus; no hover dependence. | Not run |
| UX-T002 | Keyboard completion - expedition/combat/inventory/town | Every supported browser | Map, targets, capacity, confirmations, and history complete. | Not run |
| UX-T003 | Dialog/sheet/drawer focus | Component + E2E | Focus enters, remains, close/cancel/commit restores logically. | Not run |
| UX-T004 | Labels/errors/descriptions | Automated + manual | 100% required controls/forms labelled; errors associated. | Not run |
| UX-T005 | Dynamic status announcements | NVDA/VoiceOver/TalkBack | Roll, turn, move, save, failure, import, death/completion understood. | Not run |
| UX-T006 | Visual/textual map parity | Automated data + manual/AT | Same current segment, floor, occupants, hazards, items/corpses, doors, route, actions. | Not run |
| UX-T007 | Colour-independent state | Visual review/high-contrast | Position, target, warning, result, and status use text/icon/structure. | Not run |
| UX-T008 | Reduced motion | Browser preference | No essential meaning lost; nonessential animation removed/shortened. | Not run |
| UX-T009 | 200% zoom and reflow | Desktop/phone | No loss of content/function and focus not obscured. | Not run |
| UX-T010 | Text spacing and long content | FX-A11Y-LONG | Names, notes, errors, events, and notices wrap/scroll safely. | Not run |
| UX-T011 | Touch targets and spacing | Android/iOS phone | Required targets meet NFR target or documented equivalent spacing. | Not run |
| UX-T012 | 360 width | REF-MIN-WIDTH | Complete core journey; no clipped controls; sheets/dialogs fit. | Not run |
| UX-T013 | 390 width | REF-MOBILE | Complete core journey; map/text switch and bottom controls usable. | Not run |
| UX-T014 | 768 width | Tablet portrait | Stacked layout preserves state/action hierarchy. | Not run |
| UX-T015 | 1024 width | Tablet landscape/narrow desktop | Main workspace and secondary panels remain complete. | Not run |
| UX-T016 | 1280/1440 widths | Desktop | Persistent state/workspace/action regions; no excessive navigation. | Not run |
| UX-T017 | Orientation/viewport change | Phone/tablet | No lost action, duplicated commit, obscured focus, or state reset. | Not run |
| UX-T018 | Offline/recovery/error content | Keyboard/AT/manual | Errors state impact/no-change/recovery; notices truthful and reachable. | Not run |
| UX-T019 | NVDA Firefox + Chrome | Windows RC versions | Representative core flow passes. | Not run |
| UX-T020 | VoiceOver Safari | macOS + iOS RC versions | Representative desktop/phone flow passes. | Not run |
| UX-T021 | TalkBack Chrome | Android RC version | Representative phone flow passes. | Not run |
| UX-T022 | WCAG automated support scan | All primary screens/states | No unreviewed serious finding; manual evidence still required. | Not run |

### 19.1 Accessibility exceptions

Any proposed WCAG exception must identify criterion, affected flow, users, evidence, rationale, workaround, remediation plan, owner, and explicit approval. An exception cannot remove the complete textual-map or keyboard path from Core MVP acceptance.

---

## 20. Content and Licensing Matrix

| Test ID | Check | Expected result | Evidence | Result |
|---|---|---|---|---|
| LIC-T001 | Release inventory coverage | Every bundled runtime definition, text, notice, asset, font, icon, and distributed dependency is listed. | Manifest/build comparison | Not run |
| LIC-T002 | Required provenance fields | Stable ID, type, source, location, version, rights/licence, modes, restrictions, attribution, approval, hash present. | Schema validation | Not run |
| LIC-T003 | Source table transcription | Every global and six-dungeon row matches source or approved DRS correction. | Dual review + deterministic fixtures | Not run |
| LIC-T004 | Unknown/restricted/blocked content | Zero selected entries; blocked variant fails build. | CI validation | Not run |
| LIC-T005 | Verbatim source prose | Absent unless item-level exact-text evidence/approval exists. | Source-text search/manual review | Not run |
| LIC-T006 | Source visuals/trade dress | No logo, cover/dungeon art, page image, layout, Graveyard sheet, borders, or imitation. | Asset/repository/design review | Not run |
| LIC-T007 | Backer/personal source data | Backer list and unnecessary personal data absent. | Text/search audit | Not run |
| LIC-T008 | Creator/source/permission/unofficial notices | Approved wording present in About/Credits, NOTICE/release, and required surfaces; offline reachable. | Rendered/file review | Not run |
| LIC-T009 | Project-original paraphrase | Help/flavour is original, concise, and adds no mechanics/lore. | Content/rules review | Not run |
| LIC-T010 | Placeholder assets | Every Palace placeholder rights-safe, replaceable, nonessential, and inventoried. | Asset inventory/UX review | Not run |
| LIC-T011 | Final assets/fonts/icons | Embedding/redistribution/attribution/contract records complete. | Asset/licence audit | Not run |
| LIC-T012 | Software dependencies | 100% distributed dependency licence inventory and required notices. | Lock/dependency report | Not run |
| LIC-T013 | Code/content licence separation | Repository/public notices do not imply code licence covers embedded NoteQuest content. | Rights/repository review | Not run |
| LIC-T014 | Import/export provenance | Content versions/IDs retained; unneeded source prose/visuals not embedded. | Package inspection | Not run |
| LIC-T015 | User content separation | User names/notes/saves are private and not labelled as official/bundled. | UX/schema/privacy test | Not run |
| LIC-T016 | Release mode and language | Public build free, non-monetised, English-only, core-only; no expansion/localisation/commercial claims. | Scope/build/public-copy audit | Not run |
| LIC-T017 | Screenshots/docs | Only approved application UI/content; no source-page images or blocked assets. | Documentation/marketing checklist | Not run |
| LIC-T018 | Release evidence | Exact inventory, hashes, dependency report, notices, approvals, and screenshots retained. | Release package audit | Not run |
