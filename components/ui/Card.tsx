
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
      className={`premium-card backdrop-blur-sm ${onClick ? 'cursor-pointer hover:scale-[1.01]' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
