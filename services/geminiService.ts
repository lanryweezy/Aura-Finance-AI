
import { Type } from "@google/genai";
import { aiClient, API_KEY, withTimeout } from './aiConfig';
import { usageService } from './usageService';
import { monitoringService } from './monitoringService';
import { localDb } from './localDb';
import type { RawTransaction, CategorizedTransaction, FinancialInsight, Invoice, ReportData, PayrollRun, Bill } from '../types';

// Simple in-memory cache for transaction categorization
const categorizationCache = new Map<string, string>();

const checkRateLimit = async (type: 'ai_insight' | 'ai_chat'): Promise<boolean> => {
    if (await usageService.isRateLimited(type)) {
        monitoringService.log('warn', 'AI_ENGINE', `Rate limit reached for ${type}`);
        return true;
    }
    return false;
};

const insightsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] }
        },
        required: ['title', 'description', 'priority']
    }
};

export const categorizeTransactions = async (transactions: RawTransaction[], categoryList: string[]): Promise<CategorizedTransaction[]> => {
  const results: CategorizedTransaction[] = [];
  const toCategorize: RawTransaction[] = [];

  for (const t of transactions) {
    const cacheKey = `${t.narration}_${t.amount}_${t.type}`;
    if (categorizationCache.has(cacheKey)) {
        results.push({ ...t, category: categorizationCache.get(cacheKey)! });
    } else {
        toCategorize.push(t);
    }
  }

  if (toCategorize.length === 0) return results;

  if (!aiClient || !API_KEY) {
     const simulated = toCategorize.map(t => {
         let category = 'Uncategorized';
         const n = t.narration.toLowerCase();
         if (n.includes('salary') || n.includes('nip/uba')) category = 'Salaries & Wages';
         else if (n.includes('google') || n.includes('ads')) category = 'Advertising & Marketing';
         else if (n.includes('jumia') || n.includes('office')) category = 'Office Supplies';
         else if (n.includes('paystack') || n.includes('invoice')) category = 'Sales Revenue';
         else if (n.includes('ikeja') || n.includes('bolt')) category = 'Travel';
         else if (n.includes('electricity') || n.includes('ikedc')) category = 'Utilities';

         return { ...t, category };
     });
     return [...results, ...simulated].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  await usageService.trackUsage('bank_sync');

  const transactionSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        amount: { type: Type.NUMBER },
        type: { type: Type.STRING },
        date: { type: Type.STRING },
        narration: { type: Type.STRING },
        balance: { type: Type.NUMBER, nullable: true },
        category: { 
          type: Type.STRING,
          description: `Categorize the transaction into one of the following: ${categoryList.join(', ')}.`
        },
      },
      required: ["id", "amount", "type", "date", "narration", "category"],
    },
  };

  const prompt = `Categorize these transactions for an accountant: ${JSON.stringify(toCategorize)}`;

  try {
    monitoringService.log('info', 'AI_ENGINE', 'Categorizing transactions');
    const response = await withTimeout(aiClient.models.generateContent({ model: "gemini-2.0-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: transactionSchema as any,
      },
    }));

    const jsonText = response.text.trim();
    const batchResult = JSON.parse(jsonText) as CategorizedTransaction[];
    if (!Array.isArray(batchResult)) throw new Error("AI output is not an array");

    batchResult.forEach(t => {
        const cacheKey = `${t.narration}_${t.amount}_${t.type}`;
        categorizationCache.set(cacheKey, t.category);
    });

    return [...results, ...batchResult].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  } catch (error) {
    monitoringService.trackError('AI_ENGINE', error as Error);
    return transactions.map(t => ({ ...t, category: 'Uncategorized' }));
  }
};


