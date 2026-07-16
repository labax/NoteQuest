| `effect.cosmetic_change` | Persist a cosmetic state change without mechanical effect. |
| `effect.destroy_cursed_item` | Destroy one owned item explicitly tagged `cursed`; unavailable when no valid target exists. |
| `effect.portal_marker` | Create and persist a portal marker. In the Core rules profile the marker is mechanically inert because portal travel belongs to Expanded World. |

When several trap-cancellation protections are eligible, the player chooses which protection to consume. Passive immunity applies before consumable cancellation and does not consume an item unless the effect explicitly requires discard.

### 13.5 Requirements

| ID | Requirement | Priority | Acceptance signal |
|---|---|---:|---|
| DRS-ITEM-001 | Only unequipped items shall count toward the 10-item backpack limit. | Must | Equip/unequip boundaries pass. |
| DRS-ITEM-002 | Torches, coins, and spells shall not consume backpack slots. | Must | Capacity remains correct. |
| DRS-ITEM-003 | Keys and consumables shall consume slots as individual instances. | Must | Full inventory blocks pickup. |
| DRS-ITEM-004 | Item identity and state shall persist through equip, drop, recovery, sale, export, and import. | Must | Durability and modifiers are unchanged. |
| DRS-ITEM-005 | Dropping an item shall create or update a persistent room drop container. | Must | Later visits can recover it. |
| DRS-ITEM-006 | Dropped items may coexist with monsters, corpses, and repopulation. | Must | Room state supports all references. |
| DRS-ITEM-007 | Loot exceeding capacity shall pause resolution and require a legal take, equip, use, leave, or discard choice. | Must | No item disappears silently. |
| DRS-ITEM-008 | Only one armour item may occupy each authorised armour slot. | Must | Duplicate-slot equip is rejected. |
| DRS-ITEM-009 | Armour current durability shall remain between zero and maximum. | Must | Boundary validation passes. |
| DRS-ITEM-010 | Protective armour with positive durability shall be removed and marked destroyed when damage reduces it to zero; zero-maximum Rings are not destroyed by their zero value. | Must | Protective breakage and Ring fixtures pass. |
| DRS-ITEM-011 | Town repair shall cost one coin and fully restore one damaged, non-destroyed piece. | Must | Coin and durability commit together. |
| DRS-ITEM-012 | Blacksmith repair shall cost one light unit and fully restore one damaged, non-destroyed piece outside combat. | Must | Final-light consequences apply afterward. |
| DRS-ITEM-013 | Weapon hand requirements shall be validated whenever equipment or arms change. | Must | Illegal loadouts cannot persist. |
| DRS-ITEM-014 | A Magic Item shall retain separate base-item and modifier IDs. | Must | Composed display name does not replace provenance. |
| DRS-ITEM-015 | Each Treasure, Wonder, Magic Item, weapon, and armour roll shall preserve table and row IDs. | Must | History can reconstruct reward generation. |
| DRS-ITEM-016 | A Treasure redirect shall resolve exactly once and shall not also grant the redirecting row as an item. | Must | No duplicate reward. |
| DRS-ITEM-017 | Boss 2d6 shall determine the number of Treasure resolutions, not a direct coin value. | Must | Boss reward fixture passes. |
| DRS-ITEM-018 | Ordinary item sale shall return one coin unless modified. | Must | Base sale fixture passes. |
| DRS-ITEM-019 | Magic item sale shall roll 1d6-1 coins, floor at zero, then apply sale modifiers. | Must | Natural 1 produces zero before modifiers. |
| DRS-ITEM-020 | Cat-Person shall multiply the non-negative final base sale value of weapons, armour, and other equipment-category items by two. | Must | Ordinary and magic equipment sale fixtures pass. |
| DRS-ITEM-021 | Multiplicative sale modifiers shall apply after additive modifiers unless an effect explicitly specifies another order. | Must | Modifier-order history is explicit. |
| DRS-ITEM-022 | Coins shall be a non-negative unbounded integer resource for Core rules. | Must | Spending cannot create negative coins. |
| DRS-ITEM-023 | A Health Potion shall restore current HP to maximum and cannot revive death; use at maximum HP is allowed only after a no-benefit warning and still consumes the potion. | Must | Damaged and full-HP use fixtures pass. |
| DRS-ITEM-024 | A one-use item shall be consumed only after its effect is committed. | Must | Failed target validation does not consume it. |
| DRS-ITEM-025 | Trap-cancelling effects shall be consumed by the next eligible activated trap. | Must | Potion of Luck timing passes. |
| DRS-ITEM-026 | All bespoke item effects shall be implemented through approved effect primitives or a documented exception. | Must | Content schema validates every effect. |
| DRS-ITEM-027 | Fixed-value treasure shall retain its sale value as item data and use ordinary-item sale rather than a magic sale roll. | Must | Ornament, religious object, and idol fixtures pass. |
| DRS-ITEM-028 | A rolled-value jewel shall roll 2d6 x 10 at creation and persist that value. | Must | Reload and later sale use the same value. |
| DRS-ITEM-029 | A Magic Scroll shall roll its Basic Spell at creation, occupy one slot, cast once, and never restore at rest. | Must | Scroll use consumes the item only after a valid cast. |
| DRS-ITEM-030 | A Mana Potion shall fully restore all generated/restorable spell charges and shall not recreate consumed scrolls. | Must | Mixed spell-source fixture passes. |
| DRS-ITEM-031 | A Sapphire of Magic shall permanently add one newly rolled restorable Basic Spell charge. | Must | Rest later restores the learned charge. |
| DRS-ITEM-032 | Salamander and Helping Hand effects shall restore one missing arm up to two usable arms; use at two arms is allowed only after a no-benefit warning and still consumes the item. | Must | Missing-arm and full-arm fixtures pass. |
| DRS-ITEM-033 | Potion of Luck shall cancel and consume itself on the next eligible activated trap. | Must | Trap effect is skipped and history records cancellation. |
| DRS-ITEM-034 | When multiple consumable trap protections are eligible, the player shall choose which one is consumed. | Must | No protection is silently selected. |
| DRS-ITEM-035 | Trap-tag immunity shall prevent the matching trap consequence without consuming the source. | Must | Blade-immunity fixture passes. |
| DRS-ITEM-036 | Potion of Fury shall add +2 weapon damage until the current encounter ends and shall be consumed on activation. | Must | Bonus ends on victory, escape, or death. |
| DRS-ITEM-037 | Potion of Luminescence shall add two virtual light units during entry preparation or an active expedition and shall then be consumed. | Must | Units clear when the expedition ends. |
| DRS-ITEM-038 | Protector Candle shall be consumed by the next chest opened and double both coin and Treasure quantities only when the chest is not the double-1 trap result. | Must | Normal and trapped chest fixtures pass. |
| DRS-ITEM-039 | Blessed Potion shall destroy one owned item tagged cursed and shall be unusable without a valid target. | Must | No arbitrary item can be destroyed through the effect. |
| DRS-ITEM-040 | Trait-immunity equipment shall suppress only the named trait and shall not suppress unrelated damage or effects. | Must | Undead, Paralyze, Deathtouch, and Firebreath fixtures pass. |
| DRS-ITEM-041 | Tagged damage bonuses and multipliers shall require matching monster tags in authorised content data. | Must | Angel, dragon, snake, vampire, ghoul, and cockroach fixtures pass. |
| DRS-ITEM-042 | Flat equipment damage bonuses shall be included in weapon-damage calculation before Weakness. | Must | Strength and Destruction modifiers pass. |
| DRS-ITEM-043 | Armour HP modifiers shall alter maximum and starting durability at item creation and may reduce it to zero. | Must | Positive and negative armour modifiers pass. |
| DRS-ITEM-044 | Leprechaun-style chest effects shall multiply chest coins only, not Treasure count. | Must | Chest comparison fixture passes. |
| DRS-ITEM-045 | A Vampiric weapon shall heal 1 HP after each completed attack action, even when damage is prevented, unless the adventurer dies during the effect chain. | Must | Stoneskin and Explosive fixtures pass. |
| DRS-ITEM-046 | A Vorpal weapon natural 6 shall cause immediate target defeat before normal damage and then run ordinary Undead and on-defeat processing. | Must | Undead Vorpal fixture passes. |
| DRS-ITEM-047 | A Goblin Whistle shall make living Goblin-tagged monsters flee; fled monsters grant no defeat or Loot rewards. | Must | Mixed encounter retains non-Goblins. |
| DRS-ITEM-048 | An effect that ignores Intangible shall bypass only Intangible prevention and shall not bypass Stoneskin or other defences. | Must | Boatman's Oar fixture passes. |
| DRS-ITEM-049 | Core portal-creating content shall create an inert persistent marker and shall not provide travel or Expanded World mechanics. | Must | No destination or action is generated. |
| DRS-ITEM-050 | Cosmetic-only effects and descriptions shall not alter rules state except explicitly identified cosmetic fields. | Must | Hair colour, elegance, odour, and religious-symbol text create no mechanics. |
| DRS-ITEM-051 | Authorised Ring results shall use one ring accessory slot separate from the five protective armour slots. | Must | Only one Ring may be equipped; equipped Ring leaves the backpack. |
| DRS-ITEM-052 | A Ring with zero maximum durability shall remain equipped and may provide magical effects but cannot be chosen to absorb damage. | Must | Zero-durability Ring is neither destroyed nor a damage target. |

## 14. Spells and Special Effects

### 14.1 Basic Spell table

| 1d6 | Spell ID | Canonical effect |
|---:|---|---|
| 1 | `spell.heal` | Restore 5 HP up to maximum. |
| 2 | `spell.light` | During entry preparation or an active expedition, consume one charge to add one virtual light unit to that expedition's reserve; it requires no hand. |
