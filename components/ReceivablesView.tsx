
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { generateInvoiceReminder } from '../services/geminiService';
import { DocumentPreviewModal } from './ui/DocumentPreviewModal';
import { AdvancedFilter } from './ui/AdvancedFilter';
import { exportToCSV } from '../services/exportService';
import type { Invoice, LineItem, InventoryItem } from '../types';
import { useToast } from './ui/Toast';
import { useCurrency } from './ui/CurrencyProvider';

interface ReceivablesViewProps {
    invoices: Invoice[];
    onAddInvoice: (invoice: Omit<Invoice, 'id' | 'issueDate' | 'status'>) => void;
    onRecordPayment: (invoiceId: string) => void;
    inventoryItems: InventoryItem[];
}

const InvoiceStatusBadge: React.FC<{ status: Invoice['status'] }> = ({ status }) => {
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

const NewInvoiceModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onAddInvoice: (invoice: Omit<Invoice, 'id' | 'issueDate' | 'status'>) => void; 
    inventoryItems: InventoryItem[];
}> = ({ isOpen, onClose, onAddInvoice, inventoryItems }) => {
    const { formatAmount } = useCurrency();
    const { showToast } = useToast();
    const [customer, setCustomer] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [applyVat, setApplyVat] = useState(true);
    const [applyWht, setApplyWht] = useState(false);
    const [lineItems, setLineItems] = useState<Partial<LineItem>[]>([{ inventoryItemId: '', quantity: 1, unitPrice: 0 }]);

    const handleLineItemChange = (index: number, field: keyof LineItem, value: any) => {
        const updatedLineItems = [...lineItems];
        (updatedLineItems[index] as any)[field] = value;
        
        if (field === 'inventoryItemId' && value !== '') {
            const selectedItem = inventoryItems.find(item => item.id === value);
            if (selectedItem) {
                updatedLineItems[index].name = selectedItem.name;
                updatedLineItems[index].unitPrice = selectedItem.salePrice;
            }
        }
        setLineItems(updatedLineItems);
    };

    const addLineItem = () => {
        setLineItems([...lineItems, { inventoryItemId: '', quantity: 1, unitPrice: 0 }]);
    };

    const removeLineItem = (index: number) => {
        setLineItems(lineItems.filter((_, i) => i !== index));
    };

    // Real-time calculations for the summary view
    const calculatedSubtotal = lineItems.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)), 0);
    const calculatedVat = applyVat ? calculatedSubtotal * 0.075 : 0;
    const calculatedTotal = calculatedSubtotal + calculatedVat;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!customer || !dueDate) {
            showToast("Please fill customer and due date.", "error");
            return;
        }

        const finalLineItems = lineItems.map((li, idx) => {
            const quantity = Number(li.quantity) || 1;
            const unitPrice = Number(li.unitPrice) || 0;
            return {
                id: `li_${Date.now()}_${idx}`,
                inventoryItemId: li.inventoryItemId || undefined,
                name: li.name || 'Item/Service',
                description: li.description || '',
                quantity,
                unitPrice,
                total: quantity * unitPrice,
            };
        });

        const subtotal = finalLineItems.reduce((sum, item) => sum + item.total, 0);
        const vatAmount = applyVat ? subtotal * 0.075 : 0;
        const totalAmount = subtotal + vatAmount;
        
        onAddInvoice({ 
            customer, 
            description: `Invoice to ${customer}`, 
            amount: subtotal,
            vat: vatAmount,
            total: totalAmount,
            dueDate,
            whtApplied: applyWht,
            lineItems: finalLineItems
        });
        
        setCustomer('');
        setLineItems([{ inventoryItemId: '', quantity: 1, unitPrice: 0 }]);
        setDueDate('');
        setApplyVat(true);
        setApplyWht(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-dark-tertiary rounded-2xl p-8 w-full max-w-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-6">Create New Invoice</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Customer Name" value={customer} onChange={e => setCustomer(e.target.value)} required className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan" />
                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan" />
                    </div>
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        <label className="text-sm text-gray-400">Line Items</label>
                        {lineItems.map((item, index) => (
                             <div key={index} className="flex items-center gap-2">
                                <select value={item.inventoryItemId} onChange={e => handleLineItemChange(index, 'inventoryItemId', e.target.value)} className="w-full bg-dark-secondary border border-gray-600 rounded p-2 text-sm text-white focus:outline-none focus:border-brand-cyan">
                                    <option value="">Select Item</option>
                                    {inventoryItems.map(invItem => <option key={invItem.id} value={invItem.id}>{invItem.name}</option>)}
                                </select>
                                <input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleLineItemChange(index, 'quantity', e.target.value)} className="w-20 bg-dark-secondary border border-gray-600 rounded p-2 text-sm text-white focus:outline-none focus:border-brand-cyan" />
                                <input type="number" placeholder="Price" value={item.unitPrice} onChange={e => handleLineItemChange(index, 'unitPrice', e.target.value)} className="w-24 bg-dark-secondary border border-gray-600 rounded p-2 text-sm text-white focus:outline-none focus:border-brand-cyan" />
                                <button type="button" onClick={() => removeLineItem(index)} className="text-red-500 hover:text-red-400 p-1">&times;</button>
                            </div>
                        ))}
                        <button type="button" onClick={addLineItem} className="text-xs text-brand-cyan hover:text-white mt-1">+ Add Line</button>
                    </div>

                    <div className="flex items-center justify-between gap-4 bg-dark-secondary/50 border border-gray-700 p-3 rounded-lg">
                        <label htmlFor="vat-checkbox" className="flex items-center gap-2 cursor-pointer text-white text-sm select-none">
                           <input id="vat-checkbox" type="checkbox" checked={applyVat} onChange={() => setApplyVat(!applyVat)} className="w-4 h-4 rounded bg-dark-tertiary border-gray-600 text-brand-cyan focus:ring-brand-cyan"/>
                           Apply VAT (7.5%)
                        </label>
                         <label htmlFor="wht-checkbox" className="flex items-center gap-2 cursor-pointer text-white text-sm select-none">
                           <input id="wht-checkbox" type="checkbox" checked={applyWht} onChange={() => setApplyWht(!applyWht)} className="w-4 h-4 rounded bg-dark-tertiary border-gray-600 text-brand-purple focus:ring-brand-purple"/>
                           WHT applies
                        </label>
                    </div>

                    {/* Summary Section */}
                    <div className="bg-dark-secondary/30 p-4 rounded-lg space-y-2 border border-gray-700/50 mt-2">
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>Subtotal</span>
                            <span>{formatAmount(calculatedSubtotal)}</span>
                        </div>
                        {applyVat && (
                            <div className="flex justify-between text-sm text-brand-cyan">
                                <span>VAT (7.5%)</span>
                                <span>{formatAmount(calculatedVat)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-gray-700/50">
                            <span>Total</span>
                            <span>{formatAmount(calculatedTotal)}</span>
                        </div>
                        {applyWht && (
                             <div className="flex justify-between text-xs text-brand-purple pt-1 italic">
                                <span>* Withholding Tax (5%) Applicable: {formatAmount(calculatedSubtotal * 0.05)}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-4 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-dark-secondary transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-brand-cyan text-black font-bold hover:bg-brand-cyan/80 transition-colors shadow-[0_0_15px_rgba(0,245,212,0.3)]">Save Invoice</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ReminderModal: React.FC<{ isOpen: boolean; onClose: () => void; invoice: Invoice | null; reminderText: string; isLoading: boolean; }> = ({ isOpen, onClose, invoice, reminderText, isLoading }) => {
    const { showToast } = useToast();
    if (!isOpen || !invoice) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-dark-tertiary rounded-2xl p-8 w-full max-w-xl shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-2">Send Reminder for Invoice {invoice.id.slice(-6)}</h3>
                <p className="text-gray-400 mb-6">AI-generated reminder email to: {invoice.customer}</p>
                <div className="bg-dark-secondary p-4 rounded-lg min-h-[200px] text-gray-200 whitespace-pre-wrap border border-gray-700">
                    {isLoading ? <div className="flex items-center justify-center h-full"><Spinner /></div> : reminderText}
                </div>
                <div className="flex justify-end gap-4 pt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-dark-secondary">Cancel</button>
                    <button type="button" onClick={() => {
                        showToast('Email sent (simulated)!', 'success');
                        onClose();
                    }} className="px-6 py-2 rounded-lg bg-brand-cyan text-black font-bold hover:bg-brand-cyan/80">Send Email</button>
                </div>
            </div>
        </div>
    );
};


export const ReceivablesView: React.FC<ReceivablesViewProps> = ({ invoices, onAddInvoice, onRecordPayment, inventoryItems }) => {
  const { formatAmount } = useCurrency();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);
  
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [reminderText, setReminderText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Filtering
  const [filters, setFilters] = useState<Record<string, any>>({});

  // Document Preview State
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (filters.customer && !inv.customer.toLowerCase().includes(filters.customer.toLowerCase())) return false;
      if (filters.status && inv.status !== filters.status) return false;
      if (filters.amount_min && inv.total < Number(filters.amount_min)) return false;
      if (filters.amount_max && inv.total > Number(filters.amount_max)) return false;
      if (filters.start_date && new Date(inv.issueDate) < new Date(filters.start_date)) return false;
      if (filters.end_date && new Date(inv.issueDate) > new Date(filters.end_date)) return false;
      return true;
    });
  }, [invoices, filters]);

  const handleOpenReminder = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsReminderModalOpen(true);
    setIsGenerating(true);
    try {
        const text = await generateInvoiceReminder(invoice);
        setReminderText(text);
    } catch (e) {
        setReminderText("Error generating reminder.");
    } finally {
        setIsGenerating(false);
    }
  };

  const summary = useMemo(() => {
    return filteredInvoices.reduce(
      (acc, invoice) => {
        if (invoice.status === 'Unpaid' || invoice.status === 'Overdue') {
          acc.totalOutstanding += invoice.total;
        }
        if (invoice.status === 'Overdue') {
          acc.totalOverdue += invoice.total;
        }
        if (invoice.status === 'Draft') {
          acc.drafts++;
        }
        return acc;
      },
      { totalOutstanding: 0, totalOverdue: 0, drafts: 0 }
    );
  }, [filteredInvoices]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
        <p className="ml-4 text-lg">Loading your invoices...</p>
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
    <NewInvoiceModal isOpen={isNewInvoiceModalOpen} onClose={() => setIsNewInvoiceModalOpen(false)} onAddInvoice={onAddInvoice} inventoryItems={inventoryItems} />
    <ReminderModal isOpen={isReminderModalOpen} onClose={() => setIsReminderModalOpen(false)} invoice={selectedInvoice} reminderText={reminderText} isLoading={isGenerating} />
    
    <DocumentPreviewModal 
        isOpen={!!previewInvoice} 
        onClose={() => setPreviewInvoice(null)} 
        data={previewInvoice} 
        type="invoice" 
    />

    <div className="space-y-8">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-white">Accounts Receivable</h2>
            <button onClick={() => setIsNewInvoiceModalOpen(true)} className="bg-brand-cyan hover:bg-brand-cyan/80 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(0,245,212,0.2)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Create New Invoice
            </button>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-gray-400 text-sm font-medium">Total Outstanding</h3>
          <p className="text-3xl font-bold text-yellow-400 mt-2">{formatAmount(summary.totalOutstanding)}</p>
        </Card>
        <Card>
          <h3 className="text-gray-400 text-sm font-medium">Total Overdue</h3>
          <p className="text-3xl font-bold text-red-400 mt-2">{formatAmount(summary.totalOverdue)}</p>
        </Card>
        <Card>
          <h3 className="text-gray-400 text-sm font-medium">Draft Invoices</h3>
          <p className="text-3xl font-bold text-gray-400 mt-2">
            {summary.drafts}
          </p>
        </Card>
      </div>

      <AdvancedFilter
        onFilter={setFilters}
        onExport={() => exportToCSV('invoices', filteredInvoices)}
        options={[
            { label: 'Customer', field: 'customer', type: 'text' },
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

      <Card className="h-full overflow-hidden flex flex-col">
        <h3 className="text-xl font-bold text-white mb-6">Invoice Details</h3>
        <div className="overflow-y-auto flex-grow">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-dark-tertiary">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-400">Customer</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Due Date</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Total Amount</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-dark-secondary/50 transition-colors">
                  <td className="p-4 text-white font-medium">{invoice.customer}</td>
                  <td className="p-4 whitespace-nowrap text-gray-300">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                  <td className="p-4 font-mono text-white">
                     <div className="flex flex-col gap-1">
                        <span className="font-bold">{formatAmount(invoice.total)}</span>
                        <div className="flex flex-wrap gap-1">
                            {invoice.vat > 0 && (
                                <span className="text-[10px] font-medium bg-blue-500/10 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/20" title={`VAT: ${formatAmount(invoice.vat)}`}>
                                    VAT
                                </span>
                            )}
                            {invoice.whtApplied && (
                                <span className="text-[10px] font-medium bg-purple-500/10 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/20" title="Withholding Tax (5%)">
                                    WHT: {formatAmount(invoice.amount * 0.05)}
                                </span>
                            )}
                        </div>
                    </div>
                  </td>
                  <td className="p-4"><InvoiceStatusBadge status={invoice.status} /></td>
                  <td className="p-4 text-right space-x-2">
                    <button
                        onClick={() => setPreviewInvoice(invoice)}
                        className="text-sm py-1 px-3 rounded-md border text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                        View / Print
                    </button>
                    {(invoice.status === 'Unpaid' || invoice.status === 'Overdue') && (
                        <>
                            <button
                                onClick={() => handleOpenReminder(invoice)}
                                className="text-sm py-1 px-3 rounded-md border text-purple-300 border-purple-400/50 hover:bg-purple-400/20 transition-colors"
                            >
                                AI Reminder
                            </button>
                            <button 
                                onClick={() => onRecordPayment(invoice.id)}
                                className="text-brand-cyan hover:text-white font-semibold transition-colors text-sm py-1 px-3 rounded-md border border-brand-cyan hover:bg-brand-cyan/20">
                                Pay
                            </button>
                        </>
                    )}
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-gray-500">No invoices found matching filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
    </>
  );
};
