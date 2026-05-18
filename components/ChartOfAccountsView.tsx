
import React, { useState } from 'react';
import { Card } from './ui/Card';
import type { Account } from '../types';
import { useToast } from './ui/Toast';

interface ChartOfAccountsViewProps {
    accounts: Account[];
    setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
}

const NewAccountModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: (account: Account) => void;
}> = ({ isOpen, onClose, onAdd }) => {
    const { showToast } = useToast();
    const [name, setName] = useState('');
    const [type, setType] = useState<Account['type']>('Expense');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !type) {
            showToast('Please provide a name and type for the account.', 'error');
            return;
        }
        onAdd({ name, type, description });
        showToast('Account created successfully!', 'success');
        onClose();
    };
    
    if(!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-tertiary rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Create New Account</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Account Name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all" />
                    <select value={type} onChange={e => setType(e.target.value as Account['type'])} className="w-full bg-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all">
                        <option value="Asset">Asset</option>
                        <option value="Liability">Liability</option>
                        <option value="Equity">Equity</option>
                        <option value="Revenue">Revenue</option>
                        <option value="Expense">Expense</option>
                    </select>
                    <textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all" rows={3}></textarea>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-secondary transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-brand-cyan text-black font-bold hover:bg-brand-cyan/90 transition-all active:scale-95 shadow-lg shadow-brand-cyan/20">Save Account</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export const ChartOfAccountsView: React.FC<ChartOfAccountsViewProps> = ({ accounts, setAccounts }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddAccount = (account: Account) => {
        setAccounts(prev => [...prev, account].sort((a,b) => a.name.localeCompare(b.name)));
    };
    
    const accountTypes: Account['type'][] = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];
    
    return (
        <>
        <NewAccountModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddAccount} />
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Chart of Accounts</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 font-medium">Manage the categories for your financial records.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-brand-cyan hover:bg-brand-cyan/90 text-black font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-brand-cyan/20 active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    New Account
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {accountTypes.map(type => (
                    <Card key={type} className="border-gray-100 dark:border-white/5 shadow-xl">
                        <h3 className="text-xl font-bold text-brand-cyan mb-6">{type}s</h3>
                        <ul className="space-y-3">
                           {accounts.filter(a => a.type === type).map(account => (
                               <li key={account.name} className="p-4 bg-gray-50 dark:bg-dark-secondary rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-sm transition-all hover:shadow-md">
                                   <p className="text-gray-900 dark:text-white font-bold">{account.name}</p>
                                   {account.description && <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1 leading-tight">{account.description}</p>}
                               </li>
                           ))}
                           {accounts.filter(a => a.type === type).length === 0 && <p className="text-gray-400 dark:text-gray-500 text-sm font-medium italic text-center py-4">No {type} accounts.</p>}
                        </ul>
                    </Card>
                ))}
            </div>
        </div>
        </>
    );
};
