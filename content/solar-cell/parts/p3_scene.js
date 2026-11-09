/* =====================================================================================
   3. SCENE — a 72-cell crystalline-silicon solar module tilted to low sunlight, a cable from its corner to a lit bulb on the
   ground, and a prepared cut-away notch at the corner of one cell that shows the cell's layers. World unit: mm.

   Rules that keep the film acceptable (references/principles.md):
   - Every number on screen comes from SC_FACTS (research/facts.md), each with its source.
   - Everything exists from the first frame at its true place; it becomes visible because the camera reaches it.
   - The 71 ordinary cells and the hero cell share one material (P5); the hero only adds the notch and a 3D finger, too small to
     see until the camera is close.
   - Illustrative (research/gaps.md): the layers inside the cut are drawn thicker than they are (emitter < 1 µm, coating ~0.1 µm);
     charges, the field and the photon are symbols. The caption and labels say so.
   ===================================================================================== */
const SC_FACTS = Object.freeze({
  cell:   { size: 182, src: 'M10 wafer, 182 mm edge — PV Tech / Fraunhofer ISE' },
  module: { cols: 6, rows: 12, cells: 72, volts: 36, src: '36–72 cells per module; 72 × ≈0.5 V = 36 V — UNSW PV-Manufacturing' },
  cellV:  { v: 0.5, src: '≈0.5 V per cell at max power — UNSW PV-Manufacturing' },
  glass:  { t: 3.2, src: '3.0–4.0 mm tempered glass, 3.2 typical — Clean Energy Reviews' },
  wafer:  { t: 0.18, src: 'base 100–500 µm (textbook), drawn 180 µm incl. rear Al — PVEducation' },
  al:     { t: 0.03, src: 'rear Al paste ≈30 µm — UNSW PV-Manufacturing' },
  finger: { w: 0.05, pitch: 1.6, src: 'fingers 20–200 µm wide, 1–5 mm apart; printed ≈52–59 µm — PVEducation; PV Tech' },
  busbars:{ n: 5, w: 0.9, src: '3–5+ busbars per cell (simplified to 5) — UNSW PV-Manufacturing' },
  gap:    { g: 2.5, margin: 14, src: 'cell gap / edge margin: typical layout (illustrative)' },
});
const SC_CELL = SC_FACTS.cell.size, SC_GAP = SC_FACTS.gap.g, SC_PITCH = SC_CELL + SC_GAP;
const SC_COLS = SC_FACTS.module.cols, SC_ROWS = SC_FACTS.module.rows, SC_TW = SC_FACTS.wafer.t;
console.assert(SC_COLS * SC_ROWS === SC_FACTS.module.cells && Math.abs(SC_FACTS.module.cells * SC_FACTS.cellV.v - SC_FACTS.module.volts) < 1e-9, 'module facts');
const SC_HALF_W = (SC_COLS * SC_CELL + (SC_COLS - 1) * SC_GAP) / 2 + SC_FACTS.gap.margin;     // glass half-width
const SC_HALF_H = (SC_ROWS * SC_CELL + (SC_ROWS - 1) * SC_GAP) / 2 + SC_FACTS.gap.margin;     // glass half-height
const scRnd = mulberry32(7);

/* ---------- the module, tilted 25° from horizontal, facing the low sun ---------- */
const PANEL = new THREE.Group();
PANEL.position.set(0, 800, 0); PANEL.rotation.x = -65 * deg; PANEL.updateMatrix(); PANEL.name = 'solar panel';
universe.add(PANEL);
const scU = v => v.clone().applyMatrix4(PANEL.matrix);                                 // panel-local → world (universe) mm
const scDir = v => v.clone().applyQuaternion(PANEL.quaternion).normalize();
CAMFRAMES.panel = { right: scDir(V3(1, 0, 0)), up: scDir(V3(0, 1, 0)), back: scDir(V3(0, 0, 1)) };
// looking at the notch's cut face (it faces panel-local +x): up = the panel's normal
CAMFRAMES.face = { back: scDir(V3(1, 0, 0)), up: scDir(V3(0, 0, 1)) };
CAMFRAMES.face.right = CAMFRAMES.face.up.clone().cross(CAMFRAMES.face.back).normalize();

