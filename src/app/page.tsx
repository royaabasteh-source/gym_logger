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
import { Check, Dumbbell, Zap } from "lucide-react";

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
    const w = await getTodayWorkout(user.uid, today);
    setWorkout(w);
    setLoading(false);
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

  if (loading) return (
      <div className="space-y-4 pt-6">
        <div className="h-48 bg-bg-tertiary rounded-[2.5rem] skeleton" />
        <div className="h-32 bg-bg-tertiary rounded-3xl skeleton" />
      </div>
  );

  return (
    <div className="flex flex-col gap-8 pt-2 animate-fade-in">
      
      {/* Header / Stats */}
      <div className="flex items-center justify-between px-1">
        <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight uppercase">Lift</h1>
            <p className="text-xs font-black text-text-tertiary uppercase tracking-widest flex items-center gap-1.5">
                <Zap size={12} className="text-accent fill-accent" />
                Today's Session
            </p>
        </div>
        {workout && workout.entries.length > 0 && (
            <button 
                onClick={handleFinish}
                className="bg-success text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-btn-shadow active:scale-90 transition-all flex items-center gap-2"
            >
                <Check size={16} strokeWidth={4} />
                Finish
            </button>
        )}
      </div>

      <WorkoutForm onLog={handleLog} lastEntries={workout?.entries} />

      {workout && workout.entries.length > 0 ? (
        <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
                <Dumbbell className="text-accent" size={20} />
                <h3 className="font-black uppercase tracking-tight text-lg">Current Routine</h3>
            </div>
            <WorkoutList 
                entries={workout.entries} 
                onUpdate={handleUpdateEntries} 
            />
        </div>
      ) : (
        <div className="py-20 text-center opacity-30 px-10">
            <div className="w-20 h-20 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
                <Dumbbell size={32} />
            </div>
            <p className="font-bold text-lg leading-tight uppercase tracking-tighter">No exercises logged yet.<br/>Start your session!</p>
        </div>
      )}
    </div>
  );
}