import sys, os, soundfile as sf
from kokoro_onnx import Kokoro
out=sys.argv[1]; voice=sys.argv[2]
k=Kokoro(os.path.expanduser('~/.cache/kokoro/kokoro-v1.0.onnx'), os.path.expanduser('~/.cache/kokoro/voices-v1.0.bin'))
# Kokoro ONNX (open source, offline). Usage: python generate_voice.py <outdir> bm_george
# then trim silence: ffmpeg -i lN.wav -af silenceremove...,areverse,silenceremove...,areverse lineN.wav
LINES={
 'l1':("Imagine finding a two-thousand-year-old computer in the sea.",1.05),
 'l2':("In nineteen-oh-one, sponge divers off Antikythera, Greece,",1.0),
 'l3':("retrieved bronze gears from a shipwreck.",1.0),
 'l4':("X-rays later showed the device could calculate the motions of the Sun, Moon, and five planets.",1.05),
 'l5':("Nothing this sophisticated existed again for over a millennium.",1.0),
 'l6':("Who built this celestial calculator?",0.95),
}
for name,(text,speed) in LINES.items():
    s,sr=k.create(text, voice=voice, speed=speed, lang='en-gb')
    sf.write(f'{out}/{name}.wav', s, sr); print(name, round(len(s)/sr,2), 's')
