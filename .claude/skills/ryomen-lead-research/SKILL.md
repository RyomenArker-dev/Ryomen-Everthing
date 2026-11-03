---
name: ryomen-lead-research
description: Ryomen lead research and qualification workflow — find businesses that may need the agency's services, record only verifiable public facts with source URLs and dates in leads/data (git-ignored), and score them with leads/qualification-rubric.md. Use for prospecting, lead lists, business research or lead scoring.
---

# Ryomen — Lead Research

Follow `sops/lead-research.md`.

## Inputs
- Niche/industry, location, number of leads wanted, which service is being sold.

## Steps
1. Ensure `leads/data/` exists (`mkdir -p leads/data`) — it is git-ignored. If
   `leads/data/pipeline.csv` is missing, copy `templates/lead-pipeline.csv`.
2. Search with WebSearch; open each candidate's site/profile with WebFetch.
3. For each lead, create `leads/data/<lead-slug>.md` from `templates/lead-record.md`:
   - Business name, website, location, category — each with source URL + checked date.
   - Observations: only what you saw (e.g. "site has no viewport meta tag — checked via page
     source 2026-01-05").
   - Opportunity: which agency service fits and why.
4. Score with `leads/qualification-rubric.md`; show the per-criterion reasoning.
5. Append one row to `leads/data/pipeline.csv`.
6. Summarise: table of leads, score, top opportunity, confidence.

## Rules
- Business-level public info only; no personal phone numbers/emails beyond those the business
  publishes for business contact. No login-walled or scraped-in-bulk data.
- Couldn't verify? Write `UNKNOWN`. Never fill gaps with plausible guesses.
- Outreach drafts go to `leads/data/<lead-slug>-outreach-draft.md` marked **DRAFT — NOT SENT**,
  then `ryomen-approval-gate`.

## Deeper skills
`prospecting`, `customer-research`, `competitor-profiling`, `cold-email` (drafting only).
