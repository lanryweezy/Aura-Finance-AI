import { supabase } from './supabaseClient';
import { db } from './db';

export interface SalaryAdvance {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  repaymentMonths: number;
  monthlyDeduction: number;
  reason: string;
  status: 'active' | 'completed' | 'cancelled';
  startDate: string;
  createdAt: string;
}

export const salaryAdvanceService = {
  request: async (employeeId: string, employeeName: string, amount: number, repaymentMonths: number, reason: string): Promise<SalaryAdvance> => {
    const monthlyDeduction = Math.ceil(amount / repaymentMonths);
    if (supabase) {
      const { data } = await supabase.from('salary_advances').insert({
        employee_id: employeeId, employee_name: employeeName, amount,
        repayment_months: repaymentMonths, monthly_deduction: monthlyDeduction,
        reason, status: 'active', start_date: new Date().toISOString(),
        organization_id: db.getOrgId(),
      }).select().single();
      return data as SalaryAdvance;
    }
    return { id: `sa_${Date.now()}`, employeeId, employeeName, amount, repaymentMonths, monthlyDeduction, reason, status: 'active', startDate: new Date().toISOString(), createdAt: new Date().toISOString() };
  },

  getActive: async (employeeId: string): Promise<SalaryAdvance | null> => {
    if (!supabase) return null;
    const { data } = await supabase.from('salary_advances')
      .select('*').eq('employee_id', employeeId).eq('status', 'active').single();
    return data as SalaryAdvance | null;
  },

  complete: async (id: string): Promise<void> => {
    if (supabase) await supabase.from('salary_advances').update({ status: 'completed' }).eq('id', id);
  },
};
