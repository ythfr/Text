import { createHash, timingSafeEqual } from 'node:crypto';

export function verifyWebhookSignature(rawBody: string, receivedSignature: string, secret: string): boolean {
  if (!receivedSignature || !secret) return false;
  const expected = createHash('sha256').update(`${secret}.${rawBody}`).digest('hex');
  const received = Buffer.from(receivedSignature, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  return received.length === expectedBuffer.length && timingSafeEqual(received, expectedBuffer);
}

export function requireEventId(payload: unknown): string {
  if (!payload || typeof payload !== 'object') throw new Error('Invalid webhook payload');
  const value = (payload as Record<string, unknown>).eventId ?? (payload as Record<string, unknown>).id;
  if (typeof value !== 'string' || value.length < 1 || value.length > 200) throw new Error('Webhook event ID is required');
  return value;
}
