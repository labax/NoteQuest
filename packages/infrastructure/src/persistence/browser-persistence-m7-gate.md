# Browser Persistence Cases Deferred to the M7 Gate

## Status and boundary

Issue #71 subtask 5 records this deferral; it does not claim that the M7 browser persistence gate
has run or passed. M4 establishes deterministic behavior in Node with Dexie and fake IndexedDB:
schema/store wiring, repository error translation, atomic action abort, bounded protected snapshots,
and recovery selection. Those checks are suitable for pull-request CI, but they cannot certify a
browser engine's quota policy, lifecycle termination, eviction, private mode, or multi-context
IndexedDB behavior.

M7 gate execution must use only project-owned synthetic fixtures. It must never copy a real player
save, private note, personal identifier, source-game prose, art, screenshot, layout, or trade dress.

## Deferred browser-only matrix

| Case                                                      | Why M4 automation is insufficient                                                                                                            | M7 setup and required evidence                                                                                                                                                                                          | Passing signal                                                                                                                                                  |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Native IndexedDB open, commit, abort, and reopen          | Fake IndexedDB does not certify each browser's native transaction scheduling or durability.                                                  | Run the empty, valid, abort, and recovery fixtures in every supported browser version; record browser/OS version, fixture ID, database version, and canonical before/after state.                                       | Committed data survives reopen; injected/forced abort retains the prior canonical state and never reports success.                                              |
| Abrupt page/process termination during a write            | Node cannot reproduce tab discard, mobile process kill, browser crash, or OS suspension.                                                     | Terminate at the available pre-transaction, post-write, and pre-receipt phases; reopen from a clean application launch and capture the classified result.                                                               | State is either the complete prior revision or the complete committed revision; no partial revision, reroll, or false success appears.                          |
| Quota estimate, pressure, and native `QuotaExceededError` | Browser quota is dynamic and profile/device dependent; the M4 quota fixture and fault kind are deterministic placeholders only.              | Use caller-scaled synthetic large fixtures, record `navigator.storage.estimate()` availability and bands, approach a disposable profile's safe test limit, and force/observe a native denial where the harness permits. | Warning copy does not claim false precision; denial preserves prior-valid state, blocks unsafe continuation, and offers the approved backup/recovery route.     |
| Persistent-storage request and eviction                   | Persistence grants and eviction policy are browser/platform decisions unavailable to fake IndexedDB.                                         | Record `navigator.storage.persisted()`/`persist()` support and result in normal tab and installed modes; exercise documented disposable-profile eviction/storage-clear procedures.                                      | Capability is reported truthfully; loss is detected without silent reset, and unaffected/exported synthetic data is handled as specified.                       |
| Private/incognito and restricted storage                  | Availability and lifetime differ by browser and policy configuration.                                                                        | Perform a real application-owned write, reload, and close/reopen check in private/restricted contexts without assuming API presence implies durability.                                                                 | The application does not promise durability before the write check and presents a truthful restricted/unavailable state when persistence cannot be relied upon. |
| Multi-tab writer, blocked open, and `versionchange`       | Native connection ownership, locking, and upgrade blocking require multiple browser contexts.                                                | Open two controlled clients for one synthetic slot; overlap writes, hold an old-version connection, and capture blocked/version-change handling.                                                                        | Per-slot ordering/revision guards prevent lost updates; upgrade blocking is actionable; no deadlock, cross-slot damage, or partial migration occurs.            |
| Real schema upgrade and browser restart                   | The current M4 schema has only a reserved 1-to-2 registration point; no concrete migration is implemented.                                   | When an approved migration exists, create data with the prior released serializer, upgrade sequentially in each browser, restart, and validate the pre-migration snapshot and canonical result.                         | Upgrade is sequential and idempotent; interruption retains the old state or approved recovery point; unsupported-newer data stays isolated.                     |
| Service-worker update with active IndexedDB state         | Fake IndexedDB and unit tests do not model worker/client lifecycle or mixed cached releases.                                                 | In tab and installed PWA modes, stage an update while a synthetic save, recovery, import, or migration state is active; test offline restart and explicit safe activation.                                              | No automatic unsafe activation occurs; compatible state reopens after update; failed activation leaves the prior release and data usable.                       |
| Large-save latency and responsiveness                     | Object counts are deterministic in M4, but transaction time, memory pressure, and main-thread behavior are device/browser properties.        | Run approved small/representative/large scales on the browser/device matrix and record fixture counts, serialized size, commit/reopen/recovery timings, long tasks, and environment.                                    | The then-approved M7 budgets pass with no partial save or unresponsive required recovery control.                                                               |
| Cross-browser portability                                 | Internal rows can be tested locally, but browser-to-browser file production, download, selection, and round-trip require real platform APIs. | After import/export APIs exist, export a synthetic fixture in one supported browser and validate/import it in each other family using disposable slots.                                                                 | Canonical state and required versions/hashes round-trip; private-data warnings appear; failure leaves the target unchanged.                                     |

## Execution and evidence rules

1. Use the supported browser/version and representative mobile/desktop matrix frozen for the M7 run;
   record exact browser, OS, device, display mode, storage mode, and build identifier.
2. Use unique application-owned test databases or disposable browser profiles. Reset only
   application-owned synthetic data and verify isolation before and after each case.
3. Record the fixture builder and explicit scale options. Do not label an object count as a byte quota
   or a timing from one environment as cross-browser certification.
4. Capture canonical state before the action and after reopen/recovery, plus the displayed commit
   classification. Redact paths or browser metadata if they could identify a tester.
5. A partial write, silent reset, false success, cross-slot mutation, unrecoverable required loss, or
   use of real/private data fails the gate. A missing browser capability must produce the approved
   truthful fallback; it is not silently counted as a pass.
6. Track failures with reproducible synthetic fixture parameters. Release-gate coverage may not be
   removed merely because a browser case is flaky; follow the project's gate-test quarantine policy.

## Not completed by this subtask

This record schedules evidence; it adds no Playwright/browser harness, quota estimator, concrete
migration, import/export implementation, performance budget, device certification, or gate result.
Those require their supporting APIs and the frozen M7 execution environment. The remaining issue #71
subtask is not marked complete here.
