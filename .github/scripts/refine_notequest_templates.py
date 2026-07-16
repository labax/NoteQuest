from pathlib import Path
import re

ROOT = Path('docs/product/templates')


def replace(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding='utf-8')
    if old in text:
        path.write_text(text.replace(old, new), encoding='utf-8')
        print(f'updated {path}: {old[:70]!r}')


def replace_regex(path: Path, pattern: str, replacement: str) -> None:
    text = path.read_text(encoding='utf-8')
    updated, count = re.subn(pattern, replacement, text, flags=re.MULTILINE | re.DOTALL)
    if count:
        path.write_text(updated, encoding='utf-8')
        print(f'updated {path}: regex {pattern[:70]!r} ({count})')


# README
path = ROOT / 'README.md'
replace(path,
    'This folder contains reusable Markdown templates for planning NoteQuest Digital Adaptation releases and features.',
    'This folder contains reusable Markdown templates for planning NoteQuest application releases and features.')
replace(path,
    'The templates are intentionally implementation-neutral. Replace every `{{PLACEHOLDER}}`, remove guidance that does not apply, and preserve stable requirement IDs once a document has entered review.',
    'The templates are intentionally implementation-neutral. Replace every `{{PLACEHOLDER}}`, remove guidance that does not apply, and preserve stable requirement IDs once a document has entered review. Completed NoteQuest documentation belongs under `docs/`, the project’s documentation source of truth.')

# Product requirements
path = ROOT / 'product-requirements-template.md'
replace(path,
    '| PP-001 | Session-first | Common play actions remain close to the active session context. |',
    '| PP-001 | Expedition-first | Exploration, combat, inventory, and retreat actions remain close to the active dungeon context. |')
replace(path,
    '| PP-002 | Source-faithful | The product calculates mechanics and records interpretation without forcing narrative outcomes. |',
    '| PP-002 | Source-faithful | The product implements approved NoteQuest mechanics transparently without inventing unsupported rules or content. |')

# Business requirements
path = ROOT / 'business-requirements-template.md'
replace(path,
    'Include product-specific risks such as rules-calculation errors, data loss, scope creep, poor solo usability, over-automation, and unapproved content where applicable.',
    'Include product-specific risks such as rules-calculation errors, save corruption, non-terminating dungeon generation, scope creep, poor solo usability, rules drift, and unapproved content where applicable.')

# MVP scope
path = ROOT / 'mvp-scope-template.md'
replace(path,
    '| MP-003 | Faithful adaptation | Support play without replacing the rulebook or player interpretation. |',
    '| MP-003 | Faithful adaptation | Implement the approved core rules and gameplay loop without adding unsupported mechanics or content. |')
replace(path,
    '| MP-005 | Extensible foundation | Avoid choices that block planned adventure, content, or co-op work. |',
    '| MP-005 | Extensible foundation | Avoid choices that block planned dungeon packs, platform support, accessibility work, or approved expansion content. |')
replace(path,
    '- Unapproved official prose, random table data, assets, art, icons, screenshots, layout, or trade dress.',
    '- Unapproved NoteQuest rules text, tables, item or monster descriptions, art, icons, screenshots, copied layout, or trade dress.')

# Functional requirements
path = ROOT / 'functional-requirements-template.md'
replace(path,
    '''- Character and adventure management.
- Session lifecycle.
- Move and dice roller.
- Torch Supply and status tracking.
- Dungeon progresss and dungeon objectives.
- Random Table browsing and rolling.
- Event Log and history.
- Persistence, migration, import, and export.
- Onboarding and navigation.
- Settings and application reset.
- Content provenance and licensing support.''',
    '''- Adventurer creation and management.
- Dungeon creation, map generation, and exploration.
- Door, trap, and secret-passage resolution.
- Torch, light-source, and hand-use rules.
- Combat and monster-trait resolution.
- Inventory, equipment, armour, spells, and keys.
- Town actions, retreat, and resupply.
- Persistence, dungeon repopulation, corpse recovery, and the Graveyard.
- Onboarding, navigation, accessibility, settings, and application reset.
- Content provenance and licensing support.''')
replace(path,
    '- Automatic narrative interpretation unless explicitly approved.',
    '- Unsupported rule automation or generated narrative content unless explicitly approved.')

