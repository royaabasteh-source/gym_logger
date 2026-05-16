'use client';

import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { LogOut, Sun, Moon, Laptop, Download, Database, ChevronRight, User, Shield, Bell, HelpCircle, Sparkles, Settings2, Fingerprint, Crown, Mail, Globe } from "lucide-react";
import { getWorkouts } from "@/lib/firestore";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { settings, updateTheme, updateUnit } = useSettings();

  const handleExport = async () => {
    if (!user) return;
    try {
      const workouts = await getWorkouts(user.uid);
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
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  return (
    <div className="flex flex-col gap-12 pt-10 pb-32 px-4 animate-premium-in max-w-2xl mx-auto">
      {/* Header Section */}
      <header className="px-2 space-y-2">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-accent">
          <Settings2 size={12} strokeWidth={3} />
          <span>System Controls</span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter leading-none">
          SETTINGS
        </h1>
      </header>

      {/* Profile Section */}
      <section className="space-y-5">
        <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.25em] text-text-tertiary ml-3">
          <Fingerprint size={12} className="text-accent" />
          <span>Athlete Profile</span>
        </div>
        <div className="card-premium p-8 flex flex-col gap-8 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-full blur-[60px] -mr-20 -mt-20 group-hover:bg-accent/10 transition-all duration-700 pointer-events-none" />
           
           <div className="flex items-center gap-8 relative z-10">
              <div className="relative group/avatar">
                <div className="absolute inset-0 bg-accent/20 rounded-[2.5rem] blur-xl opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500" />
                <div className="w-24 h-24 bg-bg-primary rounded-[2.2rem] border-2 border-white/5 p-1.5 flex items-center justify-center relative z-10 shadow-2xl transition-transform duration-500 group-hover/avatar:scale-105">
                   {user?.photoURL ? (
                     <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-[1.8rem] object-cover" />
                   ) : (
                     <div className="w-full h-full bg-accent rounded-[1.8rem] flex items-center justify-center text-white font-black text-4xl shadow-inner">
                       {user?.displayName?.[0] || 'U'}
                     </div>
                   )}
                   <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success border-[6px] border-bg-secondary rounded-full shadow-lg" />
                </div>
              </div>
              
              <div className="space-y-2">
                 <div className="flex items-center gap-2">
                    <h3 className="font-black text-3xl tracking-tighter uppercase leading-none">{user?.displayName || 'Elite User'}</h3>
                    <Crown size={16} className="text-accent animate-pulse" />
                 </div>
                 <div className="flex items-center gap-2 text-text-tertiary">
                    <Mail size={12} className="opacity-40" />
                    <p className="text-xs font-bold opacity-60 truncate max-w-[180px]">{user?.email}</p>
                 </div>
                 <div className="flex items-center gap-2 pt-1">
                    <span className="px-3 py-1 bg-accent/10 text-accent text-[9px] font-black rounded-full border border-accent/20 uppercase tracking-[0.2em]">Tier One Member</span>
                 </div>
              </div>
           </div>

           <button 
              onClick={logout}
              className="w-full bg-danger/5 hover:bg-danger text-danger hover:text-white py-6 rounded-[32px] font-black transition-all duration-500 active:scale-[0.98] flex items-center justify-center gap-3 border border-danger/20 relative z-10 shadow-sm group/out"
           >
              <LogOut size={22} strokeWidth={3} className="group-hover/out:-translate-x-1 transition-transform" />
              <span className="uppercase tracking-[0.15em] text-xs">Terminate Session</span>
           </button>
        </div>
      </section>

      {/* Preferences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Appearance */}
        <section className="space-y-5">
          <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.25em] text-text-tertiary ml-3">
            <Sun size={12} className="text-accent" />
            <span>Visual Theme</span>
          </div>
          <div className="card-premium p-3 flex gap-2 border-white/5">
             <ThemeOption 
                label="Auto" 
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
        </section>

        {/* Units */}
        <section className="space-y-5">
          <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.25em] text-text-tertiary ml-3">
            <Database size={12} className="text-accent" />
            <span>Units System</span>
          </div>
          <div className="card-premium p-3 flex gap-2 border-white/5">
             <UnitOption 
                label="Metric" 
                symbol="KG" 
                active={settings?.unit === 'kg'} 
                onClick={() => updateUnit('kg')} 
             />
             <UnitOption 
                label="Imperial" 
                symbol="LBS" 
                active={settings?.unit === 'lbs'} 
                onClick={() => updateUnit('lbs')} 
             />
          </div>
        </section>
      </div>

      {/* Data Management */}
      <section className="space-y-5">
        <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.25em] text-text-tertiary ml-3">
          <Download size={12} className="text-accent" />
          <span>Core Data</span>
        </div>
        <div className="card-premium p-8 sm:p-10 space-y-8 relative overflow-hidden group/data">
           <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
           
           <div className="space-y-3 relative z-10">
             <h4 className="font-black text-2xl tracking-tighter uppercase leading-none">Database Export</h4>
             <p className="text-sm font-medium text-text-tertiary leading-relaxed opacity-60 max-w-sm">
               Generate a comprehensive CSV archive of your entire training protocol, including volume metrics and exercise notes.
             </p>
           </div>
           
           <div className="flex flex-col sm:flex-row gap-4 relative z-10">
              <button 
                 onClick={handleExport}
                 className="flex-1 bg-bg-primary/80 hover:bg-accent text-text-primary hover:text-white py-6 rounded-[32px] font-black transition-all duration-500 active:scale-[0.98] flex items-center justify-center gap-4 border border-white/5 hover:border-accent shadow-sm group/btn"
              >
                 <Download size={22} strokeWidth={3} className="group-hover/btn:translate-y-1 transition-transform" />
                 <span className="uppercase tracking-[0.1em] text-sm">Download (.CSV)</span>
              </button>
              
              <button 
                 className="flex-1 bg-bg-primary/30 border border-white/5 hover:border-white/10 text-text-tertiary py-6 rounded-[32px] font-black transition-all duration-500 active:scale-[0.98] flex items-center justify-center gap-3"
              >
                 <Globe size={20} className="opacity-40" />
                 <span className="uppercase tracking-[0.1em] text-xs">Sync Status: OK</span>
              </button>
           </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="pt-10 pb-16 flex flex-col items-center gap-8 border-t border-white/5">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
              <div className="w-10 h-[1px] bg-white/10" />
              <span className="font-black text-[11px] uppercase tracking-[0.4em] text-text-tertiary">GYM LOGGER PRO</span>
              <div className="w-10 h-[1px] bg-white/10" />
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-accent/5 rounded-full border border-accent/10">
              <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_8px_var(--accent-glow)]" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-accent">Active Protocol v1.2.4</span>
          </div>
        </div>
        
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-center text-text-tertiary opacity-30 leading-loose max-w-[280px]">
          Precision Engineered for Performance Monitoring
        </p>
      </footer>
    </div>
  );
}

