# RepRun

RepRun is a mobile-first race split analyzer for hybrid athletes. The MVP lets an athlete enter eight run splits and eight station splits, then returns a practical breakdown of where time is leaking and what to focus on next.

## Tech Stack

- Next.js
- React
- TypeScript
- SCSS

Planned additions:

- Prisma
- PostgreSQL
- Auth
- Stripe
- AI-generated report copy

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

The first paid feature should be a race report:

- split diagnosis
- biggest time leaks
- realistic next target
- four-week training priorities
- unlockable full report via Stripe

The app is intentionally web-first. Once the workflow is proven, it can become a PWA or be wrapped with Capacitor for app stores.
