import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface CommandItem {
  id: string;
  label: string;
  description: string;
  action: () => void;
  category: string;
  shortcut?: string;
}

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const commands: CommandItem[] = [
    { id: 'dashboard', label: 'Go to Dashboard', description: 'View your financial overview', action: () => navigate('/dashboard'), category: 'Navigation', shortcut: '⌘D' },
    { id: 'transactions', label: 'Go to Transactions', description: 'View all transactions', action: () => navigate('/transactions'), category: 'Navigation', shortcut: '⌘T' },
    { id: 'invoices', label: 'Go to Invoices', description: 'Manage receivables', action: () => navigate('/receivables'), category: 'Navigation', shortcut: '⌘I' },
    { id: 'bills', label: 'Go to Bills', description: 'Manage payables', action: () => navigate('/payables'), category: 'Navigation', shortcut: '⌘B' },
    { id: 'payroll', label: 'Go to Payroll', description: 'Manage payroll', action: () => navigate('/payroll'), category: 'Navigation', shortcut: '⌘P' },
    { id: 'chat', label: 'Open AI Chat', description: 'Ask your AI CFO', action: () => navigate('/chat'), category: 'AI', shortcut: '⌘J' },
    { id: 'reports', label: 'Go to Reports', description: 'Financial reports', action: () => navigate('/reports'), category: 'Navigation' },
    { id: 'settings', label: 'Go to Settings', description: 'App settings', action: () => navigate('/settings'), category: 'Navigation', shortcut: '⌘S' },
    { id: 'expenses', label: 'Go to Expenses', description: 'Track expenses', action: () => navigate('/expenses'), category: 'Navigation' },
    { id: 'inventory', label: 'Go to Inventory', description: 'Manage inventory', action: () => navigate('/inventory'), category: 'Navigation' },
    { id: 'contacts', label: 'Go to Contacts', description: 'Manage contacts', action: () => navigate('/contacts'), category: 'Navigation' },
    { id: 'projects', label: 'Go to Projects', description: 'Track projects', action: () => navigate('/projects'), category: 'Navigation' },
  ];

  const filtered = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const executeCommand = useCallback((cmd: CommandItem) => {
    cmd.action();
    setIsOpen(false);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      executeCommand(filtered[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[20vh]">
      <div className="bg-dark-secondary border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <span className="text-gray-500">⌘K</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
          />
          <kbd className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">No commands found</div>
          )}
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              onClick={() => executeCommand(cmd)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                i === selectedIndex ? 'bg-brand-cyan/10' : 'hover:bg-white/5'
              }`}
            >
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{cmd.label}</p>
                <p className="text-xs text-gray-500">{cmd.description}</p>
              </div>
              {cmd.shortcut && (
                <kbd className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">{cmd.shortcut}</kbd>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
