import { assertBalanced, assertPositiveAmount } from './validation';

describe('simulated withdrawal rules', () => {
  it('uses a wallet debit and funding-account credit', () => {
    expect(() => assertBalanced([
      { side: 'DEBIT', amount: 250 },
      { side: 'CREDIT', amount: 250 },
    ])).not.toThrow();
  });

  it('rejects zero and negative withdrawals', () => {
    expect(() => assertPositiveAmount(0)).toThrow();
    expect(() => assertPositiveAmount(-1)).toThrow();
  });
});
