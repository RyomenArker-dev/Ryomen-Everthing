// Thumbnail: reuses the film's drawing code (black-hole.html), overriding draw() with one composition.
window.FRAMES = 1;
window.draw = function () {
  const t = 12.4; LAYOUT = [];
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.shadowBlur = 0; ctx.letterSpacing = '0px';
  const bx = 1450, by = 600, R = 270;
  space(t, { k: 1.25, x: 120, lens: { x: bx, y: by, E: 420, R }, neb: 1 });
  blackHole(bx, by, R, t, { tilt: .17, diskAlpha: .75 });
  glow(bx, by, 900, '255,120,30', .10);
  // an astronaut being stretched as they fall in
  const ax = 1180, ay = 215, rot = Math.atan2(by - ay, bx - ax) - Math.PI / 2;
  glow(ax, ay, 150, '5,11,28', .85); person(ax, ay, 120, 1.7, .75, rot, 1); glow(ax, ay, 110, '255,160,80', .16);
  // left-side darkening so the type pops
  const g = ctx.createLinearGradient(0, 0, 900, 0); g.addColorStop(0, 'rgba(2,5,14,.85)'); g.addColorStop(1, 'rgba(2,5,14,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * 1.05); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  const big = (s, y, col, size) => { ctx.save(); ctx.font = F(900, size); ctx.letterSpacing = '2px'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round'; ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.strokeText(s, 90, y);
    ctx.shadowColor = col === ORANGE ? 'rgba(255,120,30,.6)' : 'rgba(0,0,0,.8)'; ctx.shadowBlur = 40; ctx.fillStyle = col; ctx.fillText(s, 90, y); ctx.restore(); };
  big('THERE IS', 470, WHITE, 168);
  big('NO ESCAPE.', 660, ORANGE, 168);
  ctx.save(); ctx.fillStyle = ORANGE; ctx.fillRect(96, 706, 340, 10); ctx.restore();
  window.LAYOUT = LAYOUT;
};
