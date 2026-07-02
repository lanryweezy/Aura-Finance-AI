
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { generateInvoiceReminder } from '../services/geminiService';
import { EmailModal } from './EmailModal';
import { InvoiceUploadModal } from './InvoiceUploadModal';
import { clientPortalService } from '../services/clientPortalService';
import { nrsSubmissionService, type NRSStatus } from '../services/nrsSubmissionService';
import { nrsApiService } from '../services/nrsApiService';
import type { InvoiceUploadData } from '../services/invoiceUploadService';
import { exportToCSV, exportToExcel } from '../services/exportService';
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

    const handleSubmit = async (e: React.FormEvent) => {
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
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="invoice-modal-title"
        >
            <div className="bg-white dark:bg-dark-tertiary rounded-2xl p-8 w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <h3 id="invoice-modal-title" className="text-xl font-bold text-gray-900 dark:text-white mb-6">Create New Invoice</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <legend className="sr-only">Customer and Date Information</legend>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="inv-customer" className="text-[10px] font-black text-gray-400 uppercase ml-1">Customer Name</label>
                            <input
                                id="inv-customer"
                                type="text"
                                placeholder="e.g. Dangote Group"
                                value={customer}
                                onChange={e => setCustomer(e.target.value)}
                                required
                                className="w-full bg-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all font-medium"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="inv-due-date" className="text-[10px] font-black text-gray-400 uppercase ml-1">Due Date</label>
                            <input
                                id="inv-due-date"
                                type="date"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                                required
                                className="w-full bg-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all font-medium"
                            />
                        </div>
                    </fieldset>
                    
                    <fieldset className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        <legend className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Line Items</legend>
                        {lineItems.map((item, index) => (
                             <div key={index} className="flex flex-wrap md:flex-nowrap items-center gap-2 bg-gray-50 dark:bg-dark-secondary/50 p-2 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div className="flex-1 min-w-[200px]">
                                    <label htmlFor={`item-select-${index}`} className="sr-only">Select Item</label>
                                    <select
                                        id={`item-select-${index}`}
                                        value={item.inventoryItemId}
                                        onChange={e => handleLineItemChange(index, 'inventoryItemId', e.target.value)}
                                        className="w-full bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan transition-all outline-none"
                                    >
                                        <option value="">Select Item</option>
                                        {inventoryItems.map(invItem => <option key={invItem.id} value={invItem.id}>{invItem.name}</option>)}
                                    </select>
                                </div>
                                <div className="w-20">
                                    <label htmlFor={`item-qty-${index}`} className="sr-only">Quantity</label>
                                    <input
                                        id={`item-qty-${index}`}
                                        type="number"
                                        placeholder="Qty"
                                        value={item.quantity}
                                        onChange={e => handleLineItemChange(index, 'quantity', e.target.value)}
                                        className="w-full bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan transition-all outline-none font-bold"
                                    />
                                </div>
                                <div className="w-28">
                                    <label htmlFor={`item-price-${index}`} className="sr-only">Unit Price</label>
                                    <input
                                        id={`item-price-${index}`}
                                        type="number"
                                        placeholder="Price"
                                        value={item.unitPrice}
                                        onChange={e => handleLineItemChange(index, 'unitPrice', e.target.value)}
                                        className="w-full bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan transition-all outline-none font-mono font-bold"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeLineItem(index)}
                                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-lg transition-all active:scale-90"
                                    aria-label={`Remove line item ${index + 1}`}
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={addLineItem} className="text-xs font-bold text-brand-cyan hover:opacity-80 mt-1 flex items-center gap-1 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            Add Line
                        </button>
                    </fieldset>

                    <div className="flex items-center justify-between gap-4 bg-gray-50 dark:bg-dark-secondary/50 border border-gray-100 dark:border-gray-700 p-4 rounded-xl">
                        <label htmlFor="vat-checkbox" className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-white text-sm font-bold select-none">
                           <input id="vat-checkbox" type="checkbox" checked={applyVat} onChange={() => setApplyVat(!applyVat)} className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-brand-cyan focus:ring-brand-cyan transition-all"/>
                           Apply VAT (7.5%)
                        </label>
                         <label htmlFor="wht-checkbox" className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-white text-sm font-bold select-none">
                           <input id="wht-checkbox" type="checkbox" checked={applyWht} onChange={() => setApplyWht(!applyWht)} className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-brand-purple focus:ring-brand-purple transition-all"/>
                           WHT applies
                        </label>
                    </div>

                    {/* Summary Section */}
                    <div
                        className="bg-gray-100/50 dark:bg-dark-secondary/30 p-5 rounded-2xl space-y-2 border border-gray-100 dark:border-gray-700/50 mt-4 shadow-inner"
                        aria-live="polite"
                    >
                        <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-400">
                            <span>Subtotal</span>
                            <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{formatAmount(calculatedSubtotal)}</span>
                        </div>
                        {applyVat && (
                            <div className="flex justify-between text-sm font-bold text-brand-cyan">
                                <span>VAT (7.5%)</span>
                                <span className="font-mono">{formatAmount(calculatedVat)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-xl font-black text-gray-900 dark:text-white pt-3 border-t border-gray-200 dark:border-gray-700/50">
                            <span>Total</span>
                            <span className="font-mono">{formatAmount(calculatedTotal)}</span>
                        </div>
                        {applyWht && (
                             <div className="flex justify-between text-[10px] font-bold text-brand-purple pt-2 italic uppercase tracking-wider">
                                <span>* Withholding Tax (5%) Applicable: {formatAmount(calculatedSubtotal * 0.05)}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-secondary transition-all font-bold">Cancel</button>
                        <button type="submit" className="px-8 py-2.5 rounded-xl bg-brand-cyan text-black font-bold hover:bg-brand-cyan/90 transition-all active:scale-95 shadow-lg shadow-brand-cyan/20">Save Invoice</button>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-tertiary rounded-2xl p-8 w-full max-w-xl shadow-2xl border border-gray-100 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Send Reminder for Invoice {invoice.id.slice(-6).toUpperCase()}</h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">AI-generated reminder email to: <span className="font-bold text-gray-900 dark:text-white">{invoice.customer}</span></p>
                <div className="bg-gray-50 dark:bg-dark-secondary p-5 rounded-2xl min-h-[200px] text-gray-700 dark:text-gray-200 whitespace-pre-wrap border border-gray-200 dark:border-gray-700 font-medium text-sm leading-relaxed shadow-inner">
                    {isLoading ? <div className="flex flex-col items-center justify-center h-full gap-3 py-10"><Spinner /><span className="text-xs font-bold animate-pulse">O-Heidi is drafting your email...</span></div> : reminderText}
                </div>
                <div className="flex justify-end gap-4 pt-8">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-secondary transition-all font-bold">Cancel</button>
                    <button type="button" onClick={() => {
                        showToast('Email sent (simulated)!', 'success');
                        onClose();
                    }} className="px-8 py-2.5 rounded-xl bg-brand-cyan text-black font-bold hover:bg-brand-cyan/90 transition-all active:scale-95 shadow-lg shadow-brand-cyan/20">Send Email</button>
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
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState<Invoice | null>(null);
  const [nrsStatus, setNrsStatus] = useState<NRSStatus | null>(null);
  const [submittingNrs, setSubmittingNrs] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
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

    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-3xl font-bold text-aura-gray-900 dark:text-white">Accounts Receivable</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Invoicing, customer payments, and revenue tracking.</p>
            </div>
            <div className="flex gap-2">
                <button onClick={() => exportToCSV('invoices', filteredInvoices.map(i => ({ id: i.id.slice(-6), customer: i.customer, amount: i.amount, total: i.total, status: i.status, issueDate: i.issueDate, dueDate: i.dueDate })))} className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-500 hover:bg-white/10">📊 CSV</button>
                <button onClick={() => setIsUploadModalOpen(true)} className="bg-white/5 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 active:scale-95">
                    📄 Upload
                </button>
                <button onClick={() => setIsNewInvoiceModalOpen(true)} className="bg-brand-cyan hover:bg-brand-cyan/90 text-black font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-brand-cyan/20 active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    Create New Invoice
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
        <Card className="border-gray-100 dark:border-white/5 shadow-xl">
          <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest">Draft Invoices</h3>
          <p className="text-3xl font-black text-gray-400 mt-3">
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

      <Card className="h-full overflow-hidden flex flex-col border-gray-100 dark:border-white/5">
        <h3 className="text-xl font-bold text-aura-gray-900 dark:text-white mb-6">Invoice Details</h3>
        <div className="overflow-y-auto flex-grow">
          <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-aura-gray-50 dark:bg-dark-tertiary">
              <tr>
                <th className="p-4 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400">Customer</th>
                <th className="p-4 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400">Due Date</th>
                <th className="p-4 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400">Total Amount</th>
                <th className="p-4 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400">Status</th>
                <th className="p-4 text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-aura-gray-50/50 dark:hover:bg-dark-secondary/50 transition-colors group">
                  <td className="p-4 text-aura-gray-900 dark:text-white font-medium">{invoice.customer}</td>
                  <td className="p-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                  <td className="p-4 font-mono text-aura-gray-900 dark:text-white">
                     <div className="flex flex-col gap-1">
                        <span className="font-black">{formatAmount(invoice.total)}</span>
                        <div className="flex flex-wrap gap-1">
                            {invoice.vat > 0 && (
                                <span className="text-[9px] font-black uppercase tracking-tighter bg-blue-500/10 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/20" title={`VAT: ${formatAmount(invoice.vat)}`}>
                                    VAT
                                </span>
                            )}
                            {invoice.whtApplied && (
                                <span className="text-[9px] font-black uppercase tracking-tighter bg-purple-500/10 text-purple-600 dark:text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/20" title="Withholding Tax (5%)">
                                    WHT
                                </span>
                            )}
                        </div>
                    </div>
                  </td>
                  <td className="p-4"><InvoiceStatusBadge status={invoice.status} /></td>
                  <td className="p-4 text-right space-x-2">
                    <button
                        onClick={() => setPreviewInvoice(invoice)}
                        className="text-[11px] font-bold py-1.5 px-3 rounded-lg border text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
                    >
                        View
                    </button>
                    {(invoice.status === 'Unpaid' || invoice.status === 'Overdue') && (
                        <>
                            <button 
                                onClick={() => handleOpenReminder(invoice)}
                                className="text-[11px] font-bold py-1.5 px-3 rounded-lg border text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-400/50 hover:bg-purple-50 dark:hover:bg-purple-400/20 transition-all active:scale-95"
                            >
                                AI Reminder
                            </button>
                            <button 
                                onClick={async () => { const { generateInvoicePDF } = await import('../services/pdfService'); generateInvoicePDF(invoice); }}
                                className="text-[11px] font-bold py-1.5 px-3 rounded-lg border text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
                            >
                                PDF
                            </button>
                            <button 
                                onClick={() => { const { printElement } = require('../services/exportService'); }}
                                className="text-[11px] font-bold py-1.5 px-3 rounded-lg border text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
                            >
                                🖨️
                            </button>
                            <button 
                                onClick={() => { setEmailRecipient(invoice); setIsEmailModalOpen(true); }}
                                className="text-[11px] font-bold py-1.5 px-3 rounded-lg border text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-400/50 hover:bg-blue-50 dark:hover:bg-blue-400/20 transition-all active:scale-95"
                            >
                                Email
                            </button>
                            <button 
                                onClick={async () => { const link = await clientPortalService.generateLink(invoice); const url = clientPortalService.getShareableUrl(link.token); await navigator.clipboard.writeText(url); alert('Portal link copied!'); }}
                                className="text-[11px] font-bold py-1.5 px-3 rounded-lg border text-orange-600 dark:text-orange-300 border-orange-200 dark:border-orange-400/50 hover:bg-orange-50 dark:hover:bg-orange-400/20 transition-all active:scale-95"
                            >
                                Portal
                            </button>
                            {nrsApiService.isConfigured() && (invoice.status as string) !== 'Paid' && (
                                <button 
                                    onClick={async () => {
                                        setSubmittingNrs(invoice.id);
                                        setNrsStatus({ stage: 'validating', message: 'Starting NRS submission...' });
                                        const user = JSON.parse(localStorage.getItem('aura_user') || '{}');
                                        const org = JSON.parse(localStorage.getItem('aura_org') || '{}');
                                        await nrsSubmissionService.submitInvoice(invoice, { ...user, ...org }, setNrsStatus);
                                        setSubmittingNrs(null);
                                    }}
                                    disabled={submittingNrs === invoice.id}
                                    className="text-[11px] font-bold py-1.5 px-3 rounded-lg border text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-400/50 hover:bg-purple-50 dark:hover:bg-purple-400/20 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {submittingNrs === invoice.id ? (nrsStatus?.stage === 'complete' ? '✓ Sent' : '...') : 'NRS'}
                                </button>
                            )}
                            <button 
                                onClick={async () => { const { shareInvoiceViaWhatsApp } = await import('../services/shareService'); shareInvoiceViaWhatsApp(invoice); }}
                                className="text-[11px] font-bold py-1.5 px-3 rounded-lg border text-green-600 dark:text-green-300 border-green-200 dark:border-green-400/50 hover:bg-green-50 dark:hover:bg-green-400/20 transition-all active:scale-95"
                            >
                                WhatsApp
                            </button>
                            <button 
                                onClick={() => onRecordPayment(invoice.id)}
                                className="text-brand-cyan hover:bg-brand-cyan hover:text-black font-bold transition-all text-[11px] py-1.5 px-4 rounded-lg border border-brand-cyan active:scale-95">
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
        </div>
      </Card>
      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        recipient={emailRecipient}
        isInvoice={true}
      />
      <InvoiceUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onImport={async (data) => {
          await onAddInvoice({
            customer: data.customer,
            description: data.description,
            amount: data.amount,
            vat: data.vat,
            total: data.total,
            dueDate: new Date(data.dueDate).toISOString(),
            whtApplied: false,
            lineItems: data.lineItems.map(li => ({ ...li, id: `li_${Date.now()}_${Math.random()}` })),
          });
        }}
      />
    </div>
    </>
  );
};
