
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { List } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import { Card } from './ui/Card';
import { ReceiptScannerModal } from './ui/ReceiptScannerModal';
import { Tooltip } from './ui/Tooltip';
import type { CategorizedTransaction, Project, Account } from '../types';
import { useToast } from './ui/Toast';
import { useCurrency } from './ui/CurrencyProvider';
import { Icons } from './ui/Icons';
import { AdvancedFilter } from './ui/AdvancedFilter';
import { exportToCSV } from '../services/exportService';

const CATEGORY_COLOR_MAP: { [key: string]: string } = {
  // Income
  'Sales Revenue': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  'Service Revenue': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  'Interest Income': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  'Capital Injection': 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  'Other Income': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  // Expenses
  'Salaries & Wages': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  'Utilities': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  'Software & Subscriptions': 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  'Marketing & Advertising': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  'Rent & Leases': 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  'Travel': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  'Meals & Entertainment': 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
  'Hardware': 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  'Bank Charges & Fees': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  'Professional Fees': 'bg-lime-500/10 text-lime-600 dark:text-lime-400 border-lime-500/20',
  'Legal Fees': 'bg-lime-500/10 text-lime-600 dark:text-lime-400 border-lime-500/20',
  'Insurance': 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  'Repairs & Maintenance': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  'Cost of Sales': 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20',
  'COGS - Raw Materials': 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20',
  'COGS - Direct Labor': 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20',
  'Taxes - Corporate': 'bg-red-700/20 text-red-600 dark:text-red-400 border-red-500/20',
   // Other
  'Inter-account Transfer': 'bg-aura-gray-500/10 text-aura-gray-600 dark:text-gray-400 border-gray-500/20',
  "Owner's Draw": 'bg-aura-gray-500/10 text-aura-gray-600 dark:text-gray-400 border-gray-500/20',
  'Miscellaneous': 'bg-stone-500/10 text-stone-600 dark:text-stone-400 border-stone-500/20',
  'Uncategorized': 'bg-gray-600/20 text-aura-gray-600 dark:text-gray-300 border-gray-500/20'
};

interface TransactionsViewProps {
  transactions: CategorizedTransaction[];
  onUpdateCategory: (transactionId: string, newCategory: string, newProjectId?: string, newReceiptUrl?: string) => void;
  onAddTransaction: (transaction: Omit<CategorizedTransaction, 'id' | 'balance'>) => void;
  projects: Project[];
  chartOfAccounts: Account[];
}

