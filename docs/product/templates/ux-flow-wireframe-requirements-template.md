# UX Flow / Wireframe Requirements

## {{PRODUCT_OR_RELEASE_NAME}}

*Version {{VERSION}} | {{STATUS}} | Prepared for the NoteQuest Project*

| Field | Value |
|---|---|
| Document owner | {{OWNER}} |
| Related documents | {{RELATED_DOCUMENTS}} |
| Product scope | {{SCOPE}} |
| Primary audience | Product owner, UX/UI designer, developer, QA/tester, and content/licensing reviewer |
| Status | {{STATUS}} |
| Last updated | {{DATE}} |

---

## Contents

1. Purpose
2. Source Basis
3. UX Context
4. UX Scope
5. UX Principles
6. Target Users and Needs
7. Information Architecture
8. App Shell and Navigation
9. Core User Flows
10. Screen and Wireframe Requirements
11. Component Requirements
12. Responsive Behavior
13. Accessibility Requirements
14. Empty, Loading, Error, Confirmation, and Recovery States
15. Content and Licensing UX
16. Traceability
17. UX Acceptance Criteria
18. Open Questions
19. Approval

---

## 1. Purpose

{{DEFINE_THE_USER_FLOWS_INFORMATION_ARCHITECTURE_SCREEN_REQUIREMENTS_AND_LOW_FIDELITY_LAYOUT_EXPECTATIONS}}

This document is not a final visual design system. It should provide enough structure for implementation and QA without prescribing unapproved art, official layouts, or trade dress.

## 2. Source Basis

- {{BUSINESS_OR_PRODUCT_REQUIREMENTS}}
- {{MVP_OR_RELEASE_SCOPE}}
- {{FUNCTIONAL_REQUIREMENTS}}
- {{DATA_OR_RULES_REQUIREMENTS}}
- {{PLAYTEST_FINDINGS_OR_UI_FEEDBACK}}

## 3. UX Context

{{DESCRIBE_THE_SESSION_OR_TASK_CONTEXT_AND_THE_MAIN_QUESTIONS_THE_UI_MUST_HELP_THE_USER_ANSWER}}

Typical questions include:

1. What is my current state?
2. What can I do next?
3. What changed?
4. How do I recover from a mistake or failed save?

## 4. UX Scope

### 4.1 In scope

| Area | UX scope |
|---|---|
| {{AREA}} | {{SCOPE}} |
| {{AREA}} | {{SCOPE}} |

### 4.2 Out of scope

| Area | Excluded UX |
|---|---|
| {{AREA}} | {{EXCLUSION}} |
| {{AREA}} | {{EXCLUSION}} |

## 5. UX Principles

| ID | Principle | UX meaning |
|---|---|---|
| UX-P001 | Session-first | Active-play actions take priority over administrative navigation. |
| UX-P002 | Low interruption | Common actions use compact panels, drawers, or dialogs and return the user to context. |
| UX-P003 | State nearby | Important character, adventure, dungeon objective, and save state is visible or one action away. |
| UX-P004 | Interpretation preserved | Mechanical outcomes are clear without writing compulsory narrative consequences. |
| UX-P005 | Manual control | Users can correct values and support variants where safe. |
| UX-P006 | Progressive disclosure | Guidance is available without slowing experienced players. |
| UX-P007 | Safe destructive actions | Delete, reset, import, overwrite, burn, and outcome actions are deliberate. |
| UX-P008 | Provenance visible | Bundled, custom, and user-authored content are distinguishable. |
| UX-P009 | Mobile viable | Core workflows remain usable on supported phone widths. |
| UX-P010 | Accessible by default | Keyboard, focus, labels, contrast, and status announcements are designed in. |
| UX-P011 | {{PRINCIPLE}} | {{MEANING}} |

## 6. Target Users and Needs

| User | Priority | Context | UX need | Risk if unmet |
|---|---:|---|---|---|
| {{USER}} | Primary | {{CONTEXT}} | {{NEED}} | {{RISK}} |
| {{USER}} | Secondary | {{CONTEXT}} | {{NEED}} | {{RISK}} |

## 7. Information Architecture

### 7.1 Primary navigation

| Destination | Purpose | Primary content | Primary actions |
|---|---|---|---|
| {{DESTINATION}} | {{PURPOSE}} | {{CONTENT}} | {{ACTIONS}} |
| {{DESTINATION}} | {{PURPOSE}} | {{CONTENT}} | {{ACTIONS}} |

### 7.2 Secondary navigation

| Area | Tabs / sections | Default section |
|---|---|---|
| {{AREA}} | {{SECTIONS}} | {{DEFAULT}} |
| {{AREA}} | {{SECTIONS}} | {{DEFAULT}} |

### 7.3 Object relationships in the UX

```mermaid
flowchart TD
    {{OBJECT_A}} --> {{OBJECT_B}}
    {{OBJECT_A}} --> {{OBJECT_C}}
    {{OBJECT_B}} --> {{OBJECT_D}}
```

