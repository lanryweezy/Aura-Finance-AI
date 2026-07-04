import React from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

const typeConfig = {
  success: { bg: 'bg-green-500/20 border-green-500/30', text: 'text-green-400', icon: '✓' },
  error: { bg: 'bg-red-500/20 border-red-500/30', text: 'text-red-400', icon: '✕' },
  warning: { bg: 'bg-yellow-500/20 border-yellow-500/30', text: 'text-yellow-400', icon: '⚠' },
  info: { bg: 'bg-blue-500/20 border-blue-500/30', text: 'text-blue-400', icon: 'ℹ' },
};

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const config = typeConfig[type];

  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl border ${config.bg} shadow-lg max-w-md animate-slide-up`}>
      <span className={`text-lg ${config.text}`}>{config.icon}</span>
      <p className="text-sm font-medium text-white flex-1">{message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-white ml-2">✕</button>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }>; onRemove: (id: string) => void }> = ({ toasts, onRemove }) => (
  <div className="fixed bottom-6 right-6 z-[200] space-y-2">
    {toasts.map(toast => (
      <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => onRemove(toast.id)} />
    ))}
  </div>
);
