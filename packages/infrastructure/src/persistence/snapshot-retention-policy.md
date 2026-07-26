# Protected snapshot retention policy

NoteQuest retains a bounded recovery set for each save slot: at most one `last-valid`,
`pre-migration`, `pre-import`, and `pre-reset` snapshot. These application-owned snapshots
are recovery points, not time-travel history, and do not include or manage user export files.

A candidate must have valid metadata and pass the caller's complete-state validation after it
has been written and read back inside the same IndexedDB transaction. Only then may it replace
the prior member of its class. A failed write or validation aborts the transaction, leaving the
old snapshot and slot pointer unchanged. Replacements must have a newer source revision;
`pre-migration` additionally requires confirmation that the prior migration was verified.

The `last-valid` pointer and recovery flag are updated in the snapshot transaction. Lookups use
the compound slot/class key, and recovery listing performs four bounded key reads, so snapshots
from another slot cannot be selected accidentally. Migration, import, reset, and full recovery
orchestration remain follow-up work; their protected classes are available to those workflows.

## Successful safe commits

When an action has a complete validated recovery package, it supplies that package with the
action commit envelope. The transaction coordinator requires a `last-valid` package to identify
the revision being committed, rejects duplicate classes and stale replacements before mutation,
and reads each package back before updating slot metadata. State records, events, snapshot, and
the recovery pointer therefore become visible together or all remain unchanged. Constructing a
complete package from partial changed-record sets remains the application use case's
responsibility; the coordinator does not invent a snapshot that could omit unchanged state.

## Recovery selection

Selection is an inspection-only operation. Callers choose an explicit protected class and provide
the schema versions they support plus complete-state validation. The service reads the slot and
the compound slot/class snapshot together, rejects future-revision, incompatible, or invalid
candidates, and returns the selected package without changing active state. The recoverable list
uses the same checks for each of the four bounded classes; it never treats mere row presence or a
previously stored recovery flag as proof that a package remains usable. User-facing restore
orchestration and recording the recovery outcome remain later recovery-workflow subtasks.

## Restore foundation

The infrastructure restore path activates only a selected snapshot containing a complete,
slot-owned record package. Compatibility, revision, package shape, duplicate keys, and caller
validation are checked again inside the write transaction. It replaces only records owned by the
target slot, advances that slot revision, and leaves the protected source snapshot intact.

When the caller identifies the current state as invalid, the path first copies its slot metadata
and records into the inactive staging row `slot.<slotId>.recovery-failed-source`. That fixed key
keeps preservation bounded to one failed source per slot rather than creating automatic history.
Any validation or storage failure leaves active records, slot metadata, and the prior staged source
unchanged. Recovery-event recording, user confirmation, comparison views, and cleanup decisions
remain follow-up workflow and UX work.
