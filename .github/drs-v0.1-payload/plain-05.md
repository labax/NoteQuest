| ID | Requirement | Priority | Acceptance signal |
|---|---|---:|---|
| DRS-CMB-001 | Initiative shall follow quiet-entry, broken-door, trap, stealth, and alert state. | Must | Each entry fixture selects the correct side. |
| DRS-CMB-002 | Combat shall alternate player and monster turns after the initial side. | Must | Turn sequence is stable. |
| DRS-CMB-003 | Only legal actions and targets shall be selectable. | Must | Invalid target/action does not mutate state. |
| DRS-CMB-004 | Weapon attacks shall preserve natural dice before modifiers. | Must | Trait triggers remain correct. |
| DRS-CMB-005 | Weapon damage shall be floored at zero. | Must | Negative weapons cannot heal. |
| DRS-CMB-006 | A normal attack shall target one monster unless an effect explicitly states multiple targets. | Must | Targeting matrix passes. |
| DRS-CMB-007 | Fixed-damage spells shall not trigger weapon-die traits. | Must | Spell fixtures trigger none. |
| DRS-CMB-008 | Grave Digger damage shall apply before Weakness doubling. | Must | Undead natural-6 fixture matches order. |
| DRS-CMB-009 | Explosive shall interrupt normal weapon damage. | Must | Monster and adventurer outcomes match current HP. |
| DRS-CMB-010 | Explosion damage shall be normal armour-eligible damage unless another effect marks it bypassing. | Must | Armour allocation is available. |
| DRS-CMB-011 | Intangible shall test final calculated damage parity. | Must | Even final value is prevented. |
| DRS-CMB-012 | Stoneskin shall test final calculated damage after Weakness and modifiers. | Must | Values 0-3 are prevented; 4+ applies. |
| DRS-CMB-013 | Regeneration shall not exceed monster maximum HP. | Must | Cap fixture passes. |
| DRS-CMB-014 | Undead shall resolve before defeat rewards and Cook credit. | Must | Revival suppresses defeat triggers. |
| DRS-CMB-015 | Spawned monsters shall join immediately and may act on the next monster turn. | Must | Spawn timing fixture passes. |
| DRS-CMB-016 | Cold Ray shall prevent the target from contributing to exactly the next monster turn. | Must | Status is consumed once. |
| DRS-CMB-017 | Combined normal monster damage shall be one allocation event. | Must | It cannot be split across intact armour pieces. |
| DRS-CMB-018 | Poison damage shall be separated and applied directly to HP. | Must | Mixed encounter fixture passes. |
| DRS-CMB-019 | The player may choose direct HP damage even while armour remains. | Must | Allocation options include HP. |
| DRS-CMB-020 | One chosen armour piece shall absorb damage until exhausted; remaining damage spills to HP. | Must | Breakage fixture passes. |
| DRS-CMB-021 | Destroyed armour shall be removed and cannot be repaired or recovered without an explicit effect. | Must | Repair action is unavailable. |
| DRS-CMB-022 | Deathtouch shall kill before normal damage allocation when its armed attack occurs. | Must | Armour and HP do not prevent it. |
| DRS-CMB-023 | Paralysis shall skip the rolled number of player turns while monster turns continue. | Must | Duration decrements on skipped player turns. |
| DRS-CMB-024 | Escape shall require an approved spell, item, ability, or route effect. | Must | No generic escape action exists. |
| DRS-CMB-025 | Teleport escape shall move the adventurer to its selected discovered safe segment and leave surviving monsters in place. | Must | Encounter ends without defeating monsters. |
| DRS-CMB-026 | Boss encounters shall reject Move Silently and Teleport escape. | Must | Boss cannot be bypassed. |
| DRS-CMB-027 | If the adventurer and final monster die in the same effect chain, adventurer death shall still be recorded. | Must | Simultaneous-death fixture passes. |
| DRS-CMB-028 | Rewards generated before or during simultaneous death shall remain in the room. | Must | Replacement recovery succeeds. |
| DRS-CMB-029 | Each Loot monster shall resolve one Loot roll only after final defeat and encounter victory. | Must | Multiple Loot monsters produce separate rolls. |
| DRS-CMB-030 | Cook coin gain shall occur once per finally defeated non-Undead monster credited to the adventurer. | Must | Revived Undead and duplicate events do not pay. |
| DRS-CMB-031 | Combat state and committed turn outcomes shall autosave after every resolved turn or interrupt. | Must | Reload restores exact turn boundary. |
| DRS-CMB-032 | Fast-forward or repeated-action UI shall not change the number, order, or visibility of decisions and triggers. | Must | Accelerated and normal runs match. |
| DRS-CMB-033 | Multiple traits triggered by one natural result shall use the documented priority order and stable content-definition order for ties. | Must | Multi-trait fixtures produce one reproducible sequence. |

