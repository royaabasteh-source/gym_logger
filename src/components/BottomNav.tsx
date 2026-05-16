'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ClipboardList, Dumbbell, BarChart2, Settings } from "lucide-react";

const TABS = [
  { name: 'Workout', icon: Activity, path: '/' },
  { name: 'Templates', icon: ClipboardList, path: '/templates' },
  { name: 'Movements', icon: Dumbbell, path: '/movements' },
  { name: 'History', icon: BarChart2, path: '/history' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

export const BottomNav = () => {
  const pathname = usePathname();

  if (pathname === '/login') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-[env(safe-area-inset-bottom)] glass border-t border-border">
      <div className="flex w-full max-w-lg items-center justify-around px-2 py-3">
        {TABS.map((tab) => {
          const isActive = pathname === tab.path || (tab.path !== '/' && pathname.startsWith(tab.path));
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.name}
              href={tab.path}
              className={`flex flex-col items-center justify-center gap-1 active:scale-90 transition-all duration-150 ${
                isActive ? 'text-accent scale-105 drop-shadow-sm' : 'text-text-tertiary hover:text-accent/70'
              }`}
            >
              <Icon size={24} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{tab.name}</span>
              {isActive && <div className="mt-[-2px] h-1 w-1 rounded-full bg-accent animate-fade-in" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
