/**
 * Numeric verification of the SolarHero choreography (no browser needed).
 * Replicates the transform math from SolarHero.tsx and asserts:
 *  1. No panel ever touches the character's face rect (all p, all widths).
 *  2. Every panel reaches EXACTLY its end pose and then stops moving.
 *  3. Horizontal bleed stays within a small cinematic tolerance (no page overflow).
 *  4. Mobile dock keeps the (rising) face clear.
 */
import { PANELS, animFor, detourAt, mobileAnimFor, planDetours, type Detour } from './src/components/home/panels';

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v: number) => { v = clamp01(v); return v * v * (3 - 2 * v); };
const easeInOut = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

interface Viewport { w: number; h: number; label: string }
const VIEWPORTS: Viewport[] = [
  { w: 320, h: 568, label: '320' },
  { w: 360, h: 740, label: '360' },
  { w: 375, h: 667, label: '375' },
  { w: 390, h: 844, label: '390' },
  { w: 414, h: 896, label: '414' },
  { w: 430, h: 932, label: '430' },
  { w: 768, h: 1024, label: '768' },
  { w: 1024, h: 768, label: '1024' },
  { w: 1280, h: 800, label: '1280' },
  { w: 1440, h: 900, label: '1440' },
  { w: 1920, h: 1080, label: '1920' },
];

function tierWidth(tier: string, w: number): number {
  if (w < 768) return w <= 380 ? 132 : 148;
  if (tier === 'far') return clamp(w * 0.105, 88, 165);
  if (tier === 'near') return clamp(w * 0.18, 140, 240);
  return clamp(w * 0.145, 112, 220);
}

let failures = 0;
const fail = (msg: string) => { failures++; console.log('  FAIL:', msg); };

