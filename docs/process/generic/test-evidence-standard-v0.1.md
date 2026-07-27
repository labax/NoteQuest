# Generic Test Evidence Standard

## Generic Game Adaptation Process

*Version 0.1 | Standard | Prepared for reuse across rules-first game adaptation projects*

| Field | Value |
|---|---|
| Document owner | QA Lead or Technical Lead |
| Review partners | Product Owner, Technical Lead, UX Reviewer, Content/Licensing Reviewer |
| Process scope | Evidence required for issues, pull requests, milestones, and releases |
| Related documents | `release-readiness-checklist-v0.1.md`, `rules-extraction-taxonomy-v0.1.md`, `backlog-generation-playbook-v0.1.md`, `source-material-intake-and-rights-matrix-v0.1.md` |

## Purpose

This standard defines what counts as acceptable evidence that a game adaptation change works as intended. It is designed for projects that convert tabletop, solo, or rules-first source material into software.

Use this document when creating issues, writing agent prompts, reviewing PRs, closing work, and deciding release readiness.

## Evidence Principles

- Evidence must be tied to the behavior being claimed.
- Evidence must distinguish automated checks from manual checks.
- Evidence must call out skipped checks and unavailable tooling.
- Evidence must include deterministic examples for rules and randomizers whenever feasible.
- Evidence must avoid copying protected source prose into test names, fixtures, snapshots, or screenshots unless approved by the rights matrix.
- Evidence must be understandable by a reviewer who did not implement the change.

## Evidence Types

| Evidence type | Use for | Minimum contents |
|---|---|---|
| Unit test | Pure functions, rules helpers, transforms, validation | Command, test file, tested cases |
| Integration test | Feature flows across modules or state stores | Command, setup, expected result |
| Deterministic fixture | Dice, tables, procedural generation, simulations | Seed or fixed inputs, expected outputs, source mapping |
| State replay | Save/load, undo/redo, progress, journal or campaign state | Initial state, operations, final state |
| UI test | User-facing interactions | Browser or component command, target flow |
| Screenshot or screen recording | Visual layout, responsive UI, key release state | Viewport, route, scenario, artifact path or PR attachment |
| Manual check | Behavior not yet automated | Steps performed, result, tester, date |
| CI result | Repository-wide checks | Workflow name, commit, result, failure summary if any |
| Content audit | Source-derived text, tables, art, names, or branding | Matrix IDs, approval status, reviewer |
| Migration check | Data schema or persistence changes | Before state, migration path, after state |
| Performance check | Heavy simulation, generation, rendering, import/export | Scenario, measurement, threshold or observation |

## Evidence by Change Type

| Change type | Required evidence | Recommended evidence |
|---|---|---|
| Rules logic | Unit tests and deterministic fixtures | State replay and boundary cases |
| Random table or generator | Seeded fixture tests | Distribution or spot-check notes |
| Data model | Unit tests or schema validation | Migration and compatibility checks |
| Persistence | Save/load tests | State replay and manual recovery check |
| UI workflow | Manual or UI test evidence | Screenshots for key states |
| Accessibility | Manual checks | Automated lint or browser checks |
| Content import | Content audit and sample validation | Round-trip import/export checks |
| Licensing/content change | Rights matrix evidence | Reviewer sign-off link |
| Documentation-only | Markdown review | Link and rendering check |
| Build/config/deploy | CI or command output | Smoke test after deployment |

## Issue Evidence Requirements

Each implementation issue should define expected evidence before work begins.

| Issue field | Required content |
|---|---|
| Behavior under test | What must be proven |
| Minimum automated checks | Unit, integration, fixture, or none with reason |
| Minimum manual checks | User flow, source review, content audit, or none with reason |
| Fixture requirements | Seeds, input states, expected outputs, or source IDs |
| Rights evidence | Matrix item IDs for included source-derived content |
| Acceptance evidence | What must appear in the PR description before closure |

## PR Evidence Block

Use this block in PR descriptions when the repository does not already provide a stricter template.

