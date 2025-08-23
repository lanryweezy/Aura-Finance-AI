
import React, { useState } from 'react';
import { Card } from './ui/Card';
import type { Account } from '../types';

interface ChartOfAccountsViewProps {
    accounts: Account[];
    setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
}

const NewAccountModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: (account: Account) => void;
}> = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<Account['type']>('Expense');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !type) {
            alert('Please provide a name and type for the account.');
            return;
        }
        onAdd({ name, type, description });
        onClose();
    };
    
    if(!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-dark-tertiary rounded-2xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-6">Create New Account</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Account Name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan" />
                    <select value={type} onChange={e => setType(e.target.value as Account['type'])} className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan">
                        <option value="Asset">Asset</option>
                        <option value="Liability">Liability</option>
                        <option value="Equity">Equity</option>
                        <option value="Revenue">Revenue</option>
                        <option value="Expense">Expense</option>
                    </select>
                    <textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan" rows={3}></textarea>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-dark-secondary">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-brand-cyan text-black font-bold hover:bg-brand-cyan/80">Save Account</button>
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
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Chart of Accounts</h2>
                    <p className="text-gray-400 mt-1">Manage the categories for your financial records.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-brand-cyan hover:bg-brand-cyan/80 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    New Account
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {accountTypes.map(type => (
                    <Card key={type}>
                        <h3 className="text-xl font-bold text-brand-cyan mb-4">{type}s</h3>
                        <ul className="space-y-2">
                           {accounts.filter(a => a.type === type).map(account => (
                               <li key={account.name} className="p-3 bg-dark-secondary rounded-lg">
                                   <p className="text-white font-medium">{account.name}</p>
                                   {account.description && <p className="text-sm text-gray-400">{account.description}</p>}
                               </li>
                           ))}
                           {accounts.filter(a => a.type === type).length === 0 && <p className="text-gray-500 text-sm">No {type} accounts.</p>}
                        </ul>
                    </Card>
                ))}
            </div>
        </div>
        </>
    );
};
