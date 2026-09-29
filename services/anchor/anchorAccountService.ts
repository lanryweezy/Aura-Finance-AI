import { anchorService } from './anchorService';
import { supabase } from '../supabaseClient';
import { AnchorDepositAccount } from '../../types/anchor';

export const anchorAccountService = {
  createDepositAccount: async (anchorCustomerId: string, productName: string = 'SAVINGS'): Promise<AnchorDepositAccount> => {
    const response = await anchorService.callApi('createDepositAccount', {
        data: {
          type: 'DepositAccount',
          attributes: { productName },
          relationships: {
            customer: {
              data: {
                id: anchorCustomerId,
                type: 'IndividualCustomer', // or BusinessCustomer
              }
            }
          }
        }
    });

    const account = Array.isArray(response.data) ? response.data[0] : response.data;
    if (!account || !account.id) {
        throw new Error('Failed to parse Anchor deposit account response');
    }

    const { error } = await supabase
      .from('anchor_accounts')
      .insert({
        anchor_id: account.id,
        customer_id: anchorCustomerId,
        product_name: productName,
        status: 'pending' // will be updated via webhook
      });

    if (error) {
      console.error('Failed to link Anchor account in DB:', error);
    }

    return account;
  },

  getAccountBalance: async (anchorAccountId: string) => {
    return anchorService.callApiGet({ action: 'getAccountBalance', accountId: anchorAccountId });
  },

  getAccountDetails: async (anchorAccountId: string) => {
    const { data, error } = await supabase
      .from('anchor_accounts')
      .select('*')
      .eq('anchor_id', anchorAccountId)
      .single();

    if (error) return null;
    return data;
  }
};
