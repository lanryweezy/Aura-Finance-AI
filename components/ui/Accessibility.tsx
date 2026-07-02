import React from 'react';

export const SkipNav: React.FC = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-cyan focus:text-black focus:font-bold focus:rounded-lg"
  >
    Skip to main content
  </a>
);

export const VisuallyHidden: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sr-only">{children}</span>
);

export const FocusTrap: React.FC<{ children: React.ReactNode; isActive: boolean; onEscape?: () => void }> = ({
  children,
  isActive,
  onEscape,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape();
        return;
      }

      if (e.key !== 'Tab') return;

      const container = containerRef.current;
      if (!container) return;

      const focusable = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    containerRef.current?.querySelector<HTMLElement>('button, input, select, textarea, [tabindex]')?.focus();

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onEscape]);

  return <div ref={containerRef}>{children}</div>;
};
