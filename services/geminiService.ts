
import { Type } from "@google/genai";
import { aiClient, API_KEY } from './aiConfig';
import { usageService } from './usageService';
import { monitoringService } from './monitoringService';
import type { RawTransaction, CategorizedTransaction, FinancialInsight, Invoice, ReportData, PayrollRun } from '../types';

// Simple in-memory cache for transaction categorization
const categorizationCache = new Map<string, string>();

const checkRateLimit = (type: 'ai_insight' | 'ai_chat'): boolean => {
    if (usageService.isRateLimited(type)) {
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
  if (!aiClient || !API_KEY) {
     return transactions.map(t => ({ ...t, category: 'Uncategorized' }));
  }

  // Filter out already cached transactions
  const toCategorize: RawTransaction[] = [];
  const results: CategorizedTransaction[] = [];

  for (const t of transactions) {
    const cacheKey = `${t.narration}_${t.amount}_${t.type}`;
    if (categorizationCache.has(cacheKey)) {
        results.push({ ...t, category: categorizationCache.get(cacheKey)! });
    } else {
        toCategorize.push(t);
    }
  }

  if (toCategorize.length === 0) return results;

  usageService.trackUsage('bank_sync');

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

  const prompt = `
    You are an expert accountant. Categorize these transactions:
    Allowed Categories: ${categoryList.join(', ')}
    Transactions: ${JSON.stringify(toCategorize)}
  `;

  try {
    monitoringService.log('info', 'AI_ENGINE', 'Categorizing transactions');
    const response = await aiClient.getGenerativeModel({ model: "gemini-2.0-flash" }).generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: transactionSchema as any,
      },
    });

    const jsonText = response.response.text().trim();
    const batchResult = JSON.parse(jsonText) as CategorizedTransaction[];

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


export const getFinancialInsights = async (transactions: CategorizedTransaction[]): Promise<FinancialInsight[]> => {
  if (!aiClient || !API_KEY) {
    return [{ title: 'AI Analysis Disabled', description: 'Set your Gemini API key.', priority: 'Medium' }];
  }

  if (checkRateLimit('ai_insight')) {
      return [{ title: 'Plan Limit Reached', description: 'You have reached your AI insights limit for this month. Please upgrade your plan.', priority: 'High' }];
  }

  if (transactions.length === 0) return [];

  const prompt = `Based on these transactions, generate 3 concise financial insights for a Nigerian SME: ${JSON.stringify(transactions)}`;

  try {
    monitoringService.trackAIUsage('insight', prompt);
    const response = await aiClient.getGenerativeModel({ model: "gemini-2.0-flash" }).generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: insightsSchema as any,
        },
    });
    
    usageService.trackUsage('ai_insight');

    const jsonText = response.response.text().trim();
    return JSON.parse(jsonText) as FinancialInsight[];

  } catch (error) {
    monitoringService.trackError('AI_ENGINE', error as Error);
    return [{ title: 'Analysis Unavailable', description: 'Error generating AI insights.', priority: 'High' }];
  }
};

export const getPayrollInsights = async (payrollHistory: PayrollRun[]): Promise<string> => {
  if (!aiClient || !API_KEY) return "AI features disabled.";
  if (checkRateLimit('ai_insight')) return "Plan limit reached for AI insights.";

  const prompt = `Analyze payroll history and provide one strategic insight: ${JSON.stringify(payrollHistory)}`;

  try {
    monitoringService.trackAIUsage('payroll_insight', prompt);
    const response = await aiClient.getGenerativeModel({ model: "gemini-2.0-flash" }).generateContent(prompt);
    usageService.trackUsage('ai_insight');
    return response.response.text().trim();
  } catch (error) {
    monitoringService.trackError('AI_ENGINE', error as Error);
    return "Could not generate AI insight.";
  }
};

export const getFinancialReportAnalysis = async (currentPeriodData: ReportData, comparisonPeriodData?: ReportData): Promise<string> => {
    if (!aiClient || !API_KEY) return "AI features disabled.";
    if (checkRateLimit('ai_insight')) return "Plan limit reached for AI insights.";

    const prompt = `Provide CFO Executive Summary for: ${JSON.stringify(currentPeriodData)}`;

    try {
        monitoringService.trackAIUsage('report_analysis', prompt);
        const response = await aiClient.getGenerativeModel({ model: "gemini-2.0-flash" }).generateContent(prompt);
        usageService.trackUsage('ai_insight');
        return response.response.text().trim();
    } catch (error) {
        monitoringService.trackError('AI_ENGINE', error as Error);
        return "Could not generate AI analysis.";
    }
};

export const generateInvoiceReminder = async (invoice: Invoice): Promise<string> => {
  if (!aiClient || !API_KEY) return "AI features disabled.";
  if (checkRateLimit('ai_chat')) return "Plan limit reached for AI generation.";

  const prompt = `Generate a reminder email for invoice: ${JSON.stringify(invoice)}`;

  try {
    monitoringService.trackAIUsage('invoice_reminder', prompt);
    const response = await aiClient.getGenerativeModel({ model: "gemini-2.0-flash" }).generateContent(prompt);
    usageService.trackUsage('ai_chat');
    return response.response.text().trim();
  } catch (error) {
    monitoringService.trackError('AI_ENGINE', error as Error);
    return "Could not generate AI reminder.";
  }
};
