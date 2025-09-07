
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      className={`bg-dark-tertiary border border-gray-700/50 rounded-2xl p-6 shadow-lg ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
