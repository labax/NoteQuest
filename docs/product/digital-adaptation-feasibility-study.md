# Feasibility Report: Digital Adaptation of *NoteQuest*

## Executive summary

A digital adaptation of *NoteQuest* is **technically very feasible**. The game already has many characteristics that translate cleanly into software:

- Dice-driven character creation.
- Table-based procedural generation.
- Discrete rooms, corridors, staircases, and doors.
- Simple turn-based combat.
- Small inventories and numeric resources.
- Persistent dungeon state.
- Character death followed by corpse recovery.
- Short, repeatable game sessions.

The main difficulty is not programming the mechanics. It is converting the brief tabletop rules into a complete and unambiguous digital ruleset. Several situations that a tabletop player can resolve informally must be explicitly defined in software.

The most suitable first product would be a **faithful single-player digital dungeon crawler**, rather than a heavily expanded conventional roguelike. The initial release should preserve the paper game’s procedural map creation, torch pressure, high lethality, equipment recovery, and minimal combat system.

### Overall feasibility assessment

| Area | Assessment | Main concern |
|---|---|---|
| Core rules implementation | High | Several rules require clarification |
| Procedural dungeon generation | High | Dungeon termination must be formalised |
| Combat implementation | Very high | Trigger wording and armour rules need decisions |
| User interface | High | Map readability and action visibility |
| Save and persistence system | High | Multiple adventurers may revisit one dungeon |
| Content conversion | High | Tables are already structured |
| Mobile suitability | High | Information density may require careful layout |
| Accessibility | High | Mostly text, icons, counters, and turn-based input |
| Online multiplayer | Low priority | Not supported by the original design |
| Legal and licensing feasibility | Unconfirmed | No explicit adaptation licence appears in the PDF |
| Commercial differentiation | Moderate | Strong core loop, but limited initial content |
| Overall project risk | Low–moderate | Mostly design clarification rather than engineering |

The core game is contained in a small rule section, followed by six themed dungeon table sets: Palace, Crypt, Tomb, Sanctuary, Temple, and Prison. This compact, table-oriented structure makes the content particularly suitable for a data-driven implementation.

---

# 1. Adaptation models

There are three realistic ways to adapt the game.

## 1.1 Digital tabletop assistant

The software rolls tables, tracks the character, records inventory, and helps construct the map, but the user remains responsible for interpreting and resolving the game.

### Advantages

- Lowest development cost.
- Few rules need to be formalised.
- Closest to the original tabletop experience.
- Can function as a companion to the printed book.
- Minimal animation and audiovisual requirements.

### Disadvantages

- Limited appeal outside the existing tabletop audience.
- The player still performs substantial manual work.
- It may feel like a utility rather than a complete game.
- Commercial value may be relatively low.

### Feasibility

**Very high**, but it would underuse the potential of the source material.

---

## 1.2 Faithful full digital adaptation

The application handles all rolls, rules, combat, map generation, inventory, death, town actions, and dungeon persistence. The player makes decisions but does not manually interpret tables.

### Advantages

- Preserves the original design.
- Suitable for desktop, web, tablet, and mobile.
- Manageable technical scope.
- Easy to test because most systems are deterministic apart from random rolls.
- Creates a complete product rather than a reference tool.
- Leaves room for later expansions.

### Disadvantages

- Every ambiguity must be resolved.
- The small amount of original content may become repetitive.
- The minimalist combat system may require strong presentation to remain engaging.

### Feasibility

**High and recommended.**

---

## 1.3 Expanded digital roguelike

This interpretation would add animated combat, movement within rooms, character progression, status effects, larger item systems, expanded classes, quests, narrative events, and potentially procedural campaigns.

### Advantages

- Greater long-term replayability.
- Broader commercial appeal.
- More opportunities for audiovisual presentation.
- Can develop into a distinct game franchise.

### Disadvantages

- Much larger scope.
- Risks replacing rather than adapting the original design.
- Requires extensive balancing and new content.
- Introduces design problems that the tabletop game deliberately avoids.
- Harder to distinguish which mechanics are authentic and which are newly invented.

### Feasibility

**Technically feasible but unsuitable as the first release.**

The recommended approach is to build the faithful adaptation first and treat expanded roguelike features as later modules.

---

# 2. Core digital gameplay loop

The original loop can be converted into the following software flow:

1. Create or select an adventurer.
2. Roll race and class.
3. Generate spells and starting equipment.
4. Generate or select a dungeon.
5. Enter the dungeon and consume one torch.
6. Explore connected segments.
7. Resolve doors, traps, rooms, monsters, and treasure.
8. Choose whether to continue or retreat.
9. Reach the final room.
10. Fight the dungeon boss.
11. Collect boss rewards.
12. Return to town.
13. Rest, repair, sell, and resupply.
14. Continue to another dungeon or re-enter the existing one.
15. On death, record the adventurer in the Graveyard and leave their belongings in the dungeon.

