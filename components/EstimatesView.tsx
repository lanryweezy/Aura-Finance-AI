
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
        Draft: 'bg-gray-500/10 text-gray-400',
        Sent: 'bg-blue-500/10 text-blue-400',
        Accepted: 'bg-green-500/10 text-green-400',
        Declined: 'bg-red-500/10 text-red-400',
    };
    return (
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${colorClasses[status]}`}>
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-dark-tertiary rounded-2xl p-8 w-full max-w-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-6">New Estimate</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                         <input type="text" placeholder="Customer Name" value={customer} onChange={e => setCustomer(e.target.value)} required className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3"/>
                         <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} required className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3"/>
                    </div>
                    {lineItems.map((line, index) => (
                        <div key={index} className="flex gap-2 items-center">
                            <select value={line.inventoryItemId} onChange={e => handleLineChange(index, 'inventoryItemId', e.target.value)} className="flex-1 bg-dark-secondary border border-gray-600 rounded p-2 text-sm">
                                <option value="">Select Product/Service</option>
                                {inventoryItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </select>
                            <input type="number" placeholder="Qty" value={line.quantity} onChange={e => handleLineChange(index, 'quantity', e.target.value)} className="w-20 bg-dark-secondary border border-gray-600 rounded p-2 text-sm" />
                            <input type="number" placeholder="Unit Price" value={line.unitPrice} onChange={e => handleLineChange(index, 'unitPrice', e.target.value)} className="w-24 bg-dark-secondary border border-gray-600 rounded p-2 text-sm" />
                            <button type="button" onClick={() => removeLine(index)} className="text-red-500 p-1">&times;</button>
                        </div>
                    ))}
                    <button type="button" onClick={addLine} className="text-xs text-brand-cyan">+ Add Line</button>
                    <div className="flex justify-end font-bold text-lg">Total: {formatAmount(total)}</div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-dark-secondary">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-brand-cyan text-black font-bold">Save Estimate</button>
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

        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Estimates & Quotes</h2>
                <button onClick={() => setIsModalOpen(true)} className="bg-brand-cyan hover:bg-brand-cyan/80 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    New Estimate
                </button>
            </div>
            <Card>
                 <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="p-4 text-sm font-semibold text-gray-400">Date</th>
                            <th className="p-4 text-sm font-semibold text-gray-400">Estimate #</th>
                            <th className="p-4 text-sm font-semibold text-gray-400">Customer</th>
                            <th className="p-4 text-sm font-semibold text-gray-400">Total</th>
                            <th className="p-4 text-sm font-semibold text-gray-400">Status</th>
                            <th className="p-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {estimates.map(est => (
                            <tr key={est.id} className="hover:bg-dark-secondary/50">
                                <td className="p-4 text-gray-300">{new Date(est.issueDate).toLocaleDateString()}</td>
                                <td className="p-4 text-white font-mono">#{est.id.slice(-6)}</td>
                                <td className="p-4 text-white">{est.customer}</td>
                                <td className="p-4 font-mono text-white">{formatAmount(est.total)}</td>
                                <td className="p-4"><EstimateStatusBadge status={est.status} /></td>
                                <td className="p-4 text-right space-x-2">
                                     <button
                                        onClick={() => setPreviewEstimate(est)}
                                        className="text-sm py-1 px-3 rounded-md border text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white transition-colors"
                                    >
                                        View / Print
                                    </button>
                                    {est.status === 'Sent' && (
                                        <button onClick={() => onConvertToInvoice(est)} className="text-sm py-1 px-3 rounded-md border border-brand-cyan text-brand-cyan hover:bg-brand-cyan/20">Convert</button>
                                    )}
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
