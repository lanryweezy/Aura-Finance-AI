import { supabase } from './supabaseClient';
import { db } from './db';
import type { BulkPayment, BulkPaymentRecipient } from '../types';

export const bulkPaymentService = {
  create: async (name: string, recipients: Omit<BulkPaymentRecipient, 'id' | 'bulkPaymentId' | 'status'>[]): Promise<BulkPayment> => {
    const totalAmount = recipients.reduce((s, r) => s + r.amount, 0);
    if (supabase) {
      const { data, error } = await supabase.from('bulk_payments').insert({
        name, status: 'draft', total_amount: totalAmount,
        recipient_count: recipients.length, processed_count: 0, failed_count: 0,
        currency: 'NGN', organization_id: db.getOrgId(),
      }).select().single();
      if (error) throw error;
      return data as BulkPayment;
    }
    return { id: `bp_${Date.now()}`, name, status: 'draft', totalAmount, recipientCount: recipients.length, processedCount: 0, failedCount: 0, currency: 'NGN', createdAt: new Date().toISOString() } as BulkPayment;
  },

  process: async (bulkPaymentId: string, recipients: Omit<BulkPaymentRecipient, 'id' | 'bulkPaymentId' | 'status'>[]): Promise<void> => {
    if (!supabase) return;
    await supabase.from('bulk_payments').update({ status: 'processing' }).eq('id', bulkPaymentId);
    const rows = recipients.map(r => ({
      bulk_payment_id: bulkPaymentId, name: r.name, bank_name: r.bankName,
      account_number: r.accountNumber, amount: r.amount, status: 'pending',
    }));
    await supabase.from('bulk_payment_recipients').insert(rows);
    // In production: iterate and call Paystack/Flutterwave bulk API
    // For now, simulate processing
    let processed = 0, failed = 0;
    for (const row of rows) {
      const success = Math.random() > 0.02; // 98% success rate
      await supabase.from('bulk_payment_recipients')
        .update({ status: success ? 'completed' : 'failed', error: success ? null : 'Simulated failure' })
        .eq('bulk_payment_id', bulkPaymentId)
        .eq('account_number', row.account_number);
      if (success) processed++; else failed++;
    }
    await supabase.from('bulk_payments').update({
      status: 'completed', processed_count: processed, failed_count: failed,
      completed_at: new Date().toISOString(),
    }).eq('id', bulkPaymentId);
  },

  fetch: async (): Promise<BulkPayment[]> => {
    if (!supabase) return [];
    const { data } = await supabase.from('bulk_payments')
      .select('*').eq('organization_id', db.getOrgId())
      .order('created_at', { ascending: false });
    return (data || []) as BulkPayment[];
  },

  getRecipients: async (bulkPaymentId: string): Promise<BulkPaymentRecipient[]> => {
    if (!supabase) return [];
    const { data } = await supabase.from('bulk_payment_recipients')
      .select('*').eq('bulk_payment_id', bulkPaymentId);
    return (data || []) as BulkPaymentRecipient[];
  },
};
