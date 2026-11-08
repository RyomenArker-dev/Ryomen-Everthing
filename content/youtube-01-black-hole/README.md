# RYOMEN 07 · Script 01: "What Happens If You Fall Into a Black Hole?"

A long-form YouTube documentary (16:9, 1920×1080, 30 fps, about 6 min 52 s) made from script 01 of
`RYOMEN_07_Seven_YouTube_Scripts.docx`.

| File | What it is |
|---|---|
| `black-hole.mp4` | The finished video. It's too large for git, so it's kept out of the repo. Rebuild it with `./make_video.sh`. |
| `film.src.html` | The film, drawn entirely in code (no images, footage or AI art), plus its synthesized music score |
| `build.py` | Inlines `timeline.json` into `film.src.html` to produce `black-hole.html` |
| `script.json` | Script 01 split into 7 scenes and 68 narration lines |
| `timeline.json` | Scene times, line times and per-word times (word times come from Whisper) |
| `voiceover/` | The narration: Kokoro voice `bm_george` at 0.92 speed (open source, offline). `generate_voice.py` makes it. |
| `make_video.sh` | Renders the film and score, then mixes the voice on top and lowers the music under it |

## Suggested YouTube details (from the doc)
- **Title:** What Happens If You Fall Into a Black Hole? The Truth Is Terrifying.
- **Thumbnail text:** THERE IS NO ESCAPE.
- **Chapters:** 0:00 The hook · 0:41 What is a black hole? · 1:40 Approaching the event horizon ·
  2:50 Spaghettification · 3:59 What happens to time? · 4:53 What lies inside? · 5:59 The ending

## Checks run
- Whisper transcript of the narration against the script: 846 of 846 words, with only the spelling variants "traveling" and "center".
- Asset audit: CLEAN (the page loads and embeds nothing).
- Text-collision check: CLEAN across 4,130 sampled frames.
- Final video: Whisper transcribed the MP4 as 846 of 846 words. All 6 chapter cuts land within 16 ms of their sound; the low chapter swells into chapters 2 and 3 are 0.1–0.8 dB over the 6 dB sudden-jump limit, accepted as deliberate transitions. Levels peak at -2.1 dB.
- To rebuild after regenerating the voice, convert first: `ffmpeg -i voiceover/vo.wav voiceover/vo.flac`, then run `./make_video.sh`.

## Making the other six scripts
Use `docs/prompts/cinematic-documentary-video.md` in any Claude session, or ask Claude Code here.
