
import React from 'react';
import { Card } from '../ui/Card';
import type { PayrollRun } from '../../types';
import { useCurrency } from '../ui/CurrencyProvider';

interface PayrollHistoryProps {
    runs: PayrollRun[];
    onViewDetails: (run: PayrollRun) => void;
}

export const PayrollHistory: React.FC<PayrollHistoryProps> = ({ runs, onViewDetails }) => {
    const { formatAmount } = useCurrency();
    return (
         <Card className="h-full overflow-hidden flex flex-col border-gray-100 dark:border-white/5 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Payroll Run History</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-dark-tertiary">
                        <tr>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Period</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Net Payout</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Employees</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Run Date</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {runs.map(run => (
                            <tr key={run.id} className="hover:bg-gray-50 dark:hover:bg-dark-secondary/50 transition-colors">
                                <td className="p-4 text-gray-900 dark:text-white font-bold">{run.period}</td>
                                <td className="p-4 font-mono font-bold text-brand-cyan">{formatAmount(run.summary.totalNet)}</td>
                                <td className="p-4 text-sm text-gray-600 dark:text-gray-300 font-medium">{run.summary.employeeCount}</td>
                                <td className="p-4 text-gray-500 dark:text-gray-400 text-xs font-mono">{new Date(run.runDate).toLocaleDateString()}</td>
                                <td className="p-4 text-right">
                                    <button onClick={() => onViewDetails(run)} className="text-brand-cyan hover:bg-brand-cyan hover:text-black font-bold text-xs py-1.5 px-4 rounded-lg border border-brand-cyan/50 transition-all">View Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {runs.length === 0 && (
                     <div className="flex flex-col items-center justify-center p-12 text-center">
                         <div className="p-4 bg-gray-50 dark:bg-dark-secondary rounded-full mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v10"/><path d="M18 4v12"/><path d="M6 8v6"/><rect x="2" y="20" width="20" height="2" rx="1"/></svg>
                         </div>
                         <p className="text-gray-500 dark:text-gray-400 font-medium">No payroll history found.</p>
                     </div>
                 )}
            </div>
        </Card>
    );
};
