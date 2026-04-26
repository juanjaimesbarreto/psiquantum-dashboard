# PsiQuantum Secondary — Decision Dashboard

Interactive scenario model built for the Integra Groupe investment analyst assessment.

## What it does

Live dashboard for evaluating the PsiQuantum secondary investment opportunity.
All assumptions adjustable via sliders. Outputs (IRR, scenario outcomes,
sensitivity analysis) update in real time.

## Local preview (optional, takes 2 minutes)

If you want to preview before deploying:

```bash
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`).

## Deploy to Vercel — three options

### Option A: Drag and drop (easiest, ~3 minutes)

1. Run `npm install` then `npm run build` locally — this creates a `dist/` folder
2. Go to https://vercel.com/new
3. Sign up with email or GitHub
4. Drag the entire project folder onto the page
5. Vercel detects Vite, builds, and gives you a URL like
   `psiquantum-dashboard-abc123.vercel.app`

### Option B: GitHub + Vercel (cleanest URL, ~10 minutes)

1. Create a new GitHub repo (e.g., `psiquantum-dashboard`)
2. Push this folder to it:
   ```bash
   git init
   git add .
   git commit -m "Initial dashboard"
   git remote add origin https://github.com/YOUR_USERNAME/psiquantum-dashboard.git
   git push -u origin main
   ```
3. Go to https://vercel.com/new
4. Click "Import Git Repository", select your repo
5. Click Deploy. Vercel auto-detects Vite settings.
6. Get a URL like `psiquantum-dashboard.vercel.app`
7. (Optional) In Vercel project settings, you can set a custom subdomain for
   free, or attach your own domain.

### Option C: Vercel CLI (for terminal users)

```bash
npm install -g vercel
vercel login
vercel        # follow prompts, accept defaults
vercel --prod # promote preview to production
```

## File structure

```
psiquantum-dashboard/
├── package.json          # dependencies and scripts
├── vite.config.js        # Vite + React config
├── tailwind.config.js    # Tailwind scan paths
├── postcss.config.js     # PostCSS plugins
├── vercel.json           # Vercel build settings
├── index.html            # HTML entry point
├── src/
│   ├── main.jsx          # React mount
│   ├── App.jsx           # The dashboard component
│   └── index.css         # Global styles + fonts
└── README.md             # This file
```

## Putting the link in your memo

Once deployed you'll have a URL like `https://psiquantum-dashboard.vercel.app`.
In your investment memo, add a line such as:

> **Interactive model:** [psiquantum-dashboard.vercel.app](https://psiquantum-dashboard.vercel.app)
> All assumptions in this memo can be adjusted live. Sensitivity analysis and
> comparable-company benchmarks update in real time.

For the presentation deck, screenshot the dashboard at key states (base case,
skeptic preset, bull preset) and include the URL on the appendix slide.

## Customizing before deploy

If you want to tweak before going live:

- **Change starting numbers:** edit `useState` defaults in `src/App.jsx`
  near the top of the `App()` function (look for `useState(5_000_000)` etc.)
- **Adjust presets:** edit the `presets` object in the same file
- **Change comp anchors:** edit the `comps` array

## Notes

- No backend required — everything is client-side React
- No data is stored or transmitted; assumption changes live in browser memory
  only and reset on page refresh
- Free Vercel tier handles this easily (it's a static site after build)
