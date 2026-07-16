## 9. Core Entities

All runtime IDs are opaque lowercase UUID-compatible strings. Definition IDs are stable namespaced strings. Timestamps use UTC RFC 3339 strings. Enumerated values use canonical lowercase snake-case machine values.

### 9.1 ApplicationWorkspace

**Purpose:** Represents application-owned local data and the fixed save-slot catalogue.

**Aggregate / owner:** Root application record

| Field | Type | Required | Default | Priority | Notes |
|---|---|---:|---|---|---|
| `workspaceId` | string | Yes | `workspace.local` | Must | Stable local root ID |
| `workspaceSchemaVersion` | positive integer | Yes | Current | Must | Workspace-only schema |
| `slotIds` | array of 3 IDs | Yes | Three generated stable IDs | Must | Exactly three unique entries |
| `createdAt` | datetime | Yes | Current time | Must | First application-data creation |
| `updatedAt` | datetime | Yes | Current time | Must | Last workspace mutation |
| `lastOpenedSlotId` | ID / null | No | null | Could | Convenience pointer only; does not determine validity |

#### Validation

- Exactly three unique slot IDs exist.
- Every slot ID resolves to a `SaveSlot`.
- No game mechanic depends on `lastOpenedSlotId`.

### 9.2 SaveSlot

**Purpose:** Provides a stable container, user-facing name, current state pointer, recovery pointer, and compatibility status.

**Aggregate / owner:** `ApplicationWorkspace`

| Field | Type | Required | Default | Priority | Notes |
|---|---|---:|---|---|---|
| `slotId` | runtime ID | Yes | Generated | Must | Stable for the slot lifetime |
| `slotIndex` | integer 1..3 | Yes | Assigned | Must | Unique and immutable |
| `displayName` | private text | Yes | `Save 1..3` | Must | Player-editable; not a mechanical key |
| `status` | `SaveSlotStatus` | Yes | `empty` | Must | Controls allowed operations |
| `currentSnapshotId` | ID / null | No | null | Must | Current committed state |
| `lastValidSnapshotId` | ID / null | No | null | Must | Recoverable state independent from current write |
| `schemaVersion` | positive integer / null | No | null | Must | Null only while empty |
| `rulesVersion` | version / null | No | null | Must | Current save baseline |
| `contentVersionSet` | array of `ContentVersionRef` | Yes | empty | Must | Definitions needed by runtime instances |
| `integrityStatus` | `IntegrityStatus` | Yes | `not_checked` | Must | Never hides invalidity |
| `recoveryAvailable` | boolean | Yes | false | Must | Derived from valid recovery pointer |
| `createdAt` | datetime | Yes | Current time | Must | Slot record creation |
| `updatedAt` | datetime | Yes | Current time | Must | Last metadata/state-pointer change |

#### Ownership and lifecycle

- The slot record is never removed independently of an application reset.
- Confirmed slot reset clears game-owned children and returns the slot to `empty`.
- Import replacement commits by atomically switching the current pointer after validation and confirmation.
- Corruption isolates the slot and leaves the other two slots usable.

### 9.3 SaveSnapshot

**Purpose:** Identifies a complete consistent save state suitable for current use, recovery, migration rollback, or import staging.

**Aggregate / owner:** `SaveSlot`

| Field | Type | Required | Default | Priority | Notes |
|---|---|---:|---|---|---|
| `snapshotId` | runtime ID | Yes | Generated | Must | Stable snapshot identity |
| `slotId` | ID | Yes | — | Must | Owning slot |
| `kind` | `SnapshotKind` | Yes | `current` | Must | Current, last-valid, pre-migration, pre-import, or staging |
| `stateRootId` | ID | Yes | — | Must | Resolves to `SaveGameState` |
| `schemaVersion` | positive integer | Yes | Current | Must | Snapshot schema |
| `rulesVersion` | version | Yes | Current | Must | Rules baseline |
| `contentVersionSet` | array | Yes | — | Must | Complete referenced package set |
| `eventSequence` | non-negative integer | Yes | 0 | Must | Last included mechanical sequence |
| `createdAt` | datetime | Yes | Current time | Must | Commit time |
| `reason` | enum/string | Yes | `action_commit` | Must | Why snapshot exists |
| `integrityHash` | string | Should | Calculated | Should | Covers manifest and canonical state |
| `validationStatus` | `ValidationStatus` | Yes | `valid` after commit | Must | Invalid staging cannot become current |

