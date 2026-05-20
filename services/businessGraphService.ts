
import { CategorizedTransaction, Bill, Invoice, Employee } from '../types';

export interface BusinessNode {
    id: string;
    label: string;
    type: 'Vendor' | 'Customer' | 'Employee' | 'Bank';
    totalVolume: number;
    transactionCount: number;
    lastActive: string;
}

export interface BusinessEdge {
    source: string;
    target: string;
    value: number;
    relationship: 'Payment' | 'Salary' | 'Invoice' | 'Collection';
}

class BusinessGraphService {
    generateGraph(
        transactions: CategorizedTransaction[],
        bills: Bill[],
        invoices: Invoice[],
        employees: Employee[]
    ) {
        const nodes: Map<string, BusinessNode> = new Map();
        const edges: BusinessEdge[] = [];

        // Process Transactions (Payments to Vendors / Receipts from Customers)
        transactions.forEach(t => {
            const nodeName = t.narration.split(' ')[0] || 'Unknown'; // Simplified node naming
            const type: BusinessNode['type'] = t.type === 'credit' ? 'Customer' : 'Vendor';

            const existing = nodes.get(nodeName);
            if (existing) {
                existing.totalVolume += t.amount;
                existing.transactionCount += 1;
                if (new Date(t.date) > new Date(existing.lastActive)) existing.lastActive = t.date;
            } else {
                nodes.set(nodeName, {
                    id: nodeName,
                    label: nodeName,
                    type,
                    totalVolume: t.amount,
                    transactionCount: 1,
                    lastActive: t.date
                });
            }
        });

        // Detect high-dependency relationships (Economic Intelligence)
        const totalOutflow = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
        const dependencyAlerts = Array.from(nodes.values())
            .filter(n => n.type === 'Vendor' && (n.totalVolume / totalOutflow) > 0.4)
            .map(n => `High dependency alert: ${Math.round((n.totalVolume / totalOutflow) * 100)}% of expenses go to ${n.label}.`);

        return {
            nodes: Array.from(nodes.values()),
            dependencyAlerts
        };
    }
}

export const businessGraphService = new BusinessGraphService();
