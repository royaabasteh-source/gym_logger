'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getTodayWorkout,
  Workout,
  addEntryToWorkout,
  finishWorkout,
  WorkoutEntry,
  updateWorkoutEntries
} from "@/lib/firestore";

import { WorkoutForm } from "@/components/WorkoutForm";
import { WorkoutList } from "@/components/WorkoutList";
import { Check } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [finishStep, setFinishStep] = useState(0);

  const today = new Date().toISOString().split('T')[0];

useEffect(() => {
  if (user) {
    loadTodayWorkout();
  } else {
    setLoading(false);
  }
}, [user]);

  const loadTodayWorkout = async () => {
    if (!user) return;

    const w = await getTodayWorkout(user.uid, today);

    setWorkout(w);
    setLoading(false);
  };

  const handleLogSet = async (
    entry: Omit<WorkoutEntry, 'id' | 'createdAt'>
  ) => {
    if (!user) return;

    const tempId = Math.random().toString(36).substr(2, 9);

    const newEntry: WorkoutEntry = {
      ...entry,
      id: tempId,
      createdAt: Date.now()
    };

    const updatedWorkout = workout
      ? {
          ...workout,
          entries: [...workout.entries, newEntry]
        }
      : {
          id: '',
          date: today,
          entries: [newEntry],
          createdAt: Date.now(),
          completed: false
        };

    setWorkout(updatedWorkout);

    const workoutId = await addEntryToWorkout(
      user.uid,
      workout?.id || null,
      newEntry,
      today
    );

    if (workoutId && !workout?.id) {
      setWorkout({
        ...updatedWorkout,
        id: workoutId
      });
    }
  };

  const handleUpdateEntries = async (
    entries: WorkoutEntry[]
  ) => {
    if (!user || !workout) return;

    setWorkout({
      ...workout,
      entries
    });

    await updateWorkoutEntries(
      user.uid,
      workout.id,
      entries
    );

    if (entries.length === 0) {
      setWorkout(null);
    }
  };

  const handleFinish = async () => {
    if (finishStep === 0) {
      setFinishStep(1);

      setTimeout(() => {
        setFinishStep(0);
      }, 3000);

      return;
    }

    if (!user || !workout) return;

    await finishWorkout(user.uid, workout.id);

    setFinishStep(2);

    setTimeout(() => {
      setWorkout(null);
      setFinishStep(0);
    }, 2000);
  };

  if (loading) {
    return <div>Loading...</div>;
  }
if (!user) {
  return <div>Please log in first.</div>;
}
  if (finishStep === 2) {
    const totalVolume =
      workout?.entries.reduce(
        (acc, e) => acc + e.weight * e.reps,
        0
      ) || 0;

    return (
      <div className="p-10 text-center">
        <Check size={48} />
        <h2>Workout Finished!</h2>

        <p>
          {workout?.entries.length} sets logged · {totalVolume}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1>Today's Workout</h1>

      <WorkoutForm
        onLog={handleLogSet}
        lastEntries={workout?.entries}
      />

      {workout && workout.entries.length > 0 && (
        <>
          <WorkoutList
            entries={workout.entries}
            onUpdate={handleUpdateEntries}
          />

          <button onClick={handleFinish}>
            Finish Workout
          </button>
        </>
      )}
    </div>
  );
}