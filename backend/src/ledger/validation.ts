export type CurrencyCode = 'KES' | 'USD' | 'EUR' | 'GBP' | 'JPY';

export type LedgerEntry = {
  side: 'DEBIT' | 'CREDIT';
  amount: number;
};

export function assertPositiveAmount(amount: number): void {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be a positive finite number');
  }
}

export function assertBalanced(entries: LedgerEntry[]): void {
  if (entries.length < 2) throw new Error('A ledger transaction needs at least two entries');
  const debit = entries.filter((entry) => entry.side === 'DEBIT').reduce((sum, entry) => sum + entry.amount, 0);
  const credit = entries.filter((entry) => entry.side === 'CREDIT').reduce((sum, entry) => sum + entry.amount, 0);
  if (Math.abs(debit - credit) > 0.00000001) throw new Error('Ledger transaction is unbalanced');
}
