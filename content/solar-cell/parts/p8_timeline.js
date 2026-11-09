/* =====================================================================================
   8. TIMELINE — one continuous camera: the module in low sun (hook) → a steady dive, looking straight down on one cell's silver
   fingers and busbars, then tilting into its cut-away notch → the photon event at the p-n junction (key) → a steady pull-back to the cable and the lit bulb (key) → back to the
   opening view. Played: hook ×2, transit ×8, key ×2, return ×3 → ≈ 19.7 s (kickoff 15–20 s).
   ===================================================================================== */
const SC_T = {
  hookEnd: 5.0, arrive: 37.0, leave: 45.2, circuit: 78.4, circuitEnd: 85.2,
};
const LOOP_T = 91.7;
const scPanelCenter = scU(V3(0, 0, 0));
const scHeroCenter = scU(SC_HC);
const scNotch = scU(V3(SC_CUTX, SC_FINGER_Y, -0.075));
const scCorner = scU(V3(SC_HALF_W, -SC_HALF_H, 0));
const scCircuit = scCorner.clone().lerp(SC_BULB_POS.clone().add(V3(0, 90, 0)), 0.05);   // nearer the corner: the pull-back's aim travels less (QA pace)
// the opening view aims a little toward the corner cell, so the dive's aim has less far to travel (QA pace: ≤ 1.5 views/s)
const scHookT = scPanelCenter.clone().lerp(scNotch, 0.4);

// directions: the opening three-quarter view, the cut face seen head-on (up = the panel's normal, so the layers lie level),
// and the circuit seen from the front right
const SC_DIR_A = eyeDir('panel', 28, -28), SC_UP_A = V3(0, 1, 0);
const SC_DIR_B = eyeDir('face', 0, 10), SC_UP_B = scDir(V3(0, 0, 1));
const SC_DIR_C = eyeDir('world', 42, 20), SC_UP_C = V3(0, 1, 0);
let scKeyN = 0;
function scKey(t, T, field, dir, up, o = {}) {        // a key looking along `dir` with `up`, through a frame made for it
  const back = dir.clone().normalize(), right = up.clone().cross(back).normalize(), u2 = back.clone().cross(right).normalize();
  const name = 'sck' + (scKeyN++); CAMFRAMES[name] = { right, up: u2, back };
  return key(t, T, field, { ...o, frame: name, yaw: 0, pitch: 0 });
}
function scSlerpLater(d, f) { return scSlerp(d, SC_DIR_B, f); }
const scSlerp = (a, b, f) => { const q = new THREE.Quaternion().setFromUnitVectors(a.clone().normalize(), b.clone().normalize()); return a.clone().applyQuaternion(new THREE.Quaternion().slerp(q, f)).normalize(); };
const SC_DIR_TOP = scSlerpLater(eyeDir('panel', 10, -14), 0.3);    // down on the cell (its fingers and busbars), already turning toward the cut

// the hook: a slow push on the module
scKey(0.0, scHookT, 1700, SC_DIR_A, SC_UP_A, { at: 0.4 });
scKey(SC_T.hookEnd, scHookT, 1600, SC_DIR_A, SC_UP_A, { at: 0.4, flow: false });
// the dive: the view narrows at a steady rate (geometric fields at even times) while the aim slides from the module's centre to
// the hero cell and its notch, and the direction turns from the opening view to the cut face
{ const n = 9, F0 = 1600, F1 = 0.215;
  for (let k = 1; k <= n; k++) {
    const f = k / n, t = SC_T.hookEnd + (SC_T.arrive - SC_T.hookEnd) * f, field = F0 * Math.pow(F1 / F0, f);
    // the aim moves in step with the zoom (linear in the field): its sweep stays ≈ zoom rate × distance / field span
    const T = scNotch.clone().lerp(scHookT, (field - F1) / (F0 - F1));
    // first down onto the cell (an even turn while the field narrows to ~12 cm), then an even tilt into the cut face
    const g = Math.log(F0 / field) / Math.log(F0 / F1), gs = 0.3;
    const dir = g < gs ? scSlerp(SC_DIR_A, SC_DIR_TOP, g / gs) : scSlerp(SC_DIR_TOP, SC_DIR_B, (g - gs) / (1 - gs));
    const up = scSlerp(SC_UP_A, SC_UP_B, smoother(clamp01((g - 0.2) / 0.8)));
    scKey(t, T, field, dir, up, { at: lerp(0.4, 0.42, f), flow: k < n });
  } }
