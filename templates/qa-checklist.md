# QA checklist

Verdict: PASS / PASS WITH FIXES / FAIL — Severity: BLOCKER / MAJOR / MINOR

## All deliverables
- [ ] Every fact, number, name, price, quote is from the brief or has a source → else BLOCKER
- [ ] No other client's name/data appears → else BLOCKER
- [ ] No secrets, passwords or private contact data beyond what's needed
- [ ] No guarantees of rankings, sales, followers
- [ ] No leftover `TODO`, `{{placeholder}}`, lorem ipsum (unless intentionally flagged)
- [ ] Spelling, grammar, consistent names/dates/prices
- [ ] Outbound items marked DRAFT — NOT SENT and routed through approval gate

## Copy
- [ ] One clear goal and CTA
- [ ] Matches brand voice; no AI tells
- [ ] Meta title ≤ 60 chars, meta description ≤ 155 chars (web copy)

## Brand
- [ ] Contrast ratios computed and meet AA
- [ ] Fonts have licences noted
- [ ] Not imitating another brand

## Website
- [ ] 360 / 768 / 1280px: no horizontal scroll (scrollWidth ≤ viewport)
- [ ] No console errors
- [ ] `lang`, `<title>`, meta description, OG tags
- [ ] One `h1`, logical headings, landmarks
- [ ] Alt text, labelled inputs, visible focus, reduced-motion respected
- [ ] Links work (internal + external checked)
- [ ] No trackers or form endpoints without approval

## Code / scripts
- [ ] `python3 -m unittest discover -s tests -v` passes (paste summary)
- [ ] `python3 scripts/check_workspace.py` passes (paste summary)
- [ ] Has `--help`; refuses to overwrite without flag; no secrets printed

## Not checked
- List anything you could not verify and why.
