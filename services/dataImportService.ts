/**
 * Universal Data Import Service
 * Import from Excel, CSV, JSON, QuickBooks, Xero, bank statements
 */

import { supabase } from './supabaseClient';
import { db } from './db';
import { monitoringService } from './monitoringService';

export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
  warnings: string[];
}

// ============== CSV Import ==============
export async function importCSV(file: File, type: 'transactions' | 'invoices' | 'bills' | 'expenses'): Promise<ImportResult> {
  const text = await file.text();
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return { success: 0, failed: 0, errors: ['Empty file'], warnings: [] };

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    const row: Record<string, any> = {};
    headers.forEach((h, i) => { row[h.toLowerCase().replace(/\s+/g, '_')] = values[i]; });
    return row;
  });

  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      const mapped = mapRowToType(row, type);
      if (supabase) {
        const { error } = await supabase.from(type === 'expenses' ? 'expenses' : type).insert({
          ...mapped,
          organization_id: db.getOrgId(),
        });
        if (error) { failed++; errors.push(error.message); } else { success++; }
      } else { success++; }
    } catch (e) {
      failed++;
      errors.push(e instanceof Error ? e.message : 'Unknown error');
    }
  }

  return { success, failed, errors, warnings: [] };
}

// ============== JSON Import ==============
export async function importJSON(file: File, type: string): Promise<ImportResult> {
  const text = await file.text();
  try {
    const data = JSON.parse(text);
    const items = Array.isArray(data) ? data : data.transactions || data.invoices || data.bills || [];
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const item of items) {
      try {
        if (supabase) {
          const { error } = await supabase.from(type).insert({
            ...item,
            organization_id: db.getOrgId(),
          });
          if (error) { failed++; errors.push(error.message); } else { success++; }
        } else { success++; }
      } catch (e) {
        failed++;
        errors.push(e instanceof Error ? e.message : 'Unknown error');
      }
    }

    return { success, failed, errors, warnings: [] };
  } catch (e) {
    return { success: 0, failed: 0, errors: ['Invalid JSON file'], warnings: [] };
  }
}

// ============== QuickBooks Import ==============
export async function importQuickBooks(data: any[]): Promise<ImportResult> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const item of data) {
    try {
      const mapped = {
        id: item.Id || `qb_${Date.now()}_${Math.random()}`,
        amount: Math.abs(item.Amount || 0),
        type: (item.Amount || 0) >= 0 ? 'credit' : 'debit',
        date: item.Date || new Date().toISOString(),
        narration: item.Description || item.DocNumber || 'QuickBooks import',
        balance: item.Balance || 0,
        category: item.AccountName || 'Uncategorized',
        organization_id: db.getOrgId(),
      };

      if (supabase) {
        const { error } = await supabase.from('transactions').insert(mapped);
        if (error) { failed++; errors.push(error.message); } else { success++; }
      } else { success++; }
    } catch (e) {
      failed++;
      errors.push(e instanceof Error ? e.message : 'Unknown error');
    }
  }

  return { success, failed, errors, warnings: [] };
}

// ============== Xero Import ==============
export async function importXero(data: any[]): Promise<ImportResult> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const item of data) {
    try {
      const mapped = {
        id: item.InvoiceID || `xero_${Date.now()}_${Math.random()}`,
        customer: item.Contact?.Name || 'Xero Import',
        amount: item.SubTotal || 0,
        vat: item.TotalTax || 0,
        total: item.Total || 0,
        issueDate: item.Date || new Date().toISOString(),
        dueDate: item.DueDate || new Date().toISOString(),
        status: item.Status === 'AUTHORISED' ? 'Unpaid' : item.Status === 'PAID' ? 'Paid' : 'Draft',
        lineItems: item.LineItems?.map((l: any) => ({
          name: l.Description || '',
          description: l.Description || '',
          quantity: l.Quantity || 1,
          unitPrice: l.UnitAmount || 0,
          total: l.LineAmount || 0,
        })) || [],
        organization_id: db.getOrgId(),
      };

      if (supabase) {
        const { error } = await supabase.from('invoices').insert(mapped);
        if (error) { failed++; errors.push(error.message); } else { success++; }
      } else { success++; }
    } catch (e) {
      failed++;
      errors.push(e instanceof Error ? e.message : 'Unknown error');
    }
  }

  return { success, failed, errors, warnings: [] };
}

