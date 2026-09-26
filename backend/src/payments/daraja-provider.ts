export type PaymentRequest = {
  reference: string;
  currency: string;
  amount: number;
  merchant: string;
};

export type PaymentResult = {
  providerReference: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  failureCode?: string;
};

export interface PaymentProvider {
  getCapabilities(): Promise<string[]>;
  createPayment(request: PaymentRequest): Promise<PaymentResult>;
  getPaymentStatus(providerReference: string): Promise<PaymentResult>;
  refundPayment(providerReference: string): Promise<PaymentResult>;
  cancelPayment(providerReference: string): Promise<PaymentResult>;
}

export type DarajaConfig = {
  baseUrl: string;
  consumerKey: string;
  consumerSecret: string;
  shortcode: string;
  passkey: string;
  callbackUrl: string;
};

export class DarajaProvider implements PaymentProvider {
  constructor(private readonly config: DarajaConfig) {}

  async getCapabilities(): Promise<string[]> {
    return ['PAYMENT', 'STATUS'];
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    if (!request.reference || request.currency !== 'KES' || request.amount <= 0 || !request.merchant) {
      return { providerReference: '', status: 'FAILED', failureCode: 'INVALID_REQUEST' };
    }
    throw new Error('Daraja HTTP transport is not configured');
  }

  async getPaymentStatus(providerReference: string): Promise<PaymentResult> {
    if (!providerReference) return { providerReference: '', status: 'FAILED', failureCode: 'INVALID_REFERENCE' };
    throw new Error('Daraja HTTP transport is not configured');
  }

  async refundPayment(providerReference: string): Promise<PaymentResult> {
    return { providerReference, status: 'FAILED', failureCode: 'NOT_SUPPORTED' };
  }

  async cancelPayment(providerReference: string): Promise<PaymentResult> {
    return { providerReference, status: 'FAILED', failureCode: 'NOT_SUPPORTED' };
  }
}

export function loadDarajaConfig(env: { [key: string]: string | undefined } = process.env): DarajaConfig {
  const required = ['DARAJA_BASE_URL', 'DARAJA_CONSUMER_KEY', 'DARAJA_CONSUMER_SECRET', 'DARAJA_SHORTCODE', 'DARAJA_PASSKEY', 'DARAJA_CALLBACK_URL'];
  const missing = required.filter((key) => !env[key]);
  if (missing.length > 0) throw new Error(`Missing Daraja configuration: ${missing.join(', ')}`);
  return {
    baseUrl: env.DARAJA_BASE_URL!,
    consumerKey: env.DARAJA_CONSUMER_KEY!,
    consumerSecret: env.DARAJA_CONSUMER_SECRET!,
    shortcode: env.DARAJA_SHORTCODE!,
    passkey: env.DARAJA_PASSKEY!,
    callbackUrl: env.DARAJA_CALLBACK_URL!,
  };
}

export class MockPaymentProvider implements PaymentProvider {
  async getCapabilities(): Promise<string[]> { return ['PAYMENT', 'REFUND', 'CANCEL']; }
  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    if (!request.reference || !request.currency || !request.merchant || request.amount <= 0) return { providerReference: '', status: 'FAILED', failureCode: 'INVALID_REQUEST' };
    return { providerReference: `MOCK-${request.reference}`, status: 'COMPLETED' };
  }
  async getPaymentStatus(providerReference: string): Promise<PaymentResult> { return { providerReference, status: 'COMPLETED' }; }
  async refundPayment(providerReference: string): Promise<PaymentResult> { return { providerReference, status: 'COMPLETED' }; }
  async cancelPayment(providerReference: string): Promise<PaymentResult> { return { providerReference, status: 'COMPLETED' }; }
}
