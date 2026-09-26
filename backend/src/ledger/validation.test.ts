import { assertBalanced, assertPositiveAmount } from './validation';

describe('ledger validation', () => {
  it('accepts balanced entries', () => {
    expect(() => assertBalanced([
      { side: 'DEBIT', amount: 100 },
      { side: 'CREDIT', amount: 100 },
    ])).not.toThrow();
  });

  it('rejects unbalanced entries', () => {
    expect(() => assertBalanced([
      { side: 'DEBIT', amount: 100 },
      { side: 'CREDIT', amount: 99 },
    ])).toThrow('Ledger transaction is unbalanced');
  });

  it('rejects non-positive amounts', () => {
    expect(() => assertPositiveAmount(0)).toThrow('Amount must be a positive finite number');
  });
});
