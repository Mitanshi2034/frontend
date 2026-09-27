# CIPHER: INE Price Tracker (Frontend)

**CIPHER** is a React (Vite) dashboard that tracks the price and stock of products in INE's mock store. The store encrypts
its prices behind a browser challenge, and CIPHER decodes them on a schedule.

| | |
|---|---|
| **Live site** | https://ine-tracker-price.vercel.app |
| **Backend, scraper, design note** | https://github.com/Mitanshi2034/backend (see its README and DESIGN_NOTE) |

## Pages
| Page | What it shows |
|---|---|
| **Overview** `/` | Summary (products tracked, checks in the last 24 h, % of checks that got a price, next scheduled check), a card per tracked product (price, change since last check, trend line, stock, last check), and an **Alerts** panel: price drops and rises, back in stock, sold out, store layout changes |
| **Product** `/product/:id` | Current price with change and MRP, stock, delivery, seller, rating; where today's price sits between the lowest, average and highest ever recorded; price and stock charts with time ranges (failed checks break the line and are marked); its alerts and full scrape log. Actions: **Check now**, and in the ⋯ menu the check frequency (bonus: per-product frequency) and **Stop tracking** |
| **Activity** `/activity` | Every scrape attempt across all products (`success` / `retried` / `failed`), filterable, (Export CSV is in the navbar) |
| **Status** `/status` | The scheduler: scheduled runs so far, next run, success rate, average check time, run history, and how a run works |

**Tracking a product:** the search box on the Overview searches all 960 store products. Products you already track are
listed first; pick any other, choose one option, and the first check starts immediately.

The data refreshes itself every 20 seconds, and every 4 seconds while a run is in progress.

## Run locally

The dashboard needs the **backend API** running. The full step-by-step guide for both repos, including the Supabase
database and troubleshooting, is in the backend README:
**[Run the whole project locally](https://github.com/Mitanshi2034/backend#run-the-whole-project-locally)**.

Quick version:
```bash
mkdir cipher && cd cipher
git clone https://github.com/Mitanshi2034/backend.git
git clone https://github.com/Mitanshi2034/frontend.git

# terminal 1: backend (see its README for the .env values)
cd backend && npm install && npx playwright install chromium
cp .env.example .env        # set DATABASE_URL and CRON_SECRET
npm run db:migrate && npm run dev          # http://localhost:4000

# terminal 2: frontend
cd frontend && npm install
cp .env.example .env        # VITE_API_URL=http://localhost:4000
npm run dev                                 # http://localhost:5173
```

**Frontend only, against the live API** (no database or backend needed):
```bash
git clone https://github.com/Mitanshi2034/frontend.git && cd frontend
npm install
echo "VITE_API_URL=https://ine-price-tracker-api-iwhp.onrender.com" > .env
npm run dev
```
This works because the deployed API's `CORS_ORIGIN` includes `http://localhost:5173`. If you point it at your own backend, add `http://localhost:5173` to that backend's `CORS_ORIGIN`.

### Commands
| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload (http://localhost:5173) |
| `npm run build` | Production build into `dist/` (what Vercel runs) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint with oxlint |

## Environment variables
| Variable | Example | Meaning |
|---|---|---|
| `VITE_API_URL` | `https://ine-price-tracker-api-iwhp.onrender.com` | Backend base URL, no trailing slash. Baked in at build time, so redeploy after changing it |

## Deploy (Vercel)
`vercel.json` rewrites every path to `index.html`, so links like `/product/3` work on refresh.
Import the repo in Vercel (framework preset **Vite**, build `npm run build`, output `dist`) and set `VITE_API_URL`.
Add the resulting URL to the backend's `CORS_ORIGIN`.

## Stack
React 19 · Vite 8 · React Router 7 · Recharts · plain CSS (dark, frosted-glass design, no UI kit or icon pack; the logo and status marks are hand-drawn SVG). Fonts: Michroma (wordmark), Instrument Sans (text), IBM Plex Mono (numbers).
