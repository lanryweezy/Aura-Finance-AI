
import React from 'react';
import type { PayrollRun } from '../../types';
import { useCurrency } from '../ui/CurrencyProvider';
import { generatePayrollSummaryPDF, generateAllPayslipsPDF, generatePayslipPDF } from '../../services/payrollPdfService';

interface PayrollRunDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    run: PayrollRun | null;
}

const downloadCSV = (filename: string, headers: string[], data: (string|number)[][]) => {
     let csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...data.map(e => e.join(','))].join('\n');
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export const PayrollRunDetailModal: React.FC<PayrollRunDetailModalProps> = ({ isOpen, onClose, run }) => {
    const { formatAmount } = useCurrency();
    
    if (!isOpen || !run) return null;
    
    const { currency } = useCurrency();
    const handleDownloadPaymentSchedule = () => {
        const headers = ['Employee Name', `Net Salary (${currency})`];
        const data = run.payslips.map(p => [p.employeeName, p.netSalary.toFixed(2)]);
        downloadCSV(`Payment_Schedule_${run.period.replace(' ','_')}`, headers, data);
    }
    
    const handleDownloadPAYESchedule = () => {
        const headers = ['Employee Name', `Gross Income (${currency})`, `PAYE (${currency})`];
        const data = run.payslips.map(p => [p.employeeName, p.totalIncome.toFixed(2), p.paye.toFixed(2)]);
        downloadCSV(`PAYE_Remittance_${run.period.replace(' ','_')}`, headers, data);
    }
    
    const handleDownloadPensionSchedule = () => {
        const headers = ['Employee Name', `Gross Salary (${currency})`, `Pension Contribution (${currency})`];
        const data = run.payslips.map(p => [p.employeeName, p.grossSalary.toFixed(2), p.pension.toFixed(2)]);
        downloadCSV(`Pension_Remittance_${run.period.replace(' ','_')}`, headers, data);
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-dark-tertiary rounded-2xl p-8 w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] border border-gray-100 dark:border-white/10" onClick={e => e.stopPropagation()}>
                <div className="flex-shrink-0">
                    <h3 className="text-xl font-bold text-aura-gray-900 dark:text-white mb-2">Payroll Details for {run.period}</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Run on {new Date(run.runDate).toLocaleString()}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                        <button onClick={handleDownloadPaymentSchedule} className="px-3 py-1.5 bg-blue-500/10 border border-blue-400/50 text-blue-600 dark:text-blue-300 text-sm rounded-md hover:bg-blue-500/20 transition-colors">Download Payment Schedule</button>
                        <button onClick={handleDownloadPAYESchedule} className="px-3 py-1.5 bg-orange-500/10 border border-orange-400/50 text-orange-600 dark:text-orange-300 text-sm rounded-md hover:bg-orange-500/20 transition-colors">Download PAYE Schedule</button>
                        <button onClick={handleDownloadPensionSchedule} className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-400/50 text-cyan-600 dark:text-cyan-300 text-sm rounded-md hover:bg-cyan-500/20 transition-colors">Download Pension Schedule</button>
                        <button onClick={() => generatePayrollSummaryPDF(run)} className="px-3 py-1.5 bg-brand-cyan/10 border border-brand-cyan/50 text-brand-cyan text-sm rounded-md hover:bg-brand-cyan/20 transition-colors font-bold">📄 Summary PDF</button>
                        <button onClick={() => generateAllPayslipsPDF(run)} className="px-3 py-1.5 bg-brand-purple/10 border border-brand-purple/50 text-brand-purple text-sm rounded-md hover:bg-brand-purple/20 transition-colors font-bold">📄 All Payslips PDF</button>
                    </div>
                </div>

                <div className="overflow-y-auto flex-grow pr-2 -mr-4">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-aura-gray-50 dark:bg-dark-tertiary">
                            <tr>
                                <th className="p-2 text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest font-black">Employee</th>
                                <th className="p-2 text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest font-black text-right">Total Income</th>
                                <th className="p-2 text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest font-black text-right">Total Deductions</th>
                                 <th className="p-2 text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest font-black text-right">Net Salary</th>
                                 <th className="p-2 text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest font-black text-right">PDF</th>
                             </tr>
                         </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                              {run.payslips.map(p => (
                                  <tr key={p.employeeId} className="hover:bg-aura-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                      <td className="p-3 text-aura-gray-900 dark:text-white font-medium">{p.employeeName}</td>
                                      <td className="p-3 font-mono text-aura-gray-600 dark:text-gray-300 text-right">{formatAmount(p.totalIncome)}</td>
                                      <td className="p-3 font-mono text-red-600 dark:text-red-400 text-right">({formatAmount(p.totalDeductions)})</td>
                                      <td className="p-3 font-mono font-black text-brand-cyan text-right">{formatAmount(p.netSalary)}</td>
                                      <td className="p-3 text-right">
                                        <button
                                            onClick={() => generatePayslipPDF(p, run.period)}
                                            className="text-xs text-brand-cyan hover:underline"
                                            aria-label={`Download payslip for ${p.employeeName}`}
                                        >
                                            📄
                                        </button>
                                      </td>
                                  </tr>
                              ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end pt-6 mt-6 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-aura-gray-600 dark:text-gray-300 hover:bg-aura-gray-100 dark:hover:bg-dark-secondary font-bold transition-all">Close</button>
                </div>
            </div>
        </div>
    );
};
