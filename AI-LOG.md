# AI-LOG

One entry per use of an AI tool. "Changed" = what we altered in its output; "Rejected" = what we did
not use and why. Written in English. Entries marked TODO are for the team to complete from what
actually happened; do not leave a TODO in the submitted version.

## Entry 1: repository scaffold, checks, CI, contract, tests

- **Tool:** Claude (Sonnet 5.5) through the Claude desktop app, run against the local repo folder.
- **Used for:** Next.js + TypeScript scaffold; ESLint/Prettier/tsc/Vitest scripts; the four-job CI
  workflow; `CLAUDE.md`; `.claude/settings.json` permission tiers; the contract
  `docs/contract/save-plan.md`; the route handler, validator and contract tests for
  `POST /api/plans/{planId}/save`.
- **Prompt (summary):** the class brief and the PA#2 rubric were given as files; the team chose
  TypeScript + Next.js and the save endpoint.
- **Changed:**
  - First install pinned `eslint@9` next to the newest `typescript-eslint`; npm refused with an
    `ERESOLVE` peer conflict. We installed without the pin (ESLint 10) instead of using
    `--force`/`--legacy-peer-deps`.
  - Vitest warned that `vitest.config.ts` was ESM loaded as CommonJS; renamed to `vitest.config.mts`.
  - Permissions: the first draft denied all edits under `tests/` and `.github/workflows/`. That would
    also block writing new tests, so both moved to "ask first" (see `docs/PERMISSIONS.md`).
  - README `TODO(team)` fields (model, spending cap, cost per plan) are for us to fill: the
    assistant cannot know them.
- **Rejected:**
  - `eslint-config-next` for lint: its flat-config support lagged ESLint 10 and would have cost time
    for little value this checkpoint; plain `typescript-eslint` recommended rules are used.
  - A `--force` / `--legacy-peer-deps` install to get past the `ERESOLVE` error.
  - Storing "failed" save attempts as idempotent results: a retry after a fix must be judged against
    the current plan, so only successful saves are recorded (contract section 6).
- **How we checked:** `npm run check` locally (lint, format check, type check, 25 contract tests); CI
  on GitHub (links in `PA2.md`).

## Entry 2: TODO (CI that could not fail / red PR / deliberate break)

- **Tool:** TODO
- **Used for:** TODO: e.g. writing the demonstration PRs
- **Changed:** TODO: what happened for real in the blocked PR and the deliberate-break PR
- **Rejected:** TODO

## Secrets

- No secret has been committed. `.env` is git-ignored; `.env.example` has no values.
- TODO(team): if a key ever appeared in the history, say here that it was rotated and when.
