import React from 'react';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export const TrustBadges: React.FC = () => (
  <section className="py-12 border-t border-white/5">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Built on Security. Driven by Compliance.</p>
      <div className="flex flex-wrap justify-center gap-8 items-center">
        <div className="flex items-center gap-2 text-gray-400">
          <ShieldCheck size={20} />
          <span className="text-xs font-bold">NDPC Compliant</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Lock size={20} />
          <span className="text-xs font-bold">AES-256 Encryption</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <CheckCircle2 size={20} />
          <span className="text-xs font-bold">SOC 2 Controls</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <ShieldCheck size={20} />
          <span className="text-xs font-bold">ISO 27001</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Lock size={20} />
          <span className="text-xs font-bold">PCI DSS</span>
        </div>
      </div>
    </div>
  </section>
);

export const PressLogos: React.FC = () => (
  <section className="py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">As Featured In</p>
      <div className="flex flex-wrap justify-center gap-8 items-center opacity-50">
        <span className="text-lg font-black text-gray-400">TechCabal</span>
        <span className="text-lg font-black text-gray-400">BusinessDay</span>
        <span className="text-lg font-black text-gray-400">Nairametrics</span>
        <span className="text-lg font-black text-gray-400">Techpoint Africa</span>
      </div>
    </div>
  </section>
);

export const ComparisonTable: React.FC = () => (
  <section className="py-32 relative">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-brand-cyan mb-4">Compare</h2>
        <p className="text-4xl font-black tracking-tight">Why Aura wins</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-sm font-bold text-gray-400">Feature</th>
              <th className="text-center p-4 text-sm font-bold text-brand-cyan">Aura</th>
              <th className="text-center p-4 text-sm font-bold text-gray-500">Duplo</th>
              <th className="text-center p-4 text-sm font-bold text-gray-500">Bujeti</th>
              <th className="text-center p-4 text-sm font-bold text-gray-500">Ramp</th>
            </tr>
          </thead>
          <tbody>
            {[
              { feature: 'Free Tier', aura: '✅', duplo: '❌', bujeti: '❌', ramp: '✅' },
              { feature: 'AI CFO', aura: '✅ 4 agents', duplo: '❌', bujeti: '❌', ramp: '❌' },
              { feature: 'NRS E-Invoicing', aura: '✅ Full API', duplo: '✅ Licensed', bujeti: '❌', ramp: '❌' },
              { feature: 'WhatsApp Sharing', aura: '✅', duplo: '❌', bujeti: '❌', ramp: '❌' },
              { feature: 'Nigerian Tax', aura: '✅ Full', duplo: '✅', bujeti: '✅', ramp: '❌' },
              { feature: 'Mobile App', aura: '✅', duplo: '✅', bujeti: '✅', ramp: '✅' },
              { feature: 'Offline PWA', aura: '✅', duplo: '❌', bujeti: '❌', ramp: '❌' },
              { feature: 'ML Predictions', aura: '✅ TabFM+TimesFM', duplo: '❌', bujeti: '❌', ramp: '❌' },
            ].map((row, i) => (
              <tr key={i} className="border-b border-white/5">
                <td className="p-4 text-sm text-gray-300">{row.feature}</td>
                <td className="p-4 text-center text-sm font-bold text-brand-cyan">{row.aura}</td>
                <td className="p-4 text-center text-sm text-gray-500">{row.duplo}</td>
                <td className="p-4 text-center text-sm text-gray-500">{row.bujeti}</td>
                <td className="p-4 text-center text-sm text-gray-500">{row.ramp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);
