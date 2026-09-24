import { requireSupabase } from './supabase';

function idempotencyKey(action: string, currency: string, amount: number): string {
  return `${action}:${currency}:${amount}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
}

export async function simulatedDeposit(userId: string, currency: string, amount: number) {
  if (!userId || !currency || !Number.isFinite(amount) || amount <= 0) throw new Error('Enter a valid amount');
  const { data, error } = await requireSupabase().rpc('simulated_deposit', {
    p_user_id: userId,
    p_currency_code: currency,
    p_amount: amount,
    p_idempotency_key: idempotencyKey('deposit', currency, amount),
  });
  if (error) throw error;
  return data;
}

export async function simulatedWithdrawal(userId: string, currency: string, amount: number) {
  if (!userId || !currency || !Number.isFinite(amount) || amount <= 0) throw new Error('Enter a valid amount');
  const { data, error } = await requireSupabase().rpc('simulated_withdrawal', {
    p_user_id: userId,
    p_currency_code: currency,
    p_amount: amount,
    p_idempotency_key: idempotencyKey('withdrawal', currency, amount),
  });
  if (error) throw error;
  return data;
}
