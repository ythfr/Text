import { PayPalAdapter } from './global-adapters';

describe('PayPalAdapter', () => {
  const fetchMock = jest.fn();
  beforeEach(() => { fetchMock.mockReset(); global.fetch = fetchMock as typeof fetch; });

  it('authenticates and creates a pending checkout order', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ access_token: 'token', expires_in: 300 }) })
      .mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({ id: 'ORDER-1', status: 'CREATED', links: [{ rel: 'approve', href: 'https://paypal.test/approve' }] }) });

    const result = await new PayPalAdapter({ baseUrl: 'https://api-m.sandbox.paypal.com', clientId: 'client', clientSecret: 'secret' }).createPayment({ reference: 'V1-1', amount: 25, currency: 'EUR' });

    expect(result).toEqual({ provider: 'paypal', providerReference: 'ORDER-1', status: 'PENDING', redirectUrl: 'https://paypal.test/approve' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toContain('/v2/checkout/orders');
  });

  it('rejects invalid currency format before calling PayPal', async () => {
    await expect(new PayPalAdapter({ baseUrl: 'https://api-m.sandbox.paypal.com', clientId: 'client', clientSecret: 'secret' }).createPayment({ reference: 'V1-2', amount: 25, currency: 'EURO' })).resolves.toMatchObject({ status: 'FAILED', failureCode: 'INVALID_REQUEST' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
