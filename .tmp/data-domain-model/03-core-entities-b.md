### 9.17 Encounter

**Purpose:** Preserves one encounter's participants, phase, choices, effects, and terminal outcome.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `encounterId` | runtime ID | Yes | Stable |
| `dungeonId` | ID | Yes | Owner dungeon |
| `segmentId` | ID | Yes | Host |
| `expeditionId` | ID | Yes | Current expedition |
| `adventurerId` | ID | Yes | Participant |
| `monsterInstanceIds` | array | Yes | One or more at creation |
| `status` | `EncounterStatus` | Yes | Pending, hidden, active, victory, escaped, death |
| `phase` | `CombatPhase` / null | No | Player or monster turn while active |
| `initiativeSource` | enum / null | No | Quiet, alerted, or approved effect |
| `stealthState` | enum | Yes | Not attempted, hidden, failed, broken |
| `temporaryEffectIds` | array | Yes | Encounter-scoped effects |
| `rewardResolutionStatus` | enum | Yes | Not eligible, pending, complete |
| `startedAt` | datetime | Yes | Committed |
| `endedAt` | datetime / null | No | Terminal transition |
| `outcomeEventId` | ID / null | No | Terminal event |
| `rulesVersion` | version | Yes | Timing/trait baseline |

### 9.18 MonsterInstance

| Field | Type | Required | Notes |
|---|---|---:|---|
| `monsterInstanceId` | runtime ID | Yes | Stable through healing/revival |
| `dungeonId` | ID | Yes | Persistent owner |
| `segmentId` | ID | Yes | Current location |
| `encounterId` | ID | Yes | Origin/current encounter |
| `definitionRef` | `DefinitionVersionRef` | Yes | Monster/boss definition |
| `maxHp` | positive integer | Yes | Persisted creation value |
| `currentHp` | integer 0..max | Yes | Heals on later expedition start if surviving |
| `status` | `MonsterStatus` | Yes | Living, defeated-pending, revived, finally-defeated |
| `traitStates` | array | Yes | Armed effects, regeneration, Undead, etc. |
| `temporaryEffectIds` | array | Yes | Cold Ray, paralysis, or approved effects |
| `spawnSourceId` | ID / null | No | Parent/effect |
| `finalDefeatEventId` | ID / null | No | Rewards wait for this |
| `rulesVersion` | version | Yes | Historical mechanics |
| `contentVersionRef` | value | Yes | Definition package |

### 9.19 TemporaryEffect

| Field | Type | Required | Notes |
|---|---|---:|---|
| `effectId` | runtime ID | Yes | Stable |
| `definitionId` | stable ID | Yes | Approved effect type |
| `sourceRef` | typed reference | Yes | Spell, trait, item, or ability |
| `targetRef` | typed reference | Yes | Adventurer, monster, encounter, or expedition |
| `status` | enum | Yes | Armed, active, consumed, expired |
| `remainingCount` | non-negative integer / null | No | Turns/actions where applicable |
| `triggerPoint` | stable enum | Yes | Approved timing |
| `createdAt` | datetime | Yes | Commit |
| `expiresAtEventId` | ID / null | No | Explicit expiry linkage |
| `rulesVersion` | version | Yes | Timing baseline |

### 9.20 ItemInstance

**Purpose:** Preserves stable identity and mutable state across ownership and location changes.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `itemInstanceId` | runtime ID | Yes | Never replaced on transfer |
| `slotId` | ID | Yes | Save owner |
| `definitionRef` | `DefinitionVersionRef` | Yes | Item/weapon/armour/key/consumable |
| `itemType` | `ItemType` | Yes | Canonical category |
| `location` | `InventoryLocation` | Yes | Exactly one |
| `status` | `ItemStatus` | Yes | Available, equipped, dropped, contained, consumed, destroyed, sold |
| `handRequirement` | integer 0..2 | Yes | Persisted definition result |
| `maximumDurability` | integer / null | No | Armour only |
| `currentDurability` | integer / null | No | 0 may preserve magical ring effects where approved |
| `charges` | integer / null | No | Item-specific |
| `rolledProperties` | structured value | Yes | Persisted magic result, spell, jewel value, modifiers |
| `originDungeonId` | ID / null | No | Required for normal keys and origin-bound items |
| `createdByEventId` | ID | Yes | Reward/content trace |
| `terminalEventId` | ID / null | No | Consumption/destruction/sale |
| `rulesVersion` | version | Yes | Creation baseline |
| `contentVersionRef` | value | Yes | Definition package |

