# Scripts

Python 3 standard library only — nothing to install. Run from the repository root.

| Script | What it does | Example |
|---|---|---|
| `new_client.py` | Creates `clients/<slug>/` from `clients/_template/` (git-ignored, never overwrites) | `python3 scripts/new_client.py acme-bakery --name "Acme Bakery"` |
| `new_proposal.py` | Creates `clients/<slug>/docs/YYYY-MM-DD-proposal.md` from `templates/proposal.md` + `agency/services.md` | `python3 scripts/new_proposal.py acme-bakery --services website seo` |
| `check_workspace.py` | Secret scan, private-data guard, agent/skill frontmatter, Markdown links, required files | `python3 scripts/check_workspace.py` (`--all` includes untracked files) |
| `_common.py` | Shared helpers (slug validation, placeholders) | — |

All scripts support `--help` and exit with a non-zero code on error. Tests live in `tests/`.
