
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="p-4 md:p-8 flex justify-end items-center">
      <div className="flex items-center gap-4">
        <span className="text-sm hidden sm:inline">Tunde O. (Biz Mode)</span>
        <img
          src="https://picsum.photos/seed/user1/40/40"
          alt="User profile"
          className="w-10 h-10 rounded-full border-2 border-brand-cyan"
        />
      </div>
    </header>
  );
};
