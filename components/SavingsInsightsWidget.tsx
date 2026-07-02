import React, { useState, useEffect } from 'react';
import { savingsInsightsService, type SavingsInsight } from '../services/savingsInsightsService';
import { useAppStore } from '../store/useAppStore';

const severityColors: Record<string, string> = {
  high: 'bg-red-500/10 border-red-500/30 text-red-400',
  medium: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  low: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
};

const typeIcons: Record<string, string> = {
  duplicate: '🔄', unused: '💤', expensive: '💸', trend: '📈', opportunity: '💡',
};

export const SavingsInsightsWidget: React.FC = () => {
  const { transactions, invoices, bills } = useAppStore();
  const [insights, setInsights] = useState<SavingsInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (transactions.length === 0) { setLoading(false); return; }
    savingsInsightsService.generateInsights(transactions, invoices, bills)
      .then(setInsights)
      .finally(() => setLoading(false));
  }, [transactions, invoices, bills]);

  const totalSavings = insights.reduce((s, i) => s + i.amount, 0);

  if (loading || insights.length === 0) return null;

  return (
    <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-sm">Savings Insights</h3>
          <p className="text-xs text-gray-500">Potential savings: ₦{totalSavings.toLocaleString()}/year</p>
        </div>
        <span className="text-lg">💡</span>
      </div>

      <div className="space-y-2">
        {insights.slice(0, 3).map(insight => (
          <div key={insight.id} className={`p-3 rounded-xl border text-xs ${severityColors[insight.severity]}`}>
            <div className="flex items-start gap-2">
              <span>{typeIcons[insight.type]}</span>
              <div className="flex-1">
                <p className="font-bold">{insight.title}</p>
                <p className="opacity-80 mt-0.5">{insight.description}</p>
                <p className="opacity-60 mt-1 font-medium">{insight.action}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
