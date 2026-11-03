# Architecture

## Design principles

1. **Files over services.** Markdown, CSV and static HTML. No database, no server, no paid API.
2. **Tablet-first.** Everything is done by asking Claude Code in a cloud session; no local install.
3. **GitHub is the source of truth** for the *system* (rules, agents, skills, templates, SOPs, scripts).
4. **Client data is private.** It lives in git-ignored folders, one per client.
5. **Human in the loop.** Claude drafts; the owner approves anything outbound or destructive.
6. **Modular.** Each module is a folder with a README; each role is an agent + a skill.

## Layers

```
┌────────────────────────────────────────────────────────────┐
│ Owner (Android tablet → claude.ai/code)                     │
└──────────────┬─────────────────────────────────────────────┘
               │ requests / approvals
┌──────────────▼─────────────────────────────────────────────┐
│ CLAUDE.md  — rules, routing, conventions                    │
├────────────────────────────────────────────────────────────┤
│ Agents (.claude/agents)   8 specialists                     │
│   business-strategist · brand-designer · marketing-         │
│   strategist · lead-researcher · copywriter · web-developer │
│   · automation-engineer · quality-analyst                   │
├────────────────────────────────────────────────────────────┤
│ Skills (.claude/skills)                                     │
│   ryomen-* (ours: workflows, gates, templates)              │
│   third-party (marketing, ui-ux-pro-max, documents)         │
├────────────────────────────────────────────────────────────┤
│ Content & data                                              │
│   agency/ templates/ sops/ web/starter/   (tracked)         │
│   clients/<slug>/  leads/data/            (git-ignored)     │
├────────────────────────────────────────────────────────────┤
│ Automation & quality                                        │
│   scripts/*.py (stdlib)  tests/  GitHub Actions             │
└────────────────────────────────────────────────────────────┘
```

## Agent → skill → output map

| Agent | Ryomen skill(s) | Third-party depth skills | Writes to |
|---|---|---|---|
| business-strategist | ryomen-business-strategy, ryomen-proposal | pricing, offers, product-marketing, marketing-plan | `agency/`, `clients/<slug>/docs/` |
| brand-designer | ryomen-brand-identity | brand, design, design-system, ui-ux-pro-max, banner-design | `clients/<slug>/brand/` |
| marketing-strategist | ryomen-marketing-strategy, ryomen-report | seo-audit, ai-seo, social, content-strategy, ads, emails, analytics | `clients/<slug>/campaigns/`, `reports/` |
| lead-researcher | ryomen-lead-research | prospecting, customer-research, competitor-profiling | `leads/data/` |
| copywriter | ryomen-copywriting | copywriting, copy-editing, emails, ad-creative, cold-email | `clients/<slug>/…` |
| web-developer | ryomen-web-development | ui-ux-pro-max, ui-styling, design-system, schema, cro | `clients/<slug>/website/` |
| automation-engineer | ryomen-automation | marketing-loops, analytics | `scripts/`, `tests/`, `sops/` |
| quality-analyst | ryomen-quality-check | copy-editing, seo-audit | `clients/<slug>/docs/qa-*.md` |

Shared skills: `ryomen-new-client`, `ryomen-approval-gate`.

## Client lifecycle

```
lead (leads/data) ──qualify──▶ proposal (ryomen-proposal) ──approve/sign──▶
client folder (ryomen-new-client) ──▶ brief ──▶ project (brand / website / campaign)
──▶ QA (quality-analyst) ──▶ approval gate ──▶ owner delivers ──▶ monthly report ──▶ offboard
```

## Why these choices

| Choice | Reason |
|---|---|
| Python stdlib scripts | Python 3 is preinstalled in cloud sessions; zero dependencies to break |
| Static HTML/CSS for sites | Free hosting options later (GitHub Pages, Cloudflare Pages); no build step on a tablet |
| Markdown templates | Readable in the GitHub app on Android; Claude fills them reliably |
| `.claude/settings.json` permissions | Enforced by Claude Code, not just written as advice |
| GitHub Actions | Free checks on every push |
