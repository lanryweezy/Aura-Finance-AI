
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { List } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import { Card } from './ui/Card';
import { ReceiptScannerModal } from './ui/ReceiptScannerModal';
import type { CategorizedTransaction, Project, Account } from '../types';
import { useToast } from './ui/Toast';
import { useCurrency } from './ui/CurrencyProvider';
import { Icons } from './ui/Icons';

const CATEGORY_COLOR_MAP: { [key: string]: string } = {
  // Income
  'Sales Revenue': 'bg-green-500/10 text-green-400 border-green-500/20',
  'Service Revenue': 'bg-green-500/10 text-green-400 border-green-500/20',
  'Interest Income': 'bg-green-500/10 text-green-400 border-green-500/20',
  'Capital Injection': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'Other Income': 'bg-green-500/10 text-green-400 border-green-500/20',
  // Expenses
  'Salaries & Wages': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Utilities': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Software & Subscriptions': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'Marketing & Advertising': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Rent & Leases': 'bg-rose-500/10 text-rose-400 border-red-500/20',
  'Travel': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Meals & Entertainment': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'Hardware': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Bank Charges & Fees': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Professional Fees': 'bg-lime-500/10 text-lime-400 border-lime-500/20',
  'Legal Fees': 'bg-lime-500/10 text-lime-400 border-lime-500/20',
  'Insurance': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'Repairs & Maintenance': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Cost of Sales': 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
  'COGS - Raw Materials': 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
  'COGS - Direct Labor': 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
  'Taxes - Corporate': 'bg-red-700/20 text-red-400 border-red-500/20',
   // Other
  'Inter-account Transfer': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  "Owner's Draw": 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  'Miscellaneous': 'bg-stone-500/10 text-stone-400 border-stone-500/20',
  'Uncategorized': 'bg-gray-600/20 text-gray-300 border-gray-500/20'
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
        <div ref={editorRef} className="absolute right-0 z-30 w-80 bg-dark-primary border border-gray-600 rounded-xl shadow-2xl mt-2 p-4 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
            <h4 className="text-white font-bold text-sm">Edit Transaction Details</h4>
            <input
                type="text"
                placeholder="Search category..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
                className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan"
            />
            <div className="max-h-36 overflow-y-auto flex-grow border-y border-gray-700 py-1 scrollbar-thin">
                {filteredCategories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`block w-full text-left px-3 py-1.5 text-xs rounded-md mb-0.5 ${selectedCategory === cat ? 'bg-brand-cyan/20 text-brand-cyan font-bold' : 'text-gray-300 hover:bg-white/5'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            <div className="space-y-2">
                <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan text-sm">
                    <option value="">No Project</option>
                    {projects.map(proj => <option key={proj.id} value={proj.id}>{proj.name}</option>)}
                </select>
                <input
                    type="text"
                    placeholder="Receipt URL (optional)"
                    value={receiptUrl}
                    onChange={e => setReceiptUrl(e.target.value)}
                    className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan"
                />
            </div>
            <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-700">
                <button onClick={onClose} className="px-3 py-1.5 text-xs rounded-md text-gray-300 hover:bg-dark-secondary">Cancel</button>
                <button onClick={handleSave} className="px-3 py-1.5 text-xs rounded-md bg-brand-cyan text-black font-bold hover:bg-brand-cyan/90">Save Changes</button>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-dark-tertiary rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-700" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-6">Add New Transaction</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan" />
                    </div>
                     <input type="text" placeholder="Narration / Description" value={narration} onChange={e => setNarration(e.target.value)} required className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan" />
                    <input type="number" placeholder={`Amount (${currency})`} value={amount} onChange={e => setAmount(e.target.value)} required className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan" />

                    <div className="flex gap-2 bg-dark-secondary p-1 rounded-lg">
                        <button type="button" onClick={() => setType('debit')} className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${type === 'debit' ? 'bg-brand-pink text-white shadow' : 'text-gray-400 hover:text-white'}`}>Debit (Out)</button>
                        <button type="button" onClick={() => setType('credit')} className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${type === 'credit' ? 'bg-brand-cyan text-black shadow' : 'text-gray-400 hover:text-white'}`}>Credit (In)</button>
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
});


export const TransactionsView = React.memo<TransactionsViewProps>(({ transactions, onUpdateCategory, onAddTransaction, projects, chartOfAccounts }) => {
  const { formatAmount } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'debit' | 'credit'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  

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

  const handleCategorySave = useCallback((transactionId: string, newCategory: string, newProjectId?: string, newReceiptUrl?: string) => {
    onUpdateCategory(transactionId, newCategory, newProjectId, newReceiptUrl);
    setEditingId(null);
  }, [onUpdateCategory]);

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
    
    <Card className="h-full overflow-hidden flex flex-col p-0">
       <div className="p-6 pb-4 border-b border-gray-800">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Transactions Ledger</h2>
              <p className="text-gray-400 mt-1 text-sm">Manage your financial records.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsScannerOpen(true)} className="bg-dark-tertiary hover:bg-white/10 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors border border-gray-700">
                 <Icons.Scan />
                 Scan Receipt
              </button>
              <button onClick={() => setIsAddModalOpen(true)} className="bg-brand-cyan hover:bg-brand-cyan/80 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors flex-shrink-0 shadow-[0_0_10px_rgba(0,245,212,0.3)]">
                <Icons.Plus />
                Add Transaction
              </button>
            </div>
          </div>
          
           {/* Filter controls as a toolbar */}
           <div className="flex flex-col gap-3 p-1">
             <div className="flex items-center gap-3 bg-dark-secondary border border-gray-700 p-2 rounded-xl">
                 <div className="flex-grow relative">
                    <Icons.Search />
                    <input
                    type="text"
                    placeholder="Search narration..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent border-none pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-0 text-sm"
                    aria-label="Search by narration"
                    />
                 </div>
                 <div className="h-6 w-px bg-gray-700 mx-2"></div>
                 <select
                   value={typeFilter}
                   onChange={e => setTypeFilter(e.target.value as any)}
                   className="bg-transparent text-gray-300 text-sm focus:outline-none focus:text-white cursor-pointer"
                   aria-label="Filter by transaction type"
                 >
                   <option value="all">All Types</option>
                   <option value="credit">Income (Credit)</option>
                   <option value="debit">Expense (Debit)</option>
                 </select>
            </div>
            
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 <select
                   value={categoryFilter}
                   onChange={e => setCategoryFilter(e.target.value)}
                   className="bg-dark-secondary border border-gray-700 rounded-lg p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-cyan"
                   aria-label="Filter by category"
                 >
                   {categoriesForFilter.map(cat => (
                     <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                   ))}
                 </select>
                 <select
                   value={projectFilter}
                   onChange={e => setProjectFilter(e.target.value)}
                   className="bg-dark-secondary border border-gray-700 rounded-lg p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-cyan"
                   aria-label="Filter by project"
                 >
                    <option value="all">All Projects</option>
                    {projects.map(proj => <option key={proj.id} value={proj.id}>{proj.name}</option>)}
                 </select>
                <input
                  type="date"
                  value={dateFilter.start}
                  onChange={e => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                  className="bg-dark-secondary border border-gray-700 rounded-lg p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-cyan"
                  aria-label="Start date filter"
                />
                <input
                  type="date"
                  value={dateFilter.end}
                  onChange={e => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                  className="bg-dark-secondary border border-gray-700 rounded-lg p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-cyan"
                  aria-label="End date filter"
                />
             </div>
           </div>
       </div>

      <div className="flex-grow relative overflow-hidden">
        <div className="flex bg-dark-tertiary/90 backdrop-blur-md border-b border-gray-700">
            <div className="w-[15%] p-4 text-xs uppercase tracking-wider font-semibold text-gray-400">Date</div>
            <div className="w-[45%] p-4 text-xs uppercase tracking-wider font-semibold text-gray-400">Narration</div>
            <div className="w-[20%] p-4 text-xs uppercase tracking-wider font-semibold text-gray-400">Amount</div>
            <div className="w-[20%] p-4 text-xs uppercase tracking-wider font-semibold text-gray-400">Category</div>
        </div>
        <div className="h-full">
            <AutoSizer>
                {({ height, width }) => (
                <List
                    height={height - 56}
                    itemCount={filteredTransactions.length}
                    itemSize={64}
                    width={width}
                    className="scrollbar-thin"
                >
                    {Row}
                </List>
                )}
            </AutoSizer>
        </div>
         {filteredTransactions.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-dark-primary">
              <div className="bg-dark-secondary p-4 rounded-full mb-3">
                 <Icons.EmptySearch />
              </div>
              <h3 className="text-white font-medium mb-1">No transactions found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your filters or search term.</p>
          </div>
        )}
      </div>
    </Card>
    </>
  );
});
