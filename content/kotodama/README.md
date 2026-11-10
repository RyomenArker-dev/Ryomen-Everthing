# KOTODAMA (言霊)

Original 20-episode anime-style motion series for Instagram Reels.
30 seconds per episode, 1080×1920, fully generated in-house (canvas animation
rendered with Playwright + original synthesised music). No third-party
footage, characters or music — this is Ryomen AI Agency's own IP.

- `series-bible.md` — characters, power rules, 20-episode arc, style guides.
- `ep01-fude/` — Episode 1 「筆 — The Brush」: script, animation source,
  synth, fonts.
- `tools/` — shared frame-check and render scripts (Node + Playwright).
- `render/` — encoded MP4s and WAVs (git-ignored; rebuild from source).

## Rebuild an episode

```bash
cd content/kotodama
node ep01-fude/synth.js                          # writes render/ep01.wav
ffmpeg -y -i render/ep01.wav -af "loudnorm=I=-14:TP=-2:LRA=11,alimiter=limit=0.85:level=false" \
  -ar 48000 -c:a aac -b:a 192k render/ep01.m4a
node tools/render.js ep01-fude/ep01.html render/ep01-frames 900
ffmpeg -y -framerate 30 -i render/ep01-frames/f%04d.jpg -i render/ep01.m4a \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r 30 -c:a copy \
  -shortest -movflags +faststart "render/KOTODAMA EP01 The Brush 1080x1920.mp4"
```

Fonts are OFL-licensed Google Fonts subsets (Archivo Black, Noto Serif JP),
committed as woff2 so renders are reproducible offline.
