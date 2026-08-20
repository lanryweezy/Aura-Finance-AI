
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { AdvancedFilter } from './ui/AdvancedFilter';
import { EmailModal } from './EmailModal';
import { exportToCSV } from '../services/exportService';
import type { Bill, LineItem, InventoryItem } from '../types';
import { useToast } from './ui/Toast';
import { useCurrency } from './ui/CurrencyProvider';

interface PayablesViewProps {
    bills: Bill[];
    onAddBill: (bill: Omit<Bill, 'id' | 'status' | 'issueDate'>) => void;
    onPayBill: (billId: string) => void;
    inventoryItems: InventoryItem[];
}

const BillStatusBadge: React.FC<{ status: Bill['status'] }> = ({ status }) => {
  const colorClasses = {
    Paid: 'bg-green-500/10 text-green-600 dark:text-green-400',
    Unpaid: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    Overdue: 'bg-red-500/10 text-red-600 dark:text-red-400',
    Draft: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
  };
  return (
    <span className={`px-2.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-md border border-current opacity-90 ${colorClasses[status]}`}>
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
    const { showToast } = useToast();
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
            showToast("Please fill vendor, due date, and at least one line item.", "error");
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-tertiary rounded-2xl p-8 w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Add New Bill</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Vendor Name" value={vendor} onChange={e => setVendor(e.target.value)} required className="w-full bg-aura-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-aura-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all font-medium shadow-sm" />
                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="w-full bg-aura-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-aura-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all font-medium shadow-sm" />
                    </div>
                    <textarea placeholder="Overall Description (optional)" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-aura-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-aura-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all font-medium shadow-sm" rows={2}></textarea>
                    
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Line Items</label>
                        {lineItems.map((item, index) => (
                            <div key={index} className="flex flex-wrap md:flex-nowrap items-center gap-2 bg-aura-gray-50 dark:bg-dark-secondary/50 p-2 rounded-xl border border-gray-100 dark:border-gray-800">
                                <input type="text" placeholder="Item/Service" value={item.name} onChange={e => handleLineItemChange(index, 'name', e.target.value)} className="flex-1 min-w-[200px] bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm text-aura-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan transition-all outline-none" />
                                <input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleLineItemChange(index, 'quantity', e.target.value)} className="w-20 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm text-aura-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan transition-all outline-none font-bold" />
                                <input type="number" placeholder="Price" value={item.unitPrice} onChange={e => handleLineItemChange(index, 'unitPrice', e.target.value)} className="w-28 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm text-aura-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan transition-all outline-none font-mono font-bold" />
                                <button type="button" aria-label="Remove line item" onClick={() => removeLineItem(index)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-lg transition-all active:scale-90">&times;</button>
                            </div>
                        ))}
                         <button type="button" onClick={addLineItem} className="text-xs font-bold text-brand-cyan hover:opacity-80 mt-1 flex items-center gap-1 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            Add Line
                        </button>
                    </div>

                    <div className="flex items-center justify-between gap-4 bg-aura-gray-50 dark:bg-dark-secondary p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                         <label htmlFor="wht-bill-checkbox" className="flex items-center gap-2 cursor-pointer text-aura-gray-900 dark:text-white text-sm font-bold select-none">
                           <input id="wht-bill-checkbox" type="checkbox" checked={whtApplies} onChange={() => setWhtApplies(!whtApplies)} className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-brand-purple focus:ring-brand-purple transition-all shadow-sm"/>
                           WHT applies to this payment
                        </label>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-aura-gray-600 dark:text-gray-300 hover:bg-aura-gray-100 dark:hover:bg-dark-secondary transition-all font-bold">Cancel</button>
                        <button type="submit" className="px-8 py-2.5 rounded-xl bg-brand-cyan text-black font-bold hover:bg-brand-cyan/90 transition-all active:scale-95 shadow-lg shadow-brand-cyan/20">Save Bill</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export const PayablesView: React.FC<PayablesViewProps> = ({ bills, onAddBill, onPayBill, inventoryItems }) => {
  const { formatAmount } = useCurrency();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtering
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState<Bill | null>(null);

  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      if (filters.vendor && !bill.vendor.toLowerCase().includes(filters.vendor.toLowerCase())) return false;
      if (filters.status && bill.status !== filters.status) return false;
      if (filters.amount_min && bill.amount < Number(filters.amount_min)) return false;
      if (filters.amount_max && bill.amount > Number(filters.amount_max)) return false;
      if (filters.start_date && new Date(bill.issueDate) < new Date(filters.start_date)) return false;
      if (filters.end_date && new Date(bill.issueDate) > new Date(filters.end_date)) return false;
      return true;
    });
  }, [bills, filters]);

  const summary = useMemo(() => {
    return filteredBills.reduce(
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
  }, [filteredBills]);


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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Accounts Payable</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1 font-medium">Manage vendor bills, purchase orders, and outgoing payments.</p>
            </div>
            <div className="flex gap-2">
                <button onClick={() => exportToCSV('bills', filteredBills.map(b => ({ id: b.id.slice(-6), vendor: b.vendor, amount: b.amount, status: b.status, issueDate: b.issueDate, dueDate: b.dueDate })))} className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-500 hover:bg-white/10">📊 CSV</button>
                <button onClick={() => setIsModalOpen(true)} className="bg-brand-cyan hover:bg-brand-cyan/90 text-black font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-brand-cyan/20 active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    Add New Bill
                </button>
            </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-gray-100 dark:border-white/5 shadow-xl">
          <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest">Total Outstanding</h3>
          <p className="text-3xl font-black text-yellow-600 dark:text-yellow-400 mt-3">{formatAmount(summary.totalOutstanding)}</p>
        </Card>
        <Card className="border-gray-100 dark:border-white/5 shadow-xl">
          <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest">Total Overdue</h3>
          <p className="text-3xl font-black text-red-600 dark:text-red-400 mt-3">{formatAmount(summary.totalOverdue)}</p>
        </Card>
        <Card>
          <h3 className="text-gray-400 text-sm font-medium">Upcoming Bills (30 days)</h3>
          <p className="text-3xl font-bold text-blue-400 mt-2">
            {filteredBills.filter(b => b.status === 'Unpaid' && new Date(b.dueDate) > new Date() && new Date(b.dueDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length}
          </p>
        </Card>
      </div>

      <AdvancedFilter
        onFilter={setFilters}
        onExport={() => exportToCSV('bills', filteredBills)}
        options={[
            { label: 'Vendor', field: 'vendor', type: 'text' },
            { label: 'Status', field: 'status', type: 'select', options: [
                { label: 'Draft', value: 'Draft' },
                { label: 'Unpaid', value: 'Unpaid' },
                { label: 'Paid', value: 'Paid' },
                { label: 'Overdue', value: 'Overdue' }
            ]},
            { label: 'Start Date', field: 'start_date', type: 'date' },
            { label: 'End Date', field: 'end_date', type: 'date' },
            { label: 'Amount Range', field: 'amount', type: 'number-range' }
        ]}
      />

      <Card className="h-full overflow-hidden flex flex-col border-gray-100 dark:border-white/5">
        <h3 className="text-xl font-bold text-aura-gray-900 dark:text-white mb-6">Bill Details</h3>
        <div className="overflow-y-auto flex-grow">
          <table className="w-full text-left">
            <thead className="bg-aura-gray-50 dark:bg-dark-tertiary">
              <tr>
                <th className="p-4 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400">Vendor</th>
                <th className="p-4 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400">Due Date</th>
                <th className="p-4 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400">Amount</th>
                <th className="p-4 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400">Status</th>
                <th className="p-4 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-aura-gray-50/50 dark:hover:bg-dark-secondary/50 transition-colors group">
                  <td className="p-4 text-aura-gray-900 dark:text-white font-medium">{bill.vendor}</td>
                  <td className="p-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{new Date(bill.dueDate).toLocaleDateString()}</td>
                  <td className="p-4 font-mono text-aura-gray-900 dark:text-white">
                    <div className="flex items-center gap-2">
                        <span className="font-black">{formatAmount(bill.amount)}</span>
                        {bill.whtApplies && <span className="text-[9px] font-black uppercase tracking-tighter bg-purple-500/10 text-purple-600 dark:text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/20">WHT</span>}
                    </div>
                  </td>
                  <td className="p-4"><BillStatusBadge status={bill.status} /></td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                        onClick={async () => { const { generateBillPDF } = await import('../services/pdfService'); generateBillPDF(bill); }}
                        className="text-[11px] font-bold py-1.5 px-3 rounded-lg border text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
                    >
                        PDF
                    </button>
                    <button 
                        onClick={() => { setEmailRecipient(bill); setIsEmailModalOpen(true); }}
                        className="text-[11px] font-bold py-1.5 px-3 rounded-lg border text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-400/50 hover:bg-blue-50 dark:hover:bg-blue-400/20 transition-all active:scale-95"
                    >
                        Email
                    </button>
                    <button 
                        onClick={async () => { const { shareBillViaWhatsApp } = await import('../services/shareService'); shareBillViaWhatsApp(bill); }}
                        className="text-[11px] font-bold py-1.5 px-3 rounded-lg border text-green-600 dark:text-green-300 border-green-200 dark:border-green-400/50 hover:bg-green-50 dark:hover:bg-green-400/20 transition-all active:scale-95"
                    >
                        WhatsApp
                    </button>
                    {bill.status !== 'Paid' && (
                        <button 
                            onClick={() => onPayBill(bill.id)}
                            className="text-brand-cyan hover:bg-brand-cyan hover:text-black font-bold transition-all text-[11px] py-1.5 px-4 rounded-lg border border-brand-cyan active:scale-95">
                            Pay Bill
                        </button>
                    )}
                  </td>
                </tr>
              ))}
               {filteredBills.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-gray-500">No bills found matching filters.</td></tr>
               )}
            </tbody>
          </table>
        </div>
      </Card>
      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        recipient={emailRecipient}
        isInvoice={false}
      />
    </div>
    </>
  );
};
