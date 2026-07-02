import { supabase } from './supabaseClient';
import { db } from './db';
import type { CategorizedTransaction, Bill, Invoice } from '../types';

export interface CloseCheck {
  id: string;
  name: string;
  status: 'pass' | 'warning' | 'fail' | 'pending';
  message: string;
  details?: string;
}

export interface ClosePeriod {
  id: string;
  month: number;
  year: number;
  status: 'open' | 'closing' | 'closed';
  checks: CloseCheck[];
  startedAt?: string;
  closedAt?: string;
}

export const closeAutomationService = {
  // Run all close checks for a period
  runCloseChecks: async (
    transactions: CategorizedTransaction[],
    bills: Bill[],
    invoices: Invoice[],
    journalEntries: any[],
    month: number,
    year: number
  ): Promise<CloseCheck[]> => {
    const checks: CloseCheck[] = [];
    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0);

    const periodTxns = transactions.filter(t => {
      const d = new Date(t.date);
      return d >= periodStart && d <= periodEnd;
    });

    // 1. All transactions categorized
    const uncategorized = periodTxns.filter(t => !t.category || t.category === 'Uncategorized');
    checks.push({
      id: 'check_categorized',
      name: 'All Transactions Categorized',
      status: uncategorized.length === 0 ? 'pass' : uncategorized.length <= 5 ? 'warning' : 'fail',
      message: uncategorized.length === 0
        ? 'All transactions are categorized'
        : `${uncategorized.length} transactions need categorization`,
      details: uncategorized.length > 0 ? uncategorized.map(t => `${t.narration} (₦${t.amount.toLocaleString()})`).join('\n') : undefined,
    });

    // 2. Bank reconciliation
    const { data: sessions } = await supabase
      .from('reconciliation_sessions')
      .select('status')
      .eq('organization_id', db.getOrgId())
      .gte('created_at', periodStart.toISOString())
      .lte('created_at', periodEnd.toISOString());

    const reconciled = sessions?.filter(s => s.status === 'completed').length || 0;
    checks.push({
      id: 'check_reconciliation',
      name: 'Bank Reconciliation Complete',
      status: reconciled > 0 ? 'pass' : 'warning',
      message: reconciled > 0
        ? `${reconciled} reconciliation session(s) completed`
        : 'No reconciliation sessions completed this period',
    });

    // 3. All invoices sent
    const periodInvoices = invoices.filter(i => {
      const d = new Date(i.issueDate);
      return d >= periodStart && d <= periodEnd;
    });
    const draftInvoices = periodInvoices.filter(i => i.status === 'Draft');
    checks.push({
      id: 'check_invoices',
      name: 'All Invoices Finalized',
      status: draftInvoices.length === 0 ? 'pass' : 'warning',
      message: draftInvoices.length === 0
        ? 'All invoices are finalized'
        : `${draftInvoices.length} invoices still in draft`,
    });

    // 4. All bills recorded
    const periodBills = bills.filter(b => {
      const d = new Date(b.issueDate);
      return d >= periodStart && d <= periodEnd;
    });
    const draftBills = periodBills.filter(b => b.status === 'Draft');
    checks.push({
      id: 'check_bills',
      name: 'All Bills Recorded',
      status: draftBills.length === 0 ? 'pass' : 'warning',
      message: draftBills.length === 0
        ? 'All bills are recorded'
        : `${draftBills.length} bills still in draft`,
    });

    // 5. Journal entries balanced
    const periodJEs = journalEntries.filter((je: any) => {
      const d = new Date(je.date);
      return d >= periodStart && d <= periodEnd;
    });
    const unbalanced = periodJEs.filter((je: any) => {
      const lines = je.lines || [];
      const debits = lines.filter((l: any) => l.type === 'debit').reduce((s: number, l: any) => s + l.amount, 0);
      const credits = lines.filter((l: any) => l.type === 'credit').reduce((s: number, l: any) => s + l.amount, 0);
      return Math.abs(debits - credits) > 0.01;
    });
    checks.push({
      id: 'check_balanced',
      name: 'Journal Entries Balanced',
      status: unbalanced.length === 0 ? 'pass' : 'fail',
      message: unbalanced.length === 0
        ? 'All journal entries are balanced'
        : `${unbalanced.length} journal entries are unbalanced`,
    });

    // 6. Payroll processed
    const { data: payrollRuns } = await supabase
      .from('payroll_runs')
      .select('id')
      .eq('organization_id', db.getOrgId())
      .gte('created_at', periodStart.toISOString())
      .lte('created_at', periodEnd.toISOString());

    checks.push({
      id: 'check_payroll',
      name: 'Payroll Processed',
      status: (payrollRuns?.length || 0) > 0 ? 'pass' : 'warning',
      message: (payrollRuns?.length || 0) > 0
        ? 'Payroll has been processed'
        : 'No payroll runs recorded this period',
    });

    // 7. Fixed asset depreciation
    const { data: assets } = await supabase
      .from('fixed_assets')
      .select('id')
      .eq('organization_id', db.getOrgId())
      .eq('status', 'Active');

    checks.push({
      id: 'check_depreciation',
      name: 'Depreciation Calculated',
      status: (assets?.length || 0) === 0 ? 'pass' : 'warning',
      message: (assets?.length || 0) === 0
        ? 'No fixed assets to depreciate'
        : `${assets?.length} active assets — verify depreciation schedules`,
    });

    // 8. Tax filings
    const { data: taxFilings } = await supabase
      .from('tax_filings')
      .select('status')
      .eq('organization_id', db.getOrgId())
      .gte('created_at', periodStart.toISOString())
      .lte('created_at', periodEnd.toISOString());

    const filed = taxFilings?.filter(t => t.status === 'filed').length || 0;
    const totalFilings = taxFilings?.length || 0;
    checks.push({
      id: 'check_tax',
      name: 'Tax Filings Submitted',
      status: totalFilings === 0 ? 'pass' : filed === totalFilings ? 'pass' : 'warning',
      message: totalFilings === 0
        ? 'No tax filings required'
        : `${filed}/${totalFilings} tax filings submitted`,
    });

    // 9. Audit trail complete
    const { count: auditCount } = await supabase
      .from('audit_logs_v2')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', db.getOrgId())
      .gte('timestamp', periodStart.toISOString())
      .lte('timestamp', periodEnd.toISOString());

    checks.push({
      id: 'check_audit',
      name: 'Audit Trail Complete',
      status: (auditCount || 0) > 0 ? 'pass' : 'warning',
      message: `${auditCount || 0} audit log entries for this period`,
    });

    return checks;
  },

  // Calculate close score
  getCloseScore: (checks: CloseCheck[]): number => {
    const total = checks.length;
    const passed = checks.filter(c => c.status === 'pass').length;
    return total > 0 ? Math.round((passed / total) * 100) : 0;
  },

  // Check if ready to close
  isReadyToClose: (checks: CloseCheck[]): boolean => {
    return checks.every(c => c.status === 'pass' || c.status === 'warning');
  },

  // Close the period
  closePeriod: async (month: number, year: number): Promise<void> => {
    if (supabase) {
      await supabase.from('closing_periods').insert({
        year,
        status: 'Closed',
        closed_at: new Date().toISOString(),
        closed_by: JSON.parse(localStorage.getItem('aura_user') || '{}').name || 'System',
        organization_id: db.getOrgId(),
      });
    }
  },
};
