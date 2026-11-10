// KOTODAMA EP01 — original 30s track. 160 BPM, D hirajoshi. Royalty-free (generated).
'use strict';
const fs = require('fs'), path = require('path');

const SR = 44100, DUR = 30.0, N = Math.round(SR * DUR);
const L = new Float64Array(N), R = new Float64Array(N);
const BPM = 160, BEAT = 60 / BPM, BAR = BEAT * 4; // beat .375s, bar 1.5s
const DROP = 10 * BAR; // 15.0s

let seed = 8008;
function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 * 2 - 1; }
const noiseBuf = new Float64Array(N);
for (let i = 0; i < N; i++) noiseBuf[i] = rnd();

function note(n) { return 440 * Math.pow(2, (n - 69) / 12); }
const clip = (x, d) => Math.tanh(x * d) / Math.tanh(d);

function addMono(start, dur, fn, pan = 0) {
  const s0 = Math.max(0, Math.round(start * SR));
  const s1 = Math.min(N, Math.round((start + dur) * SR));
  const gl = Math.min(1, 1 - pan), gr = Math.min(1, 1 + pan);
  for (let i = s0; i < s1; i++) {
    const t = (i - s0) / SR;
    const v = fn(t, i);
    L[i] += v * gl; R[i] += v * gr;
  }
}

function kick(start, vel = 1) {
  addMono(start, 0.35, (t) => {
    const f = 155 * Math.exp(-t * 26) + 42;
    const env = Math.exp(-t * 10);
    const body = Math.sin(2 * Math.PI * f * t * (1 + 0.5 * Math.exp(-t * 60)));
    const click = Math.exp(-t * 400) * 0.6;
    return clip(body * env + click, 2.5) * 0.9 * vel;
  });
}
function bass808(start, midi, dur, vel = 1) {
  const f = note(midi) / 4;
  addMono(start, dur, (t) => {
    const a = Math.min(1, t / 0.01);
    const rel = Math.min(1, Math.max(0, (dur - t) / 0.05));
    const glide = f * (1 + 0.8 * Math.exp(-t * 40));
    const x = Math.sin(2 * Math.PI * glide * t) + 0.15 * Math.sin(4 * Math.PI * glide * t);
    return clip(x, 3) * 0.55 * a * rel * vel;
  });
}
function hat(start, open = false, vel = 1, pan = 0) {
  const dur = open ? 0.16 : 0.04;
  addMono(start, dur, (t, i) => {
    const env = Math.exp(-t * (open ? 30 : 95));
    const n = noiseBuf[i] - (i > 0 ? noiseBuf[i - 1] : 0);
    return n * env * 0.36 * vel;
  }, pan);
}
function snare(start, vel = 1) {
  addMono(start, 0.2, (t, i) => {
    const n = (noiseBuf[i] - (i > 1 ? noiseBuf[i - 2] : 0)) * Math.exp(-t * 28);
    const tone = Math.sin(2 * Math.PI * 185 * t) * Math.exp(-t * 36);
    return clip(n * 0.8 + tone * 0.5, 2) * 0.7 * vel;
  });
}
// koto-style pluck: bright attack, fast decay, slight initial pitch bend
function pluck(start, midi, vel = 1, pan = 0) {
  const f = note(midi);
  addMono(start, 1.1, (t) => {
    const bend = 1 + 0.012 * Math.exp(-t * 90);
    const env = Math.exp(-t * 5.2) * Math.min(1, t / 0.002);
    const v = Math.sin(2 * Math.PI * f * bend * t)
      + 0.55 * Math.sin(4 * Math.PI * f * bend * t) * Math.exp(-t * 9)
      + 0.3 * Math.sin(6 * Math.PI * f * bend * t) * Math.exp(-t * 14)
      + 0.12 * Math.sin(9.97 * Math.PI * f * t) * Math.exp(-t * 22);
    return clip(v, 1.4) * 0.3 * env * vel;
  }, pan);
}
function pad(start, midis, dur, vel = 1) {
  for (const m of midis) {
    const f = note(m);
    addMono(start, dur, (t) => {
      const a = Math.min(1, t / 1.4);
      const rel = Math.min(1, Math.max(0, (dur - t) / 1.0));
      const v = Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(2 * Math.PI * f * 1.004 * t + 1)
        + 0.25 * Math.sin(2 * Math.PI * f * 0.5 * t);
      return v * 0.05 * a * rel * vel;
    }, (m % 2 === 0 ? 0.3 : -0.3));
  }
}
function riser(start, dur, vel = 1) {
  addMono(start, dur, (t, i) => {
    const p = t / dur;
    const env = p * p;
    const n = noiseBuf[i] - (i > 3 ? noiseBuf[i - 3] : 0);
    const tone = Math.sin(2 * Math.PI * (70 + 850 * p * p) * t) * 0.3;
    return (n * 0.5 + tone) * env * 0.48 * vel;
  });
}
function impact(start, vel = 1) {
  addMono(start, 1.6, (t, i) => {
    const boom = Math.sin(2 * Math.PI * (52 * Math.exp(-t * 3) + 35) * t) * Math.exp(-t * 2.2);
    const n = noiseBuf[i] * Math.exp(-t * 7) * 0.4;
    return clip(boom + n, 2) * 0.9 * vel;
  });
}