# Acceptance criteria / test plan
path = ROOT / 'acceptance-criteria-test-plan-template.md'
replace(path,
    '| Over-automation | Forced story outcomes undermine source-faithful play. | Acceptance tests preserve user interpretation. |',
    '| Rules drift | Invented or incorrectly automated rules undermine source-faithful play. | Acceptance tests compare behavior with the approved digital rules specification. |')
replace(path,
    '- Result classifications, ties, matches, caps, and modifier order.',
    '- d6 and 2d6 table mapping, natural die triggers, modifiers, and boundary handling.')
replace(path,
    '- Track controls and boundaries.',
    '- HP, armour, torch, coin, spell-use, and inventory controls and boundaries.')
replace(path,
    '''| Dungeon | {{DUNGEON_NAME}} |
| Adventurer | {{ADVENTURER_NAME}} |
| HP / armour / torches / coins | {{VALUES}} |
| Dungeon depth / current HP | {{VALUES}} |
| Doors / rooms / monsters | {{VALUES}} |
| Event log / Graveyard | {{VALUES}} |''',
    '''| Dungeon type / floor | {{VALUES}} |
| Adventurer race / class | {{VALUES}} |
| HP / armour / torches / coins | {{VALUES}} |
| Weapon / spells / inventory | {{VALUES}} |
| Rooms / doors / monsters | {{VALUES}} |
| Event log / Graveyard | {{VALUES}} |''')
replace(path,
    '''- Every result classification.
- Ties and matches.
- Minimum and maximum dice.
- Modifier order and score caps.
- Negative torch supply and burn behavior.
- Partial progress and filled-box-only score.
- Random Table first/last ranges and invalid gaps/overlaps.
- Manual input and override.''',
    '''- Minimum and maximum d6 results and every 2d6 table value.
- Door outcomes for trap, locked, and unlocked results.
- Natural 1 and natural 6 monster-trait triggers.
- Weapon and spell modifiers plus armour damage allocation.
- Torch capacity, expenditure, alternative light, and zero-light death.
- Dungeon-table first/last ranges and invalid gaps or overlaps.
- Inventory, equipment-slot, and spell-use limits.
- Manual input, house-rule override, and no-change cancellation.''')
replace(path,
    '- [ ] Progress or primary state can be updated.',
    '- [ ] Dungeon map and adventurer state can be updated.')
replace(path,
    '- [ ] Event Log / history entry can be created where in scope.',
    '- [ ] Event-log or Graveyard entry can be created where in scope.')
replace(path,
    '| High | Major flow fails with limited workaround. | Cannot complete a required dungeon objective or session action. | Fix or explicit product waiver. |',
    '| High | Major flow fails with limited workaround. | Cannot enter a dungeon, resolve combat, retreat to town, or recover dropped equipment. | Fix or explicit product waiver. |')
replace(path,
    '| AC-GEN-003 | Mechanical results are transparent and user interpretation is preserved. | Must | Acceptance review |',
    '| AC-GEN-003 | Mechanical results and source-rule decisions are transparent and inspectable. | Must | Acceptance review |')

