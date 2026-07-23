# NoteQuest PR and Issue Workflow

Date: 2026-07-23

This document describes the current NoteQuest process for creating pull requests, evaluating them, requesting Codex fixes, merging accepted work, closing issues, and updating related tracker issues.

## Scope

This workflow applies to the `labax/NoteQuest` GitHub repository.

Use it for:

- Implementation PRs linked to milestone child issues.
- Review and re-review of updated PRs.
- Codex fix-prompt comments on PRs.
- Post-merge issue closure and epic tracking updates.
- Release-forward PRs from `develop` to `main`.

The repository uses `develop` and `main`. It does not use `development` or `master`.

## Branch and Release Model

| Purpose | Source | Target | Notes |
| --- | --- | --- | --- |
| Feature or story work | Codex-created feature branch | `develop` | PR should link to the relevant issue. |
| Milestone release | `develop` | `main` | Used after a milestone or epic is complete. |

Before creating or reviewing a release-forward PR, confirm that the exact branch names exist. If the user says `development` or `master`, verify the repo refs and map to `develop` and `main` only when those are the actual repository branches.

## Issue Structure

NoteQuest work is tracked using milestone epics and child story issues.

Current known pattern:

- Epic issues represent milestones, for example M3 was epic `#33` and M4 is epic `#34`.
- Child stories are linked from the epic body, usually as checklist items.
- Each child issue contains deliverable scope, acceptance criteria, test requirements, and sometimes dependency or handoff notes.
- When a child issue is completed, only delivered items should be checked off. Do not mark future or deferred work as complete.

Recent examples:

| Work | PR | Result |
| --- | --- | --- |
| Issue `#63` Palace simulation deterministic report output | PR `#136` | Merged to `develop`; issue closed. |
| Issue `#64` Palace simulation smoke failure traces | PR `#137` | Merged to `develop`; issue closed; M3 epic closed. |
| M3 release-forward | PR `#138` | `develop` to `main`; created and reviewed cleanly. |

## Creating an Implementation PR

When asked to create or identify a PR for an issue:

1. Resolve the issue number and confirm the repository.
2. Inspect the issue body for scope, acceptance criteria, and test requirements.
3. Check whether an open PR already links to the issue.
4. If creating a PR, use the feature branch produced for that issue and target `develop`.
5. Title the PR clearly around the issue deliverable.
6. Include the issue reference in the PR body, using a closing keyword only when it is appropriate for merge to close the issue.
7. Confirm the PR is visible, open, and points to the expected head branch.

Do not assume a PR number from the issue number. PR numbers have drifted during this project, so always resolve the active PR from GitHub.

## Reviewing a PR

Use a code-review stance by default.

Review goals:

- Find bugs, behavioral regressions, missed acceptance criteria, and missing or weak tests.
- Check the diff against the linked issue, not against unstated improvements.
- Verify that the PR preserves already established contracts from previous issues.
- Separate code correctness from CI or deployment health.

Review steps:

1. Pin the PR head SHA.
2. Confirm the base branch and target branch.
3. Read the PR title, body, linked issue, changed files, and full patch.
4. Check branch compare state:
   - ahead/behind count
   - mergeability
   - conflict risk
5. Inspect review threads and existing comments.
6. Check GitHub Actions for the exact head SHA.
7. Check Cloudflare preview status when present.
8. Review changed code and tests.
9. Report findings first, ordered by severity.

Review output format:

```md
**Findings**
- **High** - [path/to/file.ts](https://github.com/...#L123): Describe the concrete bug, why it matters, and what behavior is broken.
- **Medium** - [path/to/file.ts](https://github.com/...#L456): Describe the second issue.

**Checks**
PR #NN is open/mergeable, X commits ahead, Y behind.
GitHub Actions status: ...
Cloudflare preview status: ...
Review threads: ...

Merge recommendation: ...
```

If no issues remain, say that directly:

```md
**Findings**
No findings remain on PR #NN.

**Checks**
...
```

## Severity Guidance

| Severity | Use When |
| --- | --- |
| High | The PR breaks required behavior, fails required CI, cannot be reproduced, loses data, or fails acceptance criteria. |
| Medium | The PR satisfies core behavior but misses important reviewer evidence, report detail, edge-case handling, or test coverage. |
| Low | Minor maintainability, clarity, or non-blocking follow-up issue. |

CI failures that block required checks are treated as High until fixed.

## Re-reviewing an Updated PR

When the user says the PR has been updated:

1. Re-fetch the PR metadata.
2. Pin the new head SHA.
3. Compare against the last reviewed head.
4. Re-check only prior findings plus any new regressions introduced by the patch.
5. Re-check GitHub Actions and Cloudflare for the new head.
6. State whether prior findings are fixed.
7. If CI fails, identify the failing gate and file/line if available.

