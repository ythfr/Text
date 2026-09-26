alter table public.transactions
  add column if not exists provider text,
  add column if not exists provider_reference text,
  add column if not exists failure_code text,
  add column if not exists failure_message text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create unique index if not exists transactions_provider_reference_idx
  on public.transactions(provider, provider_reference)
  where provider_reference is not null;

create table if not exists public.provider_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  payload jsonb not null,
  signature_valid boolean not null default false,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

alter table public.provider_events enable row level security;
