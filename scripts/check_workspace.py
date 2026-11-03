#!/usr/bin/env python3
"""Workspace quality and safety checks for Ryomen AI Agency.

Checks (errors fail with exit code 1, warnings do not):
  1. secrets       — tracked files must not contain API keys, tokens or private keys
  2. private data  — client folders (except _template), leads/data and .env must not be tracked
  3. frontmatter   — every agent and skill has name + description; names unique;
                     ryomen-* skill names match their folder
  4. links         — relative Markdown links in our own files resolve
  5. structure     — required files exist
  6. placeholders  — counts TODOs in agency/ (warning only)

Usage:
    python3 scripts/check_workspace.py            # check tracked files (git ls-files)
    python3 scripts/check_workspace.py --all      # also check untracked, non-ignored files
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _common import REPO_ROOT  # noqa: E402

SECRET_PATTERNS = {
    "AWS access key": re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    "GitHub token": re.compile(r"\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36,}\b|\bgithub_pat_[A-Za-z0-9_]{50,}\b"),
    "Anthropic API key": re.compile(r"\bsk-ant-[A-Za-z0-9_-]{20,}"),
    "OpenAI-style API key": re.compile(r"\bsk-(?:proj-)?[A-Za-z0-9]{32,}\b"),
    "Google API key": re.compile(r"\bAIza[0-9A-Za-z_-]{35}\b"),
    "Slack token": re.compile(r"\bxox[abprs]-[A-Za-z0-9-]{10,}"),
    "Stripe live key": re.compile(r"\b[sr]k_live_[A-Za-z0-9]{20,}\b"),
    "Private key block": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY"),
}

REQUIRED_FILES = [
    "CLAUDE.md",
    "README.md",
    ".gitignore",
    ".env.example",
    ".claude/settings.json",
    "agency/services.md",
    "agency/pricing.md",
    "clients/_template/brief.md",
    "templates/proposal.md",
    "templates/approval-request.md",
    "templates/qa-checklist.md",
    "leads/qualification-rubric.md",
    "docs/INSTALL.md",
    "docs/QUALITY.md",
    "docs/ROADMAP.md",
    "docs/STATUS.md",
    "docs/SAFETY.md",
    "web/starter/index.html",
]

REQUIRED_AGENTS = [
    "business-strategist", "brand-designer", "marketing-strategist", "lead-researcher",
    "copywriter", "web-developer", "automation-engineer", "quality-analyst",
]

LINK_RE = re.compile(r"(?<!!)\[[^\]]*\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)")
FENCE_RE = re.compile(r"```.*?```", re.S)
BINARY_SUFFIXES = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".pdf", ".zip", ".woff", ".woff2",
                   ".ttf", ".otf", ".docx", ".xlsx", ".pptx", ".so", ".pyc"}
MAX_SCAN_BYTES = 2_000_000


@dataclass
class Report:
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    files_checked: int = 0

    def error(self, msg: str) -> None:
        self.errors.append(msg)

    def warn(self, msg: str) -> None:
        self.warnings.append(msg)


def list_files(root: Path, include_untracked: bool) -> list[str]:
    """Files to check, as POSIX paths relative to root."""
    if (root / ".git").exists():
        cmd = ["git", "-C", str(root), "ls-files", "-z", "--cached"]
        if include_untracked:
            cmd += ["--others", "--exclude-standard"]
        out = subprocess.run(cmd, capture_output=True, check=True).stdout.decode("utf-8")
        return sorted({p for p in out.split("\0") if p and (root / p).is_file()})
    # Not a git repo (e.g. tests): walk everything except .git
    return sorted(p.relative_to(root).as_posix() for p in root.rglob("*") if p.is_file() and ".git" not in p.parts)


def third_party_skills(root: Path) -> set[str]:
    lock = root / "skills-lock.json"
    if not lock.is_file():
        return set()
    try:
        return set(json.loads(lock.read_text(encoding="utf-8")).get("skills", {}))
    except (json.JSONDecodeError, AttributeError):
        return set()


def is_third_party(rel: str, third_party: set[str]) -> bool:
    parts = rel.split("/")
    return len(parts) > 2 and parts[0] == ".claude" and parts[1] == "skills" and parts[2] in third_party


def check_secrets(root: Path, files: list[str], report: Report) -> None:
    for rel in files:
        path = root / rel
        if path.suffix.lower() in BINARY_SUFFIXES or path.stat().st_size > MAX_SCAN_BYTES:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        for label, pattern in SECRET_PATTERNS.items():
            for match in pattern.finditer(text):
                line = text.count("\n", 0, match.start()) + 1
                report.error(f"secrets: possible {label} in {rel}:{line} (value hidden)")


def check_private_data(files: list[str], report: Report) -> None:
    for rel in files:
        parts = rel.split("/")
        name = parts[-1]
        if parts[0] == "clients" and len(parts) > 1 and parts[1] not in ("_template", "README.md"):
            report.error(f"private data: client file is tracked by git: {rel}")
        elif rel.startswith("leads/data/") or (parts[0] == "leads" and name.endswith(".csv")):
            report.error(f"private data: lead data is tracked by git: {rel}")
        elif name == ".env" or (name.startswith(".env.") and name != ".env.example"):
            report.error(f"private data: env file is tracked by git: {rel}")


def parse_frontmatter(text: str) -> dict[str, str] | None:
    if not text.startswith("---"):
        return None
    end = text.find("\n---", 3)
    if end == -1:
        return None
    data: dict[str, str] = {}
    for line in text[3:end].splitlines():
        m = re.match(r"^([A-Za-z0-9_-]+):\s*(.*)$", line)
        if m:
            data[m.group(1)] = m.group(2).strip()
    return data


def check_frontmatter(root: Path, files: list[str], report: Report) -> None:
    fileset = set(files)
    seen: dict[tuple[str, str], str] = {}
    targets = [f for f in files if re.fullmatch(r"\.claude/agents/[^/]+\.md", f)]
    targets += [f for f in files if re.fullmatch(r"\.claude/skills/[^/]+/SKILL\.md", f)]
    for rel in targets:
        kind = "agent" if "/agents/" in rel else "skill"
        fm = parse_frontmatter((root / rel).read_text(encoding="utf-8"))
        if fm is None:
            report.error(f"frontmatter: missing or unterminated frontmatter in {rel}")
            continue
        name = fm.get("name", "")
        if not name:
            report.error(f"frontmatter: no 'name' in {rel}")
        if "description" not in fm:
            report.error(f"frontmatter: no 'description' in {rel}")
        elif not fm["description"]:
            report.warn(f"frontmatter: description in {rel} uses a multi-line value (not validated)")
        if name:
            key = (kind, name)
            if key in seen:
                report.error(f"frontmatter: duplicate {kind} name '{name}' in {rel} and {seen[key]}")
            seen[key] = rel
        folder = rel.split("/")[2]
        if kind == "skill" and folder.startswith("ryomen-") and name != folder:
            report.error(f"frontmatter: skill name '{name}' does not match folder '{folder}' in {rel}")
        if kind == "agent" and name and name != Path(rel).stem:
            report.error(f"frontmatter: agent name '{name}' does not match file name in {rel}")
    for agent in REQUIRED_AGENTS:
        if f".claude/agents/{agent}.md" not in fileset:
            report.error(f"structure: required agent missing: .claude/agents/{agent}.md")


def check_links(root: Path, files: list[str], third_party: set[str], report: Report) -> None:
    for rel in files:
        if not rel.endswith(".md") or is_third_party(rel, third_party):
            continue
        text = FENCE_RE.sub("", (root / rel).read_text(encoding="utf-8"))
        text = re.sub(r"`[^`\n]*`", "", text)
        for m in LINK_RE.finditer(text):
            target = m.group(1)
            if re.match(r"^[a-z][a-z0-9+.-]*:", target, re.I) or target.startswith("#"):
                continue
            path_part = target.split("#", 1)[0]
            if not path_part or "{{" in path_part or "<" in path_part:
                continue
            resolved = (root / rel).parent / path_part
            if not resolved.exists():
                report.error(f"links: broken link '{target}' in {rel}")


def check_structure(root: Path, report: Report) -> None:
    for rel in REQUIRED_FILES:
        if not (root / rel).is_file():
            report.error(f"structure: required file missing: {rel}")
    settings = root / ".claude" / "settings.json"
    if settings.is_file():
        try:
            json.loads(settings.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            report.error(f"structure: .claude/settings.json is not valid JSON: {exc}")


def check_placeholders(root: Path, report: Report) -> None:
    agency = root / "agency"
    if not agency.is_dir():
        return
    total = sum(p.read_text(encoding="utf-8").count("TODO") for p in agency.glob("*.md"))
    if total:
        report.warn(f"placeholders: {total} TODO item(s) in agency/ still need the owner's input")


def run_checks(root: Path, include_untracked: bool = False) -> Report:
    report = Report()
    files = list_files(root, include_untracked)
    third_party = third_party_skills(root)
    check_secrets(root, files, report)
    check_private_data(files, report)
    check_frontmatter(root, files, report)
    check_links(root, files, third_party, report)
    check_structure(root, report)
    check_placeholders(root, report)
    report.files_checked = len(files)
    return report


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Run Ryomen workspace safety and quality checks.")
    parser.add_argument("--all", action="store_true", help="also check untracked (non-ignored) files")
    parser.add_argument("--root", type=Path, default=REPO_ROOT, help=argparse.SUPPRESS)
    args = parser.parse_args(argv)

    report = run_checks(args.root.resolve(), args.all)
    for msg in report.errors:
        print(f"ERROR   {msg}")
    for msg in report.warnings:
        print(f"WARNING {msg}")
    print(f"\nChecked {report.files_checked} files: "
          f"{len(report.errors)} error(s), {len(report.warnings)} warning(s)")
    return 1 if report.errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