This loop is unusually well suited to software because it consists almost entirely of discrete state changes. There are no simultaneous actions, complex positioning rules, social interactions, or unrestricted player commands.

---

# 3. Technical feasibility by system

## 3.1 Character generation

Character generation is straightforward:

- Roll 2d6 for race.
- Roll 2d6 for class.
- Add racial HP and class HP.
- Assign racial ability.
- Assign class ability.
- Assign starting weapon.
- Generate any starting spells.
- Set coins to zero.
- Set torches to ten.

The use of 2d6 should be preserved because it creates weighted rarity. A simple random selection from twelve races would change the frequency distribution significantly.

### Required digital components

| Component | Complexity |
|---|---:|
| Race table | Low |
| Class table | Low |
| HP calculation | Low |
| Starting inventory | Low |
| Random spells | Low |
| Ability registration | Moderate |
| Character naming | Low |
| Character portrait generation or selection | Optional |

The main implementation concern is not generation but the architecture of abilities. Abilities should not be coded as scattered special cases. They should be represented through reusable gameplay effects such as:

- Modify damage.
- Modify sale price.
- Grant spells.
- Replace a roll procedure.
- Permit an action.
- Prevent a consequence.
- Generate currency on kill.
- Heal after a condition.
- Repair equipment.

A modular effect system makes later races, classes, items, and expansions much easier to add.

---

## 3.2 Dungeon generation

The game constructs the dungeon incrementally rather than generating the whole layout in advance. This is a good fit for digital adaptation.

Each segment should be stored as a node in a graph:

- Room
- Corridor
- Staircase
- Final room
- Entrance

Doors are edges between those nodes.

Each node can contain:

- Generated room description.
- Monster group.
- Chest or treasure.
- Trap state.
- Secret-passage eligibility.
- Discovered status.
- Cleared status.
- Visited status.
- Corpses and dropped items.
- Connections to other segments.

### Recommended generation model

Generate a segment only when the player successfully opens its connecting door.

This preserves the tabletop experience:

- The dungeon remains unknown.
- Save files need not contain unexplored content.
- Randomness is resolved at the moment of discovery.
- The player’s map grows in response to actions.

### Major unresolved issue: dungeon termination

The book states that the final room is found upon entering the third dungeon level. It also says that if no staircase reaches that level, the last opened room becomes the final room. The second condition does not define how the software knows that a room is the last room.

A digital version needs one explicit rule.

### Recommended digital ruling

Use a hidden exploration budget for each dungeon floor.

For example:

- Each floor receives a target number of generated rooms.
- Once the target is reached, the probability of generating a downward staircase increases.
- After a hard maximum, the next valid connection becomes a staircase automatically.
- Entering the third level generates the boss room immediately.
- The boss room has no additional doors.

This preserves procedural uncertainty while guaranteeing termination.

An alternative is to pre-generate a hidden connected graph at dungeon creation. That would guarantee a boss route, but it would be less faithful to the tabletop method because the complete dungeon would technically already exist.

---

## 3.3 Map representation

The map is central to the game’s identity. A digital adaptation should avoid reducing exploration to a simple list of rooms.

Three presentation approaches are possible.

### Grid map

Rooms and corridors are placed on a square grid.

**Advantages:** familiar, readable, visually satisfying.

**Problems:** generated door counts may cause overlapping rooms and corridors. Additional placement rules would be required.

### Abstract node map

Segments are displayed as connected nodes.

**Advantages:** no overlap problems, easy generation, ideal for mobile.

**Problems:** less like drawing a dungeon on graph paper.

### Hybrid diagram

Rooms use simple rectangular tiles, but placement is flexible and connections may bend or reposition automatically.

**Advantages:** retains dungeon-map character while avoiding strict spatial constraints.

**Recommendation:** use a hybrid diagram or abstract node map for the first version. A strict grid introduces unnecessary generation and collision complexity that the original rules do not address.

---

## 3.4 Door system

Every unexplored door has a state:

- Unknown
- Trapped
- Locked
- Unlocked
- Open
- Broken
- Permanently open

The original probabilities are easy to reproduce:

- 1 in 6 activates a trap.
- 2 in 6 produces a locked door.
- 3 in 6 produces an unlocked door.

The application must also record whether opening the door alerted monsters.

### Suggested state transition

```text
Unknown door
    → Check door
        → Trap triggered
        → Locked
        → Unlocked

Locked
    → Spend torch to unlock
    → Use key
    → Break door

Unlocked
    → Open quietly

Broken
    → Permanently open
    → Connects monster-alert states across both segments
```

A broken door should remain part of the permanent dungeon state because the rules make it relevant to later monster alerts.

