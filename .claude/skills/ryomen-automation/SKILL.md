---
name: ryomen-automation
description: Ryomen automation workflow — turn a repetitive agency task into a small, tested Python standard-library script (or an SOP first), with dry-run defaults, no secrets in code, and approval gates for anything that sends or publishes. Use when the owner says "automate", "every week I have to", "script this", or asks about connecting a tool/integration.
---

# Ryomen — Automation

## Steps
1. **Describe the manual process**: trigger, inputs, steps, outputs, frequency, approver.
   If no SOP exists, write one from `templates/sop-template.md` first.
2. **Decide the level**: (a) checklist/SOP only, (b) template, (c) script, (d) external
   integration. Choose the lowest level that removes most of the effort.
3. **Script rules** (`scripts/<verb>_<noun>.py`):
   - Python 3 stdlib only; `argparse` with `--help`; `main()` returns exit code.
   - Validate inputs (slugs: `^[a-z0-9]+(-[a-z0-9]+)*$`); stay inside the target client folder.
   - Never overwrite without `--force`; never delete without explicit approval.
   - Anything outbound: default `--dry-run`, real run requires `--confirm` *and* owner approval.
   - Secrets only from environment variables; never print them.
4. **Tests**: add `tests/test_<script>.py` (unittest, temp directories). Run:
   `python3 -m unittest discover -s tests -v` and `python3 scripts/check_workspace.py`.
5. **Document**: usage in `scripts/README.md`, update `docs/STATUS.md` (tested vs. untested).
6. **External integrations** (email, CRM, social, hosting, payments): write a design note in
   `docs/ROADMAP.md` (service, cost, data shared, credentials needed, approval points) and ask
   the owner before any signup, key, or install (CLAUDE.md S6).

## Deeper skills
`marketing-loops` (recurring workflows), `analytics`.
