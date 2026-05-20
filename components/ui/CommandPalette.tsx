
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useHotkeys } from '../../services/hooks/useHotkeys';
import { Search, FileText, User, Tag, ArrowRight, Command } from 'lucide-react';
import { useCurrency } from './CurrencyProvider';

export const CommandPalette: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const { formatAmount } = useCurrency();
    const inputRef = useRef<HTMLInputElement>(null);

    const {
        transactions, invoices, bills, contacts, projects,
        theme
    } = useAppStore();

    useHotkeys({
        'mod+k': () => setIsOpen(true),
        '/': () => setIsOpen(true),
    });

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setSelectedIndex(0);
        }
    }, [isOpen]);

    const results = useMemo(() => {
        if (!query.trim()) return [];

        const q = query.toLowerCase();
        const res: any[] = [];

        // 1. Transactions
        transactions.forEach(t => {
            if (t.narration.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)) {
                res.push({
                    id: t.id,
                    type: 'Transaction',
                    title: t.narration,
                    subtitle: `${t.category} • ${formatAmount(t.amount)}`,
                    icon: <Tag className="w-4 h-4" />,
                    path: '/transactions'
                });
            }
        });

        // 2. Invoices
        invoices.forEach(i => {
            if (i.customer.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)) {
                res.push({
                    id: i.id,
                    type: 'Invoice',
                    title: `Invoice to ${i.customer}`,
                    subtitle: `${i.status} • ${formatAmount(i.total)}`,
                    icon: <FileText className="w-4 h-4" />,
                    path: '/receivables'
                });
            }
        });

        // 3. Contacts
        contacts.forEach(c => {
            if (c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)) {
                res.push({
                    id: c.id,
                    type: 'Contact',
                    title: c.name,
                    subtitle: `${c.type} • ${c.email}`,
                    icon: <User className="w-4 h-4" />,
                    path: '/contacts'
                });
            }
        });

        // 4. Projects
        projects.forEach(p => {
            if (p.name.toLowerCase().includes(q)) {
                res.push({
                    id: p.id,
                    type: 'Project',
                    title: p.name,
                    subtitle: `Status: ${p.status || 'Active'}`,
                    icon: <Tag className="w-4 h-4" />,
                    path: '/projects'
                });
            }
        });

        return res.slice(0, 8);
    }, [query, transactions, invoices, contacts, projects, formatAmount]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false);
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % (results.length || 1));
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + (results.length || 1)) % (results.length || 1));
        }
        if (e.key === 'Enter') {
            const selected = results[selectedIndex];
            if (selected) {
                navigate(selected.path);
                setIsOpen(false);
                setQuery('');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

            <div
                className={`w-full max-w-2xl rounded-2xl shadow-2xl border transition-all duration-300 overflow-hidden ${
                    theme === 'dark' ? 'bg-dark-tertiary border-white/10' : 'bg-white border-gray-200'
                }`}
                onKeyDown={handleKeyDown}
            >
                <div className="flex items-center px-4 py-4 border-b border-white/5">
                    <Search className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search for transactions, invoices, people, or projects..."
                        className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 text-lg"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">ESC</span>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {results.length > 0 ? (
                        results.map((res, idx) => (
                            <button
                                key={`${res.type}-${res.id}`}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left ${
                                    idx === selectedIndex
                                    ? 'bg-brand-cyan/10 border-brand-cyan/20 ring-1 ring-brand-cyan/30'
                                    : 'hover:bg-white/5'
                                }`}
                                onClick={() => {
                                    navigate(res.path);
                                    setIsOpen(false);
                                    setQuery('');
                                }}
                            >
                                <div className={`p-2 rounded-lg ${idx === selectedIndex ? 'bg-brand-cyan text-black' : 'bg-gray-500/10 text-gray-400'}`}>
                                    {res.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h4 className={`font-bold truncate ${idx === selectedIndex ? 'text-brand-cyan' : 'text-gray-900 dark:text-white'}`}>
                                            {res.title}
                                        </h4>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{res.type}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">{res.subtitle}</p>
                                </div>
                                {idx === selectedIndex && (
                                    <ArrowRight className="w-4 h-4 text-brand-cyan animate-pulse" />
                                )}
                            </button>
                        ))
                    ) : query ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-500">No results found for "{query}"</p>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <Command className="w-12 h-12 text-gray-700 mx-auto mb-3 opacity-20" />
                            <p className="text-gray-500 font-medium">Type to search across your entire workspace</p>
                            <div className="flex flex-wrap justify-center gap-4 mt-6">
                                {['Transactions', 'Invoices', 'Bills', 'Team', 'Reports'].map(tag => (
                                    <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-4 py-3 bg-white/5 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1"><span className="p-0.5 rounded bg-white/10">↑↓</span> to navigate</span>
                        <span className="flex items-center gap-1"><span className="p-0.5 rounded bg-white/10">↵</span> to open</span>
                    </div>
                    <span>Aura Intelligent Search</span>
                </div>
            </div>
        </div>
    );
};
