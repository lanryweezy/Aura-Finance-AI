
import React, { useState, useEffect } from 'react';
import { NAV_ITEMS, NavItem } from '../constants';
import type { View } from '../types';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  onLogout: () => void;
}

const NavMenu: React.FC<{
    item: NavItem;
    activeView: View;
    setActiveView: (view: View) => void;
    isChild?: boolean;
}> = ({ item, activeView, setActiveView, isChild = false }) => {
    
    const hasChildren = item.children && item.children.length > 0;
    const isParentActive = hasChildren ? (item.children || []).some(c => c.id === activeView) : activeView === item.id;

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
              className={`flex items-center gap-4 py-2 pr-3 pl-12 w-full rounded-lg transition-all duration-200 text-sm ${
                activeView === item.id 
                ? 'text-brand-cyan font-semibold bg-white/5 border-r-2 border-brand-cyan' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{item.label}</span>
            </button>
        )
    }

    return (
        <div className="mb-1">
            <button
              onClick={handleClick}
              className={`flex items-center justify-between gap-4 p-3 w-full rounded-xl transition-all duration-300 group ${
                isParentActive 
                ? 'bg-gradient-to-r from-brand-cyan/10 to-transparent backdrop-blur-md text-brand-cyan font-semibold border-l-4 border-brand-cyan shadow-[0_0_20px_rgba(0,245,212,0.15)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-4">
                  <span className={`transition-colors duration-200 ${isParentActive ? 'text-brand-cyan drop-shadow-[0_0_8px_rgba(0,245,212,0.6)]' : 'text-gray-500 group-hover:text-white'}`}>
                    {item.icon}
                  </span>
                  <span className="hidden lg:block">{item.label}</span>
              </div>
              {hasChildren && (
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`hidden lg:block transition-transform duration-200 text-gray-500 ${isOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
              )}
            </button>
            {hasChildren && isOpen && (
                 <div className="hidden lg:flex flex-col gap-1 mt-1 mb-2 animate-in slide-in-from-top-2 duration-200">
                    {item.children?.map(child => (
                        <NavMenu key={child.id} item={child} activeView={activeView} setActiveView={setActiveView} isChild />
                    ))}
                 </div>
            )}
        </div>
    )
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onLogout }) => {
  return (
    <div className="w-20 lg:w-64 bg-dark-primary p-4 lg:p-6 flex flex-col justify-between border-r border-white/5 relative z-20">
      <div>
        <div className="flex items-center gap-3 mb-10 pl-2">
          <div className="bg-gradient-to-br from-brand-cyan to-brand-purple p-2 rounded-xl shadow-[0_0_20px_rgba(0,245,212,0.2)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          </div>
          <h1 className="text-2xl font-black hidden lg:block tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-cyan via-white to-brand-purple drop-shadow-[0_0_15px_rgba(0,245,212,0.3)]">
            Aura
          </h1>
        </div>
        <nav className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-hide">
          {NAV_ITEMS.map((item) => (
            <NavMenu key={item.id} item={item} activeView={activeView} setActiveView={setActiveView} />
          ))}
        </nav>
      </div>
      <div className="border-t border-white/5 pt-4 space-y-2">
         <div className="hidden lg:flex flex-wrap gap-x-3 gap-y-1 px-2 mb-4">
            <button onClick={() => setActiveView('privacy')} className="text-[10px] text-gray-500 hover:text-gray-300">Privacy</button>
            <button onClick={() => setActiveView('terms')} className="text-[10px] text-gray-500 hover:text-gray-300">Terms</button>
         </div>
         <button
            onClick={onLogout}
            className="flex items-center gap-4 p-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 w-full group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-red-400"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span className="hidden lg:block font-medium">Log Out</span>
          </button>
      </div>
    </div>
  );
};
