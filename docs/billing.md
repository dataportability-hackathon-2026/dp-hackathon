# Billing Infrastructure

Pre-paid credits via Stripe Checkout. Credits stored as **integer millicredits** (1 credit = 1000).

## Architecture

```
User buys pack → Stripe Checkout → Webhook → completePurchase() → credits added
AI call → checkAffordability() → deductCredits() (atomic) → usageLog insert
```

## Credit Packs

| Slug | Credits | Price |
|------|---------|-------|
| `starter_25` | 25,000 mc | $10 |
| `pro_75` | 75,000 mc | $25 |
| `mega_200` | 200,000 mc | $59 |

Defined in `src/lib/credit-packs.ts`.

## Database

SQLite via Drizzle + libsql. Schema in `src/db/schema.ts`.

| Table | Purpose |
|-------|---------|
| `user` | Auth + `creditBalance`, `stripeCustomerId` |
| `session/account/verification` | better-auth tables |
| `credit_purchase` | Each pack purchase (unique on `stripeCheckoutSessionId`) |
| `credit_ledger` | Immutable log of every credit change |
| `usage_log` | Every AI call with tokens + credits consumed |

### Migrations

```bash
DATABASE_URL=file:local.db bunx drizzle-kit generate
DATABASE_URL=file:local.db bunx drizzle-kit migrate
```

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/[...all]` | * | better-auth catch-all |
| `/api/billing/checkout` | POST | `{ packSlug }` → `{ checkoutUrl }` |
| `/api/billing/balance` | GET | `{ balance, displayCredits }` |
| `/api/billing/purchases` | GET | Purchase history |
| `/api/usage` | GET | Paginated usage (`?limit=&offset=`) |
| `/api/usage/check` | POST | `{ estimatedCredits }` → `{ affordable, balance }` |
| `/api/webhooks/stripe` | POST | Handles `checkout.session.completed` |

Middleware (`src/middleware.ts`) protects `/api/billing/*` and `/api/usage/*` via session cookie.

## Core Functions

**`src/lib/credits.ts`**
- `getBalance(userId)` — read balance
- `deductCredits(userId, amount, desc)` — atomic: `WHERE balance >= amount` + ledger insert in one tx
- `addCredits(userId, amount, type, desc)` — tx: update balance + ledger
- `completePurchase(checkoutSessionId)` — idempotent: skips if already completed

**`src/lib/usage.ts`**
- `recordUsage(params)` — deduct + log in one call
- `checkAffordability(userId, estimated)` — balance check
- `getUsageHistory(userId, limit, offset)` — paginated query

## Frontend

- `CreditProvider` in layout — polls `/api/billing/balance` every 30s
- `useCredits()` — `{ balance, displayCredits, loading, refresh }`
- `useUsage()` — `{ usage, loading, error }`
- `<UsageDialog />` — real usage data with daily breakdown
- `<BillingDialog />` — live balance, pack purchase with loading spinners

## Env Vars

```
DATABASE_URL=file:local.db
DATABASE_AUTH_TOKEN=
BETTER_AUTH_SECRET=<openssl rand -hex 32>
BETTER_AUTH_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Local Testing

```bash
# Terminal 1: dev server
bun dev

# Terminal 2: forward Stripe webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret from `stripe listen` output into `STRIPE_WEBHOOK_SECRET`.
