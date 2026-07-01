import { supabase } from './supabaseClient';
import { db } from './db';
import { notificationService } from './notificationService';
import { clientPortalService } from './clientPortalService';
import type { Contact, Bill, LineItem } from '../types';

function generateToken(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

export interface VendorPortalSession {
  token: string;
  vendorId: string;
  vendorName: string;
  createdAt: string;
  expiresAt: string;
}

export const vendorPortalService = {
  // Generate a portal link for a vendor
  generateLink: async (vendor: Contact): Promise<VendorPortalSession> => {
    const token = generateToken();
    const session: VendorPortalSession = {
      token,
      vendorId: vendor.id,
      vendorName: vendor.name,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(), // 30 days
    };

    if (supabase) {
      await supabase.from('vendor_portal_links').insert({
        token, vendor_id: vendor.id, vendor_name: vendor.name,
        organization_id: db.getOrgId(),
      });
    }

    return session;
  },

  // Vendor submits a bill through the portal
  submitBill: async (token: string, billData: {
    description: string;
    amount: number;
    dueDate: string;
    lineItems: { name: string; quantity: number; unitPrice: number; total: number }[];
  }): Promise<{ success: boolean; billId?: string; error?: string }> => {
    if (!supabase) return { success: false, error: 'Portal not configured' };

    // Validate token
    const { data: link } = await supabase
      .from('vendor_portal_links')
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!link) return { success: false, error: 'Invalid or expired portal link' };

    // Create bill
    const { data: bill, error } = await supabase.from('bills').insert({
      vendor: link.vendor_name,
      description: billData.description,
      amount: billData.amount,
      due_date: billData.dueDate,
      line_items: JSON.stringify(billData.lineItems),
      status: 'Unpaid',
      wht_applies: false,
      organization_id: db.getOrgId(),
    }).select().single();

    if (error) return { success: false, error: error.message };

    // Notify the business
    await notificationService.create({
      type: 'bill', priority: 'medium',
      title: 'New Bill from Vendor',
      message: `${link.vendor_name} submitted a bill for ₦${billData.amount.toLocaleString()}`,
      actionUrl: '/payables',
      metadata: { billId: bill.id, vendorName: link.vendor_name },
    });

    return { success: true, billId: bill.id };
  },

  // Get vendor's bills
  getVendorBills: async (token: string): Promise<Bill[]> => {
    if (!supabase) return [];
    const { data: link } = await supabase
      .from('vendor_portal_links')
      .select('vendor_id')
      .eq('token', token)
      .single();
    if (!link) return [];

    const { data } = await supabase.from('bills')
      .select('*')
      .eq('vendor', link.vendor_id)
      .eq('organization_id', db.getOrgId())
      .order('created_at', { ascending: false });
    return (data || []) as Bill[];
  },

  // Get portal URL
  getUrl: (token: string): string => {
    return `${window.location.origin}/vendor-portal/${token}`;
  },

  // Validate token
  validateToken: async (token: string): Promise<boolean> => {
    if (!supabase) return false;
    const { data } = await supabase
      .from('vendor_portal_links')
      .select('id')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();
    return !!data;
  },
};
