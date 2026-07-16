# NoteQuest Digital Adaptation Decision Register

## Current decision status

This document remains the approved historical baseline for the original product, rules, UX, persistence, and MVP decisions. The later [Decision Register v0.2](digital-adaptation-decision-register-v0.2.md) resolves the remaining questions and supersedes any conflicting earlier statement, including the earlier phone-support wording. Approved v0.2 rulings must be used by all downstream specifications.  
  
**Status:** Draft for review    
**Purpose:** Record the formal product, rules, architecture, UX, licensing, and release decisions required before the NoteQuest application can be fully designed and specified.    
**Related document:** [Digital Adaptation Feasibility Study](digital-adaptation-feasibility-study.md)  
  
## How to use this register  
  
- Review each recommended ruling.  
- Add comments, alternatives, conditions, or questions in the **Comments / alternative ruling** column.  
- Tick **Approved** only when the recommendation is accepted as the project baseline.  
- An approved row becomes an input to the Product Requirements, Functional Requirements, Digital Rules Specification, Data Model, UX Flow, and Acceptance Criteria documents.  
- Where a comment changes the recommendation, the approved baseline is the recommendation as amended by that comment.  
- Legal and licensing recommendations require confirmation by an appropriately qualified rights or legal reviewer before public release.  
  
---  
  
## 1. Product direction and scope  
  
| ID | Decision needed | Recommended ruling | Comments / alternative ruling                     | Approved |  
|---|---|---|---------------------------------------------------|----------|  
| PROD-001 | What type of product is being created? | Build a **faithful full digital adaptation** that automates the complete core NoteQuest loop rather than a tabletop assistant or expanded roguelike. | <!-- comments -->                                 | yes      |  
| PROD-002 | What is the product’s primary design principle? | Preserve the source game’s procedural exploration, torch pressure, lethality, simple combat, persistent dungeons, corpse recovery, and Graveyard. | <!-- comments -->                                 | yes      |  
| PROD-003 | What is the initial player model? | Single-player only for the initial release. Multiplayer and cooperative play are explicitly deferred. | <!-- comments -->                                 | yes      |  
| PROD-004 | What content is included in the initial adaptation? | Include the six core dungeon types and core rules only. Treat Expanded World and other supplements as separate future scopes. | <!-- comments -->                                 | yes      |  
| PROD-005 | How should ambiguities in the tabletop rules be handled? | Use approved digital rulings documented in a versioned Digital Rules Specification. Never resolve ambiguity silently in code. | <!-- comments -->                                 | yes      |  
| PROD-006 | Are house rules part of the baseline? | Keep one canonical rules mode for MVP. Defer optional house-rule presets until after the faithful baseline is stable. | <!-- comments -->                                 | yes      |  
| PROD-007 | What is the intended release model? | Develop as a releasable standalone application, while treating commercial publication as dependent on confirmed adaptation and content rights. | develop a web application                         | no       |  
| PROD-008 | What platforms are the initial design target? | Design desktop and tablet first, with responsive mobile support considered but not allowed to compromise the primary interface. | design for web first with full responsive support | no       |  
| PROD-009 | What connectivity model should the MVP use? | Use an offline-first, local-save model with no mandatory account, server, or online connection. | <!-- comments -->                                 | yes      |  
| PROD-010 | How should major scope expansion be controlled? | Do not add crafting, tactical grid combat, campaign-world systems, account progression, live-service systems, or narrative generation before the core release is accepted. |                                                | yes      |  
  
---  
  
## 2. Legal, licensing, and content rights  
  
| ID | Decision needed | Recommended ruling | Comments / alternative ruling  | Approved |  
|---|---|---|--------------------------------|----------|  
| LIC-001 | Is explicit permission required for the adaptation? | Obtain written permission or a licence covering digital adaptation before public distribution. Internal prototyping does not imply release permission. | permission obtained            | yes      |  
| LIC-002 | May the application reproduce or modify the rules text? | Treat exact rules prose as protected content. Use original UI wording and concise approved summaries unless the licence explicitly permits reproduction. | <!-- comments -->              | no       |  
| LIC-003 | May the original tables be digitised? | Require explicit permission for the race, class, spell, dungeon, room, monster, boss, trap, item, and reward tables before including their full content. | permission obtained            | yes      |  
| LIC-004 | May source names and terminology be used? | Confirm permission for the NoteQuest name and all race, class, spell, monster, boss, item, dungeon, and setting names used by the application. | permission obtained            | yes      |  
| LIC-005 | May original artwork be reused? | Treat text rights and artwork rights separately. Reuse artwork only when explicit digital-use rights are documented; otherwise commission replacement art. | <!-- comments -->              | yes      |  
| LIC-006 | May the original logo, layout, and trade dress be reused? | Do not reproduce the publication’s logo, page layout, character-sheet design, or trade dress unless specifically permitted. | <!-- comments -->              | yes      |  
| LIC-007 | Is commercial distribution allowed? | Make commercial release a separate approval gate covering royalties, revenue share, pricing, platforms, territories, and distribution channels. | application usage will be free | no       |  
| LIC-008 | Can new official-style content be created? | Require explicit rights to create derivative races, classes, dungeons, monsters, items, expansions, or other new content presented as part of NoteQuest. | <!-- comments -->              | yes      |  
| LIC-009 | Are Expanded World rights included? | Treat Expanded World as separately licensed content and exclude it unless its rights are explicitly confirmed. | <!-- comments -->              | yes      |  
| LIC-010 | Are localisation and translation permitted? | Confirm translation and localisation rights before distributing non-source-language versions. | <!-- comments -->              | no       |  
| LIC-011 | How should attribution and unofficial status be handled? | Maintain a content inventory and include all required credits, licence notices, rights statements, and unofficial-product disclaimers. | <!-- comments -->              | yes      |  
| LIC-012 | How is content provenance recorded? | Give every bundled text, table, image, font, icon, audio asset, and third-party dependency a source, licence, approval status, and version or review date. | <!-- comments -->              | yes      |  
  
