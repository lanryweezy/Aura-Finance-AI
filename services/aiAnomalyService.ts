import { categorizeWithTabFM, detectFraud, scoreRisk } from './mlApiService';
import type { CategorizedTransaction } from '../types';

export interface AnomalyResult {
  transactionId: string;
  type: 'duplicate' | 'unusual_amount' | 'unusual_category' | 'unusual_time' | 'fraud_risk';
  severity: 'high' | 'medium' | 'low';
  description: string;
  confidence: number;
}

export const aiAnomalyService = {
  // Detect anomalies combining TabFM fraud detection + rule-based checks
  detectAnomalies: async (transactions: CategorizedTransaction[]): Promise<AnomalyResult[]> => {
    const anomalies: AnomalyResult[] = [];

    // 1. Rule-based: duplicate detection
    const duplicates = findDuplicates(transactions);
    duplicates.forEach(d => {
      anomalies.push({
        transactionId: d.id,
        type: 'duplicate',
        severity: 'high',
        description: `Potential duplicate: ₦${d.amount.toLocaleString()} on ${new Date(d.date).toLocaleDateString()}`,
        confidence: 0.9,
      });
    });

    // 2. Rule-based: unusual amounts (3x standard deviation)
    const amounts = transactions.map(t => t.amount);
    const mean = amounts.reduce((s, a) => s + a, 0) / amounts.length;
    const stdDev = Math.sqrt(amounts.reduce((s, a) => s + Math.pow(a - mean, 2), 0) / amounts.length);

    transactions.forEach(t => {
      if (Math.abs(t.amount - mean) > 3 * stdDev && t.amount > mean * 3) {
        anomalies.push({
          transactionId: t.id,
          type: 'unusual_amount',
          severity: 'high',
          description: `Unusual amount: ₦${t.amount.toLocaleString()} (avg: ₦${Math.round(mean).toLocaleString()})`,
          confidence: 0.85,
        });
      }
    });

    // 3. Rule-based: unusual time (transactions outside business hours)
    transactions.forEach(t => {
      const hour = new Date(t.date).getHours();
      if ((hour < 6 || hour > 22) && t.amount > 50000) {
        anomalies.push({
          transactionId: t.id,
          type: 'unusual_time',
          severity: 'medium',
          description: `Late-night large transaction: ₦${t.amount.toLocaleString()} at ${hour}:00`,
          confidence: 0.7,
        });
      }
    });

    // 4. TabFM fraud detection
    try {
      const fraudResults = await detectFraud(
        transactions.slice(0, 20).map(t => ({ id: t.id, amount: t.amount, narration: t.narration, type: t.type }))
      );
      fraudResults.forEach(f => {
        if (f.isFraud || f.riskScore > 0.7) {
          anomalies.push({
            transactionId: f.id,
            type: 'fraud_risk',
            severity: f.riskScore > 0.9 ? 'high' : 'medium',
            description: `AI fraud risk: ${(f.riskScore * 100).toFixed(0)}% confidence`,
            confidence: f.riskScore,
          });
        }
      });
    } catch (e) {
      console.warn('TabFM fraud detection unavailable:', e);
    }

    return anomalies.sort((a, b) => b.confidence - a.confidence);
  },

  // Detect seasonal patterns from transaction history
  detectSeasonalPatterns: (transactions: CategorizedTransaction[]): { month: string; avgIncome: number; avgExpenses: number; trend: string }[] => {
    const monthlyData: Record<string, { income: number; expenses: number; count: number }> = {};

    transactions.forEach(t => {
      const month = new Date(t.date).toLocaleString('default', { month: 'short' });
      if (!monthlyData[month]) monthlyData[month] = { income: 0, expenses: 0, count: 0 };
      if (t.type === 'credit') monthlyData[month].income += t.amount;
      else monthlyData[month].expenses += t.amount;
      monthlyData[month].count++;
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const patterns = months.map(month => {
      const data = monthlyData[month] || { income: 0, expenses: 0, count: 0 };
      const avgIncome = data.count > 0 ? Math.round(data.income / Math.max(1, data.count / 12)) : 0;
      const avgExpenses = data.count > 0 ? Math.round(data.expenses / Math.max(1, data.count / 12)) : 0;

      let trend = 'stable';
      if (avgIncome > avgExpenses * 1.2) trend = 'profitable';
      else if (avgExpenses > avgIncome * 1.2) trend = 'high-spend';

      return { month, avgIncome, avgExpenses, trend };
    });

    return patterns;
  },

  // Get ML health status
  getMLStatus: async (): Promise<{ tabfm: boolean; timesfm: boolean; overall: string }> => {
    try {
      const { checkMLHealth } = await import('./mlApiService');
      const health = await checkMLHealth();
      return {
        ...health,
        overall: health.tabfm && health.timesfm ? 'fully-operational' :
                 health.tabfm || health.timesfm ? 'partially-available' : 'offline',
      };
    } catch {
      return { tabfm: false, timesfm: false, overall: 'offline' };
    }
  },
};

function findDuplicates(transactions: CategorizedTransaction[]): CategorizedTransaction[] {
  const dupes: CategorizedTransaction[] = [];
  const processed = new Set<string>();

  for (let i = 0; i < transactions.length; i++) {
    if (processed.has(transactions[i].id)) continue;
    for (let j = i + 1; j < transactions.length; j++) {
      if (processed.has(transactions[j].id)) continue;
      const a = transactions[i];
      const b = transactions[j];
      if (Math.abs(a.amount - b.amount) < 1 && a.type === b.type) {
        const daysDiff = Math.abs(new Date(a.date).getTime() - new Date(b.date).getTime()) / 86400000;
        if (daysDiff <= 1) {
          dupes.push(b);
          processed.add(b.id);
        }
      }
    }
  }
  return dupes;
}
