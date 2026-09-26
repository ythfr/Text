import { requireEventId } from './webhook-validation';

export type ProviderEventStore = {
  insertIfNew(event: { provider: string; eventId: string; eventType: string; payload: unknown }): Promise<boolean>;
  markProcessed(provider: string, eventId: string): Promise<void>;
};

export async function processProviderWebhook(
  store: ProviderEventStore,
  input: { provider: string; eventType: string; payload: unknown; signatureValid: boolean },
  apply: (payload: unknown) => Promise<void>,
): Promise<'PROCESSED' | 'DUPLICATE'> {
  if (!input.signatureValid) throw new Error('Invalid provider webhook signature');
  const eventId = requireEventId(input.payload);
  const inserted = await store.insertIfNew({ provider: input.provider, eventId, eventType: input.eventType, payload: input.payload });
  if (!inserted) return 'DUPLICATE';
  await apply(input.payload);
  await store.markProcessed(input.provider, eventId);
  return 'PROCESSED';
}
