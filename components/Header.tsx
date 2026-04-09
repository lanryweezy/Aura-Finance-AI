
import React from 'react';
import type { User } from '../types';
import { useCurrency } from './ui/CurrencyProvider';

interface HeaderProps {
    user: User | null;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const { currency, setCurrency } = useCurrency();

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
