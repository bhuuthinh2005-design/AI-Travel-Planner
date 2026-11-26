# Assistant permissions

Enforced for Claude Code by `.claude/settings.json`; other tools follow the same tiers by agreement.

| Tier          | What                                                                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Allowed**   | Read, edit and write source and docs; run lint, format, typecheck, tests; read-only git; add and commit on a branch.                                |
| **Ask first** | Install or remove dependencies; `git push`, merge, rebase, tag; network calls (`curl`, web fetch); any edit under `tests/` or `.github/workflows/`. |
| **Never**     | Read `.env*`; force-push or push to `main`; `reset --hard`; `rm -rf`; `sudo`.                                                                       |

Notes

- Tests and workflows are "ask first" on purpose: the human approves each edit, so a red check
  is never silenced quietly. A red check is fixed in the code, or in the contract first.
- Secrets live only in `.env` (git-ignored). `.env.example` lists every variable with no value.
- The model API key has a monthly spending cap set in the provider console (see README).
