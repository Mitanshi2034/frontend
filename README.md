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
```bash
git clone https://github.com/Mitanshi2034/frontend.git
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:4000
npm install
npm run dev               # http://localhost:5173
```
Requires the backend running locally (or point `VITE_API_URL` at the live API).

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