const ThemeOption = ({ label, icon: Icon, active, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`flex-1 flex flex-col items-center justify-center gap-4 py-8 rounded-[28px] transition-all duration-500 active:scale-95 border-2 ${
            active 
              ? 'bg-accent border-accent text-white shadow-[0_20px_40px_-10px_var(--accent-glow)] scale-[1.03] z-10' 
              : 'bg-bg-primary/50 border-white/5 text-text-tertiary hover:text-white hover:bg-bg-tertiary'
        }`}
    >
        <Icon size={24} strokeWidth={active ? 3 : 2} className={`${active ? 'scale-110 drop-shadow-lg' : 'opacity-40'} transition-all duration-500`} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
    </button>
);

const UnitOption = ({ label, symbol, active, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`flex-1 flex flex-col items-center justify-center gap-3 py-8 rounded-[28px] transition-all duration-500 active:scale-95 border-2 ${
            active 
              ? 'bg-accent border-accent text-white shadow-[0_20px_40px_-10px_var(--accent-glow)] scale-[1.03] z-10' 
              : 'bg-bg-primary/50 border-white/5 text-text-tertiary hover:text-white hover:bg-bg-tertiary'
        }`}
    >
        <span className={`text-3xl font-black tracking-tighter ${active ? 'scale-110 drop-shadow-md' : 'opacity-20'} transition-all duration-500`}>{symbol}</span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
    </button>
);
