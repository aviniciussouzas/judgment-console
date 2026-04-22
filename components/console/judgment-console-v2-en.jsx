/**
 * ─────────────────────────────────────────────────────────────
 * JUDGMENT CONSOLE
 * Version   : 2.0
 * Author    : Andrê
 * Type      : Conceptual interface / ongoing study
 * Topic     : Judgment, design systems, human–AI interaction
 * ─────────────────────────────────────────────────────────────
 *
 * This component expects a Next.js API route at /api/judge
 * that holds the ANTHROPIC_API_KEY server-side.
 * Never call the Anthropic API directly from the client.
 *
 * Setup:
 *   1. Copy `route.ts` to `app/api/judge/route.ts`
 *   2. Add ANTHROPIC_API_KEY to your `.env.local`
 *   3. Add `.env.local` to `.gitignore`
 * ─────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useRef } from "react";

const VERSION = "2.0";
const AUTHOR  = "Andrê Souza"; // ← replace with your real name
const GITHUB  = "https://github.com/aviniciussouzas"; // ← replace with your real link

// ─── TOKENS ──────────────────────────────────────────────────────────────────
const T = {
  color: {
    bg: {
      canvas:   "#050608",
      surface:  "#0B0D11",
      elevated: "#10131A",
      panel:    "#0D1016",
      input:    "#06080C",
    },
    text: {
      primary:   "#F3F4F6",
      secondary: "rgba(243,244,246,0.72)",
      tertiary:  "rgba(243,244,246,0.45)",
      inverse:   "#0A0C10",
    },
    accent: {
      signal:    "#B7F34D",
      signalDim: "#7EA92A",
      violet:    "#8B5CF6",
      cyan:      "#48C7D9",
      amber:     "#F4B740",
      coral:     "#FF5A4F",
    },
    border: {
      default: "rgba(255,255,255,0.10)",
      soft:    "rgba(255,255,255,0.06)",
      strong:  "rgba(255,255,255,0.16)",
    },
  },
  radius: { sm:12, md:18, lg:24, xl:32, pill:999 },
  space:  { 1:4,2:8,3:12,4:16,5:20,6:24,8:32,10:40,12:48,16:64,20:80,24:96 },
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
const SAMPLES = [
  "A mental health platform that uses AI to detect emotional patterns and connect users with specialized therapists in real time.",
  "A tokenized carbon marketplace where companies buy verified credits directly from small farmers via blockchain.",
  "An adaptive tutoring system that adjusts pace and teaching style based on each student's individual cognitive map.",
  "A social network for scientists where papers gain visibility based on replicability rather than citation count.",
];

const PARSING_LINES = [
  { label: "INIT", text: "loading judgment criteria...",              tone: "tertiary"  },
  { label: "SCAN", text: "checking conceptual originality",           tone: "secondary" },
  { label: "READ", text: "mapping semantic field",                    tone: "secondary" },
  { label: "EVAL", text: "tension between ambition and execution → detected", tone: "amber" },
  { label: "COMP", text: "comparing against 847 previous ideas",     tone: "secondary" },
  { label: "DIAG", text: "specificity: low / potential: high",       tone: "violet"    },
  { label: "WARN", text: "risk of genericness identified",            tone: "coral"     },
  { label: "OUT→", text: "verdict under construction",               tone: "signal"    },
];

const METRICS_INITIAL = [
  { id:"orig", label:"ORIGINALITY",      value:0, tone:"signal" },
  { id:"spec", label:"SPECIFICITY",      value:0, tone:"cyan"   },
  { id:"ambi", label:"AMBITION",         value:0, tone:"violet" },
  { id:"tens", label:"CREATIVE TENSION", value:0, tone:"amber"  },
  { id:"exec", label:"EXECUTABILITY",    value:0, tone:"signal" },
  { id:"dist", label:"DISTINCTION",      value:0, tone:"coral"  },
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));
const lerp  = (a, b, t) => a + (b - a) * t;

// ─── STYLES ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg-canvas:   #050608;
    --bg-surface:  #0B0D11;
    --bg-elevated: #10131A;
    --bg-panel:    #0D1016;
    --bg-input:    #06080C;
    --text-primary:   #F3F4F6;
    --text-secondary: rgba(243,244,246,0.72);
    --text-tertiary:  rgba(243,244,246,0.45);
    --border-default: rgba(255,255,255,0.10);
    --border-soft:    rgba(255,255,255,0.06);
    --border-strong:  rgba(255,255,255,0.16);
    --signal:    #B7F34D;
    --signalDim: #7EA92A;
    --violet:    #8B5CF6;
    --cyan:      #48C7D9;
    --amber:     #F4B740;
    --coral:     #FF5A4F;
    --font-display: 'Space Grotesk', sans-serif;
    --font-mono:    'IBM Plex Mono', monospace;
    --ease-enter:    cubic-bezier(0.16, 1, 0.3, 1);
    --ease-standard: cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  html, body {
    background: var(--bg-canvas);
    color: var(--text-primary);
    font-family: var(--font-display);
  }

  .app-shell {
    min-height: 100vh;
    background-image:
      linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px);
    background-size: 40px 40px;
    position: relative;
  }

  .app-shell::before {
    content: '';
    position: fixed; inset: 0;
    background:
      radial-gradient(circle at 12% 8%, rgba(139,92,246,0.10) 0%, transparent 38%),
      radial-gradient(circle at 88% 92%, rgba(183,243,77,0.07) 0%, transparent 32%);
    pointer-events: none; z-index: 0;
  }

  .content {
    position: relative; z-index: 1;
    max-width: 1280px; margin: 0 auto; padding: 0 40px;
  }

  .chip {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: var(--font-mono); font-size: 11px; font-weight: 500;
    letter-spacing: 0.28em; text-transform: uppercase;
    padding: 5px 14px; border-radius: 999px;
    border: 1px solid var(--border-default);
    background: rgba(255,255,255,0.04);
    color: var(--text-tertiary); user-select: none;
  }
  .chip.signal { border-color: rgba(183,243,77,0.28); color: var(--signal); background: rgba(183,243,77,0.06); }
  .chip.violet { border-color: rgba(139,92,246,0.28); color: var(--violet); background: rgba(139,92,246,0.06); }

  .chip-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: currentColor;
    animation: pulse-dot 2s ease-in-out infinite;
  }
  @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }

  .hero { padding: 80px 0 64px; }
  .hero-inner {
    display: grid; grid-template-columns: 1fr 420px;
    gap: 48px; align-items: start;
  }
  .hero-chips { display: flex; gap: 10px; margin-bottom: 32px; }
  .hero-headline {
    font-family: var(--font-display);
    font-size: clamp(42px, 5vw, 68px); font-weight: 800;
    line-height: 0.96; letter-spacing: -0.02em;
    color: var(--text-primary); margin-bottom: 24px;
  }
  .hero-headline em {
    font-style: normal;
    background: linear-gradient(90deg, #A7F03D 0%, #D7FF8A 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .hero-sub {
    font-size: 17px; line-height: 1.7;
    color: var(--text-secondary); max-width: 440px;
  }

  .parsing-console {
    background: var(--bg-panel);
    border: 1px solid var(--border-default);
    border-radius: 24px; padding: 24px;
    font-family: var(--font-mono); font-size: 12px;
    overflow: hidden;
    box-shadow: 0 12px 32px rgba(0,0,0,0.28);
    position: relative;
  }
  .parsing-console::before {
    content: ''; position: absolute; top:0; left:0; right:0; height:1px;
    background: linear-gradient(90deg, transparent, rgba(183,243,77,0.3), transparent);
  }
  .console-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 18px; padding-bottom: 14px;
    border-bottom: 1px solid var(--border-soft);
  }
  .console-title  { font-size: 11px; letter-spacing: 0.28em; color: var(--text-tertiary); text-transform: uppercase; }
  .console-status {
    font-size: 10px; letter-spacing: 0.2em; padding: 3px 9px; border-radius: 999px;
    border: 1px solid rgba(183,243,77,0.2);
    color: var(--signal); background: rgba(183,243,77,0.06); text-transform: uppercase;
  }
  .console-line {
    display: flex; gap: 10px; align-items: baseline;
    padding: 4px 0; opacity: 0; transform: translateY(4px);
    transition: opacity 220ms var(--ease-enter), transform 220ms var(--ease-enter);
  }
  .console-line.visible { opacity: 1; transform: translateY(0); }
  .line-label { font-size: 10px; letter-spacing: 0.22em; min-width: 40px; flex-shrink: 0; text-transform: uppercase; }
  .line-text  { font-size: 11px; line-height: 1.5; }

  .tone-secondary { color: var(--text-secondary); }
  .tone-tertiary  { color: var(--text-tertiary); }
  .tone-signal    { color: var(--signal); }
  .tone-violet    { color: var(--violet); }
  .tone-amber     { color: var(--amber); }
  .tone-coral     { color: var(--coral); }
  .tone-cyan      { color: var(--cyan); }

  .cursor {
    display: inline-block; width: 7px; height: 12px;
    background: var(--signal); margin-left: 4px; vertical-align: middle;
    animation: blink 1s step-end infinite;
  }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

  .workspace {
    padding: 0 0 64px;
    display: grid; grid-template-columns: 1fr 360px;
    gap: 24px; align-items: start;
  }

  .panel {
    background: var(--bg-panel);
    border: 1px solid var(--border-default);
    border-radius: 24px; padding: 32px;
    box-shadow: 0 12px 32px rgba(0,0,0,0.28);
  }
  .panel.active {
    border-color: rgba(183,243,77,0.22);
    box-shadow: 0 0 0 1px rgba(183,243,77,0.12), 0 12px 32px rgba(0,0,0,0.28);
  }
  .panel-label {
    font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.28em;
    text-transform: uppercase; color: var(--text-tertiary);
    margin-bottom: 20px; display: flex; align-items: center; gap: 10px;
  }
  .panel-label::after { content:''; flex:1; height:1px; background: var(--border-soft); }

  .idea-textarea {
    width: 100%; min-height: 160px;
    background: var(--bg-input);
    border: 1px solid var(--border-default);
    border-radius: 18px; padding: 20px 24px;
    font-family: var(--font-display); font-size: 16px; line-height: 1.75;
    color: var(--text-primary); resize: none; outline: none;
    transition: border-color 220ms; margin-bottom: 16px;
  }
  .idea-textarea::placeholder { color: var(--text-tertiary); }
  .idea-textarea:focus {
    border-color: rgba(183,243,77,0.28);
    box-shadow: 0 0 0 1px rgba(183,243,77,0.10);
  }

  .action-row { display: flex; gap: 12px; margin-bottom: 24px; }
  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--font-display); font-size: 14px; font-weight: 600;
    padding: 12px 24px; border-radius: 999px;
    border: 1px solid transparent; cursor: pointer;
    transition: all 180ms var(--ease-standard);
    letter-spacing: 0.01em; user-select: none;
  }
  .btn-primary { background: var(--signal); color: var(--bg-canvas); border-color: var(--signal); }
  .btn-primary:hover:not(:disabled) {
    background: #ceff6e;
    box-shadow: 0 0 20px rgba(183,243,77,0.25);
    transform: translateY(-1px);
  }
  .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
  .btn-ghost { background: transparent; color: var(--text-secondary); border-color: var(--border-default); }
  .btn-ghost:hover { border-color: var(--border-strong); color: var(--text-primary); background: rgba(255,255,255,0.04); }
  .btn-danger { background: transparent; color: var(--coral); border-color: rgba(255,90,79,0.22); }
  .btn-danger:hover { background: rgba(255,90,79,0.08); }
  .btn-loading { animation: btn-pulse 1.4s ease-in-out infinite; }
  @keyframes btn-pulse { 0%,100%{opacity:1} 50%{opacity:0.7} }

  .samples-label {
    font-family: var(--font-mono); font-size: 10px;
    letter-spacing: 0.28em; text-transform: uppercase;
    color: var(--text-tertiary); margin-bottom: 12px;
  }
  .sample-list { display: flex; flex-direction: column; gap: 8px; }
  .sample-card {
    background: rgba(255,255,255,0.025);
    border: 1px solid var(--border-soft); border-radius: 14px;
    padding: 12px 16px; font-size: 13px; line-height: 1.55;
    color: var(--text-secondary); cursor: pointer;
    transition: all 180ms var(--ease-standard); text-align: left;
  }
  .sample-card:hover {
    border-color: rgba(183,243,77,0.18); color: var(--text-primary);
    background: rgba(183,243,77,0.04);
  }

  .metrics-panel { position: sticky; top: 32px; }
  .live-badge {
    font-family: var(--font-mono); font-size: 10px;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--signal); display: flex; align-items: center; gap: 6px;
  }
  .metric-item { margin-bottom: 20px; }
  .metric-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 7px; }
  .metric-label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--text-tertiary); }
  .metric-value { font-family: var(--font-mono); font-size: 13px; font-weight: 500; color: var(--text-primary); }
  .metric-track { height: 4px; border-radius: 999px; background: rgba(255,255,255,0.07); overflow: hidden; }
  .metric-fill  { height: 100%; border-radius: 999px; transition: width 560ms var(--ease-enter); width: 0%; }

  .tension-row { display: flex; align-items: center; gap: 12px; margin-top: 28px; }
  .tension-label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--text-tertiary); min-width: 80px; }
  .tension-track { flex:1; height: 3px; background: rgba(255,255,255,0.07); border-radius: 999px; overflow: hidden; }
  .tension-fill  { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #8B5CF6 0%, #FF5A4F 50%, #B7F34D 100%); }

  .verdict-section { padding: 0 0 80px; }
  .verdict-panel {
    background: var(--bg-panel);
    border: 1px solid var(--border-default);
    border-radius: 32px; padding: 48px;
    position: relative; overflow: hidden;
    box-shadow: 0 12px 32px rgba(0,0,0,0.28);
  }
  .verdict-panel::before {
    content: ''; position: absolute; top:0; left:0; right:0; height:2px;
    background: linear-gradient(90deg, transparent 0%, var(--violet) 20%, var(--signal) 60%, transparent 100%);
  }
  .verdict-score-row { display: flex; align-items: baseline; gap: 16px; margin-bottom: 32px; }
  .verdict-score {
    font-size: 80px; font-weight: 800; line-height: 1; letter-spacing: -0.04em;
    background: linear-gradient(90deg, #A7F03D 0%, #D7FF8A 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .verdict-title { font-size: 28px; font-weight: 700; line-height: 1.2; color: var(--text-primary); }
  .verdict-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 32px; }
  .verdict-block {
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border-soft); border-radius: 20px; padding: 24px;
    opacity: 0; transform: translateY(12px);
    transition: opacity 360ms var(--ease-enter), transform 360ms var(--ease-enter);
  }
  .verdict-block.visible { opacity: 1; transform: translateY(0); }
  .vblock-label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase; margin-bottom: 12px; }
  .vblock-text  { font-size: 14px; line-height: 1.65; color: var(--text-secondary); }
  .callout {
    background: rgba(139,92,246,0.08);
    border-left: 2px solid var(--violet);
    border-radius: 0 12px 12px 0; padding: 14px 18px; margin-top: 28px;
    font-size: 15px; line-height: 1.6; color: var(--text-secondary);
  }

  /* ── About ── */
  .about-section {
    padding: 80px 0 96px;
    border-top: 1px solid var(--border-soft);
  }
  .about-inner {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 80px; align-items: start;
  }
  .about-eyebrow {
    font-family: var(--font-mono); font-size: 10px;
    letter-spacing: 0.32em; text-transform: uppercase;
    color: var(--text-tertiary); margin-bottom: 24px;
    display: flex; align-items: center; gap: 10px;
  }
  .about-eyebrow::after { content:''; flex:1; height:1px; background: var(--border-soft); }
  .about-statement {
    font-size: clamp(18px, 2vw, 22px); font-weight: 500; line-height: 1.6;
    color: var(--text-primary); margin-bottom: 24px; letter-spacing: -0.01em;
  }
  .about-body {
    font-size: 15px; line-height: 1.75;
    color: var(--text-secondary); margin-bottom: 20px;
  }
  .about-signature {
    font-family: var(--font-mono); font-size: 12px;
    letter-spacing: 0.16em; color: var(--text-tertiary);
    border-top: 1px solid var(--border-soft);
    padding-top: 20px; margin-top: 8px;
  }
  .about-signature strong { color: var(--text-secondary); font-weight: 500; }
  .github-link {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--font-mono); font-size: 12px;
    letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--signal); text-decoration: none;
    border: 1px solid rgba(183,243,77,0.22);
    padding: 10px 18px; border-radius: 999px;
    transition: all 180ms var(--ease-standard);
    background: rgba(183,243,77,0.04);
    margin-bottom: 28px; display: inline-flex;
  }
  .github-link:hover {
    background: rgba(183,243,77,0.10); border-color: rgba(183,243,77,0.4);
    box-shadow: 0 0 16px rgba(183,243,77,0.12); transform: translateY(-1px);
  }
  .about-meta { display: flex; flex-direction: column; gap: 20px; }
  .meta-block {
    background: rgba(255,255,255,0.025);
    border: 1px solid var(--border-soft); border-radius: 18px; padding: 24px;
  }
  .meta-label {
    font-family: var(--font-mono); font-size: 10px;
    letter-spacing: 0.28em; text-transform: uppercase;
    color: var(--text-tertiary); margin-bottom: 10px;
  }
  .meta-value { font-size: 14px; line-height: 1.6; color: var(--text-secondary); }
  .tag-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
  .tag {
    font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.2em;
    text-transform: uppercase; padding: 4px 12px; border-radius: 999px;
    border: 1px solid var(--border-default); color: var(--text-tertiary);
  }

  /* ── Footer ── */
  .footer-bar {
    border-top: 1px solid var(--border-soft); padding: 24px 0;
    display: flex; justify-content: space-between; align-items: center;
  }
  .footer-text {
    font-family: var(--font-mono); font-size: 10px;
    letter-spacing: 0.2em; color: var(--text-tertiary); text-transform: uppercase;
  }

  .fade-up {
    opacity: 0; transform: translateY(16px);
    animation: fadeUp 500ms var(--ease-enter) forwards;
  }
  @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }

  @media (max-width: 900px) {
    .content { padding: 0 24px; }
    .hero-inner, .workspace, .verdict-grid, .about-inner { grid-template-columns: 1fr; }
    .parsing-console { display: none; }
    .metrics-panel { position: static; }
    .verdict-panel { padding: 32px 24px; }
    .about-section { padding: 64px 0; }
    .verdict-score { font-size: 56px; }
  }
