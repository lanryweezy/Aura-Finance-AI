import { supabase } from './supabaseClient';
import { db } from './db';

export interface InvoiceSequence {
  id: string;
  prefix: string;
  nextNumber: number;
  organizationId: string;
}

export const invoiceNumberService = {
  // Get next invoice number
  getNextNumber: async (): Promise<string> => {
    const now = new Date();
    const prefix = `INV-${now.getFullYear()}`;

    if (supabase) {
      const { data } = await supabase
        .from('invoice_sequences')
        .select('*')
        .eq('organization_id', db.getOrgId())
        .eq('prefix', prefix)
        .single();

      if (data) {
        const nextNum = data.next_number + 1;
        await supabase.from('invoice_sequences')
          .update({ next_number: nextNum })
          .eq('id', data.id);
        return `${prefix}-${String(nextNum).padStart(4, '0')}`;
      }

      // Create new sequence
      const { error } = await supabase.from('invoice_sequences').insert({
        prefix,
        next_number: 1,
        organization_id: db.getOrgId(),
      });
      if (error) console.error('Failed to create sequence:', error);
      return `${prefix}-0001`;
    }

    // Fallback: random
    return `${prefix}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`;
  },

  // Validate invoice number format
  validate: (number: string): boolean => {
    return /^INV-\d{4}-\d{4}$/.test(number);
  },
};
