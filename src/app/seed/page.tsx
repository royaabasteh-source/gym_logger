'use client';

import { useAuth } from "@/contexts/AuthContext";
import { collection, doc, writeBatch, getDocs, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEFAULT_MOVEMENTS, INITIAL_TEMPLATES } from "@/lib/defaults";
import { useState } from "react";

export default function SeedPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState("");

  const seedMovements = async () => {
    if (!user) return;
    if (!db) {
      setStatus("Firebase is not configured. Please check environment variables.");
      return;
    }
    setStatus("Seeding movements...");
    if (!db) {
  setStatus("Firebase is not configured. Check your environment variables.");
  return;
}
    const batch = writeBatch(db);
    
    // Simple way to check if seeded
    const mCol = collection(db, 'users', user.uid, 'movements');
    const existing = await getDocs(mCol);
    if (!existing.empty) {
        setStatus("Movements already seeded.");
        return;
    }

    DEFAULT_MOVEMENTS.forEach(m => {
        const ref = doc(mCol);
        batch.set(ref, m);
    });

    await batch.commit();
    setStatus("Movements seeded successfully.");
  };

  const seedTemplates = async () => {
    if (!user) return;
    if (!db) {
      setStatus("Firebase is not configured. Please check environment variables.");
      return;
    }
    setStatus("Seeding templates...");
    const batch = writeBatch(db);
    
    // Check if seeded
    const tCol = collection(db, 'users', user.uid, 'templates');
    const existing = await getDocs(tCol);
    if (!existing.empty) {
        setStatus("Templates already seeded.");
        return;
    }

    INITIAL_TEMPLATES.forEach(t => {
        const ref = doc(tCol);
        batch.set(ref, { ...t, createdAt: Date.now() });
    });

    await batch.commit();
    setStatus("Templates seeded successfully.");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 animate-fade-in">
      <h1 className="text-4xl font-black uppercase tracking-tight">Seed Utility</h1>
      <p className="text-text-tertiary mb-8">Force initialize your movement library and templates.</p>
      
      <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
        <button 
           onClick={seedMovements}
           className="w-full bg-bg-secondary p-6 rounded-2xl font-black uppercase tracking-widest card-depth border border-border shadow-card-shadow hover:text-accent transition-colors"
        >
           Seed Movements
        </button>
        <button 
           onClick={seedTemplates}
           className="w-full bg-bg-secondary p-6 rounded-2xl font-black uppercase tracking-widest card-depth border border-border shadow-card-shadow hover:text-accent transition-colors"
        >
           Seed Templates
        </button>
      </div>

      {status && (
          <div className="mt-8 p-4 bg-bg-tertiary/20 rounded-xl text-xs font-black uppercase tracking-widest text-text-tertiary border border-border">
              {status}
          </div>
      )}
    </div>
  );
}
