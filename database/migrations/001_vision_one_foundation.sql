create extension if not exists pgcrypto;

create type public.account_status as enum ('ACTIVE', 'SUSPENDED', 'CLOSED');
create type public.transaction_type as enum ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'EXCHANGE', 'PAYMENT', 'REFUND', 'FEE');
create type public.transaction_status as enum ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REVERSED');
create type public.ledger_entry_type as enum ('DEBIT', 'CREDIT');

create table public.currencies (
  code text primary key check (code in ('KES', 'USD', 'EUR', 'GBP', 'JPY')),
  name text not null,
  symbol text not null,
  decimal_places smallint not null check (decimal_places between 0 and 6),
  active boolean not null default true
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  phone text unique,
  full_name text not null,
  country text,
  status public.account_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  currency_code text not null references public.currencies(code),
  balance numeric(30, 8) not null default 0 check (balance >= 0),
  status public.account_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, currency_code)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  user_id uuid not null references public.profiles(id),
  type public.transaction_type not null,
  status public.transaction_status not null default 'PENDING',
  description text not null,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, idempotency_key)
);

create table public.ledger_transactions (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  type public.transaction_type not null,
  currency_code text not null references public.currencies(code),
  status public.transaction_status not null default 'PENDING',
  created_at timestamptz not null default now()
);

create table public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  ledger_transaction_id uuid not null references public.ledger_transactions(id) on delete restrict,
  wallet_id uuid not null references public.wallets(id) on delete restrict,
  entry_type public.ledger_entry_type not null,
  amount numeric(30, 8) not null check (amount > 0),
  created_at timestamptz not null default now()
);

create table public.exchange_rates (
  id uuid primary key default gen_random_uuid(),
  base_currency text not null references public.currencies(code),
  quote_currency text not null references public.currencies(code),
  rate numeric(30, 12) not null check (rate > 0),
  source text not null,
  captured_at timestamptz not null default now(),
  check (base_currency <> quote_currency)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  action text not null,
  request_id text,
  ip_address inet,
  device_id text,
  result text not null,
  created_at timestamptz not null default now()
);

create index wallets_user_idx on public.wallets(user_id);
create index transactions_user_created_idx on public.transactions(user_id, created_at desc);
create index ledger_entries_transaction_idx on public.ledger_entries(ledger_transaction_id);

alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.transactions enable row level security;
alter table public.ledger_transactions enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.audit_logs enable row level security;

insert into public.currencies (code, name, symbol, decimal_places) values
  ('KES', 'Kenyan Shilling', 'KSh', 2),
  ('USD', 'United States Dollar', '$', 2),
  ('EUR', 'Euro', '€', 2),
  ('GBP', 'British Pound', '£', 2),
  ('JPY', 'Japanese Yen', '¥', 0)
on conflict (code) do nothing;
