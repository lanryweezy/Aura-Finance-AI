import { supabase } from './supabaseClient';
import { db } from './db';
import type { Invoice } from '../types';

export interface PortalLink {
  token: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
  viewedAt?: string;
}

function generateToken(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

function formatNGN(amount: number): string {
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
}

export const clientPortalService = {
  generateLink: async (invoice: Invoice): Promise<PortalLink> => {
    const token = generateToken();
    const link: PortalLink = {
      token,
      invoiceId: invoice.id,
      invoiceNumber: `INV-${invoice.id.slice(-6).toUpperCase()}`,
      clientName: invoice.customer,
      clientEmail: '',
      totalAmount: invoice.total,
      currency: invoice.currency || 'NGN',
      status: invoice.status,
      createdAt: new Date().toISOString(),
    };

    if (supabase) {
      await supabase.from('client_portal_links').insert({
        token,
        invoice_id: invoice.id,
        invoice_number: link.invoiceNumber,
        client_name: invoice.customer,
        total_amount: invoice.total,
        currency: link.currency,
        status: invoice.status,
      }).then(({ error }) => { if (error) console.error('Portal link save error:', error); });
    }

    return link;
  },

  getInvoiceByToken: async (token: string): Promise<{ invoice: Invoice; link: PortalLink } | null> => {
    if (supabase) {
      const { data: linkData } = await supabase
        .from('client_portal_links')
        .select('*')
        .eq('token', token)
        .single();

      if (!linkData) return null;

      const { data: invoiceData } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', linkData.invoice_id)
        .single();

      if (!invoiceData) return null;

      // Mark as viewed
      await supabase.from('client_portal_links')
        .update({ viewed_at: new Date().toISOString() })
        .eq('token', token);

      return {
        invoice: invoiceData as Invoice,
        link: linkData as PortalLink,
      };
    }
    return null;
  },

  confirmPayment: async (token: string): Promise<boolean> => {
    if (supabase) {
      const { data: link } = await supabase
        .from('client_portal_links')
        .select('invoice_id')
        .eq('token', token)
        .single();

      if (link) {
        await supabase.from('invoices')
          .update({ status: 'Paid' })
          .eq('id', link.invoice_id);
        return true;
      }
    }
    return false;
  },

  getShareableUrl: (token: string): string => {
    return `${window.location.origin}/portal/${token}`;
  },

  getWhatsAppMessage: (link: PortalLink): string => {
    return [
      `📄 Invoice ${link.invoiceNumber}`,
      ``,
      `Hi ${link.clientName},`,
      `Please view and pay your invoice for ${formatNGN(link.totalAmount)}.`,
      ``,
      `View: ${clientPortalService.getShareableUrl(link.token)}`,
      ``,
      `Thank you for your business!`,
    ].join('\n');
  },
};
