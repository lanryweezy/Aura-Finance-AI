
import type { User, Organization } from '../types';
import { localDb } from './localDb';
import { monitoringService } from './monitoringService';

const STORAGE_KEY_USER = 'aura_user';
const STORAGE_KEY_ORG = 'aura_org';

export const authService = {
  login: async (email: string, password: string): Promise<{ user: User; org: Organization; requires2FA?: boolean }> => {
    return localDb.simulateRequest(() => {
        // Mock success for admin and demo users
        if (email === 'admin@aura.ai' || email.includes('demo')) {
             const user: User = {
                id: email === 'admin@aura.ai' ? 'u_admin' : 'u_demo',
                name: email === 'admin@aura.ai' ? 'Administrator' : 'Demo User',
                email,
                role: 'Owner',
                organizationId: email === 'admin@aura.ai' ? 'aura-main' : 'org_demo'
             };
             const org: Organization = {
               id: user.organizationId,
               name: email === 'admin@aura.ai' ? 'Aura Corp (Headquarters)' : 'Demo Org',
               plan: 'Enterprise',
               twoFactorEnabled: email === 'admin@aura.ai',
               securitySettings: {
                 twoFactorEnabled: true,
                 ipWhitelist: [],
                 sessionTimeout: 30,
                 encryptionAtRest: true
               }
             };

             // Note: We don't save to localStorage here if 2FA is required
             if (org.twoFactorEnabled) {
                 return { user, org, requires2FA: true };
             }

             localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
             localStorage.setItem(STORAGE_KEY_ORG, JSON.stringify(org));
             return { user, org };
        }
        throw new Error("Invalid credentials. Use admin@aura.ai or any demo email.");
    }, 1000);
  },

  verify2FA: async (code: string): Promise<{ user: User; org: Organization }> => {
      return localDb.simulateRequest(() => {
          if (code === '123456') {
              const user: User = { id: 'u_admin', name: 'Administrator', email: 'admin@aura.ai', role: 'Owner', organizationId: 'aura-main' };
              const org: Organization = { id: 'aura-main', name: 'Aura Corp (Headquarters)', plan: 'Enterprise' };
              localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
              localStorage.setItem(STORAGE_KEY_ORG, JSON.stringify(org));
              return { user, org };
          } else {
              throw new Error('Invalid 2FA code');
          }
      }, 1000);
  },

  loginWithBiometrics: async (): Promise<{ user: User; org: Organization }> => {
      return localDb.simulateRequest(() => {
          const user: User = { id: 'u_bio', name: 'Biometric User', email: 'bio@aura.ai', role: 'Admin', organizationId: 'org_bio' };
          const org: Organization = { id: 'org_bio', name: 'Bio Org', plan: 'Growth' };
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
          localStorage.setItem(STORAGE_KEY_ORG, JSON.stringify(org));
          return { user, org };
      }, 1000);
  },

  loginWithProvider: async (provider: 'google' | 'microsoft' | 'sso'): Promise<{ user: User; org: Organization }> => {
    return localDb.simulateRequest(() => {
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
        return { user, org };
    }, 1000);
  },

  signup: async (name: string, email: string, password: string, companyName: string): Promise<{ user: User; org: Organization }> => {
    return localDb.simulateRequest(() => {
        const organizationId = `org_${Date.now()}`;
        const user: User = { id: `u_${Date.now()}`, name, email, role: 'Owner', organizationId };
        const org: Organization = { id: organizationId, name: companyName, plan: 'Free' };
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEY_ORG, JSON.stringify(org));
        return { user, org };
    }, 1500);
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
      try {
        return { user: JSON.parse(userStr), org: JSON.parse(orgStr) };
      } catch {
        return null;
      }
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
