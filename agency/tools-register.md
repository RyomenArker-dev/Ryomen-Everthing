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
| ElevenLabs | Text-to-speech voiceovers (stock voices) | Paid (credits per character) | Owner | **Approved by owner 2026-11-06**, in use | Key stored only as a cloud-environment network secret for api.elevenlabs.io (Text to Speech permission). Voice cloning still needs consent (S10) |
| Kokoro (ONNX) | Free offline text-to-speech fallback | Free, open source | — | Used once, not installed permanently | Reinstall per session if needed |
| fal.ai | Talking-head video generation (`talking-head` skill) | Paid | Owner | Not approved | Only with owner approval (S6) and consent (S10) |
| Remotion | Video rendering in some motion skills | Free for individuals/small teams; company licence above that — check current terms | Owner | Not installed | Installed per project, with approval |
| MuAPI (api.muapi.ai) | AI image/video generation (used by the Open-Generative app) | Paid, prepaid USD balance | Owner | Key connected 2026-11-09; balance $0.00; **no spending approved yet** | Key stored only as a cloud-environment network secret (`x-api-key`). Account has web-safety filtering enforced. Each paid generation needs owner approval (S6). |
