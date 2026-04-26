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
  return { entryVal, startOwn, exitOwn, rows, probWeighted, wMultiple, wIrr, wYears };
}

const HURDLE = 0.25; // 25% IRR hurdle

const SCENARIO_COLORS = {
  bad: "#9c4a3c",     // muted rust
  okay: "#a89060",    // warm taupe
  great: "#d4a574",   // muted gold
};

/* ---------- Tiny UI primitives ---------- */
function Slider({ label, value, onChange, min, max, step, format, hint }) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] uppercase tracking-[0.18em] text-stone-400">{label}</span>
        <span className="text-sm font-mono tabular-nums text-stone-100">
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
        className="w-full accent-amber-200/80 h-1 cursor-pointer"
      />
      {hint && <div className="text-[10px] text-stone-500 leading-tight">{hint}</div>}
    </div>
  );
}

function NumberField({ label, value, onChange, step, format, hint }) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] uppercase tracking-[0.18em] text-stone-400">{label}</span>
      </div>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full bg-transparent border-b border-stone-700 text-stone-100 font-mono tabular-nums text-sm py-1 focus:outline-none focus:border-amber-200/60"
      />
      {hint && <div className="text-[10px] text-stone-500 leading-tight">{hint}</div>}
      {format && (
        <div className="text-[11px] text-stone-400 font-mono tabular-nums">{format(value)}</div>
      )}
    </div>
  );
}

function SectionHeader({ children, num }) {
  return (
    <div className="flex items-baseline gap-3 pb-3 mb-4 border-b border-stone-800">
      {num && (
        <span className="font-mono text-[10px] text-amber-200/70 tabular-nums">{num}</span>
      )}
      <h3 className="text-[11px] uppercase tracking-[0.22em] text-stone-300 font-medium">
        {children}
      </h3>
    </div>
  );
}

