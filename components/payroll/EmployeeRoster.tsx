
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
        <Card className="h-full overflow-hidden flex flex-col">
            <h3 className="text-xl font-bold text-white mb-4">Employee Roster ({employees.length})</h3>
            <div className="overflow-y-auto flex-grow -mr-6 pr-4">
                <table className="w-full text-left">
                    <thead className="sticky top-0 bg-dark-tertiary z-10">
                        <tr>
                            <th className="p-3 text-sm font-semibold text-gray-400">Employee</th>
                            <th className="p-3 text-sm font-semibold text-gray-400">Job Title</th>
                            <th className="p-3 text-sm font-semibold text-gray-400">Gross Salary</th>
                            <th className="p-3 text-sm font-semibold text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {employees.map(emp => (
                            <tr key={emp.id} className="hover:bg-dark-secondary/50">
                                <td className="p-3 text-white font-medium">
                                    <div className="flex flex-col">
                                        <span>{emp.name}</span>
                                        <span className="text-xs text-gray-400">{emp.email}</span>
                                    </div>
                                </td>
                                <td className="p-3 text-gray-300">{emp.jobTitle}</td>
                                <td className="p-3 font-mono text-gray-300">{formatAmount(emp.grossSalary)}</td>
                                <td className="p-3 text-right space-x-2">
                                    <button onClick={() => onEdit(emp)} className="text-brand-cyan hover:text-white font-semibold text-sm py-1 px-3 rounded-md border border-brand-cyan/50 hover:bg-brand-cyan/20">Edit</button>
                                    <button onClick={() => onRemove(emp.id)} className="text-red-400 hover:text-white font-semibold text-sm py-1 px-3 rounded-md border border-red-400/50 hover:bg-red-400/20">Remove</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {employees.length === 0 && <p className="text-center p-8 text-gray-500">No employees added yet.</p>}
            </div>
        </Card>
    );
};
