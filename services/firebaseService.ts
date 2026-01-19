import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, updateDoc } from "firebase/firestore";
import { GameData } from "../types";

// Your web app's Firebase configuration
// These will be loaded from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const saveGameToDatabase = async (gameData: GameData): Promise<string> => {
  try {
    // Generate a random 6-character ID for the URL
    const shortId = Math.random().toString(36).substring(2, 8);
    const gameRef = doc(db, "games", shortId);
    
    await setDoc(gameRef, {
      ...gameData,
      createdAt: new Date().toISOString()
    });

    return shortId;
  } catch (error) {
    console.error("Error saving game to database:", error);
    throw new Error("Failed to save game");
  }
};

export const getGameFromDatabase = async (gameId: string): Promise<GameData | null> => {
  try {
    const gameRef = doc(db, "games", gameId);
    const docSnap = await getDoc(gameRef);

    if (docSnap.exists()) {
      return docSnap.data() as GameData;
    } else {
      console.log("No such game!");
      return null;
    }
  } catch (error) {
    console.error("Error getting game:", error);
    return null;
  }
};

// --- Live Play Features ---

export interface LiveSessionState {
  status: 'waiting' | 'active' | 'finished';
  currentQuestionIndex: number;
  players: Record<string, { score: number; name: string }>;

  hostId: string;
}

export const createLiveSession = async (gameData: GameData, hostName: string): Promise<string> => {
  const sessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const sessionRef = doc(db, "sessions", sessionId);
  
  await setDoc(sessionRef, {
    gameData,
    status: 'waiting',
    currentQuestionIndex: 0,
    hostId: Math.random().toString(36).substring(2), // Simple host ID
    players: {},
    createdAt: new Date().toISOString()
  });

  return sessionId;
};

export const subscribeToSession = (sessionId: string, callback: (data: any) => void) => {
  const sessionRef = doc(db, "sessions", sessionId);
  return onSnapshot(sessionRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
};

export const updateSessionState = async (sessionId: string, updates: Partial<LiveSessionState>) => {
  const sessionRef = doc(db, "sessions", sessionId);
  await updateDoc(sessionRef, updates);
};

export const joinSession = async (sessionId: string, playerName: string) => {
  const sessionRef = doc(db, "sessions", sessionId);
  const playerId = Math.random().toString(36).substring(2);
  
  // Note: specific field updates like this usually require dot notation or map handling
  // For simplicity in this demo, we'd fetch-modify-save or use updateDoc with dot notation
  // We'll assume simple update for now
  // In a real app, use arrayUnion or a subcollection for players to avoid race conditions
};
