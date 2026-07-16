## 15. Content Provenance and Licensing Data

### 15.1 Minimum provenance fields

| Field | Required | Notes |
|---|---:|---|
| `sourceCategory` | Yes | Official, project-original, user-authored, third-party, unknown, or restricted |
| `sourceName` | Yes for bundled/imported | Human-readable source |
| `sourceVersion` | Should | Publication/package version or retrieval date |
| `licenseId` | Conditional | Canonical licence identifier where applicable |
| `permissionEvidenceRef` | Conditional | Project-record reference; confidential evidence is not embedded in the public app |
| `attribution` | Conditional | Display-ready text or approved reference |
| `restrictions` | Yes | Digital reproduction, modification, redistribution, attribution, and asset-specific limits |
| `approvalStatus` | Yes | Draft, approved, blocked, restricted, or superseded |
| `reviewedBy` | Conditional | Approval record |
| `reviewDate` | Conditional | Approval record |
| `contentHash` | Should | Hash of reviewed content/asset |
| `replacementFor` | No | Blocked/restricted source item replaced by approved original asset |

### 15.2 Separation rules

- User-authored notes and names are never labelled official or bundled.
- Mechanics use structured values and stable IDs; they do not require exact rulebook prose.
- Exact source prose or artwork is represented only when item-specific digital-use permission is recorded.
- Artwork, fonts, icons, audio, text, tables, logos, and trade dress have separate inventory/provenance records.
- Unknown, blocked, or restricted bundled items do not enter public release packages.
- Runtime save exports reference approved bundled packages by ID/version/hash rather than duplicating unnecessary source content.
- A save may retain a historical reference to a superseded approved package needed to interpret existing instances.

### 15.3 Content definition validation

A release-eligible definition must have:

1. a stable ID and immutable version;
2. a supported type-specific schema;
3. a package/version and content hash;
4. a complete provenance record;
5. approved status;
6. valid references to other definitions;
7. no missing table ranges or duplicate machine IDs; and
8. no dependency on unapproved display copy or assets.

## 16. Import, Export, and Migration

### 16.1 Export package

```json
{
  "packageFormatVersion": 1,
  "schemaVersion": 1,
  "sourceAppVersion": "0.1.0",
  "exportedAt": "2026-07-17T00:00:00Z",
  "scope": "save_slot",
  "manifest": {
    "slotId": "opaque-id",
    "rulesVersion": "0.1",
    "contentVersionSet": [],
    "entityCounts": {},
    "sectionHashes": {},
    "manifestHash": "..."
  },
  "data": {
    "slot": {},
    "snapshots": [],
    "state": {},
    "adventurers": [],
    "dungeons": [],
    "expeditions": [],
    "encounters": [],
    "items": [],
    "deaths": [],
    "graveyard": [],
    "randomStreams": [],
    "rollResults": [],
    "events": [],
    "completionSummaries": [],
    "notes": []
  }
}
```

| Requirement | Definition |
|---|---|
| Scope | One complete save slot in MVP |
| Completeness | Current state plus required recovery, history, notes, versions, streams, and referenced runtime entities |
| Stable ordering | Entity arrays sort by stable ID; events sort by sequence; definitions sort by ID/version |
| Canonical serialization | Fixed field names, canonical enum values, no UI labels |
| Privacy warning | Export is clearly marked as containing private local play data |
| Content inclusion | Reference approved bundled definitions by package/version/hash; include user-authored data and required runtime snapshots |
| Integrity | Manifest and section hashes validate before import |
| Portability | No browser-specific key objects or library-specific serialized classes |
| Unsupported values | Import fails or migrates through an explicit rule; never silently drops unknown mechanics |

### 16.2 Import workflow

1. Read the package without mutating workspace or slots.
2. Parse and validate package-format structure.
3. Validate manifest hashes, entity counts, required fields, enums, references, ownership, versions, and invariants.
4. Reject unsupported newer schema without mutation.
5. Run supported sequential migrations in staging memory/storage.
6. Validate the migrated complete state.
7. Produce an import preview identifying target slot, replacement consequences, versions, private-data scope, warnings, and recovery options.
8. Require explicit confirmation.
9. Create a valid pre-import snapshot of the target slot when applicable.
10. Commit imported records and the pointer switch atomically.
11. Preserve all existing valid data on failure.
12. Record an `ImportReport` without exposing private field values in diagnostics.

### 16.3 Migration policy

| Rule | Requirement |
|---|---|
| Sequence | Migrations run exactly N to N+1 until current |
| Idempotence | A committed migration step is not repeated |
| Recovery | Valid pre-migration snapshot exists before first mutation |
| Historical mechanics | Committed outcomes and instance rules/content versions remain intact |
| Definition changes | Existing instances keep their definition version unless an approved migration explicitly snapshots equivalent data |
| Validation | Full invariant validation occurs after each step and before pointer switch |
| Failure | Roll back to the pre-migration pointer or isolate while preserving export/recovery |
| Newer schemas | Reject without mutation |
| Reporting | Store migration IDs, versions, status, timestamps, and safe issues |

