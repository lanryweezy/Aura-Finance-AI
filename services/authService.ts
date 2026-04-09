
import type { User, Organization } from '../types';
import { apiClient } from './apiClient';
import { monitoringService } from './monitoringService';

const STORAGE_KEY_USER = 'aura_user';
const STORAGE_KEY_ORG = 'aura_org';

export const authService = {
  login: async (email: string, password: string): Promise<{ user: User; org: Organization }> => {
    try {
        const response = await apiClient.post('/auth/login', { email, password });
        const { user, org, token } = response;

        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEY_ORG, JSON.stringify(org));
        if (token) localStorage.setItem('aura_token', token);

        return { user, org };
    } catch (error) {
        monitoringService.trackError('AUTH', error as Error);
        throw error;
    }
  },

  loginWithProvider: async (provider: 'google' | 'microsoft' | 'sso'): Promise<{ user: User; org: Organization }> => {
    // Simulated redirect/callback logic
    return new Promise((resolve) => {
        setTimeout(() => {
            let name = 'Tunde O.';
            let email = 'tunde@google-auth.com';
            let company = 'Tunde & Co.';

            if (provider === 'microsoft') {
                name = 'Corporate User';
                email = 'user@company-enterprise.com';
                company = 'Enterprise Corp';
            } else if (provider === 'sso') {
                name = 'SSO Admin';
                email = 'admin@corp-sso.net';
                company = 'Global Logistics';
            }

            const organizationId = `org_${provider}_${Date.now()}`;
            const user: User = {
                id: `u_${provider}_${Date.now()}`,
                name,
                email,
                role: 'Owner',
                organizationId,
                avatarUrl: `https://ui-avatars.com/api/?name=${name}&background=random&color=fff`
            };
            const org: Organization = {
                id: organizationId,
                name: company,
                plan: provider === 'sso' ? 'Enterprise' : 'Growth'
            };
            
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
            localStorage.setItem(STORAGE_KEY_ORG, JSON.stringify(org));
            resolve({ user, org });
        }, 1000);
    });
  },

  signup: async (name: string, email: string, password: string, companyName: string): Promise<{ user: User; org: Organization }> => {
    try {
        const response = await apiClient.post('/auth/signup', { name, email, password, companyName });
        const { user, org } = response;
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEY_ORG, JSON.stringify(org));
        return { user, org };
    } catch (error) {
        // Fallback for demo
        const organizationId = `org_${Date.now()}`;
        const user: User = { id: `u_${Date.now()}`, name, email, role: 'Owner', organizationId };
        const org: Organization = { id: organizationId, name: companyName, plan: 'Free' };
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEY_ORG, JSON.stringify(org));
        return { user, org };
    }
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_ORG);
    localStorage.removeItem('aura_token');
    return Promise.resolve();
  },

  getCurrentUser: (): { user: User; org: Organization } | null => {
    const userStr = localStorage.getItem(STORAGE_KEY_USER);
    const orgStr = localStorage.getItem(STORAGE_KEY_ORG);
    if (userStr && orgStr) {
      return { user: JSON.parse(userStr), org: JSON.parse(orgStr) };
    }
    return null;
  },

  getTenantId: (): string => {
    const userStr = localStorage.getItem(STORAGE_KEY_USER);
    if (userStr) {
        try {
            return JSON.parse(userStr).organizationId;
        } catch {
            return 'default_tenant';
        }
    }
    return 'default_tenant';
  }
};
