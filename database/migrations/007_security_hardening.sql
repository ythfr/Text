-- Security hardening: clients may read their own financial records but cannot write them.

alter table public.currencies enable row level security;
alter table public.ledger_accounts enable row level security;
alter table public.exchange_rates enable row level security;

create policy currencies_read_authenticated
  on public.currencies for select
  to authenticated
  using (active = true);

create policy exchange_rates_read_authenticated
  on public.exchange_rates for select
  to authenticated
  using (true);

create policy ledger_accounts_read_authenticated
  on public.ledger_accounts for select
  to authenticated
  using (false);

create policy provider_events_no_client_access
  on public.provider_events for all
  to authenticated
  using (false)
  with check (false);

create policy reconciliation_cases_no_client_access
  on public.reconciliation_cases for all
  to authenticated
  using (false)
  with check (false);

revoke insert, update, delete on public.wallets from anon, authenticated;
revoke insert, update, delete on public.transactions from anon, authenticated;
revoke insert, update, delete on public.ledger_transactions from anon, authenticated;
revoke insert, update, delete on public.ledger_entries from anon, authenticated;
revoke insert, update, delete on public.provider_events from anon, authenticated;
revoke insert, update, delete on public.reconciliation_cases from anon, authenticated;
revoke insert, update, delete on public.audit_logs from anon, authenticated;

-- Financial mutation is exclusively through controlled SECURITY DEFINER functions.
revoke all on function public.simulated_deposit(uuid, text, numeric, text, text) from public;
grant execute on function public.simulated_deposit(uuid, text, numeric, text, text) to authenticated;
