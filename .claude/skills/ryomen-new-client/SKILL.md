---
name: ryomen-new-client
description: Create a new Ryomen client workspace folder clients/<slug>/ from clients/_template using scripts/new_client.py, then fill the brief from information the owner provides. Use when the owner mentions a new client, onboarding, or a client whose folder does not exist yet.
---

# Ryomen — New Client

1. Get the client's business name from the owner. Propose a slug (lowercase, hyphens), e.g.
   "Acme Bakery" → `acme-bakery`. Confirm it.
2. Run:
   ```bash
   python3 scripts/new_client.py <slug> --name "<Business Name>"
   ```
   The script refuses if the folder exists — then ask the owner what to do; never overwrite.
3. Fill `clients/<slug>/brief.md` and `contacts.md` **only** with what the owner told you or
   documents they provided. Everything else stays `TODO:`.
4. Add the onboarding questions from `templates/client-intake.md` the owner still needs to ask.
5. Remind the owner: client folders are git-ignored and are lost when the cloud session ends
   unless kept (see `docs/INSTALL.md#keeping-client-files`).
6. Next steps: `sops/client-onboarding.md`.