# Content and licensing
path = ROOT / 'content-licensing-requirements-template.md'
replace(path,
    '''| Rules and mechanics presentation | Labels, summaries, action references, dice help | {{OWNER}} |
| Random Table content | Table names, ranges, prompts, source labels | {{OWNER}} |
| Character / adventure content | Field labels, defaults, help text | {{OWNER}} |
| Visual assets | Icons, illustrations, textures, fonts | {{OWNER}} |
| Product copy | Onboarding, errors, tooltips, release notes | {{OWNER}} |
| User-authored content | Characters, dungeon objectives, notes, custom data | {{OWNER}} |''',
    '''| Rules and mechanics presentation | Labels, summaries, dice help, action costs | {{OWNER}} |
| Character-creation content | Race, class, spell, HP, ability, and starting-equipment tables | {{OWNER}} |
| Dungeon and encounter content | Dungeon names, segments, rooms, traps, monsters, bosses, and rewards | {{OWNER}} |
| Visual assets | Icons, illustrations, textures, fonts | {{OWNER}} |
| Product copy | Onboarding, errors, tooltips, release notes | {{OWNER}} |
| User-authored content | Adventurer names, notes, custom dungeon data, and save metadata | {{OWNER}} |''')
replace(path,
    '| `official_oracles_by` | Official random table content under verified attribution terms. | Include only after row/table inventory and approval. |',
    '| `official_tables_by` | Official character, dungeon, encounter, item, or reward table content under verified attribution terms. | Include only after row/table inventory and approval. |')
replace(path,
    '| `user_authored` | Player-created characters, dungeon objectives, notes, and custom content. | Private/user-controlled; not bundled as official content. |',
    '| `user_authored` | Player-created adventurer names, notes, custom dungeon data, and save metadata. | Private/user-controlled; not bundled as official content. |')
replace(path,
    '''| Dice mechanics | {{USE}} | project_original / verified source | {{MODES}} | {{ATTRIBUTION}} | {{STATUS}} |
| Action names / summaries | {{USE}} | {{CATEGORY}} | {{MODES}} | {{ATTRIBUTION}} | {{STATUS}} |
| Full rules text | {{USE_OR_EXCLUDED}} | {{CATEGORY}} | {{MODES}} | {{ATTRIBUTION}} | {{STATUS}} |
| Random Table tables | {{USE}} | {{CATEGORY}} | {{MODES}} | {{ATTRIBUTION}} | {{STATUS}} |
| Asset names / text | {{USE}} | {{CATEGORY}} | {{MODES}} | {{ATTRIBUTION}} | {{STATUS}} |
| Character sheet labels | {{USE}} | project_original / verified source | {{MODES}} | {{ATTRIBUTION}} | {{STATUS}} |''',
    '''| Dice mechanics | {{USE}} | project_original / verified source | {{MODES}} | {{ATTRIBUTION}} | {{STATUS}} |
| Character-creation tables | {{USE}} | {{CATEGORY}} | {{MODES}} | {{ATTRIBUTION}} | {{STATUS}} |
| Dungeon and encounter tables | {{USE}} | {{CATEGORY}} | {{MODES}} | {{ATTRIBUTION}} | {{STATUS}} |
| Rules summaries or full rules text | {{USE_OR_EXCLUDED}} | {{CATEGORY}} | {{MODES}} | {{ATTRIBUTION}} | {{STATUS}} |
| Monster, boss, item, and spell names or descriptions | {{USE}} | {{CATEGORY}} | {{MODES}} | {{ATTRIBUTION}} | {{STATUS}} |
| Adventurer-sheet labels | {{USE}} | project_original / verified source | {{MODES}} | {{ATTRIBUTION}} | {{STATUS}} |''')
replace(path,
    '- User-authored characters, dungeon objectives, event logs, and custom content remain user-controlled data.',
    '- User-authored adventurer names, notes, custom dungeon data, event logs, and save metadata remain user-controlled data.')

# Data / domain model
path = ROOT / 'data-domain-model-template.md'
replace(path,
    'Examples may include multiple adventures, multiple characters, session history, custom content, co-op play, export, and migration.',
    'Examples may include multiple save slots, adventurers, persistent dungeons, expeditions, corpse recovery, Graveyard history, custom content, export, and migration.')
replace(path,
    '| DMP-002 | Source-faithful data | User-authored interpretation is stored separately from mechanical results. |',
    '| DMP-002 | Source-faithful data | Player-created notes are stored separately from mechanical results and licensed source content. |')
