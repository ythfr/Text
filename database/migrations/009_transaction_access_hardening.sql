-- Users may see only ledger records that contain one of their wallets.
drop policy if exists ledger_transactions_select_authenticated on public.ledger_transactions;
drop policy if exists ledger_entries_select_authenticated on public.ledger_entries;

create policy ledger_transactions_select_own
  on public.ledger_transactions for select
  to authenticated
  using (
    exists (
      select 1
      from public.ledger_entries e
      join public.wallets w on w.id = e.wallet_id
      where e.ledger_transaction_id = ledger_transactions.id
        and w.user_id = auth.uid()
    )
  );

create policy ledger_entries_select_own
  on public.ledger_entries for select
  to authenticated
  using (
    exists (
      select 1 from public.wallets w
      where w.id = ledger_entries.wallet_id
        and w.user_id = auth.uid()
    )
  );

create index if not exists ledger_transactions_created_idx
  on public.ledger_transactions(created_at desc);