for (const vp of VIEWPORTS) {
  const { w: W, h: H } = vp;
  const isMobile = W < 768;
  const settleFactor = !isMobile ? (W >= 1280 ? 1 : W >= 1024 ? 0.88 : 0.74) : 1;
  const charH = isMobile ? 0.6 * H : Math.min(0.86 * H, 940);
  const charW = charH * (768 / 1376);
  const faceW = charW * 0.24; // generous (actual ~0.22) incl. margin
  const faceH = faceW * 1.5;
  console.log(`\n== ${vp.label}px (${W}x${H}) settleFactor=${settleFactor} charH=${charH.toFixed(0)} ==`);

  // Precomputed face detours for this viewport (mirrors SolarHero replan()).
  const anims = PANELS.map((_, i) => (isMobile ? mobileAnimFor(i) : animFor(i)));
  const detours: Detour[][] = planDetours(isMobile, W, H, PANELS.map((def) => tierWidth(def.tier, W)), anims);

  // Sample p finely, including exact t1 moments.
  const samples = new Set<number>();
  for (let p = 0; p <= 1.0001; p += 0.02) samples.add(+p.toFixed(3));
  PANELS.forEach((_, i) => {
    const a = isMobile ? mobileAnimFor(i) : animFor(i);
    samples.add(+a.t0.toFixed(4)); samples.add(+a.t1.toFixed(4));
  });
  // Detour-critical samples: bump start, peak, and end per panel.
  for (const dd of detours.flat()) {
    const pDeep = dd.pa + (dd.pb - dd.pa) * dd.tDeep;
    samples.add(+dd.pa.toFixed(4)); samples.add(+pDeep.toFixed(4)); samples.add(+dd.pb.toFixed(4));
  }

  let maxBleed = 0;
  let bleedDesc = '';
  let minFaceGap = Infinity;

  for (const p of [...samples].sort((a, b) => a - b)) {
    const e2 = easeInOut(smooth(p / 0.92));
    const rise = isMobile ? -0.135 * H * e2 : 0.018 * H * e2;
    const faceCx = W / 2;
    const faceCy = H - charH + 0.254 * charH + rise;
    const fx0 = faceCx - faceW / 2, fx1 = faceCx + faceW / 2;
    const fy0 = faceCy - faceH / 2, fy1 = faceCy + faceH / 2;

    PANELS.forEach((def, i) => {
      const a = isMobile ? mobileAnimFor(i) : animFor(i);
      const s = isMobile ? def.mStart : def.start;
      const e = isMobile ? def.mEnd : def.end;
      const local = smooth((p - a.t0) / (a.t1 - a.t0));
      const ez = easeInOut(local);
      const dx = e.x - s.x, dy = e.y - s.y;
      const len = Math.hypot(dx, dy) || 1;
      const bowOff = a.bow * Math.sin(Math.PI * ez);
      const swirlEnv = Math.sin(Math.PI * Math.min(p / 0.4, 1)) * (1 - ez);
      const swx = Math.cos(a.swirlPhase + p * 5) * a.swirl * swirlEnv;
      const swy = Math.sin(a.swirlPhase * 1.3 + p * 4) * a.swirl * swirlEnv;
      let cxFrac = s.x + dx * ez + (-dy / len) * bowOff + swx;
      let cyFrac = s.y + dy * ez + (dx / len) * bowOff + swy;
      const rot = s.r + (e.r - s.r) * ez + Math.sin(Math.PI * ez) * a.wob;
      const endScale = isMobile ? e.s : e.s * settleFactor;
      const sc = s.s + (endScale - s.s) * ez;

      const baseW = tierWidth(def.tier, W);
      const pw = baseW * sc;
      const ph = def.aspect === '3 / 2' ? (pw / 3) * 2 : (pw / 16) * 9;
      // Rotation-inflated AABB.
      const rad = (Math.abs(rot) * Math.PI) / 180;
      const cos = Math.abs(Math.cos(rad));
      const sin = Math.abs(Math.sin(rad));
      const bw = pw * cos + ph * sin;
      const bh = pw * sin + ph * cos;
      for (const dt of detours[i]) {
        const [ox, oy] = detourAt(dt, p, W, H);
        cxFrac += ox; cyFrac += oy;
      }
      const cx = W / 2 + cxFrac * W;
      const cy = H / 2 + cyFrac * H;
      const x0 = cx - bw / 2, x1 = cx + bw / 2;
      const y0 = cy - bh / 2, y1 = cy + bh / 2;

      // 1. Face protection (strict overlap test).
      const overlapsFace = x0 < fx1 && x1 > fx0 && y0 < fy1 && y1 > fy0;
      if (overlapsFace) {
        fail(`p=${p} panel ${def.id}: touches face rect (panel ${x0.toFixed(0)},${y0.toFixed(0)}-${x1.toFixed(0)},${y1.toFixed(0)} face ${fx0.toFixed(0)},${fy0.toFixed(0)}-${fx1.toFixed(0)},${fy1.toFixed(0)})`);
      }
      const gapX = Math.max(0, Math.max(fx0 - x1, x0 - fx1));
      const gapY = Math.max(0, Math.max(fy0 - y1, y0 - fy1));
      minFaceGap = Math.min(minFaceGap, Math.hypot(gapX, gapY));

      // 2. Bleed tracking (stage clips; page must never scroll sideways).
      const bleed = Math.max(0, -x0, x1 - W);
      if (bleed > maxBleed) { maxBleed = bleed; bleedDesc = `${def.id} p=${p}`; }

      // 3. Exact settle: at local>=1 the pose must equal the end pose.
      if (p >= a.t1 && local >= 1) {
        const posErr = Math.hypot((cxFrac - e.x) * W, (cyFrac - e.y) * H);
        const rotErr = Math.abs(rot - e.r);
        const scErr = Math.abs(sc - endScale);
        if (posErr > 0.6 || rotErr > 0.01 || scErr > 0.0005) {
          fail(`p=${p} panel ${def.id}: not exactly settled (posErr=${posErr.toFixed(2)} rotErr=${rotErr.toFixed(3)} scErr=${scErr.toFixed(4)})`);
        }
      }
    });
  }
  console.log(`  min face gap: ${minFaceGap.toFixed(1)}px | max horizontal bleed: ${maxBleed.toFixed(1)}px (${bleedDesc})`);
  if (maxBleed > 70) fail(`bleed ${maxBleed.toFixed(1)}px exceeds 70px tolerance`);
}


