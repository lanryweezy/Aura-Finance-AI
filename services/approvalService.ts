import { supabase } from './supabaseClient';
import { db } from './db';
import { monitoringService } from './monitoringService';
import type { ApprovalRequest, ApprovalPolicy, ApprovalStatus } from '../types';

export const approvalService = {
  fetchPolicies: async (): Promise<ApprovalPolicy[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('approval_policies')
      .select('*')
      .eq('organization_id', db.getOrgId());
    if (error) return [];
    return (data || []).map(p => ({
      ...p,
      levels: p.levels || [],
    })) as ApprovalPolicy[];
  },

  createPolicy: async (policy: Omit<ApprovalPolicy, 'id' | 'organizationId'>): Promise<ApprovalPolicy> => {
    if (!supabase) return { ...policy, id: `pol_${Date.now()}`, organizationId: '' } as ApprovalPolicy;
    const { data, error } = await supabase
      .from('approval_policies')
      .insert({
        name: policy.name,
        entity_type: policy.entityType,
        min_amount: policy.minAmount,
        max_amount: policy.maxAmount,
        levels: JSON.stringify(policy.levels),
        is_active: policy.isActive,
        organization_id: db.getOrgId(),
      })
      .select()
      .single();
    if (error) throw error;
    return { ...data, levels: data.levels || [] } as ApprovalPolicy;
  },

  deletePolicy: async (id: string): Promise<void> => {
    if (!supabase) return;
    await supabase.from('approval_policies').delete().eq('id', id);
  },

  fetchRequests: async (status?: ApprovalStatus): Promise<ApprovalRequest[]> => {
    if (!supabase) return [];
    let q = supabase.from('approval_requests').select('*').eq('organization_id', db.getOrgId());
    if (status) q = q.eq('status', status);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) return [];
    return (data || []).map(r => ({
      ...r,
      approvals: r.approvals || [],
    })) as ApprovalRequest[];
  },

  submitForApproval: async (
    entityType: string,
    entityId: string,
    amount: number,
    description: string,
    requestedBy: string,
    requestedByName: string
  ): Promise<ApprovalRequest | null> => {
    if (!supabase) return null;

    // Find applicable policy
    const { data: policies } = await supabase
      .from('approval_policies')
      .select('*')
      .eq('organization_id', db.getOrgId())
      .eq('entity_type', entityType)
      .eq('is_active', true);

    if (!policies || policies.length === 0) return null; // No policy = no approval needed

    const policy = policies.find(p => amount >= p.min_amount && (!p.max_amount || amount <= p.max_amount));
    if (!policy) return null;

    const levels = policy.levels || [];
    const approvals = levels.map((l: any) => ({
      level: l.level,
      approverId: l.approverId || '',
      approverName: l.approverName || l.approverRole || 'Approver',
      status: 'pending' as const,
    }));

    const request: Partial<ApprovalRequest> = {
      entityType: entityType as any,
      entityId,
      requestedBy,
      requestedByName,
      amount,
      description,
      status: 'pending',
      currentLevel: 1,
      totalLevels: levels.length,
      approvals,
      createdAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('approval_requests')
      .insert({
        ...request,
        approvals: JSON.stringify(approvals),
        organization_id: db.getOrgId(),
      })
      .select()
      .single();

    if (error) { monitoringService.trackError('APPROVAL', error.message); return null; }
    return { ...data, approvals: data.approvals || [] } as ApprovalRequest;
  },

  approve: async (requestId: string, approverId: string, approverName: string, comment?: string): Promise<ApprovalRequest | null> => {
    if (!supabase) return null;

    const { data: request } = await supabase
      .from('approval_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (!request) return null;

    const approvals = request.approvals || [];
    const currentStep = approvals.find((a: any) => a.status === 'pending');
    if (!currentStep || currentStep.approverId !== approverId) return null;

    currentStep.status = 'approved';
    currentStep.comment = comment;
    currentStep.actedAt = new Date().toISOString();

    const allApproved = approvals.every((a: any) => a.status === 'approved');
    const newStatus = allApproved ? 'approved' : 'pending';
    const currentLevel = allApproved ? request.total_levels : request.current_level + 1;

    await supabase
      .from('approval_requests')
      .update({
        approvals: JSON.stringify(approvals),
        status: newStatus,
        current_level: currentLevel,
        resolved_at: allApproved ? new Date().toISOString() : null,
      })
      .eq('id', requestId);

    monitoringService.log('info', 'APPROVAL', `Request ${requestId} approved by ${approverName}`);
    return { ...request, approvals, status: newStatus as any, currentLevel } as ApprovalRequest;
  },

  reject: async (requestId: string, approverId: string, approverName: string, comment?: string): Promise<ApprovalRequest | null> => {
    if (!supabase) return null;

    const { data: request } = await supabase
      .from('approval_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (!request) return null;

    const approvals = request.approvals || [];
    const currentStep = approvals.find((a: any) => a.status === 'pending');
    if (!currentStep || currentStep.approverId !== approverId) return null;

    currentStep.status = 'rejected';
    currentStep.comment = comment;
    currentStep.actedAt = new Date().toISOString();

    await supabase
      .from('approval_requests')
      .update({
        approvals: JSON.stringify(approvals),
        status: 'rejected',
        resolved_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    monitoringService.log('warn', 'APPROVAL', `Request ${requestId} rejected by ${approverName}`);
    return { ...request, approvals, status: 'rejected' } as ApprovalRequest;
  },

  getPendingCount: async (): Promise<number> => {
    if (!supabase) return 0;
    const { count } = await supabase
      .from('approval_requests')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', db.getOrgId())
      .eq('status', 'pending');
    return count || 0;
  },
};
