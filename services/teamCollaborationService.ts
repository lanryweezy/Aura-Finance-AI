/**
 * Multi-User Collaboration Service
 * Shared data access (not real-time editing).
 */

import { supabase } from './supabaseClient';
import { db } from './db';

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'accountant' | 'viewer';
  status: 'active' | 'invited' | 'deactivated';
  lastActive?: string;
  createdAt: string;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: string;
  createdAt: string;
}

export const teamCollaborationService = {
  // Get all team members
  getMembers: async (): Promise<TeamMember[]> => {
    if (!supabase) return [];
    const { data } = await supabase.from('team_members')
      .select('*').eq('organization_id', db.getOrgId())
      .order('created_at', { ascending: true });
    return (data || []) as TeamMember[];
  },

  // Invite a team member
  invite: async (email: string, role: string): Promise<TeamInvitation> => {
    const user = JSON.parse(localStorage.getItem('aura_user') || '{}');
    const token = `inv_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    if (supabase) {
      const { data } = await supabase.from('team_invitations').insert({
        email, role, invited_by: user.id, status: 'pending',
        expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
        organization_id: db.getOrgId(),
      }).select().single();
      return data as TeamInvitation;
    }
    return {
      id: token, email, role, invitedBy: user.id, status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    };
  },

  // Accept invitation
  acceptInvitation: async (token: string): Promise<boolean> => {
    if (!supabase) return true;
    const { data: invite } = await supabase.from('team_invitations')
      .select('*').eq('id', token).eq('status', 'pending').single();

    if (!invite) return false;

    // Add to team_members
    const user = JSON.parse(localStorage.getItem('aura_user') || '{}');
    await supabase.from('team_members').insert({
      user_id: user.id, name: user.name, email: invite.email,
      role: invite.role, status: 'active',
      organization_id: db.getOrgId(),
    });

    // Mark invitation as accepted
    await supabase.from('team_invitations').update({ status: 'accepted' }).eq('id', token);
    return true;
  },

  // Remove team member
  removeMember: async (memberId: string): Promise<void> => {
    if (supabase) await supabase.from('team_members').delete().eq('id', memberId);
  },

  // Update member role
  updateRole: async (memberId: string, role: string): Promise<void> => {
    if (supabase) await supabase.from('team_members').update({ role }).eq('id', memberId);
  },

  // Get invitations
  getInvitations: async (): Promise<TeamInvitation[]> => {
    if (!supabase) return [];
    const { data } = await supabase.from('team_invitations')
      .select('*').eq('organization_id', db.getOrgId())
      .order('created_at', { ascending: false });
    return (data || []) as TeamInvitation[];
  },

  // Activity feed
  getRecentActivity: async (limit = 20): Promise<any[]> => {
    if (!supabase) return [];
    const { data } = await supabase.from('audit_logs_v2')
      .select('*').eq('organization_id', db.getOrgId())
      .order('timestamp', { ascending: false }).limit(limit);
    return data || [];
  },

  // Check if user has permission
  hasPermission: async (userId: string, permission: string): Promise<boolean> => {
    const members = await teamCollaborationService.getMembers();
    const member = members.find(m => m.userId === userId);
    if (!member) return false;
    if (member.role === 'owner' || member.role === 'admin') return true;
    return member.role === 'accountant'; // Default permissions
  },
};
