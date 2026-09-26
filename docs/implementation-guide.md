# Vision One V1 implementation guide

## Step 1 — Repository foundation

Completed on `feature/vision-one-v1-foundation`:

- Workspace and package manifests
- Expo mobile welcome screen
- Strict backend TypeScript configuration
- Jest configuration and ledger/payment tests
- Supabase schema for profiles, wallets, currencies, transactions, ledger, rates, and audit logs
- Signup trigger that provisions five wallets
- Atomic simulated deposit and withdrawal functions with idempotency and ledger-balance validation
- RLS baseline policies
- Payment provider interface and `MockPaymentProvider`

## Step 2 — Supabase setup

Create a Supabase project, then apply migrations in order:

```bash
supabase db push
```

Required environment variables must stay outside Git:

```text
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # backend only; never mobile
```

## Step 3 — Authentication

Configure email/password authentication in Supabase. Registration must create the Auth user; the database trigger then creates the profile and KES/USD/EUR/GBP/JPY wallets.

## Step 4 — Financial operations

All deposit, withdrawal, transfer, exchange, and payment operations must be server-side functions. The mobile app may request an operation but may not write balances or transaction statuses.

## Step 5 — Verification checklist

- [ ] Apply migrations to a disposable Supabase project
- [ ] Confirm signup creates one profile and five wallets
- [ ] Confirm duplicate idempotency keys return the original result
- [ ] Confirm simulated deposits create balanced ledger entries
- [ ] Confirm simulated withdrawals reject insufficient funds
- [ ] Confirm direct client balance updates are denied by RLS
- [ ] Run backend typecheck and tests
- [ ] Add transfer and exchange functions

## Safety

This project uses simulated money only. Do not add provider credentials, production secrets, or real-money integrations to V1.