---

## 3.5 Torch system

Torches should be treated as both inventory and expedition time.

The implementation must track:

- Carried torches.
- Whether the dungeon currently has an active light source.
- Whether magical light replaces a torch.
- Whether a lamp frees the character’s hand.
- Whether an action consumes a torch.
- Whether the player has reached zero in darkness.

### Required design clarification

The tabletop text speaks of consuming a torch to enter the dungeon and consuming additional torches for time-consuming actions. It does not track individual torch duration.

The cleanest digital interpretation is:

> Each torch represents one unit of remaining expedition light, and specified actions consume one unit.

The game should warn the player before spending their last torch when doing so would cause death. The player may still be allowed to confirm the action, but accidental death caused by interface ambiguity would feel unfair.

### Death sequence at zero light

1. Resolve the action that consumed the final torch.
2. Check whether another light source is active.
3. If none is active, trigger darkness death.
4. Leave recoverable equipment according to the corpse rules.
5. Record the death in the Graveyard.

The exact timing needs to be chosen because it may affect whether an item discovered by the final action can be recovered.

---

## 3.6 Combat engine

Combat has very low mechanical complexity.

### Turn cycle

1. Determine initiative.
2. If monsters act first, resolve their combined damage.
3. On the player turn, choose a weapon, spell, or applicable consumable.
4. Choose a target.
5. Roll or calculate damage.
6. Apply monster traits.
7. Remove defeated monsters.
8. If monsters remain, resolve combined monster damage.
9. Continue until the player escapes, dies, or wins.

### Advantages for digital adaptation

- No artificial-intelligence pathfinding.
- No spatial combat map.
- No enemy targeting decisions.
- No complicated initiative queue.
- No accuracy calculations.
- No resource-heavy animation requirements.

### Main combat risk

The combat may feel too passive if presented only as repeated damage rolls. The software should improve presentation without changing the mechanics.

Useful presentation features include:

- Clear turn history.
- Damage animation.
- Monster portraits or silhouettes.
- Visible trait triggers.
- Fast-forward option.
- One-click repeat attack.
- Strong sound and screen feedback.
- Predicted incoming damage.
- Clear indication of which monsters remain active.

The interface should not hide the underlying dice. Watching the roll is part of the game’s character.

---

# 4. Rules requiring formal decisions

A digital adaptation cannot leave these questions unresolved.

## 4.1 Monster trait triggers

Several abilities activate “when you get a 1 on the damage roll.” The most likely interpretation is that the effect triggers when the player rolls a natural 1 while attacking that monster.

### Recommended ruling

- Traits such as Explosive, Firebreath, Horde, Sorcery, Deathtouch, Necromancy, Regeneration, and Paralyze trigger when the player’s unmodified weapon damage die shows a natural 1.
- Weakness triggers when that die shows a natural 6.
- Flat-damage spells do not trigger these effects unless specifically stated.
- Bonus damage does not change whether a roll counts as a natural 1 or 6.

Without such a definition, fixed-damage spells and modified weapons become difficult to resolve.

---

## 4.2 Explosive monsters

The text says an explosive monster destroys itself and deals damage equal to its current HP when a 1 is rolled.

The software must decide:

- Whether the player’s original attack damage is applied first.
- Whether the explosion affects only the player.
- Whether armour can absorb the explosion.
- Whether the explosion affects other monsters.

### Recommended ruling

- The trigger interrupts the normal attack.
- The monster explodes before receiving attack damage.
- It dies immediately.
- The player receives damage equal to the monster’s HP at the moment of explosion.
- Armour may absorb it unless the effect is Poison.
- Other monsters are unaffected.

This is conservative and avoids inventing area damage.

---

## 4.3 Armour damage allocation

The player may reduce either character HP or armour HP. It is unclear whether one monster attack can be divided.

### Recommended ruling

Each combined monster attack creates one damage amount. The player allocates that damage sequentially:

1. Select an armour piece or character HP.
2. Apply as much damage as possible.
3. If an armour piece is destroyed, remaining damage may spill into character HP.
4. Damage cannot be divided among multiple intact pieces unless the first selected piece breaks.

This prevents the player from distributing damage across several pieces to preserve all of them indefinitely.

A simpler alternative is to assign the entire attack to one target with excess damage lost. That would make armour considerably stronger and should only be used if intended.

---

## 4.4 Armour repair

“Spend 1 coin to recover HP of an armor” does not specify the amount restored.

### Recommended ruling

One town repair action fully restores one damaged armour piece for one coin.

This matches the game’s generally generous town recovery system, where one coin fully restores character HP and spells.

The Blacksmith ability should similarly fully restore one armour piece by spending one torch.

---

## 4.5 Inventory capacity

The character may carry ten items in the backpack, but it is unclear whether equipped items count.

