
import { BankConnection, CategorizedTransaction } from '../types';
import { monitoringService } from './monitoringService';

export interface TreasuryInsight {
    accountId: string;
    accountName: string;
    balance: number;
    health: 'Good' | 'Low' | 'Critical';
    recommendation?: string;
}

class TreasuryService {
    analyzeLiquidity(connections: BankConnection[], transactions: CategorizedTransaction[]): TreasuryInsight[] {
        return connections.map(conn => {
            // In a real app, balance would come from the connection state
            // For simulation, we'll use a deterministic mock based on account number
            const baseBalance = parseInt(conn.accountNumber.slice(-5)) * 100;
            const txVolume = transactions
                .filter(t => t.narration.includes(conn.bankName)) // Mock association
                .reduce((acc, t) => acc + (t.type === 'credit' ? t.amount : -t.amount), 0);

            const currentBalance = baseBalance + txVolume;

            let health: TreasuryInsight['health'] = 'Good';
            let recommendation: string | undefined;

            if (currentBalance < 50000) {
                health = 'Critical';
                recommendation = "Balance is critically low. Consider transferring funds from secondary account to avoid missed payments.";
            } else if (currentBalance < 200000) {
                health = 'Low';
                recommendation = "Liquidity is thinning. Monitor upcoming payroll obligations.";
            }

            return {
                accountId: conn.id,
                accountName: `${conn.bankName} (****${conn.accountNumber.slice(-4)})`,
                balance: currentBalance,
                health,
                recommendation
            };
        });
    }

    getSweepOpportunities(insights: TreasuryInsight[]): { from: string, to: string, amount: number, reasoning: string }[] {
        const critical = insights.find(i => i.health === 'Critical');
        const healthy = insights.find(i => i.health === 'Good' && i.balance > 500000);

        if (critical && healthy) {
            return [{
                from: healthy.accountName,
                to: critical.accountName,
                amount: 250000,
                reasoning: `Automatic liquidity sweep: Moving funds from high-yield ${healthy.accountName} to cover critical deficit in ${critical.accountName}.`
            }];
        }

        return [];
    }
}

export const treasuryService = new TreasuryService();