#### Rules

- Every non-terminal item has exactly one location.
- Equipped items reference the active adventurer and legal slots/hands.
- Backpack count excludes equipped items and may not exceed ten after a committed action.
- Rolled properties are assigned once and persist.
- Sold, consumed, destroyed, and spent items cannot reappear in recovery.
- A terminal item retains a tombstone sufficient for history and referential integrity.

### 9.21 RecoverableContainer

**Purpose:** Holds belongings left by one death and supports partial recovery without merging identities.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `containerId` | runtime ID | Yes | One per death when belongings exist |
| `dungeonId` | ID | Yes | Owner |
| `segmentId` | ID | Yes | Location |
| `deathRecordId` | ID | Yes | Unique source |
| `type` | `RecoverableContainerType` | Yes | Corpse or belongings |
| `itemIds` | array | Yes | Remaining items |
| `coins` | non-negative integer | Yes | Remaining coins |
| `status` | `RecoveryStatus` | Yes | Unrecovered, partial, recovered, destroyed, cleaned |
| `createdAt` | datetime | Yes | Death commit |
| `updatedAt` | datetime | Yes | Partial recovery |
| `closedAt` | datetime / null | No | Empty/terminal |
| `rulesVersion` | version | Yes | Recovery baseline |

### 9.22 DeathRecord

**Purpose:** Captures the complete mechanical death transition.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `deathRecordId` | runtime ID | Yes | Stable |
| `slotId` | ID | Yes | Owner |
| `adventurerId` | ID | Yes | Deceased |
| `deathType` | `DeathType` | Yes | Normal or darkness |
| `causeCode` | stable string | Yes | Machine-readable |
| `causeSummary` | original concise text | Yes | No unapproved copied prose |
| `dungeonId` | ID | Yes | Location |
| `floorId` | ID | Yes | Location |
| `segmentId` | ID | Yes | Location |
| `expeditionId` | ID | Yes | Context |
| `containerId` | ID / null | No | Belongings |
| `occurredAt` | datetime | Yes | Atomic event |
| `eventId` | ID | Yes | Mechanical history |
| `rulesVersion` | version | Yes | Interpretation |

### 9.23 GraveyardRecord

**Purpose:** Provides a permanent save-level death index.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `graveyardRecordId` | runtime ID | Yes | Stable |
| `slotId` | ID | Yes | Owner |
| `deathRecordId` | ID | Yes | Exactly one |
| `adventurerId` | ID | Yes | Historical identity |
| `adventurerNameSnapshot` | private text | Yes | Preserves name at death |
| `dungeonId` | ID | Yes | Location |
| `floorNumber` | integer | Yes | Snapshot |
| `segmentId` | ID | Yes | Location |
| `causeCode` | string | Yes | Search/filter |
| `occurredAt` | datetime | Yes | Sort |
| `recoveryStatus` | `RecoveryStatus` | Yes | Mirrors linked container safely |
| `containerId` | ID / null | No | Recovery reference |

Graveyard creation is atomic with death and survives for the lifetime of the slot.

### 9.24 EventEntry

