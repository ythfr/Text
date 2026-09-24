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

export class PayPalAdapter implements PaymentAdapter {
  readonly provider = 'paypal';
  constructor(private readonly config: { baseUrl: string; clientId: string; clientSecret: string }) {}
  async createPayment(request: AdapterPaymentRequest): Promise<AdapterPaymentResult> {
    requirePositiveAmount(request.amount);
    if (!request.reference || !request.currency) return { provider: this.provider, providerReference: '', status: 'FAILED', failureCode: 'INVALID_REQUEST' };
    throw new Error('PayPal transport is not configured');
  }
  async getPaymentStatus(providerReference: string): Promise<AdapterPaymentResult> {
    if (!providerReference) return { provider: this.provider, providerReference: '', status: 'FAILED', failureCode: 'INVALID_REFERENCE' };
    throw new Error('PayPal transport is not configured');
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
