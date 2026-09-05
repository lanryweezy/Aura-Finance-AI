
import React, { useState, useEffect } from 'react';
import type { Employee, PayrollAdjustment } from '../../types';
import { calculateDeductions } from '../../services/taxCalculatorService';
import { useCurrency } from '../ui/CurrencyProvider';

interface RunPayrollWizardProps {
    isOpen: boolean;
    onClose: () => void;
    employees: Employee[];
    onRunPayroll: (period: string, adjustments: Record<string, PayrollAdjustment>) => void;
}

export const RunPayrollWizard: React.FC<RunPayrollWizardProps> = ({ isOpen, onClose, employees, onRunPayroll }) => {
    const { formatAmount } = useCurrency();
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
    
    // ⚡ Bolt Optimization: Single-pass .reduce() replaces chained .map().reduce() to prevent O(N) array allocation on every render
    const summary = employees.reduce((acc, emp) => {
        const adj = adjustments[emp.id] || { bonus: 0, deduction: 0 };
        const calcs = calculateDeductions(emp.grossSalary, adj.bonus, adj.deduction);
        acc.totalGross += calcs.grossSalary;
        acc.totalBonuses += adj.bonus;
        acc.totalOneTimeDeductions += adj.deduction;
        acc.totalNet += calcs.netSalary;
        return acc;
    }, { totalGross: 0, totalBonuses: 0, totalOneTimeDeductions: 0, totalNet: 0});

    const renderStep = () => {
        switch (step) {
            case 2: // Confirmation
                return (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Confirm Payroll</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Review the final figures for <span className="font-bold text-gray-900 dark:text-white">{period}</span> before confirming.</p>
                        <div className="space-y-4 bg-aura-gray-50 dark:bg-dark-secondary/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-inner">
                             <div className="flex justify-between text-sm font-medium text-aura-gray-600 dark:text-gray-400"><span>Total Gross Salaries:</span><span className="font-mono font-bold text-aura-gray-900 dark:text-white">{formatAmount(summary.totalGross)}</span></div>
                             <div className="flex justify-between text-sm font-medium text-aura-gray-600 dark:text-gray-400"><span>Total Bonuses:</span><span className="font-mono font-bold text-green-600 dark:text-green-400">+{formatAmount(summary.totalBonuses)}</span></div>
                             <div className="flex justify-between text-sm font-medium text-aura-gray-600 dark:text-gray-400"><span>Total Deductions:</span><span className="font-mono font-bold text-red-600 dark:text-red-400">-{formatAmount(summary.totalOneTimeDeductions)}</span></div>
                             <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>
                             <div className="flex justify-between text-aura-gray-900 dark:text-white text-xl font-black tracking-tight"><span>Total Net Payout:</span><span className="font-mono text-brand-cyan">{formatAmount(summary.totalNet)}</span></div>
                        </div>
                    </div>
                );
            case 1: // Adjustments
            default:
                return (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Run Payroll: {period}</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Enter any one-time bonuses or deductions for this period.</p>
                        <div className="overflow-x-auto bg-aura-gray-50/50 dark:bg-dark-secondary/30 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-inner">
                            <table className="w-full text-left">
                                <thead className="bg-aura-gray-100 dark:bg-dark-tertiary">
                                    <tr>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400">Employee</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400">Bonus</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400">Deduction</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {employees.map(emp => (
                                        <tr key={emp.id}>
                                            <td className="p-4 text-gray-900 dark:text-white font-bold text-sm">{emp.name}</td>
                                            <td className="p-2">
                                                <input type="number" placeholder="0.00" value={adjustments[emp.id]?.bonus || ''} onChange={e => handleAdjustmentChange(emp.id, 'bonus', e.target.value)} className="w-full bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-sm text-green-600 dark:text-green-400 font-bold focus:ring-2 focus:ring-brand-cyan outline-none transition-all shadow-sm" />
                                            </td>
                                            <td className="p-2">
                                                <input type="number" placeholder="0.00" value={adjustments[emp.id]?.deduction || ''} onChange={e => handleAdjustmentChange(emp.id, 'deduction', e.target.value)} className="w-full bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-sm text-red-600 dark:text-red-400 font-bold focus:ring-2 focus:ring-brand-cyan outline-none transition-all shadow-sm" />
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-tertiary rounded-3xl p-8 w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                {renderStep()}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 mt-8 border-t border-gray-100 dark:border-gray-700">
                    <button type="button" onClick={onClose} className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-aura-gray-600 dark:text-gray-300 hover:bg-aura-gray-100 dark:hover:bg-dark-secondary transition-all font-bold">Cancel</button>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {step > 1 && <button type="button" onClick={() => setStep(s => s - 1)} className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-brand-cyan border border-brand-cyan/30 hover:bg-brand-cyan/10 font-bold transition-all">Back</button>}
                        {step < 2 ? (
                            <button type="button" onClick={() => setStep(s => s + 1)} className="flex-1 sm:flex-none px-8 py-2.5 rounded-xl bg-brand-cyan text-black font-black uppercase tracking-widest text-xs hover:bg-brand-cyan/90 shadow-lg shadow-brand-cyan/20 active:scale-95 transition-all">Next: Review</button>
                        ) : (
                            <button type="button" onClick={handleConfirmRun} className="flex-1 sm:flex-none px-8 py-2.5 rounded-xl bg-brand-cyan text-black font-black uppercase tracking-widest text-xs hover:bg-brand-cyan/90 shadow-lg shadow-brand-cyan/20 active:scale-95 transition-all">Confirm & Run</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
