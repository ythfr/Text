export type ProviderTransaction = {
  provider: string;
  providerReference: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
};

export type InternalTransaction = {
  provider: string;
  providerReference: string | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REVERSED';
};

export type ReconciliationAction =
  | { type: 'MARK_COMPLETED'; providerReference: string }
  | { type: 'MARK_FAILED'; providerReference: string }
  | { type: 'OPEN_REVIEW'; providerReference: string; reason: string }
  | { type: 'NOOP' };

export function decideReconciliation(provider: ProviderTransaction, internal: InternalTransaction | null): ReconciliationAction {
  if (!internal) return { type: 'OPEN_REVIEW', providerReference: provider.providerReference, reason: 'Provider transaction has no internal record' };
  if (provider.status === 'COMPLETED' && internal.status !== 'COMPLETED') return { type: 'MARK_COMPLETED', providerReference: provider.providerReference };
  if (provider.status === 'FAILED' && !['FAILED', 'CANCELLED'].includes(internal.status)) return { type: 'MARK_FAILED', providerReference: provider.providerReference };
  if (provider.status === 'REVERSED' && internal.status !== 'REVERSED') return { type: 'OPEN_REVIEW', providerReference: provider.providerReference, reason: 'Reversal requires controlled ledger review' };
  return { type: 'NOOP' };
}
