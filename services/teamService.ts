import { db } from './db';

export type UserRole = 'Owner' | 'Admin' | 'Accountant' | 'Viewer' | string;

export interface PermissionSet {
  id: string;
  name: string;
  permissions: string[];
  isCustom: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Pending' | 'Deactivated';
  joinedAt: string;
}

export const teamService = {
  fetchMembers: async (): Promise<TeamMember[]> => {
    return db.query<TeamMember>('team_members');
  },

  inviteMember: async (name: string, email: string, role: UserRole): Promise<TeamMember> => {
    return db.insert<TeamMember>('team_members', {
      name,
      email,
      role,
      status: 'Pending',
      joined_at: new Date().toISOString(),
    });
  },

  removeMember: async (id: string): Promise<void> => {
    await db.remove('team_members', id);
  },

  updateRole: async (id: string, role: UserRole): Promise<TeamMember> => {
    return db.update<TeamMember>('team_members', id, { role });
  },

  fetchCustomRoles: async (): Promise<PermissionSet[]> => {
    return db.query<PermissionSet>('custom_roles');
  },

  saveCustomRole: async (role: Omit<PermissionSet, 'id' | 'isCustom'>): Promise<PermissionSet> => {
    return db.insert<PermissionSet>('custom_roles', { ...role, is_custom: true });
  },

  deleteCustomRole: async (id: string): Promise<void> => {
    await db.remove('custom_roles', id);
  },

  getSystemRolePermissions: (role: string): string[] => {
    const permissions: Record<string, string[]> = {
      'Owner': ['view_dashboard', 'view_transactions', 'view_reports', 'manage_payables', 'manage_receivables', 'manage_payroll', 'manage_inventory', 'manage_contacts', 'manage_accounting', 'manage_settings'],
      'Admin': ['view_dashboard', 'view_transactions', 'view_reports', 'manage_payables', 'manage_receivables', 'manage_payroll', 'manage_inventory', 'manage_contacts', 'manage_accounting', 'manage_settings'],
      'Accountant': ['view_dashboard', 'view_transactions', 'view_reports', 'manage_payables', 'manage_receivables', 'manage_accounting', 'manage_contacts'],
      'Viewer': ['view_dashboard', 'view_transactions', 'view_reports'],
    };
    return permissions[role] || [];
  },
};
