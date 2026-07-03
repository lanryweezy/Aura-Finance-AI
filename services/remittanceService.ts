import { supabase } from './supabaseClient';
import { db } from './db';

export interface RemittanceRecord {
  id: string;
  type: 'pension' | 'nhf';
  period: string;
  totalAmount: number;
  employeeCount: number;
  status: 'draft' | 'submitted' | 'confirmed';
  submittedAt?: string;
  createdAt: string;
}

export const remittanceService = {
  generatePensionRemittance: async (period: string, totalAmount: number, employeeCount: number): Promise<RemittanceRecord> => {
    if (supabase) {
      const { data } = await supabase.from('remittance_records').insert({
        type: 'pension', period, total_amount: totalAmount,
        employee_count: employeeCount, status: 'draft',
        organization_id: db.getOrgId(),
      }).select().single();
      return data as RemittanceRecord;
    }
    return { id: `rem_${Date.now()}`, type: 'pension', period, totalAmount, employeeCount, status: 'draft', createdAt: new Date().toISOString() };
  },

  generateNHFRemittance: async (period: string, totalAmount: number, employeeCount: number): Promise<RemittanceRecord> => {
    if (supabase) {
      const { data } = await supabase.from('remittance_records').insert({
        type: 'nhf', period, total_amount: totalAmount,
        employee_count: employeeCount, status: 'draft',
        organization_id: db.getOrgId(),
      }).select().single();
      return data as RemittanceRecord;
    }
    return { id: `rem_${Date.now()}`, type: 'nhf', period, totalAmount, employeeCount, status: 'draft', createdAt: new Date().toISOString() };
  },

  submit: async (id: string): Promise<void> => {
    if (supabase) await supabase.from('remittance_records').update({ status: 'submitted', submitted_at: new Date().toISOString() }).eq('id', id);
  },

  getRecords: async (type?: 'pension' | 'nhf'): Promise<RemittanceRecord[]> => {
    if (!supabase) return [];
    let q = supabase.from('remittance_records').select('*').eq('organization_id', db.getOrgId());
    if (type) q = q.eq('type', type);
    const { data } = await q.order('created_at', { ascending: false });
    return (data || []) as RemittanceRecord[];
  },
};
