import { supabase } from './supabaseClient';
import { db } from './db';

export async function exportAuditTrail(format: 'csv' | 'json' = 'csv'): Promise<void> {
  if (!supabase) return;

  const { data: logs } = await supabase
    .from('audit_logs_v2')
    .select('*')
    .eq('organization_id', db.getOrgId())
    .order('timestamp', { ascending: false })
    .limit(5000);

  if (!logs || logs.length === 0) return;

  if (format === 'csv') {
    const headers = ['Timestamp', 'User', 'Action', 'Module', 'Entity Type', 'Entity ID', 'Entity Name'];
    const rows = logs.map((l: any) => [
      l.timestamp, l.user_name, l.action, l.module, l.entity_type, l.entity_id, l.entity_name,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile('audit-trail.csv', csv, 'text/csv');
  } else {
    downloadFile('audit-trail.json', JSON.stringify(logs, null, 2), 'application/json');
  }
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
