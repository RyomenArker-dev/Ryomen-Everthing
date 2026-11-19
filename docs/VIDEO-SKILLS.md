# Video skills from awesome-claude-video-skills

Installed on 2026-11-19 from the catalog <https://github.com/zhuyansen/awesome-claude-video-skills>
(checked 2026-11-19; it lists 526 repos). Only a curated set was installed. All skills are
third-party: **do not edit them** (see CLAUDE.md). Exact sources are in `skills-lock.json`.
`computedHash` for these entries is a SHA-256 over each skill folder's file paths and contents.

Status: installed and scanned for risky commands, **none run yet** (S9).

## Installed (45 skills from 13 repos)

| Repo | Licence | Skills | Notes |
|---|---|---|---|
| vincentsch/explainroo | MIT | `explainroo` | Catalog's #1 tested pick. Runs `npx --yes explainroo`; free local voice (Kokoro), ElevenLabs/Cartesia optional |
| remotion-dev/skills | No licence file (official Remotion skills, published for install) | 13 `remotion-*` skills | Remotion needs a company licence above a small team size; see `remotion-license` |
| echris6/motion-video-kit | MIT | `business-motion-film` | Business ads and launch films |
| howseen-ai/claude-motion-design | MIT | `motion-design` | Code-only motion pipeline |
| Barty-Bart/motion-graphics | MIT | `explainer-default`, `explainer-engaging`, `explainer-high-energy`, `motion-broll`, `object-separation`, `sound-effects` | `object-separation` downloads a SAM 2 model from Hugging Face on first run |
| charlie947/motion-graphics-skills | MIT | 14 skills (`brand-intake`, `motion-effects`, `reel-export`, `vox-explainer`, …) | `launch-video` skipped: name clash with the existing iart-ai skill |
| diffusionstudio/lottie | MIT | `text-to-lottie` | Lottie JSON animations |
| bangtutorial/bang-motion | MIT | `bang-motion` | Written in Indonesian. `docs/` left out |
| adithya-s-k/manim_skill | MIT | `manim-composer`, `manimce-best-practices`, `manimgl-best-practices` | 3Blue1Brown-style |
| nolangz/pixel2motion | MIT | `pixel2motion` | Raster logo → animated SVG. Good fit for brand work. `docs/` left out |
| alexgreensh/anidoodle | Apache-2.0 | `anidoodle` | Narration can use ElevenLabs/OpenAI/Gemini (paid, S6); Figma import needs a token |
| Tejashmakwana/motionmaxxing | Apache-2.0 | `motionmaxxing` | Voice via ElevenLabs (paid, S6). `docs/` (demo videos) left out. Do not run its `install.sh` |
| JDhruv14/line-art-animation | MIT | `line-art-animation` | `media/` (demo GIFs) left out |

## Not installed, and why

| Repo | Reason |
|---|---|
| feitangyuan/onetake | PolyForm **Noncommercial** licence: can't be used for paid client work |
| vibe-motion/skills, wshuyi/remotion-video-skill | No licence (and `remotion-video` clashes with an existing skill) |
| heygen-com/hyperframes, OpenMontageInc/OpenMontage, hypit-ai/hypit, nexu-io/openmotion | Full apps rather than skills; OpenMontage is graded CAUTION and AGPL; hypit does face swaps (S10) |
| digitalsamba/claude-code-video-toolkit | Skills depend on the toolkit's own project and on paid services (ElevenLabs, RunPod, Ideogram) |
| jtydhr88/screenwriting-skills | 26 skills, mostly Chinese opera and TV writing: off-topic for the agency |
| iart-ai/motion-skills | Already installed (the 54 iart-ai skills) |
| The other ~500 repos | Not reviewed. Ask to add a specific one |
