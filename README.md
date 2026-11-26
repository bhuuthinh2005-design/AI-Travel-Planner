# AI Travel Planner

Group trip planner for Ho Chi Minh City (class project CSC13114, class 23KTPM1). An agent builds a
schedule and spending plan through tools; plain code computes cost and validates.
Data credits: OpenStreetMap, Wikimedia, Open-Meteo.

## Quick start

```bash
git clone <repo-url> && cd ai-travel-planner
npm ci            # Node 22, see .nvmrc
npm run check     # lint + format check + type check + tests
```

## Checks: one command each (CI runs exactly these)

| Check        | Command                | CI job      |
| ------------ | ---------------------- | ----------- |
| Lint         | `npm run lint`         | `lint`      |
| Format check | `npm run format:check` | `format`    |
| Type check   | `npm run typecheck`    | `typecheck` |
| Tests        | `npm test`             | `test`      |
| All of them  | `npm run check`        | (all jobs)  |

`npm run format` rewrites files to the Prettier style. `main` is protected: the four jobs above are
required status checks, so a pull request cannot merge while any of them is red.

## Contract

`docs/contract/save-plan.md` specifies `POST /api/plans/{planId}/save`. Contract tests live in
`tests/contract/` and run in the `test` job.

## Secrets and model cost

- Copy `.env.example` to `.env`; never commit it. Keys stay on the server, never in the browser bundle.
- Model: **TODO(team): provider and model name**. Monthly spending cap on the API key:
  **TODO(team): amount, set in the provider console**. Cost of one plan: **TODO(team): measured in PA#3**.
- Assistant permissions: `docs/PERMISSIONS.md`. Rules for the assistant: `CLAUDE.md`.
