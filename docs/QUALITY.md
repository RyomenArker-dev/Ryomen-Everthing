# Quality checks & testing

## Automated checks

```bash
python3 scripts/check_workspace.py         # must end with "0 error(s)"
python3 -m unittest discover -s tests -v   # must end with "OK"
```

| Check | Catches |
|---|---|
| secrets | AWS/GitHub/Anthropic/OpenAI-style/Google/Slack/Stripe keys, private key blocks in tracked files (values are never printed) |
| private data | tracked files under `clients/<slug>/`, `leads/data/`, lead CSVs, `.env` |
| frontmatter | agents & skills missing `name`/`description`, duplicate names, `ryomen-*` name ≠ folder, missing required agents |
| links | broken relative links in our Markdown (third-party skills from `skills-lock.json` are skipped) |
| structure | required files missing; invalid `.claude/settings.json` |
| placeholders | TODOs left in `agency/` (warning only — the owner fills these) |

Tests (`tests/`):
- `test_new_client.py` — creation, placeholder filling, overwrite refusal, slug validation (incl. path traversal), CLI exit codes
- `test_new_proposal.py` — service parsing, only selected services included, **no invented prices**, overwrite refusal, errors, CLI
- `test_check_workspace.py` — secret detection without leaking the value, private-data rules, frontmatter rules, link rules,
  the real repo passing all checks, and a git integration test proving new client folders, lead data and `.env` stay untracked

GitHub Actions runs both on every push and pull request (`.github/workflows/quality.yml`).

## Run them from a tablet

Ask Claude in a cloud session: *"Run the quality checks and tests and show me the results."*
Or on GitHub: **Actions** tab → *Quality checks* → latest run.

## Manual QA for deliverables

Use the `quality-analyst` agent / `ryomen-quality-check` skill with `templates/qa-checklist.md`.
Websites: headless Chromium check at 360/768/1280px (snippet in `.claude/skills/ryomen-web-development/SKILL.md`).

## When you add something

| You add… | Also do |
|---|---|
| a script | tests in `tests/`, row in `scripts/README.md`, update `docs/STATUS.md` |
| an agent or skill | frontmatter `name` + `description`; `ryomen-` prefix for skills; run checks |
| a required doc | add to `REQUIRED_FILES` in `check_workspace.py` if it must always exist |
| an integration | design note in `docs/ROADMAP.md`, approval first, enforcement layer in `docs/SAFETY.md` |