replace(path,
    '''- Workspace / ownership.
- Adventure and session.
- Character.
- Progress and dungeon objectives.
- Rolls and rules results.
- Random Tables and bundled content.
- Event Log and activity history.
- Content / licensing.
- Import / export / migration.''',
    '''- Save slots and ownership.
- Adventurers and abilities.
- Dungeons, floors, segments, doors, and traps.
- Combat encounters and monster instances.
- Inventory, equipment, armour, spells, keys, torches, and coins.
- Town actions, corpse recovery, event logs, and the Graveyard.
- Rules-table definitions and bundled content.
- Content / licensing.
- Import / export / migration.''')
replace(path,
    '''- Stat block.
- Dice result.
- Progress value.
- Torch Supply state.
- Content provenance reference.
- Date range or session duration.
- Export manifest metadata.''',
    '''- HP and armour pools.
- Dice and table result.
- Torch count and light-source state.
- Damage expression and natural-die result.
- Dungeon segment connection.
- Content provenance reference.
- Expedition timestamp or duration.
- Export manifest metadata.''')
replace(path,
    '- Progress / roll immutability.',
    '- Generated dungeon structure and completed roll immutability.')
replace(path,
    '| Scope | {{ADVENTURE_WORKSPACE_OR_RECORD_SCOPE}} |',
    '| Scope | {{SAVE_SLOT_DUNGEON_OR_RECORD_SCOPE}} |')
replace(path,
    '''| Roll result | Immutable result plus explicit amendment if corrected. | Character, adventure, session, event log entry. |
| Progress event | Append-only change reason where implemented. | Dungeon progress and optional dungeon objective / session. |
| Event Log entry | User-editable with updated timestamp. | Adventure, session, dungeon objective, track, roll, or random table result. |
| Import / migration | Import report and schema versions. | Workspace or adventure. |''',
    '''| Dice or table result | Immutable result plus explicit amendment if corrected. | Adventurer, dungeon, segment, encounter, or event-log entry. |
| Dungeon-generation event | Append-only source table, die values, and generated connection. | Dungeon, floor, segment, and door. |
| Adventurer-state change | Record value before, value after, and change reason where history is retained. | HP, armour, torches, coins, spells, and inventory. |
| Event-log entry | User-editable with updated timestamp. | Save slot, adventurer, dungeon, segment, encounter, or roll result. |
| Import / migration | Import report and schema versions. | Save slot or application workspace. |''')

# Non-functional requirements
path = ROOT / 'non-functional-requirements-template.md'
replace(path,
    '- Character, adventure, dungeon objective, and event log data loss.',
    '- Adventurer, dungeon, inventory, event-log, and Graveyard data loss.')
replace(path,
    '- Long-running adventure data growth.',
    '- Persistent dungeon, event-log, and Graveyard data growth.')
replace(path,
    '- Storage limits use representative adventure fixtures.',
    '- Storage limits use representative save-slot and dungeon fixtures.')
replace(path,
    '| NFR-PERF-005 | Event Log/history views shall remain responsive with {{FIXTURE_SIZE}} records. | {{TARGET}} | {{ENVIRONMENT}} | Fixture test | Should |',
    '| NFR-PERF-005 | Event-log and Graveyard views shall remain responsive with {{FIXTURE_SIZE}} records. | {{TARGET}} | {{ENVIRONMENT}} | Fixture test | Should |')
replace(path,
    '| Persistent workspace | {{BUDGET}} | Include representative long-running adventure. |',
    '| Persistent workspace | {{BUDGET}} | Include representative explored dungeons, dropped equipment, event logs, and Graveyard records. |')
replace(path,
    '- Private adventure and event log data.',
    '- Private save-slot, adventurer, dungeon, event-log, and Graveyard data.')
