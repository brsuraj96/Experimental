import { Platform } from "react-native";
import { GameProgress, GameType, Difficulty } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  GAME_PROGRESS: "puzzle_world_progress",
  AUTOSAVE_STATE: "puzzle_world_autosave_state",
};

// Default progress structure
const defaultProgress: GameProgress = {
  [GameType.SUDOKU]: {
    [Difficulty.BEGINNER]: 0,
    [Difficulty.EASY]: 0,
    [Difficulty.MEDIUM]: 0,
    [Difficulty.HARD]: 0,
    [Difficulty.EXPERT]: 0,
  },
  [GameType.SLIDE_TILES]: {
    [Difficulty.BEGINNER]: 0,
    [Difficulty.EASY]: 0,
    [Difficulty.MEDIUM]: 0,
    [Difficulty.HARD]: 0,
    [Difficulty.EXPERT]: 0,
  },
  [GameType.FLOW_FREE]: {
    [Difficulty.BEGINNER]: 0,
    [Difficulty.EASY]: 0,
    [Difficulty.MEDIUM]: 0,
    [Difficulty.HARD]: 0,
    [Difficulty.EXPERT]: 0,
  },
  [GameType.WATER_FLOW]: {
    [Difficulty.BEGINNER]: 0,
    [Difficulty.EASY]: 0,
    [Difficulty.MEDIUM]: 0,
    [Difficulty.HARD]: 0,
    [Difficulty.EXPERT]: 0,
  },
  [GameType.CROSSWORD]: {
    [Difficulty.BEGINNER]: 0,
    [Difficulty.EASY]: 0,
    [Difficulty.MEDIUM]: 0,
    [Difficulty.HARD]: 0,
    [Difficulty.EXPERT]: 0,
  },
  [GameType.WORDSEARCH]: {
    [Difficulty.BEGINNER]: 0,
    [Difficulty.EASY]: 0,
    [Difficulty.MEDIUM]: 0,
    [Difficulty.HARD]: 0,
    [Difficulty.EXPERT]: 0,
  },
  [GameType.MATCHSTICK]: {
    [Difficulty.BEGINNER]: 0,
    [Difficulty.EASY]: 0,
    [Difficulty.MEDIUM]: 0,
    [Difficulty.HARD]: 0,
    [Difficulty.EXPERT]: 0,
  },
  [GameType.SPOT_DIFFERENCE]: {
    [Difficulty.BEGINNER]: 0,
    [Difficulty.EASY]: 0,
    [Difficulty.MEDIUM]: 0,
    [Difficulty.HARD]: 0,
    [Difficulty.EXPERT]: 0,
  },
  [GameType.TRIVIA]: {
    [Difficulty.BEGINNER]: 0,
    [Difficulty.EASY]: 0,
    [Difficulty.MEDIUM]: 0,
    [Difficulty.HARD]: 0,
    [Difficulty.EXPERT]: 0,
  },
  [GameType.RIDDLES]: {
    [Difficulty.BEGINNER]: 0,
    [Difficulty.EASY]: 0,
    [Difficulty.MEDIUM]: 0,
    [Difficulty.HARD]: 0,
    [Difficulty.EXPERT]: 0,
  },
};

// Simple storage abstraction that uses localStorage on web
// In a real app, use AsyncStorage for React Native platforms
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }
    // Native: use AsyncStorage
    return await AsyncStorage.getItem(key);
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      return;
    }
    // Native: use AsyncStorage
    await AsyncStorage.setItem(key, value);
  },

  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
      return;
    }
    // Native: use AsyncStorage
    await AsyncStorage.removeItem(key);
  },
};

/**
 * Get the game progress from storage
 */
export const getGameProgress = async (): Promise<GameProgress> => {
  try {
    const jsonValue = await storage.getItem(STORAGE_KEYS.GAME_PROGRESS);
    if (jsonValue !== null) {
      return JSON.parse(jsonValue);
    }
    return defaultProgress;
  } catch (error) {
    console.error("Error reading game progress:", error);
    return defaultProgress;
  }
};

/**
 * Save the game progress to storage
 */
export const saveGameProgress = async (
  progress: GameProgress
): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(progress);
    await storage.setItem(STORAGE_KEYS.GAME_PROGRESS, jsonValue);
  } catch (error) {
    console.error("Error saving game progress:", error);
  }
};

/**
 * Update the level progress for a specific game and difficulty
 */
export const updateLevelProgress = async (
  gameType: GameType,
  difficulty: Difficulty,
  level: number
): Promise<void> => {
  try {
    const progress = await getGameProgress();

    // Only update if the new level is higher than the current progress
    if (level > progress[gameType][difficulty]) {
      progress[gameType][difficulty] = level;
      await saveGameProgress(progress);
    }
  } catch (error) {
    console.error("Error updating level progress:", error);
  }
};

/**
 * Save autosave state locally with timestamp
 */
export const saveAutosaveState = async (state: any): Promise<void> => {
  try {
    const saveObj = {
      state,
      timestamp: Date.now(),
    };
    const jsonValue = JSON.stringify(saveObj);
    await storage.setItem(STORAGE_KEYS.AUTOSAVE_STATE, jsonValue);
    console.log("[Autosave] Saved state:", saveObj);
  } catch (error) {
    console.error("Error saving autosave state:", error);
  }
};

/**
 * Load autosave state from local storage
 */
export const loadAutosaveState = async (): Promise<{
  state: any;
  timestamp: number;
} | null> => {
  try {
    console.log("[Autosave] Loading autosave state from storage");
    const jsonValue = await storage.getItem(STORAGE_KEYS.AUTOSAVE_STATE);
    if (jsonValue !== null) {
      const parsed = JSON.parse(jsonValue);
      return parsed;
    }
    console.log("[Autosave] No autosave state found in storage");
    return null;
  } catch (error) {
    console.error("Error loading autosave state:", error);
    return null;
  }
};

/**
 * Stub: Upload autosave state to cloud (implement with your backend/Firebase/Supabase)
 */
export const uploadAutosaveStateToCloud = async (
  userId: string,
  state: any
): Promise<void> => {
  // TODO: Implement API call to upload state
  console.log(`[CloudSync] Would upload autosave for user ${userId}`);
};

/**
 * Stub: Download autosave state from cloud (implement with your backend/Firebase/Supabase)
 */
export const downloadAutosaveStateFromCloud = async (
  userId: string
): Promise<{ state: any; timestamp: number } | null> => {
  // TODO: Implement API call to download state
  console.log(`[CloudSync] Would download autosave for user ${userId}`);
  return null;
};

/**
 * Clear autosave state from local storage
 */
export const clearAutosaveState = async (): Promise<void> => {
  try {
    console.log("[Autosave] Clearing autosave state");
    await storage.removeItem(STORAGE_KEYS.AUTOSAVE_STATE);
    console.log("[Autosave] Cleared autosave state successfully");
  } catch (error) {
    console.error("Error clearing autosave state:", error);
  }
};
