"""Test helpers: build a minimal fake workspace in a temp directory."""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO / "scripts"))


def make_workspace(tmp: Path) -> Path:
    """Copy the real template/agency/templates folders into tmp so scripts run against them."""
    for rel in ("clients/_template", "agency", "templates"):
        shutil.copytree(REPO / rel, tmp / rel)
    return tmp
