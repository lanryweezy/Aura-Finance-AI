
import React, { useState } from 'react';

interface FilterOption {
    label: string;
    field: string;
    type: 'text' | 'select' | 'date' | 'number-range';
    options?: { label: string; value: string }[];
}

interface AdvancedFilterProps {
    options: FilterOption[];
    onFilter: (filters: Record<string, any>) => void;
    onExport?: () => void;
}

export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({ options, onFilter, onExport }) => {
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [isOpen, setIsOpen] = useState(false);

    const handleFilterChange = (field: string, value: any) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);
        onFilter(newFilters);
    };

    const clearFilters = () => {
        setFilters({});
        onFilter({});
    };

    return (
        <div className="mb-6">
            <div className="flex justify-between items-center bg-dark-secondary/50 border border-white/5 p-4 rounded-2xl backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${isOpen ? 'bg-brand-cyan text-black border-brand-cyan' : 'bg-dark-tertiary text-gray-300 border-gray-700 hover:border-gray-500'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                        <span className="text-sm font-semibold">Advanced Filters</span>
                    </button>
                    {Object.keys(filters).length > 0 && (
                        <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-white transition-colors">Clear All</button>
                    )}
                </div>
                {onExport && (
                    <button
                        onClick={onExport}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-tertiary text-gray-300 border border-gray-700 hover:border-gray-500 transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        <span className="text-sm font-semibold">Export CSV</span>
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="mt-4 p-6 bg-dark-tertiary border border-white/10 rounded-2xl grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-2 duration-300 shadow-2xl">
                    {options.map((opt) => (
                        <div key={opt.field} className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{opt.label}</label>
                            {opt.type === 'select' ? (
                                <select
                                    value={filters[opt.field] || ''}
                                    onChange={(e) => handleFilterChange(opt.field, e.target.value)}
                                    className="w-full bg-dark-primary border border-gray-700 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-brand-cyan outline-none"
                                >
                                    <option value="">All</option>
                                    {opt.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            ) : opt.type === 'date' ? (
                                <input
                                    type="date"
                                    value={filters[opt.field] || ''}
                                    onChange={(e) => handleFilterChange(opt.field, e.target.value)}
                                    className="w-full bg-dark-primary border border-gray-700 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-brand-cyan outline-none"
                                />
                            ) : opt.type === 'number-range' ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters[`${opt.field}_min`] || ''}
                                        onChange={(e) => handleFilterChange(`${opt.field}_min`, e.target.value)}
                                        className="w-1/2 bg-dark-primary border border-gray-700 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-brand-cyan outline-none"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters[`${opt.field}_max`] || ''}
                                        onChange={(e) => handleFilterChange(`${opt.field}_max`, e.target.value)}
                                        className="w-1/2 bg-dark-primary border border-gray-700 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-brand-cyan outline-none"
                                    />
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    placeholder={`Search ${opt.label.toLowerCase()}...`}
                                    value={filters[opt.field] || ''}
                                    onChange={(e) => handleFilterChange(opt.field, e.target.value)}
                                    className="w-full bg-dark-primary border border-gray-700 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-brand-cyan outline-none"
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
