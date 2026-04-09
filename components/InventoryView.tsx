
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-dark-tertiary rounded-2xl p-8 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-6">{item ? 'Edit Item' : 'Add New Item'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="name" placeholder="Item Name" value={formData.name} onChange={handleChange} required className="w-full bg-dark-secondary p-3 rounded-lg border border-gray-700"/>
                        <input type="text" name="sku" placeholder="SKU" value={formData.sku} onChange={handleChange} className="w-full bg-dark-secondary p-3 rounded-lg border border-gray-700"/>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="category" placeholder="Category (e.g., Hardware)" value={formData.category} onChange={handleChange} className="w-full bg-dark-secondary p-3 rounded-lg border border-gray-700"/>
                        <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-dark-secondary p-3 rounded-lg border border-gray-700">
                            <option value="Product">Product</option>
                            <option value="Service">Service</option>
                        </select>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <input type="number" name="salePrice" placeholder={`Sale Price (${currency})`} value={formData.salePrice || ''} onChange={handleChange} required className="w-full bg-dark-secondary p-3 rounded-lg border border-gray-700"/>
                        <input type="number" name="costPrice" placeholder={`Cost Price (${currency})`} value={formData.costPrice || ''} onChange={handleChange} className="w-full bg-dark-secondary p-3 rounded-lg border border-gray-700"/>
                    </div>
                    {formData.type === 'Product' && (
                         <input type="number" name="quantity" placeholder="Quantity in Stock" value={formData.quantity || ''} onChange={handleChange} className="w-full bg-dark-secondary p-3 rounded-lg border border-gray-700"/>
                    )}
                     <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-dark-secondary">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-brand-cyan text-black font-bold">Save Item</button>
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
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white">Products & Services</h2>
                    <button onClick={() => handleOpenModal()} className="bg-brand-cyan hover:bg-brand-cyan/80 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        New Item
                    </button>
                </div>
                <Card>
                    <table className="w-full text-left">
                        <thead>
                             <tr>
                                <th className="p-4 text-sm font-semibold text-gray-400">Name</th>
                                <th className="p-4 text-sm font-semibold text-gray-400">Type</th>
                                <th className="p-4 text-sm font-semibold text-gray-400">Stock</th>
                                <th className="p-4 text-sm font-semibold text-gray-400">Sale Price</th>
                                <th className="p-4 text-sm font-semibold text-gray-400">Cost Price</th>
                                <th className="p-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {items.map(item => (
                                <tr key={item.id} className="hover:bg-dark-secondary/50">
                                    <td className="p-4 text-white">{item.name} <span className="text-gray-500 text-xs">({item.sku})</span></td>
                                    <td className="p-4 text-gray-300">{item.type}</td>
                                    <td className="p-4 text-gray-300 font-mono">{item.type === 'Product' ? item.quantity : 'N/A'}</td>
                                    <td className="p-4 text-green-400 font-mono">{formatAmount(item.salePrice)}</td>
                                    <td className="p-4 text-red-400 font-mono">{formatAmount(item.costPrice)}</td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => handleOpenModal(item)} className="text-sm py-1 px-3 rounded-md border border-brand-cyan text-brand-cyan hover:bg-brand-cyan/20">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>
        </>
    );
};