replace(path,
    '| NFR-PRIV-005 | Export shall clearly indicate that files may contain private adventure notes. | Warning before / during export | UX test | Should |',
    '| NFR-PRIV-005 | Export shall clearly indicate that files may contain private notes and complete save-state data. | Warning before / during export | UX test | Should |')
replace(path,
    '| NFR-USE-002 | A returning user shall identify active adventure/session context and next likely action within {{TARGET}}. | {{TARGET}} | Playtest | Should |',
    '| NFR-USE-002 | A returning user shall identify the active adventurer, current dungeon segment, remaining torches, and next available action within {{TARGET}}. | {{TARGET}} | Playtest | Should |')
replace(path,
    '| NFR-USE-005 | The product shall avoid forced narrative text and preserve user interpretation. | No mandatory authored consequence | Acceptance test | Must |',
    '| NFR-USE-005 | The product shall avoid unsupported rule automation or generated outcomes. | No behavior outside the approved digital rules specification | Acceptance test | Must |')
replace(path,
    '| NFR-OBS-003 | Production diagnostics shall not log private event log content or full imported backups by default. | No sensitive logging | Log inspection | Must |',
    '| NFR-OBS-003 | Production diagnostics shall not log private notes, event-log content, Graveyard details, or full imported backups by default. | No sensitive logging | Log inspection | Must |')

# Release addendum
path = ROOT / 'release-addendum-template.md'
replace(path,
    '- Player-created notes remains separate from deterministic mechanics and bundled content.',
    '- Player-created notes remain separate from deterministic mechanics and bundled content.')
replace(path,
    '- New unapproved bundled NoteQuest content.',
    '- New unapproved NoteQuest rules text, tables, descriptions, artwork, or trade dress.')

# UX flow / wireframe requirements
path = ROOT / 'ux-flow-wireframe-requirements-template.md'
replace(path,
    '{{DESCRIBE_THE_SESSION_OR_TASK_CONTEXT_AND_THE_MAIN_QUESTIONS_THE_UI_MUST_HELP_THE_USER_ANSWER}}',
    '{{DESCRIBE_THE_EXPEDITION_OR_TASK_CONTEXT_AND_THE_MAIN_QUESTIONS_THE_UI_MUST_HELP_THE_USER_ANSWER}}')
replace(path,
    '| UX-P001 | Session-first | Active-play actions take priority over administrative navigation. |',
    '| UX-P001 | Expedition-first | Exploration, combat, inventory, retreat, and town actions take priority over administrative navigation. |')
replace(path,
    '| UX-P003 | State nearby | Important character, adventure, dungeon objective, and save state is visible or one action away. |',
    '| UX-P003 | State nearby | Adventurer HP, armour, torches, equipment, current dungeon segment, monsters, and save state are visible or one action away. |')
replace(path,
    '| UX-P004 | Interpretation preserved | Mechanical outcomes are clear without writing compulsory narrative consequences. |',
    '| UX-P004 | Source-rule clarity | Mechanical outcomes show the dice, tables, modifiers, and state changes that produced them. |')
replace(path,
    '| UX-P007 | Safe destructive actions | Delete, reset, import, overwrite, burn, and outcome actions are deliberate. |',
    '| UX-P007 | Safe destructive actions | Delete, reset, import, overwrite, item discard, door breaking, and last-torch actions are deliberate. |')
