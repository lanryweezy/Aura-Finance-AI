
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';
import type { Bill, LineItem, InventoryItem } from '../types';

interface PayablesViewProps {
    bills: Bill[];
    onAddBill: (bill: Omit<Bill, 'id' | 'status' | 'issueDate'>) => void;
    onPayBill: (billId: string) => void;
    inventoryItems: InventoryItem[];
}

const BillStatusBadge: React.FC<{ status: Bill['status'] }> = ({ status }) => {
  const colorClasses = {
    Paid: 'bg-green-500/10 text-green-400',
    Unpaid: 'bg-yellow-500/10 text-yellow-400',
    Overdue: 'bg-red-500/10 text-red-400',
    Draft: 'bg-gray-500/10 text-gray-400',
  };
  return (
    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${colorClasses[status]}`}>
      {status}
    </span>
  );
};

const NewBillModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onAddBill: (bill: Omit<Bill, 'id' | 'status' | 'issueDate'>) => void;
    inventoryItems: InventoryItem[];
}> = ({ isOpen, onClose, onAddBill, inventoryItems }) => {
    const [vendor, setVendor] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [whtApplies, setWhtApplies] = useState(false);
    const [lineItems, setLineItems] = useState<Partial<LineItem>[]>([{ name: '', quantity: 1, unitPrice: 0 }]);

    const handleLineItemChange = (index: number, field: keyof LineItem, value: any) => {
        const updatedLineItems = [...lineItems];
        (updatedLineItems[index] as any)[field] = value;
        setLineItems(updatedLineItems);
    };

    const addLineItem = () => {
        setLineItems([...lineItems, { name: '', quantity: 1, unitPrice: 0 }]);
    };

    const removeLineItem = (index: number) => {
        setLineItems(lineItems.filter((_, i) => i !== index));
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!vendor || !dueDate || lineItems.length === 0) {
            alert("Please fill vendor, due date, and at least one line item.");
            return;
        }
        
        const finalLineItems = lineItems.map((li, index) => ({
            id: `li_${Date.now()}_${index}`,
            name: li.name || 'Item',
            description: li.description || '',
            quantity: Number(li.quantity) || 1,
            unitPrice: Number(li.unitPrice) || 0,
            total: (Number(li.quantity) || 1) * (Number(li.unitPrice) || 0),
        }));

        const totalAmount = finalLineItems.reduce((sum, item) => sum + item.total, 0);

        onAddBill({ 
            vendor, 
            description: description || `Bill from ${vendor}`,
            amount: totalAmount,
            dueDate,
            whtApplies,
            lineItems: finalLineItems
        });
        
        setVendor('');
        setDescription('');
        setLineItems([{ name: '', quantity: 1, unitPrice: 0 }]);
        setDueDate('');
        setWhtApplies(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-dark-tertiary rounded-2xl p-8 w-full max-w-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-6">Add New Bill</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Vendor Name" value={vendor} onChange={e => setVendor(e.target.value)} required className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan" />
                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan" />
                    </div>
                    <textarea placeholder="Overall Description (optional)" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan" rows={2}></textarea>
                    
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Line Items</label>
                        {lineItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input type="text" placeholder="Item/Service" value={item.name} onChange={e => handleLineItemChange(index, 'name', e.target.value)} className="w-full bg-dark-secondary border border-gray-600 rounded p-2 text-sm" />
                                <input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleLineItemChange(index, 'quantity', e.target.value)} className="w-20 bg-dark-secondary border border-gray-600 rounded p-2 text-sm" />
                                <input type="number" placeholder="Price" value={item.unitPrice} onChange={e => handleLineItemChange(index, 'unitPrice', e.target.value)} className="w-24 bg-dark-secondary border border-gray-600 rounded p-2 text-sm" />
                                <button type="button" onClick={() => removeLineItem(index)} className="text-red-500 hover:text-red-400 p-1">&times;</button>
                            </div>
                        ))}
                         <button type="button" onClick={addLineItem} className="text-xs text-brand-cyan hover:text-white">+ Add Line</button>
                    </div>

                    <div className="flex items-center justify-between gap-4 bg-dark-secondary p-3 rounded-lg">
                         <label htmlFor="wht-bill-checkbox" className="flex items-center gap-2 cursor-pointer text-white">
                           <input id="wht-bill-checkbox" type="checkbox" checked={whtApplies} onChange={() => setWhtApplies(!whtApplies)} className="w-5 h-5 rounded bg-dark-tertiary border-gray-600 text-brand-purple focus:ring-brand-purple"/>
                           WHT applies to this payment
                        </label>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-dark-secondary">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-brand-cyan text-black font-bold hover:bg-brand-cyan/80">Save Bill</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export const PayablesView: React.FC<PayablesViewProps> = ({ bills, onAddBill, onPayBill, inventoryItems }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const summary = useMemo(() => {
    return bills.reduce(
      (acc, bill) => {
        if (bill.status === 'Unpaid' || bill.status === 'Overdue') {
          acc.totalOutstanding += bill.amount;
        }
        if (bill.status === 'Overdue') {
          acc.totalOverdue += bill.amount;
        }
        return acc;
      },
      { totalOutstanding: 0, totalOverdue: 0 }
    );
  }, [bills]);

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
        <p className="ml-4 text-lg">Loading your bills...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-400">
        {error}
      </div>
    );
  }

  return (
    <>
    <NewBillModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddBill={onAddBill} inventoryItems={inventoryItems} />
    <div className="space-y-8">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-white">Accounts Payable</h2>
            <button onClick={() => setIsModalOpen(true)} className="bg-brand-cyan hover:bg-brand-cyan/80 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Add New Bill
            </button>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-gray-400 text-sm font-medium">Total Outstanding</h3>
          <p className="text-3xl font-bold text-yellow-400 mt-2">{formatNaira(summary.totalOutstanding)}</p>
        </Card>
        <Card>
          <h3 className="text-gray-400 text-sm font-medium">Total Overdue</h3>
          <p className="text-3xl font-bold text-red-400 mt-2">{formatNaira(summary.totalOverdue)}</p>
        </Card>
        <Card>
          <h3 className="text-gray-400 text-sm font-medium">Upcoming Bills (30 days)</h3>
          <p className="text-3xl font-bold text-blue-400 mt-2">
            {bills.filter(b => b.status === 'Unpaid' && new Date(b.dueDate) > new Date() && new Date(b.dueDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length}
          </p>
        </Card>
      </div>

      <Card className="h-full overflow-hidden flex flex-col">
        <h3 className="text-xl font-bold text-white mb-6">Bill Details</h3>
        <div className="overflow-y-auto flex-grow">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-dark-tertiary">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-400">Vendor</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Due Date</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Amount</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-dark-secondary/50">
                  <td className="p-4 text-white font-medium">{bill.vendor}</td>
                  <td className="p-4 whitespace-nowrap text-gray-300">{new Date(bill.dueDate).toLocaleDateString()}</td>
                  <td className="p-4 font-mono text-white">
                    <div className="flex items-center gap-2">
                        <span>{formatNaira(bill.amount)}</span>
                        {bill.whtApplies && <span className="text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-md">WHT</span>}
                    </div>
                  </td>
                  <td className="p-4"><BillStatusBadge status={bill.status} /></td>
                  <td className="p-4 text-right space-x-2">
                    {bill.status !== 'Paid' && (
                        <button 
                            onClick={() => onPayBill(bill.id)}
                            className="text-brand-cyan hover:text-white font-semibold transition-colors text-sm py-1 px-3 rounded-md border border-brand-cyan hover:bg-brand-cyan/20">
                            Pay Bill
                        </button>
                    )}
                  </td>
                </tr>
              ))}
               {bills.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-gray-500">No bills recorded yet.</td></tr>
               )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
    </>
  );
};