```markdown
## Test Evidence

- Automated checks:
  - `{{COMMAND}}` - `{{PASS|FAIL|SKIPPED}}` - `{{SUMMARY}}`
- Manual checks:
  - `{{SCENARIO}}` - `{{PASS|FAIL|SKIPPED}}` - `{{SUMMARY}}`
- Fixtures:
  - `{{FIXTURE_ID_OR_PATH}}` - `{{WHAT_IT_PROVES}}`
- Screenshots or recordings:
  - `{{ARTIFACT_LINK_OR_PATH}}` - `{{VIEWPORT_OR_SCENARIO}}`
- Rights/content review:
  - `{{MATRIX_ITEM_IDS}}` - `{{APPROVED|NOT_APPLICABLE}}`
- Skipped checks:
  - `{{CHECK}}` - `{{WHY_SKIPPED}}` - `{{RISK}}`
```

## Deterministic Fixture Standard

Rules-first games often include randomizers. Tests must make random behavior inspectable.

A deterministic fixture should include:

- Fixture ID or filename
- Fixed inputs
- Seed or fixed roll sequence
- Starting state
- Expected output or final state
- Relevant rule domain
- Source material reference by internal source ID, not copied prose
- Any accepted deviation from source behavior

Avoid fixtures that only assert that output exists. Prefer fixtures that prove a specific rule, table lookup, boundary condition, or state transition.

## Fixture Naming

Recommended pattern:

```text
{{domain}}.{{behavior}}.{{case}}.fixture
```

Examples:

- `combat.damage.minimum.fixture`
- `oracle.lookup.seeded-result.fixture`
- `save-load.inventory-roundtrip.fixture`
- `progress.failure-boundary.fixture`

Use product terms only when the Product Profile and Glossary authorize them.

## Manual Evidence Standard

Manual checks are acceptable when automation is not yet practical, but they must be specific.

| Field | Required |
|---|---|
| Tester | Name, role, or automation agent |
| Date | `YYYY-MM-DD` |
| Environment | Browser, OS, device, build, or commit |
| Scenario | Exact flow or state checked |
| Steps | Short numbered list |
| Expected result | What should happen |
| Actual result | What happened |
| Outcome | Pass, fail, skipped, or blocked |
| Follow-up | Issue or note if not clean |

## Screenshot and Visual Evidence Standard

Screenshots are required for meaningful user-facing layout changes unless the PR is documentation-only or the repository has a stronger visual test suite.

Screenshot notes should include:

- Route or screen name
- Scenario or data state
- Viewport size
- Theme or accessibility setting if relevant
- Commit or PR number
- Known visual limitations

Do not rely on screenshots for rules correctness. Pair visual evidence with behavioral tests when the UI changes rules state.

## CI Evidence Standard

Record the following for CI evidence:

- Workflow name
- Commit SHA or branch
- Status
- Failed job name, if any
- Whether failure is related to the change
- Rerun status, if rerun
- Final reviewer conclusion

A failing unrelated check may be accepted only when the risk is recorded and the release owner agrees.

## Skipped Check Rationale

Skipped checks must state:

- The skipped command or evidence type
- Why it could not run
- Whether this is environmental, out of scope, or intentionally deferred
- What risk remains
- What follow-up will close the gap

Do not use `not run` as the whole explanation.

## Content and Rights Evidence

For source-derived content, evidence must reference the Source Material Intake and Rights Matrix.

Required fields:

- Matrix item IDs
- Approval state
- Whether runtime UI contains the content
- Whether tests or fixtures contain source-derived text
- Reviewer or decision owner

Public-facing prose, art, layout, branding, and source tables require stronger review than internal-only mechanic labels.

## Review Checklist

- [ ] Evidence proves the acceptance criteria, not just that commands ran.
- [ ] Automated and manual evidence are separated.
- [ ] Random behavior is deterministic where tested.
- [ ] Skipped checks include a real rationale.
- [ ] Source-derived content has matrix references.
- [ ] Evidence is current for the final commit under review.
- [ ] Documentation-only changes have at least path and rendering review evidence.

## Acceptance Criteria

This standard is ready to use when:

- Issue authors can specify expected evidence before implementation.
- PR authors can summarize completed evidence consistently.
- Reviewers can identify missing, stale, or weak evidence.
- Release readiness reviews can consume the evidence without re-investigating every PR.
- The standard does not assume a specific test framework, stack, branch model, or product name.
