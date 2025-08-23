
import React, { useState, useEffect } from 'react';
import { NAV_ITEMS, NavItem } from '../constants';
import type { View } from '../types';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const NavMenu: React.FC<{
    item: NavItem;
    activeView: View;
    setActiveView: (view: View) => void;
    isChild?: boolean;
}> = ({ item, activeView, setActiveView, isChild = false }) => {
    
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
        }
    };

    if (isChild) {
        return (
             <button
              onClick={() => setActiveView(item.id)}
              className={`flex items-center gap-4 py-2 pr-3 pl-12 w-full rounded-lg text-light-primary/70 hover:bg-dark-tertiary hover:text-white transition-all duration-200 ${
                activeView === item.id ? 'text-brand-cyan font-semibold' : ''
              }`}
            >
              <span>{item.label}</span>
            </button>
        )
    }

    return (
        <div>
            <button
              onClick={handleClick}
              className={`flex items-center justify-between gap-4 p-3 w-full rounded-lg text-light-primary/70 hover:bg-dark-tertiary hover:text-white transition-all duration-200 ${
                isParentActive ? 'bg-brand-cyan/10 text-brand-cyan font-semibold' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                  {item.icon}
                  <span className="hidden lg:block">{item.label}</span>
              </div>
              {hasChildren && (
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`hidden lg:block transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
              )}
            </button>
            {hasChildren && isOpen && (
                 <div className="hidden lg:flex flex-col gap-1 mt-1">
                    {item.children?.map(child => (
                        <NavMenu key={child.id} item={child} activeView={activeView} setActiveView={setActiveView} isChild />
                    ))}
                 </div>
            )}
        </div>
    )
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  return (
    <div className="w-20 lg:w-64 bg-dark-primary p-4 lg:p-6 flex flex-col justify-between border-r border-gray-800">
      <div>
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-gradient-to-br from-brand-cyan to-brand-pink p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          </div>
          <h1 className="text-2xl font-bold hidden lg:block">Aura</h1>
        </div>
        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <NavMenu key={item.id} item={item} activeView={activeView} setActiveView={setActiveView} />
          ))}
        </nav>
      </div>
      <div className="border-t border-gray-800 pt-4">
         <button
            className="flex items-center gap-4 p-3 rounded-lg text-light-primary/70 hover:bg-dark-tertiary hover:text-white transition-all duration-200 w-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span className="hidden lg:block">Log Out</span>
          </button>
      </div>
    </div>
  );
};
