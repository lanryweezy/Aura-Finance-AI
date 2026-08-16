import React, { useState, useRef } from 'react';
import { extractInvoiceFromFile, type InvoiceUploadData } from '../services/invoiceUploadService';

interface InvoiceUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: InvoiceUploadData) => void;
}

export const InvoiceUploadModal: React.FC<InvoiceUploadProps> = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState<InvoiceUploadData | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setExtracted(null);
    setError('');

    if (selected.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    } else {
      setPreview(null);
    }
  };

  const handleExtract = async () => {
    if (!file) return;
    setExtracting(true);
    setError('');
    try {
      const data = await extractInvoiceFromFile(file);
      setExtracted(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed');
    } finally {
      setExtracting(false);
    }
  };

  const handleImport = () => {
    if (extracted) {
      onImport(extracted);
      handleClose();
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setExtracted(null);
    setError('');
    onClose();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      setFile(dropped);
      setExtracted(null);
      setError('');
      if (dropped.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(dropped);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-secondary border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold">Upload Invoice</h3>
            <p className="text-xs text-gray-500 mt-1">Upload a PDF or image to extract invoice data</p>
          </div>
          <button onClick={handleClose} aria-label="Close modal" className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Upload Zone */}
          {!file && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center cursor-pointer hover:border-brand-cyan hover:bg-brand-cyan/5 transition-all"
            >
              <div className="text-4xl mb-3">📄</div>
              <p className="font-bold text-gray-300">Drop invoice here or click to browse</p>
              <p className="text-xs text-gray-500 mt-2">Supports PDF, PNG, JPG, JPEG</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} className="hidden" />

          {/* File Preview */}
          {file && !extracted && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-dark-primary border border-white/10 rounded-xl p-4">
                <span className="text-2xl">{file.type === 'application/pdf' ? '📑' : '🖼️'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button onClick={() => { setFile(null); setPreview(null); }} aria-label="Remove file" className="text-gray-400 hover:text-white text-sm">
                  ✕
                </button>
              </div>

              {preview && (
                <div className="rounded-xl overflow-hidden border border-white/10">
                  <img src={preview} alt="Invoice preview" className="w-full max-h-64 object-contain bg-white" />
                </div>
              )}

              <button
                onClick={handleExtract}
                disabled={extracting}
                className="w-full py-3 bg-brand-cyan text-black font-bold rounded-xl hover:bg-brand-cyan/80 transition-all disabled:opacity-50"
              >
                {extracting ? 'Extracting data with AI...' : 'Extract Invoice Data'}
              </button>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Extracted Data */}
          {extracted && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-400 text-lg">✓</span>
                <span className="text-sm font-bold text-green-400">Data extracted successfully</span>
                <span className="text-xs text-gray-500 ml-auto">
                  Confidence: {Math.round(extracted.confidence * 100)}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-dark-primary border border-white/10 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase">Customer</p>
                  <p className="text-sm font-bold mt-1">{extracted.customer}</p>
                </div>
                <div className="bg-dark-primary border border-white/10 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase">Reference</p>
                  <p className="text-sm font-bold mt-1">{extracted.reference || '—'}</p>
                </div>
                <div className="bg-dark-primary border border-white/10 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase">Issue Date</p>
                  <p className="text-sm font-bold mt-1">{extracted.issueDate}</p>
                </div>
                <div className="bg-dark-primary border border-white/10 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase">Due Date</p>
                  <p className="text-sm font-bold mt-1">{extracted.dueDate}</p>
                </div>
              </div>

              {/* Line Items */}
              {extracted.lineItems.length > 0 && (
                <div className="bg-dark-primary border border-white/10 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase mb-2">Line Items</p>
                  {extracted.lineItems.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm py-1 border-b border-white/5 last:border-0">
                      <span className="text-gray-300">{item.name || item.description}</span>
                      <span className="font-medium">₦{item.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Totals */}
              <div className="bg-dark-primary border border-white/10 rounded-xl p-3 space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Subtotal</span><span>₦{extracted.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>VAT</span><span>₦{extracted.vat.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-1 border-t border-white/10">
                  <span>Total</span><span className="text-brand-cyan">₦{extracted.total.toLocaleString()}</span>
                </div>
              </div>

              {extracted.notes && (
                <div className="bg-dark-primary border border-white/10 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase mb-1">Notes</p>
                  <p className="text-sm text-gray-300">{extracted.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/10 flex gap-3">
          <button onClick={handleClose} className="flex-1 py-2.5 bg-white/5 text-gray-400 rounded-xl font-bold hover:bg-white/10 transition-all text-sm">
            Cancel
          </button>
          {extracted && (
            <button onClick={handleImport} className="flex-1 py-2.5 bg-brand-cyan text-black rounded-xl font-bold hover:bg-brand-cyan/80 transition-all text-sm">
              Import as Invoice
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
