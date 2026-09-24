import { ProviderHttpError, requestProvider } from './http-transport';

describe('provider HTTP transport', () => {
  it('retries transient provider failures', async () => {
    let attempts = 0;
    const result = await requestProvider<{ ok: boolean }>(async () => {
      attempts += 1;
      if (attempts < 3) throw new ProviderHttpError(503, 'temporary', true);
      return { status: 200, headers: {}, json: async () => ({ ok: true }), text: async () => '' };
    }, { method: 'GET', url: 'https://provider.test' }, { backoffMs: 0, sleep: async () => undefined });
    expect(result.ok).toBe(true);
    expect(attempts).toBe(3);
  });
});
