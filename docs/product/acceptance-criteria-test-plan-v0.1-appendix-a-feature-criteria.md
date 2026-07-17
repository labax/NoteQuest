# Acceptance Criteria / Test Plan v0.1 - Appendix A - Feature-Level Acceptance Criteria

This file is a normative part of [Acceptance Criteria / Test Plan v0.1](acceptance-criteria-test-plan-v0.1.md).

*Status: Draft for Review | Last updated: 2026-07-17*

---

## 15. Feature-Level Acceptance Criteria

The tables below define minimum feature acceptance. Detailed DRS outcomes, FRD states, and Data Model invariants remain controlling and expand these rows.

### 15.1 Application shell and save slots

| ID | Given | When | Then | Priority | Requirement IDs |
|---|---|---|---|---|---|
| AC-APP-001 | Given a first visit with available storage | When the app completes required caching | Then it shows three slots and truthful offline-ready/local-storage guidance. | Must | APP-001-014; SAV; NFR-AVL |
| AC-APP-002 | Given an empty slot | When the user starts a game | Then only that slot enters creation and other slots remain unchanged. | Must | APP; SAV; DMI slot isolation |
| AC-APP-003 | Given a valid existing slot | When Continue is selected | Then the exact last committed legal context is restored. | Must | APP; SAV; XFR-SAVE |
| AC-APP-004 | Given an invalid/incompatible slot | When slots load | Then that slot is isolated with recovery/export/reset guidance and valid slots remain usable. | Must | APP; ERR; SAV |
| AC-APP-005 | Given a browser without PWA install support | When the app is used | Then the complete flow remains available in a normal tab without a broken install requirement. | Must | NFR-AVL/COMP |
| AC-APP-006 | Given keyboard-only input | When navigating first launch and slots | Then focus order, labels, actions, and notices are complete. | Must | UXA; UX-CMP |

### 15.2 Adventurer creation

| ID | Given | When | Then | Priority | Requirement IDs |
|---|---|---|---|---|---|
| AC-ADV-001 | Given a fixed race/class seed | When creation rolls | Then natural dice, table rows, race, class, HP, abilities, spells, weapon, ten torches, and zero coins match the DRS. | Must | ADV; DRS-ADV/DICE |
| AC-ADV-002 | Given canonical mode | When a generated result appears | Then no free reroll or manual selection is available. | Must | ADV; CHAR-002 |
| AC-ADV-003 | Given duplicate spell results | When creation commits | Then separate charges/uses are stored and restored. | Must | ADV; SPELL |
| AC-ADV-004 | Given invalid/long name input | When validation runs | Then grapheme and safe-text rules apply without creating an adventurer. | Must | ADV; NFR-PRIV/SEC |
| AC-ADV-005 | Given a failure during creation save | When commit fails | Then no partial adventurer/history/random state becomes active and the previous slot state remains valid. | Must | ADV; XFR-SAVE; NFR-REL |
| AC-ADV-006 | Given a successful creation | When the app reloads | Then the complete adventurer and creation evidence restore without reroll. | Must | ADV; SAV; HIS |

### 15.3 Dungeon generation and entry

| ID | Given | When | Then | Priority | Requirement IDs |
|---|---|---|---|---|---|
| AC-DUN-001 | Given a fixed dungeon-name seed | When a dungeon is created | Then the three-part approved name and dungeon type match the table and are persisted. | Must | DUN; DRS-DUN |
| AC-DUN-002 | Given a new Palace | When the adventurer enters | Then an expedition begins, one entry torch is spent, and the entrance/current location persist atomically. | Must | DUN/EXP/LIGHT |
| AC-DUN-003 | Given an unexplored connection | When its door is successfully opened | Then the destination is generated exactly once and graph invariants pass. | Must | DUN; DOOR; DMI graph |
| AC-DUN-004 | Given generation past six valid non-stair segments | When more segments are generated | Then stair probability escalation and ten-segment forced-stair rule match the DRS. | Must | DUN; RD-RULE-001 |
| AC-DUN-005 | Given entry to the third level | When the destination is generated | Then the final boss room is created and reachable under the approved rules. | Must | DUN; DRS final room |
| AC-DUN-006 | Given any approved seed corpus | When simulation runs | Then no tested dungeon is non-terminating or has an unreachable boss. | Must | RD-RULE-002; NFR-REL-025 |

