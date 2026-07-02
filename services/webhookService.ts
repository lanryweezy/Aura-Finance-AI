import { supabase } from './supabaseClient';
import { db } from './db';

export interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  lastTriggered?: string;
  failureCount: number;
  entityId?: string;
  organizationId: string;
  createdAt: string;
}

export interface WebhookEvent {
  id: string;
  webhookId: string;
  event: string;
  payload: any;
  status: 'pending' | 'success' | 'failed';
  responseCode?: number;
  error?: string;
  triggeredAt: string;
}

const AVAILABLE_EVENTS = [
  'invoice.created', 'invoice.paid', 'invoice.overdue',
  'bill.created', 'bill.paid',
  'payment.received', 'payment.failed',
  'expense.submitted', 'expense.approved',
  'payroll.completed',
  'employee.added',
  'journal_entry.created',
  'reconciliation.completed',
  'approval.requested', 'approval.approved', 'approval.rejected',
];

export const webhookService = {
  fetch: async (): Promise<WebhookConfig[]> => {
    if (!supabase) return [];
    const { data } = await supabase.from('webhooks')
      .select('*').eq('organization_id', db.getOrgId());
    return (data || []) as WebhookConfig[];
  },

  create: async (url: string, events: string[]): Promise<WebhookConfig> => {
    const secret = `whsec_${Array.from(crypto.getRandomValues(new Uint8Array(24)), b => b.toString(16).padStart(2, '0')).join('')}`;
    if (supabase) {
      const { data } = await supabase.from('webhooks').insert({
        url, events, secret, is_active: true, failure_count: 0,
        organization_id: db.getOrgId(),
      }).select().single();
      return data as WebhookConfig;
    }
    return { id: `wh_${Date.now()}`, url, events, secret, isActive: true, failureCount: 0, organizationId: '', createdAt: new Date().toISOString() } as WebhookConfig;
  },

  delete: async (id: string): Promise<void> => {
    if (supabase) await supabase.from('webhooks').delete().eq('id', id);
  },

  toggle: async (id: string, isActive: boolean): Promise<void> => {
    if (supabase) await supabase.from('webhooks').update({ is_active: isActive }).eq('id', id);
  },

  trigger: async (event: string, payload: any): Promise<void> => {
    const webhooks = await webhookService.fetch();
    const matching = webhooks.filter(w => w.isActive && w.events.includes(event));

    for (const webhook of matching) {
      try {
        const signature = await hmacSign(JSON.stringify(payload), webhook.secret);
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Aura-Signature': signature, 'X-Aura-Event': event },
          body: JSON.stringify({ event, payload, timestamp: new Date().toISOString() }),
          signal: AbortSignal.timeout(10000),
        });

        if (supabase) {
          await supabase.from('webhook_events').insert({
            webhook_id: webhook.id, event, payload: JSON.stringify(payload),
            status: response.ok ? 'success' : 'failed', response_code: response.status,
            organization_id: db.getOrgId(),
          });
          await supabase.from('webhooks').update({ last_triggered: new Date().toISOString(), failure_count: response.ok ? 0 : webhook.failureCount + 1 }).eq('id', webhook.id);
        }
      } catch (error) {
        if (supabase) {
          await supabase.from('webhook_events').insert({
            webhook_id: webhook.id, event, payload: JSON.stringify(payload),
            status: 'failed', error: error instanceof Error ? error.message : 'Unknown error',
            organization_id: db.getOrgId(),
          });
          await supabase.from('webhooks').update({ failure_count: webhook.failureCount + 1 }).eq('id', webhook.id);
        }
      }
    }
  },

  getEvents: async (webhookId?: string): Promise<WebhookEvent[]> => {
    if (!supabase) return [];
    let q = supabase.from('webhook_events').select('*').eq('organization_id', db.getOrgId());
    if (webhookId) q = q.eq('webhook_id', webhookId);
    const { data } = await q.order('triggered_at', { ascending: false }).limit(50);
    return (data || []) as WebhookEvent[];
  },

  getAvailableEvents: () => AVAILABLE_EVENTS,
};

async function hmacSign(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature), b => b.toString(16).padStart(2, '0')).join('');
}
