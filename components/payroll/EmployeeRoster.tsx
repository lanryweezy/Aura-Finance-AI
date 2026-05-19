
import React from 'react';
import { Card } from '../ui/Card';
import type { Employee } from '../../types';
import { useCurrency } from '../ui/CurrencyProvider';

interface EmployeeRosterProps {
    employees: Employee[];
    onEdit: (employee: Employee) => void;
    onRemove: (id: string) => void;
}

export const EmployeeRoster: React.FC<EmployeeRosterProps> = ({ employees, onEdit, onRemove }) => {
    const { formatAmount } = useCurrency();
    
    return (
        <Card className="h-full overflow-hidden flex flex-col border-gray-100 dark:border-white/5 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Employee Roster ({employees.length})</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-dark-tertiary">
                        <tr>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Employee</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Job Title</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Gross Salary</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {employees.map(emp => (
                            <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-dark-secondary/50 transition-colors">
                                <td className="p-4 text-gray-900 dark:text-white font-bold">
                                    <div className="flex flex-col">
                                        <span>{emp.name}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{emp.email}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-gray-600 dark:text-gray-300 font-medium">{emp.jobTitle}</td>
                                <td className="p-4 font-mono text-sm text-gray-600 dark:text-gray-300 font-bold">{formatAmount(emp.grossSalary)}</td>
                                <td className="p-4 text-right space-x-2">
                                    <button onClick={() => onEdit(emp)} className="text-brand-cyan hover:bg-brand-cyan hover:text-black font-bold text-xs py-1.5 px-4 rounded-lg border border-brand-cyan/50 transition-all">Edit</button>
                                    <button onClick={() => onRemove(emp.id)} className="text-red-500 hover:bg-red-500 hover:text-white font-bold text-xs py-1.5 px-4 rounded-lg border border-red-500/50 transition-all">Remove</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {employees.length === 0 && (
                     <div className="flex flex-col items-center justify-center p-12 text-center">
                         <div className="p-4 bg-gray-50 dark:bg-dark-secondary rounded-full mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                         </div>
                         <p className="text-gray-500 dark:text-gray-400 font-medium">No employees added yet.</p>
                     </div>
                 )}
            </div>
        </Card>
    );
};
