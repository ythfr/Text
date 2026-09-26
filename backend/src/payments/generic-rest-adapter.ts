import { AdapterPaymentRequest, AdapterPaymentResult, PaymentAdapter, requirePositiveAmount } from './adapter-contract';

type Config = { baseUrl: string; apiKey: string };

export class GenericRestPaymentAdapter implements PaymentAdapter {
  readonly provider: string;
  constructor(provider: string, private readonly config: Config) {
    if (!provider || !config.baseUrl || !config.apiKey) throw new Error('Provider configuration is incomplete');
    this.provider = provider;
  }

  async createPayment(request: AdapterPaymentRequest): Promise<AdapterPaymentResult> {
    requirePositiveAmount(request.amount);
    if (!request.currency || !request.reference) return { provider: this.provider, providerReference: '', status: 'FAILED', failureCode: 'INVALID_REQUEST' };
    throw new Error(`${this.provider} transport is not configured`);
  }

  async getPaymentStatus(providerReference: string): Promise<AdapterPaymentResult> {
    if (!providerReference) return { provider: this.provider, providerReference: '', status: 'FAILED', failureCode: 'INVALID_REFERENCE' };
    throw new Error(`${this.provider} transport is not configured`);
  }
}
