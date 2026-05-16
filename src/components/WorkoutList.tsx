'use client';

import { WorkoutEntry } from "@/lib/firestore";
import { Trash2, Copy, Edit2, Check, X } from "lucide-react";
import { useState } from "react";

interface WorkoutListProps {
  entries: WorkoutEntry[];
  onUpdate: (entries: WorkoutEntry[]) => void;
}

export const WorkoutList: React.FC<WorkoutListProps> = ({ entries, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editReps, setEditReps] = useState("");
  const [editWeight, setEditWeight] = useState("");

  const groups = entries.reduce((acc, entry) => {
    if (!acc[entry.movementName]) {
      acc[entry.movementName] = [];
    }
    acc[entry.movementName].push(entry);
    return acc;
  }, {} as Record<string, WorkoutEntry[]>);

  const handleDeleteEntry = (id: string) => {
    onUpdate(entries.filter(e => e.id !== id));
  };

  const handleDeleteMovement = (movementName: string) => {
    onUpdate(entries.filter(e => e.movementName !== movementName));
  };

  const handleDuplicateSet = (entry: WorkoutEntry) => {
    const newEntry = { ...entry, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now() };
    onUpdate([...entries, newEntry]);
  };

  const startEdit = (entry: WorkoutEntry) => {
    setEditingId(entry.id);
    setEditReps(entry.reps.toString());
    setEditWeight(entry.weight.toString());
  };

  const saveEdit = (id: string) => {
     onUpdate(entries.map(e => e.id === id ? { ...e, reps: parseInt(editReps) || 0, weight: parseFloat(editWeight) || 0 } : e));
     setEditingId(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {Object.entries(groups).map(([name, movementEntries]) => (
        <div key={name} className="bg-bg-secondary rounded-[2rem] card-depth shadow-card-shadow border border-border overflow-hidden">
          <div className="flex items-center justify-between p-5 bg-bg-tertiary/10 border-b border-border">
            <h4 className="font-black text-lg tracking-tight uppercase">{name}</h4>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold bg-bg-tertiary px-2 py-1 rounded-lg uppercase tracking-tight text-text-tertiary">
                {movementEntries.length} sets
              </span>
              <button
                onClick={() => handleDeleteMovement(name)}
                className="p-2 text-danger hover:bg-danger/10 active:bg-danger/20 rounded-xl transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="p-3 space-y-2">
            {movementEntries.map((entry, idx) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-3.5 rounded-2xl transition-all ${
                  editingId === entry.id ? 'bg-bg-accent ring-2 ring-accent/20' : 'hover:bg-bg-tertiary/20'
                }`}
              >
                <div className="flex items-center gap-6">
                  <span className="text-xs font-black text-text-tertiary w-4">#{idx + 1}</span>
                  
                  {editingId === entry.id ? (
                    <div className="flex items-center gap-2 animate-fade-in">
                        <input
                            type="number"
                            value={editWeight}
                            onChange={(e) => setEditWeight(e.target.value)}
                            className="w-16 bg-bg-secondary border border-border rounded-lg p-1.5 font-bold text-center text-sm outline-none focus:border-accent"
                        />
                        <span className="text-xs font-bold text-text-tertiary">×</span>
                        <input
                            type="number"
                            value={editReps}
                            onChange={(e) => setEditReps(e.target.value)}
                            className="w-12 bg-bg-secondary border border-border rounded-lg p-1.5 font-bold text-center text-sm outline-none focus:border-accent"
                        />
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1" onClick={() => startEdit(entry)}>
                      <span className="text-xl font-black">{entry.weight}</span>
                      <span className="text-xs font-bold text-text-tertiary uppercase">{entry.unit}</span>
                      <span className="mx-2 text-text-tertiary opacity-40">×</span>
                      <span className="text-xl font-black">{entry.reps}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {editingId === entry.id ? (
                    <>
                      <button
                        onClick={() => saveEdit(entry.id)}
                        className="p-2 text-success hover:bg-success/10 rounded-xl active:scale-90 transition-all"
                      >
                        <Check size={18} strokeWidth={3} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-2 text-text-tertiary hover:bg-bg-tertiary rounded-xl active:scale-90 transition-all"
                      >
                        <X size={18} strokeWidth={2} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleDuplicateSet(entry)}
                        className="p-2 text-text-tertiary hover:bg-bg-tertiary rounded-xl active:scale-90 transition-all"
                      >
                        <Copy size={18} />
                      </button>
                      <button
                        onClick={() => startEdit(entry)}
                        className="p-2 text-text-tertiary hover:bg-bg-tertiary rounded-xl active:scale-90 transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-2 text-danger/60 hover:text-danger hover:bg-danger/10 rounded-xl active:scale-90 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
