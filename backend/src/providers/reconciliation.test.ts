import { decideReconciliation } from './reconciliation';

describe('provider reconciliation', () => {
  it('completes a pending internal transaction when provider completed', () => {
    expect(decideReconciliation(
      { provider: 'daraja', providerReference: 'P-1', status: 'COMPLETED' },
      { provider: 'daraja', providerReference: 'P-1', status: 'PENDING' },
    )).toEqual({ type: 'MARK_COMPLETED', providerReference: 'P-1' });
  });

  it('opens review for an unknown provider transaction', () => {
    expect(decideReconciliation(
      { provider: 'stripe', providerReference: 'P-2', status: 'COMPLETED' },
      null,
    ).type).toBe('OPEN_REVIEW');
  });
});