---  
  
## 3. Character generation and adventurer state  
  
| ID | Decision needed | Recommended ruling | Comments / alternative ruling | Approved |  
|---|---|---|---|---|  
| CHAR-001 | How are race and class generated? | Preserve the original weighted **2d6** lookup for both race and class. Do not replace it with equal-probability selection. | <!-- comments --> | yes |  
| CHAR-002 | May players choose or reroll race and class? | Baseline play uses generated results with no free reroll. Manual selection or physical-dice entry may exist only as an explicit optional mode. | <!-- comments --> | yes |  
| CHAR-003 | How is maximum HP calculated? | Maximum HP equals racial HP plus the class HP modifier. Current HP begins at maximum HP. | <!-- comments --> | yes |  
| CHAR-004 | How are starting resources assigned? | Every new adventurer begins with the class weapon, applicable abilities and spells, ten torches, and zero coins. | <!-- comments --> | yes |  
| CHAR-005 | How are duplicate spell results stored? | Each generated spell result creates one separate spell use. Duplicate spells therefore provide multiple charges. | <!-- comments --> | yes |  
| CHAR-006 | How are race and class abilities implemented? | Represent abilities as reusable, data-driven effects with explicit triggers, conditions, and outcomes rather than scattered hard-coded exceptions. | <!-- comments --> | yes |  
| CHAR-007 | Is power imbalance between combinations corrected? | Preserve the source distribution and imbalance in the canonical mode. Any balance mode must be optional and clearly labelled as a variant. | <!-- comments --> | yes |  
| CHAR-008 | What permanent adventurer conditions must be tracked? | Track HP, lost arms, available hands, spells and remaining uses, equipment, armour durability, torches, coins, inventory, current location, status, and death information. | <!-- comments --> | yes |  
  
---  
  
## 4. Dungeon creation, topology, and termination  
  
| ID | Decision needed | Recommended ruling | Comments / alternative ruling | Approved |  
|---|---|---|---|---|  
| DUN-001 | When is dungeon content generated? | Generate the dungeon incrementally when the player successfully opens a connection to an unexplored segment. | <!-- comments --> | yes |  
| DUN-002 | What is the internal map model? | Store the dungeon as a graph of segments connected by doors or passages. Treat rooms, corridors, staircases, the entrance, and the final room as segment types. | <!-- comments --> | yes |  
| DUN-003 | What is the visible map style? | Use a hybrid node-and-room diagram: graph-based internally, visually arranged like a hand-drawn dungeon without strict grid collision rules. | <!-- comments --> | yes |  
| DUN-004 | Do map directions have mechanical meaning? | Directions are navigation and presentation labels only unless a rule explicitly depends on direction. | <!-- comments --> | yes |  
| DUN-005 | Can automatic map layout change? | The visual layout may be rearranged for readability, but graph connections, segment identities, contents, and directions must remain unchanged. | <!-- comments --> | yes |  
| DUN-006 | How are floors represented? | Every generated segment belongs to an explicit floor. Staircases create transitions between floors and remain persistent connections. | <!-- comments --> | yes |  
| DUN-007 | How is non-terminating generation prevented? | Give each floor a hidden target and hard maximum. Increase the chance of a downward staircase after the target; force the next valid connection to become stairs at the hard maximum. | <!-- comments --> | yes |  
| DUN-008 | When is the final room generated? | Entering the third level generates the final boss room as the destination segment. | <!-- comments --> | yes |  
| DUN-009 | What happens if normal rolls never create stairs? | The forced-staircase rule replaces the ambiguous printed “last open room” condition and guarantees access to the third level. | <!-- comments --> | yes |  
| DUN-010 | Can the final room have additional exits? | The final boss room has no unexplored outward doors or passages. | <!-- comments --> | yes |  
| DUN-011 | Can unfinished branches be explored after discovering the boss? | Yes. Discovering the boss room does not remove existing branches, but dungeon completion requires defeating the boss. | <!-- comments --> | yes |  
| DUN-012 | When is dungeon content persisted? | Persist every generated segment, connection, room result, encounter, reward, trap, search state, and boss result immediately after resolution. | <!-- comments --> | yes |  
| DUN-013 | Are cosmetic room details mechanically significant? | Cosmetic descriptions and room names may vary, but they must not create mechanics or rewards outside approved tables and rules. | <!-- comments --> | yes |  
| DUN-014 | Can completed dungeons be revisited? | Preserve completed dungeons in the save. Re-entry may be allowed for recovery or exploration, but the boss and unique rewards do not regenerate. | <!-- comments --> | yes |  
  
