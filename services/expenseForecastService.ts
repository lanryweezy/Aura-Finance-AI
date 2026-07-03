import type { CategorizedTransaction, Invoice, Bill } from '../types';

export interface ExpenseForecast {
  category: string;
  currentMonthly: number;
  projectedNextMonth: number;
  projectedNextQuarter: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export function forecastExpensesByCategory(
  transactions: CategorizedTransaction[],
  bills: Bill[]
): ExpenseForecast[] {
  const now = new Date();
  const categoryData: Record<string, { recent: number; older: number }> = {};

  // Aggregate expenses by category
  transactions.filter(t => t.type === 'debit').forEach(t => {
    const cat = t.category || 'Uncategorized';
    if (!categoryData[cat]) categoryData[cat] = { recent: 0, older: 0 };

    const date = new Date(t.date);
    const threeMonthsAgo = new Date(now.getTime() - 90 * 86400000);
    if (date >= threeMonthsAgo) categoryData[cat].recent += t.amount;
    else categoryData[cat].older += t.amount;
  });

  // Add pending bills
  bills.filter(b => b.status === 'Unpaid').forEach(b => {
    const cat = 'Accounts Payable';
    if (!categoryData[cat]) categoryData[cat] = { recent: 0, older: 0 };
    categoryData[cat].recent += b.amount;
  });

  const forecasts: ExpenseForecast[] = [];
  Object.entries(categoryData).forEach(([category, data]) => {
    const avgMonthly = data.recent / 3 || data.older / 6 || 0;
    const olderAvg = data.older / 6 || avgMonthly;
    const change = olderAvg > 0 ? (avgMonthly - olderAvg) / olderAvg : 0;

    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (change > 0.1) trend = 'increasing';
    else if (change < -0.1) trend = 'decreasing';

    forecasts.push({
      category,
      currentMonthly: Math.round(avgMonthly),
      projectedNextMonth: Math.round(avgMonthly * (1 + change * 0.5)),
      projectedNextQuarter: Math.round(avgMonthly * 3 * (1 + change * 0.3)),
      trend,
    });
  });

  return forecasts.sort((a, b) => b.currentMonthly - a.currentMonthly);
}
