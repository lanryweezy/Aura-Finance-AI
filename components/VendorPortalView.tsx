import React, { useState } from 'react';
import { vendorPortalService } from '../services/vendorPortalService';

export const VendorPortalView: React.FC = () => {
  const [token, setToken] = useState('');
  const [valid, setValid] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    if (!token.trim()) return;
    setChecking(true);
    const isValid = await vendorPortalService.validateToken(token);
    setValid(isValid);
    setChecking(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">Vendor Portal</h2>
        <p className="text-gray-500 mt-1">Vendors can submit bills through a secure portal link</p>
      </div>

      <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-2xl p-6 max-w-lg">
        <h3 className="font-bold mb-4">Check Portal Access</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Paste portal token or link"
            value={token}
            onChange={e => setToken(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-dark-primary border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-brand-cyan"
          />
          <button onClick={handleCheck} disabled={checking} className="px-4 py-2.5 bg-brand-cyan text-black font-bold rounded-xl hover:bg-brand-cyan/80 disabled:opacity-50">
            {checking ? '...' : 'Check'}
          </button>
        </div>
        {valid === true && <p className="text-sm text-green-400 mt-3">✓ Valid portal link</p>}
        {valid === false && <p className="text-sm text-red-400 mt-3">✕ Invalid or expired link</p>}
      </div>

      <div className="bg-dark-secondary border border-white/10 rounded-2xl p-6">
        <h3 className="font-bold mb-3">How it works</h3>
        <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
          <li>Go to <strong>Contacts</strong> and select a vendor</li>
          <li>Click <strong>"Generate Portal Link"</strong></li>
          <li>Share the link with the vendor via WhatsApp or email</li>
          <li>Vendor opens the link and submits their bill</li>
          <li>You receive a notification and can approve/reject</li>
        </ol>
      </div>
    </div>
  );
};