**Purpose:** Stores an immutable mechanically relevant event in total slot order.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `eventId` | runtime ID | Yes | Stable |
| `slotId` | ID | Yes | Owner |
| `sequence` | positive integer | Yes | Unique and strictly increasing |
| `occurredAt` | datetime | Yes | Display ordering aid |
| `category` | `EventCategory` | Yes | Generation, combat, inventory, death, etc. |
| `eventType` | stable namespaced string | Yes | Machine-readable |
| `actorRefs` | array of typed refs | Yes | May be empty for system action |
| `subjectRefs` | array of typed refs | Yes | Affected records |
| `locationRef` | typed ref / null | No | Dungeon/segment/town |
| `rollResultIds` | array | Yes | Immutable evidence |
| `beforeSummary` | structured value / null | No | Mechanically relevant fields only |
| `afterSummary` | structured value / null | No | Mechanically relevant fields only |
| `reasonCode` | string | Yes | Rule/action source |
| `rulesVersion` | version | Yes | Interpretation |
| `contentVersionRefs` | array | Yes | Definitions used |
| `correctionOfEventId` | ID / null | No | Amendment linkage |
| `visibility` | enum | Yes | Player, diagnostic, summary |
| `retentionClass` | enum | Yes | Active-complete, final-500, permanent-summary |

### 9.25 CompletionSummary

| Field | Type | Required | Notes |
|---|---|---:|---|
| `completionSummaryId` | runtime ID | Yes | Stable |
| `slotId` | ID | Yes | Owner |
| `dungeonId` | ID | Yes | One per completed dungeon |
| `completedAt` | datetime | Yes | Boss completion |
| `adventurerId` | ID | Yes | Completing adventurer |
| `bossDefinitionRef` | value | Yes | Historical |
| `rewardEventIds` | array | Yes | One-time rewards |
| `keyFacts` | structured value | Yes | Floors, segment count, deaths/recoveries, relevant summary |
| `eventSequenceRange` | value | Yes | Original range |
| `rulesVersion` | version | Yes | Completion baseline |
| `contentVersionRefs` | array | Yes | Used content |
| `integrityHash` | string | Should | Detects accidental change |

### 9.26 PlayerNote

**Purpose:** Stores optional user-authored text without changing mechanical truth.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `noteId` | runtime ID | Yes | Stable |
| `slotId` | ID | Yes | Owner |
| `linkedRefs` | array of typed refs | Yes | Slot/adventurer/dungeon/segment/event |
| `text` | private user-authored text | Yes | Never source-labelled as official |
| `createdAt` | datetime | Yes | Creation |
| `updatedAt` | datetime | Yes | Editable |
| `archivedAt` | datetime / null | No | Soft deletion |
| `provenanceCategory` | constant | Yes | `user_authored` |

### 9.27 ContentPackage

**Purpose:** Groups immutable approved definitions and their version/provenance manifest.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `packageId` | namespaced string | Yes | Stable |
| `packageVersion` | semantic or monotonic version | Yes | Immutable version |
| `rulesCompatibility` | version range/set | Yes | Valid rules baselines |
| `definitionIds` | array | Yes | Stable sorted manifest |
| `tableIds` | array | Yes | Stable sorted manifest |
| `approvalStatus` | `ApprovalStatus` | Yes | Release gate |
| `contentHash` | string | Yes | Canonical package hash |
| `provenanceRecordIds` | array | Yes | Rights/attribution |
| `createdAt` | datetime | Yes | Package creation |
| `approvedAt` | datetime / null | No | Approval |
| `reviewDate` | date | Yes | Rights review |

### 9.28 ContentDefinition

**Purpose:** Provides one immutable, typed, versioned rule/content definition.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `definitionId` | namespaced string | Yes | Stable across compatible revisions |
| `definitionVersion` | version | Yes | Specific immutable revision |
| `packageId` | ID | Yes | Owner |
| `contentType` | `ContentType` | Yes | Race, class, dungeon, monster, item, spell, ability, trap, reward |
| `machineData` | validated structured value | Yes | Mechanics/parameters only |
| `displayCopyRef` | ID / null | No | Approved original/paraphrased copy |
| `provenanceRecordId` | ID | Yes | Source/rights |
| `approvalStatus` | `ApprovalStatus` | Yes | Release gate |
| `contentHash` | string | Yes | Canonical record hash |
| `supersedes` | definition-version ref / null | No | Version lineage |

### 9.29 TableDefinition and TableRowDefinition

