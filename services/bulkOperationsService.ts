import { supabase } from './supabaseClient';
import { db } from './db';
import { escapeCSV } from './securityUtils';

export interface BulkAction {
  id: string;
  entityType: string;
  entityIds: string[];
  action: 'delete' | 'export' | 'categorize' | 'approve' | 'reject' | 'archive';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: { success: number; failed: number };
  createdAt: string;
}

export const bulkOperationsService = {
  // Bulk delete entities
  bulkDelete: async (table: string, ids: string[]): Promise<{ success: number; failed: number }> => {
    if (!supabase) return { success: 0, failed: ids.length };
    let success = 0;
    let failed = 0;
    for (const id of ids) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) failed++; else success++;
    }
    return { success, failed };
  },

  // Bulk update status
  bulkUpdateStatus: async (table: string, ids: string[], status: string): Promise<{ success: number; failed: number }> => {
    if (!supabase) return { success: 0, failed: ids.length };
    const { error } = await supabase.from(table).update({ status }).in('id', ids);
    return error ? { success: 0, failed: ids.length } : { success: ids.length, failed: 0 };
  },

  // Bulk categorize transactions
  bulkCategorize: async (ids: string[], category: string): Promise<{ success: number; failed: number }> => {
    if (!supabase) return { success: 0, failed: ids.length };
    const { error } = await supabase.from('transactions')
      .update({ category })
      .in('id', ids)
      .eq('organization_id', db.getOrgId());
    return error ? { success: 0, failed: ids.length } : { success: ids.length, failed: 0 };
  },

  // Export selected entities to CSV
  bulkExport: (data: any[], filename: string): void => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => escapeCSV(row[h])).join(','));
    const csv = [headers.map(h => escapeCSV(h)).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
