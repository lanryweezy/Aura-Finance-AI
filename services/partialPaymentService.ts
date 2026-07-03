import { supabase } from './supabaseClient';
import { db } from './db';
import { notificationService } from './notificationService';

export interface PartialPayment {
  id: string;
  invoiceId: string;
  amount: number;
  method: string;
  reference: string;
  paidAt: string;
  recordedBy: string;
}

export interface CreditNote {
  id: string;
  invoiceId: string;
  amount: number;
  reason: string;
  issuedBy: string;
  issuedAt: string;
}

export const partialPaymentService = {
  // Record a partial payment
  recordPayment: async (invoiceId: string, amount: number, method: string, reference: string): Promise<PartialPayment> => {
    const user = JSON.parse(localStorage.getItem('aura_user') || '{}');
    const payment: Omit<PartialPayment, 'id'> = {
      invoiceId, amount, method, reference,
      paidAt: new Date().toISOString(),
      recordedBy: user.name || 'System',
    };

    if (supabase) {
      const { data, error } = await supabase.from('partial_payments').insert({
        ...payment,
        organization_id: db.getOrgId(),
      }).select().single();
      if (error) throw error;

      // Update invoice status
      const { data: invoice } = await supabase.from('invoices').select('total, status').eq('id', invoiceId).single();
      if (invoice) {
        const totalPaid = await partialPaymentService.getTotalPaid(invoiceId);
        if (totalPaid >= invoice.total) {
          await supabase.from('invoices').update({ status: 'Paid' }).eq('id', invoiceId);
          await notificationService.create({
            type: 'payment', priority: 'high',
            title: 'Invoice Fully Paid', message: `Invoice #${invoiceId.slice(-6).toUpperCase()} has been fully paid`,
          });
        }
      }
      return data as PartialPayment;
    }
    return { ...payment, id: `pp_${Date.now()}` } as PartialPayment;
  },

  // Get total paid for an invoice
  getTotalPaid: async (invoiceId: string): Promise<number> => {
    if (!supabase) return 0;
    const { data } = await supabase.from('partial_payments')
      .select('amount').eq('invoice_id', invoiceId);
    return (data || []).reduce((s: number, p: any) => s + p.amount, 0);
  },

  // Get all partial payments for an invoice
  getPayments: async (invoiceId: string): Promise<PartialPayment[]> => {
    if (!supabase) return [];
    const { data } = await supabase.from('partial_payments')
      .select('*').eq('invoice_id', invoiceId).order('paid_at', { ascending: false });
    return (data || []) as PartialPayment[];
  },

  // Create credit note
  createCreditNote: async (invoiceId: string, amount: number, reason: string): Promise<CreditNote> => {
    const user = JSON.parse(localStorage.getItem('aura_user') || '{}');
    const note: Omit<CreditNote, 'id'> = {
      invoiceId, amount, reason,
      issuedBy: user.name || 'System',
      issuedAt: new Date().toISOString(),
    };

    if (supabase) {
      const { data, error } = await supabase.from('credit_notes').insert({
        ...note,
        organization_id: db.getOrgId(),
      }).select().single();
      if (error) throw error;

      // Update invoice amount
      const { data: invoice } = await supabase.from('invoices').select('total').eq('id', invoiceId).single();
      if (invoice) {
        await supabase.from('invoices').update({ amount: invoice.total - amount, total: invoice.total - amount }).eq('id', invoiceId);
      }

      await notificationService.create({
        type: 'invoice', priority: 'medium',
        title: 'Credit Note Issued', message: `Credit note of ₦${amount.toLocaleString()} issued for invoice #${invoiceId.slice(-6).toUpperCase()}`,
      });
      return data as CreditNote;
    }
    return { ...note, id: `cn_${Date.now()}` } as CreditNote;
  },

  // Get credit notes for an invoice
  getCreditNotes: async (invoiceId: string): Promise<CreditNote[]> => {
    if (!supabase) return [];
    const { data } = await supabase.from('credit_notes')
      .select('*').eq('invoice_id', invoiceId).order('issued_at', { ascending: false });
    return (data || []) as CreditNote[];
  },
};