// the stop at the junction: a very slow push while the photon event plays
scKey(SC_T.leave, scNotch, 0.195, scSlerp(SC_DIR_B, SC_DIR_C, 0.0), SC_UP_B, { at: 0.42, flow: false });
// the pull-back: out of the notch, up over the panel, to the cable and the bulb
{ const n = 7, F0 = 0.195, F1 = 860;
  for (let k = 1; k <= n; k++) {
    const f = k / n, t = SC_T.leave + (SC_T.circuit - SC_T.leave) * f, field = F0 * Math.pow(F1 / F0, f);
    const T = scNotch.clone().lerp(scCircuit, (field - F0) / (F1 - F0));
    // one even turn from the cut face to the circuit view, lifted over the frame in the middle (no fast swing — QA pace ≤ 45°/s)
    const dir = scSlerp(SC_DIR_B, SC_DIR_C, f).addScaledVector(SC_UP_B, 0.3 * Math.sin(Math.PI * f)).normalize();
    const up = scSlerp(SC_UP_B, SC_UP_C, f);
    scKey(t, T, field, dir, up, { at: lerp(0.42, 0.36, f), flow: k < n });
  } }
scKey(SC_T.circuitEnd, scCircuit, 820, scSlerp(SC_DIR_C, SC_DIR_A, 0.04), SC_UP_C, { at: 0.36, flow: false });
// the way back to the opening pose (= the first key)
scKey(LOOP_T, scHookT, 1700, SC_DIR_A, SC_UP_A, { at: 0.4, flow: false });

beat(0.0, SC_T.hookEnd, 'hook', 'The module in low sun');
beat(SC_T.hookEnd, SC_T.arrive, 'transit', 'Into one cell');
beat(SC_T.arrive, SC_T.leave, 'key', 'A photon at the junction');
beat(SC_T.leave, SC_T.circuit, 'transit', 'Out to the circuit');
beat(SC_T.circuit, SC_T.circuitEnd, 'key', 'The current lights the bulb');
beat(SC_T.circuitEnd, LOOP_T, 'return', 'Back to the module');

caption(0.3, 4.9, 'How a solar cell works', '', '', PANEL);
caption(SC_T.arrive + 0.2, SC_T.leave - 0.2, 'Light frees electrons', 'A field sweeps them out', '', SC_HERO_CELL);
caption(SC_T.circuit + 0.2, SC_T.circuitEnd - 0.2, 'Current flows', 'Electrons light the bulb', '', [SC_BULB, SC_WIRE]);

// labels on the cut (the layers are drawn thicker than real: gaps.md); they leave one after another as the camera starts to move
const scYL = SC_Y0 + 0.555;   // inside the view (it spans ≈ Y0+0.50 … Y0+0.70)
tag(SC_T.arrive + 0.4, SC_T.leave + 0.3, scU(V3(SC_ZF, scYL, -0.007)), 'n-type silicon', '');
tag(SC_T.arrive + 0.5, SC_T.leave + 0.6, scU(V3(SC_ZF, scYL, -0.105)), 'p-type silicon · layers not to scale', '');
tag(SC_T.arrive + 0.7, SC_T.leave + 0.9, scU(V3(SC_CUTX, SC_FINGER_Y, 0.02)), 'Silver finger', '');
tag(SC_T.arrive + 0.8, SC_T.leave + 1.2, scU(V3(SC_ZF, scYL, -0.166)), 'Aluminium contact', '', 'below');
tag(SC_T.circuit + 0.5, SC_T.circuitEnd - 0.3, () => SC_CABLES[0].curve.getPointAt(0.55).add(V3(0, 8, 0)), 'Electrons out (−)', '');
tag(SC_T.circuit + 0.7, SC_T.circuitEnd - 0.3, () => SC_CABLES[1].curve.getPointAt(0.8).add(V3(0, 8, 0)), 'and back (+)', '', 'below');

const RULER = null;   // no field-of-view ruler: its text crowded the cut and the panel

