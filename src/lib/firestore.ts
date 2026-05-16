import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  orderBy, 
  setDoc
} from 'firebase/firestore';
import { db } from './firebase';

export interface WorkoutEntry {
  id: string;
  movementName: string;
  reps: number;
  weight: number;
  unit: 'kg' | 'lbs';
  notes?: string;
  createdAt: number;
}

export interface Workout {
  id: string;
  date: string;
  entries: WorkoutEntry[];
  createdAt: number;
  completed: boolean;
}

export interface TemplateEntry {
  movementName: string;
  reps: number;
  weight: number;
  unit: 'kg' | 'lbs';
}

export interface Template {
  id: string;
  name: string;
  entries: TemplateEntry[];
  createdAt: number;
  order: number;
}

export interface Movement {
  id: string;
  name: string;
  category: string;
  isCustom: boolean;
}

export interface UserSettings {
  unit: 'kg' | 'lbs';
  theme: 'system' | 'light' | 'dark';
}

// Helpers

export const getWorkouts = async (userId: string) => {
  if (!db) return [];
  const workoutsRef = collection(db, 'users', userId, 'workouts');
  const q = query(workoutsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as Workout))
    .filter(w => w.entries.length > 0);
};

export const getTodayWorkout = async (userId: string, date: string) => {
  if (!db) return null;
  const workoutsRef = collection(db, 'users', userId, 'workouts');
  const q = query(workoutsRef, where('date', '==', date), where('completed', '==', false));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Workout;
};

export const addEntriesToWorkout = async (userId: string, workoutId: string | null, entries: WorkoutEntry[], date: string) => {
  if (!db) return null;
  const workoutsRef = collection(db, 'users', userId, 'workouts');
  
  if (!workoutId) {
    const newWorkout: Omit<Workout, 'id'> = {
      date,
      entries,
      createdAt: Date.now(),
      completed: false
    };
    const docRef = await addDoc(workoutsRef, newWorkout);
    return docRef.id;
  } else {
    const workoutRef = doc(db, 'users', userId, 'workouts', workoutId);
    const workoutDoc = await getDoc(workoutRef);
    if (!workoutDoc.exists()) return null;
    
    const existingEntries = workoutDoc.data().entries || [];
    await updateDoc(workoutRef, {
      entries: [...existingEntries, ...entries]
    });
    return workoutId;
  }
};

export const addEntryToWorkout = async (userId: string, workoutId: string | null, entry: WorkoutEntry, date: string) => {
  return addEntriesToWorkout(userId, workoutId, [entry], date);
};

export const updateWorkoutEntries = async (userId: string, workoutId: string, entries: WorkoutEntry[]) => {
  if (!db) return;
  const workoutRef = doc(db, 'users', userId, 'workouts', workoutId);
  if (entries.length === 0) {
    await deleteDoc(workoutRef);
  } else {
    await updateDoc(workoutRef, { entries });
  }
};

export const finishWorkout = async (userId: string, workoutId: string) => {
  if (!db) return;
  const workoutRef = doc(db, 'users', userId, 'workouts', workoutId);
  await updateDoc(workoutRef, { completed: true });
};

export const deleteWorkout = async (userId: string, workoutId: string) => {
  if (!db) return;
  const workoutRef = doc(db, 'users', userId, 'workouts', workoutId);
  await deleteDoc(workoutRef);
};

// Movements
export const getMovements = async (userId: string) => {
  if (!db) return [];
  const movementsRef = collection(db, 'users', userId, 'movements');
  const snapshot = await getDocs(movementsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movement));
};

export const addMovement = async (userId: string, movement: Omit<Movement, 'id'>) => {
  if (!db) return { id: 'temp', ...movement };
  const movementsRef = collection(db, 'users', userId, 'movements');
  const docRef = await addDoc(movementsRef, movement);
  return { id: docRef.id, ...movement };
};

export const deleteMovement = async (userId: string, movementId: string) => {
  if (!db) return;
  const movementRef = doc(db, 'users', userId, 'movements', movementId);
  await deleteDoc(movementRef);
};

// Templates
export const getTemplates = async (userId: string) => {
  if (!db) return [];
  const templatesRef = collection(db, 'users', userId, 'templates');
  const q = query(templatesRef, orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template));
};

export const saveTemplate = async (userId: string, template: Omit<Template, 'id'>) => {
  if (!db) return 'temp';
  const templatesRef = collection(db, 'users', userId, 'templates');
  const docRef = await addDoc(templatesRef, template);
  return docRef.id;
};

export const deleteTemplate = async (userId: string, templateId: string) => {
  if (!db) return;
  const templateRef = doc(db, 'users', userId, 'templates', templateId);
  await deleteDoc(templateRef);
};

export const updateTemplate = async (userId: string, templateId: string, data: Partial<Template>) => {
  if (!db) return;
  const templateRef = doc(db, 'users', userId, 'templates', templateId);
  await updateDoc(templateRef, data);
};

// Settings
export const getUserSettings = async (userId: string) => {
  if (!db) return null;
  const settingsRef = doc(db, 'users', userId, 'settings', 'current');
  const snapshot = await getDoc(settingsRef);
  if (!snapshot.exists()) return null;
  return snapshot.data() as UserSettings;
};

export const updateUserSettings = async (userId: string, settings: Partial<UserSettings>) => {
  if (!db) return;
  const settingsRef = doc(db, 'users', userId, 'settings', 'current');
  await setDoc(settingsRef, settings, { merge: true });
};
