/**
 * SolarHero panel data + choreography.
 *
 * The 18 panels are the REAL tool screenshots from /pictures/landingpage/
 * (optimized copies served from /public/hero-panels/). The reference image
 * (Screenshot_20260913-204303.png) is intentionally NOT part of this list.
 *
 * Coordinate system: fractions of the stage size, relative to stage center.
 * x: -0.5 (left edge) .. +0.5 (right edge)
 * y: -0.5 (top edge)   .. +0.5 (bottom edge)
 *
 * Everything here is deterministic — no Math.random, no per-render jitter —
 * so the ORBIT → DESCEND → CONVERGE → SETTLE choreography is identical on
 * every visit and every device of the same breakpoint.
 */

export type Tier = 'far' | 'mid' | 'near';

export interface Pose {
  /** Horizontal center, stage fractions from center. */
  x: number;
  /** Vertical center, stage fractions from center. */
  y: number;
  /** Rotation in degrees. */
  r: number;
  /** Scale multiplier on top of the tier base width. */
  s: number;
  /** Opacity (panels stay slightly transparent by design, ≤ 0.95). */
  o: number;
  /** Stack order. The character sits at z = 10. */
  z: number;
}

export interface PanelDef {
  id: string;
  /** Public URL of the optimized screenshot. */
  src: string;
  /** Accessible description of the screenshot content. */
  alt: string;
  /** CSS aspect-ratio — matches the source (16:9 or ~3:2). Never stretched. */
  aspect: string;
  tier: Tier;
  /** ORBIT pose (desktop ≥768px). */
  start: Pose;
  /** SETTLE pose (desktop ≥768px). */
  end: Pose;
  /** ORBIT pose (mobile <768px). */
  mStart: Pose;
  /** SETTLE pose (mobile <768px). */
  mEnd: Pose;
}

export interface PanelAnim {
  /** Scroll progress where this panel starts travelling. */
  t0: number;
  /** Scroll progress where this panel reaches its destination and STOPS. */
  t1: number;
  /** Perpendicular bow of the travel path (curved descend, not a straight line). */
  bow: number;
  /** Early-orbit drift amplitude (decays to zero as the panel descends). */
  swirl: number;
  swirlPhase: number;
  /** Rotation wobble in degrees (decays to zero so the settle rotation is exact). */
  wob: number;
  /** Idle float duration / delay for the inner layer. */
  bobDur: number;
  bobDelay: number;
}

const MOBILE_ORBIT_Y = [-0.4, -0.29, -0.18, -0.07, 0.04, 0.15, 0.26, 0.37];
const MOBILE_SIDE_TIERS: Tier[] = ['far', 'mid', 'mid', 'mid', 'mid', 'mid', 'mid', 'near'];
const MOBILE_SIDE_ROT = [-4, 3, -3, 4, -3, 3, -4, 3];
const MOBILE_TIER_STYLE: Record<Tier, { s: number; o: number; z: number }> = {
  far: { s: 0.8, o: 0.62, z: 3 },
  mid: { s: 1.0, o: 0.8, z: 6 },
  near: { s: 1.12, o: 0.9, z: 13 },
};

function mobileStart(i: number): Pose {
  // Panels 0..7 form the left column, 8..15 the right column,
  // 16..17 peek from behind the headline scrim.
  if (i < 8) {
    const tier = MOBILE_SIDE_TIERS[i];
    const st = MOBILE_TIER_STYLE[tier];
    return { x: i === 7 ? -0.3 : -0.315, y: MOBILE_ORBIT_Y[i], r: MOBILE_SIDE_ROT[i], ...st };
  }
  if (i < 16) {
    const k = i - 8;
    const tier = MOBILE_SIDE_TIERS[k];
    const st = MOBILE_TIER_STYLE[tier];
    // Restream (i=13) orbits at chin height: 0.332 keeps its start pose out
    // of the face trigger band (a start inside the band would leave the
    // detour no runway and spike the motion).
    return { x: k === 7 ? 0.3 : i === 13 ? 0.332 : 0.315, y: MOBILE_ORBIT_Y[k], r: -MOBILE_SIDE_ROT[k], ...st };
  }
  return i === 16
    ? { x: -0.13, y: -0.445, r: -2, s: 0.85, o: 0.6, z: 2 }
    : { x: 0.13, y: -0.445, r: 2, s: 0.85, o: 0.6, z: 2 };
}

