
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from './ui/Card';
import type { Budget } from '../types';
import { useToast } from './ui/Toast';
import { useCurrency } from './ui/CurrencyProvider';

interface BudgetingViewProps {
    budgets: Budget[];
    onSaveBudgets: (updatedBudgets: Budget[]) => void;
    expenseCategories: string[];
}

export const BudgetingView: React.FC<BudgetingViewProps> = ({ budgets, onSaveBudgets, expenseCategories }) => {
    const { currency } = useCurrency();
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-aura-gray-900 dark:text-white">Budgeting</h2>
                    <p className="text-aura-gray-500 dark:text-gray-400 mt-1 font-medium italic">Set and track your monthly spending goals.</p>
                </div>
                <button onClick={handleSave} className="bg-brand-cyan hover:bg-brand-cyan/90 text-black font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-brand-cyan/20 active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    Save Budgets
                </button>
            </div>

            <Card className="overflow-hidden border-gray-100 dark:border-white/5 shadow-xl">
                <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-aura-gray-50 dark:bg-dark-tertiary z-10">
                            <tr>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400">Expense Category</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400 text-right">Monthly Budget ({currency})</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                           {editableBudgets.map(budget => (
                               <tr key={budget.category} className="hover:bg-aura-gray-50/50 dark:hover:bg-dark-secondary/50 transition-colors group">
                                   <td className="p-4 text-aura-gray-900 dark:text-white font-bold">{budget.category}</td>
                                   <td className="p-4 text-right">
                                       <input 
                                        type="number"
                                        value={budget.amount || ''}
                                        onChange={(e) => handleAmountChange(budget.category, e.target.value)}
                                        className="w-full max-w-[200px] bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-aura-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-mono font-bold text-right focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all shadow-sm"
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
