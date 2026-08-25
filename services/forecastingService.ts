import type { CategorizedTransaction, Invoice, Bill, PayrollRun } from '../types';
import { forecastCashFlow } from './mlApiService';

export interface CashFlowForecast {
  month: string;
  projectedIncome: number;
  projectedExpenses: number;
  netCashFlow: number;
  cumulativeBalance: number;
}

export interface ForecastResult {
  forecasts: CashFlowForecast[];
  currentBalance: number;
  monthlyBurnRate: number;
  runwayDays: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  recommendations: string[];
  mlPowered: boolean;
  confidenceInterval?: { lower: number[]; upper: number[] };
}

export async function generateCashFlowForecast(
  transactions: CategorizedTransaction[],
  invoices: Invoice[],
  bills: Bill[],
  payroll: PayrollRun[],
  months: number = 6
): Promise<ForecastResult> {
  const now = new Date();
  const forecasts: CashFlowForecast[] = [];

  // Try TimesFM ML-powered forecast first
  let mlForecast: { forecast: number[]; lowerBound: number[]; upperBound: number[] } | null = null;
  try {
    const dailyBalances = buildDailyBalanceSeries(transactions);
    if (dailyBalances.length >= 30) {
      mlForecast = await forecastCashFlow(dailyBalances, months * 30);
    }
  } catch (e) {
    // ML unavailable, fall back to linear
  }

  // Calculate historical averages (fallback)
  const threeMonthsAgo = new Date(now.getTime() - 90 * 86400000);
  let totalIncome3Months = 0;
  let totalExpenses3Months = 0;

  // ⚡ Bolt Optimization: Single pass loop avoiding O(N) array allocations from chained .filter().reduce()
  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i];
    if (new Date(t.date) >= threeMonthsAgo) {
      if (t.type === 'credit') totalIncome3Months += t.amount;
      else if (t.type === 'debit') totalExpenses3Months += t.amount;
    }
  }

  const avgMonthlyIncome = totalIncome3Months / 3;
  const avgMonthlyExpenses = totalExpenses3Months / 3;

  let pendingReceivables = 0;
  for (let i = 0; i < invoices.length; i++) {
    if (invoices[i].status !== 'Paid') pendingReceivables += invoices[i].total;
  }

  let pendingPayables = 0;
  for (let i = 0; i < bills.length; i++) {
    if (bills[i].status !== 'Paid') pendingPayables += bills[i].amount;
  }
  const latestPayroll = payroll.length > 0 ? payroll[0] : null;
  const monthlyPayroll = latestPayroll ? latestPayroll.summary.totalNet : 0;

  const currentBalance = transactions.length > 0 ? (transactions[0].balance || 5000000) : 5000000;

  let cumulativeBalance = currentBalance;

  for (let i = 0; i < months; i++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
    const monthName = monthDate.toLocaleString('default', { month: 'short', year: 'numeric' });

    let projectedIncome: number;
    let projectedExpenses: number;

    if (mlForecast && mlForecast.forecast.length >= (i + 1) * 30) {
      const startDay = i * 30;
      const endDay = (i + 1) * 30;
      const monthForecast = mlForecast.forecast.slice(startDay, endDay);
      projectedIncome = monthForecast.reduce((s, v) => s + Math.max(0, v), 0);
      projectedExpenses = Math.abs(monthForecast.reduce((s, v) => s + Math.min(0, v), 0));
    } else {
      projectedIncome = avgMonthlyIncome + (i === 0 ? pendingReceivables * 0.3 : avgMonthlyIncome * (1 + i * 0.02));
      projectedExpenses = avgMonthlyExpenses + monthlyPayroll + (i === 0 ? pendingPayables * 0.4 : avgMonthlyExpenses * (1 + i * 0.01));
    }

    const netCashFlow = projectedIncome - projectedExpenses;
    cumulativeBalance += netCashFlow;

    forecasts.push({
      month: monthName,
      projectedIncome: Math.round(projectedIncome),
      projectedExpenses: Math.round(projectedExpenses),
      netCashFlow: Math.round(netCashFlow),
      cumulativeBalance: Math.round(cumulativeBalance),
    });
  }

  const monthlyBurnRate = avgMonthlyExpenses + monthlyPayroll;
  const runwayDays = monthlyBurnRate > 0 ? Math.round((currentBalance / monthlyBurnRate) * 30) : 999;

  let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
  const recommendations: string[] = [];

  if (runwayDays < 30) {
    riskLevel = 'High';
    recommendations.push('Critical: Less than 30 days of runway. Cut non-essential spending immediately.');
  } else if (runwayDays < 90) {
    riskLevel = 'Medium';
    recommendations.push('Warning: Runway is under 90 days. Review upcoming bills.');
  }

  if (pendingReceivables > avgMonthlyIncome * 2) {
    recommendations.push(`High receivables (₦${pendingReceivables.toLocaleString()}). Follow up with overdue clients.`);
  }

  if (mlForecast) {
    const lowerSum = mlForecast.lowerBound.reduce((s, v) => s + v, 0);
    const upperSum = mlForecast.upperBound.reduce((s, v) => s + v, 0);
    if (upperSum - lowerSum > currentBalance * 0.5) {
      recommendations.push('High forecast uncertainty. Monitor cash flow closely.');
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('Cash flow looks healthy. Consider investing surplus in growth initiatives.');
  }

  return {
    forecasts,
    currentBalance,
    monthlyBurnRate: Math.round(monthlyBurnRate),
    runwayDays,
    riskLevel,
    recommendations,
    mlPowered: !!mlForecast,
  };
}

function buildDailyBalanceSeries(transactions: CategorizedTransaction[]): number[] {
  const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return sorted.map(t => t.balance || 0).filter(b => b > 0);
}
