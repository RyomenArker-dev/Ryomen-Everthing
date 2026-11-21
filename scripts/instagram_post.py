#!/usr/bin/env python3
"""Publish an approved Instagram post through Instagram's official API (Python stdlib only).

Every post lives in its own folder with a post.json (see templates/instagram-post.json):

    python3 scripts/instagram_post.py check   <post-folder>            # validate caption + media
    python3 scripts/instagram_post.py approve <post-folder> --by NAME  # owner approved this exact post
    python3 scripts/instagram_post.py publish <post-folder>            # posts it, once
    python3 scripts/instagram_post.py account                          # who am I + publishing quota

Safety (CLAUDE.md S2/S3):
- publish refuses unless approval.json matches the post exactly: the caption, settings and the
  bytes of every media file are fingerprinted at approval and checked again before posting.
- publish refuses to post the same folder twice (published.json / publish-attempt.json).
- The access token is never printed. In a Claude Code cloud session it is a network secret for
  graph.instagram.com that the proxy injects; locally it is read from IG_ACCESS_TOKEN.

API facts (Meta docs, checked 2026-11-21, Instagram API with Instagram Login, v27.0):
https://developers.facebook.com/docs/instagram-platform/content-publishing/
Media must be at a public URL; Instagram downloads it when the container is created.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import struct
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

API_BASE = os.environ.get("IG_API_BASE", "https://graph.instagram.com/v27.0").rstrip("/")
POLL_SECONDS = float(os.environ.get("IG_POLL_SECONDS", "30"))
MAX_POLLS = 10  # 30 s x 10 = 5 minutes, as Meta recommends

CAPTION_MAX = 2200
HASHTAGS_MAX = 30
MENTIONS_MAX = 20
IMAGE_MAX_BYTES = 8 * 1024 * 1024
VIDEO_MAX_BYTES = 300 * 1024 * 1024
TYPES = {"image", "reel", "carousel"}


class PostError(Exception):
    """A problem the owner can fix; printed without a traceback."""


# ---------------------------------------------------------------- post files

def load_post(folder: Path) -> dict:
    path = folder / "post.json"
    if not path.is_file():
        raise PostError(f"{path} not found")
    try:
        post = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        raise PostError(f"post.json is not valid JSON: {e}") from None
    return post


def fingerprint(post: dict) -> str:
    canonical = json.dumps(post, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def validate_post(post: dict) -> list[str]:
    """Return a list of problems (empty = fine). Checks only what post.json says."""
    errs = []
    kind = post.get("type")
    if kind not in TYPES:
        errs.append(f"type must be one of {sorted(TYPES)}")
    caption = post.get("caption", "")
    if not isinstance(caption, str):
        errs.append("caption must be text")
        caption = ""
    if "TODO" in caption or "UNKNOWN" in caption:
        errs.append("caption still contains TODO/UNKNOWN")
    if len(caption) > CAPTION_MAX:
        errs.append(f"caption is {len(caption)} characters (max {CAPTION_MAX})")
    words = caption.split()
    if sum(w.startswith("#") for w in words) > HASHTAGS_MAX:
        errs.append(f"more than {HASHTAGS_MAX} hashtags")
    if sum(w.startswith("@") for w in words) > MENTIONS_MAX:
        errs.append(f"more than {MENTIONS_MAX} @mentions")
    media = post.get("media")
    if not isinstance(media, list) or not media:
        errs.append("media must be a list with at least one item")
        return errs
    want = {"image": (1, 1), "reel": (1, 1), "carousel": (2, 20)}.get(kind, (1, 20))
    if not want[0] <= len(media) <= want[1]:
        errs.append(f"a {kind} needs {want[0]}-{want[1]} media item(s), got {len(media)}")
    for i, item in enumerate(media, 1):
        url = (item or {}).get("url", "")
        if not url.startswith("https://"):
            errs.append(f"media {i}: url must be a public https:// link")
        k = (item or {}).get("kind")
        if k not in ("image", "video"):
            errs.append(f"media {i}: kind must be image or video")
        if kind == "image" and k != "image":
            errs.append("an image post needs kind image")
        if kind == "reel" and k != "video":
            errs.append("a reel needs kind video")
    return errs


def jpeg_size(data: bytes) -> tuple[int, int] | None:
    """Width/height from a baseline or progressive JPEG header, or None."""
    if data[:2] != b"\xff\xd8":
        return None
    i = 2
    while i + 9 < len(data):
        if data[i] != 0xFF:
            i += 1
            continue
        marker = data[i + 1]
        if marker in (0xC0, 0xC1, 0xC2):
            h, w = struct.unpack(">HH", data[i + 5:i + 9])
            return w, h
        if marker in (0xD8, 0x01) or 0xD0 <= marker <= 0xD7:
            i += 2
            continue
        (seglen,) = struct.unpack(">H", data[i + 2:i + 4])
        i += 2 + seglen
    return None


def check_media_bytes(kind: str, data: bytes, label: str) -> list[str]:
    errs = []
    if kind == "image":
        if len(data) > IMAGE_MAX_BYTES:
            errs.append(f"{label}: image is over 8 MB")
        size = jpeg_size(data)
        if size is None:
            errs.append(f"{label}: Instagram's API only accepts JPEG images")
        else:
            w, h = size
            ratio = w / h
            if not 320 <= w <= 1440:
                errs.append(f"{label}: width {w}px (must be 320-1440)")
            if not 0.8 - 1e-3 <= ratio <= 1.91 + 1e-3:
                errs.append(f"{label}: aspect ratio {w}x{h} (must be 4:5 to 1.91:1)")
    else:
        if len(data) > VIDEO_MAX_BYTES:
            errs.append(f"{label}: video is over 300 MB")
        if data[4:8] != b"ftyp":
            errs.append(f"{label}: does not look like an MP4/MOV file")
    return errs


def download(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "ryomen-instagram-check/1"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.read(VIDEO_MAX_BYTES + 1)
    except (urllib.error.URLError, OSError) as e:
        raise PostError(f"could not download {url}: {e}. Instagram must be able to fetch it publicly.") from None


def media_hashes(post: dict) -> tuple[list[str], list[str]]:
    hashes, errs = [], []
    for i, item in enumerate(post["media"], 1):
        data = download(item["url"])
        errs += check_media_bytes(item["kind"], data, f"media {i}")
        hashes.append(hashlib.sha256(data).hexdigest())
    return hashes, errs


# ---------------------------------------------------------------- API

def token() -> str:
    # In cloud sessions the proxy replaces this header with the saved network secret.
    return os.environ.get("IG_ACCESS_TOKEN", "").strip() or "proxy-injected"


def api(method: str, path: str, params: dict | None = None) -> dict:
    url = API_BASE + path
    data = None
    if method == "GET" and params:
        url += "?" + urllib.parse.urlencode(params)
    elif params:
        data = urllib.parse.urlencode(params).encode()
    req = urllib.request.Request(url, data=data, method=method,
                                 headers={"Authorization": "Bearer " + token()})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e:
        try:
            msg = json.loads(e.read()).get("error", {}).get("message", "")
        except Exception:
            msg = ""
        hint = " Check the access token (network secret for graph.instagram.com)." if e.code in (401, 403) else ""
        raise PostError(f"Instagram API {method} {path} failed: HTTP {e.code} {msg}{hint}") from None
    except urllib.error.URLError as e:
        raise PostError(f"could not reach Instagram API: {e.reason}") from None


def wait_finished(container_id: str, sleep=time.sleep) -> None:
    for n in range(MAX_POLLS):
        status = api("GET", f"/{container_id}", {"fields": "status_code"}).get("status_code")
        if status == "FINISHED":
            return
        if status in ("ERROR", "EXPIRED"):
            raise PostError(f"Instagram could not process media container {container_id}: {status}")
        if n < MAX_POLLS - 1:
            sleep(POLL_SECONDS)
    raise PostError(f"media container {container_id} still not ready after {MAX_POLLS} checks; nothing was published")


def create_container(user_id: str, post: dict, sleep=time.sleep) -> str:
    kind, media, caption = post["type"], post["media"], post.get("caption", "")
    if kind == "image":
        item = media[0]
        params = {"image_url": item["url"], "caption": caption}
        if item.get("alt_text"):
            params["alt_text"] = item["alt_text"]
    elif kind == "reel":
        params = {"media_type": "REELS", "video_url": media[0]["url"], "caption": caption,
                  "share_to_feed": "true" if post.get("share_to_feed", True) else "false"}
        if post.get("cover_url"):
            params["cover_url"] = post["cover_url"]
    else:
        children = []
        for item in media:
            p = {"is_carousel_item": "true"}
            if item["kind"] == "image":
                p["image_url"] = item["url"]
                if item.get("alt_text"):
                    p["alt_text"] = item["alt_text"]
            else:
                p.update(media_type="VIDEO", video_url=item["url"])
            cid = api("POST", f"/{user_id}/media", p)["id"]
            wait_finished(cid, sleep)
            children.append(cid)
        params = {"media_type": "CAROUSEL", "children": ",".join(children), "caption": caption}
    cid = api("POST", f"/{user_id}/media", params)["id"]
    wait_finished(cid, sleep)
    return cid


# ---------------------------------------------------------------- commands

def now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def cmd_check(folder: Path, fetch: bool = True) -> dict:
    post = load_post(folder)
    errs = validate_post(post)
    if errs:
        raise PostError("post.json problems:\n  - " + "\n  - ".join(errs))
    hashes = []
    if fetch:
        hashes, errs = media_hashes(post)
        if errs:
            raise PostError("media problems:\n  - " + "\n  - ".join(errs))
    return {"post": post, "fingerprint": fingerprint(post), "media_sha256": hashes}


def cmd_approve(folder: Path, by: str, note: str = "") -> dict:
    if not by.strip():
        raise PostError("--by is required: who approved this post")
    if (folder / "published.json").exists():
        raise PostError("this post was already published")
    info = cmd_check(folder)
    record = {"approved_by": by.strip(), "approved_at": now(), "note": note,
              "fingerprint": info["fingerprint"], "media_sha256": info["media_sha256"]}
    (folder / "approval.json").write_text(json.dumps(record, indent=2) + "\n", encoding="utf-8")
    return record


def cmd_publish(folder: Path, dry_run: bool = False, sleep=time.sleep) -> dict:
    if (folder / "published.json").exists():
        raise PostError("already published (published.json exists); refusing to post twice")
    if (folder / "publish-attempt.json").exists():
        raise PostError("an earlier publish attempt did not finish. Check the Instagram account by hand; "
                        "if the post is not there, delete publish-attempt.json and approve again")
    ap_path = folder / "approval.json"
    if not ap_path.is_file():
        raise PostError("not approved: no approval.json. The owner must approve this exact post first")
    approval = json.loads(ap_path.read_text(encoding="utf-8"))
    info = cmd_check(folder)
    if info["fingerprint"] != approval.get("fingerprint"):
        raise PostError("post.json changed after approval; approve it again")
    if info["media_sha256"] != approval.get("media_sha256"):
        raise PostError("a media file changed after approval; approve it again")
    if dry_run:
        return {"dry_run": True, "would_publish": info["post"]["type"], "approved_by": approval["approved_by"]}
    me = api("GET", "/me", {"fields": "user_id,username"})
    user_id = str(me.get("user_id") or me.get("id"))
    (folder / "publish-attempt.json").write_text(json.dumps({"started_at": now(), "account": me.get("username")}) + "\n")
    container = create_container(user_id, info["post"], sleep)
    media_id = api("POST", f"/{user_id}/media_publish", {"creation_id": container})["id"]
    try:
        permalink = api("GET", f"/{media_id}", {"fields": "permalink"}).get("permalink", "")
    except PostError:
        permalink = ""
    result = {"published_at": now(), "account": me.get("username"), "media_id": media_id,
              "permalink": permalink, "approved_by": approval["approved_by"]}
    (folder / "published.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    (folder / "publish-attempt.json").unlink()
    return result


def cmd_account() -> dict:
    me = api("GET", "/me", {"fields": "user_id,username,account_type"})
    user_id = str(me.get("user_id") or me.get("id"))
    limit = api("GET", f"/{user_id}/content_publishing_limit", {"fields": "quota_usage,config"})
    return {"username": me.get("username"), "account_type": me.get("account_type"), "publishing_limit": limit}


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    sub = p.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("check", help="validate a post folder")
    c.add_argument("folder", type=Path)
    c.add_argument("--no-fetch", action="store_true", help="skip downloading the media")
    a = sub.add_parser("approve", help="record the owner's approval of this exact post")
    a.add_argument("folder", type=Path)
    a.add_argument("--by", required=True)
    a.add_argument("--note", default="")
    pub = sub.add_parser("publish", help="publish an approved post")
    pub.add_argument("folder", type=Path)
    pub.add_argument("--dry-run", action="store_true")
    sub.add_parser("account", help="show the connected account and publishing quota")
    args = p.parse_args(argv)
    try:
        if args.cmd == "check":
            info = cmd_check(args.folder, fetch=not args.no_fetch)
            post = info["post"]
            print(f"OK: {post['type']} with {len(post['media'])} media item(s), caption {len(post.get('caption', ''))} chars")
            print("Caption:\n" + post.get("caption", ""))
        elif args.cmd == "approve":
            r = cmd_approve(args.folder, args.by, args.note)
            print(f"Approved by {r['approved_by']} at {r['approved_at']} (fingerprint {r['fingerprint'][:12]})")
        elif args.cmd == "publish":
            print(json.dumps(cmd_publish(args.folder, args.dry_run), indent=2))
        else:
            print(json.dumps(cmd_account(), indent=2))
    except PostError as e:
        print("Error: " + str(e), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
