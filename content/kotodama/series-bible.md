# KOTODAMA (言霊) — Series Bible

Original IP of Ryomen AI Agency. Created 2026-11-10. All characters, story and
assets are our own work — no third-party anime footage, music or characters.

## Format

| Spec | Value |
|---|---|
| Platform | Instagram Reels (also YouTube Shorts, TikTok) |
| Episodes | 20 (one season) |
| Length | 30.0 seconds each, exactly |
| Resolution | 1080×1920 (9:16), 30 fps, H.264 + AAC |
| Music grid | 160 BPM — beat 0.375 s, bar 1.5 s, 20 bars per episode. All cuts land on bar lines. |
| Audio | Original synthesised track per episode (Node DSP pipeline, royalty-free by construction), -14 LUFS |
| Title pattern | `EP NN — <kanji> <ENGLISH WORD>` (e.g. `EP 01 — 筆 THE BRUSH`) |

## Premise (one line)

A young sign-painter inherits a cursed brush: every kanji he writes becomes
real — but each word costs him one memory.

## Characters

### Ren Kurogane (黒鉄 蓮) — protagonist
- 19, dropout sign-painter in a fading downtown district; paid his
  grandfather's hospital bills by lettering shop signs.
- Cocky surface, meticulous underneath; redoes brush strokes nobody would notice.
- Finds the cursed brush sealed inside his grandfather's unfinished last sign.
- Arc: a guy who acts like nothing matters, quietly erasing the only things
  that do. He must learn to say what he feels *before* the brush takes the
  memory of why he felt it.
- Visual: tall lean silhouette, paint-spattered work jacket, glowing brush
  carried like a sword across the back. A streak of white in his hair spreads
  each time he pays a big cost — a visible "health bar" of how much of himself
  is left.

### Saya (沙夜) — rival, Arc 2+
- Shrine calligrapher. Pays word-costs with *other people's* memories.
- Considers Ren's self-sacrifice naive, not noble. Ideological rivalry.
- Ep 14: breaks her own code — pays with her memories of Ren to save him.

### The Word-Eater — season villain, Arc 3+
- A formless thing that eats written words; signs, books and names vanish.
- Reveal (Ep 13): the brush created it from every memory Ren sacrificed.

## Power rules (keep consistent)

1. A written kanji becomes the thing it names, for seconds.
2. The cost is one memory, proportional to the word's power.
3. The writer does not choose which memory. The brush does.
4. What was written in ink can be unwritten — at double the cost.
5. The forbidden kanji 無 (nothing) unmakes its target — and its writer.

## Season arc — 20 episodes

### Arc 1 — The Brush Awakens (1–5)
1. 筆 The Brush — grandfather's death; the brush writes back.
2. 斬 Cut — first technique; he doesn't remember learning it.
3. 炎 Flame — saves a stranger; loses the memory of his grandfather's voice.
4. 盾 Shield — the cost scales with the word's power.
5. 影 Shadow — someone else is writing kanji in the city.

### Arc 2 — The Rival Scribe (6–10)
6. 敵 Enemy — Saya; she pays with other people's memories.
7. 速 Speed — first duel, lost.
8. 鏡 Mirror — her technique copies his; write what can't be copied.
9. 雷 Thunder — he wins but forgets his own name.
10. 名 Name — Saya returns it. Uneasy alliance.

### Arc 3 — The Word-Eater (11–15)
11. 蝕 Devour — words start vanishing city-wide.
12. 静 Silence — it erases the kanji for "sound"; episode plays without music
    until the final hit.
13. 忘 Forget — the Word-Eater is made of Ren's sacrificed memories.
14. 絆 Bond — Saya pays with her memories of Ren to save him.
15. 夢 Dream — inside the Word-Eater: everything he gave up.

### Arc 4 — The Final Word (16–20)
16. 戦 War — every past kanji returns on screen at once.
17. 壊 Break — the brush splinters mid-fight.
18. 無 Nothing — the forbidden kanji.
19. 終 The End — he writes it. White screen. Silence.
20. 始 Beginning — a child finds the repaired brush. It writes: "his name
    was…" — and for the first time, the brush remembers. Season 2 hook.

## Visual style guide

- Palette: sumi ink black `#0d0b09`, washi paper `#e8ddc8` (used inverted —
  dark paper, light ink for night scenes), vermilion seal red `#c3272b`,
  gold accent `#c9a227`. Ren's brush glow: cold white-blue `#bcd8e8`.
- Textures: paper grain, ink wash gradients, splatter particles, scanline-free
  (no CRT look — this is ink, not glitch; glitch is reserved for the
  Word-Eater's corruption from Ep 11).
- Type: Noto Serif JP 900 for kanji (brush-serif), Archivo Black for English.
- Kanji reveals: progressive wipe with leading ink-splatter, as if being
  brushed on screen.
- Ren is always a silhouette. Never draw a face. The brush glow is the focus.
- Episode title card at the start (bars 1–2), next-episode card at the end
  (bars 19–20). Both follow the same layout every episode.

## Audio style guide

- 160 BPM, D hirajoshi scale (D, E♭, G, A, B♭) for plucked koto-style lead —
  the Japanese flavour. Phonk-style kick/808/hat engine for the drop.
- Every episode: intro (2 bars) → verse (5) → build (3) → drop (6) →
  breakdown (2) → outro (2 bars, final impact on bar 19).
- Ep 12 (静) intentionally breaks the formula: silence until 27.0 s.

## Production workflow (per episode)

1. Write `epNN-<slug>/script.md` from this bible (storyboard with bar timings).
2. Adapt the synth (`synth.js`) and canvas animation (`epNN.html`).
3. Spot-check frames via `tools/check.js`, render via `tools/render.js`,
   encode via ffmpeg (CRF 18, yuv420p, faststart).
4. Renders go to `content/kotodama/render/` (git-ignored); source is committed.
5. Quality check against this bible before delivery (consistency of palette,
   title cards, power rules, Ren's hair streak state).

## Continuity tracker

| After ep | White streak | Memories lost (shown on screen) |
|---|---|---|
| 1 | first strand appears | TBD in ep 2 (the brush took *something* — reveal later) |

Update this table every episode.
