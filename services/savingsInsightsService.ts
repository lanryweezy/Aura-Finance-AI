import { supabase } from './supabaseClient';
import { db } from './db';
import type { CategorizedTransaction, Invoice, Bill } from '../types';

export interface SavingsInsight {
  id: string;
  type: 'duplicate' | 'unused' | 'expensive' | 'trend' | 'opportunity';
  title: string;
  description: string;
  amount: number;
  severity: 'high' | 'medium' | 'low';
  action: string;
}

export const savingsInsightsService = {
  generateInsights: async (
    transactions: CategorizedTransaction[],
    invoices: Invoice[],
    bills: Bill[]
  ): Promise<SavingsInsight[]> => {
    const insights: SavingsInsight[] = [];

    // 1. Find duplicate transactions
    const dupes = findDuplicateTransactions(transactions);
    if (dupes.length > 0) {
      const totalWasted = dupes.reduce((s, d) => s + d.amount, 0);
      insights.push({
        id: `save_${Date.now()}_1`,
        type: 'duplicate',
        title: `${dupes.length} Duplicate Transactions Found`,
        description: `You have ${dupes.length} potential duplicate transactions totaling ₦${totalWasted.toLocaleString()}`,
        amount: totalWasted,
        severity: 'high',
        action: 'Review and refund duplicate charges',
      });
    }

    // 2. Find expensive recurring charges
    const subscriptions = findRecurringCharges(transactions);
    const expensiveSubs = subscriptions.filter(s => s.monthlyAmount > 50000);
    if (expensiveSubs.length > 0) {
      const total = expensiveSubs.reduce((s, sub) => s + sub.monthlyAmount * 12, 0);
      insights.push({
        id: `save_${Date.now()}_2`,
        type: 'expensive',
        title: 'High Subscription Costs',
        description: `${expensiveSubs.length} subscriptions cost ₦${total.toLocaleString()}/year. Review if all are needed.`,
        amount: total,
        severity: 'medium',
        action: 'Audit subscriptions and cancel unused ones',
      });
    }

    // 3. Find unused services (charged but no recent activity)
    const unusedServices = findUnusedServices(transactions);
    if (unusedServices.length > 0) {
      const total = unusedServices.reduce((s, u) => s + u.amount, 0);
      insights.push({
        id: `save_${Date.now()}_3`,
        type: 'unused',
        title: 'Potentially Unused Services',
        description: `${unusedServices.length} services may be unused. Potential savings: ₦${total.toLocaleString()}/year`,
        amount: total,
        severity: 'medium',
        action: 'Review and cancel unused subscriptions',
      });
    }

    // 4. Expense trends
    const trend = analyzeExpenseTrend(transactions);
    if (trend.increasing) {
      insights.push({
        id: `save_${Date.now()}_4`,
        type: 'trend',
        title: 'Expenses Increasing',
        description: `Your ${trend.topCategory} expenses increased by ${trend.percentIncrease}% this month`,
        amount: trend.increaseAmount,
        severity: trend.percentIncrease > 20 ? 'high' : 'medium',
        action: `Review ${trend.topCategory} spending`,
      });
    }

    // 5. Overdue receivables (cash not collected)
    const overdue = invoices.filter(i => i.status === 'Overdue' || (i.status === 'Unpaid' && new Date(i.dueDate) < new Date()));
    if (overdue.length > 0) {
      const total = overdue.reduce((s, i) => s + i.total, 0);
      insights.push({
        id: `save_${Date.now()}_5`,
        type: 'opportunity',
        title: 'Overdue Invoices — Cash Waiting',
        description: `${overdue.length} overdue invoices worth ₦${total.toLocaleString()} need follow-up`,
        amount: total,
        severity: 'high',
        action: 'Send payment reminders to overdue clients',
      });
    }

    // 6. Early payment discounts
    const earlyPayCandidates = bills.filter(b => b.status === 'Unpaid' && new Date(b.dueDate) > new Date());
    if (earlyPayCandidates.length > 3) {
      insights.push({
        id: `save_${Date.now()}_6`,
        type: 'opportunity',
        title: 'Batch Payment Opportunity',
        description: `${earlyPayCandidates.length} unpaid bills. Pay early for potential discounts.`,
        amount: earlyPayCandidates.reduce((s, b) => s + b.amount, 0),
        severity: 'low',
        action: 'Review bills for early payment discounts',
      });
    }

    return insights;
  },
};

