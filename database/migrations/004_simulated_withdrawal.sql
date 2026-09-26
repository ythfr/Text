create or replace function public.simulated_withdrawal(
  p_user_id uuid,
  p_currency_code text,
  p_amount numeric,
  p_idempotency_key text,
  p_description text default 'Simulated withdrawal'
)
returns table(reference text, transaction_id uuid, status public.transaction_status)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wallet public.wallets;
  v_ledger public.ledger_transactions;
  v_transaction public.transactions;
  v_funding_account public.ledger_accounts;
  v_reference text := 'SIM-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 18));
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Amount must be positive';
  end if;
  if p_user_id <> auth.uid() then
    raise exception 'Not authorized';
  end if;

  select * into v_transaction
  from public.transactions
  where user_id = p_user_id and idempotency_key = p_idempotency_key;
  if found then
    return query select v_transaction.reference, v_transaction.id, v_transaction.status;
    return;
  end if;

  select * into v_wallet
  from public.wallets
  where user_id = p_user_id
    and currency_code = p_currency_code
    and status = 'ACTIVE'
  for update;
  if not found then raise exception 'Active wallet not found'; end if;
  if v_wallet.balance < p_amount then raise exception 'Insufficient funds'; end if;

  select * into v_funding_account
  from public.ledger_accounts
  where code = 'SIMULATED_FUNDING_' || p_currency_code;
  if not found then raise exception 'Currency is not supported'; end if;

  insert into public.transactions(reference, user_id, type, status, description, idempotency_key, completed_at)
  values (v_reference, p_user_id, 'WITHDRAWAL', 'COMPLETED', p_description, p_idempotency_key, now())
  returning * into v_transaction;

  insert into public.ledger_transactions(reference, type, currency_code, status)
  values (v_reference, 'WITHDRAWAL', p_currency_code, 'COMPLETED')
  returning * into v_ledger;

  insert into public.ledger_entries(ledger_transaction_id, wallet_id, entry_type, amount)
  values (v_ledger.id, v_wallet.id, 'DEBIT', p_amount);
  insert into public.ledger_entries(ledger_transaction_id, account_id, entry_type, amount)
  values (v_ledger.id, v_funding_account.id, 'CREDIT', p_amount);

  if not public.is_ledger_transaction_balanced(v_ledger.id) then
    raise exception 'Unbalanced ledger transaction';
  end if;

  update public.wallets
  set balance = balance - p_amount, updated_at = now()
  where id = v_wallet.id;

  insert into public.audit_logs(user_id, action, result)
  values (p_user_id, 'WITHDRAWAL_CREATED', 'SUCCESS');

  return query select v_transaction.reference, v_transaction.id, v_transaction.status;
end;
$$;

revoke all on function public.simulated_withdrawal(uuid, text, numeric, text, text) from public;
grant execute on function public.simulated_withdrawal(uuid, text, numeric, text, text) to authenticated;
