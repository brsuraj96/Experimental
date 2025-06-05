import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GameProgress, GameType, Difficulty } from "../types";

// Helper function to safely access web storage
const getWebStorage = () => {
  if (Platform.OS === "web") {
    try {
      // Check if localStorage is available
      const storage =
        typeof globalThis !== "undefined" ? globalThis.localStorage : null;
      if (storage) {
        const testKey = "__storage_test__";
        storage.setItem(testKey, testKey);
        storage.removeItem(testKey);
        return storage;
      }
    } catch (e) {
      return null;
    }
  }
  return null;
};

// Storage keys
const STORAGE_KEYS = {
  GAME_PROGRESS: "puzzle_world_progress",
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
  [GameType.SPOT_DIFFERENCE]: {
    [Difficulty.BEGINNER]: 0,
    [Difficulty.EASY]: 0,
    [Difficulty.MEDIUM]: 0,
    [Difficulty.HARD]: 0,
    [Difficulty.EXPERT]: 0,
  },
};

// Cross-platform storage abstraction using localStorage for web and AsyncStorage for native
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const webStorage = getWebStorage();
      if (webStorage) {
        return webStorage.getItem(key);
      }
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error("[Storage] Error getting item:", error);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      const webStorage = getWebStorage();
      if (webStorage) {
        webStorage.setItem(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error("[Storage] Error setting item:", error);
    }
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

    // Check if this game type exists in our progress tracking
    if (
      gameType in progress &&
      difficulty in progress[gameType as keyof GameProgress]
    ) {
      // Only update if the new level is higher than the current progress
      const currentLevel = progress[gameType as keyof GameProgress][difficulty];
      if (level > currentLevel) {
        progress[gameType as keyof GameProgress][difficulty] = level;
        await saveGameProgress(progress);
      }
    }
  } catch (error) {
    console.error("Error updating level progress:", error);
  }
};
