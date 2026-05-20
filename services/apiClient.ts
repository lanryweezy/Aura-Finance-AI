
import { authService } from './authService';
import { monitoringService } from './monitoringService';
import { localDb } from './localDb';

const BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

const rateLimitMap = new Map<string, { count: number, reset: number }>();
const MAX_REQUESTS = 100;
const WINDOW_MS = 60000;

export const apiClient = {
  async fetch(endpoint: string, options: FetchOptions = {}) {
      const now = Date.now();
      const rateData = rateLimitMap.get(endpoint) || { count: 0, reset: now + WINDOW_MS };

      if (now > rateData.reset) {
          rateData.count = 0;
          rateData.reset = now + WINDOW_MS;
      }

      rateData.count++;
      rateLimitMap.set(endpoint, rateData);

      if (rateData.count > MAX_REQUESTS) {
          monitoringService.log('warn', 'SECURITY', `Rate limit exceeded for ${endpoint}`);
          throw new Error('Too many requests. Please try again later.');
      }

    const { timeout = 15000, ...fetchOptions } = options;
    const tenantId = authService.getTenantId();
    const headers = new Headers(fetchOptions.headers || {});

    if (tenantId) {
      headers.set('X-Tenant-ID', tenantId);
    }

    const userStr = localStorage.getItem('aura_user');
    if (userStr) {
        headers.set('Authorization', `Bearer mock-token-${JSON.parse(userStr).id}`);
    }

    headers.set('Content-Type', 'application/json');

    if (BASE_URL === '/api') {
        return this.simulateBackend(endpoint, options);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      monitoringService.log('info', 'NETWORK', `Request: ${options.method || 'GET'} ${endpoint}`);

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      }).catch(err => {
          if (!navigator.onLine) {
              const cached = localStorage.getItem(`aura_cache_${endpoint}`);
              if (cached && options.method === 'GET') {
                  return new Response(cached, {
                      status: 200,
                      headers: { 'Content-Type': 'application/json', 'X-Offline-Cache': 'true' }
                  });
              }
          }
          throw err;
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (!response.ok) {
        const errorData = isJson ? await response.json().catch(() => ({})) : {};
        monitoringService.trackError('NETWORK', `HTTP ${response.status}: ${errorData.message || response.statusText}`);
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      if (isJson) {
        const data = await response.json();
        if (options.method === 'GET' || !options.method) {
            localStorage.setItem(`aura_cache_${endpoint}`, JSON.stringify(data));
        }
        return data;
      } else {
        const text = await response.text();
        throw new Error(`Expected JSON response but got: ${text.substring(0, 50)}...`);
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        monitoringService.trackError('NETWORK', 'Request timed out');
        throw new Error('Request timed out. Please try again.');
      }
      throw error;
    }
  },

  async simulateBackend(endpoint: string, options: FetchOptions): Promise<any> {
    const parts = endpoint.split('?')[0].split('/').filter(Boolean);
    const resource = parts[0];
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body as string) : null;
    const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');

    return localDb.simulateRequest(() => {
        if (resource === 'usage') {
            const usage = localDb.load<Record<string, number>>('usage_counters', {});
            if (parts[1] === 'track') {
                const type = body.type;
                usage[type] = (usage[type] || 0) + 1;
                localDb.save('usage_counters', usage);
                return { success: true };
            }
            if (parts[1] === 'summary') {
                const org = authService.getCurrentUser()?.org;
                const plan = org?.plan || 'Free';
                return [
                    { type: 'ai_chat', used: usage.ai_chat || 0, limit: 10 },
                    { type: 'ai_insight', used: usage.ai_insight || 0, limit: 5 },
                    { type: 'ocr_scan', used: usage.ocr_scan || 0, limit: 3 },
                    { type: 'invoices_sent', used: usage.invoices_sent || 0, limit: 10 },
                    { type: 'bank_sync', used: usage.bank_sync || 0, limit: 50 },
                    { type: 'txn_volume', used: usage.txn_volume || 0, limit: 50 }
                ];
            }
            const type = urlParams.get('type');
            return { count: type ? (usage[type] || 0) : 0 };
        }

        const data = localDb.load<any[]>(resource, []);

        switch (method) {
            case 'GET':
                if (parts[1]) {
                    return data.find(item => item.id === parts[1]);
                }
                return data;
            case 'POST':
                if (parts[1] === 'bulk') {
                    localDb.save(resource, body);
                    return { success: true };
                }
                const newItem = {
                    ...body,
                    id: body.id || `${resource.slice(0, 3)}_${Date.now()}`,
                    issueDate: body.issueDate || new Date().toISOString(),
                    status: body.status || 'Unpaid'
                };
                localDb.save(resource, [newItem, ...data]);
                return newItem;
            case 'PUT':
                const updatedData = data.map(item => item.id === (body.id || parts[1]) ? { ...item, ...body } : item);
                localDb.save(resource, updatedData);
                return body;
            case 'DELETE':
                const id = parts[1];
                localDb.save(resource, data.filter(item => item.id !== id));
                return { success: true };
            default:
                return data;
        }
    }, 600);
  },

  get(endpoint: string, options?: FetchOptions) {
    return this.fetch(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint: string, body: any, options?: FetchOptions) {
    return this.fetch(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
  },

  put(endpoint: string, body: any, options?: FetchOptions) {
    return this.fetch(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
  },

  delete(endpoint: string, options?: FetchOptions) {
    return this.fetch(endpoint, { ...options, method: 'DELETE' });
  }
};
