import React, { useState, useEffect } from 'react';
import { aiAnomalyService, type AnomalyResult } from '../services/aiAnomalyService';
import { useAppStore } from '../store/useAppStore';

const severityConfig: Record<string, { icon: string; color: string }> = {
  high: { icon: '🔴', color: 'text-red-400' },
  medium: { icon: '🟡', color: 'text-yellow-400' },
  low: { icon: '🔵', color: 'text-blue-400' },
};

const typeLabels: Record<string, string> = {
  duplicate: 'Duplicate',
  unusual_amount: 'Unusual Amount',
  unusual_category: 'Unusual Category',
  unusual_time: 'Late Transaction',
  fraud_risk: 'Fraud Risk',
};

export const AnomalyDetectionWidget: React.FC = () => {
  const { transactions } = useAppStore();
  const [anomalies, setAnomalies] = useState<AnomalyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [mlStatus, setMlStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    if (transactions.length === 0) { setLoading(false); return; }
    aiAnomalyService.detectAnomalies(transactions).then(setAnomalies).finally(() => setLoading(false));
    aiAnomalyService.getMLStatus().then(s => setMlStatus(s.overall === 'offline' ? 'offline' : 'online'));
  }, [transactions]);

  if (loading) return (
    <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-2xl p-5">
      <div className="animate-pulse space-y-2">
        <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-8 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );

  if (anomalies.length === 0) return null;

  return (
    <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-sm">Anomaly Detection</h3>
          <p className="text-xs text-gray-500">
            {anomalies.length} anomalies detected
            <span className={`ml-2 ${mlStatus === 'online' ? 'text-green-400' : 'text-gray-500'}`}>
              {mlStatus === 'online' ? '⚡ AI-powered' : '📊 Rule-based'}
            </span>
          </p>
        </div>
        <span className="text-lg">🔍</span>
      </div>

      <div className="space-y-2">
        {anomalies.slice(0, 4).map((a, i) => (
          <div key={i} className="flex items-center gap-2 text-xs p-2 bg-dark-primary rounded-lg">
            <span>{severityConfig[a.severity].icon}</span>
            <div className="flex-1 min-w-0">
              <p className={`font-bold ${severityConfig[a.severity].color}`}>{typeLabels[a.type]}</p>
              <p className="text-gray-500 truncate">{a.description}</p>
            </div>
            <span className="text-[10px] text-gray-600">{(a.confidence * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
