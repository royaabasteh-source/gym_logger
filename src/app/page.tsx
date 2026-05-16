'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getTodayWorkout, 
  addEntryToWorkout, 
  finishWorkout, 
  Workout, 
  WorkoutEntry, 
  updateWorkoutEntries 
} from "@/lib/firestore";
import { WorkoutForm } from "@/components/WorkoutForm";
import { WorkoutList } from "@/components/WorkoutList";
import { Check, Dumbbell, Flame, Trophy, Calendar, Power, Sparkles, ChevronRight } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user) {
      loadTodayWorkout();
    }
  }, [user]);

  const loadTodayWorkout = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const w = await getTodayWorkout(user.uid, today);
      setWorkout(w);
    } catch (err) {
      console.error("Failed to load workout:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLog = async (entry: Omit<WorkoutEntry, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    const newEntry: WorkoutEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now()
    };

    const workoutId = await addEntryToWorkout(user.uid, workout?.id || null, newEntry, today);
    
    if (!workout) {
      setWorkout({
        id: workoutId!,
        date: today,
        entries: [newEntry],
        createdAt: Date.now(),
        completed: false
      });
    } else {
      setWorkout({
        ...workout,
        entries: [...workout.entries, newEntry]
      });
    }
  };

  const handleUpdateEntries = async (entries: WorkoutEntry[]) => {
    if (!user || !workout) return;
    setWorkout({ ...workout, entries });
    await updateWorkoutEntries(user.uid, workout.id, entries);
  };

  const handleFinish = async () => {
    if (!user || !workout) return;
    if (confirm("Finish this workout? It will be saved to your history.")) {
        await finishWorkout(user.uid, workout.id);
        setWorkout(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse pt-6">
        <div className="flex items-center justify-between px-2">
          <div className="h-10 w-48 bg-bg-tertiary rounded-2xl" />
          <div className="h-14 w-14 bg-bg-tertiary rounded-2xl" />
        </div>
        <div className="grid grid-cols-3 gap-4">
            <div className="h-28 bg-bg-tertiary rounded-[24px]" />
            <div className="h-28 bg-bg-tertiary rounded-[24px]" />
            <div className="h-28 bg-bg-tertiary rounded-[24px]" />
        </div>
        <div className="h-64 w-full bg-bg-tertiary rounded-[32px]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pt-2 pb-40 animate-premium-in">
      
      {/* Premium Header */}
      <header className="flex items-center justify-between px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse shadow-[0_0_8px_var(--accent-glow)]" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Active Protocol</p>
          </div>
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-2">
            LIFT <span className="text-text-tertiary opacity-20 italic">/</span> LOG
          </h1>
        </div>
        <div className="relative group">
            <div className="absolute inset-0 bg-accent/20 rounded-2xl blur-xl group-hover:bg-accent/40 transition-all opacity-0 group-hover:opacity-100" />
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/5 p-0.5 bg-bg-secondary shadow-2xl transition-transform active:scale-90 cursor-pointer">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-[14px] object-cover" />
              ) : (
                <div className="w-full h-full bg-accent rounded-[14px] flex items-center justify-center text-white font-black text-xl">
                  {user?.displayName?.[0] || 'U'}
                </div>
              )}
            </div>
        </div>
      </header>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard 
            icon={Flame} 
            label="Streak" 
            value="5" 
            suffix="DAYS" 
            color="text-accent" 
            bg="bg-accent/5" 
            active
        />
        <StatCard 
            icon={Trophy} 
            label="Volume" 
            value="12.5" 
            suffix="K" 
            color="text-text-primary" 
            bg="bg-bg-secondary" 
        />
        <StatCard 
            icon={Calendar} 
            label="Goal" 
            value="2" 
            suffix="SETS" 
            color="text-text-primary" 
            bg="bg-bg-secondary" 
        />
      </div>

      {/* Main Action Section */}
      <section className="space-y-10">
        <div className="relative">
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
            <WorkoutForm onLog={handleLog} lastEntries={workout?.entries} />
        </div>

        {workout && workout.entries.length > 0 ? (
          <div className="space-y-8 animate-premium-in">
            <div className="flex items-center justify-between px-2">
              <div className="space-y-1">
                  <h3 className="font-black uppercase tracking-tighter text-2xl flex items-center gap-2">
                    <Sparkles size={20} className="text-accent" />
                    Session Log
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Current session tracking</p>
              </div>
              <button 
                  onClick={handleFinish}
                  className="btn-premium px-8 py-4 flex items-center gap-3 active:scale-95 group"
              >
                  <span className="text-sm">Finish</span>
                  <ChevronRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-primary/5 to-bg-primary pointer-events-none z-10" />
                <WorkoutList 
                    entries={workout.entries} 
                    onUpdate={handleUpdateEntries} 
                />
            </div>
          </div>
        ) : (
          <div className="py-20 text-center space-y-8 animate-premium-in card-premium mx-1 border-dashed border-2 border-white/5 bg-transparent shadow-none">
              <div className="w-24 h-24 bg-bg-secondary rounded-[32px] flex items-center justify-center mx-auto shadow-2xl relative">
                  <div className="absolute inset-0 bg-accent/10 rounded-[32px] blur-xl animate-pulse" />
                  <Dumbbell size={40} className="text-accent relative z-10 animate-float" />
              </div>
              <div className="space-y-3 px-6">
                <h3 className="text-2xl font-black tracking-tight text-text-primary uppercase">Engine Off</h3>
                <p className="text-xs font-bold text-text-tertiary tracking-widest uppercase leading-loose max-w-[280px] mx-auto opacity-60">
                    No active session detected. Record an exercise above to ignite your training.
                </p>
              </div>
          </div>
        )}
      </section>
    </div>
  );
}

const StatCard = ({ icon: Icon, label, value, suffix, color, bg, active }: any) => (
    <div className={`${bg} border border-white/5 rounded-[28px] p-5 flex flex-col gap-4 shadow-sm transition-all hover:translate-y-[-4px] cursor-default group`}>
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${active ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'bg-bg-tertiary text-text-tertiary group-hover:bg-accent/10 group-hover:text-accent'}`}>
            <Icon size={20} strokeWidth={2.5} />
        </div>
        <div>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-text-tertiary opacity-50">{label}</p>
            <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-black tabular-nums tracking-tighter ${color}`}>{value}</span>
                <span className="text-[10px] font-black text-text-tertiary">{suffix}</span>
            </div>
        </div>
    </div>
);