const DOCK_SLOT: [number, number][] = [
  [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], // left column docks left
  [1, 2], [1, 3], // lower-left hops to center
  [2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], // right column docks right
  [1, 4], [1, 5], // lower-right hops to center
  [1, 0], [1, 1], // top pair descends the middle, parting around her
];

export function dockSlot(i: number): { col: number; row: number } {
  const [col, row] = DOCK_SLOT[i];
  return { col, row };
}

function mobileEnd(i: number): Pose {
  // The dock: a stable 3 x 6 grid around the character's feet.
  const { col, row } = dockSlot(i);
  return {
    x: [-0.26, 0, 0.26][col],
    y: 0.1 + row * 0.065,
    r: (col - 1) * 4 + (row - 2.5) * 0.5,
    s: 0.7 + row * 0.02,
    o: 0.94,
    z: 12,
  };
}

interface RawPanel {
  id: string;
  file: string;
  alt: string;
  aspect: string;
  tier: Tier;
  start: Pose;
  end: Pose;
}

const RAW: RawPanel[] = [
  {
    id: 'edit-timeline',
    file: '665efd25764a0a7ad47642be_built-for-creators.webp',
    alt: 'Screenshot: AI video editing timeline with preview monitor and clip controls',
    aspect: '16 / 9',
    tier: 'far',
    start: { x: -0.4, y: -0.3, r: -9, s: 0.78, o: 0.6, z: 3 },
    end: { x: -0.305, y: 0.235, r: -7, s: 1.15, o: 0.94, z: 11 },
  },
  {
    id: 'translate-course',
    file: '68089aac108a8b3ab2cbac9e_translate.webp',
    alt: 'Screenshot: AI-translated talking-head course video page about growth and learning',
    aspect: '16 / 9',
    tier: 'far',
    start: { x: 0.395, y: -0.29, r: 8, s: 0.78, o: 0.6, z: 3 },
    end: { x: -0.183, y: 0.235, r: -4, s: 1.15, o: 0.94, z: 11 },
  },
  {
    id: 'opus-clip',
    file: '6834a51735bcff633efc35d9_opus-pro-1-screenshot.webp',
    alt: 'Screenshot: OpusClip AI tool turning one long video into viral clips',
    aspect: '16 / 9',
    tier: 'far',
    start: { x: -0.325, y: -0.045, r: 5, s: 0.8, o: 0.64, z: 4 },
    end: { x: -0.061, y: 0.235, r: -2, s: 1.15, o: 0.94, z: 11 },
  },
  {
    id: 'agent-chat',
    file: '68bd6982-5b0d-41ca-b5df-949f52846c1f.webp',
    alt: 'Screenshot: dark AI chat agent workspace with conversation threads',
    aspect: '16 / 9',
    tier: 'far',
    start: { x: 0.325, y: -0.03, r: -6, s: 0.8, o: 0.64, z: 4 },
    end: { x: 0.061, y: 0.235, r: 2, s: 1.15, o: 0.94, z: 11 },
  },
  {
    id: 'script-to-video',
    file: '6a549fe2bfcb21e0ab0409e3.webp',
    alt: 'Screenshot: script-to-video creator dashboard with story templates',
    aspect: '16 / 9',
    tier: 'far',
    start: { x: -0.235, y: 0.235, r: -4, s: 0.82, o: 0.66, z: 4 },
    end: { x: 0.183, y: 0.235, r: 4, s: 1.15, o: 0.94, z: 11 },
  },
  {
    id: 'motion-3d',
    file: '6a58c1a73446434e864670db_Screen-Create-1.webp',
    alt: 'Screenshot: AI generator creating 3D motion from video or text',
    aspect: '16 / 9',
    tier: 'far',
    start: { x: 0.235, y: 0.25, r: 6, s: 0.82, o: 0.66, z: 4 },
    end: { x: 0.305, y: 0.235, r: 7, s: 1.15, o: 0.94, z: 11 },
  },
  {
    id: 'seo-check',
    file: '9b6efbe4f176a24c0d772a1fa4df83b31c975dd30a423e9a29c91b96f5dca94d-CleanShot_2025-08-09_at_18.06.452x.webp',
    alt: 'Screenshot: AI SEO content checker scoring a draft article',
    aspect: '16 / 9',
    tier: 'mid',
    start: { x: -0.4, y: 0.1, r: -11, s: 0.95, o: 0.76, z: 6 },
    end: { x: -0.325, y: 0.325, r: -6, s: 0.88, o: 0.94, z: 12 },
  },
  {
    id: 'agent-workflow',
    file: 'Agent_chat_e511b0a4c8.webp',
    alt: 'Screenshot: AI agent chat workflow builder with connected nodes',
    aspect: '16 / 9',
    tier: 'mid',
    start: { x: 0.4, y: 0.12, r: 10, s: 0.95, o: 0.76, z: 6 },
    end: { x: -0.195, y: 0.325, r: -3, s: 0.88, o: 0.94, z: 12 },
  },
  {
    id: 'claude-chat',
    file: 'Claude-AI1.webp',
    alt: 'Screenshot: Claude AI assistant greeting the user in a chat window',
    aspect: '16 / 9',
    tier: 'mid',
    start: { x: -0.185, y: -0.375, r: 4, s: 0.92, o: 0.74, z: 5 },
    end: { x: -0.065, y: 0.325, r: -1, s: 0.88, o: 0.94, z: 12 },
  },
  {
    id: 'vidiq-stats',
    file: 'Viq4JAURG8QhR6nAKH4aJS.webp',
    alt: 'Screenshot: vidIQ dashboard with YouTube video analytics',
    aspect: '16 / 9',
    tier: 'mid',
    start: { x: 0.185, y: -0.365, r: -5, s: 0.92, o: 0.74, z: 5 },
    end: { x: 0.065, y: 0.325, r: 1, s: 0.88, o: 0.94, z: 12 },
  },
  {
    id: 'midjourney-gallery',
    file: 'acUdYJGXnQHGY_U6_midjourney-interface.webp',
    alt: 'Screenshot: Midjourney gallery grid of AI-generated images',
    aspect: '16 / 9',
    tier: 'mid',
    start: { x: -0.345, y: 0.345, r: -6, s: 0.98, o: 0.78, z: 7 },
    end: { x: 0.195, y: 0.325, r: 3, s: 0.88, o: 0.94, z: 12 },
  },
  {
    id: 'suno-music',
    file: 'image5-13.webp',
    alt: 'Screenshot: Suno V5 AI music model announcement page',
    aspect: '16 / 9',
    tier: 'mid',
    start: { x: 0.345, y: 0.355, r: 7, s: 0.98, o: 0.78, z: 7 },
    end: { x: 0.325, y: 0.325, r: 6, s: 0.88, o: 0.94, z: 12 },
  },
  {
    id: 'perplexity-pages',
    file: 'maxresdefault.webp',
    alt: 'Screenshot: Perplexity tool generating web pages from a prompt',
    aspect: '16 / 9',
    tier: 'near',
    start: { x: -0.265, y: -0.175, r: -7, s: 1.12, o: 0.9, z: 13 },
    end: { x: -0.325, y: 0.415, r: -5, s: 0.78, o: 0.95, z: 13 },
  },
  {
    id: 'restream-studio',
    file: 'restream-tools-and-features.webp',
    alt: 'Screenshot: Restream live studio with guest video feeds',
    aspect: '16 / 9',
    tier: 'near',
    start: { x: 0.265, y: -0.155, r: 8, s: 1.12, o: 0.9, z: 13 },
    end: { x: -0.195, y: 0.415, r: -3, s: 0.78, o: 0.95, z: 13 },
  },
  {
    id: 'runway-tools',
    file: 'runway-ai-popular-tools.webp',
    alt: 'Screenshot: Runway gallery of generative AI creative tools',
    aspect: '3 / 2',
    tier: 'near',
    start: { x: -0.3, y: 0.175, r: -5, s: 1.1, o: 0.88, z: 12 },
    end: { x: -0.065, y: 0.415, r: -1, s: 0.78, o: 0.95, z: 13 },
  },
  {
    id: 'viewstats-analytics',
    file: 'view-stats.webp',
    alt: 'Screenshot: ViewStats channel analytics with views charts',
    aspect: '16 / 9',
    tier: 'near',
    start: { x: 0.3, y: 0.195, r: 6, s: 1.1, o: 0.88, z: 12 },
    end: { x: 0.065, y: 0.415, r: 1, s: 0.78, o: 0.95, z: 13 },
  },
  {
    id: 'whisper-transcript',
    file: 'whisper-web.webp',
    alt: 'Screenshot: Whisper Web free audio-to-text transcription tool',
    aspect: '16 / 9',
    tier: 'near',
    start: { x: -0.125, y: 0.315, r: -3, s: 1.08, o: 0.88, z: 14 },
    end: { x: 0.195, y: 0.415, r: 3, s: 0.78, o: 0.95, z: 13 },
  },
  {
    id: 'eleven-voices',
    file: 'yfzxw4iha5-eleven-creative.webp',
    alt: 'Screenshot: ElevenLabs library of AI voices for creators',
    aspect: '16 / 9',
    tier: 'near',
    start: { x: 0.125, y: 0.335, r: 4, s: 1.08, o: 0.88, z: 14 },
    end: { x: 0.325, y: 0.415, r: 5, s: 0.78, o: 0.95, z: 13 },
  },
];

