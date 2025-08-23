
import type { AuditLog } from '../types';

let logs: AuditLog[] = [];

const createLog = (action: string, user: string): AuditLog => ({
    id: `log_${Date.now()}_${Math.random()}`,
    timestamp: new Date().toISOString(),
    user,
    action,
});

export const auditLogService = {
    add: (action: string, user: string) => {
        const newLog = createLog(action, user);
        logs = [newLog, ...logs];
        return newLog;
    },
    getLogs: (): AuditLog[] => {
        return [...logs];
    },
    clear: () => {
        logs = [];
    }
};

// Initialize with a starting log
auditLogService.add('System Initialized', 'System');