Do not rely on old CI results after the branch moves.

## Codex Fix Comments

When a PR has findings and the user asks for a Codex comment:

1. Check the PR discussion first.
2. If an existing Codex prompt already covers the same issue, update or avoid duplicating it where possible.
3. Otherwise add one top-level PR comment.
4. Use the repository prompt template:
   - `docs/product/templates/codex_prompt_template.txt`
5. The comment must be a fenced code block.
6. Keep the prompt narrow, actionable, and scoped only to the review findings.
7. Include verification steps in the prompt.
8. Tell Codex to preserve already-fixed behavior.

Example shape:

````md
```text
Use this PR branch and fix only the remaining review blockers.

Findings to fix:
1. ...
2. ...

Constraints:
- Preserve ...
- Do not broaden scope beyond issue #NN.

Verification:
- Run format, lint, typecheck, unit tests, and production build.
- Confirm the specific behavior with a focused test.
```
````

For multi-finding review comments, one clear fenced prompt is usually preferred over several fragmented comments unless the user explicitly asks for separate prompts.

## Merge Readiness Checklist

Before merging a PR:

- PR is still open.
- Current head SHA matches the reviewed clean head.
- PR is mergeable.
- Branch is not behind the target branch, or the divergence has been reviewed and accepted.
- GitHub Actions passed for the exact head SHA.
- Cloudflare preview passed when present.
- No open review threads remain.
- All review findings are resolved.
- The PR still targets the expected branch.

Use an expected-head guard when merging so a moved branch is not merged accidentally.

## Merging a PR

For child-story implementation PRs:

1. Pin the reviewed clean head SHA.
2. Confirm required checks are green.
3. Merge into `develop`.
4. Record the merge commit.
5. Refresh the linked issue and related tracker issue bodies before editing them.

For release-forward PRs:

1. Create or review `develop` to `main`.
2. Confirm the aggregate diff is expected for the completed milestone.
3. Confirm CI and preview are green.
4. Merge only after confirming the milestone is ready for release.

## Closing the Linked Issue

After merging an implementation PR:

1. Refresh the issue body from GitHub.
2. Check off delivered scope, acceptance, and test items.
3. Leave deferred or future work unchecked.
4. Add a short comment with:
   - merged PR number
   - merge commit
   - summary of delivered work
   - verification status
5. Close the issue as completed.

Do not close an issue solely because a PR exists. Close it only after the PR is merged and the delivered checklist is updated.

## Updating Related Issues

After closing a child issue:

1. Update the parent epic checklist to mark that child issue complete.
2. If the child issue completes the final story in an epic:
   - verify all child stories are checked
   - add a completion comment
   - close the epic as completed
3. Add handoff notes to the next dependent issue when relevant.
4. If the next milestone depends on the completed epic, update the next epic with a dependency note.

Recent example:

- After PR `#137` merged, issue `#64` was closed.
- Epic `#33` was updated to mark `#64` complete.
- Epic `#33` was closed because M3 was complete.
- M4 epic `#34` and issue `#65` received handoff notes from M3.

## Handoff Notes

Handoff comments should be short and factual.

Include:

- What was completed.
- Which PR and merge commit delivered it.
- What the next issue can rely on.
- Any relevant output contract, test evidence, or reviewer note.

Avoid adding new scope to the receiving issue unless the issue already implies it.

## Release-Forward PR Review

When moving a completed milestone from `develop` to `main`:

1. Verify there is not already an open `develop` to `main` PR.
2. Compare `develop` against `main`.
3. Create the PR if there are unreleased commits.
4. Review the aggregate diff for milestone-level regressions.
5. Confirm CI and preview.
6. Note included commits and changed files.
7. If clean, report no findings and state that it is mergeable.

If the user requests `development` to `master`, verify the actual branch names first. In the current repo, use `develop` to `main`.

## Standard Final Reports

After adding a Codex comment:

```md
Added the fenced Codex fix prompt to PR #NN:

[PR comment](...)

It covers ...
```

After a clean re-review:

```md
No findings remain on PR #NN.

Checks passed: format, lint, typecheck, unit tests, production build.
Cloudflare preview succeeded.
No review threads are open.
```

After a merge and issue update:

```md
Done. Merged PR #NN into `develop`.

Merge commit: `...`

Closed issue #NN as completed, updated the parent epic checklist, and added handoff notes to the next related issue.
```

## Operating Rules

- Do not overwrite stale issue bodies. Always refresh before editing.
- Do not check off work that was not delivered.
- Do not merge on old CI or old head SHAs.
- Do not assume issue and PR numbers match.
- Do not broaden Codex fix prompts beyond the findings.
- Do not close an epic until every child story is complete.
- Keep review findings concrete, with file and line references when possible.
- Keep user-facing updates concise, but include enough state for auditability.

