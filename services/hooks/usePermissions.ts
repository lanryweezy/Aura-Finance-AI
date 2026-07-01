import { useAppStore } from '../../store/useAppStore';
import { teamService } from '../teamService';

export type Permission = string;

export const usePermissions = () => {
  const { user } = useAppStore();

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    if (user.role === 'Admin' || user.role === 'Owner') return true;

    const systemPermissions = teamService.getSystemRolePermissions(user.role);
    if (systemPermissions.includes(permission)) return true;

    return false;
  };

  return {
    hasPermission,
    role: user?.role,
    isAdmin: user?.role === 'Admin' || user?.role === 'Owner',
  };
};
