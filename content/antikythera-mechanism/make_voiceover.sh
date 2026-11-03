#!/usr/bin/env bash
# Rebuild antikythera.mp4: render the code-drawn video with its synthesized score,
# then lay the voiceover clips on top, ducking the music under the voice.
# Voice start times must match `vo` offsets in SCENES (antikythera.html): scene.from + vo.
set -euo pipefail
cd "$(dirname "$0")"
SKILL=../../.claude/skills/javascript-animation
node "$SKILL/scripts/render.mjs" antikythera.html music.mp4
# line: start seconds (scene start + vo offset)
STARTS=(0.35 4.55 9.3 13.4 20.4 26.0)
args=(); filt=""; mix=""
for i in 1 2 3 4 5 6; do
  ms=$(python3 -c "print(int(${STARTS[$((i-1))]}*1000))")
  args+=(-i "voiceover/line$i.wav"); filt+="[$i:a]aresample=48000,adelay=${ms}|${ms},apad[v$i];"; mix+="[v$i]"
done
ffmpeg -v error -y -i music.mp4 "${args[@]}" -filter_complex \
 "${filt}${mix}amix=inputs=6:normalize=0,volume=1.6,atrim=0:32,asplit=2[vo][sc];[0:a]volume=0.75[mus];[mus][sc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=350[duck];[duck][vo]amix=inputs=2:normalize=0,alimiter=limit=0.89[a]" \
 -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest antikythera.mp4
rm -f music.mp4 music.wav
echo "wrote antikythera.mp4"
