
import React from 'react';
import type { View } from '../types';

interface HeaderProps {
  activeView: View;
  onMobileMenuToggle?: () => void;
}

const getViewTitle = (view: View): string => {
  const titles: Record<View, string> = {
    'dashboard': 'Business Overview',
    'chat': 'AI Financial Assistant',
    'transactions': 'Bank Transactions',
    'receivables': 'Sales & Invoices',
    'payables': 'Bills & Expenses',
    'payroll': 'Payroll Management',
    'tax-filing': 'Tax & Compliance',
    'reports': 'Financial Reports',
    'connections': 'Bank Connections',
    'integrations': 'App Integrations',
    'chart-of-accounts': 'Chart of Accounts',
    'journal-entries': 'Journal Entries',
    'purchase-orders': 'Purchase Orders',
    'estimates': 'Quotes & Estimates',
    'inventory': 'Inventory Management',
    'budgeting': 'Budget Planning',
    'audit-trail': 'Audit Trail',
    'ai-settings': 'AI Automation Settings',
    'ai-automation': 'AI Automation Dashboard'
  };
  return titles[view] || 'Aura Finance AI';
};

export const Header: React.FC<HeaderProps> = ({ activeView, onMobileMenuToggle }) => {
  const [currentTime, setCurrentTime] = React.useState(() =>
  new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' })
);

React.useEffect(() => {
  const updateTime = () => setCurrentTime(
    new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' })
  );
  const interval = setInterval(updateTime, 60_000); // Update every minute
  return () => clearInterval(interval);
}, []);
  
  const formatNaira = (amount: number) => 
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

  return (
    <header className="bg-dark-primary/80 backdrop-blur-sm border-b border-gray-800/50 px-4 py-3 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu + Title */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-dark-secondary text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          {/* Page title */}
          <div>
            <h2 className="text-lg font-semibold text-white">{getViewTitle(activeView)}</h2>
            <p className="text-xs text-gray-400 hidden sm:block">
              Nigerian business finance management
            </p>
          </div>
        </div>

        {/* Right side - Stats & Time */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Quick stats - hidden on very small screens */}
          <div className="hidden md:flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-dark-secondary/50 px-3 py-1.5 rounded-lg">
              <div className="w-2 h-2 bg-nigerian-green rounded-full animate-pulse"></div>
              <span className="text-gray-300">NGN Exchange</span>
              <span className="text-white font-medium">₦1,650/$</span>
            </div>
          </div>

          {/* Time display */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            <span>{currentTime} WAT</span>
          </div>

          {/* Notification bell */}
          <button className="relative p-2 rounded-lg hover:bg-dark-secondary text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
              <path d="M13.73 21c-.18.35-.48.65-.85.85-.36.2-.78.3-1.2.3s-.84-.1-1.2-.3c-.37-.2-.67-.5-.85-.85"/>
            </svg>
            {/* Notification badge */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">2</span>
            </div>
          </button>

          {/* Profile avatar */}
          <div className="w-8 h-8 bg-gradient-to-br from-brand-cyan to-brand-pink rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
            <span className="text-xs font-bold text-black">AB</span>
          </div>
        </div>
      </div>
    </header>
  );
};
