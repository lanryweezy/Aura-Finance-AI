/**
 * Realistic Demo Data — Based on actual company audit papers
 * Companies: Lordus Medical, Critical Care, Lottery, Numero Homes, Lineviews
 */

import type { CategorizedTransaction, Invoice, Bill, Employee, Contact, Project, Budget, CorporateCard } from '../types';

// ============== Lordus Medical & Surgical Supply Co. Ltd ==============
// Turnover: ₦79.5M, Loss: ₦4.5M, Assets: ₦122.5M

// ============== Critical Care Management Co. Ltd ==============
// Materiality: ₦3.17M (2% of turnover ~₦158.7M)

// ============== Lagos State Lotteries & Gaming Authority ==============
// Government agency, IGR revenue

// ============== Numero Homes ==============
// Real estate, audit 2018-2024

// ============== Lineviews Integrated Services ==============
// Solar projects, World Bank bids

const COMPANIES = [
  {
    name: 'Lordus Medical & Surgical Supply Co. Ltd',
    industry: 'Healthcare / Medical Supplies',
    turnover: 79546313,
    totalAssets: 122513166,
    totalLiabilities: 2634832,
    loss: 4513575,
    employees: 12,
    bank: 'Polaris Bank',
    accountNumber: '1770030258',
  },
  {
    name: 'Critical Care Management Company Limited',
    industry: 'Healthcare / Hospital Management',
    turnover: 158700000,
    totalAssets: 200000000,
    totalLiabilities: 15000000,
    loss: 8500000,
    employees: 25,
    bank: 'GTBank',
    accountNumber: '0123456789',
  },
  {
    name: 'Lagos State Lotteries & Gaming Authority',
    industry: 'Government / Gaming',
    turnover: 500000000,
    totalAssets: 350000000,
    totalLiabilities: 25000000,
    loss: 0,
    employees: 45,
    bank: 'First Bank',
    accountNumber: '3000001234',
  },
  {
    name: 'Numero Homes Limited',
    industry: 'Real Estate',
    turnover: 25000000,
    totalAssets: 180000000,
    totalLiabilities: 8000000,
    loss: 2000000,
    employees: 8,
    bank: 'Zenith Bank',
    accountNumber: '1012345678',
  },
  {
    name: 'Lineviews Integrated Services Limited',
    industry: 'Energy / Solar',
    turnover: 35000000,
    totalAssets: 45000000,
    totalLiabilities: 5000000,
    loss: 1500000,
    employees: 15,
    bank: 'Access Bank',
    accountNumber: '0987654321',
  },
];

