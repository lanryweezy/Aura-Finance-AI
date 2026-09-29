import { supabase } from './supabaseClient';
import { anchorService } from './anchorService';

export const anchorCustomerService = {
  /**
   * Onboards a new business customer to Anchor and links it in Aura.
   */
  async onboardBusinessCustomer(orgId: string, payload: any) {
    try {
      // Create Customer in Anchor
      const response = await anchorService.createCustomer({
        customerType: 'Business',
        ...payload
      });

      const anchorData = response.data;
      if (!anchorData || !anchorData.id) {
        throw new Error('Invalid response from Anchor API');
      }

      // Record mapping in Aura
      const { data, error } = await supabase
        .from('anchor_customers')
        .insert({
          anchor_customer_id: anchorData.id,
          organization_id: orgId,
          customer_type: 'business',
          verification_status: anchorData.status || 'pending',
          raw_data: anchorData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to onboard business customer:', err);
      throw err;
    }
  },

  /**
   * Updates an existing customer's verification status by querying Anchor
   */
  async refreshCustomerStatus(anchorCustomerId: string) {
    try {
      const response = await anchorService.getCustomer(anchorCustomerId);
      const anchorData = response.data;

      const { data, error } = await supabase
        .from('anchor_customers')
        .update({
          verification_status: anchorData.status,
          raw_data: anchorData,
          updated_at: new Date().toISOString()
        })
        .eq('anchor_customer_id', anchorCustomerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to refresh customer status:', err);
      throw err;
    }
  },

  /**
   * Retrieves mapped Anchor customers for an organization
   */
  async getCustomersForOrg(orgId: string) {
    const { data, error } = await supabase
      .from('anchor_customers')
      .select('*')
      .eq('organization_id', orgId);

    if (error) throw error;
    return data;
  }
};
