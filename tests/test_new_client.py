import tempfile
import unittest
from pathlib import Path

from helpers import make_workspace

import new_client  # noqa: E402  (path set by helpers)


class NewClientTests(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.root = make_workspace(Path(self._tmp.name))

    def tearDown(self):
        self._tmp.cleanup()

    def test_creates_folder_and_fills_placeholders(self):
        target = new_client.create_client(self.root, "acme-bakery", "Acme Bakery", created="2026-01-02")
        self.assertTrue((target / "brief.md").is_file())
        self.assertTrue((target / "docs" / "drafts").is_dir())
        brief = (target / "brief.md").read_text()
        self.assertIn("Acme Bakery", brief)
        self.assertIn("`acme-bakery`", brief)
        self.assertIn("2026-01-02", brief)
        for md in target.rglob("*.md"):
            self.assertNotIn("{{", md.read_text(), f"unfilled placeholder in {md}")

    def test_refuses_to_overwrite(self):
        new_client.create_client(self.root, "acme", "Acme")
        (self.root / "clients/acme/brief.md").write_text("real client notes")
        with self.assertRaises(FileExistsError):
            new_client.create_client(self.root, "acme", "Acme")
        self.assertEqual((self.root / "clients/acme/brief.md").read_text(), "real client notes")

    def test_rejects_bad_slugs(self):
        for slug in ["Acme", "acme bakery", "../evil", "acme--x", "-acme", "_template", ""]:
            with self.subTest(slug=slug), self.assertRaises(ValueError):
                new_client.create_client(self.root, slug, "Name")
        self.assertEqual(sorted(p.name for p in (self.root / "clients").iterdir()), ["_template"])

    def test_rejects_empty_name(self):
        with self.assertRaises(ValueError):
            new_client.create_client(self.root, "acme", "   ")

    def test_cli_exit_codes(self):
        self.assertEqual(new_client.main(["shop", "--name", "Shop", "--root", str(self.root)]), 0)
        self.assertEqual(new_client.main(["shop", "--name", "Shop", "--root", str(self.root)]), 1)
        self.assertEqual(new_client.main(["Bad Slug", "--name", "X", "--root", str(self.root)]), 1)


if __name__ == "__main__":
    unittest.main()
