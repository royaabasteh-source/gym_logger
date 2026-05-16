'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getWorkouts, Workout, deleteWorkout, updateWorkoutEntries } from "@/lib/firestore";
import { WorkoutList } from "@/components/WorkoutList";
import { ChevronDown, Trash2, History, TrendingUp, Filter, Calendar } from "lucide-react";

export default function HistoryPage() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const w = await getWorkouts(user.uid);
      setWorkouts(w);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (workoutId: string) => {
    if (!user) return;
    if (confirm("Are you sure you want to delete this workout?")) {
        await deleteWorkout(user.uid, workoutId);
        setWorkouts(workouts.filter(w => w.id !== workoutId));
    }
  };

  const handleUpdateEntries = async (workoutId: string, entries: any) => {
    if (!user) return;
    const updatedWorkouts = workouts.map(w => w.id === workoutId ? { ...w, entries } : w);
    setWorkouts(updatedWorkouts.filter(w => w.entries.length > 0));
    await updateWorkoutEntries(user.uid, workoutId, entries);
  };

  if (loading) return (
      <div className="space-y-10 pt-10 px-4 animate-pulse">
        <div className="space-y-3">
          <div className="h-4 w-24 bg-bg-tertiary rounded-full" />
          <div className="h-12 w-48 bg-bg-tertiary rounded-2xl" />
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-bg-tertiary/50 rounded-[32px] border border-white/5" />
          ))}
        </div>
      </div>
  );

  return (
    <div className="flex flex-col gap-12 pt-8 pb-32 px-4 animate-premium-in max-w-2xl mx-auto">
      {/* Header Section */}
      <header className="flex items-end justify-between px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-accent">
            <Calendar size={12} strokeWidth={3} />
            <span>Training Log</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter leading-none">
            HISTORY
          </h1>
        </div>
        <button className="w-14 h-14 flex items-center justify-center bg-bg-tertiary/50 border border-white/5 rounded-2xl shadow-sm active:scale-90 transition-all text-text-tertiary hover:text-accent hover:border-accent/20">
          <Filter size={22} />
        </button>
      </header>

      {/* History Timeline */}
      <div className="relative space-y-8">
        {/* Vertical Timeline Line */}
        <div className="absolute left-10 top-0 bottom-0 w-px bg-gradient-to-b from-accent/20 via-border-color/10 to-transparent pointer-events-none" />

        {workouts.length === 0 ? (
          <div className="text-center py-32 space-y-8 opacity-40">
            <div className="mx-auto w-24 h-24 bg-bg-tertiary/30 rounded-[3rem] flex items-center justify-center border border-white/5 shadow-inner">
              <History size={40} strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <p className="font-black uppercase tracking-[0.2em] text-sm">Silence in the gym</p>
              <p className="text-xs font-bold opacity-60">Your training history will appear here.</p>
            </div>
          </div>
        ) : (
          workouts.map((workout) => {
            const isExpanded = expandedId === workout.id;
            const totalVol = workout.entries.reduce((acc, e) => acc + (e.weight * e.reps), 0);
            const date = new Date(workout.date);
            
            return (
              <div key={workout.id} className="relative pl-1">
                {/* Timeline Dot */}
                <div className={`absolute left-[36px] top-8 w-2 h-2 rounded-full z-10 transition-all duration-500 ring-4 ${
                  isExpanded ? 'bg-accent ring-accent/20 scale-125' : 'bg-bg-tertiary ring-bg-primary'
                }`} />

                <div className={`card-premium overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] ${
                  isExpanded ? 'ring-2 ring-accent/20 scale-[1.02] translate-x-2' : ''
                }`}>
                  <div 
                      className={`flex items-center justify-between p-7 cursor-pointer transition-colors active:bg-accent/5 ${isExpanded ? 'bg-accent/5' : ''}`}
                      onClick={() => setExpandedId(isExpanded ? null : workout.id)}
                  >
                      <div className="flex items-center gap-6">
                        {/* Date Box */}
                        <div className={`w-16 h-16 rounded-[22px] flex flex-col items-center justify-center border transition-all duration-500 ${
                          isExpanded ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20' : 'bg-bg-primary border-white/5'
                        }`}>
                            <span className={`text-[10px] font-black uppercase tracking-tighter -mb-1 ${isExpanded ? 'text-white/70' : 'text-accent'}`}>
                                {date.toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                            <span className="text-2xl font-black tracking-tighter tabular-nums leading-none">{date.getDate()}</span>
                        </div>

                        <div>
                            <h4 className="font-black text-xl tracking-tight leading-none mb-2 capitalize">
                                {date.toLocaleDateString('en-US', { weekday: 'long' })}
                            </h4>
                            <div className="flex items-center gap-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest">
                              <span className="flex items-center gap-1.5 bg-bg-accent/30 px-2 py-0.5 rounded-md">
                                <TrendingUp size={11} className="text-success" strokeWidth={3} />
                                {totalVol.toLocaleString()} {workout.entries[0]?.unit || 'kg'}
                              </span>
                              <span className="opacity-20">/</span>
                              <span>{workout.entries.length} sets</span>
                            </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(workout.id); }}
                            className="p-3 text-danger/20 hover:text-danger hover:bg-danger/10 rounded-2xl transition-all active:scale-90"
                        >
                            <Trash2 size={20} />
                        </button>
                        <div className={`transition-transform duration-500 ${isExpanded ? 'rotate-180 text-accent' : 'text-text-tertiary opacity-30'}`}>
                            <ChevronDown size={24} strokeWidth={4} />
                        </div>
                      </div>
                  </div>

                  {isExpanded && (
                      <div className="px-7 pb-8 animate-premium-in space-y-6">
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
                        <WorkoutList 
                            entries={workout.entries} 
                            onUpdate={(entries) => handleUpdateEntries(workout.id, entries)} 
                        />
                      </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
