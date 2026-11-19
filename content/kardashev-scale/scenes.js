// Type I to Type VII civilisations. One function per scene in script.md.
// Facts and sources: see README.md. Types IV-VII are labelled SPECULATIVE on screen.

const U = (s) => Math.min(s.safe.w, s.safe.h) / 100;

// A glowing planet, star or galaxy drawn on the canvas, around 0, 0.
function planet(ctx, r) {
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
  g.addColorStop(0, '#7dd3fc');
  g.addColorStop(0.55, '#2563eb');
  g.addColorStop(1, '#0b1a40');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(74, 222, 128, 0.55)';
  [[-0.3, -0.1, 0.32, 0.2], [0.25, 0.3, 0.25, 0.16], [0.1, -0.45, 0.2, 0.1]].forEach(([x, y, a, b]) => {
    ctx.beginPath(); ctx.ellipse(x * r, y * r, a * r, b * r, 0.4, 0, Math.PI * 2); ctx.fill();
  });
}

function sun(ctx, r, t) {
  const glow = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.9);
  glow.addColorStop(0, 'rgba(253, 224, 71, 0.9)');
  glow.addColorStop(0.45, 'rgba(251, 146, 60, 0.35)');
  glow.addColorStop(1, 'rgba(251, 146, 60, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(0, 0, r * 1.9 * (1 + 0.03 * Math.sin(t * 2)), 0, Math.PI * 2); ctx.fill();
  const core = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
  core.addColorStop(0, '#fffbeb');
  core.addColorStop(0.6, '#fde047');
  core.addColorStop(1, '#f97316');
  ctx.fillStyle = core;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
}

