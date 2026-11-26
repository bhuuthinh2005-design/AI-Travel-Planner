# PA#2: harness and quality gate

Team: 23127001, 23127121 · Product: AI Travel Planner · Stack: TypeScript, Next.js, Vitest

| Evidence                          | Link                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository (public)               | https://github.com/bhuuthinh2005-design/AI-Travel-Planner                                                                                                                                                                                                                                                                                                     |
| Protected-branch settings         | Ruleset `protect-main`: https://github.com/bhuuthinh2005-design/AI-Travel-Planner/rules/28160483 · screenshot `docs/evidence/branch-protection.png`                                                                                                                                                                                                           |
| Blocked PR (red check stopped it) | https://github.com/bhuuthinh2005-design/AI-Travel-Planner/pull/1 · red run: https://github.com/bhuuthinh2005-design/AI-Travel-Planner/actions/runs/45812877604 (`lint`, `format` failed on 17fabc2) · screenshot `docs/evidence/blocked-pr.png`                                                                                                               |
| Commit that turned it green       | https://github.com/bhuuthinh2005-design/AI-Travel-Planner/commit/3a07b1c97240046e3ad836b34151ae51f3f3851e · green run: https://github.com/bhuuthinh2005-design/AI-Travel-Planner/actions/runs/45815703573                                                                                                                                                     |
| CI run for the `pa2` tag          | https://github.com/bhuuthinh2005-design/AI-Travel-Planner/actions?query=branch%3Apa2 (filter by the tag; the tag's run starts after the tag is pushed)                                                                                                                                                                                                        |
| Deliberate contract break         | PR https://github.com/bhuuthinh2005-design/AI-Travel-Planner/pull/2 · breaking commit https://github.com/bhuuthinh2005-design/AI-Travel-Planner/commit/a1604dc1a5a35a5e80f74d5baa9f9959980aa733 · red run: https://github.com/bhuuthinh2005-design/AI-Travel-Planner/actions/runs/45817071830 (`test` failed) · screenshot `docs/evidence/contract-break.png` |
| Commit that fixed the break       | https://github.com/bhuuthinh2005-design/AI-Travel-Planner/commit/5be9191090e87c995f33b00d123abe14d10f7162 · green run: https://github.com/bhuuthinh2005-design/AI-Travel-Planner/actions/runs/45817436303                                                                                                                                                     |

## What the evidence shows

- **Rule:** ruleset `protect-main` is active on the default branch with no bypass actors. It requires a pull
  request, requires the status checks `lint`, `format`, `typecheck`, `test` (branch must be up to date),
  blocks force pushes and deletions.
- **Blocked PR (#1):** commit 17fabc2 added an unused variable and bad formatting; `lint` and `format` went red and the
  merge button was locked. Commit 3a07b1c fixed the code (nothing in CI was changed) and the checks went green.
- **Deliberate contract break (#2):** commit a1604dc made a non-owner get `404 plan-not-found` instead of the
  contract's `403 plan-not-owner`, without touching tests or contract. The contract test "403 plan-not-owner" failed and
  `test` went red. Commit 5be9191 restored the code; checks went green; then merged.
- Nothing was pushed to `main` after protection was turned on (2026-11-26 11:35 UTC); `main` has only merge commits since.

## Files to look at

- Rules file: `CLAUDE.md` · Permissions: `.claude/settings.json`, `docs/PERMISSIONS.md`
- Variables: `.env.example` · Checks: `README.md` (table) and `.github/workflows/ci.yml`
- Contract: `docs/contract/save-plan.md` · Contract tests: `tests/contract/save-plan.test.ts`
- AI usage: `AI-LOG.md` · Self-assessment: `SELF_ASSESSMENT_REPORT.md`
