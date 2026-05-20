
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { fetchInvoices } from '../services/receivablesService';
import { fetchEmployees } from '../services/employeeService';
import { calculateDeductions } from '../services/taxCalculatorService';
import type { CategorizedTransaction, Invoice, Employee } from '../types';
import { useCurrency } from './ui/CurrencyProvider';

export const TaxFilingView: React.FC<{ transactions: CategorizedTransaction[] }> = ({ transactions }) => {
    const { formatAmount } = useCurrency();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState({ start: '', end: '' });
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const [fetchedInvoices, fetchedEmployees] = await Promise.all([
                fetchInvoices(),
                fetchEmployees()
            ]);
            setInvoices(fetchedInvoices);
            setEmployees(fetchedEmployees);
            setIsLoading(false);
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
            printWindow?.document.write(printContent.innerHTML);
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
            totalVAT: 0,
            totalWHT: 0,
            totalPAYE: 0,
            revenue: 0,
            expenses: 0,
            assessableProfit: 0,
            citRate: 0,
            estimatedCIT: 0,
        };

        if (!period.start || !period.end) {
            return result;
        }

        const startDate = new Date(period.start);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(period.end);
        endDate.setHours(23, 59, 59, 999);
        const WHT_RATE = 0.05;

        result.invoices = invoices.filter(inv => {
            const issueDate = new Date(inv.issueDate);
            return inv.status !== 'Draft' && issueDate >= startDate && issueDate <= endDate;
        });

        const invoiceSummary = result.invoices.reduce((acc, inv) => {
            acc.totalSales += inv.amount;
            acc.totalVAT += inv.vat;
            if (inv.whtApplied) {
                acc.totalWHT += inv.amount * WHT_RATE;
            }
            return acc;
        }, { totalSales: 0, totalVAT: 0, totalWHT: 0 });
        
        Object.assign(result, invoiceSummary);

        // PAYE Calculation based on employees
        // Convert the date range to months (approximate)
        let monthsInPeriod = 1;
        if (period.start && period.end) {
            const startYear = startDate.getFullYear();
            const startMonth = startDate.getMonth();
            const endYear = endDate.getFullYear();
            const endMonth = endDate.getMonth();
            monthsInPeriod = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
            if (monthsInPeriod < 1) monthsInPeriod = 1;
        }

        const payeMonthly = employees.reduce((acc, emp) => {
            const deductions = calculateDeductions(emp.grossSalary);
            return acc + deductions.paye;
        }, 0);

        result.totalPAYE = payeMonthly * monthsInPeriod;
        
        const periodTransactions = transactions.filter(t => {
             const txDate = new Date(t.date);
             return txDate >= startDate && txDate <= endDate;
        });

        result.revenue = periodTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
        result.expenses = periodTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
        result.assessableProfit = Math.max(0, result.revenue - result.expenses);
        
        const daysInPeriod = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) || 1;
        const annualizedTurnover = (result.revenue / daysInPeriod) * 365;

        if (annualizedTurnover > 100000000) {
            result.citRate = 30;
        } else if (annualizedTurnover > 25000000) {
            result.citRate = 20;
        }
        result.estimatedCIT = result.assessableProfit * (result.citRate / 100);

        return result;

    }, [invoices, employees, transactions, period]);


    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><Spinner /><p className="ml-4">Loading Tax Data...</p></div>
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

            <div ref={printRef} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Tax Report: {period.start && period.end ? `${new Date(period.start).toLocaleDateString()} - ${new Date(period.end).toLocaleDateString()}` : <span className="text-gray-400 font-medium">Select a period to generate results</span>}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="border-gray-100 dark:border-white/5 shadow-lg">
                        <h3 className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest">Total Sales</h3>
                        <p className="text-2xl font-black text-brand-cyan mt-3">{formatAmount(filteredData.totalSales)}</p>
                    </Card>
                    <Card className="border-gray-100 dark:border-white/5 shadow-lg">
                        <h3 className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest">VAT Collected</h3>
                        <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-3">{formatAmount(filteredData.totalVAT)}</p>
                    </Card>
                    <Card className="border-gray-100 dark:border-white/5 shadow-lg">
                        <h3 className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest">WHT Suffered</h3>
                        <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-3">{formatAmount(filteredData.totalWHT)}</p>
                    </Card>
                    <Card className="border-gray-100 dark:border-white/5 shadow-lg">
                        <h3 className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest">PAYE Estimated</h3>
                        <p className="text-2xl font-black text-green-600 dark:text-green-400 mt-3">{formatAmount(filteredData.totalPAYE)}</p>
                    </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="border-gray-100 dark:border-white/5 shadow-xl overflow-hidden">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 p-4 pb-0">Invoice Schedule (VAT)</h3>
                        <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-dark-tertiary">
                            <tr>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Issue Date</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Customer</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">VAT</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredData.invoices.length > 0 ? filteredData.invoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4 text-gray-500 dark:text-gray-400 font-mono text-sm">{new Date(invoice.issueDate).toLocaleDateString()}</td>
                                    <td className="p-4 text-gray-900 dark:text-white font-bold text-sm">{invoice.customer}</td>
                                    <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">{formatAmount(invoice.vat)}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={3} className="text-center py-20 text-gray-400 font-medium">No invoices found for this period.</td></tr>
                            )}
                            </tbody>
                        </table>
                        </div>
                    </Card>
                    <Card className="border-gray-100 dark:border-white/5 shadow-xl">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">CIT Estimator</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm font-medium"><span className="text-gray-500 dark:text-gray-400">Total Revenue:</span> <span className="font-mono font-bold text-green-600 dark:text-green-400">{formatAmount(filteredData.revenue)}</span></div>
                            <div className="flex justify-between items-center text-sm font-medium"><span className="text-gray-500 dark:text-gray-400">Total Expenses:</span> <span className="font-mono font-bold text-red-600 dark:text-red-400">({formatAmount(filteredData.expenses)})</span></div>
                             <hr className="border-gray-100 dark:border-gray-800 !my-4"/>
                            <div className="flex justify-between items-center text-lg font-black"><span className="text-gray-900 dark:text-white">Assessable Profit:</span> <span className="font-mono text-gray-900 dark:text-white">{formatAmount(filteredData.assessableProfit)}</span></div>
                             <hr className="border-gray-100 dark:border-gray-800 !my-4"/>
                            <div className="flex justify-between items-center text-sm font-medium"><span className="text-gray-500 dark:text-gray-400">Applicable CIT Rate:</span> <span className="font-mono font-bold text-orange-600 dark:text-orange-400">{filteredData.citRate}%</span></div>
                            <div className="flex justify-between items-center text-xl font-black bg-orange-50 dark:bg-orange-500/10 p-5 rounded-2xl border border-orange-100 dark:border-orange-500/20"><span className="text-orange-700 dark:text-orange-300">Est. CIT Payable:</span> <span className="font-mono text-orange-700 dark:text-orange-300">{formatAmount(filteredData.estimatedCIT)}</span></div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
