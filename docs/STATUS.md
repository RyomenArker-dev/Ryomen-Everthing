# Status — what works, what's tested, what's missing

Last updated: 2026-11-03. Only items under "Tested" were actually run.

## Tested ✅
| Item | How it was tested | Result |
|---|---|---|
| `scripts/new_client.py` | `tests/test_new_client.py` (5 tests) | Pass |
| `scripts/new_proposal.py` | `tests/test_new_proposal.py` (6 tests), including "no invented prices" | Pass |
| `scripts/check_workspace.py` | `tests/test_check_workspace.py` (9 tests), plus a run on the real repo | Pass, 0 errors |
| `.gitignore` keeps client/lead data and `.env` out of git | Git integration test in a temporary repo, plus a manual `git check-ignore` | Pass |
| `.claude/settings.json` | Valid JSON (checked by `check_workspace.py`) | Pass |
| `web/starter/` | Headless Chromium at 360/768/1280px: no overflow, 1 `h1`, all inputs labelled, min text contrast 4.99:1, 0 console errors, 0 external requests | Pass |
| GitHub Actions workflow file | Parsed as valid YAML | Pass |

## Not tested / not verifiable here ⚠️
| Item | Why | How to verify |
|---|---|---|
| GitHub Actions run on GitHub | Not observed from the session | GitHub → Actions → "Quality checks" after the push |
| `.claude/settings.json` permission prompts | Rules are written, but this build ran under the session's own permission mode and was not re-tested in a fresh session | In a new session, ask Claude to run `git reset --hard` and confirm it asks first (then decline) |
| Agents and skills triggering | Definitions are validated for structure only. Choosing them is up to Claude at runtime | Try the prompts in README "Quick start" |
| Third-party skills (marketing, UI/UX Pro Max, docx/pdf/pptx/xlsx, iart-ai Motion Skills) | Installed and their scripts reviewed for risky behaviour, but not run | Use them on a test client |
| Document skills that need LibreOffice / Python libs | Dependencies may be missing in a fresh environment | Ask Claude to produce a test PDF |
| Motion Skills video rendering (Remotion/Manim/ffmpeg) | Skills installed and scripts reviewed (they run only ffmpeg/ffprobe; network calls only to ElevenLabs/fal.ai with your keys, and Hugging Face); nothing rendered yet. Upstream `product-demo-video` (ecommerce pack) was skipped by the installer because its SKILL.md has invalid YAML | Ask for a short logo animation on a test client |
| Ghost Editor (`kurbaitaev/ghost-editor`) | Trial install in one cloud session only, under `~/.claude/skills`, **not in this repo**, so it's gone when that session ends. On Linux its `doctor.sh` core checks passed (ffmpeg with libvpx/libass, Node, HyperFrames, Whisper CPU, OpenCV). Of its 3 test files, one failed a pixel-tolerance test (`test_cutout_fx`) and two ran no tests. Never run end to end, because no talking-head recording was available. The author supports Apple-silicon Macs only. | Give it a short phone recording of you talking, in a session where it's reinstalled |
| MotionClone (`blixvip/MotionClone`) | Not installed. It's a Windows desktop app that uses a ChatGPT/Codex account, not a Claude Code skill | — |

## Content made with the workspace
- `content/antikythera-mechanism/`: 30 s vertical explainer video. Rendered and checked: the asset audit, the layout check (no text collisions) and the sound sync (5/5 cuts on the beat) all passed. See its README.

## Not built yet (by design) 🚧
- Any integration that sends, publishes or deploys (email, social, ads, hosting, CRM). See [ROADMAP.md](ROADMAP.md).
- Persistent storage for client files. Client data is git-ignored and temporary in cloud sessions;
  see [INSTALL.md](INSTALL.md#keeping-client-files). **Needs your decision.**
- Real agency content: `agency/services.md`, `pricing.md`, `positioning.md` and `policies.md` are placeholders for you to fill in.
- Contract/agreement and invoice templates. These need legal and tax input for your jurisdiction.
- Report generator and lead pipeline scripts (roadmap phase 2).