// ---- arrangement (D hirajoshi: D Eb G A Bb) ----
const kickTimes = [], snareTimes = [];
function K(t, v) { kick(t, v); kickTimes.push(t); }
function S(t, v) { snare(t, v); snareTimes.push(t); }

// Intro (bars 1-2, 0-3.0)
impact(0, 0.7);
K(0, 1); K(1.5, 0.9);
pad(0, [50, 53, 58], 7.5, 1); // D3 F3 Bb3
pluck(0.0, 69, 1, -0.2); pluck(0.375, 67, 0.8, 0.2); pluck(0.75, 62, 0.9, 0);
pluck(1.5, 70, 1, 0.2); pluck(1.875, 69, 0.8, -0.2); pluck(2.25, 67, 0.9, 0);

// Verse (bars 3-7, 3.0-10.5)
for (const t0 of [3.0, 4.5, 6.0, 7.5, 9.0]) {
  K(t0, 0.9); K(t0 + 1.125, 0.75);
  S(t0 + 0.75, 0.55);
  for (let i = 0; i < 4; i++) hat(t0 + i * 0.375 + 0.1875, false, 0.4, (i % 2) ? 0.45 : -0.45);
}
pluck(3.0, 62, 1, -0.2); pluck(3.375, 63, 0.7, 0); pluck(3.75, 67, 0.9, 0.2); pluck(4.5, 69, 1, 0);
pluck(6.0, 70, 1, 0.2); pluck(6.375, 69, 0.7, 0); pluck(6.75, 67, 0.9, -0.2); pluck(7.5, 63, 1, 0);
pluck(9.0, 62, 0.9, -0.2); pluck(9.375, 67, 0.8, 0); pluck(9.75, 69, 0.9, 0.2); pluck(10.125, 70, 1, 0);

// Build (bars 8-10, 10.5-15.0)
for (const t of [10.5, 11.25, 12.0, 12.75]) K(t, 0.85);
for (const t of [13.5, 13.875, 14.25, 14.625]) K(t, 0.9);
for (let i = 0; i < 24; i++) hat(10.5 + i * 0.1875, false, 0.3 + 0.4 * (i / 24), (i % 2) ? 0.5 : -0.5);
S(14.25, 0.6); S(14.4375, 0.7); S(14.625, 0.8); S(14.8125, 0.9);
riser(10.5, 4.5, 1);
pad(7.5, [50, 53, 58], 7.5, 0.8);