const CategoryBadge = React.memo<{ category: string; onClick?: () => void; isInteractive?: boolean }>(({ category, onClick, isInteractive = false }) => {
  const colorClasses = CATEGORY_COLOR_MAP[category] || 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20';
  const buttonClasses = isInteractive ? "cursor-pointer hover:opacity-80 transition-opacity" : "";

  return (
    <button onClick={onClick} disabled={!isInteractive} className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border ${colorClasses} ${buttonClasses} flex items-center gap-1.5 whitespace-nowrap`}>
      {category}
      {isInteractive && <Icons.ChevronDown />}
    </button>
  );
});

const TransactionRow = React.memo<{
  transaction: CategorizedTransaction;
  formatAmount: (val: number) => string;
  getProjectName: (id?: string) => string | undefined;
  onEdit: (id: string) => void;
  isEditing: boolean;
  allAvailableCategories: string[];
  projects: Project[];
  onSave: (id: string, cat: string, proj?: string, url?: string) => void;
  onCloseEditor: () => void;
  style: React.CSSProperties;
}>(({ transaction, formatAmount, getProjectName, onEdit, isEditing, allAvailableCategories, projects, onSave, onCloseEditor, style }) => {
  return (
    <div style={style} className="flex hover:bg-white/[0.02] transition-colors group border-b border-gray-800/50">
      <div className="w-[15%] p-4 whitespace-nowrap text-gray-400 text-sm font-mono flex items-center">{new Date(transaction.date).toLocaleDateString()}</div>
      <div className="w-[45%] p-4 text-gray-200 flex items-center">
          <div className="flex flex-col min-w-0">
              <span className="truncate font-medium" title={transaction.narration}>{transaction.narration}</span>
              {transaction.projectId && <span className="text-[10px] text-brand-purple uppercase font-bold tracking-wide mt-0.5">{getProjectName(transaction.projectId)}</span>}
          </div>
      </div>
      <div className={`w-[20%] p-4 font-mono font-medium flex items-center ${transaction.type === 'credit' ? 'text-green-400' : 'text-white'}`}>
        {transaction.type === 'credit' ? '+' : ''} {formatAmount(transaction.amount)}
      </div>
      <div className="w-[20%] p-4 relative flex items-center">
          <div className="flex items-center gap-2">
              {transaction.receiptUrl && <a href={transaction.receiptUrl} target="_blank" rel="noopener noreferrer" title="View Receipt" className="text-gray-500 hover:text-white transition-colors"><Icons.Receipt /></a>}
              <CategoryBadge category={transaction.category} onClick={() => onEdit(transaction.id)} isInteractive={true} />
          </div>
        {isEditing && (
          <CategoryEditor
              transaction={transaction}
              allCategories={allAvailableCategories}
              projects={projects}
              onSave={onSave}
              onClose={onCloseEditor}
          />
        )}
      </div>
    </div>
  );
});


const CategoryEditor = React.memo<{
    transaction: CategorizedTransaction;
    allCategories: string[];
    projects: Project[];
    onSave: (id: string, category: string, projectId?: string, receiptUrl?: string) => void;
    onClose: () => void;
}>(({ transaction, allCategories, projects, onSave, onClose }) => {
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
        <div ref={editorRef} className="absolute right-0 z-30 w-80 bg-white dark:bg-dark-primary border border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl mt-2 p-4 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
            <h4 className="text-aura-gray-900 dark:text-white font-bold text-sm">Edit Transaction Details</h4>
            <input
                type="text"
                placeholder="Search category..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
                className="w-full bg-aura-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm text-aura-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan shadow-sm"
            />
            <div className="max-h-36 overflow-y-auto flex-grow border-y border-gray-100 dark:border-gray-700 py-1 scrollbar-thin">
                {filteredCategories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`block w-full text-left px-3 py-1.5 text-xs rounded-md mb-0.5 ${selectedCategory === cat ? 'bg-brand-cyan/20 text-brand-cyan font-bold' : 'text-aura-gray-600 dark:text-gray-300 hover:bg-aura-gray-50 dark:hover:bg-white/5'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            <div className="space-y-2">
                <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="w-full bg-aura-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-aura-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan text-sm shadow-sm">
                    <option value="">No Project</option>
                    {projects.map(proj => <option key={proj.id} value={proj.id}>{proj.name}</option>)}
                </select>
                <input
                    type="text"
                    placeholder="Receipt URL (optional)"
                    value={receiptUrl}
                    onChange={e => setReceiptUrl(e.target.value)}
                    className="w-full bg-aura-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm text-aura-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan shadow-sm"
                />
            </div>
            <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <button onClick={onClose} className="px-3 py-1.5 text-xs rounded-md text-aura-gray-500 dark:text-gray-300 hover:bg-aura-gray-50 dark:hover:bg-dark-secondary transition-all">Cancel</button>
                <button onClick={handleSave} className="px-3 py-1.5 text-xs rounded-md bg-brand-cyan text-black font-bold hover:bg-brand-cyan/90 transition-all active:scale-95">Save Changes</button>
            </div>
        </div>
    );
});

const AddTransactionModal = React.memo<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: (transaction: Omit<CategorizedTransaction, 'id' | 'balance'>) => void;
    categories: string[];
    projects: Project[];
}>(({ isOpen, onClose, onAdd, categories, projects }) => {
    const { showToast } = useToast();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [narration, setNarration] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'debit' | 'credit'>('debit');
    const [category, setCategory] = useState('Uncategorized');
    const [projectId, setProjectId] = useState('');
    const [receiptUrl, setReceiptUrl] = useState('');

    const { currency } = useCurrency();
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (!narration || !numericAmount || numericAmount <= 0 || !date) {
            showToast('Please fill in all fields with valid values.', 'error');
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
        <div className="fixed inset-0 bg-aura-gray-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-tertiary rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-aura-gray-900 dark:text-white mb-6">Add New Transaction</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-aura-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 block">Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-aura-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-aura-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all font-medium shadow-sm" />
                    </div>
                     <input type="text" placeholder="Narration / Description" value={narration} onChange={e => setNarration(e.target.value)} required className="w-full bg-aura-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-aura-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all font-medium shadow-sm" />
                    <input type="number" placeholder={`Amount (${currency})`} value={amount} onChange={e => setAmount(e.target.value)} required className="w-full bg-aura-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-aura-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all font-mono font-bold shadow-sm" />

                    <div className="flex gap-2 bg-aura-gray-100 dark:bg-dark-secondary p-1 rounded-xl shadow-inner">
                        <button type="button" onClick={() => setType('debit')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${type === 'debit' ? 'bg-brand-pink text-white shadow-lg' : 'text-aura-gray-500 dark:text-gray-400 hover:text-aura-gray-900 dark:hover:text-white'}`}>Debit (Out)</button>
                        <button type="button" onClick={() => setType('credit')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${type === 'credit' ? 'bg-brand-cyan text-black shadow-lg' : 'text-aura-gray-500 dark:text-gray-400 hover:text-aura-gray-900 dark:hover:text-white'}`}>Credit (In)</button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-aura-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-aura-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all font-bold shadow-sm">
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                         </select>
                         <select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full bg-aura-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-aura-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all font-bold shadow-sm">
                            <option value="">No Project</option>
                            {projects.map(proj => <option key={proj.id} value={proj.id}>{proj.name}</option>)}
                         </select>
                    </div>

                     <input type="text" placeholder="Receipt URL (optional)" value={receiptUrl} onChange={e => setReceiptUrl(e.target.value)} className="w-full bg-aura-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-aura-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all font-medium shadow-sm" />
                    
                    <div className="flex justify-end gap-4 pt-6">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-aura-gray-500 dark:text-gray-300 hover:bg-aura-gray-100 dark:hover:bg-dark-secondary transition-all font-bold">Cancel</button>
                        <button type="submit" className="px-8 py-2.5 rounded-xl bg-brand-cyan text-black font-bold hover:bg-brand-cyan/90 transition-all active:scale-95 shadow-lg shadow-brand-cyan/20">Save Transaction</button>
                    </div>
                </form>
            </div>
        </div>
    );
});


