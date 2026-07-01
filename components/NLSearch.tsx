import React, { useState, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { naturalLanguageSearch, type SearchResult } from '../services/aiSearchService';

const typeColors: Record<string, string> = {
  transaction: 'bg-blue-500/20 text-blue-400',
  invoice: 'bg-green-500/20 text-green-400',
  bill: 'bg-red-500/20 text-red-400',
  contact: 'bg-purple-500/20 text-purple-400',
  insight: 'bg-yellow-500/20 text-yellow-400',
};

const typeIcons: Record<string, string> = {
  transaction: '💱', invoice: '📄', bill: '📋', contact: '👤', insight: '💡',
};

export const NLSearch: React.FC = () => {
  const { transactions, invoices, bills, contacts } = useAppStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const r = await naturalLanguageSearch(query, transactions, invoices, bills, contacts);
      setResults(r);
    } catch (e) {
      console.error('Search failed:', e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, transactions, invoices, bills, contacts]);

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search with AI... try 'all invoices to TechCorp last month'"
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-tertiary border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="px-5 py-3 bg-brand-cyan text-black font-bold rounded-xl hover:bg-brand-cyan/80 transition-all disabled:opacity-50 text-sm"
        >
          {loading ? '...' : 'Search'}
        </button>
      </div>

      {hasSearched && (
        <div className="mt-3 space-y-2">
          {results.length === 0 && !loading && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No results found for "{query}"</p>
          )}
          {results.map((r, i) => (
            <div
              key={`${r.type}-${r.id}-${i}`}
              className="flex items-center gap-3 p-3 bg-white dark:bg-dark-tertiary border border-gray-100 dark:border-gray-700 rounded-xl hover:border-brand-cyan/50 transition-all cursor-pointer"
            >
              <span className={`text-xs px-2 py-1 rounded-lg font-bold ${typeColors[r.type]}`}>
                {typeIcons[r.type]} {r.type}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{r.title}</p>
                <p className="text-xs text-gray-500 truncate">{r.subtitle}</p>
              </div>
              {r.amount !== undefined && (
                <span className="text-sm font-bold text-brand-cyan">₦{r.amount.toLocaleString()}</span>
              )}
              {r.status && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">{r.status}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
