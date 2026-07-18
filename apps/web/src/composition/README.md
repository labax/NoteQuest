# Composition root

Owns application wiring for the runnable web app. The composition root may connect UI, application services, infrastructure adapters, and content repositories once those implementations exist.

Conventions:

- Keep constructors and dependency wiring here instead of in React components.
- Import outward-facing indexes only; do not deep-import layer internals without a documented reason.
- Do not add domain rules, persistence semantics, routing decisions, or UI flows in this folder.

Composition tests should verify wiring and smoke behaviour. Layer-specific behaviour belongs in the owning layer's tests.
