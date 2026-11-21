---
name: ryomen-instagram-publish
description: Ryomen Instagram posting workflow. Prepare an image, Reel or carousel post folder, show the owner a preview, record the owner's approval of that exact post, then publish it once through Instagram's official API with scripts/instagram_post.py. Use when the owner asks to post, schedule or publish to Instagram, or to "automate Instagram".
---

# Ryomen — Instagram publishing

Posting is outbound (CLAUDE.md S2/S3): **every post needs the owner's explicit approval of that
exact post**. The script enforces it: approval fingerprints the caption, settings and media bytes,
and `publish` refuses if anything changed, and never posts the same folder twice.
`approve` and `publish` are also set to "ask" in `.claude/settings.json`.

Setup (once): see `docs/INSTAGRAM.md`.

## Steps
1. **Folder.** Agency account: `agency/social/instagram/posts/YYYY-MM-DD-<topic>/`.
   Client account: `clients/<slug>/social/instagram/posts/YYYY-MM-DD-<topic>/` (git-ignored, S5/S8;
   client consent to post on their account must be recorded in `clients/<slug>/log.md`).
2. **Content.** Draft the caption with `ryomen-copywriting` / `social`; make media with the image or
   video skills. Copy `templates/instagram-post.json` to `<folder>/post.json` and fill it.
   Facts in captions follow S4 (no invented claims, prices, reviews).
3. **Media link.** Instagram fetches media from a public `https://` URL at posting time (images:
   JPEG, ≤ 8 MB, 320–1440 px wide, 4:5–1.91:1; Reels: MP4/MOV H.264, 3 s–15 min, ≤ 300 MB, 9:16).
   Ask the owner where it is hosted; never make files public without approval.
4. **Check:** `python3 scripts/instagram_post.py check <folder>` and fix every problem.
5. **Preview + approval.** Show the owner: account, post type, full caption, media links (and the
   media itself via SendUserFile when local). Ask with `ryomen-approval-gate`. Wait for a clear
   "approve" for **this** post. A general "post things" or approval of another post does not count.
6. **Record:** `python3 scripts/instagram_post.py approve <folder> --by "<owner name>" --note "<their words>"`
7. **Publish:** `python3 scripts/instagram_post.py publish <folder>` (try `--dry-run` first).
   Report the permalink from `published.json`. If it fails, report the error; do not retry blindly.
   If `publish-attempt.json` is left behind, ask the owner to check the account before anything else.

## Never
- Approve on the owner's behalf, or edit post.json / media after approval without re-approving.
- Print, log or commit the access token.
- Reply to comments or DMs (draft replies only).
