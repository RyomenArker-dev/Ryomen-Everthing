"""Shared helpers for Ryomen AI Agency scripts (Python 3 standard library only)."""

from __future__ import annotations

import re
from datetime import date
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
RESERVED_SLUGS = {"_template", "readme", "template"}


def validate_slug(slug: str) -> str | None:
    """Return an error message if the slug is invalid, else None."""
    if not slug:
        return "slug is empty"
    if len(slug) > 60:
        return "slug is longer than 60 characters"
    if slug.lower() in RESERVED_SLUGS:
        return f"'{slug}' is reserved"
    if not SLUG_RE.match(slug):
        return "slug must be lowercase letters/digits separated by single hyphens (e.g. acme-bakery)"
    return None


def today_iso() -> str:
    return date.today().isoformat()


def fill_placeholders(text: str, values: dict[str, str]) -> str:
    """Replace {{key}} placeholders with values; unknown placeholders are left untouched."""
    for key, value in values.items():
        text = text.replace("{{" + key + "}}", value)
    return text
