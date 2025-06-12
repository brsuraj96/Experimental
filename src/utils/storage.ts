import { Platform } from "react-native";
import { GameProgress, GameType, Difficulty } from "../types";

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

    // For native platforms, we'd use AsyncStorage
    // For now, just return null in development
    console.log("[Storage] Would get item with key:", key);
    return null;
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      return;
    }

    // For native platforms, we'd use AsyncStorage
    // For now, just log in development
    console.log("[Storage] Would save item with key:", key);
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
