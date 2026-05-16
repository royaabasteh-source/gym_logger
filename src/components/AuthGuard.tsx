'use client';

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Activity, Zap } from "lucide-react";

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== "/login") {
      router.push("/login");
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-bg-primary gap-12 animate-fade-in relative overflow-hidden">
        {/* Architectural Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative group">
          <div className="w-28 h-28 bg-bg-tertiary/50 rounded-[3rem] border border-white/5 flex items-center justify-center shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden">
            <div className="absolute inset-0 bg-accent/5 animate-pulse" />
            <Activity size={48} className="text-accent relative z-10 drop-shadow-[0_0_15px_var(--accent-glow)]" strokeWidth={2.5} />
          </div>
          
          {/* Animated Rings */}
          <div className="absolute inset-0 bg-accent/20 rounded-[3rem] blur-3xl animate-pulse scale-150 opacity-40" />
          <div className="absolute inset-0 border border-accent/20 rounded-[3rem] animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite] opacity-30" />
          <div className="absolute inset-0 border border-accent/10 rounded-[3rem] animate-[ping_6s_linear_infinite] opacity-20 scale-125" />
        </div>

        <div className="space-y-4 text-center relative z-10">
          <div className="flex items-center justify-center gap-3">
            <div className="h-[1px] w-8 bg-white/10" />
            <h2 className="text-3xl font-black tracking-tighter uppercase leading-none italic">
              LIFT<span className="text-accent">LOG</span>
            </h2>
            <div className="h-[1px] w-8 bg-white/10" />
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-accent">
              <Zap size={12} fill="currentColor" className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-80">Syncing Protocol</span>
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-text-tertiary opacity-30">
              Initializing Core Database
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user && pathname !== "/login") {
    return null;
  }

  return <>{children}</>;
};
