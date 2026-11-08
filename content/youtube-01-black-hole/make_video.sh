#!/usr/bin/env bash
# Build black-hole.mp4: render the code-drawn film + its synthesized score, then mix the narration
# over it with the music ducked under the voice.
set -euo pipefail
cd "$(dirname "$0")"
python3 build.py
node ../../.claude/skills/javascript-animation/scripts/render.mjs black-hole.html music.mp4
ffmpeg -v error -y -i music.mp4 -i voiceover/vo.flac -filter_complex \
 "[1:a]aresample=48000,volume=1.5,apad,asplit=2[vo][sc];[0:a]volume=0.7[mus];[mus][sc]sidechaincompress=threshold=0.03:ratio=8:attack=25:release=500[duck];[duck][vo]amix=inputs=2:normalize=0,alimiter=limit=0.89[a]" \
 -map 0:v -map "[a]" -c:v libx264 -crf 23 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart black-hole.mp4
rm -f music.mp4 music.wav
echo "wrote black-hole.mp4"
