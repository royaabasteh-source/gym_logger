'use client';

import { WorkoutEntry } from "@/lib/firestore";
import { Trash2, Copy, Edit2, Check, X, Layers, Zap } from "lucide-react";
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

  const calculateVolume = (movementEntries: WorkoutEntry[]) => {
    return movementEntries.reduce((acc, e) => acc + (e.weight * e.reps), 0);
  };

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
    <div className="space-y-8 animate-premium-in">
      {Object.entries(groups).map(([name, movementEntries]) => (
        <div key={name} className="card-premium overflow-hidden group/card">
          {/* Group Header */}
          <div className="flex items-center justify-between px-8 py-6 bg-bg-accent/10 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center bg-accent/10 text-accent rounded-2xl shadow-inner border border-accent/10">
                <Layers size={20} />
              </div>
              <div>
                <h4 className="font-black text-xl tracking-tight uppercase leading-none">{name}</h4>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[9px] font-black bg-white/5 text-text-tertiary px-2.5 py-1 rounded-full uppercase tracking-[0.15em]">
                    {movementEntries.length} sets
                  </span>
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-accent uppercase tracking-[0.15em]">
                    <Zap size={10} strokeWidth={3} />
                    <span>{calculateVolume(movementEntries)}kg volume</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDeleteMovement(name)}
              className="p-3 text-danger/30 hover:text-danger hover:bg-danger/10 rounded-2xl transition-all active:scale-90"
            >
              <Trash2 size={20} />
            </button>
          </div>

          {/* Sets List */}
          <div className="p-4 sm:p-6 space-y-2">
            {movementEntries.map((entry, idx) => (
              <div
                key={entry.id}
                className={`group flex items-center justify-between p-5 rounded-[24px] transition-all duration-300 ${
                  editingId === entry.id 
                    ? 'bg-accent/5 ring-1 ring-accent/20' 
                    : 'hover:bg-bg-primary/50'
                }`}
              >
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black text-accent opacity-40 uppercase tracking-tighter leading-none mb-1">Set</span>
                    <span className="text-sm font-black text-text-tertiary tabular-nums">
                      {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                  </div>
                  
                  {editingId === entry.id ? (
                    <div className="flex items-center gap-4 animate-premium-in">
                        <div className="relative">
                          <input
                              type="number"
                              value={editWeight}
                              onChange={(e) => setEditWeight(e.target.value)}
                              className="w-24 bg-bg-primary border border-accent/30 rounded-2xl py-3 px-2 font-black text-center text-xl outline-none shadow-inner"
                              autoFocus
                          />
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent text-white text-[7px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Weight</span>
                        </div>
                        <span className="text-xl font-black text-accent/30">×</span>
                        <div className="relative">
                          <input
                              type="number"
                              value={editReps}
                              onChange={(e) => setEditReps(e.target.value)}
                              className="w-20 bg-bg-primary border border-accent/30 rounded-2xl py-3 px-2 font-black text-center text-xl outline-none shadow-inner"
                          />
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent text-white text-[7px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Reps</span>
                        </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 cursor-pointer group-hover:translate-x-1 transition-all" onClick={() => startEdit(entry)}>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black tracking-tighter">{entry.weight}</span>
                        <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest opacity-60">{entry.unit}</span>
                      </div>
                      <span className="text-text-tertiary opacity-20 font-black text-xl">/</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black tracking-tighter">{entry.reps}</span>
                        <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest opacity-60">Reps</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all">
                  {editingId === entry.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => saveEdit(entry.id)}
                        className="w-12 h-12 flex items-center justify-center text-white bg-accent rounded-2xl active:scale-90 transition-all shadow-btn-shadow"
                      >
                        <Check size={20} strokeWidth={4} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="w-12 h-12 flex items-center justify-center text-text-tertiary bg-bg-tertiary rounded-2xl active:scale-90 transition-all border border-white/5"
                      >
                        <X size={20} strokeWidth={3} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-bg-tertiary/50 p-1.5 rounded-[20px] border border-white/5">
                      <button
                        onClick={() => handleDuplicateSet(entry)}
                        className="p-3 text-text-tertiary hover:text-accent hover:bg-white/5 rounded-2xl transition-all"
                        title="Duplicate Set"
                      >
                        <Copy size={18} />
                      </button>
                      <button
                        onClick={() => startEdit(entry)}
                        className="p-3 text-text-tertiary hover:text-accent hover:bg-white/5 rounded-2xl transition-all"
                        title="Edit Set"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-3 text-danger/40 hover:text-danger hover:bg-danger/5 rounded-2xl transition-all"
                        title="Delete Set"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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
