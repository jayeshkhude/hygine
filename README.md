# city-hygiene-risk-monitor

> your city is dirty. now there's a dashboard for it.

A production-ready civic tech platform for reporting, tracking, and analyzing hygiene risks across urban areas — built with Next.js, Redis TTLs, and zero tolerance for garbage (literally).

---

## what it does

citizens drop reports. the system auto-classifies risk. city officials get a live map with color-coded chaos. data self-destructs after it's no longer relevant. no manual cleanup, no stale pins.

```
citizen submits report
       ↓
api validates + scores it (1–10)
       ↓
stored in redis with TTL
       ↓
map updates in real-time
       ↓
auto-expires by category
```

---

## risk categories

| category | risk | score | auto-expires |
|---|---|---|---|
| dead animal | high | 10 | 1 day |
| sewage overflow | high | 9 | 2 days |
| mosquito breeding | medium | 8 | 3 days |
| garbage | medium | 7 | 5 days |
| unclean toilet | low | 5 | 7 days |
| festival waste | low | 4 | 7 days |
| general dirty | low | 3 | 7 days |

---

## stack

**frontend** — Next.js 14, Tailwind CSS, React Leaflet, Recharts

**backend** — Next.js API Routes, Upstash Redis (TTL-based storage)

**infra** — Vercel-ready, rate limiting built-in (5 req/min per IP)

**type safety** — full TypeScript throughout

---

## getting started

**prereqs:** Node.js 18+, an [Upstash](https://upstash.com) Redis account (free tier works)

```bash
git clone <repo-url>
cd city-hygiene-risk-monitor
npm install
```

create `.env.local`:

```env
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

```bash
npm run dev
# → localhost:3000
```

---

## api

```
POST   /api/reports          submit a new report
GET    /api/reports          list reports (supports filters)
PUT    /api/reports/:id      update report (admin)
DELETE /api/reports/:id      remove report (admin)
GET    /api/dashboard        analytics + stats
```

**query params:** `from`, `to`, `category`, `risk`, `bbox`

---

## add a new category

in `app/utils/riskCalculation.ts`:

```ts
new_category: {
  risk: 'medium',
  score: 6,
  expiryDays: 4,
  mapStyle: {
    color: '#F97316',
    size: 18
  }
}
```

---

## deploy

push to GitHub, import on [Vercel](https://vercel.com), add your env vars, done.

for other platforms (Netlify, Railway, Render, AWS) — see `DEPLOYMENT.md`.

---

## security

- rate limiting: 5 requests/min per IP
- input sanitization on all endpoints
- auto data expiry via Redis TTL
- coordinate boundary validation
- one report per user per day

---

## csv upload format

```
text,location,date
"Garbage overflow near station","MG Road, Pune","2024-01-15"
```

---

## contributing

fork → branch → change → pr. that's it.

---

## license

MIT — use it, fork it, build on it.

---

*built for cleaner cities.*
