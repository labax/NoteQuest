# Developer notes

Use the root package scripts for local setup and verification so contributor workflows stay aligned with CI and story prompts.

## Local setup

1. Install the repository toolchain versions declared in `package.json` (`node` 24.15.0 and `npm` 11.4.2).
2. Install dependencies from the lock file:

   ```sh
   npm ci
   ```

3. Start the local web app when interactive development is needed:

   ```sh
   npm run dev
   ```

## Verification commands

Run the checks that match the change before opening a PR. For implementation stories, prefer the full `verify` script unless the issue scopes a smaller set.

- `npm run format` — apply Prettier formatting to repository source and documentation files.
- `npm run format:check` — verify formatting without writing changes.
- `npm run lint` — run ESLint static checks across the TypeScript and React scaffold.
- `npm run typecheck` — run TypeScript with the repository strict settings and no emit.
- `npm test` — run the Vitest unit and architecture tests.
- `npm run test:ci` — run the Vitest suite using the CI alias.
- `NOTEQUEST_RELEASE_ID=local-<unique-id> npm run build` — run the strict typecheck and build the
  production Vite web app with a truthful local release/cache identity.
- `NOTEQUEST_RELEASE_ID=<same-build-id> npm run verify:pwa-artifact` — inspect the built worker for
  matching release metadata, approved precache entries, complete HTML shell coverage, controlled
  activation, and absent public source maps.
- `NOTEQUEST_RELEASE_ID=local-<unique-id> npm run verify` — run the baseline local verification
  sequence, including a production build, with the same truthful release identity contract.
- `npm run security:audit` — query the full dependency audit and fail for High/Critical findings;
  see `docs/pwa-dependency-security-assessment-2026-07-28.md` for the reviewed PWA paths.

Keep these command names stable for M1 CI and future implementation stories unless a replacement is documented in the relevant issue.

## Service-worker smoke verification

The development server may use the reserved `development` identity and does not register the
production service worker. Production builds reject that identity. To verify the generated precache
and repeat-launch boundary, choose a unique local ID and run
`NOTEQUEST_RELEASE_ID=local-smoke-<unique-id> npm run build`, followed by `npm run preview`, then:

1. Open the preview URL in a fresh browser profile and confirm that `sw.js` is registered and that
   the Workbox precache contains the emitted HTML and hashed JavaScript/CSS shell files.
2. Reload once while online so the installed worker controls the page, switch the browser network
   setting to offline, and reload. The existing static shell should launch without a network request.
3. Build a different `NOTEQUEST_RELEASE_ID`, reload online, and confirm the new worker remains in
   the waiting state. It must not replace the controlling worker until project-owned code sends the
   activation message after an explicit safe-state decision.
   The previous release cache is intentionally retained; cache retirement belongs to the later
   post-activation compatibility/smoke boundary rather than worker installation or activation.
4. Reset only the PWA layer with the browser Application panel: close every other tab or installed
   app window for the origin, unregister each service-worker registration, and delete Cache Storage
   entries prefixed `nq-`. Reload while online and confirm a fresh worker and shell cache are created.
   Do **not** use “Clear site data” for a routine worker reset: it also removes IndexedDB saves.
5. If a full origin reset is specifically required, first export any needed synthetic save, use a
   disposable browser profile, clear site data, and confirm IndexedDB and Cache Storage are empty.
   Never perform destructive reset verification in a real play profile.

The worker precaches build-owned static bytes only. IndexedDB saves, exports, player-authored notes,
and other private play data are not Cache Storage inputs.

Waiting workers start in the update coordinator's conservative `safe-point-unverified` state. The
coordinator never activates automatically when safety later becomes ready: project-owned code must
provide a durable save-point snapshot with no pending command, migration, import, recovery,
blocking workflow, or unsaved work, and a separate explicit activation request is still required.
Connecting those live operation signals and the user-facing reload choice belongs to the remaining
service-worker story subtasks; do not replace the conservative default with UI inference.

The build-time artifact verifier is programmatic evidence only; it cannot prove browser-controlled
registration, Cache Storage writes, or an offline reload. This repository does not yet configure a
browser runner, so perform steps 1–3 above in the required browser matrix and retain the result as
manual smoke evidence until browser automation is added by a separately scoped issue.

## Code and content boundary

Executable application logic belongs in the app and package workspaces. Bundled structured content and asset metadata belong under `packages/content/` or a future approved content-package location, with validation and manifests rather than hidden rule logic.

Do not add runtime save data, user-authored notes, UI components, persistence adapters, or domain rule implementations to content packages. Content definitions may parameterise approved mechanics, but new mechanics or exceptions must be approved in the product documents before implementation.

Future content work must include provenance and manifest evidence before public release. At minimum, expect stable IDs, versioning, source/provenance references, licence or permission status, restrictions, attribution needs, approval status, and integrity metadata to be tracked by the content manifest once that tooling exists.

## Licence-boundary placeholder

The project has not made a final public licence or legal-notice decision. Treat project-original code and bundled content/assets as separate concerns: code may be authored in this repository, while content and asset inclusion remains gated by provenance, permissions, notices, and content-review approval.

Until the final licence and notice wording are approved, do not assume that permission to implement mechanics also permits copying protected text, images, layout, logos, or other presentation elements.

## Blocked content and trade-dress restrictions

Do not add unapproved exact NoteQuest source prose, official table text, artwork, screenshots, logos, copied page or character-sheet layout, visual borders, typography, icons, trade dress, or lookalike presentation assets.

Developer-facing notes, tests, placeholders, and fixtures should use project-original wording and synthetic examples unless an issue explicitly provides approved source material and its required provenance.

## PR checklist for implementation issues

Before requesting review, confirm:

- [ ] The change stays within the designated issue scope and does not introduce out-of-scope gameplay, content, deployment, or release behaviour.
- [ ] Local setup or verification command changes are documented here and reflected in CI if required.
- [ ] Code, structured content, runtime state, and tests remain in their intended workspace boundaries.
- [ ] Any bundled content or asset addition has manifest/provenance evidence, approval status, and no blocked item.
- [ ] No unapproved exact source prose, artwork, screenshots, logos, copied layout, or trade dress was introduced.
- [ ] Relevant local checks were run, or skipped checks are listed with exact reasons.

## Reference documents

Use these documents for the controlling requirements instead of duplicating their full contents here:

- Product/documentation process: `docs/product/documentation-development-governance-process-v0.1.md`
- Implementation decisions and baselines: `docs/product/implementation-release-decision-register-v0.3.md`
- Content and licensing requirements: `docs/product/content-licensing-requirements-v0.1.md`
- Architecture and offline hosting plan: `docs/product/web-architecture-offline-hosting-plan-v0.1.md`
- Acceptance criteria and test plan: `docs/product/acceptance-criteria-test-plan-v0.1.md`
