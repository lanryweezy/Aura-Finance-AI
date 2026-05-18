
import { authService } from './authService';
import { monitoringService } from './monitoringService';

const BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

export const apiClient = {
  async fetch(endpoint: string, options: FetchOptions = {}) {
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
        return await response.json();
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
