---
name: ryomen-proposal
description: Generate a client proposal draft in clients/<slug>/docs/ with scripts/new_proposal.py and templates/proposal.md, using only the agency's own services and prices from agency/*.md and facts from the client brief, flagging every missing item. Use when the owner asks for a proposal, quote, estimate or scope of work.
---

# Ryomen — Proposal

Follow `sops/proposal-to-contract.md`.

1. Confirm the client slug exists (else `ryomen-new-client`) and read `clients/<slug>/brief.md`.
2. Pick services from `agency/services.md` (IDs like `website`, `seo`). Run:
   ```bash
   python3 scripts/new_proposal.py <slug> --services website seo
   python3 scripts/new_proposal.py --list-services   # see available IDs
   ```
   It writes `clients/<slug>/docs/YYYY-MM-DD-proposal.md` and refuses to overwrite.
3. Fill the remaining `TODO:` sections from the brief: client goals (their words), scope,
   timeline, assumptions, exclusions.
4. **Prices**: use only `agency/pricing.md`/`agency/services.md`. If the price is still `TODO`,
   leave it and ask the owner. Never invent a price or discount.
5. No guarantees of rankings, sales, followers or revenue.
6. Run `ryomen-quality-check`. Sending → `ryomen-approval-gate` (the owner sends it).
7. Optional PDF/Word export: use the `pdf` or `docx` skill on the finished Markdown.
