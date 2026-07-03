import { supabase } from './supabaseClient';
import { db } from './db';

export interface OvertimeRecord {
  id: string;
  employeeId: string;
  date: string;
  hours: number;
  rate: number; // 1.5 for weekday, 2.0 for weekend
  amount: number;
  approved: boolean;
  createdAt: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'annual' | 'sick' | 'maternity' | 'paternity' | 'compassionate' | 'unpaid';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  createdAt: string;
}

export interface LeaveBalance {
  employeeId: string;
  employeeName: string;
  annual: number;
  sick: number;
  maternity: number;
  paternity: number;
  compassionate: number;
  used: number;
  remaining: number;
}

const NIGERIAN_PUBLIC_HOLIDAYS_2026 = [
  { date: '2026-01-01', name: 'New Year Day' },
  { date: '2026-03-29', name: 'Good Friday' },
  { date: '2026-03-30', name: 'Easter Saturday' },
  { date: '2026-04-02', name: 'Easter Monday' },
  { date: '2026-05-01', name: 'Workers Day' },
  { date: '2026-05-29', name: 'Democracy Day' },
  { date: '2026-06-06', name: 'Eid el-Fitr' },
  { date: '2026-08-12', name: 'Eid el-Kabir' },
  { date: '2026-09-27', name: 'Mawlid' },
  { date: '2026-10-01', name: 'Independence Day' },
  { date: '2026-12-25', name: 'Christmas Day' },
  { date: '2026-12-26', name: 'Boxing Day' },
];

export const overtimeService = {
  // Calculate overtime pay
  calculateOvertime: (basicHourlyRate: number, hours: number, isWeekend: boolean = false): number => {
    const rate = isWeekend ? 2.0 : 1.5;
    return Math.round(basicHourlyRate * hours * rate);
  },

  // Record overtime
  record: async (employeeId: string, date: string, hours: number, hourlyRate: number, isWeekend: boolean): Promise<OvertimeRecord> => {
    const amount = overtimeService.calculateOvertime(hourlyRate, hours, isWeekend);
    if (supabase) {
      const { data } = await supabase.from('overtime_records').insert({
        employee_id: employeeId, date, hours, rate: isWeekend ? 2.0 : 1.5,
        amount, approved: false, organization_id: db.getOrgId(),
      }).select().single();
      return data as OvertimeRecord;
    }
    return { id: `ot_${Date.now()}`, employeeId, date, hours, rate: isWeekend ? 2.0 : 1.5, amount, approved: false, createdAt: new Date().toISOString() };
  },

  // Approve overtime
  approve: async (id: string): Promise<void> => {
    if (supabase) await supabase.from('overtime_records').update({ approved: true }).eq('id', id);
  },

  // Get overtime for employee
  getByEmployee: async (employeeId: string): Promise<OvertimeRecord[]> => {
    if (!supabase) return [];
    const { data } = await supabase.from('overtime_records')
      .select('*').eq('employee_id', employeeId).eq('organization_id', db.getOrgId());
    return (data || []) as OvertimeRecord[];
  },
};

export const leaveService = {
  // Calculate leave balance (21 days annual leave per Nigerian labor law)
  getBalance: async (employeeId: string): Promise<LeaveBalance> => {
    if (supabase) {
      const { data } = await supabase.from('leave_balances')
        .select('*').eq('employee_id', employeeId).single();
      if (data) return data as LeaveBalance;
    }
    return { employeeId, employeeName: '', annual: 21, sick: 12, maternity: 90, paternity: 5, compassionate: 5, used: 0, remaining: 21 };
  },

  // Submit leave request
  submitRequest: async (request: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>): Promise<LeaveRequest> => {
    if (supabase) {
      const { data } = await supabase.from('leave_requests').insert({
        ...request, status: 'pending', organization_id: db.getOrgId(),
      }).select().single();
      return data as LeaveRequest;
    }
    return { ...request, id: `lr_${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() };
  },

  // Approve leave request
  approveRequest: async (id: string, approvedBy: string): Promise<void> => {
    if (supabase) {
      await supabase.from('leave_requests').update({ status: 'approved', approved_by: approvedBy }).eq('id', id);
    }
  },

  // Reject leave request
  rejectRequest: async (id: string): Promise<void> => {
    if (supabase) await supabase.from('leave_requests').update({ status: 'rejected' }).eq('id', id);
  },

  // Get all leave requests
  getRequests: async (employeeId?: string): Promise<LeaveRequest[]> => {
    if (!supabase) return [];
    let q = supabase.from('leave_requests').select('*').eq('organization_id', db.getOrgId());
    if (employeeId) q = q.eq('employee_id', employeeId);
    const { data } = await q.order('created_at', { ascending: false });
    return (data || []) as LeaveRequest[];
  },

  // Get Nigerian public holidays
  getPublicHolidays: (year: number = 2026): { date: string; name: string }[] => {
    return NIGERIAN_PUBLIC_HOLIDAYS_2026.filter(h => h.date.startsWith(String(year)));
  },

  // Calculate business days between dates (excluding weekends and holidays)
  calculateBusinessDays: (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let days = 0;
    const holidays = new Set(NIGERIAN_PUBLIC_HOLIDAYS_2026.map(h => h.date));

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      const dateStr = d.toISOString().split('T')[0];
      if (day !== 0 && day !== 6 && !holidays.has(dateStr)) {
        days++;
      }
    }
    return days;
  },
};