---  
  
## 5. Doors, traps, keys, and secret passages  
  
| ID | Decision needed | Recommended ruling | Comments / alternative ruling | Approved |  
|---|---|---|---|---|  
| DOOR-001 | When is a door result rolled? | Roll and persist the door state when the player first attempts to open or inspect the unexplored door. | <!-- comments --> | yes |  
| DOOR-002 | What are the canonical door probabilities? | On 1d6: **1 = trapped, 2–3 = locked, 4–6 = unlocked**. These states are mutually exclusive for the initial roll. | <!-- comments --> | yes |  
| DOOR-003 | What states can a door have? | Use Unknown, Trapped, Locked, Unlocked, Open, and Broken. Broken doors remain permanently open. | <!-- comments --> | yes |  
| DOOR-004 | When is the destination segment generated? | Resolve the door’s trap or lock state first. Generate the destination only after the door is successfully opened. | <!-- comments --> | yes |  
| DOOR-005 | What does breaking a door do? | Breaking a locked door opens it without spending a torch, permanently marks it Broken, and alerts monsters in the destination and any directly connected area specified by the rules. | <!-- comments --> | yes |  
| DOOR-006 | Can doors be closed or repaired? | Open and broken doors cannot be closed or repaired in the canonical MVP unless a source rule or approved ability states otherwise. | <!-- comments --> | yes |  
| DOOR-007 | Do keys bypass traps? | Keys bypass only the locked state. They do not cancel a trap unless the trap has already been separately resolved or disarmed. | <!-- comments --> | yes |  
| DOOR-008 | Are normal keys consumed? | A normal key is consumed when used and is valid only in the dungeon where it was found. | <!-- comments --> | yes |  
| DOOR-009 | Are master keys consumed? | A master key is reusable and can open locked doors in any dungeon, but does not bypass traps. | <!-- comments --> | yes |  
| DOOR-010 | How does Disarm Traps work? | Spend one torch in the current room to prepare against traps. The next door trap triggered from that room is cancelled, then the protection is consumed. | <!-- comments --> | yes |  
| DOOR-011 | How often may a segment be searched for a secret passage? | Each eligible segment may be searched once. Spend the torch before rolling and persist the searched state regardless of the result. | <!-- comments --> | yes |  
| DOOR-012 | Can secret passages bypass dungeon limits? | Secret stairs and passages use the same floor, termination, persistence, and boss-access constraints as normal generated connections. | <!-- comments --> | yes |  
  
---  
  
## 6. Torches, light, arms, and hands  
  
| ID | Decision needed | Recommended ruling | Comments / alternative ruling | Approved |  
|---|---|---|---|---|  
| LIGHT-001 | What does one torch represent digitally? | Treat each torch as one abstract unit of expedition light and time rather than simulating real-time burning. | <!-- comments --> | yes |  
| LIGHT-002 | What is the torch capacity? | An adventurer can carry a maximum of ten torches, tracked separately from the ten-item backpack. | <!-- comments --> | yes |  
| LIGHT-003 | When is the entry torch spent? | Spend one torch immediately when entering a dungeon for a new expedition, before the first exploration action. | <!-- comments --> | yes |  
| LIGHT-004 | When do exploration actions spend torches? | Spend the torch before resolving lockpicking, moving silently, disarming traps, searching for secret passages, and any other action explicitly given a torch cost. | <!-- comments --> | yes |  
| LIGHT-005 | Can the final torch be spent voluntarily? | Allow it only after a clear irreversible-action warning that identifies whether another light source will prevent death. | <!-- comments --> | yes |  
| LIGHT-006 | When does darkness death occur? | Resolve the action that consumed the final torch, then check for an active alternative light source. If none exists, death occurs immediately before any further voluntary action. | <!-- comments --> | yes |  
| LIGHT-007 | What happens to rewards revealed by the final-torch action? | The generated result persists in the room and may be recovered later, but the dying adventurer cannot perform a subsequent pickup action. | <!-- comments --> | yes |  
| LIGHT-008 | How many hands does an adventurer have? | Begin with two usable hands. Losing one arm reduces this to one; losing both reduces it to zero. | <!-- comments --> | yes |  
| LIGHT-009 | What occupies hands? | A torch and one-handed weapon each require one hand; a two-handed weapon requires two; a lamp and Light spell require no hand. | <!-- comments --> | yes |  
| LIGHT-010 | What happens when limb loss invalidates equipment? | Immediately unequip invalid hand-held items and require the player to choose a legal light and weapon configuration before another affected action. | <!-- comments --> | yes |  
  
---  
  
## 7. Combat and monster traits  
  
