# Type I to Type VII civilisations (Kardashev scale explainer, 16:9)

Made on 2026-11-19 with the `explainroo` skill. Free local voice (Kokoro `af_heart`), music
and sound effects by explainroo, every picture drawn in code. No paid services were used.

- `out/` holds the rendered video, subtitles, chapters and cover after `explainroo render .`
  (git-ignored by explainroo's own `.gitignore`; rebuild with the commands below).
- `script.md` is the narration, `scenes.js` the pictures, `video.json` the settings.

Rebuild (explainroo is not installed in the repo):

```bash
ONNXRUNTIME_NODE_INSTALL_CUDA=skip npm install explainroo   # in a scratch folder
npx explainroo doctor --fetch
npx explainroo voice content/kardashev-scale
npx explainroo render content/kardashev-scale
```

## Accuracy: what is real science and what is not

| Type | Status | What the video says | Source |
|---|---|---|---|
| I, II, III | **Kardashev (1964)** | planet, star, galaxy | Kardashev, N. S. (1964). *Transmission of Information by Extraterrestrial Civilizations.* Soviet Astronomy 8: 217 |
| Watts for I, II, III | **Sagan (1973)** | 10¹⁶, 10²⁶, 10³⁶ W, ×10 billion per step | Sagan's formula K = (log₁₀ P − 6) / 10, from *The Cosmic Connection* (1973), as given on Wikipedia; the three values are worked out from the formula |
| Humanity | estimate | 18.87 TW in 2021, about Type 0.73 | BP Statistical Review of World Energy 2022, as cited on Wikipedia |
| IV | **speculative** | beyond the galaxy (Kaku: extragalactic energy); popular: the universe | Michio Kaku, *Physics of the Future* (2011), as cited on Wikipedia |
| V | **speculative** | popular: a multiverse; Galántai's scale: "technically immortal" | Zoltán Galántai's survival-based scale, as cited on Wikipedia |
| VI, VII | **not defined in science** | popular lists: masters space and time / creates universes | No scientific source found. John Barrow mentions "Type VI" in a different scale; Type VII appears in no source checked |

Main source checked: <https://en.wikipedia.org/wiki/Kardashev_scale> (read 2026-11-19).
**UNVERIFIED:** I read the primary sources (Kardashev 1964, Sagan 1973, Kaku 2011, Galántai)
only as Wikipedia cites them. Check them before publishing for a client.

- The Dyson sphere (Freeman Dyson, 1960, *Science*) is given from general knowledge, not
  from the page above. UNVERIFIED.
- "Billions of stars" for a galaxy is deliberately loose. The Milky Way has about
  100 to 400 billion stars.

## Not included
- A human or paid voice. To switch to ElevenLabs (already approved, key on the cloud
  environment), set the voice in `video.json` (`explainroo docs voices`) and run `voice` again.
  It costs credits (S6).
- Captions burnt into the picture (16:9 gets none by default). The `.srt` subtitles are in `out/`.
