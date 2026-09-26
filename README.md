# Vision One 🌍

**Your money. One wallet. Everywhere.**

Vision One is an Android-first, multi-currency wallet prototype. V1 uses simulated/test money only. It is not a bank and must not be used to process real customer funds.

## V1 foundation

- React Native + Expo + TypeScript mobile structure
- TypeScript backend structure
- PostgreSQL/Supabase migration for profiles, currencies, wallets, transactions, and double-entry ledger
- Supported currencies: KES, USD, EUR, GBP, JPY
- Backend-controlled balance model
- Idempotency and audit-log foundations

## Repository layout

```text
apps/mobile/   Expo mobile application
backend/       TypeScript API and domain services
database/      PostgreSQL migrations and seeds
docs/          Architecture and security notes
```

## Safety rules

- The mobile client never writes wallet balances.
- Financial operations must be authenticated, authorized, validated, idempotent, and recorded in the ledger.
- Every ledger transaction must balance total debits and credits.
- No production provider credentials belong in the mobile app.
- Real-money services require appropriately licensed partners and regulatory approval.

## Next steps

1. Configure a Supabase project and environment variables.
2. Apply the database migration.
3. Implement authenticated Edge Functions/API operations.
4. Add the Expo screens and tests.
