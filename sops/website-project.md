# SOP: Website project

| Field | Value |
|---|---|
| Trigger | Website service in scope |
| Owner | web-developer + copywriter, QA by quality-analyst |
| Outputs | `clients/<slug>/website/` — brief, copy/, site/, deploy-checklist.md |
| Approval points | Sitemap, copy, design, form handler, deployment, domain/DNS changes |
| Last reviewed | 2026-11-03 |

## Steps
1. `templates/website-brief.md` → `website/website-brief.md`; agree pages + goal.
2. Copy per page (`ryomen-copywriting`) → client approval.
3. Scaffold from `web/starter/` (`ryomen-web-development`); apply brand tokens.
4. Build pages; verify at 360/768/1280px with headless Chromium.
5. QA (`ryomen-quality-check`) → fixes.
6. Client review on screenshots or a preview the owner shares.
7. Deployment checklist → approval gate → owner deploys (or an approved integration later).
8. Post-launch: Search Console + GBP setup (owner, with client access), log handover.