### 16.4 Initial migration catalogue

| From | To | Purpose | Reversible | Failure behaviour |
|---:|---:|---|---:|---|
| 1 | 2 | Reserved for first approved schema evolution | Determined by migration | Restore pre-migration snapshot |

No concrete migration is implemented by this document. The table establishes the required registration format.

## 17. Audit, History, and Event Log Linkage

### 17.1 Record expectations

| Record type | History expectation | Required linkage |
|---|---|---|
| Dice/table result | Immutable natural dice, input mode, stream/draw, table/row, modifiers, final result, and versions | Action/event plus affected entity |
| Dungeon generation | Append-only table result, source connection, generated segment/door/content, and stream evidence | Dungeon, floor, segment, connection |
| Door/trap/search action | Initial state, cost/choice, resolution, and resulting state | Expedition, segment, connection, door |
| Adventurer state change | Reason and mechanically relevant before/after values | Adventurer, expedition/encounter where applicable |
| Combat action | Actor, target, source, dice, modifiers, triggers, damage/prevention, and resulting HP/status | Encounter, adventurer, monsters |
| Inventory transfer | Item ID, old/new location, reason, and capacity decision | Item plus source/target |
| Town transaction | Coin/resource before/after and item/spell/armour effect | Adventurer and item/spell |
| Death | Cause, location, state, container, and Graveyard record | Adventurer, expedition, dungeon, segment |
| Recovery | Container before/after and transferred identities | Container, items, adventurer |
| Import/migration | Versions, validation summary, status, and snapshots | Slot and report |
| Correction | Original event/result and approved correction | New event linked to original |
| Destructive action | Exact scope and confirmation | Slot/container/note |
| Player note | Editable record history may use timestamps; not a mechanical event | Note and linked references |

### 17.2 Retention policy

- Active and incomplete dungeons retain complete mechanically relevant history.
- On dungeon completion, create and permanently retain a `CompletionSummary`.
- Completed dungeons retain at least the final 500 mechanically relevant event entries.
- The default UI shows the latest 200 entries without deleting additional persisted records.
- Graveyard records and death linkage persist for the lifetime of the slot.
- Correction events and their originals are retained together.
- User notes follow their own archive/delete policy and never replace mechanical records.
- Compaction is deterministic, validated, and represented by a system event/summary; it cannot remove facts needed to interpret remaining state.

### 17.3 Event identifiers

Event types use stable namespaced values, for example:

- `creation.adventurer_completed`
- `generation.segment_created`
- `door.trap_resolved`
- `exploration.light_spent`
- `combat.weapon_attack_resolved`
- `combat.monster_finally_defeated`
- `reward.item_created`
- `inventory.item_transferred`
- `town.armour_repaired`
- `expedition.repopulation_checked`
- `death.adventurer_died`
- `recovery.container_partially_recovered`
- `save.snapshot_committed`
- `migration.step_committed`
- `import.slot_replaced`
- `correction.event_amended`
- `completion.dungeon_completed`

## 18. Deletion, Archival, and Recovery

| Object | Default action | Restore supported | Hard-delete condition | Child behaviour |
|---|---|---:|---|---|
| Save slot game data | Confirmed reset | Only through prior export/retained recovery before reset commit | Explicit slot reset | Delete only records owned by that slot; slot identity returns empty |
| Application workspace | Retain | N/A | Explicit application-data reset | Remove only application-owned storage |
| Current snapshot | Supersede, retain per recovery policy | Yes while retained | Safe cleanup after another valid current/last-valid exists | Referenced immutable records may be deduplicated |
| Last-valid snapshot | Retain | Yes | Replace only after a newer fully valid commit | Never delete before replacement commits |
| Pre-migration/import snapshot | Temporary retained recovery | Yes | After successful verification and NFR retention window | Preserve on failure |
| Adventurer | Historical after death | No resurrection unless approved rule | Slot reset only | Death and Graveyard references remain |
| Dungeon | Retain; optional archive visibility | Yes | Slot reset only | Graph, drops, containers, completion preserved |
| Encounter | Resolve and retain/compact | No return to active | Approved history compaction or slot reset | Preserve required terminal facts |
| Monster | Tombstone after final defeat | No | Approved compaction or slot reset | Rewards/history retain reference |
| Item | Tombstone after sale/consumption/destruction | No | Approved compaction or slot reset | Events retain ID and definition snapshot |
| Recoverable container | Mark recovered/destroyed/cleaned | Not after terminal cleanup | Confirmed cleanup when rules allow or slot reset | Preserve death/Graveyard linkage and summary |
| Graveyard record | Retain | N/A | Slot reset only | Never cascades from container cleanup |
| Mechanical event | Retain per policy | N/A | Approved completed-history compaction or slot reset | Summary and linked retained events remain valid |
| Player note | Soft archive | Yes | Explicit confirmed note deletion or slot reset | Mechanical records unaffected |
| Import staging | Delete on cancel/failure | N/A | Terminal report created | Target data unchanged |
| Content package | Supersede, retain if referenced | N/A | No save references and release retention permits | Historical runtime references remain resolvable |

