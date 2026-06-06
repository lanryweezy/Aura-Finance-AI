
import React from 'react';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: 'brand' | 'white' | 'black';
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color = 'brand' }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorMap = {
    brand: 'text-brand-cyan',
    white: 'text-white',
    black: 'text-black'
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`animate-spin ${sizeMap[size]} ${colorMap[color]}`}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};
