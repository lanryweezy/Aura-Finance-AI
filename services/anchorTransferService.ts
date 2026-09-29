import { supabase } from './supabaseClient';
import { anchorService } from './anchorService';

function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

export const anchorTransferService = {
  /**
   * Initiates an external or internal transfer via Anchor and logs it in Aura.
   */
  async initiateTransfer(
    orgId: string,
    sourceAccountId: string, // Aura internal anchor_accounts id or Anchor Account ID
    destinationBank: string,
    destinationAccount: string,
    amount: number,
    narration: string
  ) {
    if (amount <= 0) throw new Error('Transfer amount must be greater than zero');

    // Convert to kobo if necessary, but assume amount is in NGN for UI
    // Anchor expects minor units for amounts or float? Let's assume the API expects major units or we adapt based on Anchor docs.
    // Assuming amount passed here is already correctly formatted (kobo/minor unit mapping should be handled).

    const reference = `trf_${crypto.randomUUID().replace(/-/g, '')}`;
    const idempotencyKey = generateIdempotencyKey();

    try {
      // Create pending transfer in Aura immediately
      const { data: transferRecord, error: insertError } = await supabase
        .from('anchor_transfers')
        .insert({
          organization_id: orgId,
          source_account_id: sourceAccountId,
          destination_bank: destinationBank,
          destination_account: destinationAccount,
          amount,
          reference,
          narration,
          status: 'pending'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Make API call
      let anchorData;
      try {
        const response = await anchorService.createTransfer({
          sourceAccountId,
          destinationBankCode: destinationBank, // Mapped bank code
          destinationAccountNumber: destinationAccount,
          amount, // Should be integer minor units if strictly following docs
          narration,
          reference
        }, idempotencyKey);

        anchorData = response.data;
      } catch (apiError: any) {
        // If API fails, update local record as failed
        await supabase
          .from('anchor_transfers')
          .update({
            status: 'failed',
            error_message: apiError.message
          })
          .eq('id', transferRecord.id);

        throw apiError;
      }

      // Update transfer with Anchor ID
      const { data: updatedRecord, error: updateError } = await supabase
        .from('anchor_transfers')
        .update({
          anchor_transfer_id: anchorData.id,
          status: anchorData.status || 'processing',
          raw_data: anchorData,
          updated_at: new Date().toISOString()
        })
        .eq('id', transferRecord.id)
        .select()
        .single();

      if (updateError) throw updateError;

      return updatedRecord;

    } catch (err) {
      console.error('Transfer initiation failed:', err);
      throw err;
    }
  },

  async refreshTransfer(transferId: string) {
    // transferId is the anchor_transfer_id
    try {
      const response = await anchorService.getTransfer(transferId);
      const anchorData = response.data;

      const { data, error } = await supabase
        .from('anchor_transfers')
        .update({
          status: anchorData.status,
          error_message: anchorData.reason || null,
          raw_data: anchorData,
          updated_at: new Date().toISOString()
        })
        .eq('anchor_transfer_id', transferId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to refresh transfer:', err);
      throw err;
    }
  },

  async getTransfersForOrg(orgId: string) {
    const { data, error } = await supabase
      .from('anchor_transfers')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
