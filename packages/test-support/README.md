# Test support package

Owns shared test builders, synthetic fixtures, and assertion helpers once multiple packages need them.

Allowed dependencies:

- Public package APIs needed to build tests.
- Project-original synthetic data only.

Forbidden dependencies:

- Production-only runtime wiring from `apps/web`.
- Unapproved NoteQuest source prose, tables, art, screenshots, copied layout, trade dress, or licensed content fixtures.
- Duplicated domain rules that diverge from `@notequest/domain`.

Tests for helpers live beside helper modules as `*.test.ts`. Package consumers should keep behaviour tests in the owning package or app.