replace(path,
    '''- First launch and onboarding.
- Resume active adventure or session.
- Create or edit a character.
- Create, update, fulfill, or forsake a dungeon objective.
- Action roll with optional torch expenditure.
- Progress update and progress roll.
- Random Table roll and save to event log.
- Start, pause, complete, and review a session.
- Export, import preview, restore, and reset.''',
    '''- First launch and onboarding.
- Create or select an adventurer.
- Generate and enter a dungeon.
- Open a door and resolve its lock or trap state.
- Generate a segment, room content, and monsters.
- Resolve combat, spells, armour damage, loot, and inventory choices.
- Spend torches on exploration actions and respond to low-light warnings.
- Retreat to town, rest, repair, sell, buy torches, and re-enter the dungeon.
- Record death, create a replacement adventurer, and recover dropped equipment.
- Defeat the boss, complete the dungeon, and review the Graveyard or event log.
- Export, import preview, restore, and reset.''')
replace(path,
    '''- Status / resource control.
- Dungeon progress.
- Dice result card.
- Torch expenditure confirmation.
- Random Table result card.
- Event Log editor.
- Dungeon Objective card and milestone list.
- Save-status banner.
- Adventure / session selector.
- Destructive confirmation dialog.
- Import preview and validation report.''',
    '''- Adventurer HP, armour, torch, coin, spell-use, and hand-status controls.
- Procedural dungeon map and current-segment panel.
- Door, trap, secret-passage, and chest action panel.
- Dice and table-result card with source and modifiers.
- Monster list, turn indicator, damage preview, and trait feedback.
- Inventory, equipment, armour-piece, spell, and key controls.
- Low-light and last-torch confirmation.
- Town-action panel.
- Event-log and Graveyard views.
- Save-status banner.
- Destructive confirmation dialog.
- Import preview and validation report.''')
replace(path,
    '- Long adventure names, event log text, and error messages wrap without breaking layout.',
    '- Long adventurer names, dungeon names, event-log text, and error messages wrap without breaking layout.')
replace(path,
    '- Keep user-authored event log entries, dungeon objectives, and custom content clearly separate from bundled content.',
    '- Keep player-created notes, event-log entries, custom dungeon data, and save metadata clearly separate from bundled content.')
replace(path,
    '- [ ] Mechanical results remain clear without forced narrative prose.',
    '- [ ] Mechanical results remain clear, traceable to their dice or tables, and free of unsupported outcomes.')

# Rules engine
path = ROOT / 'rules-engine-requirements-template.md'
replace(path,
    'The rules engine calculates mechanical results and validates state. It does not replace player interpretation or automatically author narrative consequences unless explicitly approved.',
    'The rules engine calculates NoteQuest outcomes, validates game state, and records the inputs used. It must not invent rules, tables, or consequences outside the approved digital rules specification.')
replace_regex(path,
    r'### 4\.1 In scope\n\n\| Area \| Rules behavior \|\n\|---\|---\|\n.*?\n\n### 4\.2 Out of scope',
    '''### 4.1 In scope

| Area | Rules behavior |
|---|---|
| Dice and random generation | d6 and 2d6 rolls, seeded randomness, manual entry, and natural-result preservation |
| Adventurer creation | Race and class rolls, HP, abilities, spells, starting weapon, coins, and torches |
| Dungeon generation | Dungeon names, segments, room content, monsters, bosses, floors, and final-room rules |
| Doors, traps, and secret passages | Door states, trap resolution, keys, torch costs, breakage, and alerting |
| Light, torches, and hands | Capacity, action costs, alternative light, darkness death, and hand requirements |
| Combat and monster traits | Initiative, damage, armour allocation, natural die triggers, escape, death, and loot |
| Inventory, equipment, and spells | Capacity, slots, durability, spell uses, keys, consumables, and dropped items |
| Town and persistence | Retreat, rest, repair, buying, selling, repopulation, corpse recovery, saves, and the Graveyard |

### 4.2 Out of scope''')
replace(path,
    '''- AI interpretation or mandatory narrative outcomes.
- Full asset automation unless explicitly approved.
- Unapproved official rules prose in the product or source comments.''',
    '''- Unsupported narrative generation or mechanics not present in the approved digital rules specification.
- Expanded World rules unless separately approved and specified.
- Unapproved official rules prose, tables, descriptions, artwork, or trade dress in the product or source comments.''')
replace(path,
    '| REP-004 | Source-faithful | The engine provides mechanical outcomes, not compulsory story prose. |',
    '| REP-004 | Source-faithful | The engine implements approved NoteQuest rules without inventing additional mechanics or content. |')
