---
name: ryomen-copywriting
description: Ryomen copywriting workflow — website pages, landing pages, ads, social captions and client emails drafted from the client brief with supportable claims only, saved in the client folder and marked DRAFT — NOT SENT. Use for any copy or client communication draft.
---

# Ryomen — Copywriting

## Steps
1. Read `clients/<slug>/brief.md`, brand voice in `clients/<slug>/brand/`, and the website or
   campaign brief if it exists.
2. Confirm: page/asset, audience, single goal (one primary CTA), proof available.
3. Draft:
   - **Web page:** headline options (3, with angle), subhead, sections with H2s, CTA, meta title
     (≤ 60 chars) and meta description (≤ 155 chars). Save `clients/<slug>/website/copy/<page>.md`.
   - **Ads/social:** variants per platform limits; save in `clients/<slug>/campaigns/`.
   - **Client email/message:** subject, body, CTA; header line `DRAFT — NOT SENT`; save in
     `clients/<slug>/docs/drafts/YYYY-MM-DD-<topic>.md`.
4. Proof check: every claim maps to the brief or a cited source. Otherwise
   `TODO: need proof for "<claim>"`.
5. Run `ryomen-quality-check`. Sending → `ryomen-approval-gate`.

## Style
Specific over clever. Short sentences. Customer's words. No "in today's fast-paced world",
"it's not X, it's Y", "unlock", "elevate", or triple lists by reflex. No fake testimonials.

## Deeper skills
`copywriting`, `copy-editing`, `emails`, `ad-creative`, `social`, `marketing-psychology`.
