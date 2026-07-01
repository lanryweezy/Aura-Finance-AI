import { supabase } from './supabaseClient';
import { db } from './db';
import { addInvoice } from './receivablesService';
import { notificationService } from './notificationService';
import type { RecurringSchedule } from '../types';

export interface RecurringInvoice {
  id: string;
  templateId: string;
  customer: string;
  description: string;
  amount: number;
  vat: number;
  lineItems: any[];
  schedule: RecurringSchedule;
  projectId?: string;
  entityId?: string;
  createdAt: string;
}

export const recurringInvoiceService = {
  create: async (data: Omit<RecurringInvoice, 'id' | 'createdAt'>): Promise<RecurringInvoice> => {
    if (supabase) {
      const { data: saved } = await supabase.from('recurring_invoices').insert({
        ...data,
        schedule: JSON.stringify(data.schedule),
        organization_id: db.getOrgId(),
      }).select().single();
      return saved as RecurringInvoice;
    }
    return { ...data, id: `ri_${Date.now()}`, createdAt: new Date().toISOString() } as RecurringInvoice;
  },

  fetch: async (): Promise<RecurringInvoice[]> => {
    if (!supabase) return [];
    const { data } = await supabase.from('recurring_invoices')
      .select('*').eq('organization_id', db.getOrgId());
    return (data || []).map(r => ({
      ...r,
      schedule: typeof r.schedule === 'string' ? JSON.parse(r.schedule) : r.schedule,
    })) as RecurringInvoice[];
  },

  toggleActive: async (id: string, isActive: boolean): Promise<void> => {
    if (supabase) {
      const { data } = await supabase.from('recurring_invoices').select('schedule').eq('id', id).single();
      if (data) {
        const schedule = typeof data.schedule === 'string' ? JSON.parse(data.schedule) : data.schedule;
        schedule.isActive = isActive;
        await supabase.from('recurring_invoices').update({ schedule: JSON.stringify(schedule) }).eq('id', id);
      }
    }
  },

  delete: async (id: string): Promise<void> => {
    if (supabase) await supabase.from('recurring_invoices').delete().eq('id', id);
  },

  // Process due recurring invoices (call daily via cron or setInterval)
  processDue: async (): Promise<number> => {
    const recurring = await recurringInvoiceService.fetch();
    const active = recurring.filter(r => r.schedule.isActive);
    const now = new Date();
    let generated = 0;

    for (const ri of active) {
      const nextDue = new Date(ri.schedule.nextOccurrence);
      if (nextDue <= now) {
        try {
          await addInvoice({
            customer: ri.customer,
            description: ri.description,
            amount: ri.amount,
            vat: ri.vat,
            total: ri.amount + ri.vat,
            dueDate: new Date(now.getTime() + 30 * 86400000).toISOString(),
            whtApplied: false,
            lineItems: ri.lineItems,
            projectId: ri.projectId,
          });

          // Update next occurrence
          const schedule = { ...ri.schedule };
          schedule.occurrencesCount++;
          schedule.lastGenerated = now.toISOString();
          schedule.nextOccurrence = calculateNextOccurrence(now, schedule.frequency).toISOString();

          if (schedule.endAfterOccurrences && schedule.occurrencesCount >= schedule.endAfterOccurrences) {
            schedule.isActive = false;
          }

          if (supabase) {
            await supabase.from('recurring_invoices')
              .update({ schedule: JSON.stringify(schedule) })
              .eq('id', ri.id);
          }

          generated++;
        } catch (error) {
          console.error(`Failed to generate recurring invoice ${ri.id}:`, error);
        }
      }
    }

    if (generated > 0) {
      await notificationService.create({
        type: 'invoice', priority: 'medium',
        title: 'Recurring Invoices Generated',
        message: `${generated} invoice(s) auto-generated from recurring templates`,
      });
    }

    return generated;
  },
};

function calculateNextOccurrence(from: Date, frequency: string): Date {
  const next = new Date(from);
  switch (frequency) {
    case 'weekly': next.setDate(next.getDate() + 7); break;
    case 'monthly': next.setMonth(next.getMonth() + 1); break;
    case 'quarterly': next.setMonth(next.getMonth() + 3); break;
    case 'yearly': next.setFullYear(next.getFullYear() + 1); break;
  }
  return next;
}
