# Roadmap

Every integration below follows the same rules:
- It needs owner approval and must be listed in `agency/tools-register.md`.
- Free options come first, and any cost is stated before signup.
- Credentials go only in environment secrets, never in files.
- Anything that sends or publishes defaults to dry-run and goes through `ryomen-approval-gate`.
- It must add an enforcement layer to `docs/SAFETY.md` and tests to `tests/`.
- It is marked "working" in `docs/STATUS.md` only after an end-to-end test.

## Phase 0 — Foundation ✅ (this build)
Rules, agents, skills, templates, SOPs, scripts, tests, CI and a web starter.

## Phase 1 — Keep client data safely (next, owner decision needed)
- [ ] Choose the storage option for client files (see [INSTALL.md](INSTALL.md#keeping-client-files)).
  - A: a second private GitHub repo `ryomen-clients`, plus a skill to attach and sync it.
  - B: Google Drive connector to save deliverables (test the read/write round trip first).
  - C: encrypted archive (`age`/`gpg`). Needs password management.
- [ ] `scripts/export_client.py`: package one client folder for handover. It must stay within that one client.

## Phase 2 — Productivity (free tools)
- [ ] `scripts/new_report.py`: create a monthly report from a CSV export (stdlib `csv`).
- [ ] `scripts/lead_pipeline.py`: validate and sort `leads/data/pipeline.csv`, and list follow-ups due.
- [ ] Markdown-to-PDF proposals using the installed `pdf`/`docx` skills, with a documented, tested command.
- [ ] Brand `tokens.css` generator from a palette file.
- [ ] Link checker for client websites (stdlib `urllib`, runs in session only).

## Phase 3 — Publishing with approval (free tiers)
- [ ] **Website hosting:** GitHub Pages or Cloudflare Pages (free tiers). Design a deploy step that
  needs an explicit approval and deploys only from a reviewed branch. Client domains and DNS stay owned by the client.
- [ ] **Contact forms:** pick a form handler (some have free tiers; compare privacy and limits).
- [ ] **Privacy-friendly analytics:** only with client consent and a privacy notice.

## Phase 4 — Data integrations (read-only first)
- [ ] Google Search Console / GA4 read-only exports for reports (owner exports first; API later).
- [ ] Google Business Profile insights (read-only).
- [ ] Social platform insights (read-only exports).

## Phase 5 — Communication & CRM (highest risk; last)
- [ ] Email drafting into the owner's drafts folder only (never sending), through an approved connector.
- [ ] Lightweight CRM, either a spreadsheet or a free CRM tier, synced from `leads/data/`.
- [ ] Scheduled jobs ("marketing loops"), e.g. a weekly pipeline review. They create drafts and to-dos only.

## Phase 6 — Scaling to a team
- [ ] Roles and access: contractors get access to specific client repos only.
- [ ] Contract, NDA and invoice templates (get legal and tax advice for your jurisdiction).
- [ ] Client portal (static, per-client, private).
- [ ] Time tracking and profitability per project.
