# INE Price Tracker: Frontend

React (Vite) dashboard for the INE Software Engineer Intern assignment: search INE's mock store,
track a product option, and view its price/stock history, scrape log and CSV export.

- **Backend, scraper and full documentation:** https://github.com/Mitanshi2034/backend
  (start with `HOW_TO.md` there)
- **Deployed on:** Vercel

## Run locally

```bash
cp .env.example .env      # VITE_API_URL=http://localhost:4000
npm install
npm run dev               # http://localhost:5173
```

## Environment variables

| Variable | Example | Meaning |
|---|---|---|
| `VITE_API_URL` | `https://your-api.onrender.com` | Backend base URL (no trailing slash) |
