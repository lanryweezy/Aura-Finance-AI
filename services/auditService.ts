
import { CategorizedTransaction, Bill, Invoice } from '../types';
import { monitoringService } from './monitoringService';

export interface AuditRisk {
    id: string;
    type: 'Duplicate' | 'Inconsistency' | 'Misclassification';
    severity: 'High' | 'Medium' | 'Low';
    description: string;
    affectedIds: string[];
}

class AuditService {
    detectRisks(
        transactions: CategorizedTransaction[],
        bills: Bill[],
        invoices: Invoice[]
    ): AuditRisk[] {
        const risks: AuditRisk[] = [];

        // 1. Detect Duplicate Transactions (Same amount and similar narration within 48 hours)
        const sortedTx = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        for (let i = 0; i < sortedTx.length; i++) {
            for (let j = i + 1; j < Math.min(i + 5, sortedTx.length); j++) {
                const t1 = sortedTx[i];
                const t2 = sortedTx[j];

                const timeDiff = Math.abs(new Date(t1.date).getTime() - new Date(t2.date).getTime());
                const hoursDiff = timeDiff / (1000 * 3600);

                if (t1.amount === t2.amount && hoursDiff < 48) {
                    // Check if narrations are similar (simplified)
                    const n1 = t1.narration.toLowerCase();
                    const n2 = t2.narration.toLowerCase();
                    if (n1 === n2 || n1.includes(n2.substring(0, 5)) || n2.includes(n1.substring(0, 5))) {
                        risks.push({
                            id: `risk_${t1.id}_${t2.id}`,
                            type: 'Duplicate',
                            severity: 'High',
                            description: `Potential duplicate transaction detected: ${t1.amount} for "${t1.narration}".`,
                            affectedIds: [t1.id, t2.id]
                        });
                    }
                }
            }
        }

        // 2. Detect Inconsistent Categorization for same vendor
        const vendorCategories: Record<string, Set<string>> = {};
        transactions.forEach(t => {
            const vendor = t.narration.split(' ')[0] || 'Unknown';
            if (!vendorCategories[vendor]) vendorCategories[vendor] = new Set();
            vendorCategories[vendor].add(t.category);
        });

        Object.entries(vendorCategories).forEach(([vendor, categories]) => {
            if (categories.size > 1 && vendor !== 'Unknown') {
                risks.push({
                    id: `risk_cat_${vendor}`,
                    type: 'Misclassification',
                    severity: 'Medium',
                    description: `Inconsistent categorization for ${vendor}: Used ${Array.from(categories).join(', ')}.`,
                    affectedIds: transactions.filter(t => t.narration.startsWith(vendor)).map(t => t.id)
                });
            }
        });

        monitoringService.log('info', 'AUDIT_ENGINE', `Audit complete. Found ${risks.length} risks.`);
        return risks;
    }
}

export const auditService = new AuditService();
