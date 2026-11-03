import tempfile
import unittest
from pathlib import Path

from helpers import make_workspace

import new_client  # noqa: E402
import new_proposal  # noqa: E402


class NewProposalTests(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.root = make_workspace(Path(self._tmp.name))
        new_client.create_client(self.root, "acme-bakery", "Acme Bakery")

    def tearDown(self):
        self._tmp.cleanup()

    def test_services_parsed_from_catalogue(self):
        services = new_proposal.load_services(self.root)
        self.assertEqual(set(services), {"brand", "website", "social", "seo", "leads", "automation"})

    def test_creates_proposal_with_selected_services_only(self):
        out = new_proposal.create_proposal(self.root, "acme-bakery", ["website", "seo"], on_date="2026-02-03")
        self.assertEqual(out, self.root / "clients/acme-bakery/docs/2026-02-03-proposal.md")
        text = out.read_text()
        self.assertIn("# Proposal — Acme Bakery", text)
        self.assertIn("Website design & development", text)
        self.assertIn("SEO & digital marketing", text)
        self.assertNotIn("Social media management", text)
        self.assertNotIn("{{", text)
        self.assertIn("DRAFT — NOT SENT", text)

    def test_prices_are_not_invented(self):
        text = new_proposal.create_proposal(self.root, "acme-bakery", ["website"], on_date="2026-02-03").read_text()
        self.assertIn("TODO: owner to set", text)
        self.assertNotRegex(text, r"[$£€₹]\s?\d")

    def test_refuses_overwrite(self):
        new_proposal.create_proposal(self.root, "acme-bakery", ["brand"], on_date="2026-02-03")
        with self.assertRaises(FileExistsError):
            new_proposal.create_proposal(self.root, "acme-bakery", ["brand"], on_date="2026-02-03")

    def test_errors(self):
        with self.assertRaises(FileNotFoundError):
            new_proposal.create_proposal(self.root, "no-such-client", ["brand"])
        with self.assertRaises(ValueError):
            new_proposal.create_proposal(self.root, "acme-bakery", ["nonsense"])
        with self.assertRaises(ValueError):
            new_proposal.create_proposal(self.root, "acme-bakery", [])
        with self.assertRaises(ValueError):
            new_proposal.create_proposal(self.root, "../acme", ["brand"])

    def test_cli(self):
        root = str(self.root)
        self.assertEqual(new_proposal.main(["--list-services", "--root", root]), 0)
        self.assertEqual(new_proposal.main(["acme-bakery", "--services", "social", "--root", root]), 0)
        self.assertEqual(new_proposal.main(["acme-bakery", "--services", "bogus", "--root", root]), 1)


if __name__ == "__main__":
    unittest.main()
