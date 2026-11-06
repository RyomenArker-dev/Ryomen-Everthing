import json, sys, subprocess, urllib.request
# Needs an ElevenLabs key with Text to Speech permission, injected by the session proxy (never stored in this repo).
# Usage: python3 generate_voice_elevenlabs.py <outdir>, then trim silence and convert to 48 kHz WAV as lineN.wav.
out = sys.argv[1]; VOICE = 'JBFqnCBsd6RMkjVDRZzb'   # ElevenLabs premade voice "George"
L = ["Imagine finding a two-thousand-year-old computer in the sea.",
     "In nineteen-oh-one, sponge divers off Antikythera, Greece,",
     "retrieved bronze gears from a shipwreck.",
     "X-rays later showed the device could calculate the motions of the Sun, Moon, and five planets.",
     "Nothing this sophisticated existed again for over a millennium.",
     "Who built this celestial calculator?"]
for i, text in enumerate(L):
    body = {"text": text, "model_id": "eleven_multilingual_v2",
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.75, "style": 0.15, "use_speaker_boost": True},
            "previous_text": " ".join(L[:i])[-300:] or None, "next_text": " ".join(L[i+1:])[:300] or None}
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128",
                                 data=json.dumps(body).encode(), headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=120) as r: open(f"{out}/l{i+1}.mp3", "wb").write(r.read())
    print("line", i + 1, "ok", len(text), "chars")
