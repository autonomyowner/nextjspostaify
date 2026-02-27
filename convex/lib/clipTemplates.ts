// ============================================================
// CLIP TEMPLATE ENGINE
// Generates cinematic motion-graphic HTML clips
// 8 scene types + montage, pro easing curves, particles, glow orbs
// Two themes: classic (default) and cinematic (intro-clip quality)
// ============================================================

export type ClipTheme = "classic" | "cinematic";

export interface ClipColors {
  primary: string;
  secondary: string;
  accent: string;
  background?: string;
}

export interface SceneData {
  type:
    | "hook"
    | "brand"
    | "features"
    | "demo"
    | "transformation"
    | "stats"
    | "comparison"
    | "cta"
    | "montage"
    | "narrative"
    | "quote"
    | "chapter"
    | "reveal"
    | "tip"
    | "listicle";
  // Common
  headline?: string;
  subheadline?: string;
  // Brand
  brandName?: string;
  tagline?: string;
  // Features
  features?: string[];
  // Demo
  demoTitle?: string;
  demoSteps?: string[];
  // Transformation
  before?: string;
  after?: string;
  beforeLabel?: string;
  afterLabel?: string;
  // Stats
  stats?: Array<{ value: string; label: string }>;
  // Comparison
  problems?: string[];
  solutions?: string[];
  // CTA
  ctaText?: string;
  url?: string;
  // Montage (cinematic only)
  montageItems?: string[];
  // Narrative
  text?: string;
  mood?: string;
  // Quote
  quote?: string;
  author?: string;
  source?: string;
  // Chapter
  chapterNumber?: number;
  chapterTitle?: string;
  // Reveal
  revealText?: string;
  subtext?: string;
  // Tip
  tipNumber?: number;
  tipTitle?: string;
  tipBody?: string;
  // Listicle
  items?: string[];
}

export interface ClipConfig {
  title: string;
  scenes: SceneData[];
  colors: ClipColors;
  brandName?: string;
  theme?: ClipTheme;
}

// ============================================================
// LIGHT BACKGROUND DETECTION
// ============================================================

function isLightBackground(colors: ClipColors): boolean {
  const hex = colors.background;
  if (!hex) return false;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toL = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toL(r) + 0.7152 * toL(g) + 0.0722 * toL(b) > 0.5;
}

// ============================================================
// CORE CSS: Easing, animations, backgrounds
// ============================================================

