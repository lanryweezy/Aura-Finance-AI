import { supabase } from './supabaseClient';
import { db } from './db';
import type { CategorizedTransaction } from '../types';

export interface DuplicateGroup {
  id: string;
  transactions: CategorizedTransaction[];
  reason: string;
  totalAmount: number;
  confidence: number;
}

export interface SubscriptionDetection {
  merchant: string;
  amount: number;
  frequency: string;
  lastSeen: string;
  transactionCount: number;
  estimatedAnnualCost: number;
  isDuplicate: boolean;
}

export const duplicateDetectionService = {
  // Find duplicate transactions (same amount + similar narration within 7 days)
  findDuplicates: (transactions: CategorizedTransaction[]): DuplicateGroup[] => {
    const groups: DuplicateGroup[] = [];
    const processed = new Set<string>();

    for (let i = 0; i < transactions.length; i++) {
      if (processed.has(transactions[i].id)) continue;

      const matches: CategorizedTransaction[] = [transactions[i]];
      processed.add(transactions[i].id);

      for (let j = i + 1; j < transactions.length; j++) {
        if (processed.has(transactions[j].id)) continue;

        const a = transactions[i];
        const b = transactions[j];

        // Same amount
        if (Math.abs(a.amount - b.amount) > 1) continue;

        // Same type
        if (a.type !== b.type) continue;

        // Within 7 days
        const daysDiff = Math.abs(new Date(a.date).getTime() - new Date(b.date).getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff > 7) continue;

        // Similar narration (at least 60% overlap)
        const wordsA = new Set(a.narration.toLowerCase().split(/\s+/));
        const wordsB = new Set(b.narration.toLowerCase().split(/\s+/));
        const intersection = [...wordsA].filter(w => wordsB.has(w)).length;
        const similarity = intersection / Math.max(wordsA.size, wordsB.size);
        if (similarity < 0.4) continue;

        matches.push(b);
        processed.add(transactions[j].id);
      }

      if (matches.length > 1) {
        groups.push({
          id: `dup_${Date.now()}_${i}`,
          transactions: matches,
          reason: `${matches.length} transactions with same amount (₦${matches[0].amount.toLocaleString()}) within 7 days`,
          totalAmount: matches.reduce((s, t) => s + t.amount, 0),
          confidence: 0.9,
        });
      }
    }

    return groups;
  },

  // Detect recurring subscriptions
  detectSubscriptions: (transactions: CategorizedTransaction[]): SubscriptionDetection[] => {
    const merchantMap = new Map<string, CategorizedTransaction[]>();

    transactions.forEach(t => {
      // Extract merchant from narration
      const merchant = extractMerchant(t.narration);
      if (!merchantMap.has(merchant)) merchantMap.set(merchant, []);
      merchantMap.get(merchant)!.push(t);
    });

    const subscriptions: SubscriptionDetection[] = [];

    merchantMap.forEach((txns, merchant) => {
      if (txns.length < 2) return;

      // Check if amounts are consistent
      const amounts = txns.map(t => t.amount);
      const avgAmount = amounts.reduce((s, a) => s + a, 0) / amounts.length;
      const consistent = amounts.every(a => Math.abs(a - avgAmount) < avgAmount * 0.05);

      if (!consistent) return;

      // Determine frequency
      const dates = txns.map(t => new Date(t.date).getTime()).sort();
      const intervals = [];
      for (let i = 1; i < dates.length; i++) {
        intervals.push(dates[i] - dates[i - 1]);
      }
      const avgInterval = intervals.reduce((s, i) => s + i, 0) / intervals.length;
      const avgDays = avgInterval / (1000 * 60 * 60 * 24);

      let frequency = 'unknown';
      if (avgDays >= 25 && avgDays <= 35) frequency = 'monthly';
      else if (avgDays >= 6 && avgDays <= 8) frequency = 'weekly';
      else if (avgDays >= 85 && avgDays <= 95) frequency = 'quarterly';
      else if (avgDays >= 350 && avgDays <= 380) frequency = 'yearly';

      if (frequency === 'unknown') return;

      const lastSeen = new Date(Math.max(...dates)).toISOString();
      const estimatedAnnual = frequency === 'monthly' ? avgAmount * 12 :
                              frequency === 'weekly' ? avgAmount * 52 :
                              frequency === 'quarterly' ? avgAmount * 4 :
                              avgAmount;

      // Check for duplicates (same merchant, same amount, very close dates)
      const isDuplicate = txns.some((a, i) =>
        txns.some((b, j) => i < j &&
          Math.abs(a.amount - b.amount) < 1 &&
          Math.abs(new Date(a.date).getTime() - new Date(b.date).getTime()) < 86400000
      ));

      subscriptions.push({
        merchant,
        amount: Math.round(avgAmount),
        frequency,
        lastSeen,
        transactionCount: txns.length,
        estimatedAnnualCost: Math.round(estimatedAnnual),
        isDuplicate,
      });
    });

    return subscriptions.sort((a, b) => b.estimatedAnnualCost - a.estimatedAnnualCost);
  },

  // Find duplicate subscriptions (same merchant, overlapping dates)
  findDuplicateSubscriptions: (subscriptions: SubscriptionDetection[]): SubscriptionDetection[] => {
    return subscriptions.filter(s => s.isDuplicate);
  },

  // Calculate potential savings
  calculateSavings: (subscriptions: SubscriptionDetection[]): { totalAnnual: number; duplicateAnnual: number; recommendations: string[] } => {
    const totalAnnual = subscriptions.reduce((s, sub) => s + sub.estimatedAnnualCost, 0);
    const duplicateAnnual = subscriptions.filter(s => s.isDuplicate).reduce((s, sub) => s + sub.estimatedAnnualCost, 0);
    const recommendations: string[] = [];

    if (duplicateAnnual > 0) {
      recommendations.push(`Cancel duplicate subscriptions to save ₦${duplicateAnnual.toLocaleString()}/year`);
    }

    const expensive = subscriptions.filter(s => s.estimatedAnnualCost > 100000);
    if (expensive.length > 0) {
      recommendations.push(`Review expensive subscriptions: ${expensive.map(s => `${s.merchant} (₦${s.estimatedAnnualCost.toLocaleString()}/yr)`).join(', ')}`);
    }

    if (subscriptions.length > 10) {
      recommendations.push(`You have ${subscriptions.length} active subscriptions. Consider consolidating.`);
    }

    return { totalAnnual, duplicateAnnual, recommendations };
  },
};

function extractMerchant(narration: string): string {
  // Try to extract merchant name from common Nigerian transaction formats
  const patterns = [
    /^([A-Z\s]+)\//, // "GOOGLE ADS/MARKETING"
    /^([A-Z\s]+)-/, // "SUBSCRIPTION-SLACK"
    /^[A-Z]+\/[A-Z]+\/([A-Z\s]+)/, // "WEB/GOOGLE-ADS"
  ];

  for (const pattern of patterns) {
    const match = narration.match(pattern);
    if (match) return match[1].trim();
  }

  // Fallback: first 3 words
  return narration.split(/\s+/).slice(0, 3).join(' ');
}
