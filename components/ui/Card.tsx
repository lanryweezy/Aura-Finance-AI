
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-dark-tertiary border border-gray-700/50 rounded-2xl p-6 shadow-lg ${className}`}>
      {children}
    </div>
  );
};
