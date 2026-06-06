
import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { AdvancedFilter } from '../ui/AdvancedFilter';
import { exportToCSV } from '../../services/exportService';
import type { PayrollRun } from '../../types';
import { useCurrency } from '../ui/CurrencyProvider';

interface PayrollHistoryProps {
    runs: PayrollRun[];
    onViewDetails: (run: PayrollRun) => void;
}

export const PayrollHistory: React.FC<PayrollHistoryProps> = ({ runs, onViewDetails }) => {
    const { formatAmount } = useCurrency();
    const [filters, setFilters] = useState<Record<string, any>>({});

    const filteredRuns = useMemo(() => {
        return runs.filter(run => {
            if (filters.period && !run.period.toLowerCase().includes(filters.period.toLowerCase())) return false;
            if (filters.amount_min && run.summary.totalNet < Number(filters.amount_min)) return false;
            if (filters.amount_max && run.summary.totalNet > Number(filters.amount_max)) return false;
            if (filters.start_date && new Date(run.runDate) < new Date(filters.start_date)) return false;
            if (filters.end_date && new Date(run.runDate) > new Date(filters.end_date)) return false;
            return true;
        });
    }, [runs, filters]);

    return (
         <Card className="h-full overflow-hidden flex flex-col border-gray-100 dark:border-white/5">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-aura-gray-900 dark:text-white">Payroll Run History</h3>
            </div>

            <AdvancedFilter
                onFilter={setFilters}
                onExport={() => exportToCSV('payroll_history', filteredRuns)}
                options={[
                    { label: 'Period', field: 'period', type: 'text' },
                    { label: 'Start Date', field: 'start_date', type: 'date' },
                    { label: 'End Date', field: 'end_date', type: 'date' },
                    { label: 'Net Payout Range', field: 'amount', type: 'number-range' }
                ]}
            />

            <div className="overflow-y-auto flex-grow -mr-6 pr-4">
                <table className="w-full text-left">
                    <thead className="bg-aura-gray-50 dark:bg-dark-tertiary">
                        <tr>
                            <th className="p-4 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400">Period</th>
                            <th className="p-4 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400 text-right">Net Payout</th>
                            <th className="p-4 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400 text-center">Employees</th>
                            <th className="p-4 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400">Run Date</th>
                            <th className="p-4 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredRuns.map(run => (
                            <tr key={run.id} className="hover:bg-aura-gray-50/50 dark:hover:bg-dark-secondary/50 transition-colors group">
                                <td className="p-3 text-aura-gray-900 dark:text-white font-bold">{run.period}</td>
                                <td className="p-3 font-mono text-brand-cyan text-right">{formatAmount(run.summary.totalNet)}</td>
                                <td className="p-3 text-aura-gray-600 dark:text-gray-300 text-center font-bold">{run.summary.employeeCount}</td>
                                <td className="p-3 text-gray-500 dark:text-gray-400 text-sm">{new Date(run.runDate).toLocaleDateString()}</td>
                                <td className="p-3 text-right">
                                    <button onClick={() => onViewDetails(run)} className="text-brand-cyan hover:text-white font-bold text-xs uppercase tracking-widest py-1.5 px-4 rounded-lg border border-brand-cyan/50 hover:bg-brand-cyan/20 transition-all active:scale-95">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredRuns.length === 0 && <p className="text-center p-8 text-gray-500">No payroll runs found matching filters.</p>}
            </div>
        </Card>
    );
};