function getCoreCSS(colors: ClipColors, theme: ClipTheme): string {
  const isLight = isLightBackground(colors);
  const bg = colors.background || "#000";
  let css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

    :root {
      --primary: ${colors.primary};
      --secondary: ${colors.secondary};
      --accent: ${colors.accent};
      --bg: ${bg};
      --text: ${isLight ? "#1a1a1a" : "#ffffff"};
      --text-85: ${isLight ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.85)"};
      --text-60: ${isLight ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)"};
      --text-50: ${isLight ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)"};
      --text-40: ${isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)"};
      --text-30: ${isLight ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"};
      --text-25: ${isLight ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.25)"};
      --text-20: ${isLight ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)"};
      --text-10: ${isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"};
      --overlay-02: ${isLight ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.02)"};
      --overlay-03: ${isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)"};
      --overlay-04: ${isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)"};
      --overlay-06: ${isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)"};
      --overlay-10: ${isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"};
      --overlay-15: ${isLight ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.15)"};
      --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
      --ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);
      --ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
      --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
      --spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
      --snappy: cubic-bezier(0.2, 0, 0, 1);
      --bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
      --elastic: cubic-bezier(0.68, -0.55, 0.265, 1.55);
      --elastic-subtle: cubic-bezier(0.34, 0.8, 0.2, 1.2);
      --rubber-band: cubic-bezier(0.175, 0.885, 0.32, 1.275);
      --anticipation: cubic-bezier(0.42, 0, 0.58, 1);
      --sharp-exit: cubic-bezier(0.165, 0.84, 0.44, 1);
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    html, body {
      width: 100%;
      height: 100%;
    }

    body {
      background: #000;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
      min-height: 100dvh;
      font-family: 'Inter', sans-serif;
      overflow-x: hidden;
    }

    .page-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      width: 100%;
    }

    @media (max-width: 767px) {
      body {
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      .page-wrapper {
        padding: 0;
        width: 100vw;
        height: 100vh;
        height: 100dvh;
        overflow: hidden;
      }
      .capture-frame {
        border: none !important;
        border-radius: 0 !important;
      }
      .capture-label, .capture-dimensions {
        display: none !important;
      }
      #controls {
        display: none !important;
      }
    }

    .capture-frame {
      position: relative;
      border: 2px dashed rgba(255, 50, 50, 0.4);
      border-radius: 8px;
      overflow: hidden;
    }

    .capture-label {
      position: absolute;
      top: -28px;
      left: 50%;
      transform: translateX(-50%);
      color: rgba(255, 50, 50, 0.6);
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .capture-dimensions {
      position: absolute;
      bottom: -24px;
      left: 50%;
      transform: translateX(-50%);
      color: rgba(255, 255, 255, 0.2);
      font-size: 10px;
      letter-spacing: 1px;
    }

    #video-canvas {
      width: 1080px;
      height: 1920px;
      background: var(--bg);
      position: relative;
      overflow: hidden;
      transform-origin: top left;
    }

    #viewport {
      width: 100%;
      height: 100%;
      position: relative;
    }

    /* Background layers */
    .bg-gradient {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 80% 50% at 50% -20%, ${colors.primary}22, transparent),
        radial-gradient(ellipse 60% 40% at 80% 100%, ${colors.secondary}1a, transparent),
        radial-gradient(ellipse 50% 40% at 20% 60%, ${colors.accent}0a, transparent);
      z-index: 1;
    }

    .grid-overlay {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(var(--overlay-02) 1px, transparent 1px),
        linear-gradient(90deg, var(--overlay-02) 1px, transparent 1px);
      background-size: 60px 60px;
      opacity: 0;
      animation: fadeIn 2s var(--ease-out) forwards 0.5s;
      z-index: 2;
    }

    .grain-overlay {
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E");
      background-size: 200px 200px;
      opacity: 0.4;
      z-index: 5;
      mix-blend-mode: overlay;
      pointer-events: none;
      animation: grainDrift 8s linear infinite;
    }

    .glow-orb {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      z-index: 3;
    }

    .glow-orb-1 {
      width: 500px;
      height: 500px;
      top: -150px;
      right: -100px;
      background: var(--primary);
      filter: blur(100px);
      opacity: 0.2;
      animation: pulseGlow 4s ease-in-out infinite, orbDrift1 14s ease-in-out infinite;
    }

    .glow-orb-2 {
      width: 400px;
      height: 400px;
      bottom: 150px;
      left: -120px;
      background: var(--accent);
      filter: blur(110px);
      opacity: 0.15;
      animation: pulseGlow 5s ease-in-out infinite reverse, orbDrift2 18s ease-in-out infinite;
    }

    .glow-orb-3 {
      width: 350px;
      height: 350px;
      bottom: -80px;
      right: -60px;
      background: var(--secondary);
      filter: blur(95px);
      opacity: 0.15;
      animation: pulseGlow 6s ease-in-out infinite 1s, orbDrift3 16s ease-in-out infinite;
    }

    #particles {
      position: absolute;
      inset: 0;
      z-index: 4;
      pointer-events: none;
    }

    .particle {
      position: absolute;
      background: var(--text-30);
      border-radius: 50%;
      animation: floatParticle 8s infinite ease-in-out;
    }

    .particle-diamond {
      position: absolute;
      background: var(--primary);
      opacity: 0.15;
      transform: rotate(45deg);
      animation: floatParticle 10s infinite ease-in-out;
    }

    .particle-line {
      position: absolute;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--text-20), transparent);
      animation: floatParticle 12s infinite ease-in-out;
    }

    /* Scene system */
    .scene {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      z-index: 10;
      opacity: 0;
      transform: scale(0.9);
      filter: blur(5px);
      transition: all 0.5s var(--ease-out);
    }

    .scene.active {
      opacity: 1;
      transform: scale(1);
      filter: blur(0);
    }

    .scene.exit {
      opacity: 0;
      transform: scale(1.1);
      filter: blur(5px);
    }

    /* GPU optimization */
    .scene, .scene * {
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      -webkit-transform-style: preserve-3d;
      transform-style: preserve-3d;
    }

    /* Animated elements default state */
    .anim {
      opacity: 0;
      transform: translateY(40px);
      transition: all 0.6s var(--ease-out);
    }

    .anim.animate {
      opacity: 1;
      transform: translateY(0);
    }

    .anim-slam {
      opacity: 0;
      transform: scale(2) translateY(-50px);
      filter: blur(10px);
    }

    .anim-slam.animate {
      animation: textSlam 0.5s var(--ease-out-expo) forwards;
    }

    .anim-pop {
      opacity: 0;
      transform: scale(0.5);
    }

    .anim-pop.animate {
      animation: scalePop 0.8s var(--ease-out-back) forwards;
    }

    .anim-glitch {
      opacity: 0;
    }

    .anim-glitch.animate {
      animation: glitchReveal 0.6s var(--snappy) forwards;
    }

    .anim-flip {
      opacity: 0;
      transform: perspective(1200px) rotateY(90deg);
      filter: blur(8px);
    }

    .anim-flip.animate {
      animation: flip3D 0.7s var(--ease-out-expo) forwards;
    }

    .anim-neon {
      opacity: 0;
    }

    .anim-neon.animate {
      animation: neonReveal 0.5s var(--ease-out) forwards;
    }

    .anim-cascade {
      opacity: 0;
      transform: translateX(-30px) rotate(-2deg);
    }

    .anim-cascade.animate {
      animation: staggerCascade 0.6s var(--elastic-subtle) forwards;
    }

    /* Controls outside capture */
    #controls {
      margin-top: 40px;
      display: flex;
      gap: 12px;
    }

    #controls button {
      padding: 12px 32px;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.05);
      color: #fff;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    #controls button:hover {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.3);
    }

    /* ============================================================
       KEYFRAME ANIMATIONS
       ============================================================ */

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes pulseGlow {
      0%, 100% { opacity: 0.2; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.1); }
    }

    @keyframes floatParticle {
      0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
      50% { transform: translateY(-100px) translateX(20px); opacity: 0.8; }
    }

    @keyframes textSlam {
      from { opacity: 0; transform: scale(2) translateY(-50px); filter: blur(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
    }

    @keyframes scalePop {
      from { opacity: 0; transform: scale(0.5); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes slideUpFade {
      from { opacity: 0; transform: translateY(50px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideRightFade {
      from { opacity: 0; transform: translateX(-30px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes buttonGlow {
      0%, 100% { box-shadow: 0 0 40px ${colors.accent}66; }
      50% { box-shadow: 0 0 80px ${colors.accent}99, 0 0 120px ${colors.accent}33; }
    }

    @keyframes gradientShift {
      to { background-position: 200% center; }
    }

    @keyframes shineSweep {
      from { left: -100%; }
      to { left: 150%; }
    }

    @keyframes bounceIn {
      0% { opacity: 0; transform: scale(0.3); }
      50% { transform: scale(1.1); }
      70% { transform: scale(0.95); }
      100% { opacity: 1; transform: scale(1); }
    }

    @keyframes countUp {
      from { opacity: 0; transform: translateY(20px) scale(0.8); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes growWidth {
      from { width: 0%; }
    }

    @keyframes arrowPulse {
      0%, 100% { transform: translateX(0) scale(1); opacity: 0.8; }
      50% { transform: translateX(10px) scale(1.15); opacity: 1; }
    }

    /* ============================================================
       ADVANCED ANIMATIONS - Kinetic Typography, Glitch, 3D, Neon
       ============================================================ */

    @keyframes charReveal {
      0% { opacity: 0; transform: translateY(12px) scaleY(0.85); filter: blur(3px); }
      100% { opacity: 1; transform: translateY(0) scaleY(1); filter: blur(0); }
    }

    @keyframes glitchReveal {
      0% { opacity: 0; transform: translateX(-5px); clip-path: inset(0 0 100% 0); }
      15% { opacity: 1; transform: translateX(3px); clip-path: inset(80% 0 0 0); }
      30% { transform: translateX(-2px); clip-path: inset(0 0 60% 0); }
      45% { transform: translateX(4px); clip-path: inset(40% 0 0 0); }
      60% { transform: translateX(-1px); clip-path: inset(0 0 20% 0); }
      75% { transform: translateX(2px); clip-path: inset(10% 0 0 0); }
      100% { opacity: 1; transform: translateX(0); clip-path: inset(0 0 0 0); }
    }

    @keyframes flip3D {
      0% { opacity: 0; transform: perspective(1200px) rotateY(90deg) rotateX(8deg); filter: blur(8px); }
      100% { opacity: 1; transform: perspective(1200px) rotateY(0deg) rotateX(0deg); filter: blur(0); }
    }

    @keyframes zoomShake {
      0% { transform: scale(1) translate(0, 0); }
      10% { transform: scale(1.03) translate(3px, -2px); }
      20% { transform: scale(1.03) translate(-3px, 2px); }
      30% { transform: scale(1.03) translate(2px, 3px); }
      40% { transform: scale(1.04) translate(-2px, -3px); }
      50% { transform: scale(1.05) translate(0, 0); }
      60% { transform: scale(1.03) translate(-3px, 2px); }
      70% { transform: scale(1.02) translate(3px, -2px); }
      80% { transform: scale(1.01) translate(-1px, 0); }
      100% { transform: scale(1) translate(0, 0); }
    }

    @keyframes neonReveal {
      0% { opacity: 0; text-shadow: none; filter: blur(8px); }
      40% { opacity: 1; text-shadow: 0 0 20px currentColor, 0 0 40px currentColor; filter: blur(0); }
      70% { text-shadow: 0 0 30px currentColor, 0 0 60px currentColor, 0 0 100px currentColor; }
      100% { opacity: 1; text-shadow: 0 0 15px currentColor, 0 0 30px currentColor, 0 0 60px currentColor; }
    }

    @keyframes neonPulse {
      0%, 100% { text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor; filter: brightness(1); }
      50% { text-shadow: 0 0 20px currentColor, 0 0 40px currentColor, 0 0 80px currentColor, 0 0 120px currentColor; filter: brightness(1.15); }
    }

    @keyframes chromaticFlash {
      0%, 100% { filter: none; }
      25% { filter: drop-shadow(-3px 0 0 rgba(255,0,128,0.5)) drop-shadow(3px 0 0 rgba(0,255,255,0.5)); }
      50% { filter: drop-shadow(2px 0 0 rgba(255,0,128,0.3)) drop-shadow(-2px 0 0 rgba(0,255,255,0.3)); }
      75% { filter: drop-shadow(-1px 0 0 rgba(255,0,128,0.2)) drop-shadow(1px 0 0 rgba(0,255,255,0.2)); }
    }

    @keyframes liquidMorph {
      0% { border-radius: 20px; transform: scale(0.8) skewX(-3deg); filter: blur(4px); opacity: 0; }
      50% { border-radius: 50%; transform: scale(1.05) skewX(0deg); opacity: 1; }
      100% { border-radius: 16px; transform: scale(1) skewX(0deg); filter: blur(0); opacity: 1; }
    }

    @keyframes staggerCascade {
      0% { opacity: 0; transform: translateX(-30px) rotate(-2deg); }
      100% { opacity: 1; transform: translateX(0) rotate(0deg); }
    }

    @keyframes grainDrift {
      0% { background-position: 0 0; }
      100% { background-position: 200px 200px; }
    }

    @keyframes orbDrift1 {
      0%, 100% { transform: translate(0, 0); }
      25% { transform: translate(40px, -50px); }
      50% { transform: translate(-30px, 60px); }
      75% { transform: translate(50px, 30px); }
    }

    @keyframes orbDrift2 {
      0%, 100% { transform: translate(0, 0); }
      33% { transform: translate(-60px, 50px); }
      66% { transform: translate(70px, -40px); }
    }

    @keyframes orbDrift3 {
      0%, 100% { transform: translate(0, 0); }
      50% { transform: translate(-50px, -60px); }
    }

    @keyframes spotlightSweep {
      0% { opacity: 0; transform: translate(-30%, -30%) scale(0.8); }
      30% { opacity: 0.4; }
      70% { opacity: 0.6; }
      100% { opacity: 0; transform: translate(30%, 30%) scale(1.2); }
    }

    /* ============================================================
       NEW SCENE TYPE STYLES
       ============================================================ */

    .quote-mark {
      font-size: 140px;
      line-height: 0.6;
      font-weight: 900;
      opacity: 0.15;
      position: absolute;
    }

    .quote-mark-open { top: -10px; left: -10px; }
    .quote-mark-close { bottom: -10px; right: -10px; transform: rotate(180deg); }

    .chapter-line {
      width: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--primary), var(--accent));
      border-radius: 2px;
      transition: width 1s var(--ease-out);
    }

    .chapter-line.animate { width: 200px; }

    @keyframes revealWord {
      0% { opacity: 0; transform: scale(3) translateY(-20px); filter: blur(15px); letter-spacing: 20px; }
      60% { opacity: 1; transform: scale(1.05) translateY(0); filter: blur(0); letter-spacing: 2px; }
      100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); letter-spacing: -1px; }
    }

    .anim-reveal {
      opacity: 0;
    }

    .anim-reveal.animate {
      animation: revealWord 0.8s var(--ease-out-expo) forwards;
    }

    @keyframes tipBadgePop {
      0% { opacity: 0; transform: scale(0.5) rotate(-10deg); }
      60% { transform: scale(1.1) rotate(2deg); }
      100% { opacity: 1; transform: scale(1) rotate(0deg); }
    }

    .tip-badge {
      opacity: 0;
    }

    .tip-badge.animate {
      animation: tipBadgePop 0.6s var(--ease-out-back) forwards;
    }

    @keyframes listItemSlide {
      from { opacity: 0; transform: translateX(-40px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `;

  // Cinematic theme additions
  if (theme === "cinematic") {
    css += `
    /* ============================================================
       CINEMATIC THEME OVERRIDES
       ============================================================ */

    /* 4th center glow orb - activates on brand/CTA scenes */
    .glow-orb-4 {
      width: 500px;
      height: 500px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--primary);
      filter: blur(120px);
      opacity: 0;
      transition: opacity 1s ease;
      z-index: 3;
    }

    .glow-orb-4.active {
      opacity: 0.3;
      animation: centerGlowPulse 3s ease-in-out infinite;
    }

    /* Letterbox bars */
    .letterbox-top, .letterbox-bottom {
      position: absolute;
      left: 0;
      right: 0;
      background: var(--bg);
      height: 0;
      z-index: 15;
      transition: height 1s var(--ease-out);
    }

    .letterbox-top { top: 0; }
    .letterbox-bottom { bottom: 0; }

    /* More dramatic slam */
    .anim-slam {
      opacity: 0;
      transform: scale(2.5) translateY(-50px);
      filter: blur(12px);
    }

    @keyframes textSlam {
      from { opacity: 0; transform: scale(2.5) translateY(-50px); filter: blur(12px); }
      to { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
    }

    /* Smoother scene exit */
    .scene.exit {
      opacity: 0;
      transform: scale(1.08);
      filter: blur(6px);
    }

    /* Smoother scene enter */
    .scene {
      transform: scale(0.95);
    }

    /* Montage flash system */
    .montage-container {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }

    .montage-flash {
      position: absolute;
      opacity: 0;
      font-weight: 900;
      text-align: center;
      line-height: 1.1;
      letter-spacing: -2px;
      text-transform: uppercase;
    }

    .montage-flash.animate {
      animation: flashIn 0.9s var(--ease-out-expo) forwards;
    }

    .montage-flash.flash-last.animate {
      animation: flashIn 1.4s var(--ease-out-expo) forwards;
    }

    .flash-red { color: #ff4444; }
    .flash-primary { color: var(--primary); }
    .flash-green { color: #44ff88; }
    .flash-white { color: var(--text); }

    @keyframes flashIn {
      0% { opacity: 0; transform: scale(3); filter: blur(20px); }
      30% { opacity: 1; transform: scale(1); filter: blur(0); }
      70% { opacity: 1; transform: scale(1); filter: blur(0); }
      100% { opacity: 0; transform: scale(0.9); filter: blur(4px); }
    }

    @keyframes centerGlowPulse {
      0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1); }
      50% { opacity: 0.4; transform: translate(-50%, -50%) scale(1.15); }
    }

    /* Hook underline */
    .hook-underline {
      height: 5px;
      background: linear-gradient(90deg, var(--primary), var(--accent));
      border-radius: 3px;
      margin-top: 24px;
      width: 0;
      transition: width 0.8s var(--ease-out);
    }

    .hook-underline.animate {
      width: 400px;
    }

    /* INTRODUCING badge */
    .intro-badge {
      display: inline-block;
      padding: 8px 28px;
      border: 2px solid var(--primary);
      border-radius: 40px;
      font-size: 18px;
      font-weight: 700;
      color: var(--primary);
      letter-spacing: 6px;
      text-transform: uppercase;
      margin-bottom: 30px;
    }

    /* Enhanced CTA glow */
    @keyframes buttonGlowEnhanced {
      0%, 100% { box-shadow: 0 0 50px ${colors.accent}66; }
      50% { box-shadow: 0 0 100px ${colors.accent}99, 0 0 150px ${colors.accent}33; }
    }

    /* Dynamic shine for cinematic features */
    @keyframes dynamicShineSweep {
      from { left: -100%; }
      to { left: 200%; }
    }
    `;
  }

  return css;
}

// ============================================================
// SCENE HTML GENERATORS
// ============================================================

function renderKineticText(text: string, elementId: string): string {
  const chars = text.split('');
  const spans = chars.map((char, i) => {
    if (char === ' ') return ' ';
    return `<span class="kinetic-char" style="display:inline-block;opacity:0;animation:charReveal 0.5s var(--ease-out) forwards ${i * 0.035}s;">${escapeHtml(char)}</span>`;
  }).join('');
  return `<span id="${elementId}" class="kinetic-text">${spans}</span>`;
}

function hookScene(scene: SceneData, index: number, _colors: ClipColors, theme: ClipTheme): string {
  const underlineHtml = theme === "cinematic"
    ? `<div class="hook-underline" id="s${index}-underline"></div>`
    : "";

  const isCinematic = theme === "cinematic";
  const headlineText = escapeHtml(scene.headline || "");

  return `
    <div class="scene" id="scene-${index}">
      ${isCinematic ? `
      <div class="anim-glitch" id="s${index}-headline" style="
        font-size: 72px;
        font-weight: 900;
        color: var(--text);
        text-align: center;
        line-height: 1.15;
        letter-spacing: -1px;
        max-width: 900px;
        text-shadow: 0 0 60px var(--primary)40;
      ">${headlineText}</div>
      ` : `
      <div id="s${index}-headline" style="
        font-size: 72px;
        font-weight: 900;
        color: var(--text);
        text-align: center;
        line-height: 1.15;
        letter-spacing: -1px;
        max-width: 900px;
        text-shadow: 0 0 60px var(--primary)40;
        opacity: 0;
      ">${renderKineticText(scene.headline || "", `s${index}-kinetic`)}</div>
      `}
      ${underlineHtml}
      ${
        scene.subheadline
          ? `<div class="anim" id="s${index}-sub" style="
        font-size: 36px;
        font-weight: 400;
        color: var(--text-60);
        text-align: center;
        margin-top: 30px;
        max-width: 800px;
        line-height: 1.4;
      ">${escapeHtml(scene.subheadline)}</div>`
          : ""
      }
    </div>
  `;
}

function brandScene(scene: SceneData, index: number, colors: ClipColors, theme: ClipTheme): string {
  const introBadge = theme === "cinematic"
    ? `<div class="anim-pop intro-badge" id="s${index}-badge">INTRODUCING</div>`
    : "";

  const gradientSize = theme === "cinematic" ? "300%" : "200%";

  return `
    <div class="scene" id="scene-${index}">
      ${introBadge}
      <div class="anim-flip" id="s${index}-logo" style="
        width: 130px;
        height: 130px;
        border-radius: 32px;
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 52px;
        font-weight: 900;
        color: var(--text);
        margin-bottom: 40px;
        box-shadow: 0 0 80px ${colors.primary}50, 0 0 120px ${colors.primary}20;
        will-change: transform, opacity;
      ">${(scene.brandName || "B").charAt(0).toUpperCase()}</div>
      <div class="anim-neon" id="s${index}-name" style="
        font-size: 80px;
        font-weight: 900;
        background: linear-gradient(90deg, var(--text), var(--primary), var(--secondary), var(--primary));
        background-size: ${gradientSize} auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: gradientShift 3s linear infinite;
        letter-spacing: -2px;
        text-align: center;
        color: var(--primary);
      ">${escapeHtml(scene.brandName || "")}</div>
      ${
        scene.tagline
          ? `<div class="anim" id="s${index}-tagline" style="
        font-size: 32px;
        font-weight: 400;
        color: var(--text-50);
        text-align: center;
        margin-top: 20px;
        max-width: 700px;
        line-height: 1.4;
      ">${escapeHtml(scene.tagline)}</div>`
          : ""
      }
    </div>
  `;
}

function featuresScene(scene: SceneData, index: number, colors: ClipColors): string {
  const items = scene.features || [];
  const featureCards = items
    .map(
      (f, i) => `
    <div class="anim-cascade" id="s${index}-feat-${i}" style="
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 28px 36px;
      background: var(--overlay-03);
      border: 2px solid ${colors.primary}20;
      border-radius: 20px;
      width: 100%;
      position: relative;
      overflow: hidden;
      will-change: transform, opacity;
      backdrop-filter: blur(4px);
    ">
      <div style="
        width: 56px;
        height: 56px;
        min-width: 56px;
        border-radius: 14px;
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;
        font-weight: 800;
        color: var(--text);
      ">${i + 1}</div>
      <div style="
        font-size: 28px;
        font-weight: 600;
        color: var(--text);
        line-height: 1.3;
      ">${escapeHtml(f)}</div>
      <div class="shine-layer" style="
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 50%;
        height: 100%;
        background: linear-gradient(90deg, transparent, var(--overlay-04), transparent);
        pointer-events: none;
        animation: shineSweep 2s var(--ease-out) forwards ${0.8 + i * 0.3}s;
      "></div>
    </div>
  `
    )
    .join("");

  return `
    <div class="scene" id="scene-${index}">
      ${
        scene.headline
          ? `<div class="anim" id="s${index}-title" style="
        font-size: 42px;
        font-weight: 800;
        color: var(--text);
        text-align: center;
        margin-bottom: 40px;
      ">${escapeHtml(scene.headline)}</div>`
          : ""
      }
      <div style="
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
        max-width: 860px;
      ">
        ${featureCards}
      </div>
    </div>
  `;
}

function demoScene(scene: SceneData, index: number, colors: ClipColors): string {
  const steps = scene.demoSteps || [];
  const stepEls = steps
    .map(
      (s, i) => `
    <div class="anim" id="s${index}-step-${i}" style="
      display: flex;
      align-items: flex-start;
      gap: 20px;
      position: relative;
    ">
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0;
      ">
        <div style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          box-shadow: 0 0 20px ${colors.primary}40;
          flex-shrink: 0;
        ">${i + 1}</div>
        ${
          i < steps.length - 1
            ? `<div style="
          width: 3px;
          height: 50px;
          background: linear-gradient(to bottom, ${colors.primary}60, transparent);
          margin-top: 4px;
        "></div>`
            : ""
        }
      </div>
      <div style="
        font-size: 28px;
        font-weight: 500;
        color: var(--text-85);
        padding-top: 6px;
        line-height: 1.3;
      ">${escapeHtml(s)}</div>
    </div>
  `
    )
    .join("");

  return `
    <div class="scene" id="scene-${index}">
      ${
        scene.demoTitle || scene.headline
          ? `<div class="anim-slam" id="s${index}-title" style="
        font-size: 48px;
        font-weight: 800;
        color: var(--text);
        text-align: center;
        margin-bottom: 50px;
        line-height: 1.2;
      ">${escapeHtml(scene.demoTitle || scene.headline || "")}</div>`
          : ""
      }
      <div style="
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
        max-width: 800px;
        padding: 40px;
        background: var(--overlay-02);
        border: 1px solid var(--overlay-06);
        border-radius: 24px;
      ">
        ${stepEls}
      </div>
    </div>
  `;
}

function transformationScene(
  scene: SceneData,
  index: number,
  colors: ClipColors
): string {
  return `
    <div class="scene" id="scene-${index}">
      ${
        scene.headline
          ? `<div class="anim" id="s${index}-title" style="
        font-size: 38px;
        font-weight: 700;
        color: var(--text-60);
        text-align: center;
        margin-bottom: 60px;
      ">${escapeHtml(scene.headline)}</div>`
          : ""
      }
      <div style="
        display: flex;
        align-items: center;
        gap: 40px;
        width: 100%;
        max-width: 860px;
        justify-content: center;
      ">
        <!-- Before -->
        <div class="anim-pop" id="s${index}-before" style="
          flex: 1;
          padding: 40px 30px;
          background: rgba(255,80,80,0.08);
          border: 2px solid rgba(255,80,80,0.2);
          border-radius: 24px;
          text-align: center;
        ">
          ${scene.beforeLabel ? `<div style="font-size: 20px; font-weight: 600; color: rgba(255,80,80,0.7); margin-bottom: 16px; text-transform: uppercase; letter-spacing: 2px;">${escapeHtml(scene.beforeLabel)}</div>` : ""}
          <div style="
            font-size: 56px;
            font-weight: 900;
            color: rgba(255,100,100,0.9);
            line-height: 1.1;
          ">${escapeHtml(scene.before || "")}</div>
        </div>

        <!-- Arrow -->
        <div class="anim-pop" id="s${index}-arrow" style="
          font-size: 48px;
          color: var(--accent);
          animation: arrowPulse 1.5s ease-in-out infinite;
          flex-shrink: 0;
        ">&#10132;</div>

        <!-- After -->
        <div class="anim-pop" id="s${index}-after" style="
          flex: 1;
          padding: 40px 30px;
          background: ${colors.primary}12;
          border: 2px solid ${colors.primary}30;
          border-radius: 24px;
          text-align: center;
        ">
          ${scene.afterLabel ? `<div style="font-size: 20px; font-weight: 600; color: ${colors.primary}; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 2px;">${escapeHtml(scene.afterLabel)}</div>` : ""}
          <div style="
            font-size: 56px;
            font-weight: 900;
            color: ${colors.primary};
            line-height: 1.1;
            text-shadow: 0 0 40px ${colors.primary}40;
          ">${escapeHtml(scene.after || "")}</div>
        </div>
      </div>
    </div>
  `;
}

function statsScene(scene: SceneData, index: number, colors: ClipColors, theme: ClipTheme): string {
  const stats = scene.stats || [];
  const statCards = stats
    .map(
      (s, i) => `
    <div class="anim-pop" id="s${index}-stat-${i}" style="
      flex: 1;
      min-width: 200px;
      padding: 36px 24px;
      background: var(--overlay-03);
      border: 2px solid ${colors.primary}18;
      border-radius: 20px;
      text-align: center;
    ">
      <div id="s${index}-stat-val-${i}" style="
        font-size: 64px;
        font-weight: 900;
        background: linear-gradient(135deg, var(--primary), var(--accent));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        line-height: 1.1;
        margin-bottom: 12px;
      ">${theme === "cinematic" ? "0" : escapeHtml(s.value)}</div>
      <div style="
        font-size: 22px;
        font-weight: 500;
        color: var(--text-50);
        line-height: 1.3;
      ">${escapeHtml(s.label)}</div>
    </div>
  `
    )
    .join("");

  return `
    <div class="scene" id="scene-${index}">
      ${
        scene.headline
          ? `<div class="anim-slam" id="s${index}-title" style="
        font-size: 48px;
        font-weight: 800;
        color: var(--text);
        text-align: center;
        margin-bottom: 50px;
      ">${escapeHtml(scene.headline)}</div>`
          : ""
      }
      <div style="
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        width: 100%;
        max-width: 860px;
        justify-content: center;
      ">
        ${statCards}
      </div>
    </div>
  `;
}

function comparisonScene(
  scene: SceneData,
  index: number,
  colors: ClipColors
): string {
  const problems = scene.problems || [];
  const solutions = scene.solutions || [];

  const problemEls = problems
    .map(
      (p, i) => `
    <div class="anim" id="s${index}-prob-${i}" style="
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: rgba(255,60,60,0.06);
      border-radius: 14px;
    ">
      <div style="
        width: 36px;
        height: 36px;
        min-width: 36px;
        border-radius: 50%;
        background: rgba(255,80,80,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        color: rgba(255,80,80,0.8);
        font-weight: 700;
      ">&#10007;</div>
      <span style="font-size: 24px; color: var(--text-60); line-height: 1.3;">${escapeHtml(p)}</span>
    </div>
  `
    )
    .join("");

  const solutionEls = solutions
    .map(
      (s, i) => `
    <div class="anim" id="s${index}-sol-${i}" style="
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: ${colors.primary}0a;
      border-radius: 14px;
    ">
      <div style="
        width: 36px;
        height: 36px;
        min-width: 36px;
        border-radius: 50%;
        background: ${colors.primary}20;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        color: ${colors.primary};
        font-weight: 700;
      ">&#10003;</div>
      <span style="font-size: 24px; color: var(--text-85); font-weight: 500; line-height: 1.3;">${escapeHtml(s)}</span>
    </div>
  `
    )
    .join("");

  return `
    <div class="scene" id="scene-${index}">
      ${
        scene.headline
          ? `<div class="anim-slam" id="s${index}-title" style="
        font-size: 44px;
        font-weight: 800;
        color: var(--text);
        text-align: center;
        margin-bottom: 40px;
      ">${escapeHtml(scene.headline)}</div>`
          : ""
      }
      <div style="
        display: flex;
        gap: 24px;
        width: 100%;
        max-width: 860px;
      ">
        <!-- Problems column -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 12px;">
          <div style="font-size: 20px; font-weight: 700; color: rgba(255,80,80,0.7); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; text-align: center;">Without</div>
          ${problemEls}
        </div>
        <!-- Solutions column -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 12px;">
          <div style="font-size: 20px; font-weight: 700; color: ${colors.primary}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; text-align: center;">With</div>
          ${solutionEls}
        </div>
      </div>
    </div>
  `;
}

function ctaScene(scene: SceneData, index: number, colors: ClipColors): string {
  return `
    <div class="scene" id="scene-${index}">
      <div class="anim-slam" id="s${index}-headline" style="
        font-size: 60px;
        font-weight: 900;
        color: var(--text);
        text-align: center;
        line-height: 1.15;
        max-width: 800px;
        margin-bottom: 50px;
      ">${escapeHtml(scene.headline || scene.ctaText || "Get Started")}</div>
      ${
        scene.subheadline
          ? `<div class="anim" id="s${index}-sub" style="
        font-size: 30px;
        color: var(--text-50);
        text-align: center;
        margin-bottom: 40px;
        max-width: 700px;
      ">${escapeHtml(scene.subheadline)}</div>`
          : ""
      }
      <div class="anim-pop" id="s${index}-btn" style="
        padding: 28px 80px;
        background: linear-gradient(135deg, var(--accent), ${colors.accent}cc);
        border-radius: 60px;
        font-size: 32px;
        font-weight: 800;
        color: var(--text);
        cursor: pointer;
        box-shadow: 0 0 60px ${colors.accent}66, 0 0 100px ${colors.accent}22;
        will-change: transform, opacity;
        position: relative;
        overflow: hidden;
      "><span style="position:relative;z-index:1;">${escapeHtml(scene.ctaText || "Start Free")}</span><div style="position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,var(--overlay-15),transparent);pointer-events:none;animation:shineSweep 2.5s var(--ease-out) infinite 1.5s;"></div></div>
      ${
        scene.url
          ? `<div class="anim" id="s${index}-url" style="
        margin-top: 30px;
        font-size: 22px;
        color: var(--text-30);
        letter-spacing: 1px;
      ">${escapeHtml(scene.url)}</div>`
          : ""
      }
    </div>
  `;
}

function montageScene(scene: SceneData, index: number): string {
  const items = scene.montageItems || [];
  const colorClasses = ["flash-red", "flash-primary", "flash-green", "flash-white"];
  const sizes = [80, 72, 68, 76, 84];

  const flashEls = items
    .map((text, i) => {
      const colorClass = colorClasses[i % colorClasses.length];
      const isLast = i === items.length - 1;
      const fontSize = sizes[i % sizes.length];
      const glowStyle = isLast ? `text-shadow: 0 0 60px var(--primary);` : "";
      return `<div class="montage-flash ${colorClass}${isLast ? " flash-last" : ""}" id="s${index}-flash-${i}" style="
        font-size: ${fontSize}px;
        ${glowStyle}
      ">${escapeHtml(text)}</div>`;
    })
    .join("\n      ");

  return `
    <div class="scene" id="scene-${index}">
      <div class="montage-container">
        ${flashEls}
      </div>
    </div>
  `;
}

// ============================================================
// NEW SCENE RENDERERS (narrative, quote, chapter, reveal, tip, listicle)
// ============================================================

function narrativeScene(scene: SceneData, index: number, colors: ClipColors): string {
  const moodColors: Record<string, string> = {
    hopeful: colors.primary,
    dark: "#ff4444",
    neutral: "var(--text-60)",
    inspiring: colors.accent,
    tense: "#ff8844",
  };
  const borderColor = moodColors[scene.mood || "neutral"] || "var(--text-60)";

  return `
    <div class="scene" id="scene-${index}">
      <div class="anim" id="s${index}-text" style="
        font-size: 38px;
        font-weight: 400;
        color: var(--text-85);
        text-align: center;
        line-height: 1.6;
        max-width: 820px;
        padding: 50px 60px;
        border-left: 4px solid ${borderColor};
        position: relative;
      ">${escapeHtml(scene.text || scene.headline || "")}</div>
      ${scene.mood ? `<div class="anim" id="s${index}-mood" style="
        font-size: 16px;
        font-weight: 600;
        color: ${borderColor};
        text-transform: uppercase;
        letter-spacing: 4px;
        margin-top: 30px;
        opacity: 0.6;
      ">${escapeHtml(scene.mood)}</div>` : ""}
    </div>
  `;
}

function quoteScene(scene: SceneData, index: number, colors: ClipColors): string {
  return `
    <div class="scene" id="scene-${index}">
      <div class="anim-pop" id="s${index}-quote-box" style="
        position: relative;
        max-width: 820px;
        padding: 60px 70px;
        background: var(--overlay-03);
        border: 1px solid ${colors.primary}20;
        border-radius: 24px;
      ">
        <div class="quote-mark quote-mark-open" style="color: ${colors.primary};">"</div>
        <div id="s${index}-quote-text" style="
          font-size: 44px;
          font-weight: 600;
          color: var(--text);
          line-height: 1.4;
          text-align: center;
          font-style: italic;
          opacity: 0;
        ">${escapeHtml(scene.quote || scene.headline || "")}</div>
        <div class="quote-mark quote-mark-close" style="color: ${colors.primary};">"</div>
      </div>
      ${scene.author ? `<div class="anim" id="s${index}-author" style="
        font-size: 28px;
        font-weight: 700;
        color: ${colors.primary};
        margin-top: 30px;
        text-align: center;
      ">— ${escapeHtml(scene.author)}</div>` : ""}
      ${scene.source ? `<div class="anim" id="s${index}-source" style="
        font-size: 20px;
        font-weight: 400;
        color: var(--text-40);
        margin-top: 10px;
        text-align: center;
      ">${escapeHtml(scene.source)}</div>` : ""}
    </div>
  `;
}

function chapterScene(scene: SceneData, index: number, colors: ClipColors): string {
  const num = scene.chapterNumber ?? 1;
  return `
    <div class="scene" id="scene-${index}">
      <div class="anim-pop" id="s${index}-number" style="
        font-size: 120px;
        font-weight: 900;
        background: linear-gradient(135deg, ${colors.primary}, ${colors.accent});
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        line-height: 1;
        margin-bottom: 20px;
      ">${num < 10 ? "0" + num : num}</div>
      <div class="chapter-line" id="s${index}-line"></div>
      <div class="anim-slam" id="s${index}-title" style="
        font-size: 56px;
        font-weight: 800;
        color: var(--text);
        text-align: center;
        margin-top: 30px;
        max-width: 800px;
        line-height: 1.2;
      ">${escapeHtml(scene.chapterTitle || scene.headline || "")}</div>
    </div>
  `;
}

function revealScene(scene: SceneData, index: number, colors: ClipColors): string {
  return `
    <div class="scene" id="scene-${index}">
      <div class="anim-reveal" id="s${index}-reveal" style="
        font-size: 90px;
        font-weight: 900;
        color: var(--text);
        text-align: center;
        line-height: 1.1;
        max-width: 900px;
        text-shadow: 0 0 80px ${colors.primary}50;
      ">${escapeHtml(scene.revealText || scene.headline || "")}</div>
      ${scene.subtext ? `<div class="anim" id="s${index}-subtext" style="
        font-size: 32px;
        font-weight: 400;
        color: var(--text-50);
        text-align: center;
        margin-top: 30px;
        max-width: 700px;
      ">${escapeHtml(scene.subtext)}</div>` : ""}
    </div>
  `;
}

function tipScene(scene: SceneData, index: number, colors: ClipColors): string {
  const tipNum = scene.tipNumber ?? 1;
  return `
    <div class="scene" id="scene-${index}">
      <div class="tip-badge" id="s${index}-badge" style="
        display: inline-flex;
        align-items: center;
        gap: 12px;
        padding: 14px 32px;
        background: ${colors.primary}18;
        border: 2px solid ${colors.primary}40;
        border-radius: 50px;
        margin-bottom: 40px;
      ">
        <span style="
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${colors.primary}, ${colors.accent});
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 800;
          color: var(--text);
        ">${tipNum}</span>
        <span style="
          font-size: 18px;
          font-weight: 700;
          color: ${colors.primary};
          text-transform: uppercase;
          letter-spacing: 3px;
        ">TIP</span>
      </div>
      <div class="anim-slam" id="s${index}-title" style="
        font-size: 52px;
        font-weight: 800;
        color: var(--text);
        text-align: center;
        max-width: 820px;
        line-height: 1.2;
        margin-bottom: 30px;
      ">${escapeHtml(scene.tipTitle || scene.headline || "")}</div>
      ${scene.tipBody ? `<div class="anim" id="s${index}-body" style="
        font-size: 30px;
        font-weight: 400;
        color: var(--text-60);
        text-align: center;
        max-width: 780px;
        line-height: 1.5;
      ">${escapeHtml(scene.tipBody)}</div>` : ""}
    </div>
  `;
}

function listicleScene(scene: SceneData, index: number, colors: ClipColors): string {
  const listItems = scene.items || scene.features || [];
  const itemEls = listItems
    .map(
      (item, i) => `
    <div class="anim" id="s${index}-item-${i}" style="
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 24px 32px;
      background: var(--overlay-03);
      border: 1px solid ${colors.primary}15;
      border-radius: 16px;
      width: 100%;
    ">
      <div style="
        width: 44px;
        height: 44px;
        min-width: 44px;
        border-radius: 12px;
        background: linear-gradient(135deg, ${colors.primary}, ${colors.accent});
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        font-weight: 800;
        color: var(--text);
      ">${i + 1}</div>
      <span style="
        font-size: 28px;
        font-weight: 500;
        color: var(--text-85);
        line-height: 1.3;
      ">${escapeHtml(item)}</span>
    </div>
  `
    )
    .join("");

  return `
    <div class="scene" id="scene-${index}">
      ${scene.headline ? `<div class="anim-slam" id="s${index}-headline" style="
        font-size: 48px;
        font-weight: 800;
        color: var(--text);
        text-align: center;
        margin-bottom: 40px;
        max-width: 820px;
        line-height: 1.2;
      ">${escapeHtml(scene.headline)}</div>` : ""}
      <div style="
        display: flex;
        flex-direction: column;
        gap: 14px;
        width: 100%;
        max-width: 860px;
      ">
        ${itemEls}
      </div>
    </div>
  `;
}

// ============================================================
// SCENE RENDERER MAP
// ============================================================

type SceneRenderer = (scene: SceneData, index: number, colors: ClipColors, theme: ClipTheme) => string;

const SCENE_RENDERERS: Record<string, SceneRenderer> = {
  hook: hookScene,
  brand: brandScene,
  features: (s, i, c, _t) => featuresScene(s, i, c),
  demo: (s, i, c, _t) => demoScene(s, i, c),
  transformation: (s, i, c, _t) => transformationScene(s, i, c),
  stats: statsScene,
  comparison: (s, i, c, _t) => comparisonScene(s, i, c),
  cta: (s, i, c, _t) => ctaScene(s, i, c),
  montage: (s, i, _c, _t) => montageScene(s, i),
  narrative: (s, i, c, _t) => narrativeScene(s, i, c),
  quote: (s, i, c, _t) => quoteScene(s, i, c),
  chapter: (s, i, c, _t) => chapterScene(s, i, c),
  reveal: (s, i, c, _t) => revealScene(s, i, c),
  tip: (s, i, c, _t) => tipScene(s, i, c),
  listicle: (s, i, c, _t) => listicleScene(s, i, c),
};

// ============================================================
// JAVASCRIPT ANIMATION TIMELINE
// ============================================================

function getAnimationTimeline(scenes: SceneData[], theme: ClipTheme): string {
  const isCinematic = theme === "cinematic";
  const sceneTimings: string[] = [];

  scenes.forEach((scene, i) => {
    const lines: string[] = [];
    lines.push(`  // Scene ${i + 1}: ${scene.type}`);
    lines.push(`  await switchScene('scene-${i}');`);
    lines.push(`  await wait(200);`);

    switch (scene.type) {
      case "montage": {
        const items = scene.montageItems || [];
        items.forEach((_, fi) => {
          lines.push(`  anim('s${i}-flash-${fi}');`);
          lines.push(`  await wait(${fi === items.length - 1 ? 1400 : 900});`);
        });
        lines.push(`  await wait(500);`);
        break;
      }

      case "hook":
        if (isCinematic) {
          lines.push(`  anim('s${i}-headline');`);
          lines.push(`  await wait(400);`);
          // Chromatic flash on headline
          lines.push(`  var hookEl = document.getElementById('s${i}-headline');`);
          lines.push(`  if (hookEl) hookEl.style.animation = 'glitchReveal 0.6s var(--snappy) forwards, chromaticFlash 1.5s ease-in-out 0.6s';`);
          lines.push(`  await wait(300);`);
          lines.push(`  el('s${i}-underline', function(u) { u.classList.add('animate'); });`);
          lines.push(`  await wait(400);`);
        } else {
          // Kinetic typography: reveal parent, chars animate via CSS
          lines.push(`  var kinParent = document.getElementById('s${i}-headline');`);
          lines.push(`  if (kinParent) { kinParent.style.opacity = '1'; }`);
          lines.push(`  await wait(800);`);
        }
        if (scene.subheadline) {
          lines.push(`  anim('s${i}-sub');`);
        }
        lines.push(`  await wait(2500);`);
        break;

      case "brand":
        if (isCinematic) {
          lines.push(`  setLetterbox(7);`);
          lines.push(`  el('glow-orb-4', function(o) { o.classList.add('active'); });`);
          lines.push(`  await wait(300);`);
          lines.push(`  anim('s${i}-badge');`);
          lines.push(`  await wait(400);`);
        }
        lines.push(`  anim('s${i}-logo');`); // 3D flip animation
        lines.push(`  await wait(600);`);
        lines.push(`  anim('s${i}-name');`); // Neon reveal
        lines.push(`  await wait(300);`);
        // Add neon pulse loop after reveal
        lines.push(`  var nameEl = document.getElementById('s${i}-name');`);
        lines.push(`  if (nameEl) nameEl.style.animation = 'neonReveal 0.5s var(--ease-out) forwards, neonPulse 2s ease-in-out infinite 0.5s';`);
        lines.push(`  await wait(300);`);
        if (scene.tagline) {
          lines.push(`  anim('s${i}-tagline');`);
        }
        lines.push(`  await wait(2000);`);
        if (isCinematic) {
          lines.push(`  setLetterbox(0);`);
          lines.push(`  el('glow-orb-4', function(o) { o.classList.remove('active'); });`);
        }
        break;

      case "features": {
        if (scene.headline) {
          lines.push(`  anim('s${i}-title');`);
          lines.push(`  await wait(400);`);
        }
        const feats = scene.features || [];
        feats.forEach((_, fi) => {
          lines.push(`  anim('s${i}-feat-${fi}');`); // cascade animation
          if (isCinematic) {
            // Dynamic shine sweep after cascade
            lines.push(`  (function(idx) {`);
            lines.push(`    setTimeout(function() {`);
            lines.push(`      var card = document.getElementById('s${i}-feat-' + idx);`);
            lines.push(`      if (!card) return;`);
            lines.push(`      var shine = document.createElement('div');`);
            lines.push(`      shine.style.cssText = 'position:absolute;top:0;left:-100%;width:50%;height:100%;background:linear-gradient(90deg,transparent,var(--overlay-06),transparent);pointer-events:none;';`);
            lines.push(`      card.appendChild(shine);`);
            lines.push(`      shine.style.animation = 'dynamicShineSweep 1.2s var(--ease-out) forwards';`);
            lines.push(`    }, 400);`);
            lines.push(`  })(${fi});`);
            lines.push(`  await wait(180);`);
          } else {
            lines.push(`  await wait(150);`);
          }
        });
        lines.push(`  await wait(${1500 + feats.length * 400});`);
        break;
      }

      case "demo": {
        if (scene.demoTitle || scene.headline) {
          lines.push(`  anim('s${i}-title');`);
          lines.push(`  await wait(500);`);
        }
        const steps = scene.demoSteps || [];
        steps.forEach((_, si) => {
          lines.push(`  anim('s${i}-step-${si}');`);
          lines.push(`  await wait(800);`);
        });
        lines.push(`  await wait(1500);`);
        break;
      }

      case "transformation":
        if (scene.headline) {
          lines.push(`  anim('s${i}-title');`);
          lines.push(`  await wait(400);`);
        }
        lines.push(`  anim('s${i}-before');`);
        lines.push(`  await wait(800);`);
        lines.push(`  anim('s${i}-arrow');`);
        lines.push(`  await wait(500);`);
        lines.push(`  anim('s${i}-after');`);
        lines.push(`  await wait(2500);`);
        break;

      case "stats": {
        if (scene.headline) {
          lines.push(`  anim('s${i}-title');`);
          lines.push(`  await wait(400);`);
        }
        const sts = scene.stats || [];
        sts.forEach((st, si) => {
          lines.push(`  anim('s${i}-stat-${si}');`);
          if (isCinematic) {
            lines.push(`  animateNumber('s${i}-stat-val-${si}', '${st.value.replace(/'/g, "\\'")}');`);
          }
          lines.push(`  await wait(300);`);
        });
        lines.push(`  await wait(2000);`);
        break;
      }

      case "comparison": {
        if (scene.headline) {
          lines.push(`  anim('s${i}-title');`);
          lines.push(`  await wait(400);`);
        }
        const probs = scene.problems || [];
        probs.forEach((_, pi) => {
          lines.push(`  anim('s${i}-prob-${pi}');`);
          lines.push(`  await wait(150);`);
        });
        lines.push(`  await wait(600);`);
        const sols = scene.solutions || [];
        sols.forEach((_, si) => {
          lines.push(`  anim('s${i}-sol-${si}');`);
          lines.push(`  await wait(150);`);
        });
        lines.push(`  await wait(2000);`);
        break;
      }

      case "narrative":
        lines.push(`  anim('s${i}-text');`);
        lines.push(`  await wait(600);`);
        if (scene.mood) {
          lines.push(`  anim('s${i}-mood');`);
        }
        lines.push(`  await wait(3000);`);
        break;

      case "quote":
        lines.push(`  anim('s${i}-quote-box');`);
        lines.push(`  await wait(400);`);
        lines.push(`  var quoteText = document.getElementById('s${i}-quote-text');`);
        lines.push(`  if (quoteText) { quoteText.style.opacity = '1'; quoteText.style.transition = 'opacity 0.8s var(--ease-out)'; }`);
        lines.push(`  await wait(600);`);
        if (scene.author) {
          lines.push(`  anim('s${i}-author');`);
          lines.push(`  await wait(300);`);
        }
        if (scene.source) {
          lines.push(`  anim('s${i}-source');`);
        }
        lines.push(`  await wait(2500);`);
        break;

      case "chapter":
        lines.push(`  anim('s${i}-number');`);
        lines.push(`  await wait(400);`);
        lines.push(`  el('s${i}-line', function(l) { l.classList.add('animate'); });`);
        lines.push(`  await wait(500);`);
        lines.push(`  anim('s${i}-title');`);
        lines.push(`  await wait(2500);`);
        break;

      case "reveal":
        lines.push(`  anim('s${i}-reveal');`);
        lines.push(`  await wait(800);`);
        // Camera shake for dramatic reveal
        lines.push(`  var viewport = document.getElementById('viewport');`);
        lines.push(`  if (viewport) viewport.style.animation = 'zoomShake 0.6s var(--ease-out) forwards';`);
        lines.push(`  await wait(600);`);
        lines.push(`  if (viewport) viewport.style.animation = '';`);
        if (scene.subtext) {
          lines.push(`  anim('s${i}-subtext');`);
        }
        lines.push(`  await wait(2500);`);
        break;

      case "tip":
        lines.push(`  anim('s${i}-badge');`);
        lines.push(`  await wait(400);`);
        lines.push(`  anim('s${i}-title');`);
        lines.push(`  await wait(400);`);
        if (scene.tipBody) {
          lines.push(`  anim('s${i}-body');`);
        }
        lines.push(`  await wait(3000);`);
        break;

      case "listicle": {
        if (scene.headline) {
          lines.push(`  anim('s${i}-headline');`);
          lines.push(`  await wait(400);`);
        }
        const listItems = scene.items || scene.features || [];
        listItems.forEach((_, li) => {
          lines.push(`  anim('s${i}-item-${li}');`);
          lines.push(`  await wait(300);`);
        });
        lines.push(`  await wait(${1500 + listItems.length * 400});`);
        break;
      }

      case "cta":
        if (isCinematic) {
          lines.push(`  setLetterbox(5);`);
          lines.push(`  el('glow-orb-4', function(o) { o.classList.add('active'); });`);
          lines.push(`  await wait(300);`);
        }
        lines.push(`  anim('s${i}-headline');`);
        lines.push(`  await wait(500);`);
        if (scene.subheadline) {
          lines.push(`  anim('s${i}-sub');`);
          lines.push(`  await wait(400);`);
        }
        lines.push(`  anim('s${i}-btn');`);
        lines.push(`  await wait(300);`);
        // Camera shake on button pop for dramatic impact
        lines.push(`  var viewport = document.getElementById('viewport');`);
        lines.push(`  if (viewport) viewport.style.animation = 'zoomShake 0.6s var(--ease-out) forwards';`);
        lines.push(`  await wait(600);`);
        lines.push(`  if (viewport) viewport.style.animation = '';`);
        if (isCinematic) {
          lines.push(
            `  document.getElementById('s${i}-btn').style.animation = 'scalePop 0.8s var(--ease-out-back) forwards, buttonGlowEnhanced 2s ease-in-out infinite 0.8s';`
          );
        } else {
          lines.push(
            `  document.getElementById('s${i}-btn').style.animation = 'scalePop 0.8s var(--ease-out-back) forwards, buttonGlow 2s ease-in-out infinite 0.8s';`
          );
        }
        if (scene.url) {
          lines.push(`  anim('s${i}-url');`);
        }
        lines.push(`  await wait(3000);`);
        break;
    }

    sceneTimings.push(lines.join("\n"));
  });

  // Build switchScene function — cinematic has full style reset + longer child delay
  const switchSceneFn = isCinematic
    ? `async function switchScene(id) {
      var current = document.querySelector('.scene.active');
      var next = document.getElementById(id);
      if (current) {
        current.classList.add('exit');
        current.classList.remove('active');
        await wait(400);
        current.classList.remove('exit');
        current.querySelectorAll('.animate').forEach(function(el) {
          el.classList.remove('animate');
          el.style.opacity = '';
          el.style.transform = '';
          el.style.animation = '';
          el.style.filter = '';
        });
      }
      next.classList.add('active');
      await wait(200);
    }`
    : `async function switchScene(id) {
      var current = document.querySelector('.scene.active');
      var next = document.getElementById(id);
      if (current) {
        current.classList.add('exit');
        current.classList.remove('active');
        await wait(400);
        current.classList.remove('exit');
        current.querySelectorAll('.animate').forEach(function(el) {
          el.classList.remove('animate');
        });
      }
      next.classList.add('active');
      await wait(100);
    }`;

  // Cinematic-only helper functions
  const cinematicHelpers = isCinematic
    ? `
    function setLetterbox(pct) {
      var h = Math.round(1920 * pct / 100) + 'px';
      var top = document.getElementById('letterbox-top');
      var bot = document.getElementById('letterbox-bottom');
      if (top) top.style.height = pct > 0 ? h : '0';
      if (bot) bot.style.height = pct > 0 ? h : '0';
    }

    function animateNumber(id, target) {
      var el = document.getElementById(id);
      if (!el) return;
      var match = target.match(/([\\d,.]+)/);
      if (!match) { el.textContent = target; return; }
      var numStr = match[1];
      var numVal = parseFloat(numStr.replace(/,/g, ''));
      if (isNaN(numVal)) { el.textContent = target; return; }
      var prefix = target.substring(0, target.indexOf(numStr));
      var suffix = target.substring(target.indexOf(numStr) + numStr.length);
      var hasDecimal = numStr.includes('.');
      var decimalPlaces = hasDecimal ? numStr.split('.')[1].length : 0;
      var hasCommas = numStr.includes(',');
      var startTime = null;
      var duration = 1200;
      function frame(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = numVal * eased;
        var formatted = hasDecimal ? current.toFixed(decimalPlaces) : Math.round(current).toString();
        if (hasCommas) formatted = formatted.replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');
        el.textContent = prefix + formatted + suffix;
        if (progress < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
    `
    : "";

  // Common helper: element access (used by chapter, cinematic letterbox, etc.)
  const commonHelpers = `
    function el(id, fn) {
      var e = document.getElementById(id);
      if (e) fn(e);
    }
  `;

  return `
    function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

    function anim(id) {
      var el = document.getElementById(id);
      if (el) el.classList.add('animate');
    }

    ${switchSceneFn}
    ${commonHelpers}
    ${cinematicHelpers}

    async function playVideo() {
${sceneTimings.join("\n\n")}
    }

    // Auto-play on load
    window.addEventListener('load', function() {
      setTimeout(playVideo, 500);
    });
  `;
}

// ============================================================
// PARTICLES GENERATOR
// ============================================================

function getParticlesScript(theme: ClipTheme, colors: ClipColors): string {
  const count = theme === "cinematic" ? 40 : 30;
  return `
    (function() {
      var c = document.getElementById('particles');
      var types = [
        { cls: 'particle', sizeMin: 2, sizeMax: 4, colors: ['var(--text-25)', '${colors.primary}44', '${colors.accent}33'] },
        { cls: 'particle-diamond', sizeMin: 3, sizeMax: 6, colors: ['${colors.primary}22', '${colors.secondary}22'] },
        { cls: 'particle-line', sizeMin: 15, sizeMax: 40, colors: ['var(--text-10)'] }
      ];
      for (var i = 0; i < ${count}; i++) {
        var t = types[i % types.length];
        var p = document.createElement('div');
        p.className = t.cls;
        var size = t.sizeMin + Math.random() * (t.sizeMax - t.sizeMin);
        if (t.cls === 'particle-line') {
          p.style.width = size + 'px';
          p.style.height = '1px';
        } else {
          p.style.width = size + 'px';
          p.style.height = size + 'px';
        }
        p.style.background = t.colors[Math.floor(Math.random() * t.colors.length)];
        p.style.left = Math.random() * 100 + '%';
        p.style.top = Math.random() * 100 + '%';
        p.style.animationDelay = (Math.random() * 6) + 's';
        p.style.animationDuration = (6 + Math.random() * 8) + 's';
        p.style.opacity = (0.1 + Math.random() * 0.3).toFixed(2);
        c.appendChild(p);
      }
    })();
  `;
}

// ============================================================
// DYNAMIC VIEWPORT SCALING
// ============================================================

function getScalingScript(): string {
  return `
    (function() {
      var canvas = document.getElementById('video-canvas');
      var frame = document.querySelector('.capture-frame');
      var wrapper = document.querySelector('.page-wrapper');
      var label = document.querySelector('.capture-label');
      var dims = document.querySelector('.capture-dimensions');
      var controls = document.getElementById('controls');
      var W = 1080, H = 1920;

      function isMobile() {
        return window.innerWidth < 768;
      }

      function scaleToFit() {
        if (isMobile()) {
          // MOBILE: Fill entire viewport for easy screen recording
          document.body.style.overflow = 'hidden';
          wrapper.style.padding = '0';
          frame.style.border = 'none';
          frame.style.borderRadius = '0';
          if (label) label.style.display = 'none';
          if (dims) dims.style.display = 'none';
          if (controls) controls.style.display = 'none';

          var vw = window.innerWidth;
          var vh = window.innerHeight;
          // Scale to fit within viewport (no content cropping)
          // Black bars blend with phone bezels since clip bg is black
          var s = Math.min(vw / W, vh / H);
          var scaledW = Math.round(W * s);
          var scaledH = Math.round(H * s);
          // Center the canvas in the viewport
          var offsetX = Math.round((vw - scaledW) / 2);
          var offsetY = Math.round((vh - scaledH) / 2);
          canvas.style.transformOrigin = 'top left';
          canvas.style.transform = 'translate(' + offsetX + 'px, ' + offsetY + 'px) scale(' + s + ')';
          frame.style.width = vw + 'px';
          frame.style.height = vh + 'px';
          frame.style.overflow = 'hidden';
        } else {
          // DESKTOP: Original behavior with capture guides
          document.body.style.overflow = '';
          wrapper.style.padding = '20px';
          frame.style.border = '2px dashed rgba(255, 50, 50, 0.4)';
          frame.style.borderRadius = '8px';
          frame.style.overflow = 'hidden';
          if (label) label.style.display = '';
          if (dims) dims.style.display = '';
          if (controls) controls.style.display = '';

          var vw = window.innerWidth - 40;
          var vh = window.innerHeight - 120;
          var s = Math.min(vw / W, vh / H, 1);
          canvas.style.transform = 'scale(' + s + ')';
          canvas.style.transformOrigin = 'top left';
          frame.style.width = Math.round(W * s) + 'px';
          frame.style.height = Math.round(H * s) + 'px';
        }
      }
      scaleToFit();
      window.addEventListener('resize', scaleToFit);
    })();
  `;
}

// ============================================================
// HTML ESCAPE UTILITY
// ============================================================

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============================================================
// CALCULATE ESTIMATED DURATION
// ============================================================

export function estimateDuration(scenes: SceneData[]): number {
  let ms = 0;
  for (const scene of scenes) {
    switch (scene.type) {
      case "montage":
        ms += ((scene.montageItems?.length || 3) * 1100) + 500;
        break;
      case "hook":
        ms += 3500;
        break;
      case "brand":
        ms += 3200;
        break;
      case "features":
        ms += 2000 + (scene.features?.length || 0) * 520;
        break;
      case "demo":
        ms += 2000 + (scene.demoSteps?.length || 0) * 800;
        break;
      case "transformation":
        ms += 4500;
        break;
      case "stats":
        ms += 2500 + (scene.stats?.length || 0) * 300;
        break;
      case "comparison":
        ms +=
          2500 +
          ((scene.problems?.length || 0) + (scene.solutions?.length || 0)) *
            150;
        break;
      case "cta":
        ms += 4500;
        break;
      case "narrative":
        ms += 4200;
        break;
      case "quote":
        ms += 4000;
        break;
      case "chapter":
        ms += 3600;
        break;
      case "reveal":
        ms += 4200;
        break;
      case "tip":
        ms += 4200;
        break;
      case "listicle":
        ms += 2200 + ((scene.items?.length || scene.features?.length || 0) * 700);
        break;
    }
    ms += 600; // transition time
  }
  return Math.round(ms / 1000);
}

// ============================================================
// MAIN GENERATOR
// ============================================================

export function generateClipHTML(config: ClipConfig): string {
  const { scenes, colors } = config;
  const theme: ClipTheme = config.theme || "classic";

  const sceneHtmlParts = scenes.map((scene, i) =>
    SCENE_RENDERERS[scene.type](scene, i, colors, theme)
  );

  // Cinematic-only HTML elements
  const cinematicHtml = theme === "cinematic"
    ? `
          <div class="glow-orb glow-orb-4" id="glow-orb-4"></div>
          <div class="letterbox-top" id="letterbox-top"></div>
          <div class="letterbox-bottom" id="letterbox-bottom"></div>`
    : "";

  // Voiceover is handled externally via Convex file storage + frontend player

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <title>${escapeHtml(config.title)}</title>
  <style>
    ${getCoreCSS(colors, theme)}
  </style>
</head>
<body>
  <div class="page-wrapper">
    <div class="capture-label">CAPTURE THIS AREA</div>
    <div class="capture-frame">
      <div id="video-canvas">
        <div id="viewport">
          <div class="bg-gradient"></div>
          <div class="grid-overlay"></div>
          <div class="grain-overlay"></div>
          <div class="glow-orb glow-orb-1"></div>
          <div class="glow-orb glow-orb-2"></div>
          <div class="glow-orb glow-orb-3"></div>${cinematicHtml}
          <div id="particles"></div>
          ${sceneHtmlParts.join("\n")}
        </div>
      </div>
      <div class="capture-dimensions">1080 x 1920 px</div>
    </div>
    <div id="controls">
      <button onclick="playVideo()">Play</button>
      <button onclick="location.reload()">Restart</button>
    </div>
  </div>

  <script>
    ${getScalingScript()}
    ${getParticlesScript(theme, colors)}
    ${getAnimationTimeline(scenes, theme)}
  </script>
</body>
</html>`;
}
