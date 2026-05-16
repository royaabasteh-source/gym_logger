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
import { Plus, Play, Trash2, Edit2, Check, Layout, Dumbbell } from "lucide-react";
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
    const t = await getTemplates(user.uid);
    setTemplates(t);
    setLoading(false);
  };

  const handleLoadTemplate = async (template: Template) => {
    if (!user) return;
    setLoadingId(template.id);
    
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
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (confirm("Delete this template?")) {
        await deleteTemplate(user.uid, id);
        setTemplates(templates.filter(t => t.id !== id));
    }
  };

  if (loading) return (
      <div className="space-y-4 pt-6">
        <div className="h-12 w-1/3 bg-bg-tertiary rounded-2xl skeleton" />
        {[1, 2].map(i => <div key={i} className="h-48 bg-bg-tertiary rounded-3xl skeleton" />)}
      </div>
  );

  return (
    <div className="flex flex-col gap-8 pt-6 animate-fade-in">
      <div className="flex items-center justify-between px-1">
        <h1 className="text-3xl font-black tracking-tight uppercase">Templates</h1>
        <button className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center shadow-btn-shadow active:scale-90 transition-all">
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {templates.map((template) => {
          const isLoading = loadingId === template.id;
          const isSuccess = loadingId === 'success-' + template.id;
          
          return (
            <div key={template.id} className="bg-bg-secondary rounded-[2.5rem] card-depth shadow-card-shadow border border-border p-8 flex flex-col gap-6 relative overflow-hidden group">
               {isSuccess && <div className="absolute inset-0 bg-success flex items-center justify-center text-white font-black text-2xl z-10 animate-fade-in"><Check size={32} className="mr-2" strokeWidth={4} /> Loaded!</div>}
               
               <div className="flex items-start justify-between">
                  <div className="space-y-1">
                     <h3 className="text-2xl font-black tracking-tight uppercase group-hover:text-accent transition-colors">{template.name}</h3>
                     <p className="text-[10px] font-black uppercase text-text-tertiary tracking-widest">{template.entries.length} Exercises</p>
                  </div>
                  <div className="flex gap-2">
                     <button
                        onClick={() => handleDelete(template.id)}
                        className="p-3 bg-bg-tertiary/40 border border-border rounded-xl text-text-tertiary hover:text-danger active:bg-danger/10 transition-all"
                     >
                        <Trash2 size={18} />
                     </button>
                     <button
                        className="p-3 bg-bg-tertiary/40 border border-border rounded-xl text-text-tertiary hover:text-accent active:bg-accent-light transition-all"
                     >
                        <Edit2 size={18} />
                     </button>
                  </div>
               </div>

               <div className="flex flex-wrap gap-2 opacity-60">
                  {template.entries.slice(0, 3).map((e, idx) => (
                    <span key={idx} className="text-[9px] font-bold bg-bg-tertiary px-2.5 py-1 rounded-full uppercase tracking-tighter">
                       {e.movementName}
                    </span>
                  ))}
                  {template.entries.length > 3 && <span className="text-[9px] font-bold bg-bg-tertiary px-2.5 py-1 rounded-full uppercase tracking-tighter">+{template.entries.length - 3}</span>}
               </div>

               <button
                  onClick={() => handleLoadTemplate(template)}
                  disabled={!!loadingId}
                  className="w-full bg-bg-tertiary hover:bg-accent hover:text-white py-5 rounded-2xl font-black text-lg transition-all shadow-card-shadow active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
               >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Play size={22} fill="currentColor" />
                      <span>Start Rootine</span>
                    </>
                  )}
               </button>
            </div>
          );
        })}
      </div>

      <div className="bg-bg-tertiary/20 border-2 border-dashed border-border rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center opacity-70">
          <Layout className="text-text-tertiary mb-3 opacity-30" size={40} />
          <h4 className="font-black uppercase tracking-tight mb-1">Create Routine</h4>
          <p className="text-xs font-medium text-text-tertiary px-6">Save your current workout as a template to use later.</p>
      </div>
    </div>
  );
}
