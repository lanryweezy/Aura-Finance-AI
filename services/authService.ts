
import type { User, Organization } from '../types';

const STORAGE_KEY_USER = 'aura_user';
const STORAGE_KEY_ORG = 'aura_org';

export const authService = {
  login: (email: string, password: string): Promise<{ user: User; org: Organization }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          const orgId = `org_${email.split('@')[0]}`;
          const user: User = {
            id: `u_${Date.now()}`,
            name: email.split('@')[0],
            email: email,
            role: 'Owner',
            organizationId: orgId,
            avatarUrl: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=00F5D4&color=000`
          };
          const org: Organization = {
            id: orgId,
            name: `${email.split('@')[0]}'s Company`,
            plan: 'Free'
          };
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
          localStorage.setItem(STORAGE_KEY_ORG, JSON.stringify(org));
          resolve({ user, org });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  },

  loginWithProvider: (provider: 'google' | 'microsoft' | 'sso'): Promise<{ user: User; org: Organization }> => {
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
        }, 1500);
    });
  },

  signup: (name: string, email: string, password: string, companyName: string): Promise<{ user: User; org: Organization }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const organizationId = `org_${Date.now()}`;
        const user: User = {
          id: `u_${Date.now()}`,
          name,
          email,
          role: 'Owner',
          organizationId,
          avatarUrl: `https://ui-avatars.com/api/?name=${name}&background=00F5D4&color=000`
        };
        const org: Organization = {
          id: organizationId,
          name: companyName,
          plan: 'Free'
        };
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEY_ORG, JSON.stringify(org));
        resolve({ user, org });
      }, 1500);
    });
  },

  logout: (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem(STORAGE_KEY_USER);
        localStorage.removeItem(STORAGE_KEY_ORG);
        resolve();
      }, 500);
    });
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
        return JSON.parse(userStr).organizationId;
    }
    return 'default_tenant';
  }
};