| ID | Decision needed | Recommended ruling | Comments / alternative ruling | Approved |  
|---|---|---|---|---|  
| COMBAT-001 | What determines initiative? | Quietly opening an unlocked or successfully unlocked door gives the adventurer the first action. Breaking a door, triggering a trap, or entering an alerted encounter gives monsters the first action. | <!-- comments --> | yes |  
| COMBAT-002 | What is the combat round order? | Determine initiative; resolve the first side; player chooses action and target; roll damage; resolve natural-die traits; apply damage and defeats; surviving monsters deal combined damage; repeat. | <!-- comments --> | yes |  
| COMBAT-003 | How do monsters deal damage? | Sum the fixed damage of all living, active monsters into one incoming damage event each monster turn. | <!-- comments --> | yes |  
| COMBAT-004 | Can the player target individual monsters? | Yes. Each attack, spell, or applicable item targets one monster unless the effect explicitly states otherwise. | <!-- comments --> | yes |  
| COMBAT-005 | Can weapons be changed during combat? | Permit changing equipment only when an approved rule or item allows it; otherwise weapon changes occur outside combat. | <!-- comments --> | yes |  
| COMBAT-006 | Which result triggers monster traits? | Use the natural unmodified weapon damage die. Hostile traits trigger on a natural 1; Weakness triggers on a natural 6. | <!-- comments --> | yes |  
| COMBAT-007 | Do damage modifiers affect natural triggers? | No. Bonuses and penalties modify damage after the natural result is recorded and do not create or remove a natural 1 or 6. | <!-- comments --> | yes |  
| COMBAT-008 | Do fixed-damage spells trigger die-based monster traits? | No, unless a spell explicitly rolls a damage die and the approved rule states that its natural result can trigger traits. | <!-- comments --> | yes |  
| COMBAT-009 | What is the timing of an Explosive trait? | The trigger interrupts the attack before attack damage is applied. The monster dies and deals damage equal to its current HP to the adventurer. | <!-- comments --> | yes |  
| COMBAT-010 | Can armour absorb explosion damage? | Yes, unless the effect is explicitly defined as armour-bypassing damage. Other monsters are not affected. | <!-- comments --> | yes |  
| COMBAT-011 | How is armour selected for incoming damage? | Treat combined monster damage as one event. The player chooses character HP or one armour piece as the initial recipient. | <!-- comments --> | yes |  
| COMBAT-012 | Can damage be split among intact armour pieces? | No. Damage remains on the selected piece until it is exhausted. If it breaks, remaining damage spills into character HP. | <!-- comments --> | yes |  
| COMBAT-013 | Can the player choose to take HP damage while armour remains? | Yes. The player may deliberately apply an incoming damage event directly to character HP. | <!-- comments --> | yes |  
| COMBAT-014 | What happens to destroyed armour? | Destroyed armour is removed from equipped state and is not recoverable or repairable unless a specific approved rule states otherwise. | <!-- comments --> | yes|  
| COMBAT-015 | What damage bypasses armour? | Only effects explicitly identified as bypassing armour, such as approved Poison wording, apply directly to character HP. | <!-- comments --> | yes |  
| COMBAT-016 | How is escape handled? | Escape is available only through an approved spell, item, ability, or route rule. There is no universal free escape action during combat. | <!-- comments --> | yes |  
| COMBAT-017 | Can boss encounters use stealth or normal bypass actions? | Boss rooms cannot be bypassed through Move Silently, and completing the dungeon requires defeating the boss. | <!-- comments --> | yes |  
| COMBAT-018 | How are simultaneous deaths resolved? | Complete all effects already triggered by the current action. If the adventurer reaches zero HP, record death even if the final monster also dies; rewards remain in the room. | <!-- comments --> | yes|  
  
---  
  
## 8. Inventory, equipment, armour, items, and coins  
  
| ID | Decision needed | Recommended ruling | Comments / alternative ruling | Approved |  
|---|---|---|---|---|  
| ITEM-001 | What counts toward the ten-item capacity? | Count only unequipped backpack items. Equipped weapons and worn armour do not count. | <!-- comments --> | yes |  
| ITEM-002 | Do torches count as items? | No. Torches have a separate capacity of ten. | <!-- comments --> | yes |  
| ITEM-003 | Do coins count as items? | No. Coins are a numeric resource with no inventory-slot cost. | <!-- comments --> | yes |  
| ITEM-004 | Do keys count as items? | Yes. Normal keys and master keys each occupy a backpack slot unless currently being used. | <!-- comments --> | yes |  
| ITEM-005 | Do spells count as items? | No. Spells and their remaining uses are tracked separately from inventory. | <!-- comments --> | yes |  
| ITEM-006 | How are consumables counted? | Each individual consumable occupies one slot unless the source rule explicitly defines a stack. | <!-- comments --> | yes |  
| ITEM-007 | What happens when loot exceeds capacity? | Pause reward resolution and require the player to take, leave, equip, use, or discard items until capacity is legal. | <!-- comments --> | yes |  
| ITEM-008 | Do deliberately dropped items persist? | Yes. A dropped item remains in the current segment and may be recovered during a later visit. | <!-- comments --> | yes |  
| ITEM-009 | Can dropped items coexist with monsters or corpses? | Yes. Items remain in the room regardless of later repopulation, surviving monsters, or corpses. | <!-- comments --> | yes |  
| ITEM-010 | How are magical item templates represented? | Store a base item definition and one or more approved modifiers as separate data, while presenting the composed item name to the player. | <!-- comments --> | yes |  
| ITEM-011 | Can multiple armour pieces of the same slot be equipped? | No. Only one shoulderpad, bracelet set, boots, helmet, and breastplate entry may be equipped at a time. Extra pieces remain in the backpack or room. | <!-- comments --> | yes |  
| ITEM-012 | How much does town armour repair restore? | Spending one coin fully restores one damaged, non-destroyed armour piece. | <!-- comments --> | yes |  
| ITEM-013 | How does the Blacksmith repair ability work? | Spending the specified torch cost fully restores one damaged, non-destroyed armour piece while in a permitted non-combat state. | <!-- comments --> | yes |  
| ITEM-014 | Can item state be lost when ownership changes? | No. Durability, modifiers, provenance, and identity persist when an item is equipped, dropped, recovered, sold, exported, or imported. | <!-- comments --> | yes |  
  
