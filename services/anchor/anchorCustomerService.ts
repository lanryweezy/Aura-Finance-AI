import { anchorService } from './anchorService';
import { supabase } from '../supabaseClient';
import { AnchorCustomer } from '../../types/anchor';

export const anchorCustomerService = {
  createIndividualCustomer: async (
    userId: string,
    customerData: any
  ): Promise<AnchorCustomer> => {
    // 1. Create on Anchor via serverless function
    const response = await anchorService.callApi('createCustomer', {
      data: {
        type: 'IndividualCustomer',
        attributes: customerData
      }
    });

    const anchorCustomer = Array.isArray(response.data) ? response.data[0] : response.data;
    if (!anchorCustomer || !anchorCustomer.id) {
        throw new Error('Failed to parse Anchor customer response');
    }

    // 2. Persist in Aura DB
    const { error } = await supabase
      .from('anchor_customers')
      .insert({
        anchor_id: anchorCustomer.id,
        type: 'IndividualCustomer',
        user_id: userId,
        status: anchorCustomer.attributes?.verification?.status || 'pending'
      });

    if (error) {
      console.error('Failed to link Anchor customer in DB:', error);
    }

    return anchorCustomer;
  },

  getCustomerByUserId: async (userId: string) => {
    const { data, error } = await supabase
      .from('anchor_customers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  }
};
