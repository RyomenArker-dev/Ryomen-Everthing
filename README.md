# Ryomen AI Agency

An AI-assisted operating system for a digital freelancing agency, run from an **Android tablet**
with **Claude Code** (cloud sessions) and **GitHub** as the source of truth.

Services supported: brand identity & graphic design · website design & development · social media
management · SEO & digital marketing · lead generation & business research · AI business automation.

> Everything here is plain Markdown, HTML/CSS and Python standard-library scripts.
> No paid services or API keys are required to use it.

---

## What's inside

| Folder | Purpose |
|---|---|
| `CLAUDE.md` | Rules and instructions Claude follows in this repo (read this first) |
| `.claude/agents/` | 8 specialist agents (strategist, brand designer, marketer, lead researcher, copywriter, web developer, automation engineer, quality analyst) |
| `.claude/skills/ryomen-*` | Our reusable skills (workflows) |
| `.claude/skills/*` | Installed third-party skills (marketing, UI/UX, documents) — see `skills-lock.json` |
| `agency/` | Your agency's own operating info: services, pricing, positioning, tools |
| `clients/_template/` | Folder skeleton copied for each new client (real client folders are **not** committed) |
| `leads/` | Lead qualification rubric and process (real lead data is **not** committed) |
| `templates/` | Proposals, briefs, reports, campaign plans, SOP template, approval request, QA checklist |
| `sops/` | Standard operating procedures |
| `web/starter/` | Responsive, accessible static landing page starter |
| `scripts/` | Small helper scripts (new client, new proposal, workspace checks) |
| `tests/` | Automated tests for the scripts and the workspace |
| `docs/` | Architecture, install guide, quality, safety, roadmap, status |

## Quick start (tablet)

1. Open **claude.ai/code** in your tablet browser (or the Claude app) and start a session on this repository.
2. Ask Claude things like:
   - "Create a new client called Acme Bakery." → uses `ryomen-new-client`
   - "Draft a proposal for acme-bakery for a website and SEO." → `ryomen-proposal`
   - "Research 10 cafés in <city> that might need a website." → `lead-researcher`
   - "Write homepage copy for acme-bakery." → `copywriter`
   - "Build a landing page for acme-bakery from the starter." → `web-developer`
   - "Check the acme-bakery homepage before I send it." → `quality-analyst`
3. Claude drafts. **You approve** anything that gets sent, published, deployed or paid for.

Full setup: **[docs/INSTALL.md](docs/INSTALL.md)**.

## Run the checks

```bash
python3 scripts/check_workspace.py
python3 -m unittest discover -s tests -v
```

These also run automatically on GitHub (`.github/workflows/quality.yml`). See [docs/QUALITY.md](docs/QUALITY.md).

## Important

- **Client data is not stored in git.** Read [docs/INSTALL.md](docs/INSTALL.md#keeping-client-files)
  to understand how to keep client files between cloud sessions.
- Safety rules: [docs/SAFETY.md](docs/SAFETY.md).
- What works and what is not built yet: [docs/STATUS.md](docs/STATUS.md).
- Future integrations: [docs/ROADMAP.md](docs/ROADMAP.md).
