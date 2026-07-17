# [Acceptance Criteria / Test Plan v0.1](acceptance-criteria-test-plan-v0.1.md) - Appendix B - Detailed Acceptance Scenarios

This file is a normative part of [Acceptance Criteria / Test Plan v0.1](acceptance-criteria-test-plan-v0.1.md).

*Status: Draft for Review | Last updated: 2026-07-17*

---

## 16. Detailed Acceptance Scenarios

Each scenario result must link to the exact application commit, content/rules/schema versions, environment, fixture/seed, evidence, defects, and execution date.

### AT-E2E-001: First launch to committed adventurer

**Requirement IDs:** APP, ADV, SAV, HIS, UXA, CLR

**Preconditions:**

- Fresh supported browser profile with available persistent storage.
- Approved application/content artifact.
- Deterministic creation seed.

**Steps:**

1. Open the application online for the first time.
2. Confirm local-data and offline-readiness messaging.
3. Select an empty slot and start a new game.
4. Enter a valid adventurer name.
5. Complete canonical race/class/spell generation.
6. Review natural dice, table rows, derived state, and starting resources.
7. Commit creation.
8. Close and reopen the application offline.

**Expected results:**

- Three slots are shown; only the selected slot changes.
- Offline-ready is shown only after required caching completes.
- Creation outcomes match fixed expected values and cannot be freely rerolled.
- Adventurer, evidence, versions, random state, and history commit atomically.
- Offline reload restores the exact created adventurer and legal next action.
- Keyboard, focus, labels, and announcements pass.

**Evidence:** Automated E2E output, canonical state snapshot, accessibility log, screenshots without private data.

**Result:** Not run

### AT-E2E-002: Palace generation, entry, and first exploration

**Requirement IDs:** DUN, EXP, LIGHT, DOOR, SAV, HIS

**Preconditions:** `FX-PALACE-START`.

**Steps:**

1. Generate a dungeon with the fixed name seed.
2. Enter Palace.
3. Verify entry torch and expedition record.
4. Inspect current segment and visual/textual map.
5. Resolve a fixed unlocked door and generate its destination.
6. Close/reopen and revisit the generated connection.

**Expected results:**

- Name/table evidence matches source/DRS.
- One entry torch is consumed atomically.
- Destination generates once; graph identities/connections persist.
- Visual/textual maps show equivalent topology/actions.
- Reload neither rerolls the door nor regenerates the destination.

**Result:** Not run

### AT-E2E-003: Trapped and locked door paths

**Requirement IDs:** EXP, DOOR, ITEM, LIGHT, CMB

**Preconditions:** `FX-PALACE-DOOR`.

**Steps:**

1. Trigger a trapped door.
2. Verify trap timing/effect and destination generation order.
3. Resolve a locked door with a normal key.
4. Repeat with a master key.
5. Resolve another locked door by breaking it.
6. Verify monster alert/initiative.

**Expected results:**

- Trap resolves before destination generation.
- Normal key is consumed and dungeon-scoped; master key persists.
- Keys do not bypass unresolved traps.
- Broken door is permanent and alert changes initiative.
- Every outcome persists and is traceable.

**Result:** Not run

### AT-E2E-004: Stealth, search, and final-torch warning

**Requirement IDs:** STEALTH, DOOR, LIGHT, EXP, UX

**Preconditions:** Occupied non-boss room, eligible search segment, one remaining torch, deterministic dice.

**Steps:**

1. Attempt Move Silently and verify torch-before-roll.
2. Test success and natural-1 failure fixtures.
3. Search for a secret passage once.
4. Attempt repeat search.
5. Attempt a voluntary action costing the final torch.
6. Cancel, then repeat with an alternative light source and without one.

**Expected results:**

- Correct dice count/trigger, room-visit duration, and alert behaviour.
- Search state persists regardless of result and cannot repeat.
- Final-torch confirmation identifies consequences and alternative light.
- Cancel changes nothing.
- Darkness death occurs only after the committed final-light action when no alternative exists.

**Result:** Not run

### AT-E2E-005: Combat, armour, spells, and capacity reward

**Requirement IDs:** CMB, INV, SPELL, ITEM, HIS

**Preconditions:** `FX-PALACE-COMBAT`, nearly full backpack.

**Steps:**