// ============== Bank Statement Import ==============
export async function importBankStatement(file: File): Promise<ImportResult> {
  const text = await file.text();
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return { success: 0, failed: 0, errors: ['Empty file'], warnings: [] };

  const headers = lines[0].split(/[,\t]/).map(h => h.trim().replace(/"/g, ''));
  const rows = lines.slice(1).map(line => {
    const values = line.split(/[,\t]/).map(v => v.trim().replace(/"/g, ''));
    const row: Record<string, any> = {};
    headers.forEach((h, i) => { row[h.toLowerCase().replace(/\s+/g, '_')] = values[i]; });
    return row;
  });

  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      const amount = parseFloat(row.amount || row.debit || row.credit || '0');
      const isCredit = amount > 0 || row.type?.toLowerCase() === 'credit';

      const mapped = {
        id: `bank_${Date.now()}_${Math.random()}`,
        amount: Math.abs(amount),
        type: isCredit ? 'credit' : 'debit',
        date: row.date || row.transaction_date || new Date().toISOString(),
        narration: row.description || row.narration || row.reference || 'Bank import',
        balance: parseFloat(row.balance || '0'),
        category: 'Uncategorized',
        organization_id: db.getOrgId(),
      };

      if (supabase) {
        const { error } = await supabase.from('transactions').insert(mapped);
        if (error) { failed++; errors.push(error.message); } else { success++; }
      } else { success++; }
    } catch (e) {
      failed++;
      errors.push(e instanceof Error ? e.message : 'Unknown error');
    }
  }

  return { success, failed, errors, warnings: [] };
}

// ============== Helper Functions ==============
function mapRowToType(row: Record<string, any>, type: string): Record<string, any> {
  const base = { organization_id: db.getOrgId() };

  switch (type) {
    case 'transactions':
      return {
        ...base,
        amount: parseFloat(row.amount || '0'),
        type: row.type || (parseFloat(row.amount || '0') >= 0 ? 'credit' : 'debit'),
        date: row.date || new Date().toISOString(),
        narration: row.narration || row.description || row.memo || '',
        balance: parseFloat(row.balance || '0'),
        category: row.category || 'Uncategorized',
      };
    case 'invoices':
      return {
        ...base,
        customer: row.customer || row.client || row.contact || 'Imported',
        amount: parseFloat(row.amount || row.subtotal || '0'),
        vat: parseFloat(row.vat || row.tax || '0'),
        total: parseFloat(row.total || row.amount || '0'),
        issueDate: row.issue_date || row.date || new Date().toISOString(),
        dueDate: row.due_date || row.due_date || new Date().toISOString(),
        status: row.status || 'Unpaid',
        lineItems: [],
      };
    case 'bills':
      return {
        ...base,
        vendor: row.vendor || row.supplier || row.payee || 'Imported',
        amount: parseFloat(row.amount || '0'),
        issueDate: row.issue_date || row.date || new Date().toISOString(),
        dueDate: row.due_date || row.due_date || new Date().toISOString(),
        status: row.status || 'Unpaid',
        lineItems: [],
      };
    case 'expenses':
      return {
        ...base,
        amount: parseFloat(row.amount || '0'),
        category: row.category || row.type || 'Miscellaneous',
        description: row.description || row.narration || '',
        date: row.date || new Date().toISOString(),
        vendor: row.vendor || row.payee || '',
      };
    default:
      return { ...base, ...row };
  }
}

// ============== File Format Detection ==============
export function detectFileFormat(file: File): 'csv' | 'json' | 'excel' | 'unknown' {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'csv' || ext === 'tsv') return 'csv';
  if (ext === 'json') return 'json';
  if (ext === 'xlsx' || ext === 'xls') return 'excel';
  return 'unknown';
}

export function getSupportedFormats(): string[] {
  return ['CSV', 'JSON', 'Excel (via CSV export)'];
}