---  
  
## 9. Spells and special actions  
  
| ID | Decision needed | Recommended ruling | Comments / alternative ruling | Approved |  
|---|---|---|---|---|  
| SPELL-001 | How are spell uses represented? | Each generated spell result grants one charge. Casting consumes one matching charge. | <!-- comments --> | yes |  
| SPELL-002 | When are spell uses restored? | A successful town rest fully restores all generated spell charges. | <!-- comments --> | yes |  
| SPELL-003 | Do spells require a free hand? | No, unless the spell’s approved digital rule explicitly states a hand requirement. | <!-- comments --> | yes |  
| SPELL-004 | Can spells be used outside combat? | Only when their approved timing permits it. Healing and Light may be used outside combat; attack spells require a valid target. | <!-- comments --> | yes |  
| SPELL-005 | What can Teleport target? | Any previously discovered segment in the current dungeon that contains no living monsters and is not otherwise blocked by a rule. | <!-- comments --> | yes |  
| SPELL-006 | Can Teleport target an undiscovered segment? | No. Teleport cannot reveal or create unexplored content. | <!-- comments --> | yes |  
| SPELL-007 | Can Teleport escape a boss encounter? | No, unless the approved source wording explicitly permits boss-room escape. | <!-- comments --> | yes |  
| SPELL-008 | How does Light work? | Each Light charge provides one effective light unit for the expedition, consumes no hand, and is used before darkness death would occur. | <!-- comments --> | yes |  
| SPELL-009 | Can multiple Light charges accumulate? | Yes. Each charge adds one separate effective light unit, up to the number of available charges. | <!-- comments --> | yes |  
| SPELL-010 | How does Heal work at maximum HP or zero HP? | Heal cannot exceed maximum HP and cannot be cast after death has been resolved. | <!-- comments --> | yes |  
  
---  
  
## 10. Stealth and exploration actions  
  
| ID | Decision needed | Recommended ruling | Comments / alternative ruling | Approved |  
|---|---|---|---|---|  
| STEALTH-001 | When may Move Silently be attempted? | Attempt it when entering or acting within an occupied non-boss room before combat has begun, provided the player can pay the torch cost. | <!-- comments --> | yes |  
| STEALTH-002 | When is the torch cost paid? | Spend one torch before rolling the stealth dice. A failed attempt still consumes the torch. | <!-- comments --> | yes |  
| STEALTH-003 | How is success determined? | Roll one d6 per monster. The attempt fails if any die is a natural 1; otherwise it succeeds. | <!-- comments --> | yes |  
| STEALTH-004 | What may a hidden adventurer do? | Pass through the room, take visible treasure, and interact with normal doors without starting combat. | <!-- comments --> | yes |  
| STEALTH-005 | What breaks stealth? | Attacking, breaking a door, triggering a trap, failing another stealth-dependent action, or performing an explicitly noisy action ends stealth and alerts the monsters. | <!-- comments --> | yes |  
| STEALTH-006 | How long does stealth last? | Stealth applies only to the current room visit. Leaving ends it; re-entering requires a new attempt and torch cost. | <!-- comments --> | yes |  
| STEALTH-007 | Can Move Silently bypass a boss? | No. Move Silently is unavailable in the final boss room. | <!-- comments --> | yes |  
  
---  
  
## 11. Expeditions, retreat, persistence, death, and recovery  
  
