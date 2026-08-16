import React, { useState } from 'react';
import { generateEmail, getEmailTypes, type EmailTemplateType } from '../services/emailService';
import { shareTextViaWhatsApp, copyToClipboard } from '../services/shareService';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: any;
  isInvoice?: boolean;
}

export const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, recipient, isInvoice = true }) => {
  const [selectedType, setSelectedType] = useState<EmailTemplateType>('formal');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const template = generateEmail(recipient, selectedType, isInvoice);
  const types = getEmailTypes();

  const handleCopy = async () => {
    const full = `Subject: ${template.subject}\n\n${template.body}`;
    await copyToClipboard(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const msg = `Subject: ${template.subject}\n\n${template.body}`;
    shareTextViaWhatsApp(msg);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-secondary border border-white/10 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-lg font-bold">Generate Email</h3>
          <button onClick={onClose} aria-label="Close modal" className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex gap-2">
            {types.map(t => (
              <button
                key={t.value}
                onClick={() => setSelectedType(t.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedType === t.value
                    ? 'bg-brand-cyan text-black'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="bg-dark-primary border border-white/10 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Subject</p>
            <p className="text-sm font-bold">{template.subject}</p>
          </div>

          <div className="bg-dark-primary border border-white/10 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-2">Body</p>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">{template.body}</pre>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 bg-white/5 text-white rounded-xl font-bold hover:bg-white/10 transition-all text-sm"
          >
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-500 transition-all text-sm"
          >
            Send via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
