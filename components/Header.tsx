
import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { useCurrency } from './ui/CurrencyProvider';
import { useAppStore } from '../store/useAppStore';
import { autonomousActionService } from '../services/autonomousActionService';

interface HeaderProps {
    user: User | null;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const { currency, setCurrency } = useCurrency();
  const { theme, setTheme, setActiveView } = useAppStore();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const checkQueue = () => {
        const pending = autonomousActionService.getHistory().filter(a => a.status === 'pending').length;
        setPendingCount(pending);
    };
    checkQueue();
    const interval = setInterval(checkQueue, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="p-4 md:p-8 flex justify-between items-center">
      <div className="flex items-center gap-2 bg-dark-secondary/50 p-1 rounded-lg border border-white/5">
        {['NGN', 'USD', 'GBP'].map(c => (
            <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${currency === c ? 'bg-brand-cyan text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
                {c}
            </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setActiveView('approvalQueue')}
          className="relative p-2 rounded-lg bg-dark-secondary/50 border border-white/5 text-gray-400 hover:text-brand-cyan transition-colors"
          title="Approval Queue"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/></svg>
          {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {pendingCount}
              </span>
          )}
        </button>

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg bg-dark-secondary/50 border border-white/5 text-gray-400 hover:text-brand-cyan transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
        </button>

        {user ? (
            <>
                <div className="text-right hidden sm:block">
                    <span className="block text-sm font-semibold text-white">{user.name}</span>
                    <span className="block text-xs text-gray-400">{user.email}</span>
                </div>
                <img
                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=00F5D4&color=000`}
                    alt="User profile"
                    className="w-10 h-10 rounded-full border-2 border-brand-cyan"
                />
            </>
        ) : (
            <span className="text-sm">Guest</span>
        )}
      </div>
    </header>
  );
};
