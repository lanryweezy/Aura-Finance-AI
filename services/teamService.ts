
import { apiClient } from './apiClient';

export type UserRole = 'Owner' | 'Admin' | 'Accountant' | 'Viewer';

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
            return stored ? JSON.parse(stored) : [
                { id: 'tm_1', name: 'Admin User', email: 'admin@company.com', role: 'Admin', status: 'Active', joinedAt: new Date().toISOString() }
            ];
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
    }
};
