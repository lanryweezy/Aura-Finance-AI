import type { CategorizedTransaction } from '../types';

export interface BreakEvenResult {
  monthlyFixedCosts: number;
  averagePricePerUnit: number;
  variableCostPerUnit: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;
  monthsToBreakEven: number;
  currentMonthlyRevenue: number;
  isProfitable: boolean;
}

export function calculateBreakEven(
  transactions: CategorizedTransaction[],
  monthlyRevenue?: number
): BreakEvenResult {
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 86400000);
  const recent = transactions.filter(t => new Date(t.date) >= threeMonthsAgo);

  const totalIncome = recent.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = recent.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);

  const avgMonthlyRevenue = monthlyRevenue || Math.round(totalIncome / 3);
  const avgMonthlyExpenses = Math.round(totalExpenses / 3);

  // Estimate fixed costs (rent, salaries, subscriptions - ~60% of expenses)
  const monthlyFixedCosts = Math.round(avgMonthlyExpenses * 0.6);
  const variableCostPerUnit = Math.round(avgMonthlyExpenses * 0.4 / 100); // Assume 100 units

  const contributionMargin = avgMonthlyRevenue / 100 - variableCostPerUnit;
  const breakEvenUnits = contributionMargin > 0 ? Math.ceil(monthlyFixedCosts / contributionMargin) : Infinity;
  const breakEvenRevenue = Math.round(monthlyFixedCosts + (breakEvenUnits * variableCostPerUnit));

  const monthsToBreakEven = avgMonthlyRevenue > breakEvenRevenue
    ? 0
    : Math.ceil((breakEvenRevenue - avgMonthlyRevenue) / (avgMonthlyRevenue * 0.1 || 1));

  return {
    monthlyFixedCosts,
    averagePricePerUnit: Math.round(avgMonthlyRevenue / 100),
    variableCostPerUnit,
    breakEvenUnits,
    breakEvenRevenue,
    monthsToBreakEven,
    currentMonthlyRevenue: avgMonthlyRevenue,
    isProfitable: avgMonthlyRevenue > avgMonthlyExpenses,
  };
}