### 15.4 Exploration, doors, traps, stealth, and light

| ID | Given | When | Then | Priority | Requirement IDs |
|---|---|---|---|---|---|
| AC-EXP-001 | Given an unresolved door and fixed d6 | When the door is checked | Then trapped/locked/unlocked state and evidence match the approved table. | Must | EXP; DOOR-001/002 |
| AC-EXP-002 | Given a trapped door | When the trap resolves | Then the correct dungeon trap effect commits before destination generation. | Must | EXP; DRS-DOOR |
| AC-EXP-003 | Given a locked door | When a normal/master key, lock action, or break action is used | Then consumption, torch cost, broken state, and alert behaviour match the DRS. | Must | EXP; DOOR; ITEM |
| AC-EXP-004 | Given eligible monsters and enough light | When Move Silently is attempted | Then one d6 per monster, natural-1 failure, torch cost, and room-visit duration are correct. | Must | EXP; STEALTH |
| AC-EXP-005 | Given an eligible segment not yet searched | When secret passage search is confirmed | Then the torch is spent before the roll and searched state persists regardless of result. | Must | EXP; DOOR-011 |
| AC-EXP-006 | Given the final torch | When a voluntary costly action is selected | Then an irreversible warning names the consequence and alternative light before commit. | Must | EXP; LIGHT; UX |
| AC-EXP-007 | Given zero effective light after the committed action | When darkness is checked | Then death resolves before another voluntary action and revealed results persist. | Must | EXP; DTH; LIGHT |
| AC-EXP-008 | Given an unsafe route to the entrance | When retreat is considered | Then retreat is disabled and the blocking occupied segment is identified. | Must | EXP; PERSIST-007/008 |

### 15.5 Combat and rewards

| ID | Given | When | Then | Priority | Requirement IDs |
|---|---|---|---|---|---|
| AC-CMB-001 | Given a quiet open versus broken/trapped entry | When combat starts | Then initiative matches the approved rule. | Must | CMB; COMBAT-001 |
| AC-CMB-002 | Given multiple living monsters | When the player acts | Then one legal target is explicit and only approved area effects affect multiple monsters. | Must | CMB; COMBAT target |
| AC-CMB-003 | Given weapon natural 1 or 6 | When damage resolves | Then traits use the natural unmodified result and modifiers do not create/remove triggers. | Must | CMB; COMBAT-006/007 |
| AC-CMB-004 | Given combined incoming monster damage | When the player chooses HP or armour | Then allocation, break, spill, bypass, and destruction match the DRS. | Must | CMB; armour rules |
| AC-CMB-005 | Given fixed-damage versus die-based spells | When cast | Then charges, targeting, timing, traits, and effects match approved spell rules. | Must | CMB; SPELL |
| AC-CMB-006 | Given simultaneous final effects | When both adventurer and last monster reach zero | Then triggered effects complete and death is recorded even if the monster also dies. | Must | CMB; COMBAT-018 |
| AC-CMB-007 | Given an ordinary encounter victory | When rewards resolve | Then reward table, item identities, Cook/other effects, and capacity decision commit correctly. | Must | CMB; INV; rewards |
| AC-CMB-008 | Given boss defeat | When completion commits | Then boss state, 2d6 rewards, dungeon completion, summary, and available actions update atomically. | Must | CMB; DUN; HIS |

### 15.6 Inventory, equipment, and items

| ID | Given | When | Then | Priority | Requirement IDs |
|---|---|---|---|---|---|
| AC-INV-001 | Given backpack/equipment/resources | When capacity is calculated | Then only unequipped backpack items count; torches, coins, spells, and equipped items follow their separate rules. | Must | INV; ITEM-001-006 |
| AC-INV-002 | Given loot beyond capacity | When reward resolution pauses | Then the user must take, leave, equip, use, or discard until legal; cancel/termination preserves prior committed state. | Must | INV; ITEM-007; UX capacity |
| AC-INV-003 | Given an item transfer | When it moves among backpack/equipment/room/corpse/sale/consumption/destruction | Then one stable identity has exactly one authoritative location. | Must | INV; XFR-LINK |
| AC-INV-004 | Given limb loss invalidating held equipment | When the loss resolves | Then illegal items are unequipped and a legal hand/light/weapon configuration is required. | Must | INV; LIGHT-010 |
| AC-INV-005 | Given damaged/destroyed armour | When repair or recovery is attempted | Then durability, repair eligibility, destruction, and identity rules hold. | Must | INV; ITEM-011-014 |
| AC-INV-006 | Given a save/export/import/reload | When item state restores | Then modifiers, durability, provenance, and location remain equivalent. | Must | INV; SAV; CLR |

