# Self-assessment: PA#2

Team: 23127001, 23127121. Claimed marks assume every `PA2.md` link is filled and works.
DRAFT: re-score honestly after the GitHub steps; the total goes in the zip file name.

| #   | Criterion                   | Max | Claimed | Evidence                                                                                             |
| --- | --------------------------- | --- | ------- | ---------------------------------------------------------------------------------------------------- |
| 1   | Rules file                  | 15  | 12      | `CLAUDE.md` (four sections; never-list is product-specific; two lines traced to the PRs in `PA2.md`) |
| 2   | Permissions and secrets     | 10  | 8       | `.claude/settings.json`, `docs/PERMISSIONS.md`, `.env.example`; cap stated in README (TODO: set it)  |
| 3   | One command for every check | 10  | 10      | README table; `package.json` scripts; `.github/workflows/ci.yml` runs the same scripts               |
| 4   | CI that blocks a merge      | 20  | 18      | Protection screenshot, blocked PR, green commit (links in `PA2.md`)                                  |
| 5   | Contract of one endpoint    | 25  | 23      | `docs/contract/save-plan.md`                                                                         |
| 6   | Contract tests that bite    | 15  | 13      | `tests/contract/save-plan.test.ts`; deliberate-break PR (link in `PA2.md`)                           |
| 7   | AI-LOG.md                   | 5   | 4       | `AI-LOG.md`                                                                                          |
|     | **Total**                   | 100 | **88**  |                                                                                                      |

## What we did not manage

- TODO: write the honest list (e.g. no real auth, in-memory store, spend rule assumption).
