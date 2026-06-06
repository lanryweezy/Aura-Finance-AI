
export interface PayrollDeductions {
  grossSalary: number;
  totalIncome: number;
  consolidatedReliefAllowance: number;
  taxableIncome: number;
  paye: number;
  pension: number;
  nhf: number;
  totalStatutoryDeductions: number;
  netSalary: number;
}

export interface CorporateTaxLiability {
  profitBeforeTax: number;
  annualTurnover: number;
  cit: number;
  citRate: number;
  tet: number;
  naseniLevy: number;
  policeTrustFund: number;
  totalTax: number;
  effectiveTaxRate: number;
}

export interface VatSummary {
  outputVat: number;
  inputVat: number;
  netVatPayable: number;
}

export interface WhtSummary {
  whtSuffered: number; // On Income
  whtPayable: number;  // On Expenses
}

export const VAT_RATE = 0.075;

export const calculateCorporateTax = (
  profitBeforeTax: number,
  annualTurnover: number
): CorporateTaxLiability => {
  // 1. Company Income Tax (CIT)
  // Small companies (<25M) - 0%
  // Medium companies (25M - 100M) - 20%
  // Large companies (>100M) - 30%
  let citRate = 0;
  if (annualTurnover > 100000000) citRate = 0.30;
  else if (annualTurnover > 25000000) citRate = 0.20;

  const cit = Math.max(0, profitBeforeTax * citRate);

  // 2. Tertiary Education Tax (TET) - 3% of assessable profit
  const tet = Math.max(0, profitBeforeTax * 0.03);

  // 3. NASENI Levy - 0.25% of profit before tax (for turnover > 100M)
  const naseniLevy = annualTurnover > 100000000 ? Math.max(0, profitBeforeTax * 0.0025) : 0;

  // 4. Police Trust Fund - 0.005% of net profit
  const policeTrustFund = Math.max(0, profitBeforeTax * 0.00005);

  const totalTax = cit + tet + naseniLevy + policeTrustFund;

  return {
    profitBeforeTax,
    annualTurnover,
    cit,
    citRate: citRate * 100,
    tet,
    naseniLevy,
    policeTrustFund,
    totalTax,
    effectiveTaxRate: profitBeforeTax > 0 ? (totalTax / profitBeforeTax) * 100 : 0
  };
};

export const calculateVat = (sales: number, taxableExpenses: number): VatSummary => {
  const outputVat = sales * VAT_RATE;
  const inputVat = taxableExpenses * VAT_RATE;
  return {
    outputVat,
    inputVat,
    netVatPayable: Math.max(0, outputVat - inputVat)
  };
};

export const calculateWht = (incomeSubjectToWht: number, expensesSubjectToWht: number, rate: number = 0.05): WhtSummary => {
  return {
    whtSuffered: incomeSubjectToWht * rate,
    whtPayable: expensesSubjectToWht * rate
  };
};

export const calculateDeductions = (
  grossSalary: number, 
  oneTimeBonuses: number = 0, 
  oneTimeDeductions: number = 0
): PayrollDeductions => {
  const totalIncome = grossSalary + oneTimeBonuses;
  const annualTotalIncome = totalIncome * 12;

  // 1. Pension Contribution (8% of base gross salary)
  const pension = grossSalary * 0.08;
  const annualPension = pension * 12;

  // 2. National Housing Fund (2.5% of base gross salary)
  const nhf = grossSalary * 0.025;
  const annualNhf = nhf * 12;

  // 3. Consolidated Relief Allowance (CRA) - based on total income
  // CRA is the higher of N200,000 or 1% of Gross Income, PLUS 20% of Gross Income.
  const cra1 = annualTotalIncome * 0.01;
  const craBase = Math.max(200000, cra1);
  const cra2 = annualTotalIncome * 0.20;
  const consolidatedReliefAllowanceAnnual = craBase + cra2;

  // 4. Taxable Income
  // Taxable Income = Total Annual Income - CRA - Pension - NHF
  const taxableIncomeAnnual = Math.max(0, annualTotalIncome - consolidatedReliefAllowanceAnnual - annualPension - annualNhf);

  // 5. PAYE Calculation (on annual taxable income)
  let annualPaye = 0;
  let incomeLeftToTax = taxableIncomeAnnual;

  // Bracket 1: First 300,000 @ 7%
  if (incomeLeftToTax > 0) {
    const firstBracket = Math.min(incomeLeftToTax, 300000);
    annualPaye += firstBracket * 0.07;
    incomeLeftToTax -= firstBracket;
  }
  // Bracket 2: Next 300,000 @ 11%
  if (incomeLeftToTax > 0) {
    const secondBracket = Math.min(incomeLeftToTax, 300000);
    annualPaye += secondBracket * 0.11;
    incomeLeftToTax -= secondBracket;
  }
  // Bracket 3: Next 500,000 @ 15%
  if (incomeLeftToTax > 0) {
    const thirdBracket = Math.min(incomeLeftToTax, 500000);
    annualPaye += thirdBracket * 0.15;
    incomeLeftToTax -= thirdBracket;
  }
  // Bracket 4: Next 500,000 @ 19%
  if (incomeLeftToTax > 0) {
    const fourthBracket = Math.min(incomeLeftToTax, 500000);
    annualPaye += fourthBracket * 0.19;
    incomeLeftToTax -= fourthBracket;
  }
  // Bracket 5: Next 1,600,000 @ 21%
  if (incomeLeftToTax > 0) {
    const fifthBracket = Math.min(incomeLeftToTax, 1600000);
    annualPaye += fifthBracket * 0.21;
    incomeLeftToTax -= fifthBracket;
  }
  // Bracket 6: Above 3,200,000 @ 24%
  if (incomeLeftToTax > 0) {
    annualPaye += incomeLeftToTax * 0.24;
  }
  
  const paye = annualPaye / 12;

  // Final monthly calculations
  const totalStatutoryDeductions = paye + pension + nhf;
  const netSalary = totalIncome - totalStatutoryDeductions - oneTimeDeductions;

  return {
    grossSalary,
    totalIncome,
    consolidatedReliefAllowance: consolidatedReliefAllowanceAnnual / 12,
    taxableIncome: taxableIncomeAnnual / 12,
    paye,
    pension,
    nhf,
    totalStatutoryDeductions,
    netSalary,
  };
};
