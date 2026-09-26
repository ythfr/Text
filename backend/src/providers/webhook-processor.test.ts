import { processProviderWebhook } from './webhook-processor';

describe('provider webhook processing', () => {
  it('does not apply duplicate events twice', async () => {
    const seen = new Set<string>();
    let applied = 0;
    const store = {
      insertIfNew: async ({ eventId }: { eventId: string }) => {
        if (seen.has(eventId)) return false;
        seen.add(eventId);
        return true;
      },
      markProcessed: async () => undefined,
    };
    const payload = { eventId: 'evt-1', status: 'COMPLETED' };
    expect(await processProviderWebhook(store, { provider: 'daraja', eventType: 'payment', payload, signatureValid: true }, async () => { applied += 1; })).toBe('PROCESSED');
    expect(await processProviderWebhook(store, { provider: 'daraja', eventType: 'payment', payload, signatureValid: true }, async () => { applied += 1; })).toBe('DUPLICATE');
    expect(applied).toBe(1);
  });
});
