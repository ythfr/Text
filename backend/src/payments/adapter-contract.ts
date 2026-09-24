export type AdapterPaymentRequest = {
  reference: string;
  amount: number;
  currency: string;
  customerReference?: string;
  returnUrl?: string;
  metadata?: Record<string, string>;
};

export type AdapterPaymentResult = {
  provider: string;
  providerReference: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  redirectUrl?: string;
  failureCode?: string;
};

export interface PaymentAdapter {
  readonly provider: string;
  createPayment(request: AdapterPaymentRequest): Promise<AdapterPaymentResult>;
  getPaymentStatus(providerReference: string): Promise<AdapterPaymentResult>;
}

export function requirePositiveAmount(amount: number): void {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Amount must be positive');
}
