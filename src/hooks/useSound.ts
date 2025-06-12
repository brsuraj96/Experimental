import { useCallback } from "react";

// Temporary stub for sound implementation
// In a real app, use react-native-sound or Expo's Audio API
export type SoundType = "move" | "win" | "error" | "click" | "complete";

export const useSound = () => {
  const playSound = useCallback((type: SoundType) => {
    // For development, just log the sound that would play
    if (__DEV__) {
      console.log(`[Sound Effect] Playing: ${type}`);
    }

    // In a real implementation, we would use react-native-sound or Expo's Audio API
    // For now, this is a stub that logs the sound type
  }, []);

  return { playSound };
};