export const PANELS: PanelDef[] = RAW.map((p, i) => ({
  ...p,
  src: `/hero-panels/${p.file}`,
  mStart: mobileStart(i),
  mEnd: mobileEnd(i),
}));

/** Desktop timing: the back row docks first, the front row last (waves). */
const DESKTOP_ROWS = [
  { t0: 0.05, t1: 0.64 },
  { t0: 0.14, t1: 0.76 },
  { t0: 0.23, t1: 0.86 },
];

function sharedAnim(i: number): Omit<PanelAnim, 't0' | 't1'> {
  const dir = i % 2 === 0 ? 1 : -1;
  return {
    bow: dir * (0.016 + ((i * 11) % 5) * 0.008),
    swirl: 0.008 + ((i * 7) % 10) * 0.0012,
    swirlPhase: i * 0.9,
    wob: -dir * (2.5 + ((i * 13) % 4)),
    bobDur: 5.2 + ((i * 37) % 30) / 10,
    bobDelay: -(((i * 53) % 60) / 10),
  };
}

export function animFor(i: number): PanelAnim {
  const row = Math.floor(i / 6);
  const col = i % 6;
  const base = DESKTOP_ROWS[row];
  return {
    ...sharedAnim(i),
    t0: base.t0 + col * 0.012,
    t1: base.t1 + (col % 3) * 0.008,
  };
}