### Recommended ruling

- Backpack capacity: ten unequipped items.
- Equipped weapon and worn armour do not count toward backpack capacity.
- Torches use a separate capacity of ten.
- Keys can either count as items or use a separate key slot; the original wording suggests they should count as items unless explicitly exempted.

A visible inventory limit is essential. When receiving an item at full capacity, the player must choose an item to leave behind.

---

## 4.6 Items left in rooms

The rules explicitly leave dead characters’ equipment in the room, but do not discuss deliberately dropped items.

### Recommended ruling

Any discarded item remains in that room and can be collected later.

This follows naturally from the corpse-recovery system and adds useful inventory decisions.

---

## 4.7 Corpse recovery

The book alternates between describing the old character’s corpse and saying that only the backpack and clothes remain after death by darkness.

The application should distinguish:

- Normal death: corpse and equipment remain.
- Darkness death: no corpse remains; recoverable items remain.
- Consumables already used do not return.
- Destroyed armour does not return.
- Coins should either remain as a dropped stack or be lost.

The most faithful interpretation is that all carried coins and items remain at the death location unless destroyed by a specific effect.

---

## 4.8 Returning to a dungeon

Empty rooms generate monsters again when re-entered after returning from town or after entering with a new character.

The application must define “empty room.”

### Recommended ruling

A room is eligible for repopulation when:

- It was previously generated.
- It currently contains no living monsters.
- The player has left the dungeon since last entering it.
- It is entered again during a later expedition.

Roll once when the room is first entered during that expedition. Do not repeatedly reroll every time the player walks back and forth during the same expedition.

Rooms containing a corpse or dropped items can still repopulate.

Corridors and staircases do not repopulate because the rule specifically refers to rooms.

---

## 4.9 Existing monsters recovering health

The rules say remaining monsters recover all health when the player returns.

This should occur when a new expedition begins, not every time the player leaves and re-enters a room during one expedition.

A dungeon should therefore track an expedition identifier or a “reset on dungeon exit” event.

---

## 4.10 Move Silently

Successful stealth allows the player to pass monsters, take treasures, and open doors.

A complete digital ruling should answer whether stealth persists.

### Recommended ruling

- Roll once when entering an occupied room quietly.
- On success, the player becomes hidden in that room.
- The player may collect visible treasure and interact with normal doors.
- Actions explicitly described as noisy break stealth.
- Breaking a door, activating a trap, attacking, or failing another stealth-related action alerts the monsters.
- Leaving the room ends the hidden state.
- Re-entering requires a new stealth attempt.
- Returning through the room may therefore be dangerous.
- Boss rooms cannot be crossed stealthily.

This keeps the mechanic useful without allowing permanent bypass.

---

## 4.11 Disarm Traps

The text says the player may disarm a trap “in a room,” but traps primarily occur when opening doors.

Possible interpretations include:

- Disarming prevents a room-content trap.
- Disarming protects all doors opened from that room.
- Disarming retroactively removes an already known trap.

### Recommended ruling

Treat Disarm Traps as a temporary room preparation action:

- Spend one torch.
- Mark the current room as trap-safe.
- The next door trap triggered from that room is cancelled.
- The protection is then consumed.

This is mechanically useful, but it is an adaptation decision rather than a completely explicit original rule.

A stricter adaptation may omit the action until its intended interpretation is confirmed.

---

## 4.12 Secret passages

A secret passage can produce a trap, nothing, a hidden chest, or a staircase.

The software should track whether a segment has already been searched. Otherwise, repeated torch spending could eventually guarantee a positive result.

### Recommended ruling

Each eligible segment may be searched only once.

After the roll, mark it as searched regardless of the result.

---

## 4.13 Keys

A normal key opens any door in its current dungeon. A master key opens any door in any dungeon.

The rules do not explicitly say whether keys are consumed.

### Recommended ruling

- Normal key: consumed when used.
- Master key: reusable.

This gives the master key a meaningful distinction beyond cross-dungeon compatibility. However, because the text does not explicitly say either is consumed, this should be confirmed during rules formalisation.

---

## 4.14 Lost arms and hands

The game includes traps that can remove an arm, two-handed weapons, torches requiring a hand, lamps, and Light spells.

A digital character should therefore track available hands.

### Suggested model

| Condition | Available hands |
|---|---:|
| Normal character | 2 |
| One arm lost | 1 |
| Both arms lost | 0 |

Common equipment requirements:

- Torch: one hand.
- One-handed weapon: one hand.
- Two-handed weapon: two hands.
- Lamp: no hand.
- Light spell: no hand.

A character with one arm can use a one-handed weapon while relying on a lamp or Light spell, but cannot simultaneously carry a torch and weapon.

The application must also define what happens if the character has no valid light-and-weapon configuration. They may still move or cast spells if those actions are available.

