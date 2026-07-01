import { supabase } from './supabaseClient';
import { db } from './db';
import { monitoringService } from './monitoringService';

const MONO_API_URL = 'https://api.withmono.com';
const MONO_SECRET = import.meta.env.VITE_MONO_SECRET || '';

export interface MonoAccount {
  id: string;
  institution: { name: string; id: string };
  account: { name: string; number: string; type: string; balance: number };
  created_at: string;
}

export interface MonoTransaction {
  id: string;
  amount: number;
  type: 'debit' | 'credit';
  narration: string;
  date: string;
  balance: number;
  category?: string;
}

async function monoRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any): Promise<any> {
  if (!MONO_SECRET) return { error: 'Mono API key not configured' };
  try {
    const headers: Record<string, string> = {
      'mono-secret': MONO_SECRET,
      'Content-Type': 'application/json',
    };
    const response = await fetch(`${MONO_API_URL}${endpoint}`, {
      method, headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { error: err.message || `HTTP ${response.status}` };
    }
    return await response.json();
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Mono API failed' };
  }
}

export const monoService = {
  // Generate account linking URL
  generateLinkUrl: async (redirectUrl: string): Promise<{ auth_url?: string; error?: string }> => {
    const result = await monoRequest('/account/auth', 'POST', {
      redirect_url: redirectUrl,
      scope: 'accounts_identity',
    });
    if (result.error) return { error: result.error };
    return { auth_url: result.data?.auth_url };
  },

  // Get account details after linking
  getAccount: async (accountId: string): Promise<MonoAccount | null> => {
    const result = await monoRequest(`/accounts/${accountId}`);
    if (result.error) return null;
    return result.data;
  },

  // Get transactions
  getTransactions: async (accountId: string, startDate?: string, endDate?: string): Promise<MonoTransaction[]> => {
    let endpoint = `/accounts/${accountId}/transactions`;
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (params.toString()) endpoint += `?${params.toString()}`;

    const result = await monoRequest(endpoint);
    if (result.error) return [];
    return result.data?.transactions || [];
  },

  // Sync transactions to Aura
  syncTransactions: async (accountId: string): Promise<number> => {
    const transactions = await monoService.getTransactions(accountId);
    if (transactions.length === 0) return 0;

    if (supabase) {
      const rows = transactions.map(t => ({
        id: t.id,
        amount: t.amount,
        type: t.type,
        narration: t.narration,
        date: t.date,
        balance: t.balance,
        category: t.category || 'Uncategorized',
        organization_id: db.getOrgId(),
      }));
      const { error } = await supabase.from('transactions').upsert(rows, { onConflict: 'id' });
      if (error) { monitoringService.trackError('MONO_SYNC', error.message); return 0; }
    }
    return transactions.length;
  },

  // Reconnect account
  reauthAccount: async (accountId: string): Promise<{ auth_url?: string; error?: string }> => {
    const result = await monoRequest(`/accounts/${accountId}/reauth`, 'POST');
    if (result.error) return { error: result.error };
    return { auth_url: result.data?.reauth_url };
  },

  // Get balance
  getBalance: async (accountId: string): Promise<{ balance?: number; error?: string }> => {
    const result = await monoRequest(`/accounts/${accountId}/balance`);
    if (result.error) return { error: result.error };
    return { balance: result.data?.balance };
  },

  isConfigured: (): boolean => !!MONO_SECRET,
};
