import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, collection } from "firebase/firestore";
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
