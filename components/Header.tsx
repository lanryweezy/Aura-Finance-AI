
import React from 'react';
import type { User } from '../types';
import { useCurrency } from './ui/CurrencyProvider';
import { useAppStore } from '../store/useAppStore';

interface HeaderProps {
    user: User | null;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const { currency, setCurrency } = useCurrency();
  const { theme, setTheme, entities, selectedEntityId, setSelectedEntityId } = useAppStore();

  return (
    <header className="p-4 md:p-8 flex justify-between items-center z-20">
      <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 p-1 rounded-lg border transition-all ${theme === 'dark' ? 'bg-dark-secondary/50 border-white/5' : 'bg-aura-gray-50 border-aura-gray-200'}`}>
            {['NGN', 'USD', 'GBP'].map(c => (
                <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${currency === c ? 'bg-brand-cyan text-black shadow-lg' : 'text-gray-500 hover:text-aura-gray-900 dark:hover:text-gray-300'}`}
                >
                    {c}
                </button>
            ))}
          </div>

          {user && (
              <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border group cursor-pointer transition-all ${theme === 'dark' ? 'bg-dark-secondary/50 border-white/5 hover:border-brand-cyan/50' : 'bg-aura-gray-50 border-aura-gray-200 hover:border-brand-cyan'}`}>
                <div className="w-6 h-6 rounded bg-brand-cyan flex items-center justify-center text-black font-black text-[10px]">
                    {user.name.charAt(0)}
                </div>
                <select
                    value={selectedEntityId || ''}
                    onChange={(e) => setSelectedEntityId(e.target.value)}
                    className={`bg-transparent border-none outline-none text-xs font-bold cursor-pointer ${theme === 'dark' ? 'text-gray-300' : 'text-aura-gray-800'}`}
                >
                    {entities.map(e => <option key={e.id} value={e.id} className="bg-dark-primary dark:bg-dark-primary light:bg-white">{e.name}</option>)}
                    {entities.length === 0 && <option value="" className="bg-dark-primary dark:bg-dark-primary light:bg-white">Personal Workspace</option>}
                </select>
              </div>
          )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={`p-2 rounded-lg border transition-all ${theme === 'dark' ? 'bg-dark-secondary/50 border-white/5 text-gray-400 hover:text-brand-cyan' : 'bg-aura-gray-50 border-aura-gray-200 text-aura-gray-500 hover:text-brand-purple'}`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
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
                    <span className={`block text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-aura-gray-900'}`}>{user.name}</span>
                    <span className="block text-xs text-gray-400 font-medium">{user.email}</span>
                </div>
                <div className="relative group">
                    <img
                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=00F5D4&color=000`}
                        alt="User profile"
                        className="w-11 h-11 rounded-2xl border-2 border-brand-cyan p-0.5 object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-dark-primary rounded-full"></div>
                </div>
            </>
        ) : (
            <span className="text-sm">Guest</span>
        )}
      </div>
    </header>
  );
};