## 13. Inventory, Equipment, Armour, Rewards, and Coins

### 13.1 Capacity and ownership

- Backpack capacity is 10 unequipped item instances.
- Physical torches have a separate capacity of 10.
- Coins, spells, and spell charges do not occupy backpack slots.
- Normal keys and master keys each occupy one backpack slot.
- Each individual consumable occupies one slot unless an authorised definition explicitly permits a stack.
- Equipped weapons, worn armour, and one equipped ring do not occupy backpack slots.

### 13.2 Armour

The five protective armour slots are shoulderpads, bracelets, boots, helmet, and breastplate. Only one item may occupy each slot. A separate ring accessory slot exists because authorised armour tables include Ring results. Each armour or ring instance has maximum and current durability. Normal incoming damage may be assigned only to an equipped item whose current durability is greater than zero. An item with positive durability is destroyed when damage reduces it to zero. A Ring whose maximum durability is zero remains a valid equipped accessory, cannot absorb damage, and is not destroyed merely for having zero durability.

Town repair and the Blacksmith ability fully restore one damaged, non-destroyed protective item. They cannot restore destroyed items or increase a zero-maximum Ring above its defined maximum.

### 13.3 Reward resolution

A **Treasure** resolution rolls 1d6 on the selected dungeon's Treasure column. A row may produce a direct item/value or redirect to an authorised Wonders, Magic Item, Weapon, Armour, or other named reward table. Each redirect rolls independently in the named table or column.

A Magic Item row containing an armour or weapon placeholder first rolls the dungeon's authorised armour or weapon table, then creates the base item instance with the stated modifier. Base identity, modifier identity, durability, and provenance remain separate data.

Boss victory generates 2d6 Treasure resolutions. Chest Treasure count and Loot-generated Treasure use the same procedure. One-time rewards are marked resolved before presentation.

### 13.4 Core content effect primitives

The authorised Core reward tables may compose the following effect primitives. Display names remain content data; these mechanics are identified by stable effect IDs.

| Effect ID | Canonical rule |
|---|---|
| `effect.fixed_sale_value` | Set and persist a fixed coin value for ordinary sale. |
| `effect.rolled_sale_value` | Roll the stated value formula when the item is created, persist the value, and use it for ordinary sale. The Core jewel formula is 2d6 x 10 coins. |
| `effect.full_heal` | Restore current HP to maximum; cannot revive death. |
| `effect.restore_spells` | Restore all generated/restorable spell charges; does not recreate consumed scrolls. |
| `effect.magic_scroll` | Roll and persist one Basic Spell when the scroll is created; casting uses that spell once and consumes the scroll permanently. |
| `effect.learn_spell` | On use, roll one Basic Spell and permanently add one restorable charge to the adventurer. |
| `effect.restore_arm` | Restore one missing arm, up to the normal maximum of two usable arms. |
| `effect.trap_cancel_next` | Cancel the next eligible activated trap and consume the protection. |
| `effect.trap_cancel_discard_equipment` | The player may destroy the equipped source item to cancel an eligible activated trap. |
| `effect.trap_immunity_tag` | Ignore a trap effect carrying the stated trap tag, such as `blade`. |
| `effect.damage_bonus_flat` | Add the stated amount to weapon damage while the source is active/equipped. |
| `effect.damage_bonus_tagged` | Add the stated amount against monsters with one of the listed tags. |
| `effect.damage_multiplier_tagged` | Multiply final pre-defence weapon damage against monsters with one of the listed tags. |
| `effect.armour_durability_modifier` | Modify the base armour maximum durability at item creation; floor the result at zero. |
| `effect.chest_coin_multiplier` | Multiply only the coin quantity produced by a non-trapped chest. |
| `effect.chest_reward_multiplier_next` | Consume the source on the next chest opened and multiply both non-trap coin and Treasure quantities by the stated factor. |
| `effect.temporary_damage_bonus` | Add the stated damage until the current encounter ends; consume the item on activation. |
| `effect.virtual_light_gain` | During entry preparation or an active expedition, consume the item and add the stated number of virtual light units. |
| `effect.ignore_monster_trait` | Suppress the named trait for interactions involving the equipped/owned source, such as Undead revival, Paralyze, Deathtouch, Firebreath, or Intangible. |
| `effect.vampiric_weapon` | After a completed weapon attack by this weapon, restore the stated HP if the adventurer remains alive; cap at maximum. |
| `effect.vorpal_weapon` | On a natural weapon die of 6, set the target to zero HP before normal damage; then resolve normal defeat and Undead checks. |
| `effect.force_monster_flee_tagged` | Remove all living monsters with the stated tag from the encounter as fled; they are not defeated and grant no defeat, Loot, or Cook rewards. |
| `effect.disable_stealth` | While equipped, Move Silently is unavailable. |
