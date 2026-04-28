# RepRun

RepRun is a mobile-first race split analyzer for hybrid athletes. The MVP lets an athlete enter eight run splits and eight station splits, then uses a deterministic scoring engine to rank weak points, estimate recoverable time, and suggest the next training priorities.

## Tech Stack

- Next.js
- React
- TypeScript
- SCSS
- Prisma
- PostgreSQL

Current analysis:

- run fade
- pacing volatility
- station benchmark gaps
- recoverability scoring
- top three time leaks
- realistic next target

Backend foundation:

- Prisma schema for users, subscriptions, and race reports
- password hashing helpers
- report persistence mappers that keep the current UI shape separate from the database shape

Planned additions:

- Auth routes and sessions
- Stripe checkout and webhook handling
- server-backed saved report history

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
npm run test
npm run prisma:generate
npm run prisma:migrate
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
