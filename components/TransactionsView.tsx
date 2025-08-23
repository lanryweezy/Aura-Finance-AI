
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card } from './ui/Card';
import type { CategorizedTransaction, Project, Account } from '../types';

const CATEGORY_COLOR_MAP: { [key: string]: string } = {
  // Income
  'Sales Revenue': 'bg-green-500/10 text-green-400',
  'Service Revenue': 'bg-green-500/10 text-green-400',
  'Interest Income': 'bg-green-500/10 text-green-400',
  'Capital Injection': 'bg-teal-500/10 text-teal-400',
  'Other Income': 'bg-green-500/10 text-green-400',
  // Expenses
  'Salaries & Wages': 'bg-red-500/10 text-red-400',
  'Utilities': 'bg-blue-500/10 text-blue-400',
  'Software & Subscriptions': 'bg-indigo-500/10 text-indigo-400',
  'Marketing & Advertising': 'bg-purple-500/10 text-purple-400',
  'Rent & Leases': 'bg-rose-500/10 text-rose-400',
  'Travel': 'bg-amber-500/10 text-amber-400',
  'Meals & Entertainment': 'bg-pink-500/10 text-pink-400',
  'Hardware': 'bg-cyan-500/10 text-cyan-400',
  'Bank Charges & Fees': 'bg-yellow-500/10 text-yellow-400',
  'Professional Fees': 'bg-lime-500/10 text-lime-400',
  'Legal Fees': 'bg-lime-500/10 text-lime-400',
  'Insurance': 'bg-sky-500/10 text-sky-400',
  'Repairs & Maintenance': 'bg-orange-500/10 text-orange-400',
  'Cost of Sales': 'bg-fuchsia-500/10 text-fuchsia-400',
  'COGS - Raw Materials': 'bg-fuchsia-500/10 text-fuchsia-400',
  'COGS - Direct Labor': 'bg-fuchsia-500/10 text-fuchsia-400',
  'Taxes - Corporate': 'bg-red-700/20 text-red-400',
   // Other
  'Inter-account Transfer': 'bg-gray-500/10 text-gray-400',
  "Owner's Draw": 'bg-gray-500/10 text-gray-400',
  'Miscellaneous': 'bg-stone-500/10 text-stone-400',
  'Uncategorized': 'bg-gray-600/20 text-gray-300'
};

export const DEFAULT_CATEGORIES: Account[] = [
    // Revenue
    { name: 'Sales Revenue', type: 'Revenue' },
    { name: 'Service Revenue', type: 'Revenue' },
    { name: 'Interest Income', type: 'Revenue' },
    { name: 'Other Income', type: 'Revenue' },
    // Equity
    { name: 'Capital Injection', type: 'Equity' },
    { name: "Owner's Draw", type: 'Equity' },
    // Expenses
    { name: 'Salaries & Wages', type: 'Expense' },
    { name: 'Utilities', type: 'Expense' },
    { name: 'Software & Subscriptions', type: 'Expense' },
    { name: 'Marketing & Advertising', type: 'Expense' },
    { name: 'Rent & Leases', type: 'Expense' },
    { name: 'Travel', type: 'Expense' },
    { name: 'Meals & Entertainment', type: 'Expense' },
    { name: 'Hardware', type: 'Expense' },
    { name: 'Bank Charges & Fees', type: 'Expense' },
    { name: 'Professional Fees', type: 'Expense' },
    { name: 'Legal Fees', type: 'Expense' },
    { name: 'Insurance', type: 'Expense' },
    { name: 'Repairs & Maintenance', type: 'Expense' },
    { name: 'Cost of Sales', type: 'Expense' },
    { name: 'COGS - Raw Materials', type: 'Expense' },
    { name: 'COGS - Direct Labor', type: 'Expense' },
    { name: 'Taxes - Corporate', type: 'Expense' },
    { name: 'Miscellaneous', type: 'Expense' },
    // Other / Special
    { name: 'Inter-account Transfer', type: 'Expense' },
    { name: 'Uncategorized', type: 'Expense' },
];

interface TransactionsViewProps {
  transactions: CategorizedTransaction[];
  onUpdateCategory: (transactionId: string, newCategory: string, newProjectId?: string, newReceiptUrl?: string) => void;
  onAddTransaction: (transaction: Omit<CategorizedTransaction, 'id' | 'balance'>) => void;
  projects: Project[];
  chartOfAccounts: Account[];
}

