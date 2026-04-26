# Project context — PsiQuantum Secondary Decision Dashboard

> **For AI assistants editing this codebase.** Read this file in full before making any changes to scenario values, calculations, or chart logic. The numbers in this dashboard are not arbitrary — every input is anchored to a real comparable transaction or a published market forecast, and that anchoring is the entire point of the project. Do not "round" or "tidy" numbers without preserving the underlying defense.

---

## 1. What this project is

This is an interactive investment model built for the **Integra Groupe Investment Analyst Assessment**. Integra Groupe is a Miami-based VC firm (founder: Alfredo Vargas, Stanford GSB) that invests on behalf of HNWIs and family offices, with two distinct strategies:

1. **Better Future Fund** — early-stage Latin American startups (e.g., Plenna, Maqui, Sellrs)
2. **Integra Groupe platform** — late-stage deep-tech "trophy" SPVs (per PitchBook: Anthropic, Neuralink, and others)

The assessment asks the candidate to evaluate a real-world secondary transaction: should Integra buy $5M of PsiQuantum stock from a broker offering 15-20% discount to the last primary round? The dashboard exists to:

- Make every assumption in the candidate's recommendation visible and adjustable
- Anchor every exit valuation to a real comparable transaction (no hand-waving)
- Produce a probability-weighted IRR that can be compared against the standard 25% deep-tech VC hurdle
- Stress-test the recommendation via sensitivity analysis (tornado chart, discount curve)
- Serve as both a defense tool in the interview and a live demo in the presentation

The dashboard is part of a larger deliverable that also includes a written investment memo and presentation deck.

---

## 2. The deal being modeled

| Parameter | Value | Source |
|---|---|---|
| Position size offered | $5M | Investment teaser (data room) |
| Discount range offered by broker | 15-20% | Investment teaser |
| Sellers | (1) early employee, (2) Series B investor | Investment teaser |
| Last primary round valuation | $6B pre-money | March 2025 PsiQuantum Series E |
| Implied entry valuation at 20% discount | $4.8B | Calculated |
| Implied entry valuation at 15% discount | $5.1B | Calculated |
| Position style | Direct secondary via broker | Investment teaser |

**Why the sellers are selling (this matters for the model):**

- The early employee has been at PsiQuantum since founding (~9 years). They want personal liquidity. Not signaling distress about the company.
- The Series B fund is reaching maturity and needs to return DPI to its LPs. Standard fund-cycle pressure. Not signaling distress.

This framing is **important**: neither seller is selling because they think PsiQuantum is failing. They have idiosyncratic personal/fund pressures. That's why they accept a 15-20% discount — it's the price of getting cash now versus waiting for an exit. This is **leverage** for the buyer (Integra) to push for the larger end of the discount range.

---

## 3. PsiQuantum at a glance

A US-based quantum computing company building a fault-tolerant quantum computer using a **photonic** approach (manipulating individual photons on silicon chips manufactured by GlobalFoundries). Key facts as of the case timeline (April 2025):

