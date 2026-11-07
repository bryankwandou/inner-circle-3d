import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ArrowUpRight,
  Cpu,
  Layers,
  Zap,
  CheckCircle2,
  X,
  Play,
  Sparkles,
} from 'lucide-react';
import { Header } from './components/Header';
import { ScrollExitSplitText } from './components/ScrollExitSplitText';
import { FloatingIslandCanvas } from './components/FloatingIslandCanvas';

interface PipelineStage {
  index: string;
  title: string;
  tag: string;
  latency: string;
  description: string;
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    index: '01',
    title: 'INGESTION & BRIEFING',
    tag: 'AUTO-PARSED SPECS',
    latency: '12ms SYNC',
    description:
      'Converts raw client decks, Figma tokens, and reference boards into structured 3D scene graphs and task queues automatically.',
  },
  {
    index: '02',
    title: 'GENERATIVE 3D STAGING',
    tag: 'PROCEDURAL MESH + SHADER',
    latency: '60FPS REALTIME',
    description:
      'Spins up physically-based lighting rigs, procedural geometry variations, and brand-compliant camera rails in parallel.',
  },
  {
    index: '03',
    title: 'REALTIME FRAME REVIEW',
    tag: 'FRAME-ACCURATE DIFFS',
    latency: 'ZERO-LATENCY',
    description:
      'Stakeholders annotate directly on live WebGL viewports with instant version branching and automated approval gates.',
  },
  {
    index: '04',
    title: 'ONE-CLICK EDGE DELIVERY',
    tag: 'GLOBAL CDN DEPLOY',
    latency: '99.99% SLA',
    description:
      'Compiles optimized GLTF assets, responsive shaders, and production bundles straight to global edge nodes in one commit.',
  },
];

const DRUM_ITEMS = [
  'BRIEF PARSING',
  'SHADER GRAPH',
  'ASSET DIFFING',
  'EDGE DEPLOY',
  'CAMERA RAILS',
  'LIGHT BAKING',
  'TOKEN SYNC',
  'QA TELEMETRY',
];

