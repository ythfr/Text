export type HttpRequest = {
  method: 'GET' | 'POST';
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
};

export type HttpResponse = {
  status: number;
  headers: Record<string, string>;
  json(): Promise<unknown>;
  text(): Promise<string>;
};

export type HttpClient = (request: HttpRequest, signal: AbortSignal) => Promise<HttpResponse>;

export class ProviderHttpError extends Error {
  constructor(public readonly status: number, message: string, public readonly retryable: boolean) {
    super(message);
    this.name = 'ProviderHttpError';
  }
}

export async function requestProvider<T>(
  client: HttpClient,
  request: HttpRequest,
  options: { maxAttempts?: number; backoffMs?: number; sleep?: (ms: number) => Promise<void> } = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const backoffMs = options.backoffMs ?? 250;
  const sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), request.timeoutMs ?? 10_000);
    try {
      const response = await client(request, controller.signal);
      if (response.status >= 200 && response.status < 300) return await response.json() as T;
      const retryable = response.status === 408 || response.status === 429 || response.status >= 500;
      throw new ProviderHttpError(response.status, `Provider returned HTTP ${response.status}`, retryable);
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts || !(error instanceof ProviderHttpError ? error.retryable : true)) throw error;
      await sleep(backoffMs * 2 ** (attempt - 1));
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Provider request failed');
}
