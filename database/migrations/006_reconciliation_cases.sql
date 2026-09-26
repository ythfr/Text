create table if not exists public.reconciliation_cases (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_reference text not null,
  reason text not null,
  status text not null default 'OPEN' check (status in ('OPEN', 'RESOLVED', 'ESCALATED')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists reconciliation_cases_open_idx
  on public.reconciliation_cases(status, created_at)
  where status <> 'RESOLVED';

alter table public.reconciliation_cases enable row level security;
