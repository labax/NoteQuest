# PWA Dependency Security Assessment — 2026-07-28

## Scope and result

This review covers the dependency graph added for issue #75: `vite-plugin-pwa`, `workbox-build`,
the Workbox runtime modules, and their transitive packages. The final full `npm audit --json`
result is zero known vulnerabilities at every severity. `npm run security:audit` repeats the
registry-backed High-severity gate.

## High findings assessed

| Advisory / audit finding                                      | Affected dependency paths                                                                                                                                                                                                                                                                             | Reachability                                                                                                                                                   | Resolution                                                                                                                                                                   |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GHSA-mh99-v99m-4gvg` — `brace-expansion` unbounded expansion | `vite-plugin-pwa@1.3.0 > workbox-build@7.4.1 > @trickfilm400/rollup-plugin-off-main-thread > ejs > jake > filelist > minimatch > brace-expansion`; npm also propagated High status through `minimatch`, `filelist`, `jake`, `ejs`, the off-main-thread plugin, `workbox-build`, and `vite-plugin-pwa` | Build tooling only, but reachable while Workbox processes build inputs. It is not included in emitted `sw.js`. Build-tool reachability means it is not waived. | Pin `vite-plugin-pwa@1.2.0` and Workbox `7.4.0`, replacing the affected `@trickfilm400` path with the reviewed `@surma` path; override `brace-expansion` to patched `5.0.8`. |
| `GHSA-5c6j-r48x-rmvq` — `serialize-javascript` code injection | `vite-plugin-pwa@1.2.0 > workbox-build@7.4.0 > @rollup/plugin-terser > serialize-javascript`                                                                                                                                                                                                          | Build tooling only, but reachable during worker minification. It is not included in emitted `sw.js`. Build-tool reachability means it is not waived.           | Override to patched `serialize-javascript@7.0.5`; production build and artifact verification pass with the compatible API.                                                   |
| `GHSA-qj8w-gfj5-8c6v` — `serialize-javascript` CPU exhaustion | Same `@rollup/plugin-terser` path as above                                                                                                                                                                                                                                                            | Build tooling only and not emitted, but still reachable during minification; not waived.                                                                       | The same `serialize-javascript@7.0.5` override remediates the advisory.                                                                                                      |

No High advisory remains unassessed, so no time-bounded waiver is required. The package-manager
overrides are deliberately narrow and are verified by the full build, generated-worker artifact
inspection, unit suite, and zero-finding audit.

## Repeatable verification

```sh
npm ci
npm audit --json
npm run security:audit
export NOTEQUEST_RELEASE_ID=security-review
npm run build
npm run verify:pwa-artifact
```

Review this assessment whenever the PWA plugin, Workbox, Rollup minifier, or either override changes.