| ID | Decision needed | Recommended ruling | Comments / alternative ruling | Approved |  
|---|---|---|---|---|  
| PERSIST-001 | What is an expedition? | An expedition begins when an adventurer enters a dungeon and ends when the adventurer returns to town, dies, or completes an approved dungeon-exit action. | <!-- comments --> | yes |  
| PERSIST-002 | When do surviving monsters heal? | All surviving monsters restore to maximum HP at the start of a later expedition into that dungeon. | <!-- comments --> | yes |  
| PERSIST-003 | Which rooms can repopulate? | A previously generated room with no living monsters may repopulate when first entered during a later expedition. | <!-- comments --> | yes |  
| PERSIST-004 | How often can a room repopulate during one expedition? | At most once, on its first entry during that expedition. Repeated movement within the same expedition does not reroll it. | <!-- comments --> | yes |  
| PERSIST-005 | Can rooms with corpses or dropped items repopulate? | Yes. Corpses and items do not prevent repopulation. | <!-- comments --> | yes |  
| PERSIST-006 | Can corridors, stairs, or the boss room repopulate? | No. Repopulation applies only to ordinary rooms; the defeated boss does not return. | <!-- comments --> | yes |  
| PERSIST-007 | What is required to retreat to town? | A continuous discovered route to the entrance must contain no living, unbypassed monsters. The UI disables retreat when the route is unsafe. | <!-- comments --> | yes |  
| PERSIST-008 | Does successful stealth make a retreat route safe? | No. Monsters bypassed through stealth remain present, so that room is not a safe retreat route unless another approved rule bypasses it. | <!-- comments --> | yes |  
| PERSIST-009 | What remains after normal death? | The corpse, equipped items, backpack contents, unused consumables, keys, and carried coins remain in the death segment, except destroyed or already consumed items. | <!-- comments --> | yes |  
| PERSIST-010 | What remains after darkness death? | No corpse remains, but recoverable equipment, backpack items, unused consumables, keys, and coins remain in the segment. | <!-- comments --> | yes |  
| PERSIST-011 | When is the Graveyard record created? | Create it immediately when death is resolved, recording adventurer identity, dungeon, floor, segment, cause, date or play timestamp, and recoverable-state reference. | <!-- comments --> | yes |  
| PERSIST-012 | Can multiple deaths occupy one room? | Yes. Each death has a distinct Graveyard record and recoverable container. | <!-- comments --> | yes |  
| PERSIST-013 | How is recovered equipment handled at capacity? | Recovery uses normal capacity rules. Excess items remain in the room until taken, equipped, used, sold after return, or deliberately left. | <!-- comments --> | yes |  
| PERSIST-014 | How long do dropped items and corpses persist? | Persist them for the lifetime of the save unless recovered, destroyed by an explicit effect, or removed through a clearly confirmed cleanup action. | <!-- comments --> | yes |  
  
---  
  
## 12. Town and economy  
  
| ID | Decision needed | Recommended ruling | Comments / alternative ruling | Approved |  
|---|---|---|---|---|  
| TOWN-001 | What does resting cost and restore? | Spend one coin to restore the adventurer to maximum HP and fully restore all generated spell charges. | <!-- comments --> | yes |  
| TOWN-002 | What does armour repair cost? | Spend one coin to fully restore one damaged, non-destroyed armour piece. | <!-- comments --> | yes |  
| TOWN-003 | What does a torch cost? | One coin purchases one torch, up to the capacity of ten. | <!-- comments --> | yes |  
| TOWN-004 | How are ordinary items sold? | Sell an ordinary item for one coin unless an approved ability or item modifier changes the price. | <!-- comments --> | yes |  
| TOWN-005 | How are magical items sold? | Use the source sale roll of **1d6 minus 1 coins**, applying approved sale modifiers afterward and never producing a negative result. | <!-- comments --> | yes |  
| TOWN-006 | How do sale modifiers stack? | Apply flat and multiplicative modifiers in an explicitly documented order, with the natural sale die preserved in the event log. | <!-- comments --> | yes |  
| TOWN-007 | Is town spatially explorable? | No. Town is a menu or panel of recovery, repair, purchase, sale, and expedition-management actions in the MVP. | <!-- comments --> | yes |  
| TOWN-008 | Can the player abandon an unfinished dungeon and start another? | Yes, provided the adventurer has safely returned to town. The unfinished dungeon remains persistent and may be revisited later. | <!-- comments --> | yes |  
  
---  
  
## 13. Data model, rules engine, saves, and randomness  
  
