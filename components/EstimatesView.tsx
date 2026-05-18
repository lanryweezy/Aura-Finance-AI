
import React, { useState, useMemo } from 'react';
import { Card } from './ui/Card';
import { DocumentPreviewModal } from './ui/DocumentPreviewModal';
import type { Estimate, LineItem, InventoryItem } from '../types';
import { useCurrency } from './ui/CurrencyProvider';

interface EstimatesViewProps {
    estimates: Estimate[];
    onAddEstimate: (est: Omit<Estimate, 'id'|'status'|'issueDate'>) => void;
    onConvertToInvoice: (est: Estimate) => void;
    inventoryItems: InventoryItem[];
}

const EstimateStatusBadge: React.FC<{ status: Estimate['status'] }> = ({ status }) => {
    const colorClasses = {
        Draft: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
        Sent: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        Accepted: 'bg-green-500/10 text-green-600 dark:text-green-400',
        Declined: 'bg-red-500/10 text-red-600 dark:text-red-400',
    };
    return (
        <span className={`px-2.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-md border border-current opacity-90 ${colorClasses[status]}`}>
            {status}
        </span>
    );
};

const NewEstimateModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onAdd: (est: Omit<Estimate, 'id'|'status'|'issueDate'>) => void; 
    inventoryItems: InventoryItem[];
}> = ({ isOpen, onClose, onAdd, inventoryItems }) => {
    const { formatAmount } = useCurrency();
    const [customer, setCustomer] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [lineItems, setLineItems] = useState<Partial<LineItem>[]>([{ inventoryItemId: '', quantity: 1, unitPrice: 0 }]);

    const handleLineChange = (index: number, field: keyof LineItem, value: any) => {
        const newLines = [...lineItems];
        (newLines[index] as any)[field] = value;
        
        if (field === 'inventoryItemId' && value !== '') {
            const selectedItem = inventoryItems.find(item => item.id === value);
            if (selectedItem) {
                newLines[index].name = selectedItem.name;
                newLines[index].unitPrice = selectedItem.salePrice;
            }
        }
        setLineItems(newLines);
    };
    
    const addLine = () => setLineItems([...lineItems, { inventoryItemId: '', quantity: 1, unitPrice: 0 }]);
    const removeLine = (index: number) => setLineItems(lineItems.filter((_, i) => i !== index));

    const total = useMemo(() => {
        return lineItems.reduce((sum, li) => sum + (Number(li.quantity) || 0) * (Number(li.unitPrice) || 0), 0);
    }, [lineItems]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            customer,
            expiryDate,
            lineItems: lineItems.map((li, idx) => ({
                ...li,
                id: `li_est_${Date.now()}_${idx}`,
                name: li.name || '',
                total: (li.quantity || 0) * (li.unitPrice || 0)
            })) as LineItem[],
            total,
        });
        onClose();
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-tertiary rounded-2xl p-8 w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">New Estimate</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <input type="text" placeholder="Customer Name" value={customer} onChange={e => setCustomer(e.target.value)} required className="w-full bg-gray-50 dark:bg-dark-secondary border border-gray-100 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all font-medium"/>
                         <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} required className="w-full bg-gray-50 dark:bg-dark-secondary border border-gray-100 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all font-medium"/>
                    </div>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Line Items</label>
                        {lineItems.map((line, index) => (
                            <div key={index} className="flex flex-wrap md:flex-nowrap items-center gap-2 bg-gray-50 dark:bg-dark-secondary/50 p-2 rounded-xl border border-gray-100 dark:border-gray-800">
                                <select value={line.inventoryItemId} onChange={e => handleLineChange(index, 'inventoryItemId', e.target.value)} className="flex-1 min-w-[200px] bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan transition-all outline-none font-bold">
                                    <option value="">Select Product/Service</option>
                                    {inventoryItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                </select>
                                <input type="number" placeholder="Qty" value={line.quantity} onChange={e => handleLineChange(index, 'quantity', e.target.value)} className="w-20 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan transition-all outline-none font-bold" />
                                <input type="number" placeholder="Price" value={line.unitPrice} onChange={e => handleLineChange(index, 'unitPrice', e.target.value)} className="w-28 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan transition-all outline-none font-mono font-bold" />
                                <button type="button" onClick={() => removeLine(index)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-lg transition-all active:scale-90">&times;</button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addLine} className="text-xs font-bold text-brand-cyan hover:opacity-80 mt-1 flex items-center gap-1 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Add Line
                    </button>

                    <div className="bg-gray-100/50 dark:bg-dark-secondary/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 mt-4 shadow-inner flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Total Amount</span>
                        <span className="text-2xl font-black text-gray-900 dark:text-white font-mono">{formatAmount(total)}</span>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-secondary transition-all font-bold">Cancel</button>
                        <button type="submit" className="px-8 py-2.5 rounded-xl bg-brand-cyan text-black font-bold hover:bg-brand-cyan/90 transition-all active:scale-95 shadow-lg shadow-brand-cyan/20">Save Estimate</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const EstimatesView: React.FC<EstimatesViewProps> = ({ estimates, onAddEstimate, onConvertToInvoice, inventoryItems }) => {
    const { formatAmount } = useCurrency();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewEstimate, setPreviewEstimate] = useState<Estimate | null>(null);

    return (
        <>
        <NewEstimateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={onAddEstimate} inventoryItems={inventoryItems} />
        <DocumentPreviewModal
            isOpen={!!previewEstimate}
            onClose={() => setPreviewEstimate(null)}
            data={previewEstimate}
            type="estimate"
        />

        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Estimates & Quotes</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 font-medium">Create professional quotes and track customer approvals.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-brand-cyan hover:bg-brand-cyan/90 text-black font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-brand-cyan/20 active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    New Estimate
                </button>
            </div>
            <Card className="overflow-hidden border-gray-100 dark:border-white/5 shadow-xl">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-dark-tertiary">
                            <tr>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Date</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Estimate #</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Customer</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {estimates.map(est => (
                                <tr key={est.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4 text-gray-500 dark:text-gray-400 font-mono text-sm">{new Date(est.issueDate).toLocaleDateString()}</td>
                                    <td className="p-4 text-gray-900 dark:text-white font-black text-sm uppercase tracking-tighter">#{est.id.slice(-6)}</td>
                                    <td className="p-4 text-gray-900 dark:text-white font-bold text-sm">{est.customer}</td>
                                    <td className="p-4 font-mono font-black text-gray-900 dark:text-white">{formatAmount(est.total)}</td>
                                    <td className="p-4"><EstimateStatusBadge status={est.status} /></td>
                                    <td className="p-4 text-right space-x-2">
                                        <button
                                            onClick={() => setPreviewEstimate(est)}
                                            className="text-[11px] font-bold py-1.5 px-3 rounded-lg border text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
                                        >
                                            View
                                        </button>
                                        {est.status === 'Sent' && (
                                            <button onClick={() => onConvertToInvoice(est)} className="text-[11px] font-bold py-1.5 px-4 rounded-lg border border-brand-cyan text-brand-cyan hover:bg-brand-cyan hover:text-black transition-all active:scale-95">Convert</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {estimates.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-20">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="p-4 bg-gray-50 dark:bg-dark-secondary rounded-full mb-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                                            </div>
                                            <p className="text-gray-500 dark:text-gray-400 font-medium">No estimates found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                 </div>
            </Card>
        </div>
        </>
    );
};
