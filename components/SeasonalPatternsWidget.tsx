import React, { useMemo } from 'react';
import { aiAnomalyService } from '../services/aiAnomalyService';
import { useAppStore } from '../store/useAppStore';

export const SeasonalPatternsWidget: React.FC = () => {
  const { transactions } = useAppStore();

  const patterns = useMemo(() => {
    if (transactions.length === 0) return [];
    return aiAnomalyService.detectSeasonalPatterns(transactions);
  }, [transactions]);

  if (patterns.length === 0) return null;

  const maxIncome = Math.max(...patterns.map(p => p.avgIncome), 1);
  const maxExpenses = Math.max(...patterns.map(p => p.avgExpenses), 1);

  return (
    <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-sm">Seasonal Patterns</h3>
          <p className="text-xs text-gray-500">Income vs expenses by month</p>
        </div>
        <span className="text-lg">📊</span>
      </div>

      <div className="space-y-1.5">
        {patterns.map((p, i) => (
          <div key={i} className="flex items-center text-xs">
            <span className="w-8 text-gray-500 font-medium">{p.month}</span>
            <div className="flex-1 flex gap-1 mx-2">
              <div className="flex-1 h-3 bg-dark-primary rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(p.avgIncome / maxIncome) * 100}%` }}
                />
              </div>
              <div className="flex-1 h-3 bg-dark-primary rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-400 rounded-full"
                  style={{ width: `${(p.avgExpenses / maxExpenses) * 100}%` }}
                />
              </div>
            </div>
            <span className={`w-16 text-right text-[10px] font-medium ${
              p.trend === 'profitable' ? 'text-green-400' : p.trend === 'high-spend' ? 'text-red-400' : 'text-gray-500'
            }`}>
              {p.trend === 'profitable' ? '↑ Profit' : p.trend === 'high-spend' ? '↓ Spend' : '—'}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-3 text-[10px] text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full" /> Income</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-full" /> Expenses</span>
      </div>
    </div>
  );
};
