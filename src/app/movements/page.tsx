'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getMovements, Movement, deleteMovement, addMovement } from "@/lib/firestore";
import { Search, Plus, Trash2, Filter, ChevronRight, Edit2, Dumbbell, Sparkles, X, ChevronLeft } from "lucide-react";

export default function MovementsPage() {
  const { user } = useAuth();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat] = useState("Legs");

  const categories = ["All", "Legs", "Back", "Chest", "Shoulders", "Arms", "Core", "Cardio"];

  useEffect(() => {
    if (user) loadMovements();
  }, [user]);

  const loadMovements = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const m = await getMovements(user.uid);
      setMovements(m);
    } catch (err) {
      console.error("Failed to load movements:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (confirm("Delete this movement?")) {
        await deleteMovement(user.uid, id);
        setMovements(movements.filter(m => m.id !== id));
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newName) return;
    const m = await addMovement(user.uid, { name: newName, category: newCat, isCustom: true });
    setMovements([m, ...movements]);
    setNewName("");
    setShowAdd(false);
  };

  const filtered = movements.filter(m => 
    (category === "All" || m.category === category) && 
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
      <div className="space-y-10 pt-10 px-4 animate-pulse max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-bg-tertiary rounded-full" />
            <div className="h-12 w-48 bg-bg-tertiary rounded-2xl" />
          </div>
          <div className="h-16 w-16 bg-bg-tertiary rounded-2xl" />
        </div>
        <div className="h-20 w-full bg-bg-tertiary rounded-3xl" />
        <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-12 w-28 bg-bg-tertiary rounded-full flex-shrink-0" />)}
        </div>
        {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-bg-tertiary/50 rounded-[32px] border border-white/5" />)}
      </div>
  );

  return (
    <div className="flex flex-col gap-10 pt-8 pb-32 px-4 animate-premium-in max-w-2xl mx-auto">
      {/* Header Section */}
      <header className="flex items-end justify-between px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-accent">
            <Dumbbell size={12} strokeWidth={3} />
            <span>Exercise Database</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter leading-none">
            LIBRARY
          </h1>
        </div>
        <button 
           onClick={() => setShowAdd(!showAdd)}
           className={`w-16 h-16 rounded-[22px] flex items-center justify-center shadow-xl active:scale-90 transition-all duration-500 border ${
             showAdd 
             ? 'bg-bg-tertiary/50 border-white/10 text-text-primary rotate-90' 
             : 'bg-accent border-accent text-white shadow-[0_15px_30px_-5px_var(--accent-glow)]'
           }`}
        >
          {showAdd ? <X size={28} strokeWidth={3} /> : <Plus size={32} strokeWidth={3} />}
        </button>
      </header>

      {/* Main Content Area */}
      {!showAdd ? (
        <>
          {/* Search Bar */}
          <div className="relative group animate-premium-in" style={{ animationDelay: '100ms' }}>
            <div className="absolute inset-y-0 left-7 flex items-center pointer-events-none">
              <Search className="text-text-tertiary/40 group-focus-within:text-accent group-focus-within:scale-110 transition-all duration-300" size={22} />
            </div>
            <input 
              type="text" 
              placeholder="Search exercises..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-bg-primary/50 border border-white/5 rounded-[32px] py-7 pl-16 pr-8 focus:bg-bg-primary focus:border-accent/30 focus:ring-8 focus:ring-accent/5 shadow-inner transition-all font-bold outline-none text-lg placeholder:text-text-tertiary/20"
            />
          </div>

          {/* Category Slider */}
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 animate-premium-in" style={{ animationDelay: '200ms' }}>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-500 active:scale-90 border-2 ${
                  category === c 
                    ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20' 
                    : 'bg-bg-tertiary/40 border-white/5 text-text-tertiary hover:border-accent/20 hover:text-accent'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between px-2 text-[10px] font-black uppercase tracking-[0.25em] text-text-tertiary animate-premium-in" style={{ animationDelay: '250ms' }}>
            <span>Available Moves</span>
            <span className="bg-bg-tertiary px-3 py-1 rounded-full">{filtered.length} Results</span>
          </div>

          {/* Movement List */}
          <div className="grid gap-5 animate-premium-in" style={{ animationDelay: '300ms' }}>
            {filtered.map((m, idx) => (
              <div 
                key={m.id} 
                className="card-premium p-7 flex items-center justify-between group hover:border-accent/30 hover:shadow-[0_15px_35px_-10px_rgba(0,0,0,0.5)] transition-all duration-500"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-bg-primary/80 border border-white/5 rounded-2xl flex items-center justify-center text-text-tertiary/30 group-hover:text-accent group-hover:border-accent/20 transition-all duration-500 shadow-inner">
                     <Dumbbell size={28} />
                   </div>
                   <div className="space-y-2">
                      <h4 className="font-black text-2xl tracking-tighter leading-none group-hover:text-white transition-colors">{m.name}</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent/60 bg-accent/5 px-3 py-1 rounded-full border border-accent/10">
                          {m.category}
                        </span>
                        {m.isCustom && (
                          <span className="text-[9px] font-black uppercase tracking-[0.1em] text-text-tertiary opacity-40">User Added</span>
                        )}
                      </div>
                   </div>
                </div>
                
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                   {m.isCustom && (
                     <button
                        onClick={() => handleDelete(m.id)}
                        className="w-12 h-12 flex items-center justify-center text-danger/30 hover:text-danger hover:bg-danger/10 rounded-2xl transition-all active:scale-90"
                     >
                        <Trash2 size={22} />
                     </button>
                   )}
                   <button className="w-12 h-12 flex items-center justify-center text-text-tertiary hover:text-accent hover:bg-accent/10 rounded-2xl transition-all active:scale-90">
                      <Edit2 size={22} />
                   </button>
                </div>
              </div>
            ))}
            
            {filtered.length === 0 && (
                <div className="py-32 text-center space-y-8 opacity-40">
                    <div className="mx-auto w-24 h-24 bg-bg-tertiary/30 rounded-[3rem] flex items-center justify-center border border-white/5">
                      <Search size={48} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                      <p className="font-black uppercase tracking-[0.2em] text-sm">No exercises match</p>
                      <p className="text-xs font-bold opacity-60">Try adjusting your search or category.</p>
                    </div>
                </div>
            )}
          </div>
        </>
      ) : (
        /* Add Movement Form - Luxury Style */
        <form onSubmit={handleAdd} className="card-premium p-8 sm:p-12 space-y-10 animate-premium-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
            
            <div className="space-y-3 relative z-10 text-center sm:text-left">
              <div className="inline-flex items-center gap-3 text-accent text-[11px] font-black uppercase tracking-[0.4em] bg-accent/5 px-4 py-1.5 rounded-full border border-accent/10">
                <Sparkles size={14} strokeWidth={3} />
                <span>New Protocol</span>
              </div>
              <h3 className="font-black text-5xl tracking-tighter leading-none pt-2">CREATE MOVE</h3>
              <p className="text-sm font-bold text-text-tertiary opacity-60 max-w-sm">Expand your training repertoire with custom exercises tailored to your routine.</p>
            </div>

            <div className="space-y-8 relative z-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary ml-2">Movement Label</label>
                  <input 
                     type="text" 
                     placeholder="E.g. Decline Hammer Press"
                     value={newName} 
                     onChange={e => setNewName(e.target.value)} 
                     className="w-full text-2xl font-black bg-bg-primary/50 border border-white/5 rounded-[32px] py-7 px-8 focus:bg-bg-primary focus:border-accent/30 focus:ring-8 focus:ring-accent/5 outline-none transition-all placeholder:text-text-tertiary/20 shadow-inner"
                     autoFocus
                  />
                </div>
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary ml-2">Target Group</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {categories.filter(c => c !== "All").map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewCat(c)}
                        className={`py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-2 ${
                          newCat === c 
                            ? 'bg-accent/10 border-accent text-accent shadow-[0_10px_20px_-10px_var(--accent-glow)] scale-[1.02]' 
                            : 'bg-bg-primary border-white/5 text-text-tertiary opacity-40 hover:opacity-100'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
            </div>
            
            <div className="pt-6">
              <button 
                  type="submit" 
                  disabled={!newName}
                  className="btn-premium w-full py-7 flex items-center justify-center gap-4 text-xl shadow-[0_20px_40px_-5px_var(--accent-glow)] disabled:opacity-20 disabled:scale-100 group"
              >
                  <Plus size={24} strokeWidth={4} className="group-hover:rotate-90 transition-transform" />
                  <span>Register Movement</span>
              </button>
            </div>
        </form>
      )}
    </div>
  );
}