1. Enter encounters with each initiative path.
2. Select a target and attack with natural-1 and natural-6 fixtures.
3. Apply modifiers and monster traits.
4. Receive combined damage; allocate to HP, intact armour, breaking armour, and bypass case.
5. Cast fixed and die-based spells.
6. Defeat encounter and resolve reward beyond capacity.
7. Choose leave/equip/drop/use and commit.

**Expected results:**

- Turn/target/trait/damage rules match DRS.
- One action consumes one expected random result.
- Armour and HP state update correctly.
- Spell charges and effects persist.
- Capacity sheet blocks continuation; item identity has one location.
- History records all required evidence.

**Result:** Not run

### AT-E2E-006: Safe retreat, town, and re-entry

**Requirement IDs:** EXP, TWN, PERSIST, SAV

**Preconditions:** Partly explored Palace, safe and unsafe route variants, damaged adventurer.

**Steps:**

1. Verify retreat blocked by a living unbypassed monster.
2. Clear route and retreat.
3. Rest, repair armour, buy a torch, and sell ordinary/magic items.
4. Close/reopen in town.
5. Re-enter Palace.
6. Revisit surviving monsters and eligible cleared rooms.

**Expected results:**

- Blocker segment is identified.
- Expedition ends only on safe return.
- All costs/restorations/sales match fixed rules and persist.
- Surviving monsters heal; eligible ordinary rooms repopulate at most once on first entry.
- Dropped items/corpses do not prevent repopulation and remain present.

**Result:** Not run

### AT-E2E-007: Palace boss completion

**Requirement IDs:** DUN, CMB, HIS, SAV, CNT

**Preconditions:** `FX-PALACE-BOSS`.

**Steps:**

1. Enter the third level/final room.
2. Verify no normal room-content/monster-table generation in the final room.
3. Defeat the fixed boss.
4. Resolve 2d6 rewards and capacity.
5. Complete the dungeon.
6. Review history and close/reopen.

**Expected results:**

- Final room and boss match rules; boss cannot be bypassed.
- Completion, boss state, rewards, summary, retained history, and actions commit atomically.
- Completed dungeon remains persisted; boss/unique rewards do not regenerate.
- Source-derived content references are approved/versioned.

**Result:** Not run

### AT-E2E-008: Normal death and replacement recovery

**Requirement IDs:** DTH, INV, HIS, ADV, SAV

**Preconditions:** `FX-DEATH-NORMAL`.

**Steps:**

1. Resolve lethal damage with equipped/backpack items and coins.
2. Review Graveyard and belongings.
3. Close/reopen.
4. Create a replacement adventurer in the same slot.
5. Reach the death segment.
6. Recover some items while at capacity, leaving others.
7. Close/reopen/export/import.

**Expected results:**

- Death, record, container, location, items, coins, event, and active-adventurer change are atomic.
- Deceased remains in Graveyard.
- Replacement uses same persistent dungeon.
- Recovered and remaining items keep stable identities and legal locations.
- Round trip preserves recovery state.

**Result:** Not run

### AT-E2E-009: Darkness death

**Requirement IDs:** LIGHT, DTH, INV, HIS

**Preconditions:** `FX-DEATH-DARK`.

**Steps:**

1. Spend the final light on an action that reveals a result.
2. Resolve darkness death.
3. Review Graveyard and segment.
4. Create replacement and reach the location.

**Expected results:**

- Revealed room/result persists.
- No corpse exists.
- Approved equipment/backpack/items/keys/coins remain recoverable.
- Graveyard cause/location and recovery reference are correct.
- Dying adventurer cannot perform a later pickup action.

**Result:** Not run

### AT-E2E-010: Save interruption and last-valid recovery

**Requirement IDs:** SAV, ERR, NFR-REL/DR, UX

**Preconditions:** Fault injection at before/during/after transaction boundaries.

**Steps:**

1. Execute representative generation, combat, item transfer, town, death, and completion actions.
2. Interrupt each at defined persistence points.
3. Reload.
4. Review active and last-valid states.
5. Attempt retry and recovery.

**Expected results:**

- Each case yields either prior complete state or new complete state.
- No duplicate action/random consumption/event/item.
- False saved status never appears.
- Unsafe continuation is blocked.
- Recovery preview identifies scope/reason and confirmation is atomic.

**Result:** Not run

### AT-E2E-011: Export, reset, and import round trip

