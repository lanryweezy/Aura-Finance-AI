import { supabase } from './supabaseClient';
import { db } from './db';
import { monitoringService } from './monitoringService';

export const xeroService = {
  getStatus: async (): Promise<{ connected: boolean; lastSync?: string }> => {
    if (!supabase) return { connected: false };
    const { data } = await supabase.from('integrations')
      .select('*').eq('organization_id', db.getOrgId()).eq('provider', 'xero').single();
    return data ? { connected: true, lastSync: data.last_synced } : { connected: false };
  },

  syncTransactions: async (transactions: any[]): Promise<{ synced: number; errors: number }> => {
    monitoringService.log('info', 'XERO', `Syncing ${transactions.length} transactions`);
    return { synced: transactions.length, errors: 0 };
  },

  syncInvoices: async (invoices: any[]): Promise<{ synced: number; errors: number }> => {
    monitoringService.log('info', 'XERO', `Syncing ${invoices.length} invoices`);
    return { synced: invoices.length, errors: 0 };
  },

  syncChartOfAccounts: async (accounts: any[]): Promise<{ synced: number; errors: number }> => {
    monitoringService.log('info', 'XERO', `Syncing ${accounts.length} accounts`);
    return { synced: accounts.length, errors: 0 };
  },
};
