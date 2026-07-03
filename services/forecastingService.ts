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
    // Build daily balance series from transactions
    const dailyBalances = buildDailyBalanceSeries(transactions);
    if (dailyBalances.length >= 30) {
      mlForecast = await forecastCashFlow(dailyBalances, months * 30);
    }
  } catch (e) {
    console.warn('TimesFM forecast failed, falling back to linear:', e);
  }

  // Calculate historical averages (fallback)
  const last3Months = transactions.filter(t => {
    const d = new Date(t.date);
    const threeMonthsAgo = new Date(now.getTime() - 90 * 86400000);
    return d >= threeMonthsAgo;
  });

  const avgMonthlyIncome = last3Months.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0) / 3;
  const avgMonthlyExpenses = last3Months.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0) / 3;

  const pendingReceivables = invoices.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.total, 0);
  const pendingPayables = bills.filter(b => b.status !== 'Paid').reduce((s, b) => s + b.amount, 0);
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
      // Use ML forecast (aggregate daily to monthly)
      const startDay = i * 30;
      const endDay = (i + 1) * 30;
      const monthForecast = mlForecast.forecast.slice(startDay, endDay);
      projectedIncome = monthForecast.reduce((s, v) => s + Math.max(0, v), 0);
      projectedExpenses = Math.abs(monthForecast.reduce((s, v) => s + Math.min(0, v), 0));
    } else {
      // Linear fallback
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
    confidenceInterval: mlForecast ? { lower: mlForecast.lowerBound, upper: mlForecast.upperBound } : undefined,
  };
}

function buildDailyBalanceSeries(transactions: CategorizedTransaction[]): number[] {
  // Sort by date and extract daily closing balances
  const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return sorted.map(t => t.balance || 0).filter(b => b > 0);
}
  const now = new Date();
  const forecasts: CashFlowForecast[] = [];

  // Calculate historical averages
  const last3Months = transactions.filter(t => {
    const d = new Date(t.date);
    const threeMonthsAgo = new Date(now.getTime() - 90 * 86400000);
    return d >= threeMonthsAgo;
  });

  const avgMonthlyIncome = last3Months.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0) / 3;
  const avgMonthlyExpenses = last3Months.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0) / 3;

  // Pending receivables (expected income)
  const pendingReceivables = invoices.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.total, 0);
  // Pending payables (expected expenses)
  const pendingPayables = bills.filter(b => b.status !== 'Paid').reduce((s, b) => s + b.amount, 0);
  // Monthly payroll
  const latestPayroll = payroll.length > 0 ? payroll[0] : null;
  const monthlyPayroll = latestPayroll ? latestPayroll.summary.totalNet : 0;

  // Current balance (from latest transaction)
  const currentBalance = transactions.length > 0 ? (transactions[0].balance || 5000000) : 5000000;

  let cumulativeBalance = currentBalance;

  for (let i = 0; i < months; i++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
    const monthName = monthDate.toLocaleString('default', { month: 'short', year: 'numeric' });

    // Project income (avg + portion of receivables)
    const projectedIncome = avgMonthlyIncome + (i === 0 ? pendingReceivables * 0.3 : avgMonthlyIncome * (1 + i * 0.02));
    // Project expenses (avg + payroll + portion of payables)
    const projectedExpenses = avgMonthlyExpenses + monthlyPayroll + (i === 0 ? pendingPayables * 0.4 : avgMonthlyExpenses * (1 + i * 0.01));
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
    recommendations.push('Accelerate receivables collection — send reminders for all overdue invoices.');
  } else if (runwayDays < 90) {
    riskLevel = 'Medium';
    recommendations.push('Warning: Runway is under 90 days. Review upcoming bills and defer non-critical payments.');
  }

  if (pendingReceivables > avgMonthlyIncome * 2) {
    recommendations.push(`High receivables (₦${pendingReceivables.toLocaleString()}). Follow up with overdue clients.`);
  }

  if (pendingPayables > currentBalance * 0.5) {
    recommendations.push('Upcoming bills exceed 50% of current balance. Negotiate payment terms with vendors.');
  }

  if (forecasts.some(f => f.netCashFlow < 0)) {
    recommendations.push('Negative cash flow projected in one or more months. Review pricing or cut costs.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Cash flow looks healthy. Consider investing surplus in growth initiatives.');
  }

  return { forecasts, currentBalance, monthlyBurnRate: Math.round(monthlyBurnRate), runwayDays, riskLevel, recommendations };
}
