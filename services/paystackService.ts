import { supabase } from './supabaseClient';
import { db } from './db';
import { monitoringService } from './monitoringService';

declare const PaystackPop: any;

const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_KEY || '';

export interface PaymentLink {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed';
  customerEmail: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export const paystackService = {
  // Initialize Paystack payment for an invoice
  initializePayment: async (
    amount: number,
    email: string,
    metadata: Record<string, any> = {}
  ): Promise<{ reference: string; auth_url?: string }> => {
    const reference = `AURA-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    if (supabase) {
      await supabase.from('payments').insert({
        reference,
        amount,
        currency: 'NGN',
        status: 'pending',
        customer_email: email,
        metadata: JSON.stringify(metadata),
        organization_id: db.getOrgId(),
      });
    }

    if (typeof PaystackPop === 'undefined') {
      // Return mock for development
      return { reference };
    }

    return new Promise((resolve) => {
      const handler = PaystackPop.setup({
        key: PAYSTACK_KEY,
        email,
        amount: amount * 100, // Paystack uses kobo
        currency: 'NGN',
        reference,
        metadata: { custom_fields: Object.entries(metadata).map(([key, value]) => ({ variable_name: key, value: String(value) })) },
        callback: (response: any) => {
          monitoringService.log('info', 'PAYSTACK', `Payment successful: ${response.reference}`);
          paystackService.verifyPayment(response.reference);
          resolve({ reference: response.reference });
        },
        onClose: () => {
          monitoringService.log('info', 'PAYSTACK', 'Payment window closed');
          resolve({ reference });
        },
      });
      handler.openIframe();
    });
  },

  // Verify payment with Paystack API
  verifyPayment: async (reference: string): Promise<boolean> => {
    if (!PAYSTACK_KEY) return false;

    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${PAYSTACK_KEY}` },
      });
      const data = await response.json();

      if (data.status && data.data?.status === 'success') {
        if (supabase) {
          await supabase.from('payments')
            .update({ status: 'success', paid_at: new Date().toISOString() })
            .eq('reference', reference);

          // Update related invoice if metadata contains invoiceId
          const invoiceId = data.data.metadata?.invoiceId;
          if (invoiceId) {
            await supabase.from('invoices')
              .update({ status: 'Paid' })
              .eq('id', invoiceId);
          }

          // Update related bill if metadata contains billId
          const billId = data.data.metadata?.billId;
          if (billId) {
            await supabase.from('bills')
              .update({ status: 'Paid' })
              .eq('id', billId);
          }
        }
        return true;
      }
      return false;
    } catch (error) {
      monitoringService.trackError('PAYSTACK_VERIFY', error as Error);
      return false;
    }
  },

  // Create payment link for sharing
  createPaymentLink: async (
    amount: number,
    description: string,
    metadata: Record<string, any> = {}
  ): Promise<string> => {
    const reference = `AURA-LINK-${Date.now()}`;
    if (supabase) {
      await supabase.from('payment_links').insert({
        reference,
        amount,
        description,
        metadata: JSON.stringify(metadata),
        organization_id: db.getOrgId(),
      });
    }
    return `${window.location.origin}/pay/${reference}`;
  },

  // Get payment history
  getPayments: async (limit = 50): Promise<PaymentLink[]> => {
    if (!supabase) return [];
    const { data } = await supabase.from('payments')
      .select('*')
      .eq('organization_id', db.getOrgId())
      .order('created_at', { ascending: false })
      .limit(limit);
    return (data || []) as PaymentLink[];
  },

  // Get payment stats
  getStats: async () => {
    const payments = await paystackService.getPayments();
    const successful = payments.filter(p => p.status === 'success');
    const totalReceived = successful.reduce((s, p) => s + p.amount, 0);
    const thisMonth = successful.filter(p => {
      const d = new Date(p.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    return {
      totalPayments: payments.length,
      successfulPayments: successful.length,
      totalReceived,
      thisMonthReceived: thisMonth.reduce((s, p) => s + p.amount, 0),
    };
  },

  isConfigured: (): boolean => !!PAYSTACK_KEY && !PAYSTACK_KEY.includes('placeholder'),
};
