import { supabase } from './supabaseClient';
import { db } from './db';
import { aiClient, API_KEY, withTimeout } from './aiConfig';
import { usageService } from './usageService';
import { monitoringService } from './monitoringService';
import type { CategorizedTransaction, Invoice, Bill, FinancialInsight } from '../types';

const ALERTS_TABLE = 'ai_alerts';

export interface AIAlert {
  id: string;
  type: 'cash_flow' | 'tax' | 'anomaly' | 'deadline' | 'budget' | 'revenue';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  dismissed: boolean;
  created_at: string;
  organization_id: string;
}

function analyzeTransactions(transactions: CategorizedTransaction[]): FinancialInsight[] {
  const insights: FinancialInsight[] = [];

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const recent = transactions.filter(t => new Date(t.date) >= thirtyDaysAgo);

  const totalIncome = recent.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = recent.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
  const burnRate = totalExpenses;

  if (burnRate > 1000000) {
    insights.push({ title: 'High Burn Rate', description: `Monthly burn rate is ₦${burnRate.toLocaleString()}. Consider cutting non-essential expenses.`, priority: 'High' });
  }

  const salaryPayments = recent.filter(t => t.type === 'debit' && (t.narration.toLowerCase().includes('salary') || t.narration.toLowerCase().includes('nip/uba')));
  const totalSalaries = salaryPayments.reduce((s, t) => s + t.amount, 0);
  if (totalSalaries > totalIncome * 0.6 && totalIncome > 0) {
    insights.push({ title: 'Salary/Revenue Ratio High', description: `Salaries consume ${((totalSalaries / totalIncome) * 100).toFixed(0)}% of revenue. Target below 50%.`, priority: 'Medium' });
  }

  const duplicates = recent.filter((t, i) =>
    recent.findIndex(x => x.amount === t.amount && x.narration === t.narration && x.id !== t.id) > i
  );
  if (duplicates.length > 0) {
    insights.push({ title: 'Potential Duplicate Transactions', description: `Found ${duplicates.length} potential duplicate transactions. Review for errors.`, priority: 'Medium' });
  }

  if (totalIncome > 0 && totalExpenses < totalIncome * 0.5) {
    insights.push({ title: 'Healthy Margins', description: `Expenses are only ${((totalExpenses / totalIncome) * 100).toFixed(0)}% of income. Strong profitability.`, priority: 'Low' });
  }

  return insights;
}

function analyzeInvoices(invoices: Invoice[]): FinancialInsight[] {
  const insights: FinancialInsight[] = [];
  const now = new Date();

  const overdue = invoices.filter(i => i.status === 'Overdue' || (i.status === 'Unpaid' && new Date(i.dueDate) < now));
  const overdueTotal = overdue.reduce((s, i) => s + i.total, 0);
  if (overdue.length > 0) {
    insights.push({ title: 'Overdue Invoices', description: `${overdue.length} invoices totaling ₦${overdueTotal.toLocaleString()} are overdue. Send reminders immediately.`, priority: 'High' });
  }

  const unpaid = invoices.filter(i => i.status === 'Unpaid');
  const unpaidTotal = unpaid.reduce((s, i) => s + i.total, 0);
  if (unpaidTotal > 500000) {
    insights.push({ title: 'Revenue at Risk', description: `${unpaid.length} unpaid invoices worth ₦${unpaidTotal.toLocaleString()} could impact cash flow.`, priority: 'Medium' });
  }

  return insights;
}

function analyzeBills(bills: Bill[]): FinancialInsight[] {
  const insights: FinancialInsight[] = [];
  const now = new Date();

  const upcomingDue = bills.filter(b => b.status === 'Unpaid' && new Date(b.dueDate) <= new Date(now.getTime() + 7 * 86400000));
  if (upcomingDue.length > 0) {
    const total = upcomingDue.reduce((s, b) => s + b.amount, 0);
    insights.push({ title: 'Bills Due This Week', description: `${upcomingDue.length} bills totaling ₦${total.toLocaleString()} are due within 7 days.`, priority: 'High' });
  }

  const vendorTotals: Record<string, number> = {};
  bills.filter(b => b.status !== 'Paid').forEach(b => {
    vendorTotals[b.vendor] = (vendorTotals[b.vendor] || 0) + b.amount;
  });
  const totalOutstanding = Object.values(vendorTotals).reduce((s, v) => s + v, 0);
  Object.entries(vendorTotals).forEach(([vendor, total]) => {
    if (total > totalOutstanding * 0.5 && totalOutstanding > 100000) {
      insights.push({ title: 'High Vendor Concentration', description: `${vendor} accounts for ₦${total.toLocaleString()} (${((total / totalOutstanding) * 100).toFixed(0)}%) of outstanding bills.`, priority: 'Medium' });
    }
  });

  return insights;
}

export const aiAlertsService = {
  generateAlerts: async (
    transactions: CategorizedTransaction[],
    invoices: Invoice[],
    bills: Bill[]
  ): Promise<AIAlert[]> => {
    const allInsights = [
      ...analyzeTransactions(transactions),
      ...analyzeInvoices(invoices),
      ...analyzeBills(bills),
    ];

    const alerts: AIAlert[] = allInsights.map((insight, i) => ({
      id: `alert_${Date.now()}_${i}`,
      type: insight.title.includes('Burn') || insight.title.includes('Salary') ? 'cash_flow' :
            insight.title.includes('Tax') || insight.title.includes('VAT') ? 'tax' :
            insight.title.includes('Duplicate') ? 'anomaly' :
            insight.title.includes('Due') || insight.title.includes('Overdue') ? 'deadline' :
            insight.title.includes('Revenue') || insight.title.includes('Margin') ? 'revenue' : 'budget',
      severity: insight.priority === 'High' ? 'critical' : insight.priority === 'Medium' ? 'warning' : 'info',
      title: insight.title,
      message: insight.description,
      dismissed: false,
      created_at: new Date().toISOString(),
      organization_id: db.getOrgId(),
    }));

    // Save to Supabase
    if (supabase && alerts.length > 0) {
      try {
        // Clear old alerts for this org
        await supabase.from(ALERTS_TABLE).delete().eq('organization_id', db.getOrgId());
        // Insert new alerts
        const { error } = await supabase.from(ALERTS_TABLE).insert(alerts.map(a => ({
          id: a.id, type: a.type, severity: a.severity, title: a.title,
          message: a.message, dismissed: false, organization_id: a.organization_id,
        })));
        if (error) console.error('Alert save error:', error);
      } catch (e) {
        console.error('Alert save failed:', e);
      }
    }

    return alerts;
  },

  getAlerts: async (): Promise<AIAlert[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from(ALERTS_TABLE)
      .select('*')
      .eq('organization_id', db.getOrgId())
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data as AIAlert[]) || [];
  },

  dismissAlert: async (id: string): Promise<void> => {
    if (!supabase) return;
    await supabase.from(ALERTS_TABLE).update({ dismissed: true }).eq('id', id);
  },
};
