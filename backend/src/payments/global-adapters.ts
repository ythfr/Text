import { AdapterPaymentRequest, AdapterPaymentResult, PaymentAdapter, requirePositiveAmount } from './adapter-contract';

export class StripeAdapter implements PaymentAdapter {
  readonly provider = 'stripe';
  constructor(private readonly config: { baseUrl: string; secretKey: string }) {}
  async createPayment(request: AdapterPaymentRequest): Promise<AdapterPaymentResult> {
    requirePositiveAmount(request.amount);
    if (!request.reference || !request.currency) return { provider: this.provider, providerReference: '', status: 'FAILED', failureCode: 'INVALID_REQUEST' };
    throw new Error('Stripe transport is not configured');
  }
  async getPaymentStatus(providerReference: string): Promise<AdapterPaymentResult> {
    if (!providerReference) return { provider: this.provider, providerReference: '', status: 'FAILED', failureCode: 'INVALID_REFERENCE' };
    throw new Error('Stripe transport is not configured');
  }
}

type PayPalConfig = { baseUrl: string; clientId: string; clientSecret: string; returnUrl?: string; cancelUrl?: string };
type PayPalToken = { access_token: string; expires_in: number };
type PayPalOrder = { id?: string; status?: string; links?: Array<{ href: string; rel: string }> };

export class PayPalAdapter implements PaymentAdapter {
  readonly provider = 'paypal';
  private token?: { value: string; expiresAt: number };
  constructor(private readonly config: PayPalConfig) {
    if (!config.baseUrl || !config.clientId || !config.clientSecret) throw new Error('PayPal configuration is incomplete');
  }
  private async accessToken(): Promise<string> {
    if (this.token && this.token.expiresAt > Date.now() + 30000) return this.token.value;
    const response = await fetch(`${this.config.baseUrl.replace(/\/$/, '')}/v1/oauth2/token`, { method: 'POST', headers: { Authorization: `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }, body: 'grant_type=client_credentials' });
    if (!response.ok) throw new Error(`PayPal authentication failed: ${response.status}`);
    const body = await response.json() as PayPalToken;
    if (!body.access_token) throw new Error('PayPal authentication returned no access token');
    this.token = { value: body.access_token, expiresAt: Date.now() + Math.max(body.expires_in - 60, 30) * 1000 };
    return body.access_token;
  }
  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = await this.accessToken();
    const response = await fetch(`${this.config.baseUrl.replace(/\/$/, '')}${path}`, { ...init, headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(init.headers ?? {}) } });
    if (!response.ok) throw new Error(`PayPal request failed: ${response.status}`);
    return await response.json() as T;
  }
  async createPayment(request: AdapterPaymentRequest): Promise<AdapterPaymentResult> {
    requirePositiveAmount(request.amount);
    if (!request.reference || !/^[A-Z]{3}$/.test(request.currency)) return { provider: this.provider, providerReference: '', status: 'FAILED', failureCode: 'INVALID_REQUEST' };
    const order = await this.request<PayPalOrder>('/v2/checkout/orders', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ intent: 'CAPTURE', purchase_units: [{ reference_id: request.reference, custom_id: request.reference, amount: { currency_code: request.currency, value: request.amount.toFixed(2) } }], application_context: { return_url: this.config.returnUrl, cancel_url: this.config.cancelUrl, user_action: 'PAY_NOW' } }) });
    if (!order.id) return { provider: this.provider, providerReference: '', status: 'FAILED', failureCode: 'MISSING_ORDER_ID' };
    return { provider: this.provider, providerReference: order.id, status: 'PENDING', redirectUrl: order.links?.find((link) => link.rel === 'approve')?.href };
  }
  async getPaymentStatus(providerReference: string): Promise<AdapterPaymentResult> {
    if (!providerReference) return { provider: this.provider, providerReference: '', status: 'FAILED', failureCode: 'INVALID_REFERENCE' };
    const order = await this.request<PayPalOrder>(`/v2/checkout/orders/${encodeURIComponent(providerReference)}`);
    const status = order.status === 'COMPLETED' ? 'COMPLETED' : ['VOIDED', 'CANCELLED'].includes(order.status ?? '') ? 'FAILED' : 'PENDING';
    return { provider: this.provider, providerReference, status };
  }
}

export class WiseAdapter implements PaymentAdapter {
  readonly provider = 'wise';
  constructor(private readonly config: { baseUrl: string; apiToken: string }) {}
  async createPayment(request: AdapterPaymentRequest): Promise<AdapterPaymentResult> {
    requirePositiveAmount(request.amount);
    if (!request.reference || !request.currency) return { provider: this.provider, providerReference: '', status: 'FAILED', failureCode: 'INVALID_REQUEST' };
    throw new Error('Wise transport is not configured');
  }
  async getPaymentStatus(providerReference: string): Promise<AdapterPaymentResult> {
    if (!providerReference) return { provider: this.provider, providerReference: '', status: 'FAILED', failureCode: 'INVALID_REFERENCE' };
    throw new Error('Wise transport is not configured');
  }
}