---

## 4.15 Spell use

Each generated spell represents one use between rests.

The digital model should store spells as individual charges rather than only unique spell names. A character with two Heal results has two Heal uses.

The application must decide:

- Whether spells require a free hand.
- Whether damage spells trigger monster die-based traits.
- Whether Teleport can target undiscovered rooms.
- What “empty room” means for Teleport.
- Whether Light lasts for one action, one room, or the entire expedition.

### Recommended rulings

- Spells do not require a hand unless specified.
- Teleport can target any previously discovered room containing no monsters.
- Light replaces one torch unit for the current expedition and does not consume a hand.
- Each Light use should add one effective light resource rather than operate on a duration timer.
- Fixed-damage spells do not trigger natural-roll monster traits.

---

# 5. Data architecture

The game should be data-driven. Dungeon tables, races, classes, spells, items, monsters, and bosses should be stored as editable content rather than hard-coded logic.

## 5.1 Primary entities

### Adventurer

```text
Adventurer
- id
- name
- race_id
- class_id
- current_hp
- maximum_hp
- coins
- torches
- available_hands
- status
- current_dungeon_id
- current_segment_id
- spells[]
- inventory[]
- equipped_weapon
- equipped_armor[]
- abilities[]
- created_at
- died_at
- cause_of_death
```

### Dungeon

```text
Dungeon
- id
- generated_name
- dungeon_type
- status
- current_depth
- entrance_segment_id
- boss_segment_id
- boss_defeated
- expedition_count
- segments[]
- doors[]
- created_at
- completed_at
```

### Segment

```text
Segment
- id
- dungeon_id
- type
- floor
- room_size
- description
- discovered
- visited
- searched_for_secret
- trap_disarmed
- monsters[]
- contents[]
- dropped_items[]
- corpse_ids[]
- door_ids[]
```

### Monster instance

```text
MonsterInstance
- id
- monster_definition_id
- current_hp
- maximum_hp
- traits[]
- alive
- alerted
```

### Item instance

```text
ItemInstance
- id
- item_definition_id
- category
- modifier
- current_durability
- maximum_durability
- equipped
- owner_id
- segment_id
```

### Graveyard record

```text
GraveyardRecord
- adventurer_id
- name
- dungeon_name
- floor
- room
- cause_of_death
- date
- recoverable_items
```

---

## 5.2 Definition versus instance data

The implementation should separate definitions from runtime instances.

A weapon definition might be:

```text
Rapier
- base_die: d6
- damage_modifier: +1
- hands_required: 1
```

A specific rapier instance might be:

```text
Rapier of Destruction
- base_definition: Rapier
- additional_damage: +2
- location: Palace room 14
```

This separation is essential because magic item names use templates such as “[Weapon] of Destruction” and “[Armor] of Strength.”

---

# 6. Game-state architecture

The game naturally supports a state-machine design.

## Main states

```text
Main menu
Character creation
Town
Dungeon entrance
Segment exploration
Door resolution
Room resolution
Combat
Reward resolution
Inventory management
Boss encounter
Dungeon completed
Character death
Graveyard
```

Each state should expose only valid actions.

For example, in combat the player should not be able to search for secret passages. In a room containing monsters, treasure interactions should remain unavailable unless stealth is active.

A strict action-state model prevents many rules bugs.

---

# 7. User-interface requirements

## 7.1 Primary game screen

The main screen should display:

- Dungeon map.
- Current room or corridor.
- Adventurer HP.
- Armour pieces and durability.
- Torches.
- Coins.
- Equipped weapon.
- Available spells.
- Current enemies.
- Available actions.
- Recent event log.

The player should not need to open multiple screens to check survival-critical information.

## 7.2 Action clarity

Actions should clearly show cost and consequence.

Examples:

```text
Unlock door — Costs 1 torch
Move silently — Costs 1 torch; 3 stealth dice
Search for secret passage — Costs 1 torch; available once
Break door — No torch; alerts nearby monsters
Return to town — Route currently safe
```

The “Return to town” action should be disabled when the path to the entrance contains unresolved monsters, because the rules require the return route to be empty.

## 7.3 Event log

A permanent event log would replace some of the narration normally performed by the player.

Example:

```text
You opened the western door.
The door was locked.
You spent one torch to unlock it.
A wide chamber lies beyond.
Three Fungoids occupy the room.
You opened the door quietly and act first.
```

The log is also valuable for debugging, automated testing, and player understanding.

## 7.4 Map markers

Useful markers include:

- Unopened door.
- Locked door.
- Broken door.
- Cleared room.
- Occupied room.
- Unsearched secret-passage location.
- Dropped equipment.
- Dead adventurer.
- Downward staircase.
- Dungeon entrance.
- Boss room.

---

# 8. Save-system feasibility