#### Rules

- A current or last-valid pointer references only a valid snapshot.
- A snapshot is immutable after successful commit.
- Physical implementations may use copy-on-write or structural sharing, but export must reconstruct a complete state.

### 9.4 SaveGameState

**Purpose:** Holds slot-level domain references and versioned state needed to resume play.

**Aggregate / owner:** `SaveSnapshot`

| Field | Type | Required | Default | Priority | Notes |
|---|---|---:|---|---|---|
| `gameStateId` | runtime ID | Yes | Generated | Must | Root of one complete state |
| `slotId` | ID | Yes | — | Must | Owning slot |
| `activeAdventurerId` | ID / null | No | null | Must | Null before creation or after death |
| `activeExpeditionId` | ID / null | No | null | Must | At most one |
| `dungeonIds` | ordered array of IDs | Yes | empty | Must | Persistent dungeons |
| `graveyardRecordIds` | ordered array of IDs | Yes | empty | Must | Lifetime death records |
| `randomStreamIds` | map by stream kind | Yes | Four streams | Must | Dungeon, combat, reward, repopulation |
| `nextEventSequence` | positive integer | Yes | 1 | Must | Monotonic mechanical sequence |
| `rulesVersion` | version | Yes | Current | Must | Default for new instances |
| `contentVersionSet` | array | Yes | Current packages | Must | Default content set |
| `createdAt` | datetime | Yes | Current time | Must | State creation |
| `updatedAt` | datetime | Yes | Current time | Must | Last committed transition |

#### Validation

- At most one active adventurer and expedition exist.
- An active expedition requires a living active adventurer.
- Every referenced dungeon, Graveyard record, stream, and event belongs to the same slot.
- Four required random streams exist exactly once.

### 9.5 RandomStreamState

**Purpose:** Persists independent deterministic random sequences.

**Aggregate / owner:** `SaveGameState`

| Field | Type | Required | Default | Priority | Notes |
|---|---|---:|---|---|---|
| `streamId` | runtime ID | Yes | Generated | Must | Stable stream identity |
| `slotId` | ID | Yes | — | Must | Owning save |
| `kind` | `RandomStreamKind` | Yes | — | Must | Unique per save |
| `algorithmId` | stable string | Yes | Approved implementation | Must | Versioned algorithm |
| `algorithmVersion` | version | Yes | — | Must | Prevents silent sequence change |
| `seedMaterial` | string/bytes | Yes | Generated | Must | Private local state |
| `state` | opaque serialized value | Yes | Initial | Must | Sufficient for exact next draw |
| `drawCount` | non-negative integer | Yes | 0 | Must | Audit index |
| `updatedAt` | datetime | Yes | Current time | Must | Last committed draw |

#### Rules

- Each random action uses only its assigned stream.
- State advances atomically with the committed outcome.
- Import/export preserves algorithm, state, and draw count.
- A version change cannot reinterpret an existing stream without an approved migration.

### 9.6 RollResult

**Purpose:** Preserves natural dice, input mode, stream consumption, table lookup, modifiers, and final value.