replace_regex(path,
    r'## 7\. Module Summary\n\n\| Module \| Requirement IDs \| Priority \| Owner \|\n\|---\|---\|---:\|---\|\n.*?\n\n## 8\. Detailed Requirements',
    '''## 7. Module Summary

| Module | Requirement IDs | Priority | Owner |
|---|---|---:|---|
| Dice and random generation | RER-DICE-001 to RER-DICE-{{LAST}} | Must / Should | {{OWNER}} |
| Adventurer creation | RER-ADV-001 to RER-ADV-{{LAST}} | Must | {{OWNER}} |
| Dungeon generation | RER-DUN-001 to RER-DUN-{{LAST}} | Must | {{OWNER}} |
| Doors, traps, and secret passages | RER-DOOR-001 to RER-DOOR-{{LAST}} | Must | {{OWNER}} |
| Light, torches, and hands | RER-LIGHT-001 to RER-LIGHT-{{LAST}} | Must | {{OWNER}} |
| Combat and monster traits | RER-COMBAT-001 to RER-COMBAT-{{LAST}} | Must | {{OWNER}} |
| Inventory, equipment, and spells | RER-ITEM-001 to RER-ITEM-{{LAST}} | Must / Should | {{OWNER}} |
| Town and persistence | RER-PERSIST-001 to RER-PERSIST-{{LAST}} | Must / Should | {{OWNER}} |
| History and validation | RER-HIST-001 / RER-VAL-001 onward | Must / Should | {{OWNER}} |

## 8. Detailed Requirements''')
replace_regex(path,
    r'### Suggested module details\n\n#### Dice service\n.*?\n\n## 9\. Calculation Reference',
    '''### Suggested module details

#### Dice and random generation

Define:

- Supported d6 and 2d6 procedures.
- Generated versus manual rolls.
- Seeded or injected randomness for reproducible tests and saves.
- Preservation of natural die values before modifiers.
- Reroll rules, if any, and result stability after save/reload.

#### Adventurer creation

Define:

- 2d6 race and class lookup.
- Maximum HP as race HP plus class HP.
- Starting weapon, abilities, spell results, ten torches, and zero coins.
- Duplicate spell results as separate uses.
- Validation for arms, hands, equipment, and light sources.

#### Dungeon generation

Define:

- Three-part dungeon-name generation and dungeon-type selection.
- Incremental generation when a door is opened.
- Segment-table column selection based on staircase, corridor, or room origin.
- Room-content and monster generation.
- Floor transitions, guaranteed termination, and final-room generation.
- Boss generation and boss-treasure resolution.

#### Doors, traps, and secret passages

Define:

- Door result 1 as trap, 2–3 as locked, and 4–6 as unlocked.
- Unlocking by torch, key, class ability, or approved item effect.
- Broken-door persistence and monster-alert propagation.
- Trap timing, damage, limb loss, spawned monsters, and cancelled traps.
- One-time secret-passage searches and generated results.

#### Light, torches, and hands

Define:

- Starting and maximum torch count of ten.
- Torch costs for dungeon entry and qualifying exploration actions.
- Alternative light from spells, lamps, and approved items.
- Darkness-death timing when no light source remains.
- One-handed and two-handed equipment constraints after limb loss.

#### Combat and monster traits

Define:

- Initiative from quiet opening, broken doors, traps, or alert state.
- Player damage rolls, target selection, and combined surviving-monster damage.
- Armour-piece allocation, durability, destruction, and spillover.
- Natural 1 and natural 6 trait triggers and modifier order.
- Spell and consumable actions, teleport escape, death, and loot.

#### Inventory, equipment, and spells

Define:

- Ten-item backpack capacity and separate ten-torch capacity.
- Equipped weapon, armour-piece uniqueness, and hand requirements.
- Item pickup, discard, room persistence, and corpse recovery.
- Spell-use exhaustion and restoration in town.
- Normal keys, master keys, consumables, and magical modifiers.

#### Town and persistence

Define:

- Safe retreat-path validation.
- Rest, armour repair, torch purchase, and item-sale costs.
- Dungeon state retained across expeditions and replacement adventurers.
- Monster healing and room repopulation on a later expedition.
- Death records, dropped equipment, darkness deaths, and the Graveyard.

## 9. Calculation Reference''')
replace_regex(path,
    r'## 12\. Roll / Rules History\n\n\| Field \| Required \| Notes \|\n\|---\|---:\|---\|\n.*?\n\n## 13\. Deterministic Test Matrix',
    '''## 12. Roll / Rules History

| Field | Required | Notes |
|---|---:|---|
| ID | Yes | Stable identifier. |
| Result type | Yes | Race, class, door, segment, room content, monster, combat, reward, trap, or custom. |
| Inputs | Yes | Natural die values, source table, modifiers, relevant item or ability, and current state. |
| Initial result | Yes | Unmodified dice or source-table result. |
| Final result | Yes | Resolved outcome after approved modifiers and user choices. |
| Natural die values | Yes where applicable | Preserve natural 1 and 6 results used by monster traits and item effects. |
| Context | Should | Save slot, adventurer, dungeon, floor, segment, encounter, and expedition. |
| Rule version | Should | Supports future migrations and interpretation. |
| Source | Should | Generated, manual, seeded, or imported result. |
| Timestamp | Should | Links the record to the event log and save history. |
| User note | Could | Optional player-created note. |

## 13. Deterministic Test Matrix''')
replace(path,
    '''- Minimum and maximum die results.
- Every result classification.
- Ties.
- Matches.
- Score caps.
- Negative torch supply cancellation.
- Torch expenditure eligibility and reset.
- Partially filled progress boxes.
- Random Table table first and last ranges.
- Invalid manual input.
- Manual override behavior.''',
    '''- Minimum and maximum d6 results and every 2d6 table value.
- Race, class, spell, dungeon-name, door, segment, room, monster, boss, and reward lookups.
- Door trap, locked, and unlocked boundaries.
- Torch capacity, qualifying action costs, alternative light, and zero-light death.
- Floor transitions, final-room generation, and dungeon-termination rules.
- Weapon and spell modifiers, armour allocation, and monster natural 1 or 6 trait triggers.
- Inventory, equipment-slot, spell-use, key, and hand constraints.
- Monster healing, room repopulation, dropped items, and corpse recovery across expeditions.
- First and last table ranges plus invalid gaps or overlaps.
- Invalid manual input and explicit override behavior.''')

