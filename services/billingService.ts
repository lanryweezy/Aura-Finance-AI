
import type { SubscriptionTier } from '../types';

declare const PaystackPop: any;
declare const FlutterwaveCheckout: any;

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

    initializePaystack: (plan: SubscriptionTier, email: string, callback: (ref: string) => void) => {
        const handler = PaystackPop.setup({
            key: 'pk_test_placeholder', // Should be in env
            email: email,
            amount: plan.price * 100, // Amount in kobo
            currency: 'NGN',
            ref: 'AURA-' + Math.floor((Math.random() * 1000000000) + 1),
            callback: function(response: any) {
                callback(response.reference);
            },
            onClose: function() {
                console.log('Window closed.');
            }
        });
        handler.openIframe();
    },

    initializeFlutterwave: (plan: SubscriptionTier, email: string, callback: (ref: string) => void) => {
        FlutterwaveCheckout({
            public_key: 'FLWPUBK_TEST-placeholder', // Should be in env
            tx_ref: 'AURA-' + Math.floor((Math.random() * 1000000000) + 1),
            amount: plan.price,
            currency: 'NGN',
            payment_options: 'card, banktransfer, ussd',
            customer: {
                email: email,
                name: "Aura User",
            },
            callback: function (data: any) {
                callback(data.transaction_id);
            },
            onclose: function() {
                console.log('Window closed.');
            },
            customizations: {
                title: "Aura Finance AI",
                description: `Payment for ${plan.name} Plan`,
                logo: "https://aura-finance-ai.vercel.app/favicon.svg",
            },
        });
    },

    upgradePlan: (planId: string): Promise<boolean> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, 1500);
        });
    }
};
