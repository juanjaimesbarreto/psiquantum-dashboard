# Model Fixes — PsiQuantum Dashboard

> **For Claude Code.** This file lists the specific data fixes to apply to the PsiQuantum dashboard (`src/App.jsx` and supporting talking-point text). Read `CLAUDE.md` first for the full project context — this document only covers the corrections, not the broader architecture.

The fixes are grouped by severity. Apply in order. After each group, run `npm run build` to confirm no compile errors. Do **not** alter the calculation logic or the scenario probabilities/exit valuations — those have been validated and stand. Only the **labels, talking points, and supporting commentary** need updating.

---

## Background: why these fixes are needed

The original memo and the supporting talking points in the dashboard contained five data-room/historical-fact errors that an interviewer can break by cross-referencing the data room or public sources. The corrections below align the dashboard's narrative with the corrected memo (`psiquantum_memo_CORRECTED.docx`). Every claim in the dashboard should now match either (a) the data room verbatim, (b) the McKinsey QT Monitor June 2025, or (c) explicitly-cited external research.

---

## Fix 1 — Remove BlackRock as lead of the March 2025 round (HIGHEST PRIORITY)

**Why:** The data room states the **2021 Series D** was led by BlackRock at ~$3.15B post-money. BlackRock did not lead the March 2025 round. Attributing the recent round to BlackRock is a factual error that any reader of the data room will flag in Q&A.

### What to change

Search the codebase for any string mentioning **"BlackRock"** in conjunction with the March 2025 round, the Series E, or the $6B valuation. Likely locations:

- `src/App.jsx` — talking-points sections, comp benchmark labels, hover tooltips
- `CLAUDE.md` — section 3 "PsiQuantum at a glance" mentions "BlackRock (lead)" without specifying which round
- Any header or annotation on the comp benchmark chart that ties BlackRock to the entry-round anchor

### Specific rewrites

| Find | Replace |
|---|---|
| `"$6B by BlackRock"` or `"$6B Series E led by BlackRock"` | `"$6B March 2025 Series E"` (no lead investor named) |
| `"BlackRock (lead)"` (in the strategic backers list) | `"BlackRock (lead of 2021 Series D)"` |
| Any tooltip on the PsiQuantum March 2025 comp anchor that says "BlackRock-led" | Remove the lead-investor reference; keep only the date and valuation |
| LP storytelling line in talking points: `"co-invest alongside BlackRock"` | `"co-invest alongside top-tier institutional backers (BlackRock, Founders Fund, Atomico, M12, Baillie Gifford, Temasek, Blackbird) and the Australian sovereign"` |

### Acceptance check

Grep the entire repo for `BlackRock` after the changes. The only remaining hits should be:
1. The 2021 Series D anchor (where BlackRock genuinely was the lead)
2. The strategic-backers list (where BlackRock appears as one of many investors)

There should be **zero** hits associating BlackRock with the March 2025 round, the September 2025 round, or the $6B valuation directly.

---

## Fix 2 — Quantinuum $10B valuation date: January 2024 → January 2025

**Why:** Quantinuum's $10B post-money valuation was announced **January 2025** (the $300M Honeywell-led raise). The memo and `CLAUDE.md` reference "January 2024" — that's wrong by a full year. Quantinuum was at ~$5B in early 2024.

### What to change

In `src/App.jsx`, find the `comps` array (per `CLAUDE.md` section 11). Locate the Quantinuum entry. The valuation ($10B) and the role as "okay case" anchor stay the same — only the **date label** changes.

```javascript
// BEFORE
{ name: "Quantinuum (Jan 2024)", val: 10, kind: "comp" }

// AFTER
{ name: "Quantinuum (Jan 2025)", val: 10, kind: "comp" }
```

Also update any talking-point text in the okay-case panel that says "from January 2024" → "as of January 2025".

In `CLAUDE.md` section 5 (comp transactions table), update:

```markdown
| Quantinuum | $10B post | Jan 2025 | Trapped ion | Real revenue, integrated stack, JPMorgan/BMW customers; "okay case" anchor |
```

### Acceptance check

Grep for `Jan 2024` and `January 2024` across the repo. There should be **zero** hits in the context of Quantinuum's valuation. (Note: the McKinsey report from June 2025 may still reference earlier 2024 Quantinuum data points — that's fine, those are different events.)

