import { Platform } from "react-native";
import { GameProgress, GameType, Difficulty } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import debounce from "lodash.debounce";
import { apiService } from "../services/apiService";

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
// Cloud Sync Implementation
// ------------------------------------

export const uploadAutosaveStateToCloud = async (
  userId: string,
  state: any
): Promise<void> => {
  try {
    console.log(`[CloudSync] Uploading autosave for user ${userId}`);

    if (state.gameType && state.difficulty && state.level) {
      const response = await apiService.saveGameState(
        state.gameType as GameType,
        state.difficulty as Difficulty,
        state.level,
        state,
        state.moves || 0,
        state.timeElapsed || 0
      );

      if (response.success) {
        console.log(
          `[CloudSync] Successfully uploaded autosave for user ${userId}`
        );
      } else {
        console.error(`[CloudSync] Failed to upload autosave:`, response.error);
      }
    }
  } catch (error) {
    console.error(
      `[CloudSync] Error uploading autosave for user ${userId}:`,
      error
    );
  }
};

export const downloadAutosaveStateFromCloud = async (
  userId: string,
  gameType?: GameType,
  difficulty?: Difficulty,
  level?: number
): Promise<{ state: any; timestamp: number } | null> => {
  try {
    console.log(`[CloudSync] Downloading autosave for user ${userId}`);

    if (gameType && difficulty && level) {
      const response = await apiService.loadGameState(
        gameType,
        difficulty,
        level
      );

      if (response.success && response.data) {
        console.log(
          `[CloudSync] Successfully downloaded autosave for user ${userId}`
        );
        return {
          state: response.data.save_data,
          timestamp: new Date(response.data.updated_at).getTime(),
        };
      }
    }

    return null;
  } catch (error) {
    console.error(
      `[CloudSync] Error downloading autosave for user ${userId}:`,
      error
    );
    return null;
  }
};

// Enhanced autosave with API integration
export const syncGameProgressToCloud = async (
  gameType: GameType,
  difficulty: Difficulty,
  sessionData: {
    level: number;
    score: number;
    time: number;
    moves: number;
    hints: number;
    mistakes: number;
    completed: boolean;
  }
): Promise<boolean> => {
  try {
    const response = await apiService.updateGameProgress(
      gameType,
      difficulty,
      sessionData.level,
      sessionData
    );

    return response.success;
  } catch (error) {
    console.error("[CloudSync] Error syncing game progress:", error);
    return false;
  }
};

// Sync local progress to cloud
export const syncAllProgressToCloud = async (): Promise<boolean> => {
  try {
    const localProgress = await getGameProgress();
    let syncSuccess = true;

    for (const gameType of Object.keys(localProgress) as GameType[]) {
      for (const difficulty of Object.keys(
        localProgress[gameType]
      ) as Difficulty[]) {
        const level = localProgress[gameType][difficulty];
        if (level > 0) {
          const success = await syncGameProgressToCloud(gameType, difficulty, {
            level,
            score: 0, // We don't have historical score data in local storage
            time: 0,
            moves: 0,
            hints: 0,
            mistakes: 0,
            completed: true,
          });

          if (!success) {
            syncSuccess = false;
          }
        }
      }
    }

    return syncSuccess;
  } catch (error) {
    console.error("[CloudSync] Error syncing all progress:", error);
    return false;
  }
};
