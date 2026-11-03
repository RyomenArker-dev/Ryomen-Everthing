# SOP: Delivery QA

| Field | Value |
|---|---|
| Trigger | Any deliverable is "done" |
| Owner | quality-analyst |
| Outputs | `clients/<slug>/docs/qa-YYYY-MM-DD-<item>.md` |
| Approval points | Owner reviews verdict before client sees anything |
| Last reviewed | 2026-11-03 |

## Steps
1. Run `ryomen-quality-check` with `templates/qa-checklist.md`.
2. Author fixes BLOCKER and MAJOR items; QA re-checks.
3. Verdict PASS → approval gate → owner delivers.
