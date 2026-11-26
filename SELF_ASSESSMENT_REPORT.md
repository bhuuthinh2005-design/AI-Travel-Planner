# Self-assessment: PA#2

Team: 23127001, 23127121 · Total claimed: **89** (file name `23127001-23127121_89.zip`)

| #   | Criterion                   | Max | Claimed | Evidence                                                                                                                                    |
| --- | --------------------------- | --- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Rules file                  | 15  | 12      | `CLAUDE.md`: four sections, never-list specific to the product; two lines tied to PR #1 and PR #2 (see `PA2.md`)                            |
| 2   | Permissions and secrets     | 10  | 8       | `.claude/settings.json`, `docs/PERMISSIONS.md` (allow / ask / never); `.env.example`; history scan clean; spending cap statement in README  |
| 3   | One command for every check | 10  | 10      | README table; `package.json` scripts; `.github/workflows/ci.yml` runs the same four scripts; fresh clone + `npm ci` + `npm run check` green |
| 4   | CI that blocks a merge      | 20  | 18      | Ruleset `protect-main` (screenshot + API), PR #1 red run then green commit 3a07b1c; only merge commits on `main` since protection           |
| 5   | Contract of one endpoint    | 25  | 23      | `docs/contract/save-plan.md` (roles, ownership, RFC 9457 types and statuses, idempotency, change rules; no paging as it returns one object) |
| 6   | Contract tests that bite    | 15  | 14      | `tests/contract/save-plan.test.ts` (25 tests: each error type, ownership 403/404, idempotency); PR #2 red run on commit a1604dc             |
| 7   | AI-LOG.md                   | 5   | 4       | `AI-LOG.md` entries 1 and 2 with Changed / Rejected                                                                                         |
|     | **Total**                   | 100 | **89**  |                                                                                                                                             |

## What we did not manage

- Authentication is a stub (bearer tokens in an in-memory store); there is no database or real user model.
- The spending rule (each member within their own cap, total within the group total) is our reading of the brief and is
  not confirmed by the product owners.
- The model, its spending cap and the cost per plan are not final until PA#3 (see README).
- The history was rewritten once, before the demo PRs, to remove assistant trailers and change the author email.
- The `pa2` tag run link is the Actions list filtered by the tag, because a run id does not exist until the tag is pushed.