function galaxy(ctx, r, t, rand, alpha = 1) {
  ctx.save();
  ctx.rotate(t * 0.12);
  for (let i = 0; i < 900; i++) {
    const arm = i % 2;
    const d = rand(i) ** 0.7;
    const a = d * 5.2 + arm * Math.PI + (rand(i + 5000) - 0.5) * 0.7;
    const x = Math.cos(a) * d * r;
    const y = Math.sin(a) * d * r * 0.55;
    ctx.fillStyle = `rgba(${200 + 55 * rand(i + 9000)}, ${190 + 50 * d}, 255, ${alpha * (0.35 + 0.65 * (1 - d))})`;
    ctx.fillRect(x, y, 2.2, 2.2);
  }
  const core = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.25);
  core.addColorStop(0, `rgba(255, 244, 214, ${alpha})`);
  core.addColorStop(1, 'rgba(255, 244, 214, 0)');
  ctx.fillStyle = core;
  ctx.beginPath(); ctx.ellipse(0, 0, r * 0.25, r * 0.16, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// Background stars for every scene.
function starfield(s) {
  s.draw({ at: -1, camera: false }, (ctx) => {
    for (let i = 0; i < 160; i++) {
      const x = s.rand(i) * s.W;
      const y = s.rand(i + 400) * s.H;
      const tw = 0.35 + 0.35 * Math.sin(s.T * 1.5 + i);
      ctx.fillStyle = `rgba(255, 255, 255, ${tw})`;
      ctx.fillRect(x, y, 2, 2);
    }
  });
}

function badge(s, text, opts) {
  const u = U(s);
  return s.text(text, { size: u * 4.4, bold: true, color: 'orange', bg: 'surface', padding: u * 1.4, radius: u * 1, border: 'orange', ...opts });
}

// The scale from Type 0 to Type I, with a marker for humanity at 0.73.
function meter(s, { y, at, markAt, labelAt }) {
  const u = U(s);
  const { w } = s.safe;
  const left = s.cx - w * 0.38;
  const right = s.cx + w * 0.38;
  s.line([[left, y], [right, y]], { color: 'muted', width: u * 0.6, at });
  s.text('Type 0', { x: left, y: y + u * 7, size: u * 5.5, color: 'muted', at });
  s.text('Type I', { x: right, y: y + u * 7, size: u * 5.5, color: 'accent', at });
  s.draw({ at: markAt, box: { x: s.cx, y, w: right - left, h: u * 4 } }, (ctx) => {
    const p = s.ease.out(s.clamp(s.since(s.time(markAt)) / 2, 0, 1)) * 0.73;
    ctx.fillStyle = s.color('accent');
    ctx.fillRect(left, y - u * 0.6, (right - left) * p, u * 1.2);
    ctx.beginPath(); ctx.arc(left + (right - left) * p, y, u * 1.8, 0, Math.PI * 2); ctx.fill();
  });
  s.text('We are here: about Type 0.73', { x: left + (right - left) * 0.73, y: y - u * 9, size: u * 5.5, bold: true, at: labelAt });
}

export default {
  intro(s) {
    const u = U(s);
    const { top, h } = s.safe;
    starfield(s);
    s.title('Type I to Type VII Civilisations', { y: top + h * 0.3, size: u * 10, at: -1 });
    s.subtitle('How far could a civilisation go?', { y: top + h * 0.45, size: u * 5, at: 0.4 });
    s.text('Nikolai Kardashev, 1964', { y: top + h * 0.64, size: u * 6, at: 'Nikolai' });
    s.icon('zap', { x: s.cx, y: top + h * 0.84, size: u * 9, color: 'yellow', label: 'Measure: energy use', labelSize: u * 5.5, at: '#energy' });
  },

  sagan(s) {
    const u = U(s);
    const { w, top, h } = s.safe;
    starfield(s);
    s.text("Carl Sagan's sliding scale", { y: top + h * 0.15, size: u * 7, at: 0.3 });
    const xs = s.row(3, { width: w * 0.8 });
    ['Type I', 'Type II', 'Type III'].forEach((t, i) => {
      s.box(t, { id: `t${i}`, x: xs[i], y: top + h * 0.5, size: u * 9, color: 'accent', at: i === 0 ? 1.2 : `#steps` });
    });
    s.arrow('t0', 't1', { label: '× 10 billion', labelSize: u * 5.5, labelFont: 'body', at: 'billion' });
    s.arrow('t1', 't2', { label: '× 10 billion', labelSize: u * 5.5, labelFont: 'body', at: 'billion' });
    s.text('each step uses about 10,000,000,000 × more power', { y: top + h * 0.8, size: u * 5, color: 'muted', at: 'power' });
  },

  type1(s) {
    const u = U(s);
    const { w, top, h } = s.safe;
    starfield(s);
    const px = s.cx - w * 0.2;
    s.draw({ x: px, y: s.cy, at: 0.2, enter: 'zoom', box: { x: 0, y: 0, w: u * 56, h: u * 56, round: true } }, (ctx) => planet(ctx, u * 28));
    s.text('TYPE I', { x: s.cx + w * 0.2, y: top + h * 0.3, size: u * 11, bold: true, color: 'accent', at: 'Type' });
    s.text('a planet', { x: s.cx + w * 0.2, y: top + h * 0.45, size: u * 6, at: 'planet' });
    s.text('10¹⁶ watts', { x: s.cx + w * 0.2, y: top + h * 0.68, size: u * 8, bold: true, at: '#watts' });
    s.note("Sagan's figure", { x: s.cx + w * 0.2, y: top + h * 0.8, size: u * 3.8, at: '#watts' });
  },

  humans(s) {
    const u = U(s);
    const { top, h } = s.safe;
    starfield(s);
    s.text('Humanity in 2021', { y: top + h * 0.12, size: u * 7, at: 0.3 });
    s.number(18.87, { decimals: 2, suffix: ' TW', y: top + h * 0.33, size: u * 11, at: 'nineteen' });
    s.note('world energy use, as average power (BP Statistical Review 2022)', { y: top + h * 0.46, size: u * 4.2, at: 'terawatts' });
    meter(s, { y: top + h * 0.75, at: '#2021', markAt: '#rating', labelAt: 'Type' });
  },

  type2(s) {
    const u = U(s);
    const { w, top, h } = s.safe;
    starfield(s);
    const px = s.cx - w * 0.2;
    s.draw({ x: px, y: s.cy, at: 0.2, enter: 'zoom', box: { x: 0, y: 0, w: u * 60, h: u * 60, round: true } }, (ctx) => sun(ctx, u * 16, s.t));
    s.draw({ x: px, y: s.cy, at: '#dyson', enter: 'fade', dur: 1.2, box: { x: 0, y: 0, w: u * 58, h: u * 58, round: true } }, (ctx, life) => {
      const n = Math.floor(70 * life.p);
      for (let i = 0; i < n; i++) {
        const ring = i % 3;
        const r = u * (22 + ring * 3.5);
        const a = (i / 70) * Math.PI * 2 * 3 + s.t * (0.25 + ring * 0.08);
        ctx.save();
        ctx.translate(Math.cos(a) * r, Math.sin(a) * r * (0.45 + ring * 0.2));
        ctx.rotate(a);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(-u * 0.9, -u * 0.35, u * 1.8, u * 0.7);
        ctx.restore();
      }
    });
    s.text('TYPE II', { x: s.cx + w * 0.22, y: top + h * 0.25, size: u * 11, bold: true, color: 'accent', at: 'Type' });
    s.text('a star', { x: s.cx + w * 0.22, y: top + h * 0.4, size: u * 6, at: 'star' });
    s.text('10²⁶ watts', { x: s.cx + w * 0.22, y: top + h * 0.56, size: u * 8, bold: true, at: 'star' });
    s.text('e.g. a Dyson swarm', { x: s.cx + w * 0.22, y: top + h * 0.75, size: u * 5, color: 'muted', at: 'Dyson' });
  },

  type3(s) {
    const u = U(s);
    const { w, top, h } = s.safe;
    starfield(s);
    s.draw({ x: s.cx - w * 0.18, y: s.cy, at: 0.2, enter: 'zoom', dur: 1.2, box: { x: 0, y: 0, w: u * 80, h: u * 46 } }, (ctx) => galaxy(ctx, u * 46, s.t, (n) => s.rand(n)));
    s.text('TYPE III', { x: s.cx + w * 0.26, y: top + h * 0.3, size: u * 11, bold: true, color: 'accent', at: 'Type' });
    s.text('a galaxy', { x: s.cx + w * 0.26, y: top + h * 0.45, size: u * 6, at: 'galaxy' });
    s.text('10³⁶ watts', { x: s.cx + w * 0.26, y: top + h * 0.66, size: u * 8, bold: true, at: '#stars' });
  },

  beyond(s) {
    const u = U(s);
    const { w, top, h } = s.safe;
    starfield(s);
    const xs = s.row(7, { width: w * 0.92 });
    ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'].forEach((t, i) => {
      const spec = i > 2;
      s.box(t, { id: `b${i}`, x: xs[i], y: top + h * 0.45, minW: u * 16, size: u * 8, color: spec ? 'orange' : 'accent', dashed: spec, at: spec ? '#spec' : 0.3 + i * 0.25 });
    });
    s.text('Kardashev, 1964', { x: xs[1], y: top + h * 0.25, size: u * 5.5, color: 'accent', at: 'stopped' });
    badge(s, 'SPECULATIVE', { x: (xs[3] + xs[6]) / 2, y: top + h * 0.25, at: 'speculation' });
    s.text("Later ideas, and they don't agree", { x: (xs[3] + xs[6]) / 2, y: top + h * 0.68, size: u * 5.5, color: 'muted', at: 'agree' });
  },

  type4(s) {
    const u = U(s);
    const { w, top, h } = s.safe;
    s.camera([]);
    starfield(s);
    s.draw({ at: 0.2, enter: 'fade', dur: 1.2, box: { x: s.cx - w * 0.21, y: s.cy, w: w * 0.46, h: h * 0.7 } }, (ctx) => {
      [[-0.2, -0.18, 0.8], [0.02, 0.1, 1], [-0.16, 0.25, 0.55], [0.12, -0.24, 0.6], [-0.3, 0.06, 0.45]].forEach(([dx, dy, k], i) => {
        ctx.save();
        ctx.translate(s.cx - w * 0.2 + dx * w, s.cy + dy * h);
        galaxy(ctx, u * 20 * k, s.t * (1 + i * 0.2), (n) => s.rand(n + i * 3000), 0.9);
        ctx.restore();
      });
    });
    badge(s, 'SPECULATIVE', { x: s.cx + w * 0.24, y: top + h * 0.12, at: 0.3 });
    s.text('TYPE IV', { x: s.cx + w * 0.24, y: top + h * 0.3, size: u * 11, bold: true, color: 'orange', at: 'Type' });
    s.text('beyond its galaxy', { x: s.cx + w * 0.24, y: top + h * 0.45, size: u * 5.5, at: 'beyond' });
    s.note('Michio Kaku (2011): energy from between galaxies', { x: s.cx + w * 0.24, y: top + h * 0.62, size: u * 4.4, maxWidth: w * 0.42, at: '#kaku' });
    s.note('popular versions: the whole universe', { x: s.cx + w * 0.24, y: top + h * 0.76, size: u * 4.4, maxWidth: w * 0.42, at: '#popular' });
  },

  type5(s) {
    const u = U(s);
    const { w, top, h } = s.safe;
    starfield(s);
    const bubbles = [[-0.12, 0, 15], [0.06, -0.14, 9], [0.1, 0.17, 11], [-0.3, -0.18, 7], [-0.3, 0.2, 8], [0.17, 0.0, 6]];
    s.draw({ at: '#multi', enter: 'fade', dur: 1, box: { x: s.cx - w * 0.22, y: s.cy, w: w * 0.5, h: h * 0.75 } }, (ctx) => {
      bubbles.forEach(([dx, dy, r], i) => {
        const x = s.cx - w * 0.22 + dx * w + Math.sin(s.t * 0.6 + i) * u;
        const y = s.cy + dy * h + Math.cos(s.t * 0.5 + i) * u;
        const R = r * u;
        const g = ctx.createRadialGradient(x - R * 0.3, y - R * 0.3, R * 0.1, x, y, R);
        g.addColorStop(0, 'rgba(196, 181, 253, 0.55)');
        g.addColorStop(1, 'rgba(76, 29, 149, 0.15)');
        ctx.fillStyle = g;
        ctx.strokeStyle = 'rgba(196, 181, 253, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        for (let k = 0; k < 30; k++) {
          const a = s.rand(i * 100 + k) * Math.PI * 2;
          const d = s.rand(i * 100 + k + 50) * R * 0.8;
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.fillRect(x + Math.cos(a) * d, y + Math.sin(a) * d, 1.6, 1.6);
        }
      });
    });
    badge(s, 'SPECULATIVE', { x: s.cx + w * 0.24, y: top + h * 0.12, at: 0.3 });
    s.text('TYPE V', { x: s.cx + w * 0.24, y: top + h * 0.3, size: u * 11, bold: true, color: 'orange', at: 'Type' });
    s.text('a multiverse', { x: s.cx + w * 0.24, y: top + h * 0.45, size: u * 5.5, at: 'multiverse' });
    s.note('popular versions', { x: s.cx + w * 0.24, y: top + h * 0.55, size: u * 4.4, at: 'multiverse' });
    s.note('Zoltán Galántai: "technically immortal"', { x: s.cx + w * 0.24, y: top + h * 0.72, size: u * 4.4, maxWidth: w * 0.42, at: '#galantai' });
  },

  type67(s) {
    const u = U(s);
    const { w, top, h } = s.safe;
    starfield(s);
    badge(s, 'SPECULATIVE: internet videos and fiction', { y: top + h * 0.08, at: 0.3 });
    const xs = s.row(2, { width: w * 0.6 });
    s.box('TYPE VI', { id: 'six', x: xs[0], y: top + h * 0.3, size: u * 10, color: 'orange', dashed: true, at: '#six' });
    s.text('masters space and time', { x: xs[0], y: top + h * 0.47, size: u * 6, at: '#six' });
    s.icon('clock', { x: xs[0], y: top + h * 0.66, size: u * 13, color: 'orange', at: 'space' });
    s.box('TYPE VII', { id: 'seven', x: xs[1], y: top + h * 0.3, size: u * 10, color: 'orange', dashed: true, at: '#seven' });
    s.text('creates universes', { x: xs[1], y: top + h * 0.47, size: u * 6, at: 'create' });
    s.icon('sparkles', { x: xs[1], y: top + h * 0.66, size: u * 13, color: 'yellow', at: 'universes' });
    s.text('No scientific paper defines these', { y: top + h * 0.88, size: u * 6, bold: true, color: 'red', bg: 'surface', padding: u * 1.5, at: '#nopaper' });
  },

  outro(s) {
    const u = U(s);
    const { top, h } = s.safe;
    starfield(s);
    s.text('Where we stand', { y: top + h * 0.15, size: u * 7, at: 0.2 });
    meter(s, { y: top + h * 0.5, at: 0.2, markAt: 0.6, labelAt: 'climbing' });
    s.text('Beyond Type III: imagination, for now', { y: top + h * 0.82, size: u * 6.5, color: 'orange', at: '#rest' });
  },
};
