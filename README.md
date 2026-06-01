# Ocht

Ocht is a Next.js app for hybrid race split analysis. Athletes can enter run
and station splits, generate a deterministic race report, save reports to an
account, and unlock premium report sections with Stripe.

## Stack

- Next.js 15
- React 19
- TypeScript
- SCSS
- Prisma 7
- PostgreSQL
- Stripe
- Resend
- Vercel Analytics

## Main Features

- HYROX, TRYKA 800, TRYKA 500, and custom race formats
- race split analysis, run fade, station leaks, readiness, target path
- saved reports and report history
- account signup/login with beta signup code support
- password reset and email verification via Resend
- Stripe checkout, webhooks, and billing portal
- premium report sections, sharing/export, and custom templates
- curated upcoming HYROX/TRYKA events menu

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local env file:

```bash
cp .env.example .env
```

Fill in at least:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ocht?schema=public"
NEXT_PUBLIC_APP_URL=http://127.0.0.1:3002
NEXT_PUBLIC_ANALYTICS_ENABLED=false
```

Optional local values:

```env
BETA_SIGNUP_CODE=ocht-beta-2026
RESEND_API_KEY=re_...
EMAIL_FROM="Ocht <support@ocht.app>"
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...
```

Run Prisma migrations:

```bash
npm run prisma:migrate
```

Start the app:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:3002
```

## Database

The app expects PostgreSQL and Prisma migrations in `prisma/migrations`.

Useful commands:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

For production/preview databases, use:

```bash
npx prisma migrate deploy
```

## Email Setup

Email is handled by Resend.

Required env vars:

```env
RESEND_API_KEY=re_...
EMAIL_FROM="Ocht <support@ocht.app>"
```

In Vercel, enter `EMAIL_FROM` without wrapping quotes:

```text
Ocht <support@ocht.app>
```

Password reset route:

```text
POST /api/auth/forgot-password
```

Email verification routes:

```text
POST /api/auth/resend-verification
POST /api/auth/verify-email
```

## Stripe Setup

Required env vars:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...
```

Endpoints:

```text
POST /api/billing/checkout
POST /api/billing/portal
POST /api/billing/webhook
```

For local webhook testing, run Stripe CLI and forward to:

```text
http://127.0.0.1:3002/api/billing/webhook
```

Use Stripe test card:

```text
4242 4242 4242 4242
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:watch
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

## Production Checklist

Set these in Vercel:

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=https://ocht.app
NEXT_PUBLIC_ANALYTICS_ENABLED=true
BETA_SIGNUP_CODE=...
RESEND_API_KEY=re_...
EMAIL_FROM=Ocht <support@ocht.app>
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...
```

Before deploy:

```bash
npm run lint
npm test
npm run build
npx prisma migrate deploy
```

Also check:

- Resend domain is verified.
- Stripe webhook points to `/api/billing/webhook`.
- `NEXT_PUBLIC_APP_URL` matches the real production origin.
- Any exposed database/API keys have been rotated.

## Notes For Developers

- `.env` must never be committed.
- Public/client env vars must start with `NEXT_PUBLIC_`.
- Server-only secrets stay in normal env vars.
- API routes use origin checks and rate limits for browser mutations.
- Reports are recalculated server-side before saving.
- Premium status is stored on `User.subscription` and updated by Stripe webhooks.

For preview/testing notes, see [TESTING.md](./TESTING.md).