## 8. App Shell and Navigation

### 8.1 Desktop shell

- Navigation placement: {{PLACEMENT}}
- Main workspace: {{BEHAVIOR}}
- Utility or contextual region: {{BEHAVIOR}}
- Save / sync / local-state indicator: {{PLACEMENT_AND_STATES}}

### 8.2 Mobile shell

- Top bar: {{CONTENT}}
- Bottom navigation or menu: {{CONTENT}}
- Drawer / bottom-sheet behavior: {{BEHAVIOR}}
- Floating actions: {{ACTIONS_OR_NONE}}

### 8.3 Global actions

| Action | Availability | Keyboard / shortcut | Confirmation |
|---|---|---|---|
| {{ACTION}} | {{WHERE}} | {{SHORTCUT_OR_NONE}} | {{CONFIRMATION}} |
| {{ACTION}} | {{WHERE}} | {{SHORTCUT_OR_NONE}} | {{CONFIRMATION}} |

## 9. Core User Flows

Repeat this section for each core journey.

### 9.1 Flow {{LETTER}}: {{FLOW_NAME}}

```mermaid
flowchart TD
    A[{{START}}] --> B{ {{DECISION}} }
    B -- {{OPTION}} --> C[{{ACTION}}]
    B -- {{OPTION}} --> D[{{RECOVERY_OR_ALTERNATIVE}}]
    C --> E[{{SUCCESS_STATE}}]
```

#### Flow requirements

| ID | Requirement | Priority | Acceptance signal |
|---|---|---:|---|
| UX-FLOW-{{LETTER}}-001 | {{REQUIREMENT}} | Must | {{SIGNAL}} |
| UX-FLOW-{{LETTER}}-002 | {{REQUIREMENT}} | Should | {{SIGNAL}} |

#### Recovery paths

- User cancels: {{BEHAVIOR}}
- Validation fails: {{BEHAVIOR}}
- Save fails: {{BEHAVIOR}}
- Required record is missing: {{BEHAVIOR}}
- Stored data is incompatible: {{BEHAVIOR}}

Suggested flows:

- First launch and onboarding.
- Resume active adventure or session.
- Create or edit a character.
- Create, update, fulfill, or forsake a dungeon objective.
- Action roll with optional torch expenditure.
- Progress update and progress roll.
- Random Table roll and save to event log.
- Start, pause, complete, and review a session.
- Export, import preview, restore, and reset.

## 10. Screen and Wireframe Requirements

Repeat for every screen or major panel.

### 10.1 {{SCREEN_NAME}}

**Purpose:** {{PURPOSE}}

**Entry points:** {{ENTRY_POINTS}}

**Exit points:** {{EXIT_POINTS}}

#### Required content

| Region | Content | Priority | Interaction |
|---|---|---:|---|
| Header | {{CONTENT}} | Must | {{INTERACTION}} |
| Primary workspace | {{CONTENT}} | Must | {{INTERACTION}} |
| Secondary / utility | {{CONTENT}} | Should | {{INTERACTION}} |
| Footer / status | {{CONTENT}} | Should | {{INTERACTION}} |

#### Low-fidelity wireframe

```text
+------------------------------------------------------+
| {{HEADER}}                                           |
+----------------+-------------------------------------+
| {{NAVIGATION}} | {{PRIMARY_CONTENT}}                 |
|                |                                     |
|                | {{PRIMARY_ACTIONS}}                 |
+----------------+----------------------+--------------+
| {{STATUS_OR_FOOTER}}                  | {{UTILITY}}  |
+------------------------------------------------------+
```

#### Screen states

- Empty: {{EMPTY_STATE}}
- Loading: {{LOADING_STATE}}
- Error: {{ERROR_STATE}}
- Offline / local-only: {{STATE}}
- Success feedback: {{FEEDBACK}}
- Destructive confirmation: {{CONFIRMATION}}

## 11. Component Requirements

### 11.1 {{COMPONENT_NAME}}

| ID | Requirement | Priority | Accessibility note |
|---|---|---:|---|
| UX-CMP-001 | {{COMPONENT_BEHAVIOR}} | Must | {{A11Y_NOTE}} |
| UX-CMP-002 | {{COMPONENT_BEHAVIOR}} | Should | {{A11Y_NOTE}} |

Suggested components:

- Status / resource control.
- Dungeon progress.
- Dice result card.
- Torch expenditure confirmation.
- Random Table result card.
- Event Log editor.
- Dungeon Objective card and milestone list.
- Save-status banner.
- Adventure / session selector.
- Destructive confirmation dialog.
- Import preview and validation report.

## 12. Responsive Behavior

