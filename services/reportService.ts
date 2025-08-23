
import type { ReportPeriod, CategorizedTransaction, Invoice, Bill, PayrollSummary, ReportData, InventoryItem } from '../types';

const getPeriodTransactions = (transactions: CategorizedTransaction[], period: ReportPeriod) => {
    return transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate >= period.start && txDate <= period.end;
    });
};

const getTransactionsBeforePeriod = (transactions: CategorizedTransaction[], period: ReportPeriod) => {
    return transactions.filter(t => new Date(t.date) < period.start);
};

export const calculateReportData = (
    period: ReportPeriod,
    allTransactions: CategorizedTransaction[],
    allInvoices: Invoice[],
    allBills: Bill[],
    payrollSummary: PayrollSummary,
    inventoryItems: InventoryItem[],
): ReportData => {
    
    const periodTransactions = getPeriodTransactions(allTransactions, period);
    const transactionsBefore = getTransactionsBeforePeriod(allTransactions, period);

    // ======== P&L Calculation ========
    const revenue = periodTransactions
        .filter(t => t.type === 'credit' && t.category.toLowerCase().includes('revenue'))
        .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate COGS from invoices in the period that contain inventory items
    const cogs = allInvoices
        .filter(inv => inv.status === 'Paid' && new Date(inv.issueDate) >= period.start && new Date(inv.issueDate) <= period.end)
        .flatMap(inv => inv.lineItems)
        .reduce((sum, li) => {
            if (li.inventoryItemId) {
                const inventoryItem = inventoryItems.find(item => item.id === li.inventoryItemId);
                if (inventoryItem && inventoryItem.type === 'Product') {
                    return sum + (inventoryItem.costPrice * li.quantity);
                }
            }
            return sum;
        }, 0);

    const grossProfit = revenue - cogs;

    const expensesByCategory = periodTransactions
        .filter(t => t.type === 'debit' && !["Owner's Draw", "Inter-account Transfer", "Loan Principal"].includes(t.category) && !t.category.startsWith('COGS'))
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

    // Simplification: Prorate payroll if period is not a full year.
    const monthsInPeriod = (period.end.getFullYear() - period.start.getFullYear()) * 12 + (period.end.getMonth() - period.start.getMonth()) + 1;
    const totalPayrollCost = payrollSummary.totalGross * monthsInPeriod;
    if (totalPayrollCost > 0) {
        expensesByCategory['Salaries & Wages'] = (expensesByCategory['Salaries & Wages'] || 0) + totalPayrollCost;
    }
    
    const totalExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);
    const netOperatingIncome = grossProfit - totalExpenses;
    const netProfit = netOperatingIncome; // Assuming no non-operating income/expense for now

    const pAndL = { revenue, cogs, grossProfit, expensesByCategory, totalExpenses, netOperatingIncome, netProfit };

    // ======== Balance Sheet Calculation (as of period.end) ========
    const endingBalanceTransaction = allTransactions
        .filter(t => new Date(t.date) <= period.end)
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    const cashAndBank = endingBalanceTransaction?.balance ?? allTransactions.reduce((acc, t) => t.type === 'credit' ? acc + t.amount : acc - t.amount, 0);
    
    const accountsReceivable = allInvoices
        .filter(i => (i.status === 'Unpaid' || i.status === 'Overdue') && new Date(i.issueDate) <= period.end)
        .reduce((sum, i) => sum + i.total, 0);

    const inventoryValue = inventoryItems
        .filter(item => item.type === 'Product')
        .reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);

    const totalCurrentAssets = cashAndBank + accountsReceivable + inventoryValue;

    const accountsPayable = allBills
        .filter(b => (b.status === 'Unpaid' || b.status === 'Overdue') && new Date(b.issueDate) <= period.end)
        .reduce((sum, b) => sum + b.amount, 0);

    const totalCurrentLiabilities = accountsPayable;

    // Simplified equity: Assets - Liabilities. A real system would track retained earnings.
    const equity = totalCurrentAssets - totalCurrentLiabilities; 
    const currentRatio = totalCurrentLiabilities > 0 ? totalCurrentAssets / totalCurrentLiabilities : Infinity;

    const balanceSheet = { cashAndBank, accountsReceivable, inventory: inventoryValue, totalCurrentAssets, accountsPayable, totalCurrentLiabilities, equity, currentRatio };

    // ======== Cash Flow Calculation ========
    const beginningBalanceTransaction = transactionsBefore.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const beginningCash = beginningBalanceTransaction?.balance ?? 0;
    
    const cashFromOperating = pAndL.revenue - pAndL.totalExpenses; // Simplification (Direct method)

    const ownersDraw = periodTransactions
        .filter(t => t.category === "Owner's Draw")
        .reduce((sum, t) => sum + t.amount, 0);
    
    const capitalInjections = periodTransactions
        .filter(t => t.category === 'Capital Injection')
        .reduce((sum, t) => sum + t.amount, 0);

    const cashFromFinancing = capitalInjections - ownersDraw;
    
    const netCashFlow = cashFromOperating + cashFromFinancing;
    const endingCash = beginningCash + netCashFlow;

    const cashFlow = {
        netProfit: pAndL.netProfit,
        changeInReceivables: 0, // Placeholder
        changeInPayables: 0, // Placeholder
        cashFromOperating,
        ownersDraw,
        cashFromFinancing,
        netCashFlow,
        beginningCash,
        endingCash
    };
    
    return { pAndL, balanceSheet, cashFlow };
};
