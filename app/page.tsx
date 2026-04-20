"use client";

import { useEffect, useMemo, useState } from "react";

type SampleKey = "fintech" | "museum" | "creative";
type MetricRow = readonly [string, number];

type Diagnosis = {
  metrics: readonly MetricRow[];
  verdictTitle: string;
  verdictBody: string;
  feelsAlive: string;
  feelsGeneric: string;
  pushFurther: string;
  interpretiveLogs: string[];
};

const samples: Record<SampleKey, string> = {
  fintech: "A fintech for the invisible rhythm of the real economy.",
  museum:
    "A museum interface that reveals how algorithms frame what we see.",
  creative:
    "A creative direction tool that evaluates whether an idea feels alive or just correct.",
};

const diagnoses: Record<SampleKey, Diagnosis> = {
  fintech: {
    metrics: [
      ["Clarity", 82],
      ["Originality", 66],
      ["Symbolic Density", 73],
      ["Generic AI Risk", 38],
      ["Cultural Specificity", 49],
      ["System Potential", 84],
      ["Human Weirdness", 58],
      ["Memorability", 71],
    ],
    verdictTitle: "Promising, but still partially generic.",
    verdictBody:
      "The idea has a strong conceptual frame and clear system potential, but the phrasing still leans on abstraction. It suggests a bigger world than the current wording can fully sustain.",
    feelsAlive:
      "The expression points to something infrastructural, rhythmic and social. It hints at a larger ecosystem instead of a single product feature.",
    feelsGeneric:
      'Terms like "real economy" and "invisible rhythm" are evocative, but still broad. Without one observed image, the language risks sounding more intelligent than embodied.',
    pushFurther:
      "Replace one abstract term with a concrete scene, behavior or cultural trace. Let one specific image carry the concept instead of explaining it from above.",
    interpretiveLogs: [
      "> input received",
      "> reading semantic structure",
      "> checking density of abstraction",
      "> detecting traces of financial-tech cliche",
      "> signal found: systemic framing",
      "> signal found: strong directional potential",
      "> warning: low observed specificity",
      "> recommendation: add one situated image and rerun",
    ],
  },
  museum: {
    metrics: [
      ["Clarity", 78],
      ["Originality", 81],
      ["Symbolic Density", 76],
      ["Generic AI Risk", 24],
      ["Cultural Specificity", 62],
      ["System Potential", 79],
      ["Human Weirdness", 64],
      ["Memorability", 74],
    ],
    verdictTitle: "Strong framing, with room for more friction.",
    verdictBody:
      "This concept already reveals a sharp critical stance. It frames interface as mediation, not neutrality, which gives it depth and relevance.",
    feelsAlive:
      "The idea shifts the museum from archive to active lens. That makes the concept feel contemporary and intellectually alive.",
    feelsGeneric:
      "The phrase still speaks at a relatively high level. It could gain more bite through one sharper example of algorithmic framing in practice.",
    pushFurther:
      "Introduce one concrete scene: ranking, recommendation, omission or distortion. Let the concept show where framing actually happens.",
    interpretiveLogs: [
      "> input received",
      "> scanning institutional tone",
      "> evaluating conceptual sharpness",
      "> signal found: critical framing",
      "> signal found: relevance to interface culture",
      "> warning: medium abstraction level",
      "> recommendation: add one visible algorithmic behavior",
    ],
  },
  creative: {
    metrics: [
      ["Clarity", 86],
      ["Originality", 77],
      ["Symbolic Density", 69],
      ["Generic AI Risk", 19],
      ["Cultural Specificity", 53],
      ["System Potential", 88],
      ["Human Weirdness", 67],
      ["Memorability", 76],
    ],
    verdictTitle: "Clear, contemporary and highly buildable.",
    verdictBody:
      "The proposition is legible and useful right away. It translates a fuzzy creative intuition into a system that could actually help teams evaluate ideas.",
    feelsAlive:
      "The contrast between 'alive' and 'correct' creates a strong interpretive tension. It feels both practical and philosophical.",
    feelsGeneric:
      "The concept could still become more distinctive through a clearer point of view on who is judging and under what pressures.",
    pushFurther:
      "Specify the context: agency, brand team, researcher, art director. That extra layer would make the console feel even more situated and ownable.",
    interpretiveLogs: [
      "> input received",
      "> parsing evaluative contrast",
      "> checking product usefulness",
      "> signal found: strong practical relevance",
      "> signal found: memorable conceptual tension",
      "> warning: context could be more situated",
      "> recommendation: define user and evaluation scenario",
    ],
  },
};

