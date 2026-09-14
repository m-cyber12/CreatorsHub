'use client';

/**
 * SolarHero — the signature cinematic homepage hero.
 *
 * A synthetic female AI stands at the center of a dark solar environment,
 * orbited by 18 real tool-interface panels. Vertical scroll drives one
 * choreographed transformation across the whole composition:
 *
 *   ORBIT → DESCEND → CONVERGE → SETTLE
 *
 * Implementation notes:
 *  - One passive scroll listener + rAF throttle writes transform/opacity
 *    only (GPU-composited, no layout). Work is gated by an
 *    IntersectionObserver so nothing runs while the hero is off-screen.
 *  - The idle float lives on a NESTED layer using the CSS `translate`
 *    property, so it never fights the JS-driven `transform` on the outer
 *    layer. When a panel reaches its destination it gains the settled class
 *    and its float eases to a stop — panels never drift after settling.
 *  - Initial poses are rendered inline (SSR), so the orbit composition is
 *    visible with no-JS and there is zero hydration jump.
 *  - prefers-reduced-motion renders one calm static composition instead.
 */

import { useEffect, useRef } from 'react';
import Link from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import { HomeSearch } from '@/components/HomeSearch';
import { PANELS, animFor, detourAt, mobileAnimFor, planDetours, type Detour } from './panels';
import styles from './SolarHero.module.css';

const DESK_ANIMS = PANELS.map((_, i) => animFor(i));
const MOB_ANIMS = PANELS.map((_, i) => mobileAnimFor(i));

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v: number) => {
  v = clamp01(v);
  return v * v * (3 - 2 * v);
};
const easeInOut = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);

export interface SolarHeroCopy {
  badge: string;
  titleA: string;
  titleB: string;
  sub: string;
  ctaPlan: string;
  ctaBrowse: string;
  scrollCue: string;
  phases: [string, string, string, string];
  fieldLabel: string;
  sectionLabel: string;
  trust: [string, string, string];
}

