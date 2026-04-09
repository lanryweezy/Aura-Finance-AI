
import type { SubscriptionTier } from '../types';

declare const PaystackPop: any;
declare const FlutterwaveCheckout: any;

const STORAGE_KEY = 'aura_subscription_plan';

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

    getCurrentPlan: (): string => {
        return localStorage.getItem(STORAGE_KEY) || 'Free';
    },

    initializePaystack: (plan: SubscriptionTier, email: string, callback: (ref: string) => void) => {
        if (typeof PaystackPop === 'undefined') {
            console.error('PaystackPop is not defined. Ensure the script is loaded.');
            // Mock success for development if script is missing
            setTimeout(() => callback('MOCK-PAYSTACK-' + Date.now()), 1000);
            return;
        }
        const handler = PaystackPop.setup({
            key: 'pk_test_placeholder',
            email: email,
            amount: plan.price * 100,
            currency: 'NGN',
            ref: 'AURA-' + Math.floor((Math.random() * 1000000000) + 1),
            callback: function(response: any) {
                callback(response.reference);
            },
            onClose: function() {
                monitoringService.log('info', 'BILLING', 'Paystack window closed');
            }
        });
        handler.openIframe();
    },

    initializeFlutterwave: (plan: SubscriptionTier, email: string, callback: (ref: string) => void) => {
        if (typeof FlutterwaveCheckout === 'undefined') {
            console.error('FlutterwaveCheckout is not defined. Ensure the script is loaded.');
            // Mock success for development if script is missing
            setTimeout(() => callback('MOCK-FLUTTERWAVE-' + Date.now()), 1000);
            return;
        }
        FlutterwaveCheckout({
            public_key: 'FLWPUBK_TEST-placeholder',
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
                monitoringService.log('info', 'BILLING', 'Flutterwave window closed');
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
                localStorage.setItem(STORAGE_KEY, planId);
                const orgStr = localStorage.getItem('aura_org');
                if (orgStr) {
                    const org = JSON.parse(orgStr);
                    org.plan = planId;
                    localStorage.setItem('aura_org', JSON.stringify(org));
                }
                resolve(true);
            }, 1000);
        });
    }
};