export const TransactionsView = React.memo<TransactionsViewProps>(({ transactions, onUpdateCategory, onAddTransaction, projects, chartOfAccounts }) => {
  const { formatAmount } = useCurrency();
  const { theme } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'debit' | 'credit'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>({});

  const allAvailableCategories = useMemo(() => {
    return [...new Set(chartOfAccounts.map(a => a.name))].sort();
  }, [chartOfAccounts]);

  const filteredTransactions = useMemo(() => {
    return [...transactions]
      .filter(t => {
        // Basic filters
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

        // Advanced filters
        if (advancedFilters.narration && !t.narration.toLowerCase().includes(advancedFilters.narration.toLowerCase())) return false;
        if (advancedFilters.category && t.category !== advancedFilters.category) return false;
        if (advancedFilters.projectId && t.projectId !== advancedFilters.projectId) return false;
        if (advancedFilters.startDate && new Date(t.date) < new Date(advancedFilters.startDate)) return false;
        if (advancedFilters.endDate && new Date(t.date) > new Date(advancedFilters.endDate)) return false;
        if (advancedFilters.amount_min && t.amount < parseFloat(advancedFilters.amount_min)) return false;
        if (advancedFilters.amount_max && t.amount > parseFloat(advancedFilters.amount_max)) return false;

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, typeFilter, categoryFilter, dateFilter, projectFilter, advancedFilters]);

  const { showToast } = useToast();
  const handleCategorySave = (transactionId: string, newCategory: string, newProjectId?: string, newReceiptUrl?: string) => {
    onUpdateCategory(transactionId, newCategory, newProjectId, newReceiptUrl);
    setEditingId(null);
    showToast('Transaction updated successfully.', 'success');
  };

  const getProjectName = useCallback((projectId?: string) => {
    return projects.find(p => p.id === projectId)?.name;
  }, [projects]);

  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const t = filteredTransactions[index];
    return (
      <TransactionRow
        style={style}
        transaction={t}
        formatAmount={formatAmount}
        getProjectName={getProjectName}
        onEdit={setEditingId}
        isEditing={editingId === t.id}
        allAvailableCategories={allAvailableCategories}
        projects={projects}
        onSave={handleCategorySave}
        onCloseEditor={() => setEditingId(null)}
      />
    );
  }, [filteredTransactions, formatAmount, getProjectName, editingId, allAvailableCategories, projects, handleCategorySave]);

  return (
    <>
    <AddTransactionModal 
      isOpen={isAddModalOpen} 
      onClose={() => setIsAddModalOpen(false)} 
      onAdd={onAddTransaction}
      categories={allAvailableCategories}
      projects={projects}
    />
    <ReceiptScannerModal
      isOpen={isScannerOpen}
      onClose={() => setIsScannerOpen(false)}
      onSave={onAddTransaction}
    />
    
    <Card className="h-full overflow-hidden flex flex-col p-0 border-gray-100 dark:border-white/5">
       <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-800">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-aura-gray-900 dark:text-white">Transactions Ledger</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Manage your financial records.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsScannerOpen(true)} className="bg-white dark:bg-dark-tertiary hover:bg-gray-100 dark:hover:bg-white/10 text-aura-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors border border-gray-200 dark:border-gray-700">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/><line x1="21" y1="5" x2="10" y2="5"/><line x1="21" y1="2" x2="21" y2="8"/><line x1="24" y1="5" x2="18" y2="5"/></svg>
                 Scan Receipt
              </button>
              <button onClick={() => setIsAddModalOpen(true)} className="bg-brand-cyan hover:bg-brand-cyan/80 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors flex-shrink-0 shadow-[0_0_10px_rgba(0,245,212,0.3)]">
                <Icons.Plus />
                Add Transaction
              </button>
            </div>
          </div>
          
          <AdvancedFilter
            options={[
              { label: 'Narration', field: 'narration', type: 'text' },
              { label: 'Category', field: 'category', type: 'select', options: allAvailableCategories.map(c => ({ label: c, value: c })) },
              { label: 'Project', field: 'projectId', type: 'select', options: projects.map(p => ({ label: p.name, value: p.id })) },
              { label: 'Start Date', field: 'startDate', type: 'date' },
              { label: 'End Date', field: 'endDate', type: 'date' },
              { label: 'Amount Range', field: 'amount', type: 'number-range' }
            ]}
            onFilter={setAdvancedFilters}
            onExport={() => exportToCSV('transactions', filteredTransactions)}
          />
       </div>

      <div className="overflow-x-auto flex-grow relative">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead className="sticky top-0 z-20 bg-aura-gray-50/90 dark:bg-dark-tertiary/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="p-4 text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">
                <Tooltip content="The date the transaction was recorded in your bank or manually.">Date</Tooltip>
              </th>
              <th className="p-4 text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">
                <Tooltip content="The description of the transaction.">Narration</Tooltip>
              </th>
              <th className="p-4 text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">
                <Tooltip content="The financial value of the transaction in your selected currency.">Amount</Tooltip>
              </th>
              <th className="p-4 text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">
                <Tooltip content="The accounting category assigned to this transaction.">Category</Tooltip>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
            {filteredTransactions.map((t) => (
              <tr key={t.id} className="hover:bg-aura-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                <td className="p-4 whitespace-nowrap text-gray-500 dark:text-gray-400 text-sm font-mono">{new Date(t.date).toLocaleDateString()}</td>
                <td className="p-4 max-w-sm text-aura-gray-900 dark:text-gray-200">
                    <div className="flex flex-col">
                        <span className="truncate font-medium" title={t.narration}>{t.narration}</span>
                        {t.projectId && <span className="text-[10px] text-brand-purple uppercase font-bold tracking-wide mt-0.5">{getProjectName(t.projectId)}</span>}
                    </div>
                </td>
                <td className={`p-4 font-mono font-medium ${t.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-aura-gray-900 dark:text-white'}`}>
                  {t.type === 'credit' ? '+' : ''} {formatAmount(t.amount)}
                </td>
                <td className="p-4 relative">
                    <div className="flex items-center gap-2">
                        {t.receiptUrl && <a href={t.receiptUrl} target="_blank" rel="noopener noreferrer" title="View Receipt" className="text-gray-500 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg></a>}
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
          <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-aura-gray-50 dark:bg-dark-secondary p-4 rounded-full mb-3 shadow-inner">
                 <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <h3 className="text-aura-gray-900 dark:text-white font-bold text-lg mb-1">No transactions found</h3>
              <p className="text-aura-gray-500 dark:text-gray-400 text-sm font-medium">Try adjusting your filters or search term.</p>
          </div>
        )}
      </div>
    </Card>
    </>
  );
});
