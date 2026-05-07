
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
                    <h2 className="text-3xl font-bold text-white">Tax Filing Assistant</h2>
                    <p className="text-gray-400 mt-1">Generate reports for your VAT, WHT, and CIT filings.</p>
                </div>
                <button onClick={handlePrint} disabled={!period.start || !period.end} className="bg-brand-cyan text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors hover:bg-brand-cyan/80 disabled:bg-gray-600 disabled:cursor-not-allowed">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    Print Report
                </button>
            </div>

            <Card>
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1">
                        <label htmlFor="start-date" className="text-sm font-medium text-gray-300">Start Date</label>
                        <input id="start-date" type="date" value={period.start} onChange={e => setPeriod(p => ({...p, start: e.target.value}))} className="w-full mt-1 bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan" />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="end-date" className="text-sm font-medium text-gray-300">End Date</label>
                        <input id="end-date" type="date" value={period.end} onChange={e => setPeriod(p => ({...p, end: e.target.value}))} className="w-full mt-1 bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan" />
                    </div>
                </div>
            </Card>

            <div ref={printRef}>
                 <h2 className="text-2xl font-bold text-white mb-4">
                    Tax Report: {period.start && period.end ? `${new Date(period.start).toLocaleDateString()} - ${new Date(period.end).toLocaleDateString()}` : 'Select a period'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="summary-card">
                        <h3 className="text-gray-400 text-sm font-medium">Total Sales (VAT-exclusive)</h3>
                        <p className="text-3xl font-bold text-brand-cyan mt-2">{formatAmount(filteredData.totalSales)}</p>
                    </Card>
                    <Card className="summary-card">
                        <h3 className="text-gray-400 text-sm font-medium">Total VAT Collected</h3>
                        <p className="text-3xl font-bold text-blue-400 mt-2">{formatAmount(filteredData.totalVAT)}</p>
                    </Card>
                    <Card className="summary-card">
                        <h3 className="text-gray-400 text-sm font-medium">Total WHT Suffered</h3>
                        <p className="text-3xl font-bold text-purple-400 mt-2">{formatAmount(filteredData.totalWHT)}</p>
                    </Card>
                    <Card className="summary-card">
                        <h3 className="text-gray-400 text-sm font-medium">Total PAYE Estimated</h3>
                        <p className="text-3xl font-bold text-green-400 mt-2">{formatAmount(filteredData.totalPAYE)}</p>
                    </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                        <h3 className="text-xl font-bold text-white mb-6">Invoice Schedule (VAT)</h3>
                        <div className="overflow-y-auto max-h-96">
                        <table className="w-full text-left">
                            <thead>
                            <tr>
                                <th className="p-4 text-sm font-semibold text-gray-400">Issue Date</th>
                                <th className="p-4 text-sm font-semibold text-gray-400">Customer</th>
                                <th className="p-4 text-sm font-semibold text-gray-400">VAT</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                            {filteredData.invoices.length > 0 ? filteredData.invoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td className="p-4 text-gray-300">{new Date(invoice.issueDate).toLocaleDateString()}</td>
                                    <td className="p-4 text-white font-medium">{invoice.customer}</td>
                                    <td className="p-4 font-mono text-blue-400">{formatAmount(invoice.vat)}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={3} className="text-center p-8 text-gray-400">No invoices.</td></tr>
                            )}
                            </tbody>
                        </table>
                        </div>
                    </Card>
                    <Card>
                        <h3 className="text-xl font-bold text-white mb-6">CIT Estimator (Period)</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-lg"><span className="text-gray-300">Total Revenue:</span> <span className="font-mono text-green-400">{formatAmount(filteredData.revenue)}</span></div>
                            <div className="flex justify-between items-center text-lg"><span className="text-gray-300">Total Expenses:</span> <span className="font-mono text-red-400">({formatAmount(filteredData.expenses)})</span></div>
                             <hr className="border-gray-700 !my-3"/>
                            <div className="flex justify-between items-center text-lg font-bold"><span className="text-white">Assessable Profit:</span> <span className="font-mono text-white">{formatAmount(filteredData.assessableProfit)}</span></div>
                             <hr className="border-gray-700 !my-3"/>
                            <div className="flex justify-between items-center"><span className="text-gray-300">Applicable CIT Rate:</span> <span className="font-mono text-orange-400">{filteredData.citRate}%</span></div>
                            <div className="flex justify-between items-center text-xl font-bold bg-dark-secondary p-3 rounded-lg"><span className="text-orange-300">Est. CIT Payable:</span> <span className="font-mono text-orange-300">{formatAmount(filteredData.estimatedCIT)}</span></div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
