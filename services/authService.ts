import type { User, Organization } from '../types';
import { supabase } from './supabaseClient';

const STORAGE_KEY_USER = 'aura_user';
const STORAGE_KEY_ORG = 'aura_org';

async function upsertUserAndOrg(email: string, name: string): Promise<{ user: User; org: Organization }> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: existingUser } = await supabase
    .from('users')
    .select('*, organizations(*)')
    .eq('email', email)
    .single();

  if (existingUser) {
    const user: User = {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
      organizationId: existingUser.organization_id,
      avatarUrl: existingUser.avatar_url,
      currentEntityId: existingUser.current_entity_id,
    };
    const org: Organization = {
      id: existingUser.organizations.id,
      name: existingUser.organizations.name,
      plan: existingUser.organizations.plan,
      tin: existingUser.organizations.tin,
      twoFactorEnabled: existingUser.organizations.two_factor_enabled,
      sessionTimeout: existingUser.organizations.session_timeout,
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEY_ORG, JSON.stringify(org));
    return { user, org };
  }

  // Create new org
  const orgId = `org_${Date.now()}`;
  const { error: orgErr } = await supabase.from('organizations').insert({
    id: orgId, name: name + "'s Business", plan: 'Free',
  });
  if (orgErr) throw orgErr;

  // Seed chart of accounts
  await supabase.rpc('seed_default_accounts', { org_id: orgId });

  // Create user
  const userId = `u_${Date.now()}`;
  const { error: userErr } = await supabase.from('users').insert({
    id: userId, email, name, role: 'Owner', organization_id: orgId,
  });
  if (userErr) throw userErr;

  // Create default entity
  await supabase.from('entities').insert({
    name: 'Main', type: 'Main', currency: 'NGN', is_main: true, organization_id: orgId,
  });

  const user: User = { id: userId, name, email, role: 'Owner', organizationId: orgId };
  const org: Organization = { id: orgId, name: name + "'s Business", plan: 'Free' };
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEY_ORG, JSON.stringify(org));
  return { user, org };
}

export const authService = {
  login: async (email: string, password: string): Promise<{ user: User; org: Organization; requires2FA?: boolean }> => {
    if (!supabase) return authService.loginMock(email);

    // Use Supabase Auth for real authentication
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      // If user doesn't exist in Supabase Auth, sign up first
      if (authError.message.includes('Invalid login')) {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError && !signUpError.message.includes('already registered')) {
          throw signUpError;
        }
        // Retry login
        const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
          email, password,
        });
        if (retryError) throw retryError;
        return upsertUserAndOrg(email, email.split('@')[0]);
      }
      throw authError;
    }

    return upsertUserAndOrg(email, email.split('@')[0]);
  },

  loginMock: async (email: string): Promise<{ user: User; org: Organization; requires2FA?: boolean }> => {
    if (email === 'admin@aura.ai' || email.includes('demo')) {
      const user: User = {
        id: email === 'admin@aura.ai' ? 'u_admin' : 'u_demo',
        name: email === 'admin@aura.ai' ? 'Administrator' : 'Demo User',
        email,
        role: 'Owner',
        organizationId: email === 'admin@aura.ai' ? 'aura-main' : 'org_demo',
      };
      const org: Organization = {
        id: user.organizationId,
        name: email === 'admin@aura.ai' ? 'Aura Corp (Headquarters)' : 'Demo Org',
        plan: 'Enterprise',
      };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEY_ORG, JSON.stringify(org));
      return { user, org };
    }
    throw new Error('Invalid credentials. Use admin@aura.ai or any demo email.');
  },

  verify2FA: async (code: string): Promise<{ user: User; org: Organization }> => {
    if (code === '123456') {
      const user: User = { id: 'u_admin', name: 'Administrator', email: 'admin@aura.ai', role: 'Owner', organizationId: 'aura-main' };
      const org: Organization = { id: 'aura-main', name: 'Aura Corp (Headquarters)', plan: 'Enterprise' };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEY_ORG, JSON.stringify(org));
      return { user, org };
    }
    throw new Error('Invalid 2FA code');
  },

  loginWithBiometrics: async (): Promise<{ user: User; org: Organization }> => {
    const user: User = { id: 'u_bio', name: 'Biometric User', email: 'bio@aura.ai', role: 'Admin', organizationId: 'org_bio' };
    const org: Organization = { id: 'org_bio', name: 'Bio Org', plan: 'Growth' };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEY_ORG, JSON.stringify(org));
    return { user, org };
  },

  loginWithProvider: async (provider: 'google' | 'microsoft' | 'sso'): Promise<{ user: User; org: Organization }> => {
    if (supabase && provider === 'google') {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/dashboard' },
      });
      if (error) throw error;
      // Return will happen after redirect
      return { user: {} as User, org: {} as Organization };
    }
    const names: Record<string, string> = { google: 'Tunde O.', microsoft: 'Corporate User', sso: 'SSO Admin' };
    const emails: Record<string, string> = { google: 'tunde@google-auth.com', microsoft: 'user@company-enterprise.com', sso: 'admin@corp-sso.net' };
    const companies: Record<string, string> = { google: 'Tunde & Co.', microsoft: 'Enterprise Corp', sso: 'Global Logistics' };
    const orgId = `org_${provider}_${Date.now()}`;
    const user: User = { id: `u_${provider}_${Date.now()}`, name: names[provider], email: emails[provider], role: 'Owner', organizationId: orgId };
    const org: Organization = { id: orgId, name: companies[provider], plan: provider === 'sso' ? 'Enterprise' : 'Growth' };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEY_ORG, JSON.stringify(org));
    return { user, org };
  },

  signup: async (name: string, email: string, password: string, _companyName: string): Promise<{ user: User; org: Organization }> => {
    if (!supabase) return authService.loginMock(email);

    const { error } = await supabase.auth.signUp({ email, password });
    if (error && !error.message.includes('already registered')) throw error;

    return upsertUserAndOrg(email, name);
  },

  logout: async (): Promise<void> => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_ORG);
    localStorage.removeItem('aura_token');
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
  },
};
