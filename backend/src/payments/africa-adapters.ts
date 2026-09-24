import { AdapterPaymentRequest, AdapterPaymentResult, PaymentAdapter, requirePositiveAmount } from './adapter-contract';

export class FlutterwaveAdapter implements PaymentAdapter {
  readonly provider = 'flutterwave';
  constructor(private readonly config: { baseUrl: string; secretKey: string }) {}
  async createPayment(request: AdapterPaymentRequest): Promise<AdapterPaymentResult> {
    requirePositiveAmount(request.amount);
    if (!request.reference || !request.currency) return { provider: this.provider, providerReference: '', status: 'FAILED', failureCode: 'INVALID_REQUEST' };
    throw new Error('Flutterwave transport is not configured');
  }
  async getPaymentStatus(providerReference: string): Promise<AdapterPaymentResult> {
    if (!providerReference) return { provider: this.provider, providerReference: '', status: 'FAILED', failureCode: 'INVALID_REFERENCE' };
    throw new Error('Flutterwave transport is not configured');
  }
}

export class PesapalAdapter implements PaymentAdapter {
  readonly provider = 'pesapal';
  constructor(private readonly config: { baseUrl: string; consumerKey: string; consumerSecret: string }) {}
  async createPayment(request: AdapterPaymentRequest): Promise<AdapterPaymentResult> {
    requirePositiveAmount(request.amount);
    if (!request.reference || !request.currency) return { provider: this.provider, providerReference: '', status: 'FAILED', failureCode: 'INVALID_REQUEST' };
    throw new Error('Pesapal transport is not configured');
  }
  async getPaymentStatus(providerReference: string): Promise<AdapterPaymentResult> {
    if (!providerReference) return { provider: this.provider, providerReference: '', status: 'FAILED', failureCode: 'INVALID_REFERENCE' };
    throw new Error('Pesapal transport is not configured');
  }
}