/** Mobile timing: six dock rows ripple from top to bottom. */
export function mobileAnimFor(i: number): PanelAnim {
  const { col, row } = dockSlot(i);
  return {
    ...sharedAnim(i),
    t0: 0.05 + row * 0.032 + col * 0.008,
    t1: 0.62 + row * 0.042 + col * 0.006,
  };
}

/* ── Face protection via precomputed detours ────────────────
   Start and end poses are art-directed clear of the face, but a few travel
   paths cross her keep-out circle mid-flight (notably the two top panels on
   mobile, which descend the middle). planDetours() finds those crossings
   once per layout and bends each one into a smooth lateral parting.

   Crucially, a detour is a bump function of SCROLL PROGRESS (not of live
   position), with zero value and zero slope at both ends — so the pushed
   path is C1-smooth by construction. There is no positional feedback and
   therefore no singularity, no direction flip, and no jump, ever. */

export interface Detour {
  /** Scroll-progress range where the detour is active. */
  pa: number;
  pb: number;
  /** Normalized position of deepest penetration (extra-air peak). */
  tDeep: number;
  /** Table grid step in p units (table spans pa..pb inclusive). */
  step: number;
  /** Push magnitude in px per grid point (exact 0 at both ends). */
  table: number[];
  /** Committed unit axis direction (pure lateral or pure vertical). */
  dx: number;
  dy: number;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v: number) => {
  v = clamp01(v);
  return v * v * (3 - 2 * v);
};
const easeInOut = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);

