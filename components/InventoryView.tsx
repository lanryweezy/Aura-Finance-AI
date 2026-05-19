
import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import type { InventoryItem } from '../types';
import { useCurrency } from './ui/CurrencyProvider';

interface InventoryViewProps {
    items: InventoryItem[];
    onAddItem: (item: Omit<InventoryItem, 'id'>) => void;
    onUpdateItem: (item: InventoryItem) => void;
}

const AddEditItemModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: any) => void;
    item: InventoryItem | null;
}> = ({ isOpen, onClose, onSave, item }) => {
    const { currency } = useCurrency();
    const [formData, setFormData] = useState<Omit<InventoryItem, 'id'>>({
        name: '', sku: '', category: '', type: 'Product', costPrice: 0, salePrice: 0, quantity: 0
    });

    useEffect(() => {
        setFormData(item ? { ...item } : { name: '', sku: '', category: '', type: 'Product', costPrice: 0, salePrice: 0, quantity: 0 });
    }, [item, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            costPrice: Number(formData.costPrice),
            salePrice: Number(formData.salePrice),
            quantity: Number(formData.quantity),
        };
        onSave(item ? { ...dataToSave, id: item.id } : dataToSave);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-tertiary rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{item ? 'Edit Item' : 'Add New Item'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="name" placeholder="Item Name" value={formData.name} onChange={handleChange} required className="w-full bg-gray-50 dark:bg-dark-secondary p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan outline-none transition-all"/>
                        <input type="text" name="sku" placeholder="SKU" value={formData.sku} onChange={handleChange} className="w-full bg-gray-50 dark:bg-dark-secondary p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan outline-none transition-all font-mono"/>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="category" placeholder="Category (e.g., Hardware)" value={formData.category} onChange={handleChange} className="w-full bg-gray-50 dark:bg-dark-secondary p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan outline-none transition-all"/>
                        <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-gray-50 dark:bg-dark-secondary p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan outline-none transition-all">
                            <option value="Product">Product</option>
                            <option value="Service">Service</option>
                        </select>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="number" name="salePrice" placeholder={`Sale Price (${currency})`} value={formData.salePrice || ''} onChange={handleChange} required className="w-full bg-gray-50 dark:bg-dark-secondary p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan outline-none transition-all font-mono font-bold"/>
                        <input type="number" name="costPrice" placeholder={`Cost Price (${currency})`} value={formData.costPrice || ''} onChange={handleChange} className="w-full bg-gray-50 dark:bg-dark-secondary p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan outline-none transition-all font-mono font-bold"/>
                    </div>
                    {formData.type === 'Product' && (
                         <input type="number" name="quantity" placeholder="Quantity in Stock" value={formData.quantity || ''} onChange={handleChange} className="w-full bg-gray-50 dark:bg-dark-secondary p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan outline-none transition-all font-mono font-bold"/>
                    )}
                     <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-secondary transition-colors">Cancel</button>
                        <button type="submit" className="px-8 py-2.5 rounded-xl bg-brand-cyan text-black font-bold hover:bg-brand-cyan/90 transition-all active:scale-95 shadow-lg shadow-brand-cyan/20">Save Item</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const InventoryView: React.FC<InventoryViewProps> = ({ items, onAddItem, onUpdateItem }) => {
    const { formatAmount } = useCurrency();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

    const handleOpenModal = (item: InventoryItem | null = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    return (
        <>
            <AddEditItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} item={editingItem} onSave={editingItem ? onUpdateItem : onAddItem} />
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory & Services</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1 font-medium">Manage your product catalog and service offerings.</p>
                    </div>
                    <button onClick={() => handleOpenModal()} className="bg-brand-cyan hover:bg-brand-cyan/90 text-black font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-brand-cyan/20 active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        New Item
                    </button>
                </div>
                <Card className="overflow-hidden border-gray-100 dark:border-white/5 shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-dark-tertiary">
                                <tr>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Name</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Type</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Stock</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Sale Price</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Cost Price</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {items.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-dark-secondary/50 transition-colors">
                                        <td className="p-4 text-gray-900 dark:text-white font-bold">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span>{item.name}</span>
                                                    {item.quantity <= (item.lowStockThreshold || 10) && item.type === 'Product' && (
                                                        <span className="px-1.5 py-0.5 bg-brand-pink/10 text-brand-pink text-[8px] font-black uppercase rounded border border-brand-pink/20 animate-pulse">Low Stock</span>
                                                    )}
                                                </div>
                                                <span className="text-gray-400 dark:text-gray-500 text-xs font-mono font-bold tracking-tight">{item.sku}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 dark:text-gray-300 font-medium">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${item.type === 'Product' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'}`}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600 dark:text-gray-300 font-mono font-bold text-sm">{item.type === 'Product' ? item.quantity : '—'}</td>
                                        <td className="p-4 text-green-600 dark:text-green-400 font-mono font-bold text-sm">{formatAmount(item.salePrice)}</td>
                                        <td className="p-4 text-red-600 dark:text-red-400 font-mono font-bold text-sm">{formatAmount(item.costPrice)}</td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => handleOpenModal(item)} className="text-xs font-bold py-1.5 px-4 rounded-lg border border-brand-cyan text-brand-cyan hover:bg-brand-cyan hover:text-black transition-all">Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </>
    );
};
