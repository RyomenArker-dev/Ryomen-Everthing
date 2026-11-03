#!/usr/bin/env python3
"""Create a new client workspace folder from clients/_template.

Usage:
    python3 scripts/new_client.py acme-bakery --name "Acme Bakery"

The new folder clients/<slug>/ is git-ignored (client data never goes to GitHub).
The script never overwrites an existing client folder.
"""

from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _common import REPO_ROOT, fill_placeholders, today_iso, validate_slug  # noqa: E402


def create_client(root: Path, slug: str, name: str, created: str | None = None) -> Path:
    """Copy the template into clients/<slug> and fill placeholders. Returns the new path.

    Raises ValueError for invalid input and FileExistsError if the client exists.
    """
    error = validate_slug(slug)
    if error:
        raise ValueError(f"invalid slug '{slug}': {error}")
    name = name.strip()
    if not name:
        raise ValueError("client name is empty")

    template = root / "clients" / "_template"
    if not template.is_dir():
        raise FileNotFoundError(f"template folder not found: {template}")

    target = root / "clients" / slug
    if target.exists():
        raise FileExistsError(f"client folder already exists: {target} (not overwriting)")

    shutil.copytree(template, target)
    values = {"client_name": name, "client_slug": slug, "date": created or today_iso()}
    for path in target.rglob("*.md"):
        path.write_text(fill_placeholders(path.read_text(encoding="utf-8"), values), encoding="utf-8")
    (target / "docs" / "drafts").mkdir(parents=True, exist_ok=True)
    return target


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Create clients/<slug>/ from clients/_template.")
    parser.add_argument("slug", help="client slug, e.g. acme-bakery")
    parser.add_argument("--name", required=True, help='client business name, e.g. "Acme Bakery"')
    parser.add_argument("--root", type=Path, default=REPO_ROOT, help=argparse.SUPPRESS)
    args = parser.parse_args(argv)

    try:
        target = create_client(args.root, args.slug, args.name)
    except (ValueError, FileExistsError, FileNotFoundError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    rel = target.relative_to(args.root)
    print(f"Created {rel}/")
    print("Next: fill brief.md and contacts.md with facts from the client only.")
    print("Note: this folder is git-ignored — keep a backup (docs/INSTALL.md#keeping-client-files).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
