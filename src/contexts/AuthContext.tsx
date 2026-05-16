'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut, signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DEFAULT_MOVEMENTS, INITIAL_TEMPLATES } from '@/lib/defaults';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
        setLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await seedUserData(user.uid);
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Auth error:", error);
      setLoading(false);
    });

    const timeout = setTimeout(() => {
        setLoading(false);
    }, 5000);

    return () => {
        unsubscribe();
        clearTimeout(timeout);
    };
  }, []);

  const seedUserData = async (userId: string) => {
    if (!db) return;
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const batch = writeBatch(db);
      
      // Mark user as seeded
      batch.set(userDocRef, { seeded: true, createdAt: Date.now() });

      // Seed movements
      DEFAULT_MOVEMENTS.forEach((m) => {
        const moveRef = doc(collection(db!, 'users', userId, 'movements'));
        batch.set(moveRef, m);
      });

      // Seed templates
      INITIAL_TEMPLATES.forEach((t) => {
        const tempRef = doc(collection(db!, 'users', userId, 'templates'));
        batch.set(tempRef, { ...t, createdAt: Date.now() });
      });

      // Set default settings
      const settingsRef = doc(db!, 'users', userId, 'settings', 'current');
      batch.set(settingsRef, {
        unit: 'kg',
        theme: 'system'
      });

      await batch.commit();
    }
  };

  const login = async () => {
    if (!auth) {
        alert("Firebase not configured. Please add your credentials to .env.local");
        return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, googleProvider);
      } else {
        console.error("Login Error:", error);
      }
    }
  };

  const logout = async () => {
    if (auth) await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