| Field | Type | Required | Default | Priority | Notes |
|---|---|---:|---|---|---|
| `rollResultId` | runtime ID | Yes | Generated | Must | Immutable |
| `slotId` | ID | Yes | — | Must | Owning save |
| `streamKind` | enum / null | Conditional | — | Must | Null for manual input |
| `streamDrawStart` | integer / null | Conditional | — | Must | First draw index |
| `naturalDice` | array of integers 1..6 | Yes | — | Must | Preserves each die |
| `inputMode` | `InputMode` | Yes | `generated` | Must | Generated or manual |
| `tableId` | definition ID / null | No | null | Must | Used for table resolution |
| `tableRowId` | definition ID / null | No | null | Must | Stable resolved row |
| `modifiers` | array of `ModifierRecord` | Yes | empty | Must | Ordered application |
| `finalValue` | integer / null | No | null | Must | When numeric |
| `rulesVersion` | version | Yes | — | Must | Historical interpretation |
| `contentVersionRef` | value / null | No | null | Must | Table/content version |
| `committedAt` | datetime | Yes | Current time | Must | Immutable commit time |
| `correctedByEventId` | ID / null | No | null | Must | Original remains intact |

### 9.7 Adventurer

**Purpose:** Represents the current or historical player character and all mechanically relevant personal state.

**Aggregate / owner:** `SaveGameState`

| Field | Type | Required | Default | Priority | Notes |
|---|---|---:|---|---|---|
| `adventurerId` | runtime ID | Yes | Generated | Must | Stable across death/history |
| `slotId` | ID | Yes | — | Must | Owning save |
| `displayName` | private text | Yes | Player supplied | Must | Not used as identity |
| `raceRef` | `DefinitionVersionRef` | Yes | Generated | Must | Weighted result |
| `classRef` | `DefinitionVersionRef` | Yes | Generated | Must | Weighted result |
| `maxHp` | positive integer | Yes | Derived at creation | Must | Persisted creation result |
| `currentHp` | integer | Yes | `maxHp` | Must | 0..maxHp |
| `usableArms` | integer 0..2 | Yes | 2 | Must | Core upper bound |
| `usableHands` | integer 0..2 | Yes | 2 | Must | Core upper bound |
| `physicalTorches` | integer 0..10 | Yes | 10 | Must | Resource state |
| `coins` | non-negative integer | Yes | 0 | Must | Unbounded practical maximum |
| `abilityStates` | array | Yes | Generated | Must | Race/class/item effects |
| `spellChargePools` | array | Yes | Generated | Must | Duplicate spells remain countable |
| `equippedItemIds` | ordered array | Yes | Starting weapon | Must | Legal hand/equipment state |
| `backpackItemIds` | ordered array | Yes | empty | Must | Maximum 10 |
| `status` | `AdventurerStatus` | Yes | `alive` | Must | Alive, dead, or historical |
| `currentLocation` | `AdventurerLocation` | Yes | town | Must | Town or dungeon segment |
| `deathRecordId` | ID / null | No | null | Must | Set on death |
| `createdAt` | datetime | Yes | Current time | Must | Creation |
| `updatedAt` | datetime | Yes | Current time | Must | Last state transition |
| `rulesVersion` | version | Yes | Current | Must | Creation baseline |
| `contentVersionSet` | array | Yes | Current | Must | Creation definitions |

#### Derived fields

| Field | Formula / source | Persisted or calculated | Override behaviour |
|---|---|---|---|
| `creationMaxHp` | race base HP + class modifier | Persisted | No canonical override |
| `availableHands` | usable hands minus hands occupied by equipped items | Calculated | Cannot be manually overridden |
| `inventoryCount` | count of backpack item IDs | Calculated | Overflow must be resolved |
| `isAlive` | current HP > 0 and status = alive | Calculated | Death transition is authoritative |
| `hasLightAvailable` | physical torches + active expedition virtual light > 0, or approved exception | Calculated | No silent grant |

### 9.8 AdventurerAbility

| Field | Type | Required | Notes |
|---|---|---:|---|
| `abilityInstanceId` | runtime ID | Yes | Stable |
| `adventurerId` | ID | Yes | Owner |
| `definitionRef` | `DefinitionVersionRef` | Yes | Race/class/item ability |
| `sourceType` | enum | Yes | Race, class, item, spell, or temporary |
| `sourceInstanceId` | ID / null | No | Item/effect source |
| `state` | structured value | Yes | Uses, armed flag, or approved mutable state |
| `active` | boolean | Yes | False when source is unavailable |
| `rulesVersion` | version | Yes | Historical interpretation |

