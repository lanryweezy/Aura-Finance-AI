
import { authService } from './authService';
import { monitoringService } from './monitoringService';

const BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

const rateLimitMap = new Map<string, { count: number, reset: number }>();
const MAX_REQUESTS = 100;
const WINDOW_MS = 60000;

export const apiClient = {
  async fetch(endpoint: string, options: FetchOptions = {}) {
      // Simulate Rate Limiting
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

    // Add Auth token if exists
    const userStr = localStorage.getItem('aura_user');
    if (userStr) {
        // In real app, this would be a real JWT token
        headers.set('Authorization', `Bearer mock-token-${JSON.parse(userStr).id}`);
    }

    headers.set('Content-Type', 'application/json');

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
        // Cache successful GET responses for offline use
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
