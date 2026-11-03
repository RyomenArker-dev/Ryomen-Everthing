---
name: ryomen-approval-gate
description: Mandatory approval step before any outbound, public, paid or destructive action — sending emails/messages, publishing posts or ads, deploying websites, submitting forms or directories, buying/installing paid services, deleting/overwriting files, or destructive git operations. Writes an approval request and stops until the owner explicitly approves that exact action.
---

# Ryomen — Approval Gate

Use this whenever the next step would: **send** anything to anyone, **publish/deploy/schedule**,
**spend money or sign up** for a service, **use a paid API**, or **delete/overwrite/rewrite**
files or git history.

## Steps
1. Stop before the action.
2. Show an approval request in chat using `templates/approval-request.md`:
   - Action (exact), target (who/where), content or diff (or file path), cost, reversibility,
     risks, what happens if not approved.
3. For client work also append it to `clients/<slug>/log.md` with status `PENDING`.
4. Wait. Only an explicit "yes / approved / go ahead" **for this action** counts.
   Approval does not carry over to similar actions later.
5. Even after approval, Claude can only do it if a tool for it exists. There are currently
   **no** send/publish/deploy integrations — so the owner performs the action themselves.
   Say this clearly and give them the ready-to-use content.
6. Record the outcome in the log (`APPROVED`/`REJECTED`, date).
