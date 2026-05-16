'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getMovements, Movement, deleteMovement, addMovement } from "@/lib/firestore";
import { Search, Plus, Trash2, Filter, ChevronRight, Edit2 } from "lucide-react";

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
    const m = await getMovements(user.uid);
    setMovements(m);
    setLoading(false);
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
      <div className="space-y-4 pt-6">
        <div className="h-12 w-full bg-bg-tertiary rounded-2xl skeleton" />
        <div className="h-10 w-full flex gap-2 overflow-hidden">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 w-16 bg-bg-tertiary rounded-full flex-shrink-0 skeleton" />)}
        </div>
        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-bg-tertiary rounded-3xl skeleton" />)}
      </div>
  );

  return (
    <div className="flex flex-col gap-6 pt-6 animate-fade-in">
      <div className="flex items-center justify-between px-1">
        <h1 className="text-3xl font-black tracking-tight uppercase">Movements</h1>
        <button 
           onClick={() => setShowAdd(!showAdd)}
           className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center shadow-btn-shadow active:scale-90 transition-all"
        >
          {showAdd ? <ChevronRight /> : <Plus size={24} strokeWidth={3} />}
        </button>
      </div>

      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-accent transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Search movements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-bg-secondary border border-border rounded-2xl py-5 pl-14 pr-6 focus:border-accent shadow-card-shadow active:scale-[0.99] transition-all font-bold outline-none"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none px-1">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all active:scale-90 ${
              category === c 
                ? 'bg-accent text-white shadow-btn-shadow scale-105' 
                : 'bg-bg-tertiary text-text-tertiary hover:bg-bg-tertiary/70'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {showAdd && (
          <form onSubmit={handleAdd} className="bg-bg-secondary p-8 rounded-[2.5rem] card-depth border border-border shadow-card-shadow space-y-6 animate-slide-up">
              <h3 className="font-black text-xl uppercase tracking-tight">Add Movement</h3>
              <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-2">Exercise Name</label>
                    <input 
                       type="text" 
                       value={newName} 
                       onChange={e => setNewName(e.target.value)} 
                       className="w-full text-xl font-bold bg-bg-tertiary/20 border border-border rounded-2xl py-4 px-6 focus:border-accent outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-2">Category</label>
                    <select 
                       value={newCat} 
                       onChange={e => setNewCat(e.target.value)} 
                       className="w-full text-lg font-bold bg-bg-tertiary/20 border border-border rounded-2xl py-4 px-6 focus:border-accent outline-none appearance-none"
                    >
                        {categories.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
              </div>
              <button 
                  type="submit" 
                  className="w-full bg-accent text-white py-4 rounded-2xl font-black shadow-btn-shadow active:scale-95 transition-all text-lg"
              >
                  Save Movement
              </button>
          </form>
      )}

      <div className="space-y-3">
        {filtered.map(m => (
          <div key={m.id} className="bg-bg-secondary p-5 px-6 rounded-[2rem] flex items-center justify-between border border-border card-depth shadow-card-shadow group">
            <div className="space-y-0.5">
               <h4 className="font-black text-lg uppercase tracking-tight group-hover:text-accent transition-colors">{m.name}</h4>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary opacity-70">{m.category}</span>
            </div>
            <div className="flex gap-1">
               {m.isCustom && (
                 <button
                    onClick={() => handleDelete(m.id)}
                    className="p-3 text-danger/40 hover:text-danger hover:bg-danger/10 rounded-xl transition-all active:scale-90"
                 >
                    <Trash2 size={18} />
                 </button>
               )}
               <button className="p-3 text-text-tertiary hover:bg-bg-tertiary/50 rounded-xl transition-all active:scale-90">
                  <Edit2 size={18} />
               </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
            <div className="py-20 text-center opacity-40">
                <Search size={40} className="mx-auto mb-3 opacity-20" />
                <p className="font-bold">No movements found matching "{search}"</p>
            </div>
        )}
      </div>
    </div>
  );
}
