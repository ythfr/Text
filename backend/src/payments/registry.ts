import { PaymentAdapter } from './adapter-contract';

export class PaymentAdapterRegistry {
  private readonly adapters = new Map<string, PaymentAdapter>();

  register(adapter: PaymentAdapter): void {
    if (this.adapters.has(adapter.provider)) throw new Error(`Adapter already registered: ${adapter.provider}`);
    this.adapters.set(adapter.provider, adapter);
  }

  get(provider: string): PaymentAdapter {
    const adapter = this.adapters.get(provider);
    if (!adapter) throw new Error(`No adapter registered for provider: ${provider}`);
    return adapter;
  }

  list(): string[] {
    return [...this.adapters.keys()].sort();
  }
}
