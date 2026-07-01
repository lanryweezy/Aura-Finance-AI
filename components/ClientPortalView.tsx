import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { clientPortalService, type PortalLink } from '../services/clientPortalService';
import type { Invoice } from '../types';

function formatNGN(amount: number): string {
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
}

const statusColors: Record<string, string> = {
  Paid: 'bg-green-500/20 text-green-400 border-green-500/30',
  Unpaid: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Overdue: 'bg-red-500/20 text-red-400 border-red-500/30',
  Draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export const ClientPortalView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [link, setLink] = useState<PortalLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (!token) return;
    clientPortalService.getInvoiceByToken(token).then(result => {
      if (result) {
        setInvoice(result.invoice);
        setLink(result.link);
        setPaid(result.invoice.status === 'Paid');
      } else {
        setError('Invalid or expired invoice link.');
      }
    }).catch(() => setError('Failed to load invoice.')).finally(() => setLoading(false));
  }, [token]);

  const handlePay = async () => {
    if (!token) return;
    setPaying(true);
    try {
      await clientPortalService.confirmPayment(token);
      setPaid(true);
    } catch {
      setError('Payment confirmation failed.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-dark-primary flex items-center justify-center">
      <div className="text-white animate-pulse">Loading invoice...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-dark-primary flex items-center justify-center">
      <div className="text-center bg-red-900/20 border border-red-500 p-8 rounded-xl max-w-md">
        <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
        <p className="text-red-300">{error}</p>
      </div>
    </div>
  );

  if (!invoice || !link) return null;

  return (
    <div className="min-h-screen bg-dark-primary text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gradient-to-br from-brand-cyan to-brand-purple p-2 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          </div>
          <span className="text-xl font-black tracking-tight">AURA</span>
        </div>

        <div className="bg-dark-secondary border border-white/10 rounded-2xl p-6 md:p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold">{link.invoiceNumber}</h1>
              <p className="text-gray-400 text-sm mt-1">To: {link.clientName}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-bold border ${statusColors[paid ? 'Paid' : link.status]}`}>
              {paid ? 'Paid' : link.status}
            </span>
          </div>

          <div className="border-t border-white/10 pt-4 space-y-3">
            {invoice.lineItems?.map((item: any, i: number) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-300">{item.name || item.description || `Item ${i + 1}`}</span>
                <span className="font-medium">{formatNGN(item.total || item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Subtotal</span>
              <span>{formatNGN(invoice.amount)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>VAT (7.5%)</span>
              <span>{formatNGN(invoice.vat)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
              <span>Total</span>
              <span className="text-brand-cyan">{formatNGN(invoice.total)}</span>
            </div>
          </div>

          <div className="flex justify-between text-sm text-gray-400 mt-4">
            <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
          </div>

          {!paid && (
            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full mt-6 py-3 bg-brand-cyan text-black font-bold rounded-xl hover:bg-brand-cyan/80 transition-all disabled:opacity-50 text-lg"
            >
              {paying ? 'Processing...' : `Pay ${formatNGN(invoice.total)}`}
            </button>
          )}

          {paid && (
            <div className="mt-6 text-center py-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <p className="text-green-400 font-bold">Payment Confirmed</p>
              <p className="text-green-400/70 text-sm mt-1">Thank you for your payment</p>
            </div>
          )}
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">Powered by Aura Finance AI</p>
      </div>
    </div>
  );
};
