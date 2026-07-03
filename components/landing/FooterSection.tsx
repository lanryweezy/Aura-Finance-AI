import React from 'react';
import { Globe, Smartphone, LayoutDashboard } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const FooterSection: React.FC<FooterProps> = ({ onNavigate }) => (
  <footer className="py-20 border-t border-white/5 bg-dark-primary">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-brand-cyan to-brand-purple p-2 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            </div>
            <span className="text-lg font-black tracking-tight">Aura Finance</span>
          </div>
          <p className="text-gray-500 text-sm font-medium leading-relaxed">The future of autonomous business finance in Africa. Built with love in Lagos.</p>
        </div>
        <div>
          <h4 className="text-white font-black text-xs uppercase tracking-widest mb-6">Product</h4>
          <ul className="space-y-4 text-sm font-bold text-gray-500">
            <li><button onClick={() => onNavigate('chat')} className="hover:text-brand-cyan transition-colors">AI Assistant</button></li>
            <li><button onClick={() => onNavigate('payroll')} className="hover:text-brand-cyan transition-colors">Payroll</button></li>
            <li><button onClick={() => onNavigate('inventory')} className="hover:text-brand-cyan transition-colors">Inventory</button></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-black text-xs uppercase tracking-widest mb-6">Company</h4>
          <ul className="space-y-4 text-sm font-bold text-gray-500">
            <li><button onClick={() => onNavigate('about')} className="hover:text-brand-cyan transition-colors">About Us</button></li>
            <li><button onClick={() => onNavigate('careers')} className="hover:text-brand-cyan transition-colors">Careers</button></li>
            <li><button onClick={() => onNavigate('contact')} className="hover:text-brand-cyan transition-colors">Contact</button></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-black text-xs uppercase tracking-widest mb-6">Legal</h4>
          <ul className="space-y-4 text-sm font-bold text-gray-500">
            <li><button onClick={() => onNavigate('privacy')} className="hover:text-brand-cyan transition-colors">Privacy Policy</button></li>
            <li><button onClick={() => onNavigate('terms')} className="hover:text-brand-cyan transition-colors">Terms of Service</button></li>
            <li><button onClick={() => onNavigate('security')} className="hover:text-brand-cyan transition-colors">Security</button></li>
          </ul>
        </div>
      </div>
      <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">© 2026 Aura Finance AI. All rights reserved.</p>
        <div className="flex gap-6">
          <Globe className="text-gray-600 hover:text-white cursor-pointer" size={20} />
          <Smartphone className="text-gray-600 hover:text-white cursor-pointer" size={20} />
          <LayoutDashboard className="text-gray-600 hover:text-white cursor-pointer" size={20} />
        </div>
      </div>
    </div>
  </footer>
);
