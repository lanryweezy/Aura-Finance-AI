import React, { useState, useEffect } from 'react';
import { generateCashFlowForecast, type ForecastResult } from '../services/forecastingService';
import { useAppStore } from '../store/useAppStore';

const riskColors: Record<string, string> = {
  Low: 'bg-green-500/20 text-green-400 border-green-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  High: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export const ForecastingDashboard: React.FC = () => {
  const { transactions, invoices, bills, payrollHistory } = useAppStore();
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (transactions.length === 0) { setLoading(false); return; }
    generateCashFlowForecast(transactions, invoices, bills, payrollHistory)
      .then(setForecast)
      .finally(() => setLoading(false));
  }, [transactions, invoices, bills, payrollHistory]);

  if (loading) return (
    <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-2xl p-5">
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-8 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );

  if (!forecast) return null;

  return (
    <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-sm">Cash Flow Forecast</h3>
          <p className="text-xs text-gray-500">
            6-month projection
            {forecast.mlPowered && <span className="ml-1 text-brand-cyan">⚡ ML-powered</span>}
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full border font-bold ${riskColors[forecast.riskLevel]}`}>
          {forecast.riskLevel} Risk
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-dark-primary rounded-xl p-3">
          <p className="text-[10px] text-gray-500">Monthly Burn</p>
          <p className="text-sm font-bold">₦{forecast.monthlyBurnRate.toLocaleString()}</p>
        </div>
        <div className="bg-dark-primary rounded-xl p-3">
          <p className="text-[10px] text-gray-500">Runway</p>
          <p className="text-sm font-bold">{forecast.runwayDays} days</p>
        </div>
      </div>

      <div className="space-y-1.5 mb-4">
        {forecast.forecasts.map((f, i) => (
          <div key={i} className="flex items-center text-xs">
            <span className="w-16 text-gray-500">{f.month}</span>
            <div className="flex-1 h-4 bg-dark-primary rounded-full overflow-hidden mx-2 relative">
              {/* Confidence interval bar */}
              {forecast.confidenceInterval && (
                <div
                  className="absolute h-full bg-brand-cyan/10 rounded-full"
                  style={{
                    left: `${Math.max(0, (forecast.confidenceInterval.lower[i * 30] || 0) / (forecast.monthlyBurnRate || 1) * 100)}%`,
                    width: `${Math.min(100, ((forecast.confidenceInterval.upper[i * 30] || 0) - (forecast.confidenceInterval.lower[i * 30] || 0)) / (forecast.monthlyBurnRate || 1) * 100)}%`,
                  }}
                />
              )}
              <div
                className={`h-full rounded-full ${f.netCashFlow >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(100, Math.abs(f.netCashFlow) / (forecast.monthlyBurnRate || 1) * 100)}%` }}
              />
            </div>
            <span className={`w-20 text-right font-medium ${f.netCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {f.netCashFlow >= 0 ? '+' : ''}₦{f.netCashFlow.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {forecast.recommendations.length > 0 && (
        <div className="space-y-1">
          {forecast.recommendations.slice(0, 2).map((r, i) => (
            <p key={i} className="text-[10px] text-gray-500 leading-relaxed">• {r}</p>
          ))}
        </div>
      )}
    </div>
  );
};
