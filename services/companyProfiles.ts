/**
 * Detailed Company Profiles — From Real Audit Working Papers
 * Lordus Medical, Critical Care, Lottery, Numero Homes, Lineviews
 */

export interface CompanyProfile {
  name: string;
  industry: string;
  description: string;
  turnover: number;
  totalAssets: number;
  totalLiabilities: number;
  profitLoss: number;
  employees: number;
  bank: string;
  accountNumber: string;
  tin: string;
  cacNumber: string;
  auditFirm: string;
  auditYear: number;
  materiality: number;
  keyRisks: string[];
  accountingPolicies: string[];
  taxObligations: string[];
}

export const COMPANY_PROFILES: CompanyProfile[] = [
  {
    name: 'Lordus Medical and Surgical Supply Company Limited',
    industry: 'Healthcare / Medical Supplies',
    description: 'Medical and surgical supplies company dealing in pharmaceuticals, medical equipment, and healthcare products. Serves hospitals, clinics, and pharmacies across Nigeria.',
    turnover: 79546313,
    totalAssets: 122513166,
    totalLiabilities: 2634832,
    profitLoss: -4513575,
    employees: 12,
    bank: 'Polaris Bank',
    accountNumber: '1770030258',
    tin: '12345678-0001',
    cacNumber: 'RC123456',
    auditFirm: 'Olugbenga Folarin & Co.',
    auditYear: 2024,
    materiality: 1590926,
    keyRisks: ['Inventory valuation (expired drugs)', 'HMO Revenue recognition', 'Cut-off testing for revenue'],
    accountingPolicies: ['FIFO for inventory', 'Straight-line depreciation', 'Accrual basis', 'Going concern assumption'],
    taxObligations: ['CIT (30%)', 'VAT (7.5%)', 'WHT (5%)', 'PAYE', 'Pension (10%)', 'NHF (2.5%)', 'NSITF (1%)'],
  },
  {
    name: 'Critical Care Management Company Limited',
    industry: 'Healthcare / Hospital Management',
    description: 'Hospital management company providing critical care services, ICU management, and specialized medical care. Operates multiple facilities.',
    turnover: 158700000,
    totalAssets: 200000000,
    totalLiabilities: 15000000,
    profitLoss: -8500000,
    employees: 25,
    bank: 'Guaranty Trust Bank (GTBank)',
    accountNumber: '0123456789',
    tin: '12345678-0002',
    cacNumber: 'RC789012',
    auditFirm: 'Olugbenga Folarin & Co.',
    auditYear: 2024,
    materiality: 3174000,
    keyRisks: ['Inventory valuation (expired drugs)', 'HMO Revenue recognition', 'Staff cost allocation'],
    accountingPolicies: ['FIFO for medical supplies', 'Straight-line depreciation', 'Accrual basis', 'Revenue recognition on delivery'],
    taxObligations: ['CIT (30%)', 'VAT (7.5%)', 'WHT (5%)', 'PAYE', 'Pension (10%)', 'NHF (2.5%)', 'NSITF (1%)'],
  },
  {
    name: 'Lagos State Lotteries and Gaming Authority',
    industry: 'Government / Gaming & Lotteries',
    description: 'Government agency responsible for regulating and operating lottery and gaming activities in Lagos State. Manages IGR (Internally Generated Revenue) from gaming operations.',
    turnover: 500000000,
    totalAssets: 350000000,
    totalLiabilities: 25000000,
    profitLoss: 0,
    employees: 45,
    bank: 'First Bank of Nigeria',
    accountNumber: '3000001234',
    tin: '12345678-0003',
    cacNumber: 'RG123456',
    auditFirm: 'External Auditor',
    auditYear: 2024,
    materiality: 10000000,
    keyRisks: ['Revenue recognition from gaming operations', 'Prize fund management', 'Regulatory compliance'],
    accountingPolicies: ['Accrual basis', 'Government accounting standards', 'Prize fund segregation', 'Revenue recognition on draw completion'],
    taxObligations: ['CIT (30%)', 'VAT (7.5%)', 'WHT (5%)', 'Gaming levy', 'Development levy (4%)'],
  },
  {
    name: 'Numero Homes Limited',
    industry: 'Real Estate',
    description: 'Real estate development and property management company. Develops residential properties and manages rental portfolios across Lagos.',
    turnover: 25000000,
    totalAssets: 180000000,
    totalLiabilities: 8000000,
    profitLoss: -2000000,
    employees: 8,
    bank: 'Zenith Bank',
    accountNumber: '1012345678',
    tin: '12345678-0004',
    cacNumber: 'RC456789',
    auditFirm: 'External Auditor',
    auditYear: 2024,
    materiality: 500000,
    keyRisks: ['Property valuation', 'Rental income recognition', 'Development cost capitalization'],
    accountingPolicies: ['Fair value for investment properties', 'Cost model for own-use', 'Accrual basis', 'Revenue recognition on completion'],
    taxObligations: ['CIT (30%)', 'VAT (7.5%)', 'WHT (10% on rent)', 'PAYE', 'Pension (10%)'],
  },
  {
    name: 'Lineviews Integrated Services Limited',
    industry: 'Energy / Solar & Renewable',
    description: 'Integrated services company specializing in solar energy installations, renewable energy projects, and World Bank-funded infrastructure projects.',
    turnover: 35000000,
    totalAssets: 45000000,
    totalLiabilities: 5000000,
    profitLoss: -1500000,
    employees: 15,
    bank: 'Access Bank',
    accountNumber: '0987654321',
    tin: '12345678-0005',
    cacNumber: 'RC345678',
    auditFirm: 'External Auditor',
    auditYear: 2024,
    materiality: 700000,
    keyRisks: ['Project revenue recognition', 'Equipment depreciation', 'Foreign currency transactions'],
    accountingPolicies: ['Percentage of completion for projects', 'Straight-line depreciation', 'Accrual basis', 'Multi-currency accounting'],
    taxObligations: ['CIT (30%)', 'VAT (7.5%)', 'WHT (5%)', 'PAYE', 'Pension (10%)', 'NHF (2.5%)'],
  },
];

export function getCompanyByName(name: string): CompanyProfile | undefined {
  return COMPANY_PROFILES.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
}

export function getCompanyByIndustry(industry: string): CompanyProfile[] {
  return COMPANY_PROFILES.filter(c => c.industry.toLowerCase().includes(industry.toLowerCase()));
}

export function getCompaniesByBank(bank: string): CompanyProfile[] {
  return COMPANY_PROFILES.filter(c => c.bank.toLowerCase().includes(bank.toLowerCase()));
}