| Field | Type | Required | Notes |
|---|---|---:|---|
| `tableId` | namespaced string | Yes | Stable |
| `tableVersion` | version | Yes | Immutable |
| `diceExpression` | enum/value | Yes | d6 or 2d6 in Core |
| `rowIds` | ordered array | Yes | Complete coverage |
| `minimumResult` | integer | Yes | 1 or 2 |
| `maximumResult` | integer | Yes | 6 or 12 |
| `provenanceRecordId` | ID | Yes | Rights/source |
| `rowId` | namespaced string | Yes | Stable within table |
| `rangeStart` | integer | Yes | Inclusive |
| `rangeEnd` | integer | Yes | Inclusive |
| `resultRef` | definition/value ref | Yes | Resolved data |
| `contentHash` | string | Yes | Integrity |

Rows must have complete non-overlapping coverage and deterministic order.

### 9.30 ProvenanceRecord

| Field | Type | Required | Notes |
|---|---|---:|---|
| `provenanceRecordId` | stable ID | Yes | Asset/definition-level |
| `sourceCategory` | `SourceCategory` | Yes | Official, project-original, user-authored, third-party, unknown, restricted |
| `sourceName` | text | Conditional | Required for bundled/imported |
| `sourceVersion` | text/date | Should | Version or retrieval date |
| `licenseId` | string / null | Conditional | Required where licence applies |
| `permissionEvidenceRef` | secure project reference / null | Conditional | No confidential evidence embedded in public app |
| `attribution` | text/reference / null | Conditional | Display-ready or linked |
| `restrictions` | array | Yes | Digital use, modification, distribution, attribution, etc. |
| `approvalStatus` | `ApprovalStatus` | Yes | Draft, approved, blocked, restricted |
| `reviewedBy` | text/reference | Conditional | Approval record |
| `reviewDate` | date | Conditional | Approval record |
| `contentHash` | string | Should | Reviewed material hash |

### 9.31 ImportReport

| Field | Type | Required | Notes |
|---|---|---:|---|
| `importReportId` | runtime ID | Yes | Stable |
| `targetSlotId` | ID | Yes | Proposed target |
| `sourceManifest` | `ExportManifest` | Yes | Parsed without mutation |
| `status` | `ImportStatus` | Yes | Parsed, invalid, previewed, confirmed, committed, failed |
| `validationIssues` | array | Yes | Machine code + safe message |
| `migrationPlan` | array | Yes | Sequential steps |
| `previewSummary` | structured value | Yes | Consequences before confirmation |
| `preImportSnapshotId` | ID / null | No | Created before commit |
| `committedSnapshotId` | ID / null | No | Final pointer |
| `createdAt` | datetime | Yes | Start |
| `completedAt` | datetime / null | No | Terminal |
| `privacyWarningAcknowledged` | boolean | Yes | Confirmation evidence |

### 9.32 MigrationRecord

| Field | Type | Required | Notes |
|---|---|---:|---|
| `migrationRecordId` | runtime ID | Yes | Stable |
| `slotId` | ID | Yes | Target |
| `fromSchemaVersion` | positive integer | Yes | Source |
| `toSchemaVersion` | positive integer | Yes | Exactly next supported step |
| `migrationId` | stable string | Yes | Implementation/version |
| `status` | `MigrationStatus` | Yes | Planned, running, committed, rolled-back, failed |
| `preMigrationSnapshotId` | ID | Yes | Recovery |
| `resultSnapshotId` | ID / null | No | Success |
| `startedAt` | datetime | Yes | Start |
| `completedAt` | datetime / null | No | Terminal |
| `issues` | array | Yes | Safe diagnostics |
| `integrityHashBefore` | string | Should | Audit |
| `integrityHashAfter` | string / null | No | Success |

## 10. Value Objects

### 10.1 DefinitionVersionRef

| Field | Type | Validation |
|---|---|---|
| `definitionId` | namespaced string | Non-empty stable machine ID |
| `definitionVersion` | version | Valid supported format |
| `packageId` | namespaced string | Resolves to package |
| `packageVersion` | version | Resolves to immutable package |
| `contentHash` | string | Matches referenced definition |

