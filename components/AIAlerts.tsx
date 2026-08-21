import React, { useState, useEffect } from 'react';
import { aiAlertsService, type AIAlert } from '../services/aiAlertsService';
import { useAppStore } from '../store/useAppStore';

const severityColors = {
  critical: 'bg-red-500/10 border-red-500/30 text-red-400',
  warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
};

const severityIcons: Record<string, string> = {
  critical: '🔴',
  warning: '🟡',
  info: '🔵',
};

export const AIAlerts: React.FC = () => {
  const { transactions, invoices, bills } = useAppStore();
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const generated = await aiAlertsService.generateAlerts(transactions, invoices, bills);
        setAlerts(generated.filter(a => !a.dismissed));
      } catch (e) {
        console.error('Failed to load alerts:', e);
      } finally {
        setLoading(false);
      }
    };
    if (transactions.length > 0 || invoices.length > 0) load();
  }, [transactions, invoices, bills]);

  const handleDismiss = async (id: string) => {
    await aiAlertsService.dismissAlert(id);
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  if (loading || alerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">AI Alerts</span>
        <span className="text-xs bg-brand-cyan/20 text-brand-cyan px-2 py-0.5 rounded-full font-bold">{alerts.length}</span>
      </div>
      {alerts.slice(0, 5).map(alert => (
        <div
          key={alert.id}
          className={`flex items-start gap-3 p-4 rounded-xl border ${severityColors[alert.severity]} transition-all`}
        >
          <span className="text-lg flex-shrink-0">{severityIcons[alert.severity]}</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">{alert.title}</p>
            <p className="text-xs opacity-80 mt-0.5">{alert.message}</p>
          </div>
          <button
            onClick={() => handleDismiss(alert.id)}
            className="text-gray-400 hover:text-white text-xs flex-shrink-0"
            aria-label="Dismiss alert"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
