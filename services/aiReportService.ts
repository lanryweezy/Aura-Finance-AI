import { aiClient, API_KEY, withTimeout, safeParseJSON } from './aiConfig';
import { usageService } from './usageService';
import { monitoringService } from './monitoringService';
import type { CategorizedTransaction, Invoice, Bill, PayrollRun } from '../types';

export interface MonthlyReport {
  period: string;
  executiveSummary: string;
  highlights: string[];
  risks: string[];
  recommendations: string[];
  kpis: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    cashRunwayDays: number;
    overdueReceivables: number;
    overduePayables: number;
  };
}

export async function generateMonthlyReport(
  transactions: CategorizedTransaction[],
  invoices: Invoice[],
  bills: Bill[],
  payroll: PayrollRun[]
): Promise<MonthlyReport> {
  const now = new Date();
  const period = `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;

  const totalRevenue = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const overdueReceivables = invoices.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.total, 0);
  const overduePayables = bills.filter(b => b.status !== 'Paid').reduce((s, b) => s + b.amount, 0);

  const kpis = {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    cashRunwayDays: totalExpenses > 0 ? Math.round((totalRevenue / totalExpenses) * 30) : 999,
    overdueReceivables,
    overduePayables,
  };

  if (!aiClient || !API_KEY) {
    return generateSimulatedReport(period, kpis);
  }

  if (await usageService.isRateLimited('ai_insight')) {
    return generateSimulatedReport(period, kpis);
  }

  const context = {
    period,
    transactions: transactions.slice(0, 30),
    unpaidInvoices: invoices.filter(i => i.status !== 'Paid').slice(0, 10),
    unpaidBills: bills.filter(b => b.status !== 'Paid').slice(0, 10),
    recentPayroll: payroll.slice(0, 3),
    kpis,
  };

  try {
    monitoringService.trackAIUsage('monthly_report', period);
    const response = await withTimeout(aiClient.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{
        role: 'user',
        parts: [{
          text: `Data: ${JSON.stringify(context)}`
        }],
      }],
      config: {
        // AI Quality: Extracted persona and structural output constraints into systemInstruction
        // to improve model adherence and prevent chatty/non-deterministic responses.
        systemInstruction: `You are a CFO generating a monthly financial report for a Nigerian SME. Analyze this data and provide:
1. Executive Summary (2-3 sentences)
2. Key Highlights (3-5 bullet points)
3. Risk Areas (2-3 items)
4. Recommendations (3-5 actionable items)`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            executiveSummary: { type: 'string' },
            highlights: { type: 'array', items: { type: 'string' } },
            risks: { type: 'array', items: { type: 'string' } },
            recommendations: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    }), 15000);

    await usageService.trackUsage('ai_insight');
    const result = safeParseJSON<any>(response.text.trim());

    // AI Quality: Validate expected JSON structure to prevent silent UI crashes on malformed output
    if (!result || typeof result !== 'object' || !result.executiveSummary || !Array.isArray(result.highlights) || !Array.isArray(result.risks) || !Array.isArray(result.recommendations)) {
      throw new Error('AI output is missing required fields or is malformed');
    }

    return { period, ...result, kpis };
  } catch (error) {
    monitoringService.trackError('AI_ENGINE', error as Error);
    return generateSimulatedReport(period, kpis);
  }
}

function generateSimulatedReport(period: string, kpis: MonthlyReport['kpis']): MonthlyReport {
  const highlights: string[] = [];
  const risks: string[] = [];
  const recommendations: string[] = [];

  if (kpis.profitMargin > 20) highlights.push(`Strong profit margin of ${kpis.profitMargin.toFixed(1)}%`);
  if (kpis.totalRevenue > 0) highlights.push(`Total revenue of ₦${kpis.totalRevenue.toLocaleString()}`);
  if (kpis.cashRunwayDays > 90) highlights.push(`Healthy cash runway of ${kpis.cashRunwayDays} days`);

  if (kpis.profitMargin < 10) risks.push('Profit margin is below 10% — review expenses');
  if (kpis.overdueReceivables > kpis.totalRevenue * 0.3) risks.push('Overdue receivables exceed 30% of revenue');
  if (kpis.overduePayables > kpis.totalRevenue * 0.5) risks.push('Outstanding payables are significant');

  recommendations.push('Review and follow up on overdue invoices');
  recommendations.push('Analyze top expense categories for cost-saving opportunities');
  if (kpis.profitMargin < 15) recommendations.push('Consider increasing prices or reducing costs');

  return {
    period,
    executiveSummary: `Revenue for ${period} is ₦${kpis.totalRevenue.toLocaleString()} with net profit of ₦${kpis.netProfit.toLocaleString()} (${kpis.profitMargin.toFixed(1)}% margin). Cash runway is approximately ${kpis.cashRunwayDays} days.`,
    highlights,
    risks,
    recommendations,
    kpis,
  };
}
