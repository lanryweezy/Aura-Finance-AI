
import React, { useState, useMemo } from 'react';
import { Card } from './ui/Card';
import type { Project, CategorizedTransaction } from '../types';
import { useCurrency } from './ui/CurrencyProvider';

interface ProjectsViewProps {
    projects: Project[];
    transactions: CategorizedTransaction[];
    onAddProject: (name: string) => void;
}

const NewProjectModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: (name: string) => void;
}> = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onAdd(name);
        setName('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-dark-tertiary rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/10" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-aura-gray-900 dark:text-white mb-6">Create New Project</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-aura-gray-500 dark:text-gray-400 mb-1 block uppercase tracking-widest font-black text-[10px]">Project Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Q4 Marketing Campaign" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            autoFocus
                            required 
                            className="w-full bg-aura-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-aura-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-xl text-aura-gray-600 dark:text-gray-300 hover:bg-aura-gray-100 dark:hover:bg-dark-secondary transition-all font-bold">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-brand-cyan text-black font-bold hover:bg-brand-cyan/90 transition-all active:scale-95 shadow-lg shadow-brand-cyan/20">Save Project</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const ProjectsView: React.FC<ProjectsViewProps> = ({ projects, transactions, onAddProject }) => {
    const { formatAmount } = useCurrency();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const projectFinancials = useMemo(() => {
        return projects.map(project => {
            const projectTxns = transactions.filter(t => t.projectId === project.id);

            // ⚡ Bolt Optimization: Single pass for project income/expenses, avoiding O(N) array allocations from .filter().reduce()
            let income = 0;
            let expenses = 0;
            for (let i = 0; i < projectTxns.length; i++) {
                if (projectTxns[i].type === 'credit') {
                    income += projectTxns[i].amount;
                } else if (projectTxns[i].type === 'debit') {
                    expenses += projectTxns[i].amount;
                }
            }

            const net = income - expenses;
            const margin = income > 0 ? (net / income) * 100 : 0;
            const progress = project.budget ? (expenses / project.budget) * 100 : 0;

            return {
                ...project,
                income,
                expenses,
                net,
                margin,
                progress
            };
        });
    }, [projects, transactions]);

    return (
        <>
            <NewProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={onAddProject} />
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-aura-gray-900 dark:text-white">Projects</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium">Track profitability by project or cost center.</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="bg-brand-cyan hover:bg-brand-cyan/90 text-black font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-brand-cyan/20 active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        New Project
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {projectFinancials.map(proj => (
                        <Card key={proj.id} className="relative overflow-hidden group hover:border-brand-cyan/30 border-gray-100 dark:border-white/5 transition-all duration-300 shadow-xl hover:shadow-2xl">
                             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-gray-900 dark:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                             </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 truncate">{proj.name}</h3>
                                <span className="text-xs text-gray-400 font-mono font-bold tracking-tight">ID: {proj.id.slice(-6).toUpperCase()}</span>
                                
                                <div className="mt-6 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Profit Margin</span>
                                        <span className={`text-xs font-black ${proj.margin >= 20 ? 'text-green-400' : 'text-yellow-400'}`}>{proj.margin.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${proj.margin >= 20 ? 'bg-green-500' : 'bg-yellow-500'}`}
                                            style={{ width: `${Math.min(100, Math.max(0, proj.margin))}%` }}
                                        ></div>
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Income</span>
                                        <span className="font-mono text-green-600 dark:text-green-400 font-bold">{formatAmount(proj.income)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Expenses</span>
                                        <span className="font-mono text-red-600 dark:text-red-400 font-bold">{formatAmount(proj.expenses)}</span>
                                    </div>

                                    {proj.budget && (
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                                                <span>Budget Usage</span>
                                                <span>{proj.progress.toFixed(0)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 dark:bg-gray-800 h-1 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${proj.progress > 90 ? 'bg-brand-pink' : 'bg-brand-cyan'}`}
                                                    style={{ width: `${Math.min(100, proj.progress)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="h-px bg-gray-100 dark:bg-gray-700/50 my-2"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">Net Profit</span>
                                        <span className={`font-mono font-bold text-lg ${proj.net >= 0 ? 'text-brand-cyan' : 'text-brand-pink'}`}>
                                            {formatAmount(proj.net)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {projectFinancials.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center p-16 text-center bg-aura-gray-50/50 dark:bg-dark-tertiary/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                             <div className="p-5 bg-white dark:bg-dark-secondary rounded-2xl mb-6 shadow-xl shadow-aura-gray-200/50 dark:shadow-none">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                             </div>
                            <h3 className="text-xl font-bold text-aura-gray-900 dark:text-white">No Projects Yet</h3>
                            <p className="text-aura-gray-500 dark:text-gray-400 mt-2 max-w-sm font-medium italic">Create a project to track expenses and revenue for specific jobs, clients, or departments.</p>
                            <button onClick={() => setIsModalOpen(true)} className="mt-8 px-6 py-2.5 rounded-xl border border-brand-cyan text-brand-cyan hover:bg-brand-cyan hover:text-black transition-all font-bold">Create your first project</button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