function ScenarioPanel({ name, label, scenario, onChange, accent }) {
  return (
    <div className="space-y-3 p-4 border border-stone-800 bg-stone-900/30 rounded-sm">
      <div className="flex items-baseline justify-between">
        <div>
          <div
            className="font-serif text-lg italic"
            style={{ color: accent, letterSpacing: "0.02em" }}
          >
            {label}
          </div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
            {name === "bad" && "Photonic moonshot fails"}
            {name === "okay" && "Reaches Quantinuum-tier"}
            {name === "great" && "Utility-scale leader"}
          </div>
        </div>
        <div className="font-mono text-2xl tabular-nums text-stone-200">
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
        backgroundColor: "#161311",
        color: "#e7e5e4",
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212,165,116,0.08), transparent), radial-gradient(ellipse 60% 50% at 100% 100%, rgba(156,74,60,0.06), transparent)",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-4 py-6 md:px-8 md:py-10">
        {/* Header */}
        <header className="mb-8 md:mb-12">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-200/70">
              Integra Groupe · Investment Committee Memorandum
            </span>
            <span className="font-mono text-[10px] text-stone-500">
              {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-stone-100 leading-none">
            PsiQuantum <span className="italic text-amber-200/80">Secondary</span>
          </h1>
          <h2 className="font-serif text-xl lg:text-2xl text-stone-400 italic mt-2">
            Decision dashboard
          </h2>
          <p className="mt-4 max-w-3xl text-sm text-stone-400 leading-relaxed">
            Probability-weighted valuation model for the proposed $5M secondary position in
            PsiQuantum. Each scenario exit is anchored to a comparable private-market transaction
            (Xanadu, Quantinuum) or a published market projection (McKinsey QT Monitor). Inputs are
            adjustable for live sensitivity analysis.
          </p>
        </header>

        {/* Top row: Verdict and headline metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 md:mb-10">
          {/* Verdict */}
          <div
            className={`p-5 md:p-6 border ${
              verdictClears ? "border-amber-200/40" : "border-rose-400/40"
            } bg-stone-900/40`}
          >
            <div className="text-[10px] uppercase tracking-[0.22em] text-stone-500 mb-2">
              Recommendation
            </div>
            <div
              className="font-serif text-3xl leading-none"
              style={{ color: verdictClears ? "#d4a574" : "#c97464" }}
            >
              {verdictClears ? "INVEST" : "PASS"}
            </div>
            <div className="text-xs text-stone-400 mt-3 leading-relaxed">
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
            subValue={`on $${(investment / 1e6).toFixed(1)}M deployed`}
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
                    className="text-[11px] uppercase tracking-[0.18em] px-3 py-2 border border-stone-800 hover:border-amber-200/60 hover:text-amber-200 text-stone-400 transition-colors"
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
                  className={`text-xs font-mono tabular-nums px-3 py-2 mt-2 border ${
                    probsValid
                      ? "border-stone-800 text-stone-500"
                      : "border-rose-400/40 text-rose-400"
                  }`}
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
            <div className="p-4 md:p-6 border border-stone-800 bg-stone-900/30">
              <SectionHeader num="05">Outcome by scenario</SectionHeader>
              <div className="text-xs text-stone-400 mb-4 leading-relaxed">
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
                      stroke="#57534e"
                      fontSize={11}
                      tickFormatter={(v) => `$${v.toFixed(0)}M`}
                    />
                    <YAxis dataKey="name" type="category" stroke="#a8a29e" fontSize={12} width={60} />
                    <Tooltip
                      contentStyle={{
                        background: "#0e0c0a",
                        border: "1px solid #44403c",
                        fontSize: "12px",
                      }}
                      labelStyle={{ color: "#d4a574" }}
                      formatter={(v, key, item) => {
                        if (key === "proceeds") return [`$${v.toFixed(1)}M`, "Proceeds"];
                        return [v, key];
                      }}
                    />
                    <ReferenceLine
                      x={investment / 1e6}
                      stroke="#a8a29e"
                      strokeDasharray="2 2"
                      label={{
                        value: "Entry $",
                        position: "top",
                        fill: "#a8a29e",
                        fontSize: 10,
                      }}
                    />
                    <ReferenceLine
                      x={outcomes.probWeighted / 1e6}
                      stroke="#d4a574"
                      strokeDasharray="4 2"
                      label={{
                        value: `Avg ${fmt.money(outcomes.probWeighted)}`,
                        position: "top",
                        fill: "#d4a574",
                        fontSize: 10,
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
                  <div key={r.name} className="border-t border-stone-800 pt-3">
                    <div
                      className="font-serif text-2xl tabular-nums"
                      style={{ color: SCENARIO_COLORS[r.name] }}
                    >
                      {fmt.multi(r.multiple)}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-stone-500 mt-1">
                      {fmt.pct(r.irr, 0)} IRR
                    </div>
                    <div className="text-[10px] text-stone-500 mt-1 font-mono tabular-nums">
                      {(r.probability * 100).toFixed(0)}% probability · {r.years.toFixed(0)} yrs
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comp comparison */}
            <div className="p-4 md:p-6 border border-stone-800 bg-stone-900/30">
              <SectionHeader num="06">Comparable transactions · scenarios vs. observed valuations</SectionHeader>
              <div className="text-xs text-stone-400 mb-4 leading-relaxed">
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
                      stroke="#a8a29e"
                      fontSize={isMobile ? 9 : 10}
                      angle={isMobile ? -55 : -30}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis
                      stroke="#57534e"
                      fontSize={11}
                      tickFormatter={(v) => `$${v}B`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#0e0c0a",
                        border: "1px solid #44403c",
                        fontSize: "12px",
                      }}
                      formatter={(v) => [`$${v.toFixed(1)}B`, "Valuation"]}
                    />
                    <Bar dataKey="val" radius={0}>
                      {comps.map((c, i) => {
                        const colorMap = {
                          comp: "#57534e",
                          anchor: "#a8a29e",
                          you: "#d4a574",
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
            <div className="p-4 md:p-6 border border-stone-800 bg-stone-900/30">
              <SectionHeader num="07">Discount sensitivity</SectionHeader>
              <div className="text-xs text-stone-400 mb-4 leading-relaxed">
                Probability-weighted IRR across the discount range. The vertical guide marks the
                modeled discount; the horizontal reference line is the 25% deep-tech hurdle.
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer>
                  <LineChart data={discountSensitivity} margin={{ top: 5, right: 30, bottom: 20, left: 20 }}>
                    <XAxis
                      dataKey="discountLabel"
                      stroke="#a8a29e"
                      fontSize={11}
                    />
                    <YAxis
                      stroke="#57534e"
                      fontSize={11}
                      tickFormatter={(v) => `${v.toFixed(0)}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#0e0c0a",
                        border: "1px solid #44403c",
                        fontSize: "12px",
                      }}
                      formatter={(v) => [`${v.toFixed(1)}%`, "IRR"]}
                    />
                    <ReferenceLine
                      y={25}
                      stroke="#9c4a3c"
                      strokeDasharray="4 2"
                      label={{ value: "25% hurdle", position: "right", fill: "#9c4a3c", fontSize: 10 }}
                    />
                    <ReferenceLine
                      x={`${(discount * 100).toFixed(0)}%`}
                      stroke="#d4a574"
                      strokeDasharray="2 2"
                    />
                    <Line
                      type="monotone"
                      dataKey="irrPct"
                      stroke="#d4a574"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#d4a574" }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tornado / sensitivity */}
            <div className="p-4 md:p-6 border border-stone-800 bg-stone-900/30">
              <SectionHeader num="08">Sensitivity analysis</SectionHeader>
              <div className="text-xs text-stone-400 mb-4 leading-relaxed">
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
                      <div className="col-span-5 sm:col-span-4 text-stone-300 font-mono text-[10px] sm:text-xs leading-tight">{t.label}</div>
                      <div className="col-span-7 sm:col-span-8 relative h-6 flex items-center">
                        <div className="w-1/2 flex justify-end">
                          {t.low < 0 && (
                            <div
                              className="h-4"
                              style={{
                                width: `${scale(t.low)}%`,
                                background: "#9c4a3c",
                              }}
                            />
                          )}
                        </div>
                        <div className="w-px h-6 bg-stone-600" />
                        <div className="w-1/2">
                          {t.high > 0 && (
                            <div
                              className="h-4"
                              style={{
                                width: `${scale(t.high)}%`,
                                background: "#d4a574",
                              }}
                            />
                          )}
                        </div>
                        <span className="absolute left-2 text-[10px] text-stone-500 font-mono tabular-nums">
                          {t.low > 0 ? "+" : ""}
                          {t.low.toFixed(1)}%
                        </span>
                        <span className="absolute right-2 text-[10px] text-stone-500 font-mono tabular-nums">
                          {t.high > 0 ? "+" : ""}
                          {t.high.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-[10px] text-stone-500 mt-3 italic">
                IRR delta from base case · sorted by magnitude · downside left, upside right
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-stone-800">
          <div className="flex justify-between items-baseline text-[10px] text-stone-500 font-mono uppercase tracking-[0.2em]">
            <span>Anchors · Xanadu $1B · Quantinuum $10B · McKinsey QT Monitor 2025</span>
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
      className={`p-5 md:p-6 border bg-stone-900/40 ${
        highlight ? "border-amber-200/30" : "border-stone-800"
      }`}
    >
      <div className="text-[10px] uppercase tracking-[0.22em] text-stone-500 mb-2">{label}</div>
      <div
        className={`font-serif text-3xl tabular-nums leading-none ${
          highlight ? "text-amber-200" : "text-stone-100"
        }`}
      >
        {value}
      </div>
      {subValue && (
        <div className="text-[11px] text-stone-500 mt-3 font-mono tabular-nums">{subValue}</div>
      )}
    </div>
  );
}
