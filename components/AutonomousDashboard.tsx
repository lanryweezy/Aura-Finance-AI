import React, { useState, useEffect } from 'react';
import { autonomousEngine, type AutonomousAction, type AutonomousConfig } from '../services/autonomousEngine';
import { useAppStore } from '../store/useAppStore';

const actionColors: Record<string, string> = {
  auto_categorize: 'bg-blue-500/20 text-blue-400',
  auto_reconcile: 'bg-green-500/20 text-green-400',
  auto_reminder: 'bg-yellow-500/20 text-yellow-400',
  auto_budget_adjust: 'bg-orange-500/20 text-orange-400',
  auto_flag: 'bg-red-500/20 text-red-400',
  auto_payment: 'bg-purple-500/20 text-purple-400',
};

const actionIcons: Record<string, string> = {
  auto_categorize: '🏷️',
  auto_reconcile: '🔄',
  auto_reminder: '📧',
  auto_budget_adjust: '📊',
  auto_flag: '🚩',
  auto_payment: '💰',
};

export const AutonomousDashboard: React.FC = () => {
  const { transactions, invoices, bills, budgets } = useAppStore();
  const [actions, setActions] = useState<AutonomousAction[]>([]);
  const [config, setConfig] = useState<AutonomousConfig>(autonomousEngine.config);
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);

  const runAutonomous = async () => {
    setRunning(true);
    try {
      const result = await autonomousEngine.runAutonomousLoop(transactions, invoices, bills, budgets);
      setActions(result.actions);
      setLastRun(new Date().toISOString());
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    if (transactions.length > 0) runAutonomous();
  }, [transactions.length]);

  const executed = actions.filter(a => a.status === 'executed').length;
  const pending = actions.filter(a => a.status === 'pending').length;

  return (
    <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-sm">Autonomous Agent</h3>
          <p className="text-xs text-gray-500">
            {running ? 'Running checks...' : lastRun ? `Last run: ${new Date(lastRun).toLocaleTimeString()}` : 'Ready'}
          </p>
        </div>
        <button onClick={runAutonomous} disabled={running}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            running ? 'bg-yellow-500/20 text-yellow-400' : 'bg-brand-cyan/20 text-brand-cyan hover:bg-brand-cyan/30'
          }`}>
          {running ? '...' : 'Run Now'}
        </button>
      </div>

      {/* Config toggles */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {Object.entries(config).filter(([k]) => k !== 'autoPayThreshold' && k !== 'requireApprovalAbove').map(([key, value]) => (
          <label key={key} className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={value as boolean}
              onChange={() => setConfig(prev => ({ ...prev, [key]: !prev[key as keyof AutonomousConfig] }))}
              className="w-3 h-3 rounded" />
            <span className="text-gray-500">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
          </label>
        ))}
      </div>

      {/* Results */}
      {actions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 mb-2">
            {executed} executed, {pending} pending
          </p>
          {actions.slice(0, 5).map((action, i) => (
            <div key={i} className={`flex items-center gap-2 text-xs p-2 rounded-lg ${actionColors[action.type] || 'bg-gray-500/20 text-gray-400'}`}>
              <span>{actionIcons[action.type] || '⚙️'}</span>
              <span className="flex-1 truncate">{action.description}</span>
              <span className="text-[10px]">{action.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