// the one event the film follows (panel-local mm, in front of the cut face): photon in → pair → electron to the finger, hole to the aluminium
const SC_E = { t0: SC_T.arrive + 0.5, abs: SC_T.arrive + 2.0, end: SC_T.leave - 0.5 };
const SC_ABS = [SC_ZF, SC_Y0 + 0.545, -0.07];
const SC_PH0 = [SC_ZF, SC_Y0 + 0.43, 0.32];
const SC_PH_DIR = V3(0, SC_ABS[1] - SC_PH0[1], SC_ABS[2] - SC_PH0[2]).normalize();
const SC_FLASH = new THREE.Mesh(new THREE.SphereGeometry(0.011, 24, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.9, 0.6).multiplyScalar(2.0), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
PANEL.add(SC_FLASH);
const scElec = tau => tween(tau, [[SC_E.abs, SC_ABS], [SC_E.abs + 0.9, [SC_ZF, SC_ABS[1], -0.032]], [SC_E.abs + 1.5, [SC_ZF, SC_ABS[1] + 0.025, -0.009]],
  [SC_E.abs + 2.6, [SC_ZF, SC_FINGER_Y, -0.004]], [SC_E.abs + 3.2, [SC_ZF, SC_FINGER_Y, 0.006]], [SC_E.end, [SC_CUTX - 0.03, SC_FINGER_Y, 0.006]]]);
const scHole = tau => tween(tau, [[SC_E.abs, SC_ABS], [SC_E.abs + 0.9, [SC_ZF, SC_ABS[1] - 0.01, -0.105]], [SC_E.abs + 2.6, [SC_ZF, SC_ABS[1] - 0.02, -0.158]],
  [SC_E.end, [SC_CUTX - 0.03, SC_ABS[1] - 0.02, -0.158]]]);

const WARMUP_TAUS = [0, 20, 39, 42, 60, 74];
const scM = new THREE.Matrix4(), scQ = new THREE.Quaternion();
function applyScene(tau, tp, field) {
  // the bulb's light in true units: the floating origin scales the world by 1/D, so a point light's intensity scales with D²
  // (E = I_mm / d_mm²: ≈ 0.6 at 15 cm from the bulb)
  SC_BULB_LIGHT.intensity = 13500 / (CAM.D * CAM.D);
  // the photon: from above the cell (outside the view) to where it is absorbed
  const ph = range(tau, SC_E.t0, SC_E.abs);
  SC_PHOTON.visible = tau > SC_E.t0 && tau < SC_E.abs;
  SC_PHOTON.position.set(lerp(SC_PH0[0], SC_ABS[0], ph), lerp(SC_PH0[1], SC_ABS[1], ph), lerp(SC_PH0[2], SC_ABS[2], ph));
  SC_PHOTON.quaternion.setFromUnitVectors(V3(0, 1, 0), SC_PH_DIR);
  // the absorption: a brief flash where the pair is made
  const fl = pulse(tau, SC_E.abs - 0.05, SC_E.abs + 0.1, SC_E.abs + 0.15, SC_E.abs + 0.7);
  SC_FLASH.visible = fl > 0.003; SC_FLASH.position.set(...SC_ABS); SC_FLASH.scale.setScalar(0.4 + 0.8 * range(tau, SC_E.abs - 0.05, SC_E.abs + 0.7)); SC_FLASH.material.opacity = fl * 0.85;
  // the electron and the hole exist from the absorption on, then pass into the metal (hidden inside it)
  const born = tau >= SC_E.abs;
  SC_ELEC.visible = SC_HOLE.visible = born;
  if (born) { SC_ELEC.position.set(...scElec(tau)); SC_HOLE.position.set(...scHole(tau)); }
  // electrons along the cable: out through one conductor, back through the other, two whole cycles per loop
  let i = 0;
  for (const c of SC_CABLES) for (let k = 0; k < SC_BEAD_N; k++) {
    const u0 = (k / SC_BEAD_N + (c.dir < 0 ? 1 : -1) * 2 * tp / LOOP) % 1, u = 0.04 + 0.92 * ((u0 + 1) % 1);    // black (−): toward the bulb; red (+): back
    const p = c.curve.getPointAt(u).add(V3(0, 5.5, 0)); scM.makeTranslation(p.x, p.y, p.z); SC_BEADS.setMatrixAt(i++, scM);
  }
  SC_BEADS.instanceMatrix.needsUpdate = true;
  // sunlight streaks: six whole cycles per loop; each fades in far from the panel and is absorbed at the glass; any that would pass
  // close to the lens fade (camera state, not time)
  const travel = 1500, up = V3(0, 1, 0);
  scQ.setFromUnitVectors(up, SC_SUNDIR);
  for (let k = 0; k < SC_RAY_N; k++) {
    const r = SC_RAY_SEEDS[k], ph = (r.ph + 6 * tp / LOOP) % 1, pos = r.p.clone().addScaledVector(SC_SUNDIR, travel * (1 - ph) + 60);
    const near = smoother(clamp01((pos.distanceTo(CAM_POS) - 0.15 * CAM.D) / (0.35 * CAM.D)));
    const s = smoother(clamp01(ph / 0.3)) * near * smoother(range(field, 30, 140));   // only in the wide views
    scM.compose(pos, scQ, V3(s, s, s)); SC_RAYS.setMatrixAt(k, scM);
  }
  SC_RAYS.instanceMatrix.needsUpdate = true;
}
