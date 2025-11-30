
import React from 'react';
import type { User } from '../types';

interface HeaderProps {
    user: User | null;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="p-4 md:p-8 flex justify-end items-center">
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
