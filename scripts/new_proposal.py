#!/usr/bin/env python3
"""Create a proposal draft for a client from templates/proposal.md.

Usage:
    python3 scripts/new_proposal.py --list-services
    python3 scripts/new_proposal.py acme-bakery --services website seo

Service descriptions come from agency/services.md (blocks between
<!-- service:<id> --> and <!-- /service --> markers). Prices are never invented:
whatever is written in services.md / pricing.md is used, TODOs stay TODOs.
Writes clients/<slug>/docs/YYYY-MM-DD-proposal.md and never overwrites.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _common import REPO_ROOT, fill_placeholders, today_iso, validate_slug  # noqa: E402

SERVICE_RE = re.compile(r"<!--\s*service:([a-z0-9-]+)\s*-->(.*?)<!--\s*/service\s*-->", re.S)
AGENCY_NAME_RE = re.compile(r"\*\*Agency name:\*\*\s*(.+)")
BRIEF_NAME_RE = re.compile(r"^\|\s*Client\s*\|\s*(.+?)\s*\|\s*$", re.M)
DEFAULT_AGENCY = "Ryomen AI Agency"


def load_services(root: Path) -> dict[str, str]:
    path = root / "agency" / "services.md"
    if not path.is_file():
        raise FileNotFoundError(f"missing {path}")
    return {m.group(1): m.group(2).strip() for m in SERVICE_RE.finditer(path.read_text(encoding="utf-8"))}


def agency_name(root: Path) -> str:
    path = root / "agency" / "positioning.md"
    if path.is_file():
        m = AGENCY_NAME_RE.search(path.read_text(encoding="utf-8"))
        if m and not m.group(1).strip().startswith("TODO"):
            return m.group(1).strip()
    return DEFAULT_AGENCY


def client_name(client_dir: Path, slug: str) -> str:
    brief = client_dir / "brief.md"
    if brief.is_file():
        m = BRIEF_NAME_RE.search(brief.read_text(encoding="utf-8"))
        if m and "{{" not in m.group(1):
            return m.group(1)
    return slug


def create_proposal(root: Path, slug: str, service_ids: list[str], on_date: str | None = None) -> Path:
    error = validate_slug(slug)
    if error:
        raise ValueError(f"invalid slug '{slug}': {error}")
    client_dir = root / "clients" / slug
    if not client_dir.is_dir():
        raise FileNotFoundError(f"client folder not found: clients/{slug} — create it with new_client.py")
    if not service_ids:
        raise ValueError("choose at least one service (see --list-services)")

    services = load_services(root)
    unknown = [s for s in service_ids if s not in services]
    if unknown:
        raise ValueError(f"unknown service id(s): {', '.join(unknown)}; available: {', '.join(services)}")

    template_path = root / "templates" / "proposal.md"
    if not template_path.is_file():
        raise FileNotFoundError(f"missing {template_path}")

    on_date = on_date or today_iso()
    out = client_dir / "docs" / f"{on_date}-proposal.md"
    if out.exists():
        raise FileExistsError(f"{out.relative_to(root)} already exists (not overwriting)")

    block = "\n\n".join(services[s] for s in dict.fromkeys(service_ids))
    text = fill_placeholders(
        template_path.read_text(encoding="utf-8"),
        {
            "client_name": client_name(client_dir, slug),
            "client_slug": slug,
            "agency_name": agency_name(root),
            "date": on_date,
            "services_block": block,
        },
    )
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(text, encoding="utf-8")
    return out


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Create a proposal draft in clients/<slug>/docs/.")
    parser.add_argument("slug", nargs="?", help="client slug, e.g. acme-bakery")
    parser.add_argument("--services", nargs="+", default=[], metavar="ID", help="service ids from agency/services.md")
    parser.add_argument("--list-services", action="store_true", help="list available service ids and exit")
    parser.add_argument("--date", help="override date (YYYY-MM-DD)")
    parser.add_argument("--root", type=Path, default=REPO_ROOT, help=argparse.SUPPRESS)
    args = parser.parse_args(argv)

    try:
        if args.list_services:
            for sid, body in load_services(args.root).items():
                title = next((ln.lstrip("# ").strip() for ln in body.splitlines() if ln.startswith("#")), "")
                print(f"{sid:12} {title}")
            return 0
        if not args.slug:
            parser.error("slug is required unless --list-services is used")
        out = create_proposal(args.root, args.slug, args.services, args.date)
    except (ValueError, FileExistsError, FileNotFoundError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    text = out.read_text(encoding="utf-8")
    print(f"Created {out.relative_to(args.root)}")
    print(f"TODO items to complete: {text.count('TODO')}")
    print("Status: DRAFT — NOT SENT. Run ryomen-quality-check, then the approval gate.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