const CategoryBadge: React.FC<{ category: string; onClick?: () => void; isInteractive?: boolean }> = ({ category, onClick, isInteractive = false }) => {
  const colorClasses = CATEGORY_COLOR_MAP[category] || 'bg-brand-cyan/10 text-brand-cyan';
  const buttonClasses = isInteractive ? "cursor-pointer hover:opacity-80 transition-opacity" : "";

  return (
    <button onClick={onClick} disabled={!isInteractive} className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClasses} ${buttonClasses} flex items-center gap-1`}>
      {category}
      {isInteractive && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>}
    </button>
  );
};


const CategoryEditor: React.FC<{
    transaction: CategorizedTransaction;
    allCategories: string[];
    projects: Project[];
    onSave: (id: string, category: string, projectId?: string, receiptUrl?: string) => void;
    onClose: () => void;
}> = ({ transaction, allCategories, projects, onSave, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(transaction.category);
    const [selectedProjectId, setSelectedProjectId] = useState(transaction.projectId || '');
    const [receiptUrl, setReceiptUrl] = useState(transaction.receiptUrl || '');
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const filteredCategories = useMemo(() => {
        return allCategories.filter(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [allCategories, searchTerm]);

    const handleSave = () => {
        onSave(transaction.id, selectedCategory, selectedProjectId || undefined, receiptUrl || undefined);
    };

    return (
        <div ref={editorRef} className="absolute z-20 w-80 bg-dark-primary border border-gray-700 rounded-lg shadow-xl mt-2 p-3 flex flex-col gap-3">
            <input
                type="text"
                placeholder="Search category..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
                className="w-full bg-dark-secondary border border-gray-600 rounded-md p-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan"
            />
            <div className="max-h-36 overflow-y-auto flex-grow border-y border-gray-700 py-1">
                {filteredCategories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`block w-full text-left px-3 py-1.5 text-sm rounded-md ${selectedCategory === cat ? 'bg-brand-cyan/20 text-brand-cyan' : 'text-white hover:bg-brand-cyan/10'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan text-sm">
                <option value="">No Project</option>
                {projects.map(proj => <option key={proj.id} value={proj.id}>{proj.name}</option>)}
            </select>
            <input
                type="text"
                placeholder="Receipt URL (optional)"
                value={receiptUrl}
                onChange={e => setReceiptUrl(e.target.value)}
                className="w-full bg-dark-secondary border border-gray-600 rounded-md p-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan"
            />
            <div className="flex justify-end gap-2 mt-2">
                <button onClick={onClose} className="px-3 py-1 text-xs rounded-md text-gray-300 hover:bg-dark-secondary">Cancel</button>
                <button onClick={handleSave} className="px-3 py-1 text-xs rounded-md bg-brand-cyan text-black font-bold">Save</button>
            </div>
        </div>
    );
};

const AddTransactionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: (transaction: Omit<CategorizedTransaction, 'id' | 'balance'>) => void;
    categories: string[];
    projects: Project[];
}> = ({ isOpen, onClose, onAdd, categories, projects }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [narration, setNarration] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'debit' | 'credit'>('debit');
    const [category, setCategory] = useState('Uncategorized');
    const [projectId, setProjectId] = useState('');
    const [receiptUrl, setReceiptUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (!narration || !numericAmount || numericAmount <= 0 || !date) {
            alert('Please fill in all fields with valid values.');
            return;
        }
        onAdd({
            date: new Date(date).toISOString(),
            narration,
            amount: numericAmount,
            type,
            category,
            projectId: projectId || undefined,
            receiptUrl: receiptUrl || undefined,
        });
        onClose();
    };

    useEffect(() => {
      if(isOpen) {
        setDate(new Date().toISOString().split('T')[0]);
        setNarration('');
        setAmount('');
        setType('debit');
        setCategory('Uncategorized');
        setProjectId('');
        setReceiptUrl('');
      }
    }, [isOpen]);
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-dark-tertiary rounded-2xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-6">Add New Transaction</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan" />
                    </div>
                     <input type="text" placeholder="Narration / Description" value={narration} onChange={e => setNarration(e.target.value)} required className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan" />
                    <input type="number" placeholder="Amount (NGN)" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan" />

                    <div className="flex gap-2 bg-dark-secondary p-1 rounded-lg">
                        <button type="button" onClick={() => setType('debit')} className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${type === 'debit' ? 'bg-brand-pink text-white' : 'text-gray-400 hover:bg-dark-primary'}`}>Debit (Money Out)</button>
                        <button type="button" onClick={() => setType('credit')} className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${type === 'credit' ? 'bg-brand-cyan text-black' : 'text-gray-400 hover:bg-dark-primary'}`}>Credit (Money In)</button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan">
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                         </select>
                         <select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan">
                            <option value="">No Project</option>
                            {projects.map(proj => <option key={proj.id} value={proj.id}>{proj.name}</option>)}
                         </select>
                    </div>

                     <input type="text" placeholder="Receipt URL (optional)" value={receiptUrl} onChange={e => setReceiptUrl(e.target.value)} className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan" />
                    
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-dark-secondary">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-brand-cyan text-black font-bold hover:bg-brand-cyan/80">Save Transaction</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions, onUpdateCategory, onAddTransaction, projects, chartOfAccounts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'debit' | 'credit'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  const allAvailableCategories = useMemo(() => {
    return [...new Set(chartOfAccounts.map(a => a.name))].sort();
  }, [chartOfAccounts]);
  
  const categoriesForFilter = useMemo(() => ['all', ...allAvailableCategories], [allAvailableCategories]);

  const filteredTransactions = useMemo(() => {
    return [...transactions]
      .filter(t => {
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
        if (projectFilter !== 'all' && t.projectId !== projectFilter) return false;
        if (searchTerm && !t.narration.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        
        if (dateFilter.start) {
            const startDate = new Date(dateFilter.start);
            startDate.setHours(0, 0, 0, 0);
            if (new Date(t.date) < startDate) return false;
        }
        if (dateFilter.end) {
            const endDate = new Date(dateFilter.end);
            endDate.setHours(23, 59, 59, 999);
            if (new Date(t.date) > endDate) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, typeFilter, categoryFilter, dateFilter, projectFilter]);

  const handleCategorySave = (transactionId: string, newCategory: string, newProjectId?: string, newReceiptUrl?: string) => {
    onUpdateCategory(transactionId, newCategory, newProjectId, newReceiptUrl);
    setEditingId(null);
  };

  const getProjectName = (projectId?: string) => {
    return projects.find(p => p.id === projectId)?.name;
  }

  return (
    <>
    <AddTransactionModal 
      isOpen={isAddModalOpen} 
      onClose={() => setIsAddModalOpen(false)} 
      onAdd={onAddTransaction}
      categories={allAvailableCategories}
      projects={projects}
    />
    <Card className="h-full overflow-hidden flex flex-col">
       <div className="flex justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Transactions Ledger</h2>
          <p className="text-gray-400 mt-1">Search, filter, and modify your financial data.</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-brand-cyan hover:bg-brand-cyan/80 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Add Transaction
        </button>
      </div>
      
       {/* Filter controls */}
       <div className="flex flex-col gap-4 mb-6">
         <input
           type="text"
           placeholder="Search narration..."
           value={searchTerm}
           onChange={e => setSearchTerm(e.target.value)}
           className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan"
           aria-label="Search by narration"
         />
         <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
             <select
               value={typeFilter}
               onChange={e => setTypeFilter(e.target.value as any)}
               className="bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan"
               aria-label="Filter by transaction type"
             >
               <option value="all">All Types</option>
               <option value="credit">Credit</option>
               <option value="debit">Debit</option>
             </select>
             <select
               value={categoryFilter}
               onChange={e => setCategoryFilter(e.target.value)}
               className="bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan"
               aria-label="Filter by category"
             >
               {categoriesForFilter.map(cat => (
                 <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
               ))}
             </select>
             <select
               value={projectFilter}
               onChange={e => setProjectFilter(e.target.value)}
               className="bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan"
               aria-label="Filter by project"
             >
                <option value="all">All Projects</option>
                {projects.map(proj => <option key={proj.id} value={proj.id}>{proj.name}</option>)}
             </select>
            <input
              type="date"
              value={dateFilter.start}
              onChange={e => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
              className="bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan"
              aria-label="Start date filter"
            />
            <input
              type="date"
              value={dateFilter.end}
              onChange={e => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
              className="bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan"
              aria-label="End date filter"
            />
         </div>
       </div>

      <div className="overflow-y-auto flex-grow">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-dark-tertiary z-10">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-400">Date</th>
              <th className="p-4 text-sm font-semibold text-gray-400">Narration</th>
              <th className="p-4 text-sm font-semibold text-gray-400">Amount</th>
              <th className="p-4 text-sm font-semibold text-gray-400">Category</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredTransactions.map((t) => (
              <tr key={t.id} className="hover:bg-dark-secondary/50">
                <td className="p-4 whitespace-nowrap text-gray-300">{new Date(t.date).toLocaleDateString()}</td>
                <td className="p-4 max-w-sm text-white">
                    <div className="flex flex-col">
                        <span className="truncate" title={t.narration}>{t.narration}</span>
                        {t.projectId && <span className="text-xs text-brand-purple">{getProjectName(t.projectId)}</span>}
                    </div>
                </td>
                <td className={`p-4 font-mono ${t.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                  {t.type === 'credit' ? '+' : '-'} {formatNaira(t.amount)}
                </td>
                <td className="p-4 relative">
                    <div className="flex items-center gap-2">
                        {t.receiptUrl && <a href={t.receiptUrl} target="_blank" rel="noopener noreferrer" title="View Receipt" className="text-gray-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.59a2 2 0 0 1-2.83-2.83l.79-.79"/></svg></a>}
                        <CategoryBadge category={t.category} onClick={() => setEditingId(t.id)} isInteractive={true} />
                    </div>
                  {editingId === t.id && (
                    <CategoryEditor
                        transaction={t}
                        allCategories={allAvailableCategories}
                        projects={projects}
                        onSave={handleCategorySave}
                        onClose={() => setEditingId(null)}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
         {filteredTransactions.length === 0 && (
          <div className="text-center py-10 text-gray-500">
              <p>No transactions match your filters.</p>
          </div>
        )}
      </div>
    </Card>
    </>
  );
};
