# Prompt: cinematic documentary video from a script doc (Ryomen style)

How to use: start a new Claude chat with **code execution / file creation turned on**. Attach your scripts
document (for example `RYOMEN_07_Seven_YouTube_Scripts.docx`). For results closest to the black hole video, also attach
`content/youtube-01-black-hole/film.src.html` from this repo as a style reference. Paste everything
between the lines below and change the first line to the script number you want.

---

Make script **No. [1]** from the attached document into a finished long-form YouTube documentary video. Follow this production method exactly. It's how my reference video "What Happens If You Fall Into a Black Hole?" was made.

## 0. Rules
- Work only from the attached document. Narrate the script's VOICEOVER lines exactly as written. Don't add facts, numbers or claims. If a line looks factually wrong, tell me before using it.
- Use no paid services and no API keys unless I give one. Every picture is drawn in code: no stock footage, no AI images, no fonts or images downloaded at render time.
- Tell me honestly what you ran and checked. If a tool is missing in your sandbox, say so and use the fallback below. Never claim a step worked unless you ran it.

## 1. Parse the script
Split the script into scenes ("Scene N — title (time)"), each scene's VISUAL DIRECTION, and its narration lines (one line per paragraph or sentence group). Save them as `script.json`.

## 2. Voice and timeline (the voice sets the timing of everything)
- TTS: Kokoro, open source and offline (`pip install kokoro-onnx soundfile`, model files `kokoro-v1.0.onnx` and `voices-v1.0.bin` from the kokoro-onnx GitHub releases). Voice `bm_george`, speed 0.92, lang `en-gb`: a deep, calm British documentary narrator.
- Generate one clip per line and trim leading and trailing silence. Join the clips with pauses: 1.2 s lead-in, 0.45 s between lines, 0.8 s after short punchy lines or questions, 1.6 s between scenes, 4.5 s after scene 1 for a title card, and a 5 s tail.
- Write `timeline.json`: each scene's from/to, each line's t0/t1, and per-word start times. Get word times by transcribing `vo.wav` with Whisper (`openai-whisper`, model small.en, word_timestamps) and matching the words to the script. Report the match rate. It should be above 99%; spelling variants like travelling/traveling don't matter.
- If the TTS model can't be downloaded, stop and tell me. Don't switch voices silently.

## 3. Look (keep it identical across all videos in this series)
- **Format:** 1920x1080, 30 fps, 16:9. The length is whatever the narration needs, about 7 minutes.
- **Palette:** night navy `#050b1c` and `#0a1630`; orange `#ff8a2a` as the accent; amber `#ffb45c` for labels; hot white `#fff1d6`; ice blue `#9cc8ff` as the secondary accent; red `#ff4a3a` only for danger.
- **Type:** Inter (or Helvetica/Arial). Labels in small caps, weight 700, letter-spacing 2–4 px.
- **Background in every scene:** a deep-space nebula (low-res fBm value noise in blues with faint warm patches, upscaled smoothly) and about 1,500 twinkling stars, 25% of them warm-tinted. Use a radial vignette. Everything is drawn with soft glows and additive light.
- **Hero objects are drawn properly, not as icons.** For example, a black hole needs a black shadow, a glowing photon ring, an accretion disk with a smooth gradient underlay plus ~1,700 short orbiting streaks (Doppler: the approaching side brighter), the far side of the disk bent up over the shadow, and real point-lens maths on the background stars (two images at (b ± √(b²+4E²))/2). Apply the same care to each script's subject: planets, atoms, brains, wave patterns and so on.
- **Chapter card** at each scene start, top left for about 5 s: an orange scene number, the title in white caps, and a short orange underline that draws on.
- **Concept tags**, top right: the key term of the moment (for example GRAVITATIONAL LENSING) in amber caps with an orange underline. One at a time.
- **Diagram labels** in small amber caps next to what they name. Use arrows, dashed circles, simple graphs (axes plus one curve that draws on) and clocks or counters wherever they explain a mechanism.
- **Subtitles:** the current narration line at the bottom centre, Inter 500 at 40 px, on a dark rounded band at 55% opacity, wrapped to at most 1,480 px. Words light up as spoken: grey before, amber while being said, white after. Use the per-word times.
- **Title card** after the hook. The video title in two lines of 76 px weight-800 caps, the second line orange, with an orange rule.
- **End card:** the script's closing question as a big two-line title, with a smaller "Tell us in the comments".

## 4. Direction
- Follow each scene's VISUAL DIRECTION, then split the scene into 3–5 shots keyed to the narration lines: the moment a line starts, its idea appears on screen. Every 5–10 s something new should happen: a camera push, a reveal, a label, a diagram step.
- The camera always moves slowly: push-ins, drifts, one big pull-back at the end. Scenes start with a short fade from black. Hard cuts happen within a scene.
- Show the mechanism, not just a label. For example: arrows on head and feet for tidal force; a body that stretches; clocks running at different rates; a curve of time rate against distance; puzzle pieces that don't fit for incompatible theories.
- Never invent statistics on screen. On-screen text may only repeat or summarise the script.

## 5. Engine
- Build one HTML page with a 1920x1080 canvas. `draw(frame)` must be a pure function of the frame number: no randomness at draw time (use a seeded RNG or hash), no requestAnimationFrame state. The timeline JSON is inlined into the page.
- Render with headless Chromium (Playwright): seek each frame, screenshot it, and pipe the frames to ffmpeg (H.264, yuv420p, CRF 23).
- If your sandbox can't run Chromium, port the same drawing code to Python with `skia-python` (or `pycairo`). Use `imageio-ffmpeg` for the ffmpeg binary.
- If rendering is slow or your session has time limits, render scene by scene into separate MP4s and join them with ffmpeg concat. Use 1280x720 for drafts.

## 6. Sound
- **Music:** synthesize a dark ambient score in code (Web Audio OfflineAudioContext, or numpy). Use a low D drone, filtered "space wind" noise, slow pads that change chord at each scene, a soft low swell landing exactly on each scene cut, and a sparse high shimmer. Fade in over 3 s and out over 4 s.
- **Mix:** narration on top. Duck the music under the voice (ffmpeg `sidechaincompress` threshold 0.03, ratio 8). Use a limiter at -1 dB.

## 7. Quality checks (run them all and report the results)
1. A contact sheet with one frame every 7 s. Look at it. Fix overlapping text, empty frames, unreadable labels, and objects that are off screen or blown out.
2. Automatic text-collision check every 0.1 s: record a bounding box for every piece of text and for key objects, and report any overlaps. It must be clean.
3. Whisper transcript of the final MP4 compared with the script: the words must match and each line must fall inside its scene.
4. Each scene cut lands within 100 ms of an audio onset, with no loudness jump above 6 dB.
5. The page loads nothing external: no network requests and no embedded images.

## 8. Deliver
- The MP4. If the file is too large for chat, give a 720p version and tell me.
- The page source, `script.json`, `timeline.json`, the voice clips and a short README listing what you checked and what you could not.
- Suggested YouTube title, thumbnail text and chapter timestamps taken from `timeline.json`.

Start with script No. [1]. When it's done, ask me before starting the next one.

---

## Notes for the owner
- A normal chat session may not have Chromium or permission to download the voice model. The prompt tells Claude to fall back to `skia-python` or to stop and ask you. Results depend on what that sandbox allows.
- For the closest match to the black hole video, attach `film.src.html` from `content/youtube-01-black-hole/`. It holds the actual drawing code (black hole, stars, lensing, subtitles, chapter cards, score), which Claude can reuse instead of rewriting.
- For another voice, ElevenLabs works too. Give the key in a project's settings or environment, never in chat.
