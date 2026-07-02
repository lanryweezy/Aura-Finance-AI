
import React, { useState } from 'react';
import { Card } from './ui/Card';
import { useCurrency } from './ui/CurrencyProvider';
import type { FixedAsset } from '../types';

interface FixedAssetsViewProps {
    assets: FixedAsset[];
    onAddAsset: (asset: Omit<FixedAsset, 'id' | 'accumulatedDepreciation' | 'bookValue'>) => void;
    onDisposeAsset: (id: string, price: number) => void;
}

export const FixedAssetsView: React.FC<FixedAssetsViewProps> = ({ assets, onAddAsset, onDisposeAsset }) => {
    const { formatAmount } = useCurrency();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAsset, setNewAsset] = useState({
        name: '', category: 'Furniture', purchaseDate: new Date().toISOString().split('T')[0],
        purchaseCost: 0, salvageValue: 0, usefulLifeYears: 5, depreciationMethod: 'Straight Line' as const
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddAsset({ ...newAsset, status: 'Active' });
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-aura-gray-900 dark:text-white">Fixed Asset Management</h2>
                    <p className="text-aura-gray-500 dark:text-gray-400 mt-1 font-medium">Track lifecycle, depreciation, and disposal of company assets.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-brand-cyan hover:bg-brand-cyan/90 text-black font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-brand-cyan/20 active:scale-95"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    Register Asset
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="p-6 border-blue-500/10 bg-blue-500/5 shadow-sm">
                    <h4 className="text-sm font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-2">Total Asset Value</h4>
                    <p className="text-3xl font-black text-aura-gray-900 dark:text-white font-mono">
                        {formatAmount(assets.reduce((sum, a) => sum + a.purchaseCost, 0))}
                    </p>
                </Card>
                <Card className="p-6 border-purple-500/10 bg-purple-500/5 shadow-sm">
                    <h4 className="text-sm font-bold text-purple-500 dark:text-purple-400 uppercase tracking-wider mb-2">Accumulated Depreciation</h4>
                    <p className="text-3xl font-black text-aura-gray-900 dark:text-white font-mono">
                        {formatAmount(assets.reduce((sum, a) => sum + a.accumulatedDepreciation, 0))}
                    </p>
                </Card>
                <Card className="p-6 border-brand-cyan/10 bg-brand-cyan/5 shadow-sm">
                    <h4 className="text-sm font-bold text-brand-cyan uppercase tracking-wider mb-2">Net Book Value</h4>
                    <p className="text-3xl font-black text-aura-gray-900 dark:text-white font-mono">
                        {formatAmount(assets.reduce((sum, a) => sum + a.bookValue, 0))}
                    </p>
                </Card>
            </div>

            <Card className="overflow-hidden border-gray-100 dark:border-white/5 shadow-xl">
                <table className="w-full text-left">
                    <thead className="bg-aura-gray-50 dark:bg-dark-tertiary">
                        <tr>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-aura-gray-500 dark:text-gray-400">Asset Name</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-aura-gray-500 dark:text-gray-400">Category</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-aura-gray-500 dark:text-gray-400">Cost</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-aura-gray-500 dark:text-gray-400">Acc. Dep.</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-aura-gray-500 dark:text-gray-400">Book Value</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-aura-gray-500 dark:text-gray-400">Status</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-aura-gray-500 dark:text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {assets.map(asset => (
                            <tr key={asset.id} className="hover:bg-aura-gray-50/50 dark:hover:bg-dark-secondary/50 transition-colors group">
                                <td className="p-4">
                                    <div className="font-bold text-aura-gray-900 dark:text-white">{asset.name}</div>
                                    <div className="text-[10px] font-mono text-aura-gray-400">Purchased: {asset.purchaseDate}</div>
                                </td>
                                <td className="p-4 text-sm text-aura-gray-500 dark:text-gray-400">{asset.category}</td>
                                <td className="p-4 font-mono font-bold text-sm text-aura-gray-900 dark:text-white">{formatAmount(asset.purchaseCost)}</td>
                                <td className="p-4 font-mono text-red-500 dark:text-red-400 text-sm">{formatAmount(asset.accumulatedDepreciation)}</td>
                                <td className="p-4 font-mono text-brand-cyan font-black text-sm">{formatAmount(asset.bookValue)}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${asset.status === 'Active' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'}`}>
                                        {asset.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    {asset.status === 'Active' && (
                                        <button
                                            onClick={() => {
                                                const price = prompt("Enter disposal price:");
                                                if (price) onDisposeAsset(asset.id, Number(price));
                                            }}
                                            className="text-[10px] font-black uppercase text-brand-pink hover:bg-brand-pink/10 px-3 py-1 rounded-lg transition-all"
                                        >
                                            Dispose
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            {isModalOpen && (
                <div className="fixed inset-0 bg-aura-gray-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setIsModalOpen(false)}>
                    <Card className="w-full max-w-lg p-8 space-y-6" onClick={() => {}}>
                        <h3 className="text-2xl font-bold text-aura-gray-900 dark:text-white">New Asset Registration</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-aura-gray-500 uppercase tracking-widest">Asset Name</label>
                                    <input type="text" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} required className="w-full bg-aura-gray-50 dark:bg-dark-secondary p-3 rounded-xl border border-gray-200 dark:border-gray-700 outline-none text-aura-gray-900 dark:text-white shadow-sm"/>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-aura-gray-500 uppercase tracking-widest">Category</label>
                                    <select value={newAsset.category} onChange={e => setNewAsset({...newAsset, category: e.target.value})} className="w-full bg-aura-gray-50 dark:bg-dark-secondary p-3 rounded-xl border border-gray-200 dark:border-gray-700 outline-none text-aura-gray-900 dark:text-white shadow-sm">
                                        <option>Furniture</option>
                                        <option>Electronics</option>
                                        <option>Vehicles</option>
                                        <option>Machinery</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-aura-gray-500 uppercase tracking-widest">Purchase Date</label>
                                    <input type="date" value={newAsset.purchaseDate} onChange={e => setNewAsset({...newAsset, purchaseDate: e.target.value})} className="w-full bg-aura-gray-50 dark:bg-dark-secondary p-3 rounded-xl border border-gray-200 dark:border-gray-700 outline-none text-aura-gray-900 dark:text-white shadow-sm"/>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-aura-gray-500 uppercase tracking-widest">Purchase Cost</label>
                                    <input type="number" value={newAsset.purchaseCost} onChange={e => setNewAsset({...newAsset, purchaseCost: Number(e.target.value)})} className="w-full bg-aura-gray-50 dark:bg-dark-secondary p-3 rounded-xl border border-gray-200 dark:border-gray-700 outline-none font-mono text-aura-gray-900 dark:text-white shadow-sm"/>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-aura-gray-500 uppercase tracking-widest">Salvage Value</label>
                                    <input type="number" value={newAsset.salvageValue} onChange={e => setNewAsset({...newAsset, salvageValue: Number(e.target.value)})} className="w-full bg-aura-gray-50 dark:bg-dark-secondary p-3 rounded-xl border border-gray-200 dark:border-gray-700 outline-none font-mono text-aura-gray-900 dark:text-white shadow-sm"/>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-aura-gray-500 uppercase tracking-widest">Useful Life (Years)</label>
                                    <input type="number" value={newAsset.usefulLifeYears} onChange={e => setNewAsset({...newAsset, usefulLifeYears: Number(e.target.value)})} className="w-full bg-aura-gray-50 dark:bg-dark-secondary p-3 rounded-xl border border-gray-200 dark:border-gray-700 outline-none font-mono text-aura-gray-900 dark:text-white shadow-sm"/>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 pt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-xl text-aura-gray-500 font-bold hover:bg-aura-gray-100 dark:hover:bg-dark-secondary transition-all">Cancel</button>
                                <button type="submit" className="bg-brand-cyan text-black px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-cyan/20 active:scale-95 transition-all">Register Asset</button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};