# Minor cleanup.
for path in ROOT.glob('*.md'):
    text = path.read_text(encoding='utf-8')
    text = text.replace('Event Log / history', 'Event log / history')
    text = text.replace('Random Table first/last', 'Rules-table first/last')
    text = text.replace('Random Table table', 'Rules-table')
    text = text.replace('Torch Supply state', 'Torch-count state')
    path.write_text(text, encoding='utf-8')

# Print remaining inherited terms for the follow-up review; do not block the commit.
banned = re.compile(
    r'Ironsworn|Digital Companion|fiction-first|\bmomentum\b|\bvows?\b|\boracles?\b|'
    r'progress tracks?|progress rolls?|filled-box|rank-based progress|action die|challenge dice|'
    r'strong hit|weak hit|match detection|pre-burn|post-burn|burn eligibility|negative torch supply|'
    r'\bdebilities\b|\bbonds\b|\bcampaigns?\b|\bjournals?\b|\bcompanion\b|move and dice|'
    r'move references?|full move|session-first|player interpretation|mandatory narrative|'
    r'forced narrative|compulsory narrative|dungeon objective|progresss|Random Table tables|'
    r'official_oracles_by',
    re.IGNORECASE,
)
for path in sorted(ROOT.glob('*.md')):
    for number, line in enumerate(path.read_text(encoding='utf-8').splitlines(), 1):
        if banned.search(line):
            print(f'REVIEW {path}:{number}: {line}')
