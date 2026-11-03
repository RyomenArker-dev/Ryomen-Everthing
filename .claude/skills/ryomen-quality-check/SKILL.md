---
name: ryomen-quality-check
description: Ryomen quality assurance — review a deliverable (copy, proposal, report, brand guide, website, script) against templates/qa-checklist.md for invented facts, missing sources, client data leaks, broken links, accessibility, layout and test results, then write a PASS / PASS WITH FIXES / FAIL report. Use before anything is shown or sent to a client.
---

# Ryomen — Quality Check

## Steps
1. Identify the deliverable, its client slug and type (copy / document / web / code).
2. Open `templates/qa-checklist.md`; apply the relevant sections.
3. **Facts & sources**: list every factual claim, number, name, price, quote. Mark each
   `from brief` / `sourced <url>` / `UNSUPPORTED`. Unsupported → BLOCKER.
4. **Client separation**: grep for other client slugs/names:
   `ls clients | grep -v _template` then `grep -ril "<other-name>" clients/<slug>/`. Any hit → BLOCKER.
5. **Links**: local links → `python3 scripts/check_workspace.py`; external links → WebFetch each
   and record status. Note any you could not check.
6. **Web**: run the headless check from `ryomen-web-development`; record overflow, console errors,
   headings, alt text, labels, contrast.
7. **Code**: run `python3 -m unittest discover -s tests -v` and `python3 scripts/check_workspace.py`;
   paste the real summary lines.
8. **Copy**: spelling, grammar, tone, AI tells, consistent names/prices/dates, placeholders left.
9. Write the report (client work → `clients/<slug>/docs/qa-YYYY-MM-DD-<item>.md`):
   verdict, numbered issues with severity (BLOCKER/MAJOR/MINOR), exact location, suggested fix,
   and "Not checked" list.

Do not silently fix the deliverable — report. Fix only if the owner asks.
