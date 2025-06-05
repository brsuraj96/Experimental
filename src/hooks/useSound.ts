import { useCallback } from "react";
import { Platform } from "react-native";

// Temporary stub for sound implementation that doesn't need external dependencies
// This is for development purposes only - in a real app, use a proper sound library
type SoundType =
  | "move"
  | "win"
  | "error"
  | "hint"
  | "click"
  | "scoreUp"
  | "bonus";

const useSound = () => {
  const playSound = useCallback((type: SoundType) => {
    // For web/development, just log the sound that would play
    if (__DEV__) {
      console.log(`[Sound Effect] Playing: ${type}`);
    }

    // In the future, implement actual sound playback
    // e.g. using react-native-sound or Expo's Audio API

    // Provide haptic feedback on native for some interaction types
    if (Platform.OS !== "web") {
      // In a real implementation, we'd use the Vibration API or another method
      // to provide haptic feedback on supported platforms
      console.log(`[Haptic Feedback] for ${type} sound`);
    }
  }, []);

  return { playSound };
};

export default useSound;
