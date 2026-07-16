4. On floors 1 and 2, apply the staircase-pressure check before the normal segment-table result:
   - Let `n` be the number of generated non-stair segments already on the current floor, excluding the entrance, staircases, and final room.
   - If `n < 6`, no additional pressure applies.
   - If `n = 6`, a pressure roll of 1 on d6 creates a downward staircase.
   - If `n = 7`, a pressure roll of 1-2 creates a downward staircase.
   - If `n = 8`, a pressure roll of 1-3 creates a downward staircase.
   - If `n = 9`, a pressure roll of 1-4 creates a downward staircase.
   - If `n >= 10`, the next valid unexplored connection must create a downward staircase.
5. If pressure does not create stairs, roll the authorised segment table. A normal table staircase result remains valid.
6. A downward staircase from floor 1 leads to floor 2 and creates its destination segment on first traversal/opening according to the content definition.
7. A downward staircase from floor 2 leads directly to the floor-3 final room.
8. The final room contains only the persisted boss-table result and has no unexplored outward connection.
9. Opening a connection that creates a room immediately resolves room content and the initial monster-table result unless the room is the final room.
10. Every generated result and graph mutation is committed atomically.

### 9.4 Requirements

| ID | Requirement | Priority | Acceptance signal |
|---|---|---:|---|
| DRS-DUN-001 | Dungeon type and name shall use three authorised d6 lookups. | Must | Fixed dice create expected names and types. |
| DRS-DUN-002 | A dungeon shall be stored as stable segments and connections rather than visual tiles. | Must | Re-layout leaves topology unchanged. |
| DRS-DUN-003 | Content shall be generated only after a connection successfully opens. | Must | Unopened connections have no destination result. |
| DRS-DUN-004 | Segment-table column selection shall depend only on the origin segment type. | Must | Stair, corridor, and room fixtures select the correct column. |
| DRS-DUN-005 | Each generated room shall resolve one room-content result and one initial monster result. | Must | Room fixtures contain both results. |
| DRS-DUN-006 | A no-monster row shall create an empty encounter state rather than omit the room result. | Must | Repopulation remains possible later. |
| DRS-DUN-007 | Every segment shall have an explicit floor. | Must | Save and navigation tests preserve floors. |
| DRS-DUN-008 | Floors 1 and 2 shall use the six-target and ten-maximum staircase-pressure algorithm. | Must | Boundary tests match all pressure bands. |
| DRS-DUN-009 | The floor-3 destination shall be the final room. | Must | No ordinary floor-3 generation occurs. |
| DRS-DUN-010 | The final room shall have no outward unexplored connections. | Must | Boss-room graph invariant passes. |
| DRS-DUN-011 | The final room shall resolve the boss table only, not ordinary content or monsters. | Must | Boss room contains one boss result and no normal room roll. |
| DRS-DUN-012 | Defeating the boss shall generate 2d6 Treasure resolutions exactly once. | Must | Reload and revisit do not duplicate rewards. |
| DRS-DUN-013 | Discovering the final room shall not delete or close existing branches. | Must | Other branches remain navigable. |
| DRS-DUN-014 | Completion shall require the boss encounter to be resolved with the boss defeated. | Must | Discovery alone does not complete. |
| DRS-DUN-015 | A completed dungeon shall remain persistent and shall not regenerate its boss or one-time rewards. | Must | Re-entry preserves completion. |
| DRS-DUN-016 | Secret stairs and passages shall obey the same floor and termination invariants. | Must | Secret-route simulations terminate. |
| DRS-DUN-017 | Directions shall be labels only unless an authorised content effect explicitly uses them. | Must | Layout changes do not alter rules. |
| DRS-DUN-018 | Cosmetic room names or descriptions shall not create actions, rewards, hazards, or lore-state changes. | Must | Content validation rejects mechanical markup in flavour fields. |
| DRS-DUN-019 | Existing dungeons shall retain the generation-rules version under which they were created. | Must | Updating constants does not mutate old topology. |
| DRS-DUN-020 | Generation shall be validated with at least 100,000 deterministic seeds per dungeon type. | Must | Zero non-terminating or unreachable-boss results. |
| DRS-DUN-021 | A failed invariant shall reject the build or generation result and expose reproducible seed details. | Must | Failure report contains seed, versions, and trace. |
| DRS-DUN-022 | The Palace shall be the first mechanical-prototype dungeon. | Must | Prototype fixtures use Palace content definitions. |
| DRS-DUN-023 | Entrance topology shall come from the dungeon content definition and shall be persisted before the first player choice. | Must | Reload preserves entrance state. |
| DRS-DUN-024 | A segment or connection ID shall never depend on display name, list index, or map coordinates. | Must | Stable-ID migration tests pass. |
| DRS-DUN-025 | Generated content shall preserve the exact authorised row ID and content version. | Must | History can identify the source row. |

