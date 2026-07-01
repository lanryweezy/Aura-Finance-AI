import { supabase } from './supabaseClient';
import { db } from './db';
import type { TaxFiling } from '../types';

const NIGERIAN_TAX_RATES = {
  VAT: 0.075,
  WHT: 0.05,
  CIT: 0.30, // Companies Income Tax
  NHF: 0.025,
  PAYE: { // Progressive rates
    brackets: [
      { min: 0, max: 300000, rate: 0.07 },
      { min: 300000, max: 600000, rate: 0.11 },
      { min: 600000, max: 1100000, rate: 0.15 },
      { min: 1100000, max: 1600000, rate: 0.19 },
      { min: 1600000, max: 3200000, rate: 0.21 },
      { min: 3200000, max: Infinity, rate: 0.24 },
    ],
    consolidationRelief: 200000,
    pensionRelief: 0.08, // 8% of gross, max 50000/month
  },
};

const STATE_CITIES = [
  'Lagos', 'Abuja (FCT)', 'Rivers', 'Kano', 'Oyo', 'Ogun', 'Kaduna', 'Anambra', 'Edo', 'Delta',
];

export const taxFilingService = {
  calculateVAT: (revenue: number, expenses: number): { outputVat: number; inputVat: number; netVat: number } => {
    const outputVat = Math.round(revenue * NIGERIAN_TAX_RATES.VAT);
    const inputVat = Math.round(expenses * NIGERIAN_TAX_RATES.VAT);
    return { outputVat, inputVat, netVat: outputVat - inputVat };
  },

  calculatePAYE: (annualGross: number): { paye: number; netAnnual: number; monthlyNet: number; effectiveRate: number } => {
    let taxableIncome = annualGross - NIGERIAN_TAX_RATES.PAYE.consolidationRelief;
    const pensionRelief = Math.min(annualGross * NIGERIAN_TAX_RATES.PAYE.pensionRelief, 600000);
    taxableIncome -= pensionRelief;
    taxableIncome = Math.max(0, taxableIncome);

    let tax = 0;
    for (const bracket of NIGERIAN_TAX_RATES.PAYE.brackets) {
      if (taxableIncome <= bracket.min) break;
      const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
      tax += taxableInBracket * bracket.rate;
    }

    const netAnnual = annualGross - tax;
    return {
      paye: Math.round(tax),
      netAnnual: Math.round(netAnnual),
      monthlyNet: Math.round(netAnnual / 12),
      effectiveRate: annualGross > 0 ? Math.round((tax / annualGross) * 10000) / 100 : 0,
    };
  },

  calculateWHT: (amount: number, type: 'services' | 'rent' | 'dividends' | 'interest'): number => {
    const rates = { services: 0.05, rent: 0.10, dividends: 0.10, interest: 0.10 };
    return Math.round(amount * (rates[type] || 0.05));
  },

  calculateCIT: (profit: number, isSmallCompany: boolean = false): number => {
    if (isSmallCompany) return Math.round(profit * 0.20); // 20% for small companies
    return Math.round(profit * NIGERIAN_TAX_RATES.CIT);
  },

  generateFiling: async (type: TaxFiling['type'], period: string, data: any): Promise<TaxFiling> => {
    let taxAmount = 0;
    let taxableAmount = 0;
    let taxRate = 0;

    switch (type) {
      case 'VAT': {
        const vat = taxFilingService.calculateVAT(data.revenue, data.expenses);
        taxAmount = vat.netVat;
        taxableAmount = data.revenue;
        taxRate = 7.5;
        break;
      }
      case 'PAYE': {
        const paye = taxFilingService.calculatePAYE(data.annualGross);
        taxAmount = paye.paye;
        taxableAmount = data.annualGross;
        taxRate = paye.effectiveRate;
        break;
      }
      case 'WHT': {
        taxAmount = taxFilingService.calculateWHT(data.amount, data.whtType || 'services');
        taxableAmount = data.amount;
        taxRate = 5;
        break;
      }
      case 'CIT': {
        taxAmount = taxFilingService.calculateCIT(data.profit, data.isSmallCompany);
        taxableAmount = data.profit;
        taxRate = data.isSmallCompany ? 20 : 30;
        break;
      }
      case 'NHF': {
        taxAmount = Math.round(data.annualGross * NIGERIAN_TAX_RATES.NHF);
        taxableAmount = data.annualGross;
        taxRate = 2.5;
        break;
      }
    }

    const filing: Omit<TaxFiling, 'id'> = {
      type, period, jurisdiction: data.jurisdiction || 'Federal',
      totalRevenue: data.revenue || 0, totalExpenses: data.expenses || 0,
      taxableAmount, taxRate, taxAmount, status: 'draft',
      dueDate: data.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      entityId: data.entityId,
    };

    if (supabase) {
      const { data: saved } = await supabase.from('tax_filings').insert({
        ...filing, organization_id: db.getOrgId(),
      }).select().single();
      return saved as TaxFiling;
    }
    return { ...filing, id: `tax_${Date.now()}` } as TaxFiling;
  },

  fetchFilings: async (): Promise<TaxFiling[]> => {
    if (!supabase) return [];
    const { data } = await supabase.from('tax_filings')
      .select('*').eq('organization_id', db.getOrgId())
      .order('created_at', { ascending: false });
    return (data || []) as TaxFiling[];
  },

  getStateTaxes: () => STATE_CITIES,
  getTaxRates: () => NIGERIAN_TAX_RATES,
};
