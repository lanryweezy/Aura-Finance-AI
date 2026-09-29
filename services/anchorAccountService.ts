import { supabase } from './supabaseClient';
import { anchorService } from './anchorService';

export const anchorAccountService = {
  /**
   * Creates a deposit account for a verified business customer
   */
  async createDepositAccount(orgId: string, anchorCustomerId: string, accountName: string) {
    try {
      const response = await anchorService.createDepositAccount({
        customerId: anchorCustomerId,
        accountName,
        currency: 'NGN',
        accountType: 'CURRENT'
      });

      const anchorData = response.data;
      if (!anchorData || !anchorData.id) {
        throw new Error('Invalid response from Anchor API');
      }

      // Record mapping in Aura
      const { data, error } = await supabase
        .from('anchor_accounts')
        .insert({
          anchor_account_id: anchorData.id,
          organization_id: orgId,
          anchor_customer_id: anchorCustomerId,
          account_type: 'deposit',
          account_number: anchorData.accountNumber || null,
          bank_name: anchorData.bankName || null,
          status: anchorData.status || 'pending',
          raw_data: anchorData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to create deposit account:', err);
      throw err;
    }
  },

  /**
   * Creates a reserved account linked to an invoice for collections
   */
  async createCollectionAccount(orgId: string, anchorCustomerId: string, invoiceId: string, accountName: string) {
    try {
      const response = await anchorService.createReservedAccount({
        customerId: anchorCustomerId,
        accountName,
        currency: 'NGN'
      });

      const anchorData = response.data;

      const { data, error } = await supabase
        .from('anchor_accounts')
        .insert({
          anchor_account_id: anchorData.id,
          organization_id: orgId,
          anchor_customer_id: anchorCustomerId,
          account_type: 'reserved',
          account_number: anchorData.accountNumber || null,
          bank_name: anchorData.bankName || null,
          status: anchorData.status || 'pending',
          aura_invoice_id: invoiceId,
          raw_data: anchorData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to create reserved account:', err);
      throw err;
    }
  },

  /**
   * Refresh account balances and status
   */
  async refreshAccount(anchorAccountId: string) {
    try {
      const response = await anchorService.getAccount(anchorAccountId);
      const anchorData = response.data;

      const { data, error } = await supabase
        .from('anchor_accounts')
        .update({
          account_number: anchorData.accountNumber || null,
          bank_name: anchorData.bankName || null,
          available_balance: anchorData.availableBalance || 0,
          ledger_balance: anchorData.ledgerBalance || 0,
          status: anchorData.status,
          raw_data: anchorData,
          updated_at: new Date().toISOString()
        })
        .eq('anchor_account_id', anchorAccountId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to refresh account:', err);
      throw err;
    }
  },

  async getAccountsForOrg(orgId: string) {
    const { data, error } = await supabase
      .from('anchor_accounts')
      .select('*')
      .eq('organization_id', orgId);

    if (error) throw error;
    return data;
  }
};
