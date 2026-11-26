# AI Travel Planner: rules for the assistant

Product: a group trip planner. An LLM agent builds a day-by-day schedule through JSON tools; plain
code computes money and validates. Brief: one wrong plan reaches all members and cannot be recalled.

## Stack

- TypeScript (strict), Next.js 15 App Router, React 19. Node 22 (`.nvmrc`).
- Lint: ESLint 10 + typescript-eslint. Format: Prettier. Types: `tsc`. Tests: Vitest.
- API behaviour is specified in `docs/contract/*.md`; code and tests follow the contract.

## Commands (same locally and in CI)

- `npm run lint` · `npm run format:check` · `npm run typecheck` · `npm test`
- `npm run check` runs all four. Run it before every commit. `npm run format` fixes formatting.

## Conventions

- Contract first: change `docs/contract/<endpoint>.md`, then the code, then the tests, in one PR.
- Every error is RFC 9457 problem details through `lib/problem.ts`; clients switch on `type`.
- Money is computed by code only, in VND integers. The model never adds up or edits amounts.
- Route handlers stay thin; logic lives in `lib/`. No `any`; no `// eslint-disable` without a reason.
- Work on a branch and open a PR. `main` is protected; never push to it.

## Never

- Never put a model key in the browser bundle: no `NEXT_PUBLIC_` variable holds a secret, and
  secrets are read only in server code.
- Never make a real model call in unit or contract tests; use fixtures or fakes.
- Never edit a test, the eval data, or a validator rule to make a check pass. If a check is red,
  fix the code, or change the contract in the open first. (Why: the deliberate-break PR linked in
  `PA2.md`, where code diverged from the contract and CI caught it.)
- Never weaken CI: no `continue-on-error`, no `|| true`, no removing a required job. (Why: the blocked PR linked in `PA2.md`;
  the fix was in the code, not in CI.)
- Never commit `.env` or any value from it; never paste a key into chat, code, logs or tests.
- Never send names or email addresses to a model, only places and interests.
- Never skip hooks or force-push (`--no-verify`, `--force`).
