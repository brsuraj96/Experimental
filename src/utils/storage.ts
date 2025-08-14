import { Platform } from "react-native";
import { GameProgress, GameType, Difficulty } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import debounce from "lodash.debounce";

const STORAGE_KEYS = {
  GAME_PROGRESS: "puzzle_world_progress",
  AUTOSAVE_STATE: "puzzle_world_autosave_state",
};

const AUTOSAVE_CLOUD_INTERVAL = 45000; // 45 seconds
let lastSavedState: any = null;
let lastCloudSaveTime = 0;

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

// ------------------------------------
// Generic Storage Layer
// ------------------------------------
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }
    return await AsyncStorage.getItem(key);
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  },

  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
      return;
    }
    await AsyncStorage.removeItem(key);
  },
};

// ------------------------------------
// Game Progress Functions
// ------------------------------------
export const getGameProgress = async (): Promise<GameProgress> => {
  try {
    const jsonValue = await storage.getItem(STORAGE_KEYS.GAME_PROGRESS);
    return jsonValue ? JSON.parse(jsonValue) : defaultProgress;
  } catch (error) {
    console.error("Error reading game progress:", error);
    return defaultProgress;
  }
};

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

export const updateLevelProgress = async (
  gameType: GameType,
  difficulty: Difficulty,
  level: number
): Promise<void> => {
  try {
    const progress = await getGameProgress();
    if (level > progress[gameType][difficulty]) {
      progress[gameType][difficulty] = level;
      await saveGameProgress(progress);
    }
  } catch (error) {
    console.error("Error updating level progress:", error);
  }
};

// ------------------------------------
// Optimized Autosave Logic
// ------------------------------------
const debouncedLocalSave = debounce(async (state: any) => {
  try {
    const saveObj = { state, timestamp: Date.now() };
    await storage.setItem(STORAGE_KEYS.AUTOSAVE_STATE, JSON.stringify(saveObj));
    console.log("[Autosave] Debounced local save complete:", saveObj);
  } catch (error) {
    console.error("Error in debounced local save:", error);
  }
}, 1000); // 1 second after last change

export const optimizedAutosave = async (
  state: any,
  userId?: string,
  forceCloud: boolean = false
) => {
  try {
    // 1. Skip if state unchanged
    if (JSON.stringify(lastSavedState) === JSON.stringify(state)) {
      return;
    }

    lastSavedState = state;

    // 2. Debounced local save
    debouncedLocalSave(state);

    // 3. Cloud save throttling
    const now = Date.now();
    if (
      userId &&
      (forceCloud || now - lastCloudSaveTime > AUTOSAVE_CLOUD_INTERVAL)
    ) {
      await uploadAutosaveStateToCloud(userId, state);
      lastCloudSaveTime = now;
    }
  } catch (error) {
    console.error("Error in optimizedAutosave:", error);
  }
};

// ------------------------------------
// Load / Clear Autosave
// ------------------------------------
export const loadAutosaveState = async (): Promise<{
  state: any;
  timestamp: number;
} | null> => {
  try {
    console.log("[Autosave] Loading autosave state from storage");
    const jsonValue = await storage.getItem(STORAGE_KEYS.AUTOSAVE_STATE);
    return jsonValue ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error("Error loading autosave state:", error);
    return null;
  }
};

export const clearAutosaveState = async (gameKey?: string): Promise<void> => {
  try {
    if (gameKey) {
      // Clear specific game autosave
      console.log(`[Autosave] Clearing autosave state for ${gameKey}`);
      await storage.removeItem(gameKey);
      console.log(
        `[Autosave] Successfully cleared autosave state for ${gameKey}`
      );
    } else {
      // Clear general autosave state (backward compatibility)
      console.log("[Autosave] Clearing general autosave state");
      await storage.removeItem(STORAGE_KEYS.AUTOSAVE_STATE);
      console.log("[Autosave] Successfully cleared general autosave state");
    }
  } catch (error) {
    console.error("Error clearing autosave state:", error);
  }
};

// ------------------------------------
// Cloud Sync Stubs
// ------------------------------------
export const uploadAutosaveStateToCloud = async (
  userId: string,
  state: any
): Promise<void> => {
  console.log(`[CloudSync] Would upload autosave for user ${userId}`, state);
};

export const downloadAutosaveStateFromCloud = async (
  userId: string
): Promise<{ state: any; timestamp: number } | null> => {
  console.log(`[CloudSync] Would download autosave for user ${userId}`);
  return null;
};
