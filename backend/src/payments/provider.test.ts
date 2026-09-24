import { MockPaymentProvider } from './provider';

describe('MockPaymentProvider', () => {
  it('completes a valid simulated payment', async () => {
    const result = await new MockPaymentProvider().createPayment({
      reference: 'TEST-1',
      currency: 'KES',
      amount: 500,
      merchant: 'Example Coffee Shop',
    });
    expect(result.status).toBe('COMPLETED');
  });

  it('rejects invalid payment amounts', async () => {
    const result = await new MockPaymentProvider().createPayment({
      reference: 'TEST-2',
      currency: 'KES',
      amount: 0,
      merchant: 'Example Coffee Shop',
    });
    expect(result.status).toBe('FAILED');
  });
});
