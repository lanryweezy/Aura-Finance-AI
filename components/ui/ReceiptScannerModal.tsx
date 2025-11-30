
import React, { useState, useRef, useCallback } from 'react';
import { Spinner } from './Spinner';
import { ocrService } from '../../services/ocrService';
import type { ReceiptData, CategorizedTransaction } from '../../types';
import { DEFAULT_CATEGORIES } from '../TransactionsView';

interface ReceiptScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transactionData: Omit<CategorizedTransaction, 'id' | 'balance'>) => void;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({ isOpen, onClose, onSave }) => {
    const [step, setStep] = useState<'upload' | 'scanning' | 'review'>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [scannedData, setScannedData] = useState<ReceiptData | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = () => {
        setStep('upload');
        setFile(null);
        setPreviewUrl(null);
        setScannedData(null);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            startScanning(selectedFile);
        }
    };

    const startScanning = async (fileToScan: File) => {
        setStep('scanning');
        try {
            const data = await ocrService.scanReceipt(fileToScan);
            setScannedData(data);
            setStep('review');
        } catch (error) {
            alert("Failed to scan receipt. Please try entering manually.");
            setStep('upload');
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const selectedFile = e.dataTransfer.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            startScanning(selectedFile);
        }
    };

    const handleDataChange = (field: keyof ReceiptData, value: any) => {
        if (scannedData) {
            setScannedData({ ...scannedData, [field]: value });
        }
    };

    const handleConfirm = () => {
        if (!scannedData) return;
        
        onSave({
            date: new Date(scannedData.date).toISOString(),
            amount: Number(scannedData.totalAmount),
            narration: `${scannedData.merchantName} - ${scannedData.description}`,
            type: 'debit',
            category: scannedData.category,
            receiptUrl: previewUrl || undefined // In a real app, upload this URL first
        });
        handleClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={handleClose}>
            <div className="bg-dark-tertiary rounded-3xl w-full max-w-lg shadow-2xl border border-white/10 overflow-hidden relative" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-dark-secondary/50">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-cyan"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/><line x1="21" y1="5" x2="10" y2="5"/><line x1="21" y1="2" x2="21" y2="8"/><line x1="24" y1="5" x2="18" y2="5"/></svg>
                        AI Receipt Scanner
                    </h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

                <div className="p-8">
                    {step === 'upload' && (
                        <div 
                            className="border-2 border-dashed border-gray-600 rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-brand-cyan hover:bg-brand-cyan/5 transition-all group"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            <div className="p-4 bg-dark-primary rounded-full mb-4 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-cyan"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            </div>
                            <p className="text-white font-medium mb-1">Click to upload or drag & drop</p>
                            <p className="text-gray-500 text-sm">Supports JPG, PNG, WEBP</p>
                        </div>
                    )}

                    {step === 'scanning' && (
                        <div className="h-64 flex flex-col items-center justify-center relative overflow-hidden rounded-2xl bg-black">
                             {previewUrl && (
                                <img src={previewUrl} alt="Scanning..." className="absolute inset-0 w-full h-full object-cover opacity-50" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-cyan/20 to-transparent w-full h-1/3 animate-[scan_2s_ease-in-out_infinite]"></div>
                            <div className="relative z-10 flex flex-col items-center">
                                <Spinner />
                                <p className="text-brand-cyan font-bold mt-4 animate-pulse">Analyzing Receipt...</p>
                                <p className="text-gray-400 text-xs mt-1">Extracting vendor, date, and amount</p>
                            </div>
                        </div>
                    )}

                    {step === 'review' && scannedData && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="flex gap-4 mb-4">
                                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-black border border-gray-700">
                                     {previewUrl && <img src={previewUrl} alt="Receipt" className="w-full h-full object-cover" />}
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">Extraction Complete</h4>
                                    <p className="text-gray-400 text-xs mt-1">Please review the details below before saving.</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold">Merchant</label>
                                    <input 
                                        type="text" 
                                        value={scannedData.merchantName} 
                                        onChange={e => handleDataChange('merchantName', e.target.value)}
                                        className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2 text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold">Date</label>
                                    <input 
                                        type="date" 
                                        value={scannedData.date} 
                                        onChange={e => handleDataChange('date', e.target.value)}
                                        className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2 text-white text-sm"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold">Amount</label>
                                    <input 
                                        type="number" 
                                        value={scannedData.totalAmount} 
                                        onChange={e => handleDataChange('totalAmount', e.target.value)}
                                        className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2 text-white text-sm font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold">Category</label>
                                    <select 
                                        value={scannedData.category}
                                        onChange={e => handleDataChange('category', e.target.value)}
                                        className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2 text-white text-sm"
                                    >
                                        {DEFAULT_CATEGORIES.map(cat => (
                                            <option key={cat.name} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold">Description</label>
                                <input 
                                    type="text" 
                                    value={scannedData.description} 
                                    onChange={e => handleDataChange('description', e.target.value)}
                                    className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2 text-white text-sm"
                                />
                            </div>

                             <div className="flex gap-3 pt-4">
                                <button onClick={() => setStep('upload')} className="flex-1 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-white/5 transition-colors text-sm">Rescan</button>
                                <button onClick={handleConfirm} className="flex-1 py-2.5 rounded-xl bg-brand-cyan text-black font-bold hover:bg-brand-cyan/80 transition-colors text-sm shadow-[0_0_15px_rgba(0,245,212,0.2)]">Confirm & Save</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <style>{`
                @keyframes scan {
                    0%, 100% { transform: translateY(-100%); }
                    50% { transform: translateY(200%); }
                }
            `}</style>
        </div>
    );
};
