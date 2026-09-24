export type PaymentRequest = {
  reference: string;
  currency: string;
  amount: number;
  merchant: string;
};

export type PaymentResult = {
  providerReference: string;
  status: 'COMPLETED' | 'FAILED';
};

export interface PaymentProvider {
  getCapabilities(): Promise<string[]>;
  createPayment(request: PaymentRequest): Promise<PaymentResult>;
  getPaymentStatus(providerReference: string): Promise<PaymentResult>;
  refundPayment(providerReference: string): Promise<PaymentResult>;
  cancelPayment(providerReference: string): Promise<PaymentResult>;
}

export class MockPaymentProvider implements PaymentProvider {
  async getCapabilities(): Promise<string[]> {
    return ['PAYMENT', 'REFUND', 'CANCEL'];
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    if (!request.reference || !request.currency || !request.merchant || request.amount <= 0) {
      return { providerReference: '', status: 'FAILED' };
    }
    return { providerReference: `MOCK-${request.reference}`, status: 'COMPLETED' };
  }

  async getPaymentStatus(providerReference: string): Promise<PaymentResult> {
    return { providerReference, status: 'COMPLETED' };
  }

  async refundPayment(providerReference: string): Promise<PaymentResult> {
    return { providerReference, status: 'COMPLETED' };
  }

  async cancelPayment(providerReference: string): Promise<PaymentResult> {
    return { providerReference, status: 'COMPLETED' };
  }
}