/** Base (unpushed) path center in stage fractions, shared by plan + runtime. */
export function basePath(
  i: number,
  p: number,
  isMobile: boolean,
  anims: PanelAnim[]
): { x: number; y: number; ez: number; rot: number } {
  const def = PANELS[i];
  const a = anims[i];
  const s = isMobile ? def.mStart : def.start;
  const e = isMobile ? def.mEnd : def.end;
  const local = smooth((p - a.t0) / (a.t1 - a.t0));
  const ez = easeInOut(local);
  const dx = e.x - s.x;
  const dy = e.y - s.y;
  const len = Math.hypot(dx, dy) || 1;
  const bowOff = a.bow * Math.sin(Math.PI * ez);
  const swirlEnv = Math.sin(Math.PI * Math.min(p / 0.4, 1)) * (1 - ez);
  const swx = Math.cos(a.swirlPhase + p * 5) * a.swirl * swirlEnv;
  const swy = Math.sin(a.swirlPhase * 1.3 + p * 4) * a.swirl * swirlEnv;
  return {
    x: s.x + dx * ez + (-dy / len) * bowOff + swx,
    y: s.y + dy * ez + (dx / len) * bowOff + swy,
    ez,
    rot: s.r + (e.r - s.r) * ez + Math.sin(Math.PI * ez) * a.wob,
  };
}

export function faceYFrac(p: number, isMobile: boolean, H: number, charH: number): number {
  const e2 = easeInOut(smooth(p / 0.92));
  const rise = isMobile ? -0.135 * H * e2 : 0.018 * H * e2;
  return (H - charH + 0.254 * charH + rise - H / 2) / H;
}

