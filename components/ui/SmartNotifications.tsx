import React, { useState, useEffect } from 'react';
import { aiAutomationUtils } from '../../services/aiAutomationService';

interface SmartNotification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  urgency: 'low' | 'medium' | 'high';
  actionRequired: boolean;
  actionText?: string;
  dismissible: boolean;
  timestamp: Date;
}

interface SmartNotificationsProps {
  businessData?: {
    transactions: any[];
    bills: any[];
    invoices: any[];
    employees: any[];
  };
}

export const SmartNotifications: React.FC<SmartNotificationsProps> = ({ businessData }) => {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (businessData) {
      generateSmartNotifications();
    }
  }, [businessData]);

  const generateSmartNotifications = async () => {
    if (!businessData) return;

    try {
      const aiNotifications = await aiAutomationUtils.generateSmartNotifications(businessData);
      
      const smartNotifications: SmartNotification[] = aiNotifications.map(notification => ({
        ...notification,
        timestamp: new Date(),
      }));

      setNotifications(smartNotifications);
      setIsVisible(smartNotifications.length > 0);
    } catch (error) {
      console.error('Failed to generate smart notifications:', error);
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => {
      const next = prev.filter(n => n.id !== id);
      if (next.length === 0) {
        setIsVisible(false);
      }
      return next;
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
            <path d="M9 12l2 2 4-4"/>
            <circle cx="12" cy="12" r="10"/>
          </svg>
        );
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-400">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <path d="M12 9v4"/>
            <path d="m12 17.02.01 0"/>
          </svg>
        );
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
            <circle cx="12" cy="12" r="10"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
        );
    }
  };

  const getNotificationStyles = (type: string, urgency: string) => {
    const baseStyles = "border rounded-lg p-4 mb-3 transition-all duration-300 hover:shadow-lg";
    
    const typeStyles = {
      success: "bg-green-500/10 border-green-500/30",
      warning: "bg-yellow-500/10 border-yellow-500/30",
      error: "bg-red-500/10 border-red-500/30",
      info: "bg-blue-500/10 border-blue-500/30",
    };

    const urgencyStyles = {
      high: "ring-2 ring-offset-2 ring-red-400/50",
      medium: "ring-1 ring-yellow-400/30",
      low: "",
    };

    return `${baseStyles} ${typeStyles[type as keyof typeof typeStyles]} ${urgencyStyles[urgency as keyof typeof urgencyStyles]}`;
  };

  const getUrgencyBadge = (urgency: string) => {
    const badges = {
      high: "bg-red-500/20 text-red-400 border-red-500/30",
      medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      low: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${badges[urgency as keyof typeof badges]}`}>
        {urgency.toUpperCase()}
      </span>
    );
  };

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 w-96 max-h-96 overflow-y-auto custom-scrollbar">
      <div className="bg-dark-primary/95 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-brand-cyan rounded-full animate-pulse"></div>
            <h3 className="font-semibold text-white">Smart Notifications</h3>
            <span className="text-xs bg-brand-cyan/20 text-brand-cyan px-2 py-1 rounded-full">
              {notifications.length}
            </span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-dark-secondary rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Notifications */}
        <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
          {notifications.map(notification => (
            <div key={notification.id} className={getNotificationStyles(notification.type, notification.urgency)}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white text-sm">{notification.title}</h4>
                    <div className="flex items-center gap-2">
                      {getUrgencyBadge(notification.urgency)}
                      {notification.dismissible && (
                        <button
                          onClick={() => dismissNotification(notification.id)}
                          className="p-1 hover:bg-gray-600/50 rounded text-gray-400 hover:text-white transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-3">{notification.message}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {notification.timestamp.toLocaleTimeString('en-NG', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    
                    {notification.actionRequired && notification.actionText && (
                      <button className="px-3 py-1 bg-brand-cyan/20 hover:bg-brand-cyan/30 text-brand-cyan text-xs font-medium rounded-lg transition-colors">
                        {notification.actionText}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-700 bg-dark-secondary/50">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Powered by AI Intelligence</span>
            <button 
              onClick={() => setNotifications([])}
              className="hover:text-white transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for using smart notifications
export const useSmartNotifications = (businessData?: any) => {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);

  const addNotification = (notification: Omit<SmartNotification, 'id' | 'timestamp'>) => {
    const newNotification: SmartNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep max 10
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };
};