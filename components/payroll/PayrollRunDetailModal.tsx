
import React from 'react';
import type { PayrollRun } from '../../types';
import { useCurrency } from '../ui/CurrencyProvider';

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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-dark-tertiary rounded-2xl p-8 w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex-shrink-0">
                    <h3 className="text-xl font-bold text-white mb-2">Payroll Details for {run.period}</h3>
                    <p className="text-gray-400 mb-4">Run on {new Date(run.runDate).toLocaleString()}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                        <button onClick={handleDownloadPaymentSchedule} className="px-3 py-1.5 bg-blue-500/10 border border-blue-400/50 text-blue-300 text-sm rounded-md hover:bg-blue-500/20">Download Payment Schedule</button>
                        <button onClick={handleDownloadPAYESchedule} className="px-3 py-1.5 bg-orange-500/10 border border-orange-400/50 text-orange-300 text-sm rounded-md hover:bg-orange-500/20">Download PAYE Schedule</button>
                        <button onClick={handleDownloadPensionSchedule} className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-400/50 text-cyan-300 text-sm rounded-md hover:bg-cyan-500/20">Download Pension Schedule</button>
                    </div>
                </div>

                <div className="overflow-y-auto flex-grow pr-2 -mr-4">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-dark-tertiary">
                            <tr>
                                <th className="p-2 text-sm text-gray-400">Employee</th>
                                <th className="p-2 text-sm text-gray-400">Total Income</th>
                                <th className="p-2 text-sm text-gray-400">Total Deductions</th>
                                <th className="p-2 text-sm text-gray-400">Net Salary</th>
                            </tr>
                        </thead>
                         <tbody className="divide-y divide-gray-800">
                             {run.payslips.map(p => (
                                 <tr key={p.employeeId}>
                                     <td className="p-2 text-white">{p.employeeName}</td>
                                     <td className="p-2 font-mono text-gray-300">{formatAmount(p.totalIncome)}</td>
                                     <td className="p-2 font-mono text-red-400">({formatAmount(p.totalDeductions)})</td>
                                     <td className="p-2 font-mono font-semibold text-brand-cyan">{formatAmount(p.netSalary)}</td>
                                 </tr>
                             ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end pt-6 mt-6 border-t border-gray-700 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-gray-300 hover:bg-dark-secondary">Close</button>
                </div>
            </div>
        </div>
    );
};