### 15.7 Town and expedition lifecycle

| ID | Given | When | Then | Priority | Requirement IDs |
|---|---|---|---|---|---|
| AC-TWN-001 | Given sufficient coins and missing HP/spell charges | When resting succeeds | Then one coin is spent and HP/spells fully restore atomically. | Must | TWN-001 |
| AC-TWN-002 | Given a damaged non-destroyed armour piece | When town repair succeeds | Then one coin is spent and that piece fully restores. | Must | TWN-002 |
| AC-TWN-003 | Given torch count below/at ten | When buying a torch | Then one coin buys one up to capacity; invalid purchase changes nothing. | Must | TWN-003 |
| AC-TWN-004 | Given ordinary/magic items and fixed sale dice | When selling | Then prices/modifiers, natural die evidence, item removal, and coins match rules. | Must | TWN-004-006 |
| AC-TWN-005 | Given a safe retreat | When town is reached | Then the expedition ends and dungeon state remains persistent. | Must | TWN; PERSIST |
| AC-TWN-006 | Given a later re-entry | When the expedition begins | Then surviving monsters heal and eligible ordinary rooms repopulate at most once on first entry. | Must | PERSIST-002-006 |
| AC-TWN-007 | Given a safely returned adventurer | When another dungeon is created/resumed | Then unfinished dungeons remain persistent and selectable. | Must | TWN-008 |

### 15.8 Death, Graveyard, and recovery

| ID | Given | When | Then | Priority | Requirement IDs |
|---|---|---|---|---|---|
| AC-DTH-001 | Given lethal normal damage | When death resolves | Then corpse/belongings, items, coins, Graveyard, segment, active adventurer, and history commit atomically. | Must | DTH; PERSIST-009/011 |
| AC-DTH-002 | Given darkness death | When death resolves | Then no corpse exists but approved belongings/coins remain and Graveyard records the cause/location. | Must | DTH; PERSIST-010/011 |
| AC-DTH-003 | Given multiple deaths in one segment | When records persist | Then each death has a distinct Graveyard record and recovery container. | Must | DTH; PERSIST-012 |
| AC-DTH-004 | Given no active adventurer after death | When a replacement is created | Then the same slot/dungeons/history remain and the deceased record is not overwritten. | Must | DTH; ADV; SAV |
| AC-DTH-005 | Given a replacement reaches belongings | When recovery exceeds capacity | Then normal capacity rules apply and unrecovered items remain in the segment. | Must | DTH; INV; PERSIST-013 |
| AC-DTH-006 | Given close/reload/export/import | When death/recovery state restores | Then all identities, locations, recovery status, and history remain equivalent. | Must | DTH; SAV; HIS |

### 15.9 Save, recovery, import/export, and migration

| ID | Given | When | Then | Priority | Requirement IDs |
|---|---|---|---|---|---|
| AC-SAV-001 | Given any meaningful state change | When it commits | Then save state becomes pending promptly and success appears only after durable completion. | Must | SAV; NFR-PERF/REL |
| AC-SAV-002 | Given interruption before/during/after an atomic boundary | When the app resumes | Then either the complete new state or prior valid state exists, never a partial mix. | Must | SAV; NFR-REL-021 |
| AC-SAV-003 | Given a failed save | When failure is known | Then false success is absent, unsafe mutation is blocked, and retry/recovery/export/safe-exit guidance is accurate. | Must | SAV; ERR; UX |
| AC-SAV-004 | Given a valid export | When inspected and imported across supported browsers | Then versions/provenance/private warning and canonical state round-trip correctly. | Must | SAV; NFR-DR |
| AC-SAV-005 | Given malformed/future/blocked/oversized import | When validation runs | Then it is rejected without changing valid slots. | Must | SAV; SEC; CLR |
| AC-SAV-006 | Given a supported older schema | When migration runs | Then explicit sequential steps preserve identities, events, provenance, and required state. | Must | SAV; NFR-DR |
| AC-SAV-007 | Given migration/import failure | When recovery is reviewed | Then original/pre-operation snapshot remains valid and replacement requires confirmation. | Must | SAV; recovery |
| AC-SAV-008 | Given slot reset/import/recovery | When confirmed/cancelled | Then exact named scope changes once or not at all; other slots remain unchanged. | Must | SAV; DMI isolation |

