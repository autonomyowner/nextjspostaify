// ============================================================
// CLIP TEMPLATE ENGINE
// Generates cinematic motion-graphic HTML clips
// 8 scene types, pro easing curves, particles, glow orbs
// ============================================================

export interface ClipColors {
  primary: string;
  secondary: string;
  accent: string;
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
    | "cta";
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
}

export interface ClipConfig {
  title: string;
  scenes: SceneData[];
  colors: ClipColors;
  brandName?: string;
}

// ============================================================
// CORE CSS: Easing, animations, backgrounds
// ============================================================

function getCoreCSS(colors: ClipColors): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

    :root {
      --primary: ${colors.primary};
      --secondary: ${colors.secondary};
      --accent: ${colors.accent};
      --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
      --ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);
      --ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
      --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
      --spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
      --snappy: cubic-bezier(0.2, 0, 0, 1);
      --bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background: #0a0a0a;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
      font-family: 'Inter', sans-serif;
      overflow-x: hidden;
    }

    .page-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
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
      background: #000;
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
        linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
      background-size: 60px 60px;
      opacity: 0;
      animation: fadeIn 2s var(--ease-out) forwards 0.5s;
      z-index: 2;
    }

    .glow-orb {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      z-index: 3;
    }

    .glow-orb-1 {
      width: 400px;
      height: 400px;
      top: -100px;
      right: -50px;
      background: var(--primary);
      filter: blur(80px);
      opacity: 0.25;
      animation: pulseGlow 4s ease-in-out infinite;
    }

    .glow-orb-2 {
      width: 300px;
      height: 300px;
      bottom: 200px;
      left: -80px;
      background: var(--accent);
      filter: blur(90px);
      opacity: 0.2;
      animation: pulseGlow 5s ease-in-out infinite reverse;
    }

    .glow-orb-3 {
      width: 250px;
      height: 250px;
      bottom: -50px;
      right: -30px;
      background: var(--secondary);
      filter: blur(80px);
      opacity: 0.2;
      animation: pulseGlow 6s ease-in-out infinite 1s;
    }

    #particles {
      position: absolute;
      inset: 0;
      z-index: 4;
      pointer-events: none;
    }

    .particle {
      position: absolute;
      width: 3px;
      height: 3px;
      background: rgba(255,255,255,0.3);
      border-radius: 50%;
      animation: floatParticle 8s infinite ease-in-out;
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
  `;
}

// ============================================================
// SCENE HTML GENERATORS
// ============================================================

function hookScene(scene: SceneData, index: number): string {
  return `
    <div class="scene" id="scene-${index}">
      <div class="anim-slam" id="s${index}-headline" style="
        font-size: 72px;
        font-weight: 900;
        color: #fff;
        text-align: center;
        line-height: 1.15;
        letter-spacing: -1px;
        max-width: 900px;
        text-shadow: 0 0 60px ${`var(--primary)`}40;
      ">${escapeHtml(scene.headline || "")}</div>
      ${
        scene.subheadline
          ? `<div class="anim" id="s${index}-sub" style="
        font-size: 36px;
        font-weight: 400;
        color: rgba(255,255,255,0.6);
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

function brandScene(scene: SceneData, index: number, colors: ClipColors): string {
  return `
    <div class="scene" id="scene-${index}">
      <div class="anim-pop" id="s${index}-logo" style="
        width: 120px;
        height: 120px;
        border-radius: 28px;
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 48px;
        font-weight: 900;
        color: #fff;
        margin-bottom: 40px;
        box-shadow: 0 0 60px ${colors.primary}40;
        will-change: transform, opacity;
      ">${(scene.brandName || "B").charAt(0).toUpperCase()}</div>
      <div class="anim" id="s${index}-name" style="
        font-size: 80px;
        font-weight: 900;
        background: linear-gradient(90deg, #fff, var(--primary), var(--secondary), var(--primary));
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: gradientShift 3s linear infinite;
        letter-spacing: -2px;
        text-align: center;
      ">${escapeHtml(scene.brandName || "")}</div>
      ${
        scene.tagline
          ? `<div class="anim" id="s${index}-tagline" style="
        font-size: 32px;
        font-weight: 400;
        color: rgba(255,255,255,0.5);
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
    <div class="anim-pop" id="s${index}-feat-${i}" style="
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 28px 36px;
      background: rgba(255,255,255,0.03);
      border: 2px solid ${colors.primary}20;
      border-radius: 20px;
      width: 100%;
      position: relative;
      overflow: hidden;
      will-change: transform, opacity;
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
        color: #fff;
      ">${i + 1}</div>
      <div style="
        font-size: 28px;
        font-weight: 600;
        color: #fff;
        line-height: 1.3;
      ">${escapeHtml(f)}</div>
      <div class="shine-layer" style="
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 50%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
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
        color: #fff;
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
          color: #fff;
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
        color: rgba(255,255,255,0.85);
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
        color: #fff;
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
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.06);
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
        color: rgba(255,255,255,0.6);
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

function statsScene(scene: SceneData, index: number, colors: ClipColors): string {
  const stats = scene.stats || [];
  const statCards = stats
    .map(
      (s, i) => `
    <div class="anim-pop" id="s${index}-stat-${i}" style="
      flex: 1;
      min-width: 200px;
      padding: 36px 24px;
      background: rgba(255,255,255,0.03);
      border: 2px solid ${colors.primary}18;
      border-radius: 20px;
      text-align: center;
    ">
      <div style="
        font-size: 64px;
        font-weight: 900;
        background: linear-gradient(135deg, var(--primary), var(--accent));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        line-height: 1.1;
        margin-bottom: 12px;
      ">${escapeHtml(s.value)}</div>
      <div style="
        font-size: 22px;
        font-weight: 500;
        color: rgba(255,255,255,0.5);
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
        color: #fff;
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
      <span style="font-size: 24px; color: rgba(255,255,255,0.6); line-height: 1.3;">${escapeHtml(p)}</span>
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
      <span style="font-size: 24px; color: rgba(255,255,255,0.85); font-weight: 500; line-height: 1.3;">${escapeHtml(s)}</span>
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
        color: #fff;
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
        color: #fff;
        text-align: center;
        line-height: 1.15;
        max-width: 800px;
        margin-bottom: 50px;
      ">${escapeHtml(scene.headline || scene.ctaText || "Get Started")}</div>
      ${
        scene.subheadline
          ? `<div class="anim" id="s${index}-sub" style="
        font-size: 30px;
        color: rgba(255,255,255,0.5);
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
        color: #fff;
        cursor: pointer;
        box-shadow: 0 0 40px ${colors.accent}66;
        will-change: transform, opacity;
      ">${escapeHtml(scene.ctaText || "Start Free")}</div>
      ${
        scene.url
          ? `<div class="anim" id="s${index}-url" style="
        margin-top: 30px;
        font-size: 22px;
        color: rgba(255,255,255,0.3);
        letter-spacing: 1px;
      ">${escapeHtml(scene.url)}</div>`
          : ""
      }
    </div>
  `;
}

// ============================================================
// SCENE RENDERER MAP
// ============================================================

const SCENE_RENDERERS: Record<
  SceneData["type"],
  (scene: SceneData, index: number, colors: ClipColors) => string
> = {
  hook: (s, i, c) => hookScene(s, i),
  brand: brandScene,
  features: featuresScene,
  demo: demoScene,
  transformation: transformationScene,
  stats: statsScene,
  comparison: comparisonScene,
  cta: ctaScene,
};

// ============================================================
// JAVASCRIPT ANIMATION TIMELINE
// ============================================================

function getAnimationTimeline(scenes: SceneData[]): string {
  const sceneTimings: string[] = [];

  scenes.forEach((scene, i) => {
    const lines: string[] = [];
    lines.push(`  // Scene ${i + 1}: ${scene.type}`);
    lines.push(`  await switchScene('scene-${i}');`);
    lines.push(`  await wait(200);`);

    switch (scene.type) {
      case "hook":
        lines.push(`  anim('s${i}-headline');`);
        lines.push(`  await wait(600);`);
        if (scene.subheadline) {
          lines.push(`  anim('s${i}-sub');`);
        }
        lines.push(`  await wait(2500);`);
        break;

      case "brand":
        lines.push(`  anim('s${i}-logo');`);
        lines.push(`  await wait(500);`);
        lines.push(`  anim('s${i}-name');`);
        lines.push(`  await wait(400);`);
        if (scene.tagline) {
          lines.push(`  anim('s${i}-tagline');`);
        }
        lines.push(`  await wait(2000);`);
        break;

      case "features": {
        if (scene.headline) {
          lines.push(`  anim('s${i}-title');`);
          lines.push(`  await wait(400);`);
        }
        const feats = scene.features || [];
        feats.forEach((_, fi) => {
          lines.push(`  anim('s${i}-feat-${fi}');`);
          lines.push(`  await wait(120);`);
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
        sts.forEach((_, si) => {
          lines.push(`  anim('s${i}-stat-${si}');`);
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

      case "cta":
        lines.push(`  anim('s${i}-headline');`);
        lines.push(`  await wait(500);`);
        if (scene.subheadline) {
          lines.push(`  anim('s${i}-sub');`);
          lines.push(`  await wait(400);`);
        }
        lines.push(`  anim('s${i}-btn');`);
        lines.push(`  await wait(300);`);
        // Add button glow after pop
        lines.push(
          `  document.getElementById('s${i}-btn').style.animation = 'scalePop 0.8s var(--ease-out-back) forwards, buttonGlow 2s ease-in-out infinite 0.8s';`
        );
        if (scene.url) {
          lines.push(`  anim('s${i}-url');`);
        }
        lines.push(`  await wait(3000);`);
        break;
    }

    sceneTimings.push(lines.join("\n"));
  });

  return `
    function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

    function anim(id) {
      var el = document.getElementById(id);
      if (el) el.classList.add('animate');
    }

    async function switchScene(id) {
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
    }

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

function getParticlesScript(): string {
  return `
    (function() {
      var c = document.getElementById('particles');
      for (var i = 0; i < 20; i++) {
        var p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.top = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 5 + 's';
        p.style.animationDuration = (5 + Math.random() * 5) + 's';
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
      var W = 1080, H = 1920;
      function scaleToFit() {
        var vw = window.innerWidth - 40;
        var vh = window.innerHeight - 120;
        var s = Math.min(vw / W, vh / H, 1);
        canvas.style.transform = 'scale(' + s + ')';
        frame.style.width = Math.round(W * s) + 'px';
        frame.style.height = Math.round(H * s) + 'px';
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

  const sceneHtmlParts = scenes.map((scene, i) =>
    SCENE_RENDERERS[scene.type](scene, i, colors)
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(config.title)}</title>
  <style>
    ${getCoreCSS(colors)}
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
          <div class="glow-orb glow-orb-1"></div>
          <div class="glow-orb glow-orb-2"></div>
          <div class="glow-orb glow-orb-3"></div>
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
    ${getParticlesScript()}
    ${getAnimationTimeline(scenes)}
  </script>
</body>
</html>`;
}
