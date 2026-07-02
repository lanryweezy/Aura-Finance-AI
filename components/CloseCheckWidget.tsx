import React, { useState, useEffect } from 'react';
import { closeAutomationService, type CloseCheck } from '../services/closeAutomationService';
import { useAppStore } from '../store/useAppStore';

const statusConfig: Record<string, { icon: string; color: string }> = {
  pass: { icon: '✅', color: 'text-green-400' },
  warning: { icon: '⚠️', color: 'text-yellow-400' },
  fail: { icon: '❌', color: 'text-red-400' },
  pending: { icon: '⏳', color: 'text-gray-400' },
};

export const CloseCheckWidget: React.FC = () => {
  const { transactions, bills, invoices, journalEntries } = useAppStore();
  const [checks, setChecks] = useState<CloseCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  useEffect(() => {
    if (transactions.length === 0) { setLoading(false); return; }
    closeAutomationService.runCloseChecks(transactions, bills, invoices, journalEntries, month, year)
      .then(setChecks)
      .finally(() => setLoading(false));
  }, [transactions, bills, invoices, journalEntries]);

  const score = closeAutomationService.getCloseScore(checks);
  const ready = closeAutomationService.isReadyToClose(checks);

  if (loading || checks.length === 0) return null;

  return (
    <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-sm">Month-End Close</h3>
          <p className="text-xs text-gray-500">{now.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className={`text-2xl font-black ${score >= 80 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
          {score}%
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
        <div
          className={`h-2 rounded-full transition-all ${score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Checks */}
      <div className={`space-y-2 ${!expanded ? 'max-h-40 overflow-hidden' : ''}`}>
        {checks.map(check => (
          <div key={check.id} className="flex items-center gap-2 text-xs">
            <span>{statusConfig[check.status].icon}</span>
            <span className={`flex-1 ${statusConfig[check.status].color}`}>{check.name}</span>
          </div>
        ))}
      </div>

      {checks.length > 4 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-brand-cyan hover:underline mt-2"
        >
          {expanded ? 'Show less' : `Show all ${checks.length} checks`}
        </button>
      )}

      {/* Close button */}
      {ready && (
        <button
          onClick={() => closeAutomationService.closePeriod(month, year)}
          className="w-full mt-4 py-2 bg-green-500/20 text-green-400 rounded-xl text-xs font-bold hover:bg-green-500/30 transition-all"
        >
          ✓ Ready to Close Period
        </button>
      )}
    </div>
  );
};
