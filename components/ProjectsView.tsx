
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-dark-tertiary rounded-2xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-6">Create New Project</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Project Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Q4 Marketing Campaign" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            autoFocus
                            required 
                            className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan" 
                        />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-dark-secondary">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-brand-cyan text-black font-bold hover:bg-brand-cyan/80">Save Project</button>
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
            const income = projectTxns.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
            const expenses = projectTxns.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
            return {
                ...project,
                income,
                expenses,
                net: income - expenses
            };
        });
    }, [projects, transactions]);

    return (
        <>
            <NewProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={onAddProject} />
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-white">Projects</h2>
                        <p className="text-gray-400 mt-1">Track profitability by project or cost center.</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="bg-brand-cyan hover:bg-brand-cyan/80 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(0,245,212,0.2)]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        New Project
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {projectFinancials.map(proj => (
                        <Card key={proj.id} className="relative overflow-hidden group hover:border-brand-cyan/30 transition-all duration-300">
                             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                             </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-white mb-1 truncate">{proj.name}</h3>
                                <span className="text-xs text-gray-500 font-mono">ID: {proj.id.slice(-6)}</span>
                                
                                <div className="mt-6 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-400">Total Income</span>
                                        <span className="font-mono text-green-400 font-medium">{formatAmount(proj.income)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-400">Total Expenses</span>
                                        <span className="font-mono text-red-400 font-medium">{formatAmount(proj.expenses)}</span>
                                    </div>
                                    <div className="h-px bg-gray-700/50 my-2"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-white">Net Profit</span>
                                        <span className={`font-mono font-bold ${proj.net >= 0 ? 'text-brand-cyan' : 'text-brand-pink'}`}>
                                            {formatAmount(proj.net)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {projectFinancials.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center p-12 text-center bg-dark-tertiary/30 rounded-2xl border border-dashed border-gray-700">
                             <div className="p-4 bg-dark-secondary rounded-full mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                             </div>
                            <h3 className="text-lg font-bold text-white">No Projects Yet</h3>
                            <p className="text-gray-400 mt-2 max-w-sm">Create a project to track expenses and revenue for specific jobs, clients, or departments.</p>
                            <button onClick={() => setIsModalOpen(true)} className="mt-6 text-brand-cyan hover:underline text-sm font-semibold">Create your first project</button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
