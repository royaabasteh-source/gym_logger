'use client';

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getMovements, Movement, WorkoutEntry } from "@/lib/firestore";
import { Plus, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

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
      unit: 'kg', // Todo: check settings
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
    <div className="bg-bg-secondary p-6 rounded-[2.5rem] card-depth shadow-card-shadow border border-border">
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Movement Autocomplete */}
        <div className="relative">
          <input
            ref={movementInputRef}
            type="text"
            placeholder="Search movement..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className="w-full text-xl font-bold bg-bg-tertiary/40 border border-border rounded-2xl py-4 px-6 focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all outline-none placeholder:text-text-tertiary placeholder:font-bold"
          />
          
          {showDropdown && filteredMovements.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-bg-secondary border border-border rounded-2xl shadow-card-shadow-lg overflow-hidden animate-fade-in glass">
              {filteredMovements.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelectMovement(m)}
                  className="w-full text-left p-4 hover:bg-bg-tertiary/50 active:bg-accent-active transition-colors font-bold border-b border-border last:border-0"
                >
                  {m.name}
                  <span className="ml-2 text-xs text-text-tertiary bg-bg-tertiary px-1.5 py-0.5 rounded uppercase">{m.category}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reps and Weight */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-2">Weight (kg)</label>
            <input
              type="number"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full text-center text-3xl font-black bg-bg-tertiary/40 border border-border rounded-2xl py-4 transition-all focus:border-accent outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-2">Reps</label>
            <input
              type="number"
              inputMode="numeric"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-full text-center text-3xl font-black bg-bg-tertiary/40 border border-border rounded-2xl py-4 transition-all focus:border-accent outline-none"
            />
          </div>
        </div>

        {/* Optional Notes Toggle */}
        <button 
          type="button" 
          onClick={() => setShowNotes(!showNotes)}
          className="flex items-center gap-1.5 text-xs font-black text-text-tertiary ml-2 uppercase hover:text-accent transition-colors"
        >
          {showNotes ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showNotes ? 'Hide Notes' : 'Add Notes'}
        </button>

        {showNotes && (
          <textarea
            placeholder="Set notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-sm bg-bg-tertiary/30 border border-border rounded-xl p-4 min-h-[80px] focus:border-accent outline-none resize-none animate-fade-in placeholder:italic"
          />
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3 pt-2">
            <button
                type="submit"
                disabled={!query}
                className="w-full bg-accent text-white py-5 rounded-2xl font-black text-lg active:scale-95 transition-all shadow-btn-shadow disabled:opacity-40 disabled:scale-100 flex items-center justify-center gap-2"
            >
                <Plus size={24} strokeWidth={3} />
                <span>Log Set</span>
            </button>
            
            {lastLogged && (
                <button
                    type="button"
                    onClick={handleRepeatLast}
                    className="w-full bg-bg-tertiary text-text-secondary py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-bg-tertiary/80 active:scale-95 transition-all"
                >
                    <RotateCcw size={18} />
                    <span>Repeat last: <strong>{lastLogged.movementName}</strong></span>
                </button>
            )}
        </div>
      </form>
    </div>
  );
};
