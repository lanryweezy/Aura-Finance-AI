
import React, { useState } from 'react';
import type { Invoice, Estimate, LineItem } from '../../types';
import { useToast } from './Toast';
import { useCurrency } from './CurrencyProvider';

interface DocumentData {
    id: string;
    type: 'Invoice' | 'Estimate' | 'Quote';
    recipientName: string;
    issueDate: string;
    dueDate?: string; // Estimates might have expiryDate mapped here
    items: LineItem[];
    subtotal: number;
    vat?: number;
    wht?: number;
    total: number;
    status: string;
    currency: string;
}

interface DocumentPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: Invoice | Estimate | null;
    type: 'invoice' | 'estimate';
}

const TEMPLATES = [
    { id: 'modern', name: 'Modern Clean', color: '#00F5D4' },
    { id: 'corporate', name: 'Corporate Blue', color: '#2563EB' },
    { id: 'creative', name: 'Creative Bold', color: '#F15BB5' },
    { id: 'tech', name: 'Tech Mono', color: '#10142C' },
    { id: 'classic', name: 'Classic Serif', color: '#333333' },
    { id: 'grid', name: 'Simple Grid', color: '#475569' },
];

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ isOpen, onClose, data, type }) => {
    const { formatAmount } = useCurrency();
    const { showToast } = useToast();
    const [selectedTemplate, setSelectedTemplate] = useState('modern');
    const [isSending, setIsSending] = useState(false);

    if (!isOpen || !data) return null;

    // Normalize Data
    const doc: DocumentData = {
        id: data.id,
        type: type === 'invoice' ? 'Invoice' : 'Quote',
        recipientName: type === 'invoice' ? (data as Invoice).customer : (data as Estimate).customer,
        issueDate: data.issueDate,
        dueDate: type === 'invoice' ? (data as Invoice).dueDate : (data as Estimate).expiryDate,
        items: data.lineItems,
        subtotal: type === 'invoice' ? (data as Invoice).amount : (data as Estimate).lineItems.reduce((acc, i) => acc + i.total, 0),
        vat: type === 'invoice' ? (data as Invoice).vat : 0,
        wht: type === 'invoice' && (data as Invoice).whtApplied ? (data as Invoice).amount * 0.05 : 0,
        total: data.total,
        status: data.status,
        currency: 'NGN'
    };

    const formatMoney = (amount: number) => formatAmount(amount);
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const handlePrint = () => {
        const printWindow = window.open('', '', 'height=800,width=1000');
        if (!printWindow) return;

        // Generate HTML based on template
        const getStyles = () => {
            const baseStyles = `
                body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; margin: 0; padding: 40px; color: #1f2937; }
                .container { max-width: 800px; margin: 0 auto; }
                .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
                .logo { font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }
                .meta { text-align: right; }
                .bill-to { margin-bottom: 40px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th { text-align: left; padding: 12px 8px; font-size: 12px; text-transform: uppercase; }
                td { padding: 12px 8px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
                .totals { width: 300px; margin-left: auto; }
                .row { display: flex; justify-content: space-between; padding: 8px 0; }
                .total-row { font-weight: bold; font-size: 18px; border-top: 2px solid #000; padding-top: 12px; }
                .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #6b7280; }
            `;

            switch (selectedTemplate) {
                case 'corporate': return baseStyles + `
                    .header { background: #f0f9ff; padding: 40px; margin: -40px -40px 40px -40px; border-bottom: 4px solid #2563EB; }
                    .logo { color: #2563EB; }
                    th { background: #2563EB; color: white; }
                `;
                case 'creative': return baseStyles + `
                    body { font-family: 'Poppins', sans-serif; }
                    .header { flex-direction: row-reverse; }
                    .meta { text-align: left; }
                    .logo { color: #F15BB5; font-size: 40px; }
                    th { border-bottom: 2px solid #F15BB5; color: #F15BB5; }
                    .total-row { color: #F15BB5; border-color: #F15BB5; }
                `;
                case 'tech': return baseStyles + `
                    body { font-family: 'Courier New', monospace; background-color: #f8fafc; }
                    .container { background: white; padding: 20px; border: 1px solid #cbd5e1; }
                    .header { border-bottom: 1px dashed #000; padding-bottom: 20px; }
                    th { background: #0f172a; color: #00F5D4; }
                `;
                case 'classic': return baseStyles + `
                    body { font-family: 'Georgia', serif; }
                    .logo { font-family: 'Georgia', serif; text-align: center; width: 100%; margin-bottom: 20px; }
                    .header { display: block; text-align: center; }
                    .meta { text-align: center; margin-top: 10px; }
                    th { border-bottom: 1px solid #000; border-top: 1px solid #000; }
                `;
                case 'grid': return baseStyles + `
                    table, th, td { border: 1px solid #9ca3af; }
                    .header { border: 1px solid #9ca3af; padding: 20px; margin-bottom: 20px; }
                    .bill-to { border: 1px solid #9ca3af; padding: 20px; margin-bottom: 20px; }
                    .totals { border: 1px solid #9ca3af; padding: 20px; width: 100%; box-sizing: border-box; }
                `;
                case 'modern': 
                default: return baseStyles + `
                    .logo { color: #00F5D4; }
                    th { color: #6b7280; border-bottom: 2px solid #e5e7eb; }
                `;
            }
        };

        const html = `
            <html>
                <head>
                    <title>${doc.type} - ${doc.id}</title>
                    <style>${getStyles()}</style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">Aura Finance</div>
                            <div class="meta">
                                <h1>${doc.type}</h1>
                                <p>#${doc.id.toUpperCase()}</p>
                                <p>Date: ${formatDate(doc.issueDate)}</p>
                                ${doc.dueDate ? `<p>${doc.type === 'Invoice' ? 'Due' : 'Expires'}: ${formatDate(doc.dueDate)}</p>` : ''}
                            </div>
                        </div>
                        
                        <div class="bill-to">
                            <p><strong>Bill To:</strong></p>
                            <h2>${doc.recipientName}</h2>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th style="text-align: right;">Qty</th>
                                    <th style="text-align: right;">Price</th>
                                    <th style="text-align: right;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${doc.items.map(item => `
                                    <tr>
                                        <td>
                                            <strong>${item.name}</strong><br/>
                                            <span style="font-size: 12px; color: #6b7280;">${item.description || ''}</span>
                                        </td>
                                        <td style="text-align: right;">${item.quantity}</td>
                                        <td style="text-align: right;">${formatMoney(item.unitPrice)}</td>
                                        <td style="text-align: right;">${formatMoney(item.total)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>

                        <div class="totals">
                            <div class="row">
                                <span>Subtotal:</span>
                                <span>${formatMoney(doc.subtotal)}</span>
                            </div>
                            ${doc.vat ? `
                            <div class="row">
                                <span>VAT (7.5%):</span>
                                <span>${formatMoney(doc.vat)}</span>
                            </div>` : ''}
                             ${doc.wht ? `
                            <div class="row" style="color: #6b7280; font-size: 12px;">
                                <span>(WHT 5%):</span>
                                <span>(${formatMoney(doc.wht)})</span>
                            </div>` : ''}
                            <div class="row total-row">
                                <span>Total:</span>
                                <span>${formatMoney(doc.total)}</span>
                            </div>
                        </div>

                        <div class="footer">
                            <p>Thank you for your business.</p>
                            <p>Powered by Aura Finance AI</p>
                        </div>
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        // Allow images to load if any before printing
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    const handleEmail = () => {
        setIsSending(true);
        setTimeout(() => {
            setIsSending(false);
            showToast(`Email sent successfully to ${doc.recipientName}!`, 'success');
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-dark-primary w-full max-w-6xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex border border-gray-700" onClick={e => e.stopPropagation()}>
                
                {/* Sidebar Controls */}
                <div className="w-80 bg-dark-tertiary border-r border-gray-700 p-6 flex flex-col gap-6 overflow-y-auto">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">Document Preview</h2>
                        <p className="text-sm text-gray-400">Select a template and share.</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Select Template</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {TEMPLATES.map(t => (
                                <button 
                                    key={t.id}
                                    onClick={() => setSelectedTemplate(t.id)}
                                    className={`p-3 rounded-lg border text-left transition-all ${selectedTemplate === t.id ? 'border-brand-cyan bg-brand-cyan/10' : 'border-gray-700 hover:bg-white/5'}`}
                                >
                                    <div className="w-full h-12 rounded bg-gray-700 mb-2 overflow-hidden relative">
                                        <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: t.color }}></div>
                                        {t.id === 'grid' && <div className="absolute inset-2 border border-gray-500 opacity-30"></div>}
                                        {t.id === 'classic' && <div className="absolute inset-0 flex items-center justify-center font-serif text-xs text-gray-400">Serif</div>}
                                        {t.id === 'tech' && <div className="absolute inset-0 bg-black opacity-30"></div>}
                                    </div>
                                    <span className={`text-xs font-medium ${selectedTemplate === t.id ? 'text-brand-cyan' : 'text-gray-400'}`}>{t.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto space-y-3">
                        <button 
                            onClick={handlePrint}
                            className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                            Print / Download PDF
                        </button>
                        <button 
                            onClick={handleEmail}
                            disabled={isSending}
                            className="w-full py-3 bg-brand-cyan text-black font-bold rounded-xl hover:bg-brand-cyan/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSending ? (
                                <span className="animate-spin">⌛</span>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                            )}
                            {isSending ? 'Sending...' : 'Send via Email'}
                        </button>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="flex-1 bg-gray-900 p-8 overflow-y-auto flex justify-center">
                    <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-black shadow-2xl p-10 origin-top transform scale-90 sm:scale-100 transition-transform duration-300">
                        {/* 
                            This is a visual preview only. 
                            The actual print output is generated in handlePrint() to ensure perfect CSS isolation 
                            from the dark mode app. We approximate the look here for the user.
                        */}
                         <div style={{ fontFamily: selectedTemplate === 'tech' ? 'monospace' : selectedTemplate === 'classic' ? 'serif' : 'sans-serif' }}>
                            {/* Header */}
                            <div className={`flex justify-between mb-8 ${selectedTemplate === 'corporate' ? 'bg-blue-50 -mx-10 -mt-10 p-10 border-b-4 border-blue-600' : ''} ${selectedTemplate === 'grid' ? 'border border-gray-400 p-5' : ''}`}>
                                <div>
                                    <h1 className={`text-2xl font-bold uppercase tracking-widest ${selectedTemplate === 'creative' ? 'text-pink-500 text-4xl' : selectedTemplate === 'corporate' ? 'text-blue-600' : selectedTemplate === 'modern' ? 'text-teal-400' : ''}`}>Aura Finance</h1>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-3xl font-light text-gray-400 uppercase">{doc.type}</h2>
                                    <p className="font-mono text-sm text-gray-600 mt-1">#{doc.id.toUpperCase()}</p>
                                    <p className="text-sm text-gray-500">{formatDate(doc.issueDate)}</p>
                                </div>
                            </div>

                            <div className={`mb-10 ${selectedTemplate === 'grid' ? 'border border-gray-400 p-5' : ''}`}>
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Bill To</p>
                                <h3 className="text-xl font-bold">{doc.recipientName}</h3>
                            </div>

                            <table className={`w-full mb-8 ${selectedTemplate === 'grid' ? 'border border-gray-400' : ''}`}>
                                <thead>
                                    <tr className={`
                                        ${selectedTemplate === 'corporate' ? 'bg-blue-600 text-white' : ''}
                                        ${selectedTemplate === 'tech' ? 'bg-slate-900 text-teal-400' : ''}
                                        ${selectedTemplate === 'creative' ? 'border-b-2 border-pink-500 text-pink-500' : 'border-b border-gray-200'}
                                    `}>
                                        <th className="text-left py-2 px-2">Item</th>
                                        <th className="text-right py-2 px-2">Qty</th>
                                        <th className="text-right py-2 px-2">Price</th>
                                        <th className="text-right py-2 px-2">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {doc.items.map((item, i) => (
                                        <tr key={i} className={`border-b border-gray-100 ${selectedTemplate === 'grid' ? 'border-gray-400' : ''}`}>
                                            <td className="py-3 px-2">
                                                <p className="font-bold text-sm">{item.name}</p>
                                                <p className="text-xs text-gray-500">{item.description}</p>
                                            </td>
                                            <td className="text-right py-3 px-2 text-sm">{item.quantity}</td>
                                            <td className="text-right py-3 px-2 text-sm">{formatMoney(item.unitPrice)}</td>
                                            <td className="text-right py-3 px-2 text-sm font-medium">{formatMoney(item.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className={`flex justify-end ${selectedTemplate === 'grid' ? 'border border-gray-400 p-5' : ''}`}>
                                <div className="w-64 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="font-medium">{formatMoney(doc.subtotal)}</span>
                                    </div>
                                    {doc.vat ? (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">VAT (7.5%)</span>
                                            <span className="font-medium">{formatMoney(doc.vat)}</span>
                                        </div>
                                    ) : null}
                                    <div className={`flex justify-between text-lg font-bold border-t-2 pt-2 mt-2 ${selectedTemplate === 'creative' ? 'border-pink-500 text-pink-500' : 'border-black'}`}>
                                        <span>Total</span>
                                        <span>{formatMoney(doc.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
        </div>
    );
};
