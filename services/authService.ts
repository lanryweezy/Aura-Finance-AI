
import type { User, Organization } from '../types';

// Mock DB
let currentUser: User | null = null;
let currentOrg: Organization | null = null;

export const authService = {
  login: (email: string, password: string): Promise<{ user: User; org: Organization }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          // Simulate successful login
          currentUser = {
            id: 'u_123',
            name: email.split('@')[0], // Use part of email as name for demo
            email: email,
            role: 'Owner',
            organizationId: 'org_1',
            avatarUrl: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=00F5D4&color=000`
          };
          currentOrg = {
            id: 'org_1',
            name: 'My Demo Company',
            plan: 'Free'
          };
          // Persist to local storage for "session"
          localStorage.setItem('aura_user', JSON.stringify(currentUser));
          localStorage.setItem('aura_org', JSON.stringify(currentOrg));
          resolve({ user: currentUser, org: currentOrg });
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

            currentUser = {
                id: `u_${provider}_${Date.now()}`,
                name,
                email,
                role: 'Owner',
                organizationId: `org_${provider}`,
                avatarUrl: `https://ui-avatars.com/api/?name=${name}&background=random&color=fff`
            };
            currentOrg = {
                id: currentUser.organizationId,
                name: company,
                plan: provider === 'sso' ? 'Enterprise' : 'Growth'
            };
            
            localStorage.setItem('aura_user', JSON.stringify(currentUser));
            localStorage.setItem('aura_org', JSON.stringify(currentOrg));
            resolve({ user: currentUser, org: currentOrg });
        }, 1500); // Slightly longer delay to simulate redirect
    });
  },

  signup: (name: string, email: string, password: string, companyName: string): Promise<{ user: User; org: Organization }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        currentUser = {
          id: `u_${Date.now()}`,
          name,
          email,
          role: 'Owner',
          organizationId: `org_${Date.now()}`,
          avatarUrl: `https://ui-avatars.com/api/?name=${name}&background=00F5D4&color=000`
        };
        currentOrg = {
          id: currentUser.organizationId,
          name: companyName,
          plan: 'Free'
        };
        localStorage.setItem('aura_user', JSON.stringify(currentUser));
        localStorage.setItem('aura_org', JSON.stringify(currentOrg));
        resolve({ user: currentUser, org: currentOrg });
      }, 1500);
    });
  },

  logout: (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        currentUser = null;
        currentOrg = null;
        localStorage.removeItem('aura_user');
        localStorage.removeItem('aura_org');
        resolve();
      }, 500);
    });
  },

  getCurrentUser: (): { user: User; org: Organization } | null => {
    const userStr = localStorage.getItem('aura_user');
    const orgStr = localStorage.getItem('aura_org');
    if (userStr && orgStr) {
      return { user: JSON.parse(userStr), org: JSON.parse(orgStr) };
    }
    return null;
  }
};
