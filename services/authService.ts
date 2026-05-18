
import type { User, Organization } from '../types';
import { apiClient } from './apiClient';
import { monitoringService } from './monitoringService';

const STORAGE_KEY_USER = 'aura_user';
const STORAGE_KEY_ORG = 'aura_org';

export const authService = {
  login: async (email: string, password: string): Promise<{ user: User; org: Organization; requires2FA?: boolean }> => {
    try {
        const response = await apiClient.post('/auth/login', { email, password });
        const { user, org, token, requires2FA } = response;

        if (requires2FA) {
            return { user, org, requires2FA: true };
        }

        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEY_ORG, JSON.stringify(org));
        if (token) localStorage.setItem('aura_token', token);

        return { user, org };
    } catch (error) {
        monitoringService.trackError('AUTH', error as Error);
        // Mock success for demo if not using real API
        if (email.includes('demo')) {
             const user: User = { id: 'u_demo', name: 'Demo User', email, role: 'Admin', organizationId: 'org_demo' };
             const org: Organization = {
               id: 'org_demo',
               name: 'Demo Org',
               plan: 'Enterprise',
               twoFactorEnabled: true,
               securitySettings: {
                 twoFactorEnabled: true,
                 ipWhitelist: [],
                 sessionTimeout: 30,
                 encryptionAtRest: true
               }
             };
             return { user, org, requires2FA: org.twoFactorEnabled };
        }
        throw error;
    }
  },

  verify2FA: async (code: string): Promise<{ user: User; org: Organization }> => {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              if (code === '123456') {
                  const user: User = { id: 'u_demo', name: 'Demo User', email: 'demo@aura.ai', role: 'Admin', organizationId: 'org_demo' };
                  const org: Organization = { id: 'org_demo', name: 'Demo Org', plan: 'Enterprise' };
                  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
                  localStorage.setItem(STORAGE_KEY_ORG, JSON.stringify(org));
                  resolve({ user, org });
              } else {
                  reject(new Error('Invalid 2FA code'));
              }
          }, 1000);
      });
  },

  loginWithBiometrics: async (): Promise<{ user: User; org: Organization }> => {
      // Mock biometric login
      return new Promise((resolve) => {
          setTimeout(() => {
              const user: User = { id: 'u_bio', name: 'Biometric User', email: 'bio@aura.ai', role: 'Admin', organizationId: 'org_bio' };
              const org: Organization = { id: 'org_bio', name: 'Bio Org', plan: 'Growth' };
              localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
              localStorage.setItem(STORAGE_KEY_ORG, JSON.stringify(org));
              resolve({ user, org });
          }, 1000);
      });
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
