import { useEffect, useRef, useCallback } from "react";
import debounce from "lodash.debounce";
import MMKVStorage from "react-native-mmkv-storage";
import equal from "fast-deep-equal";

// import MMKVStorage from "react-native-mmkv-storage";
// const storage = new MMKVStorage.Loader().initialize();
import AsyncStorage from "@react-native-async-storage/async-storage";

// Types for clarity
interface GameAutosaveOptions<T> {
  gameKey: string; // Unique key for the game (e.g., "sudoku_easy_123")
  state: T; // The current game state object
  saveToCloud?: (state: T) => Promise<void>; // Optional cloud save function
  cloudInterval?: number; // Cloud sync interval in ms (default: 60s)
  debounceDelay?: number; // Local save debounce delay in ms (default: 1s)
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

  // ✅ Save to cloud with interval & diff check
  const tryCloudSave = useCallback(
    async (latestState: T) => {
      if (!saveToCloud) return;

      const now = Date.now();
      const timeSinceLastCloud = now - lastCloudSaveRef.current;
      //   const hasChanged =
      //     JSON.stringify(latestState) !==
      //     JSON.stringify(lastSavedStateRef.current);

      const hasChanged = !equal(latestState, lastSavedStateRef.current);

      if (timeSinceLastCloud >= cloudInterval && hasChanged) {
        try {
          console.log("[Autosave] Attempting cloud save for:", gameKey);
          await saveToCloud(latestState);
          lastCloudSaveRef.current = now;
          lastSavedStateRef.current = latestState;
          console.log("[Autosave] Cloud save successful for:", gameKey);
        } catch (err) {
          console.error("Cloud save failed:", err);
        }
      }
    },
    [saveToCloud, cloudInterval, gameKey]
  );

  // ✅ Effect: Watch for state changes
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

    // const hasChanged =
    //   JSON.stringify(state) !== JSON.stringify(lastSavedStateRef.current);

    const hasChanged = !equal(state, lastSavedStateRef.current);

    if (hasChanged) {
      console.log("[Autosave] State changed, saving:", {
        gameKey,
        hasChanged,
        stateKeys: state ? Object.keys(state) : [],
      });
      debouncedLocalSave(state);
      tryCloudSave(state);
    }
  }, [state, debouncedLocalSave, tryCloudSave, gameKey]);

  // ✅ On unmount — flush debounced save & force cloud sync
  useEffect(() => {
    return () => {
      console.log(
        "[Autosave] Component unmounting, flushing saves for:",
        gameKey
      );
      debouncedLocalSave.flush();
      if (saveToCloud) {
        tryCloudSave(state);
      }
    };
  }, [state, debouncedLocalSave, tryCloudSave, saveToCloud, gameKey]);

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

  return { restoreState };
}