/* ---------- textures drawn once ---------- */
function scCanvas(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return c; }
const SC_TEXPX = 2048, SC_MMPX = SC_TEXPX / SC_CELL;
const SC_FINGER_Y0 = 0.6;                                                           // first finger 0.6 mm from a cell's lower edge
const CELL_TEX = (() => {
  const c = scCanvas(SC_TEXPX, SC_TEXPX, (g, W, H) => {
    // deep blue silicon nitride over textured silicon: a faint mottle so the surface isn't flat colour
    g.fillStyle = '#16244f'; g.fillRect(0, 0, W, H);
    for (let k = 0; k < 9000; k++) { const x = scRnd() * W, y = scRnd() * H, r = 2 + scRnd() * 7;
      g.fillStyle = `rgba(${scRnd() > 0.5 ? '70,95,170' : '6,12,32'},${0.03 + scRnd() * 0.04})`; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
    // fingers: hair-thin silver lines across the cell, every 1.6 mm
    g.fillStyle = 'rgba(200,206,214,0.55)';
    for (let yv = SC_FINGER_Y0; yv < SC_CELL; yv += SC_FACTS.finger.pitch) g.fillRect(0, H - yv * SC_MMPX - 0.5, W, 1);
    // busbars: five wider silver bands along the cell
    for (let i = 0; i < SC_FACTS.busbars.n; i++) { const x = (i + 0.5) / SC_FACTS.busbars.n * W, w = SC_FACTS.busbars.w * SC_MMPX;
      const gr = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0); gr.addColorStop(0, '#9aa1ab'); gr.addColorStop(0.5, '#e4e8ee'); gr.addColorStop(1, '#9aa1ab');
      g.fillStyle = gr; g.fillRect(x - w / 2, 0, w, H); }
  });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
})();

const BACK_TEX = (() => { const c = scCanvas(512, 512, (g, W, H) => { g.fillStyle = '#8c9094'; g.fillRect(0, 0, W, H);
    for (let k = 0; k < 6000; k++) { const x = scRnd() * W, y = scRnd() * H; g.fillStyle = `rgba(${scRnd() > 0.5 ? '255,255,255' : '0,0,0'},${0.05 + scRnd() * 0.07})`; g.fillRect(x, y, 1 + scRnd() * 3, 1); } });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(220, 440); t.anisotropy = 4; return t; })();
/* ---------- materials ---------- */
const SC_MAT = {
  cell: new THREE.MeshPhysicalMaterial({ map: CELL_TEX, roughness: 0.38, metalness: 0.0, clearcoat: 0.25, clearcoatRoughness: 0.35, specularIntensity: 0.45 }),
  cellEdge: new THREE.MeshStandardMaterial({ color: 0x3a3f48, roughness: 0.6, metalness: 0.3 }),
  backsheet: new THREE.MeshStandardMaterial({ map: BACK_TEX, color: 0xb4b8bc, roughness: 0.9, side: THREE.DoubleSide }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0x0a0f18, transparent: true, opacity: 0.16, roughness: 0.3, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.32, specularIntensity: 0.3, side: THREE.DoubleSide, depthWrite: false }),
  alu: new THREE.MeshStandardMaterial({ color: 0xb8bcc2, roughness: 0.48, metalness: 1.0 }),
  aluDark: new THREE.MeshStandardMaterial({ color: 0x8d939b, roughness: 0.45, metalness: 1.0 }),
  rubber: new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.62, metalness: 0.0 }),
  plastic: new THREE.MeshStandardMaterial({ color: 0x1d2024, roughness: 0.5, metalness: 0.0 }),
  brass: new THREE.MeshStandardMaterial({ color: 0xc9a25a, roughness: 0.32, metalness: 1.0 }),
  silver: new THREE.MeshStandardMaterial({ color: 0xdfe3e9, roughness: 0.38, metalness: 0.45 }),
};
SC_MAT.backsheet.userData.thin = true; SC_MAT.glass.userData.thin = true; SC_MAT.glass.userData.passable = true;

