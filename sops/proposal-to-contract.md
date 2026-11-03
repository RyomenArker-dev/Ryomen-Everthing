# SOP: Proposal to contract

| Field | Value |
|---|---|
| Purpose | Turn a qualified lead's request into an accurate, approved proposal |
| Trigger | Prospect asks for a quote |
| Owner | business-strategist + copywriter, QA by quality-analyst |
| Outputs | `clients/<slug>/docs/YYYY-MM-DD-proposal.md` (+ optional PDF) |
| Approval points | Prices (owner), sending (owner) |
| Last reviewed | 2026-11-03 |

## Steps
1. Create client folder (status `prospect`) and fill brief from the discovery call notes.
2. `python3 scripts/new_proposal.py <slug> --services <ids…>`.
3. Fill goals, scope, timeline, assumptions, exclusions from the brief.
4. Prices only from `agency/pricing.md`; else leave TODO and ask owner.
5. `ryomen-quality-check` → fix → optional PDF via `pdf`/`docx` skill.
6. Approval gate → owner sends. Log in `log.md`.
7. On acceptance: contract/agreement (TODO: owner's contract template — not provided; get legal
   advice for your jurisdiction), deposit, then `sops/client-onboarding.md`.