---

## Fix 3 — Soften GlobalFoundries detail

**Why:** The original memo claimed a "six-year joint development on a custom 300mm CMOS photonic process node." The PsiQuantum-GF partnership was announced in 2020-2021; depending on case-date interpretation it's been 4-6 years. The "custom process node" framing is marketing language not present in the data room. Softening protects the claim from challenge without losing its substance.

### What to change

Find any GlobalFoundries talking-points in `src/App.jsx`. Common phrases to update:

| Find | Replace |
|---|---|
| `"six-year joint development on a custom 300mm CMOS photonic process node"` | `"multi-year joint development on a 300mm CMOS photonic process"` |
| `"GlobalFoundries manufacturing partnership (6+ years)"` | `"GlobalFoundries manufacturing partnership (multi-year)"` |
| `"6-year GF partnership"` (any short form) | `"multi-year GF partnership"` |

The substantive claim (production-line CMOS, transferable IP, replacement-cost premium) stays. Only the time qualifier and "custom process node" phrasing change.

---

## Fix 4 — Reword "$2.3B cumulative R&D" claim

**Why:** $2.3B is **total private funding raised**, not strictly R&D spend. While most of the funding has flowed to R&D, conflating the two is a category error an analyst will catch. The data room uses "total private funding past $2.3 billion."

### What to change

| Find | Replace |
|---|---|
| `"PsiQuantum's $2.3B cumulative R&D"` | `"PsiQuantum's ~$2.3B in cumulative private funding (predominantly deployed into R&D)"` |
| `"$2.3B in R&D spend"` | `"$2.3B in cumulative funding"` |

This affects the bad-case talking points (the bottom-up patent IP valuation logic).

---

## Fix 5 — DARPA references: align with data room

**Why:** The data room cites **DARPA's US2QC program**. The original memo referenced DARPA QBI exclusively with a "50-expert panel" specific that's hard to verify cleanly. PsiQuantum has been selected for both programs — referencing both makes the claim more defensible and matches the data room.

### What to change

Find DARPA talking-point text. Likely phrasing to update:

| Find | Replace |
|---|---|
| `"DARPA QBI selection (February 2025): independent technical validation by a 50-expert panel under the Quantum Benchmarking Initiative"` | `"DARPA program selection: PsiQuantum is one of a small number of companies selected for DARPA's US2QC program (cited in the data room) and the Quantum Benchmarking Initiative; both involve independent technical evaluation by federal review panels."` |
| Any reference to "50-expert panel" alone | Remove or replace with "federal review panels" |

### Acceptance check

Grep for `QBI`. Any remaining hits should appear alongside US2QC, not as a sole DARPA reference.

---

## Fix 6 (OPTIONAL — UX improvement) — Add September 2025 round as ex-post validation marker

**Why:** The data room explicitly references a **September 2025 raise of $1B at $7B post-money**. `CLAUDE.md` section 3 correctly flags this as post-case (the case is set in April 2025), but the dashboard currently doesn't surface it at all. Adding it as a non-default comp anchor lets the user see directional validation that the $6B March 2025 entry-round wasn't an outlier.

### What to change

In the `comps` array in `src/App.jsx`, add a new entry:

```javascript
{
  name: "PsiQuantum (Sep 2025, post-case)",
  val: 7,
  kind: "anchor",  // muted color, similar to the 2021 round anchor
  note: "Ex-post validation only — after case date"
}
```

Order it chronologically in the array (between PsiQuantum March 2025 and the great-case scenarios).

If the comp benchmark chart supports per-entry styling, render this point with a dashed outline or 50% opacity to visually distinguish it as "post-case." Add a small annotation/tooltip explaining the post-case framing.

**Do NOT** make this the default `lastRoundVal` for the IRR calculation. The discount math anchors to the March 2025 round per `CLAUDE.md`'s defensibility principles. This is a **display-only** addition.

---

## Fix 7 (OPTIONAL — defensibility upgrade) — Add a "$7B alternative entry" toggle

**Why:** A skeptical interviewer may ask "what if the right anchor is the September 2025 $7B round, not the March 2025 $6B round?" Currently the user would have to manually edit `lastRoundVal`. A toggle makes the answer one click away.

### What to change

Add a small UI control near the `lastRoundVal` slider:

