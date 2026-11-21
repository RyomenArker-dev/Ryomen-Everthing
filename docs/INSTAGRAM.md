# Instagram posting: one-time setup

`scripts/instagram_post.py` publishes posts **you have approved one by one** through Instagram's
official, free API ("Instagram API with Instagram Login"). The workflow is in the
`ryomen-instagram-publish` skill.

Facts below are from Meta's developer docs, checked 2026-11-21:
https://developers.facebook.com/docs/instagram-platform/content-publishing/ and
https://developers.facebook.com/documentation/instagram-platform/overview.
Meta renames dashboard menus often, so the exact button names may differ (UNVERIFIED wording).

## 1. Make the Instagram account professional
In the Instagram app: **Settings → Account type and tools → Switch to professional account**
(Business or Creator). It's free. A Facebook Page is **not** needed for this API.

## 2. Create a free Meta developer app
1. Go to https://developers.facebook.com, log in, and register as a developer (free).
2. **My Apps → Create app**, and pick the use case for managing content on Instagram.
3. Open **Instagram → API setup with Instagram login**.
4. Under **Generate access tokens**, add your Instagram account and log in. Allow
   `instagram_business_basic` and `instagram_business_content_publish`.
5. Copy the token it shows. **Do not paste it into chat.**

While the app is in development mode it works for accounts that have a role on the app (your own
account). Posting to **client** accounts needs their written consent, recorded in
`clients/<slug>/log.md`. It may also need them added as testers, or Meta's App Review
(UNVERIFIED, check the dashboard).

## 3. Save the token in the cloud environment
In the Claude app, open the environment menu in the session's title bar, tap **Edit** and then
**Network secrets**, and add:
- **Host:** `graph.instagram.com`
- **Header:** `Authorization`, with the prefix **Bearer**
- **Value:** the token

Or ask Claude to "open the form for the Instagram token". Start a new session, then test with:
```bash
python3 scripts/instagram_post.py account
```
On your own computer, set `IG_ACCESS_TOKEN` in your shell instead (never in a committed file).

**The token lasts 60 days.** Set a reminder. Generate a new one in the dashboard and replace the
secret before it expires.

## 4. Where the photos and videos live
Instagram downloads each file from a **public `https://` link** when the post is created. It
can't take a file straight from this repo. Free options:
- The client's or agency's own website hosting (upload the file, use its link).
- A separate **public** GitHub repo just for approved post media (e.g. `ryomen-media`), linked
  through `raw.githubusercontent.com`. Anything in it is public, so only put approved,
  ready-to-post files there. Claude asks before creating or pushing to it.

Limits: images must be JPEG, ≤ 8 MB, 320–1440 px wide, 4:5 to 1.91:1. Reels must be MP4/MOV
H.264 + AAC, 3 s–15 min, ≤ 300 MB, 9:16 recommended. A carousel has 2–20 items. Captions take
≤ 2,200 characters, 30 hashtags and 20 @mentions. An account can publish up to 100 posts per
24 hours (the docs also give 50 in places).

## What is and isn't tested
- Tested: 10 unit tests against a fake Instagram server. They cover image, Reel and carousel
  flows, refusing without approval, refusing after an edit or media swap, never posting twice,
  and failed processing publishing nothing.
- **Not tested: posting to a real Instagram account.** Do a first real post as a test on your own
  account.
