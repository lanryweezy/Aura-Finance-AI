import { supabase } from './supabaseClient';
import { db } from './db';

export type NotificationType = 'payment' | 'approval' | 'overdue' | 'invoice' | 'bill' | 'system' | 'ai_alert';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  created_at: string;
  organization_id: string;
}

const subscribers = new Map<string, Set<(n: Notification) => void>>();

export const notificationService = {
  // Create a notification
  create: async (data: {
    type: NotificationType;
    priority: NotificationPriority;
    title: string;
    message: string;
    actionUrl?: string;
    metadata?: Record<string, any>;
  }): Promise<Notification | null> => {
    const notification: Partial<Notification> = {
      ...data,
      read: false,
      created_at: new Date().toISOString(),
      organization_id: db.getOrgId(),
    };

    if (supabase) {
      const { data: saved, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();
      if (error) return null;
      // Notify subscribers
      const orgSubs = subscribers.get(db.getOrgId());
      if (orgSubs) orgSubs.forEach(cb => cb(saved as Notification));
      return saved as Notification;
    }

    // Local fallback
    const local = { ...notification, id: `notif_${Date.now()}` } as Notification;
    const orgSubs = subscribers.get(db.getOrgId());
    if (orgSubs) orgSubs.forEach(cb => cb(local));
    return local;
  },

  // Fetch notifications
  fetch: async (limit = 50): Promise<Notification[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('organization_id', db.getOrgId())
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data || []) as Notification[];
  },

  // Mark as read
  markRead: async (id: string): Promise<void> => {
    if (supabase) {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
    }
  },

  // Mark all as read
  markAllRead: async (): Promise<void> => {
    if (supabase) {
      await supabase.from('notifications')
        .update({ read: true })
        .eq('organization_id', db.getOrgId())
        .eq('read', false);
    }
  },

  // Delete notification
  delete: async (id: string): Promise<void> => {
    if (supabase) {
      await supabase.from('notifications').delete().eq('id', id);
    }
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    if (!supabase) return 0;
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', db.getOrgId())
      .eq('read', false);
    return count || 0;
  },

  // Subscribe to real-time notifications
  subscribe: (callback: (n: Notification) => void): (() => void) => {
    const orgId = db.getOrgId();
    if (!subscribers.has(orgId)) subscribers.set(orgId, new Set());
    subscribers.get(orgId)!.add(callback);
    return () => subscribers.get(orgId)?.delete(callback);
  },

  // Real-time Supabase subscription
  subscribeRealtime: (callback: (n: Notification) => void) => {
    if (!supabase) return () => {};
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `organization_id=eq.${db.getOrgId()}`,
      }, (payload) => {
        callback(payload.new as Notification);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },

  // Helper: notify on payment
  notifyPayment: async (invoiceId: string, customer: string, amount: number) => {
    return notificationService.create({
      type: 'payment',
      priority: 'high',
      title: 'Payment Received',
      message: `Payment of ₦${amount.toLocaleString()} received from ${customer}`,
      actionUrl: `/receivables`,
      metadata: { invoiceId, customer, amount },
    });
  },

  // Helper: notify on overdue
  notifyOverdue: async (invoiceId: string, customer: string, amount: number, daysOverdue: number) => {
    return notificationService.create({
      type: 'overdue',
      priority: 'critical',
      title: 'Invoice Overdue',
      message: `Invoice to ${customer} for ₦${amount.toLocaleString()} is ${daysOverdue} days overdue`,
      actionUrl: `/receivables`,
      metadata: { invoiceId, customer, amount, daysOverdue },
    });
  },

  // Helper: notify on approval needed
  notifyApprovalNeeded: async (requestId: string, requestedBy: string, amount: number) => {
    return notificationService.create({
      type: 'approval',
      priority: 'medium',
      title: 'Approval Required',
      message: `${requestedBy} requested approval for ₦${amount.toLocaleString()}`,
      actionUrl: `/approvals`,
      metadata: { requestId, requestedBy, amount },
    });
  },

  // Helper: notify on approval resolved
  notifyApprovalResolved: async (requestId: string, status: 'approved' | 'rejected', amount: number) => {
    return notificationService.create({
      type: 'approval',
      priority: status === 'approved' ? 'medium' : 'high',
      title: status === 'approved' ? 'Request Approved' : 'Request Rejected',
      message: `Your request for ₦${amount.toLocaleString()} has been ${status}`,
      actionUrl: `/approvals`,
      metadata: { requestId, status, amount },
    });
  },
};