```javascript
const [entryAnchor, setEntryAnchor] = useState("march2025");
// "march2025" → lastRoundVal = 6_000_000_000
// "sep2025"   → lastRoundVal = 7_000_000_000
```

Two radio buttons:
- **March 2025 Series E ($6B pre)** — default, anchored to external research
- **September 2025 round ($7B post)** — post-case validation, more conservative entry

When the user toggles, `lastRoundVal` updates and all downstream calculations refresh automatically (they're derived via `useMemo`, so no extra wiring needed).

The verdict text should adapt: at the $7B anchor with a 20% discount, entry is $5.6B and IRR drops by ~3-4 percentage points. The deal still likely clears 25% under the base-case scenario weights, but the cushion is thinner. This is a useful talking point.

---

## Fix 8 — Update CLAUDE.md to reflect the corrections

**Why:** `CLAUDE.md` is the source of truth Claude (any future model) will read when editing the dashboard. Leaving stale data there will cause regressions.

### What to change in `CLAUDE.md`

**Section 3** ("PsiQuantum at a glance"):
- Strategic backers line: change `"BlackRock (lead)"` to `"BlackRock (lead of the 2021 Series D)"`
- Add to bullet list: `"Total funding raised: ~$2.3B+ (predominantly deployed into R&D given the absence of revenue products)"`

**Section 5** (comp transactions table):
- Change Quantinuum row: `Jan 2024` → `Jan 2025`

**Section 8** (`lastRoundVal` parameter description):
- Add a note: *"As of the case date (April 2025), the data room also references a September 2025 raise of $1B at $7B post-money. This is treated as ex-post validation only and is not the default anchor — the March 2025 Series E at $6B pre-money remains the primary anchor for discount calculations."*

**Section 16** (References / "What the candidate is NOT relying on"):
- Add: *"Lead-investor attributions for any round other than the 2021 Series D (where BlackRock is named as lead in the data room). The March 2025 and September 2025 round leads are not disclosed in any source we're treating as authoritative."*

---

## Apply order summary

1. **Fix 1** (BlackRock attribution) — highest priority, affects multiple files
2. **Fix 2** (Quantinuum date) — single line in `comps` array
3. **Fix 3** (GlobalFoundries softening) — find/replace across talking points
4. **Fix 4** (R&D wording) — find/replace in bad-case panel
5. **Fix 5** (DARPA references) — find/replace in validators panel
6. **Fix 8** (update CLAUDE.md) — required to prevent regression
7. **Fix 6** (Sep 2025 comp marker) — optional, nice-to-have
8. **Fix 7** ($7B toggle) — optional, biggest-effort upgrade

After all fixes, redeploy to Vercel:

```bash
git add -A
git commit -m "Fix factual errors: BlackRock attribution, Quantinuum date, GF wording, R&D framing, DARPA refs"
git push
```

Vercel will auto-build and update the production URL.

---

## What did NOT change (and why)

These items in the original memo were challenged during fact-checking but are **defensible as-is**:

- **`lastRoundVal` = $6B (March 2025 Series E pre-money):** Sourced from external research (per `CLAUDE.md` section 16). The assessment instructions explicitly invite independent research. The data room only discloses the 2021 Series D and the Sept 2025 raise, leaving a gap that external research fills.
- **Atom Computing 1,225 atoms:** Verified — Oct 2023 SC23 announcement. McKinsey's "1,180" figure is older.
- **All scenario probabilities (30/50/20) and exit valuations ($1.5B / $20B / $75B):** Anchored to comps and McKinsey market sizing per `CLAUDE.md` section 5. No change needed.
- **Government commitment "~$1B" aggregate:** Defensible — Australia ~$640M USD + Illinois package within $1B + federal grant $25M + DARPA. The data room's "$1B Illinois package" refers to the broader quantum-park initiative; PsiQuantum's direct slice is $200M+ per McKinsey p.46/51. Memo phrasing already reflects this distinction.
- **Nortel patent comp ($750K/patent in 2011):** Externally verifiable historical fact (Nortel's 2011 patent auction to the Apple/Microsoft consortium). Keep.
- **All IRR math:** Re-verified end-to-end. Bad case -23%, okay 29%, great 38%, weighted 31% over 5.6 years. All correct.

If an interviewer challenges any of these, the defense is in `CLAUDE.md` sections 5-8 and the memo's comp-anchor section.