| Breakpoint / mode | Layout | Navigation | Modals / drawers | Critical constraints |
|---|---|---|---|---|
| Wide desktop | {{LAYOUT}} | {{NAV}} | {{BEHAVIOR}} | {{CONSTRAINTS}} |
| Narrow desktop / tablet | {{LAYOUT}} | {{NAV}} | {{BEHAVIOR}} | {{CONSTRAINTS}} |
| Mobile | {{LAYOUT}} | {{NAV}} | {{BEHAVIOR}} | {{CONSTRAINTS}} |

Requirements:

- No required control is clipped or available only by hover.
- Tables have a small-screen strategy: cards, horizontal scrolling, or reduced columns.
- Dialogs fit the viewport and preserve access to close / confirm controls.
- Long adventure names, event log text, and error messages wrap without breaking layout.
- Touch targets meet the agreed accessibility baseline.

## 13. Accessibility Requirements

| ID | Requirement | Acceptance method |
|---|---|---|
| UX-A11Y-001 | All interactive controls are keyboard operable. | Keyboard walkthrough. |
| UX-A11Y-002 | Focus order follows visual and task order. | Keyboard walkthrough. |
| UX-A11Y-003 | Dialog focus is trapped and restored correctly. | Component / manual test. |
| UX-A11Y-004 | Inputs have labels and field errors are associated. | Automated and manual check. |
| UX-A11Y-005 | Dynamic roll, save, import, and error status is announced where appropriate. | Screen-reader smoke test. |
| UX-A11Y-006 | Color is not the only indicator of state or result. | Visual inspection. |
| UX-A11Y-007 | Headings and landmarks describe page structure. | Automated and manual check. |
| UX-A11Y-008 | Reduced-motion preferences are respected where animation exists. | Browser preference test. |

## 14. Empty, Loading, Error, Confirmation, and Recovery States

| Context | Empty state | Loading state | Error state | Recovery action |
|---|---|---|---|---|
| {{FEATURE}} | {{EMPTY}} | {{LOADING}} | {{ERROR}} | {{RECOVERY}} |
| {{FEATURE}} | {{EMPTY}} | {{LOADING}} | {{ERROR}} | {{RECOVERY}} |

### Destructive action checklist

- [ ] Action names the affected object and scope.
- [ ] Consequences are stated in plain language.
- [ ] Primary and cancel actions are visually and semantically distinct.
- [ ] Cancel is safe and applies no mutation.
- [ ] Irreversible actions require stronger confirmation.
- [ ] Recovery or backup guidance is shown where relevant.

## 15. Content and Licensing UX

- Use original product copy for help, onboarding, summaries, and errors where practical.
- Do not imitate the official rulebook layout, character sheet trade dress, icons, or artwork.
- Show provenance labels where users select or browse bundled, custom, imported, or user-authored content.
- Place attribution and unofficial-product notices in a discoverable About / Legal area.
- Do not show blocked or unknown content in release builds.
- Keep user-authored event log entries, dungeon objectives, and custom content clearly separate from bundled content.

## 16. Traceability

| UX requirement / flow | Functional requirement | Data / rules requirement | Acceptance test |
|---|---|---|---|
| UX-{{ID}} | {{FR_ID}} | {{DATA_OR_RER_ID}} | {{TEST_ID}} |
| UX-{{ID}} | {{FR_ID}} | {{DATA_OR_RER_ID}} | {{TEST_ID}} |

## 17. UX Acceptance Criteria

- [ ] Primary users can complete each core flow without hidden or undocumented navigation.
- [ ] Every screen defines empty, loading, error, confirmation, and recovery behavior where applicable.
- [ ] Core workflows pass desktop and mobile width checks.
- [ ] Keyboard, labels, focus, and non-color status requirements pass the agreed baseline.
- [ ] Save and local-storage state is understandable.
- [ ] Destructive actions are deliberate and cancel safely.
- [ ] Mechanical results remain clear without forced narrative prose.
- [ ] No unapproved official art, icons, copied layout, screenshots, or trade dress is required.

## 18. Open Questions

| ID | Question | Owner | Decision point | Status |
|---|---|---|---|---|
| OQ-001 | {{QUESTION}} | {{OWNER}} | {{DATE_OR_MILESTONE}} | Open |
| OQ-002 | {{QUESTION}} | {{OWNER}} | {{DATE_OR_MILESTONE}} | Open |

## 19. Approval

| Role | Name | Decision | Date | Notes |
|---|---|---|---|---|
| Product Owner | {{NAME}} | Pending / Approved / Rejected | {{DATE}} | {{NOTES}} |
| UX Lead | {{NAME}} | Pending / Approved / Rejected | {{DATE}} | {{NOTES}} |
| Technical Lead | {{NAME}} | Pending / Approved / Rejected | {{DATE}} | {{NOTES}} |
| QA Reviewer | {{NAME}} | Pending / Approved / Rejected | {{DATE}} | {{NOTES}} |
| Content / Licensing Reviewer | {{NAME}} | Pending / Approved / Rejected | {{DATE}} | {{NOTES}} |