function findDuplicateTransactions(transactions: CategorizedTransaction[]): CategorizedTransaction[] {
  const dupes: CategorizedTransaction[] = [];
  const processed = new Set<string>();

  for (let i = 0; i < transactions.length; i++) {
    if (processed.has(transactions[i].id)) continue;
    for (let j = i + 1; j < transactions.length; j++) {
      if (processed.has(transactions[j].id)) continue;
      const a = transactions[i];
      const b = transactions[j];
      if (Math.abs(a.amount - b.amount) < 1 && a.type === b.type) {
        const daysDiff = Math.abs(new Date(a.date).getTime() - new Date(b.date).getTime()) / 86400000;
        if (daysDiff <= 1) {
          dupes.push(b);
          processed.add(b.id);
        }
      }
    }
  }
  return dupes;
}

function findRecurringCharges(transactions: CategorizedTransaction[]): { merchant: string; monthlyAmount: number }[] {
  const merchantAmounts = new Map<string, number[]>();
  transactions.filter(t => t.type === 'debit').forEach(t => {
    const merchant = t.narration.split(/[\/\-]/)[0].trim();
    if (!merchantAmounts.has(merchant)) merchantAmounts.set(merchant, []);
    merchantAmounts.get(merchant)!.push(t.amount);
  });

  const result: { merchant: string; monthlyAmount: number }[] = [];
  merchantAmounts.forEach((amounts, merchant) => {
    if (amounts.length >= 2) {
      const avg = amounts.reduce((s, a) => s + a, 0) / amounts.length;
      const consistent = amounts.every(a => Math.abs(a - avg) < avg * 0.1);
      if (consistent) {
        result.push({ merchant, monthlyAmount: Math.round(avg) });
      }
    }
  });

  return result.sort((a, b) => b.monthlyAmount - a.monthlyAmount);
}

function findUnusedServices(transactions: CategorizedTransaction[]): { name: string; amount: number }[] {
  const softwareKeywords = ['subscription', 'software', 'saas', 'monthly', 'annual'];
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 86400000);

  const software = transactions.filter(t =>
    t.type === 'debit' &&
    softwareKeywords.some(kw => t.narration.toLowerCase().includes(kw))
  );

  const byMerchant = new Map<string, CategorizedTransaction[]>();
  software.forEach(t => {
    const merchant = t.narration.split(/[\/\-]/)[0].trim();
    if (!byMerchant.has(merchant)) byMerchant.set(merchant, []);
    byMerchant.get(merchant)!.push(t);
  });

  const result: { name: string; amount: number }[] = [];
  byMerchant.forEach((txns, name) => {
    const recent = txns.filter(t => new Date(t.date) >= threeMonthsAgo);
    if (recent.length === 0 && txns.length > 0) {
      const avg = txns.reduce((s, t) => s + t.amount, 0) / txns.length;
      result.push({ name, amount: Math.round(avg * 12) });
    }
  });

  return result;
}

function analyzeExpenseTrend(transactions: CategorizedTransaction[]): { increasing: boolean; topCategory: string; percentIncrease: number; increaseAmount: number } {
  const now = new Date();
  const thisMonth = transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === 'debit' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const lastMonth = transactions.filter(t => {
    const d = new Date(t.date);
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return t.type === 'debit' && d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
  });

  const thisTotal = thisMonth.reduce((s, t) => s + t.amount, 0);
  const lastTotal = lastMonth.reduce((s, t) => s + t.amount, 0);

  if (lastTotal === 0) return { increasing: false, topCategory: '', percentIncrease: 0, increaseAmount: 0 };

  const increase = thisTotal - lastTotal;
  const percent = Math.round((increase / lastTotal) * 100);

  // Find top category this month
  const catTotals: Record<string, number> = {};
  thisMonth.forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; });
  const topCategory = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Overall';

  return { increasing: increase > 0, topCategory, percentIncrease: Math.max(0, percent), increaseAmount: Math.max(0, increase) };
}
