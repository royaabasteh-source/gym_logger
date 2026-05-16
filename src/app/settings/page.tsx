'use client';

import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { LogOut, Sun, Moon, Laptop, Download, Database, ChevronRight, User } from "lucide-react";
import { getWorkouts } from "@/lib/firestore";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { settings, updateTheme, updateUnit } = useSettings();

  const handleExport = async () => {
    if (!user) return;
    const workouts = await getWorkouts(user.uid);
    
    // Sort oldest to newest for export
    const sorted = [...workouts].reverse();
    
    let csv = "Date,Movement,Weight,Unit,Reps,Notes\n";
    sorted.forEach(w => {
      w.entries.forEach(e => {
        const notes = e.notes ? `"${e.notes.replace(/"/g, '""')}"` : "";
        csv += `${w.date},"${e.movementName}",${e.weight},${e.unit},${e.reps},${notes}\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `gym-log-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-8 pt-6 pb-12 animate-fade-in px-1">
      <div className="space-y-1">
        <h1 className="text-4xl font-black tracking-tight uppercase">Settings</h1>
        <p className="text-xs font-black text-text-tertiary uppercase tracking-widest opacity-60">Personalize your experience</p>
      </div>

      {/* Profile */}
      <section className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary ml-6">Your Profile</label>
        <div className="bg-bg-secondary p-8 rounded-[2.5rem] card-depth shadow-card-shadow border border-border flex flex-col gap-6">
           <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-bg-tertiary rounded-3xl flex items-center justify-center text-accent">
                 <User size={32} strokeWidth={2.5} />
              </div>
              <div className="space-y-0.5">
                 <h3 className="font-black text-xl uppercase tracking-tight">{user?.displayName || 'User'}</h3>
                 <p className="text-xs font-bold text-text-tertiary">{user?.email}</p>
              </div>
           </div>
           <button 
              onClick={logout}
              className="w-full bg-danger/10 text-danger hover:bg-danger hover:text-white py-4 rounded-xl font-black transition-all active:scale-95 shadow-btn-shadow flex items-center justify-center gap-2"
           >
              <LogOut size={20} />
              <span>Log Out</span>
           </button>
        </div>
      </section>

      {/* Appearance */}
      <section className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary ml-6">Appearance</label>
        <div className="bg-bg-secondary p-4 rounded-[2.5rem] card-depth shadow-card-shadow border border-border">
           <div className="grid grid-cols-3 gap-2">
              <ThemeOption 
                 label="System" 
                 icon={Laptop} 
                 active={settings?.theme === 'system'} 
                 onClick={() => updateTheme('system')} 
              />
              <ThemeOption 
                 label="Light" 
                 icon={Sun} 
                 active={settings?.theme === 'light'} 
                 onClick={() => updateTheme('light')} 
              />
              <ThemeOption 
                 label="Dark" 
                 icon={Moon} 
                 active={settings?.theme === 'dark'} 
                 onClick={() => updateTheme('dark')} 
              />
           </div>
        </div>
      </section>

      {/* Unit */}
      <section className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary ml-6">Weight Unit</label>
        <div className="bg-bg-secondary p-4 rounded-[2.5rem] card-depth shadow-card-shadow border border-border">
           <div className="grid grid-cols-2 gap-2">
              <UnitOption 
                 label="Kilograms" 
                 symbol="KG" 
                 active={settings?.unit === 'kg'} 
                 onClick={() => updateUnit('kg')} 
              />
              <UnitOption 
                 label="Pounds" 
                 symbol="LBS" 
                 active={settings?.unit === 'lbs'} 
                 onClick={() => updateUnit('lbs')} 
              />
           </div>
        </div>
      </section>

      {/* Data */}
      <section className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary ml-6">Data & Export</label>
        <div className="bg-bg-secondary p-8 rounded-[2.5rem] card-depth shadow-card-shadow border border-border flex flex-col gap-4">
           <button 
              onClick={handleExport}
              className="w-full bg-accent text-white py-4 rounded-xl font-black transition-all active:scale-95 shadow-btn-shadow flex items-center justify-center gap-3"
           >
              <Download size={22} strokeWidth={3} />
              <span>Export CSV</span>
           </button>
           <p className="text-[10px] font-black text-text-tertiary text-center uppercase tracking-widest opacity-50 px-4">
              Downloaded as gym-log-YYYY-MM-DD.csv
           </p>
        </div>
      </section>

      <footer className="py-8 text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-text-tertiary">
            <span className="font-black text-[10px] uppercase tracking-widest">Gym Logger v1.0 • Built with</span>
            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse-ring" />
            <span className="font-black text-[10px] uppercase tracking-widest">Vercel & Next.js</span>
        </div>
      </footer>
    </div>
  );
}

const ThemeOption = ({ label, icon: Icon, active, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-2 py-6 p-2 rounded-[1.5rem] transition-all active:scale-90 ${
            active ? 'bg-bg-accent text-accent shadow-btn-shadow border border-accent/20 scale-105 z-10' : 'bg-bg-tertiary/20 text-text-tertiary hover:bg-bg-tertiary/40 border border-transparent'
        }`}
    >
        <Icon size={24} strokeWidth={active ? 3 : 2} />
        <span className="text-[10px] font-black uppercase tracking-tight">{label}</span>
    </button>
);

const UnitOption = ({ label, symbol, active, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-1 py-6 p-2 rounded-[1.5rem] transition-all active:scale-90 ${
            active ? 'bg-bg-accent text-accent shadow-btn-shadow border border-accent/20 scale-105 z-10' : 'bg-bg-tertiary/20 text-text-tertiary hover:bg-bg-tertiary/40 border border-transparent'
        }`}
    >
        <span className="text-2xl font-black -mb-1">{symbol}</span>
        <span className="text-[10px] font-black uppercase tracking-tight">{label}</span>
    </button>
);
