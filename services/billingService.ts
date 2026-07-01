import type { SubscriptionTier } from '../types';
import { supabase } from './supabaseClient';
import { authService } from './authService';

declare const PaystackPop: any;
declare const FlutterwaveCheckout: any;

export const PLANS: SubscriptionTier[] = [
  {
    id: 'Free', name: 'Starter', price: 0,
    features: ['Basic Bookkeeping & Reports', 'Up to 3 Users', '50 Transactions / month', '10 Invoices / month', '1 Bank Connection', 'Limited AI Assistant (10 msgs)', 'OCR Receipt Scanning (3 scans)'],
  },
  {
    id: 'Growth', name: 'Growth', price: 15000, highlighted: true,
    features: ['Everything in Starter', 'Unlimited Users & 5k Txns', 'Inventory & Stock Control', 'Payroll (Up to 20 employees)', 'Tax Filing & Estimations', '5 Bank Connections', 'Pro AI Financial Insights', 'Project Profitability Tracking'],
  },
  {
    id: 'Enterprise', name: 'Enterprise', price: 45000,
    features: ['Everything in Growth', 'Multi-entity & Departmental Accounting', 'Fixed Assets & Depreciation', 'Full Audit Trail & Compliance', 'Unlimited AI CFO Brain', 'Advanced API Access', 'Priority 24/7 Support', 'Custom Legal & Tax Compliance'],
  },
];

export const billingService = {
  getPlans: () => PLANS,

  getCurrentPlan: (): string => {
    return authService.getCurrentUser()?.org.plan || 'Free';
  },

  initializePaystack: (plan: SubscriptionTier, email: string, callback: (ref: string) => void) => {
    if (typeof PaystackPop === 'undefined') {
      setTimeout(() => callback('MOCK-PAYSTACK-' + Date.now()), 1000);
      return;
    }
    const handler = PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_KEY || 'pk_test_placeholder',
      email,
      amount: plan.price * 100,
      currency: 'NGN',
      ref: 'AURA-' + Math.floor(Math.random() * 1000000000),
      callback: (response: any) => callback(response.reference),
      onClose: () => {},
    });
    handler.openIframe();
  },

  initializeFlutterwave: (plan: SubscriptionTier, email: string, callback: (ref: string) => void) => {
    if (typeof FlutterwaveCheckout === 'undefined') {
      setTimeout(() => callback('MOCK-FLUTTERWAVE-' + Date.now()), 1000);
      return;
    }
    FlutterwaveCheckout({
      public_key: import.meta.env.VITE_FLW_KEY || 'FLWPUBK_TEST-placeholder',
      tx_ref: 'AURA-' + Math.floor(Math.random() * 1000000000),
      amount: plan.price,
      currency: 'NGN',
      payment_options: 'card, banktransfer, ussd',
      customer: { email, name: 'Aura User' },
      callback: (data: any) => callback(data.transaction_id),
      onclose: () => {},
      customizations: { title: 'Aura Finance AI', description: `Payment for ${plan.name} Plan`, logo: 'https://aura-finance-ai.vercel.app/favicon.svg' },
    });
  },

  upgradePlan: async (planId: string): Promise<boolean> => {
    if (supabase) {
      const orgId = authService.getTenantId();
      const { error } = await supabase.from('organizations').update({ plan: planId }).eq('id', orgId);
      if (error) throw error;
    }
    const org = authService.getCurrentUser()?.org;
    if (org) {
      org.plan = planId as 'Free' | 'Growth' | 'Enterprise';
      localStorage.setItem('aura_org', JSON.stringify(org));
    }
    return true;
  },

  hasFeature: (plan: string, featureId: string): boolean => {
    const permissions: Record<string, string[]> = {
      'Free': ['dashboard', 'transactions', 'reports', 'receivables', 'payables', 'connections', 'settings', 'chat'],
      'Growth': ['dashboard', 'transactions', 'reports', 'receivables', 'payables', 'connections', 'settings', 'chat', 'inventory', 'payroll', 'taxFiling', 'budgeting', 'projects', 'contacts', 'estimates', 'purchaseOrders', 'corporateCards', 'approvals'],
      'Enterprise': ['dashboard', 'transactions', 'reports', 'receivables', 'payables', 'connections', 'settings', 'chat', 'inventory', 'payroll', 'taxFiling', 'budgeting', 'projects', 'contacts', 'estimates', 'purchaseOrders', 'multi_entity', 'fixedAssets', 'auditTrail', 'yearEnd', 'corporateCards', 'approvals'],
    };
    return permissions[plan]?.includes(featureId) || false;
  },
};
