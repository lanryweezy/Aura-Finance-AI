
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
        onClick={onClick}
        className={`bg-dark-tertiary/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 ${onClick ? 'cursor-pointer hover:border-white/20' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
