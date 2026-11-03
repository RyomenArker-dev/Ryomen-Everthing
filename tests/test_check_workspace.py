import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

from helpers import REPO

import check_workspace  # noqa: E402
import new_client  # noqa: E402

FAKE_KEY = "AKIA" + "ABCDEFGHIJKLMNOP"  # split so this file itself doesn't trip the scanner


def git(root: Path, *args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["git", "-C", str(root), *args], capture_output=True, text=True)


class CheckWorkspaceUnitTests(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.root = Path(self._tmp.name)

    def tearDown(self):
        self._tmp.cleanup()

    def write(self, rel: str, text: str) -> None:
        path = self.root / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)

    def test_detects_secret_without_printing_it(self):
        self.write("notes.md", f"key = {FAKE_KEY}\n")
        report = check_workspace.Report()
        check_workspace.check_secrets(self.root, ["notes.md"], report)
        self.assertEqual(len(report.errors), 1)
        self.assertIn("AWS access key", report.errors[0])
        self.assertNotIn(FAKE_KEY, report.errors[0])

    def test_detects_private_key_block(self):
        self.write("k.txt", "-----BEGIN " + "RSA PRIVATE KEY-----\nabc\n")
        report = check_workspace.Report()
        check_workspace.check_secrets(self.root, ["k.txt"], report)
        self.assertEqual(len(report.errors), 1)

    def test_clean_file_passes(self):
        self.write("ok.md", "Nothing secret here. sk-short\n")
        report = check_workspace.Report()
        check_workspace.check_secrets(self.root, ["ok.md"], report)
        self.assertEqual(report.errors, [])

    def test_private_data_rules(self):
        report = check_workspace.Report()
        check_workspace.check_private_data(
            ["clients/acme/brief.md", "clients/_template/brief.md", "clients/README.md",
             "leads/data/x.md", "leads/pipeline.csv", "leads/README.md", ".env", ".env.example"],
            report,
        )
        self.assertEqual(len(report.errors), 4, report.errors)

    def test_frontmatter_validation(self):
        self.write(".claude/agents/good.md", "---\nname: good\ndescription: ok\n---\nbody")
        self.write(".claude/agents/bad.md", "no frontmatter")
        self.write(".claude/skills/ryomen-x/SKILL.md", "---\nname: ryomen-y\ndescription: d\n---\n")
        self.write(".claude/skills/other/SKILL.md", "---\nname: other\n---\n")
        files = [".claude/agents/good.md", ".claude/agents/bad.md",
                 ".claude/skills/ryomen-x/SKILL.md", ".claude/skills/other/SKILL.md"]
        report = check_workspace.Report()
        check_workspace.check_frontmatter(self.root, files, report)
        joined = "\n".join(report.errors)
        self.assertIn("missing or unterminated frontmatter in .claude/agents/bad.md", joined)
        self.assertIn("does not match folder", joined)
        self.assertIn("no 'description' in .claude/skills/other/SKILL.md", joined)
        self.assertIn("required agent missing", joined)

    def test_links(self):
        self.write("docs/a.md", "[ok](b.md) [anchor](b.md#x) [web](https://example.com) [bad](missing.md)\n"
                                "`[code](ignored.md)`\n```\n[fenced](ignored.md)\n```\n")
        self.write("docs/b.md", "# b")
        report = check_workspace.Report()
        check_workspace.check_links(self.root, ["docs/a.md", "docs/b.md"], set(), report)
        self.assertEqual(report.errors, ["links: broken link 'missing.md' in docs/a.md"])


class RealRepoTests(unittest.TestCase):
    def test_repository_passes_all_checks(self):
        report = check_workspace.run_checks(REPO)
        self.assertEqual(report.errors, [], "\n".join(report.errors))


class GitIgnoreIntegrationTests(unittest.TestCase):
    """A client created by new_client.py must be git-ignored, and the checker must catch force-adds."""

    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.root = Path(self._tmp.name)
        shutil.copy(REPO / ".gitignore", self.root / ".gitignore")
        shutil.copytree(REPO / "clients/_template", self.root / "clients/_template")
        git(self.root, "init", "-q")

    def tearDown(self):
        self._tmp.cleanup()

    def test_new_client_and_secrets_are_ignored(self):
        new_client.create_client(self.root, "demo", "Demo Co")
        (self.root / "leads/data").mkdir(parents=True)
        (self.root / "leads/data/pipeline.csv").write_text("a,b\n")
        (self.root / ".env").write_text("X=1\n")
        git(self.root, "add", "-A")
        tracked = git(self.root, "ls-files").stdout.split()
        self.assertTrue(any(p.startswith("clients/_template/") for p in tracked))
        self.assertFalse([p for p in tracked if p.startswith("clients/demo/")], tracked)
        self.assertNotIn("leads/data/pipeline.csv", tracked)
        self.assertNotIn(".env", tracked)

    def test_checker_flags_force_added_client_file(self):
        new_client.create_client(self.root, "demo", "Demo Co")
        git(self.root, "add", "-f", "clients/demo/brief.md")
        files = check_workspace.list_files(self.root, include_untracked=False)
        report = check_workspace.Report()
        check_workspace.check_private_data(files, report)
        self.assertEqual(report.errors, ["private data: client file is tracked by git: clients/demo/brief.md"])


if __name__ == "__main__":
    unittest.main()
