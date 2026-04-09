
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
         <Card className="h-full overflow-hidden flex flex-col">
            <h3 className="text-xl font-bold text-white mb-4">Payroll Run History</h3>
            <div className="overflow-y-auto flex-grow -mr-6 pr-4">
                <table className="w-full text-left">
                    <thead className="sticky top-0 bg-dark-tertiary z-10">
                        <tr>
                            <th className="p-3 text-sm font-semibold text-gray-400">Period</th>
                            <th className="p-3 text-sm font-semibold text-gray-400">Net Payout</th>
                            <th className="p-3 text-sm font-semibold text-gray-400">Employees</th>
                            <th className="p-3 text-sm font-semibold text-gray-400">Run Date</th>
                            <th className="p-3 text-sm font-semibold text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {runs.map(run => (
                            <tr key={run.id} className="hover:bg-dark-secondary/50">
                                <td className="p-3 text-white font-medium">{run.period}</td>
                                <td className="p-3 font-mono text-brand-cyan">{formatAmount(run.summary.totalNet)}</td>
                                <td className="p-3 text-gray-300">{run.summary.employeeCount}</td>
                                <td className="p-3 text-gray-400 text-sm">{new Date(run.runDate).toLocaleDateString()}</td>
                                <td className="p-3 text-right">
                                    <button onClick={() => onViewDetails(run)} className="text-brand-cyan hover:text-white font-semibold text-sm py-1 px-3 rounded-md border border-brand-cyan/50 hover:bg-brand-cyan/20">View Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {runs.length === 0 && <p className="text-center p-8 text-gray-500">No payroll history found.</p>}
            </div>
        </Card>
    );
};
