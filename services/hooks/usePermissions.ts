
import { useAppStore } from '../../store/useAppStore';
import { teamService } from '../teamService';
import { Permission } from '../../types';

export const usePermissions = () => {
    const { user } = useAppStore();

    const hasPermission = (permission: Permission): boolean => {
        if (!user) return false;

        // Admins have all permissions
        if (user.role === 'Admin') return true;

        // Check system role permissions first
        const systemPermissions = teamService.getSystemRolePermissions(user.role);
        if (systemPermissions.includes(permission)) return true;

        // If it's a custom role, check custom permission sets
        const customRoles = teamService.getCustomRoles();
        const customRole = customRoles.find(r => r.name === user.role);

        if (customRole && customRole.permissions.includes(permission)) {
            return true;
        }

        return false;
    };

    return {
        hasPermission,
        role: user?.role,
        isAdmin: user?.role === 'Admin'
    };
};
