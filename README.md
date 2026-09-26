# INE Price Tracker: Frontend

React (Vite) dashboard for tracking the price and stock of products in INE's mock store.

| | |
|---|---|
| **Live site** | https://ine-tracker-price.vercel.app |
| **Backend, scraper, design note** | https://github.com/Mitanshi2034/backend (see its README and DESIGN_NOTE) |

## What it does
- **Search** the store by partial or full product name, open a product, pick one option, and **track** it
  (the first price check starts immediately).
- **Tracked products** with their latest price, the outcome of the last check, and how long ago it ran.
- **Price and stock charts** on a shared time axis. Failed checks break the line and are marked, so gaps are visible.
- **Scrape log** of every attempt (`success` / `retried` / `failed`) with price, stock, tries, duration and what happened.
- **Recent runs**, so you can see the 2-hour schedule actually firing.
- **Actions:** check now, change frequency, pause/resume, remove.
- **Export CSV** of the full scrape history.

The page refreshes itself every 20 seconds, and every 4 seconds while a run is in progress.

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
Import the repo in Vercel (framework preset **Vite**, build `npm run build`, output `dist`) and set `VITE_API_URL`.
Add the resulting URL to the backend's `CORS_ORIGIN`.

## Stack
React 19 · Vite 8 · Recharts · plain CSS (dark, frosted-glass design, no UI kit).
