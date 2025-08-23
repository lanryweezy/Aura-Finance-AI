
import React, { useState, useEffect } from 'react';
import { NAV_ITEMS, NavItem, COMPLIANCE_DEADLINES } from '../constants';
import type { View } from '../types';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

const NavMenu: React.FC<{
    item: NavItem;
    activeView: View;
    setActiveView: (view: View) => void;
    isChild?: boolean;
    onNavigate?: () => void;
}> = ({ item, activeView, setActiveView, isChild = false, onNavigate }) => {
    
    const hasChildren = item.children && item.children.length > 0;
    const isParentActive = hasChildren ? item.children.some(c => c.id === activeView) : activeView === item.id;

    const [isOpen, setIsOpen] = useState(isParentActive);

    useEffect(() => {
        if(isParentActive) {
            setIsOpen(true);
        }
    }, [isParentActive, activeView]);

    const handleClick = () => {
        if (hasChildren) {
            setIsOpen(!isOpen);
        } else {
            setActiveView(item.id);
            onNavigate?.();
        }
    };

    if (isChild) {
        return (
             <button
              onClick={() => {
                setActiveView(item.id);
                onNavigate?.();
              }}
              className={`flex items-center gap-3 py-2.5 pr-3 pl-12 w-full rounded-lg text-light-primary/70 hover:bg-dark-tertiary hover:text-white transition-all duration-200 group ${
                activeView === item.id ? 'text-brand-cyan font-semibold bg-brand-cyan/10' : ''
              }`}
            >
              <span className="text-sm">{item.label}</span>
              {activeView === item.id && (
                <div className="w-1.5 h-1.5 bg-brand-cyan rounded-full ml-auto"></div>
              )}
            </button>
        )
    }

    return (
        <div>
            <button
              onClick={handleClick}
              className={`flex items-center justify-between gap-3 p-3 w-full rounded-xl text-light-primary/70 hover:bg-dark-tertiary hover:text-white transition-all duration-200 group ${
                isParentActive ? 'bg-brand-cyan/10 text-brand-cyan font-semibold' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                  <div className={`transition-colors duration-200 ${isParentActive ? 'text-brand-cyan' : 'text-gray-400 group-hover:text-white'}`}>
                    {item.icon}
                  </div>
                  <span className="hidden lg:block font-medium">{item.label}</span>
              </div>
              {hasChildren && (
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`hidden lg:block transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                   <polyline points="6 9 12 15 18 9"></polyline>
                 </svg>
              )}
            </button>
            {hasChildren && isOpen && (
                 <div className="hidden lg:flex flex-col gap-1 mt-2 ml-2">
                    {item.children?.map(child => (
                        <NavMenu key={child.id} item={child} activeView={activeView} setActiveView={setActiveView} isChild onNavigate={onNavigate} />
                    ))}
                 </div>
            )}
        </div>
    )
}

const ComplianceAlert: React.FC = () => {
  const getDaysUntil = (targetDay: number): number => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const currentDay = today.getDate();
    
    if (currentDay <= targetDay) {
      return targetDay - currentDay;
    }
    
    // Calculate days remaining in current month + targetDay in next month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return (daysInMonth - currentDay) + targetDay;
  };

  const getNextDeadline = () => {
    const daysToPAYE = getDaysUntil(10);
    const daysToVATWHT = getDaysUntil(21);
    
    // Choose the nearer upcoming deadline
    if (daysToPAYE <= daysToVATWHT) {
      return { type: 'PAYE', days: daysToPAYE, urgent: daysToPAYE <= 3 };
    }
    return { type: 'VAT/WHT', days: daysToVATWHT, urgent: daysToVATWHT <= 3 };
  };

  const deadline = getNextDeadline();

  return (
    <div className={`hidden lg:block p-3 rounded-xl border ${deadline.urgent ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
      <div className="flex items-center gap-2 mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={deadline.urgent ? 'text-red-400' : 'text-yellow-400'}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
        <span className={`text-xs font-medium ${deadline.urgent ? 'text-red-400' : 'text-yellow-400'}`}>
          Tax Reminder
        </span>
      </div>
      <p className="text-xs text-gray-300">
        {deadline.type} filing due in <span className="font-bold">{deadline.days} days</span>
      </p>
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  setActiveView, 
  isMobileMenuOpen = false, 
  setIsMobileMenuOpen 
}) => {
  const handleNavigate = () => {
    setIsMobileMenuOpen?.(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen?.(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:sticky top-0 z-50 lg:z-auto
        h-screen w-80 lg:w-20 xl:w-64 
        bg-dark-primary border-r border-gray-800/50
        flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 lg:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 lg:mb-12">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-brand-cyan via-nigerian-green to-brand-pink p-2.5 rounded-xl shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  <path d="M12 3v6l4-4-4-4"/>
                </svg>
              </div>
              <div className="lg:hidden xl:block">
                <h1 className="text-xl font-bold text-white">Aura Finance</h1>
                <p className="text-xs text-gray-400">Nigerian Business AI</p>
              </div>
            </div>
            
            {/* Mobile close button */}
            <button 
              onClick={() => setIsMobileMenuOpen?.(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-dark-secondary text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <NavMenu key={item.id} item={item} activeView={activeView} setActiveView={setActiveView} onNavigate={handleNavigate} />
            ))}
          </nav>
        </div>

        {/* Bottom section */}
        <div className="p-4 lg:p-6 space-y-3">
          <ComplianceAlert />
          
          {/* Quick actions */}
          <div className="hidden lg:block xl:block">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Quick Actions</div>
            <div className="space-y-1">
              <button 
                onClick={() => {
                  setActiveView('receivables');
                  handleNavigate();
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-dark-secondary text-xs text-gray-300 hover:text-white transition-colors"
              >
                + New Invoice
              </button>
              <button 
                onClick={() => {
                  setActiveView('payables');
                  handleNavigate();
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-dark-secondary text-xs text-gray-300 hover:text-white transition-colors"
              >
                + Add Expense
              </button>
            </div>
          </div>

          {/* User section */}
          <div className="border-t border-gray-800 pt-4">
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-secondary transition-colors cursor-pointer group">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-cyan to-brand-pink rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-black">AB</span>
              </div>
              <div className="hidden lg:hidden xl:block flex-1">
                <p className="text-sm font-medium text-white">Aura Business</p>
                <p className="text-xs text-gray-400">Nigerian SME</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="hidden lg:hidden xl:block text-gray-400 group-hover:text-white">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
