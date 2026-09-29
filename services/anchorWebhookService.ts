import { supabase } from './supabaseClient';
// Using Web Crypto API which is compatible with Vite/browser environments (or edge functions).
// In a real edge function environment, standard web crypto is available.

export class AnchorWebhookError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnchorWebhookError';
  }
}

export const anchorWebhookService = {
  /**
   * Verifies the Anchor Webhook signature using HMAC-SHA1
   * Note: This is an async function because it uses the Web Crypto API.
   */
  async verifySignature(payload: string, signature: string, secretKey: string): Promise<boolean> {
    if (!signature) return false;

    try {
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        enc.encode(secretKey),
        { name: 'HMAC', hash: 'SHA-1' },
        false,
        ['sign', 'verify']
      );

      const signatureBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
      const isValid = await crypto.subtle.verify(
        'HMAC',
        key,
        signatureBytes,
        enc.encode(payload)
      );

      return isValid;
    } catch (e) {
      console.error('Signature verification failed:', e);
      return false;
    }
  },

  /**
   * Processes an incoming webhook event payload
   */
  async processEvent(payloadRaw: string, signature: string) {
    const secretKey = import.meta.env?.VITE_ANCHOR_SECRET_KEY || 'sandbox_sk_mock';

    const isValid = await this.verifySignature(payloadRaw, signature, secretKey);
    if (!isValid) {
      throw new AnchorWebhookError('Invalid webhook signature');
    }

    const payload = JSON.parse(payloadRaw);
    const eventId = payload.id;
    const eventType = payload.eventType || payload.event;

    if (!eventId) {
      throw new AnchorWebhookError('Missing event ID in webhook payload');
    }

    // Insert to prevent duplicate processing
    const { data: webhookRecord, error: insertError } = await supabase
      .from('anchor_webhook_events')
      .insert({
        event_id: eventId,
        event_type: eventType,
        payload: payload,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') { // Unique violation
        console.log(`Webhook event ${eventId} already processed or pending.`);
        return { message: 'Duplicate event ignored' };
      }
      throw insertError;
    }

    try {
      // Process business logic based on event type
      await this.handleBusinessLogic(eventType, payload);

      // Mark processed
      await supabase
        .from('anchor_webhook_events')
        .update({ status: 'processed', processed_at: new Date().toISOString() })
        .eq('id', webhookRecord.id);

    } catch (err: any) {
      // Mark failed
      await supabase
        .from('anchor_webhook_events')
        .update({ status: 'failed', error_message: err.message })
        .eq('id', webhookRecord.id);
      throw err;
    }

    return { message: 'Event processed successfully' };
  },

  async handleBusinessLogic(eventType: string, payload: any) {
    switch (eventType) {
      case 'transfer.successful':
        await this.handleTransferSuccess(payload.data);
        break;
      case 'transfer.failed':
        await this.handleTransferFailed(payload.data);
        break;
      case 'transaction.credit':
        await this.handleIncomingPayment(payload.data);
        break;
      case 'customer.created':
      case 'customer.updated':
        await this.handleCustomerUpdated(payload.data);
        break;
      case 'account.created':
        await this.handleAccountCreated(payload.data);
        break;
      // Add other cases as needed
      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }
  },

  async handleTransferSuccess(data: any) {
    const { id } = data; // Anchor transfer ID
    await supabase
      .from('anchor_transfers')
      .update({ status: 'success', raw_data: data })
      .eq('anchor_transfer_id', id);

    // Additional ledger processing could happen here
  },

  async handleTransferFailed(data: any) {
    const { id, reason } = data;
    await supabase
      .from('anchor_transfers')
      .update({ status: 'failed', error_message: reason, raw_data: data })
      .eq('anchor_transfer_id', id);
  },

  async handleIncomingPayment(data: any) {
    // Determine which reserved account received money
    const accountId = data.accountId;
    const amount = data.amount;

    // Find the mapped anchor_accounts
    const { data: accountRecord } = await supabase
      .from('anchor_accounts')
      .select('*')
      .eq('anchor_account_id', accountId)
      .single();

    if (accountRecord && accountRecord.aura_invoice_id) {
      // Update the invoice as Paid
      await supabase
        .from('invoices')
        .update({ status: 'Paid' }) // Realistically partial logic here
        .eq('id', accountRecord.aura_invoice_id);
    }
  },

  async handleCustomerUpdated(data: any) {
    const { id, status } = data;
    await supabase
      .from('anchor_customers')
      .update({ verification_status: status, raw_data: data })
      .eq('anchor_customer_id', id);
  },

  async handleAccountCreated(data: any) {
    const { id, accountNumber, bankName, status } = data;
    await supabase
      .from('anchor_accounts')
      .update({ account_number: accountNumber, bank_name: bankName, status: status, raw_data: data })
      .eq('anchor_account_id', id);
  }
};
