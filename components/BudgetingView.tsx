
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from './ui/Card';
import type { Budget } from '../types';
import { useToast } from './ui/Toast';

interface BudgetingViewProps {
    budgets: Budget[];
    onSaveBudgets: (updatedBudgets: Budget[]) => void;
    expenseCategories: string[];
}

const formatNaira = (amount: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

export const BudgetingView: React.FC<BudgetingViewProps> = ({ budgets, onSaveBudgets, expenseCategories }) => {
    const { showToast } = useToast();
    const [editableBudgets, setEditableBudgets] = useState<Budget[]>([]);

    useEffect(() => {
        const budgetMap = new Map(budgets.map(b => [b.category, b]));
        const allBudgets = expenseCategories.map(cat => (
            budgetMap.get(cat) || { category: cat, amount: 0 }
        ));
        setEditableBudgets(allBudgets);
    }, [budgets, expenseCategories]);

    const handleAmountChange = (category: string, amount: string) => {
        const numericAmount = parseFloat(amount) || 0;
        setEditableBudgets(prev => 
            prev.map(b => b.category === category ? { ...b, amount: numericAmount } : b)
        );
    };

    const handleSave = () => {
        onSaveBudgets(editableBudgets.filter(b => b.amount > 0));
        showToast("Budgets saved successfully!", "success");
    };
    
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Budgeting</h2>
                    <p className="text-gray-400 mt-1">Set and track your monthly spending goals.</p>
                </div>
                <button onClick={handleSave} className="bg-brand-cyan hover:bg-brand-cyan/80 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                    Save Budgets
                </button>
            </div>

            <Card>
                <div className="overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-dark-tertiary">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-gray-400">Expense Category</th>
                                <th className="p-4 text-sm font-semibold text-gray-400">Monthly Budget (NGN)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                           {editableBudgets.map(budget => (
                               <tr key={budget.category}>
                                   <td className="p-4 text-white font-medium">{budget.category}</td>
                                   <td className="p-4">
                                       <input 
                                        type="number"
                                        value={budget.amount || ''}
                                        onChange={(e) => handleAmountChange(budget.category, e.target.value)}
                                        className="w-full max-w-xs bg-dark-secondary border border-gray-600 rounded-lg p-2 text-white placeholder-gray-500 font-mono"
                                        placeholder="0.00"
                                       />
                                   </td>
                               </tr>
                           ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
