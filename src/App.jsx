import React, { useState, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LineChart,
  Line,
  Legend,
} from "recharts";

/* ============================================================
   PsiQuantum Secondary — Decision Dashboard
   Interactive scenario model for the Integra Groupe assessment
   ============================================================ */

const fmt = {
  money: (n) => {
    if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    return `$${n.toFixed(0)}`;
  },
  moneyB: (n) => `$${n.toFixed(1)}B`,
  pct: (n, dp = 1) => `${(n * 100).toFixed(dp)}%`,
  multi: (n) => `${n.toFixed(2)}x`,
  num: (n) => n.toLocaleString(),
};

/* ---------- Pure calculations (so we can re-use for sensitivity) ---------- */
function computeOutcomes({ investment, discount, lastRoundVal, dilutionFactor, scenarios, entryYear }) {
  const entryVal = lastRoundVal * (1 - discount);
  const startOwn = investment / entryVal;
  const exitOwn = startOwn * dilutionFactor;
  const rows = Object.entries(scenarios).map(([name, s]) => {
    const proceeds = exitOwn * s.exitValuationB * 1e9;
    const multiple = proceeds / investment;
    const years = Math.max(s.exitYear - entryYear, 1);
    const irr = Math.pow(proceeds / investment, 1 / years) - 1;
    return { name, ...s, proceeds, multiple, irr, years };
  });
  const probWeighted = rows.reduce((acc, r) => acc + r.probability * r.proceeds, 0);
  const wMultiple = probWeighted / investment;
  const wYears = rows.reduce((acc, r) => acc + r.probability * r.years, 0);
  const wIrr = Math.pow(probWeighted / investment, 1 / wYears) - 1;
  const wExitYear = rows.reduce((acc, r) => acc + r.probability * r.exitYear, 0);
  const wExitValuationB = rows.reduce((acc, r) => acc + r.probability * r.exitValuationB, 0);
  return {
    entryVal, startOwn, exitOwn, rows,
    probWeighted, wMultiple, wIrr, wYears,
    wExitYear, wExitValuationB,
  };
}

const HURDLE = 0.25; // 25% IRR hurdle

/* Integra Groupe brand palette (from corporate deck) */
const BRAND = {
  pageBg: "#F4F4F4",
  panelBg: "#EFEFEF",
  cardBg: "#FFFFFF",
  border: "#D4D4D4",
  borderSoft: "#E5E5E5",
  inkHeadline: "#1F5A6B",   // teal-navy — corporate H1
  inkSubhead: "#0F2D55",    // dark navy — italic subheaders
  inkBody: "#333333",
  inkMuted: "#6B6B6B",
  inkFaint: "#9A9A9A",
  teal: "#7FC8BA",          // light teal arrow
  green: "#2A8A40",          // dark green arrow
  navy: "#1F5A6B",           // dark navy arrow
  lime: "#9BCB42",           // light/lime green arrow
};

const SCENARIO_COLORS = {
  bad: "#1F5A6B",    // navy — somber baseline
  okay: "#7FC8BA",   // teal — neutral middle
  great: "#2A8A40",  // green — positive
};

function IntegraLogo({ size = 28, className = "" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-label="Integra Groupe"
      role="img"
    >
      <g strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M 30 52 L 14 14 L 52 30" stroke="#7FC8BA" />
        <path d="M 48 30 L 86 14 L 70 52" stroke="#2A8A40" />
        <path d="M 30 48 L 14 86 L 52 70" stroke="#1F5A6B" />
        <path d="M 48 70 L 86 86 L 70 48" stroke="#9BCB42" />
      </g>
    </svg>
  );
}

/* ---------- Tiny UI primitives ---------- */
function Slider({ label, value, onChange, min, max, step, format, hint }) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <span
          className="text-[11px] uppercase tracking-[0.18em] font-medium"
          style={{ color: BRAND.inkMuted }}
        >
          {label}
        </span>
        <span
          className="text-sm font-mono tabular-nums font-medium"
          style={{ color: BRAND.inkSubhead }}
        >
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 cursor-pointer"
      />
      {hint && (
        <div className="text-[10px] leading-tight" style={{ color: BRAND.inkFaint }}>
          {hint}
        </div>
      )}
    </div>
  );
}

