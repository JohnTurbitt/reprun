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
- four-week deterministic training focus

Backend foundation:

- Prisma schema for users, subscriptions, and race reports
- password hashing helpers
- report persistence mappers that keep the current UI shape separate from the database shape
- Auth routes and sessions
- server-backed saved report history
- Stripe checkout route and subscription webhook

Planned additions:

- Stripe customer portal
- paid report export and sharing

## Paid Report Boundary

Free users see the projected finish, run summary, target gap, and the first two
ranked leaks. Paid users unlock the full leak list, training priorities,
four-week focus, target simulator, station ranking, print view, and calculation
breakdown.

## Stripe Setup

Add these values to `.env` before testing checkout:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
```

The checkout endpoint is `POST /api/billing/checkout`. Configure Stripe
webhooks to send subscription events to `/api/billing/webhook`.

## Local Stripe Test Flow

Run RepRun:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3002
```

In a separate terminal, forward Stripe webhooks:

```powershell
& "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Stripe.StripeCli_Microsoft.Winget.Source_8wekyb3d8bbwe\stripe.exe" listen --forward-to http://127.0.0.1:3002/api/billing/webhook
```

Use the `whsec_...` value printed by the Stripe CLI as
`STRIPE_WEBHOOK_SECRET`, then restart the dev server.

To test checkout:

1. Sign in or create a local RepRun account.
2. Generate a report.
3. Click `Unlock full report`.
4. Use Stripe test card `4242 4242 4242 4242` with any future expiry date
   and any CVC.
5. Keep the webhook listener running so the account is upgraded to paid access
   after checkout completes.

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

For preview handoff steps, see [TESTING.md](./TESTING.md).

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
