# Focus and announcement foundations

These helpers are presentation infrastructure. They do not replace visible status, validation
messages, labelled dialogs, or gameplay state.

## Focus

- Call `focusTarget(destinationHeading)` after a route commits. The helper adds `tabindex="-1"`
  when the target is not naturally focusable.
- Call `focusValidationError(form, summary)` when submission fails. Pass the visible linked error
  summary when one exists; otherwise the first control with `aria-invalid="true"` is focused.
- Call `focusBlockingError(summary)` for a visible blocking-error summary.
- Call `containFocus(dialog, { initialFocus, invoker })` after a labelled dialog or responsive
  sheet opens. Call `deactivate()` when it closes to remove containment and restore the invoker.
  `useContainedFocus` provides the same lifecycle for React. Initial targets must be visible,
  enabled, and in the normal tab sequence; otherwise entry falls back to the first usable control
  and then the container. Radio groups use their checked member, or their first enabled member when
  none is checked. An unavailable ancestor prevents entry until the tree is available and
  containment is activated again. Always provide an explicit close.

DOM order remains the keyboard order. Do not use positive `tabindex` values to rearrange it.

## Announcements

Create one `AnnouncementService` for a shell and mount one `AnnouncementRegions` beside its visible
content. Announce concise transitions using `saving`, `saved`, `failed`, `offline-ready`, `update`,
`route`, or `blocking-error`. Failed and blocking states are assertive; the other categories are
polite. Identical consecutive category/message pairs are suppressed.

Keep persistent save, offline, update, validation, and error text visible. Announce the transition,
not every render or progress tick. Route focus and a short route announcement may coexist; gameplay
results belong in later domain-specific presentation work rather than this foundation.
