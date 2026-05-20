
import { apiClient } from './apiClient';

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
        return await apiClient.get('/team');
    },

    inviteMember: async (name: string, email: string, role: UserRole): Promise<TeamMember> => {
        return await apiClient.post('/team', { name, email, role, status: 'Pending', joinedAt: new Date().toISOString() });
    },

    removeMember: async (id: string): Promise<void> => {
        await apiClient.delete(`/team/${id}`);
    },

    updateRole: async (id: string, role: UserRole): Promise<TeamMember> => {
        const members = await teamService.fetchMembers();
        const member = members.find(m => m.id === id);
        if (member) {
            return await apiClient.put(`/team/${id}`, { ...member, role });
        }
        throw new Error("Member not found");
    },

    fetchCustomRoles: async (): Promise<PermissionSet[]> => {
        return await apiClient.get('/custom_roles');
    },

    saveCustomRole: async (role: Omit<PermissionSet, 'id' | 'isCustom'>): Promise<PermissionSet> => {
        return await apiClient.post('/custom_roles', { ...role, isCustom: true });
    },

    deleteCustomRole: async (id: string): Promise<void> => {
        await apiClient.delete(`/custom_roles/${id}`);
    },

    getSystemRolePermissions: (role: string): string[] => {
        const permissions: Record<string, string[]> = {
            'Owner': ['view_dashboard', 'view_transactions', 'view_reports', 'manage_payables', 'manage_receivables', 'manage_payroll', 'manage_inventory', 'manage_contacts', 'manage_accounting', 'manage_settings'],
            'Admin': ['view_dashboard', 'view_transactions', 'view_reports', 'manage_payables', 'manage_receivables', 'manage_payroll', 'manage_inventory', 'manage_contacts', 'manage_accounting', 'manage_settings'],
            'Accountant': ['view_dashboard', 'view_transactions', 'view_reports', 'manage_payables', 'manage_receivables', 'manage_accounting', 'manage_contacts'],
            'Viewer': ['view_dashboard', 'view_transactions', 'view_reports']
        };
        return permissions[role] || [];
    }
};
