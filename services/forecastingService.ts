
import { CategorizedTransaction, Invoice, Bill, PayrollRun } from '../types';

export interface ForecastingResult {
    predictedRunwayDays: number;
    monthlyBurnRate: number;
    predictedRevenueNextMonth: number;
    riskLevel: 'Low' | 'Medium' | 'High';
    recommendations: string[];
}

export const forecastingService = {
    calculateForecast: (
        transactions: CategorizedTransaction[],
        bills: Bill[],
        invoices: Invoice[],
        payroll: PayrollRun[]
    ): ForecastingResult => {
        // 1. Calculate Monthly Burn Rate (Average of last 3 months expenses)
        const now = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);

        const recentExpenses = transactions
            .filter(t => t.type === 'debit' && new Date(t.date) >= threeMonthsAgo)
            .reduce((sum, t) => sum + t.amount, 0);

        const monthlyBurnRate = recentExpenses / 3 || 1; // Avoid division by zero

        // 2. Current Cash Balance (Simplified sum of last balances or mock)
        const currentCash = transactions.length > 0 ? (transactions[0].balance || 5000000) : 5000000;

        // 3. Predicted Runway
        const predictedRunwayDays = Math.round((currentCash / (monthlyBurnRate / 30)));

        // 4. Predicted Revenue (Average of last 3 months income + pending invoices)
        const recentIncome = transactions
            .filter(t => t.type === 'credit' && new Date(t.date) >= threeMonthsAgo)
            .reduce((sum, t) => sum + t.amount, 0);

        const avgMonthlyIncome = recentIncome / 3;
        const pendingInvoicesTotal = invoices
            .filter(i => i.status !== 'Paid')
            .reduce((sum, i) => sum + i.total, 0);

        // Simple prediction: avg income + 70% of pending invoices
        const predictedRevenueNextMonth = avgMonthlyIncome + (pendingInvoicesTotal * 0.7);

        // 5. Risk Level & Recommendations
        let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
        const recommendations: string[] = [];

        if (predictedRunwayDays < 30) {
            riskLevel = 'High';
            recommendations.push("Critical: Cash runway is less than 30 days. Prioritize invoice collection.");
        } else if (predictedRunwayDays < 90) {
            riskLevel = 'Medium';
            recommendations.push("Warning: Runway is below 90 days. Review non-essential expenses.");
        }

        if (pendingInvoicesTotal > avgMonthlyIncome) {
            recommendations.push("High volume of pending receivables. Consider automated reminders.");
        }

        const upcomingBills = bills.filter(b => b.status === 'Unpaid').reduce((sum, b) => sum + b.amount, 0);
        if (upcomingBills > currentCash) {
            riskLevel = 'High';
            recommendations.push("Upcoming bills exceed current cash balance.");
        }

        return {
            predictedRunwayDays,
            monthlyBurnRate,
            predictedRevenueNextMonth,
            riskLevel,
            recommendations
        };
    }
};
