
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
        const debits = newLines.filter(l => l.type === 'debit').reduce((sum, l) => sum + Number(l.amount || 0), 0);
        const credits = newLines.filter(l => l.type === 'credit').reduce((sum, l) => sum + Number(l.amount || 0), 0);
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-dark-tertiary rounded-2xl p-8 w-full max-w-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-6">New Journal Entry</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea placeholder="Narration / Memo" value={narration} onChange={e => setNarration(e.target.value)} required className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white" />
                    
                    {lines.map((line, index) => (
                        <div key={index} className="flex gap-2 items-center">
                            <select value={line.accountName} onChange={e => handleLineChange(index, 'accountName', e.target.value)} className="flex-1 bg-dark-secondary border border-gray-600 rounded p-2 text-sm">
                                <option value="">Select Account</option>
                                {accounts.map(acc => <option key={acc.name} value={acc.name}>{acc.name}</option>)}
                            </select>
                            <input type="number" placeholder="Amount" value={line.amount || ''} onChange={e => handleLineChange(index, 'amount', e.target.value)} className="w-32 bg-dark-secondary border border-gray-600 rounded p-2 text-sm" />
                            <select value={line.type} onChange={e => handleLineChange(index, 'type', e.target.value)} className="w-28 bg-dark-secondary border border-gray-600 rounded p-2 text-sm">
                                <option value="debit">Debit</option>
                                <option value="credit">Credit</option>
                            </select>
                            <button type="button" onClick={() => removeLine(index)} className="text-red-500 hover:text-red-400 p-1">&times;</button>
                        </div>
                    ))}
                    <button type="button" onClick={addLine} className="text-xs text-brand-cyan hover:text-white">+ Add Line</button>
                    
                    <div className={`flex justify-between p-3 rounded-lg mt-4 ${isBalanced ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                        <div>
                            <span className="text-gray-400">Totals: </span>
                            <span className="font-mono text-white"> D: {formatAmount(totals.debit)} / C: {formatAmount(totals.credit)}</span>
                        </div>
                        <span className={`font-bold ${isBalanced ? 'text-green-400' : 'text-red-400'}`}>{isBalanced ? 'Balanced' : 'Unbalanced'}</span>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-dark-secondary">Cancel</button>
                        <button type="submit" disabled={!isBalanced} className="px-6 py-2 rounded-lg bg-brand-cyan text-black font-bold hover:bg-brand-cyan/80 disabled:bg-gray-600">Save Entry</button>
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
        <div className="space-y-8">
             <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Journal Entries</h2>
                    <p className="text-gray-400 mt-1">Manually record debits and credits for adjustments.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-brand-cyan hover:bg-brand-cyan/80 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    New Entry
                </button>
            </div>
            <Card>
                <div className="overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-dark-tertiary">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-gray-400">Date</th>
                                <th className="p-4 text-sm font-semibold text-gray-400">Narration</th>
                                <th className="p-4 text-sm font-semibold text-gray-400 text-right">Debit</th>
                                <th className="p-4 text-sm font-semibold text-gray-400 text-right">Credit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {entries.map(entry => (
                                <React.Fragment key={entry.id}>
                                    <tr className="bg-dark-secondary/30">
                                        <td className="p-4 text-gray-300">{new Date(entry.date).toLocaleDateString()}</td>
                                        <td colSpan={3} className="p-4 text-white font-medium">{entry.narration}</td>
                                    </tr>
                                    {entry.lines.map((line, idx) => (
                                        <tr key={idx}>
                                            <td></td>
                                            <td className="p-2 pl-8 text-gray-300">{line.accountName}</td>
                                            <td className={`p-2 text-right font-mono ${line.type === 'debit' ? 'text-green-400' : 'text-gray-500'}`}>{line.type === 'debit' ? formatAmount(line.amount) : '-'}</td>
                                            <td className={`p-2 text-right font-mono ${line.type === 'credit' ? 'text-red-400' : 'text-gray-500'}`}>{line.type === 'credit' ? formatAmount(line.amount) : '-'}</td>
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