Persistence is more important here than in many small roguelikes because a dungeon survives between characters.

A save file must preserve:

- Generated layout.
- Open and broken doors.
- Loot already collected.
- Dropped equipment.
- Character corpses.
- Surviving monsters.
- Cleared rooms.
- Dungeon completion status.
- Current adventurer.
- Graveyard.
- Town inventory or campaign state, if added.

## Recommended save model

Use automatic saving after every meaningful action:

- Door resolution.
- Room generation.
- Combat turn.
- Item pickup.
- Torch expenditure.
- Dungeon exit.
- Character death.

Because the game is turn-based, saving after each action has negligible performance cost.

A separate save should occur before random resolution only if the design intends to prevent reloading to reroll outcomes. Otherwise, players could manipulate every door, reward, and attack roll.

### Anti-save-scumming options

1. Store random-generator state in the save.
2. Generate and store results before showing animations.
3. Use deterministic seeds for each dungeon.
4. Accept reloading as a player choice.

The first or second approach best preserves consequences without requiring online validation.

---

# 9. Randomness and reproducibility

The application should use seeded random generation.

Benefits include:

- Reproducible bug reports.
- Shareable dungeon seeds.
- Reliable automated tests.
- Daily challenge modes.
- Easier balancing simulations.
- Consistent save restoration.

A dungeon seed could determine:

- Dungeon name.
- Segment results.
- Room content.
- Monsters.
- Treasure.
- Boss.
- Regeneration on later expeditions.

Combat may use the same seed stream or a separate combat stream.

For fairness and debugging, generated results should be recorded in the event log.

---

# 10. Content feasibility

The PDF already provides:

- 11 races.
- 11 classes.
- 6 basic spells.
- 6 dungeon types.
- 72 dungeon-name fragments.
- 6 segment tables, although structurally identical.
- 6 room-content tables.
- 6 trap tables.
- 6 monster tables.
- 6 reward tables.
- 36 bosses.
- Multiple weapon and armour tables.
- Numerous magical modifiers and wonders.

This is sufficient for a playable MVP, but probably not enough for a long commercial campaign without repetition.

## Expected content repetition

The six dungeons share:

- The same segment-generation structure.
- The same secret-passage table.
- The same basic armour distribution.
- Several recurring monsters.
- Several recurring reward effects.
- Similar two-page content structures.

That repetition is acceptable in a tabletop booklet, where interpretation and imagination add variety. A digital game may expose the repetition more quickly because rolls, bookkeeping, and narration happen faster.

### Mitigation without changing the rules

- Add multiple visual variants for each room description.
- Add environmental flavour messages.
- Vary monster illustrations.
- Add discovery animations and sound.
- Record character-specific death history.
- Give rooms persistent names.
- Display past expedition events.
- Use procedural cosmetic details.
- Add optional accelerated combat after repeated encounters.

These improve variety without changing mechanical balance.

---

# 11. Visual and audiovisual feasibility

The original interior artwork establishes a hand-drawn, old-school fantasy tone. A digital adaptation could use:

- Monochrome ink illustrations.
- Parchment or notebook map presentation.
- Limited accent colours for torches, danger, and magic.
- Dice animations.
- Page-turn or pencil-drawing transitions.
- Ambient dungeon sound.
- Minimal combat effects.

A highly animated presentation is not required. In fact, elaborate 3D visuals would create a major cost increase without contributing much to the game’s core appeal.

## Recommended visual direction

A 2D illustrated interface resembling a living adventure notebook:

- Rooms sketch themselves onto the map.
- Monster illustrations appear like ink drawings.
- Torchlight provides the main colour accent.
- Dead adventurers are entered into a handwritten Graveyard.
- Dice visibly roll but resolve quickly.
- Equipment appears as simple illustrated cards.

This would reinforce the source material more effectively than attempting conventional tile-based dungeon movement.

---

# 12. Platform feasibility

## Desktop

Very suitable.

Advantages:

- Map and combat information can remain visible simultaneously.
- Easy support for keyboard and mouse.
- Straightforward save management.
- Good platform for an initial prototype.

## Web

Very suitable.

Advantages:

- No installation barrier.
- Easy testing and distribution.
- Suitable for a turn-based game.
- Can work on desktop and tablet.
- Content updates are simple.

Concerns:

- Offline support requires deliberate implementation.
- Browser storage and save export should be designed carefully.

## Tablet

Highly suitable.

The game resembles a digital character sheet and map, making touch interaction natural. A tablet may be the best experiential match for the original tabletop format.

## Mobile phone

Feasible, but interface design is more difficult.

The map, combat, equipment, and event log cannot all remain visible at once. The interface would need tabs, collapsible panels, or portrait/landscape adaptations.

## Console

