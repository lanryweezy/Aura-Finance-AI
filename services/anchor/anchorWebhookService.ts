import { supabase } from '../supabaseClient';
import { AnchorWebhookEvent } from '../../types/anchor';

export const anchorWebhookService = {
  processEvent: async (event: AnchorWebhookEvent) => {
    const { error: insertError } = await supabase
      .from('anchor_webhook_events')
      .insert({
        event_id: event.id,
        type: event.type,
        payload: event
      });

    if (insertError) {
      if (insertError.code === '23505') {
        return { status: 'already_processed' };
      }
      throw new Error(`Failed to log webhook event: ${insertError.message}`);
    }

    try {
      switch (event.type) {
        case 'nip.transfer.successful':
        case 'nip.transfer.failed':
        case 'nip.transfer.initiated':
          await anchorWebhookService.handleTransferEvent(event);
          break;
        default:
          console.log(`Unhandled Anchor event type: ${event.type}`);
      }

      await supabase
        .from('anchor_webhook_events')
        .update({ processed: true })
        .eq('event_id', event.id);

      return { status: 'success' };
    } catch (error) {
      console.error('Error processing anchor event:', error);
      throw error;
    }
  },

  handleTransferEvent: async (event: AnchorWebhookEvent) => {
    const transferId = event.relationships?.transfer?.data?.id;
    if (!transferId) throw new Error('No transfer ID in event');

    let status = 'pending';
    if (event.type === 'nip.transfer.successful') status = 'successful';
    if (event.type === 'nip.transfer.failed') status = 'failed';

    const { error } = await supabase
      .from('anchor_transfers')
      .update({ status })
      .eq('anchor_id', transferId);

    if (error) {
      throw new Error(`Failed to update transfer status: ${error.message}`);
    }
  }
};
