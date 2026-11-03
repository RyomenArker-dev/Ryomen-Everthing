# Clients

One folder per client: `clients/<slug>/` (e.g. `clients/acme-bakery/`).

- **Real client folders are git-ignored** — they never go to GitHub. Only `_template/` is tracked.
- Create a client with the `ryomen-new-client` skill, or:
  `python3 scripts/new_client.py acme-bakery --name "Acme Bakery"`
- Never put one client's information into another client's folder.
- Read [docs/INSTALL.md](../docs/INSTALL.md#keeping-client-files) — client files disappear when a
  cloud session ends unless you keep a copy.

Folder layout (from `_template/`):

```
clients/<slug>/
  brief.md        project brief and goals
  contacts.md     client contacts (private)
  log.md          decisions, approvals, timeline
  brand/          brand identity work
  website/        website files and copy
  campaigns/      marketing campaign plans
  reports/        monthly reports
  docs/           proposals, QA reports, meeting notes
```