### 9.9 SpellChargePool

| Field | Type | Required | Notes |
|---|---|---:|---|
| `spellPoolId` | runtime ID | Yes | Duplicate spell results get distinct pools |
| `adventurerId` | ID | Yes | Owner |
| `spellRef` | `DefinitionVersionRef` | Yes | Basic spell definition |
| `maximumCharges` | positive integer | Yes | Normally one per generated result |
| `currentCharges` | integer | Yes | 0..maximum |
| `source` | enum/reference | Yes | Creation, item, or approved effect |
| `createdAt` | datetime | Yes | Persisted result |

### 9.10 Dungeon

**Purpose:** Owns one persistent generated dungeon and its graph truth.

| Field | Type | Required | Default | Priority | Notes |
|---|---|---:|---|---|---|
| `dungeonId` | runtime ID | Yes | Generated | Must | Stable |
| `slotId` | ID | Yes | — | Must | Owner |
| `dungeonDefinitionRef` | `DefinitionVersionRef` | Yes | Selected | Must | One of six core types |
| `generatedName` | text | Yes | Committed result | Must | Not identity |
| `status` | `DungeonStatus` | Yes | `created` | Must | Created, active, completed, archived |
| `entranceSegmentId` | ID | Yes | Generated | Must | Floor 1 |
| `bossSegmentId` | ID / null | No | null until generated | Must | Floor 3 final room |
| `floorIds` | ordered array | Yes | Floor 1 | Must | Maximum three core floors |
| `connectionIds` | array | Yes | empty | Must | Graph edges |
| `completion` | `DungeonCompletion` | Yes | incomplete | Must | Boss/reward state |
| `currentExpeditionId` | ID / null | No | null | Must | At most one |
| `createdAt` | datetime | Yes | Current time | Must | Creation |
| `completedAt` | datetime / null | No | null | Must | Boss final defeat commit |
| `rulesVersion` | version | Yes | Current | Must | Generation baseline |
| `contentVersionRef` | value | Yes | Current package | Must | Dungeon tables/content |

#### Validation

- Every floor and connection belongs to this dungeon.
- Every connection endpoint resolves to an existing segment in this dungeon.
- The entrance is reachable and floor 1.
- Generated dungeons obey the six non-stair target, ten non-stair hard maximum, forced-stair, floor count, and final-room rules.
- A completed dungeon retains topology and cannot regenerate its boss or one-time reward.

### 9.11 DungeonFloor

| Field | Type | Required | Notes |
|---|---|---:|---|
| `floorId` | runtime ID | Yes | Stable |
| `dungeonId` | ID | Yes | Owner |
| `number` | integer 1..3 | Yes | Unique within dungeon |
| `segmentIds` | array | Yes | All segments on floor |
| `nonStairSegmentCount` | integer 0..10 | Yes | Derived but persisted for validation |
| `stairSegmentId` | ID / null | No | Required when next floor exists |
| `finalRoomSegmentId` | ID / null | No | Required only on floor 3 after generation |
| `generationStatus` | enum | Yes | Not started, active, sealed |
| `rulesVersion` | version | Yes | Generation baseline |

### 9.12 DungeonSegment

**Purpose:** Represents one authoritative graph node and its persistent local state.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `segmentId` | runtime ID | Yes | Stable graph node |
| `dungeonId` | ID | Yes | Owner |
| `floorId` | ID | Yes | Owner floor |
| `segmentType` | `SegmentType` | Yes | Entrance, corridor, room, staircase, final room |
| `contentRef` | `DefinitionVersionRef` / null | No | Room/content result |
| `connectionIds` | array | Yes | Incident edges |
| `encounterIds` | array | Yes | Historical/current encounters |
| `activeEncounterId` | ID / null | No | At most one blocking encounter |
| `itemIds` | array | Yes | Dropped items |
| `recoverableContainerIds` | array | Yes | Death belongings |
| `secretSearchStatus` | enum | Yes | Not eligible, unsearched, resolved |
| `markers` | array of typed markers | Yes | Entrance, boss, corpse, belongings, inert portal, etc. |
| `repopulationState` | structured value | Yes | Per-expedition check linkage |
| `generatedAt` | datetime | Yes | Committed before presentation |
| `rulesVersion` | version | Yes | Historical behaviour |
| `contentVersionRef` | value | Yes | Definition package |

