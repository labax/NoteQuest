# Developer notes

Use the root package scripts for local verification so contributor workflows stay aligned with CI and story prompts.

## Verification commands

- `npm run format` — apply Prettier formatting to repository source and documentation files.
- `npm run format:check` — verify formatting without writing changes.
- `npm run lint` — run ESLint static checks across the TypeScript and React scaffold.
- `npm run typecheck` — run TypeScript with the repository strict settings and no emit.
- `npm run build` — run the strict typecheck and build the production Vite web app.
- `npm test` — run the Vitest unit and architecture tests.
- `npm run verify` — run the baseline local verification sequence expected before review.

Keep these command names stable for M1 CI and future implementation stories unless a replacement is documented in the relevant issue.