export function planDetours(
  isMobile: boolean,
  W: number,
  H: number,
  baseWidths: number[],
  anims: PanelAnim[]
): Detour[][] {
  const charH = isMobile ? 0.6 * H : Math.min(0.86 * H, 940);
  const charW = charH * (768 / 1376);
  const faceW = charW * 0.24; // generous face rect (matches the verifier)
  const faceH = faceW * 1.5;
  const INFLATE = 24; // trigger band around the face rect (px)
  const MARGIN = 20; // extra air on top of the tracked penetration (px)
  const settleFactor = !isMobile ? (W >= 1280 ? 1 : W >= 1024 ? 0.88 : 0.74) : 1;

  return PANELS.map((def, i) => {
    const a = anims[i];
    const s = isMobile ? def.mStart : def.start;
    const e = isMobile ? def.mEnd : def.end;
    const endScale = isMobile ? e.s : e.s * settleFactor;
    const aspect = def.aspect === '3 / 2' ? 1.5 : 16 / 9;
    const cap = a.t1 - 0.006; // the push must be fully dead before settle

    // Base-path geometry at p: center offset from the face center (px) plus
    // the rotation-inflated half-extents (px).
    const geom = (p: number) => {
      const b = basePath(i, p, isMobile, anims);
      const sc = s.s + (endScale - s.s) * b.ez;
      const pw = baseWidths[i] * sc;
      const ph = pw / aspect;
      const rad = (Math.abs(b.rot) * Math.PI) / 180;
      return {
        cxPx: b.x * W,
        cyPx: (b.y - faceYFrac(p, isMobile, H, charH)) * H,
        hw: (pw * Math.abs(Math.cos(rad)) + ph * Math.abs(Math.sin(rad))) / 2,
        hh: (pw * Math.abs(Math.sin(rad)) + ph * Math.abs(Math.cos(rad))) / 2,
      };
    };
    const xPenAt = (g: { cxPx: number; hw: number }) =>
      faceW / 2 + INFLATE + g.hw - Math.abs(g.cxPx);
    const yPenAt = (g: { cyPx: number; hh: number }) =>
      faceH / 2 + INFLATE + g.hh - Math.abs(g.cyPx);

    interface Sample {
      p: number;
      xPx: number;
      yPx: number;
      xPen: number;
      yPen: number;
    }
    const engaged: Sample[] = [];
    const N = 400;
    for (let k = 0; k <= N; k++) {
      const p = k / N;
      if (p > a.t1 - 0.04) break; // never push a settled panel
      const g = geom(p);
      const xPen = xPenAt(g);
      const yPen = yPenAt(g);
      if (xPen > 0 && yPen > 0) {
        engaged.push({ p, xPx: g.cxPx, yPx: g.cyPx, xPen, yPen });
      }
    }
    if (engaged.length === 0) return [];

    // Group into contiguous ranges (merge tiny gaps).
    const ranges: Sample[][] = [];
    let cur: Sample[] = [engaged[0]];
    for (let k = 1; k < engaged.length; k++) {
      if (engaged[k].p - cur[cur.length - 1].p > 0.012) {
        ranges.push(cur);
        cur = [];
      }
      cur.push(engaged[k]);
    }
    ranges.push(cur);

    const out: Detour[] = [];
    for (const r of ranges) {
      let deep = r[0];
      for (const s2 of r) {
        if (Math.min(s2.xPen, s2.yPen) > Math.min(deep.xPen, deep.yPen)) deep = s2;
      }
      // Commit to the axis the panel travels LEAST along: pushing across the
      // travel routes around the face, pushing along it would ride through.
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      for (const s2 of r) {
        if (s2.xPx < minX) minX = s2.xPx;
        if (s2.xPx > maxX) maxX = s2.xPx;
        if (s2.yPx < minY) minY = s2.yPx;
        if (s2.yPx > maxY) maxY = s2.yPx;
      }
      const commitX =
        (maxX - minX) / (faceW / 2 + INFLATE) <= (maxY - minY) / (faceH / 2 + INFLATE);
      const off = commitX ? deep.xPx : deep.yPx;
      let sign = off !== 0 ? Math.sign(off) : 0;
      if (sign === 0) {
        sign = commitX ? (e.x !== 0 ? Math.sign(e.x) : Math.sign(s.x) || 1) : deep.yPx >= 0 ? 1 : -1;
      }
      // Runways ramp the push 0 -> full before joint entry and back to 0
      // after joint exit. Ramping is safe because outside the joint range the
      // other axis already clears the inflated box. The push always dies well
      // before the panel settles.
      const e0 = r[0].p;
      const e1 = r[r.length - 1].p;
      let pa = Math.max(0, e0 - 0.03);
      let pb = Math.min(e1 + 0.03, cap);
      if (!(pa < pb)) {
        pa = Math.max(0, cap - 0.012);
        pb = cap;
      }
      const span = pb - pa;
      const tDeep = Math.min(0.92, Math.max(0.08, (deep.p - pa) / span));
      // The up-ramp always gets a full 0.03 runway even when engagement
      // starts at p=0 (start poses clear the real rect, so the brief
      // under-coverage window stays inside the trigger band's air).
      const rc = Math.max(e0, pa + 0.03);
      const rd = Math.min(e1, pb - 0.03);
      const ss = (t: number) => {
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        return t * t * (3 - 2 * t);
      };
      const ramp = (p: number) => ss((p - pa) / (rc - pa)) * ss((pb - p) / (pb - rd));
      // Push profile: track the penetration sample-by-sample (a fixed-shape
      // bump under-covers flat-topped profiles on its flanks) gated by the
      // runway ramps, plus a smooth hump of extra air. A pure function of p:
      // no feedback, no flip.
      const n = Math.max(2, Math.ceil(span / 0.002));
      const step = span / n;
      const table: number[] = [];
      for (let k = 0; k <= n; k++) {
        const p = k === n ? pb : pa + step * k;
        const g = geom(p);
        const pen = Math.max(0, commitX ? xPenAt(g) : yPenAt(g));
        const t = k / n;
        const bump =
          t < tDeep
            ? 0.5 - 0.5 * Math.cos((Math.PI * t) / tDeep)
            : 0.5 + 0.5 * Math.cos((Math.PI * (t - tDeep)) / (1 - tDeep));
        table.push(pen * ramp(p) + MARGIN * bump);
      }
      table[0] = 0;
      table[n] = 0;
      out.push({ pa, pb, tDeep, step, table, dx: commitX ? sign : 0, dy: commitX ? 0 : sign });
    }
    return out;
  });
}

/** Detour offset in stage fractions (push-profile table lookup). */
export function detourAt(d: Detour, p: number, W: number, H: number): [number, number] {
  if (p <= d.pa || p >= d.pb || d.table.length < 2) return [0, 0];
  const f = (p - d.pa) / d.step;
  const i0 = Math.min(Math.floor(f), d.table.length - 2);
  const fr = Math.min(1, Math.max(0, f - i0));
  const v = d.table[i0] + (d.table[i0 + 1] - d.table[i0]) * fr;
  if (v === 0) return [0, 0];
  return [(d.dx * v) / W, (d.dy * v) / H];
}
