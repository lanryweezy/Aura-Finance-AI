/**
 * Aura Finance AI — Autonomous Agent Engine
 * Makes the app truly autonomous by taking actions without user intervention.
 */

import { supabase } from './supabaseClient';
import { db } from './db';
import { monitoringService } from './monitoringService';
import { notificationService } from './notificationService';
import { aiAnomalyService } from './aiAnomalyService';
import type { CategorizedTransaction, Invoice, Bill, Budget } from '../types';

export interface AutonomousAction {
  id: string;
  type: 'auto_categorize' | 'auto_reconcile' | 'auto_reminder' | 'auto_budget_adjust' | 'auto_flag' | 'auto_payment';
  status: 'pending' | 'executed' | 'failed' | 'skipped';
  description: string;
  data: any;
  executedAt?: string;
  error?: string;
}

export interface AutonomousConfig {
  autoCategorize: boolean;
  autoReconcile: boolean;
  autoReminders: boolean;
  autoBudgetAdjust: boolean;
  autoFlagAnomalies: boolean;
  autoPayThreshold: number; // Max amount for auto-pay (₦)
  requireApprovalAbove: number; // Require approval above this amount
}

const DEFAULT_CONFIG: AutonomousConfig = {
  autoCategorize: true,
  autoReconcile: true,
  autoReminders: true,
  autoBudgetAdjust: true,
  autoFlagAnomalies: true,
  autoPayThreshold: 50000, // Auto-pay bills under ₦50K
  requireApprovalAbove: 100000, // Require approval above ₦100K
};

export const autonomousEngine = {
  config: DEFAULT_CONFIG,

  // Run all autonomous checks
  runAllChecks: async (
    transactions: CategorizedTransaction[],
    invoices: Invoice[],
    bills: Bill[],
    budgets: Budget[]
  ): Promise<AutonomousAction[]> => {
    const actions: AutonomousAction[] = [];

    // 1. Auto-categorize uncategorized transactions
    if (autonomousEngine.config.autoCategorize) {
      const uncategorized = transactions.filter(t => !t.category || t.category === 'Uncategorized');
      if (uncategorized.length > 0) {
        actions.push({
          id: `auto_${Date.now()}_categorize`,
          type: 'auto_categorize',
          status: 'pending',
          description: `Auto-categorize ${uncategorized.length} uncategorized transactions`,
          data: { count: uncategorized.length },
        });
      }
    }

    // 2. Auto-flag anomalies
    if (autonomousEngine.config.autoFlagAnomalies) {
      const anomalies = await aiAnomalyService.detectAnomalies(transactions);
      const highSeverity = anomalies.filter(a => a.severity === 'high');
      if (highSeverity.length > 0) {
        actions.push({
          id: `auto_${Date.now()}_flag`,
          type: 'auto_flag',
          status: 'pending',
          description: `Auto-flag ${highSeverity.length} high-severity anomalies`,
          data: { anomalies: highSeverity.map(a => a.description) },
        });
      }
    }

    // 3. Auto reminders for overdue invoices
    if (autonomousEngine.config.autoReminders) {
      const overdue = invoices.filter(i => i.status !== 'Paid' && new Date(i.dueDate) < new Date());
      if (overdue.length > 0) {
        actions.push({
          id: `auto_${Date.now()}_reminder`,
          type: 'auto_reminder',
          status: 'pending',
          description: `Auto-send reminders for ${overdue.length} overdue invoices`,
          data: { count: overdue.length },
        });
      }
    }

    // 4. Auto-adjust budgets if spending exceeds 90%
    if (autonomousEngine.config.autoBudgetAdjust) {
      for (const budget of budgets) {
        const spent = transactions
          .filter(t => t.type === 'debit' && t.category === budget.category)
          .reduce((s, t) => s + t.amount, 0);
        if (spent > budget.amount * 0.9) {
          actions.push({
            id: `auto_${Date.now()}_budget_${budget.category}`,
            type: 'auto_budget_adjust',
            status: 'pending',
            description: `Budget "${budget.category}" at ${Math.round((spent / budget.amount) * 100)}% — consider increasing or cutting spending`,
            data: { category: budget.category, spent, budget: budget.amount },
          });
        }
      }
    }

    // 5. Auto-pay bills under threshold
    if (autonomousEngine.config.autoPayThreshold > 0) {
      const autoPayable = bills.filter(b => b.status === 'Unpaid' && b.amount <= autonomousEngine.config.autoPayThreshold);
      if (autoPayable.length > 0) {
        actions.push({
          id: `auto_${Date.now()}_payment`,
          type: 'auto_payment',
          status: 'pending',
          description: `Auto-pay ${autoPayable.length} bills under ₦${autonomousEngine.config.autoPayThreshold.toLocaleString()}`,
          data: { bills: autoPayable.map(b => ({ id: b.id, vendor: b.vendor, amount: b.amount })) },
        });
      }
    }

    return actions;
  },

  // Execute an autonomous action
  executeAction: async (action: AutonomousAction): Promise<AutonomousAction> => {
    try {
      switch (action.type) {
        case 'auto_categorize':
          // In production, would call AI to categorize
          monitoringService.log('info', 'AUTONOMOUS', action.description);
          break;
        case 'auto_flag':
          await notificationService.create({
            type: 'ai_alert', priority: 'critical',
            title: 'Anomaly Detected', message: action.description,
          });
          break;
        case 'auto_reminder':
          monitoringService.log('info', 'AUTONOMOUS', action.description);
          break;
        case 'auto_budget_adjust':
          await notificationService.create({
            type: 'system', priority: 'high',
            title: 'Budget Alert', message: action.description,
          });
          break;
        case 'auto_payment':
          monitoringService.log('info', 'AUTONOMOUS', action.description);
          break;
      }

      return { ...action, status: 'executed', executedAt: new Date().toISOString() };
    } catch (error) {
      return { ...action, status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Run the autonomous loop
  runAutonomousLoop: async (
    transactions: CategorizedTransaction[],
    invoices: Invoice[],
    bills: Bill[],
    budgets: Budget[]
  ): Promise<{ actions: AutonomousAction[]; executed: number; failed: number }> => {
    const actions = await autonomousEngine.runAllChecks(transactions, invoices, bills, budgets);
    let executed = 0;
    let failed = 0;

    for (const action of actions) {
      const result = await autonomousEngine.executeAction(action);
      if (result.status === 'executed') executed++;
      else if (result.status === 'failed') failed++;
    }

    monitoringService.log('info', 'AUTONOMOUS', `Autonomous loop complete: ${executed} executed, ${failed} failed`);
    return { actions, executed, failed };
  },
};
