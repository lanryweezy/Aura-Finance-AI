export interface AnchorConfig {
  apiKey: string;
  baseUrl?: string;
}

export class AnchorAPIError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'AnchorAPIError';
  }
}

class AnchorService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = import.meta.env?.VITE_ANCHOR_SECRET_KEY || 'sandbox_sk_mock';
    this.baseUrl = import.meta.env?.VITE_ANCHOR_API_URL || 'https://api.sandbox.getanchor.co';
  }

  private async fetchWithRetry(endpoint: string, options: RequestInit, retries = 3): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;

    // Merge headers
    const headers = new Headers(options.headers);
    headers.set('x-anchor-key', this.apiKey);
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');

    const config: RequestInit = {
      ...options,
      headers
    };

    let lastError;
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, config);

        if (response.status === 429) {
          // Rate limit, backoff
          await new Promise(res => setTimeout(res, 1000 * Math.pow(2, i)));
          continue;
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new AnchorAPIError(`Anchor API Error: ${response.statusText}`, response.status, data);
        }

        return data;
      } catch (err: any) {
        lastError = err;
        if (err instanceof AnchorAPIError && err.status >= 400 && err.status < 500 && err.status !== 429) {
          // Don't retry client errors (except 429)
          throw err;
        }
        if (i < retries - 1) {
          await new Promise(res => setTimeout(res, 1000 * Math.pow(2, i)));
        }
      }
    }
    throw lastError;
  }

  // --- CUSTOMERS ---
  async createCustomer(payload: any) {
    return this.fetchWithRetry('/api/v1/customers', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getCustomer(customerId: string) {
    return this.fetchWithRetry(`/api/v1/customers/${customerId}`, {
      method: 'GET'
    });
  }

  // --- ACCOUNTS ---
  async createDepositAccount(payload: any) {
    return this.fetchWithRetry('/api/v1/accounts', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getAccount(accountId: string) {
    return this.fetchWithRetry(`/api/v1/accounts/${accountId}`, {
      method: 'GET'
    });
  }

  async createReservedAccount(payload: any) {
    return this.fetchWithRetry('/api/v1/reserved-accounts', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // --- TRANSFERS ---
  async createTransfer(payload: any, idempotencyKey: string) {
    return this.fetchWithRetry('/api/v1/transfers', {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(payload)
    });
  }

  async getTransfer(transferId: string) {
    return this.fetchWithRetry(`/api/v1/transfers/${transferId}`, {
      method: 'GET'
    });
  }

  // --- BILLS ---
  async payBill(payload: any, idempotencyKey: string) {
    return this.fetchWithRetry('/api/v1/bills/payment', {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(payload)
    });
  }
}

export const anchorService = new AnchorService();