// ── Continuity: no panel may jump between adjacent scroll samples ──
console.log('\n== continuity (max per-step displacement, dp=0.002) ==');
for (const vp of VIEWPORTS) {
  const { w: W, h: H } = vp;
  const isMobile = W < 768;
  const settleFactor = !isMobile ? (W >= 1280 ? 1 : W >= 1024 ? 0.88 : 0.74) : 1;
  const charH = isMobile ? 0.6 * H : Math.min(0.86 * H, 940);
  const charW = charH * (768 / 1376);
  const cAnims = PANELS.map((_, i) => (isMobile ? mobileAnimFor(i) : animFor(i)));
  const cDetours: Detour[][] = planDetours(isMobile, W, H, PANELS.map((def) => tierWidth(def.tier, W)), cAnims);
  let worst = 0; let worstDesc = '';
  const prev = new Array(PANELS.length).fill(null) as ([number, number] | null)[];
  for (let step = 0; step <= 2000; step++) {
    const p = step * 0.0005;
    PANELS.forEach((def, i) => {
      const a = isMobile ? mobileAnimFor(i) : animFor(i);
      const s = isMobile ? def.mStart : def.start;
      const e = isMobile ? def.mEnd : def.end;
      const local = smooth((p - a.t0) / (a.t1 - a.t0));
      const ez = easeInOut(local);
      const dx = e.x - s.x, dy = e.y - s.y;
      const len = Math.hypot(dx, dy) || 1;
      const bowOff = a.bow * Math.sin(Math.PI * ez);
      const swirlEnv = Math.sin(Math.PI * Math.min(p / 0.4, 1)) * (1 - ez);
      const swx = Math.cos(a.swirlPhase + p * 5) * a.swirl * swirlEnv;
      const swy = Math.sin(a.swirlPhase * 1.3 + p * 4) * a.swirl * swirlEnv;
      let cxFrac = s.x + dx * ez + (-dy / len) * bowOff + swx;
      let cyFrac = s.y + dy * ez + (dx / len) * bowOff + swy;
      const rot = s.r + (e.r - s.r) * ez + Math.sin(Math.PI * ez) * a.wob;
      const endScale = isMobile ? e.s : e.s * settleFactor;
      const sc = s.s + (endScale - s.s) * ez;
      const baseW = tierWidth(def.tier, W);
      const pw = baseW * sc;
      const ph = def.aspect === '3 / 2' ? (pw / 3) * 2 : (pw / 16) * 9;
      const rad = (Math.abs(rot) * Math.PI) / 180;
      const cos = Math.abs(Math.cos(rad)); const sin = Math.abs(Math.sin(rad));
      for (const dt of cDetours[i]) {
        const [ox, oy] = detourAt(dt, p, W, H);
        cxFrac += ox; cyFrac += oy;
      }
      const X = W / 2 + cxFrac * W, Y = H / 2 + cyFrac * H;
      if (prev[i]) {
        const d = Math.hypot(X - prev[i]![0], Y - prev[i]![1]);
        if (d > worst) { worst = d; worstDesc = `${def.id} p=${p.toFixed(3)}`; }
      }
      prev[i] = [X, Y];
    });
  }
  console.log(`  ${vp.label}px: worst step = ${worst.toFixed(2)}px (${worstDesc})`);
  if (worst > 8) fail(`${vp.label}px: panel jump ${worst.toFixed(1)}px exceeds 8px/0.0005p`);
}

console.log(failures === 0 ? '\nGEOMETRY: ALL CHECKS PASSED' : `\nGEOMETRY: ${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