/* ---------- 71 ordinary cells (one definition), the hero cell at the lower right corner ---------- */
const SC_HERO = { c: 5, r: 0 };
const scCellCenter = (c, r) => V3((c - (SC_COLS - 1) / 2) * SC_PITCH, (r - (SC_ROWS - 1) / 2) * SC_PITCH, 0);
const SC_CELL_MATS = [SC_MAT.cellEdge, SC_MAT.cellEdge, SC_MAT.cellEdge, SC_MAT.cellEdge, SC_MAT.cell, SC_MAT.cellEdge];   // +x −x +y −y +z −z
const SC_CELLS = new THREE.InstancedMesh(new THREE.BoxGeometry(SC_CELL, SC_CELL, SC_TW).translate(0, 0, -SC_TW / 2), SC_CELL_MATS, SC_COLS * SC_ROWS - 1);
{ let i = 0; const m = new THREE.Matrix4();
  for (let r = 0; r < SC_ROWS; r++) for (let c = 0; c < SC_COLS; c++) { if (c === SC_HERO.c && r === SC_HERO.r) continue;
    m.makeTranslation(scCellCenter(c, r)); SC_CELLS.setMatrixAt(i++, m); } }
SC_CELLS.name = 'cells'; SC_CELLS.userData.thin = true; PANEL.add(SC_CELLS);   // a 0.18 mm wafer is a thin plate (its faces merge in depth at a distance)

