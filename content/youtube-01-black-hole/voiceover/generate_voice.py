#!/usr/bin/env python3
"""Generate the narration for script 1 with Kokoro (open source, offline) and build the timeline.
Usage: python generate_voice.py script.json voiceover/  -> voiceover/lNN.wav, voiceover/vo.wav, timeline.json
Needs: pip install kokoro-onnx soundfile numpy; model files in ~/.cache/kokoro/."""
import json, os, sys
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
VOICE, SPEED, SR = 'bm_george', 0.92, 24000
LEAD, GAP, BEAT_GAP, SCENE_GAP, TITLE_GAP, TAIL = 1.2, 0.45, 0.8, 1.6, 4.5, 5.0
script, outdir = json.load(open(sys.argv[1])), sys.argv[2]
k = Kokoro(os.path.expanduser('~/.cache/kokoro/kokoro-v1.0.onnx'), os.path.expanduser('~/.cache/kokoro/voices-v1.0.bin'))
def trim(a, th=0.008):
    idx = np.where(np.abs(a) > th)[0]
    return a[max(0, idx[0] - 240): idx[-1] + 480] if len(idx) else a
t, track, lines, scenes = LEAD, [np.zeros(int(LEAD * SR), np.float32)], [], []
for si, sc in enumerate(script):
    s0 = t
    for li, text in enumerate(sc['lines']):
        a, sr = k.create(text, voice=VOICE, speed=SPEED, lang='en-gb'); a = trim(a.astype(np.float32))
        n = len(lines); sf.write(f'{outdir}/l{n:02d}.wav', a, sr)
        d = len(a) / SR; lines.append({'i': n, 'scene': si, 'text': text, 't0': round(t, 3), 't1': round(t + d, 3)})
        track.append(a); t += d
        last = li == len(sc['lines']) - 1
        gap = (TITLE_GAP if si == 0 else SCENE_GAP) if last else (BEAT_GAP if len(text) < 40 or text.endswith('?') else GAP)
        track.append(np.zeros(int(gap * SR), np.float32)); t += gap
    scenes.append({'n': sc['n'], 'title': sc['title'], 'from': round(s0 if si else 0, 3), 'to': round(t, 3)})
    print(f"scene {sc['n']}: {s0:6.1f}-{t:6.1f}s  {sc['title']}")
scenes[-1]['to'] = round(t + TAIL, 3); track.append(np.zeros(int(TAIL * SR), np.float32))
sf.write(f'{outdir}/vo.wav', np.concatenate(track), SR)
json.dump({'duration': scenes[-1]['to'], 'title_gap': [scenes[0]['to'] - TITLE_GAP + .3, scenes[0]['to']], 'scenes': scenes, 'lines': lines},
          open(os.path.join(os.path.dirname(outdir.rstrip('/')) or '.', 'timeline.json'), 'w'), indent=1)
print('total', round(scenes[-1]['to'], 1), 's')