## 10. Doors, Traps, Secret Passages, and Chests

### 10.1 Door state machine

A normal door begins `Unknown`. On the first opening or inspection attempt, roll 1d6:

- 1: `Trapped` - resolve the dungeon trap table.
- 2-3: `Locked`.
- 4-6: `Unlocked`.

A trapped door is not also locked. If the trap is cancelled or the adventurer survives its complete effect, the door opens and its destination is generated. If the trap kills the adventurer, the trap is marked resolved, the door becomes `Unlocked`, and it remains unopened for a later adventurer; the trap does not reroll.

A locked door may be opened by spending one light unit, using one valid normal key, using a master key, using the Locksmith ability, or using an authorised item/effect. It may instead be broken without a torch. Breaking permanently changes it to `Broken`, opens it, and alerts connected monsters according to the alert rules.

### 10.2 Requirements

| ID | Requirement | Priority | Acceptance signal |
|---|---|---:|---|
| DRS-DOOR-001 | The initial door roll shall occur once and persist. | Must | Repeated interaction does not reroll. |
| DRS-DOOR-002 | Initial probabilities shall be 1 trapped, 2-3 locked, and 4-6 unlocked. | Must | Boundary fixtures pass. |
| DRS-DOOR-003 | Door states shall be Unknown, Trapped, Locked, Unlocked, Open, or Broken. | Must | Invalid transitions are rejected. |
| DRS-DOOR-004 | Trap or lock resolution shall precede destination generation. | Must | Killed-before-open scenarios reveal no destination. |
| DRS-DOOR-005 | A survived or cancelled trapped-door result shall open without a second lock roll; if the trap kills the adventurer, the resolved door shall remain Unlocked and unopened. | Must | Survival and death-interruption fixtures preserve one trap result. |
| DRS-DOOR-006 | Spending one light unit shall open one locked door when no exception applies. | Must | Resource and state change commit together. |
| DRS-DOOR-007 | A normal key shall be consumed, occupy one backpack slot before use, and work only in its origin dungeon. | Must | Cross-dungeon use is rejected. |
| DRS-DOOR-008 | A master key shall be reusable, occupy one backpack slot, and work in any dungeon. | Must | Repeated use does not consume it. |
| DRS-DOOR-009 | Keys and lock abilities shall not cancel traps. | Must | Trap resolves before lock bypass. |
| DRS-DOOR-010 | Breaking shall cost no torch, permanently open the door, and prevent later closing or repair. | Must | Broken state persists. |
| DRS-DOOR-011 | Breaking shall alert monsters in the destination and through directly communicating broken-door connections. | Must | Alert graph propagation fixture passes. |
| DRS-DOOR-012 | Open and Broken doors shall not be closable in canonical mode. | Must | Close action is unavailable. |
| DRS-DOOR-013 | Disarm Traps shall cost one light unit and arm a room-scoped protection against the next door trap triggered from that room. | Must | First eligible trap is cancelled and protection consumed. |
| DRS-DOOR-014 | Secret-passage search shall be permitted once per eligible segment and cost one light unit before rolling. | Must | Failure still consumes cost and marks searched. |
| DRS-DOOR-015 | Dwarf secret-passage advantage shall roll two dice and keep the higher result for the table lookup. | Must | Advantage fixtures pass. |
| DRS-DOOR-016 | A secret-passage result may produce nothing, a chest, a trap, a passage, or stairs only as defined by the dungeon table. | Must | Result type matches authorised row. |
| DRS-DOOR-017 | A hidden chest shall use the normal chest procedure. | Must | Chest outcomes are identical regardless of source. |
| DRS-DOOR-018 | Opening a chest shall roll two d6; the higher die is the coin quantity and the lower die is the Treasure quantity. | Must | Ordered-dice fixtures pass. |
| DRS-DOOR-019 | Double natural 1 on a chest shall produce no coins or Treasure and shall activate one dungeon trap. | Must | Trap resolves and empty reward persists. |
| DRS-DOOR-020 | Trap effects shall resolve in authorised effect order and may deal damage, remove an arm, kill, spend resources, spawn monsters, or do nothing. | Must | Every trap row has deterministic fixtures. |

## 11. Exploration, Torches, Light, Arms, and Hands

### 11.1 Exploration order

On entering a segment:

1. Set the current segment.
2. Resolve first-entry repopulation if this is a later expedition and the room is eligible.
3. If living monsters are present, determine whether Move Silently is available or combat begins.
4. If no unresolved hostile encounter blocks action, expose legal room, door, chest, item, passage, and movement actions.

