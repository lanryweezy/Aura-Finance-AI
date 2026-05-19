
import { CategorizedTransaction, Bill } from '../types';

export interface ProcurementInsight {
    vendorName: string;
    category: string;
    currentSpend: number;
    marketBenchmark: number;
    potentialSaving: number;
    recommendation: string;
}

class ProcureService {
    private BENCHMARKS: Record<string, number> = {
        'Fuel & Diesel': 850, // Per Liter
        'Cloud Infrastructure': 50000, // Monthly avg for SMEs
        'Logistics': 2500, // Per delivery avg
        'Office Supplies': 15000, // Monthly
    };

    analyzeSpend(transactions: CategorizedTransaction[], bills: Bill[]): ProcurementInsight[] {
        const insights: ProcurementInsight[] = [];

        // 1. Analyze Fuel Spend (Strategic for Nigeria)
        const fuelTx = transactions.filter(t => t.category === 'Fuel & Diesel' || t.narration.toLowerCase().includes('diesel'));
        const totalFuel = fuelTx.reduce((sum, t) => sum + t.amount, 0);

        if (totalFuel > 200000) { // Large fuel consumer
            insights.push({
                vendorName: fuelTx[0]?.narration.split(' ')[0] || 'Fuel Vendor',
                category: 'Fuel & Diesel',
                currentSpend: totalFuel,
                marketBenchmark: totalFuel * 0.85, // Suggest 15% saving via bulk purchase
                potentialSaving: totalFuel * 0.15,
                recommendation: `High diesel spend detected. Switch to bulk procurement via a corporate account to save ₦${Math.round(totalFuel * 0.15)} monthly.`
            });
        }

        // 2. SaaS/Subscription Check
        const softwareSpend = transactions.filter(t => t.category === 'Software & Subscriptions').reduce((s, t) => s + t.amount, 0);
        if (softwareSpend > 100000) {
            insights.push({
                vendorName: 'Various Software',
                category: 'Software & Subscriptions',
                currentSpend: softwareSpend,
                marketBenchmark: softwareSpend * 0.9,
                potentialSaving: softwareSpend * 0.1,
                recommendation: "Consolidate duplicate subscriptions. Multiple overlapping tools detected in the cloud infrastructure category."
            });
        }

        return insights;
    }
}

export const procureService = new ProcureService();
