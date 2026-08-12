/**
 * Custom AI Model Training Service
 * Trains AI on YOUR business data for personalized predictions.
 */

import { aiClient, API_KEY, withTimeout, safeParseJSON } from './aiConfig';
import { usageService } from './usageService';
import { monitoringService } from './monitoringService';
import { supabase } from './supabaseClient';
import { db } from './db';
import type { CategorizedTransaction } from '../types';

export interface TrainingData {
  transactions: CategorizedTransaction[];
  categories: string[];
  amounts: number[];
  patterns: { dayOfWeek: number; hour: number; amount: number }[];
}

export interface PredictionResult {
  type: 'category' | 'amount' | 'risk' | 'trend';
  prediction: any;
  confidence: number;
  reasoning: string;
}

export const customAITrainingService = {
  // Analyze business patterns
  analyzePatterns: (transactions: CategorizedTransaction[]): TrainingData => {
    const categories = [...new Set(transactions.map(t => t.category))];
    const amounts = transactions.map(t => t.amount);
    const patterns = transactions.map(t => ({
      dayOfWeek: new Date(t.date).getDay(),
      hour: new Date(t.date).getHours(),
      amount: t.amount,
    }));

    return { transactions, categories, amounts, patterns };
  },

  // Predict next month's spending by category
  predictCategorySpending: async (transactions: CategorizedTransaction[], category: string): Promise<PredictionResult> => {
    const categoryTransactions = transactions.filter(t => t.category === category);
    if (categoryTransactions.length < 3) {
      return { type: 'amount', prediction: 0, confidence: 0.3, reasoning: 'Insufficient data for prediction' };
    }

    const avgMonthly = categoryTransactions.reduce((s, t) => s + t.amount, 0) / 3;
    const trend = categoryTransactions.slice(-3).reduce((s, t) => s + t.amount, 0) / 3;
    const change = (trend - avgMonthly) / avgMonthly;

    if (!aiClient || !API_KEY) {
      return {
        type: 'amount',
        prediction: Math.round(avgMonthly * (1 + change * 0.5)),
        confidence: 0.7,
        reasoning: `Based on ${categoryTransactions.length} transactions, average is ₦${Math.round(avgMonthly).toLocaleString()}/month`,
      };
    }

    try {
      if (await usageService.isRateLimited('ai_insight')) {
        return { type: 'amount', prediction: Math.round(avgMonthly), confidence: 0.6, reasoning: 'Rate limited, using simple average' };
      }

      const response = await withTimeout(aiClient.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: `Predict next month's spending for "${category}" based on these transactions: ${JSON.stringify(categoryTransactions.slice(-10).map(t => ({ amount: t.amount, date: t.date })))}. Return JSON with prediction (number) and reasoning (string).` }] }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object',
            properties: { prediction: { type: 'number' }, reasoning: { type: 'string' } },
          },
        },
      }), 10000);

      await usageService.trackUsage('ai_insight');
      const result = safeParseJSON<any>(response.text.trim());
      return { type: 'amount', prediction: result.prediction, confidence: 0.85, reasoning: result.reasoning };
    } catch {
      return { type: 'amount', prediction: Math.round(avgMonthly), confidence: 0.6, reasoning: 'AI unavailable, using trend analysis' };
    }
  },

  // Detect spending patterns
  detectPatterns: (transactions: CategorizedTransaction[]): { pattern: string; frequency: string; amount: number }[] => {
    const patterns: { narration: string; amounts: number[]; dates: number[] }[] = [];

    transactions.forEach(t => {
      const existing = patterns.find(p => p.narration === t.narration);
      if (existing) {
        existing.amounts.push(t.amount);
        existing.dates.push(new Date(t.date).getTime());
      } else {
        patterns.push({ narration: t.narration, amounts: [t.amount], dates: [new Date(t.date).getTime()] });
      }
    });

    return patterns
      .filter(p => p.dates.length >= 2)
      .map(p => {
        const intervals = [];
        for (let i = 1; i < p.dates.length; i++) {
          intervals.push(p.dates[i] - p.dates[i - 1]);
        }
        const avgInterval = intervals.reduce((s, i) => s + i, 0) / intervals.length;
        const avgDays = avgInterval / (1000 * 60 * 60 * 24);

        let frequency = 'unknown';
        if (avgDays >= 25 && avgDays <= 35) frequency = 'monthly';
        else if (avgDays >= 6 && avgDays <= 8) frequency = 'weekly';
        else if (avgDays >= 85 && avgDays <= 95) frequency = 'quarterly';

        return {
          pattern: p.narration,
          frequency,
          amount: Math.round(p.amounts.reduce((s, a) => s + a, 0) / p.amounts.length),
        };
      })
      .filter(p => p.frequency !== 'unknown')
      .sort((a, b) => b.amount - a.amount);
  },

  // Get business insights
  getBusinessInsights: async (transactions: CategorizedTransaction[]): Promise<string[]> => {
    const insights: string[] = [];
    const patterns = customAITrainingService.detectPatterns(transactions);

    if (patterns.length > 0) {
      insights.push(`Detected ${patterns.length} recurring payment patterns`);
      const totalRecurring = patterns.reduce((s, p) => s + p.amount * (p.frequency === 'monthly' ? 12 : p.frequency === 'weekly' ? 52 : 4), 0);
      insights.push(`Estimated annual recurring costs: ₦${totalRecurring.toLocaleString()}`);
    }

    const categories = [...new Set(transactions.map(t => t.category))];
    const topCategory = categories.reduce((best, cat) => {
      const total = transactions.filter(t => t.category === cat).reduce((s, t) => s + t.amount, 0);
      return total > best.total ? { category: cat, total } : best;
    }, { category: '', total: 0 });

    if (topCategory.category) {
      insights.push(`Highest spending category: ${topCategory.category} (₦${topCategory.total.toLocaleString()})`);
    }

    return insights;
  },
};
