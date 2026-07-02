import React, { useState, useEffect } from 'react';
import { reconciliationService } from '../services/reconciliationService';
import type { ReconciliationSession } from '../types';

export const ReconciliationView: React.FC = () => {
  const [sessions, setSessions] = useState<ReconciliationSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reconciliationService.fetchSessions().then(setSessions).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">Bank Reconciliation</h2>
        <p className="text-gray-500 mt-1">Match bank transactions to book entries</p>
      </div>

      <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-gray-100 dark:border-white/10">
            <th className="text-left p-4 text-xs font-bold text-gray-500">Period</th>
            <th className="text-right p-4 text-xs font-bold text-gray-500">Statement Balance</th>
            <th className="text-right p-4 text-xs font-bold text-gray-500">Matched</th>
            <th className="text-right p-4 text-xs font-bold text-gray-500">Unmatched</th>
            <th className="text-center p-4 text-xs font-bold text-gray-500">Status</th>
          </tr></thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id} className="border-b border-gray-50 dark:border-white/5 hover:bg-white/5">
                <td className="p-4 text-sm font-medium">{s.period}</td>
                <td className="p-4 text-sm text-right">₦{(s.statementBalance || 0).toLocaleString()}</td>
                <td className="p-4 text-sm text-right text-green-400">{s.matchedCount}</td>
                <td className="p-4 text-sm text-right text-yellow-400">{s.unmatchedCount}</td>
                <td className="p-4 text-center">
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${s.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
            {sessions.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-gray-500">No reconciliation sessions yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
