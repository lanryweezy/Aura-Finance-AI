import React from 'react';

export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  headerStyle: string;
  accentColor: string;
  layout: 'modern' | 'classic' | 'minimal';
}

export const INVOICE_TEMPLATES: InvoiceTemplate[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, gradient accents, rounded corners',
    headerStyle: 'gradient',
    accentColor: 'from-brand-cyan to-brand-purple',
    layout: 'modern',
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional, professional, serif fonts',
    headerStyle: 'solid',
    accentColor: 'bg-gray-900',
    layout: 'classic',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple, lots of whitespace, sans-serif',
    headerStyle: 'minimal',
    accentColor: 'border-b-2 border-gray-900',
    layout: 'minimal',
  },
];

export const EMAIL_TEMPLATES = [
  { id: 'formal', name: 'Formal', description: 'Professional business tone' },
  { id: 'casual', name: 'Casual', description: 'Friendly and relaxed' },
  { id: 'followup', name: 'Follow-up', description: 'Polite reminder' },
  { id: 'overdue', name: 'Overdue', description: 'Urgent payment request' },
] as const;

export const EXPENSE_CATEGORIES = [
  'Office Supplies', 'Travel', 'Meals & Entertainment', 'Software & Subscriptions',
  'Marketing & Advertising', 'Utilities', 'Professional Fees', 'Legal Fees',
  'Insurance', 'Repairs & Maintenance', 'Hardware', 'Rent & Leases',
  'Bank Charges', 'Cost of Sales', 'Taxes', 'Miscellaneous',
];

export const NIGERIAN_BANKS = [
  'Access Bank', 'Citibank Nigeria', 'Ecobank Nigeria', 'Fidelity Bank',
  'First Bank of Nigeria', 'FCMB', 'GTBank', 'Heritage Bank',
  'Keystone Bank', 'Kuda Bank', 'Opay', 'Polaris Bank',
  'Providus Bank', 'Stanbic IBTC', 'Standard Chartered', 'Sterling Bank',
  'SunTrust Bank', 'Titan Trust Bank', 'Union Bank', 'Unity Bank',
  'VFD Microfinance', 'Wema Bank', 'Zenith Bank',
];

export const NGN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
  'Kogi', 'Kwara', 'Lagos', 'Nassarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

export const PAYMENT_GATEWAYS = [
  { id: 'paystack', name: 'Paystack', icon: '💳' },
  { id: 'flutterwave', name: 'Flutterwave', icon: '🌊' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦' },
] as const;
