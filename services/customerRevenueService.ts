import type { CategorizedTransaction, Invoice } from '../types';

export interface CustomerRevenue {
  customer: string;
  totalRevenue: number;
  invoiceCount: number;
  avgInvoiceAmount: number;
  lastPayment: string;
  trend: 'growing' | 'stable' | 'declining';
}

export function forecastRevenueByCustomer(transactions: CategorizedTransaction[], invoices: Invoice[]): CustomerRevenue[] {
  const customerMap = new Map<string, { total: number; count: number; dates: string[] }>();

  // Aggregate from invoices
  invoices.forEach(inv => {
    const existing = customerMap.get(inv.customer) || { total: 0, count: 0, dates: [] };
    existing.total += inv.total;
    existing.count++;
    existing.dates.push(inv.issueDate);
    customerMap.set(inv.customer, existing);
  });

  // Also aggregate from credit transactions (payments received)
  transactions.filter(t => t.type === 'credit').forEach(t => {
    const match = invoices.find(i => i.customer && t.narration.toLowerCase().includes(i.customer.toLowerCase()));
    if (match) {
      const existing = customerMap.get(match.customer);
      if (existing) existing.dates.push(t.date);
    }
  });

  const results: CustomerRevenue[] = [];
  customerMap.forEach((data, customer) => {
    const sortedDates = data.dates.sort().reverse();
    const recentDates = sortedDates.filter(d => {
      const date = new Date(d);
      const threeMonthsAgo = new Date(Date.now() - 90 * 86400000);
      return date >= threeMonthsAgo;
    });

    const olderDates = sortedDates.filter(d => {
      const date = new Date(d);
      const threeMonthsAgo = new Date(Date.now() - 90 * 86400000);
      const sixMonthsAgo = new Date(Date.now() - 180 * 86400000);
      return date >= sixMonthsAgo && date < threeMonthsAgo;
    });

    let trend: 'growing' | 'stable' | 'declining' = 'stable';
    if (recentDates.length > olderDates.length * 1.2) trend = 'growing';
    else if (recentDates.length < olderDates.length * 0.8) trend = 'declining';

    results.push({
      customer,
      totalRevenue: data.total,
      invoiceCount: data.count,
      avgInvoiceAmount: Math.round(data.total / data.count),
      lastPayment: sortedDates[0] || '',
      trend,
    });
  });

  return results.sort((a, b) => b.totalRevenue - a.totalRevenue);
}
