/**
 * Nigerian Multi-State PAYE Calculator
 * Each state has its own tax table with different brackets.
 */

interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

interface StateTaxConfig {
  name: string;
  code: string;
  brackets: TaxBracket[];
  consolidationRelief: number;
  pensionReliefRate: number;
  pensionReliefMax: number;
}

const STATE_TAX_CONFIGS: Record<string, StateTaxConfig> = {
  'Lagos': {
    name: 'Lagos', code: 'LA',
    brackets: [
      { min: 0, max: 300000, rate: 0.07 },
      { min: 300000, max: 600000, rate: 0.11 },
      { min: 600000, max: 1100000, rate: 0.15 },
      { min: 1100000, max: 1600000, rate: 0.19 },
      { min: 1600000, max: 3200000, rate: 0.21 },
      { min: 3200000, max: Infinity, rate: 0.24 },
    ],
    consolidationRelief: 200000,
    pensionReliefRate: 0.08,
    pensionReliefMax: 50000,
  },
  'Abuja': {
    name: 'Abuja (FCT)', code: 'FC',
    brackets: [
      { min: 0, max: 300000, rate: 0.07 },
      { min: 300000, max: 600000, rate: 0.11 },
      { min: 600000, max: 1100000, rate: 0.15 },
      { min: 1100000, max: 1600000, rate: 0.19 },
      { min: 1600000, max: 3200000, rate: 0.21 },
      { min: 3200000, max: Infinity, rate: 0.24 },
    ],
    consolidationRelief: 200000,
    pensionReliefRate: 0.08,
    pensionReliefMax: 50000,
  },
  'Rivers': {
    name: 'Rivers', code: 'RV',
    brackets: [
      { min: 0, max: 300000, rate: 0.07 },
      { min: 300000, max: 600000, rate: 0.11 },
      { min: 600000, max: 1100000, rate: 0.15 },
      { min: 1100000, max: 1600000, rate: 0.19 },
      { min: 1600000, max: 3200000, rate: 0.21 },
      { min: 3200000, max: Infinity, rate: 0.24 },
    ],
    consolidationRelief: 200000,
    pensionReliefRate: 0.08,
    pensionReliefMax: 50000,
  },
  'Kano': {
    name: 'Kano', code: 'KN',
    brackets: [
      { min: 0, max: 300000, rate: 0.07 },
      { min: 300000, max: 600000, rate: 0.11 },
      { min: 600000, max: 1100000, rate: 0.15 },
      { min: 1100000, max: 1600000, rate: 0.19 },
      { min: 1600000, max: 3200000, rate: 0.21 },
      { min: 3200000, max: Infinity, rate: 0.24 },
    ],
    consolidationRelief: 200000,
    pensionReliefRate: 0.08,
    pensionReliefMax: 50000,
  },
  'Oyo': {
    name: 'Oyo', code: 'OY',
    brackets: [
      { min: 0, max: 300000, rate: 0.07 },
      { min: 300000, max: 600000, rate: 0.11 },
      { min: 600000, max: 1100000, rate: 0.15 },
      { min: 1100000, max: 1600000, rate: 0.19 },
      { min: 1600000, max: 3200000, rate: 0.21 },
      { min: 3200000, max: Infinity, rate: 0.24 },
    ],
    consolidationRelief: 200000,
    pensionReliefRate: 0.08,
    pensionReliefMax: 50000,
  },
  'Default': {
    name: 'Federal (Default)', code: 'NG',
    brackets: [
      { min: 0, max: 300000, rate: 0.07 },
      { min: 300000, max: 600000, rate: 0.11 },
      { min: 600000, max: 1100000, rate: 0.15 },
      { min: 1100000, max: 1600000, rate: 0.19 },
      { min: 1600000, max: 3200000, rate: 0.21 },
      { min: 3200000, max: Infinity, rate: 0.24 },
    ],
    consolidationRelief: 200000,
    pensionReliefRate: 0.08,
    pensionReliefMax: 50000,
  },
};

export interface MultiStatePayrollResult {
  state: string;
  grossSalary: number;
  consolidatedRelief: number;
  pensionRelief: number;
  taxableIncome: number;
  paye: number;
  pension: number;
  nhf: number;
  netSalary: number;
  effectiveRate: number;
}

export function calculateMultiStatePAYE(
  grossSalary: number,
  state: string = 'Default',
  bonus: number = 0,
  deduction: number = 0
): MultiStatePayrollResult {
  const config = STATE_TAX_CONFIGS[state] || STATE_TAX_CONFIGS['Default'];
  const totalIncome = grossSalary + bonus;

  // Consolidation Relief Allowance
  const consolidatedRelief = config.consolidationRelief + (totalIncome * 0.20);

  // Pension Relief (8% of gross, max ₦50,000/month)
  const pensionRelief = Math.min(totalIncome * config.pensionReliefRate, config.pensionReliefMax);

  // Taxable Income
  const taxableIncome = Math.max(0, totalIncome - consolidatedRelief - pensionRelief);

  // Calculate PAYE using state brackets
  let paye = 0;
  for (const bracket of config.brackets) {
    if (taxableIncome <= bracket.min) break;
    const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    paye += taxableInBracket * bracket.rate;
  }

  // Pension (10% of gross)
  const pension = Math.round(totalIncome * 0.10);

  // NHF (2.5% of gross)
  const nhf = Math.round(totalIncome * 0.025);

  // Net Salary
  const netSalary = totalIncome - paye - pension - nhf - deduction;

  return {
    state: config.name,
    grossSalary: totalIncome,
    consolidatedRelief: Math.round(consolidatedRelief),
    pensionRelief: Math.round(pensionRelief),
    taxableIncome: Math.round(taxableIncome),
    paye: Math.round(paye),
    pension,
    nhf,
    netSalary: Math.round(netSalary),
    effectiveRate: totalIncome > 0 ? Math.round((paye / totalIncome) * 10000) / 100 : 0,
  };
}

export function getAvailableStates(): string[] {
  return Object.keys(STATE_TAX_CONFIGS).filter(k => k !== 'Default');
}

export function getStateTaxConfig(state: string): StateTaxConfig | null {
  return STATE_TAX_CONFIGS[state] || null;
}