### 18.1 Recovery rules

- Recovery restores a complete valid snapshot, never a partial set of records.
- The recovery source is not overwritten until the restored state commits and validates.
- A partially invalid slot remains exportable where safe, with invalid sections clearly identified.
- Recovery never rerolls committed outcomes or advances streams.
- Other valid slots remain playable while one slot is isolated.
- Browser-data deletion outside the application cannot be recovered without an export; the product must communicate this truthfully.

## 19. Traceability

| Entity / invariant group | Functional requirements | Digital Rules Specification | Product / business source | Downstream evidence |
|---|---|---|---|---|
| Workspace, slots, snapshots | APP-001..014; SAV-001..024; ERR-001..016 | DRS-PER-024..025; DRS-VAL; DRS-HIST | PR-015..020; BR-009..011, BR-016, BR-019 | AT-APP, AT-SAV, AT-ERR |
| Adventurer and spells | ADV-001..016; INV group | DRS-DICE, DRS-ADV, DRS-SPELL | PR-001, PR-004..006, PR-012, PR-014 | AT-ADV, AT-INV |
| Dungeon graph and generation | DUN-001..019 | DRS-DUN, DRS-DICE | PR-007..009, PR-020, PR-031 | AT-DUN and simulation harness |
| Doors, traps, exploration, light | EXP-001..021 | DRS-DOOR, DRS-EXP, DRS-IR | PR-006, PR-008, PR-010 | AT-EXP |
| Encounter and monsters | CMB-001..023 | DRS-CMB, DRS-SPELL, DRS-ITEM, DRS-IR | PR-005, PR-006, PR-011, PR-020 | AT-CMB |
| Items and economy | INV-001..023; TWN-001..016 | DRS-ITEM, DRS-SPELL, DRS-PER | PR-012, PR-013 | AT-INV, AT-TWN |
| Expedition and repopulation | TWN and DTH groups | DRS-PER-001..013, DRS-IR | PR-013, PR-020, PR-021 | AT-TWN, AT-XFR |
| Death, recovery, Graveyard | DTH-001..015 | DRS-PER-014..023; DRS-HIST | PR-014, PR-021, PR-025 | AT-DTH |
| Random streams and roll results | SAV, HIS, XFR groups | DRS-DICE-001..012; DRS-HIST | PR-005, PR-020..022 | Deterministic fixtures |
| Events and notes | HIS-001..015 | DRS-HIST-001..012 | PR-021, PR-022, PR-025 | AT-HIS |
| Content/provenance | CNT-001..014 | DRS-P-007; content/prose boundary | PR-003, PR-028..030, PR-034; BR-014..016 | AT-CNT and inventory review |
| Import/export/migration | APP, SAV, ERR groups | DRS-DICE-011..012; DRS-PER-024..025; DRS-VAL | PR-018, PR-019, PR-025, PR-032 | AT-SAV, AT-ERR |
| Privacy and local ownership | PERM-001..005; CNT and SAV groups | UI-independent | PR-025..027; BR-014..016 | Privacy/NFR review |

Every implementation schema, repository model, migration, serializer, and acceptance test should cite the applicable `DMI-*`, FRD, and `DRS-*` requirements.

## 20. Acceptance Criteria

The specification may be approved when:

- [ ] Every persisted aggregate has a stable identity, owner, lifecycle, and version strategy.
- [ ] Definition IDs and runtime IDs are distinct and cannot be confused with display names.
- [ ] The workspace contains exactly three stable local save slots.
- [ ] Current, last-valid, pre-migration, and pre-import snapshot semantics are explicit.
- [ ] Action-level atomicity includes domain changes, events, random-stream advances, and snapshot-pointer updates.
- [ ] Adventurer HP, arms, hands, torches, coins, spells, equipment, and backpack constraints are testable.
- [ ] Dungeon floors, segments, connections, doors, graph reachability, staircase pressure, boss reachability, and completion are represented without relying on visual coordinates.
- [ ] Expedition, encounter, monster, temporary-effect, repopulation, retreat, and town lifecycles are explicit.
- [ ] Every item retains stable identity through equipment, transfer, drop, death, recovery, sale, consumption, or destruction.
- [ ] Normal death, darkness death, multiple containers, partial recovery, and Graveyard permanence are explicit.
- [ ] Separate deterministic stream state and immutable natural/random results survive reload, export, import, and migration.
- [ ] Completed results are never silently recalculated or rerolled.
- [ ] Mechanical events are immutable and player notes are separate and editable.
- [ ] Active/incomplete and completed-history retention policies match the approved complete/summary/final-500/latest-200 rules.
- [ ] Content definitions carry package, version, hash, provenance, rights, attribution, restriction, and approval data.
- [ ] Unknown, blocked, or restricted bundled content is prevented from entering a public build.
- [ ] Export packages are complete, versioned, deterministically ordered, integrity checked, and privacy-labelled.
- [ ] Import is parsed, validated, migrated, previewed, confirmed, and committed without mutating existing valid data on failure.
- [ ] Sequential migration, pre-migration recovery, unsupported-newer rejection, and historical-version retention are explicit.
- [ ] Deletion and archival rules cannot accidentally remove Graveyard, completed-dungeon, event, or recovery facts.
- [ ] One invalid slot cannot block the other valid slots.
- [ ] Application reset is limited to application-owned storage.
- [ ] The model remains implementation-neutral while providing sufficient guidance for the architecture and IndexedDB schema.
- [ ] Traceability covers the BRD, MVP Scope, PRD, FRD, DRS, future UX/NFR/content documents, and acceptance evidence.
- [ ] Product Owner, Technical Lead, Rules Designer, QA Reviewer, and Content/Licensing Reviewer approve their applicable sections.

## 21. Open Questions

No unresolved product or rules decision blocks approval of this logical model. The following implementation decisions belong to downstream architecture, NFR, UX, content, or test work and must preserve this specification's semantics.

| ID | Question | Owner | Decision point | Status |
|---|---|---|---|---|
| OQ-DM-001 | What exact IndexedDB object-store boundaries, key paths, indexes, and transaction wrapper implement the logical partitions? | Technical Lead | Architecture approval | Open; downstream |
| OQ-DM-002 | Which deterministic RNG algorithm and serialized-state format satisfy stream reproducibility across supported browsers and versions? | Technical Lead / QA | Architecture and simulation harness | Open; downstream |
| OQ-DM-003 | Which canonical JSON serializer and integrity-hash algorithm are used for snapshots and exports? | Technical Lead | Architecture/NFR approval | Open; downstream |
| OQ-DM-004 | Is the export delivered as plain JSON or a versioned compressed archive while preserving transparent validation? | Product / Technical / UX | UX and architecture approval | Open; downstream |
| OQ-DM-005 | What storage-size, quota-warning, compaction, and performance thresholds apply to event history and snapshots? | Technical / QA / Operations | NFR approval | Open; downstream |
| OQ-DM-006 | How long are successful pre-migration and pre-import snapshots retained beyond the required safe verification point? | Product / Technical | NFR and recovery UX approval | Open; downstream |
| OQ-DM-007 | Which transient in-progress workflows must survive browser termination, and which safely return to the last committed state? | UX / Technical | UX Flow approval | Open; downstream |
| OQ-DM-008 | Which exact content packages, definitions, display-copy records, and assets are approved for Palace and public Core builds? | Content / Licensing Reviewer | Content inventory gate | In progress |
| OQ-DM-009 | What privacy-safe local diagnostic package fields are permitted, and is the optional package included in MVP? | Product / Technical / Privacy | NFR/operations approval | Open; downstream |
| OQ-DM-010 | What evidence fixtures prove migrations, corrupted-state isolation, partial recovery, retention compaction, and export equivalence? | QA Lead | Acceptance Criteria/Test Plan | Open; downstream |
| OQ-DM-011 | Are soft-archived player notes retained indefinitely or subject to an explicit confirmed cleanup setting? | Product / UX | UX and privacy review | Open; non-blocking |
| OQ-DM-012 | What exact display-name validation and maximum lengths apply to slot names, adventurer names, and notes? | UX / Accessibility / Technical | UX and NFR approval | Open; non-blocking |

## 22. Approval

| Role | Name | Decision | Date | Notes |
|---|---|---|---|---|
| Product Owner |  | Pending / Approved / Rejected |  |  |
| Technical Lead / Data Modeller |  | Pending / Approved / Rejected |  |  |
| Rules / Product Designer |  | Pending / Approved / Rejected |  |  |
| QA Reviewer |  | Pending / Approved / Rejected |  |  |
| UX / Accessibility Reviewer |  | Pending / Approved / Rejected |  |  |
| Content / Licensing Reviewer |  | Pending / Approved / Rejected |  |  |