A cached visual position may be stored in a separate read-model record. It cannot determine movement, adjacency, floor membership, reachability, or generation.

### 9.13 DungeonConnection

**Purpose:** Represents an undirected traversable relationship between two segments.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `connectionId` | runtime ID | Yes | Stable edge |
| `dungeonId` | ID | Yes | Same for both endpoints |
| `segmentAId` | ID | Yes | Endpoint |
| `segmentBId` | ID | Yes | Endpoint |
| `connectionType` | enum | Yes | Door, open passage, staircase link, secret passage |
| `doorId` | ID / null | Conditional | Required for door connection |
| `discoveryStatus` | enum | Yes | Unknown, discovered |
| `traversalStatus` | enum | Yes | Blocked, traversable |
| `createdByEventId` | ID | Yes | Generation trace |
| `rulesVersion` | version | Yes | Generation baseline |

#### Validation

- Endpoints are distinct and belong to the same dungeon.
- Duplicate equivalent edges are rejected unless an approved content rule explicitly permits them.
- Traversal derives from connection and door state, not visual placement.

### 9.14 Door

| Field | Type | Required | Notes |
|---|---|---:|---|
| `doorId` | runtime ID | Yes | One per door connection |
| `connectionId` | ID | Yes | Owner |
| `state` | `DoorState` | Yes | Unknown, trapped, locked, unlocked, open, broken |
| `trapRef` | `DefinitionVersionRef` / null | No | Created when trapped |
| `trapResolution` | enum / null | No | Pending, cancelled, survived, fatal |
| `lockResolutionMethod` | enum / null | No | Light, normal key, master key, ability, item, break |
| `resolvedAt` | datetime / null | No | First final resolution |
| `rulesVersion` | version | Yes | Timing baseline |

### 9.15 Expedition

**Purpose:** Represents one entry-to-exit attempt in a persistent dungeon.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `expeditionId` | runtime ID | Yes | Stable history grouping |
| `slotId` | ID | Yes | Owner |
| `dungeonId` | ID | Yes | Target |
| `adventurerId` | ID | Yes | Participant |
| `status` | `ExpeditionStatus` | Yes | Preparing, active, completed, retreated, exited, dead |
| `currentSegmentId` | ID / null | Conditional | Required while active/completed in dungeon |
| `entryLightPayment` | `LightPayment` / null | Conditional | Committed before active |
| `virtualLightUnits` | non-negative integer | Yes | Cleared at expedition end |
| `repopulationCheckIds` | array | Yes | One per eligible checked room |
| `startedAt` | datetime | Yes | Entry commit |
| `endedAt` | datetime / null | No | Exit/death |
| `endReason` | enum / null | No | Retreat, emergency exit, death, completion exit |
| `rulesVersion` | version | Yes | Runtime baseline |

### 9.16 RepopulationCheck

| Field | Type | Required | Notes |
|---|---|---:|---|
| `repopulationCheckId` | runtime ID | Yes | Stable |
| `expeditionId` | ID | Yes | Owner |
| `segmentId` | ID | Yes | Eligible ordinary room |
| `rollResultId` | ID | Yes | Uses repopulation stream |
| `monsterInstanceIds` | array | Yes | Empty for no-monster result |
| `checkedAt` | datetime | Yes | First entry in later expedition |
| `outcome` | enum | Yes | Monsters or none |

A unique `(expeditionId, segmentId)` constraint prevents rerolling.

