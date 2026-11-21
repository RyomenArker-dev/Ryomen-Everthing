import json
import os
import struct
import tempfile
import threading
import unittest
import urllib.parse
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

import helpers  # noqa: F401  (adds scripts/ to sys.path)
import instagram_post as ig


def fake_jpeg(w=1080, h=1350):
    sof = b"\xff\xc0" + struct.pack(">HBHHB", 17, 8, h, w, 3) + b"\x00" * 9
    return b"\xff\xd8" + sof + b"\xff\xd9"


FAKE_MP4 = b"\x00\x00\x00\x18ftypmp42" + b"\x00" * 64


class FakeInstagram(BaseHTTPRequestHandler):
    calls: list = []
    statuses: list = []

    def log_message(self, *a):
        pass

    def _send(self, obj, code=200):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path
        FakeInstagram.calls.append(("GET", path, {}, self.headers.get("Authorization")))
        if path.endswith("/me"):
            return self._send({"user_id": "1784", "username": "ryomen_test"})
        if path.startswith("/v27.0/c"):
            status = FakeInstagram.statuses.pop(0) if FakeInstagram.statuses else "FINISHED"
            return self._send({"status_code": status})
        if path.endswith("/m99"):
            return self._send({"permalink": "https://www.instagram.com/p/abc/"})
        self._send({"error": {"message": "not found"}}, 404)

    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path
        n = int(self.headers.get("Content-Length") or 0)
        params = dict(urllib.parse.parse_qsl(self.rfile.read(n).decode()))
        FakeInstagram.calls.append(("POST", path, params, self.headers.get("Authorization")))
        if path.endswith("/media"):
            return self._send({"id": "c%d" % len(FakeInstagram.calls)})
        if path.endswith("/media_publish"):
            return self._send({"id": "m99"})
        self._send({"error": {"message": "bad"}}, 400)


class InstagramPostTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        os.environ["no_proxy"] = os.environ["NO_PROXY"] = "127.0.0.1,localhost"
        cls.server = HTTPServer(("127.0.0.1", 0), FakeInstagram)
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()
        cls.old_base = ig.API_BASE
        ig.API_BASE = "http://127.0.0.1:%d/v27.0" % cls.server.server_port

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        ig.API_BASE = cls.old_base

    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.folder = Path(self._tmp.name)
        FakeInstagram.calls, FakeInstagram.statuses = [], []
        self.files = {"https://cdn.example/a.jpg": fake_jpeg(), "https://cdn.example/b.jpg": fake_jpeg(),
                      "https://cdn.example/r.mp4": FAKE_MP4}
        self._old_download = ig.download
        ig.download = lambda url: self.files[url]

    def tearDown(self):
        ig.download = self._old_download
        self._tmp.cleanup()

    def write_post(self, **over):
        post = {"type": "image", "caption": "Fresh bread daily #bakery",
                "media": [{"kind": "image", "url": "https://cdn.example/a.jpg", "alt_text": "Loaf"}]}
        post.update(over)
        (self.folder / "post.json").write_text(json.dumps(post))
        return post

    def publish(self):
        return ig.cmd_publish(self.folder, sleep=lambda s: None)

    def posts_made(self):
        return [c for c in FakeInstagram.calls if c[1].endswith("/media_publish")]

    def test_refuses_without_approval(self):
        self.write_post()
        with self.assertRaisesRegex(ig.PostError, "not approved"):
            self.publish()
        self.assertEqual(FakeInstagram.calls, [])

    def test_image_publish_flow(self):
        self.write_post()
        ig.cmd_approve(self.folder, "Owner")
        result = self.publish()
        self.assertEqual(result["media_id"], "m99")
        self.assertEqual(result["permalink"], "https://www.instagram.com/p/abc/")
        create = [c for c in FakeInstagram.calls if c[1] == "/v27.0/1784/media"][0]
        self.assertEqual(create[2]["image_url"], "https://cdn.example/a.jpg")
        self.assertEqual(create[2]["caption"], "Fresh bread daily #bakery")
        self.assertEqual(create[2]["alt_text"], "Loaf")
        self.assertTrue(all(c[3].startswith("Bearer ") for c in FakeInstagram.calls))
        self.assertTrue((self.folder / "published.json").is_file())
        self.assertFalse((self.folder / "publish-attempt.json").exists())

    def test_never_posts_twice(self):
        self.write_post()
        ig.cmd_approve(self.folder, "Owner")
        self.publish()
        with self.assertRaisesRegex(ig.PostError, "already published"):
            self.publish()
        self.assertEqual(len(self.posts_made()), 1)

    def test_caption_edit_after_approval_blocks(self):
        self.write_post()
        ig.cmd_approve(self.folder, "Owner")
        self.write_post(caption="Changed caption")
        with self.assertRaisesRegex(ig.PostError, "changed after approval"):
            self.publish()
        self.assertEqual(FakeInstagram.calls, [])

    def test_media_swap_after_approval_blocks(self):
        self.write_post()
        ig.cmd_approve(self.folder, "Owner")
        self.files["https://cdn.example/a.jpg"] = fake_jpeg(1080, 1080)
        with self.assertRaisesRegex(ig.PostError, "media file changed"):
            self.publish()

    def test_reel_waits_for_processing(self):
        self.write_post(type="reel", media=[{"kind": "video", "url": "https://cdn.example/r.mp4"}])
        ig.cmd_approve(self.folder, "Owner")
        FakeInstagram.statuses = ["IN_PROGRESS", "IN_PROGRESS", "FINISHED"]
        self.publish()
        create = [c for c in FakeInstagram.calls if c[1] == "/v27.0/1784/media"][0]
        self.assertEqual(create[2]["media_type"], "REELS")
        self.assertEqual(len([c for c in FakeInstagram.calls if c[1].startswith("/v27.0/c")]), 3)

    def test_failed_processing_publishes_nothing(self):
        self.write_post(type="reel", media=[{"kind": "video", "url": "https://cdn.example/r.mp4"}])
        ig.cmd_approve(self.folder, "Owner")
        FakeInstagram.statuses = ["ERROR"]
        with self.assertRaisesRegex(ig.PostError, "ERROR"):
            self.publish()
        self.assertEqual(self.posts_made(), [])
        with self.assertRaisesRegex(ig.PostError, "did not finish"):
            self.publish()

    def test_carousel_creates_children(self):
        self.write_post(type="carousel", media=[{"kind": "image", "url": "https://cdn.example/a.jpg"},
                                                {"kind": "image", "url": "https://cdn.example/b.jpg"}])
        ig.cmd_approve(self.folder, "Owner")
        self.publish()
        creates = [c for c in FakeInstagram.calls if c[1] == "/v27.0/1784/media"]
        self.assertEqual([c[2].get("is_carousel_item") for c in creates[:2]], ["true", "true"])
        self.assertEqual(creates[2][2]["media_type"], "CAROUSEL")
        self.assertEqual(len(creates[2][2]["children"].split(",")), 2)

    def test_validation(self):
        cases = [
            ({"caption": "x" * 2201}, "2201 characters"),
            ({"caption": " ".join("#t%d" % i for i in range(31))}, "hashtags"),
            ({"caption": "TODO: write"}, "TODO"),
            ({"media": [{"kind": "image", "url": "http://insecure/a.jpg"}]}, "https://"),
            ({"type": "reel"}, "needs kind video"),
            ({"type": "carousel"}, "2-20"),
        ]
        for over, msg in cases:
            with self.subTest(msg=msg):
                self.write_post(**over)
                with self.assertRaisesRegex(ig.PostError, msg):
                    ig.cmd_check(self.folder, fetch=False)

    def test_media_checks(self):
        self.assertEqual(ig.jpeg_size(fake_jpeg(1080, 1350)), (1080, 1350))
        self.assertTrue(ig.check_media_bytes("image", b"\x89PNG....", "m"))
        self.assertTrue(ig.check_media_bytes("image", fake_jpeg(1080, 1920), "m"))  # 9:16 too tall for feed
        self.assertEqual(ig.check_media_bytes("image", fake_jpeg(1080, 1080), "m"), [])
        self.assertEqual(ig.check_media_bytes("video", FAKE_MP4, "m"), [])


if __name__ == "__main__":
    unittest.main()
