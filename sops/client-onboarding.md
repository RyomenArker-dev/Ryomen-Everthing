# SOP: Client onboarding

| Field | Value |
|---|---|
| Purpose | Start every client project with complete information and clear approvals |
| Trigger | Client accepts a proposal |
| Owner | Owner + business-strategist |
| Outputs | `clients/<slug>/brief.md`, `contacts.md`, `log.md`, `docs/project-charter.md` |
| Approval points | Sending intake questionnaire; kick-off email |
| Last reviewed | 2026-11-03 |

## Steps
1. Create folder: `ryomen-new-client` (`python3 scripts/new_client.py <slug> --name "…"`).
2. Record acceptance + deposit status in `log.md` (owner provides).
3. Draft intake message from `templates/client-intake.md` → `docs/drafts/` → approval gate → owner sends.
4. When answers arrive, fill `brief.md` and `contacts.md` from them only.
5. Copy `templates/project-charter.md` → `docs/project-charter.md` and fill.
6. Request access via platform role invites (never passwords by message).
7. Draft kick-off email → approval gate.
8. Back up the client folder (see `docs/INSTALL.md#keeping-client-files`).

## Done when
- Brief has no blocking TODOs, charter approved, access granted, kick-off scheduled.
