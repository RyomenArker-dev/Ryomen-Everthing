# Tools register

Every tool or service the agency uses. Anything **paid** or needing an **account/API key** must be
approved by the owner before use (CLAUDE.md S6). Never write keys here.

| Tool | Purpose | Cost | Account owner | Status | Notes |
|---|---|---|---|---|---|
| GitHub | Source of truth for the system | Free tier | Owner | In use | Keep repo private |
| Claude Code (claude.ai/code) | Primary coding agent | Subscription | Owner | In use | |
| Python 3 (stdlib) | Scripts | Free | — | In use | Preinstalled in cloud sessions |
| Playwright + Chromium | Website screenshots/QA | Free | — | Available in cloud sessions | Preinstalled; not added as a dependency |
| GitHub Actions | Automated checks | Free tier minutes | Owner | Configured, see docs/STATUS.md | |
| Google Search Console | SEO data | Free | Client | Not connected | Owner exports data manually |
| Google Business Profile | Local SEO | Free | Client | Not connected | |
| PageSpeed Insights (web) | Performance checks | Free | — | Manual use | |