// the hero cell: the same box, minus a 1.2 mm corner notch whose cut faces show the layers (a prepared section, there from the start)
const SC_HC = scCellCenter(SC_HERO.c, SC_HERO.r);
const SC_X0 = SC_HC.x - SC_CELL / 2, SC_X1 = SC_HC.x + SC_CELL / 2, SC_Y0 = SC_HC.y - SC_CELL / 2, SC_Y1 = SC_HC.y + SC_CELL / 2;
const SC_NOTCH = 1.2, SC_CUTX = SC_X1 - SC_NOTCH;                                    // the cut face the camera looks at: x = SC_CUTX, facing +x
// illustrative depths inside the cut, measured down from the top surface (mm): drawn thicker than real (gaps.md)
const SC_LAYER = { tex: 0.004, arc: 0.0018, n: 0.016, dep0: 0.013, dep1: 0.025, al0: SC_TW - SC_FACTS.al.t };
const SECTION_MAT = new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.0, color: 0xffffff });
SECTION_MAT.onBeforeCompile = sh => {
  sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vLoc;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvLoc = position;');
  sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vLoc;\n${NOISE_GLSL}`).replace('#include <color_fragment>', `#include <color_fragment>
    float d = -vLoc.z;                                             // depth below the top surface, mm
    float yy = vLoc.y + vLoc.x;                                    // along the face
    float saw = ${SC_LAYER.tex.toFixed(4)} * abs(fract(yy / 0.008) - 0.5) * 2.0;   // the textured (pyramid) surface, in section
    float aa = fwidth(d) * 1.2 + 1e-7;
    float inSi = smoothstep(saw - aa, saw + aa, d);
    if (inSi < 0.02) discard;
    vec3 arc = vec3(0.11, 0.17, 0.48), nSi = vec3(0.50, 0.56, 0.66), pSi = vec3(0.36, 0.40, 0.47), dep = vec3(0.28, 0.30, 0.37), al = vec3(0.70, 0.71, 0.72);
    float g1 = vnoise(vLoc * 9000.0), g2 = vnoise(vLoc * 2600.0 + 3.0);
    vec3 c = mix(arc, nSi, smoothstep(saw + ${SC_LAYER.arc.toFixed(4)} - aa, saw + ${SC_LAYER.arc.toFixed(4)} + aa, d));
    c = mix(c, dep, smoothstep(${SC_LAYER.dep0.toFixed(4)} - aa, ${SC_LAYER.dep0.toFixed(4)} + aa, d));
    c = mix(c, pSi, smoothstep(${SC_LAYER.dep1.toFixed(4)} - aa, ${SC_LAYER.dep1.toFixed(4)} + aa, d));
    c = mix(c, al * (0.8 + 0.3 * g1), smoothstep(${SC_LAYER.al0.toFixed(4)} - aa * 3.0, ${SC_LAYER.al0.toFixed(4)} + aa * 3.0, d));
    c *= 0.86 + 0.22 * g2 * (0.6 + 0.4 * g1);
    diffuseColor.rgb = c;`);
};
SECTION_MAT.customProgramCacheKey = () => 'sc-section';
// one solid L-shaped wafer (no coincident inner faces): its top carries the same texture as every cell, its sides show the section
const SC_HERO_CELL = new THREE.Group(); SC_HERO_CELL.name = 'one silicon cell';
{ const sh = new THREE.Shape([V3(SC_X0, SC_Y0), V3(SC_CUTX, SC_Y0), V3(SC_CUTX, SC_Y0 + SC_NOTCH), V3(SC_X1, SC_Y0 + SC_NOTCH), V3(SC_X1, SC_Y1), V3(SC_X0, SC_Y1)].map(v => new THREE.Vector2(v.x, v.y)));
  const g = new THREE.ExtrudeGeometry(sh, { depth: SC_TW, bevelEnabled: false, steps: 1 }).translate(0, 0, -SC_TW);
  const p = g.attributes.position, uv = g.attributes.uv, cap = g.groups[0];
  for (let i = cap.start; i < cap.start + cap.count; i++) uv.setXY(i, (p.getX(i) - SC_X0) / SC_CELL, (p.getY(i) - SC_Y0) / SC_CELL);   // same texture as the other cells
  const m = new THREE.Mesh(g, [SC_MAT.cell, SECTION_MAT]); m.name = 'hero cell body'; m.userData.thin = true; SC_HERO_CELL.add(m); }
PANEL.add(SC_HERO_CELL);
// the silver finger that the cut crosses (3D only near the notch; elsewhere the texture's line, too thin to tell apart)
const SC_FINGER_Y = SC_Y0 + SC_FINGER_Y0 + SC_FACTS.finger.pitch * 0 + 0.0;    // the cell's first finger row
const SC_FINGER = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 2.4, 32, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateX(-Math.PI / 2)
  .scale(1, SC_FACTS.finger.w / 2, 0.018).translate(SC_CUTX - 1.2, SC_FINGER_Y, 0), SC_MAT.silver);
SC_FINGER.name = 'silver finger'; PANEL.add(SC_FINGER);
// the finger's cross-section on the cut face (so the cut shows metal, not a hollow)
const SC_FINGER_CAP = new THREE.Mesh(new THREE.CircleGeometry(1, 32, 0, Math.PI).rotateY(Math.PI / 2).rotateX(-Math.PI / 2 * 0)
  .scale(1, SC_FACTS.finger.w / 2, 0.018).translate(SC_CUTX + 0.0003, SC_FINGER_Y, 0), SC_MAT.silver);
PANEL.add(SC_FINGER_CAP);

/* ---------- the rest of the module: backsheet, glass, aluminium frame, mount ---------- */
const SC_BACK = new THREE.Mesh(new THREE.PlaneGeometry(SC_HALF_W * 2, SC_HALF_H * 2).translate(0, 0, -0.8), SC_MAT.backsheet); SC_BACK.name = 'backsheet'; PANEL.add(SC_BACK);
const SC_GLASS = new THREE.Mesh(new THREE.PlaneGeometry(SC_HALF_W * 2, SC_HALF_H * 2).translate(0, 0, 0.45 + SC_FACTS.glass.t), SC_MAT.glass);
SC_GLASS.name = 'glass'; SC_GLASS.userData.passable = true; SC_GLASS.renderOrder = 2; PANEL.add(SC_GLASS);
const SC_FRAME = new THREE.Group(); SC_FRAME.name = 'aluminium frame';
{ const fw = 24, fd = 38, top = 0.45 + SC_FACTS.glass.t + 1.2;
  const bar = (len, horiz) => new THREE.Mesh(new RoundedBoxGeometry(horiz ? len : fw, horiz ? fw : len, fd, 3, 1.4), SC_MAT.alu);
  const b1 = bar(SC_HALF_W * 2 + fw * 2, true), b2 = bar(SC_HALF_W * 2 + fw * 2, true), b3 = bar(SC_HALF_H * 2, false), b4 = bar(SC_HALF_H * 2, false);
  b1.position.set(0, SC_HALF_H + fw / 2, top - fd / 2); b2.position.set(0, -SC_HALF_H - fw / 2, top - fd / 2);
  b3.position.set(SC_HALF_W + fw / 2, 0, top - fd / 2); b4.position.set(-SC_HALF_W - fw / 2, 0, top - fd / 2);
  SC_FRAME.add(b1, b2, b3, b4); }
PANEL.add(SC_FRAME);
// the mount: two rear legs and a front rail down to the ground
const SC_MOUNT = new THREE.Group(); SC_MOUNT.name = 'mount'; universe.add(SC_MOUNT);
{ const leg = (a, b, w = 40) => { const d = b.clone().sub(a), m = new THREE.Mesh(new RoundedBoxGeometry(w, d.length(), w, 3, 3), SC_MAT.aluDark);
    m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); SC_MOUNT.add(m); };
  for (const sx of [-1, 1]) { const top = scU(V3(sx * (SC_HALF_W - 120), SC_HALF_H - 160, -60)), bot = V3(top.x, 0, top.z);
    leg(bot, top); const lo = scU(V3(sx * (SC_HALF_W - 120), -SC_HALF_H + 140, -60)); leg(V3(lo.x, 0, lo.z), lo); } }

/* ---------- the cable from the module's corner to a bulb on the ground ---------- */
const SC_BULB_POS = V3(980, 0, 1240);
const SC_BULB = new THREE.Group(); SC_BULB.name = 'bulb'; SC_BULB.position.copy(SC_BULB_POS); universe.add(SC_BULB);
{ const lathe = (pts, mat, seg = 64) => new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg), mat);
  const base = new THREE.Mesh(new RoundedBoxGeometry(110, 16, 110, 4, 6), SC_MAT.plastic); base.position.y = 8; SC_BULB.add(base);
  SC_BULB.add(lathe([[0, 16], [22, 16], [24, 18], [24, 52], [21, 58], [0, 58]], SC_MAT.plastic));                       // socket body
  const thread = []; for (let i = 0; i <= 48; i++) { const y = 58 + i * 0.5; thread.push([13.2 + 0.9 * Math.abs(Math.sin(i / 48 * Math.PI * 6)), y]); }
  SC_BULB.add(lathe([[0, 58], ...thread, [12, 83], [0, 84]], SC_MAT.brass));                                              // screw base
  // a frosted A-shape bulb: neck, shoulder, round dome (mm, from the screw base up)
  const env = [[12, 83], [13, 90], [15, 99], [19, 109], [24.5, 119], [28.8, 130], [31.2, 142], [31.8, 153], [30.6, 164], [27.2, 174], [21.5, 183], [13.5, 190], [6, 193.4], [0, 194.2]];
  const glow = new THREE.MeshStandardMaterial({ color: 0xfff1dc, emissive: new THREE.Color(1.0, 0.68, 0.34), emissiveIntensity: 1.25, roughness: 0.55 });
  const bulb = lathe(env, glow); bulb.name = 'glowing bulb'; SC_BULB.add(bulb); }
const SC_BULB_LIGHT = new THREE.PointLight(0xffc27a, 900, 0, 2); SC_BULB_LIGHT.position.set(0, 140, 0); SC_BULB.add(SC_BULB_LIGHT);
const SC_CABLES = []; const SC_WIRE = new THREE.Group(); SC_WIRE.name = 'cable'; universe.add(SC_WIRE);
for (const s of [-1, 1]) {
  const p0 = scU(V3(SC_HALF_W + 26, -SC_HALF_H + 40 + s * 14, -22)), corner = scU(V3(SC_HALF_W + 70, -SC_HALF_H - 40, -60));
  const pts = [p0, p0.clone().add(V3(40, -10, 10)), corner, V3(corner.x + 40, 9, corner.z + 120), V3(SC_BULB_POS.x - 120 + s * 6, 9, SC_BULB_POS.z - 40 + s * 14),
    V3(SC_BULB_POS.x - 55, 9, SC_BULB_POS.z + s * 10), V3(SC_BULB_POS.x - 24, 22, SC_BULB_POS.z + s * 8)];
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 320, 4.2, 14, false), SC_MAT.rubber); SC_WIRE.add(m); SC_CABLES.push({ curve, dir: s });
}
// electrons as small blue beads riding along each conductor (a symbol of the current): out through one cable, back through the other
const SC_E_MAT = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.35, 0.65, 1.0).multiplyScalar(2.2) });
const SC_BEADS = new THREE.InstancedMesh(new THREE.SphereGeometry(2.6, 16, 12), SC_E_MAT, 2 * 28); SC_BEADS.name = 'electron flow'; universe.add(SC_BEADS);

/* ---------- the charges in the cut (symbols, in front of the cut face) ---------- */
const SC_ZF = SC_CUTX + 0.004;                                                       // 4 µm in front of the cut face
const scL = (y, z) => scU(V3(SC_ZF, y, z));
const SC_SYM = new THREE.Group(); SC_SYM.name = 'charges and field'; PANEL.add(SC_SYM);
{ const pm = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.62, 0.25).multiplyScalar(1.3) }), mm = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.45, 0.7, 1.0).multiplyScalar(1.3) });
  const bar = (w, h, m) => new THREE.Mesh(new THREE.BoxGeometry(0.0004, w, h), m);
  for (let k = 0; k < 9; k++) { const y = SC_Y0 + 0.08 + k * 0.13;
    const plus = new THREE.Group(); plus.add(bar(0.006, 0.0012, pm), bar(0.0012, 0.006, pm)); plus.position.set(SC_ZF, y, -SC_LAYER.dep0 - 0.0028); SC_SYM.add(plus);   // fixed + ions (n side)
    const minus = bar(0.006, 0.0012, mm); minus.position.set(SC_ZF, y + 0.065, -SC_LAYER.dep1 + 0.0028); SC_SYM.add(minus);                                        // fixed − ions (p side)
    // the built-in field, from the n side to the p side: a small amber arrow between the ions
    const am = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.78, 0.32).multiplyScalar(1.6) });
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.0004, 0.0014, 0.0075), am); shaft.position.set(SC_ZF, y + 0.032, -0.0175); SC_SYM.add(shaft);
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.0026, 0.0045, 3).rotateX(Math.PI), am); head.position.set(SC_ZF, y + 0.032, -0.0232); SC_SYM.add(head); } }
// the photon, the electron (filled blue) and the hole (an orange ring) of the one event the film follows
const SC_PHOTON = new THREE.Mesh(new THREE.CapsuleGeometry(0.0016, 0.012, 6, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.92, 0.6).multiplyScalar(3.0) }));
const SC_ELEC = new THREE.Mesh(new THREE.SphereGeometry(0.0034, 20, 14), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.35, 0.65, 1.0).multiplyScalar(2.4) }));
const SC_HOLE = new THREE.Mesh(new THREE.TorusGeometry(0.003, 0.0009, 10, 28).rotateY(Math.PI / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.55, 0.2).multiplyScalar(2.2) }));
SC_PHOTON.name = 'photon'; SC_ELEC.name = 'electron'; SC_HOLE.name = 'hole'; PANEL.add(SC_PHOTON, SC_ELEC, SC_HOLE);

/* ---------- light: a low warm sun, sky fill, and a studio-like environment for the glass and metal ---------- */
function scEnv() {
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide,
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'varying vec3 vD; void main(){ float y = vD.y; vec3 c = mix(vec3(0.02, 0.022, 0.03), vec3(0.06, 0.08, 0.13), smoothstep(-0.1, 0.5, y)); gl_FragColor = vec4(c, 1.0); }' })));
  const panel = (w, h, pos, col) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide })); m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m); };
  panel(30, 18, [55, 38, 60], new THREE.Color(1.9, 1.4, 0.95));    // the sun's broad reflection
  panel(80, 10, [0, 70, -30], new THREE.Color(0.22, 0.3, 0.48));    // sky strip
  panel(10, 50, [-60, 20, 20], new THREE.Color(0.28, 0.31, 0.38));  // cool fill
  const pm = new THREE.PMREMGenerator(renderer); const t = pm.fromScene(env, 0.02).texture; pm.dispose(); return t;
}
scene.environment = scEnv();
const SC_SUN = new THREE.DirectionalLight(0xffe3bd, 1.7); SC_SUN.position.set(0.55, 0.62, 0.56); scene.add(SC_SUN);
const SC_RIM = new THREE.DirectionalLight(0xbcd2ff, 1.1); SC_RIM.position.set(-0.7, 0.35, -0.6); scene.add(SC_RIM);
scene.add(new THREE.HemisphereLight(0x5a6c90, 0x0c0d10, 0.35));

/* ---------- surroundings: a dark backdrop and a ground that melts into it, a soft shadow under the module ---------- */
const SC_SKY = new THREE.Mesh(new THREE.SphereGeometry(40000, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false,
  vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: 'varying vec3 vD; void main(){ float y = vD.y; vec3 c = mix(vec3(0.030, 0.034, 0.045), vec3(0.010, 0.012, 0.020), smoothstep(0.0, 0.7, y)); gl_FragColor = vec4(c, 1.0); }' }));
SC_SKY.renderOrder = -2; universe.add(SC_SKY);
const SC_GROUND = new THREE.Mesh(new THREE.CircleGeometry(9000, 128).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({ transparent: true,
  vertexShader: 'varying vec2 vP; void main(){ vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `varying vec2 vP; uniform vec3 uBulb;
    void main(){ float d = length(vP - vec2(250.0, 300.0));
      vec3 col = mix(vec3(0.050, 0.052, 0.058), vec3(0.030, 0.034, 0.045), smoothstep(400.0, 4500.0, d));
      float sh = 0.5 * exp(-pow(length((vP - vec2(0.0, -80.0)) / vec2(820.0, 1150.0)), 2.0) * 2.0);          // the module's soft shadow
      col *= 1.0 - sh;
      float pool = exp(-pow(length(vP - uBulb.xz) / 260.0, 2.0));                                        // the bulb's warm pool
      col += vec3(0.22, 0.13, 0.05) * pool;
      gl_FragColor = vec4(col, 1.0 - smoothstep(6000.0, 9000.0, length(vP))); }`, uniforms: { uBulb: { value: SC_BULB_POS } } }));
SC_GROUND.name = 'ground'; universe.add(SC_GROUND);

// depth of field: shallow in the micro close-ups, none on the wide views (F_close ≈ 0.3 mm)
const FILM_DOF = (tau, field) => ({ aperture: 0.0015 + clamp(0.02 * 0.3 / field, 0, 0.03) * (1 - smoother(range(field, 0.9, 1.8))), maxblur: 0.008 });
