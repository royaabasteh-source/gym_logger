'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getWorkouts, Workout, deleteWorkout, updateWorkoutEntries } from "@/lib/firestore";
import { WorkoutList } from "@/components/WorkoutList";
import { Calendar, ChevronDown, ChevronUp, Trash2 } from "lucide-react";

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
    const w = await getWorkouts(user.uid);
    setWorkouts(w);
    setLoading(false);
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
      <div className="space-y-4 pt-6">
        <div className="h-24 w-1/2 bg-bg-tertiary rounded-2xl skeleton" />
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-bg-tertiary rounded-3xl skeleton" />)}
      </div>
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in pt-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight uppercase">History</h1>
        <p className="text-sm font-bold text-text-tertiary uppercase tracking-widest">{workouts.length} workouts tracked</p>
      </div>

      <div className="space-y-4">
        {workouts.map((workout) => {
          const isExpanded = expandedId === workout.id;
          const totalVol = workout.entries.reduce((acc, e) => acc + (e.weight * e.reps), 0);
          
          return (
            <div key={workout.id} className="bg-bg-secondary rounded-[2rem] card-depth border border-border shadow-card-shadow overflow-hidden">
               <div 
                  className="flex items-center justify-between p-6 cursor-pointer active:bg-bg-tertiary/10 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : workout.id)}
               >
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-bg-tertiary rounded-2xl flex flex-col items-center justify-center">
                        <span className="text-[10px] font-black uppercase text-text-tertiary -mb-1">
                            {new Date(workout.date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-lg font-black">{new Date(workout.date).getDate()}</span>
                     </div>
                     <div>
                        <h4 className="font-black text-lg -mb-1">
                            {new Date(workout.date).toLocaleDateString('en-US', { weekday: 'long' })}
                        </h4>
                        <p className="text-xs font-bold text-text-tertiary uppercase">
                           {workout.entries.length} sets · {totalVol} {workout.entries[0]?.unit || 'kg'}
                        </p>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                     <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(workout.id); }}
                        className="p-2.5 text-danger opacity-40 hover:opacity-100 hover:bg-danger/10 active:bg-danger/20 rounded-xl transition-all"
                     >
                        <Trash2 size={18} />
                     </button>
                     <div className="text-text-tertiary">
                        {isExpanded ? <ChevronUp /> : <ChevronDown />}
                     </div>
                  </div>
               </div>

               {isExpanded && (
                  <div className="p-4 pt-0 animate-fade-in border-t border-border/50">
                     <WorkoutList 
                        entries={workout.entries} 
                        onUpdate={(entries) => handleUpdateEntries(workout.id, entries)} 
                     />
                  </div>
               )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
