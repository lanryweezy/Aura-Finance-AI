
import type { SubscriptionTier } from '../types';
import { monitoringService } from './monitoringService';
import { localDb } from './localDb';

declare const PaystackPop: any;
declare const FlutterwaveCheckout: any;

const STORAGE_KEY = 'subscription_plan';

export const PLANS: SubscriptionTier[] = [
    {
        id: 'Free',
        name: 'Starter',
        price: 0,
        features: [
            'Basic Bookkeeping & Reports',
            'Up to 3 Users',
            '50 Transactions / month',
            '10 Invoices / month',
            '1 Bank Connection',
            'Limited AI Assistant (10 msgs)',
            'OCR Receipt Scanning (3 scans)',
        ]
    },
    {
        id: 'Growth',
        name: 'Growth',
        price: 15000,
        highlighted: true,
        features: [
            'Everything in Starter',
            'Unlimited Users & 5k Txns',
            'Inventory & Stock Control',
            'Payroll (Up to 20 employees)',
            'Tax Filing & Estimations',
            '5 Bank Connections',
            'Pro AI Financial Insights',
            'Project Profitability Tracking',
        ]
    },
    {
        id: 'Enterprise',
        name: 'Enterprise',
        price: 45000,
        features: [
            'Everything in Growth',
            'Multi-entity & Departmental Accounting',
            'Fixed Assets & Depreciation',
            'Full Audit Trail & Compliance',
            'Unlimited AI CFO Brain',
            'Advanced API Access',
            'Priority 24/7 Support',
            'Custom Legal & Tax Compliance',
        ]
    }
];

export const billingService = {
    getPlans: () => PLANS,

    getCurrentPlan: (): string => {
        return localDb.load(STORAGE_KEY, 'Free');
    },

    initializePaystack: (plan: SubscriptionTier, email: string, callback: (ref: string) => void) => {
        if (typeof PaystackPop === 'undefined') {
            monitoringService.trackError('SERVICE', 'PaystackPop is not defined. Ensure the script is loaded.');
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
            monitoringService.trackError('SERVICE', 'FlutterwaveCheckout is not defined. Ensure the script is loaded.');
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

    upgradePlan: async (planId: string): Promise<boolean> => {
        return localDb.simulateRequest(() => {
            localDb.save(STORAGE_KEY, planId);
            const orgStr = localStorage.getItem('aura_org');
            if (orgStr) {
                const org = JSON.parse(orgStr);
                org.plan = planId;
                localStorage.setItem('aura_org', JSON.stringify(org));
            }
            return true;
        }, 1000);
    },

    hasFeature: (plan: string, featureId: string): boolean => {
        const permissions: Record<string, string[]> = {
            'Free': ['dashboard', 'transactions', 'reports', 'receivables', 'payables', 'connections', 'settings', 'chat'],
            'Growth': ['dashboard', 'transactions', 'reports', 'receivables', 'payables', 'connections', 'settings', 'chat', 'inventory', 'payroll', 'taxFiling', 'budgeting', 'projects', 'contacts', 'estimates', 'purchaseOrders'],
            'Enterprise': ['dashboard', 'transactions', 'reports', 'receivables', 'payables', 'connections', 'settings', 'chat', 'inventory', 'payroll', 'taxFiling', 'budgeting', 'projects', 'contacts', 'estimates', 'purchaseOrders', 'multi_entity', 'fixedAssets', 'auditTrail', 'yearEnd']
        };

        return permissions[plan]?.includes(featureId) || false;
    }
};