### 15.10 History, rule trace, and notes

| ID | Given | When | Then | Priority | Requirement IDs |
|---|---|---|---|---|---|
| AC-HIS-001 | Given a mechanical action | When committed | Then one ordered immutable event records required action/dice/table/modifier/version/state evidence. | Must | HIS; RD-DATA-001 |
| AC-HIS-002 | Given an active/incomplete dungeon | When history is loaded | Then complete mechanical history remains retained and latest 200 display by default. | Must | HIS; RD-DATA-002 |
| AC-HIS-003 | Given a completed dungeon | When retention applies | Then a permanent summary and final 500 mechanical entries remain. | Must | HIS; RD-DATA-002 |
| AC-HIS-004 | Given a player note | When edited/archived/deleted | Then no immutable mechanical event changes. | Must | HIS; UX-CMP-015 |
| AC-HIS-005 | Given history display failure | When it occurs | Then gameplay remains usable and retry does not create duplicate events. | Must | HIS; ERR |
| AC-HIS-006 | Given production diagnostics | When generated | Then private event text, names, notes, Graveyard details, and saves are absent. | Must | HIS; PRIV |

### 15.11 UX, accessibility, and responsive support

| ID | Given | When | Then | Priority | Requirement IDs |
|---|---|---|---|---|---|
| AC-UXA-001 | Given any required flow | When completed at each supported width | Then no required state/action is clipped, removed, or hover-only. | Must | UXA-001-004 |
| AC-UXA-002 | Given keyboard-only use in each browser | When completing core flows | Then focus is visible/logical and all controls/dialogs/maps/inventory are operable. | Must | UXA-005/006 |
| AC-UXA-003 | Given a screen reader | When results, turns, saves, errors, movement, death, and dialogs change | Then appropriate concise announcements occur without unnecessary focus theft. | Must | UXA-007/008; UX announcement matrix |
| AC-UXA-004 | Given visual and textual maps | When topology/state/actions are compared | Then required information and legal actions are equivalent. | Must | UXA-012 |
| AC-UXA-005 | Given 200% zoom/reflow, long content, reduced motion, and non-colour view | When the core flow runs | Then content/control access and meaning remain complete. | Must | UXA-009-011/020 |
| AC-UXA-006 | Given phone Safari/Chrome and touch | When combat, inventory, map, town, import, and recovery run | Then targets/actions/sheets remain reachable and sized per NFR. | Must | UXA-003; NFR-A11Y/COMP |
| AC-UXA-007 | Given first-time guidance | When used/skipped/reopened | Then it is progressive, skippable, and does not create a separate campaign. | Should | UXA-016 |

### 15.12 Content, privacy, and release boundary

| ID | Given | When | Then | Priority | Requirement IDs |
|---|---|---|---|---|---|
| AC-CNT-001 | Given a release build | When content validation runs | Then every bundled item is approved/inventoried and any unknown/blocked item fails the build. | Must | CNT-001/002; CLR; NFR-LIC |
| AC-CNT-002 | Given player-facing copy | When source audit runs | Then explanations are original/paraphrased and exact prose has item-level approval. | Must | CNT-003/004 |
| AC-CNT-003 | Given application assets/UI/docs | When visual audit runs | Then source logo/art/page layout/character sheet/trade dress are absent. | Must | CNT-005; CLR |
| AC-CNT-004 | Given About/Credits and release notices | When compared with manifest | Then required creator/source/permission/third-party/unofficial notices are accurate and reachable offline. | Must | CNT-006; CLR |
| AC-CNT-005 | Given ordinary use/feedback | When network/storage/logs are inspected | Then no private play data or hidden telemetry is transmitted. | Must | CNT-009-011; PRIV |
| AC-CNT-006 | Given the public build | When scope audit runs | Then it is English-only, free, non-monetised, single-player, and excludes all Won't systems. | Must | CNT-007/008/012 |
| AC-CNT-007 | Given Palace placeholders/final assets | When selected | Then rights/provenance/replacement/go-decision requirements pass. | Must | CNT-013/014; CLR |