**Equality:** All fields equal.

**Serialization:** Canonical JSON object with fixed key order.

### 10.2 TypedEntityRef

| Field | Type | Validation |
|---|---|---|
| `entityType` | stable enum | Approved entity type |
| `entityId` | runtime or definition ID | Resolves in scope or is an allowed tombstone |
| `slotId` | ID / null | Required for runtime save-owned entities |

### 10.3 HpPool

| Field | Type | Validation |
|---|---|---|
| `current` | integer | 0..maximum |
| `maximum` | positive integer | Persisted creation result |
| `lastChangeReason` | string | Approved reason code |

### 10.4 DiceResult

| Field | Type | Validation |
|---|---|---|
| `naturalDice` | integer array | Each value 1..6 |
| `sum` | integer | Equals natural-dice sum when applicable |
| `finalValue` | integer / null | Approved calculation |
| `inputMode` | enum | Generated or manual |
| `streamDrawRange` | range / null | Required for generated |

### 10.5 ModifierRecord

| Field | Type | Validation |
|---|---|---|
| `sourceRef` | typed reference | Stable source |
| `operation` | enum | Add, multiply, cap, floor, replace, prevent |
| `value` | integer/rational/boolean | Rule-valid |
| `order` | positive integer | Unique within calculation |
| `ruleId` | DRS ID | Approved source |

### 10.6 LightPool and LightPayment

| Field | Type | Validation |
|---|---|---|
| `physicalTorches` | integer | 0..10 |
| `virtualUnits` | integer | >=0; active expedition only |
| `paymentType` | enum | Physical, virtual, or approved exception |
| `amount` | integer | Positive and available |
| `sourceRef` | typed reference / null | Spell/effect when virtual/exception |

### 10.7 InventoryLocation

| Field | Type | Validation |
|---|---|---|
| `locationType` | enum | Equipped, backpack, segment, recoverable-container, terminal |
| `ownerId` | ID / null | Required except terminal |
| `slotKey` | string / null | Equipment slot when needed |
| `position` | integer / null | Display order only; not identity |

### 10.8 DungeonCompletion

| Field | Type | Validation |
|---|---|---|
| `status` | enum | Incomplete or completed |
| `bossFinalDefeatEventId` | ID / null | Required when completed |
| `rewardResolved` | boolean | True exactly once after approved resolution |
| `completedAt` | datetime / null | Required when completed |
| `completionSummaryId` | ID / null | Required after summary creation |

### 10.9 AdventurerLocation

| Field | Type | Validation |
|---|---|---|
| `kind` | enum | Town or dungeon_segment |
| `dungeonId` | ID / null | Required for dungeon |
| `segmentId` | ID / null | Required for dungeon |
| `expeditionId` | ID / null | Required for active dungeon location |

### 10.10 ContentVersionRef

| Field | Type | Validation |
|---|---|---|
| `packageId` | namespaced string | Stable |
| `packageVersion` | version | Supported or retained historical package |
| `contentHash` | string | Matches package |
| `approvalStatusAtUse` | enum | Approved for bundled release use |

### 10.11 ExportManifest

| Field | Type | Validation |
|---|---|---|
| `packageFormatVersion` | positive integer | Supported |
| `schemaVersion` | positive integer | Supported or migratable |
| `sourceAppVersion` | version | Informational |
| `rulesVersion` | version | Required |
| `contentVersionSet` | sorted array | Complete and unique |
| `exportedAt` | datetime | RFC 3339 UTC |
| `scope` | enum | `save_slot` for MVP |
| `slotId` | ID | Source identity |
| `entityCounts` | map | Matches data |
| `sectionHashes` | map | Matches canonical sections |
| `manifestHash` | string | Matches manifest |

### 10.12 ValidationIssue

| Field | Type | Validation |
|---|---|---|
| `code` | stable string | Machine-readable |
| `severity` | enum | Info, warning, error, blocking |
| `entityRef` | typed ref / null | Safe linkage |
| `fieldPath` | string / null | No private value exposure |
| `messageKey` | string | Original application wording |
| `recoveryOptions` | array | Approved actions only |

