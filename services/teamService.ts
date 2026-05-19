
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
        try {
            return await apiClient.get('/team');
        } catch {
            // Local fallback
            const stored = localStorage.getItem('aura_team_dev');
            try {
                return stored ? JSON.parse(stored) : [
                    { id: 'tm_1', name: 'Admin User', email: 'admin@company.com', role: 'Admin', status: 'Active', joinedAt: new Date().toISOString() }
                ];
            } catch (parseErr) {
                console.warn("Failed to parse local storage fallback", parseErr);
                return [
                    { id: 'tm_1', name: 'Admin User', email: 'admin@company.com', role: 'Admin', status: 'Active', joinedAt: new Date().toISOString() }
                ];
            }
        }
    },

    inviteMember: async (name: string, email: string, role: UserRole): Promise<TeamMember> => {
        return await apiClient.post('/team/invite', { name, email, role });
    },

    removeMember: async (id: string): Promise<void> => {
        await apiClient.delete(`/team/${id}`);
    },

    updateRole: async (id: string, role: UserRole): Promise<TeamMember> => {
        return await apiClient.put(`/team/${id}/role`, { role });
    },

    fetchCustomRoles: async (): Promise<PermissionSet[]> => {
        try {
            return await apiClient.get('/team/roles');
        } catch {
            const stored = localStorage.getItem('aura_custom_roles');
            return stored ? JSON.parse(stored) : [];
        }
    },

    saveCustomRole: async (role: Omit<PermissionSet, 'id' | 'isCustom'>): Promise<PermissionSet> => {
        try {
            return await apiClient.post('/team/roles', role);
        } catch {
            const roles = await teamService.fetchCustomRoles();
            const newRole = { ...role, id: `role_${Date.now()}`, isCustom: true };
            localStorage.setItem('aura_custom_roles', JSON.stringify([...roles, newRole]));
            return newRole;
        }
    },

    deleteCustomRole: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/team/roles/${id}`);
        } catch {
            const roles = await teamService.fetchCustomRoles();
            localStorage.setItem('aura_custom_roles', JSON.stringify(roles.filter(r => r.id !== id)));
        }
    }
};