export function generateRealisticDemoData() {
  const now = new Date();
  const transactions: CategorizedTransaction[] = [];
  const invoices: Invoice[] = [];
  const bills: Bill[] = [];
  const employees: Employee[] = [];
  const contacts: Contact[] = [];
  const projects: Project[] = [];
  const budgets: Budget[] = [];

  // Generate transactions for each company
  COMPANIES.forEach((company, ci) => {
    // Monthly revenue (turnover / 12)
    const monthlyRevenue = Math.round(company.turnover / 12);
    // Monthly expenses (turnover + loss) / 12
    const monthlyExpenses = Math.round((company.turnover + Math.abs(company.loss)) / 12);

    for (let month = 5; month >= 0; month--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - month, 1);
      const variance = 0.85 + Math.random() * 0.3;

      // Revenue transactions
      transactions.push({
        id: `txn_${ci}_${month}_rev`,
        amount: Math.round(monthlyRevenue * variance),
        type: 'credit',
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), Math.floor(Math.random() * 28) + 1).toISOString(),
        narration: `PAYSTACK/${company.name.split(' ')[0].toUpperCase()}/REVENUE`,
        balance: 0,
        category: 'Sales Revenue',
      });

      // Expense categories
      const expenseCategories = [
        { name: 'Salaries & Wages', pct: 0.35 },
        { name: 'Rent & Leases', pct: 0.10 },
        { name: 'Utilities', pct: 0.05 },
        { name: 'Office Supplies', pct: 0.03 },
        { name: 'Marketing & Advertising', pct: 0.08 },
        { name: 'Professional Fees', pct: 0.06 },
        { name: 'Travel', pct: 0.04 },
        { name: 'Software & Subscriptions', pct: 0.02 },
        { name: 'Cost of Sales', pct: 0.25 },
        { name: 'Bank Charges & Fees', pct: 0.01 },
      ];

      expenseCategories.forEach((cat, ei) => {
        const amount = Math.round(monthlyExpenses * cat.pct * (0.85 + Math.random() * 0.3));
        transactions.push({
          id: `txn_${ci}_${month}_exp_${ei}`,
          amount,
          type: 'debit',
          date: new Date(monthDate.getFullYear(), monthDate.getMonth(), Math.floor(Math.random() * 28) + 1).toISOString(),
          narration: `${cat.name.toUpperCase()}/${company.name.split(' ')[0]}`,
          balance: 0,
          category: cat.name,
        });
      });
    }

    // Generate invoices
    for (let i = 0; i < 3; i++) {
      const invAmount = Math.round(monthlyRevenue * (0.3 + Math.random() * 0.4));
      const statuses = ['Paid', 'Unpaid', 'Overdue'] as const;
      invoices.push({
        id: `inv_${ci}_${i}`,
        customer: company.name,
        description: `${company.industry} services`,
        amount: invAmount,
        vat: Math.round(invAmount * 0.075),
        total: invAmount + Math.round(invAmount * 0.075),
        issueDate: new Date(now.getFullYear(), now.getMonth() - 1, 10 + i * 5).toISOString(),
        dueDate: new Date(now.getFullYear(), now.getMonth(), 10 + i * 5).toISOString(),
        status: statuses[i % 3],
        whtApplied: false,
        lineItems: [{ id: `li_${ci}_${i}`, name: 'Professional Services', description: company.industry, quantity: 1, unitPrice: invAmount, total: invAmount }],
        currency: 'NGN',
      });
    }

    // Generate bills
    const vendors = ['AWS', 'Google Cloud', 'MTN Nigeria', 'IKEJA Electric', 'Office Landlord'];
    for (let i = 0; i < 3; i++) {
      const billAmount = Math.round(monthlyExpenses * 0.1 * (0.5 + Math.random() * 0.5));
      bills.push({
        id: `bill_${ci}_${i}`,
        vendor: vendors[i % vendors.length],
        description: `${vendors[i % vendors.length]} services for ${company.name.split(' ')[0]}`,
        amount: billAmount,
        issueDate: new Date(now.getFullYear(), now.getMonth() - 1, 5 + i * 7).toISOString(),
        dueDate: new Date(now.getFullYear(), now.getMonth(), 5 + i * 7).toISOString(),
        status: i === 0 ? 'Paid' : i === 1 ? 'Unpaid' : 'Overdue',
        whtApplies: false,
        lineItems: [],
        currency: 'NGN',
      });
    }

    // Generate employees
    const jobTitles = ['Managing Director', 'Finance Manager', 'Operations Manager', 'Admin Officer', 'Driver'];
    for (let i = 0; i < Math.min(company.employees, 5); i++) {
      employees.push({
        id: `emp_${ci}_${i}`,
        name: `${['Adewale', 'Blessing', 'Chidi', 'Funke', 'Tunde'][i]} ${company.name.split(' ')[0]}`,
        jobTitle: jobTitles[i],
        hireDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), 1).toISOString(),
        email: `${['adewale', 'blessing', 'chidi', 'funke', 'tunde'][i]}@${company.name.split(' ')[0].toLowerCase()}.com`,
        bankName: company.bank,
        accountNumber: company.accountNumber,
        grossSalary: [450000, 350000, 300000, 200000, 120000][i],
      });
    }

    // Generate contacts
    contacts.push(
      { id: `cont_${ci}_1`, type: 'Customer' as const, name: company.name, companyName: company.name, email: `accounts@${company.name.split(' ')[0].toLowerCase()}.com` },
      { id: `cont_${ci}_2`, type: 'Vendor' as const, name: `${company.bank} Nigeria`, companyName: company.bank, email: `business@${company.bank.toLowerCase()}.com` },
    );

    // Generate project
    projects.push({
      id: `proj_${ci}`,
      name: `${company.name} Audit ${now.getFullYear()}`,
      description: `Annual audit for ${company.name}`,
      budget: Math.round(company.turnover * 0.02),
      status: 'Active' as const,
    });

    // Generate budgets
    budgets.push(
      { category: 'Salaries & Wages', amount: Math.round(company.turnover * 0.35 / 12) },
      { category: 'Rent & Leases', amount: Math.round(company.turnover * 0.10 / 12) },
      { category: 'Marketing & Advertising', amount: Math.round(company.turnover * 0.08 / 12) },
    );
  });

  return { transactions, invoices, bills, employees, contacts, projects, budgets, companies: COMPANIES };
}

export { COMPANIES };
