---
name: ryomen-marketing-strategy
description: Ryomen marketing workflow — SEO audits, social media calendars, content plans and campaign plans for a client saved in clients/<slug>/campaigns or docs, using templates/campaign-plan.md, with sourced numbers and an approval step before anything is published. Use for SEO, social media, content, ads or email campaign planning.
---

# Ryomen — Marketing Strategy

## Pick the workflow
| Request | SOP | Template | Output |
|---|---|---|---|
| SEO audit / plan | `sops/seo-audit.md` | — | `clients/<slug>/docs/YYYY-MM-DD-seo-audit.md` |
| Social media month | `sops/social-media-month.md` | `templates/campaign-plan.md` | `clients/<slug>/campaigns/YYYY-MM-social.md` |
| Campaign (launch, promo, ads, email) | — | `templates/campaign-plan.md` | `clients/<slug>/campaigns/YYYY-MM-DD-<name>.md` |

## Steps
1. Read `clients/<slug>/brief.md`. Confirm goal, audience, budget, channels. Budget is never assumed.
2. Gather evidence: site pages, public profiles, competitor examples — with URLs and dates.
3. Fill the template. Each KPI has a baseline (or `UNKNOWN — needs access to <tool>`) and a target
   the owner confirms.
4. Content calendar rows: date, channel, format, topic, copy draft link, asset needed, status
   (`draft`/`approved`/`scheduled-by-owner`).
5. List every action needing approval (publishing, ad spend, account changes).
6. Run `ryomen-quality-check`.

## Deeper skills
`seo-audit`, `ai-seo`, `schema`, `site-architecture`, `content-strategy`, `social`, `ads`,
`ad-creative`, `emails`, `analytics`, `launch`.

## Never
Publish, schedule, boost, launch ads, or log into client accounts. Invent search volumes,
follower counts or benchmarks.
