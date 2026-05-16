'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getTemplates, 
  Template, 
  deleteTemplate, 
  addEntriesToWorkout,
  getTodayWorkout
} from "@/lib/firestore";
import { Plus, Play, Trash2, Edit2, Check, Layout, Dumbbell, Zap, Sparkles, ArrowRight, X, LayoutGrid } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TemplatesPage() {
  const { user } = useAuth();
  const { push } = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadTemplates();
  }, [user]);

  const loadTemplates = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const t = await getTemplates(user.uid);
      setTemplates(t);
    } catch (err) {
      console.error("Failed to load templates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadTemplate = async (template: Template) => {
    if (!user) return;
    setLoadingId(template.id);
    
    try {
      // Check if there is an active workout for today
      const today = new Date().toISOString().split('T')[0];
      const activeWorkout = await getTodayWorkout(user.uid, today);
      
      // Transform template entries to workout entries
      const workoutEntries: any = template.entries.map(e => ({
          ...e,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: Date.now()
      }));

      await addEntriesToWorkout(user.uid, activeWorkout?.id || null, workoutEntries, today);
      
      setLoadingId('success-' + template.id);
      setTimeout(() => {
        push('/');
      }, 1200);
    } catch (err) {
      console.error("Failed to load template:", err);
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (confirm("Delete this template?")) {
        await deleteTemplate(user.uid, id);
        setTemplates(templates.filter(t => t.id !== id));
    }
  };

  if (loading) return (
      <div className="space-y-10 pt-10 px-4 animate-pulse max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-bg-tertiary rounded-full" />
            <div className="h-12 w-48 bg-bg-tertiary rounded-2xl" />
          </div>
          <div className="h-16 w-16 bg-bg-tertiary rounded-2xl" />
        </div>
        <div className="space-y-8">
          {[1, 2].map(i => (
            <div key={i} className="h-72 bg-bg-tertiary/50 rounded-[40px] border border-white/5" />
          ))}
        </div>
      </div>
  );

  return (
    <div className="flex flex-col gap-10 pt-8 pb-32 px-4 animate-premium-in max-w-2xl mx-auto">
      {/* Header Section */}
      <header className="flex items-end justify-between px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-accent">
            <LayoutGrid size={12} strokeWidth={3} />
            <span>Workout Routines</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter leading-none">
            PRESETS
          </h1>
        </div>
        <button className="w-16 h-16 bg-accent border border-accent text-white rounded-[22px] flex items-center justify-center shadow-[0_15px_30px_-5px_var(--accent-glow)] active:scale-90 transition-all group">
          <Plus size={32} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </header>

      {/* Templates Grid */}
      <div className="grid gap-8">
        {templates.map((template, idx) => {
          const isLoading = loadingId === template.id;
          const isSuccess = loadingId === 'success-' + template.id;
          
          return (
            <div 
              key={template.id} 
              className="card-premium p-8 sm:p-10 flex flex-col gap-10 relative overflow-hidden group hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] transition-all duration-700 animate-premium-in border-white/5"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
               {/* Success Overlay */}
               {isSuccess && (
                 <div className="absolute inset-0 bg-success flex flex-col items-center justify-center text-white z-20 animate-premium-in">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
                      <Check size={48} strokeWidth={4} className="animate-[scaleIn_0.3s_ease-out]" /> 
                    </div>
                    <span className="font-black text-2xl uppercase tracking-tighter">Protocol Loaded</span>
                 </div>
               )}

               <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-[80px] -mr-24 -mt-24 group-hover:bg-accent/10 transition-colors duration-700 pointer-events-none" />
               
               <div className="flex items-start justify-between relative z-10">
                  <div className="space-y-3">
                     <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 flex items-center justify-center bg-accent/10 text-accent rounded-lg border border-accent/10">
                          <Zap size={14} className="fill-accent" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-accent opacity-80">Premium Preset</span>
                     </div>
                     <h3 className="text-4xl font-black tracking-tighter uppercase group-hover:text-white transition-colors leading-none">
                       {template.name}
                     </h3>
                     <div className="flex items-center gap-3 text-text-tertiary text-[10px] font-black uppercase tracking-[0.2em] opacity-50">
                       <Dumbbell size={14} />
                       <span>{template.entries.length} Exercises Included</span>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <button
                        onClick={() => handleDelete(template.id)}
                        className="w-12 h-12 flex items-center justify-center bg-bg-primary/50 border border-white/5 rounded-2xl text-text-tertiary/20 hover:text-danger hover:bg-danger/10 transition-all active:scale-90"
                        title="Delete Preset"
                     >
                        <Trash2 size={20} />
                     </button>
                     <button
                        className="w-12 h-12 flex items-center justify-center bg-bg-primary/50 border border-white/5 rounded-2xl text-text-tertiary/20 hover:text-accent hover:bg-accent/10 transition-all active:scale-90"
                        title="Edit Preset"
                     >
                        <Edit2 size={20} />
                     </button>
                  </div>
               </div>

               {/* Exercise Preview Chips */}
               <div className="flex flex-wrap gap-2.5 relative z-10">
                  {template.entries.slice(0, 4).map((e, i) => (
                    <span key={i} className="text-[10px] font-black bg-bg-primary/80 px-4 py-2 rounded-full uppercase tracking-tight border border-white/5 text-text-secondary group-hover:border-accent/30 group-hover:text-white transition-all duration-300">
                       {e.movementName}
                    </span>
                  ))}
                  {template.entries.length > 4 && (
                    <span className="text-[10px] font-black bg-accent/10 px-4 py-2 rounded-full uppercase tracking-tighter text-accent border border-accent/20">
                      +{template.entries.length - 4} Others
                    </span>
                  )}
               </div>

               <div className="pt-2">
                 <button
                    onClick={() => handleLoadTemplate(template)}
                    disabled={!!loadingId}
                    className="w-full bg-bg-primary/80 hover:bg-accent text-text-primary hover:text-white py-6 rounded-[32px] font-black text-xl transition-all duration-500 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 group/btn border border-white/5 hover:border-accent hover:shadow-[0_15px_30px_-5px_var(--accent-glow)] relative overflow-hidden"
                 >
                    {isLoading ? (
                      <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-white/5 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                        <Play size={22} fill="currentColor" className="group-hover/btn:scale-125 transition-transform z-10" />
                        <span className="z-10">INITIATE SESSION</span>
                        <ArrowRight size={22} className="opacity-0 -translate-x-4 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-500 z-10" />
                      </>
                    )}
                 </button>
               </div>
            </div>
          );
        })}

        {templates.length === 0 && (
          <div className="py-32 text-center space-y-10 animate-premium-in">
              <div className="w-32 h-32 bg-bg-tertiary/30 rounded-[3.5rem] flex items-center justify-center mx-auto relative border border-white/5 shadow-inner">
                  <LayoutGrid size={48} className="text-text-tertiary opacity-10" />
                  <div className="absolute inset-0 border-4 border-dashed border-accent/5 rounded-[3.5rem] animate-[spin_30s_linear_infinite]" />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-black tracking-tight text-text-primary opacity-20 uppercase">No active protocols</h3>
                <p className="text-sm font-bold text-text-tertiary tracking-wide opacity-30 max-w-[280px] mx-auto leading-relaxed">
                    Automate your training by saving frequent routines as presets.
                </p>
              </div>
              <button className="bg-bg-tertiary/50 border border-white/5 px-10 py-5 rounded-full font-black text-[11px] uppercase tracking-[0.3em] text-text-secondary hover:text-accent hover:border-accent/30 transition-all flex items-center gap-3 mx-auto active:scale-95">
                <Sparkles size={18} strokeWidth={2.5} className="text-accent" />
                <span>Create First Preset</span>
              </button>
          </div>
        )}
      </div>
    </div>
  );
}
