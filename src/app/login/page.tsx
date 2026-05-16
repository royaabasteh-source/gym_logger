'use client';

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogIn, Sparkles, ShieldCheck, Zap, Activity } from "lucide-react";

export default function LoginPage() {
  const { user, login, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleLogin = async () => {
    try {
      setError(null);
      await login();
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
    }
  };

  if (loading) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] p-6 text-center animate-premium-in relative overflow-hidden bg-bg-primary">
      {/* Background Architectural Glows */}
      <div className="absolute top-[-10%] left-[-20%] w-[80vw] h-[80vw] bg-accent/10 blur-[150px] rounded-full z-0 opacity-40 animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-accent/5 blur-[120px] rounded-full z-0 opacity-30" />
      
      <div className="w-full max-w-sm space-y-12 relative z-10">
        {/* Brand Logo Section */}
        <div className="space-y-6">
          <div className="mx-auto w-24 h-24 bg-accent rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_40px_-10px_var(--accent-glow)] mb-10 rotate-6 group hover:rotate-0 transition-transform duration-500">
            <Activity className="text-white w-12 h-12" strokeWidth={3} />
          </div>
          <div className="space-y-3">
            <h1 className="text-7xl font-black tracking-tighter leading-[0.8] uppercase italic">
              LIFT<span className="text-accent">LOG</span>
            </h1>
            <div className="flex items-center justify-center gap-2 text-accent font-black text-[10px] uppercase tracking-[0.5em] opacity-80">
              <Zap size={12} fill="currentColor" />
              <span>Precision Monitoring</span>
            </div>
          </div>
          <p className="text-text-tertiary font-bold px-4 text-sm leading-relaxed max-w-[280px] mx-auto opacity-40 uppercase tracking-widest">
            The professional grade interface for your training protocol.
          </p>
        </div>

        {/* Authentication Card */}
        <div className="p-10 card-premium glass-premium space-y-10 relative overflow-hidden border-white/5 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-accent/20" />
          
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-accent text-[10px] font-black uppercase tracking-[0.3em]">
              <Sparkles size={14} className="animate-spin-slow" />
              <span>Identity Verification</span>
            </div>
            <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">Welcome Athlete</h2>
          </div>

          {error && (
            <div className="p-5 text-[11px] font-black uppercase tracking-wider text-danger bg-danger/5 border border-danger/10 rounded-2xl animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleLogin}
              className="group relative flex w-full items-center justify-center gap-4 px-8 py-6 bg-white text-black rounded-[32px] font-black text-lg active:scale-95 transition-all shadow-[0_15px_30px_-5px_rgba(255,255,255,0.2)] hover:shadow-white/30 overflow-hidden"
            >
              <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <GoogleIcon className="w-6 h-6 relative z-10 group-hover:invert transition-all duration-500" />
              <span className="relative z-10 group-hover:text-white transition-colors duration-500 uppercase tracking-tight">Access Database</span>
            </button>
            
            <div className="flex items-center gap-4 pt-4 opacity-20">
              <div className="h-[1px] flex-1 bg-white" />
              <ShieldCheck size={14} className="text-white" />
              <div className="h-[1px] flex-1 bg-white" />
            </div>
          </div>

          <p className="text-[9px] font-black text-text-tertiary uppercase tracking-[0.3em] leading-loose px-2 opacity-30">
            By accessing the system, you accept our <span className="text-text-secondary border-b border-text-secondary/30">Protocol Terms</span> and <span className="text-text-secondary border-b border-text-secondary/30">Security Policy</span>.
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-2 opacity-20">
          <p className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.6em]">
            SYSTEM v1.2.4 // PRO
          </p>
          <div className="w-8 h-[1px] bg-text-tertiary" />
        </div>
      </div>
    </div>
  );
}

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 48" className={className}>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);
