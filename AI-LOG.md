# AI-LOG

One entry per use of an AI tool. "Changed" = what we altered in its output; "Rejected" = what we did
not use and why. Written in English.

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

## Entry 2: demonstration PRs, history clean-up

- **Tool:** Claude (Sonnet 5.5), same app, used as a guide for the GitHub steps (we did them ourselves).
- **Used for:** preparing the two demo branches (`demo/red-gate`, `demo/contract-break`), each as a failing commit
  followed by a fixing commit, and the order of pushes.
- **Changed:**
  - The assistant first suggested pushing each branch whole. We pushed the failing commit alone first
    (`git push origin <branch>~1:refs/heads/<branch>`), waited for the red run, then pushed the fix, so
    the red run exists as evidence (PR #1 run 45812877604, PR #2 run 45817071830).
  - Before protection and before any PR, we rewrote the local history once (and force-pushed) to remove
    `Co-Authored-By` trailers and set the author email. The rewrite happened before the demo PRs existed, so it
    does not affect criteria 4 and 6. This log is the record of AI use instead of the trailers.
- **Rejected:**
  - Pushing both commits of a demo branch at once: CI would only have shown green.
  - Editing a test or CI to turn the break green: the fix reverted the code, the contract and tests were untouched.
- **How we checked:** Actions runs and the ruleset JSON (`/rulesets/28160483`) list the four required checks.

## Secrets

- No secret has been committed. `.env` is git-ignored; `.env.example` has no values.
- A scan of the full git history for key-like strings found nothing. No key has been rotated because none was exposed.
