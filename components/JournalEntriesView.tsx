
import React, { useState } from 'react';
import { Card } from './ui/Card';
import type { JournalEntry, JournalLine, Account } from '../types';
import { useToast } from './ui/Toast';
import { useCurrency } from './ui/CurrencyProvider';

interface JournalEntriesViewProps {
    entries: JournalEntry[];
    onAddEntry: (entry: Omit<JournalEntry, 'id'|'date'>) => void;
    accounts: Account[];
}

const NewJournalEntryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: (entry: Omit<JournalEntry, 'id'|'date'>) => void;
    accounts: Account[];
}> = ({ isOpen, onClose, onAdd, accounts }) => {
    const { formatAmount } = useCurrency();
    const { showToast } = useToast();
    const [narration, setNarration] = useState('');
    const [lines, setLines] = useState<Partial<JournalLine>[]>([
        { accountName: '', type: 'debit', amount: 0 },
        { accountName: '', type: 'credit', amount: 0 }
    ]);

    const handleLineChange = (index: number, field: keyof JournalLine, value: any) => {
        const newLines = [...lines];
        (newLines[index] as any)[field] = value;

        // Auto-balance
        // ⚡ Bolt Optimization: Single-pass .reduce() replaces chained .filter().reduce()
        // Avoids O(N) intermediate array allocations and O(2N) extra iterations on every keystroke
        const { debits, credits } = newLines.reduce((acc, l) => {
            if (l.type === 'debit') acc.debits += Number(l.amount || 0);
            if (l.type === 'credit') acc.credits += Number(l.amount || 0);
            return acc;
        }, { debits: 0, credits: 0 });

        if (newLines.length === 2 && field === 'amount') {
            if (index === 0 && newLines[0].type === 'debit') newLines[1].amount = newLines[0].amount;
            if (index === 1 && newLines[1].type === 'debit') newLines[0].amount = newLines[1].amount;
            if (index === 0 && newLines[0].type === 'credit') newLines[1].amount = newLines[0].amount;
            if (index === 1 && newLines[1].type === 'credit') newLines[0].amount = newLines[1].amount;
        }

        setLines(newLines);
    };
    
    const addLine = () => setLines([...lines, { accountName: '', type: 'debit', amount: 0 }]);
    const removeLine = (index: number) => setLines(lines.filter((_, i) => i !== index));

    const totals = lines.reduce((acc, line) => {
        if (line.type === 'debit') acc.debit += Number(line.amount || 0);
        if (line.type === 'credit') acc.credit += Number(line.amount || 0);
        return acc;
    }, {debit: 0, credit: 0});

    const isBalanced = totals.debit === totals.credit && totals.debit > 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isBalanced) {
            showToast('Journal entry must be balanced (debits must equal credits) and not zero.', 'error');
            return;
        }
        onAdd({ narration, lines: lines as JournalLine[] });
        showToast('Journal entry recorded successfully!', 'success');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-aura-gray-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-tertiary rounded-2xl p-8 w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-aura-gray-900 dark:text-white mb-6">New Journal Entry</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea placeholder="Narration / Memo" value={narration} onChange={e => setNarration(e.target.value)} required className="w-full bg-aura-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-aura-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all font-medium shadow-sm" />
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {lines.map((line, index) => (
                            <div key={index} className="flex gap-2 items-center bg-aura-gray-50 dark:bg-dark-secondary/50 p-2 rounded-xl border border-gray-100 dark:border-gray-800">
                                <select value={line.accountName} onChange={e => handleLineChange(index, 'accountName', e.target.value)} className="flex-1 min-w-[200px] bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm text-aura-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan transition-all outline-none font-bold">
                                    <option value="">Select Account</option>
                                    {accounts.map(acc => <option key={acc.name} value={acc.name}>{acc.name}</option>)}
                                </select>
                                <input type="number" placeholder="Amount" value={line.amount || ''} onChange={e => handleLineChange(index, 'amount', e.target.value)} className="w-32 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm text-aura-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan transition-all outline-none font-mono font-bold shadow-sm" />
                                <select value={line.type} onChange={e => handleLineChange(index, 'type', e.target.value)} className="w-28 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm text-aura-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan transition-all outline-none font-bold">
                                    <option value="debit">Debit</option>
                                    <option value="credit">Credit</option>
                                </select>
                                <button aria-label="Remove line item" type="button" onClick={() => removeLine(index)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-lg transition-all active:scale-90">&times;</button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addLine} className="text-xs font-bold text-brand-cyan hover:opacity-80 mt-1 flex items-center gap-1 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Add Line
                    </button>
                    
                    <div className={`flex justify-between p-4 rounded-2xl mt-4 border shadow-inner ${isBalanced ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
                        <div>
                            <span className="text-aura-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[10px]">Total Debits / Credits:</span>
                            <div className="font-mono text-aura-gray-900 dark:text-white font-bold text-sm mt-1">{formatAmount(totals.debit)} / {formatAmount(totals.credit)}</div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-aura-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[10px]">Status:</span>
                            <span className={`font-black uppercase tracking-widest text-[11px] mt-1 ${isBalanced ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{isBalanced ? 'Balanced' : 'Unbalanced'}</span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-aura-gray-600 dark:text-gray-300 hover:bg-aura-gray-100 dark:hover:bg-dark-secondary transition-all font-bold">Cancel</button>
                        <button type="submit" disabled={!isBalanced} className="px-8 py-2.5 rounded-xl bg-brand-cyan text-black font-bold hover:bg-brand-cyan/90 transition-all active:scale-95 shadow-lg shadow-brand-cyan/20 disabled:bg-aura-gray-200 dark:disabled:bg-gray-700 disabled:opacity-50">Save Entry</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const JournalEntriesView: React.FC<JournalEntriesViewProps> = ({ entries, onAddEntry, accounts }) => {
    const { formatAmount } = useCurrency();
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
        <>
        <NewJournalEntryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={onAddEntry} accounts={accounts} />
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-aura-gray-900 dark:text-white">Journal Entries</h2>
                    <p className="text-aura-gray-500 dark:text-gray-400 mt-1 font-medium italic">Manually record debits and credits for adjustments.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-brand-cyan hover:bg-brand-cyan/90 text-black font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-brand-cyan/20 active:scale-95">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    New Entry
                </button>
            </div>
            <Card className="overflow-hidden border-gray-100 dark:border-white/5 shadow-xl">
                <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-aura-gray-50 dark:bg-dark-tertiary z-10">
                            <tr>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400">Date</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400">Narration</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400 text-right">Debit</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400 text-right">Credit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {entries.map(entry => (
                                <React.Fragment key={entry.id}>
                                    <tr className="bg-aura-gray-50/50 dark:bg-dark-secondary/30">
                                        <td className="p-4 text-aura-gray-500 dark:text-gray-400 text-xs font-mono">{new Date(entry.date).toLocaleDateString()}</td>
                                        <td colSpan={3} className="p-4 text-aura-gray-900 dark:text-white font-bold">{entry.narration}</td>
                                    </tr>
                                    {entry.lines.map((line, idx) => (
                                        <tr key={idx} className="hover:bg-aura-gray-50/20 dark:hover:bg-white/[0.01] transition-colors group">
                                            <td></td>
                                            <td className="p-3 pl-8 text-aura-gray-600 dark:text-gray-400 text-sm font-medium">{line.accountName}</td>
                                            <td className={`p-3 text-right font-mono font-bold text-sm ${line.type === 'debit' ? 'text-green-600 dark:text-green-400' : 'text-aura-gray-300 dark:text-gray-600'}`}>{line.type === 'debit' ? formatAmount(line.amount) : '-'}</td>
                                            <td className={`p-3 text-right font-mono font-bold text-sm ${line.type === 'credit' ? 'text-red-600 dark:text-red-400' : 'text-aura-gray-300 dark:text-gray-600'}`}>{line.type === 'credit' ? formatAmount(line.amount) : '-'}</td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
        </>
    );
};