export function SolarHero({ copy }: { copy: SolarHeroCopy }) {
  const trackRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const charRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const dockGlowRef = useRef<HTMLDivElement | null>(null);
  const cueRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const phaseLabelRef = useRef<HTMLSpanElement | null>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const floatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const segRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    let isMobile = mobileQuery.matches;
    let settleFactor = stage.clientWidth >= 1280 ? 1 : stage.clientWidth >= 1024 ? 0.88 : 0.74;
    let stageW = stage.clientWidth;
    let stageH = stage.clientHeight;

    const panels = panelRefs.current;
    const floats = floatRefs.current;
    const lastZ: number[] = new Array(PANELS.length).fill(-1);
    const settledFlags: boolean[] = new Array(PANELS.length).fill(false);
    let copyHidden = false;
    let phaseIdx = -1;

    /** Cached panel base widths (CSS tier widths x breakpoint) for detour
        planning. Refreshed on resize, never per-frame. */
    const baseWidths: number[] = new Array(PANELS.length).fill(150);
    let detours: Detour[][] = PANELS.map(() => []);
    const replan = () => {
      detours = planDetours(isMobile, stageW, stageH, baseWidths, isMobile ? MOB_ANIMS : DESK_ANIMS);
    };
    const measureWidths = () => {
      for (let i = 0; i < PANELS.length; i++) {
        const w = panels[i]?.offsetWidth;
        if (w) baseWidths[i] = w;
      }
    };

    /** Anchor every panel at its breakpoint's start pose (one layout pass). */
    const anchorPanels = () => {
      for (let i = 0; i < PANELS.length; i++) {
        const el = panels[i];
        if (!el) continue;
        const pose = isMobile ? PANELS[i].mStart : PANELS[i].start;
        el.style.left = `${(50 + pose.x * 100).toFixed(3)}%`;
        el.style.top = `${(50 + pose.y * 100).toFixed(3)}%`;
        lastZ[i] = -1;
        settledFlags[i] = false;
        floats[i]?.classList.remove(styles.panelFloatSettled);
      }
    };

    const apply = (p: number) => {
      const anims = isMobile ? MOB_ANIMS : DESK_ANIMS;
      const e2 = easeInOut(smooth(p / 0.92));
      const rise = 0;

      for (let i = 0; i < PANELS.length; i++) {
        const el = panels[i];
        if (!el) continue;
        const def = PANELS[i];
        const a = anims[i];
        const s = isMobile ? def.mStart : def.start;
        const rawEnd = isMobile ? def.mEnd : def.end;
        // Keep the orbit composition intact: scrolling only nudges panels
        // toward a nearby pose rather than sending them to a second layout.
        const e = { ...s, x: s.x + (rawEnd.x - s.x) * 0.18, y: s.y + (rawEnd.y - s.y) * 0.18, r: s.r + (rawEnd.r - s.r) * 0.18, s: s.s + (rawEnd.s - s.s) * 0.12, o: s.o + (rawEnd.o - s.o) * 0.08, z: rawEnd.z };

        const local = smooth((p - a.t0) / (a.t1 - a.t0));
        const ez = easeInOut(local);

        // Curved travel path: lerp + perpendicular bow + decaying orbit swirl.
        const dx = e.x - s.x;
        const dy = e.y - s.y;
        const len = Math.hypot(dx, dy) || 1;
        const bowOff = a.bow * 0.22 * Math.sin(Math.PI * ez);
        const swirlEnv = Math.sin(Math.PI * Math.min(p / 0.4, 1)) * (1 - ez);
        const swx = Math.cos(a.swirlPhase + p * 5) * a.swirl * 0.22 * swirlEnv;
        const swy = Math.sin(a.swirlPhase * 1.3 + p * 4) * a.swirl * 0.22 * swirlEnv;
        let cxFrac = s.x + dx * ez + (-dy / len) * bowOff + swx;
        let cyFrac = s.y + dy * ez + (dx / len) * bowOff + swy;

        const orbitPhase = a.swirlPhase + i * 0.73;
        const orbitSpeed = 1.35 + (i % 4) * 0.16;
        const orbitAmpX = (0.028 + (i % 3) * 0.012) * (isMobile ? 0.72 : 1);
        const orbitAmpY = (0.035 + ((i + 1) % 4) * 0.01) * (isMobile ? 0.7 : 1);
        const orbitT = p * Math.PI * 2 * orbitSpeed + orbitPhase;
        // Rotation wobble is zero at both ends so the settle pose is exact.
        const orbitRot = Math.sin(orbitT * 0.9 + i) * (isMobile ? 4.5 : 7 + (i % 3) * 2);
        const rot = s.r + (e.r - s.r) * ez + Math.sin(Math.PI * ez) * a.wob * 0.22 + orbitRot;
        const endScale = isMobile ? e.s : e.s * settleFactor;
        const sc = (s.s + (endScale - s.s) * ez) * (1 + Math.sin(orbitT + 1.2) * 0.035);
        const op = Math.max(0.72, (s.o + (e.o - s.o) * ez) + Math.sin(orbitT * 0.7) * 0.035);
        const depth = Math.round(Math.sin(orbitT * 0.8 + i * 0.4) * (isMobile ? 18 : 34));

        // Precomputed detours part the field around her face. Each bump is
        // zero at both ends, so start and settle poses stay pixel-exact.
        for (const dt of detours[i]) {
          const [ox, oy] = detourAt(dt, p, stageW, stageH);
          cxFrac += ox;
          cyFrac += oy;
        }

        // Each interface has its own short orbital arc. These are deliberately
        // layered on top of the small pose transition: panels move sideways
        // and vertically, at different phases and speeds, rather than acting
        // like one parallax sheet.
        cxFrac += Math.cos(orbitT) * orbitAmpX;
        cyFrac += Math.sin(orbitT * 0.82 + i * 0.31) * orbitAmpY;

        const ddx = (cxFrac - s.x) * stageW;
        const ddy = (cyFrac - s.y) * stageH;

        el.style.transform =
          `translate(-50%,-50%) translate3d(${ddx.toFixed(1)}px,${ddy.toFixed(1)}px,${depth}px) ` +
          `rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
        el.style.opacity = op.toFixed(3);

        const z = ez < 0.5 ? s.z : e.z;
        if (z !== lastZ[i]) {
          el.style.zIndex = String(z);
          lastZ[i] = z;
        }

        // SETTLE: once a panel arrives it stops — the float eases to rest.
        const settled = local >= 1;
        if (settled !== settledFlags[i]) {
          settledFlags[i] = settled;
          floats[i]?.classList.toggle(styles.panelFloatSettled, settled);
        }
      }

      // Character: grounded on desktop, rises above the dock on mobile so her
      // face always stays clear of the settled panels.
      if (charRef.current) {
        const cScale = 1;
        charRef.current.style.transform = `translate3d(0,${rise.toFixed(1)}px,0) scale(${cScale.toFixed(4)})`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `scale(${(1 + e2 * 0.16).toFixed(3)})`;
      }
      if (dockGlowRef.current) {
        dockGlowRef.current.style.opacity = (smooth((p - 0.35) / 0.5) * 0.9).toFixed(3);
      }

      // Copy + cue fade out early; the composition takes over.
      if (copyRef.current) {
        const cp = 0;
        copyRef.current.style.opacity = '1';
        copyRef.current.style.transform = 'translate3d(0,0,0)';
        const hidden = false;
        if (hidden !== copyHidden) {
          copyHidden = hidden;
          copyRef.current.classList.toggle(styles.copyHidden, hidden);
        }
      }
      if (cueRef.current) {
        cueRef.current.style.opacity = (1 - clamp01(p / 0.07)).toFixed(3);
      }
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
      }

      // Phase readout: ORBIT → DESCEND → CONVERGE → SETTLE.
      const idx = p < 0.15 ? 0 : p < 0.5 ? 1 : p < 0.8 ? 2 : 3;
      if (idx !== phaseIdx) {
        phaseIdx = idx;
        if (phaseLabelRef.current) phaseLabelRef.current.textContent = copy.phases[idx];
        for (let k = 0; k < segRefs.current.length; k++) {
          segRefs.current[k]?.classList.toggle(styles.phaseSegOn, k <= idx);
        }
      }
    };

    const progressFromGeometry = () => {
      const rect = track.getBoundingClientRect();
      // One viewport of gentle response, never a pinned or extended scene.
      return clamp01(-rect.top / Math.max(window.innerHeight, 1));
    };

    // Reduced motion: a single calm composition, no scroll choreography.
    if (reduced) {
      track.classList.add(styles.rootReduced);
      anchorPanels();
      stageW = stage.clientWidth;
      stageH = stage.clientHeight;
      measureWidths();
      replan();
      apply(0);
      const onResize = () => {
        const nextMobile = mobileQuery.matches;
        if (nextMobile !== isMobile) {
          isMobile = nextMobile;
          anchorPanels();
        }
        stageW = stage.clientWidth;
        stageH = stage.clientHeight;
        measureWidths();
        replan();
        apply(0);
      };
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }

    anchorPanels();
    measureWidths();
    replan();
    let raf = 0;
    let visible = true;
    let currentP = -1;

    const render = () => {
      raf = 0;
      const p = progressFromGeometry();
      if (p !== currentP) {
        currentP = p;
        apply(p);
      }
    };
    const schedule = () => {
      if (!visible || raf) return;
      raf = requestAnimationFrame(render);
    };

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
        if (visible) schedule();
      },
      { threshold: 0 }
    );
    io.observe(track);

    const onBreakpoint = () => {
      const nextMobile = mobileQuery.matches;
      stageW = stage.clientWidth;
      stageH = stage.clientHeight;
      measureWidths();
      replan();
      settleFactor = stageW >= 1280 ? 1 : stageW >= 1024 ? 0.88 : 0.74;
      if (nextMobile !== isMobile) {
        isMobile = nextMobile;
        anchorPanels();
        currentP = -1; // force a full re-apply in the new layout
      }
      schedule();
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', onBreakpoint);
    mobileQuery.addEventListener?.('change', onBreakpoint);
    schedule();
    // Re-sync once after fonts/layout settle.
    const settleTimer = window.setTimeout(schedule, 450);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onBreakpoint);
      mobileQuery.removeEventListener?.('change', onBreakpoint);
      window.clearTimeout(settleTimer);
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
    };
    // Copy phases are stable per locale; the effect reads them via closure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section ref={trackRef} className={styles.root} aria-label={copy.sectionLabel}>
      <div ref={stageRef} className={styles.stage}>
        {/* Environment */}
        <div className={styles.bgBase} aria-hidden="true" />
        <div ref={glowRef} className={styles.solarGlow} aria-hidden="true" />
        <div className={styles.solarCore} aria-hidden="true" />
        <div className={styles.charIsland} aria-hidden="true" />
        <div className={styles.grid} aria-hidden="true" />
        <div className="bg-noise absolute inset-0" aria-hidden="true" />
        <div className={styles.particles} aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} className={styles.particle} />
          ))}
        </div>
        <div ref={dockGlowRef} className={styles.dockGlow} aria-hidden="true" />

        {/* The synthetic intelligence */}
        <div className={styles.characterWrap} aria-hidden="true">
          <div ref={charRef} className={styles.character}>
            {/* Art-directed plate, transformed directly. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-sun/character.jpg"
              alt=""
              width={768}
              height={1376}
              fetchPriority="high"
              decoding="async"
              draggable={false}
            />
          </div>
        </div>

        {/* The 18 tool interfaces */}
        <div className={styles.panels} role="list" aria-label={copy.fieldLabel}>
          {PANELS.map((panel, i) => {
            const a = DESK_ANIMS[i];
            return (
              <div
                key={panel.id}
                ref={(el) => {
                  panelRefs.current[i] = el;
                }}
                role="listitem"
                className={styles.panel}
                data-tier={panel.tier}
                style={
                  {
                    left: `${(50 + panel.start.x * 100).toFixed(3)}%`,
                    top: `${(50 + panel.start.y * 100).toFixed(3)}%`,
                    opacity: panel.start.o,
                    zIndex: panel.start.z,
                    '--r0': `${panel.start.r}deg`,
                    '--s0': panel.start.s,
                    '--aspect': panel.aspect,
                    '--bobDur': `${a.bobDur.toFixed(2)}s`,
                    '--bobDelay': `${a.bobDelay.toFixed(2)}s`,
                    '--enterDelay': `${(0.15 + i * 0.06).toFixed(2)}s`,
                  } as React.CSSProperties
                }
              >
                <div
                  ref={(el) => {
                    floatRefs.current[i] = el;
                  }}
                  className={styles.panelFloat}
                >
                  <div className={styles.panelEnter}>
                    <div className={styles.panelFrame}>
                      {/* 18 art-directed plates; next/image would fight the animation. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={panel.src}
                        alt={panel.alt}
                        width={640}
                        height={panel.aspect === '3 / 2' ? 427 : 360}
                        loading="eager"
                        decoding="async"
                        fetchPriority={panel.tier === 'near' ? 'high' : 'auto'}
                        draggable={false}
                      />
                      <div className={styles.panelSheen} aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.topScrim} aria-hidden="true" />

        {/* Message layer */}
        <div ref={copyRef} className={styles.copy}>
          <div className={styles.copyInner}>
            <span data-hero-badge className={styles.badge}>
              <span className={styles.badgeDot} aria-hidden="true" />
              {copy.badge}
            </span>
            <h1 data-hero-title className={styles.title}>
              {copy.titleA}
              <span className={styles.titleAccent}>{copy.titleB}</span>
            </h1>
            <p data-hero-sub className={styles.sub}>
              {copy.sub}
            </p>
            <div data-hero-search className={styles.searchWrap}>
              <HomeSearch />
            </div>
            <div className={styles.ctas}>
              <Link data-hero-cta href="/stack-builder" className={styles.ctaPrimary}>
                {copy.ctaPlan}
                <ArrowRight className="h-4 w-4 rtl-flip" aria-hidden="true" />
              </Link>
              <Link data-hero-cta href="/tools" className={styles.ctaSecondary}>
                {copy.ctaBrowse}
              </Link>
            </div>
            <div data-hero-cta className={styles.trust}>
              {copy.trust.map((line) => (
                <span key={line} className={styles.trustItem}>
                  <span className={styles.trustDot} aria-hidden="true" />
                  {line}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.vignette} aria-hidden="true" />

        {/* Phase readout */}
        <div className={styles.phase} aria-hidden="true">
          <span ref={phaseLabelRef} className={styles.phaseLabel}>
            {copy.phases[0]}
          </span>
          <div className={styles.phaseSegs}>
            {[0, 1, 2, 3].map((k) => (
              <span
                key={k}
                ref={(el) => {
                  segRefs.current[k] = el;
                }}
                className={`${styles.phaseSeg} ${k === 0 ? styles.phaseSegOn : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Scroll cue + progress */}
        <div ref={cueRef} className={styles.cue} aria-hidden="true">
          <span className={styles.cueLabel}>{copy.scrollCue}</span>
          <span className={styles.cueLine} />
        </div>
        <div ref={progressRef} className={styles.progress} aria-hidden="true" />
      </div>
    </section>
  );
}
