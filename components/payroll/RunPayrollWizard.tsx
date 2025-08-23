
import React, { useState, useEffect } from 'react';
import type { Employee, PayrollAdjustment } from '../../types';
import { calculateDeductions } from '../../services/taxCalculatorService';

interface RunPayrollWizardProps {
    isOpen: boolean;
    onClose: () => void;
    employees: Employee[];
    onRunPayroll: (period: string, adjustments: Record<string, PayrollAdjustment>) => void;
}

const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
};

export const RunPayrollWizard: React.FC<RunPayrollWizardProps> = ({ isOpen, onClose, employees, onRunPayroll }) => {
    const [step, setStep] = useState(1);
    const [period, setPeriod] = useState('');
    const [adjustments, setAdjustments] = useState<Record<string, PayrollAdjustment>>({});

    useEffect(() => {
        if (isOpen) {
            const now = new Date();
            setPeriod(now.toLocaleString('default', { month: 'long', year: 'numeric' }));
            const initialAdjustments = employees.reduce((acc, emp) => {
                acc[emp.id] = { bonus: 0, deduction: 0 };
                return acc;
            }, {} as Record<string, PayrollAdjustment>);
            setAdjustments(initialAdjustments);
        } else {
            // Reset state on close
            setStep(1);
            setPeriod('');
            setAdjustments({});
        }
    }, [isOpen, employees]);

    const handleAdjustmentChange = (employeeId: string, type: 'bonus' | 'deduction', value: string) => {
        const numericValue = parseFloat(value) || 0;
        setAdjustments(prev => ({
            ...prev,
            [employeeId]: {
                ...prev[employeeId],
                [type]: numericValue
            }
        }));
    };

    const handleConfirmRun = () => {
        onRunPayroll(period, adjustments);
        onClose();
    };
    
    const summary = employees.map(emp => {
        const adj = adjustments[emp.id] || { bonus: 0, deduction: 0 };
        const calcs = calculateDeductions(emp.grossSalary, adj.bonus, adj.deduction);
        return {
            ...calcs,
            name: emp.name,
            bonus: adj.bonus,
            oneTimeDeduction: adj.deduction
        }
    }).reduce((acc, item) => {
        acc.totalGross += item.grossSalary;
        acc.totalBonuses += item.bonus;
        acc.totalOneTimeDeductions += item.oneTimeDeduction;
        acc.totalNet += item.netSalary;
        return acc;
    }, { totalGross: 0, totalBonuses: 0, totalOneTimeDeductions: 0, totalNet: 0});

    const renderStep = () => {
        switch (step) {
            case 2: // Confirmation
                return (
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Confirm Payroll for {period}</h3>
                        <p className="text-gray-400 mb-6">Review the final figures before confirming.</p>
                        <div className="space-y-3 bg-dark-secondary p-4 rounded-lg border border-gray-700">
                             <div className="flex justify-between text-white"><span className="text-gray-400">Total Gross Salaries:</span><span className="font-mono">{formatNaira(summary.totalGross)}</span></div>
                             <div className="flex justify-between text-white"><span className="text-gray-400">Total Bonuses:</span><span className="font-mono">{formatNaira(summary.totalBonuses)}</span></div>
                             <div className="flex justify-between text-white"><span className="text-gray-400">Total One-time Deductions:</span><span className="font-mono text-red-400">({formatNaira(summary.totalOneTimeDeductions)})</span></div>
                             <hr className="border-gray-700"/>
                             <div className="flex justify-between text-white text-lg font-bold"><span className="text-gray-200">Total Net Payout:</span><span className="font-mono text-brand-cyan">{formatNaira(summary.totalNet)}</span></div>
                        </div>
                    </div>
                );
            case 1: // Adjustments
            default:
                return (
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Run Payroll for {period}</h3>
                        <p className="text-gray-400 mb-6">Enter any one-time bonuses or deductions for this period.</p>
                        <div className="overflow-y-auto max-h-[50vh] pr-2 -mr-4">
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-dark-tertiary">
                                    <tr>
                                        <th className="p-2 text-sm text-gray-400">Employee</th>
                                        <th className="p-2 text-sm text-gray-400">Bonus</th>
                                        <th className="p-2 text-sm text-gray-400">Deduction</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map(emp => (
                                        <tr key={emp.id}>
                                            <td className="p-2 text-white">{emp.name}</td>
                                            <td className="p-2">
                                                <input type="number" placeholder="0.00" value={adjustments[emp.id]?.bonus || ''} onChange={e => handleAdjustmentChange(emp.id, 'bonus', e.target.value)} className="w-full bg-dark-secondary border border-gray-600 rounded-md p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan" />
                                            </td>
                                            <td className="p-2">
                                                <input type="number" placeholder="0.00" value={adjustments[emp.id]?.deduction || ''} onChange={e => handleAdjustmentChange(emp.id, 'deduction', e.target.value)} className="w-full bg-dark-secondary border border-gray-600 rounded-md p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-dark-tertiary rounded-2xl p-8 w-full max-w-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
                {renderStep()}
                <div className="flex justify-between items-center gap-4 pt-6 mt-6 border-t border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-dark-secondary">Cancel</button>
                    <div className="flex items-center gap-4">
                        {step > 1 && <button type="button" onClick={() => setStep(s => s - 1)} className="px-4 py-2 rounded-lg text-brand-cyan hover:bg-dark-secondary">Back</button>}
                        {step < 2 ? (
                            <button type="button" onClick={() => setStep(s => s + 1)} className="px-6 py-2 rounded-lg bg-brand-cyan text-black font-bold hover:bg-brand-cyan/80">Next: Review</button>
                        ) : (
                            <button type="button" onClick={handleConfirmRun} className="px-6 py-2 rounded-lg bg-brand-cyan text-black font-bold hover:bg-brand-cyan/80">Confirm & Run Payroll</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
