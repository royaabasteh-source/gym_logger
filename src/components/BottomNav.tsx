'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ClipboardList, Dumbbell, BarChart2, UserCircle } from "lucide-react";

const TABS = [
  { name: 'Lift', icon: Activity, path: '/' },
  { name: 'Routines', icon: ClipboardList, path: '/templates' },
  { name: 'Moves', icon: Dumbbell, path: '/movements' },
  { name: 'Logs', icon: BarChart2, path: '/history' },
  { name: 'You', icon: UserCircle, path: '/settings' },
];

export const BottomNav = () => {
  const pathname = usePathname();

  if (pathname === '/login') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4 pointer-events-none">
      <div className="flex w-full max-w-[420px] items-center justify-around px-2 py-3 glass-premium shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-[40px] border border-white/5 pointer-events-auto">
        {TABS.map((tab) => {
          const isActive = pathname === tab.path || (tab.path !== '/' && pathname.startsWith(tab.path));
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.name}
              href={tab.path}
              className={`relative flex flex-col items-center justify-center gap-1 group transition-all duration-500 ease-spring ${
                isActive ? 'text-accent scale-105' : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              <div className={`relative p-3 rounded-[24px] transition-all duration-500 ease-spring ${
                isActive ? 'bg-accent/15 text-accent shadow-inner' : 'bg-transparent'
              }`}>
                {isActive && (
                  <div className="absolute inset-0 bg-accent/20 rounded-[24px] blur-md animate-pulse-ring" />
                )}
                <Icon 
                  size={24} 
                  strokeWidth={isActive ? 3 : 2} 
                  className={`relative z-10 transition-all duration-500 ${isActive ? 'drop-shadow-[0_0_8px_var(--accent-glow)]' : ''}`}
                />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
                isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 scale-75'
              }`}>
                {tab.name}
              </span>
              
              {isActive && (
                <div className="absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_12px_var(--accent-glow)] animate-premium-in" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
