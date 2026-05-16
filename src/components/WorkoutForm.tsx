'use client';

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getMovements, Movement, WorkoutEntry } from "@/lib/firestore";
import { Plus, RotateCcw, Search, Weight, Hash, MessageSquare, ChevronDown } from "lucide-react";

interface WorkoutFormProps {
  onLog: (entry: Omit<WorkoutEntry, 'id' | 'createdAt'>) => void;
  lastEntries?: WorkoutEntry[];
}

export const WorkoutForm: React.FC<WorkoutFormProps> = ({ onLog, lastEntries }) => {
  const { user } = useAuth();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [reps, setReps] = useState("10");
  const [weight, setWeight] = useState("60");
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [lastLogged, setLastLogged] = useState<WorkoutEntry | null>(null);

  const movementInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      getMovements(user.uid).then(setMovements);
    }
  }, [user]);

  useEffect(() => {
    if (lastEntries && lastEntries.length > 0) {
      setLastLogged(lastEntries[lastEntries.length - 1]);
    }
  }, [lastEntries]);

  const filteredMovements = query.trim() === ""
    ? []
    : movements.filter(m => m.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8);

  const handleSelectMovement = (m: Movement) => {
    setQuery(m.name);
    setShowDropdown(false);
    
    // Smart prefill
    const lastForMovement = [...(lastEntries || [])].reverse().find(e => e.movementName === m.name);
    if (lastForMovement) {
        setReps(lastForMovement.reps.toString());
        setWeight(lastForMovement.weight.toString());
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query) return;

    onLog({
      movementName: query,
      reps: parseInt(reps) || 0,
      weight: parseFloat(weight) || 0,
      unit: 'kg', 
      notes: notes || undefined
    });

    setQuery("");
    setNotes("");
    movementInputRef.current?.focus();
  };

  const handleRepeatLast = () => {
    if (!lastLogged) return;
    onLog({
        movementName: lastLogged.movementName,
        reps: lastLogged.reps,
        weight: lastLogged.weight,
        unit: lastLogged.unit,
        notes: lastLogged.notes
    });
  };

  return (
    <div className="card-premium p-8 space-y-8 relative overflow-hidden animate-premium-in">
      {/* Visual hierarchy decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      
      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        {/* Movement Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-text-tertiary">
                <Search size={12} className="text-accent" />
                <span>Exercise Selection</span>
              </div>
          </div>
          <div className="relative">
            <input
              ref={movementInputRef}
              type="text"
              placeholder="E.g. Bench Press"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full text-xl font-black bg-bg-primary/50 border border-white/5 rounded-[24px] py-5 px-7 focus:bg-bg-primary focus:border-accent/30 focus:ring-4 focus:ring-accent/10 transition-all outline-none placeholder:text-text-tertiary/30 shadow-inner"
            />
            
            {showDropdown && filteredMovements.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-4 glass-premium border border-white/10 rounded-[32px] shadow-2xl overflow-hidden animate-premium-in p-3 space-y-1">
                {filteredMovements.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectMovement(m)}
                    className="w-full text-left p-4 hover:bg-accent/10 rounded-[20px] active:scale-[0.98] transition-all font-bold flex items-center justify-between group"
                  >
                    <span className="text-sm uppercase tracking-tight group-hover:text-accent">{m.name}</span>
                    <span className="text-[9px] font-black bg-white/5 px-2.5 py-1 rounded-full text-text-tertiary uppercase tracking-widest">{m.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reps & Weight Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-text-tertiary ml-1">
              <Weight size={12} className="text-accent" />
              <span>Weight (KG)</span>
            </div>
            <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full text-center text-4xl font-black bg-bg-primary/50 border border-white/5 rounded-[28px] py-6 focus:bg-bg-primary focus:border-accent/30 focus:ring-4 focus:ring-accent/10 transition-all outline-none shadow-inner"
                />
                <div className="absolute inset-x-0 bottom-3 flex justify-center pointer-events-none">
                    <div className="w-8 h-1 bg-accent/20 rounded-full" />
                </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-text-tertiary ml-1">
              <Hash size={12} className="text-accent" />
              <span>Reps</span>
            </div>
            <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  className="w-full text-center text-4xl font-black bg-bg-primary/50 border border-white/5 rounded-[28px] py-6 focus:bg-bg-primary focus:border-accent/30 focus:ring-4 focus:ring-accent/10 transition-all outline-none shadow-inner"
                />
                <div className="absolute inset-x-0 bottom-3 flex justify-center pointer-events-none">
                    <div className="w-8 h-1 bg-accent/20 rounded-full" />
                </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-2">
            <button
                type="submit"
                disabled={!query}
                className="btn-premium w-full py-6 flex items-center justify-center gap-4 text-lg active:scale-95 disabled:opacity-30 disabled:scale-100 shadow-[0_15px_30px_-5px_var(--accent-glow)] group"
            >
                <Plus size={24} strokeWidth={4} className="group-hover:rotate-90 transition-transform" />
                <span>Log Set</span>
            </button>
            
            {lastLogged && (
                <button
                    type="button"
                    onClick={handleRepeatLast}
                    className="w-full bg-bg-tertiary/40 hover:bg-accent/10 text-text-secondary hover:text-accent py-5 px-8 rounded-[24px] font-black flex items-center justify-between transition-all duration-300 border border-transparent hover:border-accent/20 group active:scale-[0.98]"
                >
                    <div className="flex items-center gap-3">
                      <RotateCcw size={16} className="group-hover:rotate-[-180deg] transition-transform duration-500" />
                      <span className="text-[11px] uppercase tracking-widest">Repeat Last</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs opacity-50">{lastLogged.weight}{lastLogged.unit} × {lastLogged.reps}</span>
                        <ChevronDown size={14} className="opacity-30" />
                    </div>
                </button>
            )}
        </div>

        {/* Notes Section */}
        <div className="space-y-4">
          <button 
            type="button" 
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary hover:text-accent transition-colors ml-1"
          >
            <MessageSquare size={14} />
            <span>{showNotes ? 'Collapse Notes' : 'Add Training Notes'}</span>
          </button>

          {showNotes && (
            <textarea
              placeholder="Focus, form, intensity..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm font-bold bg-bg-primary/50 border border-white/5 rounded-[24px] p-6 min-h-[120px] focus:bg-bg-primary focus:border-accent/30 focus:ring-4 focus:ring-accent/10 outline-none resize-none animate-premium-in shadow-inner placeholder:text-text-tertiary/30"
            />
          )}
        </div>
      </form>
    </div>
  );
};