Technically feasible but not ideal for the first version. The small-scale, text-heavy interface would require controller-focused navigation and platform certification effort.

### Platform recommendation

Design responsively for desktop and tablet first. Mobile support can follow once the principal interface is stable.

---

# 13. Accessibility feasibility

The game is particularly accessible from a systems perspective because it is:

- Turn-based.
- Free of reaction-time requirements.
- Mostly text and numerical information.
- Playable with a small action set.
- Compatible with keyboard-only input.
- Suitable for screen-reader-oriented structure if designed properly.

Accessibility requirements should include:

- Scalable text.
- High-contrast mode.
- Colour-independent status indicators.
- Reduced animation.
- Optional instant dice results.
- Keyboard navigation.
- Descriptive labels for map nodes.
- Adjustable event-log speed.
- Clear confirmation before irreversible actions.
- No essential information conveyed only through sound.
- Numeric and graphical representation of HP and armour.

The abstract map may require a textual alternative such as:

> Current room: Wide chamber. North door locked. East door broken, leading to a cleared corridor. South passage leads toward the entrance.

---

# 14. Legal and licensing risk

The PDF identifies the author and publication details, but the examined material does not visibly provide a licence granting permission to reproduce, distribute, modify, or digitally adapt the game.

A digital implementation may involve several distinct rights:

- Rules text.
- Setting and terminology.
- Dungeon tables.
- Race and class names.
- Monster and boss descriptions.
- Item names.
- Illustrations.
- Logo and trade dress.
- Translation text.
- Expanded World references.

The mechanics themselves may be treated differently from the exact written expression, artwork, names, and table content depending on jurisdiction, but that should not be relied upon as an adaptation strategy.

## Required pre-production action

Obtain explicit written permission or a licence covering:

1. Digital game adaptation.
2. Reproduction and modification of the rules.
3. Use of names, tables, monsters, items, and setting content.
4. Use or replacement of existing artwork.
5. Commercial distribution.
6. Platforms and territories.
7. Revenue-sharing or royalty conditions.
8. Rights to create new content.
9. Rights relating to the Expanded World supplement.
10. Translation and localisation rights.

Until this is resolved, technical prototyping may be possible internally, but public distribution would carry material legal risk.

---

# 15. Scope recommendation

## Phase 0: Rules formalisation

Before production code, create a [Digital Rules Specification](digital-rules-specification-v0.1.md) containing:

- Definitions.
- Action timing.
- State transitions.
- Random roll procedures.
- Edge cases.
- Proposed rulings for ambiguous rules.
- Examples of play.
- Differences from the printed version.

This is the single most important pre-development deliverable.

## Phase 1: Mechanical prototype

Implement without final art:

- Character generation.
- One dungeon type.
- Incremental map generation.
- Doors and traps.
- Basic combat.
- Torches.
- Town return.
- Character death.
- Save and load.

The objective is to prove that the complete loop is enjoyable when automated.

## Phase 2: MVP

Add:

- All six dungeon types.
- All races and classes.
- All spells.
- Equipment and magic items.
- Secret passages.
- Stealth.
- Armour damage.
- Dungeon repopulation.
- Corpse recovery.
- Graveyard.
- Boss encounters.
- Full save persistence.
- Basic accessibility.
- Complete event log.

## Phase 3: Release presentation

Add:

- Final illustrations.
- Music and sound.
- Animations.
- Tutorial.
- Settings.
- Localisation architecture.
- Save export and backup.
- Achievements or statistics.
- Balancing and quality assurance.

## Phase 4: Expansion

Possible additions:

- Expanded World content.
- Campaign map.
- Hex exploration.
- Advanced classes.
- Settlements and kingdoms.
- New dungeon packs.
- Daily seeded dungeons.
- Challenge modes.
- Optional house-rule presets.

---

# 16. Recommended MVP boundaries

The first playable version should include the following.

| Include | Exclude initially |
|---|---|
| Single-player play | Multiplayer |
| Six core dungeons | Expanded World systems |
| Incremental procedural map | Full pre-generated world |
| Original races and classes | Custom character builder |
| Original combat | Tactical grid combat |
| Original equipment system | Crafting |
| Town actions | Detailed town exploration |
| Persistent dungeons | Large campaign narrative |
| Corpse recovery | Account-wide progression trees |
| Graveyard | Online leaderboards |
| Seeded randomness | Live-service systems |
| Save/load | Cloud accounts |
| Basic sound and effects | Fully animated combat |

This boundary preserves the identity of the game and prevents the project from becoming a much larger generic roguelike.

---

# 17. Quality-assurance feasibility

The small, rules-driven system is highly testable.

## Unit tests

Suitable targets include:

- 2d6 distribution mapping.
- HP calculation.
- Spell generation.
- Door outcome resolution.
- Torch expenditure.
- Darkness death.
- Weapon damage.
- Monster trait triggers.
- Armour damage.
- Item capacity.
- Room repopulation.
- Key restrictions.
- Boss reward generation.

## Integration tests

Examples:

- Create a character and enter a dungeon.
- Open a locked door using a torch.
- Break a door and alert monsters.
- Leave and return to a dungeon.
- Recover a dead character’s equipment.
- Use Light with a two-handed weapon.
- Lose an arm and validate hand restrictions.
- Defeat a boss and complete a dungeon.

## Simulation testing

Automated play simulations would be valuable for estimating:

- Character survival rates.
- Average dungeon duration.
- Torch exhaustion frequency.
- Relative race and class strength.
- Boss difficulty.
- Economy growth.
- Frequency of forced retreat.
- Value of stealth.
- Equipment acquisition speed.

The rules are simple enough that thousands of simulated runs could reveal balance problems before release.

---

# 18. Indicative development effort

These estimates assume one experienced developer, an approved rules specification, a simple 2D presentation, and no online multiplayer.

| Stage | Indicative effort |
|---|---:|
| Rules formalisation | 2–4 weeks |
| Mechanical prototype | 3–6 weeks |
| Complete MVP mechanics | 6–12 additional weeks |
| Interface and content integration | 4–8 weeks |
| Save system, accessibility, testing | 3–6 weeks |
| Final art, audio, polish | 6–12 weeks |
| Total polished small release | Approximately 5–9 months |

A small multidisciplinary team could shorten the calendar time, but not all work can be parallelised. Rules clarification and core-loop validation should precede large-scale art production.

A digital companion rather than a complete game could be produced much faster. A heavily expanded roguelike could take several times longer.

---

# 19. Principal risks

| Risk | Probability | Impact | Mitigation |
|---|---:|---:|---|
| Rules ambiguities produce inconsistent gameplay | High | High | Complete a [Digital Rules Specification](digital-rules-specification-v0.1.md) first |
| Dungeon generation fails to terminate cleanly | Medium | High | Add floor budgets and guaranteed staircase rules |
| Combat feels repetitive | Medium | High | Strong presentation, fast controls, event feedback |
| Limited content becomes repetitive | High | Medium | Cosmetic variation and later content packs |
| Overexpansion destroys original simplicity | High | High | Lock MVP boundaries |
| Save-state bugs corrupt persistent dungeons | Medium | High | Transactional autosaves and versioned save schema |
| Character combinations vary greatly in power | High | Medium | Preserve intentionally or add optional balance mode |
| Mobile interface becomes crowded | Medium | Medium | Desktop/tablet-first responsive design |
| Players do not understand consequences | Medium | Medium | Visible costs, previews, confirmations, tutorial |
| Rights are unavailable or restricted | Unknown | Critical | Secure written adaptation rights before release |
| Existing artwork cannot be reused | Medium | Medium | Budget for replacement artwork |
| Expansion references create incomplete features | High | Low | Mark unsupported expansion mechanics clearly |

---

# 20. Go/no-go criteria

The project should proceed beyond prototype only when the following are true:

1. Adaptation and content rights are confirmed.
2. All critical rule ambiguities have approved rulings.
3. A complete dungeon can always terminate.
4. Save and reload preserve dungeon state correctly.
5. The death-and-recovery loop is functional.
6. Automated combat still produces meaningful decisions.
7. Torch management regularly influences player behaviour.
8. At least one complete dungeon remains enjoyable across repeated runs.
9. The map remains readable after extensive branching.
10. The team agrees not to add major expansion systems before the core release is stable.

A no-go decision would be appropriate if adaptation rights cannot be secured or if automated play reveals that the tabletop enjoyment depends primarily on manual imagination and bookkeeping rather than the decisions themselves.

---

# Final assessment

A faithful digital version of *NoteQuest* is a **strong low-to-moderate complexity game project**.

Its implementation advantages are substantial:

- The rules are compact.
- The content is already arranged as data tables.
- The map can be represented as a graph.
- Combat is turn-based and deterministic apart from dice.
- No sophisticated enemy AI is required.
- The dungeon naturally supports saveable procedural state.
- The death-and-recovery loop creates continuity without a large narrative system.
- The Graveyard provides an inexpensive but effective metagame record.

The largest challenge is **specification completeness**. Approximately a dozen rules need formal interpretation before development can be considered reliable. The second challenge is **presentation and replayability**: automation will make the game faster, which may expose repeated table structures sooner than in tabletop play.

The recommended adaptation strategy is:

> Formalise the rules, build a complete one-dungeon mechanical prototype, validate the torch–exploration–death loop, and then expand to all six core dungeons without adding new progression systems.

Under that approach, the project is technically achievable, controllable in scope, and capable of producing a distinctive minimalist digital dungeon crawler.
