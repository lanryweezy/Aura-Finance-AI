
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { fetchInvoices } from '../services/receivablesService';
import { fetchEmployees } from '../services/employeeService';
import { calculateDeductions, calculateCorporateTax, calculateVat, calculateWht } from '../services/taxCalculatorService';
import { exportFirsVatSchedule, exportFirsWhtSchedule } from '../services/exportService';
import type { CategorizedTransaction, Invoice, Employee } from '../types';
import { useCurrency } from './ui/CurrencyProvider';
import DOMPurify from 'dompurify';

export const TaxFilingView: React.FC<{ transactions: CategorizedTransaction[] }> = ({ transactions }) => {
    const { formatAmount } = useCurrency();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState({ start: '', end: '' });
    const [activeTab, setActiveTab] = useState<'summary' | 'vat' | 'cit' | 'wht' | 'paye'>('summary');
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const results = await Promise.allSettled([
                    fetchInvoices(),
                    fetchEmployees()
                ]);

                // Fallback to empty arrays if fetching fails to allow graceful degradation
                const fetchedInvoices = results[0].status === 'fulfilled' ? results[0].value : [];
                const fetchedEmployees = results[1].status === 'fulfilled' ? results[1].value : [];

                setInvoices(fetchedInvoices);
                setEmployees(fetchedEmployees);
            } catch (error) {
                console.error("Unexpected error in TaxFilingView loadData", error);
                setInvoices([]);
                setEmployees([]);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const handlePrint = () => {
        const printContent = printRef.current;
        if (printContent) {
            const printWindow = window.open('', '', 'height=800,width=1000');
            printWindow?.document.write('<html><head><title>Tax Report</title>');
            printWindow?.document.write(`
                <style>
                    body { font-family: sans-serif; background-color: #fff; color: #000; margin: 20px; }
                    h1, h2, h3 { color: #111; }
                    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .summary-card { border: 1px solid #eee; padding: 1rem; margin-bottom: 1rem; border-radius: 8px; }
                    .no-print { display: none; }
                </style>
            `);
            printWindow?.document.write('</head><body>');
            printWindow?.document.write(DOMPurify.sanitize(printContent.innerHTML));
            printWindow?.document.write('</body></html>');
            printWindow?.document.close();
            printWindow?.focus();
            printWindow?.print();
        }
    };


    const filteredData = useMemo(() => {
        const result = {
            invoices: [] as Invoice[],
            totalSales: 0,
            vat: { outputVat: 0, inputVat: 0, netVatPayable: 0 },
            wht: { whtSuffered: 0, whtPayable: 0 },
            paye: 0,
            corporate: {
                profitBeforeTax: 0,
                annualTurnover: 0,
                cit: 0,
                citRate: 0,
                tet: 0,
                naseniLevy: 0,
                policeTrustFund: 0,
                totalTax: 0,
                effectiveTaxRate: 0
            },
            revenue: 0,
            expenses: 0,
        };

        if (!period.start || !period.end) {
            return result;
        }

        const startDate = new Date(period.start);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(period.end);
        endDate.setHours(23, 59, 59, 999);

        result.invoices = invoices.filter(inv => {
            const issueDate = new Date(inv.issueDate);
            return inv.status !== 'Draft' && issueDate >= startDate && issueDate <= endDate;
        });

        const periodTransactions = transactions.filter(t => {
             const txDate = new Date(t.date);
             return txDate >= startDate && txDate <= endDate;
        });

        result.totalSales = result.invoices.reduce((sum, inv) => sum + inv.amount, 0);

        // ⚡ Bolt Optimization: Replace O(4N) chained filter().reduce() passes over periodTransactions with O(N) single-pass loop.
        // Reduces memory allocations (no intermediate arrays) and computes revenue, expenses, and tax-subject amounts simultaneously.
        let taxableExpenses = 0;
        let expensesSubjectToWht = 0;

        result.revenue = 0;
        result.expenses = 0;

        for (let i = 0; i < periodTransactions.length; i++) {
            const t = periodTransactions[i];
            if (t.type === 'credit') {
                result.revenue += t.amount;
            } else {
                result.expenses += t.amount;
                if (t.category === 'Utilities' || t.category === 'Supplies' || t.category === 'Professional Services') {
                    taxableExpenses += t.amount;
                }
                if (t.category === 'Rent' || t.category === 'Professional Services' || t.category === 'Contractors') {
                    expensesSubjectToWht += t.amount;
                }
            }
        }

        // VAT
        result.vat = calculateVat(result.totalSales, taxableExpenses);

        // WHT
        // ⚡ Bolt Optimization: Single-pass loop replaces chained .filter().reduce() to prevent O(N) array allocation
        let incomeSubjectToWht = 0;
        for (let i = 0; i < result.invoices.length; i++) {
            if (result.invoices[i].whtApplied) {
                incomeSubjectToWht += result.invoices[i].amount;
            }
        }
        result.wht = calculateWht(incomeSubjectToWht, expensesSubjectToWht);

        // PAYE
        let monthsInPeriod = 1;
        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth();
        const endYear = endDate.getFullYear();
        const endMonth = endDate.getMonth();
        monthsInPeriod = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
        if (monthsInPeriod < 1) monthsInPeriod = 1;

        const payeMonthly = employees.reduce((acc, emp) => {
            const deductions = calculateDeductions(emp.grossSalary);
            return acc + deductions.paye;
        }, 0);
        result.paye = payeMonthly * monthsInPeriod;

        // Corporate Taxes
        const daysInPeriod = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
        const annualizedTurnover = (result.revenue / daysInPeriod) * 365;
        result.corporate = calculateCorporateTax(result.revenue - result.expenses, annualizedTurnover);

        return result;

    }, [invoices, employees, transactions, period]);


    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><Spinner /><p className="ml-4">Loading Tax Data...</p></div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Tax Filing Assistant</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 font-medium">Generate reports for your VAT, WHT, and CIT filings.</p>
                </div>
                <button onClick={handlePrint} disabled={!period.start || !period.end} className="bg-brand-cyan text-black font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all hover:bg-brand-cyan/90 disabled:opacity-50 shadow-lg shadow-brand-cyan/20 active:scale-95">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    Print Report
                </button>
            </div>

            <Card className="border-gray-100 dark:border-white/5 shadow-xl">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 w-full">
                        <label htmlFor="start-date" className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 block">Start Date</label>
                        <input id="start-date" type="date" value={period.start} onChange={e => setPeriod(p => ({...p, start: e.target.value}))} className="w-full bg-gray-50 dark:bg-dark-secondary border border-gray-100 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan transition-all outline-none font-medium" />
                    </div>
                    <div className="flex-1 w-full">
                        <label htmlFor="end-date" className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 block">End Date</label>
                        <input id="end-date" type="date" value={period.end} onChange={e => setPeriod(p => ({...p, end: e.target.value}))} className="w-full bg-gray-50 dark:bg-dark-secondary border border-gray-100 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan transition-all outline-none font-medium" />
                    </div>
                </div>
            </Card>

            <div className="flex gap-2 border-b border-gray-800">
                {(['summary', 'vat', 'wht', 'cit', 'paye'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab ? 'border-brand-cyan text-brand-cyan' : 'border-transparent text-gray-400 hover:text-white'}`}
                    >
                        {tab.toUpperCase()}
                    </button>
                ))}
            </div>

            <div ref={printRef}>
                {activeTab === 'summary' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <Card className="lg:col-span-3 border-brand-cyan/30 bg-brand-cyan/5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-brand-cyan text-black rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>
                                </div>
                                <h3 className="text-xl font-bold text-white">Compliance Calendar (Nigeria)</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-3 bg-dark-secondary rounded-lg border border-white/5">
                                    <p className="text-xs text-gray-400 uppercase font-bold">PAYE Remittance</p>
                                    <p className="text-sm text-white mt-1">Due by 10th of each month</p>
                                    <div className="mt-2 text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded w-fit border border-green-500/20">Active</div>
                                </div>
                                <div className="p-3 bg-dark-secondary rounded-lg border border-white/5">
                                    <p className="text-xs text-gray-400 uppercase font-bold">VAT & WHT Filing</p>
                                    <p className="text-sm text-white mt-1">Due by 21st of each month</p>
                                    <div className="mt-2 text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded w-fit border border-green-500/20">Active</div>
                                </div>
                                <div className="p-3 bg-dark-secondary rounded-lg border border-white/5">
                                    <p className="text-xs text-gray-400 uppercase font-bold">CIT Return</p>
                                    <p className="text-sm text-white mt-1">6 months after year-end</p>
                                    <div className="mt-2 text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded w-fit border border-yellow-500/20">Upcoming</div>
                                </div>
                            </div>
                        </Card>
                        <Card className="border-brand-pink/30 bg-brand-pink/5">
                            <h3 className="text-sm font-bold text-white mb-3">Next Action</h3>
                            <div className="space-y-2">
                                <p className="text-xs text-gray-400">VAT Filing due in:</p>
                                <p className="text-2xl font-black text-brand-pink">12 Days</p>
                                <button
                                    onClick={() => exportFirsVatSchedule(filteredData.invoices, period.start, period.end)}
                                    disabled={!period.start || !period.end}
                                    className="w-full mt-2 py-2 bg-brand-pink text-white text-xs font-bold rounded-lg hover:bg-brand-pink/80 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                                >
                                    Generate FIRS Schedule
                                </button>
                            </div>
                        </Card>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="bg-brand-cyan/5 border-brand-cyan/20">
                                <h3 className="text-brand-cyan text-sm font-medium">Estimated CIT Liability</h3>
                                <p className="text-3xl font-bold text-white mt-2">{formatAmount(filteredData.corporate.cit)}</p>
                                <p className="text-xs text-gray-400 mt-1">Rate: {filteredData.corporate.citRate}%</p>
                            </Card>
                            <Card className="bg-blue-400/5 border-blue-400/20">
                                <h3 className="text-blue-400 text-sm font-medium">Net VAT Payable</h3>
                                <p className="text-3xl font-bold text-white mt-2">{formatAmount(filteredData.vat.netVatPayable)}</p>
                                <p className="text-xs text-gray-400 mt-1">Input VAT: {formatAmount(filteredData.vat.inputVat)}</p>
                            </Card>
                            <Card className="bg-purple-400/5 border-purple-400/20">
                                <h3 className="text-purple-400 text-sm font-medium">Net WHT Position</h3>
                                <p className="text-3xl font-bold text-white mt-2">{formatAmount(filteredData.wht.whtPayable - filteredData.wht.whtSuffered)}</p>
                                <p className="text-xs text-gray-400 mt-1">Payable: {formatAmount(filteredData.wht.whtPayable)} | Credit: {formatAmount(filteredData.wht.whtSuffered)}</p>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2">
                                <h3 className="text-xl font-bold text-white mb-6">Total Tax Exposure</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center"><span className="text-gray-400">Company Income Tax (CIT)</span> <span className="text-white font-mono">{formatAmount(filteredData.corporate.cit)}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-gray-400">Tertiary Education Tax (TET)</span> <span className="text-white font-mono">{formatAmount(filteredData.corporate.tet)}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-gray-400">NASENI Levy (0.25%)</span> <span className="text-white font-mono">{formatAmount(filteredData.corporate.naseniLevy)}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-gray-400">Police Trust Fund (0.005%)</span> <span className="text-white font-mono">{formatAmount(filteredData.corporate.policeTrustFund)}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-gray-400">PAYE Remittance</span> <span className="text-white font-mono">{formatAmount(filteredData.paye)}</span></div>
                                    <hr className="border-gray-800"/>
                                    <div className="flex justify-between items-center text-xl font-bold"><span className="text-brand-cyan">Total Estimated Exposure</span> <span className="text-brand-cyan font-mono">{formatAmount(filteredData.corporate.totalTax + filteredData.paye + filteredData.vat.netVatPayable + Math.max(0, filteredData.wht.whtPayable - filteredData.wht.whtSuffered))}</span></div>
                                </div>
                            </Card>
                            <Card className="bg-brand-cyan/10 border-brand-cyan/20">
                                <div className="flex items-center gap-2 mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00F5D4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                                    <h3 className="text-sm font-bold text-brand-cyan uppercase tracking-tighter">Tax Intelligence</h3>
                                </div>
                                <ul className="space-y-4">
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan mt-1.5 flex-shrink-0"></div>
                                        <p className="text-xs text-gray-300">You have <span className="text-white font-bold">{formatAmount(filteredData.wht.whtSuffered)}</span> in WHT credits that can be used to offset your CIT.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan mt-1.5 flex-shrink-0"></div>
                                        <p className="text-xs text-gray-300">Annual turnover is tracking at <span className="text-white font-bold">{formatAmount(filteredData.corporate.annualTurnover)}</span>, placing you in the {filteredData.corporate.citRate}% CIT bracket.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan mt-1.5 flex-shrink-0"></div>
                                        <p className="text-xs text-gray-300">Consider voluntary pension contributions to further reduce taxable income for employees.</p>
                                    </li>
                                </ul>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'vat' && (
                    <Card>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">VAT Filing Schedule</h3>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => exportFirsVatSchedule(filteredData.invoices, period.start, period.end)}
                                    className="text-xs bg-dark-tertiary border border-gray-700 px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors"
                                >
                                    Download CSV
                                </button>
                                <div className="text-right">
                                    <p className="text-sm text-gray-400">Net Payable</p>
                                    <p className="text-2xl font-bold text-blue-400">{formatAmount(filteredData.vat.netVatPayable)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-gray-800">
                                    <tr>
                                        <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Description</th>
                                        <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Amount</th>
                                        <th className="p-4 text-xs font-semibold text-gray-400 uppercase">VAT (7.5%)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    <tr>
                                        <td className="p-4 text-gray-300">Total Vatable Sales (Output)</td>
                                        <td className="p-4 text-white font-mono">{formatAmount(filteredData.totalSales)}</td>
                                        <td className="p-4 text-blue-400 font-mono">{formatAmount(filteredData.vat.outputVat)}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 text-gray-300">Eligible Input VAT (Expenses)</td>
                                        <td className="p-4 text-white font-mono">{formatAmount(filteredData.totalSales > 0 ? (filteredData.vat.inputVat / 0.075) : 0)}</td>
                                        <td className="p-4 text-red-400 font-mono">({formatAmount(filteredData.vat.inputVat)})</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {activeTab === 'cit' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card>
                            <h3 className="text-xl font-bold text-white mb-6">Profit & Loss Adjustment</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center"><span className="text-gray-400">Total Revenue</span> <span className="text-green-400 font-mono">{formatAmount(filteredData.revenue)}</span></div>
                                <div className="flex justify-between items-center"><span className="text-gray-400">Total Expenses</span> <span className="text-red-400 font-mono">({formatAmount(filteredData.expenses)})</span></div>
                                <hr className="border-gray-800"/>
                                <div className="flex justify-between items-center font-bold text-lg"><span className="text-white">Assessable Profit</span> <span className="text-white font-mono">{formatAmount(filteredData.corporate.profitBeforeTax)}</span></div>
                            </div>
                        </Card>
                        <Card>
                            <h3 className="text-xl font-bold text-white mb-6">Tax Computation</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center"><span className="text-gray-400">CIT ({filteredData.corporate.citRate}%)</span> <span className="text-white font-mono">{formatAmount(filteredData.corporate.cit)}</span></div>
                                <div className="flex justify-between items-center"><span className="text-gray-400">TET (3%)</span> <span className="text-white font-mono">{formatAmount(filteredData.corporate.tet)}</span></div>
                                <div className="flex justify-between items-center"><span className="text-gray-400">NASENI Levy</span> <span className="text-white font-mono">{formatAmount(filteredData.corporate.naseniLevy)}</span></div>
                                <hr className="border-gray-800"/>
                                <div className="flex justify-between items-center font-bold text-lg"><span className="text-brand-cyan">Total Corporate Tax</span> <span className="text-brand-cyan font-mono">{formatAmount(filteredData.corporate.totalTax)}</span></div>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'wht' && (
                    <Card>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Withholding Tax (WHT) Ledger</h3>
                            <button
                                onClick={() => exportFirsWhtSchedule(filteredData.invoices, transactions, period.start, period.end)}
                                className="text-xs bg-dark-tertiary border border-gray-700 px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors"
                            >
                                Download CSV
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="p-4 bg-purple-400/5 border border-purple-400/20 rounded-lg">
                                <p className="text-sm text-gray-400">WHT Credits (Suffered)</p>
                                <p className="text-2xl font-bold text-white">{formatAmount(filteredData.wht.whtSuffered)}</p>
                                <p className="text-xs text-gray-500 mt-1">Available to offset CIT</p>
                            </div>
                            <div className="p-4 bg-orange-400/5 border border-orange-400/20 rounded-lg">
                                <p className="text-sm text-gray-400">WHT Payable (To Remit)</p>
                                <p className="text-2xl font-bold text-white">{formatAmount(filteredData.wht.whtPayable)}</p>
                                <p className="text-xs text-gray-500 mt-1">Due to FIRS/SIRS</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-gray-800">
                                    <tr>
                                        <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Transaction</th>
                                        <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Type</th>
                                        <th className="p-4 text-xs font-semibold text-gray-400 uppercase">WHT (5%)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {filteredData.invoices.filter(i => i.whtApplied).map(inv => (
                                        <tr key={inv.id}>
                                            <td className="p-4 text-gray-300">{inv.customer}</td>
                                            <td className="p-4 text-gray-400 text-sm">Income Credit</td>
                                            <td className="p-4 text-purple-400 font-mono">{formatAmount(inv.amount * 0.05)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {activeTab === 'paye' && (
                    <Card>
                        <h3 className="text-xl font-bold text-white mb-6">PAYE & Statutory Remittance</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center"><span className="text-gray-400">Total Monthly PAYE</span> <span className="text-white font-mono">{formatAmount(filteredData.paye)}</span></div>
                            <div className="flex justify-between items-center"><span className="text-gray-400">Pension Contributions (Employer 10%)</span> <span className="text-white font-mono">{formatAmount(filteredData.paye * 1.25)}</span></div>
                            <div className="flex justify-between items-center"><span className="text-gray-400">NHF Remittance (2.5%)</span> <span className="text-white font-mono">{formatAmount(filteredData.paye * 0.3)}</span></div>
                            <hr className="border-gray-800"/>
                            <div className="flex justify-between items-center font-bold text-lg"><span className="text-green-400">Total Statutory Liability</span> <span className="text-green-400 font-mono">{formatAmount(filteredData.paye * 2.55)}</span></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-6 italic">*Estimates based on current employee payroll configurations.</p>
                    </Card>
                )}
            </div>
        </div>
    );
};