const heroLogs = [
  "> parsing symbolic structure...",
  "> checking cliche density...",
  "> scanning for cultural specificity...",
  "> estimating system potential...",
  "> reading human weirdness...",
];

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function detectDiagnosisKey(input: string): SampleKey {
  const normalized = input.toLowerCase();

  if (
    normalized.includes("museum") ||
    normalized.includes("algorithm") ||
    normalized.includes("frame what we see")
  ) {
    return "museum";
  }

  if (
    normalized.includes("creative direction") ||
    normalized.includes("alive") ||
    normalized.includes("correct")
  ) {
    return "creative";
  }

  return "fintech";
}

function jitterMetrics(metrics: readonly MetricRow[]): readonly MetricRow[] {
  return metrics.map(([label, value]) => {
    const variation = Math.floor(Math.random() * 21) - 10;
    const nextValue = Math.max(8, Math.min(96, value + variation));
    return [label, nextValue] as const;
  });
}

export default function JudgmentConsole() {
  const [inputValue, setInputValue] = useState(samples.fintech);
  const [activeSample, setActiveSample] = useState<SampleKey>("fintech");
  const [diagnosisKey, setDiagnosisKey] = useState<SampleKey>("fintech");

  const [isProcessing, setIsProcessing] = useState(false);
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  const [showCursor, setShowCursor] = useState(true);

  const [displayedMetrics, setDisplayedMetrics] = useState<
    readonly MetricRow[]
  >(diagnoses.fintech.metrics);
  const [metricsStatus, setMetricsStatus] = useState("live sample state");

  const currentDiagnosis = useMemo(() => diagnoses[diagnosisKey], [diagnosisKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isProcessing) {
      setDisplayedMetrics(currentDiagnosis.metrics);
    }
  }, [currentDiagnosis, isProcessing]);

  function handleLoadSample(key: SampleKey) {
    setActiveSample(key);
    setInputValue(samples[key]);
  }

  function handleClear() {
    setInputValue("");
  }

  async function handleRunDiagnosis() {
    if (isProcessing || !inputValue.trim()) return;

    setIsProcessing(true);
    setVisibleLogs([]);

    const selected = detectDiagnosisKey(inputValue);
    const selectedDiagnosis = diagnoses[selected];
    const logs = selectedDiagnosis.interpretiveLogs;

    setMetricsStatus("calibrating interpretive thresholds...");

    const metricInterval = setInterval(() => {
      setDisplayedMetrics(jitterMetrics(selectedDiagnosis.metrics));
    }, 220);

    for (let i = 0; i < logs.length; i++) {
      if (i === Math.floor(logs.length / 3)) {
        setMetricsStatus("reading signal distribution...");
      }

      if (i === Math.floor((logs.length * 2) / 3)) {
        setMetricsStatus("stabilizing diagnostic output...");
      }

      await delay(randomBetween(350, 850));
      setVisibleLogs((prev) => [...prev, logs[i]]);
    }

    clearInterval(metricInterval);

    setDisplayedMetrics(selectedDiagnosis.metrics);
    await delay(350);

    setDiagnosisKey(selected);
    setMetricsStatus("diagnostic locked");
    setIsProcessing(false);
  }

  const displayedLogs = isProcessing
    ? visibleLogs
    : currentDiagnosis.interpretiveLogs;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-lime-300/30 selection:text-lime-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        aria-hidden="true"
      >
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:36px_36px]" />
      </div>

      <main className="relative mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 md:px-8 lg:px-10">
        <p className="text-[10px] uppercase tracking-widest text-zinc-600">
          v0.1.1 — experimental interface
        </p>

        <header className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-zinc-400">
            <span className="rounded-full border border-zinc-700 px-3 py-1">
              Judgment Console
            </span>
            <span className="rounded-full border border-lime-500/30 bg-lime-500/10 px-3 py-1 text-lime-300">
              v0.1.1 interactive prototype
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-3xl font-semibold leading-tight text-zinc-50 md:text-5xl md:leading-[1.05]">
                A small interface for evaluating ideas in the age of infinite
                generation.
              </h1>
              <p className="mt-1 text-xs text-zinc-500">
                A speculative interface for creative evaluation
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4 font-mono text-xs leading-6 text-zinc-400">
              {heroLogs.map((log) => (
                <div key={log}>
                  {log}
                  {log === heroLogs[heroLogs.length - 1] ? (
                    <span>{showCursor ? "_" : " "}</span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                  Input
                </p>
                <h2 className="mt-2 text-xl font-semibold text-zinc-100">
                  Describe an idea, concept or direction...
                </h2>
              </div>

              <div className="hidden rounded-full border border-zinc-700 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400 md:block">
                text diagnosis
              </div>
            </div>

            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="min-h-[280px] w-full rounded-2xl border border-zinc-800 bg-black/40 p-5 font-mono text-sm leading-7 text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-lime-400/40"
              placeholder="Paste an idea, concept, line or prompt..."
            />

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={handleRunDiagnosis}
                disabled={isProcessing || !inputValue.trim()}
                className="rounded-2xl border border-lime-400/40 bg-lime-400/10 px-4 py-2 text-sm font-medium text-lime-200 transition hover:bg-lime-400/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? "processing..." : "Run evaluation"}
              </button>

              <button
                onClick={() => handleLoadSample(activeSample)}
                disabled={isProcessing}
                className="rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100 disabled:opacity-50"
              >
                Load sample
              </button>

              <button
                onClick={handleClear}
                disabled={isProcessing}
                className="rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100 disabled:opacity-50"
              >
                Clear
              </button>
            </div>

            <div className="mt-8">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                Sample prompts
              </p>

              <div className="grid gap-3">
                {(Object.entries(samples) as [SampleKey, string][]).map(
                  ([key, sample]) => (
                    <button
                      key={key}
                      onClick={() => handleLoadSample(key)}
                      disabled={isProcessing}
                      className={`rounded-2xl border px-4 py-4 text-left text-sm leading-6 transition disabled:opacity-50 ${
                        activeSample === key
                          ? "border-lime-400/40 bg-lime-400/10 text-lime-100"
                          : "border-zinc-800 bg-black/20 text-zinc-300 hover:border-zinc-600 hover:bg-black/30"
                      }`}
                    >
                      {sample}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                    Metrics
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-zinc-100">
                    Diagnostic reading
                  </h2>
                </div>

                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                  {metricsStatus}
                  {isProcessing ? (showCursor ? "_" : " ") : null}
                </p>
              </div>

              <div className="space-y-4">
                {displayedMetrics.map(([label, value]) => (
                  <div key={label}>
                    <div className="mb-2 flex items-center justify-between text-sm text-zinc-300">
                      <span>{label}</span>
                      <span className="font-mono text-xs text-zinc-500">
                        {isProcessing ? "--/100" : `${value}/100`}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r from-lime-300 via-zinc-100 to-lime-200 ${
                          isProcessing ? "transition-all duration-200" : "transition-all duration-500"
                        }`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                Verdict
              </p>

              <div className="mt-4 space-y-5 text-sm leading-7 text-zinc-300">
                <div>
                  <h3 className="mb-1 text-base font-semibold text-zinc-100">
                    {currentDiagnosis.verdictTitle}
                  </h3>
                  <p>{currentDiagnosis.verdictBody}</p>
                </div>

                <div>
                  <p className="mb-1 font-medium text-zinc-100">
                    What feels alive
                  </p>
                  <p>{currentDiagnosis.feelsAlive}</p>
                </div>

                <div>
                  <p className="mb-1 font-medium text-zinc-100">
                    What feels generic
                  </p>
                  <p>{currentDiagnosis.feelsGeneric}</p>
                </div>

                <div>
                  <p className="mb-1 font-medium text-zinc-100">
                    Push further
                  </p>
                  <p>{currentDiagnosis.pushFurther}</p>
                </div>
              </div>
            </section>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                Console
              </p>
              <h2 className="mt-2 text-xl font-semibold text-zinc-100">
                Interpretive log
              </h2>
            </div>

            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
              human-in-the-loop
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5 font-mono text-xs leading-7 text-zinc-400 md:text-sm">
            {displayedLogs.map((log, index) => (
              <div
                key={`${log}-${index}`}
                className={log.includes("recommendation") ? "text-lime-300" : undefined}
              >
                {log}
              </div>
            ))}

            {isProcessing && (
              <div className="opacity-60">
                {"> processing"}
                {showCursor ? "_" : " "}
              </div>
            )}
          </div>

          <div id="about" className="mt-12 max-w-xl text-sm text-zinc-400">
            <p>
              Judgment Console is a conceptual interface exploring how creative
              judgment might become more legible in the age of generative
              abundance.
            </p>

            <p className="mt-3">
              Instead of generating ideas, this experiment focuses on evaluating
              them — making subjective criteria slightly more visible,
              structured, and navigable.
            </p>
          </div>

          <div className="mt-16 border-t border-zinc-800 pt-6 text-xs text-zinc-500">
            <p>
              An ongoing study by <span className="text-zinc-300">Andrê</span>
            </p>
            <p className="mt-1">
              On judgment, design systems, and human–AI interaction
            </p>

            <div className="mt-3 flex gap-4">
              <a
                href="https://github.com/aviniciussouzas/judgment-console"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-zinc-300"
              >
                GitHub
              </a>

              <a href="#about" className="underline hover:text-zinc-300">
                About
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}