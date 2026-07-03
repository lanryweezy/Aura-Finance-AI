import { supabase } from './supabaseClient';
import { db } from './db';
import { notificationService } from './notificationService';
import type { Invoice } from '../types';

export interface ReminderConfig {
  enabled: boolean;
  daysAfterDue: number[];
  template: 'formal' | 'casual' | 'followup' | 'overdue';
}

const DEFAULT_REMINDER_CONFIG: ReminderConfig = {
  enabled: true,
  daysAfterDue: [1, 7, 14, 30],
  template: 'followup',
};

export const invoiceReminderService = {
  // Get reminder config for an organization
  getConfig: async (): Promise<ReminderConfig> => {
    if (!supabase) return DEFAULT_REMINDER_CONFIG;
    const { data } = await supabase
      .from('reminder_configs')
      .select('*')
      .eq('organization_id', db.getOrgId())
      .single();
    return (data || DEFAULT_REMINDER_CONFIG) as ReminderConfig;
  },

  // Save reminder config
  saveConfig: async (config: ReminderConfig): Promise<void> => {
    if (!supabase) return;
    await supabase.from('reminder_configs').upsert({
      ...config,
      days_after_due: config.daysAfterDue,
      organization_id: db.getOrgId(),
    });
  },

  // Check for overdue invoices and create reminders
  checkOverdueInvoices: async (invoices: Invoice[]): Promise<number> => {
    const config = await invoiceReminderService.getConfig();
    if (!config.enabled) return 0;

    const now = new Date();
    const overdue = invoices.filter(i => i.status !== 'Paid' && new Date(i.dueDate) < now);
    let reminderCount = 0;

    for (const invoice of overdue) {
      const daysOverdue = Math.floor((now.getTime() - new Date(invoice.dueDate).getTime()) / 86400000);

      if (config.daysAfterDue.includes(daysOverdue)) {
        await notificationService.create({
          type: 'overdue',
          priority: daysOverdue > 14 ? 'critical' : daysOverdue > 7 ? 'high' : 'medium',
          title: `Invoice Overdue: ${invoice.customer}`,
          message: `Invoice #${invoice.id.slice(-6).toUpperCase()} for ₦${invoice.total.toLocaleString()} is ${daysOverdue} days overdue`,
          actionUrl: '/receivables',
          metadata: { invoiceId: invoice.id, daysOverdue },
        });
        reminderCount++;
      }
    }

    return reminderCount;
  },

  // Generate reminder email content
  generateReminderEmail: (invoice: Invoice, daysOverdue: number, template: string): { subject: string; body: string } => {
    const invNum = `INV-${invoice.id.slice(-6).toUpperCase()}`;
    const amount = `₦${invoice.total.toLocaleString()}`;

    const templates: Record<string, { subject: string; body: string }> = {
      formal: {
        subject: `Payment Reminder: Invoice ${invNum}`,
        body: `Dear ${invoice.customer},\n\nThis is a formal reminder that Invoice ${invNum} for ${amount} is now ${daysOverdue} days overdue.\n\nPlease arrange for immediate payment to avoid further action.\n\nRegards,\nAura Finance AI`,
      },
      casual: {
        subject: `Quick reminder — Invoice ${invNum}`,
        body: `Hi ${invoice.customer}!\n\nJust a friendly reminder about Invoice ${invNum} for ${amount}. It's ${daysOverdue} days past due.\n\nLet me know if you have any questions!\n\nBest,\nAura Team`,
      },
      followup: {
        subject: `Following up: Invoice ${invNum}`,
        body: `Hi ${invoice.customer},\n\nI wanted to follow up on Invoice ${invNum} for ${amount}, which was due ${daysOverdue} days ago.\n\nCould you let me know when we can expect payment?\n\nThank you,\nAura Team`,
      },
      overdue: {
        subject: `URGENT: Overdue Invoice ${invNum}`,
        body: `Dear ${invoice.customer},\n\nInvoice ${invNum} for ${amount} is now ${daysOverdue} days overdue.\n\nImmediate payment is required to avoid late fees and service suspension.\n\nPlease contact us if you have any questions.\n\nRegards,\nAura Finance AI`,
      },
    };

    return templates[template] || templates.followup;
  },
};
