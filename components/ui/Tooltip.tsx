import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      <div
        aria-describedby={isVisible ? "tooltip-content" : undefined}
        className="cursor-help"
      >
        {children}
      </div>

      {isVisible && (
        <div
          id="tooltip-content"
          role="tooltip"
          className={`absolute z-[100] px-3 py-2 text-xs font-medium text-white bg-gray-900 border border-white/10 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-200 ${positionClasses[position]}`}
        >
          {content}
          {/* Arrow */}
          <div className={`absolute w-2 h-2 bg-gray-900 border-white/10 rotate-45 ${
            position === 'top' ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-b border-r' :
            position === 'bottom' ? 'top-[-5px] left-1/2 -translate-x-1/2 border-t border-l' :
            position === 'left' ? 'right-[-5px] top-1/2 -translate-y-1/2 border-t border-r' :
            'left-[-5px] top-1/2 -translate-y-1/2 border-b border-l'
          }`} />
        </div>
      )}
    </div>
  );
};
