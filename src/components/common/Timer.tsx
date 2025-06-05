import React, { useState, useEffect, useRef } from "react";
import { Text, StyleSheet, View, Platform } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../context/ThemeContext";

interface TimerProps {
  startTime: number;
  isRunning: boolean;
  gameId?: string;
  externalTime?: number;
}

const Timer: React.FC<TimerProps> = ({
  startTime,
  isRunning,
  gameId = "default",
  externalTime,
}) => {
  const { currentTheme } = useTheme();
  const storagePrefix = `timer_${gameId}_`;

  // State and refs
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const pausedTimeRef = useRef<number>(0);
  const lastPauseStartRef = useRef<number | null>(null);
  const lastExternalTimeRef = useRef<number | undefined>(undefined);
  const isInitializedRef = useRef<boolean>(false);

  // Storage keys helper
  const getStorageKeys = () => ({
    elapsed: `${storagePrefix}elapsed`,
    pausedAt: `${storagePrefix}paused_at`,
  });

  // Initialize timer state
  useEffect(() => {
    if (
      startTime > 0 &&
      externalTime === undefined &&
      !isInitializedRef.current
    ) {
      setElapsedTime(startTime);
      startTimeRef.current = Date.now() - startTime * 1000;
      lastExternalTimeRef.current = undefined;
      isInitializedRef.current = true;
    }
  }, [startTime, externalTime]);

  // Handle external time updates
  useEffect(() => {
    if (externalTime !== undefined) {
      if (isRunning || lastExternalTimeRef.current !== externalTime) {
        setElapsedTime(externalTime);
        lastExternalTimeRef.current = externalTime;
      }
      // Clear internal timer when using external time
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
  }, [externalTime, isRunning]);

  // Main timer logic
  useEffect(() => {
    // Always clean up existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Don't proceed if using external time
    if (externalTime !== undefined) return;

    // Handle pause state
    if (!isRunning) {
      if (!lastPauseStartRef.current) {
        lastPauseStartRef.current = Date.now();
      }
      // Save current state
      try {
        const { elapsed, pausedAt } = getStorageKeys();
        const currentTime = elapsedTime;
        const pauseTimestamp = Date.now();

        if (Platform.OS === "web") {
          localStorage.setItem(elapsed, currentTime.toString());
          localStorage.setItem(pausedAt, pauseTimestamp.toString());
        } else {
          AsyncStorage.multiSet([
            [elapsed, currentTime.toString()],
            [pausedAt, pauseTimestamp.toString()],
          ]);
        }
      } catch (error) {
        console.error("Error saving timer state:", error);
      }
      return;
    }

    // Handle resume from pause
    if (lastPauseStartRef.current) {
      const pauseDuration = Date.now() - lastPauseStartRef.current;
      pausedTimeRef.current += pauseDuration;
      lastPauseStartRef.current = null;
    }

    // Reset start time while preserving elapsed time
    startTimeRef.current = Date.now() - elapsedTime * 1000;

    // Start the timer
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const totalElapsed = now - startTimeRef.current;
      const adjustedElapsed = Math.floor(
        (totalElapsed - pausedTimeRef.current) / 1000
      );
      setElapsedTime(adjustedElapsed);
    }, 1000);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, externalTime, elapsedTime]);

  // Format time display
  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: currentTheme.colors.backgroundLight,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 16,
    },
    time: {
      marginLeft: 6,
      color: currentTheme.colors.text,
      fontSize: 16,
      fontWeight: "600",
    },
  });

  return (
    <View style={styles.container}>
      <FontAwesome5
        name="stopwatch"
        size={16}
        color={currentTheme.colors.text}
      />
      <Text style={styles.time}>
        {formatTime(externalTime !== undefined ? externalTime : elapsedTime)}
      </Text>
    </View>
  );
};

export default Timer;
