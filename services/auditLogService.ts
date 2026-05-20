
import type { AuditLog } from '../types';

let logs: AuditLog[] = [];

const createLog = (action: string, user: string, module?: string, before?: any, after?: any): AuditLog => ({
    id: `log_${Date.now()}_${Math.random()}`,
    timestamp: new Date().toISOString(),
    user,
    action,
    module,
    before,
    after,
});

export const auditLogService = {
    add: (action: string, user: string, module?: string, before?: any, after?: any) => {
        const newLog = createLog(action, user, module, before, after);
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
auditLogService.add('System Initialized', 'System', 'Core');