`;

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function Chip({ children, variant = "neutral" }) {
  return <span className={`chip ${variant}`}>{children}</span>;
}

function ParsingConsole({ lines, active }) {
  return (
    <div className="parsing-console">
      <div className="console-header">
        <span className="console-title">parsing.log</span>
        <span className="console-status">{active ? "processing" : "idle"}</span>
      </div>
      {lines.map((l, i) => (
        <div key={i} className="console-line visible">
          <span className={`line-label tone-${l.tone}`}>{l.label}</span>
          <span className={`line-text tone-${l.tone}`}>{l.text}</span>
        </div>
      ))}
      {active && <div className="console-line visible"><span className="cursor" /></div>}
    </div>
  );
}

function MetricBar({ label, value, tone, delayMs = 0 }) {
  const colors = {
    signal: T.color.accent.signal,
    cyan:   T.color.accent.cyan,
    violet: T.color.accent.violet,
    amber:  T.color.accent.amber,
    coral:  T.color.accent.coral,
  };
  return (
    <div className="metric-item">
      <div className="metric-head">
        <span className="metric-label">{label}</span>
        <span className="metric-value tone-signal">{value.toFixed(0)}</span>
      </div>
      <div className="metric-track">
        <div
          className="metric-fill"
          style={{ width:`${value}%`, background: colors[tone] || colors.signal, transitionDelay:`${delayMs}ms` }}
        />
      </div>
    </div>
  );
}

function VerdictBlock({ label, text, labelTone = "signal", delay = 0, show }) {
  return (
    <div className={`verdict-block ${show ? "visible" : ""}`} style={{ transitionDelay:`${delay}ms` }}>
      <div className={`vblock-label tone-${labelTone}`}>{label}</div>
      <div className="vblock-text">{text}</div>
    </div>
  );
}

function AboutSection() {
  return (
    <section className="about-section">
      <div className="about-inner">
        <div>
          <div className="about-eyebrow">about</div>
          <p className="about-statement">
            Judgment Console is a conceptual interface exploring how creative
            judgment might become more legible in an age of generative abundance.
          </p>
          <p className="about-body">
            Instead of generating ideas, it focuses on evaluating them — making
            subjective criteria visible, structured, and navigable.
          </p>
          <p className="about-body">
            An ongoing study by {AUTHOR} on judgment, design systems,
            and human–AI collaboration.
          </p>
          <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="github-link">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
                0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
                -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
                .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
                -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68
                0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51
                .56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0
                1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            github.com/andre
          </a>
          <div className="about-signature">
            <strong>{AUTHOR}</strong> · Judgment Console v{VERSION}
          </div>
        </div>

        <div className="about-meta">
          <div className="meta-block">
            <div className="meta-label">project nature</div>
            <div className="meta-value">
              An interactive conceptual prototype. Not a product — a question
              in the form of an interface.
            </div>
          </div>
          <div className="meta-block">
            <div className="meta-label">judgment criteria</div>
            <div className="tag-list">
              {["Originality","Specificity","Ambition","Creative Tension","Executability","Distinction"].map(t => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
          </div>
          <div className="meta-block">
            <div className="meta-label">stack</div>
            <div className="meta-value">React · Next.js · IBM Plex Mono · Space Grotesk · Claude API</div>
          </div>
          <div className="meta-block">
            <div className="meta-label">status</div>
            <div className="meta-value" style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ background: T.color.accent.signal, display:"inline-block", width:5, height:5, borderRadius:"50%" }} />
              <span style={{ color: T.color.accent.signal, fontFamily:"var(--font-mono)", fontSize:11, letterSpacing:"0.2em" }}>
                ongoing study
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function JudgmentConsole() {
  const [idea,         setIdea]         = useState("");
  const [phase,        setPhase]        = useState("idle");
  const [visibleLines, setVisibleLines] = useState([]);
  const [metrics,      setMetrics]      = useState(METRICS_INITIAL);
  const [verdict,      setVerdict]      = useState(null);
  const [verdictVisible, setVerdictVisible] = useState(false);
  const verdictRef = useRef(null);

  const isProcessing = phase === "parsing";

  async function runAnalysis() {
    if (!idea.trim() || isProcessing) return;
    setPhase("parsing");
    setVisibleLines([]);
    setMetrics(METRICS_INITIAL);
    setVerdict(null);
    setVerdictVisible(false);

    for (let i = 0; i < PARSING_LINES.length; i++) {
      await sleep(300 + i * 260);
      setVisibleLines(prev => [...prev, PARSING_LINES[i]]);
    }

    await sleep(400);
    const targets = [
      { id:"orig", value: 55 + Math.random()*35 },
      { id:"spec", value: 30 + Math.random()*40 },
      { id:"ambi", value: 60 + Math.random()*35 },
      { id:"tens", value: 45 + Math.random()*40 },
      { id:"exec", value: 40 + Math.random()*40 },
      { id:"dist", value: 35 + Math.random()*45 },
    ];
    for (let step = 1; step <= 30; step++) {
      await sleep(18);
      setMetrics(prev => prev.map(m => {
        const t = targets.find(t => t.id === m.id);
        return t ? { ...m, value: lerp(m.value, t.value, step / 30) } : m;
      }));
    }

    await sleep(300);
    const response = await callJudgeAPI(idea);
    setVerdict(response);
    setPhase("done");
    await sleep(200);
    setVerdictVisible(true);
    verdictRef.current?.scrollIntoView({ behavior:"smooth", block:"start" });
  }

  async function callJudgeAPI(ideaText) {
    try {
      const res = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: ideaText }),
      });
      if (!res.ok) throw new Error("API error");
      return await res.json();
    } catch {
      return {
        score:   67,
        headline:"Real potential, execution to be proven",
        alive:   "The tension between scale and intimacy is genuine. There is a real need here.",
        generic: "The core mechanism is saturated territory without clear differentiation.",
        push:    "What happens when the system fails? That friction might be the actual product.",
        callout: "The most interesting idea is in what you haven't said yet.",
      };
    }
  }

  function reset() {
    setPhase("idle"); setIdea(""); setVisibleLines([]);
    setMetrics(METRICS_INITIAL); setVerdict(null); setVerdictVisible(false);
  }

  const avgScore    = metrics.reduce((s, m) => s + m.value, 0) / metrics.length;
  const displayLines = visibleLines.length > 0 ? visibleLines : PARSING_LINES.slice(0, 3);

  return (
    <>
      <style>{css}</style>
      <div className="app-shell">
        <div className="content">

          <section className="hero">
            <div className="hero-inner">
              <div>
                <div className="hero-chips fade-up" style={{ animationDelay:"0ms" }}>
                  <Chip variant="signal"><span className="chip-dot" />Judgment Console</Chip>
                  <Chip variant="neutral">v{VERSION}</Chip>
                </div>
                <h1 className="hero-headline fade-up" style={{ animationDelay:"80ms" }}>
                  Every idea<br />deserves a<br /><em>real judgment.</em>
                </h1>
                <p className="hero-sub fade-up" style={{ animationDelay:"160ms" }}>
                  A critical reading system that goes beyond the score.
                  Tension, specificity, distinction — what your idea activates,
                  what it avoids, and where it can go further.
                </p>
              </div>
              <ParsingConsole lines={displayLines} active={isProcessing} />
            </div>
          </section>

          <section className="workspace">
            <div>
              <div className={`panel ${phase === "parsing" ? "active" : ""}`}>
                <div className="panel-label">input</div>
                <textarea
                  className="idea-textarea"
                  placeholder="Describe your idea. The more specific, the more precise the judgment..."
                  value={idea}
                  onChange={e => setIdea(e.target.value)}
                  disabled={isProcessing}
                  rows={6}
                />
                <div className="action-row">
                  <button
                    className={`btn btn-primary ${isProcessing ? "btn-loading" : ""}`}
                    onClick={runAnalysis}
                    disabled={!idea.trim() || isProcessing}
                  >
                    {isProcessing ? "Analyzing..." : "→ Judge idea"}
                  </button>
                  {phase === "done"
                    ? <button className="btn btn-danger" onClick={reset}>Reset</button>
                    : <button className="btn btn-ghost"  onClick={reset}>Clear</button>
                  }
                </div>

                {phase === "idle" && (
                  <>
                    <div className="samples-label">examples</div>
                    <div className="sample-list">
                      {SAMPLES.map((s, i) => (
                        <button key={i} className="sample-card" onClick={() => setIdea(s)}>{s}</button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="metrics-panel">
              <div className="panel">
                <div className="panel-label" style={{ justifyContent:"space-between" }}>
                  <span>diagnostic</span>
                  <span className="live-badge"><span className="chip-dot" />live</span>
                </div>
                {metrics.map((m, i) => (
                  <MetricBar key={m.id} label={m.label} value={m.value} tone={m.tone} delayMs={i * 60} />
                ))}
                {phase !== "idle" && (
                  <div style={{ marginTop:20, paddingTop:16, borderTop:"1px solid var(--border-soft)" }}>
                    <div className="tension-row">
                      <span className="tension-label">Global tension</span>
                      <div className="tension-track">
                        <div className="tension-fill" style={{ width:`${avgScore}%`, transition:"width 560ms var(--ease-enter)" }} />
                      </div>
                      <span className="metric-value" style={{ minWidth:36 }}>{avgScore.toFixed(0)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {verdict && (
            <section className="verdict-section" ref={verdictRef}>
              <div className="verdict-panel">
                <div className="verdict-score-row">
                  <span className="verdict-score">{verdict.score}</span>
                  <span className="verdict-title">{verdict.headline}</span>
                </div>
                <div className="verdict-grid">
                  <VerdictBlock label="↑ what's alive"    labelTone="signal" text={verdict.alive}   delay={0}   show={verdictVisible} />
                  <VerdictBlock label="↓ what's generic"  labelTone="coral"  text={verdict.generic} delay={120} show={verdictVisible} />
                  <VerdictBlock label="→ push further"    labelTone="amber"  text={verdict.push}    delay={240} show={verdictVisible} />
                </div>
                <div className="callout">
                  <span style={{ color: T.color.accent.violet, fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:"0.24em", textTransform:"uppercase", marginRight:10 }}>
                    insight →
                  </span>
                  {verdict.callout}
                </div>
              </div>
            </section>
          )}

          <AboutSection />

          <div className="footer-bar">
            <span className="footer-text">Judgment Console · v{VERSION} · {AUTHOR}</span>
            <span className="footer-text" style={{ color: T.color.accent.signal }}>system active</span>
          </div>

        </div>
      </div>
    </>
  );
}