**Requirement IDs:** SAV, CLR, PRIV, SEC

**Preconditions:** Populated three-slot fixture and clean second supported browser.

**Steps:**

1. Export one selected slot.
2. Review private-data warning and package metadata.
3. Reset the selected slot and verify other slots.
4. Import and preview the package.
5. Confirm replacement.
6. Compare canonical state in same and second browser.

**Expected results:**

- Export contains only selected documented application scope.
- Versions/provenance/timestamp are present.
- Other slots remain unchanged.
- Import makes no mutation before confirmation.
- Restored canonical state is equivalent across browsers.

**Result:** Not run

### AT-E2E-012: Rejected imports and parser safety

**Requirement IDs:** SAV, SEC, CLR, ERR

**Preconditions:** `FX-IMPORT-BAD`.

**Steps:**

1. Attempt malformed, future-schema, missing-reference, bad-checksum, blocked-content, 25 MiB boundary, oversized, deeply nested, and decompression-expansion packages.
2. Cancel valid import preview.
3. Inspect storage and logs.

**Expected results:**

- Invalid packages are rejected safely and explicitly.
- Valid current slots remain equivalent.
- Resource limits apply before activation.
- No script/HTML/network resource executes.
- Logs/errors expose no private content or raw package.

**Result:** Not run

### AT-E2E-013: Supported and failed migration

**Requirement IDs:** SAV, NFR-DR, DMI, HIS, CLR

**Preconditions:** `FX-MIG-N-1` and `FX-MIG-BROKEN`.

**Steps:**

1. Load supported prior schema.
2. Execute each sequential migration.
3. Compare identities, events, definitions, provenance, random streams, and snapshots.
4. Interrupt at every step.
5. Attempt unsupported newer schema.

**Expected results:**

- Supported migration validates each step and final invariants before activation.
- Immutable evidence and stable identities remain equivalent.
- Failure preserves original and recovery evidence.
- Newer schema is rejected without downgrade or mutation.

**Result:** Not run

### AT-E2E-014: Offline and update safety

**Requirement IDs:** APP, SAV, NFR-AVL/OPS

**Preconditions:** Offline-ready accepted release and available newer release.

**Steps:**

1. Disable network and complete representative explore/combat/town/save actions.
2. Restore network and detect update during an unresolved capacity/import/action context.
3. Fail update download.
4. Complete safe save point and activate update.
5. Reload offline.

**Expected results:**

- Ordinary core play works offline.
- Update does not activate during unsafe state.
- Failed download leaves old version working.
- Activation occurs only after safe point/reload.
- Schema/rules/content compatibility is handled explicitly.
- No mixed incompatible asset set appears.

**Result:** Not run

### AT-E2E-015: Phone textual-map and assistive path

**Requirement IDs:** UXA, UX, NFR-A11Y/COMP

**Preconditions:** 360/390-pixel phone profiles and representative AT.

**Steps:**

1. Start/resume a Palace expedition on phone.
2. Switch visual/textual map.
3. Navigate an open connection, inspect occupancy/hazard/items, and execute an action.
4. Resolve combat and capacity sheet.
5. Retreat/town and reload.
6. Repeat representative portions with TalkBack/VoiceOver and keyboard where applicable.

**Expected results:**

- Complete functionality, state, actions, focus, announcements, touch targets, and reflow remain available.
- Map parity passes.
- No essential meaning relies on colour, motion, or visual grid.
- Sticky/bottom controls do not obscure focus or confirmation actions.

**Result:** Not run

### AT-E2E-016: Content and licensing release gate

**Requirement IDs:** CNT, CLR, NFR-LIC

**Preconditions:** Candidate manifest, source inventory, notices, assets, dependency report, and a blocked-content variant.

**Steps:**

1. Compare every bundled file/runtime definition with inventory.
2. Validate Palace/all-six row-level source references.
3. Search for source prose/page images/logo/art/layout/backer names.
4. Compare About/Credits and NOTICE with approved records.
5. Run dependency/asset licence checks.
6. Build valid and blocked variants.

**Expected results:**

- Valid candidate has 100% approved inventory coverage and matching hashes.
- Blocked variant fails the release build.
- No prohibited source visual/prose/personal data exists.
- Notices are accurate/reachable offline.
- Code/content licences and release mode are correctly separated.

**Result:** Not run
