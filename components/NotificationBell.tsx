import React, { useState, useEffect, useRef } from 'react';
import { notificationService, type Notification } from '../services/notificationService';

const priorityColors: Record<string, string> = {
  low: 'bg-blue-500/20 text-blue-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  high: 'bg-orange-500/20 text-orange-400',
  critical: 'bg-red-500/20 text-red-400',
};

const typeIcons: Record<string, string> = {
  payment: '💰', approval: '✅', overdue: '🔴', invoice: '📄',
  bill: '📋', system: '⚙️', ai_alert: '🤖',
};

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    notificationService.fetch(30).then(n => {
      setNotifications(n);
      setUnreadCount(n.filter(x => !x.read).length);
      setLoading(false);
    });

    const unsub = notificationService.subscribeRealtime((n) => {
      setNotifications(prev => [n, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return unsub;
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMarkAllRead = async () => {
    await notificationService.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleClick = async (n: Notification) => {
    if (!n.read) {
      await notificationService.markRead(n.id);
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    if (n.actionUrl) window.location.hash = n.actionUrl;
    setIsOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-white/10 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-dark-secondary border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="font-bold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-brand-cyan hover:underline">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>}

            {!loading && notifications.length === 0 && (
              <div className="p-8 text-center text-gray-500 text-sm">No notifications</div>
            )}

            {notifications.map(n => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-all ${!n.read ? 'bg-white/[0.02]' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`text-xs px-2 py-1 rounded-lg ${priorityColors[n.priority]}`}>
                    {typeIcons[n.type]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-bold truncate ${!n.read ? 'text-white' : 'text-gray-400'}`}>{n.title}</p>
                      {!n.read && <span className="w-2 h-2 bg-brand-cyan rounded-full flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-gray-600 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
