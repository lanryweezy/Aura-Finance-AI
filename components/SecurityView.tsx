
import React from 'react';
import { Shield, Lock, Eye, CheckCircle2, Server, Key } from 'lucide-react';

export const SecurityView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-12 px-6 animate-in fade-in duration-500">
      <div className="text-center mb-20">
        <div className="inline-flex p-4 bg-brand-cyan/20 rounded-3xl mb-6">
          <Shield className="text-brand-cyan" size={48} />
        </div>
        <h1 className="text-5xl font-black mb-6 text-gray-900 dark:text-white tracking-tight">Security & Trust</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
          Your financial data is your most sensitive asset. We treat it with the absolute highest standards of protection.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        <div className="p-10 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-[3rem] shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-brand-purple/20 rounded-2xl flex items-center justify-center">
              <Lock className="text-brand-purple" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Data Encryption</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-6">
            All data is encrypted using AES-256 at rest and TLS 1.3 in transit. We use hardware security modules (HSMs) to manage encryption keys.
          </p>
          <ul className="space-y-3">
            {['End-to-end encryption', 'Secure key rotation', 'Periodic security audits'].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm font-bold text-gray-500">
                <CheckCircle2 size={16} className="text-brand-purple" /> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-10 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-[3rem] shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-brand-cyan/20 rounded-2xl flex items-center justify-center">
              <Eye className="text-brand-cyan" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Privacy First</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-6">
            We follow NDPR and GDPR guidelines. Your data belongs to you; we never sell it to third parties or use it for non-service purposes.
          </p>
          <ul className="space-y-3">
            {['Tenant isolation', 'Granular access controls', 'SOC2 Type II compliant'].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm font-bold text-gray-500">
                <CheckCircle2 size={16} className="text-brand-cyan" /> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-dark-primary rounded-[3rem] p-12 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/10 blur-[80px]"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-8 text-white">Compliance Infrastructure</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <Server className="text-brand-pink" size={32} />
              <h4 className="font-bold text-white">Secure Hosting</h4>
              <p className="text-sm text-gray-400 font-medium">Hosted on AWS African regions with multi-zone redundancy and DDoS protection.</p>
            </div>
            <div className="space-y-4">
              <Key className="text-brand-cyan" size={32} />
              <h4 className="font-bold text-white">Zero Trust</h4>
              <p className="text-sm text-gray-400 font-medium">We implement Zero Trust architecture, ensuring no device is trusted by default.</p>
            </div>
            <div className="space-y-4">
              <Shield className="text-brand-purple" size={32} />
              <h4 className="font-bold text-white">Continuous Monitoring</h4>
              <p className="text-sm text-gray-400 font-medium">24/7 automated monitoring for threats and unauthorized access attempts.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