| ID | Decision needed | Recommended ruling | Comments / alternative ruling | Approved |  
|---|---|---|---|---|  
| ARCH-001 | Should game content be hard-coded? | No. Store races, classes, spells, tables, monsters, bosses, traps, items, rewards, and abilities as validated data definitions. | <!-- comments --> | yes |  
| ARCH-002 | How are definitions separated from runtime state? | Keep immutable content definitions separate from adventurer, dungeon, monster, item, corpse, and encounter instances. | <!-- comments --> | yes |  
| ARCH-003 | What are the principal domain aggregates? | Use Save Slot, Adventurer, Dungeon, Segment, Door, Expedition, Encounter, Monster Instance, Item Instance, Corpse or Drop Container, Event Log, and Graveyard Record. | <!-- comments --> | yes |  
| ARCH-004 | What identifiers are required? | Every persisted aggregate and instance receives a stable identifier that does not depend on array position, display name, or visual map coordinates. | <!-- comments --> | yes |  
| ARCH-005 | How are valid actions controlled? | Implement the application as explicit game states with allowed actions and transition guards for town, entrance, exploration, doors, rooms, combat, rewards, inventory, boss, completion, death, and Graveyard. | <!-- comments --> | yes |  
| ARCH-006 | When should autosaves occur? | Autosave atomically after every meaningful state change, including generation, door resolution, combat turns, item movement, torch use, dungeon exit, and death. | <!-- comments --> | yes |  
| ARCH-007 | Are manual saves required? | Provide save-slot management and export, but do not require manual saving for normal safety. | <!-- comments --> | yes |  
| ARCH-008 | What is the save-scumming policy? | Persist random-generator state and resolved random results before presentation, so reloading does not reroll an already initiated action. | <!-- comments --> | yes |  
| ARCH-009 | Should randomness be seeded? | Yes. Use reproducible seeded random streams and store their state with the save. | <!-- comments --> | yes |  
| ARCH-010 | Should different systems share one random stream? | Use separate deterministic streams for dungeon generation, combat, rewards, and repopulation to improve debugging and prevent unrelated actions changing future results. | <!-- comments --> | yes |  
| ARCH-011 | What must the event log record? | Record action, natural dice, table and row identifiers, modifiers, rule version, resulting state changes, location, expedition, and timestamp for significant outcomes. | <!-- comments --> | yes |  
| ARCH-012 | How are save schemas evolved? | Version every save, validate before loading, migrate supported versions atomically, and preserve the original data or backup when migration fails. | <!-- comments --> | yes |  
| ARCH-013 | What are the export and import rules? | Export a versioned package containing complete save state and provenance. Validate and preview imports before mutating existing data. | <!-- comments --> | yes |  
| ARCH-014 | How is corrupted data handled? | Never silently reset. Isolate the error, preserve recoverable state, provide diagnostics, and offer restoration from the last valid transactional save. | <!-- comments --> | yes |  
  
---  
  
## 14. User experience and presentation  
  
| ID | Decision needed | Recommended ruling | Comments / alternative ruling | Approved |  
|---|---|---|---|---|  
| UX-001 | What must remain visible during play? | Keep the map, current segment, HP, armour, torches, coins, weapon, spells, enemies, valid actions, and recent event log visible or one action away. | <!-- comments --> | yes |  
| UX-002 | How are action costs communicated? | Show torch, item, spell, coin, hand, alert, and permanent-state costs before confirmation. | <!-- comments --> | yes |  
| UX-003 | How are irreversible actions handled? | Require clear confirmation for the last torch, item discard, door breaking, destructive reset, overwrite, and any action with permanent loss not already obvious from combat. | <!-- comments --> | yes |  
| UX-004 | How transparent are random outcomes? | Show the dice, source table, relevant row, modifiers, and resulting state change. Animations may be skipped but the result must remain inspectable. | <!-- comments --> | yes |  
| UX-005 | How is combat pacing handled? | Provide fast dice animations, visible trait feedback, repeat-attack convenience, optional fast-forward, and a permanent combat log without changing mechanics. | <!-- comments --> | yes |  
| UX-006 | Should incoming damage be previewed? | Show the exact combined damage of currently active monsters before armour or HP allocation whenever no hidden rule can change it. | <!-- comments --> | yes |  
| UX-007 | What information appears on the map? | Mark entrance, stairs, boss room, unopened and locked doors, broken doors, occupied and cleared rooms, corpses, dropped equipment, and secret-search state. | <!-- comments --> | yes |  
| UX-008 | How is retreat eligibility shown? | Display the route to the entrance and identify the specific occupied segment preventing retreat. | <!-- comments --> | yes |  
| UX-009 | What visual direction should guide design? | Use a 2D living-adventure-notebook presentation with ink-style illustrations, sketched map growth, restrained colour, and torchlight as a key accent. | <!-- comments --> | yes |  
| UX-010 | Is a 3D dungeon view required? | No. Exclude 3D movement and room-scale tactical presentation from the initial design. | <!-- comments --> | yes |  
| UX-011 | How are repeated encounters accelerated? | Allow optional reduced animation and repeated-action controls, but never hide a decision, trigger, or resource change. | <!-- comments --> | yes |  
| UX-012 | Can cosmetic procedural text add mechanics? | No. Flavour text may vary but cannot create undocumented choices, rewards, penalties, or lore claims. | <!-- comments --> | yes |  
| UX-013 | Is the event log editable? | Mechanical entries are immutable; players may add separate notes or annotations without changing the recorded outcome. | <!-- comments --> | yes |  
| UX-014 | How is the Graveyard presented? | Provide a persistent searchable list of dead adventurers with cause, dungeon, depth, location, date, and recovery status. | <!-- comments --> | yes |  
  
---  
  
## 15. Platform, accessibility, privacy, and operations  
  