function NumberField({ label, value, onChange, step, format, hint }) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <span
          className="text-[11px] uppercase tracking-[0.18em] font-medium"
          style={{ color: BRAND.inkMuted }}
        >
          {label}
        </span>
      </div>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full bg-transparent border-b font-mono tabular-nums text-sm py-1 focus:outline-none"
        style={{ color: BRAND.inkSubhead, borderColor: BRAND.border }}
      />
      {hint && (
        <div className="text-[10px] leading-tight" style={{ color: BRAND.inkFaint }}>
          {hint}
        </div>
      )}
      {format && (
        <div
          className="text-[11px] font-mono tabular-nums"
          style={{ color: BRAND.inkMuted }}
        >
          {format(value)}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ children, num }) {
  return (
    <div
      className="flex items-baseline gap-3 pb-3 mb-4 border-b"
      style={{ borderColor: BRAND.border }}
    >
      {num && (
        <span
          className="font-mono text-[10px] tabular-nums font-medium"
          style={{ color: BRAND.inkHeadline }}
        >
          {num}
        </span>
      )}
      <h3
        className="text-[11px] uppercase tracking-[0.22em] font-semibold"
        style={{ color: BRAND.inkHeadline }}
      >
        {children}
      </h3>
    </div>
  );
}

function ScenarioPanel({ name, label, scenario, onChange, accent }) {
  return (
    <div
      className="space-y-3 p-4 border rounded-sm"
      style={{ borderColor: BRAND.border, backgroundColor: BRAND.cardBg }}
    >
      <div className="flex items-baseline justify-between">
        <div>
          <div
            className="text-lg italic font-semibold"
            style={{ color: accent, letterSpacing: "0.01em" }}
          >
            {label}
          </div>
          <div
            className="text-[10px] uppercase tracking-[0.18em] font-medium"
            style={{ color: BRAND.inkMuted }}
          >
            {name === "bad" && "Photonic moonshot fails"}
            {name === "okay" && "Reaches Quantinuum-tier"}
            {name === "great" && "Utility-scale leader"}
          </div>
        </div>
        <div
          className="font-mono text-2xl tabular-nums font-medium"
          style={{ color: BRAND.inkSubhead }}
        >
          {(scenario.probability * 100).toFixed(0)}%
        </div>
      </div>
      <Slider
        label="Probability"
        value={scenario.probability}
        onChange={(v) => onChange({ ...scenario, probability: v })}
        min={0}
        max={1}
        step={0.01}
        format={(v) => `${(v * 100).toFixed(0)}%`}
      />
      <Slider
        label="Exit Valuation"
        value={scenario.exitValuationB}
        onChange={(v) => onChange({ ...scenario, exitValuationB: v })}
        min={0.5}
        max={200}
        step={0.5}
        format={fmt.moneyB}
      />
      <Slider
        label="Exit Year"
        value={scenario.exitYear}
        onChange={(v) => onChange({ ...scenario, exitYear: v })}
        min={2027}
        max={2040}
        step={1}
        format={(v) => v.toString()}
      />
    </div>
  );
}

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return isMobile;
}

