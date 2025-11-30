
import type { SubscriptionTier } from '../types';

export const PLANS: SubscriptionTier[] = [
    {
        id: 'Free',
        name: 'Starter',
        price: 0,
        features: [
            'Up to 3 Users',
            '50 Transactions / mo',
            'Basic Invoicing',
            'Bank Connections (1 Bank)',
        ]
    },
    {
        id: 'Growth',
        name: 'Growth',
        price: 15000,
        highlighted: true,
        features: [
            'Unlimited Users',
            'Unlimited Transactions',
            'AI Insights & Chat',
            'Payroll (Up to 10 employees)',
            'Inventory Management',
            'Priority Support'
        ]
    },
    {
        id: 'Enterprise',
        name: 'Enterprise',
        price: 45000,
        features: [
            'Advanced AI CFO',
            'Multi-entity Support',
            'Custom API Integrations',
            'Dedicated Account Manager',
            'Audit Trail & Compliance',
            'Unlimited Payroll'
        ]
    }
];

export const billingService = {
    getPlans: () => PLANS,
    upgradePlan: (planId: string): Promise<boolean> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // In a real app, this would trigger a payment gateway (Paystack/Flutterwave)
                resolve(true);
            }, 1500);
        });
    }
};
