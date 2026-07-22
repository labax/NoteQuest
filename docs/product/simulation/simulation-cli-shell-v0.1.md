# Simulation CLI Shell v0.1

The M3 simulation harness starts as a thin Node-executable TypeScript shell around production packages. It validates seed/content manifests, checks requested rules/content/RNG versions, and exercises deterministic production RNG streams for small local smoke runs.

Full Palace generation and large Palace gate execution are intentionally deferred until the generation rules are implemented.

## Local QA sample commands

Validate a seed/content manifest without executing seed smoke draws:

```sh
npm run simulation:cli -- --dry-run --dungeon palace --seed-manifest tests/fixtures/simulation/palace-seed-manifest-small.json --rules-version digital-rules-specification-v0.1 --content-version 0.1.0 --rng-version 1
```

Run a two-seed deterministic smoke path and write JSON plus Markdown reports:

```sh
npm run simulation:cli -- --dungeon palace --runs 2 --seed-manifest tests/fixtures/simulation/palace-seed-manifest-small.json --rules-version digital-rules-specification-v0.1 --content-version 0.1.0 --rng-version 1 --workers 1 --json-output .tmp/simulation-palace-smoke.json --markdown-output .tmp/simulation-palace-smoke.md
```

Show help:

```sh
npm run simulation:cli -- --help
```

## Current placeholder boundary

The current report status is `placeholder-smoke-complete` for execution mode because Palace generation is not implemented in this milestone. The CLI does not claim Palace invariant gate evidence; it only validates manifests and proves that the executable shell can call production domain/content/RNG code deterministically.

## Report outputs

The CLI emits `notequest-simulation-report.v0.1` JSON for machine checks and an optional concise Markdown summary for PR smoke review. Reports include build, rules, content, RNG, seed-manifest identity/hash, selected content manifest entry hash evidence, counts, invariant-failure count/list, termination and reachability placeholders, duration marked as runtime metadata, environment metadata, and deterministic smoke results. Omit `--json-output`/`--output` to print JSON to stdout, including when `--markdown-output` is supplied on its own; use `--json-output` and `--markdown-output` together to write both report files and keep stdout as a concise status message. The legacy `--output` flag remains an alias for JSON output.