export function App() {
  // Raw scrollProgress lives in a ref updated by the gesture controller ([0 .. 3.5]),
  // while an rAF loop lerps it at factor 0.08 into lerpedScrollProgress state that drives rendering.
  const targetScrollRef = useRef(0);
  const currentScrollRef = useRef(0);
  const [lerpedScrollProgress, setLerpedScrollProgress] = useState(0);

  const [revealMode, setRevealMode] = useState<'hybrid' | 'spotlight' | 'wipe'>(
    'hybrid'
  );
  const [hoveredPipelineIdx, setHoveredPipelineIdx] = useState<number>(0);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [workflowTriggered, setWorkflowTriggered] = useState(false);
  const [projectNameInput, setProjectNameInput] = useState('');

  // Custom Wheel / Touch / Keyboard Gesture Controller (clamped to [0, 3.5], lerped at 0.08)
  useEffect(() => {
    let touchStartY = 0;

    const handleWheel = (e: WheelEvent) => {
      if (isTriggerModalOpen) return;
      e.preventDefault();
      const delta = e.deltaY * 0.0014;
      targetScrollRef.current = Math.max(
        0,
        Math.min(3.5, targetScrollRef.current + delta)
      );
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isTriggerModalOpen || e.touches.length === 0) return;
      const dy = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;
      targetScrollRef.current = Math.max(
        0,
        Math.min(3.5, targetScrollRef.current + dy * 0.0042)
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTriggerModalOpen) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        targetScrollRef.current = Math.min(3.5, targetScrollRef.current + 0.35);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        targetScrollRef.current = Math.max(0, targetScrollRef.current - 0.35);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    let rafId = 0;
    const updateLoop = () => {
      rafId = requestAnimationFrame(updateLoop);
      const diff = targetScrollRef.current - currentScrollRef.current;
      if (Math.abs(diff) > 0.0002) {
        currentScrollRef.current += diff * 0.08;
        setLerpedScrollProgress(currentScrollRef.current);
      }
    };
    updateLoop();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTriggerModalOpen]);

  const jumpToProgress = useCallback((target: number) => {
    targetScrollRef.current = Math.max(0, Math.min(3.5, target));
  }, []);

  const toggleRevealMode = useCallback(() => {
    setRevealMode((prev) =>
      prev === 'hybrid' ? 'spotlight' : prev === 'spotlight' ? 'wipe' : 'hybrid'
    );
  }, []);

  // Stage progress calculations derived from single lerpedScrollProgress [0 .. 3.5]
  const p = lerpedScrollProgress;

  // Stage 0: Hero (0 -> 1.0)
  const heroTitleExitProgress = Math.max(0, Math.min(1, (p - 0.18) * 1.45));

  // Stage 1: Manifesto (1.0 -> 1.8, matching mythos_20.jpg)
  const s1Enter = Math.max(0, Math.min(1, (p - 0.65) * 1.8));
  const s1Exit = Math.max(0, Math.min(1, (p - 1.65) * 2.0));
  const s1Opacity = s1Enter * (1 - s1Exit);
  const s1TranslateY = (1 - s1Enter) * 80 - s1Exit * 80;

  // Stage 2: 3D Cylindrical Drum & Pipeline Rows (1.8 -> 2.6)
  const s2Enter = Math.max(0, Math.min(1, (p - 1.55) * 1.8));
  const s2Exit = Math.max(0, Math.min(1, (p - 2.55) * 2.0));
  const s2Opacity = s2Enter * (1 - s2Exit);
  const s2TranslateY = (1 - s2Enter) * 80 - s2Exit * 80;

  // Stage 3 & 4: Kinetic Marquee & Studio Contact Footer (2.6 -> 3.5)
  const s3Enter = Math.max(0, Math.min(1, (p - 2.45) * 1.6));
  const s3Opacity = s3Enter;
  const s3TranslateY = (1 - s3Enter) * 70;

  return (
    <main className="relative w-screen h-screen bg-black text-white overflow-hidden select-none">
      {/* =========================================================
          FIXED HEADER (Matches mythos_19.jpg, mythos_20.jpg, mythos_22.jpg)
      ========================================================= */}
      <Header
        onJumpTo={jumpToProgress}
        currentProgress={p}
        revealMode={revealMode}
        onToggleRevealMode={toggleRevealMode}
        onOpenTriggerModal={() => {
          setWorkflowTriggered(false);
          setIsTriggerModalOpen(true);
        }}
      />

      {/* =========================================================
          STAGE 0: 3D FLOATING CRAGGY ROCK MONOLITH ISLAND + BOTTOM "INNER CIRCLE"
      ========================================================= */}
      <FloatingIslandCanvas scrollProgress={p} revealMode={revealMode} />

      {/* Bottom-Anchored Giant Full-Width "INNER CIRCLE" Headline (Matches mythos_19.jpg & mythos_22.jpg) */}
      <div
        className="fixed bottom-2 sm:bottom-4 left-0 right-0 z-20 px-3 sm:px-6 pointer-events-none flex flex-col items-center"
        style={{
          visibility: heroTitleExitProgress >= 0.99 ? 'hidden' : 'visible',
        }}
      >
        <ScrollExitSplitText
          text="INNER CIRCLE"
          progress={heroTitleExitProgress}
          className="font-michroma text-[7.6vw] sm:text-[7.9vw] tracking-[0.04em] uppercase leading-none text-white text-center w-full"
        />
      </div>

      {/* =========================================================
          STAGE 1: MANIFESTO — "01 — WHY WE EXIST" / "THE BUSYWORK ENDS HERE." (Exact match to mythos_20.jpg)
      ========================================================= */}
      <section
        aria-label="01 Why We Exist"
        className={`fixed inset-0 z-30 px-6 sm:px-10 pt-28 pb-10 flex flex-col justify-between ${
          s1Opacity > 0.35 ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        style={{
          opacity: s1Opacity,
          transform: `translate3d(0, ${s1TranslateY}px, 0)`,
          visibility: s1Opacity <= 0.01 ? 'hidden' : 'visible',
        }}
      >
        {/* Left Kicker: 01 — WHY WE EXIST */}
        <div className="mt-12 sm:mt-16">
          <span className="font-manrope text-[11px] tracking-[0.26em] text-white/55 uppercase font-medium">
            01 — WHY WE EXIST
          </span>
        </div>

        {/* Center-Right Headline in Michroma: THE BUSYWORK / ENDS HERE. */}
        <div className="w-full flex justify-end my-auto">
          <h2 className="font-michroma text-3xl sm:text-5xl md:text-[58px] lg:text-[64px] tracking-[0.04em] uppercase leading-[1.22] text-right text-white">
            <span className="block">THE BUSYWORK</span>
            <span className="block">
              <span className="text-[#00D85F]">ENDS</span> HERE.
            </span>
          </h2>
        </div>

        {/* Bottom-Left Manifesto Paragraph + Quick Stage Advance */}
        <div className="w-full flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <p className="font-manrope text-sm sm:text-[15px] text-white/75 max-w-[440px] leading-[1.65] font-normal">
            Inner Circle wires your entire creative pipeline — briefs, assets,
            reviews, delivery — into one automated loop, so your team spends its
            hours on the work only humans can do.
          </p>

          <button
            onClick={() => jumpToProgress(2.15)}
            className="self-start sm:self-end inline-flex items-center gap-2 border border-white/25 hover:border-[#00D85F] hover:bg-[#00D85F] hover:text-black rounded-full px-5 py-2.5 text-[11px] tracking-[0.16em] font-manrope uppercase transition cursor-pointer"
          >
            <span>INSPECT PIPELINE</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* =========================================================
          STAGE 2: 3D CYLINDRICAL WORKFLOW DRUM & 4 INTERACTIVE PIPELINE ROWS
      ========================================================= */}
      <section
        aria-label="02 Automated Pipeline Architecture"
        className={`fixed inset-0 z-30 px-6 sm:px-10 pt-24 pb-12 flex flex-col justify-between ${
          s2Opacity > 0.35 ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        style={{
          opacity: s2Opacity,
          transform: `translate3d(0, ${s2TranslateY}px, 0)`,
          visibility: s2Opacity <= 0.01 ? 'hidden' : 'visible',
        }}
      >
        <div className="flex items-center justify-between">
          <span className="font-manrope text-[11px] tracking-[0.26em] text-white/55 uppercase font-medium">
            02 — AUTOMATED PIPELINE ARCHITECTURE
          </span>
          <span className="font-manrope text-[11px] tracking-[0.2em] text-[#00D85F] uppercase font-semibold">
            LOOP LATENCY: 12MS
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
          {/* Left 5 Cols: 3D Cylindrical Rotating Drum */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div
              className="relative w-full h-[270px] sm:h-[320px] flex items-center justify-center overflow-hidden"
              style={{ perspective: '1100px' }}
            >
              <div
                className="relative w-[290px] sm:w-[340px] h-[64px]"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateX(${
                    (p - 1.8) * 165 + hoveredPipelineIdx * 45
                  }deg)`,
                  transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {DRUM_ITEMS.map((label, idx) => {
                  const angle = idx * (360 / DRUM_ITEMS.length);
                  const isHighlighted = idx % 4 === hoveredPipelineIdx;
                  return (
                    <div
                      key={label}
                      className={`absolute inset-0 flex items-center justify-between px-5 rounded-xl border backdrop-blur-md ${
                        isHighlighted
                          ? 'bg-[#00D85F] text-black border-[#00D85F] font-bold'
                          : 'bg-neutral-950/90 text-white/80 border-white/20'
                      }`}
                      style={{
                        transform: `rotateX(${angle}deg) translateZ(132px)`,
                        backfaceVisibility: 'hidden',
                      }}
                    >
                      <span className="font-michroma text-xs sm:text-sm tracking-wider">
                        {label}
                      </span>
                      <span className="font-manrope text-[10px] tracking-[0.18em] uppercase">
                        0{idx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 7 Cols: 4 Interactive Pipeline Rows that highlight in #00D85F on hover */}
          <div className="lg:col-span-7 divide-y divide-white/15 border-y border-white/15">
            {PIPELINE_STAGES.map((stage, idx) => {
              const isHovered = hoveredPipelineIdx === idx;
              return (
                <div
                  key={stage.index}
                  onMouseEnter={() => setHoveredPipelineIdx(idx)}
                  onClick={() => setHoveredPipelineIdx(idx)}
                  className={`py-4 sm:py-5 px-4 transition-all duration-300 cursor-pointer ${
                    isHovered
                      ? 'bg-[#00D85F] text-black'
                      : 'bg-transparent text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-4">
                      <span
                        className={`font-manrope text-xs tracking-[0.2em] font-bold ${
                          isHovered ? 'text-black' : 'text-[#00D85F]'
                        }`}
                      >
                        {stage.index} /
                      </span>
                      <span className="font-michroma text-sm sm:text-lg tracking-wider uppercase">
                        {stage.title}
                      </span>
                    </div>
                    <span
                      className={`font-manrope text-[10px] tracking-[0.18em] uppercase px-2.5 py-1 rounded-full border ${
                        isHovered
                          ? 'border-black/30 bg-black/10 text-black font-bold'
                          : 'border-white/20 text-white/65'
                      }`}
                    >
                      {stage.latency}
                    </span>
                  </div>
                  <p
                    className={`font-manrope text-xs mt-2 max-w-2xl leading-relaxed ${
                      isHovered ? 'text-black/85 font-medium' : 'text-white/60'
                    }`}
                  >
                    {stage.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-white/50 font-manrope">
          <span>HOVER OR CLICK ANY STAGE TO ROTATE THE 3D WORKFLOW DRUM</span>
          <button
            onClick={() => jumpToProgress(3.3)}
            className="text-[#00D85F] hover:underline uppercase tracking-[0.18em] font-semibold cursor-pointer"
          >
            CONTINUE TO STUDIO FOOTER
          </button>
        </div>
      </section>

      {/* =========================================================
          STAGE 3 & 4: TRIPLE-ROW KINETIC MARQUEE + STUDIO CONTACT FOOTER
      ========================================================= */}
      <section
        aria-label="03 Studio Marquee and Contact"
        className={`fixed inset-0 z-30 pt-24 pb-8 flex flex-col justify-between ${
          s3Opacity > 0.35 ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        style={{
          opacity: s3Opacity,
          transform: `translate3d(0, ${s3TranslateY}px, 0)`,
          visibility: s3Opacity <= 0.01 ? 'hidden' : 'visible',
        }}
      >
        {/* Triple-Row Kinetic Marquee with Solid #00D85F Center Row */}
        <div className="w-full space-y-2 overflow-hidden mt-2">
          {/* Row 1: Outlined White/Green */}
          <div
            className="whitespace-nowrap font-michroma text-xl sm:text-3xl uppercase tracking-[0.08em] text-white/80 py-1.5"
            style={{
              transform: `translateX(${-(p - 2.4) * 240}px)`,
            }}
          >
            AUTOMATED BRIEFING • ZERO BUSYWORK • REALTIME 3D STAGING • INSTANT
            ASSET APPROVAL • AUTOMATED BRIEFING • ZERO BUSYWORK •
          </div>

          {/* Row 2: Solid #00D85F Center Row */}
          <div className="w-full bg-[#00D85F] text-black py-2.5 overflow-hidden">
            <div
              className="whitespace-nowrap font-michroma text-xl sm:text-3xl uppercase tracking-[0.08em] font-bold"
              style={{
                transform: `translateX(${(p - 2.4) * 260 - 320}px)`,
              }}
            >
              INNER CIRCLE PIPELINE • 60FPS WEBGL ENGINE • CREATIVE AUTOMATION •
              INNER CIRCLE PIPELINE • 60FPS WEBGL ENGINE •
            </div>
          </div>

          {/* Row 3: Subtle Technical Telemetry */}
          <div
            className="whitespace-nowrap font-michroma text-xl sm:text-3xl uppercase tracking-[0.08em] text-white/40 py-1.5"
            style={{
              transform: `translateX(${-(p - 2.4) * 190}px)`,
            }}
          >
            INGESTION TO DELIVERY • ONE UNIFIED LOOP • BUILT FOR CREATIVE TEAMS
            • INGESTION TO DELIVERY • ONE UNIFIED LOOP •
          </div>
        </div>

        {/* Center Studio CTA & Email Link */}
        <div className="px-6 sm:px-10 my-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div>
            <span className="font-manrope text-[11px] tracking-[0.26em] text-[#00D85F] uppercase font-semibold block mb-3">
              03 — START YOUR AUTOMATION LOOP
            </span>
            <h2 className="font-michroma text-2xl sm:text-4xl md:text-5xl uppercase tracking-wider leading-tight">
              READY TO END <br />
              THE <span className="text-[#00D85F]">BUSYWORK?</span>
            </h2>
            <a
              href="mailto:studio@innercircle.automation"
              className="inline-block mt-4 font-manrope text-sm sm:text-base tracking-[0.14em] text-white/80 hover:text-[#00D85F] transition underline underline-offset-8"
            >
              STUDIO@INNERCIRCLE.AUTOMATION
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setWorkflowTriggered(false);
                setIsTriggerModalOpen(true);
              }}
              className="bg-[#00D85F] hover:bg-[#00f06a] text-black font-manrope font-bold text-xs tracking-[0.18em] uppercase px-7 py-4 rounded-full transition transform hover:scale-105 cursor-pointer flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>DEPLOY WORKFLOW LOOP</span>
            </button>

            <button
              onClick={() => jumpToProgress(0)}
              className="border border-white/25 hover:border-white text-white font-manrope text-xs tracking-[0.16em] uppercase px-6 py-4 rounded-full transition cursor-pointer"
            >
              BACK TO MONOLITH
            </button>
          </div>
        </div>

        {/* Bottom Giant Outlined "INNER CIRCLE" Footer Signature (Exact spec from mythos_19.jpg) */}
        <div className="px-4 sm:px-8">
          <div className="font-michroma text-[7.4vw] uppercase leading-none text-center tracking-[0.04em] select-none">
            <span className="text-white">INNER </span>
            <span className="outline-title-green">CIRCLE</span>
          </div>
        </div>
      </section>

      {/* =========================================================
          FIXED BOTTOM PROGRESS SCRUBBER PILL (Allows instant 1-click stage jump + shows scrollProgress)
      ========================================================= */}
      <div className="fixed bottom-3 right-6 z-40 hidden sm:flex items-center gap-2 bg-neutral-950/85 border border-white/15 rounded-full px-3.5 py-1.5 backdrop-blur-md">
        {[
          { label: '00 HERO', val: 0 },
          { label: '01 MANIFESTO', val: 1.25 },
          { label: '02 PIPELINE', val: 2.15 },
          { label: '03 STUDIO', val: 3.3 },
        ].map((step) => {
          const active = Math.abs(p - step.val) < 0.45;
          return (
            <button
              key={step.label}
              onClick={() => jumpToProgress(step.val)}
              className={`text-[9px] font-manrope tracking-[0.16em] px-2.5 py-1 rounded-full transition cursor-pointer ${
                active
                  ? 'bg-[#00D85F] text-black font-bold'
                  : 'text-white/55 hover:text-white'
              }`}
            >
              {step.label}
            </button>
          );
        })}
      </div>

      {/* =========================================================
          INTERACTIVE WORKFLOW TRIGGER MODAL
      ========================================================= */}
      {isTriggerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#0B0D0C] border border-white/20 p-6 sm:p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-5 h-5 text-[#00D85F]" />
                <span className="font-michroma text-xs sm:text-sm uppercase tracking-wider">
                  INNER CIRCLE — PIPELINE INITIALIZER
                </span>
              </div>
              <button
                onClick={() => setIsTriggerModalOpen(false)}
                aria-label="Close Modal"
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {workflowTriggered ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#00D85F]/20 border border-[#00D85F] text-[#00D85F] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="font-michroma text-base uppercase tracking-wider text-[#00D85F]">
                  AUTOMATION LOOP ONLINE
                </div>
                <p className="font-manrope text-xs text-white/70 max-w-sm mx-auto leading-relaxed">
                  Workspace{' '}
                  <span className="text-white font-semibold">
                    {projectNameInput || 'CREATIVE-CORE-01'}
                  </span>{' '}
                  is now wired for automated brief ingestion, 3D staging, and
                  single-click edge delivery.
                </p>
                <button
                  onClick={() => setIsTriggerModalOpen(false)}
                  className="bg-[#00D85F] text-black font-manrope font-bold text-xs tracking-[0.18em] uppercase px-6 py-3 rounded-full cursor-pointer"
                >
                  RETURN TO STAGE
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setWorkflowTriggered(true);
                }}
                className="mt-5 space-y-4"
              >
                <p className="font-manrope text-xs text-white/70 leading-relaxed">
                  Configure your creative team&apos;s automated pipeline loop.
                  All four stages synchronize in real time.
                </p>
                <div>
                  <label className="block font-manrope text-[10px] tracking-[0.18em] uppercase text-white/60 mb-2">
                    CREATIVE WORKSPACE IDENTIFIER
                  </label>
                  <input
                    type="text"
                    required
                    value={projectNameInput}
                    onChange={(e) => setProjectNameInput(e.target.value)}
                    placeholder="E.G. MYTHOS-CAMPAIGN-3D"
                    className="w-full rounded-xl bg-black border border-white/25 px-4 py-3 text-xs font-manrope text-white focus:outline-none focus:border-[#00D85F]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#00D85F] hover:bg-[#00f06a] text-black font-manrope font-bold text-xs tracking-[0.18em] uppercase py-3.5 rounded-full transition cursor-pointer"
                >
                  INITIALIZE AUTOMATED LOOP
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
