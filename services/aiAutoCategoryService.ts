import { aiClient, API_KEY, withTimeout, safeParseJSON } from './aiConfig';
import { usageService } from './usageService';
import { monitoringService } from './monitoringService';
import type { CategorizedTransaction } from '../types';

interface AutoCategoryResult {
  transactionId: string;
  originalCategory: string;
  suggestedCategory: string;
  confidence: number;
  reasoning: string;
}

const CATEGORY_PATTERNS: Record<string, string[]> = {
  'Salaries & Wages': ['salary', 'payroll', 'wage', 'nip/uba', 'staff', 'employee'],
  'Office Supplies': ['jumia', 'office', 'staples', 'printer', 'paper', 'toner'],
  'Software & Subscriptions': ['google', 'microsoft', 'slack', 'notion', 'github', 'vercel', 'netlify', 'aws', 'cloud'],
  'Marketing & Advertising': ['ads', 'facebook', 'instagram', 'twitter', 'marketing', 'promotion', 'campaign'],
  'Travel': ['uber', 'bolt', 'ikeja', 'airline', 'flight', 'hotel', 'airbnb', 'taxi', 'ride'],
  'Utilities': ['electricity', 'ikedc', 'ikedc', 'water', 'internet', 'spectranet', 'mtn', 'airtel', 'glo'],
  'Rent & Leases': ['rent', 'lease', 'landlord', 'office space'],
  'Professional Fees': ['consulting', 'legal', 'accounting', 'audit', 'professional'],
  'Cost of Sales': ['supplier', 'wholesale', 'bulk', 'inventory', 'raw material'],
  'Bank Charges & Fees': ['bank charge', 'transfer fee', 'maintenance', 'card fee'],
  'Meals & Entertainment': ['restaurant', 'food', 'lunch', 'dinner', 'entertainment', 'bar'],
  'Insurance': ['insurance', 'premium', 'policy', 'coverage'],
  'Repairs & Maintenance': ['repair', 'maintenance', 'fix', 'service'],
  'Hardware': ['laptop', 'computer', 'monitor', 'keyboard', 'mouse', 'phone'],
  'Sales Revenue': ['paystack', 'flutterwave', 'invoice', 'payment received', 'client'],
  'Service Revenue': ['consulting income', 'service payment', 'project payment'],
};

export const aiAutoCategoryService = {
  // Rule-based fast categorization (no AI needed)
  categorizeByRules: (transactions: CategorizedTransaction[]): AutoCategoryResult[] => {
    return transactions
      .filter(t => t.category === 'Uncategorized' || !t.category)
      .map(t => {
        const narration = t.narration.toLowerCase();
        let bestMatch = 'Uncategorized';
        let bestScore = 0;

        for (const [category, keywords] of Object.entries(CATEGORY_PATTERNS)) {
          const score = keywords.filter(kw => narration.includes(kw)).length;
          if (score > bestScore) {
            bestScore = score;
            bestMatch = category;
          }
        }

        return {
          transactionId: t.id,
          originalCategory: t.category,
          suggestedCategory: bestMatch,
          confidence: bestScore > 0 ? Math.min(0.95, 0.6 + bestScore * 0.15) : 0,
          reasoning: bestScore > 0 ? `Matched ${bestScore} keyword(s)` : 'No keyword match',
        };
      });
  },

  // AI-powered categorization for complex transactions
  categorizeWithAI: async (transactions: CategorizedTransaction[], categories: string[]): Promise<AutoCategoryResult[]> => {
    if (!aiClient || !API_KEY) {
      return aiAutoCategoryService.categorizeByRules(transactions);
    }

    if (await usageService.isRateLimited('ai_insight')) {
      return aiAutoCategoryService.categorizeByRules(transactions);
    }

    const uncategorized = transactions.filter(t => t.category === 'Uncategorized' || !t.category);
    if (uncategorized.length === 0) return [];

    try {
      const prompt = `Transactions to categorize:
${JSON.stringify(uncategorized.map(t => ({ id: t.id, narration: t.narration, amount: t.amount, type: t.type })))}`;

      const response = await withTimeout(aiClient.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          // AI Quality: Extract persona and category constraints to systemInstruction to improve consistency and reduce prompt token overlap
          systemInstruction: `You are an expert accountant for a Nigerian business. Categorize these transactions into one of these categories: ${categories.join(', ')}. For each transaction, provide the suggested category, confidence (0-1), and brief reasoning.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                transactionId: { type: 'string' },
                suggestedCategory: { type: 'string' },
                confidence: { type: 'number' },
                reasoning: { type: 'string' },
              },
            },
          },
        },
      }), 15000);

      await usageService.trackUsage('ai_insight');
      const results = safeParseJSON<any>(response.text.trim());

      if (!Array.isArray(results)) {
        throw new Error('AI output is not an array');
      }

      return results.map((r: any) => ({
        ...r,
        originalCategory: 'Uncategorized',
      }));
    } catch (error) {
      monitoringService.trackError('AI_AUTO_CATEGORY', error as Error);
      return aiAutoCategoryService.categorizeByRules(transactions);
    }
  },

  // Auto-apply high-confidence categorizations
  autoApply: (results: AutoCategoryResult[], threshold: number = 0.8): AutoCategoryResult[] => {
    return results.filter(r => r.confidence >= threshold);
  },

  // Get category statistics
  getStats: (transactions: CategorizedTransaction[]) => {
    const total = transactions.length;
    const categorized = transactions.filter(t => t.category && t.category !== 'Uncategorized').length;
    const uncategorized = total - categorized;
    const accuracy = total > 0 ? Math.round((categorized / total) * 100) : 0;

    const categoryCounts: Record<string, number> = {};
    transactions.forEach(t => {
      const cat = t.category || 'Uncategorized';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    return { total, categorized, uncategorized, accuracy, categoryCounts };
  },
};