- Founded 2016 by Jeremy O'Brien and others (UK academic origin)
- HQ Palo Alto; manufacturing partnership with GlobalFoundries on 300mm CMOS line
- Total private funding: ~$2.3B+ (largest single quantum company by capital raised)
- Last priced round: March 2025 Series E at $6B pre-money (the round we're discounting from)
- A subsequent September 2025 Series E added $1B at $7B post-money — but this is **after the case date** and should NOT be used as primary evidence in the decision (only as ex-post validation)
- Government partnerships: ~$640M from Australia for the Brisbane facility, ~$1B Illinois package (Chicago quantum park), $25M federal grant, DARPA US2QC participation
- Strategic backers: BlackRock (lead), Founders Fund, Atomico, M12 (Microsoft), Baillie Gifford, Temasek, Blackbird, Australian/Queensland governments
- Patents: 230+ filed
- Strategy: skip NISQ (Noisy Intermediate-Scale Quantum) intermediates entirely; go direct to fault-tolerant utility-scale (~1 million physical qubits)
- Product roadmap: Brisbane data center 2027, Chicago data center 2028, full utility-scale operations targeted 2029

**The core risk per the data room:** PsiQuantum is explicitly described as an **"all-or-nothing"** bet. They are not building intermediate revenue products. They either deliver utility-scale quantum computing or they don't. This phrase appears in the Investment Teaser and should be treated as the official analytical framing.

---

## 4. The quantum computing competitive landscape

PsiQuantum competes against approaches using fundamentally different physics. Understanding this is important when modeling the bad case.

### The four main approaches

1. **Photonic networks (PsiQuantum, Xanadu)** — encode qubits in single photons on silicon chips. Pros: leverages semiconductor manufacturing, room-temperature operation in many components, low decoherence. Cons: probabilistic operations require many redundant qubits, never demonstrated at fault-tolerant scale, capital-intensive.

2. **Superconducting (IBM, Google, Alice & Bob, Rigetti)** — encode qubits in superconducting circuits cooled to near absolute zero. Pros: most mature ecosystem, biggest capital pool, IBM's Condor chip already at 1,121 qubits and Google's Willow at 105 with strong error correction (Dec 2024). Cons: scaling cooling infrastructure is hard.

3. **Trapped ion (IonQ, Quantinuum)** — encode qubits in charged atoms held by electromagnetic fields. Pros: highest gate fidelities, most mature commercial deployments. Quantinuum already has revenue from JPMorgan, Airbus, BMW, HSBC. Cons: scaling to millions of qubits is harder than photonic or neutral-atom approaches.

4. **Neutral atom / cold atom (Atom Computing, QuEra, Pasqal)** — uncharged atoms held by laser tweezers. Pros: scalability (Atom Computing already at 1,225 atoms), Microsoft partnership for 2025 commercial system. Cons: slow gate operations, less mature engineering.

### Key roadmap milestones (per McKinsey QT Monitor, Feb 2025)

| Player | Approach | Logical qubit target | Year |
|---|---|---|---|
| IBM | Superconducting | 200 logical | 2029 |
| IBM | Superconducting | 2,000 logical | 2033+ |
| Google | Superconducting | 1,000 logical | 2029 |
| QuEra | Neutral atoms | 100 logical | 2026 |
| IonQ | Trapped ion | 1,024 algorithmic | 2028 |
| PsiQuantum | Photonic | 1,000,000 physical (full utility-scale) | 2027-29 |

**Key insight:** Most competitors target 2028-2033 for fault-tolerance. PsiQuantum's 2027-29 timeline is the most aggressive in the industry. This is both their differentiator and their biggest risk — schedule slips are likely.

### Microsoft note

The McKinsey report mentions Microsoft's "Majorana 1" topological qubit chip. The underlying physics has been seriously contested in published responses by other physicists. **Treat Microsoft as a real but unproven competitor; do not treat their claims as confirmed.**

---

## 5. Comparable transactions (the anchoring backbone of the model)

Every scenario exit valuation in the dashboard is anchored to one of these. Changes to scenario valuations should preserve the connection to these anchors or explicitly justify departing from them.

| Company | Valuation | Date | Approach | Notes |
|---|---|---|---|---|
| Xanadu | $1B | Series C 2022 | Photonic (room-temp) | Smaller photonic peer; "bad case" floor for PsiQuantum |
| Quantinuum | $10B post | Jan 2024 | Trapped ion | Real revenue, integrated stack, JPMorgan/BMW customers; "okay case" anchor |
| PsiQuantum | $6B pre | Mar 2025 | Photonic | The round we're discounting from |
| PsiQuantum | $7B post | Sep 2025 | Photonic | Post-case validation only |

### Key derived anchors used in the model

- **Bad case at $1.5B exit:** ~50% premium to Xanadu's 2022 valuation, justified by PsiQuantum's larger IP portfolio (230+ patents), GlobalFoundries relationship, and team size. Even in a "moonshot fails" scenario, the IP and team have acquisition value.
- **Okay case at $20B exit:** ~2x Quantinuum's current valuation, justified by 5 years of growth and PsiQuantum's bigger ambition (utility-scale vs. Quantinuum's NISQ-tier products).
- **Great case at $75B exit:** Anchored to McKinsey's optimistic 2035 quantum computing market scenario ($72B revenue) × ~25% market share × ~10x revenue multiple. This is a category-leader outcome.

---

## 6. Market sizing (from McKinsey QT Monitor, June 2025)

The market size projections frame what's possible in the great case. **Note the discrepancy with the Investment Teaser** — the teaser cites a smaller market ($1.2B in 2024, $8B by 2030). This is because they measure pure quantum company revenue while McKinsey includes investment + revenue + big-tech internal R&D. Both are defensible; the model uses McKinsey for upside scenarios and acknowledges the gap explicitly.

### McKinsey QC market scenarios

| Year | Conservative | Optimistic |
|---|---|---|
| 2030 | $16B | $37B |
| 2035 | $28B | $72B |
| 2040 | $45B | $131B |

Growth rate: 11-14% per year over the next decade.

### Economic value at stake by 2035

McKinsey estimates $0.9T-$2.0T in economic value unlocked by quantum computing across pharma, finance, energy, and travel/logistics by 2035. This is the broader "why quantum matters" context but is not directly used in the model.

---

## 7. The model: logic chain (read this end-to-end before changing calculations)

Every output in the dashboard is derived from this chain. If you modify any step, all downstream outputs shift.

### Step 1: Entry valuation

```
entry_valuation = last_round_valuation × (1 - discount)
```

With defaults: $6B × (1 - 0.20) = **$4.8B**

### Step 2: Starting ownership

```
starting_ownership = investment / entry_valuation
```

With defaults: $5M / $4.8B = **0.1042%**

This is the percentage of PsiQuantum that the buyer owns immediately after the secondary closes.

### Step 3: Ownership at exit (after dilution)

```
exit_ownership = starting_ownership × dilution_factor
```

With defaults: 0.1042% × 0.85 = **0.0885%**

The `dilution_factor` represents what fraction of starting ownership the buyer keeps after future PsiQuantum fundraising rounds. With ~$1B of non-dilutive government funding already committed, PsiQuantum needs less private capital, so dilution is lower than typical late-stage. Default 0.85 (15% total dilution) is a reasonable middle estimate. Without government funding, 0.70-0.75 would be more appropriate.

### Step 4: Per-scenario proceeds

For each scenario (bad, okay, great):

```
proceeds = exit_ownership × exit_valuation_in_$
multiple = proceeds / investment
years_held = exit_year - entry_year (entry_year fixed at 2025)
irr = (proceeds / investment)^(1/years_held) - 1
```

### Step 5: Probability-weighted outcome

```
prob_weighted_proceeds = Σ(scenario.probability × scenario.proceeds)
weighted_multiple = prob_weighted_proceeds / investment
weighted_years = Σ(scenario.probability × scenario.years_held)
weighted_irr = (prob_weighted_proceeds / investment)^(1/weighted_years) - 1
```

### Step 6: Verdict

```
if weighted_irr ≥ 0.25:
    verdict = "INVEST"
else:
    verdict = "PASS"
```

The 25% hurdle is the standard for late-stage deep-tech VC. Public stocks return ~10%, bonds ~5%; the additional ~15-20% above public markets is the compensation required for the risk of a private illiquid deep-tech bet. Some funds use 20%, others use 30%; 25% is the middle and most defensible.

---

## 8. Each parameter — what it is, why it's that value, when to change it

### `investment` (default: $5,000,000)

The position size offered by the broker. **This is fixed by the deal terms** — the broker is offering a $5M slice. The user can adjust it slightly (down to $3M, up to $7M) to test, but anything outside roughly $3-7M is implausible for this specific deal.

When to change: only if the user is exploring "what if Integra wanted a smaller/larger ticket?"

### `discount` (default: 0.20 = 20%)

The discount to the last primary round. Broker offered 15-20%. Default is 20% because:
- The sellers have idiosyncratic pressure (employee liquidity, fund cycle)
- Recent late-stage secondary market data (Pitchbook Q1 2025) shows premiums of ~6% for trophy assets, so 15-20% off is steep — meaning sellers are pressured
- Buyers should push for the deeper end of the broker's range

When to change: any time the user wants to test sensitivity. The discount sensitivity chart shows IRR at every discount level from 5% to 35%.

### `lastRoundVal` (default: $6,000,000,000)

The pre-money valuation of PsiQuantum's last primary round before the case date. March 2025 Series E was at $6B pre-money per the data room. **Do not change this** — it's a fact, not an assumption.

### `govFunding` (default: 1.0, in $B)

Total non-dilutive government funding directly benefiting PsiQuantum. Per the data room: ~$640M from Australia + $200M-1B Illinois package + $25M federal + DARPA. Conservative slice attributable to PsiQuantum directly is about $1B. The slider goes 0-2 to allow exploration.

When to change: if the user wants to model "what if Australian government pulls out?" (set to ~$200M) or "what if Illinois delivers the full $1B?" (set to ~1.5).

The slider provides a *suggested* dilution factor based on this value (more gov $ → less private dilution → higher dilution_factor → more ownership retained at exit). The suggestion is not enforced; the user can override.

### `dilutionFactor` (default: 0.85)

The fraction of starting ownership retained at exit after future fundraising rounds. 0.85 means the buyer loses 15% to dilution. This default assumes:

- 1-2 more private rounds before exit (typical for late-stage)
- ~5-10% dilution per round (typical late-stage round size relative to existing share count)
- Significant non-dilutive government funding offsetting private fundraising needs

When to change: 0.70-0.75 if no government funding, 0.90-0.95 if exit is imminent (no more rounds needed), 0.95+ if PsiQuantum is acquired before any further raises.

### Scenario parameters — three scenarios: `bad`, `okay`, `great`

Each has three knobs: `probability`, `exitValuationB` ($B), `exitYear`.

#### Bad case (default: 30% probability, $1.5B exit, 2030)

**Story:** PsiQuantum's photonic moonshot fails. They miss their utility-scale milestones, IBM/Google reach fault-tolerance first, and PsiQuantum is acquired for IP/team value.

**Why $1.5B:** Anchored to Xanadu's $1B 2022 valuation. PsiQuantum's 230+ patents, GlobalFoundries manufacturing relationship, and larger team justify a premium. This is the **acquisition floor** — even a complete moonshot failure leaves real value.

**Why 30% probability:** Acknowledges real risk (quantum is hard, photonic is unproven at fault-tolerant scale) but doesn't catastrophize. Photonic is the #2 most-funded approach in quantum after superconducting, so total wipeout is unlikely. McKinsey's data shows PsiQuantum is the best-funded quantum company globally — well-funded all-or-nothing bets don't usually go to zero, they get acquired.

**Why 2030:** PsiQuantum's roadmap targets utility-scale 2027-29. Failure to deliver becomes evident by 2029-2030. The acquisition would happen shortly after that.

#### Okay case (default: 50% probability, $20B exit, 2030)

**Story:** PsiQuantum hits its Brisbane and Chicago data center milestones roughly on schedule. They reach commercial maturity comparable to where Quantinuum is today. Acquired by a hyperscaler (NVIDIA, Microsoft, AWS) or chipmaker (Intel) around 2030, or IPOs.

**Why $20B:** Anchored to Quantinuum's current $10B valuation × 2x for five years of growth and PsiQuantum's bigger ambition. The 2x multiplier is supported by:
- Quantum market growth (McKinsey: 11-14% CAGR; over 5 years that's ~80% market expansion)
- PsiQuantum's larger scale ambition (utility vs. NISQ)
- Strategic premium for an acquisition by a hyperscaler

**Why 50% probability:** This is the most likely outcome and should carry the most probability weight. PsiQuantum has $2.3B in funding, government backing, GlobalFoundries partnership, DARPA endorsement — they probably reach commercial scale even if they don't dominate.

**Why 2030:** Brisbane targeted for 2027 operations, Chicago 2028. Commercial maturity by 2030 is one year after full system rollout — reasonable. Acquisition usually happens after a strong demonstration year.

#### Great case (default: 20% probability, $75B exit, 2033)

**Story:** PsiQuantum delivers true utility-scale by 2032-33. Becomes the dominant photonic infrastructure player. The "Nvidia of quantum" — core compute layer for the broader quantum economy. IPOs at category-defining scale.

**Why $75B:** Anchored to McKinsey's optimistic 2035 quantum computing market scenario of $72B revenue. With ~25% market share and a 10x revenue multiple (typical for category-leader deep tech infrastructure), $75B-180B is achievable. $75B is the conservative end of that range.

**Why 20% probability:** Big-tech outcomes are rare. 20% odds of category-defining dominance is actually optimistic for a single company in a competitive market. Going higher (30%+) is hard to defend in a panel interview because it requires assuming the market materializes AND PsiQuantum wins.

**Why 2033:** Utility-scale is harder than commercial scale. McKinsey's roadmap data shows most fault-tolerance milestones land 2029-2033. Dominance — meaning multiple deployed systems with repeat customers — comes 2-3 years after first utility-scale operation.

### Sum-to-100% constraint

The probabilities of bad + okay + great must sum to 1.0 (100%). The dashboard displays a warning if they don't. If a user changes one probability, prompt them to adjust the others, or auto-rebalance proportionally (do not silently auto-rebalance — let the user see the imbalance).

---

## 9. Presets

The dashboard has four preset buttons that load a complete scenario configuration. These exist to demonstrate the range of defensible outcomes:

| Preset | Bad prob | Okay prob | Great prob | Use to demonstrate |
|---|---|---|---|---|
| Skeptic | 45% | 45% | 10% | What it takes to make the deal not work |
| Base case | 30% | 50% | 20% | The candidate's primary recommendation |
| Bull | 15% | 45% | 40% | What the deal looks like if quantum truly takes off |
| All-or-nothing | 55% | 10% | 35% | The data room's framing — high probability of failure but the hits are huge |

**Why these matter for the interview:** The Skeptic preset typically misses the 25% hurdle, showing the candidate has thought about what would make them say no. The All-or-nothing preset usually still clears the hurdle despite high failure probability, which demonstrates the asymmetric upside of the deal.

---

## 10. Charts and what they communicate

### Chart 1: Outcome by scenario (horizontal bar chart)

Shows the dollar outcome of each scenario relative to:
- The starting investment (gray dashed line)
- The probability-weighted average (gold dashed line)

**Purpose:** Visualizes the asymmetric distribution. Bad case is below the entry line (loss); okay and great are well above. The probability-weighted average is the "expected" outcome.

### Chart 2: Comp benchmark

Plots scenario exit valuations next to real comparable transactions (Xanadu, Quantinuum, PsiQuantum's own rounds).

**Purpose:** Defense. When the interviewer asks "why is the okay case $20B?", the candidate points at this chart and says "Quantinuum is at $10B today. Two-fold growth over five years for a more-ambitious peer."

### Chart 3: Discount sensitivity

IRR curve from 5% to 35% discount, with the 25% hurdle line and current ask marked.

**Purpose:** Negotiation tool. Shows whether the deal still works at 15% (the broker's lower bound). Used in the memo to justify pushing for 20%.

### Chart 4: Tornado sensitivity

Each row tests how IRR moves when one variable swings between a low and high value, with everything else held constant. Sorted by impact magnitude.

**Purpose:** Tells the candidate which assumptions to defend hardest in the interview. Wider bar = more important assumption.

---

## 11. Code architecture

### File structure

```
psiquantum-dashboard/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
├── index.html
├── src/
│   ├── main.jsx          // React mount point
│   ├── App.jsx           // The entire dashboard component
│   └── index.css         // Global styles, fonts, dark theme
└── README.md
```

The dashboard is a **single-file React component** (`App.jsx`). This is intentional — it makes the code easy to read top-to-bottom and easy to deploy.

### Tech stack

- **React 18** (no router, no state management library — just `useState` and `useMemo`)
- **Recharts** for all charts (BarChart, LineChart)
- **Tailwind CSS** for layout (utility classes only, no custom components)
- **Inline styles** for theme colors (`backgroundColor`, custom hex values) — Tailwind arbitrary values like `bg-[#161311]` proved unreliable in some artifact environments, so theme colors use inline `style={{}}` for guaranteed rendering

### State structure

All state lives at the top of the `App()` component:

```javascript
const [investment, setInvestment] = useState(5_000_000);
const [discount, setDiscount] = useState(0.20);
const [lastRoundVal, setLastRoundVal] = useState(6_000_000_000);
const [govFunding, setGovFunding] = useState(1.0);     // in $B
const [dilutionFactor, setDilutionFactor] = useState(0.85);

const [scenarios, setScenarios] = useState({
  bad:   { probability: 0.30, exitValuationB: 1.5, exitYear: 2030 },
  okay:  { probability: 0.50, exitValuationB: 20,  exitYear: 2030 },
  great: { probability: 0.20, exitValuationB: 75,  exitYear: 2033 },
});
```

There is no localStorage, sessionStorage, or persistence. Refreshing the page resets to defaults. This is intentional — for an interview, you want a known starting state.

### Calculations

All math is in the pure function `computeOutcomes()` near the top of `App.jsx`. It's pure (no side effects) so it can be re-used for sensitivity analysis (the discount curve and tornado chart both call it with varied inputs).

### UI primitives

- `Slider`: range input with label, current value, and optional hint text
- `NumberField`: text input for direct number entry
- `SectionHeader`: numbered small-caps section divider
- `ScenarioPanel`: full slider set for one scenario (probability, exit valuation, exit year)
- `Metric`: large numeric output card

### Color palette (do not change without explicit user request)

- Background: `#161311` (warm near-black)
- Card background: `bg-stone-900/40` (with the inline-styled root, this renders as a slightly lighter dark)
- Primary text: `text-stone-100` to `text-stone-200`
- Secondary text: `text-stone-400`
- Hint text: `text-stone-500`
- Accent gold (positive, headlines): `#d4a574`
- Accent rust (negative, warnings): `#c97464`
- Bad scenario: `#9c4a3c`
- Okay scenario: `#a89060`
- Great scenario: `#d4a574`

### Typography

- Display (headers, big numbers): **Fraunces** (serif, editorial feel)
- Body / UI: **IBM Plex Sans**
- Numbers, monospace data: **IBM Plex Mono**

Loaded via Google Fonts in `index.css`. If you change fonts, update both `index.css` and any inline `font-family` references.

---

## 12. Common change patterns — where to make modifications

### Adding a new scenario (e.g., "neutral" between bad and okay)

1. In `scenarios` state: add a new key (e.g., `neutral`) with `probability`, `exitValuationB`, `exitYear`
2. In `SCENARIO_COLORS`: add a color (probably `#b07a4f` or similar muted brown)
3. In all four presets: add the new scenario with appropriate values, ensuring probabilities still sum to 1.0
4. In the scenarios section of the JSX: add a `<ScenarioPanel>` for it
5. In the bar chart: it'll auto-include because it iterates `outcomes.rows`
6. In the comp benchmark chart: add an entry to the `comps` array
7. In the talking points section: add a defense paragraph

### Changing the hurdle rate (currently 25%)

Find the `HURDLE` constant near the top of the file. Change to the new value. Update the references in the verdict text and the discount-sensitivity chart's reference line label.

### Adding a new sensitivity variable to the tornado

Edit the `tornadoData` `useMemo`. Add a new entry to the `variations` array with `label`, `low` (object of inputs to override), and `high` (same). The function automatically computes the IRR delta and sorts by impact.

### Adjusting the comp anchor list

Edit the `comps` array in the JSX. Each entry needs `name`, `val` (in $B), and `kind` (`comp`, `anchor`, `you`, `bad`, `okay`, `great`). The `kind` determines color.

### Changing the time-to-exit calculation

Currently `years_held = exit_year - 2025`. The `entryYear` constant is at the top of `App()`. Don't change this without thinking through the IRR calculation.

---

## 13. Defensibility principles — DO NOT VIOLATE

These are the rules that make this model worth building. Any change that violates them weakens the candidate's interview defense.

### Every exit valuation must anchor to either a comp or a published market projection

If the user asks for a great-case exit of $200B, push back. Ask what comp or market scenario justifies it. If they want $200B, the model can support it, but the comment in the code and the talking points need to update with the new justification.

### Probabilities must sum to exactly 1.0

If the user changes one scenario's probability, prompt them to choose how to rebalance the others. Don't silently rebalance.

### The dilution factor and government funding should move together

These are linked in reality — more government money means less private dilution. If a user dramatically changes one without the other, suggest the corresponding adjustment to the other.

### The bad case is "all-or-nothing failure," not "slow fade"

PsiQuantum doesn't build NISQ products that generate intermediate revenue. They either deliver utility-scale or they don't. Don't model a slow decline scenario — the data room explicitly frames this as binary.

### The 25% hurdle is the standard, but it's not a law of nature

If the user wants to test 20% or 30%, fine. Don't hard-code 25% in places where it can't be configured. The current `HURDLE` constant is the right pattern.

### Don't mix the case timeline with hindsight

The case scenario is set in **April 2025**. The September 2025 Series E at $7B is post-case. Use it only for ex-post validation, never as primary evidence in the recommendation. Same for any quantum hardware milestones announced after April 2025.

---

## 14. Things the user might ask for, with suggested approaches

### "Make the model more granular — five scenarios instead of three"

Doable but adds complexity. Suggest sticking with three and adding a "what-if these are wrong" sensitivity instead. If they insist, follow the "adding a new scenario" recipe in section 12.

### "Add a Monte Carlo simulation"

Replace the three discrete scenarios with continuous probability distributions over exit valuation, exit year, and dilution. Run 10,000 simulations. Display the resulting IRR distribution as a histogram. This is a meaningful step up in analytical rigor and would be appropriate for the interview if executed cleanly.

### "Compare to a public-market alternative (e.g., investing in IBM or NVDA instead)"

Add a benchmark line on the discount sensitivity chart showing the expected return of an alternative investment over the same horizon. NVDA's 5-year IRR has historically been ~50%; this would actually make the PsiQuantum deal look mediocre by comparison. That's a meaningful insight — let the user see it.

### "Make the dashboard print-friendly for the deck"

Add a `print` view that hides the inputs and shows only the verdict, scenario chart, comp chart, and talking points in a single A4-friendly layout. CSS `@media print` plus a "Print view" button.

### "Add a save/load button for assumption sets"

Use URL query parameters as the persistence mechanism (e.g., `?inv=5000000&discount=0.20&...`). This avoids localStorage (not always available) and lets the user share specific assumption sets with others by sharing a URL.

### "Translate to Spanish"

Doable. The candidate's user preferences mention they program primarily in Spanish. The interview will be in English (Integra is based in Miami, deal is in USD), so the dashboard should stay in English. But if asked, all visible strings can be extracted into a constants object for easy localization.

---

## 15. References

### Primary sources (used to anchor every number)

- **Investment Teaser (data room, 9 pages)** — provides PsiQuantum/Quantinuum/Xanadu profiles, valuations, and the "all-or-nothing" framing
- **McKinsey Quantum Technology Monitor, June 2025** — provides market sizing, competitive roadmaps, and funding landscape
- **Integra Groupe public materials** — provides investor thesis context (Better Future Fund, Anthropic/Neuralink portfolio per PitchBook)
- **PsiQuantum public announcements** — Series E March 2025, Brisbane partnership, Chicago site, Omega chipset, DARPA QBI selection

### Secondary sources

- Pitchbook Q1 2025 venture secondaries report — for benchmark on secondary discount/premium ranges
- Sourcery and SuperbCrew coverage of PsiQuantum's Series E — for confirmation of the $6B pre-money valuation
- Various quantum industry publications (Riverlane, Crispidea, Physics World) — for cross-validation of competitive landscape

### What the candidate is NOT relying on

- AI-generated market sizing without external citation
- Analyst estimates from sell-side reports (these tend to be promotional)
- Anything from the September 2025 Series E or later (post-case timeline)

---

## 16. Project goals — what success looks like

The dashboard succeeds if:

1. **The candidate can defend every number on screen** by referencing the comp or market projection it anchors to
2. **The interviewer is unable to break the model** with reasonable challenges to specific assumptions (the tornado chart shows what to defend hardest)
3. **The verdict (INVEST/PASS) survives most reasonable rebalancing** of probabilities and exit valuations — meaning the recommendation is robust, not knife-edge
4. **The presentation flows naturally** from "here's the deal" → "here's the model" → "drag the slider to see what happens" → "here's the recommendation"
5. **The candidate gets the job at Integra Groupe**

That last one is the actual goal. Everything else is in service of it.