// Drop (bars 11-16, 15.0-24.0)
impact(DROP, 1);
const bassLine = [38, 38, 46, 45, 41, 38]; // D D Bb A F D
for (let b = 0; b < 6; b++) {
  const t0 = DROP + b * BAR;
  K(t0, 1); K(t0 + BEAT * 1.75, 0.9); K(t0 + BEAT * 2.5, 0.95);
  S(t0 + BEAT, 1); S(t0 + BEAT * 3, 1);
  bass808(t0, bassLine[b], BEAT * 1.5);
  bass808(t0 + BEAT * 1.75, bassLine[b], BEAT * 0.6, 0.9);
  bass808(t0 + BEAT * 2.5, bassLine[b] + ((b % 2) ? 3 : 0), BEAT * 1.2, 0.95);
  for (let i = 0; i < 16; i++) {
    const acc = (i % 4 === 0) ? 0.75 : 0.42;
    hat(t0 + i * BEAT / 4, false, acc, (i % 2) ? 0.5 : -0.5);
  }
  hat(t0 + BEAT * 3.5, true, 0.55);
}
// pluck lead over the drop (2-bar phrases)
const lead = [
  [0.000, 74], [0.375, 70], [0.750, 69], [1.125, 67], [1.500, 69], [2.250, 70], [3.000, 74], [3.750, 75],
  [6.000, 75], [6.375, 74], [6.750, 70], [7.500, 69], [8.250, 67], [8.625, 63],
];
for (const [dt, m] of lead) pluck(DROP + dt, m, 1.1, (m % 2) ? 0.25 : -0.25);
pluck(DROP + 4.5, 62, 1, 0); pluck(DROP + 5.25, 67, 0.9, 0.2);
pad(DROP, [50, 53, 58, 62], 9.0, 0.75);

// Breakdown (bars 17-18, 24.0-27.0) — half-time
K(24.0, 0.95); S(24.75, 0.9); K(25.5, 0.9); S(26.25, 1);
bass808(24.0, 38, 1.4, 0.9);
pad(24.0, [50, 53, 58], 6.0, 0.9);
pluck(24.0, 62, 0.9, 0); pluck(25.5, 58, 0.8, -0.2); pluck(26.25, 57, 0.7, 0.2);

// Outro (bars 19-20, 27.0-30.0)
impact(27.0, 1);
bass808(27.0, 38, 2.4, 0.9);
pluck(27.0, 62, 1, 0); pluck(28.5, 50, 0.9, 0);

// sidechain duck + master
const duck = new Float64Array(N).fill(1);
for (const ts of kickTimes.concat([27.0])) {
  const s = Math.round(ts * SR);
  for (let i = 0; i < SR * 0.22 && s + i < N; i++) {
    const g = 1 - 0.5 * Math.exp(-i / (SR * 0.05));
    if (duck[s + i] > g) duck[s + i] = g;
  }
}
const out = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  let fade = 1;
  if (i < SR * 0.03) fade = i / (SR * 0.03);
  const tail = N - i;
  if (tail < SR * 0.8) fade *= tail / (SR * 0.8);
  const l = clip(L[i] * duck[i] * fade * 1.1, 1.8) * 0.85;
  const r = clip(R[i] * duck[i] * fade * 1.1, 1.8) * 0.85;
  out.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(l * 32767))), i * 4);
  out.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(r * 32767))), i * 4 + 2);
}
const hdr = Buffer.alloc(44);
hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + out.length, 4); hdr.write('WAVE', 8);
hdr.write('fmt ', 12); hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22);
hdr.writeUInt32LE(SR, 24); hdr.writeUInt32LE(SR * 4, 28); hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34);
hdr.write('data', 36); hdr.writeUInt32LE(out.length, 40);
const outDir = path.join(__dirname, '..', 'render');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'ep01.wav'), Buffer.concat([hdr, out]));
console.log('wrote', N, 'samples -> render/ep01.wav');