/* ---------- Main component ---------- */
export default function App() {
  const isMobile = useIsMobile();

  // Deal terms
  const [investment, setInvestment] = useState(5_000_000);
  const [discount, setDiscount] = useState(0.20);
  const [lastRoundVal, setLastRoundVal] = useState(6_000_000_000);
  const [govFunding, setGovFunding] = useState(1.0); // in $B
  const [dilutionFactor, setDilutionFactor] = useState(0.85);
  const entryYear = 2025;

  // Scenarios
  const [scenarios, setScenarios] = useState({
    bad: { probability: 0.30, exitValuationB: 1.5, exitYear: 2030 },
    okay: { probability: 0.50, exitValuationB: 20, exitYear: 2030 },
    great: { probability: 0.20, exitValuationB: 75, exitYear: 2033 },
  });

  // Quick presets
  const presets = {
    "Skeptic": {
      bad: { probability: 0.45, exitValuationB: 1.0, exitYear: 2030 },
      okay: { probability: 0.45, exitValuationB: 12, exitYear: 2030 },
      great: { probability: 0.10, exitValuationB: 50, exitYear: 2033 },
    },
    "Base case": {
      bad: { probability: 0.30, exitValuationB: 1.5, exitYear: 2030 },
      okay: { probability: 0.50, exitValuationB: 20, exitYear: 2030 },
      great: { probability: 0.20, exitValuationB: 75, exitYear: 2033 },
    },
    "Bull": {
      bad: { probability: 0.15, exitValuationB: 2.0, exitYear: 2030 },
      okay: { probability: 0.45, exitValuationB: 30, exitYear: 2029 },
      great: { probability: 0.40, exitValuationB: 120, exitYear: 2032 },
    },
    "All-or-nothing": {
      bad: { probability: 0.55, exitValuationB: 0.8, exitYear: 2029 },
      okay: { probability: 0.10, exitValuationB: 15, exitYear: 2030 },
      great: { probability: 0.35, exitValuationB: 100, exitYear: 2033 },
    },
  };

  // Derived: dilution factor adjusts with gov funding (educational link)
  // More gov funding -> less private dilution. We use it as a *suggestion*
  // not a forced binding so the user can override.
  const suggestedDilution = Math.min(0.92, 0.72 + govFunding * 0.10);

  // Probability sum check
  const probSum =
    scenarios.bad.probability + scenarios.okay.probability + scenarios.great.probability;
  const probsValid = Math.abs(probSum - 1.0) < 0.005;

  // Compute primary outcomes
  const outcomes = useMemo(
    () =>
      computeOutcomes({
        investment,
        discount,
        lastRoundVal,
        dilutionFactor,
        scenarios,
        entryYear,
      }),
    [investment, discount, lastRoundVal, dilutionFactor, scenarios]
  );

  // Sensitivity to discount
  const discountSensitivity = useMemo(() => {
    const points = [];
    for (let d = 0.05; d <= 0.35 + 1e-9; d += 0.025) {
      const o = computeOutcomes({
        investment,
        discount: d,
        lastRoundVal,
        dilutionFactor,
        scenarios,
        entryYear,
      });
      points.push({
        discount: d,
        discountLabel: `${(d * 100).toFixed(0)}%`,
        irr: o.wIrr,
        irrPct: o.wIrr * 100,
      });
    }
    return points;
  }, [investment, lastRoundVal, dilutionFactor, scenarios]);

  // Comparable companies
  const comps = [
    { name: "Xanadu (2022)", val: 1.0, kind: "comp" },
    { name: "PsiQuantum (Mar 2025)", val: 6.0, kind: "anchor" },
    { name: "Modeled entry", val: outcomes.entryVal / 1e9, kind: "you" },
    { name: "PsiQuantum (Sep 2025)", val: 7.0, kind: "comp" },
    { name: "Quantinuum (Jan 2024)", val: 10.0, kind: "comp" },
    { name: "Bad exit", val: scenarios.bad.exitValuationB, kind: "bad" },
    { name: "Okay exit", val: scenarios.okay.exitValuationB, kind: "okay" },
    { name: "Great exit", val: scenarios.great.exitValuationB, kind: "great" },
  ];

  // Tornado sensitivity: vary one input at a time, show IRR delta
  const tornadoData = useMemo(() => {
    const baseIrr = outcomes.wIrr;
    const variations = [
      {
        label: "Discount (10% → 25%)",
        low: { discount: 0.10 },
        high: { discount: 0.25 },
      },
      {
        label: "Bad prob (15% → 45%)",
        low: { scenarios: { ...scenarios, bad: { ...scenarios.bad, probability: 0.15 } } },
        high: { scenarios: { ...scenarios, bad: { ...scenarios.bad, probability: 0.45 } } },
      },
      {
        label: "Okay exit ($12B → $30B)",
        low: { scenarios: { ...scenarios, okay: { ...scenarios.okay, exitValuationB: 12 } } },
        high: { scenarios: { ...scenarios, okay: { ...scenarios.okay, exitValuationB: 30 } } },
      },
      {
        label: "Great exit ($40B → $120B)",
        low: { scenarios: { ...scenarios, great: { ...scenarios.great, exitValuationB: 40 } } },
        high: { scenarios: { ...scenarios, great: { ...scenarios.great, exitValuationB: 120 } } },
      },
      {
        label: "Dilution (0.70 → 0.95)",
        low: { dilutionFactor: 0.70 },
        high: { dilutionFactor: 0.95 },
      },
      {
        label: "Great year (2030 → 2035)",
        low: { scenarios: { ...scenarios, great: { ...scenarios.great, exitYear: 2030 } } },
        high: { scenarios: { ...scenarios, great: { ...scenarios.great, exitYear: 2035 } } },
      },
    ];
    const baseInputs = { investment, discount, lastRoundVal, dilutionFactor, scenarios, entryYear };
    return variations
      .map((v) => {
        const lowOut = computeOutcomes({ ...baseInputs, ...v.low });
        const highOut = computeOutcomes({ ...baseInputs, ...v.high });
        const lowDelta = (lowOut.wIrr - baseIrr) * 100;
        const highDelta = (highOut.wIrr - baseIrr) * 100;
        return {
          label: v.label,
          low: lowDelta,
          high: highDelta,
          range: Math.abs(highDelta - lowDelta),
        };
      })
      .sort((a, b) => b.range - a.range);
  }, [investment, discount, lastRoundVal, dilutionFactor, scenarios, outcomes.wIrr]);

  const verdictClears = outcomes.wIrr >= HURDLE;

  return (
    <div
      className="min-h-screen antialiased"
      style={{
        fontFamily: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif',
        backgroundColor: BRAND.pageBg,
        color: BRAND.inkBody,
      }}
    >
      <div className="max-w-[1400px] mx-auto px-4 py-6 md:px-8 md:py-10">
        {/* Header */}
        <header className="mb-8 md:mb-12 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-3">
              <span
                className="font-mono text-[10px] uppercase tracking-[0.3em]"
                style={{ color: BRAND.inkHeadline }}
              >
                Integra Groupe · Investment Committee Memorandum
              </span>
              <span className="font-mono text-[10px]" style={{ color: BRAND.inkFaint }}>
                {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              </span>
            </div>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-semibold uppercase leading-tight tracking-tight"
              style={{ color: BRAND.inkHeadline }}
            >
              PsiQuantum{" "}
              <span style={{ color: BRAND.inkSubhead }}>Secondary</span>
            </h1>
            <h2
              className="text-lg lg:text-xl mt-2"
              style={{ color: BRAND.inkSubhead }}
            >
              Decision <span className="font-semibold">dashboard</span>
            </h2>
            <p
              className="mt-4 max-w-3xl text-sm leading-relaxed"
              style={{ color: BRAND.inkBody }}
            >
              Probability-weighted valuation model for the proposed $5M secondary position in
              PsiQuantum. Each scenario exit is anchored to a comparable private-market transaction
              (Xanadu, Quantinuum) or a published market projection (McKinsey QT Monitor). Inputs
              are adjustable for live sensitivity analysis.
            </p>
          </div>
          <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
            <IntegraLogo size={48} />
            <div
              className="text-[10px] uppercase tracking-[0.18em] font-medium"
              style={{ color: BRAND.inkSubhead }}
            >
              integra <span style={{ color: BRAND.inkFaint, letterSpacing: "0.3em" }}>GROUPE</span>
            </div>
          </div>
        </header>

        {/* Top row: Verdict and headline metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 md:mb-10">
          {/* Verdict */}
          <div
            className="p-5 md:p-6 border-2 rounded-sm"
            style={{
              backgroundColor: BRAND.cardBg,
              borderColor: verdictClears ? BRAND.green : BRAND.navy,
            }}
          >
            <div
              className="text-[10px] uppercase tracking-[0.22em] mb-2 font-medium"
              style={{ color: BRAND.inkMuted }}
            >
              Recommendation
            </div>
            <div
              className="text-3xl leading-none font-bold tracking-tight"
              style={{ color: verdictClears ? BRAND.green : BRAND.navy }}
            >
              {verdictClears ? "INVEST" : "PASS"}
            </div>
            <div
              className="text-xs mt-3 leading-relaxed"
              style={{ color: BRAND.inkBody }}
            >
              {verdictClears
                ? `Probability-weighted IRR clears the 25% deep-tech hurdle at a ${(
                    discount * 100
                  ).toFixed(0)}% discount to the last primary round.`
                : `Probability-weighted IRR falls short of the 25% hurdle at the modeled discount.`}
            </div>
          </div>

          <Metric
            label="Prob-weighted IRR"
            value={fmt.pct(outcomes.wIrr, 1)}
            subValue={`${fmt.multi(outcomes.wMultiple)} over ${outcomes.wYears.toFixed(1)} yrs`}
            highlight={verdictClears}
          />
          <Metric
            label="Expected proceeds"
            value={fmt.money(outcomes.probWeighted)}
            subValue={
              <>
                <div>
                  ~{Math.round(outcomes.wExitYear)} · ${outcomes.wExitValuationB.toFixed(1)}B implied exit
                </div>
                <div className="mt-1" style={{ color: BRAND.inkFaint }}>
                  on ${(investment / 1e6).toFixed(1)}M deployed
                </div>
              </>
            }
          />
          <Metric
            label="Implied entry valuation"
            value={fmt.moneyB(outcomes.entryVal / 1e9)}
            subValue={`${fmt.pct(discount, 0)} below last primary round`}
          />
        </div>

        {/* Main layout — stacks on mobile, splits 4/8 from lg */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: inputs */}
          <div className="lg:col-span-4 space-y-8">
            {/* Presets */}
            <div>
              <SectionHeader num="01">Presets</SectionHeader>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(presets).map((p) => (
                  <button
                    key={p}
                    onClick={() => setScenarios(presets[p])}
                    className="text-[11px] uppercase tracking-[0.18em] font-medium px-3 py-2 border rounded-sm transition-colors"
                    style={{
                      borderColor: BRAND.border,
                      backgroundColor: BRAND.cardBg,
                      color: BRAND.inkSubhead,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = BRAND.green;
                      e.currentTarget.style.color = BRAND.green;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = BRAND.border;
                      e.currentTarget.style.color = BRAND.inkSubhead;
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Deal terms */}
            <div>
              <SectionHeader num="02">Deal terms</SectionHeader>
              <div className="space-y-5">
                <Slider
                  label="Position size"
                  value={investment}
                  onChange={setInvestment}
                  min={1_000_000}
                  max={20_000_000}
                  step={500_000}
                  format={fmt.money}
                  hint="Position offered by the broker"
                />
                <Slider
                  label="Discount to last round"
                  value={discount}
                  onChange={setDiscount}
                  min={0}
                  max={0.40}
                  step={0.01}
                  format={(v) => `${(v * 100).toFixed(0)}%`}
                  hint="Broker quoted range: 15–20%"
                />
                <Slider
                  label="Last round valuation"
                  value={lastRoundVal}
                  onChange={setLastRoundVal}
                  min={3e9}
                  max={10e9}
                  step={0.25e9}
                  format={(v) => fmt.moneyB(v / 1e9)}
                  hint="March 2025 Series E: $6B pre-money"
                />
              </div>
            </div>

            {/* Capital structure */}
            <div>
              <SectionHeader num="03">Capital structure</SectionHeader>
              <div className="space-y-5">
                <Slider
                  label="Non-dilutive government funding"
                  value={govFunding}
                  onChange={setGovFunding}
                  min={0}
                  max={2.0}
                  step={0.1}
                  format={(v) => `$${v.toFixed(1)}B`}
                  hint={`Investment teaser: ~$1B committed (Australia + Illinois). Implied dilution factor: ${suggestedDilution.toFixed(
                    2
                  )}.`}
                />
                <Slider
                  label="Dilution factor"
                  value={dilutionFactor}
                  onChange={setDilutionFactor}
                  min={0.5}
                  max={1.0}
                  step={0.01}
                  format={(v) => v.toFixed(2)}
                  hint="Share of starting ownership retained at exit. Higher non-dilutive funding implies a higher factor."
                />
              </div>
            </div>

            {/* Scenarios */}
            <div>
              <SectionHeader num="04">Scenarios</SectionHeader>
              <div className="space-y-3">
                <ScenarioPanel
                  name="bad"
                  label="Bad"
                  scenario={scenarios.bad}
                  onChange={(s) => setScenarios({ ...scenarios, bad: s })}
                  accent={SCENARIO_COLORS.bad}
                />
                <ScenarioPanel
                  name="okay"
                  label="Okay"
                  scenario={scenarios.okay}
                  onChange={(s) => setScenarios({ ...scenarios, okay: s })}
                  accent={SCENARIO_COLORS.okay}
                />
                <ScenarioPanel
                  name="great"
                  label="Great"
                  scenario={scenarios.great}
                  onChange={(s) => setScenarios({ ...scenarios, great: s })}
                  accent={SCENARIO_COLORS.great}
                />
                <div
                  className="text-xs font-mono tabular-nums px-3 py-2 mt-2 border rounded-sm"
                  style={{
                    borderColor: probsValid ? BRAND.border : BRAND.navy,
                    color: probsValid ? BRAND.inkMuted : BRAND.navy,
                    backgroundColor: BRAND.cardBg,
                  }}
                >
                  Probability sum: {(probSum * 100).toFixed(0)}%{" "}
                  {probsValid ? "✓" : "— must equal 100%"}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: outputs and charts */}
          <div className="lg:col-span-8 space-y-8">
            {/* Scenario outcomes chart */}
            <div className="p-4 md:p-6 border rounded-sm" style={{ borderColor: BRAND.border, backgroundColor: BRAND.cardBg }}>
              <SectionHeader num="05">Outcome by scenario</SectionHeader>
              <div className="text-xs mb-4 leading-relaxed" style={{ color: BRAND.inkBody }}>
                Proceeds at exit under each scenario, in millions. The grey dashed line marks the
                initial position size; the gold dashed line marks the probability-weighted expected
                proceeds.
              </div>
              <div className="h-[260px]">
                <ResponsiveContainer>
                  <BarChart
                    data={outcomes.rows.map((r) => ({
                      name: r.name.toUpperCase(),
                      proceeds: r.proceeds / 1e6,
                      multiple: r.multiple,
                      irr: r.irr * 100,
                      probability: r.probability * 100,
                      color: SCENARIO_COLORS[r.name],
                    }))}
                    layout="vertical"
                    margin={{ top: 5, right: 80, bottom: 20, left: 30 }}
                  >
                    <XAxis
                      type="number"
                      stroke="#9A9A9A"
                      fontSize={11}
                      tickFormatter={(v) => `$${v.toFixed(0)}M`}
                    />
                    <YAxis dataKey="name" type="category" stroke="#6B6B6B" fontSize={12} width={60} />
                    <Tooltip
                      contentStyle={{
                        background: "#FFFFFF",
                        border: "1px solid #D4D4D4",
                        fontSize: "12px",
                      }}
                      labelStyle={{ color: "#0F2D55", fontWeight: 600 }}
                      formatter={(v, key, item) => {
                        if (key === "proceeds") return [`$${v.toFixed(1)}M`, "Proceeds"];
                        return [v, key];
                      }}
                    />
                    <ReferenceLine
                      x={investment / 1e6}
                      stroke="#6B6B6B"
                      strokeDasharray="2 2"
                      label={{
                        value: "Entry $",
                        position: "top",
                        fill: "#6B6B6B",
                        fontSize: 10,
                      }}
                    />
                    <ReferenceLine
                      x={outcomes.probWeighted / 1e6}
                      stroke="#2A8A40"
                      strokeDasharray="4 2"
                      label={{
                        value: `Avg ${fmt.money(outcomes.probWeighted)}`,
                        position: "top",
                        fill: "#2A8A40",
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    />
                    <Bar dataKey="proceeds" radius={0}>
                      {outcomes.rows.map((r, i) => (
                        <Cell key={i} fill={SCENARIO_COLORS[r.name]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                {outcomes.rows.map((r) => (
                  <div key={r.name} className="border-t pt-3" style={{ borderColor: BRAND.border }}>
                    <div
                      className="text-2xl tabular-nums font-bold"
                      style={{ color: SCENARIO_COLORS[r.name] }}
                    >
                      {fmt.multi(r.multiple)}
                    </div>
                    <div
                      className="text-[10px] uppercase tracking-[0.18em] mt-1 font-medium"
                      style={{ color: BRAND.inkMuted }}
                    >
                      {fmt.pct(r.irr, 0)} IRR
                    </div>
                    <div
                      className="text-[10px] mt-1 font-mono tabular-nums"
                      style={{ color: BRAND.inkFaint }}
                    >
                      {(r.probability * 100).toFixed(0)}% probability · {r.years.toFixed(0)} yrs
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comp comparison */}
            <div className="p-4 md:p-6 border rounded-sm" style={{ borderColor: BRAND.border, backgroundColor: BRAND.cardBg }}>
              <SectionHeader num="06">Comparable transactions · scenarios vs. observed valuations</SectionHeader>
              <div className="text-xs mb-4 leading-relaxed" style={{ color: BRAND.inkBody }}>
                Modeled exit valuations alongside observed comparable transactions. The bad case is
                anchored to Xanadu's 2022 Series C ($1B); the okay case to Quantinuum's January 2024
                round ($10B post-money).
              </div>
              <div className="h-[260px] sm:h-[260px]">
                <ResponsiveContainer>
                  <BarChart
                    data={comps}
                    margin={{ top: 5, right: 10, bottom: isMobile ? 80 : 60, left: 20 }}
                  >
                    <XAxis
                      dataKey="name"
                      stroke="#6B6B6B"
                      fontSize={isMobile ? 9 : 10}
                      angle={isMobile ? -55 : -30}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis
                      stroke="#9A9A9A"
                      fontSize={11}
                      tickFormatter={(v) => `$${v}B`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#FFFFFF",
                        border: "1px solid #D4D4D4",
                        fontSize: "12px",
                      }}
                      formatter={(v) => [`$${v.toFixed(1)}B`, "Valuation"]}
                    />
                    <Bar dataKey="val" radius={0}>
                      {comps.map((c, i) => {
                        const colorMap = {
                          comp: "#9A9A9A",
                          anchor: "#6B6B6B",
                          you: BRAND.lime,
                          bad: SCENARIO_COLORS.bad,
                          okay: SCENARIO_COLORS.okay,
                          great: SCENARIO_COLORS.great,
                        };
                        return <Cell key={i} fill={colorMap[c.kind]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Discount sensitivity */}
            <div className="p-4 md:p-6 border rounded-sm" style={{ borderColor: BRAND.border, backgroundColor: BRAND.cardBg }}>
              <SectionHeader num="07">Discount sensitivity</SectionHeader>
              <div className="text-xs mb-4 leading-relaxed" style={{ color: BRAND.inkBody }}>
                Probability-weighted IRR across the discount range. The vertical guide marks the
                modeled discount; the horizontal reference line is the 25% deep-tech hurdle.
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer>
                  <LineChart data={discountSensitivity} margin={{ top: 5, right: 30, bottom: 20, left: 20 }}>
                    <XAxis
                      dataKey="discountLabel"
                      stroke="#6B6B6B"
                      fontSize={11}
                    />
                    <YAxis
                      stroke="#9A9A9A"
                      fontSize={11}
                      tickFormatter={(v) => `${v.toFixed(0)}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#FFFFFF",
                        border: "1px solid #D4D4D4",
                        fontSize: "12px",
                      }}
                      formatter={(v) => [`${v.toFixed(1)}%`, "IRR"]}
                    />
                    <ReferenceLine
                      y={25}
                      stroke="#1F5A6B"
                      strokeDasharray="4 2"
                      label={{ value: "25% hurdle", position: "right", fill: "#1F5A6B", fontSize: 10, fontWeight: 600 }}
                    />
                    <ReferenceLine
                      x={`${(discount * 100).toFixed(0)}%`}
                      stroke="#9BCB42"
                      strokeDasharray="2 2"
                    />
                    <Line
                      type="monotone"
                      dataKey="irrPct"
                      stroke="#2A8A40"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "#2A8A40" }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tornado / sensitivity */}
            <div className="p-4 md:p-6 border rounded-sm" style={{ borderColor: BRAND.border, backgroundColor: BRAND.cardBg }}>
              <SectionHeader num="08">Sensitivity analysis</SectionHeader>
              <div className="text-xs mb-4 leading-relaxed" style={{ color: BRAND.inkBody }}>
                IRR delta when each input is swung between a low and high bound, all other inputs
                held constant. Inputs are sorted by impact magnitude; wider bars indicate the
                assumptions to which the recommendation is most sensitive.
              </div>
              <div className="space-y-2">
                {tornadoData.map((t) => {
                  const maxRange = Math.max(...tornadoData.map((x) => Math.max(Math.abs(x.low), Math.abs(x.high))));
                  const scale = (v) => (Math.abs(v) / maxRange) * 50;
                  return (
                    <div key={t.label} className="grid grid-cols-12 gap-2 items-center text-xs">
                      <div
                        className="col-span-5 sm:col-span-4 font-mono text-[10px] sm:text-xs leading-tight font-medium"
                        style={{ color: BRAND.inkSubhead }}
                      >
                        {t.label}
                      </div>
                      <div className="col-span-7 sm:col-span-8 relative h-6 flex items-center">
                        <div className="w-1/2 flex justify-end">
                          {t.low < 0 && (
                            <div
                              className="h-4"
                              style={{
                                width: `${scale(t.low)}%`,
                                background: BRAND.navy,
                              }}
                            />
                          )}
                        </div>
                        <div className="w-px h-6" style={{ background: BRAND.inkFaint }} />
                        <div className="w-1/2">
                          {t.high > 0 && (
                            <div
                              className="h-4"
                              style={{
                                width: `${scale(t.high)}%`,
                                background: BRAND.green,
                              }}
                            />
                          )}
                        </div>
                        <span
                          className="absolute left-2 text-[10px] font-mono tabular-nums"
                          style={{ color: BRAND.inkMuted }}
                        >
                          {t.low > 0 ? "+" : ""}
                          {t.low.toFixed(1)}%
                        </span>
                        <span
                          className="absolute right-2 text-[10px] font-mono tabular-nums"
                          style={{ color: BRAND.inkMuted }}
                        >
                          {t.high > 0 ? "+" : ""}
                          {t.high.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                className="text-[10px] mt-3 italic"
                style={{ color: BRAND.inkFaint }}
              >
                IRR delta from base case · sorted by magnitude · downside left, upside right
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer
          className="mt-16 pt-8 border-t"
          style={{ borderColor: BRAND.border }}
        >
          <div
            className="flex flex-wrap justify-between items-center gap-4 text-[10px] font-mono uppercase tracking-[0.2em]"
            style={{ color: BRAND.inkMuted }}
          >
            <div className="flex items-center gap-3">
              <IntegraLogo size={20} />
              <span>Anchors · Xanadu $1B · Quantinuum $10B · McKinsey QT Monitor 2025</span>
            </div>
            <span>Prepared for Integra Groupe · Investment Analyst Assessment</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Metric({ label, value, subValue, highlight }) {
  return (
    <div
      className="p-5 md:p-6 border rounded-sm"
      style={{
        backgroundColor: BRAND.cardBg,
        borderColor: highlight ? BRAND.green : BRAND.border,
        borderWidth: highlight ? 2 : 1,
      }}
    >
      <div
        className="text-[10px] uppercase tracking-[0.22em] mb-2 font-medium"
        style={{ color: BRAND.inkMuted }}
      >
        {label}
      </div>
      <div
        className="text-3xl tabular-nums leading-none font-bold tracking-tight"
        style={{ color: highlight ? BRAND.green : BRAND.inkSubhead }}
      >
        {value}
      </div>
      {subValue && (
        <div
          className="text-[11px] mt-3 font-mono tabular-nums"
          style={{ color: BRAND.inkMuted }}
        >
          {subValue}
        </div>
      )}
    </div>
  );
}
