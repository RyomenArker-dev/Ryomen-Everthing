---
name: ryomen-report
description: Produce a monthly client report in clients/<slug>/reports/ from templates/monthly-report.md using only data the owner supplies or exports (analytics, social, SEO, tasks done), clearly marking missing data. Use for monthly/weekly client reporting, performance summaries or retainer updates.
---

# Ryomen — Client Report

1. Ask for the period and the data sources. Data must come from the owner (pasted numbers,
   CSV exports placed in `clients/<slug>/reports/data/`, or screenshots). There are **no live
   analytics integrations** yet.
2. Copy `templates/monthly-report.md` → `clients/<slug>/reports/YYYY-MM-report.md`.
3. Fill metrics: value, previous period, change (compute it — show the formula for %), source.
   Missing → `NOT PROVIDED`. Never estimate a metric as if measured.
4. Work completed: from `clients/<slug>/log.md` and files dated in the period.
5. Insights: each one tied to a metric. Next month plan: concrete tasks with owners.
6. Run `ryomen-quality-check`. Sending → `ryomen-approval-gate`.

For CSV analysis use Python `csv` stdlib; for spreadsheet outputs the `xlsx` skill; for PDF the
`pdf` skill. Charts: optional, only from real data.