### 10.13 ActionCommit

| Field | Type | Validation |
|---|---|---|
| `actionCommitId` | runtime ID | Stable |
| `slotId` | ID | One slot |
| `actionType` | stable string | Approved functional action |
| `expectedSnapshotId` | ID | Optimistic consistency guard |
| `affectedRefs` | array | All mutated aggregates |
| `rollResultIds` | array | Outcomes committed in action |
| `eventIds` | array | Mechanical history |
| `newSnapshotId` | ID | Valid complete state |
| `committedAt` | datetime | Atomic commit time |

## 11. Enumeration Catalogue

| Enum | Canonical values |
|---|---|
| `SaveSlotStatus` | `empty`, `creating`, `ready`, `active`, `importing`, `migrating`, `isolated`, `resetting` |
| `SnapshotKind` | `current`, `last_valid`, `pre_migration`, `pre_import`, `import_staging`, `migration_staging`, `manual_backup` |
| `IntegrityStatus` | `not_checked`, `valid`, `warning`, `invalid`, `unsupported_newer_version` |
| `AdventurerStatus` | `creating`, `alive`, `dead`, `historical` |
| `DungeonStatus` | `created`, `active`, `incomplete`, `completed`, `archived` |
| `SegmentType` | `entrance`, `corridor`, `room`, `staircase`, `final_room` |
| `DoorState` | `unknown`, `trapped`, `locked`, `unlocked`, `open`, `broken` |
| `ExpeditionStatus` | `preparing`, `active`, `completed_in_dungeon`, `retreated`, `exited`, `dead`, `cancelled_before_entry` |
| `EncounterStatus` | `pending`, `hidden`, `active`, `victory`, `escaped`, `adventurer_dead`, `resolved_without_combat` |
| `CombatPhase` | `player_turn`, `monster_turn`, `resolving_triggers` |
| `MonsterStatus` | `living`, `defeated_pending_triggers`, `revived`, `finally_defeated` |
| `ItemType` | `weapon`, `armour`, `ring`, `key`, `master_key`, `torch`, `consumable`, `treasure`, `wonder`, `magic_item`, `valuable`, `other_approved` |
| `ItemStatus` | `available`, `equipped`, `backpack`, `dropped`, `contained`, `consumed`, `destroyed`, `sold` |
| `RecoverableContainerType` | `corpse`, `belongings` |
| `RecoveryStatus` | `unrecovered`, `partially_recovered`, `recovered`, `destroyed`, `cleaned` |
| `RandomStreamKind` | `dungeon`, `combat`, `reward`, `repopulation` |
| `InputMode` | `generated`, `manual_physical_dice` |
| `EventCategory` | `system`, `creation`, `generation`, `exploration`, `door`, `trap`, `stealth`, `combat`, `spell`, `inventory`, `reward`, `town`, `expedition`, `death`, `recovery`, `graveyard`, `save`, `migration`, `import`, `correction`, `completion` |
| `ContentType` | `race`, `class`, `ability`, `spell`, `dungeon`, `segment_result`, `monster`, `boss`, `trait`, `weapon`, `armour`, `item`, `key`, `trap`, `reward`, `table`, `display_copy`, `asset` |
| `SourceCategory` | `official`, `project_original`, `user_authored`, `third_party`, `unknown`, `restricted` |
| `ApprovalStatus` | `draft`, `approved`, `blocked`, `restricted`, `superseded` |
| `ImportStatus` | `parsed`, `invalid`, `validated`, `previewed`, `confirmed`, `committed`, `failed`, `cancelled` |
| `MigrationStatus` | `planned`, `running`, `committed`, `rolled_back`, `failed` |
| `RetentionClass` | `active_complete`, `completed_final_500`, `permanent_summary`, `diagnostic_transient` |

Enumeration rules:

- Persist canonical machine values, never translated or styled labels.
- Do not reuse a lifecycle enum for an unrelated entity.
- Unknown imported values are blocking unless a specific migration maps them.
- Terminal values cannot transition back without an explicit approved restore rule.

