import { useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { auditLogService } from '../auditLogService';
import { usageService } from '../usageService';
import { fetchTransactions } from '../monoService';
import { categorizeTransactions } from '../geminiService';
import { categorizeWithTabFM } from '../mlApiService';
import type { CategorizedTransaction } from '../../types';

export function useTransactions() {
  const { transactions, setTransactions, chartOfAccounts } = useAppStore();

  const log = useCallback(async (action: string) => {
    await auditLogService.add(action, 'User', 'Transactions');
    const logs = await auditLogService.getLogs();
    useAppStore.getState().setAuditLog(logs);
  }, []);

  const handleUpdateTransaction = useCallback((id: string, category: string, projectId?: string, receiptUrl?: string) => {
    setTransactions(prev =>
      prev.map(t => {
        if (t.id === id) {
          log(`Updated transaction #${t.id.slice(-4)}`);
          return { ...t, category, projectId, receiptUrl };
        }
        return t;
      })
    );
  }, [setTransactions, log]);

  const handleAddTransaction = useCallback(async (data: Omit<CategorizedTransaction, 'id' | 'balance'>) => {
    if (await usageService.isRateLimited('txn_volume')) throw new Error('Transaction limit reached');
    const tx: CategorizedTransaction = { ...data, id: `manual_txn_${Date.now()}` };
    setTransactions(prev => [...prev, tx].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    usageService.trackUsage('txn_volume');
    await log(`Added transaction: ${tx.narration} for ${tx.amount}`);
  }, [setTransactions, log]);

  const loadTransactions = useCallback(async () => {
    const raw = await fetchTransactions();

    // Try TabFM ML categorization first
    let categorized: CategorizedTransaction[];
    try {
      const mlResults = await categorizeWithTabFM(
        raw.map(t => ({ id: t.id, amount: t.amount, narration: t.narration, type: t.type })),
        transactions.length > 0 ? {
          transactions: transactions.slice(0, 50).map(t => ({ amount: t.amount, narration: t.narration, type: t.type })),
          categories: transactions.slice(0, 50).map(t => t.category),
        } : undefined
      );

      if (mlResults.length > 0) {
        // TabFM succeeded — use ML predictions
        categorized = raw.map(t => {
          const mlResult = mlResults.find(r => r.id === t.id);
          return {
            ...t,
            category: mlResult?.category || 'Uncategorized',
          } as CategorizedTransaction;
        });
      } else {
        // TabFM unavailable — fall back to Gemini
        categorized = await categorizeTransactions(raw, chartOfAccounts.map(c => c.name));
      }
    } catch (e) {
      // TabFM failed — fall back to Gemini
      categorized = await categorizeTransactions(raw, chartOfAccounts.map(c => c.name));
    }

    setTransactions(categorized);
  }, [chartOfAccounts, setTransactions, transactions]);

  return { transactions, handleUpdateTransaction, handleAddTransaction, loadTransactions };
}