| ID | Decision needed | Recommended ruling | Comments / alternative ruling | Approved |  
|---|---|---|---|---|  
| NFR-001 | What is the primary interface baseline? | Optimise for desktop and tablet landscape layouts while preserving a usable responsive path for smaller screens. | optimize for web | no |  
| NFR-002 | Is mobile phone support an MVP release requirement? | Treat phone support as Should rather than Must until the primary map-and-combat interface is validated. | no mobile support | no |  
| NFR-003 | Is console support included? | No. Defer controller navigation, certification, and console packaging. | <!-- comments --> | yes |  
| NFR-004 | What accessibility standard applies? | Target the current agreed WCAG AA baseline for applicable web or application interfaces and document any platform-specific exceptions. | <!-- comments --> | yes |  
| NFR-005 | Is full keyboard operation required? | Yes. Every core action, dialog, map selection, inventory operation, and confirmation must be keyboard operable. | <!-- comments --> | yes |  
| NFR-006 | How is the map exposed to screen readers? | Provide a textual graph description of the current segment, connected segments, doors, hazards, occupants, and route to the entrance. | <!-- comments --> | yes |  
| NFR-007 | Are reduced motion and instant results required? | Yes. Respect reduced-motion preferences and provide an option to skip dice and transition animations. | <!-- comments --> | yes |  
| NFR-008 | Can colour or sound carry essential information? | No. Every status must also be communicated through text, icons, structure, or labels. | <!-- comments --> | yes |  
| NFR-009 | What text scaling is required? | Support scalable text without clipping survival-critical data or blocking required actions at supported viewports. | <!-- comments --> | yes |  
| NFR-010 | What user data is considered private? | Treat saves, adventurer names, notes, event logs, Graveyard entries, exports, and imported content as private user data by default. | <!-- comments --> | yes |  
| NFR-011 | Is analytics enabled by default? | No. Add no production analytics or telemetry without a separately approved purpose, data inventory, consent position, and privacy review. | <!-- comments --> | yes |  
| NFR-012 | What must diagnostics exclude? | Production diagnostics must not include private notes, full save exports, or unnecessary event-log and Graveyard content. | <!-- comments --> | yes |  
  
---  
  
## 16. MVP release boundary and design gates  
  
| ID | Decision needed | Recommended ruling | Comments / alternative ruling | Approved |  
|---|---|---|---|---|  
| MVP-001 | Which gameplay content is required for MVP? | Include all six core dungeons, original races and classes, spells, equipment, monsters, bosses, town actions, and the complete death-and-recovery loop. | <!-- comments --> | yes |  
| MVP-002 | Which systems are required for the first mechanical prototype? | Implement character generation, one dungeon type, map generation, doors, traps, torches, combat, town return, death, corpse recovery, and save/load. | <!-- comments --> | yes |  
| MVP-003 | What validates the prototype? | One full dungeon must always terminate, remain enjoyable across repeated seeded runs, and preserve state correctly through retreat, death, reload, and replacement-adventurer recovery. | <!-- comments --> | yes |  
| MVP-004 | Is multiplayer included? | No. | <!-- comments --> |yes |  
| MVP-005 | Are Expanded World systems included? | No. | <!-- comments --> | yes |  
| MVP-006 | Is tactical grid combat included? | No. | <!-- comments --> | yes |  
| MVP-007 | Are crafting and detailed town exploration included? | No. | <!-- comments --> | yes |  
| MVP-008 | Are cloud accounts, leaderboards, and live services included? | No. | <!-- comments --> | yes |  
| MVP-009 | Is fully animated combat required? | No. Use lightweight 2D feedback, readable logs, and optional acceleration. | <!-- comments --> | yes |  
| MVP-010 | What must be approved before detailed application design is considered complete? | Approve adaptation scope, rights position, Digital Rules Specification, dungeon termination, map model, combat timing, resource rules, persistence model, save/randomness policy, platform baseline, accessibility baseline, and MVP acceptance criteria. | <!-- comments --> | yes |  
  
---  
  
## 17. Overall approval gates  
  
| Gate | Approval statement | Comments | Approved |  
|---|---|---|---|  
| GATE-001 | Product direction and MVP boundaries are approved. | <!-- comments --> | yes |  
| GATE-002 | Adaptation, content, artwork, branding, commercial, and localisation rights are confirmed or explicitly constrained for prototype-only work. | <!-- comments --> | yes |  
| GATE-003 | All core rules decisions are approved and ready to be converted into the Digital Rules Specification. | <!-- comments --> | yes |  
| GATE-004 | Dungeon generation is guaranteed to terminate and the map model is approved. | <!-- comments --> | yes |  
| GATE-005 | Combat, traits, armour, inventory, spells, stealth, light, death, retreat, town, and recovery timing are approved. | <!-- comments --> | yes |  
| GATE-006 | Domain entities, application states, persistence, randomness, save migration, import, and export policies are approved. | <!-- comments --> | yes |  
| GATE-007 | Primary UX, visual direction, target platforms, accessibility, privacy, and diagnostics baselines are approved. | <!-- comments --> | yes |  
| GATE-008 | The one-dungeon mechanical prototype may proceed to detailed requirements and implementation planning. | <!-- comments --> | yes |  
  
---  
  
## Approval record  
  
| Role | Name | Decision | Date | Notes |  
|---|---|---|---|---|  
| Product Owner |  | Pending / Approved / Rejected |  |  |  
| Rules Reviewer |  | Pending / Approved / Rejected |  |  |  
| Technical Lead |  | Pending / Approved / Rejected |  |  |  
| UX Lead |  | Pending / Approved / Rejected |  |  |  
| QA Lead |  | Pending / Approved / Rejected |  |  |  
| Content / Rights Reviewer |  | Pending / Approved / Rejected |  |  |
