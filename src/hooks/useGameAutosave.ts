import { useEffect, useRef, useCallback } from "react";
import debounce from "lodash.debounce";
import MMKVStorage from "react-native-mmkv-storage";
import equal from "fast-deep-equal";
import sha256 from "crypto-js/sha256";

// import MMKVStorage from "react-native-mmkv-storage";
// const storage = new MMKVStorage.Loader().initialize();
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiService } from "../services/apiService";
import { GameType, Difficulty } from "../types";

// Types for clarity
interface GameAutosaveOptions<T> {
  gameKey: string; // Unique key for the game (e.g., "sudoku_easy_123")
  state: T; // The current game state object
  gameType: GameType; // Game type for API integration
  difficulty: Difficulty; // Difficulty level for API integration
  level: number; // Current level
  saveToCloud?: (state: T) => Promise<void>; // Optional cloud save function
  cloudInterval?: number; // Cloud sync interval in ms (default: 60s)
  debounceDelay?: number; // Local save debounce delay in ms (default: 1s)
  enableCloudSync?: boolean; // Enable/disable cloud sync
}

export function useGameAutosave<T>({
  gameKey,
  state,
  saveToCloud,
  cloudInterval = 60000,
  debounceDelay = 10000,
}: GameAutosaveOptions<T>) {
  const lastSavedStateRef = useRef<T | null>(null);
  const lastCloudSaveRef = useRef<number>(Date.now());
  const lastCloudHashRef = useRef<string>("");

  // ✅ Debounced local save to MMKV
  const debouncedLocalSave = useCallback(
    debounce(async (latestState: T) => {
      try {
        console.log("[Autosave] Saving local state for:", gameKey);
        await AsyncStorage.setItem(gameKey, JSON.stringify(latestState));
        lastSavedStateRef.current = latestState;
        console.log("[Autosave] Local save successful for:", gameKey);
      } catch (err) {
        console.error("Local save failed:", err);
      }
    }, debounceDelay),
    [gameKey, debounceDelay]
  );

  // ✅ Batched/throttled cloud save, delta/hash check
  const scheduleCloudSave = useCallback(
    debounce(async (latestState: T) => {
      if (!saveToCloud) return;
      const now = Date.now();
      const hash = sha256(JSON.stringify(latestState)).toString();
      if (hash === lastCloudHashRef.current) {
        console.log("[Autosave] No cloud save needed (hash match)", gameKey);
        return;
      }
      try {
        console.log("[Autosave] Batched cloud save for:", gameKey);
        await saveToCloud(latestState);
        lastCloudSaveRef.current = now;
        lastCloudHashRef.current = hash;
        lastSavedStateRef.current = latestState;
        console.log("[Autosave] Cloud save successful for:", gameKey);
      } catch (err) {
        console.error("Cloud save failed:", err);
      }
    }, cloudInterval),
    [saveToCloud, cloudInterval, gameKey]
  );

  // ✅ Effect: Watch for state changes (local only)
  useEffect(() => {
    // Skip first render to avoid overwriting restored state
    if (lastSavedStateRef.current === null) {
      lastSavedStateRef.current = state;
      console.log("[Autosave] Initial state set:", {
        gameKey,
        hasState: !!state,
        stateKeys: state ? Object.keys(state) : [],
      });
      return;
    }
    const hasChanged = !equal(state, lastSavedStateRef.current);
    if (hasChanged) {
      console.log("[Autosave] State changed, saving locally:", {
        gameKey,
        hasChanged,
        stateKeys: state ? Object.keys(state) : [],
      });
      debouncedLocalSave(state);
    }
  }, [state, debouncedLocalSave, gameKey]);

  // ✅ On unmount — flush debounced save & force cloud sync
  useEffect(() => {
    return () => {
      console.log(
        "[Autosave] Component unmounting, flushing saves for:",
        gameKey
      );
      debouncedLocalSave.flush();
      if (saveToCloud) {
        scheduleCloudSave(state);
      }
    };
  }, [state, debouncedLocalSave, scheduleCloudSave, saveToCloud, gameKey]);

  // ✅ Helper: Restore game state
  const restoreState = useCallback(async (): Promise<T | null> => {
    try {
      console.log("[Autosave] Attempting to restore state for:", gameKey);
      const saved = await AsyncStorage.getItem(gameKey);
      if (saved) {
        const parsed = JSON.parse(saved) as T;
        console.log("[Autosave] Successfully restored state for:", gameKey, {
          hasData: !!parsed,
          dataType: typeof parsed,
        });
        return parsed;
      } else {
        console.log("[Autosave] No saved state found for:", gameKey);
      }
    } catch (err) {
      console.error("Restore failed:", err);
    }
    return null;
  }, [gameKey]);

  // ✅ Expose scheduleCloudSave for event-triggered cloud saves
  return { restoreState, scheduleCloudSave };
}