export const getFinancialInsights = async (
  transactions: CategorizedTransaction[],
  bills: Bill[] = [],
  invoices: Invoice[] = [],
  payroll: PayrollRun[] = []
): Promise<FinancialInsight[]> => {
  if (transactions.length === 0 && bills.length === 0 && invoices.length === 0) return [];

  if (!aiClient || !API_KEY) {
    return localDb.simulateRequest(() => {
        const insights: FinancialInsight[] = [];

        // Burn rate check
        const recentExpenses = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
        if (recentExpenses > 1000000) {
            insights.push({ title: 'High Burn Rate', description: 'Your monthly expenses have increased by 15%. Consider reviewing subscription costs.', priority: 'Medium' });
        }

        // Receivables check
        const pending = invoices.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.total, 0);
        if (pending > 500000) {
            insights.push({ title: 'Revenue at Risk', description: `You have ${pending.toLocaleString()} in outstanding invoices. Send reminders to improve cash flow.`, priority: 'High' });
        }

        // Tax check
        const vat = invoices.reduce((s, i) => s + i.vat, 0);
        if (vat > 0) {
            insights.push({ title: 'VAT Liability', description: `Estimated VAT payable for this period is ${vat.toLocaleString()}. Ensure funds are reserved.`, priority: 'Medium' });
        }

        if (insights.length === 0) {
            insights.push({ title: 'Healthy Cash Flow', description: 'Your income exceeds expenses this month. Good job maintaining margins.', priority: 'Low' });
        }

        return insights;
    }, 1200);
  }

  if (await checkRateLimit('ai_insight')) {
      return [{ title: 'Plan Limit Reached', description: 'You have reached your AI insights limit for this month. Please upgrade your plan.', priority: 'High' }];
  }

  if (transactions.length === 0 && invoices.length === 0) return [];

  const context = {
    transactions: transactions.slice(0, 50),
    pendingBills: bills.filter(b => b.status !== 'Paid'),
    pendingInvoices: invoices.filter(i => i.status !== 'Paid'),
    recentPayroll: payroll.slice(0, 3)
  };

  const prompt = `You are a world-class AI CFO for a Nigerian SME. Analyze this financial data and provide 3 deep, actionable insights.
  Consider cash flow, burn rate, tax implications (VAT, WHT), and operational efficiency.
  Data: ${JSON.stringify(context)}`;

  try {
    monitoringService.trackAIUsage('insight', prompt);
    const response = await withTimeout(aiClient.models.generateContent({ model: "gemini-2.0-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: insightsSchema as any,
        },
    }));
    
    await usageService.trackUsage('ai_insight');

    const jsonText = response.text.trim();
    const insights = JSON.parse(jsonText) as FinancialInsight[];
    if (!Array.isArray(insights)) throw new Error("AI output is not an array");
    return insights;

  } catch (error) {
    monitoringService.trackError('AI_ENGINE', error as Error);
    return [{ title: 'Analysis Unavailable', description: 'Error generating AI insights.', priority: 'High' }];
  }
};

export const getPayrollInsights = async (payrollHistory: PayrollRun[]): Promise<string> => {
  if (!aiClient || !API_KEY) return "AI payroll analysis suggests restructuring bonuses to optimize for tax efficiency.";
  if (await checkRateLimit('ai_insight')) return "Plan limit reached for AI insights.";

  const prompt = `Analyze payroll history: ${JSON.stringify(payrollHistory)}`;

  try {
    monitoringService.trackAIUsage('payroll_insight', prompt);
    const response = await withTimeout(aiClient.models.generateContent({ model: "gemini-2.0-flash", contents: prompt }));
    await usageService.trackUsage('ai_insight');
    return response.text.trim();
  } catch (error) {
    monitoringService.trackError('AI_ENGINE', error as Error);
    return "Could not generate AI insight.";
  }
};

export const getFinancialReportAnalysis = async (currentPeriodData: ReportData, comparisonPeriodData?: ReportData): Promise<string> => {
    if (!aiClient || !API_KEY) {
        const rev = currentPeriodData.pAndL.revenue;
        const exp = currentPeriodData.pAndL.totalExpenses;
        return `Executive Summary: Revenue for this period stands at ${rev.toLocaleString()}. Net profit margin is ${((rev-exp)/rev*100).toFixed(1)}%. Recommend focusing on reducing ${Object.keys(currentPeriodData.pAndL.expensesByCategory)[0]} costs next month.`;
    }
    if (await checkRateLimit('ai_insight')) return "Plan limit reached for AI insights.";

    const prompt = `Provide CFO Executive Summary for: ${JSON.stringify(currentPeriodData)}`;

    try {
        monitoringService.trackAIUsage('report_analysis', prompt);
        const response = await withTimeout(aiClient.models.generateContent({ model: "gemini-2.0-flash", contents: prompt }));
        await usageService.trackUsage('ai_insight');
        return response.text.trim();
    } catch (error) {
        monitoringService.trackError('AI_ENGINE', error as Error);
        return "Could not generate AI analysis.";
    }
};

export const generateInvoiceReminder = async (invoice: Invoice): Promise<string> => {
  if (!aiClient || !API_KEY) return `Dear ${invoice.customer},\n\nThis is a friendly reminder regarding invoice #${invoice.id.slice(-6).toUpperCase()} for ${invoice.total.toLocaleString()} which is currently ${invoice.status}. We would appreciate a prompt payment.\n\nBest regards,\nAura Team`;
  if (await checkRateLimit('ai_chat')) return "Plan limit reached for AI generation.";

  const prompt = `Generate a reminder email for invoice: ${JSON.stringify(invoice)}`;

  try {
    monitoringService.trackAIUsage('invoice_reminder', prompt);
    const response = await withTimeout(aiClient.models.generateContent({ model: "gemini-2.0-flash", contents: prompt }));
    await usageService.trackUsage('ai_chat');
    return response.text.trim();
  } catch (error) {
    monitoringService.trackError('AI_ENGINE', error as Error);
    return "Could not generate AI reminder.";
  }
};
