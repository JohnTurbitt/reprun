# RepRun

RepRun is a mobile-first race split analyzer for hybrid athletes. The MVP lets an athlete enter eight run splits and eight station splits, then uses a deterministic scoring engine to rank weak points, estimate recoverable time, and suggest the next training priorities.

## Tech Stack

- Next.js
- React
- TypeScript
- SCSS

Current analysis:

- run fade
- pacing volatility
- station benchmark gaps
- recoverability scoring
- top three time leaks
- realistic next target

Planned additions:

- Prisma
- PostgreSQL
- Auth
- Stripe
- saved report history

## Getting Started

Install dependencies:

```bash
npm install
```

Run the local dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run start
```

## Product Direction

The first paid feature should be a full race analytics report:

- split diagnosis
- biggest time leaks
- realistic next target
- station ranking
- four-week training priorities
- unlockable full report via Stripe

The app is intentionally web-first. Once the workflow is proven, it can become a PWA or be wrapped with Capacitor for app stores.
