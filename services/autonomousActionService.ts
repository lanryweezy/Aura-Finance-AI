
import { monitoringService } from './monitoringService';
import { auditLogService } from './auditLogService';
import { useAppStore } from '../store/useAppStore';

export interface AutonomousAction {
    id: string;
    timestamp: string;
    type: 'invoice_reminder' | 'payment_schedule' | 'tax_filing' | 'reconciliation' | 'payroll_disbursement';
    description: string;
    status: 'completed' | 'pending' | 'failed' | 'rejected' | 'authorized';
    metadata?: any;
    priority: 'High' | 'Medium' | 'Low';
    reasoning?: string;
}

class AutonomousActionService {
    private actions: AutonomousAction[] = [];

    private generateDescription(type: AutonomousAction['type'], metadata: any): string {
        switch(type) {
            case 'invoice_reminder':
                return `Send automated reminder to customer for Invoice #${metadata.invoiceId}`;
            case 'payment_schedule':
                return `Schedule payment of ${metadata.currency}${metadata.amount} to vendor: ${metadata.vendorName}`;
            case 'tax_filing':
                return `File ${metadata.taxType} for period: ${metadata.period}`;
            case 'reconciliation':
                return `Auto-reconcile ${metadata.count} transactions`;
            case 'payroll_disbursement':
                return `Disburse salaries to ${metadata.employeeCount} employees`;
            default:
                return "Autonomous Action";
        }
    }

    async proposeAction(type: AutonomousAction['type'], metadata: any, reasoning: string, priority: AutonomousAction['priority'] = 'Medium'): Promise<AutonomousAction> {
        const id = Math.random().toString(36).substring(7);
        const action: AutonomousAction = {
            id,
            timestamp: new Date().toISOString(),
            type,
            description: this.generateDescription(type, metadata),
            status: 'pending',
            metadata,
            priority,
            reasoning
        };

        this.actions.unshift(action);
        monitoringService.log('info', 'AUTONOMOUS_ENGINE', `Proposed: ${action.description}`);
        return action;
    }

    async authorizeAction(id: string): Promise<boolean> {
        const action = this.actions.find(a => a.id === id);
        if (!action || action.status !== 'pending') return false;

        action.status = 'authorized';
        monitoringService.log('info', 'AUTONOMOUS_ENGINE', `Authorized: ${action.description}`);

        // Handle Intercompany Logic
        if (action.type === 'tax_filing' && action.metadata?.isIntercompany) {
            // Suggest matching bill in the other entity
            this.proposeAction(
                'payment_schedule',
                { amount: action.metadata.amount, vendorName: 'Group HQ', isIntercompany: true },
                "Matching intercompany bill detected from authorized invoice.",
                "High"
            );
        }

        // Simulate execution delay
        setTimeout(() => {
            action.status = 'completed';
            action.description = action.description.replace('Send', 'Sent').replace('Schedule', 'Scheduled').replace('File', 'Filed').replace('Disburse', 'Disbursed').replace('Auto-reconcile', 'Auto-reconciled');
            auditLogService.add(`AUTONOMOUS_EXECUTION: ${action.description}`, 'User Authorized (AI Executed)', 'AI');
        }, 2000);

        return true;
    }

    async rejectAction(id: string): Promise<boolean> {
        const action = this.actions.find(a => a.id === id);
        if (!action || action.status !== 'pending') return false;
        action.status = 'rejected';
        return true;
    }

    async executeAction(type: AutonomousAction['type'], metadata: any): Promise<AutonomousAction> {
        const id = Math.random().toString(36).substring(7);
        const timestamp = new Date().toISOString();
        const description = this.generateDescription(type, metadata).replace('Send', 'Sent').replace('Schedule', 'Scheduled').replace('File', 'Filed').replace('Disburse', 'Disbursed').replace('Auto-reconcile', 'Auto-reconciled');

        const action: AutonomousAction = {
            id,
            timestamp,
            type,
            description,
            status: 'completed',
            metadata,
            priority: 'Low'
        };

        this.actions.unshift(action);
        auditLogService.add(`AUTONOMOUS_EXECUTION: ${description}`, 'Aura AI Agent', 'AI');
        monitoringService.log('info', 'AUTONOMOUS_ENGINE', `Executed: ${description}`);

        return action;
    }

    getHistory(): AutonomousAction[] {
        return this.actions;
    }
}

export const autonomousActionService = new AutonomousActionService();
