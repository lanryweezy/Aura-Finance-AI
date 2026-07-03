import type { CategorizedTransaction, Bill, Invoice } from '../types';

export interface ScenarioResult {
  name: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  netCashFlow: number;
  runwayDays: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export function runScenarios(
  transactions: CategorizedTransaction[],
  invoices: Invoice[],
  bills: Bill[],
  scenarios: { name: string; incomeChange: number; expenseChange: number }[] = [
    { name: 'Base Case', incomeChange: 0, expenseChange: 0 },
    { name: 'Revenue -20%', incomeChange: -0.20, expenseChange: 0 },
    { name: 'Revenue +20%', incomeChange: 0.20, expenseChange: 0 },
    { name: 'Expenses +20%', incomeChange: 0, expenseChange: 0.20 },
    { name: 'Worst Case', incomeChange: -0.20, expenseChange: 0.20 },
  ]
): ScenarioResult[] {
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 86400000);
  const recent = transactions.filter(t => new Date(t.date) >= threeMonthsAgo);

  const avgMonthlyIncome = recent.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0) / 3;
  const avgMonthlyExpenses = recent.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0) / 3;
  const currentBalance = transactions.length > 0 ? (transactions[0].balance || 5000000) : 5000000;

  return scenarios.map(scenario => {
    const monthlyIncome = Math.round(avgMonthlyIncome * (1 + scenario.incomeChange));
    const monthlyExpenses = Math.round(avgMonthlyExpenses * (1 + scenario.expenseChange));
    const netCashFlow = monthlyIncome - monthlyExpenses;
    const runwayDays = netCashFlow > 0 ? 999 : Math.round((currentBalance / Math.abs(monthlyExpenses)) * 30);

    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
    if (runwayDays < 30) riskLevel = 'High';
    else if (runwayDays < 90) riskLevel = 'Medium';

    return { name: scenario.name, monthlyIncome, monthlyExpenses, netCashFlow, runwayDays, riskLevel };
  });
}
